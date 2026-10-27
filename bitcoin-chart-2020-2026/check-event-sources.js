// Checks that every event has a source (PROJECT.md §15): each row of events.csv needs at least one row in
// event-sources.csv next to it (`date,source,url,text`, date + text exactly as in events.csv), with a source name and
// an http(s) link. Also lists source rows that match no event (renamed or deleted events).
//   node check-event-sources.js            the current coin (COIN=<SYMBOL>, default BTC)
//   node check-event-sources.js --all      every coin in coins/
// Exit code 1 when an event has no source or a source row is broken.
const fs = require('fs');
const path = require('path');

const rows = (file) => fs.readFileSync(file, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

function check(symbol) {
  const coin = JSON.parse(fs.readFileSync(path.join(__dirname, 'coins', symbol, 'coin.json'), 'utf8'));
  const dir = path.join(__dirname, coin.dataDir || path.join('coins', symbol, 'data'));
  const evFile = path.join(dir, 'events.csv'), srcFile = path.join(dir, 'event-sources.csv');
  const events = rows(evFile).map((l) => { const p = l.split(','); return { date: p[0].trim(), text: p.slice(4).join(',').trim() }; });
  const sources = fs.existsSync(srcFile) ? rows(srcFile).map((l) => {
    const p = l.split(','); // date,source,url,text (source and url hold no comma; text may)
    return { date: (p[0] || '').trim(), source: (p[1] || '').trim(), url: (p[2] || '').trim(), text: p.slice(3).join(',').trim(), line: l };
  }) : [];
  const key = (e) => `${e.date}|${e.text}`;
  const have = new Map();
  for (const s of sources) have.set(key(s), (have.get(key(s)) || 0) + 1);
  const missing = events.filter((e) => !have.has(key(e)));
  const evKeys = new Set(events.map(key));
  const orphan = sources.filter((s) => !evKeys.has(key(s)));
  const broken = sources.filter((s) => !/^\d{4}-\d{2}-\d{2}$/.test(s.date) || !s.source || !/^https?:\/\/\S+$/.test(s.url));
  const rel = path.relative(__dirname, srcFile);
  console.log(`${symbol}: ${events.length} events, ${events.length - missing.length} with a source, ${missing.length} missing` +
    ` (${sources.length} source rows in ${fs.existsSync(srcFile) ? rel : rel + ' — file not found'})`);
  for (const e of missing) console.log(`  ✗ no source: ${e.date} ${e.text}`);
  for (const s of broken) console.log(`  ✗ broken row: ${s.line}`);
  for (const s of orphan) console.log(`  ⚠ matches no event: ${s.date} ${s.text}`);
  return missing.length + broken.length;
}

const all = process.argv.includes('--all');
const coins = all ? fs.readdirSync(path.join(__dirname, 'coins')).filter((d) => fs.existsSync(path.join(__dirname, 'coins', d, 'coin.json')))
  : [(process.env.COIN || 'BTC').toUpperCase()];
const bad = coins.reduce((n, c) => n + check(c), 0);
console.log(bad ? `✗ ${bad} problem(s): add a reliable source (name + link) or remove the event (PROJECT.md §15)` : '✓ every event has a source');
process.exit(bad ? 1 : 0);
