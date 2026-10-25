// THE SCORE — the single source of truth for music AND picture, built from the data (btc-data.js).
// - The market is cut into phases (data/phases.csv): uptrends and downtrends. Each plays a cue from data/music.js at
//   that cue's tempo; at every top and bottom the music slows down for ~3 s, then picks up again.
// - The chart rides the music: inside a phase a bar always shows the same number of days, so the candles run as fast
//   as the tempo; on every beat they surge a little.
// - Every event with hit ≥ 1 in data/events.csv is a hit in the music and a flash on screen, on the same frame.
// Add data, phases or events, run `node make-data.js`, and the whole film re-times itself.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const BTC = node ? require('./btc-data') : globalThis.BTC;
  const LIB = node ? require('./data/music') : globalThis.MUSIC_LIBRARY;
  const { m, makeClock, makeChords } = MU;
  // PREVIEW_CUE=up-ascent node song.js -> just that cue, PREVIEW_BARS bars (default 8), no events: to listen to a cue
  const PREVIEW = node && process.env.PREVIEW_CUE ? { cue: process.env.PREVIEW_CUE, bars: +(process.env.PREVIEW_BARS || 8) } : null;

  const FPS = node && process.env.FPS ? +process.env.FPS : 24; // FPS=30 node … renders at another frame rate
  const FORMAT = U.pickFormat('16:9');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;

  const DAYS = BTC.days; // [open, high, low, close]
  const NDAYS = DAYS.length;
  const START = Date.parse(BTC.start + 'T00:00:00Z');
  const dayOf = (s) => Math.round((Date.parse(s + 'T00:00:00Z') - START) / 86400000);
  const dateOf = (d) => new Date(START + Math.floor(d) * 86400000);
  const yearAt = (d) => dateOf(U.clamp(d, 0, NDAYS - 1)).getUTCFullYear();

  // ---------- the mood around each event (for the picture: a creeping shake into crashes, a glow into rallies) ----------
  const MOODS = BTC.events.filter((e) => e.kind === 'up' || e.kind === 'down').map((e) => {
    const day = dayOf(e.date), big = e.hit > 0;
    return { day, up: e.kind === 'up', w: big ? 1 : 0.55, before: big ? 45 : 18, after: big ? 6 : 4 };
  }).filter((e) => e.day >= 0 && e.day < NDAYS);
  const smooth = (x) => x * x * (3 - 2 * x);
  function moodAt(d) {
    let up = 0, down = 0;
    for (const e of MOODS) {
      const x = d < e.day + 0.5 ? (d - (e.day + 0.5 - e.before)) / e.before : 1 - (d - e.day - 0.5) / e.after;
      if (x <= 0 || x > 1.0001) continue;
      const v = smooth(Math.min(1, x)) * e.w;
      if (e.up) up = Math.max(up, v); else down = Math.max(down, v);
    }
    return { up, down };
  }

  // ---------- phases -> beats ----------
  // Two phases: uptrend (a bottom to the next top) and downtrend (a top to the next bottom). The chart runs in step
  // with the music: inside a phase every BEAT shows the same number of days, so the candles move exactly as fast as
  // the tempo — and slow right down with the music at every top and bottom.
  // SPEED < 1 slows the whole chart down; DPB0 = days per bar (4 beats) by era
  const SPEED = 0.35;
  const DPB0 = (d) => { const y = yearAt(d); return (y <= 2012 ? 130 : y <= 2019 ? 85 : 70) * SPEED; };
  const MIN_BEATS = 4;
  let PH = (BTC.phases || []).map((p) => ({ type: p.type, cue: p.cue, d0: Math.max(0, dayOf(p.start)), d1: Math.min(NDAYS - 1, dayOf(p.end)) })).filter((p) => p.d1 >= p.d0);
  if (!PH.length) PH = [{ type: 'sideway', cue: LIB.pickCue('sideway', 0).id, d0: 0, d1: NDAYS - 1 }];
  if (PREVIEW) { const c = LIB.CUES.find((q) => q.id === PREVIEW.cue); if (!c) throw new Error(`no cue ${PREVIEW.cue}`); PH = [{ type: c.phase, cue: c.id, d0: 0, d1: NDAYS - 1 }]; }
  PH[0].d0 = 0; PH[PH.length - 1].d1 = NDAYS - 1;
  for (let i = 1; i < PH.length; i++) PH[i].d0 = PH[i - 1].d1 + 1; // back to back, no holes
  const cueOf = (id) => LIB.CUES.find((c) => c.id === id) || LIB.pickCue('sideway', 0);
  const FIRST_BAR = 1, FIRST_BEAT = 4; // bar 0 is the title
  let q = FIRST_BEAT;
  for (const p of PH) {
    p.c = cueOf(p.cue);
    const days = p.d1 - p.d0 + 1, mid = (p.d0 + p.d1) / 2;
    p.beats = PREVIEW ? PREVIEW.bars * 4 : Math.max(MIN_BEATS, Math.round((days / DPB0(mid)) * 4));
    p.q0 = q; q += p.beats; p.q1 = q;
    p.b0 = p.q0 / 4; p.b1 = p.q1 / 4; // in bars (may be fractional)
  }
  const END_BEAT = q, END_BAR = END_BEAT / 4;

  // knots (beat, day): phase starts, and the hit events inside their phase on a beat
  // every top and bottom between two phases is an event: the one the data already has near it (promoted to a hit),
  // or a TOP / BOTTOM label made here. The turn starts the moment its label appears.
  const kfmt = (p) => (p >= 1000 ? `$${(p / 1000).toFixed(p >= 10000 ? 0 : 1)}K` : p >= 1 ? `$${Math.round(p)}` : `$${p.toPrecision(2)}`);
  const iso = (d) => dateOf(d).toISOString().slice(0, 10);
  const EVSRC = PREVIEW ? [] : BTC.events.map((e) => ({ ...e }));
  if (!PREVIEW) PH.forEach((p, i) => {
    if (i === 0) return;
    const top = p.type === 'downtrend', d = p.d0; // a downtrend starts at a top, an uptrend at a bottom
    const near = EVSRC.filter((e) => e.kind === (top ? 'up' : 'down') && Math.abs(dayOf(e.date) - d) <= 7)
      .sort((a, b) => (b.hit > 0) - (a.hit > 0) || Math.abs(dayOf(a.date) - d) - Math.abs(dayOf(b.date) - d))[0];
    if (near) { near.hit = Math.max(1, near.hit); near.turn = i; return; }
    const price = top ? DAYS[d][1] : DAYS[d][2];
    EVSRC.push({ date: iso(d), kind: top ? 'up' : 'down', hit: 1, text: `${top ? 'TOP' : 'BOTTOM'}: ${kfmt(price)}`, turn: i });
  });
  EVSRC.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const hitEv = EVSRC.filter((e) => e.hit > 0).map((e) => ({ ...e, day: dayOf(e.date) })).filter((e) => e.day >= 0 && e.day < NDAYS).sort((a, b) => a.day - b.day);
  // knots (beat, day): only the phase starts — inside a phase the chart runs at one steady pace right up to the
  // turn (events are NOT pinned to beats: pinning bent the pace and the chart seemed to brake before a top)
  const KN = PH.map((p) => [p.q0, p === PH[0] ? -0.5 : p.d0]);
  KN.push([END_BEAT, NDAYS]);
  const KQ = KN.map((k) => k[0]), KD = KN.map((k) => k[1]);
  function dayOfBeat(x) {
    if (x <= KQ[0]) return KD[0];
    if (x >= KQ[KQ.length - 1]) return KD[KD.length - 1];
    let lo = 0, hi = KQ.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (KQ[mid] <= x) lo = mid; else hi = mid; }
    return KD[lo] + ((x - KQ[lo]) / (KQ[lo + 1] - KQ[lo])) * (KD[lo + 1] - KD[lo]);
  }  function beatOfDay(d) {
    if (d <= KD[0]) return KQ[0];
    if (d >= KD[KD.length - 1]) return KQ[KQ.length - 1];
    let lo = 0, hi = KD.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (KD[mid] <= d) lo = mid; else hi = mid; }
    return KQ[lo] + ((d - KD[lo]) / (KD[lo + 1] - KD[lo])) * (KQ[lo + 1] - KQ[lo]);
  }


  // ---------- per beat: which phase and cue; the tempo map ----------
  const BEATS = []; // q -> { type, cue, k (beat inside the phase), p (phase index) }
  for (let x = 0; x < END_BEAT + 12; x++) {
    const i = x < FIRST_BEAT ? 0 : x >= END_BEAT ? PH.length - 1 : PH.findIndex((p) => x >= p.q0 && x < p.q1);
    const p = PH[i];
    BEATS.push({ type: x < FIRST_BEAT ? 'intro' : x >= END_BEAT ? 'outro' : p.type, cue: p.c, k: x - p.q0, p: i });
  }
  // the tempo map: each phase plays at its cue's tempo right up to the moment its top / bottom label appears; there
  // the music brakes (TURN.brakeBeats) to TURN.slowBpm, holds it for TURN.holdSec seconds, then speeds back up to the
  // next phase's tempo along a smooth S-curve (smoothstep, a point every half beat) taking about TURN.rampSec seconds.
  // The candles follow the music, so the chart brakes, hangs, and gathers speed with it. The film ends the same way.
  const TURN = LIB.TURN, HOLD = (TURN.holdSec * TURN.slowBpm) / 60; // beats held slow
  const tempo = [[0, PH[0].c.bpm], [FIRST_BEAT / 4, PH[0].c.bpm]];
  const turnAt = (E, from, to, hi) => { // E = the beat the turn's label appears
    const b0 = Math.min(hi, E + TURN.brakeBeats), h1 = Math.min(hi, b0 + HOLD);
    tempo.push([E / 4, from], [b0 / 4, TURN.slowBpm], [h1 / 4, TURN.slowBpm]);
    if (to === null) return;
    const n = Math.max(1, Math.min(hi - h1, Math.round((TURN.rampSec * (TURN.slowBpm + to)) / 120))); // beats in ~rampSec s (at the mean tempo)
    for (let j = 1; j <= 2 * n; j++) { const u = j / (2 * n), e = u * u * (3 - 2 * u); tempo.push([(h1 + j / 2) / 4, TURN.slowBpm + (to - TURN.slowBpm) * e]); }
  };
  PH.forEach((p, i) => {
    if (i === 0) return;
    const e = hitEv.find((h) => h.turn === i);
    const E = e ? beatOfDay(e.day + 0.5) : p.q0, next = PH[i + 1]; // the beat its label appears (the candle's extreme)
    turnAt(E, PH[i - 1].c.bpm, p.c.bpm, next ? next.q0 - 2 : END_BEAT - 1);
  });
  if (!PREVIEW) turnAt(END_BEAT, PH[PH.length - 1].c.bpm, null, END_BEAT + 8);
  tempo.sort((x, y) => x[0] - y[0]);
  for (let i = tempo.length - 1; i > 0; i--) if (tempo[i][0] - tempo[i - 1][0] < 1e-9) tempo.splice(i - 1, 1); // one point per position (the later wins)
  const clock = makeClock({ bpm: PH[0].c.bpm, offset: 0, tempo });
  const { T, BEAT } = clock;
  const TB = (x) => T(0, x); // time of beat x
  const DURATION = TB(END_BEAT + 8) + 0.5;
  const PULSE = 0.3; // how hard the candles surge on each beat (0 = smooth)
  const pulse = (x) => x + (PULSE * Math.sin(2 * Math.PI * x)) / (2 * Math.PI);
  const dayAt = (t) => dayOfBeat(pulse(clock.beatPos(t)));
  function timeOfDay(d) { // dayAt is monotone: bisect
    let a = 0, c = DURATION;
    for (let k = 0; k < 44; k++) { const mid = (a + c) / 2; if (dayAt(mid) < d) a = mid; else c = mid; }
    return (a + c) / 2;
  }

  // ---------- candles ----------
  const PEAK = new Map(); // event day -> its extreme comes at mid-day (up: the high, down: the low)
  function intraday(c, u, i) {
    const [o, hi, lo, cl] = c;
    const up = PEAK.has(i) ? PEAK.get(i) : cl >= o;
    const k = up ? [[0, o], [0.2, lo], [0.5, hi], [1, cl]] : [[0, o], [0.2, hi], [0.5, lo], [1, cl]];
    for (let j = 0; j < 3; j++) if (u <= k[j + 1][0]) return U.lerp(k[j][1], k[j + 1][1], (u - k[j][0]) / (k[j + 1][0] - k[j][0]));
    return cl;
  }
  function candleAt(i, t) {
    const D = dayAt(t);
    if (i > D) return null;
    const c = DAYS[i];
    if (i + 1 <= D) return { o: c[0], h: c[1], l: c[2], c: c[3], done: true };
    const u = U.clamp(D - i);
    let h = c[0], l = c[0];
    for (let k = 1; k <= 12; k++) { const p = intraday(c, (u * k) / 12, i); h = Math.max(h, p); l = Math.min(l, p); }
    return { o: c[0], h, l, c: intraday(c, u, i), done: false };
  }
  function priceAt(t) {
    const D = dayAt(t);
    if (D < 0) return DAYS[0][0];
    if (D >= NDAYS) return DAYS[NDAYS - 1][3];
    return candleAt(Math.floor(D), t).c;
  }

  // ---------- events ----------
  const EVENTS = EVSRC.map((e) => {
    const d = dayOf(e.date);
    if (d < 0 || d >= NDAYS) return null;

    const c = DAYS[d];
    return { ...e, day: d, t: timeOfDay(d + 0.5), big: e.hit === 2, price: e.kind === 'down' ? c[2] : c[1] };
  }).filter(Boolean);
  for (const e of EVENTS) PEAK.set(e.day, e.kind !== 'down');
  const hits = EVENTS.filter((e) => e.hit > 0);
  const bigs = hits.filter((e) => e.big);
  const breaths = []; // no silence before a top / bottom: the music keeps going until the label appears, then brakes
  const inBreath = (t) => breaths.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);

  // sections (for the level meter): one per phase
  const S = { intro: [0, TB(FIRST_BEAT)] };
  PH.forEach((p, i) => { S[`${i + 1}-${p.type}`] = [TB(p.q0), TB(p.q1)]; });
  S.outro = [TB(END_BEAT), DURATION];

  // ---------- harmony: every chord any cue uses ----------
  const CH = {
    Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, 'Dm/C': { notes: ['D4', 'F4', 'A4'], bass: 'C2' }, Dm7: { notes: ['C4', 'F4', 'A4'], bass: 'D2' },
    D: { notes: ['D4', 'F#4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, F: { notes: ['C4', 'F4', 'A4'], bass: 'F2' },
    C: { notes: ['C4', 'E4', 'G4'], bass: 'C2' }, Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G1' }, G: { notes: ['D4', 'G4', 'B4'], bass: 'G1' },
    A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' }, Asus4: { notes: ['D4', 'E4', 'A4'], bass: 'A1' }, Am: { notes: ['C4', 'E4', 'A4'], bass: 'A1' },
    Am7: { notes: ['C4', 'E4', 'G4'], bass: 'A1' }, E: { notes: ['B3', 'E4', 'G#4'], bass: 'E2' }, Eb: { notes: ['Eb4', 'G4', 'Bb4'], bass: 'Eb2' },
    Cm: { notes: ['C4', 'Eb4', 'G4'], bass: 'C2' }, Bm: { notes: ['D4', 'F#4', 'B4'], bass: 'B1' },
  };
  // the chord of beat x: the cue's loop, one chord per bar of the phase
  const chordNameAt = (x) => { const bi = BEATS[U.clamp(x, 0, BEATS.length - 1)]; return bi.type === 'outro' ? PH[PH.length - 1].c.chords[0] : bi.cue.chords[Math.floor(Math.max(0, bi.k) / 4) % bi.cue.chords.length]; };
  const prog = BEATS.map((_, x) => [Math.floor(x / 4), x % 4, 1, chordNameAt(x)]);
  const { chords, chordAt } = makeChords(clock, CH, prog);

  const ev = { start: TB(FIRST_BEAT - 0.5), end: TB(END_BEAT) };
  const markers = { start: ev.start, end: { t: ev.end, sync: 'av' } };
  hits.forEach((h, i) => { markers['hit' + (i + 1)] = { t: h.t, sync: h.kind === 'info' ? 'a' : 'av' }; }); // info has no flash
  PH.forEach((p, i) => { markers[`phase${i + 1}-${p.type}`] = TB(p.q0); });

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, markers,
    DAYS, NDAYS, REAL: BTC.real, dayAt, timeOfDay, candleAt, priceAt, dateOf, dayOf, EVENTS, hits, bigs,
    inBreath, breaths, moodAt, MOODS, PHASES: PH, BEATS, FIRST_BEAT, END_BEAT, FIRST_BAR, END_BAR, TB, LIB,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
