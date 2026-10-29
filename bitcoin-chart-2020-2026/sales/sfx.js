// One deterministic, restrained chime at the same absolute time as the visual pulse.
function add({ h, fx, instruments: I }) {
  const launch = h.kind === 'launch';
  fx.addMono(I.bell(launch ? 880 : 660, launch ? .7 : .45), h.t, launch ? .16 : .10);
  if (launch) fx.addMono(I.bell(1320, .5), h.t + .08, .07);
}
module.exports = { add };
