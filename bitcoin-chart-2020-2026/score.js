// THE SCORE — the single source of truth for music AND picture, built from the data (btc-data.js).
// - The market is cut into phases (data/phases.csv): uptrend, downtrend, sideway, peak, bottom. Each phase plays a
//   cue from data/music.js at that cue's tempo: trends fast, sideways medium, the turns (peak / bottom) slow.
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

  // ---------- phases -> bars ----------
  // SPEED < 1 slows the whole chart down; days per bar at the reference tempo (120 BPM) by era
  const SPEED = 0.7;
  const DPB0 = (d) => { const y = yearAt(d); return (y <= 2012 ? 130 : y <= 2019 ? 85 : 70) * SPEED; };
  const MIN_BARS = 2; // every phase gets at least two bars, so a short turn is still felt (and heard)
  const isTurn = (type) => type === 'peak' || type === 'bottom';
  let PH = (BTC.phases || []).map((p) => ({ type: p.type, cue: p.cue, d0: Math.max(0, dayOf(p.start)), d1: Math.min(NDAYS - 1, dayOf(p.end)) })).filter((p) => p.d1 >= p.d0);
  if (!PH.length) PH = [{ type: 'sideway', cue: LIB.pickCue('sideway', 0).id, d0: 0, d1: NDAYS - 1 }];
  if (PREVIEW) { const c = LIB.CUES.find((q) => q.id === PREVIEW.cue); if (!c) throw new Error(`no cue ${PREVIEW.cue}`); PH = [{ type: c.phase, cue: c.id, d0: 0, d1: NDAYS - 1 }]; }
  PH[0].d0 = 0; PH[PH.length - 1].d1 = NDAYS - 1;
  for (let i = 1; i < PH.length; i++) PH[i].d0 = PH[i - 1].d1 + 1; // back to back, no holes
  const cueOf = (id) => LIB.CUES.find((c) => c.id === id) || LIB.pickCue('sideway', 0);
  const FIRST_BAR = 1; // bar 0 is the title
  let bar = FIRST_BAR;
  for (const p of PH) {
    p.c = cueOf(p.cue);
    const days = p.d1 - p.d0 + 1, mid = (p.d0 + p.d1) / 2;
    // at this cue's tempo a bar lasts 240/bpm s; keep the chart's days-per-second of the era at 120 BPM, scaled by tempo
    p.bars = PREVIEW ? PREVIEW.bars : Math.max(MIN_BARS, Math.round(days / DPB0(mid)));
    p.b0 = bar; bar += p.bars; p.b1 = bar;
  }
  const END_BAR = bar;

  // knots (bar, day): phase starts, and the hit events inside their phase on a bar line where one is free
  const EVSRC = PREVIEW ? [] : BTC.events;
  const hitEv = EVSRC.filter((e) => e.hit > 0).map((e) => ({ ...e, day: dayOf(e.date) })).filter((e) => e.day >= 0 && e.day < NDAYS).sort((a, b) => a.day - b.day);
  const KN = [];
  for (const p of PH) {
    KN.push([p.b0, p === PH[0] ? -0.5 : p.d0]);
    let last = p.b0;
    for (const e of hitEv.filter((h) => h.day >= p.d0 && h.day <= p.d1)) {
      const want = p.b0 + Math.round(((e.day + 0.5 - p.d0) / (p.d1 + 1 - p.d0)) * p.bars);
      const hb = U.clamp(want, last + 1, p.b1 - 1);
      if (hb > last && hb < p.b1) { KN.push([hb, e.day + 0.5]); e.bar = hb; last = hb; }
    }
  }
  KN.push([END_BAR, NDAYS]);
  const KB = KN.map((k) => k[0]), KD = KN.map((k) => k[1]);
  function dayOfBar(b) {
    if (b <= KB[0]) return KD[0];
    if (b >= KB[KB.length - 1]) return KD[KD.length - 1];
    let lo = 0, hi = KB.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (KB[mid] <= b) lo = mid; else hi = mid; }
    return KD[lo] + ((b - KB[lo]) / (KB[lo + 1] - KB[lo])) * (KD[lo + 1] - KD[lo]);
  }

  // ---------- per bar: which phase and cue, and the tempo ----------
  const BARS = []; // b -> { type, cue, k (bar inside the phase), p (phase index) }
  for (let b = 0; b < END_BAR + 3; b++) {
    const i = b < FIRST_BAR ? 0 : b >= END_BAR ? PH.length - 1 : PH.findIndex((p) => b >= p.b0 && b < p.b1);
    const p = PH[i];
    BARS.push({ type: b < FIRST_BAR ? 'intro' : b >= END_BAR ? 'outro' : p.type, cue: p.c, k: b - p.b0, p: i });
  }
  // tempo points on every bar line: the cue's tempo; into a turn the tempo starts sinking a bar early (ritardando);
  // the clock ramps linearly between points, so every change takes one bar
  const bpmOf = (b) => BARS[U.clamp(b, 0, BARS.length - 1)].cue.bpm;
  const tempo = [];
  for (let b = 0; b < BARS.length; b++) {
    let v = bpmOf(b);
    if (b >= FIRST_BAR && b + 1 < END_BAR && isTurn(BARS[b + 1].type) && !isTurn(BARS[b].type)) v = (v + bpmOf(b + 1)) / 2;
    tempo.push([b, v]);
  }
  const clock = makeClock({ bpm: bpmOf(0), offset: 0, tempo });
  const { T, BEAT } = clock;
  const DURATION = T(END_BAR + 2) + 0.5;
  const PULSE = 0.3; // how hard the candles surge on each beat (0 = smooth)
  const pulse = (b) => b + (PULSE * Math.sin(2 * Math.PI * 4 * b)) / (2 * Math.PI * 4);
  const barAt = (t) => clock.beatPos(t) / clock.beatsPerBar;
  const dayAt = (t) => dayOfBar(pulse(barAt(t)));
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
    const pin = hitEv.find((h) => h.day === d && h.bar !== undefined);
    const c = DAYS[d];
    return { ...e, day: d, t: pin ? T(pin.bar) : timeOfDay(d + 0.5), bar: pin ? pin.bar : undefined, big: e.hit === 2, price: e.kind === 'down' ? c[2] : c[1] };
  }).filter(Boolean);
  for (const e of EVENTS) PEAK.set(e.day, e.kind !== 'down');
  const hits = EVENTS.filter((e) => e.hit > 0);
  const bigs = hits.filter((e) => e.big);
  const breaths = bigs.map((e) => [e.t - BEAT, e.t]); // one beat of real silence before each big one
  const inBreath = (t) => breaths.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);

  // sections (for the level meter): one per phase
  const S = { intro: [0, T(FIRST_BAR)] };
  PH.forEach((p, i) => { S[`${i + 1}-${p.type}`] = [T(p.b0), T(p.b1)]; });
  S.outro = [T(END_BAR), DURATION];

  // ---------- harmony: every chord any cue uses ----------
  const CH = {
    Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, 'Dm/C': { notes: ['D4', 'F4', 'A4'], bass: 'C2' }, Dm7: { notes: ['C4', 'F4', 'A4'], bass: 'D2' },
    D: { notes: ['D4', 'F#4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, F: { notes: ['C4', 'F4', 'A4'], bass: 'F2' },
    C: { notes: ['C4', 'E4', 'G4'], bass: 'C2' }, Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G1' }, G: { notes: ['D4', 'G4', 'B4'], bass: 'G1' },
    A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' }, Asus4: { notes: ['D4', 'E4', 'A4'], bass: 'A1' }, Am: { notes: ['C4', 'E4', 'A4'], bass: 'A1' },
    Am7: { notes: ['C4', 'E4', 'G4'], bass: 'A1' }, E: { notes: ['B3', 'E4', 'G#4'], bass: 'E2' }, Eb: { notes: ['Eb4', 'G4', 'Bb4'], bass: 'Eb2' },
    Cm: { notes: ['C4', 'Eb4', 'G4'], bass: 'C2' }, Bm: { notes: ['D4', 'F#4', 'B4'], bass: 'B1' },
  };
  const prog = BARS.map((x, b) => [b, 0, 4, x.type === 'outro' ? PH[PH.length - 1].c.chords[0] : x.cue.chords[Math.max(0, x.k) % x.cue.chords.length]]);
  const { chords, chordAt } = makeChords(clock, CH, prog);

  const ev = { start: T(FIRST_BAR, -0.5), end: T(END_BAR) };
  const markers = { start: ev.start, end: { t: ev.end, sync: 'av' } };
  hits.forEach((h, i) => { markers['hit' + (i + 1)] = { t: h.t, sync: 'av' }; });
  PH.forEach((p, i) => { markers[`phase${i + 1}-${p.type}`] = T(p.b0); });

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, markers,
    DAYS, NDAYS, REAL: BTC.real, dayAt, timeOfDay, candleAt, priceAt, dateOf, dayOf, EVENTS, hits, bigs,
    inBreath, breaths, moodAt, MOODS, PHASES: PH, BARS, FIRST_BAR, END_BAR, LIB,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
