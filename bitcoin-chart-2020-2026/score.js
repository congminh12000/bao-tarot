// THE SCORE — the single source of truth for music AND picture, built from the data (btc-data.js).
// - Every event with hit ≥ 1 in data/events.csv is pinned to a bar line: the candle that makes the move and the hit
//   in the music land on the same frame. hit = 2 gets a 4-bar build, a beat of silence and a drop.
// - The music's mood follows the market: near the all-time high it drives (bull), deep under it it broods (bear).
// Add data or events, run `node make-data.js`, and the whole film re-times itself.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const BTC = node ? require('./btc-data') : globalThis.BTC;
  const { m, makeClock, makeChords } = MU;

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

  // ---------- pacing: days per bar (the quiet early years go faster) ----------
  // SPEED < 1 slows the whole chart down (0.7 = 30% slower than the first cut, so the eye can follow every candle)
  const SPEED = 0.7;
  const DPB0 = (d) => { const y = yearAt(d); return (y <= 2012 ? 130 : y <= 2019 ? 85 : 70) * SPEED; };
  // the mood of the market around each event: the chart slows into a crash (heavy) and rushes into a rally (euphoric)
  const MOODS = BTC.events.filter((e) => e.kind === 'up' || e.kind === 'down').map((e) => {
    const day = dayOf(e.date), big = e.hit > 0;
    return { day, up: e.kind === 'up', w: big ? 1 : 0.55, before: big ? 45 : 18, after: big ? 6 : 4 };
  }).filter((e) => e.day >= 0 && e.day < NDAYS);
  const smooth = (x) => x * x * (3 - 2 * x);
  // 0..1: how close day d is to each mood event (ramps up before it, fades quickly after)
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
  // into a crash: up to 2.5x slower; into a rally: up to 1.7x faster
  const DPB = (d) => { const md = moodAt(d + 0.5); return DPB0(d) * (1 - 0.6 * md.down) * (1 + 0.7 * md.up); };
  const natural = [0]; // natural[d] = bars from the first candle to day d
  for (let d = 1; d <= NDAYS; d++) natural.push(natural[d - 1] + 1 / DPB(d - 1));
  const nat = (D) => {
    if (D <= 0) return D / DPB(0);
    if (D >= NDAYS) return natural[NDAYS];
    const i = Math.floor(D); return natural[i] + (D - i) * (natural[i + 1] - natural[i]);
  };
  function natInv(v) { // the day whose natural position is v
    if (v <= 0) return v * DPB(0);
    if (v >= natural[NDAYS]) return NDAYS;
    let lo = 0, hi = NDAYS;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (natural[mid] <= v) lo = mid; else hi = mid; }
    return lo + (v - natural[lo]) / (natural[lo + 1] - natural[lo]);
  }

  const FIRST_BAR = 1; // the first candle starts forming here (after a one-bar title)
  const hitEv = BTC.events.filter((e) => e.hit > 0).map((e) => ({ ...e, day: dayOf(e.date) })).filter((e) => e.day >= 0 && e.day < NDAYS).sort((a, b) => a.day - b.day);
  const PINS = [[FIRST_BAR, -0.5]];
  let last = FIRST_BAR;
  for (const e of hitEv) {
    const gap = e.hit === 2 ? 5 : 2; // room for a build before the big one
    const bar = Math.max(last + gap, FIRST_BAR + Math.round(nat(e.day + 0.5)));
    PINS.push([bar, e.day + 0.5]);
    e.bar = bar; last = bar;
  }
  const END_BAR = Math.max(last + 2, FIRST_BAR + Math.round(natural[NDAYS]));
  PINS.push([END_BAR, NDAYS]);

  // between two pins the chart follows the natural pacing (with its slow-downs and rushes), stretched so that
  // every pinned event lands exactly on its bar line
  const PB = PINS.map((p) => p[0]), PD = PINS.map((p) => p[1]), PN = PD.map(nat), n = PINS.length;
  function dayOfBar(b) { // the market's pacing in bars (era + mood), pins exact
    if (b <= PB[0]) return PD[0];
    if (b >= PB[n - 1]) return PD[n - 1];
    let i = 0; while (b > PB[i + 1]) i++;
    return natInv(PN[i] + ((b - PB[i]) / (PB[i + 1] - PB[i])) * (PN[i + 1] - PN[i]));
  }

  // ---------- the arrangement, bar by bar, from the market ----------
  // ath[d] = the all-time high up to day d; a bar is 'bear' when the price sits far under it
  const ath = []; let top = 0;
  for (let d = 0; d < NDAYS; d++) { top = Math.max(top, DAYS[d][1]); ath.push(top); }
  const ARR = [];
  for (let b = 0; b < END_BAR + 3; b++) {
    if (b < FIRST_BAR + 1) { ARR.push('intro'); continue; }
    if (b >= END_BAR) { ARR.push('outro'); continue; }
    const d = U.clamp(Math.floor(dayOfBar(b + 0.5)), 0, NDAYS - 1);
    ARR.push(DAYS[d][3] / ath[d] < 0.5 ? 'bear' : 'bull');
  }
  for (const e of hitEv.filter((h) => h.hit === 2)) {
    for (let b = e.bar - 4; b < e.bar; b++) if (b > FIRST_BAR) ARR[b] = 'build';
    for (let b = e.bar; b < Math.min(e.bar + 6, END_BAR); b++) ARR[b] = 'drop';
  }
  // a lone bar of one mood inside another is smoothed away
  for (let b = 2; b < END_BAR - 1; b++) if ((ARR[b] === 'bull' || ARR[b] === 'bear') && ARR[b - 1] === ARR[b + 1] && ARR[b - 1] !== ARR[b] && ['bull', 'bear'].includes(ARR[b - 1])) ARR[b] = ARR[b - 1];

  // ---------- the chart rides the music ----------
  // The tempo never changes. What changes is how the music FEELS, and the candles follow it: the half-time bear
  // grooves drag, a build accelerates bar by bar with its snare roll, a drop rushes; and inside every beat the
  // chart surges on the beat and eases off between beats. Pinned events still land exactly on their bar lines.
  const runOf = (b) => { let r = 0; while (b - r - 1 >= 0 && ARR[b - r - 1] === ARR[b]) r++; return r; };
  const FEEL = ARR.map((st, b) => (st === 'bear' ? 0.7 : st === 'build' ? 1 + 0.12 * runOf(b) : st === 'drop' ? 1.3 : 1));
  const feelAt = (x) => { // linear between bar centres
    const i = Math.floor(x - 0.5), u = x - 0.5 - i;
    const a = FEEL[U.clamp(i, 0, FEEL.length - 1)], c = FEEL[U.clamp(i + 1, 0, FEEL.length - 1)];
    return a + (c - a) * u;
  };
  const RES = 16; // integration steps per bar
  const CUM = [0];
  for (let q = 1; q <= FEEL.length * RES; q++) CUM.push(CUM[q - 1] + feelAt((q - 0.5) / RES) / RES);
  const cum = (b) => { const q = U.clamp(b * RES, 0, CUM.length - 1), i = Math.floor(q); return i >= CUM.length - 1 ? CUM[CUM.length - 1] : CUM[i] + (q - i) * (CUM[i + 1] - CUM[i]); };
  const PULSE = 0.3; // how hard the candles surge on each beat (0 = smooth)
  function warp(b) { // music bars -> market bars: feel inside each pin segment, then the beat pulse
    if (b <= PB[0] || b >= PB[n - 1]) return b;
    let i = 0; while (b > PB[i + 1]) i++;
    const w = PB[i] + ((cum(b) - cum(PB[i])) / (cum(PB[i + 1]) - cum(PB[i]))) * (PB[i + 1] - PB[i]);
    return w + (PULSE * Math.sin(2 * Math.PI * 4 * w)) / (2 * Math.PI * 4); // speed 1 + 0.3 cos(beat): fast on the beat
  }
  const clock = makeClock({ bpm: 120, offset: 0 }); // 1 beat = 0.5s, 1 bar = 2s — constant
  const { T, BEAT } = clock;
  const DURATION = T(END_BAR + 2) + 0.5;
  const dayAt = (t) => dayOfBar(warp(t / clock.BAR));
  function timeOfDay(d) { // dayAt is monotone: bisect
    let a = 0, c = DURATION;
    for (let k = 0; k < 40; k++) { const m = (a + c) / 2; if (dayAt(m) < d) a = m; else c = m; }
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
  const EVENTS = BTC.events.map((e) => {
    const d = dayOf(e.date);
    if (d < 0 || d >= NDAYS) return null;
    const pin = hitEv.find((h) => h.day === d && h.hit);
    const c = DAYS[d];
    return { ...e, day: d, t: pin ? T(pin.bar) : timeOfDay(d + 0.5), big: e.hit === 2, price: e.kind === 'down' ? c[2] : c[1] };
  }).filter(Boolean);
  for (const e of EVENTS) PEAK.set(e.day, e.kind !== 'down');
  const hits = EVENTS.filter((e) => e.hit > 0);
  const bigs = hits.filter((e) => e.big);

  const styleAt = (t) => ARR[U.clamp(Math.floor(t / clock.BAR + 1e-6), 0, ARR.length - 1)];
  const breaths = bigs.map((e) => [T(e.bar, -1), T(e.bar)]); // one beat of real silence before each big one
  const inBreath = (t) => breaths.some(([a, b]) => t >= a - 1e-6 && t < b - 1e-6);

  // sections (for the level meter): runs of the same style
  const S = {};
  for (let b = 0, k = 0; b < ARR.length; ) {
    let e = b; while (e < ARR.length && ARR[e] === ARR[b]) e++;
    S[`${ARR[b]}${k++ ? '@' + b : ''}`] = [T(b), Math.min(T(e), DURATION)]; b = e;
  }

  // ---------- harmony (D minor) ----------
  const CH = {
    Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' },
    F: { notes: ['C4', 'F4', 'A4'], bass: 'F2' }, C: { notes: ['C4', 'E4', 'G4'], bass: 'C2' },
    Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G1' }, A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
  };
  const PROG = { intro: ['Dm', 'Dm', 'Bb'], bull: ['Dm', 'Bb', 'F', 'C'], bear: ['Dm', 'Gm', 'Bb', 'A'], build: ['Dm', 'Bb', 'Gm', 'A'], drop: ['Dm', 'Bb', 'F', 'C'], outro: ['Dm'] };
  const prog = [];
  for (let b = 0, run = 0; b < ARR.length; b++) { run = b && ARR[b] === ARR[b - 1] ? run + 1 : 0; const p = PROG[ARR[b]]; prog.push([b, 0, 4, p[run % p.length]]); }
  const { chords, chordAt } = makeChords(clock, CH, prog);

  const HOOK = [
    [['D5', 0, 3], ['F5', 3, 1], ['E5', 4, 1], ['D5', 5, 1], ['C5', 6, 2]],
    [['D5', 0, 2], ['Bb4', 2, 2], ['F4', 4, 2], ['A4', 6, 2]],
    [['C5', 0, 3], ['A4', 3, 1], ['F5', 4, 2], ['E5', 6, 1], ['C5', 7, 1]],
    [['E5', 0, 4], ['G5', 4, 2], ['E5', 6, 2]],
  ];
  const brass = [];
  for (let b = 0, run = 0; b < ARR.length; b++) { run = b && ARR[b] === ARR[b - 1] ? run + 1 : 0; if (ARR[b] === 'drop') brass.push(...MU.placeBar(clock, HOOK[run % 4], b)); }

  const ev = { start: T(FIRST_BAR, -0.5), end: T(END_BAR) };
  const markers = { start: ev.start, end: { t: ev.end, sync: 'av' } };
  hits.forEach((h, i) => { markers['hit' + (i + 1)] = { t: h.t, sync: 'av' }; });
  bigs.forEach((h, i) => { markers['drop' + (i + 1)] = h.t; });

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, markers, brass,
    DAYS, NDAYS, REAL: BTC.real, dayAt, timeOfDay, candleAt, priceAt, dateOf, dayOf, EVENTS, hits, bigs,
    ARR, styleAt, inBreath, breaths, moodAt, MOODS,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
