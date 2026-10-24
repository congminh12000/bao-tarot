// THE SONG — a dark, driving cue in D minor, rendered from the score into out/music.wav.
// Every market moment in score.hits is a hit here (sub boom + crash + timpani + brass stab).
//   node song.js            (STEMS=1 also writes out/stem-*.wav, LUFS=-14 masters to a loudness)
const path = require('path');
const { SR, Bus, reverb, pingpong } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock, S, hits } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), bass = bus(), pad = bus(), ost = bus(), lead = bus(), perc = bus(), fx = bus();
const verb = bus(), dly = bus();
const inS = (t, s) => t >= S[s][0] - 1e-6 && t < S[s][1] - 1e-6;
const hitAt = (t, w = 0.01) => hits.some((h) => Math.abs(h.t - t) < w);

const K = I.kick({ punch: 1.2, tail: 0.4 }), K2 = I.kick({ punch: 0.8, tail: 0.6, seed: 4 });
const SN = I.snare({ tone: 1.1, decay: 0.18 }), CL = I.clap(), CR = I.crash(18), CR2 = I.crash(23);
const HC = [I.hat(false, 11), I.hat(false, 12)], HO = I.hat(true, 14);
const kicks = [];

// ---------- drums ----------
clock.eachStep(0, 34, 16, (t, b, s) => {
  if (inS(t, 'breath')) return;
  if (inS(t, 'intro')) { // heartbeat
    if (b >= 1 && (s === 0 || s === 3 || s === 8 || s === 11)) drums.addMono(K2, t, s % 8 ? 0.45 : 0.7);
    return;
  }
  if (inS(t, 'bull1')) {
    const full = b >= 7;
    if (s === 0 || s === 8 || (full && (s === 6 || s === 10))) { drums.addMono(K, t, 0.85); kicks.push(t); }
    if (b >= 4 && (s === 4 || s === 12)) { drums.addMono(SN, t, 0.55); verb.addMono(SN, t, 0.25); }
    if (full ? s % 2 === 0 : s % 4 === 2) drums.addMono(HC[(s / 2) % 2], t, s % 4 === 2 ? 0.2 : 0.11, 0.25);
    return;
  }
  if (inS(t, 'bear')) { // half time, heavy and empty
    if (s === 0) { drums.addMono(K, t, 0.8); kicks.push(t); }
    if (s === 8) { const tm = I.tom(70, 0.5, b); drums.addMono(tm, t, 0.5); verb.addMono(tm, t, 0.3); }
    if (s % 4 === 0) perc.addMono(I.woodTick(s % 8 ? 1.4 : 1.8), t, 0.12, 0.4); // the clock ticking
    return;
  }
  if (inS(t, 'build')) {
    if (s % 8 === 0 || (b >= 23 && s % 4 === 0)) { drums.addMono(K, t, 0.85); kicks.push(t); }
    const roll = b >= 25 ? 1 : b >= 24 ? 2 : b >= 23 ? 4 : 8; // the snare roll speeds up into the breath
    if (s % roll === (roll === 8 ? 4 : 0)) drums.addMono(SN, t, 0.25 + 0.4 * (t - S.build[0]) / (S.build[1] - S.build[0]), 0.05);
    if (s % 2 === 0) drums.addMono(HC[0], t, 0.1, 0.3);
    return;
  }
  if (inS(t, 'drop')) { // four on the floor
    if (s % 4 === 0) { drums.addMono(K, t, 0.95); kicks.push(t); }
    if (s === 4 || s === 12) { drums.addMono(CL, t, 0.6); drums.addMono(SN, t, 0.35); verb.addMono(CL, t, 0.25); }
    if (s % 4 === 2) drums.addMono(HO, t, 0.14, 0.3); else drums.addMono(HC[s % 2], t, 0.09, -0.3);
    return;
  }
  if (inS(t, 'fall')) { // only the heart is left
    if (s === 0 || s === 3) drums.addMono(K2, t, s ? 0.45 : 0.7);
  }
});

