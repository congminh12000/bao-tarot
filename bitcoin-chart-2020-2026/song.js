// THE SONG — plays the cue of every market phase (data/music.js) bar by bar, at the tempo map in score.js,
// plus a hit on every event in score.hits. Renders out/music.wav.
//   node song.js            (STEMS=1 also writes out/stem-*.wav, LUFS=-14 masters to a loudness)
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
const verb = bus(), dly = bus();
const kicks = [];
const beatLen = (t) => clock.beatAt(t); // seconds per beat at t (the tempo changes)

// ---------- scales: scale degrees -> MIDI ----------
const MODES = { minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11], dorian: [0, 2, 3, 5, 7, 9, 10] };
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
    default: break; // 'none'
  }
}

// how loud each instrument plays the running figure (measured with STEMS=1 + tools/levels.js)
const OST_GAIN = { pizz: 0.32, pluck: 0.16, marimba: 0.14, musicBox: 0.05, bell: 0.09, strings: 0.07 };

// ---------- every bar of every phase (a phase starts on any beat; its bars count from its own start) ----------
const { TB, BEATS, FIRST_BEAT, END_BEAT, PHASES } = sc;
function renderBar(cue, type, q0, q1, k, chordName, nextIsTurnStart) {
  // q0..q1: the beats of this bar (q1 - q0 ≤ 4 when the phase ends early); k: bar number inside the phase
  const key = keyOf(cue), t0 = TB(q0), t1 = TB(q1), barDur = t1 - t0;
  const c = { name: chordName, ...sc.chordAt(t0 + 0.001) };
  const rd = rootDeg(key, chordName);
  const turn = type === 'peak' || type === 'bottom';
  // pads: the chord for the whole bar
  for (const nn of c.notes) {
    if (cue.pads === 'supersaw') { const s = I.supersaw(nn, barDur * 0.98, { cutoff: 4200 }); pad.addStereo(s.L, s.R, t0, 0.045); }
    else if (cue.pads === 'strings') { const s = I.strings(nn, barDur, { attack: 0.3, bright: 0.7 }); pad.addStereo(s.L, s.R, t0, 0.07); verb.addStereo(s.L, s.R, t0, 0.04); }
    else { const p = I.padNote(nn - 12, barDur, { cutoff: cue.pads === 'darkPad' ? 700 : 1300, attack: 0.4, release: 1.1 }); pad.addStereo(p.L, p.R, t0, 0.08); }
  }
  // drums, bass, ostinato on the 16th grid of this bar (the pattern's own bar, from the phase start)
  for (let s = 0; s < (q1 - q0) * 4; s++) {
    const t = TB(q0 + s / 4);
    if (inBreath(t)) continue;
    drumStep(cue.drums, t, s, 0, k);
    const R = c.bass + 12, bl = beatLen(t);
    switch (cue.bass) {
      case 'octaves': if (s % 2 === 0) bass.addMono(I.bass(s % 4 ? R + 12 : R, bl * 0.4, { bright: 0.8 }), t, s % 4 ? 0.35 : 0.5); break;
      case 'rolling808': if (s === 0 || s === 6 || s === 10) bass.addMono(I.bass808(R - 12, bl * 1.2, { drive: 1.6 }), t, 0.45); break;
      case 'pulse8': if (s % 2 === 0) bass.addMono(I.bass(R, bl * 0.4, { bright: 0.5 }), t, 0.45); break;
      case 'root': if (s === 0 || s === 8) bass.addMono(I.bass(R, bl * 1.8, { bright: 0.4, sub: 0.9 }), t, 0.5); break;
      case 'drone': if (s === 0) bass.addMono(I.bass(R - 12, barDur * 0.95, { bright: 0.2, sub: 1 }), t, 0.5); break;
      default: break;
    }
    const o = cue.ostinato, every = 16 / (4 * o.perBeat);
    if (s % every === 0) {
      const step = s / every, deg = o.figure[step % o.figure.length];
      const midi = degMidi(key, deg, rd, o.instrument === 'musicBox' || o.instrument === 'bell' ? 5 : 4);
      play(ost, o.instrument, midi, t, bl / o.perBeat, OST_GAIN[o.instrument] || 0.12, step % 2 ? 0.3 : -0.3, s + 1);
      if (!turn) dly.addMono(I.pizz(midi, { seed: s }), t, 0.02);
    }
  }
  // lead phrase on every second bar of the phase, and always in a turn
  if (k % 2 === 1 || turn) {
    for (const [deg, st, len] of cue.lead.phrase) {
      if (st / 2 >= q1 - q0) continue; // the bar was cut short
      const t = TB(q0 + st / 2), dur = Math.min(len / 2, q1 - q0 - st / 2) * beatLen(t);
      if (inBreath(t)) continue;
      play(lead, cue.lead.instrument, degMidi(key, deg, rd, 4), t, dur * 0.95, turn ? 0.14 : 0.18, 0, deg + 7);
      verb.addMono(I.pluck(degMidi(key, deg, rd, 4), { decay: 0.3 }), t, 0.03);
    }
  }
  // the first bar of a phase (= right after a top or a bottom): a timpani swell and a crash as the new trend sets off
  if (k === 0 && q0 > FIRST_BEAT) {
    const tp = I.timpani(c.bass + 12, { decay: 2.2 }); perc.addMono(tp, t0, 0.5); verb.addMono(tp, t0, 0.3);
    drums.addMono(type === 'uptrend' ? CR : CR2, t0, 0.28, 0.2);
  }
  // the last bar before a turn: a riser into the slow-down
  if (nextIsTurnStart) fx.addMono(I.noiseSweep(barDur, 200, 7000, { q: 0.9, shape: (x) => x * x, pink: true, seed: q0 }), t0, 0.22);
}

