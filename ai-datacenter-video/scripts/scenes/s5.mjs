// Scene 5 · 27.6–37.3 s · "All that math makes heat. A lot of it. So the data center pumps cold water
// past every rack, and burns even more power just to stop the chips from cooking themselves."
import { P, isoP, isoBox, isoTile, isoFaceL, poly, glowDef, glow, sparkles, technician, rng } from "../kit.mjs";

const R = rng(55);
const o = [470, 250];
const p = (X, Y, Z = 0) => isoP(o, X, Y, Z);
const wallM = (x, z) => { const e = p(x, 0, z); return `matrix(0.866,0.5,0,1,${e[0].toFixed(1)},${e[1].toFixed(1)})`; };

// room
let room = "";
room += poly([p(-120, 0, 0), p(1500, 0, 0), p(1500, 0, 520), p(-120, 0, 520)], P.dusk);
room += poly([p(-120, 0, 0), p(-120, 900, 0), p(-120, 900, 520), p(-120, 0, 520)], P.night);
room += isoTile(o, -120, 0, 1620, 900, P.deep);
for (let x = -120; x < 1500; x += 90) room += isoTile(o, x, 0, 3, 900, P.nightD, 0.3);
for (let y = 0; y < 900; y += 90) room += isoTile(o, -120, y, 1620, 3, P.nightD, 0.3);
// cold-aisle floor stripe
room += isoTile(o, -120, 150, 1620, 60, P.slateD, 0.4, 'opacity="0.6"');
// racks along the back wall
let racks = "", hotFaces = "", coolFaces = "";
const RX = [];
for (let x = 0; x < 1300; x += 96) RX.push(x);
RX.forEach((x) => {
  racks += isoBox(o, x, 20, 0, 88, 90, 250, { t: P.slate, l: P.duskL, r: P.nightD });
  for (let k = 0; k < 7; k++) racks += isoFaceL(o, x + 10, 110, 20 + k * 32, 68, 18, P.night);
  for (let k = 0; k < 7; k++) racks += isoFaceL(o, x + 14 + (k % 3) * 8, 110, 30 + k * 32, 5, 5, R() < 0.5 ? P.aqua : P.gold, 'class="s5-led"');
  hotFaces += isoFaceL(o, x, 110, 0, 88, 250, P.tang);
  coolFaces += isoFaceL(o, x, 110, 0, 88, 250, P.aqua);
});
// water pipe on the floor in front of the racks, with a riser up each rack
let pipes = isoBox(o, -120, 128, 0, 1620, 18, 18, { t: P.aqua, l: P.aquaD, r: P.aquaD });
let risers = "";
RX.forEach((x) => (risers += isoBox(o, x + 76, 116, 18, 8, 8, 220, { t: P.aqua, l: P.aqua, r: P.aquaD })));
const flowA = p(-120, 137, 18), flowB = p(1500, 137, 18);
const flow = `<path id="s5-flow" d="M${flowA} L${flowB}" stroke="${P.cream}" stroke-width="5" stroke-dasharray="26 34" stroke-linecap="round" fill="none" opacity="0"/>`;
// heat waves above the racks
let waves = "";
for (let i = 0; i < 14; i++) {
  const b = p(40 + i * 92, 60, 270);
  waves += `<path class="s5-wave" d="M${b[0]},${b[1]} q14,-24 0,-48 t0,-48 t0,-48" stroke="${P.tang}" stroke-width="8" stroke-linecap="round" fill="none" opacity="0"/>`;
}
// wall: thermometer and power meter, drawn flat then mapped onto the wall plane
const thermo = `<g transform="${wallM(470, 480)}">
  <rect x="0" y="0" width="190" height="215" rx="18" fill="${P.creamS}"/>
  <rect x="70" y="20" width="50" height="160" rx="25" fill="${P.cream}"/>
  <circle cx="95" cy="190" r="34" fill="${P.tang}"/>
  <rect id="s5-merc" x="80" y="40" width="30" height="150" rx="15" fill="${P.tang}"/>
  ${[0, 1, 2, 3].map((k) => `<rect x="126" y="${44 + k * 36}" width="22" height="5" fill="${P.slateD}"/>`).join("")}
</g>`;
const meter = `<g transform="${wallM(860, 480)}">
  <rect x="0" y="0" width="300" height="230" rx="18" fill="${P.creamS}"/>
  <path d="M40,170 A110,110 0 0 1 260,170" stroke="${P.slateL}" stroke-width="26" fill="none"/>
  <path d="M190,74 A110,110 0 0 1 260,170" stroke="${P.tang}" stroke-width="26" fill="none"/>
  <g id="s5-needle"><path d="M150,170 L150,74" stroke="${P.deep}" stroke-width="10" stroke-linecap="round"/></g>
  <circle cx="150" cy="170" r="16" fill="${P.deep}"/>
  <path d="M136,210 L152,186 L150,202 L166,198 L148,224 L150,208 Z" fill="${P.gold}"/>
</g>`;
// thick power cables from the meter down the wall
const cA = p(1010, 0, 250), cB = p(1010, 0, 520);
const cables = `<path d="M${cA} L${cB}" stroke="${P.deep}" stroke-width="16"/><g id="s5-zaps" opacity="0">${[0, 1, 2].map((k) => `<circle class="s5-zap" cx="${cA[0]}" cy="${cA[1]}" r="9" fill="${P.gold}"/>`).join("")}</g>`;