// ---------- bass ----------
clock.eachStep(1, 34, 8, (t, b, s) => {
  if (inS(t, 'breath')) return;
  const c = sc.chordAt(t);
  if (!c) return;
  const R = c.bass + 12;
  if (inS(t, 'intro')) { if (s === 0) bass.addMono(I.bass(R - 12, BAR() * 0.95, { bright: 0.2, sub: 1 }), t, 0.5); return; }
  if (inS(t, 'bull1') || inS(t, 'build')) bass.addMono(I.bass(s % 2 ? R : R - 12 + 12, BEAT / 2 * 0.75, { bright: 0.6 }), t, s % 2 ? 0.35 : 0.5);
  else if (inS(t, 'bear')) { if (s === 0 || s === 3) bass.addMono(I.bass(R - 12, BEAT * (s ? 1 : 1.5), { bright: 0.25, sub: 1 }), t, 0.55); }
  else if (inS(t, 'drop')) { if (s % 2 === 0) bass.addMono(I.bass808(R - 12, BEAT * 0.9, { drive: 1.8 }), t, 0.42); bass.addMono(I.bass(s % 2 ? R + 12 : R, BEAT / 2 * 0.7, { bright: 1 }), t, 0.3); }
  else if (inS(t, 'fall')) { if (s === 0) bass.addMono(I.bass(R - 12, BAR() * 0.95, { bright: 0.2, sub: 1 }), t, 0.5); }
});
function BAR() { return BEAT * 4; }

// ---------- pads + strings ----------
for (const c of sc.chords) {
  if (c.t0 >= ev.end + 4) continue;
  let t1 = c.t1;
  if (c.t0 < ev.breath && t1 > ev.breath) t1 = ev.breath;
  const big = c.t0 >= ev.drop && c.t0 < S.drop[1];
  for (const nn of c.notes) {
    const { L, R } = I.padNote(nn - 12, t1 - c.t0, big ? { cutoff: 2400, attack: 0.04 } : { cutoff: 900, attack: 0.6, release: 1.2 });
    pad.addStereo(L, R, c.t0, 0.08);
    if (big) { const sw = I.supersaw(nn, (t1 - c.t0) * 0.98, { cutoff: 4200 }); pad.addStereo(sw.L, sw.R, c.t0, 0.05); }
    if (c.t0 >= S.bear[0] && c.t0 < S.build[1] || c.t0 >= S.fall[0]) { const st = I.strings(nn, t1 - c.t0, { attack: 0.4, bright: 0.7 }); pad.addStereo(st.L, st.R, c.t0, 0.06); verb.addStereo(st.L, st.R, c.t0, 0.04); }
  }
}

// ---------- the ostinato: 16th-note strings, the engine of the cue ----------
const OST = [0, 7, 12, 7, 3, 7, 12, 15]; // root, fifth, octave… (the third is minor/major per chord below)
clock.eachStep(1, 34, 16, (t, b, s) => {
  if (inS(t, 'breath')) return;
  const c = sc.chordAt(t);
  if (!c) return;
  const root = c.bass + 24;
  const minor = ['Dm', 'Gm'].includes(c.name);
  let iv = OST[s % 8];
  if (iv === 3 && !minor) iv = 4;
  if (iv === 15 && !minor) iv = 16;
  const intro = inS(t, 'intro'), bear = inS(t, 'bear'), fall = inS(t, 'fall');
  if ((intro || bear || fall) && s % 2) return; // 8ths when it's quiet
  const g = intro ? 0.12 + 0.1 * (t / S.intro[1]) : bear ? 0.13 : fall ? 0.14 : inS(t, 'drop') ? 0.16 : 0.2;
  const x = I.pizz(root + iv, { seed: s + 1 });
  ost.addMono(x, t, g * (s % 4 === 0 ? 1.15 : 0.85), (s % 2 ? 0.35 : -0.35));
  if (!bear) dly.addMono(x, t, 0.03);
});

// ---------- brass hook on the drop ----------
for (const nn of sc.brass) {
  const a = I.brassNote(nn.midi, nn.dur * 0.92), b = I.brassNote(nn.midi - 12, nn.dur * 0.92, { bright: 0.8, seed: 99 });
  lead.addStereo(a.L, a.R, nn.t, 0.28); lead.addStereo(b.L, b.R, nn.t, 0.18);
  verb.addStereo(a.L, a.R, nn.t, 0.12); dly.addStereo(a.L, a.R, nn.t, 0.04);
}

