// Non-rendering checks: data fidelity, continuous curve, collision/HUD, splitting, adapter and SFX.
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const C = require('./core');
const B = require('./build');
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'out/coin-trail/DOGE/2021-01-01_2022-11-11');
const parts = JSON.parse(fs.readFileSync(path.join(dir, 'parts.json')));
const p = parts[0];
assert.equal(parts.length, 1); assert.equal(p.events.length, 18); assert.equal(p.events.filter((e) => e.turn).length, 2);
assert.equal(p.cues.length, 3); assert.equal(p.duration, 45);
const stored = require('../event-csv').readEvents(path.join(root, 'coins/DOGE/data/events.csv'));
const selected = stored.filter((e) => !e.remove && e.date >= p.from && e.date <= p.to);
assert.equal(selected.length, 16);
assert.deepEqual(p.events.filter((e) => !e.generated).map((e) => e.text).sort(), selected.map((e) => e.text).sort());
for (const e of p.events) {
  assert.equal(e.remove, false); assert.ok(e.sources.length); assert.ok(e.readSeconds + 1e-9 >= C.budget(e));
  const source = p.path.find((n) => n.date === e.date); assert.equal(e.price, source.price);
  assert.equal(e.priceField, source.field); assert.equal(e.priceSource, 'tv');
  const f = C.frame(p, e.t), distance = Math.hypot(f.head.x - e.cx, f.head.y - e.cy);
  assert.ok(Math.abs(distance - (e.diameter / 2 + C.LOGO_R)) < 1e-6, 'exact tangency at contact');
  assert.ok(Math.hypot(C.frame(p, e.t - 1 / 600).head.x - e.cx, C.frame(p, e.t - 1 / 600).head.y - e.cy) > distance, 'no early contact');
  assert.equal(f.hud.date, e.date); assert.equal(f.hud.price, e.price);
  const early = C.frame(p, e.t - e.readSeconds), earlyPos = C.screen({ x: e.cx, y: e.cy }, early);
  assert.ok(earlyPos.x + e.diameter / 2 <= 890 + 1e-6 && earlyPos.x - e.diameter / 2 >= 46, 'full reading approach visible');
  const s = C.screen({ x: e.cx, y: e.cy }, f), r = e.diameter / 2;
  assert.ok(s.x - r >= 46 && s.x + r <= 890 && s.y - r >= 560 && s.y + r <= 1450, 'safe bubble at collision');
}
const same = p.events.filter((e) => e.date === '2021-05-08');
assert.equal(same.length, 2); assert.equal(same[0].turn, 'ATH'); assert.ok(same[1].t > same[0].t + C.budget(same[1]));
assert.equal(same[0].price, same[1].price); assert.equal(same[0].priceField, 'high');
for (let i = 0; i < p.path.length - 1; i++) {
  const a = p.path[i], b = p.path[i + 1], delta = (b.y - a.y) / (b.x - a.x);
  assert.ok(b.x > a.x);
  // Exact derivative is a quadratic Bezier; bounding its controls bounds every tangent.
  for (const derivative of [a.m, 3 * delta - a.m - b.m, b.m]) assert.ok(Math.abs(derivative) <= 1 + 1e-9);
  for (let j = 0; j <= 10; j++) {
    const y = C.atX(p.path, a.x + (b.x - a.x) * j / 10).y;
    assert.ok(y >= Math.min(a.y, b.y) - 1e-7 && y <= Math.max(a.y, b.y) + 1e-7, 'no price overshoot');
  }
}
for (let i = 1; i < p.events.length; i++) {
  const a = p.events[i - 1], b = p.events[i];
  assert.ok(Math.hypot(a.cx - b.cx, a.cy - b.cy) > (a.diameter + b.diameter) / 2 + 24);
  const hud = C.hudAt(p, (a.t + b.t) / 2); assert.equal(hud.date, a.date); assert.equal(hud.price, a.price);
}
assert.equal(C.xAt(p, p.duration - 1), p.events.at(-1).x);
assert.equal(C.xAt(p, p.duration), p.events.at(-1).x);
const times = Array.from({ length: 180 }, (_, i) => i * 0.25);
const serial = times.map((t) => C.frame(p, t));
assert.deepEqual([...times].reverse().map((t) => C.frame(p, t)).reverse(), serial, 'seek/order determinism');
for (let i = 1; i < serial.length; i++) assert.ok(serial[i].head.x >= serial[i - 1].head.x);
// Dense synthetic history, including many events on one date: preserve every ID.
const fixture = { coin: { symbol: 'TEST', dataDir: '' }, start: '2021-01-01', from: '2021-01-01', to: '2021-01-03',
  days: [[1, 2, .5, 1], [1, 2, .5, 1.5], [1, 2, .5, 1]], rawDays: [[1, 2, .5, 1], [1, 2, .5, 1.5], [1, 2, .5, 1]], real: '111',
  phases: [{ start: '2020-01-01', end: '2022-01-01', type: 'uptrend', cue: 'up-vanguard' }] };