const tp = p(470, 400, 0);

// the inset: a chip frying an egg, then cooled
const inset = `<g id="s5-inset" transform="translate(1500,330)">
  <g id="s5-insetin">
  <circle r="232" fill="${P.creamS}"/>
  <clipPath id="s5-ic"><circle r="220"/></clipPath>
  <g clip-path="url(#s5-ic)">
    <rect x="-240" y="-240" width="480" height="480" fill="${P.night}"/>
    <rect x="-140" y="-140" width="280" height="280" rx="20" fill="${P.slateD}"/>
    <rect id="s5-chiphot" x="-110" y="-110" width="220" height="220" rx="12" fill="${P.tang}"/>
    <rect id="s5-chipcool" x="-110" y="-110" width="220" height="220" rx="12" fill="${P.aqua}" opacity="0"/>
    ${Array.from({ length: 6 }, (_, k) => `<rect x="${-120 + k * 44}" y="-160" width="14" height="22" fill="${P.gold}"/><rect x="${-120 + k * 44}" y="138" width="14" height="22" fill="${P.gold}"/>`).join("")}
    <g id="s5-egg">
      <path d="M-70,-20 C-90,-70 -30,-96 10,-80 C60,-96 96,-50 80,0 C100,50 50,86 0,70 C-50,90 -96,50 -70,-20 Z" fill="#FFFBF2"/>
      <circle cx="4" cy="-6" r="32" fill="${P.gold}"/><circle cx="-6" cy="-16" r="9" fill="${P.cream}"/>
    </g>
    <g id="s5-steam">${[-50, 0, 50].map((x) => `<path class="s5-st" d="M${x},-90 q16,-26 0,-52 t0,-52" stroke="${P.cream}" stroke-width="10" stroke-linecap="round" fill="none"/>`).join("")}</g>
    <g id="s5-drops" opacity="0">${Array.from({ length: 10 }, (_, k) => `<circle cx="${-200 + k * 44}" cy="${-140 + (k % 3) * 40}" r="${10 + (k % 2) * 6}" fill="${P.aqua}"/>`).join("")}</g>
  </g>
  <circle r="226" fill="none" stroke="${P.slateL}" stroke-width="12"/>
  </g>
</g>`;

