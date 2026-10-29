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
// Data folder: the coin's (coin.js; Bitcoin = ./data). Also writes <data>/<symbol>-daily.csv: the merged candles with a `source` column (tv = TradingView, est = estimated).
const fs = require('fs');
const path = require('path');
const U = require('./engine/util');

const COIN = require('./coin'); // COIN=ETH … picks coins/ETH/ (default BTC, whose data stays in ./data)
const LINE = process.env.SHORT_STYLE === 'line';
if (process.env.SHORT_STYLE && !LINE) throw new Error('SHORT_STYLE must be line (omit for legacy candles)');
if (LINE && process.env.SHORT) throw new Error('Coin Trail uses FROM/TO and SHORT_PART, not legacy SHORT=<phase>');
const DIR = COIN.dataDir;
const EQUITY = COIN.assetClass === 'equity';
const eq = EQUITY ? require('./equity') : null;
if (EQUITY && (LINE || process.env.SHORT)) throw new Error('Equity v1 supports long candlestick films; equity Shorts require a separate review');
const marketSessions = EQUITY ? eq.readSessions(DIR) : null;
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
const anchors = (fs.existsSync(path.join(DIR, 'anchors.csv')) ? csvRows(path.join(DIR, 'anchors.csv')) : []).map((l) => { // optional
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
// SHORT=<n>: the n-th phase of phases.csv as a 9:16 short (shorts.md): from its turn to the next turn (that turn's candle
// included, so its label appears at the end), with ~2 months of the phase before behind the first candle
const SHORT_N = process.env.SHORT ? parseInt(process.env.SHORT, 10) : 0;
let SHORT = null;
if (SHORT_N) {
  const all_ = csvRows(path.join(DIR, 'phases.csv')).map((l) => { const [start, end, type] = l.split(','); return { start: start.trim(), end: end.trim(), type: type.trim() }; });
  const p = all_[SHORT_N - 1], next = all_[SHORT_N];
  if (!p) throw new Error(`SHORT=${SHORT_N}: phases.csv has ${all_.length} phases`);
  SHORT = { n: SHORT_N, type: p.type, start: p.start, end: next ? next.start : p.end, startTurn: SHORT_N > 1, endTurn: !!next };
}
const FROM = process.env.FROM || (SHORT && SHORT.start) || firstTraded || all[0], TO = process.env.TO || (SHORT && SHORT.end) || all[all.length - 1];
const realDays = [...real.keys()].sort();
// the pre-run: up to PRE days before FROM (where data exists) are included too, so the chart is already running under
// the title; the film itself (music, phases, events, the closing card) starts at FROM, day index BTC.pre
const PRE_DAYS = process.env.PRE !== undefined ? +process.env.PRE : SHORT ? 60 : 180;
const START = [all[0], realDays[0] || all[0], iso(ms(FROM) - PRE_DAYS * DAY)].sort().pop();
const PRE = Math.max(0, Math.round((ms(FROM) - ms(START)) / DAY));
const days = [], src = [], trading = [];
for (let t = ms(START); t <= ms(TO); t += DAY) {
  const d = iso(t);
  if (EQUITY) {
    const result = eq.slot(real, marketSessions, d);
    days.push(result.value); src.push(result.source); trading.push(result.trading);
    continue;
  }
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
for (let i = 1; i < days.length; i++) if (!src[i] && !EQUITY) { const o = days[i - 1][3]; days[i] = [o, Math.max(days[i][1], o), Math.min(days[i][2], o), days[i][3]]; }
const round = (p) => EQUITY ? +p.toFixed(6) : (p >= 100 ? Math.round(p) : +p.toPrecision(5));
const rows = days.map((r) => r.map(round));

// money in labels is short: $266, $1.2K, $19.8K, $109K, $41M, $1.5B ("$1,234,567" in the CSV is shortened here)
const money = (v) => {
  const [d, u] = v >= 1e9 ? [1e9, 'B'] : v >= 1e6 ? [1e6, 'M'] : v >= 1e3 ? [1e3, 'K'] : [1, ''];
  const x = v / d, r = x >= 100 || !u ? Math.round(x) : Math.round(x * 10) / 10;
  return v < 1 && !u ? `$${+v.toPrecision(2)}` : `$${r}${u}`;
};
const shortMoney = (t) => t.replace(/\$(\d{1,3}(?:,\d{3})+)(?![\d.,]*[KMB])/g, (_, n) => money(+n.replace(/,/g, '')));

// Explicit remove=true overrides level visibility in full films, previews and Shorts.
// All rows remain in events.csv and source audits; legacy files default to remove=false.
const storedEvents = require('./event-csv').readEvents(path.join(DIR, 'events.csv'));
const detailPath = path.join(DIR, 'event-details.json');
const details = EQUITY && fs.existsSync(detailPath) ? JSON.parse(fs.readFileSync(detailPath, 'utf8')) : {};
const mappedEvents = EQUITY ? storedEvents.map((e) => eq.anchorEvent(e, details[`${e.date}|${e.text}`], marketSessions)) : storedEvents;
const events = mappedEvents
  .filter((e) => !e.remove && e.hit >= (COIN.minVisibleHit ?? (COIN.symbol === 'BTC' ? 1 : 0)) &&
    (e.anchorDate || e.date) >= FROM && (e.anchorDate || e.date) <= TO && (!EQUITY || e.anchorDate))
  .map(({ remove, ...e }) => ({ ...e, text: shortMoney(e.text) }));
console.log(`  stored events: ${storedEvents.length}; remove=true: ${storedEvents.filter((e) => e.remove).length}`);

// market phases (data/phases.csv, from detect-phases.js): clipped to this range, with the cue each one plays
const LIB = require('./data/music');
const phFile = path.join(DIR, 'phases.csv');
// the cue is picked over the FULL list (round robin per type), so a FROM/TO preview plays the same music as the film
// another coin plays the same approved cues in its own shuffled order (seeded by its symbol, so it stays the same
// from one run to the next); Bitcoin keeps the library order (coin.json "musicShuffle")
const seen = {};
const seeded = (str) => { let h = 2166136261; for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return U.mulberry32(h >>> 0); };
const order = {};
for (const type of ['uptrend', 'downtrend']) {
  const list = LIB.cuesOf(type).slice();
  if (COIN.musicShuffle !== false) { const r = seeded(`${COIN.symbol}:${type}`); for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } }
  order[type] = list;
}
const pickCue = (type, k) => (order[type] && order[type].length ? order[type][k % order[type].length] : LIB.pickCue(type, k));
const allPhases = fs.existsSync(phFile) ? csvRows(phFile).map((l) => { const [start, end, type] = l.split(','); return { start: start.trim(), end: end.trim(), type: type.trim() }; })
  .map((p) => { const k = (seen[p.type] = (seen[p.type] ?? -1) + 1); return { ...p, cue: pickCue(p.type, k).id }; }) : [];
if (SHORT) SHORT.cue = allPhases[SHORT_N - 1].cue; // the same cue as this phase in the long film
const phases = allPhases
  .filter((p) => p.end >= FROM && p.start <= TO)
  .map((p) => ({ start: p.start < FROM ? FROM : p.start, end: p.end > TO ? TO : p.end, type: p.type, cue: p.cue }));
// no cue may repeat in the film: there must be at least as many approved cues of each type as phases of that type
// (the cue is picked round robin over the FULL list, so this holds for a FROM/TO preview too)
const short = Object.entries(seen).map(([type, k]) => ({ type, phases: k + 1, cues: LIB.cuesOf(type).length })).filter((x) => x.phases > x.cues);
for (const x of short) console.warn(`⚠ NOT ENOUGH MUSIC: ${x.phases} ${x.type} phases but ${x.cues} approved ${x.type} cues — ${x.phases - x.cues} would repeat.\n  Make ${x.phases - x.cues} more ${x.type} cue(s), send the user an audition, and render only once they are approved.`);
if (short.length && process.argv.includes('--strict')) process.exitCode = 3; // the final render runs `make-data.js --strict`
const nFilm = rows.length - PRE, nReal = src.slice(PRE).reduce((a, b) => a + b, 0);
const LAST = iso(ms(START) + (rows.length - 1) * DAY);
const earlierLows = EQUITY ? [...real.entries()].filter(([date]) => date < START).map(([, r]) => r[2]) : [];
const nClosed = EQUITY ? trading.slice(PRE).filter((v) => !v).length : 0;
// Isolated opt-in workspace: never overwrite the long film's data, daily CSV or music.
if (LINE) {
  if (process.exitCode) throw new Error('Not enough approved music');
  require('./line/build').build({ coin: COIN, start: START, pre: PRE, days: rows,
    real: src.join(''), rawDays: days, events, storedEvents, phases: allPhases, from: FROM, to: LAST });
  return;
}
fs.writeFileSync(path.join(__dirname, 'btc-data.js'), `// generated by make-data.js — do not edit; edit data/ and run \`node make-data.js\`
// ${nFilm} days ${FROM} → ${LAST}: ${nReal} from TradingView, ${nFilm - nReal - nClosed} estimated${EQUITY ? `, ${nClosed} closed-market slots (not candles)` : ''}; plus ${PRE} pre-run days from ${START}
(function () {
  const BTC = { coin: ${JSON.stringify({ symbol: COIN.symbol, name: COIN.name, pair: COIN.pair, logo: COIN.logo, logoNegative: COIN.logoNegative, logoGlow: COIN.logoGlow, colors: COIN.colors || {}, special: COIN.special, ...(EQUITY ? { assetClass: 'equity', timezone: COIN.timezone, priceAdjustment: COIN.priceAdjustment, minVisibleHit: COIN.minVisibleHit } : {}) })}, start: '${START}', pre: ${PRE}, days: ${JSON.stringify(rows)}, real: '${src.join('')}', ${EQUITY ? `sessions: '${trading.join('')}', historicalLowBeforeStart: ${earlierLows.length ? Math.min(...earlierLows) : 'null'}, eventReview: ${JSON.stringify(eq.reviewState(DIR))}, ` : ''}short: ${JSON.stringify(SHORT)}, events: ${JSON.stringify(events)}, phases: ${JSON.stringify(phases)} };
  if (typeof module !== 'undefined') module.exports = BTC; else globalThis.BTC = BTC;
})();
`);
fs.writeFileSync(path.join(DIR, `${COIN.symbol.toLowerCase()}-daily.csv`), 'date,open,high,low,close,source\n' +
  rows.slice(PRE).map((r, i) => `${iso(ms(FROM) + i * DAY)},${r.join(',')},${src[PRE + i] ? 'tv' : EQUITY ? 'closed' : 'est'}`).join('\n') + '\n');
console.log(`btc-data.js (${COIN.symbol}${SHORT ? ` SHORT ${SHORT.n} ${SHORT.type} ${SHORT.cue}` : ''}): ${nFilm} days ${FROM} → ${LAST} (${nReal} TradingView, ${nFilm - nReal - nClosed} estimated${EQUITY ? `, ${nClosed} closed slots` : ''}) + ${PRE} pre-run days, ${events.length} events, ${phases.length} phases`);
