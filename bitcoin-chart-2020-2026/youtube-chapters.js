// Prints the YouTube chapters of the full film (run on the FULL data: node make-data.js first):
//
//   node youtube-chapters.js
//
// Chapters (approved rules, youtube.md): every ALL-TIME HIGH and ALL-TIME LOW, every hit-2 event and every halving,
// each starting 3 s BEFORE its moment on screen; no years, no prices, no "today". All-time high / low are written ATH /
// ATL, followed by what sets that one apart from the others. YouTube wants the first chapter at
// 0:00 and every chapter at least 10 s long, so moments closer than 10 s share one chapter ("A · B").
// The names live in NAMES (by the event's date); a new event without a name gets its own text with prices removed.
const S = require('./score');

const LEAD = 3, MIN = 10;
const NAMES = { // ATH / ATL + what tells it apart from the others (no prices, no years)
  '2011-06-08': 'ATH: the first bubble',
  '2011-11-17': 'ATL: the first bubble bursts',
  '2012-11-28': 'First halving',
  '2013-04-10': 'ATH: the Cyprus crisis rally',
  '2013-11-29': 'ATH: the first great mania',
  '2014-02-24': 'Mt. Gox collapses',
  '2015-01-14': 'ATL: after Mt. Gox',
  '2016-07-09': 'Second halving',
  '2017-12-17': 'ATH: the ICO boom',
  '2018-12-15': 'ATL: the crypto winter',
  '2020-03-13': 'COVID crash',
  '2020-05-11': 'Third halving',
  '2020-12-16': 'Bitcoin breaks its previous peak',
  '2021-04-14': 'ATH: Coinbase goes public',
  '2021-05-19': 'China crypto ban',
  '2021-07-20': 'ATL: after the China ban',
  '2021-11-10': 'ATH: the second peak of the cycle',
  '2022-05-07': 'LUNA collapse',
  '2022-11-11': 'FTX bankruptcy',
  '2022-11-21': 'ATL: after FTX',
  '2024-01-10': 'Spot ETFs approved',
  '2024-03-14': 'ATH: the ETF rally',
  '2024-04-19': 'Fourth halving',
  '2024-12-05': 'Bitcoin crosses six figures',
  '2025-01-20': 'ATH: inauguration day',
  '2025-10-06': 'ATH: the cycle top',
  '2026-07-01': 'ATL: the cycle bottom',
};
const clean = (s) => s.replace(/\s*[:|]?\s*-?\$[\d.,]+[KMB]?/g, '').replace(/\b(19|20)\d\d\b/g, '').replace(/\s+/g, ' ').trim();
const name = (e) => NAMES[e.date] || clean(e.text.charAt(0) + e.text.slice(1).toLowerCase());

const moments = S.EVENTS.filter((e) => e.turn !== undefined || e.big || e.tag === 'halving')
  .map((e) => ({ t: Math.max(0, Math.floor(e.t - LEAD)), names: [name(e)] })).sort((a, b) => a.t - b.t);
const ch = [{ t: 0, names: ['The first trades'] }];
for (const m of moments) {
  const last = ch[ch.length - 1];
  if (m.t - last.t < MIN) last.names.push(...m.names); else ch.push(m);
}
if (S.DURATION - ch[ch.length - 1].t < MIN) { const l = ch.pop(); ch[ch.length - 1].names.push(...l.names); }
const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
for (const c of ch) console.log(`${fmt(c.t)} ${c.names.join(' · ')}`);