// ---------- the hits: every crash and every all-time high in the score ----------
for (const h of hits) {
  const up = h.kind === 'up';
  fx.addMono(I.subBoom(h.big ? 2.6 : 1.6, up ? 70 : 58, up ? 34 : 26), h.t, h.big ? 0.8 : 0.6);
  drums.addMono(up ? CR : CR2, h.t, h.big ? 0.5 : 0.36, up ? 0.25 : -0.25);
  drums.addMono(K, h.t, 0.9);
  const tp = I.timpani(sc.chordAt(h.t + 0.01).bass + 12, { decay: 1.4 });
  perc.addMono(tp, h.t, 0.7); verb.addMono(tp, h.t, 0.3);
  const root = sc.chordAt(h.t + 0.01).bass + 24;
  for (const iv of up ? [0, 7, 12, 16] : [0, 3, 7, 12]) {
    const st = I.brassNote(root + iv, up ? 0.7 : 0.45, { stab: true, seed: iv + 3 });
    lead.addStereo(st.L, st.R, h.t, 0.13); verb.addStereo(st.L, st.R, h.t, 0.08);
  }
  // a downward or upward sweep after the hit tells the story
  fx.addMono(I.noiseSweep(0.9, up ? 600 : 5000, up ? 6000 : 300, { q: 1.4, pink: true }), h.t + 0.05, 0.12);
}
// the timpani roll + riser through the intro, and the big riser into the $100K drop
for (let i = 0; i < 24; i++) { const t = T(1) + i * BEAT / 3; if (t < T(3) - 0.1) perc.addMono(I.timpani(m('D2'), { decay: 0.5, seed: i }), t, 0.08 + 0.18 * i / 24); }
fx.addMono(I.noiseSweep(T(3) - T(2), 200, 7000, { q: 0.9, shape: (x) => x * x, pink: true }), T(2), 0.3);
fx.addMono(I.noiseSweep(ev.breath - T(23), 150, 9000, { q: 0.9, shape: (x) => x * x * x, pink: true }), T(23), 0.5);
fx.addMono(I.noiseSweep(S.fall[1] - S.fall[0], 200, 6000, { q: 1, shape: (x) => x * x, pink: true }), S.fall[0], 0.3);
// the end: the last candle closes
fx.addMono(I.subBoom(3.2), ev.end, 0.8);
drums.addMono(CR, ev.end, 0.45); drums.addMono(K, ev.end, 0.9);
perc.addMono(I.timpani(m('D2'), { decay: 2.5 }), ev.end, 0.8);
for (const nn of ['D3', 'A3', 'D4', 'F4', 'A4']) {
  const b = I.brassNote(m(nn), 3.4, { seed: m(nn) }); lead.addStereo(b.L, b.R, ev.end, 0.12); verb.addStereo(b.L, b.R, ev.end, 0.08);
  const st = I.strings(m(nn), 4, { attack: 0.05 }); pad.addStereo(st.L, st.R, ev.end, 0.07);
}
// tape-style hiss under the whole thing, for the dusty picture
const hiss = I.vinyl(DURATION, { crackle: 0.6, hiss: 0.5 });
fx.addMono(hiss, 0, 0.05);

// ---------- mix ----------
MIX.sidechain([pad, bass], kicks.filter((t) => t >= ev.drop && t < S.drop[1]));
const stems = {
  drums, bass, pad, ost, lead, perc, fx,
  verb: reverb(verb, { room: 0.88, damp: 0.35 }),
  dly: pingpong(dly, BEAT * 0.75, 0.35, 3500),
};
const GAIN = { drums: 0.42, bass: 0.75, pad: 2.4, ost: 3.4, lead: 1.7, perc: 0.8, fx: 0.8, verb: 1, dly: 1 };
const out = path.join(__dirname, 'out');
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? out : null });
MIX.highpass(mix, 24);
MIX.gate(mix, ev.breath, ev.drop); // one beat of real silence before $100K
for (const h of hits) if (Math.abs(h.t - ev.drop) > 0.01) MIX.gate(mix, h.t - BEAT / 4, h.t); // a held breath (a 16th) before every hit
MIX.fadeOut(mix, DURATION - 2.2, DURATION);
const M = MIX.master(mix, parseFloat(process.env.DRIVE || '0.8'), undefined, { lufs: process.env.LUFS ? parseFloat(process.env.LUFS) : null });
MIX.writeWav(path.join(out, 'music.wav'), mix);
console.log(`wrote out/music.wav (${DURATION.toFixed(2)}s${M.lufs !== undefined ? `, ${M.lufs.toFixed(1)} LUFS at drive ${M.drive.toFixed(2)}` : ''})`);
