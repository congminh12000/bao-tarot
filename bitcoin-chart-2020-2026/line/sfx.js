// Every bubble has an onset exactly at h.t. No pre-gate; preceding attacks stay intact.
function add({ h, fx, drums, instruments: I }) {
  const power = h.turn ? 1 : h.tag ? 0.5 : [0.18, 0.42, 0.75][h.hit];
  const base = h.tag ? 1046.5 : h.kind === 'down' ? 523.25 : 783.99;
  fx.addMono(I.bell(base, 0.28 + power * 0.35), h.t, 0.06 + power * 0.15);
  if (h.tag || h.hit >= 1 || h.turn) fx.addMono(I.bell(base * 1.5, 0.3), h.t + 0.045, power * 0.09);
  if (h.hit === 2 || h.turn) {
    drums.addMono(I.kick({ punch: 0.65 + power * 0.4, tail: 0.3, seed: 31 }), h.t, power * 0.6);
    fx.addMono(I.subBoom(0.8, h.kind === 'down' ? 58 : 72, 34), h.t, power * 0.42);
    fx.addMono(I.noiseSweep(0.45, h.kind === 'down' ? 2200 : 600, h.kind === 'down' ? 300 : 4000,
      { pink: true, seed: Math.round(h.x), q: 0.8 }), h.t, power * 0.06);
  }
}
module.exports = { add };