const html = `
<div class="cam" id="s5-cam"><svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>${glowDef("s5-hot", P.tang, 0.65)}${glowDef("s5-cold", P.aqua, 0.5)}</defs>
  <rect x="-2000" y="-2000" width="6000" height="6000" fill="${P.nightD}"/>
  ${room}${thermo}${meter}${cables}
  ${racks}
  <g id="s5-hotfaces" opacity="0">${hotFaces}</g>
  <g id="s5-coolfaces" opacity="0">${coolFaces}</g>
  <g id="s5-hotglow" opacity="0">${glow("s5-hot", 1000, 520, 1100, 560)}</g>
  <g id="s5-coldglow" opacity="0">${glow("s5-cold", 1000, 640, 1100, 460)}</g>
  ${waves}
  <g id="s5-pipes" opacity="0">${risers}${pipes}${flow}</g>
  <g transform="translate(${tp[0]},${tp[1]}) scale(1.3)"><ellipse cx="10" cy="4" rx="80" ry="18" fill="${P.nightD}" opacity="0.6"/>${technician("s5")}</g>
  ${sparkles(56, 24, [0, 0, 1920, 1080], [P.cream, P.aqua])}
</svg></div>
<svg id="s5-ins" width="1920" height="1080" viewBox="0 0 1920 1080">${inset}</svg>
<div id="s5-sign" class="lbl">TOO HOT</div>`;

const css = `
#s5-ins{position:absolute;left:0;top:0;overflow:visible;}
#s5-sign{position:absolute;left:150px;top:880px;font-size:54px;color:${P.tang};opacity:0;}
`;

