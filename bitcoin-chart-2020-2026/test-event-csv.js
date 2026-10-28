const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseEvents } = require('./event-csv');
const header = '# date,kind,hit,tag,text,remove\n';

test('explicit removal remains distinct from a false string and preserves research', () => {
  const events = parseEvents(header + '2026-01-01,info,0,,Release,true\n2026-01-02,info,0,,Keep,false\n');
  assert.equal(events.length, 2);
  assert.deepEqual(events.map((e) => e.remove), [true, false]);
  assert.deepEqual(events.filter((e) => !e.remove).map((e) => e.text), ['Keep']);
});

test('legacy five-column data retains visibility and comma-containing labels', () => {
  const [e] = parseEvents('# date,kind,hit,tag,text\n2026-01-01,up,2,upgrade,Milestone: $1,234\n');
  assert.deepEqual(e, { date: '2026-01-01', kind: 'up', hit: 2, tag: 'upgrade', text: 'Milestone: $1,234', remove: false });
});

test('current schema preserves quoted commas and escaped quotes', () => {
  const [e] = parseEvents(header + '2026-01-01,info,1,,"Says ""approved"", not activated",false\r\n');
  assert.equal(e.text, 'Says "approved", not activated');
  assert.equal(e.remove, false);
});

test('malformed flags fail with location instead of silently hiding or showing events', () => {
  for (const flag of ['', 'yes', '0', '1', 'tru']) {
    assert.throws(() => parseEvents(header + `2026-01-01,info,0,,Event,${flag}\n`, 'fixture.csv'), /fixture.csv:2: remove must be true or false/);
  }
  assert.throws(() => parseEvents(header + '2026-01-01,info,0,,Event\n'), /remove must be true or false/);
});

test('removing and re-enabling a row does not rewrite its date, label or level', () => {
  const raw = header + '2026-01-01,down,2,,Important event,true\n';
  const [removed] = parseEvents(raw), [restored] = parseEvents(raw.replace(',true\n', ',false\n'));
  const { remove: a, ...before } = removed, { remove: b, ...after } = restored;
  assert.equal(a, true);
  assert.equal(b, false);
  assert.deepEqual(after, before);
});