const dense = Array.from({ length: 100 }, (_, i) => ({ id: 'event-' + i, date: '2021-01-02', hit: i % 3, text: 'test', caption: 'TEST' }));
const split = B.partition(fixture, dense, 45);
assert.ok(split.length > 1); assert.deepEqual(split.flatMap((p) => p.events.map((e) => e.id)), dense.map((e) => e.id));
assert.ok(split.every((p) => p.duration <= 60 && p.duration >= 35));
assert.throws(() => B.partition(fixture, dense, 45, 1), /SHORT_PARTS/);
// Source-backed fixtures: authored-turn dedup, per-coin visibility, retained remove flags.
const temp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'trail-sources-'));
try {
  const rows = [
    { date: '2021-01-02', kind: 'up', hit: 2, text: 'ALL-TIME HIGH: test', remove: false },
    { date: '2021-01-02', kind: 'info', hit: 0, text: 'SMALL', remove: false },
    { date: '2021-01-02', kind: 'info', hit: 1, text: 'IMPORTANT', remove: false },
    { date: '2021-01-02', kind: 'info', hit: 2, text: 'REMOVED', remove: true }
  ];
  fs.writeFileSync(path.join(temp, 'event-sources.csv'), '# date,source,url,text\n' + rows.map((e) => `${e.date},Official,https://example.org,${e.text}`).join('\n'));
  const data = { ...fixture, coin: { symbol: 'DOGE', dataDir: temp, tradingview: 'CRYPTO:DOGEUSD' }, storedEvents: rows,
    phases: [{ start: '2021-01-01', type: 'uptrend' }, { start: '2021-01-02', type: 'downtrend' }] };
  const alt = B.collect(data);
  assert.equal(alt.length, 3); assert.equal(alt.filter((e) => e.turn).length, 1); assert.equal(alt[0].turn, 'ATH');
  assert.ok(alt.every((e) => !e.generated && !e.remove));
  const btc = B.collect({ ...data, coin: { ...data.coin, symbol: 'BTC' } });
  assert.equal(btc.length, 2); assert.ok(btc.every((e) => e.hit >= 1));
  assert.equal(rows.at(-1).remove, true, 'Never mutate stored removal decisions');
  assert.throws(() => B.collect({ ...data, storedEvents: [...rows, { date: '2021-01-02', text: 'NO SOURCE', hit: 1 }] }), /Missing citations/);
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
const calls = [], stub = new Proxy({}, { get: (_, name) => (...args) => ({ name, args }) });
for (const e of p.events) require('./sfx').add({ h: e, fx: { addMono: (...a) => calls.push([e.id, ...a]) }, drums: { addMono: (...a) => calls.push([e.id, ...a]) }, instruments: stub });
for (const e of p.events) assert.equal(Math.min(...calls.filter((c) => c[0] === e.id).map((c) => c[2])), e.t);
const browser = { globalThis: { CoinTrail: C, TRAIL: structuredClone(p), MUSIC: require('../engine/music'), MUSIC_LIBRARY: require('../data/music') } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'score.js'), 'utf8'), browser);
const score = require(path.join(dir, 'part-1/score.js'));
assert.equal(browser.globalThis.SCORE.DURATION, score.DURATION);
assert.deepEqual(JSON.parse(JSON.stringify(browser.globalThis.SCORE.markers)), score.markers);
for (const cue of score.PHASES) {
  assert.ok(Math.abs(score.TB(cue.q0) - cue.t) < 1e-7);
  assert.ok(Math.abs(score.TB(cue.q1) - cue.t1) < 1e-7);
  assert.equal(score.clock.beatAt(cue.t + .1), 60 / cue.c.bpm);
}
const context = { globalThis: { CoinTrail: C, SCORE: { LINE: p }, Studio: { film: () => {} } } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'film.js'), 'utf8'), context);
const measure = { font: '', measureText(value) { return { width: value.length * parseFloat(/(\d+)px/.exec(this.font)[1]) * .6 }; } };
for (const e of p.events) {
  const cap = context.globalThis.TrailScene.captionLines(measure, e.caption, e.diameter);
  assert.ok(cap.lines.length <= 3 && cap.size >= 25);
  assert.ok(cap.lines.every((s) => measure.measureText(s).width <= e.diameter * .73));
}
// Real synthesized buffers, not just dispatch stubs: even M0 has an audible onset.
const { Bus, SR } = require('../engine/audio/dsp'), I = require('../engine/audio/instruments');
for (const shape of [{ hit: 0 }, { hit: 1 }, { hit: 2 }, { hit: 2, turn: 'ATH' }, { hit: 0, tag: 'upgrade' }]) {
  const fx = new Bus(SR), drums = new Bus(SR), h = { ...shape, t: .1, x: 12, kind: 'up' };
  require('./sfx').add({ h, fx, drums, instruments: I });
  assert.ok(fx.L.slice(0, Math.round(.1 * SR)).every((v) => v === 0), 'no early SFX');
  let peak = 0;
  for (let j = Math.round(.1 * SR); j < Math.round(.2 * SR); j++) peak = Math.max(peak, Math.abs(fx.L[j] + drums.L[j]));
  assert.ok(peak > .001, 'all levels have an audible SFX onset');
}
const scoreFile = path.join(dir, 'part-1/score.js');
assert.throws(() => vm.runInNewContext(fs.readFileSync(scoreFile, 'utf8'), {
  module: { exports: {} }, require: require('module').createRequire(scoreFile), __dirname: path.dirname(scoreFile),
  process: { argv: ['node', path.join(path.dirname(scoreFile), 'engine/render.js')] }
}), /approval before ANY render/, 'pending list blocks renderer before Chrome starts');
console.log(`PASS: ${p.events.length} DOGE bubbles; source/curve/slope/collision/HUD/split/seek/cue/SFX/text checks (no frames rendered).`);
