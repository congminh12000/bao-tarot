// Finds the market phases of BTC/USD and writes them to data/phases.csv (which you may then edit by hand).
//
//   node make-data.js && node detect-phases.js        (run on the FULL history, not a FROM/TO cut)
//
// Five phase types (see data/music.js for the music each one gets):
//   uptrend    a leg from a major low to a major high, moving
//   downtrend  a leg from a major high to a major low, moving
//   sideway    a stretch inside a leg where the price goes nowhere (a tight range for weeks)
//   peak       the turn at a major high: the days the price spends close to it, before and after (up -> down)
//   bottom     the turn at a major low: the days the price spends close to it (down -> up)
//
// How:
//   1. a zig-zag on daily closes (log scale): a swing counts once the price reverses REVERSAL from the last extreme;
//      it gives the major highs and lows, alternating
//   2. around each high, the days within PEAK_BAND of it form the peak; around each low, BOTTOM_BAND (bottoms in
//      crypto are long and flat, tops are short and sharp)
//   3. inside the legs between them, any SIDE_DAYS window that stays inside SIDE_RANGE and ends within SIDE_DRIFT
//      of where it began is sideway (a slow steady climb is still an uptrend)
//   4. runs shorter than MIN_DAYS melt into the phase before them
const fs = require('fs');
const path = require('path');
const BTC = require('./btc-data');

const REVERSAL = 0.45; // 45% against the move = a new swing (smaller wiggles stay inside their leg)
const PEAK_BAND = 0.1; // within 10% of a major high = still at the top
const BOTTOM_BAND = 0.2; // within 20% of a major low = still at the bottom
const MAX_TURN = { peak: 40, bottom: 120 }; // a turn never lasts longer than this many days on each side
const SIDE_DAYS = 90, SIDE_RANGE = 1.4, SIDE_DRIFT = 0.15, SIDE_MAX = 1.4; // 3 months inside a 40% range, ending within 15% of
// where it began, starts a sideway; it lasts while the whole stretch stays inside a 40% range
const MIN_DAYS = 30, MIN_TURN = 10; // a trend or sideway shorter than 30 days melts into its neighbour; a turn keeps ≥ 10 days

const DAY = 86400000, START = Date.parse(BTC.start + 'T00:00:00Z');
const iso = (d) => new Date(START + d * DAY).toISOString().slice(0, 10);
const C = BTC.days.map((r) => r[3]), N = C.length;

// 1. zig-zag
const piv = []; // {d, type: 'H'|'L'}
let dir = 0, hiD = 0, loD = 0;
for (let d = 1; d < N; d++) {
  if (dir >= 0 && C[d] > C[hiD]) hiD = d;
  if (dir <= 0 && C[d] < C[loD]) loD = d;
  if (dir >= 0 && C[d] <= C[hiD] * (1 - REVERSAL) && (dir > 0 || hiD > loD)) { piv.push({ d: hiD, type: 'H' }); dir = -1; loD = d; }
  else if (dir <= 0 && C[d] >= C[loD] * (1 + REVERSAL) && (dir < 0 || loD > hiD)) { piv.push({ d: loD, type: 'L' }); dir = 1; hiD = d; }
}
piv.push(dir > 0 ? { d: hiD, type: 'H', open: true } : { d: loD, type: 'L', open: true }); // the swing still running at the end
// the very first day starts the first leg
const first = { d: 0, type: piv[0].type === 'H' ? 'L' : 'H' };

// 2. label every day by its leg, then carve the turns around each pivot
const type = new Array(N).fill('sideway');
const P = [first, ...piv];
for (let k = 0; k < P.length - 1; k++) for (let d = P[k].d; d <= P[k + 1].d; d++) type[d] = P[k + 1].type === 'H' ? 'uptrend' : 'downtrend';
for (const p of piv) {
  if (p.open) continue; // the last extreme is not a confirmed turn yet
  const top = p.type === 'H', band = top ? PEAK_BAND : BOTTOM_BAND, lim = MAX_TURN[top ? 'peak' : 'bottom'];
  const near = (d) => (top ? C[d] >= C[p.d] * (1 - band) : C[d] <= C[p.d] * (1 + band));
  let a = p.d, b = p.d;
  while (a > 0 && p.d - a < lim && near(a - 1)) a--;
  while (b < N - 1 && b - p.d < lim && near(b + 1)) b++;
  a = Math.min(a, p.d - MIN_TURN / 2); b = Math.max(b, p.d + MIN_TURN / 2);
  for (let d = Math.max(0, a); d <= Math.min(N - 1, b); d++) type[d] = top ? 'peak' : 'bottom';
}

