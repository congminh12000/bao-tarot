// Builds btc-data.js (what the film and the music read) from the files in data/:
//
//   data/tradingview/*.csv   real daily candles exported from TradingView (any number of files; see data/README.md).
//                            Files are read in name order and a later file overrides earlier ones on the same day,
//                            so updating = export the recent months, drop the file in, run this script again.
//   data/anchors.csv         approximate closes at the turning points; ONLY used for days no TradingView file covers
//                            (the days in between are a seeded Brownian bridge, so the shape is right, single days are not)
//   data/events.csv          the market moments drawn on the chart and hit in the music
//   data/phases.csv          uptrend / downtrend / sideway / peak / bottom stretches (detect-phases.js), each given a cue
//                            from data/music.js
//
//   node make-data.js                      the whole history
//   FROM=2020-01-01 node make-data.js      only from that day (TO=yyyy-mm-dd to stop earlier)
//   PRE=180 (default)                      days before FROM shown behind the first candle (0 = none)
//   node make-data.js --strict             fails (exit 3) when a cue would repeat — before a final render
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
let firstTraded = null; // the first day with real volume (before it, index files carry flat reference prices)
const tvDir = path.join(DIR, 'tradingview');
const tvFiles = fs.existsSync(tvDir) ? fs.readdirSync(tvDir).filter((f) => f.toLowerCase().endsWith('.csv')).sort() : [];
for (const f of tvFiles) {
  const [head, ...lines] = csvRows(path.join(tvDir, f));
  const cols = head.toLowerCase().split(',').map((s) => s.trim().replace(/"/g, ''));
  const at = (n) => cols.findIndex((c) => c === n);
  const iT = at('time') >= 0 ? at('time') : at('date');
  const idx = [at('open'), at('high'), at('low'), at('close')], iV = at('volume');
  if (iT < 0 || idx.some((i) => i < 0)) { console.warn(`skip ${f}: needs time/date, open, high, low, close columns`); continue; }
  let n = 0;
  for (const l of lines) {
    const c = l.split(',').map((s) => s.trim().replace(/"/g, ''));
    const tv = c[iT];
    const date = /^\d+(\.\d+)?$/.test(tv) ? iso(parseFloat(tv) * (parseFloat(tv) > 1e11 ? 1 : 1000)) : iso(ms(tv));
    const v = idx.map((i) => parseFloat(c[i]));
    if (v.some((x) => !isFinite(x) || x <= 0)) continue;
    real.set(date, v); n++;
    if (iV >= 0 && parseFloat(c[iV]) > 0 && (!firstTraded || date < firstTraded)) firstTraded = date;
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
const FROM = process.env.FROM || firstTraded || all[0], TO = process.env.TO || all[all.length - 1];
const realDays = [...real.keys()].sort();
// the pre-run: up to PRE days before FROM (where data exists) are included too, so the chart is already running under
// the title; the film itself (music, phases, events, the closing card) starts at FROM, day index BTC.pre
const PRE_DAYS = process.env.PRE !== undefined ? +process.env.PRE : 180;
const START = [all[0], realDays[0] || all[0], iso(ms(FROM) - PRE_DAYS * DAY)].sort().pop();
const PRE = Math.max(0, Math.round((ms(FROM) - ms(START)) / DAY));
const days = [], src = [];
for (let t = ms(START); t <= ms(TO); t += DAY) {
  const d = iso(t);
  let r = real.get(d);
  if (!r && real.size && d > realDays[0] && d < realDays[realDays.length - 1]) {
    // a hole inside the TradingView data (an exchange outage): bridge the closes on either side, flat candles
    let a = t - DAY, b = t + DAY;
    while (!real.has(iso(a))) a -= DAY;
    while (!real.has(iso(b))) b += DAY;
    const ca = real.get(iso(a))[3], cb = real.get(iso(b))[0], u = (t - a) / (b - a);
    const c = Math.exp(Math.log(ca) + u * (Math.log(cb) - Math.log(ca)));
    r = [c, c, c, c];
  }
  if (!r) r = est.get(d);
  if (!r) continue;
  days.push(r); src.push(real.has(d) ? 1 : 0);
}
// an estimated day right after a real one opens where the real one closed
for (let i = 1; i < days.length; i++) if (!src[i]) { const o = days[i - 1][3]; days[i] = [o, Math.max(days[i][1], o), Math.min(days[i][2], o), days[i][3]]; }
const round = (p) => (p >= 100 ? Math.round(p) : +p.toPrecision(5));
const rows = days.map((r) => r.map(round));

// money in labels is short: $266, $1.2K, $19.8K, $109K, $41M, $1.5B ("$1,234,567" in the CSV is shortened here)
const money = (v) => {
  const [d, u] = v >= 1e9 ? [1e9, 'B'] : v >= 1e6 ? [1e6, 'M'] : v >= 1e3 ? [1e3, 'K'] : [1, ''];
  const x = v / d, r = x >= 100 || !u ? Math.round(x) : Math.round(x * 10) / 10;
  return v < 1 && !u ? `$${+v.toPrecision(2)}` : `$${r}${u}`;
};
const shortMoney = (t) => t.replace(/\$(\d{1,3}(?:,\d{3})+)(?![\d.,]*[KMB])/g, (_, n) => money(+n.replace(/,/g, '')));

// only hit 1 (important) and hit 2 (milestone / crisis) are shown; hit 0 rows are dropped
const events = csvRows(path.join(DIR, 'events.csv')).map((l) => {
  const p = l.split(','); // date,kind,hit,tag,text (tag: empty, or a special event such as halving)
  const tag = p[3].trim();
  return { date: p[0].trim(), kind: p[1].trim(), hit: +p[2], ...(tag ? { tag } : {}), text: shortMoney(p.slice(4).join(',').trim()) };
}).filter((e) => e.hit >= 1 && e.date >= FROM && e.date <= TO);

// market phases (data/phases.csv, from detect-phases.js): clipped to this range, with the cue each one plays
const LIB = require('./data/music');
const phFile = path.join(DIR, 'phases.csv');
// the cue is picked over the FULL list (round robin per type), so a FROM/TO preview plays the same music as the film
const seen = {};
const phases = fs.existsSync(phFile) ? csvRows(phFile).map((l) => { const [start, end, type] = l.split(','); return { start: start.trim(), end: end.trim(), type: type.trim() }; })
  .map((p) => { const k = (seen[p.type] = (seen[p.type] ?? -1) + 1); return { ...p, cue: LIB.pickCue(p.type, k).id }; })
  .filter((p) => p.end >= FROM && p.start <= TO)
  .map((p) => ({ start: p.start < FROM ? FROM : p.start, end: p.end > TO ? TO : p.end, type: p.type, cue: p.cue })) : [];
// no cue may repeat in the film: there must be at least as many approved cues of each type as phases of that type
// (the cue is picked round robin over the FULL list, so this holds for a FROM/TO preview too)
const short = Object.entries(seen).map(([type, k]) => ({ type, phases: k + 1, cues: LIB.cuesOf(type).length })).filter((x) => x.phases > x.cues);
for (const x of short) console.warn(`⚠ NOT ENOUGH MUSIC: ${x.phases} ${x.type} phases but ${x.cues} approved ${x.type} cues — ${x.phases - x.cues} would repeat.\n  Make ${x.phases - x.cues} more ${x.type} cue(s), send the user an audition, and render only once they are approved.`);
if (short.length && process.argv.includes('--strict')) process.exitCode = 3; // the final render runs `make-data.js --strict`
const nFilm = rows.length - PRE, nReal = src.slice(PRE).reduce((a, b) => a + b, 0);
const LAST = iso(ms(START) + (rows.length - 1) * DAY);
fs.writeFileSync(path.join(__dirname, 'btc-data.js'), `// generated by make-data.js — do not edit; edit data/ and run \`node make-data.js\`
// ${nFilm} days ${FROM} → ${LAST}: ${nReal} from TradingView, ${nFilm - nReal} estimated; plus ${PRE} pre-run days from ${START}
(function () {
  const BTC = { start: '${START}', pre: ${PRE}, days: ${JSON.stringify(rows)}, real: '${src.join('')}', events: ${JSON.stringify(events)}, phases: ${JSON.stringify(phases)} };
  if (typeof module !== 'undefined') module.exports = BTC; else globalThis.BTC = BTC;
})();
`);
fs.writeFileSync(path.join(DIR, 'btc-daily.csv'), 'date,open,high,low,close,source\n' +
  rows.slice(PRE).map((r, i) => `${iso(ms(FROM) + i * DAY)},${r.join(',')},${src[PRE + i] ? 'tv' : 'est'}`).join('\n') + '\n');
console.log(`btc-data.js: ${nFilm} days ${FROM} → ${LAST} (${nReal} TradingView, ${nFilm - nReal} estimated) + ${PRE} pre-run days, ${events.length} events, ${phases.length} phases`);
