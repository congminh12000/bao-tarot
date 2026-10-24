// THE SONG — a dark, driving cue in D minor, rendered from the score into out/music.wav.
// The arrangement follows score.ARR bar by bar (intro / bull / bear / build / drop / outro), and every event in
// score.hits is a hit here (sub boom + crash + timpani + brass stab).
//   node song.js            (STEMS=1 also writes out/stem-*.wav, LUFS=-14 masters to a loudness)
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock, hits, ARR, styleAt, inBreath, breaths } = sc;
const BAR = BEAT * 4;
const LAST = ARR.length - 3; // the last chart bar + 1

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), ost = bus(), lead = bus(), perc = bus(), fx = bus();
const verb = bus(), dly = bus();

const K = I.kick({ punch: 1.2, tail: 0.4 }), K2 = I.kick({ punch: 0.8, tail: 0.6, seed: 4 });
const SN = I.snare({ tone: 1.1, decay: 0.18 }), CL = I.clap(), CR = I.crash(18), CR2 = I.crash(23);
const HC = [I.hat(false, 11), I.hat(false, 12)], HO = I.hat(true, 14);
const kicks = [];
// how far into its run of the same style a bar is (0 = first bar of the section)
const runOf = (b) => { let r = 0; while (b - r - 1 >= 0 && ARR[b - r - 1] === ARR[b]) r++; return r; };

// ---------- drums ----------
clock.eachStep(0, LAST, 16, (t, b, s) => {
  if (inBreath(t)) return;
  const st = ARR[b], run = runOf(b);
  if (st === 'intro') { if (b >= 1 && (s === 0 || s === 3 || s === 8 || s === 11)) drums.addMono(K2, t, s % 8 ? 0.45 : 0.7); return; }
  if (st === 'bull') {
    const full = run >= 2;
    if (s === 0 || s === 8 || (full && (s === 6 || s === 10))) { drums.addMono(K, t, 0.85); kicks.push(t); }
    if (run >= 1 && (s === 4 || s === 12)) { drums.addMono(SN, t, 0.55); verb.addMono(SN, t, 0.25); }
    if (full ? s % 2 === 0 : s % 4 === 2) drums.addMono(HC[(s / 2) % 2], t, s % 4 === 2 ? 0.2 : 0.11, 0.25);
    return;
  }
  if (st === 'bear') { // half time, heavy and empty, a clock ticking
    if (s === 0) { drums.addMono(K, t, 0.8); kicks.push(t); }
    if (s === 8) { const tm = I.tom(70, 0.5, b); drums.addMono(tm, t, 0.5); verb.addMono(tm, t, 0.3); }
    if (s % 4 === 0) perc.addMono(I.woodTick(s % 8 ? 1.4 : 1.8), t, 0.12, 0.4);
    return;
  }
  if (st === 'build') { // the snare roll speeds up bar by bar into the silence
    if (s % 8 === 0 || (run >= 2 && s % 4 === 0)) { drums.addMono(K, t, 0.85); kicks.push(t); }
    const roll = [8, 4, 2, 1][Math.min(run, 3)];
    if (s % roll === (roll === 8 ? 4 : 0)) drums.addMono(SN, t, 0.25 + 0.1 * run + 0.02 * s / 16 * run, 0.05);
    if (s % 2 === 0) drums.addMono(HC[0], t, 0.1, 0.3);
    return;
  }
  if (st === 'drop') { // four on the floor
    if (s % 4 === 0) { drums.addMono(K, t, 0.95); kicks.push(t); }
    if (s === 4 || s === 12) { drums.addMono(CL, t, 0.6); drums.addMono(SN, t, 0.35); verb.addMono(CL, t, 0.25); }
    if (s % 4 === 2) drums.addMono(HO, t, 0.14, 0.3); else drums.addMono(HC[s % 2], t, 0.09, -0.3);
  }
});

// ---------- bass ----------
clock.eachStep(1, LAST, 8, (t, b, s) => {
  if (inBreath(t)) return;
  const c = sc.chordAt(t);
  if (!c) return;
  const R = c.bass + 12, st = ARR[b];
  if (st === 'intro') { if (s === 0) bass.addMono(I.bass(R - 12, BAR * 0.95, { bright: 0.2, sub: 1 }), t, 0.5); }
  else if (st === 'bull' || st === 'build') bass.addMono(I.bass(R, BEAT / 2 * 0.75, { bright: 0.6 }), t, s % 2 ? 0.35 : 0.5);
  else if (st === 'bear') { if (s === 0 || s === 3) bass.addMono(I.bass(R - 12, BEAT * (s ? 1 : 1.5), { bright: 0.25, sub: 1 }), t, 0.55); }
  else if (st === 'drop') { if (s % 2 === 0) bass.addMono(I.bass808(R - 12, BEAT * 0.9, { drive: 1.8 }), t, 0.42); bass.addMono(I.bass(s % 2 ? R + 12 : R, BEAT / 2 * 0.7, { bright: 1 }), t, 0.3); }
});

// ---------- pads + strings ----------
for (const c of sc.chords) {
  if (c.t0 >= DURATION) continue;
  let t1 = Math.min(c.t1, DURATION);
  for (const [a] of breaths) if (c.t0 < a && t1 > a) t1 = a;
  const st = styleAt(c.t0 + 0.01);
  if (st === 'outro') continue;
  const big = st === 'drop';
  for (const nn of c.notes) {
    const { L, R } = I.padNote(nn - 12, t1 - c.t0, big ? { cutoff: 2400, attack: 0.04 } : { cutoff: 900, attack: 0.6, release: 1.2 });
    pad.addStereo(L, R, c.t0, 0.08);
    if (big) { const sw = I.supersaw(nn, (t1 - c.t0) * 0.98, { cutoff: 4200 }); pad.addStereo(sw.L, sw.R, c.t0, 0.05); }
    if (st === 'bear' || st === 'build') { const sr = I.strings(nn, t1 - c.t0, { attack: 0.4, bright: 0.7 }); pad.addStereo(sr.L, sr.R, c.t0, 0.06); verb.addStereo(sr.L, sr.R, c.t0, 0.04); }
  }
}

