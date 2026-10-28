// Renderer/song adapter, installed as score.js in each isolated Coin Trail workspace.
(function () {
  const node = typeof module !== 'undefined' && module.exports;
  const part = node ? require('./manifest.json') : globalThis.TRAIL;
  if (node && /[\\/]engine[\\/]render\.js$/.test(process.argv[1] || '')) {
    const fs = require('fs'), path = require('path');
    const file = path.join(__dirname, 'render-approval.json');
    const approval = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : null;
    if (!approval || !approval.approved || approval.contentHash !== part.contentHash)
      throw new Error('Review event/caption manifest and obtain user approval before ANY render (PROJECT.md §1.2 / shorts.md Coin Trail).');
  }
  const C = node ? require('./line-core') : globalThis.CoinTrail;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const LIB = node ? require('./data/music') : globalThis.MUSIC_LIBRARY;
  let q = 0;
  const phases = part.cues.map((p, i) => {
    const c = LIB.CUES.find((c) => c.id === p.cue);
    if (!c || c.rotation === false) throw new Error('Missing approved cue: ' + p.cue);
    const end = part.cues[i + 1]?.t ?? part.duration;
    const phase = { ...p, c, q0: q, q1: q + (end - p.t) * c.bpm / 60, t1: end };
    q = phase.q1; return phase;
  });
  const TB = (beat) => { const p = phases.filter((p) => p.q0 <= beat + 1e-9).at(-1) || phases[0]; return p.t + (beat - p.q0) * 60 / p.c.bpm; };
  const clock = { BEAT: 60 / phases[0].c.bpm, BAR: 240 / phases[0].c.bpm, T: (bar, b = 0) => TB(bar * 4 + b),
    beatAt: (t) => 60 / C.phaseAt(part, t).bpm,
    beatPos: (t) => { const p = phases.filter((p) => p.t <= t).at(-1) || phases[0]; return p.q0 + (t - p.t) * p.c.bpm / 60; } };
  // Keep native cue tempo on the exported phase metadata too.
  part.cues.forEach((p, i) => { p.bpm = phases[i].c.bpm; });
  const markers = Object.fromEntries(part.events.map((e, i) => ['bubble' + (i + 1), { t: e.t, sync: 'av' }]));
  const SCORE = { LINE: part, FPS: 60, FORMAT: '9:16', W: 1080, H: 1920, DURATION: part.duration,
    clock, T: clock.T, TB, m: MU.m, CH: part.harmony, PHASES: phases, EVENTS: part.events,
    hits: part.events, markers, FIRST_BAR: 0, END_BAR: q / 4, FIRST_BEAT: 0, END_BEAT: q, BEATS: [],
    ev: { start: 0, end: part.duration - 1 }, breaths: [], inBreath: () => false,
    S: Object.fromEntries(phases.map((p, i) => [`${i + 1}-${p.type}`, [p.t, p.t1]])) };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
