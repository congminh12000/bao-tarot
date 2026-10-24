// Builds btc-data.js: daily BTC/USD candles from 2020-01-01 to the last anchor date.
//   node make-data.js                 -> uses data/btc-usd-daily.csv if present (Date,Open,High,Low,Close), else the anchors below
// The anchors are approximate daily closes at the turning points (and the famous wicks); the days between them are
// filled with a seeded Brownian bridge in log-price, so the shape follows the real market but single days are synthetic.
const fs = require('fs');
const path = require('path');
const U = require('./engine/util');

const START = '2020-01-01';
const DAY = 86400000;
const dayOf = (s) => Math.round((Date.parse(s + 'T00:00:00Z') - Date.parse(START + 'T00:00:00Z')) / DAY);

// [date, close, {hi, lo}]
const ANCHORS = [
  ['2020-01-01', 7200], ['2020-02-13', 10300], ['2020-03-08', 8050], ['2020-03-11', 7900],
  ['2020-03-12', 4950, { lo: 4600 }], ['2020-03-13', 5560, { lo: 3850 }], ['2020-04-29', 8750], ['2020-06-01', 10200],
  ['2020-07-20', 9200], ['2020-08-17', 12300], ['2020-09-23', 10250], ['2020-10-31', 13800], ['2020-11-30', 19700],
  ['2020-12-31', 29000], ['2021-01-08', 41000], ['2021-01-22', 32000], ['2021-02-21', 57500], ['2021-02-28', 45200],
  ['2021-03-13', 61200], ['2021-04-14', 63500, { hi: 64800 }], ['2021-04-25', 49000], ['2021-05-08', 58800],
  ['2021-05-18', 42900], ['2021-05-19', 37000, { lo: 30000 }], ['2021-06-22', 32500], ['2021-07-20', 29800],
  ['2021-08-14', 47800], ['2021-09-06', 52700], ['2021-09-21', 40700], ['2021-10-20', 66000],
  ['2021-11-10', 65000, { hi: 69000 }], ['2021-12-04', 49200, { lo: 42000 }], ['2021-12-31', 46300],
  ['2022-01-24', 36600], ['2022-03-28', 47100], ['2022-05-09', 30100], ['2022-05-12', 29000, { lo: 26700 }],
  ['2022-06-13', 22500], ['2022-06-18', 19000, { lo: 17600 }], ['2022-08-14', 24300], ['2022-09-30', 19400],
  ['2022-11-05', 21300], ['2022-11-08', 18500], ['2022-11-09', 15900, { lo: 15600 }], ['2022-11-21', 15800, { lo: 15500 }],
  ['2022-12-31', 16550], ['2023-01-31', 23100], ['2023-03-10', 20200], ['2023-04-13', 30400], ['2023-06-15', 25100],
  ['2023-07-13', 31400], ['2023-08-17', 26600], ['2023-10-15', 26900], ['2023-10-24', 34500], ['2023-12-08', 44200],
  ['2023-12-31', 42300], ['2024-01-11', 46400, { hi: 49000 }], ['2024-01-22', 39600], ['2024-02-28', 62500],
  ['2024-03-14', 71400, { hi: 73800 }], ['2024-04-19', 64000, { lo: 59600 }], ['2024-05-21', 70100],
  ['2024-07-05', 56700, { lo: 53500 }], ['2024-07-29', 66800], ['2024-08-05', 54000, { lo: 49000 }],
  ['2024-09-06', 53900], ['2024-10-29', 72700], ['2024-11-05', 69400], ['2024-11-13', 90000], ['2024-11-22', 98900],
  ['2024-12-04', 98800], ['2024-12-05', 97000, { hi: 103900 }], ['2024-12-17', 106100, { hi: 108300 }],
  ['2024-12-31', 93400], ['2025-01-20', 102200, { hi: 109100 }], ['2025-02-03', 101400], ['2025-02-28', 84300],
  ['2025-03-10', 78600], ['2025-04-02', 82500], ['2025-04-08', 76300, { lo: 74500 }], ['2025-05-08', 103200],
  ['2025-05-22', 111600], ['2025-06-22', 101000], ['2025-07-14', 119800, { hi: 123100 }], ['2025-08-02', 113300],
  ['2025-08-13', 123300, { hi: 124400 }], ['2025-09-01', 109200], ['2025-09-18', 117100],
  ['2025-10-06', 124700, { hi: 126200 }], ['2025-10-09', 121500], ['2025-10-10', 113200, { lo: 104800 }],
  ['2025-10-31', 109500], ['2025-11-21', 85000, { lo: 80600 }], ['2025-12-31', 87500], ['2026-01-14', 96900],
  ['2026-01-31', 78600], ['2026-02-05', 63000, { lo: 60100 }], ['2026-02-28', 66000], ['2026-03-31', 68000],
  ['2026-04-30', 76000], ['2026-05-31', 74000], ['2026-06-30', 70000],
];

