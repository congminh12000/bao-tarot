// THE SONG — plays the cue of every market phase (data/music.js) bar by bar, at the tempo map in score.js,
// plus a hit on every hit-2 event in score.hits. Renders out/music.wav.
//   node song.js            (STEMS=1 also writes out/stem-*.wav, LUFS=-14 overrides the -16 LUFS master)
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const MU = require('./engine/music');
const sc = require('./score');
const { T, DURATION, m, ev, clock, hits, FIRST_BAR, END_BAR, inBreath, breaths } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), ost = bus(), lead = bus(), perc = bus(), fx = bus();
// the hit-2 SFX get buses of their own, so the music under them can be ducked while they play
const hDrums = bus(), hPerc = bus(), hLead = bus(), hFx = bus();
const verb = bus(), dly = bus();
const kicks = [];
const beatLen = (t) => clock.beatAt(t); // seconds per beat at t (the tempo changes)

// ---------- scales: scale degrees -> MIDI ----------
const MODES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10] }; // phrygian: the flat 2nd, the darkest colour
const PC = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
function keyOf(cue) {
  const [tonic, mode] = cue.key.split(' ');
  return { tonic: PC[tonic], scale: MODES[mode] || MODES.minor };
}
// degree 1 = tonic, 8 = octave above, 0 / -1 / -2 … below; `from` = the degree index the figure is built on
function degMidi(key, deg, from = 0, octave = 4) {
  const idx = (deg > 0 ? deg - 1 : deg) + from;
  const o = Math.floor(idx / 7), s = ((idx % 7) + 7) % 7;
  return 12 * (octave + 1) + key.tonic + 12 * o + key.scale[s];
}
// the scale degree (0-based) of a chord's root inside the key, so a figure follows the chords diatonically
function rootDeg(key, chordName) {
  const root = chordName.match(/^[A-G][b#]?/)[0];
  const iv = (PC[root] - key.tonic + 12) % 12;
  let best = 0;
  key.scale.forEach((x, i) => { if (Math.abs(x - iv) < Math.abs(key.scale[best] - iv)) best = i; });
  return best;
}

// ---------- instruments by name ----------
function play(target, name, midi, t, dur, gain, pan = 0, seed = 1) {
  switch (name) {
    case 'pizz': target.addMono(I.pizz(midi, { seed }), t, gain, pan); break;
    case 'pluck': target.addMono(I.pluck(midi, { decay: 0.2, cutoff: 3600, seed }), t, gain * 0.9, pan); break;
    case 'marimba': target.addMono(I.marimba(midi, { thock: 0.2, seed }), t, gain, pan); break;
    case 'musicBox': target.addMono(I.musicBox(midi, { seed }), t, gain * 0.9, pan); break;
    case 'bell': target.addMono(I.bell(MU.mtof(midi), 0.6), t, gain * 0.5, pan); break;
    case 'epiano': target.addMono(I.epiano(midi, dur), t, gain, pan); break;
    case 'horn': { const b = I.brassNote(midi, dur, { bright: 0.75, seed }); target.addStereo(b.L, b.R, t, gain); verb.addStereo(b.L, b.R, t, gain * 0.35); break; } // a warm french-horn line
    case 'choir': { const v = I.voice(midi, dur, { syl: 'a', type: midi >= 69 ? 'alto' : 'tenor', seed, vib: 0.22, breath: 0.05 }); target.addMono(v, t, gain * 1.6, pan); verb.addMono(v, t, gain * 0.8); break; } // the choir sings the melody
    case 'stringsHigh': { const s = I.strings(midi, dur, { attack: 0.09, release: 0.45, bright: 1.15, seed }); target.addStereo(s.L, s.R, t, gain); verb.addStereo(s.L, s.R, t, gain * 0.5); break; } // soaring violins
    case 'chant': { const v = I.voice(midi, Math.max(0.08, dur * 0.8), { syl: 'o', type: 'tenor', seed, vib: 0, breath: 0.02 }); target.addMono(v, t, gain * 1.5, pan); verb.addMono(v, t, gain * 0.6); break; } // a male choir chanting in rhythm
    case 'spiccato': { const s = I.strings(midi, Math.max(0.05, dur * 0.55), { attack: 0.012, release: 0.09, bright: 1.25, seed }); target.addStereo(s.L, s.R, t, gain); break; } // short bowed strings
    case 'strings': case 'cello': { const s = I.strings(name === 'cello' ? midi - 12 : midi, dur, { attack: 0.08, bright: 0.8, seed }); target.addStereo(s.L, s.R, t, gain * 0.8); break; }
    case 'brass': case 'lowBrass': { const b = I.brassNote(name === 'lowBrass' ? midi - 12 : midi, dur, { seed }); target.addStereo(b.L, b.R, t, gain); break; }
    case 'supersaw': { const s = I.supersaw(midi, dur, { cutoff: 4800, seed }); target.addStereo(s.L, s.R, t, gain * 0.6); break; }
    default: target.addMono(I.pluck(midi, { seed }), t, gain, pan);
  }
}

// ---------- drums by pattern ----------
const K = I.kick({ punch: 1.2, tail: 0.4 }), K2 = I.kick({ punch: 0.8, tail: 0.6, seed: 4 });
const SN = I.snare({ tone: 1.1, decay: 0.18 }), CL = I.clap(), CR = I.crash(18), CR2 = I.crash(23);
const HC = [I.hat(false, 11), I.hat(false, 12)], HO = I.hat(true, 14), SH = [I.shaker(1, 15), I.shaker(0.6, 16)];
const kick = (t, g) => { drums.addMono(K, t, g); kicks.push(t); };
function drumStep(pattern, t, s, b, k) {
  switch (pattern) {
    case 'fourFloor':
      if (s % 4 === 0) kick(t, 0.9);
      if (s === 4 || s === 12) { drums.addMono(CL, t, 0.55); verb.addMono(CL, t, 0.2); }
      if (s % 4 === 2) drums.addMono(HO, t, 0.12, 0.3); else drums.addMono(HC[s % 2], t, 0.08, -0.3);
      break;
    case 'breakbeat':
      if (s === 0 || s === 6 || s === 10) kick(t, 0.85);
      if (s === 4 || s === 12) { drums.addMono(SN, t, 0.5); drums.addMono(CL, t, 0.3); }
      if (s % 2 === 0) drums.addMono(HC[(s / 2) % 2], t, s % 4 ? 0.07 : 0.12, 0.25);
      break;
    case 'halfTime':
      if (s === 0 || s === 3) kick(t, s ? 0.6 : 0.9);
      if (s === 8) { drums.addMono(SN, t, 0.55); verb.addMono(SN, t, 0.3); }
      drums.addMono(HC[s % 2], t, s % 2 ? 0.05 : 0.09, 0.3);
      break;
    case 'toms':
      if (s === 0 || s === 8) kick(t, 0.9);
      if (s === 4 || s === 12) drums.addMono(SN, t, 0.5);
      if (s % 2 === 1) { const tm = I.tom(160 - (s % 8) * 12, 0.22, s); drums.addMono(tm, t, 0.28, (s % 8) / 8 - 0.5); }
      break;
    case 'rimShaker':
      if (s === 0 || s === 10) kick(t, 0.6);
      if (s === 4 || s === 12) drums.addMono(I.rim(1, s), t, 0.35, -0.2);
      if (s % 2 === 0) drums.addMono(SH[(s / 2) % 2], t, 0.14, 0.35);
      if (s % 4 === 0) perc.addMono(I.woodTick(s % 8 ? 1.4 : 1.8), t, 0.07, 0.4);
      break;
    case 'heartbeat':
      if (s === 0 || s === 3) drums.addMono(K2, t, s ? 0.45 : 0.75);
      break;
    // ---- cinematic (the trailer cues): big low toms, timpani, roomy snares; every 4th bar ends on a tom fill ----
    case 'epicToms': {
      const fill = k % 4 === 3 && s >= 8;
      if (s === 0 || s === 6 || s === 10) { kick(t, 0.85); perc.addMono(I.tom(62, 0.5, s + 3), t, 0.36); verb.addMono(I.tom(62, 0.5, s + 3), t, 0.12); }
      if (s === 4 || s === 12) { drums.addMono(SN, t, 0.5); verb.addMono(SN, t, 0.35); }
      if (s === 0 && k % 2 === 0) { const tp = I.timpani(m('D2'), { decay: 1.4, seed: k }); perc.addMono(tp, t, 0.4); verb.addMono(tp, t, 0.2); }
      if (!fill && s % 4 === 2) perc.addMono(I.tom(96, 0.25, s), t, 0.22, 0.35);
      if (fill) perc.addMono(I.tom(140 - (s - 8) * 9, 0.22, s + 11), t, 0.3 + (s - 8) * 0.03, ((s - 8) / 7 - 0.5) * 0.8);
      break;
    }
    case 'heroicMarch': {
      // a military snare: soft 16th roll with accents, kick on 1 and 3, timpani on the downbeat, tom fill every 4th bar
      if (s === 0 || s === 8) kick(t, 0.85);
      drums.addMono(SN, t, s % 4 === 0 ? 0.32 : s % 2 === 0 ? 0.13 : 0.07, 0.15);
      if (s === 4 || s === 12) { drums.addMono(SN, t, 0.45); verb.addMono(SN, t, 0.3); }
      if (s === 0) { const tp = I.timpani(m('D2'), { decay: 1.2, seed: k + 5 }); perc.addMono(tp, t, 0.45); verb.addMono(tp, t, 0.2); }
      if (k % 4 === 3 && s >= 12) perc.addMono(I.tom(120 - (s - 12) * 14, 0.25, s + 21), t, 0.35, ((s - 12) / 3 - 0.5));
      break;
    }
    case 'epicHalf': {
      // half time, huge: kick + a deep tom on 1, a giant snare + clap on 3, small toms around them; the 4th bar of every
      // four is a timpani roll swelling into the next downbeat
      if (s === 0) { kick(t, 0.95); const tm = I.tom(52, 0.7, k); perc.addMono(tm, t, 0.42); verb.addMono(tm, t, 0.15); }
      if (s === 8) { drums.addMono(SN, t, 0.6); drums.addMono(CL, t, 0.4); verb.addMono(SN, t, 0.5); verb.addMono(CL, t, 0.3); }
      if (s === 6 || s === 14) perc.addMono(I.tom(88, 0.3, s + k), t, 0.2, s === 6 ? -0.35 : 0.35);
      if (s === 11) kick(t, 0.5);
      if (k % 4 === 3) { const tp = I.timpani(m('D2'), { decay: 0.35, seed: s + 40 }); perc.addMono(tp, t, 0.07 + 0.026 * s, (s % 2 ? 0.15 : -0.15)); }
      break;
    }
    case 'timpaniLight': // the sparse bars: timpani on 1 and 3, a soft kick under the first
      if (s === 0) { drums.addMono(K2, t, 0.45); const tp = I.timpani(m('D2'), { decay: 1.3, seed: k }); perc.addMono(tp, t, 0.38); verb.addMono(tp, t, 0.2); }
      if (s === 8) { const tp = I.timpani(m('A1'), { decay: 1.1, seed: k + 9 }); perc.addMono(tp, t, 0.28); verb.addMono(tp, t, 0.15); }
      break;
    // ---- suspense (the tense downtrend cues): a moderate, held-back pulse, nothing that explodes ----
    case 'tensionPulse': // a soft kick on 1 and 3, rim clicks on 2 and 4, a whisper of 16th hats and 8th shaker
      if (s === 0 || s === 8) drums.addMono(K2, t, s ? 0.42 : 0.58);
      if (s === 4 || s === 12) drums.addMono(I.rim(1.1, s), t, 0.22, -0.25);
      drums.addMono(HC[s % 2], t, s % 4 === 2 ? 0.045 : 0.025, 0.3);
      if (s % 2 === 0) drums.addMono(SH[(s / 2) % 2], t, 0.05, -0.35);
      break;
    case 'clockLight': // a ticking clock in 8ths over a heartbeat (lub-dub on 1 and 3)
      if (s % 2 === 0) perc.addMono(I.woodTick(s % 4 === 0 ? 1.9 : 1.55), t, s % 4 === 0 ? 0.12 : 0.07, 0.35);
      if (s === 0 || s === 8) drums.addMono(K2, t, 0.55);
      if (s === 3 || s === 11) drums.addMono(K2, t, 0.32);
      break;
    case 'taiko': {
      // a taiko ensemble: big low drums in a syncopated pattern (1, 1a, 2&, 3, 3&, 3a, 4&), a snare crack on 3; a
      // rolling fill ends every 4th bar
      const big = { 0: 52, 3: 66, 6: 52, 8: 46, 10: 78, 11: 78, 14: 62 };
      if (big[s] && !(k % 4 === 3 && s >= 8)) { const tm = I.tom(big[s], s === 0 || s === 8 ? 0.6 : 0.35, s + k); perc.addMono(tm, t, s === 0 || s === 8 ? 0.45 : 0.3, ((s % 5) / 4 - 0.5) * 0.6); verb.addMono(tm, t, 0.1); }
      if (s === 0 || s === 8) kick(t, 0.9);
      if (s === 8) { drums.addMono(SN, t, 0.42); verb.addMono(SN, t, 0.3); }
      if (k % 4 === 3 && s >= 8) perc.addMono(I.tom(110 - (s - 8) * 7, 0.3, s + 91), t, 0.28 + (s - 8) * 0.03, ((s - 8) / 7 - 0.5) * 0.8);
      break;
    }
    case 'rockDrive': // a cinematic rock beat: kick on 1, the "and" of 2, 3; a fat snare + clap on 2 and 4; 8th hats, open on the "and"s
      if (s === 0 || s === 6 || s === 8 || s === 11) kick(t, s === 11 ? 0.55 : 0.9);
      if (s === 4 || s === 12) { drums.addMono(SN, t, 0.6); drums.addMono(CL, t, 0.3); verb.addMono(SN, t, 0.3); }
      if (s % 2 === 0) drums.addMono(s % 4 === 2 ? HO : HC[(s / 2) % 2], t, s % 4 === 2 ? 0.09 : 0.08, 0.3);
      if (k % 4 === 3 && s >= 12) perc.addMono(I.tom(130 - (s - 12) * 15, 0.25, s + 61), t, 0.35, ((s - 12) / 3 - 0.5));
      break;
    case 'warMarch': // Vanguard's trailer toms with war drums on top: a low drum on every off-beat 8th of 1 and 3, a
      // snare + clap crack on 2 and 4 — warriors marching
      drumStep('epicToms', t, s, b, k);
      if (s === 2 || s === 10) { const tm = I.tom(58, 0.4, s + k + 100); perc.addMono(tm, t, 0.26, s === 2 ? -0.3 : 0.3); }
      if (s === 4 || s === 12) drums.addMono(CL, t, 0.32);
      break;
    case 'battleHybrid': // the rock beat with taiko under it: low drums on the "and" of 1 and 3 and on 4 and, all-out
      drumStep('rockDrive', t, s, b, k);
      if (s === 2 || s === 10 || s === 14) { const tm = I.tom(s === 14 ? 64 : 52, 0.45, s + k + 120); perc.addMono(tm, t, 0.34, s === 10 ? 0.3 : -0.3); verb.addMono(tm, t, 0.1); }
      break;
    case 'trailerHalf': // a modern trailer beat: half-time weight (giant snare + clap on 3) under double-time 16th hats,
      // a syncopated kick (1, 1a, 2&, 4&), low toms on 2 and 4; a 16th tom roll ends every 4th bar
      if (s === 0 || s === 3 || s === 6 || s === 14) kick(t, s === 0 ? 0.95 : 0.6);
      if (s === 8) { drums.addMono(SN, t, 0.65); drums.addMono(CL, t, 0.45); verb.addMono(SN, t, 0.45); verb.addMono(CL, t, 0.3); }
      drums.addMono(HC[s % 2], t, s % 4 === 0 ? 0.08 : 0.045, 0.3);
      if ((s === 4 || s === 12) && !(k % 4 === 3 && s >= 8)) { const tm = I.tom(68, 0.4, s + k + 140); perc.addMono(tm, t, 0.3, s === 4 ? -0.3 : 0.3); }
      if (k % 4 === 3 && s >= 8) perc.addMono(I.tom(140 - (s - 8) * 9, 0.22, s + 151), t, 0.26 + (s - 8) * 0.03, ((s - 8) / 7 - 0.5) * 0.8);
      break;
    case 'pendulum': // Siege's heartbeat with a pendulum: a tick-tock on every beat (high, low), soft shaker 8ths between
      if (s % 4 === 0) perc.addMono(I.woodTick(s % 8 === 0 ? 1.95 : 1.45), t, 0.13, s % 8 === 0 ? -0.4 : 0.4);
      if (s % 4 === 2) drums.addMono(SH[0], t, 0.04, 0);
      if (s === 0 || s === 8) drums.addMono(K2, t, 0.55);
      if (s === 3 || s === 11) drums.addMono(K2, t, 0.32);
      break;
    case 'sonarPulse': // Siege's heartbeat, but rim clicks in 8ths panned left/right like a sonar sweep instead of the clock
      if (s % 2 === 0) drums.addMono(I.rim(s % 4 === 0 ? 1.25 : 1.05, s + k), t, s % 4 === 0 ? 0.14 : 0.08, (s % 8 < 4 ? -0.45 : 0.45));
      if (s === 0 || s === 8) drums.addMono(K2, t, 0.55);
      if (s === 3 || s === 11) drums.addMono(K2, t, 0.32);
      break;
    case 'fallPulse': // Siege's heartbeat, with tight closed hats ticking in 8ths and a whisper of 16th shaker
      if (s % 2 === 0) drums.addMono(HC[(s / 2) % 2], t, s % 4 === 0 ? 0.11 : 0.07, 0.3);
      else drums.addMono(SH[1], t, 0.03, -0.3);
      if (s === 0 || s === 8) drums.addMono(K2, t, 0.55);
      if (s === 3 || s === 11) drums.addMono(K2, t, 0.32);
      break;
    case 'clockToms': {
      // a ticking clock over trailer drums: a wood tick on every 16th (louder on the beat), kick on 1 and the "and" of
      // 3, a deep tom on 3, a snare on 4; a tom fill ends every 4th bar
      perc.addMono(I.woodTick(s % 4 === 0 ? 1.9 : 1.5), t, s % 4 === 0 ? 0.13 : 0.06, 0.35);
      if (s === 0 || s === 10) kick(t, s ? 0.7 : 0.95);
      if (s === 8) { const tm = I.tom(58, 0.55, k + 70); perc.addMono(tm, t, 0.42); verb.addMono(tm, t, 0.15); }
      if (s === 12) { drums.addMono(SN, t, 0.5); verb.addMono(SN, t, 0.35); }
      if (k % 4 === 3 && s >= 8) perc.addMono(I.tom(130 - (s - 8) * 8, 0.22, s + 81), t, 0.26 + (s - 8) * 0.03, ((s - 8) / 7 - 0.5) * 0.8);
      break;
    }
    case 'cineHybrid': {
      // a hybrid trailer beat: punchy kick (1, the "and" of 2, 3), snare + clap on 2 and 4 in a big room, 8th hats,
      // low toms in between; a 16th tom roll ends every 4th bar
      if (s === 0 || s === 6 || s === 8) kick(t, s === 6 ? 0.6 : 0.95);
      if (s === 4 || s === 12) { drums.addMono(SN, t, 0.5); drums.addMono(CL, t, 0.45); verb.addMono(CL, t, 0.4); }
      if (s % 2 === 0) drums.addMono(HC[(s / 2) % 2], t, s % 4 ? 0.06 : 0.1, 0.3);
      if (s === 10 || s === 14) perc.addMono(I.tom(70, 0.4, s), t, 0.4, -0.2);
      if (k % 4 === 3 && s >= 8) perc.addMono(I.tom(150 - (s - 8) * 10, 0.2, s + 31), t, 0.28 + (s - 8) * 0.025, ((s - 8) / 7 - 0.5) * 0.8);
      break;
    }
    default: break; // 'none'
  }
}

// how loud each instrument plays the running figure (measured with STEMS=1 + tools/levels.js)
const OST_GAIN = { chant: 0.12, epiano: 0.12, pizz: 0.32, pluck: 0.16, marimba: 0.14, musicBox: 0.05, bell: 0.09, strings: 0.07, spiccato: 0.16 };

// ---------- every bar of every phase ----------
// The music has its own clock: each phase plays its cue at the cue's own steady tempo from the moment the chart reaches
// the phase start (TB(p.q0), the chart's clock, which still slows down at a turn) to the next turn, where the next
// cue takes over at once with its ~1 s pickup. The music never brakes. MB(x) = the time of beat x of the current phase.
let MT0 = 0, MBL = 0.6;
const MB = (x) => MT0 + x * MBL;
const chordOf = (name) => ({ name, notes: sc.CH[name].notes.map(m), bass: m(sc.CH[name].bass) });
// the chord the music plays at time t (for the hits' timpani and brass stab)
function musicChordAt(t) {
  const p = PHASES.find((q) => t >= TB(q.q0) && t < TB(q.q1)) || PHASES[PHASES.length - 1];
  const k = Math.max(0, Math.floor((t - TB(p.q0)) / (4 * 60 / p.c.bpm)));
  return chordOf(p.c.chords[Math.floor(k / (p.c.barsPerChord || 1)) % p.c.chords.length]);
}
const { TB, BEATS, FIRST_BEAT, END_BEAT, PHASES } = sc;
// which layers of a cue play in bar k of its phase. A cue may arrange itself over a cycle of bars (cue.arrange):
//   cycle   the length of the arrangement in bars (it repeats through a long phase)
//   from    { layer: first bar of the cycle it plays in } — drums, bass, ost, lead, answer, choir, double
//   drop    bars of the cycle where everything but the pads cuts out (the music holds its breath, then comes back)
// A cue without `arrange` plays every layer in every bar, as before.
function layersAt(cue, k) {
  const A = cue.arrange, on = { drums: true, bass: true, ost: !!cue.ostinato, lead: true, answer: !!cue.answer, choir: !!cue.choir, double: false, drop: false };
  if (!A) return on;
  const b = k % A.cycle;
  for (const [layer, from] of Object.entries(A.from || {})) on[layer] = (layer === 'double' || layer === 'chorus' || on[layer]) && b >= from;
  if ((A.drop || []).includes(b)) { on.drop = true; for (const l of ['drums', 'bass', 'ost', 'lead', 'answer', 'double']) on[l] = false; }
  return on;
}
// a long melody (cue.lead.melody / cue.answer.notes): [degree of the KEY (not the chord), start, length] in 8ths over
// `bars` bars; bar k plays the notes that start inside it
function playMelody(spec, key, k, q0, q1, gain, { octave = 4, target = lead, inst = spec.instrument, from = 0 } = {}) {
  const off = (k % spec.bars) * 8;
  for (const [deg, st, len] of spec.notes || spec.melody) {
    if (st < off || st >= off + 8) continue;
    const x = (st - off) / 2;
    if (x >= q1 - q0 || x < from) continue; // the bar was cut short / still in the pickup
    const t = MB(q0 + x), dur = (len / 2) * MBL;
    if (inBreath(t)) continue;
    const midi = degMidi(key, deg, 0, octave);
    play(target, inst, midi, t, dur * 0.95, gain, 0, deg + 7 + k);
    verb.addMono(I.pluck(midi, { decay: 0.3 }), t, 0.025);
  }
}
function renderBar(cue, type, q0, q1, k, chordName, nextIsTurnStart) {
  // q0..q1: the beats of this bar (q1 - q0 ≤ 4 when the phase ends early); k: bar number inside the phase
  const key = keyOf(cue), t0 = MB(q0), t1 = MB(q1), barDur = t1 - t0;
  const c = chordOf(chordName);
  const rd = rootDeg(key, chordName);
  const turn = type === 'peak' || type === 'bottom';
  const on = layersAt(cue, k);
  // the pickup (cue.pickup beats, ~1 s): the first bar of a phase opens on a drum roll swelling into the groove, which
  // then starts at once on beat pickup + 1 (instead of building up over bars)
  const pick = k === 0 && cue.pickup ? Math.min(cue.pickup, q1 - q0) : 0;
  if (pick && cue.softPickup) { // the tense cues: no roll, no crash — a dark swell and a low heartbeat into the groove
    const tp0 = MB(q0 + pick);
    fx.addMono(I.noiseSweep(tp0 - t0, 120, 1800, { q: 0.8, shape: (x) => x * x, pink: true, seed: q0 + 3 }), t0, 0.14);
    drums.addMono(K2, t0, 0.5); drums.addMono(K2, MB(q0 + 0.75), 0.35);
    fx.addMono(I.thud(48, 0.5, k + 3), tp0, 0.6);
  } else if (pick) {
    const tp0 = MB(q0 + pick);
    fx.addMono(I.noiseSweep(tp0 - t0, 400, 9000, { q: 1, shape: (x) => x * x, pink: true, seed: q0 + 3 }), t0, 0.16);
    drums.addMono(CR, tp0, 0.3, -0.2); verb.addMono(CR, tp0, 0.12); kick(tp0, 1);
    const tp = I.timpani(c.bass + 12, { decay: 1.8, seed: k + 2 }); perc.addMono(tp, tp0, 0.5); verb.addMono(tp, tp0, 0.25);
  }
  // pads: the chord for the whole bar
  for (const nn of c.notes) {
    if (cue.pads === 'supersaw') { const s = I.supersaw(nn, barDur * 0.98, { cutoff: 4200 }); pad.addStereo(s.L, s.R, t0, 0.045); }
    else if (cue.pads === 'strings') { const s = I.strings(nn, barDur, { attack: 0.3, bright: 0.7 }); pad.addStereo(s.L, s.R, t0, 0.07); verb.addStereo(s.L, s.R, t0, 0.04); }
    else if (cue.pads === 'bigStrings') { // long bowed chords, the bass note doubled low (the backbone of a cue with no ostinato)
      const s = I.strings(nn, barDur * 1.02, { attack: 0.45, release: 0.8, bright: 0.85, seed: nn }); pad.addStereo(s.L, s.R, t0, 0.085); verb.addStereo(s.L, s.R, t0, 0.06);
    }
    else if (cue.pads === 'power') { /* power chord below: root, fifth, octave on a gritty supersaw */ }
    else if (cue.pads === 'brassPad') { const b = I.brassNote(nn - 12, barDur * 0.95, { bright: 0.7, seed: nn }); pad.addStereo(b.L, b.R, t0, 0.05); verb.addStereo(b.L, b.R, t0, 0.03); }
    else { const p = I.padNote(nn - 12, barDur, { cutoff: cue.pads === 'darkPad' ? 700 : 1300, attack: 0.4, release: 1.1 }); pad.addStereo(p.L, p.R, t0, 0.08); }
  }
  if (cue.pads === 'power') for (const iv of [0, 7, 12]) { const s = I.supersaw(c.bass + 24 + iv, barDur * 0.98, { cutoff: 2600, detune: 28, seed: iv + 5 }); pad.addStereo(s.L, s.R, t0, 0.13); }
  if (cue.pads === 'bigStrings') { const s = I.strings(c.bass + 12, barDur * 1.02, { attack: 0.5, release: 0.8, bright: 0.6, seed: 3 }); pad.addStereo(s.L, s.R, t0, 0.08); }
  // a choir holding the chord (cinematic cues): tenors low, altos high, a long reverb
  if (on.choir) for (const nn of c.notes) {
    const v = I.voice(nn, barDur * 0.97, { syl: cue.choir, type: nn >= m('A4') ? 'alto' : 'tenor', seed: nn + k, vib: 0.2, breath: 0.05 });
    pad.addMono(v, t0, 0.05, nn >= m('A4') ? 0.3 : -0.3); verb.addMono(v, t0, 0.05);
  }
  // braams (battle cues): a huge low brass + saw blast on the downbeat of every 2nd bar (the groove's first beat in a
  // pickup bar), the sound of the enemy's horns
  if (cue.braam && k % 2 === 0) {
    const tb = MB(q0 + pick), len = Math.min(1.8, MB(q1) - tb + 0.6);
    for (const iv of [0, 7]) { const b = I.brassNote(c.bass + 12 + iv, len, { bright: 1.25, seed: iv + k }); fx.addStereo(b.L, b.R, tb, 0.2); verb.addStereo(b.L, b.R, tb, 0.08); }
    const sw = I.supersaw(c.bass + 12, len, { cutoff: 900, detune: 30, seed: k + 3 }); fx.addStereo(sw.L, sw.R, tb, 0.12);
    fx.addMono(I.subBoom(1.4, 60, 30), tb, 0.35);
  }
  // cinematic swell: a riser into every 4th bar (and into the bar after a drop), a crash on its downbeat
  if (cue.swell) {
    if (k % 4 === 3 || on.drop) fx.addMono(I.noiseSweep(barDur, 300, 8000, { q: 1, shape: (x) => x * x, pink: true, seed: q0 + 7 }), t0, on.drop ? 0.2 : 0.12);
    if (k % 4 === 0 && k > 0) { drums.addMono(CR, t0, 0.24, -0.2); verb.addMono(CR, t0, 0.1); }
  }
  // drums, bass, ostinato on the 16th grid of this bar (the pattern's own bar, from the phase start)
  let hit = 0; // ostinato notes played so far in this bar (for rhythm masks)
  for (let s = 0; s < (q1 - q0) * 4; s++) {
    const t = MB(q0 + s / 4);
    if (inBreath(t)) continue;
    if (s < pick * 4 && cue.softPickup) continue; // (the soft pickup is the swell and heartbeat above)
    if (s < pick * 4) { // the pickup roll: snare + toms in 16ths, crescendo, panned across
      const u = s / (pick * 4);
      drums.addMono(SN, t, 0.12 + 0.35 * u, (u - 0.5) * 0.6);
      perc.addMono(I.tom(150 - u * 80, 0.2, s + 50), t, 0.15 + 0.3 * u, (0.5 - u) * 0.6);
      continue;
    }
    if (on.drums) drumStep(cue.drums, t, s, 0, k);
    else if (!on.drop && cue.lightDrums) drumStep(cue.lightDrums, t, s, 0, k); // the sparse bars before the full beat
    const R = c.bass + 12, bl = MBL;
    if (on.bass) switch (cue.bass) {
      case 'octaves': if (s % 2 === 0) bass.addMono(I.bass(s % 4 ? R + 12 : R, bl * 0.4, { bright: 0.8 }), t, s % 4 ? 0.35 : 0.5); break;
      case 'rolling808': if (s === 0 || s === 6 || s === 10) bass.addMono(I.bass808(R - 12, bl * 1.2, { drive: 1.6 }), t, 0.45); break;
      case 'pulse8': if (s % 2 === 0) bass.addMono(I.bass(R, bl * 0.4, { bright: 0.5 }), t, 0.45); break;
      case 'root': if (s === 0 || s === 8) bass.addMono(I.bass(R, bl * 1.8, { bright: 0.4, sub: 0.9 }), t, 0.32); break;
      case 'drone': if (s === 0) bass.addMono(I.bass(R - 12, barDur * 0.95, { bright: 0.2, sub: 1 }), t, 0.3); break;
      case 'celloDrive': // driving cello 8ths on the root with accents (1, the "and" of 2, 4), a sub under each half bar
        if (s % 2 === 0) { const acc = s === 0 || s === 6 || s === 12; const c8 = I.strings(R - 12, bl * 0.42, { attack: 0.01, release: 0.07, bright: acc ? 1 : 0.75, seed: s }); bass.addStereo(c8.L, c8.R, t, acc ? 0.45 : 0.26); }
        if (s === 0 || s === 8) bass.addMono(I.bass(R - 12, bl * 1.8, { bright: 0.2, sub: 1 }), t, 0.35);
        break;
      case 'drive8': if (s % 2 === 0) bass.addMono(I.bass(s % 8 === 6 ? R + 7 : R, bl * 0.42, { bright: 0.9, sub: 0.8 }), t, s % 4 ? 0.36 : 0.5); break; // driving 8ths, a fifth on the "and" of 2 and 4
      case 'halfSub': if (s === 0) bass.addMono(I.bass(R - 12, bl * 3.6, { bright: 0.25, sub: 1 }), t, 0.5); break; // one long low note per bar
      default: break;
    }
    const o = cue.ostinato;
    if (o && on.ost) {
      const every = 16 / (4 * o.perBeat);
      if (s % every === 0 && (!o.mask || o.mask[s / every])) {
        const step = o.mask ? hit++ : s / every, deg = o.figure[step % o.figure.length];
        const midi = degMidi(key, deg, rd, o.instrument === 'musicBox' || o.instrument === 'bell' ? 5 : o.octave || 4);
        play(ost, o.instrument, midi, t, bl / o.perBeat, o.gain || OST_GAIN[o.instrument] || 0.12, step % 2 ? 0.3 : -0.3, s + 1);
        if (!turn && !o.mask) dly.addMono(I.pizz(midi, { seed: s }), t, 0.02);
        if (o.mask) dly.addMono(I.pluck(midi, { decay: 0.12, cutoff: 3000, seed: s }), t, 0.03); // the syncopation echoes
      }
    }
  }
  // the lead: a long melody over several bars (lead.melody), or the short phrase on every second bar (and in a turn)
  if (cue.lead.melody) {
    if (on.lead) playMelody(cue.lead, key, k, q0, q1, cue.lead.gain || 0.18, { octave: cue.lead.octave || 4, from: pick });
    if (on.double) playMelody(cue.lead, key, k, q0, q1, 0.06, { octave: (cue.lead.octave || 4) + 1, inst: 'stringsHigh', from: pick }); // strings an octave up
    if (on.chorus) playMelody(cue.lead, key, k, q0, q1, 0.1, { octave: cue.lead.octave || 4, inst: 'choir', from: pick }); // the choir sings the melody (an anthem)
  } else if (on.lead && (k % 2 === 1 || turn)) {
    for (const [deg, st, len] of cue.lead.phrase) {
      if (st / 2 >= q1 - q0) continue; // the bar was cut short
      const t = MB(q0 + st / 2), dur = Math.min(len / 2, q1 - q0 - st / 2) * MBL;
      if (inBreath(t)) continue;
      play(lead, cue.lead.instrument, degMidi(key, deg, rd, 4), t, dur * 0.95, turn ? 0.14 : 0.18, 0, deg + 7);
      verb.addMono(I.pluck(degMidi(key, deg, rd, 4), { decay: 0.3 }), t, 0.03);
    }
  }
  // the answer: a second voice replying to the lead (cue.answer, same format as a long melody)
  if (on.answer) playMelody(cue.answer, key, k, q0, q1, cue.answer.gain || 0.14, { octave: cue.answer.octave || 3, from: pick });
  // the first bar of a phase (= right after an ALL-TIME HIGH or LOW): a timpani swell and a crash as the new trend
  // sets off (not at the very start: the film opens softly, fading in)
  if (k === 0 && MT0 > 0.01 && !pick) { // (a cue with a pickup has its own crash where the groove starts)
    const tp = I.timpani(c.bass + 12, { decay: 2.2 }); perc.addMono(tp, t0, 0.5); verb.addMono(tp, t0, 0.3);
    drums.addMono(type === 'uptrend' ? CR : CR2, t0, 0.28, 0.2);
  }
  // the last bar before a turn: a riser into the slow-down
  if (nextIsTurnStart) fx.addMono(I.noiseSweep(barDur, 200, 7000, { q: 0.9, shape: (x) => x * x, pink: true, seed: q0 }), t0, 0.22);
}

// no title: the music starts on frame 0, faded in with the picture (FADE_IN below)
PHASES.forEach((p, i) => {
  const toTurn = !!PHASES[i + 1]; // every phase ends on an ALL-TIME HIGH or LOW
  MT0 = TB(p.q0); MBL = 60 / p.c.bpm;
  const beats = (TB(p.q1) - MT0) / MBL; // the phase's length in beats of its own cue (the last bar may be cut short)
  for (let q = 0, k = 0; q < beats - 1e-6; q += 4, k++) {
    const q1 = Math.min(q + 4, beats);
    renderBar(p.c, p.type, q, q1, k, p.c.chords[Math.floor(k / (p.c.barsPerChord || 1)) % p.c.chords.length], toTurn && q1 >= beats - 1e-6);
  }
});

// ---------- the hits: hit-2 events only (hit 1 has no sound) ----------
// a reversed cymbal and a riser swell INTO the moment (cut a 16th before it: a held breath), then
// the impact: double kick + sub boom, two crashes spread wide, timpani, a brass chord stab; a rally adds a rising bell
// cascade and an upward sweep, a crash adds a deep thud and a falling sweep
const REV = I.crash(31).slice(0, Math.round(1.4 * SR)).reverse();
for (const h of hits) {
  const up = h.kind !== 'down', ch = musicChordAt(h.t + 0.01), pre = REV.length / SR;
  hFx.addMono(REV, h.t - pre, 0.32);
  hFx.addMono(I.noiseSweep(1.6, up ? 400 : 1200, up ? 9000 : 6000, { q: 1.1, shape: (x) => x * x * x, pink: true, seed: h.day }), h.t - 1.6, 0.16);
  hFx.addMono(I.subBoom(3.2, up ? 72 : 60, up ? 32 : 24), h.t, 0.95);
  hDrums.addMono(K, h.t, 1); hDrums.addMono(K2, h.t + 0.004, 0.6);
  hDrums.addMono(CR, h.t, 0.55, -0.45); hDrums.addMono(CR2, h.t + 0.012, 0.5, 0.45);
  const tp = I.timpani(ch.bass + 12, { decay: 2 });
  hPerc.addMono(tp, h.t, 0.85); verb.addMono(tp, h.t, 0.35);
  for (const iv of up ? [0, 7, 12, 16, 19] : [0, 3, 7, 12, 15]) {
    const st = I.brassNote(ch.bass + 24 + iv, up ? 1.1 : 0.8, { stab: true, seed: iv + 3 });
    hLead.addStereo(st.L, st.R, h.t, 0.15); verb.addStereo(st.L, st.R, h.t, 0.1);
  }
  if (up) {
    ['D6', 'F6', 'A6', 'D7', 'F7', 'A7'].forEach((nn, k) => { const b = I.bell(MU.mtof(m(nn)), 0.7); hFx.addMono(b, h.t + 0.08 + k * 0.06, 0.12, (k / 5 - 0.5) * 1.2); verb.addMono(b, h.t + 0.08 + k * 0.06, 0.1); });
    hFx.addMono(I.noiseSweep(1.2, 800, 9000, { q: 1.3, pink: true, seed: h.day + 1 }), h.t + 0.05, 0.14);
  } else {
    hFx.addMono(I.thud(42, 0.6, h.day), h.t, 0.8);
    hFx.addMono(I.noiseSweep(1.6, 6000, 160, { q: 1.3, pink: true, seed: h.day + 1 }), h.t + 0.05, 0.16);
  }
}
// the music does not change or duck at a hit-2 event: the SFX play on top of it (they keep their own buses)
// the end: the last candle closes
fx.addMono(I.subBoom(3.2), ev.end, 0.8);
drums.addMono(CR, ev.end, 0.45); drums.addMono(K, ev.end, 0.9);
perc.addMono(I.timpani(m('D2'), { decay: 2.5 }), ev.end, 0.8);
for (const nn of ['D3', 'A3', 'D4', 'F4', 'A4']) {
  const b = I.brassNote(m(nn), 3.4, { seed: m(nn) }); lead.addStereo(b.L, b.R, ev.end, 0.12); verb.addStereo(b.L, b.R, ev.end, 0.08);
  const st = I.strings(m(nn), 4, { attack: 0.05 }); pad.addStereo(st.L, st.R, ev.end, 0.07);
}

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks);
const stems = {
  drums, bass, pad, ost, lead, perc, fx, hDrums, hPerc, hLead, hFx,
  verb: reverb(verb, { room: 0.88, damp: 0.35 }),
  dly: pingpong(dly, 0.375, 0.3, 3500),
};
const GAIN = { drums: 0.42, bass: 0.75, pad: 2.2, ost: 3.0, lead: 1.6, perc: 0.8, fx: 0.8, verb: 1, dly: 1 };
Object.assign(GAIN, { hDrums: GAIN.drums, hPerc: GAIN.perc, hLead: GAIN.lead, hFx: GAIN.fx }); // the SFX keep the levels they had
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 24);
for (const [a, b] of breaths) MIX.gate(mix, a, b); // one beat of real silence before each big moment
for (const t of [...hits.map((h) => h.t), ev.end]) MIX.gate(mix, t - beatLen(t) / 4, t); // a held 16th before every hit and the end
MIX.fadeOut(mix, DURATION - 2.2, DURATION);
const FADE_IN = 1.0; // the music fades in with the picture (film.js FADE_IN), an S-curve
mix.applyGain((t) => (t >= FADE_IN ? 1 : (t / FADE_IN) ** 2 * (3 - 2 * t / FADE_IN)));
// No voice-over, so the music carries the film; it is mastered to -16 LUFS (not -14) so that the hit-2 moments have
// room to land ~6 dB above the bed without the limiter flattening them (YouTube only turns louder films down)
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: parseFloat(process.env.LUFS || '-16') });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${sc.END_BEAT - sc.FIRST_BEAT} beats in ${sc.PHASES.length} phases${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