const js = `
  K.sparkles(tl, "#s5-cam", 9.7);
  K.cam(tl, "#s5-cam", [
    [0, 0, 1000, 470, 3.2],
    [0.1, 1.2, 960, 560, 1.0, "expo.out"],
    [2.4, 2.8, 900, 600, 0.96, "sine.inOut"],
    [5.8, 1.0, 1100, 470, 1.12],
    [7.2, 2.4, 1060, 520, 1.0, "sine.inOut"],
  ]);
  // heat: racks glow tangerine, waves rise, the thermometer climbs
  tl.fromTo("#s5-hotfaces", { opacity: 0.85 }, { opacity: 0.55, duration: 0.6 }, 0);
  tl.fromTo("#s5-hotglow", { opacity: 0.5 }, { opacity: 1, duration: 1.2 }, 0);
  const merc = K.rig(tl, "#s5-merc", 95, 190);
  tl.fromTo(merc, { sy: 0.2 }, { sy: 1, duration: 1.6, ease: "power2.out" }, 0.3);
  document.querySelectorAll("#s5-cam .s5-wave").forEach((w, i) => {
    const t0 = 0.3 + (i % 5) * 0.18;
    tl.fromTo(w, { opacity: 0, y: 30 }, { opacity: 0.8, y: -10, duration: 0.6, ease: "sine.out" }, t0);
    tl.fromTo(w, { y: -10 }, { y: -60, duration: 1.0, ease: "sine.in", repeat: 2, immediateRender: false }, t0 + 0.6);
    tl.fromTo(w, { opacity: 0.8 }, { opacity: 0, duration: 0.5, immediateRender: false }, 3.9 + (i % 5) * 0.1);
  });
  tl.fromTo("#s5-sign", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.18 }, 1.64);
  tl.fromTo("#s5-sign", { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, 3.0);
  // the technician wipes his brow, then taps his tablet
  const armL = K.rig(tl, "#s5-armL", -32, -328), head = K.rig(tl, "#s5-head", 6, -360), armR = K.rig(tl, "#s5-armR", 34, -330);
  K.blink(tl, "#s5-lid", [0.9, 3.6, 6.4, 8.8]);
  tl.fromTo(armL, { r: 0 }, { r: 150, duration: 0.35, ease: "power2.out" }, 1.55);
  tl.fromTo(armL, { x: 0 }, { x: 14, duration: 0.18, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, 1.9);
  tl.fromTo(armL, { r: 150 }, { r: 0, duration: 0.4, ease: "power2.inOut", immediateRender: false }, 2.62);
  tl.fromTo(head, { r: 0 }, { r: 8, duration: 0.3, ease: "power2.out" }, 1.6);
  tl.fromTo(head, { r: 8 }, { r: 14, duration: 0.3, ease: "power2.inOut", immediateRender: false }, 2.6);
  tl.fromTo(armR, { r: 0 }, { r: -8, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }, 2.75);
  // cold water: pipes appear, water flows, racks cool down
  tl.fromTo("#s5-pipes", { opacity: 0 }, { opacity: 1, duration: 0.35 }, 3.0);
  tl.fromTo("#s5-flow", { opacity: 0, strokeDashoffset: 0 }, { opacity: 0.9, strokeDashoffset: -1200, duration: 6.4, ease: "none" }, 3.2);
  tl.fromTo("#s5-hotfaces", { opacity: 0.55 }, { opacity: 0, duration: 1.4, ease: "power1.inOut", immediateRender: false }, 4.0);
  tl.fromTo("#s5-hotglow", { opacity: 1 }, { opacity: 0, duration: 1.4, immediateRender: false }, 4.0);
  tl.fromTo("#s5-coolfaces", { opacity: 0 }, { opacity: 0.35, duration: 1.0 }, 4.3);
  tl.fromTo("#s5-coolfaces", { opacity: 0.35 }, { opacity: 0, duration: 1.0, immediateRender: false }, 5.6);
  tl.fromTo("#s5-coldglow", { opacity: 0 }, { opacity: 1, duration: 1.0 }, 4.3);
  tl.fromTo(merc, { sy: 1 }, { sy: 0.45, duration: 1.4, ease: "power2.inOut", immediateRender: false }, 4.3);
  tl.fromTo(head, { r: 14 }, { r: 0, duration: 0.4, ease: "back.out(2)", immediateRender: false }, 4.8);
  // more power: the meter swings into the red, current races down the cables
  const needle = K.rig(tl, "#s5-needle", 150, 170);
  tl.fromTo(needle, { r: -60 }, { r: 55, duration: 0.9, ease: "back.out(1.8)" }, 5.96);
  tl.fromTo(needle, { r: 55 }, { r: 48, duration: 0.12, yoyo: true, repeat: 11, ease: "sine.inOut", immediateRender: false }, 6.9);
  tl.fromTo("#s5-zaps", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 6.3);
  document.querySelectorAll("#s5-cam .s5-zap").forEach((z, i) => {
    tl.fromTo(z, { attr: { cy: ${cB[1]} } }, { attr: { cy: ${cA[1]} }, duration: 0.5, ease: "none", repeat: 6, immediateRender: false }, 6.3 + i * 0.17);
  });
  // the gag: a chip frying an egg, cooled just in time
  const ins = K.rig(tl, "#s5-insetin", 0, 0);
  tl.fromTo(ins, { s: 0 }, { s: 1, duration: 0.5, ease: "back.out(1.6)" }, 7.3);
  document.querySelectorAll("#s5-ins .s5-st").forEach((s, i) => {
    tl.fromTo(s, { y: 0, opacity: 0.9 }, { y: -40, opacity: 0, duration: 0.6, ease: "sine.out", repeat: 2, immediateRender: false }, 7.5 + i * 0.15);
  });
  const egg = K.rig(tl, "#s5-egg", 0, 0);
  tl.fromTo(egg, { sx: 1, sy: 1 }, { sx: 1.05, sy: 0.96, duration: 0.08, yoyo: true, repeat: 9, ease: "sine.inOut" }, 7.6);
  tl.fromTo("#s5-drops", { opacity: 0, y: -60 }, { opacity: 1, y: 60, duration: 0.5, ease: "power2.in" }, 8.7);
  tl.fromTo("#s5-chipcool", { opacity: 0 }, { opacity: 1, duration: 0.45 }, 8.95);
  tl.fromTo("#s5-steam", { opacity: 1 }, { opacity: 0, duration: 0.3 }, 9.0);
  tl.fromTo(ins, { s: 1 }, { s: 0, duration: 0.25, ease: "power3.in", immediateRender: false }, 9.42);
`;

export default { id: "s5", css, html, js };