// the title bar: a pad and a timpani roll rising into the first phase
{
  const c0 = sc.chordAt(0.001), dur = TB(FIRST_BEAT);
  for (const nn of c0.notes) { const p = I.padNote(nn - 12, dur, { cutoff: 1000, attack: 0.4 }); pad.addStereo(p.L, p.R, 0, 0.08); }
  for (let i = 0; i < 12; i++) perc.addMono(I.timpani(c0.bass + 12, { decay: 0.5, seed: i }), (i * dur) / 12, 0.08 + 0.2 * i / 12);
}
PHASES.forEach((p, i) => {
  const toTurn = !!PHASES[i + 1]; // every phase ends on a top or a bottom
  for (let q = p.q0, k = 0; q < p.q1; q += 4, k++) {
    const q1 = Math.min(q + 4, p.q1);
    renderBar(p.c, p.type, q, q1, k, p.c.chords[k % p.c.chords.length], toTurn && q1 === p.q1);
  }
});

// ---------- the hits ----------
for (const h of hits) {
  const up = h.kind !== 'down', ch = sc.chordAt(h.t + 0.01);
  fx.addMono(I.subBoom(h.big ? 2.6 : 1.6, up ? 70 : 58, up ? 34 : 26), h.t, h.big ? 0.8 : 0.6);
  drums.addMono(up ? CR : CR2, h.t, h.big ? 0.5 : 0.36, up ? 0.25 : -0.25);
  drums.addMono(K, h.t, 0.9);
  const tp = I.timpani(ch.bass + 12, { decay: 1.4 });
  perc.addMono(tp, h.t, 0.7); verb.addMono(tp, h.t, 0.3);
  for (const iv of up ? [0, 7, 12, 16] : [0, 3, 7, 12]) {
    const st = I.brassNote(ch.bass + 24 + iv, up ? 0.7 : 0.45, { stab: true, seed: iv + 3 });
    lead.addStereo(st.L, st.R, h.t, 0.13); verb.addStereo(st.L, st.R, h.t, 0.08);
  }
  fx.addMono(I.noiseSweep(0.9, up ? 600 : 5000, up ? 6000 : 300, { q: 1.4, pink: true }), h.t + 0.05, 0.12);
}
// the smaller moments: a heavy thud into a crash, a bright shimmer into a rally
for (const e of sc.EVENTS) {
  if (e.hit || e.kind === 'info') continue;
  if (e.kind === 'down') {
    fx.addMono(I.thud(55, 0.35, e.day), e.t, 0.5);
    fx.addMono(I.noiseSweep(0.7, 2500, 180, { q: 1.2, pink: true, seed: e.day }), e.t, 0.14, -0.2);
  } else {
    for (const [k, nn] of [[0, 'D6'], [1, 'A6'], [2, 'D7']]) { const b = I.bell(MU.mtof(m(nn)), 0.5); fx.addMono(b, e.t + k * 0.045, 0.1, (k - 1) * 0.4); verb.addMono(b, e.t + k * 0.045, 0.08); }
  }
}
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
  drums, bass, pad, ost, lead, perc, fx,
  verb: reverb(verb, { room: 0.88, damp: 0.35 }),
  dly: pingpong(dly, 0.375, 0.3, 3500),
};
const GAIN = { drums: 0.42, bass: 0.75, pad: 2.2, ost: 3.0, lead: 1.6, perc: 0.8, fx: 0.8, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 24);
for (const [a, b] of breaths) MIX.gate(mix, a, b); // one beat of real silence before each big moment
for (const t of [...hits.map((h) => h.t), ev.end]) MIX.gate(mix, t - beatLen(t) / 4, t); // a held 16th before every hit and the end
MIX.fadeOut(mix, DURATION - 2.2, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : null });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s, ${sc.END_BEAT - sc.FIRST_BEAT} beats in ${sc.PHASES.length} phases${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
