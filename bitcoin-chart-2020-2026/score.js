// THE SCORE — the single source of truth for the timing of the picture (and where the music changes), from btc-data.js.
// - The market is cut into phases (data/phases.csv): uptrends and downtrends, each with a cue from data/music.js.
// - The chart rides a tempo map: inside a phase a bar always shows the same number of days at the cue's tempo; at every
//   ALL-TIME HIGH / LOW the CHART slows down for ~3 s, then picks up again. (The music itself keeps its cue's steady
//   tempo and only changes cue at the turn: song.js plays each phase on its own clock from TB(phase start).)
// - Visible levels 0/1 are quiet labels; only level 2 triggers synchronized music/SFX and visual effects.
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
  // SHORT=<n> node make-data.js -> BTC.short: one phase as a 9:16 looping short (shorts.md): one steady tempo, a length of
  // 4-bar blocks (20–45 s). It loops by running on: the last candle (the closing ALL-TIME HIGH / LOW) is followed by the
  // first one again, at its own price — the days before the first candle are the end of the phase scaled onto the
  // starting price (no axis shows it), so the last frame runs straight into frame 0: a downtrend falls forever, an
  // uptrend climbs forever
  const SHORT = PREVIEW ? null : BTC.short || null;

  const FPS = node && process.env.FPS ? +process.env.FPS : 24; // FPS=30 node … renders at another frame rate
  const FORMAT = U.pickFormat('16:9');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;

  const DAYS = BTC.days; // [open, high, low, close]
  const EQUITY = BTC.coin?.assetClass === 'equity';
  if (node && EQUITY && /[\\/]engine[\\/]render\.js$/.test(process.argv[1] || '')) {
    if (BTC.eventReview?.status !== 'approved')
      throw new Error('Equity event list review pending: obtain user approval before ANY render (PROJECT.md equity policy)');
    const path = require('path');
    const config = require(`./coins/${BTC.coin.symbol}/coin.json`);
    const liveReview = require('./equity').reviewState(path.join(__dirname, config.dataDir || `coins/${BTC.coin.symbol}/data`));
    if (liveReview.status !== 'approved' || liveReview.eventHash !== BTC.eventReview.eventHash)
      throw new Error('Equity event list review pending: source changed after generated data; review and rebuild first');
  }
  const NDAYS = DAYS.length;
  const P0 = BTC.pre || 0;
  const LOOPLEN = NDAYS - P0, LOOPK = SHORT ? DAYS[P0][0] / DAYS[NDAYS - 1][3] : 1; // SHORT: day i ≡ day i + LOOPLEN × LOOPK
  if (SHORT) for (let i = P0 - 1; i >= 0; i--) DAYS[i] = DAYS[i + LOOPLEN].map((v) => v * LOOPK); // (a phase shorter than the pre-run wraps again) // day P0 = the first day of the film; the days before it are the pre-run under the title
  const START = Date.parse(BTC.start + 'T00:00:00Z');
  const dayOf = (s) => Math.round((Date.parse(s + 'T00:00:00Z') - START) / 86400000);
  const eventDay = (e) => dayOf(e.anchorDate || e.date);
  const dateOf = (d) => new Date(START + Math.floor(d) * 86400000);
  const yearAt = (d) => dateOf(U.clamp(d, 0, NDAYS - 1)).getUTCFullYear();

  // ---------- the mood around each hit-2 event (a creeping shake into a crash, a glow into a rally) ----------
  // hit 1 events have no effect at all: their label just appears
  const MOODS = BTC.events.filter((e) => e.hit === 2 && (e.kind === 'up' || e.kind === 'down')).map((e) => (
    { day: eventDay(e), up: e.kind === 'up', w: 1, before: 45, after: 6 }
  )).filter((e) => e.day >= (SHORT ? P0 + 1 : 0) && e.day < NDAYS); // (a short: not the turn it opens on)
  const smooth = (x) => x * x * (3 - 2 * x);
  function moodAt(d) {
    if (SHORT && d < P0 + 30) { const a = moodAt0(d), b = moodAt0(d + LOOPLEN); return { up: Math.max(a.up, b.up), down: Math.max(a.down, b.down) }; } // across the loop
    return moodAt0(d);
  }
  function moodAt0(d) {
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
  let PH = (BTC.phases || []).map((p) => ({ type: p.type, cue: p.cue, d0: Math.max(P0, dayOf(p.start)), d1: Math.min(NDAYS - 1, dayOf(p.end)) })).filter((p) => p.d1 >= p.d0);
  if (!PH.length) PH = [{ type: 'sideway', cue: LIB.pickCue('sideway', 0).id, d0: P0, d1: NDAYS - 1 }];
  if (SHORT) PH = [{ type: SHORT.type, cue: SHORT.cue, d0: P0, d1: NDAYS - 1 }];
  if (PREVIEW) { const c = LIB.CUES.find((q) => q.id === PREVIEW.cue); if (!c) throw new Error(`no cue ${PREVIEW.cue}`); PH = [{ type: c.phase, cue: c.id, d0: P0, d1: NDAYS - 1 }]; }
  PH[0].d0 = P0; PH[PH.length - 1].d1 = NDAYS - 1;
  for (let i = 1; i < PH.length; i++) PH[i].d0 = PH[i - 1].d1 + 1; // back to back, no holes
  const cueOf = (id) => LIB.CUES.find((c) => c.id === id) || LIB.pickCue('sideway', 0);
  const FIRST_BEAT = 0, FIRST_BAR = 0; // no title: the music and the run start on frame 0 (the picture fades in, film.js)
  let q = FIRST_BEAT;
  for (const p of PH) {
    p.c = cueOf(p.cue);
    const days = p.d1 - p.d0 + 1, mid = (p.d0 + p.d1) / 2;
    p.beats = PREVIEW ? PREVIEW.bars * 4 : Math.max(MIN_BEATS, Math.round((days / DPB0(mid)) * 4));
    if (SHORT) { // as long as in the long film, held to 20–45 s, in whole 4-bar blocks (the music loops cleanly)
      const g = (16 * 60) / p.c.bpm, len = U.clamp((p.beats * 60) / p.c.bpm, 20, 45);
      p.beats = 16 * U.clamp(Math.round(len / g), 2, Math.floor(45 / g));
    }
    p.q0 = q; q += p.beats; p.q1 = q;
    p.b0 = p.q0 / 4; p.b1 = p.q1 / 4; // in bars (may be fractional)
  }
  const END_BEAT = q, END_BAR = END_BEAT / 4;

  // knots (beat, day): phase starts, and the hit events inside their phase on a beat
  // every turn between two phases (an ALL-TIME HIGH or an ALL-TIME LOW, detect-phases.js) is a hit-2 event: the
  // "ALL-TIME HIGH / LOW" event the data has on that day, or one made here. The turn starts the moment its label appears.
  const kfmt = (v) => { // $0.08, $32, $1.2K, $19.8K, $109K, $41M (same as the event text, make-data.js)
    if (EQUITY) return '$' + (v >= 1 ? v.toFixed(2) : +v.toPrecision(4));
    const [d, u] = v >= 1e6 ? [1e6, 'M'] : v >= 1e3 ? [1e3, 'K'] : [1, ''];
    const x = v / d, r = x >= 100 || !u ? Math.round(x) : Math.round(x * 10) / 10;
    return v < 1 ? `$${+v.toPrecision(2)}` : `$${r}${u}`;
  };
  const iso = (d) => dateOf(d).toISOString().slice(0, 10);
  const EVSRC = PREVIEW ? [] : BTC.events.map((e) => ({ ...e }));
  if (SHORT) { // every event level shows, as in the long film; the closing turn is the hit at the end. The opening turn has
    // no label (approved 2026-10-26): a downtrend short shows no ALL-TIME HIGH, an uptrend short no ALL-TIME LOW
    const down = SHORT.type === 'downtrend', open = down ? 'ALL-TIME HIGH' : 'ALL-TIME LOW', close = down ? 'ALL-TIME LOW' : 'ALL-TIME HIGH';
    for (let i = EVSRC.length - 1; i >= 0; i--) if (dayOf(EVSRC[i].date) === P0 && EVSRC[i].text.toUpperCase().startsWith(open)) EVSRC.splice(i, 1);
    if (SHORT.endTurn) {
      const d = NDAYS - 1, kind = down ? 'down' : 'up';
      const own = EVSRC.find((e) => dayOf(e.date) === d && e.kind === kind && e.text.toUpperCase().startsWith(close));
      if (own) { own.hit = 2; own.turn = 1; } else EVSRC.push({ date: iso(d), kind, hit: 2, text: `${close}: ${kfmt(down ? DAYS[d][2] : DAYS[d][1])}`, turn: 1 });
    }
    for (const e of EVSRC) if (dayOf(e.date) <= P0) e.pre = true; // an event on the first day shows quietly (no hit: the loop's seam)
  }
  if (!PREVIEW && !SHORT) PH.forEach((p, i) => {
    if (i === 0) return;
    const top = p.type === 'downtrend', d = p.d0; // a downtrend starts at an all-time high, an uptrend at an all-time low
    // the phase starts ON the turn's day, so its label (and the brake) falls inside the new phase's music
    const name = top ? 'ALL-TIME HIGH' : EQUITY && DAYS[d][2] > Math.min(BTC.historicalLowBeforeStart ?? Infinity, ...DAYS.slice(0, d + 1).map((r) => r[2])) + 1e-9 ? 'CYCLE LOW' : 'ALL-TIME LOW';
    const own = EVSRC.find((e) => dayOf(e.date) === d && e.kind === (top ? 'up' : 'down') && e.text.toUpperCase().startsWith(name));
    if (own) { own.hit = 2; own.turn = i; return; }
    const price = top ? DAYS[d][1] : DAYS[d][2];
    EVSRC.push({ date: iso(d), kind: top ? 'up' : 'down', hit: 2, text: `${name}: ${kfmt(price)}`, turn: i });
  });
  EVSRC.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const hitEv = EVSRC.filter((e) => e.hit > 0 && !e.pre).map((e) => ({ ...e, day: eventDay(e) })).filter((e) => e.day >= 0 && e.day < NDAYS).sort((a, b) => a.day - b.day);
  // knots (beat, day): only the phase starts — inside a phase the chart runs at one steady pace right up to the
  // turn (events are NOT pinned to beats: pinning bent the pace and the chart seemed to brake before a top)
  const KN = PH.map((p) => [p.q0, p.d0]);
  // the pre-run days (before P0) fill the screen behind the first candle; with intro beats (FIRST_BEAT > 0) the chart
  // would also run through them, at the first phase's pace (days before the data scroll by without candles or a price)
  if (FIRST_BEAT > 0) KN.unshift([0, P0 - (FIRST_BEAT * (PH[0].d1 - PH[0].d0 + 1)) / PH[0].beats]);
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
  // the chart's tempo map: each phase runs at its cue's tempo right up to the moment its ALL-TIME HIGH / LOW label
  // appears; there the chart brakes (TURN.brakeBeats) to TURN.slowBpm, holds it for TURN.holdSec seconds, then speeds
  // back up to the next phase's tempo along a smooth S-curve (smoothstep, a point every half beat) in about TURN.rampSec
  // seconds. The film ends the same way. (The music does not follow this map: song.js keeps each cue's own tempo.)
  const TURN = LIB.TURN, HOLD = (TURN.holdSec * TURN.slowBpm) / 60; // beats held slow
  const tempo = [[0, PH[0].c.bpm], [FIRST_BEAT / 4, PH[0].c.bpm]];
  if (SHORT) tempo.push([(END_BEAT + 12) / 4, PH[0].c.bpm]); // a short: one steady tempo, no brakes
  const turnAt = (E, from, to, hi) => { // E = the beat the turn's label appears
    const b0 = Math.min(hi, E + TURN.brakeBeats), h1 = Math.min(hi, b0 + HOLD);
    tempo.push([E / 4, from], [b0 / 4, TURN.slowBpm], [h1 / 4, TURN.slowBpm]);
    if (to === null) return;
    const n = Math.max(1, Math.min(hi - h1, Math.round((TURN.rampSec * (TURN.slowBpm + to)) / 120))); // beats in ~rampSec s (at the mean tempo)
    for (let j = 1; j <= 2 * n; j++) { const u = j / (2 * n), e = u * u * (3 - 2 * u); tempo.push([(h1 + j / 2) / 4, TURN.slowBpm + (to - TURN.slowBpm) * e]); }
  };
  if (!SHORT) PH.forEach((p, i) => {
    if (i === 0) return;
    const e = hitEv.find((h) => h.turn === i);
    const E = e ? beatOfDay(e.day + 0.5) : p.q0, next = PH[i + 1]; // the beat its label appears (the candle's extreme)
    turnAt(E, PH[i - 1].c.bpm, p.c.bpm, next ? next.q0 - 2 : END_BEAT - 1);
  });
  if (!PREVIEW && !SHORT) turnAt(END_BEAT, PH[PH.length - 1].c.bpm, null, END_BEAT + 8);
  tempo.sort((x, y) => x[0] - y[0]);
  for (let i = tempo.length - 1; i > 0; i--) if (tempo[i][0] - tempo[i - 1][0] < 1e-9) tempo.splice(i - 1, 1); // one point per position (the later wins)
  const clock = makeClock({ bpm: PH[0].c.bpm, offset: 0, tempo });
  const { T, BEAT } = clock;
  const TB = (x) => T(0, x); // time of beat x
  const DURATION = SHORT ? TB(END_BEAT) : TB(END_BEAT + 8) + 0.5; // a short ends exactly on a bar line, on the last day: it loops
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
    if (BTC.sessions && BTC.sessions[i] !== '1') return null;
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
    return candleAt(Math.floor(D), t)?.c ?? DAYS[Math.floor(D)][3];
  }

  // ---------- events ----------
  const EVENTS = EVSRC.map((e) => {
    const d = eventDay(e);
    if (d < 0 || d >= NDAYS) return null;

    const c = DAYS[d];
    return { ...e, day: d, t: timeOfDay(d + 0.5), big: e.hit === 2, price: e.kind === 'down' ? c[2] : c[1] };
  }).filter(Boolean);
  for (const e of EVENTS) PEAK.set(e.day, e.kind !== 'down');
  const hits = EVENTS.filter((e) => e.big && !e.pre); // only hit 2 gets SFX and a visual effect
  const bigs = hits;
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
    A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' }, Asus4: { notes: ['D4', 'E4', 'A4'], bass: 'A1' }, Csus4: { notes: ['C4', 'F4', 'G4'], bass: 'C2' }, Dsus4: { notes: ['D4', 'G4', 'A4'], bass: 'D2' },
    // tension clusters (suspense cues): a semitone rubbing inside the chord
    'Dm(b9)': { notes: ['D4', 'Eb4', 'A4'], bass: 'D2' }, 'Gm(add9)': { notes: ['A3', 'Bb3', 'D4'], bass: 'G1' }, 'Bb(#11)': { notes: ['D4', 'E4', 'F4'], bass: 'Bb1' }, Am: { notes: ['C4', 'E4', 'A4'], bass: 'A1' },
    Am7: { notes: ['C4', 'E4', 'G4'], bass: 'A1' }, E: { notes: ['B3', 'E4', 'G#4'], bass: 'E2' }, Eb: { notes: ['Eb4', 'G4', 'Bb4'], bass: 'Eb2' },
    Cm: { notes: ['C4', 'Eb4', 'G4'], bass: 'C2' }, Bm: { notes: ['D4', 'F#4', 'B4'], bass: 'B1' },
  };
  // the chord of beat x: the cue's loop, one chord per bar of the phase
  const chordNameAt = (x) => { const bi = BEATS[U.clamp(x, 0, BEATS.length - 1)]; return bi.type === 'outro' ? PH[PH.length - 1].c.chords[0] : bi.cue.chords[Math.floor(Math.max(0, bi.k) / 4 / (bi.cue.barsPerChord || 1)) % bi.cue.chords.length]; };
  const prog = BEATS.map((_, x) => [Math.floor(x / 4), x % 4, 1, chordNameAt(x)]);
  const { chords, chordAt } = makeChords(clock, CH, prog);

  const ev = { start: TB(Math.max(0, FIRST_BEAT - 0.5)), end: TB(END_BEAT) };
  const markers = { start: ev.start, ...(SHORT ? {} : { end: { t: ev.end, sync: 'av' } }) }; // (a short has no closing boom)
  hits.forEach((h, i) => { markers['hit' + (i + 1)] = { t: h.t, sync: 'av' }; });
  PH.forEach((p, i) => { markers[`phase${i + 1}-${p.type}`] = TB(p.q0); });

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, markers,
    CH, DAYS, NDAYS, P0, REAL: BTC.real, dayAt, timeOfDay, candleAt, priceAt, dateOf, dayOf, EVENTS, hits, bigs,
    inBreath, breaths, moodAt, MOODS, PHASES: PH, BEATS, FIRST_BEAT, END_BEAT, FIRST_BAR, END_BAR, TB, LIB,
    SHORT, LOOPLEN, LOOPK, ...(EQUITY ? { TRADING: BTC.sessions } : {}),
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
