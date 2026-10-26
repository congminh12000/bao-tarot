// THE MUSIC LIBRARY — the cues of the two market phases (phases: data/phases.csv, from detect-phases.js).
//
//   uptrend     ALL-TIME LOW -> ALL-TIME HIGH      cues: Vanguard, Titan, Crusade, Overdrive, Horizon, Warpath (approved)
//   downtrend   ALL-TIME HIGH -> ALL-TIME LOW      cues: Collapse, Siege, Undertow (approved 2026-10-26)
// A cue with `rotation: false` is in audition: it can be heard (PREVIEW_CUE=<id> PREVIEW_BARS=16 node song.js) but the
// film does not use it until it is approved.
//
// The turn between two phases (an ALL-TIME HIGH or LOW): the music keeps its tempo and changes cue at once (the new cue
// opens with its ~1 s pickup). TURN only shapes the CHART there: it brakes (TURN.brakeBeats) to TURN.slowBpm, holds it
// for TURN.holdSec seconds, then speeds back up to the new phase's tempo along a smooth S-curve in about TURN.rampSec s
// (score.js).
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
  const TURN = { slowBpm: 60, brakeBeats: 0.5, holdSec: 3, rampSec: 3 };

  const CUES = [
    // ---------------- uptrend, cinematic: heroic trailer music, 100 BPM, fast and driving ----------------
    // lead.melody / answer.notes: [degree of the KEY, start, length] in 8ths over `bars` bars (a long line, not a riff)
    // pickup: beats of drum roll that open the phase (~1 s), then the full groove at once
    // arrange: a cycle of bars; from = the first bar of the cycle each layer plays in; drop = bars where it all cuts out
    {
      // VANGUARD (approved style): the march. A driving accented cello in 8ths, trailer toms, a 4-bar french-horn
      // melody; after a 2-beat pickup the groove is on at once, then choir (bar 5) and violins doubling the horns (bar 9)
      id: 'up-vanguard', phase: 'uptrend', title: 'Vanguard', bpm: 100, key: 'D minor', approved: '2026-10-26',
      chords: ['Dm', 'Bb', 'F', 'C'],
      drums: 'epicToms', bass: 'celloDrive',
      ostinato: null,
      lead: { instrument: 'horn', bars: 4, gain: 0.2, melody: [
        [5, 0, 3], [8, 3, 1], [7, 4, 2], [5, 6, 2],
        [6, 8, 3], [5, 11, 1], [4, 12, 4],
        [3, 16, 2], [5, 18, 2], [8, 20, 3], [10, 23, 1],
        [9, 24, 6], [8, 30, 2],
      ] },
      pads: 'strings', choir: 'a', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, double: 8 } },
      mood: 'a march: driving, heavy, heroic',
    },
    {
      // TITAN: the battle. As fast as Vanguard but harder: a military snare rolling in 16ths, driving bass 8ths with a
      // fifth, spiccato strings under a punchy brass melody (dotted rhythms, big leaps) and low brass answering;
      // dramatic Dm-Gm-Bb-A (the A major pulls back to D); choir from bar 5, violins doubling from bar 9
      id: 'up-titan', phase: 'uptrend', title: 'Titan', bpm: 100, key: 'D minor', approved: '2026-10-26',
      chords: ['Dm', 'Gm', 'Bb', 'A'],
      drums: 'heroicMarch', bass: 'drive8',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [1, 5, 8, 5] },
      lead: { instrument: 'brass', bars: 4, gain: 0.17, melody: [
        [1, 0, 1], [1, 1, 1], [5, 2, 3], [8, 5, 1], [7, 6, 1], [8, 7, 1],
        [4, 8, 3], [6, 11, 1], [8, 12, 2], [6, 14, 2],
        [6, 16, 1], [6, 17, 1], [10, 18, 3], [8, 21, 1], [6, 22, 2],
        [5, 24, 3], [9, 27, 1], [12, 28, 4],
      ] },
      answer: { instrument: 'lowBrass', bars: 2, gain: 0.14, octave: 3, notes: [[1, 7, 1], [5, 14, 1], [1, 15, 1]] },
      pads: 'brassPad', choir: 'o', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, double: 8 } },
      mood: 'a battle charge: snare rolls, brass fanfare, relentless',
    },
    // ---------------- uptrend, approved 2026-10-26 (the first versions, "v1"): four more characters ----------------
    {
      // CRUSADE: the knights. D dorian (the bright minor, a B natural), a celtic-feeling spiccato in 8ths over a driving
      // cello and trailer toms, a horn melody; choir from bar 5, violins doubling from bar 9
      id: 'up-crusade', phase: 'uptrend', title: 'Crusade', bpm: 100, key: 'D dorian', approved: '2026-10-26',
      chords: ['Dm', 'C', 'G', 'Am'],
      drums: 'epicToms', bass: 'celloDrive',
      ostinato: { instrument: 'spiccato', perBeat: 2, figure: [1, 5, 8, 5] },
      lead: { instrument: 'horn', bars: 4, gain: 0.2, melody: [
        [1, 0, 1], [3, 1, 1], [5, 2, 2], [8, 4, 3], [7, 7, 1],
        [7, 8, 2], [9, 10, 2], [8, 12, 2], [7, 14, 2],
        [4, 16, 2], [6, 18, 2], [8, 20, 3], [6, 23, 1],
        [5, 24, 4], [9, 28, 2], [8, 30, 2],
      ] },
      pads: 'strings', choir: 'a', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, double: 8 } },
      mood: 'a crusade: bright minor, galloping, noble',
    },
    {
      // OVERDRIVE: cinematic rock. Gritty supersaw power chords, a rock beat (fat snare, open hats), driving bass 8ths,
      // a bold brass riff-melody; no ostinato, violins doubling from bar 9
      id: 'up-overdrive', phase: 'uptrend', title: 'Overdrive', bpm: 100, key: 'D minor', approved: '2026-10-26',
      chords: ['Dm', 'C', 'Bb', 'C'],
      drums: 'rockDrive', bass: 'drive8',
      ostinato: null,
      lead: { instrument: 'brass', bars: 4, gain: 0.18, melody: [
        [8, 0, 2], [8, 2, 1], [7, 3, 1], [8, 4, 2], [10, 6, 2],
        [9, 8, 3], [8, 11, 1], [7, 12, 4],
        [6, 16, 2], [8, 18, 2], [10, 20, 3], [8, 23, 1],
        [7, 24, 2], [9, 26, 2], [11, 28, 4],
      ] },
      pads: 'power', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { double: 8 } },
      mood: 'cinematic rock: gritty, pounding, defiant',
    },
    {
      // HORIZON: the sunrise. F major, uplifting: 16th spiccato, a hybrid beat, soaring violins with the horns answering,
      // F-Bb-Dm-C; choir from bar 9
      id: 'up-horizon', phase: 'uptrend', title: 'Horizon', bpm: 100, key: 'F major', approved: '2026-10-26',
      chords: ['F', 'Bb', 'Dm', 'C'],
      drums: 'cineHybrid', bass: 'octaves',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [1, 5, 8, 5, 10, 8, 5, 8] },
      lead: { instrument: 'stringsHigh', bars: 4, gain: 0.2, octave: 5, melody: [
        [5, 0, 3], [8, 3, 1], [10, 4, 4],
        [11, 8, 3], [10, 11, 1], [8, 12, 2], [6, 14, 2],
        [6, 16, 2], [8, 18, 2], [10, 20, 4],
        [9, 24, 3], [8, 27, 1], [7, 28, 2], [5, 30, 2],
      ] },
      answer: { instrument: 'horn', bars: 2, gain: 0.13, octave: 4, notes: [[8, 4, 2], [5, 6, 2], [11, 12, 2], [8, 14, 2]] },
      pads: 'strings', choir: 'a', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 8 } },
      mood: 'a sunrise: uplifting, open, hopeful power',
    },
    {
      // WARPATH: the war drums. A taiko ensemble, a male choir chanting in 8ths, driving bass, brass melody over
      // Dm-F-Gm-A; violins doubling from bar 5, a held choir from bar 9
      id: 'up-warpath', phase: 'uptrend', title: 'Warpath', bpm: 100, key: 'D minor', approved: '2026-10-26',
      chords: ['Dm', 'F', 'Gm', 'A'],
      drums: 'taiko', bass: 'drive8',
      ostinato: { instrument: 'chant', perBeat: 2, octave: 3, figure: [1, 1, 5, 1] },
      lead: { instrument: 'brass', bars: 4, gain: 0.18, melody: [
        [1, 0, 3], [5, 3, 1], [8, 4, 4],
        [7, 8, 3], [5, 11, 1], [3, 12, 4],
        [4, 16, 2], [6, 18, 2], [8, 20, 4],
        [5, 24, 3], [9, 27, 1], [5, 28, 4],
      ] },
      pads: 'brassPad', choir: 'o', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { double: 4, choir: 8 } },
      mood: 'war drums: tribal, chanting, unstoppable',
    },
    // ---------------- uptrend, audition (2026-10-26): Ironclad, built on Vanguard v3's skeleton ----------------
    {
      // IRONCLAD: the same march with a brighter, harder lead (open brass instead of horn) climbing Bb-C-Dm-Dm
      id: 'up-ironclad', phase: 'uptrend', title: 'Ironclad', bpm: 100, key: 'D minor', rotation: false,
      chords: ['Bb', 'C', 'Dm', 'Dm'],
      drums: 'epicToms', bass: 'celloDrive',
      ostinato: null,
      lead: { instrument: 'brass', bars: 4, gain: 0.17, melody: [
        [6, 0, 2], [8, 2, 2], [10, 4, 3], [8, 7, 1],
        [7, 8, 2], [9, 10, 2], [11, 12, 3], [9, 15, 1],
        [8, 16, 3], [12, 19, 1], [10, 20, 4],
        [8, 24, 6], [7, 30, 1], [8, 31, 1],
      ] },
      pads: 'strings', choir: 'o', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, double: 8 } },
      mood: 'Vanguard family: harder, brighter brass, a climb to D',
    },
    // ---------------- uptrend, audition (2026-10-26): four anthems on Vanguard's skeleton ----------------
    // Vanguard's skeleton (accented cello 8ths, trailer toms, no 16th ostinato, a 4-bar melody, string pads, 2-beat
    // pickup) made into a war anthem: war drums on top (warMarch), the melody in long proud notes, the choir holding the
    // chord from bar 5 and SINGING the melody with the horns from bar 9, violins doubling from bar 13.
    {
      // LEGION: Dm-Bb-C-Dm, the legion marching home: a horn anthem that climbs to the high A
      id: 'up-legion', phase: 'uptrend', title: 'Legion', bpm: 100, key: 'D minor', rotation: false,
      chords: ['Dm', 'Bb', 'C', 'Dm'],
      drums: 'warMarch', bass: 'celloDrive',
      ostinato: null,
      lead: { instrument: 'horn', bars: 4, gain: 0.2, melody: [
        [5, 0, 2], [8, 2, 2], [8, 4, 3], [7, 7, 1],
        [6, 8, 4], [8, 12, 2], [6, 14, 2],
        [7, 16, 4], [9, 20, 2], [11, 22, 2],
        [12, 24, 6], [8, 30, 2],
      ] },
      pads: 'strings', choir: 'a', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, chorus: 8, double: 12 } },
      mood: 'a war anthem: the legion marching, proud and heavy',
    },
    {
      // SPARTAN: G minor, Gm-F-Eb-F, harder: open brass and the choir on "oh"
      id: 'up-spartan', phase: 'uptrend', title: 'Spartan', bpm: 100, key: 'G minor', rotation: false,
      chords: ['Gm', 'F', 'Eb', 'F'],
      drums: 'warMarch', bass: 'celloDrive',
      ostinato: null,
      lead: { instrument: 'brass', bars: 4, gain: 0.17, melody: [
        [8, 0, 3], [7, 3, 1], [8, 4, 2], [10, 6, 2],
        [9, 8, 3], [11, 11, 1], [9, 12, 4],
        [10, 16, 3], [8, 19, 1], [6, 20, 4],
        [7, 24, 2], [9, 26, 2], [11, 28, 4],
      ] },
      pads: 'strings', choir: 'o', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, chorus: 8, double: 12 } },
      mood: 'a war anthem: hard, defiant, shields up',
    },
    {
      // VALHALLA: F major, F-Bb-F-C, the glorious one: a horn melody rising to the high F
      id: 'up-valhalla', phase: 'uptrend', title: 'Valhalla', bpm: 100, key: 'F major', rotation: false,
      chords: ['F', 'Bb', 'F', 'C'],
      drums: 'warMarch', bass: 'celloDrive',
      ostinato: null,
      lead: { instrument: 'horn', bars: 4, gain: 0.2, melody: [
        [8, 0, 4], [10, 4, 2], [12, 6, 2],
        [11, 8, 4], [10, 12, 2], [8, 14, 2],
        [10, 16, 3], [12, 19, 1], [15, 20, 4],
        [14, 24, 3], [12, 27, 1], [9, 28, 4],
      ] },
      pads: 'strings', choir: 'a', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, chorus: 8, double: 12 } },
      mood: 'a war anthem: glorious, triumphant, the hall of heroes',
    },
    {
      // CONQUEST: Dm-F-Gm-A, the charge: open brass leaping D-A-D, the A major hurling it back to D
      id: 'up-conquest', phase: 'uptrend', title: 'Conquest', bpm: 100, key: 'D minor', rotation: false,
      chords: ['Dm', 'F', 'Gm', 'A'],
      drums: 'warMarch', bass: 'celloDrive',
      ostinato: null,
      lead: { instrument: 'brass', bars: 4, gain: 0.17, melody: [
        [1, 0, 2], [5, 2, 2], [8, 4, 4],
        [10, 8, 3], [12, 11, 1], [10, 12, 4],
        [11, 16, 3], [10, 19, 1], [8, 20, 4],
        [9, 24, 3], [12, 27, 1], [9, 28, 4],
      ] },
      pads: 'strings', choir: 'o', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, chorus: 8, double: 12 } },
      mood: 'a war anthem: the charge, leaping and relentless',
    },
    // ---------------- uptrend, audition (2026-10-26): three battle cues, a new style (not Vanguard's skeleton) -----
    // Cinematic war music, heroes fighting for their lives: war drums, braams (the enemy's horns: a huge low brass
    // blast every 2 bars), racing strings or a chanting choir, a heroic melody the choir takes up from bar 9.
    {
      // LAST STAND: taiko war drums, 16th spiccato racing, braams, driving bass, an open-brass melody climbing to A;
      // Dm-Bb-Gm-A; the choir holds from bar 5 and sings the melody from bar 9
      id: 'up-laststand', phase: 'uptrend', title: 'Last Stand', bpm: 100, key: 'D minor', rotation: false,
      chords: ['Dm', 'Bb', 'Gm', 'A'],
      drums: 'taiko', bass: 'drive8',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [1, 5, 8, 5, 10, 8, 5, 8] },
      lead: { instrument: 'brass', bars: 4, gain: 0.18, melody: [
        [8, 0, 3], [10, 3, 1], [12, 4, 3], [10, 7, 1],
        [10, 8, 2], [8, 10, 2], [6, 12, 4],
        [8, 16, 3], [11, 19, 1], [10, 20, 2], [8, 22, 2],
        [9, 24, 4], [12, 28, 4],
      ] },
      pads: 'brassPad', choir: 'o', swell: true, pickup: 2, braam: true,
      arrange: { cycle: 16, from: { choir: 4, chorus: 8 } },
      mood: 'the last stand: war drums, racing strings, everything on the line',
    },
    {
      // BLOOD OATH: G minor, giant half-time drums with a male choir chanting the 8ths, braams, a horn melody of long
      // proud notes over Gm-Eb-Cm-D (the D major: the oath before the charge); the choir sings it from bar 9
      id: 'up-bloodoath', phase: 'uptrend', title: 'Blood Oath', bpm: 100, key: 'G minor', rotation: false,
      chords: ['Gm', 'Eb', 'Cm', 'D'],
      drums: 'epicHalf', bass: 'drive8',
      ostinato: { instrument: 'chant', perBeat: 2, octave: 3, figure: [1, 1, 5, 1] },
      lead: { instrument: 'horn', bars: 4, gain: 0.2, melody: [
        [5, 0, 4], [8, 4, 4],
        [10, 8, 4], [8, 12, 2], [6, 14, 2],
        [11, 16, 4], [8, 20, 4],
        [9, 24, 4], [12, 28, 2], [9, 30, 2],
      ] },
      pads: 'bigStrings', swell: true, pickup: 2, braam: true,
      arrange: { cycle: 16, from: { chorus: 8, double: 12 } },
      mood: 'a blood oath: chanting warriors, colossal drums, the vow before battle',
    },
    {
      // WAR CRY: an all-out hybrid battle beat (rock kit + taiko), gritty power chords, braams, soaring violins with
      // brass stabbing back, the descending Dm-C-Bb-A of a charge downhill; choir from bar 5
      id: 'up-warcry', phase: 'uptrend', title: 'War Cry', bpm: 100, key: 'D minor', rotation: false,
      chords: ['Dm', 'C', 'Bb', 'A'],
      drums: 'battleHybrid', bass: 'drive8',
      ostinato: null,
      lead: { instrument: 'stringsHigh', bars: 4, gain: 0.3, octave: 5, melody: [
        [8, 0, 2], [12, 2, 2], [10, 4, 4],
        [9, 8, 2], [11, 10, 2], [9, 12, 2], [7, 14, 2],
        [8, 16, 2], [10, 18, 2], [6, 20, 4],
        [9, 24, 2], [12, 26, 2], [9, 28, 4],
      ] },
      answer: { instrument: 'brass', bars: 2, gain: 0.13, octave: 4, notes: [[5, 6, 1], [5, 7, 1], [5, 14, 1], [5, 15, 1]] },
      pads: 'power', choir: 'a', swell: true, pickup: 2, braam: true,
      arrange: { cycle: 16, from: { choir: 4 } },
      mood: 'a war cry: all-out, gritty, charging downhill',
    },
    // ---------------- uptrend, audition (2026-10-26): three epic, powerful cues ----------------
    {
      // DOMINION: the full orchestra in power: a 16th synth-and-strings pulse, trailer toms, braams every 2 bars,
      // horns in unison climbing an arpeggio to the high A, Dm-Bb-Gm-C; choir from bar 5, violins doubling from bar 9
      id: 'up-dominion', phase: 'uptrend', title: 'Dominion', bpm: 100, key: 'D minor', rotation: false,
      chords: ['Dm', 'Bb', 'Gm', 'C'],
      drums: 'epicToms', bass: 'celloDrive',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [1, 8, 5, 8] },
      lead: { instrument: 'horn', bars: 4, gain: 0.21, melody: [
        [5, 0, 2], [8, 2, 2], [10, 4, 2], [12, 6, 2],
        [10, 8, 3], [8, 11, 1], [6, 12, 4],
        [11, 16, 3], [10, 19, 1], [8, 20, 4],
        [9, 24, 2], [11, 26, 2], [14, 28, 4],
      ] },
      pads: 'strings', choir: 'a', swell: true, pickup: 2, braam: true,
      arrange: { cycle: 16, from: { choir: 4, double: 8 } },
      mood: 'epic power: the whole orchestra, unstoppable',
    },
    {
      // ECLIPSE: a modern trailer: half-time weight under double-time hats (trailerHalf), an 808 sub, gritty power
      // chords, braams, soaring violins that the choir takes up from bar 9; G minor, Gm-Bb-F-Eb
      id: 'up-eclipse', phase: 'uptrend', title: 'Eclipse', bpm: 100, key: 'G minor', rotation: false,
      chords: ['Gm', 'Bb', 'F', 'Eb'],
      drums: 'trailerHalf', bass: 'rolling808',
      ostinato: null,
      lead: { instrument: 'stringsHigh', bars: 4, gain: 0.42, octave: 5, melody: [
        [8, 0, 4], [10, 4, 2], [12, 6, 2],
        [10, 8, 3], [12, 11, 1], [10, 12, 4],
        [9, 16, 3], [11, 19, 1], [14, 20, 4],
        [13, 24, 3], [12, 27, 1], [10, 28, 4],
      ] },
      pads: 'power', swell: true, pickup: 2, braam: true,
      arrange: { cycle: 16, from: { chorus: 8 } },
      mood: 'a modern trailer: heavy, dark, soaring',
    },
    {
      // ASCENDANT: epic and rising, F major, Bb-F-C-Dm: a hybrid beat, 16th spiccato, driving cello, a horn melody
      // with brass answering; choir from bar 5, sung melody from bar 9 — power with light in it
      id: 'up-ascendant', phase: 'uptrend', title: 'Ascendant', bpm: 100, key: 'F major', rotation: false,
      chords: ['Bb', 'F', 'C', 'Dm'],
      drums: 'cineHybrid', bass: 'celloDrive',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [1, 5, 8, 5] },
      lead: { instrument: 'horn', bars: 4, gain: 0.2, melody: [
        [11, 0, 3], [10, 3, 1], [8, 4, 2], [6, 6, 2],
        [8, 8, 2], [10, 10, 2], [12, 12, 4],
        [12, 16, 3], [14, 19, 1], [12, 20, 2], [9, 22, 2],
        [13, 24, 4], [10, 28, 4],
      ] },
      answer: { instrument: 'brass', bars: 2, gain: 0.12, octave: 4, notes: [[8, 6, 1], [8, 7, 1], [12, 14, 1], [12, 15, 1]] },
      pads: 'strings', choir: 'a', swell: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 4, chorus: 8 } },
      mood: 'epic and rising: power with light in it',
    },
    // ---------------- downtrend, suspense: unbearable tension, a moderate beat, 80 BPM, NOT dramatic ----------------
    // The opposite of the uptrend cues: slower, held back, dark and unresolved, no fanfare, no crashes, no swells, a soft
    // pickup (a dark swell + heartbeat instead of a drum roll).
    // ---------------- downtrend, audition (2026-10-26): four more in Siege's spirit (80 BPM, suspense, not dramatic) -----
    {
      // TREMOR: the ground shaking. A low pizzicato repeating on the root like a tremor, a pendulum tick-tock over the
      // heartbeat, staccato bass 8ths, a low cello holding long notes; Dm-Dm(b9)-Bb(#11)-A
      id: 'down-tremor', phase: 'downtrend', title: 'Tremor', bpm: 80, key: 'D minor', rotation: false,
      chords: ['Dm', 'Dm(b9)', 'Bb(#11)', 'A'],
      drums: 'pendulum', bass: 'pulse8',
      ostinato: { instrument: 'pizz', perBeat: 4, octave: 3, gain: 0.14, figure: [1, 1, 1, 2] },
      lead: { instrument: 'cello', bars: 4, gain: 0.32, octave: 4, melody: [[8, 0, 8], [6, 8, 6], [5, 14, 2], [6, 16, 8], [5, 24, 8]] },
      pads: 'darkPad', softPickup: true, pickup: 2,
      arrange: { cycle: 16, from: { lead: 4 } },
      mood: 'a tremor: low, repeating, the ground about to give',
    },
    {
      // SHADOW: something behind you. A pulsing spiccato that keeps falling back a step (8-8-7-8), closed hats ticking
      // over the heartbeat, a sparse electric piano line, Dm-Gm(add9)-Dm-Eb (the Eb a step above D, unresolved)
      id: 'down-shadow', phase: 'downtrend', title: 'Shadow', bpm: 80, key: 'D minor', rotation: false,
      chords: ['Dm', 'Gm(add9)', 'Dm', 'Eb'],
      drums: 'fallPulse', bass: 'pulse8',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [8, 8, 7, 8] },
      lead: { instrument: 'epiano', bars: 4, gain: 0.26, octave: 5, melody: [[5, 0, 4], [4, 6, 2], [3, 8, 6], [2, 14, 2], [5, 16, 8], [6, 24, 8]] },
      pads: 'darkPad', choir: 'u', softPickup: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 8 } },
      mood: 'a shadow: close behind, never seen',
    },
    {
      // VERTIGO: losing footing. A syncopated pizzicato rocking a step up and back (3-3-3-3-2-2), rim clicks sweeping
      // over the heartbeat, staccato bass, high violins sliding down D-C-Bb-A one bar each; Dm-Dm-Bb-Bb
      id: 'down-vertigo', phase: 'downtrend', title: 'Vertigo', bpm: 80, key: 'D minor', rotation: false,
      chords: ['Dm', 'Dm', 'Bb', 'Bb'],
      drums: 'sonarPulse', bass: 'pulse8',
      ostinato: { instrument: 'pizz', perBeat: 4, figure: [1, 2, 1, 3], mask: [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0] },
      lead: { instrument: 'stringsHigh', bars: 4, gain: 0.28, octave: 5, melody: [[8, 0, 8], [7, 8, 8], [6, 16, 8], [5, 24, 8]] },
      pads: 'darkPad', softPickup: true, pickup: 2,
      arrange: { cycle: 16, from: { lead: 4 } },
      mood: 'vertigo: rocking, sliding down, nothing to hold',
    },
    {
      // STANDOFF: two sides waiting. The wood-tick clock over the heartbeat, a soft marimba in 8ths, staccato bass, a
      // low muted horn holding long notes; Dm-Bb-Dm-C, nothing moves, nothing resolves
      id: 'down-standoff', phase: 'downtrend', title: 'Standoff', bpm: 80, key: 'D minor', rotation: false,
      chords: ['Dm', 'Bb', 'Dm', 'C'],
      drums: 'clockLight', bass: 'pulse8',
      ostinato: { instrument: 'marimba', perBeat: 2, gain: 0.06, figure: [1, 5, 1, 8] },
      lead: { instrument: 'horn', bars: 4, gain: 0.14, octave: 3, melody: [[5, 0, 8], [4, 8, 8], [5, 16, 8], [4, 24, 8]] },
      pads: 'darkPad', softPickup: true, pickup: 2,
      arrange: { cycle: 16, from: { lead: 4 } },
      mood: 'a standoff: the clock, the wait, the held breath',
    },
    {
      // UNDERTOW: dread, under water. Siege's pulse (heartbeat + staccato bass 8ths + 16th spiccato) in D phrygian: the
      // spiccato trills D-Eb a semitone apart, rim clicks sweep left/right like sonar, a low cello motif circles D-Eb
      // and never resolves (an octave below D3); a dark choir from bar 9
      id: 'down-undertow', phase: 'downtrend', title: 'Undertow', bpm: 80, key: 'D phrygian', approved: '2026-10-26',
      chords: ['Dm', 'Dm(b9)', 'Dm', 'Eb'],
      drums: 'sonarPulse', bass: 'pulse8',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [8, 9, 8, 9] },
      lead: { instrument: 'cello', bars: 4, gain: 0.34, octave: 4, melody: [[8, 0, 6], [9, 12, 4], [8, 20, 2], [5, 24, 8]] }, // a low cello (no bell: too piercing)
      pads: 'darkPad', choir: 'u', softPickup: true, pickup: 2,
      arrange: { cycle: 16, from: { choir: 8 } },
      mood: 'dread under water: a semitone trill, a sonar sweep, no way up',
    },
    {
      // SIEGE: the clock. A wood tick in 8ths over a heartbeat, staccato bass 8ths, a held spiccato tremolo on the root
      // and high violins holding long tense notes; Dm-Dm-Bb(#11)-A: the A major never lets it rest
      id: 'down-siege', phase: 'downtrend', title: 'Siege', bpm: 80, key: 'D minor', approved: '2026-10-26',
      chords: ['Dm', 'Dm', 'Bb(#11)', 'A'],
      drums: 'clockLight', bass: 'pulse8',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [8, 8, 8, 8] },
      lead: { instrument: 'stringsHigh', bars: 4, gain: 0.24, octave: 5, melody: [[5, 0, 8], [6, 8, 8], [3, 16, 8], [5, 24, 4], [2, 28, 4]] },
      pads: 'darkPad', softPickup: true, pickup: 2,
      arrange: { cycle: 16, from: { lead: 4 } },
      mood: 'a clock ticking: tight, held breath, waiting',
    },
    {
      // COLLAPSE: the slow fall. Siege's pulse (heartbeat + staccato bass 8ths + 16th spiccato), but everything falls:
      // the spiccato runs down the chord in 16ths, closed hats tick, and from bar 5 a ghostly electric piano steps down a
      // note at a time over Dm-Bb-Gm(add9)-A, with a low dark choir
      id: 'down-collapse', phase: 'downtrend', title: 'Collapse', bpm: 80, key: 'D minor', approved: '2026-10-26',
      chords: ['Dm', 'Bb', 'Gm(add9)', 'A'],
      drums: 'fallPulse', bass: 'pulse8',
      ostinato: { instrument: 'spiccato', perBeat: 4, figure: [8, 7, 6, 5] },
      lead: { instrument: 'epiano', bars: 4, gain: 0.26, octave: 4, melody: [[8, 0, 4], [7, 4, 4], [6, 8, 4], [5, 12, 4], [4, 16, 4], [3, 20, 4], [2, 24, 8]] },
      pads: 'darkPad', choir: 'u', softPickup: true, pickup: 2,
      arrange: { cycle: 16, from: { lead: 4, choir: 4 } },
      mood: 'a slow fall: ticking, every step a little lower',
    },

  ];

  // the cue for the k-th phase of a type (round robin)
  const cuesOf = (phase) => CUES.filter((c) => c.phase === phase && c.rotation !== false); // cues in audition are left out
  const pickCue = (phase, k) => { const list = cuesOf(phase); return list[k % list.length]; };

  const MUSIC_LIBRARY = { PHASE_TEMPO, TURN, CUES, cuesOf, pickCue };
  if (typeof module !== 'undefined') module.exports = MUSIC_LIBRARY; else globalThis.MUSIC_LIBRARY = MUSIC_LIBRARY;
})();
