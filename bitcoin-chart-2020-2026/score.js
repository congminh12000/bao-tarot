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

  const FPS = 24;
  const FORMAT = U.pickFormat('16:9');
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const WIDE = W / H > 1.2;
  const clock = makeClock({ bpm: 120, offset: 0 }); // 1 beat = 0.5s, 1 bar = 2s
  const { T, BEAT } = clock;

  const DAYS = BTC.days; // [open, high, low, close]
  const NDAYS = DAYS.length;
  const START = Date.parse(BTC.start + 'T00:00:00Z');
  const dayOf = (s) => Math.round((Date.parse(s + 'T00:00:00Z') - START) / 86400000);
  const dateOf = (d) => new Date(START + Math.floor(d) * 86400000);
  const yearAt = (d) => dateOf(U.clamp(d, 0, NDAYS - 1)).getUTCFullYear();

  // ---------- pacing: days per bar (the quiet early years go faster) ----------
  const DPB = (d) => { const y = yearAt(d); return y <= 2012 ? 130 : y <= 2019 ? 85 : 70; };
  const natural = [0]; // natural[d] = bars from the first candle to day d
  for (let d = 1; d <= NDAYS; d++) natural.push(natural[d - 1] + 1 / DPB(d - 1));

  const FIRST_BAR = 1; // the first candle starts forming here (after a one-bar title)
  const hitEv = BTC.events.filter((e) => e.hit > 0).map((e) => ({ ...e, day: dayOf(e.date) })).filter((e) => e.day >= 0 && e.day < NDAYS).sort((a, b) => a.day - b.day);
  const PINS = [[FIRST_BAR, -0.5]];
  let last = FIRST_BAR;
  for (const e of hitEv) {
    const gap = e.hit === 2 ? 5 : 2; // room for a build before the big one
    const bar = Math.max(last + gap, FIRST_BAR + Math.round(natural[e.day] + 0.5 / DPB(e.day)));
    PINS.push([bar, e.day + 0.5]);
    e.bar = bar; last = bar;
  }
  const END_BAR = Math.max(last + 2, FIRST_BAR + Math.round(natural[NDAYS]));
  PINS.push([END_BAR, NDAYS]);
  const DURATION = T(END_BAR + 2) + 0.5;

  // monotone cubic (Fritsch–Carlson) through the pins: the speed changes smoothly, never runs backwards
  const px = PINS.map((p) => T(p[0])), py = PINS.map((p) => p[1]), n = px.length, dl = [], ms = [];
  for (let i = 0; i < n - 1; i++) dl.push((py[i + 1] - py[i]) / (px[i + 1] - px[i]));
  ms.push(dl[0]);
  for (let i = 1; i < n - 1; i++) ms.push((2 * dl[i - 1] * dl[i]) / (dl[i - 1] + dl[i]));
  ms.push(dl[n - 2]);
  function dayAt(t) {
    if (t <= px[0]) return py[0];
    if (t >= px[n - 1]) return py[n - 1];
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (px[mid] <= t) lo = mid; else hi = mid; }
    const i = lo, h = px[i + 1] - px[i], s = (t - px[i]) / h;
    const h00 = 2 * s * s * s - 3 * s * s + 1, h10 = s * s * s - 2 * s * s + s, h01 = -2 * s * s * s + 3 * s * s, h11 = s * s * s - s * s;
    return h00 * py[i] + h10 * h * ms[i] + h01 * py[i + 1] + h11 * h * ms[i + 1];
  }
  const timeOfDay = (d) => { let a = 0, b = DURATION; for (let k = 0; k < 44; k++) { const mid = (a + b) / 2; if (dayAt(mid) < d) a = mid; else b = mid; } return (a + b) / 2; };

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

  // ---------- the arrangement, bar by bar, from the market ----------
  // ath[d] = the all-time high up to day d; a bar is 'bear' when the price sits far under it
  const ath = []; let top = 0;
  for (let d = 0; d < NDAYS; d++) { top = Math.max(top, DAYS[d][1]); ath.push(top); }
  const ARR = [];
  for (let b = 0; b < END_BAR + 3; b++) {
    if (b < FIRST_BAR + 1) { ARR.push('intro'); continue; }
    if (b >= END_BAR) { ARR.push('outro'); continue; }
    const d = U.clamp(Math.floor(dayAt(T(b + 0.5))), 0, NDAYS - 1);
    ARR.push(DAYS[d][3] / ath[d] < 0.5 ? 'bear' : 'bull');
  }
  for (const e of bigs) {
    for (let b = e.bar - 4; b < e.bar; b++) if (b > FIRST_BAR) ARR[b] = 'build';
    for (let b = e.bar; b < Math.min(e.bar + 6, END_BAR); b++) ARR[b] = 'drop';
  }
  // a lone bar of one mood inside another is smoothed away
  for (let b = 2; b < END_BAR - 1; b++) if ((ARR[b] === 'bull' || ARR[b] === 'bear') && ARR[b - 1] === ARR[b + 1] && ARR[b - 1] !== ARR[b] && ['bull', 'bear'].includes(ARR[b - 1])) ARR[b] = ARR[b - 1];
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
    ARR, styleAt, inBreath, breaths,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
