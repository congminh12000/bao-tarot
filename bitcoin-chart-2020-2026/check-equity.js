// No rendering: exchange sessions, quarterly coverage, citations and review readiness.
const fs = require('fs'), path = require('path'), assert = require('node:assert/strict');
const coin = require('./coin'), E = require('./equity');
assert.equal(coin.assetClass, 'equity', 'COIN must select an equity');
const events = require('./event-csv').readEvents(path.join(coin.dataDir, 'events.csv'));
const details = JSON.parse(fs.readFileSync(path.join(coin.dataDir, 'event-details.json')));
const coverage = JSON.parse(fs.readFileSync(path.join(coin.dataDir, 'quarter-coverage.json')));
const audit = JSON.parse(fs.readFileSync(path.join(coin.dataDir, 'price-audit.json')));
const sessions = E.readSessions(coin.dataDir);
const filingAudit = JSON.parse(fs.readFileSync(path.join(coin.dataDir, 'quarter-filings-audit.json')));
assert.equal(audit.adjustment, 'splits'); assert.equal(audit.missingSessions.length, 0); assert.equal(audit.unexpectedSessions.length, 0);
assert.equal(audit.candles, [...sessions.keys()].filter((d) => d >= audit.range[0] && d <= audit.range[1]).length);
for (const e of events) {
  const d = details[`${e.date}|${e.text}`]; assert.ok(d, 'Missing research detail: ' + e.text);
  assert.ok(d.sources.length >= 2, 'At least two documents per research row');
  const mapped = E.anchorEvent(e, d, sessions);
  if (!e.remove) { assert.ok(mapped.anchorDate && sessions.has(mapped.anchorDate)); assert.ok(e.hit >= 1); }
  if (!e.remove) assert.ok(d.sources.filter((s) => s.checked === true).length >= 2, 'Two checked documents required: ' + e.text);
}
const expectedQuarters = [];
for (let y = Number(audit.range[0].slice(0, 4)); y <= Number(audit.range[1].slice(0, 4)); y++)
  for (let q = 1; q <= 4; q++) {
    const end = new Date(Date.UTC(y, q * 3, 0)).toISOString().slice(0, 10);
    if (end >= audit.range[0] && end <= audit.range[1]) expectedQuarters.push(`${y}Q${q}`);
  }
assert.deepEqual(coverage.map((q) => q.quarter), expectedQuarters, 'Quarter coverage must be contiguous, without gaps or duplicates');
assert.deepEqual(filingAudit.map((q) => q.quarter), expectedQuarters, 'Every quarter needs a checked matching-period filing');
for (const f of filingAudit) {
  const q = coverage.find((q) => q.quarter === f.quarter);
  const d = details[`${q.earnings.date}|${q.earnings.event}`];
  assert.equal(f.expectedPeriodEnd, new Date(Date.UTC(Number(f.quarter.slice(0, 4)), Number(f.quarter.at(-1)) * 3, 0)).toISOString().slice(0, 10));
  assert.equal(f.actualPeriodEnd, f.expectedPeriodEnd, 'Wrong-period SEC filing: ' + f.quarter);
  assert.ok(d.sources.some((s) => s.url === f.url && s.sha256 === f.sha256 && s.checked), 'Filing evidence stale: ' + f.quarter);
}
const tvFiles = fs.readdirSync(path.join(coin.dataDir, 'tradingview')).filter((f) => f.endsWith('.csv')).sort();
const real = new Map();
for (const file of tvFiles) for (const line of fs.readFileSync(path.join(coin.dataDir, 'tradingview', file), 'utf8').trim().split(/\r?\n/).slice(1)) {
  const [date, ...values] = line.split(','); real.set(date, values.slice(0, 4).map(Number));
}
assert.equal(real.size, audit.candles, 'Price audit stale: source count changed');
assert.deepEqual([...real.keys()].sort().filter((d) => !sessions.has(d)), []);
for (const date of sessions.keys()) if (date >= audit.range[0] && date <= audit.range[1]) E.slot(real, sessions, date);
for (const [file, hash] of Object.entries(audit.inputHashes || {}))
  assert.equal(require('crypto').createHash('sha256').update(fs.readFileSync(path.join(coin.dataDir, file))).digest('hex'), hash, 'Stale price audit: ' + file);
assert.ok(Object.keys(audit.inputHashes || {}).length >= 2, 'Price audit must bind both price providers');
for (const q of coverage) {
  assert.equal(q.earnings.status, 'verified');
  assert.ok(events.some((e) => !e.remove && e.date === q.earnings.date && e.text === q.earnings.event));
  if (q.deliveries.status === 'separate_release_verified') assert.ok(events.some((e) => !e.remove && e.date === q.deliveries.date && e.text === q.deliveries.event));
  else assert.ok(q.deliveries.note, 'Every absent separate delivery release needs an explicit limit');
}
const review = E.reviewState(coin.dataDir);
if (process.argv.includes('--strict')) assert.equal(review.status, 'approved', 'Concrete event list must be approved before rendering');
console.log(JSON.stringify({ symbol: coin.symbol, sessions: sessions.size, stored: events.length, kept: events.filter((e) => !e.remove).length,
  quarters: coverage.length, separateDeliveryReleases: coverage.filter((q) => q.deliveries.status === 'separate_release_verified').length,
  crossProviderDifferences: audit.comparison['differencesOver0.5Percent'].length, review: review.status }, null, 2));
