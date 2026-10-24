// Builds btc-data.js (what the film and the music read) from the files in data/:
//
//   data/tradingview/*.csv   real daily candles exported from TradingView (any number of files; see data/README.md).
//                            Files are read in name order and a later file overrides earlier ones on the same day,
//                            so updating = export the recent months, drop the file in, run this script again.
//   data/anchors.csv         approximate closes at the turning points; ONLY used for days no TradingView file covers
//                            (the days in between are a seeded Brownian bridge, so the shape is right, single days are not)
//   data/events.csv          the market moments drawn on the chart and hit in the music
//
//   node make-data.js                      the whole history
//   FROM=2020-01-01 node make-data.js      only from that day (TO=yyyy-mm-dd to stop earlier)
// Also writes data/btc-daily.csv: the merged candles with a `source` column (tv = TradingView, est = estimated).
const fs = require('fs');
const path = require('path');
const U = require('./engine/util');

const DIR = path.join(__dirname, 'data');
const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const ms = (s) => Date.parse(s.slice(0, 10) + 'T00:00:00Z');
const csvRows = (file) => fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));

// ---------- TradingView exports: "time,open,high,low,close[,Volume…]" with unix seconds or an ISO date ----------
const real = new Map(); // date -> [o, h, l, c]
const tvDir = path.join(DIR, 'tradingview');
const tvFiles = fs.existsSync(tvDir) ? fs.readdirSync(tvDir).filter((f) => f.toLowerCase().endsWith('.csv')).sort() : [];
for (const f of tvFiles) {
  const [head, ...lines] = csvRows(path.join(tvDir, f));
  const cols = head.toLowerCase().split(',').map((s) => s.trim().replace(/"/g, ''));
  const at = (n) => cols.findIndex((c) => c === n);
  const iT = at('time') >= 0 ? at('time') : at('date');
  const idx = [at('open'), at('high'), at('low'), at('close')];
  if (iT < 0 || idx.some((i) => i < 0)) { console.warn(`skip ${f}: needs time/date, open, high, low, close columns`); continue; }
  let n = 0;
  for (const l of lines) {
    const c = l.split(',').map((s) => s.trim().replace(/"/g, ''));
    const tv = c[iT];
    const date = /^\d+(\.\d+)?$/.test(tv) ? iso(parseFloat(tv) * (parseFloat(tv) > 1e11 ? 1 : 1000)) : iso(ms(tv));
    const v = idx.map((i) => parseFloat(c[i]));
    if (v.some((x) => !isFinite(x) || x <= 0)) continue;
    real.set(date, v); n++;
  }
  console.log(`  ${f}: ${n} days`);
}

// ---------- anchors -> estimated days ----------
const anchors = csvRows(path.join(DIR, 'anchors.csv')).map((l) => {
  const [d, c, hi, lo] = l.split(',');
  return { t: ms(d), c: +c, hi: hi ? +hi : 0, lo: lo ? +lo : 0 };
}).sort((a, b) => a.t - b.t);

const VOL = (y) => (y <= 2013 ? 0.055 : y <= 2015 ? 0.035 : y <= 2021 ? 0.034 : y === 2023 ? 0.019 : 0.024);
function estimate() {
  const rng = U.mulberry32(20100718);
  const gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += rng(); return (s - 3) / Math.sqrt(0.5); };
  const est = new Map();
  const CAP = Math.max(...anchors.map((a) => a.hi || a.c));
  const wick = new Map(anchors.map((a) => [iso(a.t), a]));
  let prev = null;
  for (let k = 0; k < anchors.length - 1; k++) {
    const a = anchors[k], b = anchors[k + 1], n = Math.round((b.t - a.t) / DAY);
    const walk = [0];
    for (let i = 1; i <= n; i++) walk.push(walk[i - 1] + gauss() * VOL(new Date(a.t + i * DAY).getUTCFullYear()) * 0.85);
    for (let i = k ? 1 : 0; i <= n; i++) {
      const u = i / n, d = iso(a.t + i * DAY);
      const base = Math.log(a.c) + u * (Math.log(b.c) - Math.log(a.c));
      const top = Math.log(Math.max(a.c, b.c) * 1.025) - base, bot = base - Math.log(Math.min(a.c, b.c) * 0.95);
      const br = walk[i] - u * walk[n];
      const x = br >= 0 ? top * Math.tanh(br / Math.max(top, 1e-4)) : -bot * Math.tanh(-br / Math.max(bot, 1e-4));
      let c = Math.exp(base + x);
      if (!wick.has(d)) c = Math.min(c, CAP * 0.985);
      const o = prev === null ? c * 0.995 : prev, v = VOL(new Date(a.t + i * DAY).getUTCFullYear());
      let h = Math.max(o, c) * Math.exp(Math.abs(gauss()) * v * 0.4), l = Math.min(o, c) * Math.exp(-Math.abs(gauss()) * v * 0.4);
      const w = wick.get(d);
      if (w && w.hi) h = Math.max(h, w.hi);
      if (w && w.lo) l = Math.min(l, w.lo);
      h = Math.max(Math.min(h, CAP), o, c);
      est.set(d, [o, h, l, c]);
      prev = c;
    }
  }
  return est;
}
const est = estimate();

// ---------- merge: TradingView wins, estimates fill the gaps ----------
const all = [...new Set([...est.keys(), ...real.keys()])].sort();
const FROM = process.env.FROM || all[0], TO = process.env.TO || all[all.length - 1];
const days = [], src = [];
for (let t = ms(FROM); t <= ms(TO); t += DAY) {
  const d = iso(t);
  const r = real.get(d) || est.get(d);
  if (!r) continue;
  days.push(r); src.push(real.has(d) ? 1 : 0);
}
// an estimated day right after a real one opens where the real one closed
for (let i = 1; i < days.length; i++) if (!src[i]) { const o = days[i - 1][3]; days[i] = [o, Math.max(days[i][1], o), Math.min(days[i][2], o), days[i][3]]; }
const round = (p) => (p >= 100 ? Math.round(p) : +p.toPrecision(5));
const rows = days.map((r) => r.map(round));

const events = csvRows(path.join(DIR, 'events.csv')).map((l) => {
  const p = l.split(',');
  return { date: p[0].trim(), kind: p[1].trim(), hit: +p[2], text: p.slice(3).join(',').trim() };
}).filter((e) => e.date >= FROM && e.date <= TO);

const nReal = src.reduce((a, b) => a + b, 0);
fs.writeFileSync(path.join(__dirname, 'btc-data.js'), `// generated by make-data.js — do not edit; edit data/ and run \`node make-data.js\`
// ${rows.length} days ${FROM} → ${iso(ms(FROM) + (rows.length - 1) * DAY)}: ${nReal} from TradingView, ${rows.length - nReal} estimated
(function () {
  const BTC = { start: '${FROM}', days: ${JSON.stringify(rows)}, real: '${src.join('')}', events: ${JSON.stringify(events)} };
  if (typeof module !== 'undefined') module.exports = BTC; else globalThis.BTC = BTC;
})();
`);
fs.writeFileSync(path.join(DIR, 'btc-daily.csv'), 'date,open,high,low,close,source\n' +
  rows.map((r, i) => `${iso(ms(FROM) + i * DAY)},${r.join(',')},${src[i] ? 'tv' : 'est'}`).join('\n') + '\n');
console.log(`btc-data.js: ${rows.length} days ${FROM} → ${iso(ms(FROM) + (rows.length - 1) * DAY)} (${nReal} TradingView, ${rows.length - nReal} estimated), ${events.length} events`);