// ---------- the ostinato: 16th-note pizzicato, the engine of the cue ----------
const OST = [0, 7, 12, 7, 3, 7, 12, 15];
clock.eachStep(1, LAST, 16, (t, b, s) => {
  if (inBreath(t)) return;
  const c = sc.chordAt(t);
  if (!c) return;
  const st = ARR[b];
  const minor = ['Dm', 'Gm'].includes(c.name);
  let iv = OST[s % 8];
  if (iv === 3 && !minor) iv = 4;
  if (iv === 15 && !minor) iv = 16;
  const quiet = st === 'intro' || st === 'bear';
  if (quiet && s % 2) return; // 8ths when it's quiet
  const g = st === 'intro' ? 0.12 + 0.1 * (t / T(2)) : st === 'bear' ? 0.13 : st === 'drop' ? 0.16 : 0.2;
  const x = I.pizz(c.bass + 24 + iv, { seed: s + 1 });
  ost.addMono(x, t, g * (s % 4 === 0 ? 1.15 : 0.85), s % 2 ? 0.35 : -0.35);
  if (st !== 'bear') dly.addMono(x, t, 0.03);
});

// ---------- brass hook in the drops ----------
for (const nn of sc.brass) {
  const a = I.brassNote(nn.midi, nn.dur * 0.92), b = I.brassNote(nn.midi - 12, nn.dur * 0.92, { bright: 0.8, seed: 99 });
  lead.addStereo(a.L, a.R, nn.t, 0.28); lead.addStereo(b.L, b.R, nn.t, 0.18);
  verb.addStereo(a.L, a.R, nn.t, 0.12); dly.addStereo(a.L, a.R, nn.t, 0.04);
}

// ---------- the hits ----------
for (const h of hits) {
  const up = h.kind !== 'down';
  fx.addMono(I.subBoom(h.big ? 2.6 : 1.6, up ? 70 : 58, up ? 34 : 26), h.t, h.big ? 0.8 : 0.6);
  drums.addMono(up ? CR : CR2, h.t, h.big ? 0.5 : 0.36, up ? 0.25 : -0.25);
  drums.addMono(K, h.t, 0.9);
  const ch = sc.chordAt(h.t + 0.01);
  const tp = I.timpani(ch.bass + 12, { decay: 1.4 });
  perc.addMono(tp, h.t, 0.7); verb.addMono(tp, h.t, 0.3);
  for (const iv of up ? [0, 7, 12, 16] : [0, 3, 7, 12]) {
    const st = I.brassNote(ch.bass + 24 + iv, up ? 0.7 : 0.45, { stab: true, seed: iv + 3 });
    lead.addStereo(st.L, st.R, h.t, 0.13); verb.addStereo(st.L, st.R, h.t, 0.08);
  }
  fx.addMono(I.noiseSweep(0.9, up ? 600 : 5000, up ? 6000 : 300, { q: 1.4, pink: true }), h.t + 0.05, 0.12);
}
// the timpani roll + riser under the title, and a riser through every build
for (let i = 0; i < 18; i++) { const t = T(0, 1) + i * BEAT / 3; perc.addMono(I.timpani(m('D2'), { decay: 0.5, seed: i }), t, 0.08 + 0.18 * i / 18); }
fx.addMono(I.noiseSweep(T(2) - T(1), 200, 7000, { q: 0.9, shape: (x) => x * x, pink: true }), T(1), 0.3);
for (const [a] of breaths) fx.addMono(I.noiseSweep(a - (a - T(4) + BEAT), 150, 9000, { q: 0.9, shape: (x) => x * x * x, pink: true }), a - T(4) + BEAT, 0.5);
// the end: the last candle closes
fx.addMono(I.subBoom(3.2), ev.end, 0.8);
drums.addMono(CR, ev.end, 0.45); drums.addMono(K, ev.end, 0.9);
perc.addMono(I.timpani(m('D2'), { decay: 2.5 }), ev.end, 0.8);
for (const nn of ['D3', 'A3', 'D4', 'F4', 'A4']) {
  const b = I.brassNote(m(nn), 3.4, { seed: m(nn) }); lead.addStereo(b.L, b.R, ev.end, 0.12); verb.addStereo(b.L, b.R, ev.end, 0.08);
  const st = I.strings(m(nn), 4, { attack: 0.05 }); pad.addStereo(st.L, st.R, ev.end, 0.07);
}

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks.filter((t) => styleAt(t) === 'drop'));
const stems = {
  drums, bass, pad, ost, lead, perc, fx,
  verb: reverb(verb, { room: 0.88, damp: 0.35 }),
  dly: pingpong(dly, BEAT * 0.75, 0.35, 3500),
};
const GAIN = { drums: 0.42, bass: 0.75, pad: 2.4, ost: 3.4, lead: 1.7, perc: 0.8, fx: 0.8, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 24);
for (const [a, b] of breaths) MIX.gate(mix, a, b); // one beat of real silence before each big moment
for (const h of hits) if (!h.big) MIX.gate(mix, h.t - BEAT / 4, h.t); // a held 16th before every other hit
MIX.fadeOut(mix, DURATION - 2.2, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : null });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