// daily volatility (log) by year: 2020-21 wild, 2023 calm
const VOL = { 2020: 0.032, 2021: 0.036, 2022: 0.028, 2023: 0.019, 2024: 0.024, 2025: 0.021, 2026: 0.026 };

function fromAnchors() {
  const rng = U.mulberry32(20200101);
  const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rng(); return (s - 3) / Math.sqrt(0.5); };
  const pts = ANCHORS.map(([d, c, x]) => ({ d: dayOf(d), c, x: x || {} }));
  const N = pts[pts.length - 1].d + 1;
  const close = new Float64Array(N);
  const vol = (d) => VOL[new Date(Date.parse(START) + d * DAY).getUTCFullYear()];
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1], n = b.d - a.d;
    const walk = [0];
    for (let i = 1; i <= n; i++) walk.push(walk[i - 1] + gauss() * vol(a.d + i) * 0.85);
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const bridge = walk[i] - u * walk[n]; // pinned to 0 at both anchors
      const base = Math.log(a.c) + u * (Math.log(b.c) - Math.log(a.c));
      // keep the noise between the anchors' own range (soft): no fake all-time highs or lows
      const top = Math.log(Math.max(a.c, b.c) * 1.025) - base, bot = base - Math.log(Math.min(a.c, b.c) * 0.95);
      const x = bridge >= 0 ? top * Math.tanh(bridge / Math.max(top, 1e-4)) : -bot * Math.tanh(-bridge / Math.max(bot, 1e-4));
      close[a.d + i] = Math.exp(base + x);
    }
  }
  const CAP = Math.max(...pts.map((p) => p.x.hi || p.c)); // the all-time high stays the real one
  const extra = new Map(pts.map((p) => [p.d, p.x]));
  for (let d = 0; d < N; d++) if (!extra.has(d)) close[d] = Math.min(close[d], CAP * 0.985);
  const rows = [];
  for (let d = 0; d < N; d++) {
    const o = d ? close[d - 1] : close[0] * 0.995, c = close[d], v = vol(d);
    let hi = Math.max(o, c) * Math.exp(Math.abs(gauss()) * v * 0.4);
    let lo = Math.min(o, c) * Math.exp(-Math.abs(gauss()) * v * 0.45);
    const x = extra.get(d) || {};
    if (x.hi) hi = Math.max(hi, x.hi);
    hi = Math.max(Math.min(hi, CAP), o, c);
    if (x.lo) lo = Math.min(lo, x.lo);
    rows.push([o, hi, lo, c].map((p) => Math.round(p)));
  }
  return rows;
}

function fromCSV(file) {
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const head = lines.shift().toLowerCase().split(',');
  const col = (n) => head.findIndex((h) => h.trim() === n);
  const [iD, iO, iH, iL, iC] = ['date', 'open', 'high', 'low', 'close'].map(col);
  const rows = [];
  for (const l of lines) {
    const f = l.split(',');
    const d = dayOf(f[iD].trim().slice(0, 10));
    if (d < 0) continue;
    rows[d] = [iO, iH, iL, iC].map((i) => Math.round(parseFloat(f[i])));
  }
  return rows.filter(Boolean);
}

const csv = path.join(__dirname, 'data', 'btc-usd-daily.csv');
const real = fs.existsSync(csv);
const rows = real ? fromCSV(csv) : fromAnchors();
const out = `// generated by make-data.js (${real ? 'from data/btc-usd-daily.csv' : 'approximate, from anchors'}) — [open, high, low, close] per day from ${START}
(function () {
  const BTC = { start: '${START}', real: ${real}, days: ${JSON.stringify(rows)} };
  if (typeof module !== 'undefined') module.exports = BTC; else globalThis.BTC = BTC;
})();
`;
fs.writeFileSync(path.join(__dirname, 'btc-data.js'), out);
console.log(`wrote btc-data.js: ${rows.length} days (${real ? 'CSV' : 'anchors'}), last close ${rows[rows.length - 1][3]}`);
