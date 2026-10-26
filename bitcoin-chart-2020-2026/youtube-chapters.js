// Prints the YouTube chapters of the full film (run on the FULL data: node make-data.js first):
//
//   node youtube-chapters.js
//
// Chapters (approved rules, youtube.md): every ALL-TIME HIGH and ALL-TIME LOW, every hit-2 event and every halving,
// each starting 3 s BEFORE its moment on screen; no years, no prices, no "today". All-time high / low are written ATH /
// ATL, followed by what sets that one apart from the others. YouTube wants the first chapter at
// 0:00 and every chapter at least 10 s long, so moments closer than 10 s share one chapter ("A · B").
// The names live in coins/<SYMBOL>/chapter-names.json (by the event's date); an event without a name gets its own text
// with prices and years removed.
const S = require('./score');

const LEAD = 3, MIN = 10;
const COIN = require('./coin'); // COIN=ETH node youtube-chapters.js for another coin
const NAMES = (() => { try { return require(`./${COIN.dir}/chapter-names.json`); } catch (e) { return {}; } })(); // by event date
const clean = (s) => s.replace(/\s*[:|]?\s*-?\$[\d.,]+[KMB]?/g, '').replace(/\b(19|20)\d\d\b/g, '').replace(/\s+/g, ' ').trim();
const name = (e) => NAMES[e.date] || clean(e.text.charAt(0) + e.text.slice(1).toLowerCase());

const moments = S.EVENTS.filter((e) => e.turn !== undefined || e.big || e.tag)
  .map((e) => ({ t: Math.max(0, Math.floor(e.t - LEAD)), names: [name(e)] })).sort((a, b) => a.t - b.t);
const ch = [{ t: 0, names: ['The first trades'] }];
for (const m of moments) {
  const last = ch[ch.length - 1];
  if (m.t - last.t < MIN) last.names.push(...m.names); else ch.push(m);
}
if (S.DURATION - ch[ch.length - 1].t < MIN) { const l = ch.pop(); ch[ch.length - 1].names.push(...l.names); }
const fmt = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
for (const c of ch) console.log(`${fmt(c.t)} ${c.names.join(' · ')}`);
