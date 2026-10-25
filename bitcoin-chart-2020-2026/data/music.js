// THE MUSIC LIBRARY — one or more cues per market phase (phases: data/phases.csv, from detect-phases.js).
//
// Tempo rule:
//   uptrend / downtrend   fast    (the market is moving: 116–124 BPM)
//   sideway               medium  (waiting, coiling: 108–112 BPM)
//   peak / bottom         slow    (the turn between two trends: 76–84 BPM)
// Between two phases the tempo ramps over TRANSITION.bars bars; into a peak or a bottom it slows over
// TRANSITION.turnBars bars (a ritardando), so the turn is felt before it arrives.
// The candles follow the music: a fixed number of days per beat inside a phase, so a fast cue runs the chart fast.
//
// Every cue is pure data, read by song.js:
//   bpm        tempo of the cue
//   key        tonic + mode (all cues stay near D minor so they can follow each other without a jolt)
//   chords     a loop, one chord per bar
//   drums      pattern name   (fourFloor | breakbeat | halfTime | toms | rimShaker | heartbeat | none)
//   bass       pattern name   (octaves | rolling808 | pulse8 | root | drone)
//   ostinato   the running figure that sets the speed (instrument, notes per beat, figure in scale degrees)
//   lead       the hook instrument and its phrase (scale degrees on an 8th grid: [degree, start, length])
//   pads       sustained harmony
//   fx         extra colour
// Cues of the same phase take turns (round robin), so a long story does not repeat the same loop each time.
(function () {
  const PHASE_TEMPO = { uptrend: 120, downtrend: 118, sideway: 110, peak: 84, bottom: 78 };
  const TRANSITION = { bars: 1, turnBars: 2 };

  const CUES = [
    // ---------------- uptrend: fast, bright, rising ----------------
    {
      id: 'up-ascent', phase: 'uptrend', title: 'Ascent', bpm: 120, key: 'D minor',
      chords: ['Dm', 'Bb', 'F', 'C'],
      drums: 'fourFloor', bass: 'octaves',
      ostinato: { instrument: 'pizz', perBeat: 4, figure: [1, 5, 8, 5, 3, 5, 8, 10] },
      lead: { instrument: 'brass', phrase: [[8, 0, 3], [10, 3, 1], [9, 4, 1], [8, 5, 1], [7, 6, 2]] },
      pads: 'supersaw', fx: ['riser every 8 bars', 'crash on bar 1'],
      mood: 'driving, confident climb',
    },
    {
      id: 'up-euphoria', phase: 'uptrend', title: 'Euphoria', bpm: 124, key: 'F major',
      chords: ['F', 'C', 'Dm', 'Bb'],
      drums: 'breakbeat', bass: 'rolling808',
      ostinato: { instrument: 'pluck', perBeat: 4, figure: [1, 3, 5, 8, 5, 3, 5, 8] },
      lead: { instrument: 'supersaw', phrase: [[5, 0, 2], [6, 2, 2], [8, 4, 3], [9, 7, 1]] },
      pads: 'strings', fx: ['claps on 2 and 4', 'shimmer bells on new highs'],
      mood: 'euphoric, a party at the top of the chart',
    },
    // ---------------- downtrend: fast, dark, falling ----------------
    {
      id: 'down-freefall', phase: 'downtrend', title: 'Freefall', bpm: 118, key: 'D minor',
      chords: ['Dm', 'C', 'Bb', 'A'],
      drums: 'toms', bass: 'pulse8',
      ostinato: { instrument: 'strings', perBeat: 4, figure: [8, 7, 6, 5, 4, 3, 2, 1] },
      lead: { instrument: 'lowBrass', phrase: [[1, 0, 2], [1, 3, 1], [-2, 4, 4]] },
      pads: 'darkPad', fx: ['falling sweeps', 'sub boom on each new low'],
      mood: 'panic, a descending line that will not stop',
    },
    {
      id: 'down-pressure', phase: 'downtrend', title: 'Pressure', bpm: 116, key: 'G minor',
      chords: ['Gm', 'Eb', 'Cm', 'D'],
      drums: 'halfTime', bass: 'rolling808',
      ostinato: { instrument: 'pizz', perBeat: 4, figure: [1, 1, 8, 1, 7, 1, 6, 5] },
      lead: { instrument: 'strings', phrase: [[5, 0, 4], [4, 4, 2], [3, 6, 2]] },
      pads: 'darkPad', fx: ['ticking hats', 'reverse cymbals into each bar'],
      mood: 'grinding sell-off, heavy and relentless',
    },
    // ---------------- sideway: medium, coiled, waiting ----------------
    {
      id: 'side-range', phase: 'sideway', title: 'Range', bpm: 112, key: 'D dorian',
      chords: ['Dm7', 'G', 'Dm7', 'Am7'],
      drums: 'rimShaker', bass: 'root',
      ostinato: { instrument: 'marimba', perBeat: 2, figure: [1, 5, 3, 5] },
      lead: { instrument: 'epiano', phrase: [[5, 0, 2], [4, 2, 2], [3, 4, 4]] },
      pads: 'softPad', fx: ['clock ticks'],
      mood: 'patient, the market catching its breath',
    },
    {
      id: 'side-coil', phase: 'sideway', title: 'Coil', bpm: 108, key: 'A minor',
      chords: ['Am', 'F', 'Am', 'E'],
      drums: 'rimShaker', bass: 'pulse8',
      ostinato: { instrument: 'pluck', perBeat: 2, figure: [1, 3, 1, 5] },
      lead: { instrument: 'musicBox', phrase: [[8, 0, 2], [7, 4, 2]] },
      pads: 'softPad', fx: ['rising filter, tension before the breakout'],
      mood: 'a spring winding up',
    },
    // ---------------- peak: slow, the turn from up to down ----------------
    {
      id: 'peak-summit', phase: 'peak', title: 'Summit', bpm: 84, key: 'D major',
      chords: ['D', 'Bm', 'G', 'Asus4'],
      drums: 'none', bass: 'drone',
      ostinato: { instrument: 'musicBox', perBeat: 1, figure: [8, 5, 3, 5] },
      lead: { instrument: 'strings', phrase: [[10, 0, 6], [9, 6, 2]] },
      pads: 'strings', fx: ['timpani swell', 'everything holds its breath on the last bar'],
      mood: 'the view from the top, wide and fragile',
    },
    // ---------------- bottom: slow, the turn from down to up ----------------
    {
      id: 'bottom-abyss', phase: 'bottom', title: 'Abyss', bpm: 78, key: 'D minor',
      chords: ['Dm', 'Dm/C', 'Bb', 'A'],
      drums: 'heartbeat', bass: 'drone',
      ostinato: { instrument: 'bell', perBeat: 1, figure: [1, -2, 1, 3] },
      lead: { instrument: 'cello', phrase: [[1, 0, 4], [3, 4, 2], [2, 6, 2]] },
      pads: 'darkPad', fx: ['timpani', 'silence between phrases'],
      mood: 'the floor, cold and quiet, a heartbeat that slowly comes back',
    },
  ];

  // the cue for the k-th phase of a type (round robin)
  const cuesOf = (phase) => CUES.filter((c) => c.phase === phase);
  const pickCue = (phase, k) => { const list = cuesOf(phase); return list[k % list.length]; };

  const MUSIC_LIBRARY = { PHASE_TEMPO, TRANSITION, CUES, cuesOf, pickCue };
  if (typeof module !== 'undefined') module.exports = MUSIC_LIBRARY; else globalThis.MUSIC_LIBRARY = MUSIC_LIBRARY;
})();