// 3. sideways inside the legs: a qualifying window starts one; it grows day by day while the WHOLE stretch stays
//    inside SIDE_MAX (so a long trend made of small steps never passes as flat)
const isTurn = (d) => type[d] === 'peak' || type[d] === 'bottom';
for (let st = 0; st + SIDE_DAYS <= N; st++) {
  let hi = 0, lo = Infinity, ok = true;
  for (let d = st; d < st + SIDE_DAYS; d++) { hi = Math.max(hi, C[d]); lo = Math.min(lo, C[d]); if (isTurn(d)) ok = false; }
  if (!ok || hi / lo > SIDE_RANGE || Math.abs(C[st + SIDE_DAYS - 1] / C[st] - 1) > SIDE_DRIFT) continue;
  let e = st + SIDE_DAYS;
  while (e < N && !isTurn(e) && Math.max(hi, C[e]) / Math.min(lo, C[e]) <= SIDE_MAX) { hi = Math.max(hi, C[e]); lo = Math.min(lo, C[e]); e++; }
  for (let d = st; d < e; d++) type[d] = 'sideway';
  st = e - 1 + MIN_DAYS; // the breakout after a range is a move, not the start of the next range
}

// 4. runs; a trend/sideway run shorter than MIN_DAYS joins a neighbour (turns are kept)
let runs = [];
for (let d = 0; d < N; d++) {
  if (runs.length && runs[runs.length - 1].type === type[d]) runs[runs.length - 1].end = d;
  else runs.push({ type: type[d], start: d, end: d });
}
const len = (r) => r.end - r.start + 1, turn = (r) => r.type === 'peak' || r.type === 'bottom';
for (let changed = true; changed; ) {
  changed = false;
  for (let i = 0; i < runs.length; i++) {
    const r = runs[i];
    if (turn(r) || len(r) >= MIN_DAYS || runs.length < 2) continue;
    const L = runs[i - 1], R = runs[i + 1];
    // a scrap joins a trend before a sideway, a sideway before a turn (so flats never swallow the moves between them)
    const rank = (q) => (!q ? -1 : q.type === 'uptrend' || q.type === 'downtrend' ? 2 : q.type === 'sideway' ? 1 : 0);
    const into = rank(L) > rank(R) ? L : rank(R) > rank(L) ? R : len(L) >= len(R) ? L : R;
    into.start = Math.min(into.start, r.start); into.end = Math.max(into.end, r.end);
    runs.splice(i, 1); changed = true; break;
  }
  for (let i = 1; i < runs.length; i++) if (runs[i].type === runs[i - 1].type) { runs[i - 1].end = runs[i].end; runs.splice(i, 1); changed = true; break; }
}

const pct = (r) => Math.round((C[r.end] / C[r.start] - 1) * 100);
const lines = [
  '# Market phases of BTC/USD, one row per phase, back to back. Generated by detect-phases.js — edit freely, then run',
  '# `node make-data.js` again. type: uptrend | downtrend | sideway | peak | bottom   (music for each: data/music.js)',
  '# start,end,type,change%',
  ...runs.map((r) => `${iso(r.start)},${iso(r.end)},${r.type},${pct(r) > 0 ? '+' : ''}${pct(r)}%`),
];
fs.writeFileSync(path.join(__dirname, 'data', 'phases.csv'), lines.join('\n') + '\n');
const count = {};
for (const r of runs) count[r.type] = (count[r.type] || 0) + 1;
console.log(`data/phases.csv: ${runs.length} phases ${iso(0)} → ${iso(N - 1)}`, count);
console.log('major turns:', piv.filter((p) => !p.open).map((p) => `${p.type === 'H' ? '▲' : '▼'} ${iso(p.d)} $${C[p.d]}`).join('  '));
