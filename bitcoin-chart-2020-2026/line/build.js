// Build review manifests and self-contained renderer workspaces without touching long data/audio.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const C = require('./core');
const ROOT = path.resolve(__dirname, '..');
const DAY = 86400000;
const dateMs = (s) => Date.parse(s + 'T00:00:00Z');
const dateAt = (start, i) => new Date(dateMs(start) + i * DAY).toISOString().slice(0, 10);
const digest = (v) => crypto.createHash('sha256').update(v).digest('hex');
const eventId = (e) => `${e.date}:${digest(`${e.kind}|${e.text}`).slice(0, 12)}`;
function readSources(dir) {
  return fs.readFileSync(path.join(dir, 'event-sources.csv'), 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#')).map((l) => {
    const [date, source, url, ...text] = l.split(','); return { date, source, url, text: text.join(',') };
  });
}
function caption(e, overrides) {
  if (e.turn) return e.turn;
  const value = overrides[eventId(e)] || overrides[`${e.date}|${e.text}`];
  if (value) return value.toUpperCase();
  // Reviewable fallback, never changes the canonical label. Authors can override by stable ID.
  const words = e.text.toUpperCase().replace(/[;:]/g, '').split(/\s+/);
  let result = '';
  for (const word of words) { if ((result + ' ' + word).trim().length > 24) break; result = (result + ' ' + word).trim(); }
  return result === words.join(' ') ? result : result.slice(0, 23) + '…';
}
function collect(input, overrides = {}) {
  const sources = readSources(input.coin.dataDir);
  const events = input.storedEvents.filter((e) => !e.remove && e.hit >= (input.coin.symbol === 'BTC' ? 1 : 0)
    && e.date >= input.from && e.date <= input.to).map((e) => {
    const original = e;
    const refs = sources.filter((s) => s.date === original.date && s.text === original.text);
    if (!refs.length) throw new Error(`Missing citations: ${e.date} ${e.text}`);
    return { ...e, text: original.text, id: eventId(original), remove: false, sources: refs, generated: false };
  });
  input.phases.forEach((p, i) => {
    if (!i || p.start < input.from || p.start > input.to) return;
    const top = p.type === 'downtrend', turn = top ? 'ATH' : 'ATL', name = top ? 'ALL-TIME HIGH' : 'ALL-TIME LOW';
    const own = events.find((e) => e.date === p.start && e.text.toUpperCase().startsWith(name) && e.kind === (top ? 'up' : 'down'));
    if (own) { own.turn = turn; own.hit = 2; }
    else events.push({ id: `${p.start}:${turn}`, date: p.start, text: name, kind: top ? 'up' : 'down', hit: 2,
      turn, remove: false, generated: true, sources: [{ source: 'TradingView', url: `https://www.tradingview.com/symbols/${input.coin.tradingview.replace(':', '-')}/`, text: `${input.coin.tradingview} daily ${top ? 'high' : 'low'}` }] });
  });
  events.forEach((e) => { e.caption = caption(e, overrides); if (!e.caption || e.caption.length > 32) throw new Error(`Caption must be 1–32 characters: ${e.id}`); });
  const priority = (e) => e.turn ? 0 : e.tag ? 1 : 4 - e.hit;
  return events.sort((a, b) => a.date.localeCompare(b.date) || priority(a) - priority(b) || a.id.localeCompare(b.id));
}
function pricesFor(input, from, to, events) {
  const turns = new Map(events.filter((e) => e.turn).map((e) => [e.date, e.turn]));
  return input.days.flatMap((row, i) => {
    const date = dateAt(input.start, i);
    if (date < from || date > to) return [];
    const field = turns.get(date) === 'ATH' ? 'high' : turns.get(date) === 'ATL' ? 'low' : 'close';
    return [{ date, price: row[{ high: 1, low: 2, close: 3 }[field]], field,
      rawPrice: input.rawDays[i][{ high: 1, low: 2, close: 3 }[field]], source: input.real[i] === '1' ? 'tv' : 'est' }];
  });
}
function makePart(input, selected, from, target) {
  const events = selected.map((e) => ({ ...e }));
  const prices = pricesFor(input, from, events.at(-1).date, events);
  if (!prices.length || prices[0].date !== from || events.some((e) => !prices.some((p) => p.date === e.date))) throw new Error('Date range contains unavailable prices');
  const path = C.pathFor(prices, events), timing = C.schedule(path, events, target);
  const firstPhase = input.phases.filter((p) => p.start <= from).at(-1);
  if (!firstPhase) throw new Error(`Missing phase for ${from}`);
  const cues = [{ ...firstPhase, t: 0 }];
  events.filter((e) => e.turn && e.date > from).forEach((e) => { const p = input.phases.find((p) => p.start === e.date); cues.push({ ...p, t: e.t }); });
  events.forEach((e) => { e.cue = cues.filter((p) => p.t <= e.t + 1e-9).at(-1).cue; });
  const { dataDir, ...publicCoin } = input.coin;
  return { version: 1, style: 'line', coin: publicCoin, from, to: events.at(-1).date, requestedTo: input.to,
    startPrice: prices[0].price, events, path, cues, ...timing, endHold: 1, boundaryContext: [], approval: 'pending' };
}
function partition(input, events, target, count = 0) {
  if (!events.length) throw new Error('No eligible bubbles in requested range');
  const groups = []; let group = [], from = input.from;
  for (const e of events) {
    try { makePart(input, [...group, e], from, 60); group.push(e); }
    catch (error) {
      if (!/exceeds 60/.test(error.message) || !group.length) throw error;
      groups.push({ from, events: group }); from = e.date; group = [e];
    }
  }
  groups.push({ from, events: group });
  if (count && (count < groups.length || count > events.length)) throw new Error(`SHORT_PARTS must be ${groups.length}–${events.length}; never drop bubbles`);
  while (groups.length < count) {
    const i = groups.reduce((best, g, j) => g.events.length > groups[best].events.length ? j : best, 0);
    const g = groups[i], mid = Math.ceil(g.events.length / 2), tail = g.events.splice(mid);
    groups.splice(i + 1, 0, { from: tail[0].date, events: tail });
  }
  return groups.map((g, i) => ({ ...makePart(input, g.events, g.from, target), part: i + 1, parts: groups.length }));
}
function review(parts) {
  return `# ${parts[0].coin.symbol} Coin Trail — review pending\n\nNo frames or videos rendered. Each row has remove=false. Generated turns use TradingView high/low; other rows retain long-film classifications.\n\n` + parts.map((p) => {
    const rows = p.events.map((e, i) => `| ${i + 1} | ${e.date} | ${e.turn || e.hit}${e.tag ? ` / ${e.tag}` : ''} | ${e.text.replace(/\|/g, '/')} | ${e.caption} | $${e.price} (${e.priceField}/${e.priceSource}) | ${e.t.toFixed(3)} | ${e.sources.map((s) => `[${s.source}](${s.url})`).join(' · ')} |`).join('\n');
    return `## Part ${p.part}/${p.parts}: ${p.from} → ${p.to} · ${p.duration}s\n\nCues: ${p.cues.map((c) => `${c.cue} @ ${c.t.toFixed(3)}s`).join(' → ')}. Final hold: 1s.\n\nContent hash: \`${p.contentHash}\`.\n\n| # | Date | Level/type | Original label | Shorts caption | Source price | Contact (s) | Sources |\n|---|---|---|---|---|---|---|---|\n${rows}\n`;
  }).join('\n');
}
function workspace(part, dir) {
  fs.mkdirSync(dir, { recursive: true });
  fs.rmSync(path.join(dir, 'render-approval.json'), { force: true });
  // Real copies: renderer's safe HTTP server deliberately rejects symlinks outside ROOT.
  for (const folder of ['engine', 'assets']) fs.cpSync(path.join(ROOT, folder), path.join(dir, folder), { recursive: true });
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'data/music.js'), path.join(dir, 'data/music.js'));
  for (const file of ['song.js', 'keep-render.js']) fs.copyFileSync(path.join(ROOT, file), path.join(dir, file));
  fs.mkdirSync(path.join(dir, path.dirname(part.coin.logo)), { recursive: true });
  fs.copyFileSync(path.join(ROOT, part.coin.logo), path.join(dir, part.coin.logo));
  fs.copyFileSync(path.join(__dirname, 'core.js'), path.join(dir, 'line-core.js'));
  fs.copyFileSync(path.join(__dirname, 'score.js'), path.join(dir, 'score.js'));
  fs.copyFileSync(path.join(__dirname, 'film.js'), path.join(dir, 'film.js'));
  fs.copyFileSync(path.join(__dirname, 'sfx.js'), path.join(dir, 'line-sfx.js'));
  fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(dir, 'index.html'));
  fs.writeFileSync(path.join(dir, 'look.js'), '// Coin Trail uses coin palette directly.\n');
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(part, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'manifest.js'), `globalThis.TRAIL = ${JSON.stringify(part)};\n`);
  fs.writeFileSync(path.join(dir, 'btc-data.js'), `module.exports = ${JSON.stringify({ start: part.from, pre: 0, days: part.path.filter((p) => !p.presentation).map((p) => [p.price, p.price, p.price, p.price]) })};\n`);
}
function build(input) {
  const target = +(process.env.SHORT_SECONDS || 45), count = +(process.env.SHORT_PARTS || 0), selected = +(process.env.SHORT_PART || 0);
  if (!Number.isFinite(target) || target < 35 || target > 60) throw new Error('SHORT_SECONDS must be 35–60');
  if (![count, selected].every((n) => Number.isInteger(n) && n >= 0)) throw new Error('SHORT_PART(S) must be nonnegative integers');
  const capFile = path.join(input.coin.dataDir, 'short-captions.json');
  const overrides = fs.existsSync(capFile) ? JSON.parse(fs.readFileSync(capFile, 'utf8')) : {};
  const events = collect(input, overrides), parts = partition(input, events, target, count);
  if (selected > parts.length) throw new Error(`Only ${parts.length} parts`);
  const dir = path.join(ROOT, 'out/coin-trail', input.coin.symbol, `${input.from}_${input.to}`);
  fs.mkdirSync(dir, { recursive: true });
  const provenance = {
    tradingview: input.coin.tradingview,
    files: [path.join(input.coin.dataDir, 'events.csv'), path.join(input.coin.dataDir, 'event-sources.csv'), path.join(input.coin.dataDir, 'phases.csv'),
      ...fs.readdirSync(path.join(input.coin.dataDir, 'tradingview')).filter((f) => f.endsWith('.csv')).sort().map((f) => path.join(input.coin.dataDir, 'tradingview', f))]
      .map((f) => ({ path: path.relative(ROOT, f), sha256: digest(fs.readFileSync(f)) })),
    pricePolicy: 'Same rounded prices as long; rawPrice retained for traceability. est explicitly marked.'
  };
  for (const part of parts) {
    part.provenance = provenance;
    // The existing song uses one shared harmony table; reuse it without changing long score.
    part.harmony = require('../score').CH;
    part.contentHash = digest(JSON.stringify(part));
    if (!selected || selected === part.part) workspace(part, path.join(dir, `part-${part.part}`));
  }
  fs.writeFileSync(path.join(dir, 'review.md'), review(parts));
  fs.writeFileSync(path.join(dir, 'parts.json'), JSON.stringify(parts, null, 2) + '\n');
  console.log(`Coin Trail: ${events.length} bubbles, ${parts.length} part(s). Review BEFORE rendering: ${path.relative(ROOT, dir)}/review.md`);
  return { parts, dir };
}
module.exports = { build, collect, partition, makePart, eventId, review, pricesFor };
