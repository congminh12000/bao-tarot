// THE MUSIC LIBRARY — the cues of the two market phases (phases: data/phases.csv, from detect-phases.js).
//
//   uptrend     from a bottom to the next top      cues: Ascent, Euphoria
//   downtrend   from a top to the next bottom      cues: Freefall, Pressure
//
// The turn between two phases (a top or a bottom) is where the music breathes: the trend runs at full tempo right up
// to the top / bottom; there it brakes (TURN.brakeBeats) to TURN.slowBpm and holds it for TURN.holdSec seconds; then
// the new phase speeds back up to its own tempo along a smooth S-curve over TURN.rampOutBeats beats. The candles
// follow the music: inside a phase every beat shows the same number of days, so the chart brakes at the turn and
// picks up again with the music.
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
// Cues of the same phase take turns (round robin), so the story does not repeat the same loop each time.
(function () {
  const PHASE_TEMPO = { uptrend: 100, downtrend: 98 };
  const TURN = { slowBpm: 60, brakeBeats: 1, holdSec: 3, rampOutBeats: 16 };

  const CUES = [
    // ---------------- uptrend: bright, rising ----------------
    {
      id: 'up-ascent', phase: 'uptrend', title: 'Ascent', bpm: 100, key: 'D minor',
      chords: ['Dm', 'Bb', 'F', 'C'],
      drums: 'fourFloor', bass: 'octaves',
      ostinato: { instrument: 'pizz', perBeat: 4, figure: [1, 5, 8, 5, 3, 5, 8, 10] },
      lead: { instrument: 'brass', phrase: [[8, 0, 3], [10, 3, 1], [9, 4, 1], [8, 5, 1], [7, 6, 2]] },
      pads: 'supersaw', fx: ['riser every 8 bars', 'crash on bar 1'],
      mood: 'driving, confident climb',
    },
    {
      id: 'up-euphoria', phase: 'uptrend', title: 'Euphoria', bpm: 104, key: 'F major',
      chords: ['F', 'C', 'Dm', 'Bb'],
      drums: 'breakbeat', bass: 'rolling808',
      ostinato: { instrument: 'pluck', perBeat: 4, figure: [1, 3, 5, 8, 5, 3, 5, 8] },
      lead: { instrument: 'supersaw', phrase: [[5, 0, 2], [6, 2, 2], [8, 4, 3], [9, 7, 1]] },
      pads: 'strings', fx: ['claps on 2 and 4', 'shimmer bells on new highs'],
      mood: 'euphoric, a party at the top of the chart',
    },
    // ---------------- downtrend: dark, falling ----------------
    {
      id: 'down-freefall', phase: 'downtrend', title: 'Freefall', bpm: 98, key: 'D minor',
      chords: ['Dm', 'C', 'Bb', 'A'],
      drums: 'toms', bass: 'pulse8',
      ostinato: { instrument: 'strings', perBeat: 4, figure: [8, 7, 6, 5, 4, 3, 2, 1] },
      lead: { instrument: 'lowBrass', phrase: [[1, 0, 2], [1, 3, 1], [-2, 4, 4]] },
      pads: 'darkPad', fx: ['falling sweeps', 'sub boom on each new low'],
      mood: 'panic, a descending line that will not stop',
    },
    {
      id: 'down-pressure', phase: 'downtrend', title: 'Pressure', bpm: 96, key: 'G minor',
      chords: ['Gm', 'Eb', 'Cm', 'D'],
      drums: 'halfTime', bass: 'rolling808',
      ostinato: { instrument: 'pizz', perBeat: 4, figure: [1, 1, 8, 1, 7, 1, 6, 5] },
      lead: { instrument: 'strings', phrase: [[5, 0, 4], [4, 4, 2], [3, 6, 2]] },
      pads: 'darkPad', fx: ['ticking hats', 'reverse cymbals into each bar'],
      mood: 'grinding sell-off, heavy and relentless',
    },
  ];

  // the cue for the k-th phase of a type (round robin)
  const cuesOf = (phase) => CUES.filter((c) => c.phase === phase);
  const pickCue = (phase, k) => { const list = cuesOf(phase); return list[k % list.length]; };

  const MUSIC_LIBRARY = { PHASE_TEMPO, TURN, CUES, cuesOf, pickCue };
  if (typeof module !== 'undefined') module.exports = MUSIC_LIBRARY; else globalThis.MUSIC_LIBRARY = MUSIC_LIBRARY;
})();
