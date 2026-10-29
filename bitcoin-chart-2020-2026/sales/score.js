(function () {
  const node = typeof module !== 'undefined' && module.exports;
  const P = node ? require('./manifest.json') : globalThis.SALES;
  if (node) {
    const fs = require('fs'), path = require('path'), crypto = require('crypto');
    const approval = JSON.parse(fs.readFileSync(path.join(__dirname, 'render-approval.json')));
    if (!approval.approved || approval.contentHash !== P.contentHash || !approval.evidence) throw new Error('Sales data/storyboard approval missing');
    // Direct engine invocations must honor the same preview/final gate as render.js.
    if (/[\\/]engine[\\/]render\.js$/.test(process.argv[1] || '')) {
      const args = process.argv.slice(2), cmd = args[0];
      const full = ['video', 'mux', 'check', 'verify'].includes(cmd);
      if ((full || (cmd === 'clip' && (!Number.isFinite(+args[1]) || !Number.isFinite(+args[2]) || +args[2] - +args[1] > 45))) &&
          (!approval.previewApproved || !approval.finalRequested || !approval.finalResolution))
        throw new Error('Approve the short preview and explicitly request final/resolution before a full sales render.');
    }
    const fingerprint = JSON.parse(fs.readFileSync(path.join(__dirname, 'fingerprint.json')));
    for (const [file, hash] of Object.entries(fingerprint)) {
      const live = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, file))).digest('hex');
      if (live !== hash) throw new Error('Sales workspace changed; rebuild/review instead of reusing frames: ' + file);
    }
  }
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const LIB = node ? require('./data/music') : globalThis.MUSIC_LIBRARY;
  let q = 0;
  const phases = P.cues.map((p, i) => {
    const c = LIB.CUES.find(c => c.id === p.cue), end = P.cues[i+1]?.t ?? P.duration;
    if (!c || c.rotation === false || c.bpm !== 100) throw new Error('Missing/changed approved 100 BPM cue: ' + p.cue);
    const phase = { ...p, type: 'uptrend', c, q0: q, q1: q + (end - p.t) * c.bpm / 60, t1: end }; q = phase.q1; return phase;
  });
  const TB = beat => { const p = phases.filter(p => p.q0 <= beat + 1e-9).at(-1) || phases[0]; return p.t + (beat - p.q0) * 60 / p.c.bpm; };
  const clock = { BEAT: .6, BAR: 2.4, T: (bar, b=0) => TB(bar * 4 + b), beatAt: () => .6,
    beatPos: t => t / .6 };
  const SCORE = { SALES: P, FPS: 60, FORMAT: '16:9', W: 1920, H: 1080, DURATION: P.duration,
    clock, T: clock.T, TB, m: MU.m, CH: P.harmony, PHASES: phases, EVENTS: P.events,
    hits: P.events, markers: Object.fromEntries(P.events.map((e,i) => ['sales'+i, { t:e.t, sync:'av' }])),
    FIRST_BAR: 0, END_BAR: q/4, FIRST_BEAT: 0, END_BEAT: q, BEATS: [],
    ev: { start:0, end:P.duration-1 }, breaths:[], inBreath:()=>false,
    S: Object.fromEntries(P.config.chapters.map(c => [c.title,[c.t0,c.t1]])) };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
