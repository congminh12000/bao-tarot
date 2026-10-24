// THE SCORE — the single source of truth for music AND picture.
// The chart's calendar is mapped onto the music: every big market moment (a crash, an all-time high) is pinned to a
// bar line, so the candle that makes the move and the hit in the soundtrack land on the same frame.
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
  const DURATION = T(36) + 0.5; // 72.5s

  const DAYS = BTC.days; // [open, high, low, close]
  const NDAYS = DAYS.length;
  const START = Date.parse(BTC.start + 'T00:00:00Z');
  const dayOf = (s) => Math.round((Date.parse(s + 'T00:00:00Z') - START) / 86400000);
  const dateOf = (d) => new Date(START + Math.floor(d) * 86400000);

  // ---------- the calendar pinned to the music: [date, bar] (the candle of that day is half-formed on that bar) ----------
  const PINS = [
    ['2020-01-01', 1, -0.5], ['2020-03-12', 3], ['2020-12-31', 7], ['2021-05-19', 10], ['2021-11-10', 13],
    ['2022-06-18', 16], ['2022-11-09', 18], ['2023-12-31', 21.5], ['2024-03-14', 23], ['2024-12-05', 26],
    ['2025-10-06', 30], ['2026-02-05', 32], [null, 34, 0], // the last candle closes on bar 34
  ];
  const px = PINS.map(([, bar]) => T(bar));
  const py = PINS.map(([d, , off]) => (d ? dayOf(d) : NDAYS - 1) + (off === undefined ? 0.5 : off + (d ? 0 : 1)));
  // monotone cubic (Fritsch–Carlson): the playback speed changes smoothly, never runs backwards
  const n = px.length, dl = [], ms = [];
  for (let i = 0; i < n - 1; i++) dl.push((py[i + 1] - py[i]) / (px[i + 1] - px[i]));
  ms.push(dl[0]);
  for (let i = 1; i < n - 1; i++) ms.push((2 * dl[i - 1] * dl[i]) / (dl[i - 1] + dl[i])); // harmonic mean: monotone
  ms.push(dl[n - 2]);
  // dayAt(t): the chart's "now" as a fractional day index (−0.5 before the first candle, NDAYS when finished)
  function dayAt(t) {
    if (t <= px[0]) return py[0];
    if (t >= px[n - 1]) return py[n - 1];
    let i = 0;
    while (t > px[i + 1]) i++;
    const h = px[i + 1] - px[i], s = (t - px[i]) / h;
    const h00 = 2 * s * s * s - 3 * s * s + 1, h10 = s * s * s - 2 * s * s + s, h01 = -2 * s * s * s + 3 * s * s, h11 = s * s * s - s * s;
    return h00 * py[i] + h10 * h * ms[i] + h01 * py[i + 1] + h11 * h * ms[i + 1];
  }
  // the price inside a forming candle, u = 0..1 through the day: down days visit the high first, then the low at u=0.5
  function intraday(c, u, i) {
    const [o, hi, lo, cl] = c;
    const up = PEAK.has(i) ? PEAK.get(i) : cl >= o; // an 'up' moment tops out at mid-day, whatever the close
    const k = up ? [[0, o], [0.2, lo], [0.5, hi], [1, cl]] : [[0, o], [0.2, hi], [0.5, lo], [1, cl]];
    for (let i = 0; i < 3; i++) if (u <= k[i + 1][0]) return U.lerp(k[i][1], k[i + 1][1], (u - k[i][0]) / (k[i + 1][0] - k[i][0]));
    return cl;
  }
  // the candle as it looks at time t (the current one is still forming)
  function candleAt(i, t) {
    const D = dayAt(t);
    if (i > D) return null;
    const c = DAYS[i];
    if (i + 1 <= D) return { o: c[0], h: c[1], l: c[2], c: c[3], done: true };
    const u = U.clamp(D - i);
    const N = 12; let h = c[0], l = c[0];
    for (let k = 1; k <= N; k++) { const p = intraday(c, (u * k) / N, i); h = Math.max(h, p); l = Math.min(l, p); }
    const p = intraday(c, u, i);
    return { o: c[0], h, l, c: p, done: false };
  }
  function priceAt(t) {
    const D = dayAt(t);
    if (D < 0) return DAYS[0][0];
    const i = Math.min(NDAYS - 1, Math.floor(D));
    return D >= NDAYS ? DAYS[NDAYS - 1][3] : candleAt(i, t).c;
  }

  // ---------- sections ----------
  const S = {
    intro: [0, T(3)],
    bull1: [T(3), T(13)],
    bear: [T(13), T(21)],
    build: [T(21), T(25, 3)],
    breath: [T(25, 3), T(26)],
    drop: [T(26), T(32)],
    fall: [T(32), T(34)],
    outro: [T(34), DURATION],
  };

  // ---------- harmony (D minor) ----------
  const CH = {
    Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' },
    Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' },
    F: { notes: ['C4', 'F4', 'A4'], bass: 'F2' },
    C: { notes: ['C4', 'E4', 'G4'], bass: 'C2' },
    Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G1' },
    A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
  };
  const prog = [];
  const loop = (b0, b1, names) => { for (let b = b0; b < b1; b++) prog.push([b, 0, 4, names[(b - b0) % names.length]]); };
  loop(0, 2, ['Dm']); loop(2, 3, ['Bb']);
  loop(3, 13, ['Dm', 'Bb', 'F', 'C']);
  loop(13, 21, ['Dm', 'Gm', 'Bb', 'A']);
  loop(21, 26, ['Dm', 'Bb', 'Gm', 'A']);
  loop(26, 32, ['Dm', 'Bb', 'F', 'C']);
  loop(32, 34, ['Gm', 'A']);
  loop(34, 37, ['Dm']);
  const { chords, chordAt } = makeChords(clock, CH, prog);

  // brass hook on the drop (8th grid per bar: [note, start8th, dur8ths])
  const HOOK = [
    [['D5', 0, 3], ['F5', 3, 1], ['E5', 4, 1], ['D5', 5, 1], ['C5', 6, 2]],
    [['D5', 0, 2], ['Bb4', 2, 2], ['F4', 4, 2], ['A4', 6, 2]],
    [['C5', 0, 3], ['A4', 3, 1], ['F5', 4, 2], ['E5', 6, 1], ['C5', 7, 1]],
    [['E5', 0, 4], ['G5', 4, 2], ['E5', 6, 2]],
  ];
  const brass = [];
  for (let b = 26; b < 32; b++) brass.push(...MU.placeBar(clock, HOOK[(b - 26) % 4], b));

  // ---------- the story: market moments ----------
  // hit = pinned to a bar line, with a sound + a flash; others are labels only
  const EVENTS = [
    { date: '2020-03-12', text: 'COVID: sập 50% trong 1 ngày', kind: 'down', hit: true },
    { date: '2020-12-16', text: 'Vượt đỉnh cũ $20K', kind: 'up' },
    { date: '2021-04-14', text: 'Đỉnh $64K', kind: 'up' },
    { date: '2021-05-19', text: 'Bán tháo tháng 5', kind: 'down', hit: true },
    { date: '2021-11-10', text: 'ĐỈNH $69K', kind: 'up', hit: true },
    { date: '2022-05-12', text: 'LUNA sụp đổ', kind: 'down' },
    { date: '2022-06-18', text: 'Thủng $18K', kind: 'down', hit: true },
    { date: '2022-11-09', text: 'FTX phá sản', kind: 'down', hit: true },
    { date: '2023-10-24', text: 'Hồi phục', kind: 'up' },
    { date: '2024-01-11', text: 'ETF được duyệt', kind: 'up' },
    { date: '2024-03-14', text: 'ĐỈNH MỚI $73K', kind: 'up', hit: true },
    { date: '2024-04-19', text: 'Halving', kind: 'info' },
    { date: '2024-12-05', text: 'CHẠM $100K!', kind: 'up', hit: true, big: true },
    { date: '2025-04-08', text: 'Thuế quan', kind: 'down' },
    { date: '2025-10-06', text: 'ĐỈNH $126K', kind: 'up', hit: true },
    { date: '2025-10-10', text: 'Thanh lý kỷ lục', kind: 'down' },
    { date: '2026-02-05', text: 'Rơi về $60K', kind: 'down', hit: true },
  ].map((e) => {
    const d = dayOf(e.date);
    const pin = PINS.find((p) => p[0] === e.date);
    const t = pin ? T(pin[1]) : (() => { let a = 0, b = DURATION; for (let k = 0; k < 40; k++) { const mid = (a + b) / 2; if (dayAt(mid) < d + 0.5) a = mid; else b = mid; } return (a + b) / 2; })();
    const c = DAYS[d];
    return { ...e, day: d, t, price: e.kind === 'down' ? c[2] : c[1] };
  });
  const hits = EVENTS.filter((e) => e.hit);
  const PEAK = new Map(EVENTS.map((e) => [e.day, e.kind === 'up']));

  const ev = {
    start: T(1, -0.5),
    breath: T(25, 3),
    drop: T(26),
    end: T(34), // the last candle closes
  };

  const markers = { start: ev.start, end: { t: ev.end, sync: 'av' } };
  hits.forEach((h, i) => { markers['hit' + (i + 1)] = { t: h.t, sync: 'av' }; });
  markers.drop = ev.drop; // = hit 7 ($100K)

  const SCORE = {
    FPS, FORMAT, W, H, SAFE, WIDE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, markers, brass,
    DAYS, NDAYS, dayAt, candleAt, priceAt, dateOf, dayOf, EVENTS, hits,
  };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
