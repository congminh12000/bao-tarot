// Scene 3 · 14.0–20.5 s · "This is an AI data center. A giant warehouse packed with computers,
// and it's where your answer actually gets made."
import { P, isoP, isoBox, isoTile, isoFaceL, isoFaceR, poly, skyDef, glowDef, glow, sparkles, rng, star } from "../kit.mjs";

const o = [1000, 330];
const W = 900, D = 480, H = 130;
const p = (X, Y, Z = 0) => isoP(o, X, Y, Z);
const R = rng(33);

// --- site ---
let site = "";
site += isoTile(o, -420, -380, W + 900, D + 820, P.sage);
site += isoTile(o, -420, -380, W + 900, 60, P.sageD, 0, 'opacity="0.6"');
site += isoTile(o, W + 40, -380, 140, D + 820, P.asph); // access road
for (let y = -360; y < D + 440; y += 90) site += isoTile(o, W + 106, y, 8, 44, P.cream, 0.5, 'opacity="0.7"');
site += isoTile(o, -60, -60, W + 120, D + 120, P.asph); // pad
site += isoTile(o, -60, D + 60, W + 120, 10, P.asphD);
// substation (left), behind the fence
let subst = "";
for (let i = 0; i < 3; i++) {
  subst += isoBox(o, -300 + i * 80, 60, 0, 50, 70, 60, { t: P.slateL, l: P.slate, r: P.slateD });
  for (let k = 0; k < 3; k++) subst += isoFaceL(o, -296 + i * 80 + k * 15, 130, 8, 6, 44, P.slateD);
  const t = p(-275 + i * 80, 95, 60);
  subst += `<rect x="${t[0] - 3}" y="${t[1] - 40}" width="6" height="40" fill="${P.cream}"/><circle cx="${t[0]}" cy="${t[1] - 42}" r="6" fill="${P.creamS}"/>`;
}
// power line into the substation
const pa = p(-330, -300, 0), pb = p(-330, 20, 0);
subst += `<rect x="${pa[0] - 5}" y="${pa[1] - 200}" width="10" height="200" fill="${P.plumD}"/><rect x="${pb[0] - 5}" y="${pb[1] - 170}" width="10" height="170" fill="${P.plumD}"/>
  <path d="M${pa[0]},${pa[1] - 196} Q${(pa[0] + pb[0]) / 2},${(pa[1] + pb[1]) / 2 - 150} ${pb[0]},${pb[1] - 166}" stroke="${P.deep}" stroke-width="3" fill="none"/>`;
// trees
let trees = "";
const tree = (X, Y, s) => {
  const b = p(X, Y, 0);
  return `<ellipse cx="${b[0] + 10}" cy="${b[1] + 4}" rx="${26 * s}" ry="${10 * s}" fill="${P.mossD}" opacity="0.5"/>
  <rect x="${b[0] - 4}" y="${b[1] - 24 * s}" width="8" height="${24 * s}" fill="${P.plumD}"/>
  <path d="M${b[0]},${b[1] - 110 * s} L${b[0] + 30 * s},${b[1] - 20 * s} L${b[0] - 30 * s},${b[1] - 20 * s} Z" fill="${P.moss}"/>
  <path d="M${b[0]},${b[1] - 110 * s} L${b[0] + 30 * s},${b[1] - 20 * s} L${b[0]},${b[1] - 20 * s} Z" fill="${P.mossD}"/>`;
};
const treeSpots = [];
for (let i = 0; i < 16; i++) treeSpots.push([-400 + R() * 260, -360 + i * 70 + R() * 30]);
for (let i = 0; i < 10; i++) treeSpots.push([-200 + i * 110 + R() * 40, -330 - R() * 40]);
for (let i = 0; i < 8; i++) treeSpots.push([-300 + i * 140 + R() * 40, D + 230 + R() * 120]);
treeSpots.sort((a, b) => a[0] + a[1] - (b[0] + b[1])).forEach(([x, y]) => (trees += tree(x, y, 0.8 + R() * 0.5)));
// fence along the front edges
let fence = "";
for (let x = -80; x <= W + 30; x += 30) { const a = p(x, D + 100, 0); fence += `<rect x="${a[0] - 2}" y="${a[1] - 34}" width="4" height="34" fill="${P.slateD}"/>`; }
for (let y = -80; y <= D + 100; y += 30) { const a = p(W + 30, y, 0); fence += `<rect x="${a[0] - 2}" y="${a[1] - 34}" width="4" height="34" fill="${P.slateD}"/>`; }
const f1 = p(-80, D + 100, 30), f2 = p(W + 30, D + 100, 30), f3 = p(W + 30, -80, 30);
fence += `<polyline points="${f1} ${f2} ${f3}" stroke="${P.slateD}" stroke-width="3" fill="none"/>`;

// --- the building, layered for the cutaway ---
// interior: back walls (inner faces) and floor
let inner = "";
inner += poly([p(0, 0, 0), p(0, D, 0), p(0, D, H), p(0, 0, H)], P.slateD); // inner face of the -X wall
inner += poly([p(0, 0, 0), p(W, 0, 0), p(W, 0, H), p(0, 0, H)], P.slate); // inner face of the -Y wall
inner += isoTile(o, 0, 0, W, D, P.deep);
for (let x = 0; x < W; x += 60) inner += isoTile(o, x, 0, 2, D, P.nightD, 0.2);
// racks
const racks = [];
let rackSvg = "";
const rows = [40, 120, 200, 280, 360, 410];
rows.forEach((y, ri) => {
  for (let x = 30; x < W - 50; x += 64) {
    const id = `s3-r${ri}-${Math.round(x)}`;
    racks.push([x, y]);
    let leds = "";
    for (let k = 0; k < 6; k++) {
      const c = R() < 0.6 ? P.aqua : P.gold;
      leds += isoFaceL(o, x + 8 + (k % 3) * 16, y + 34, 18 + Math.floor(k / 3) * 30, 6, 4, c, `class="s3-led" data-ph="${(R() * 6.28).toFixed(2)}"`);
    }
    rackSvg += `<g id="${id}">${isoBox(o, x, y, 0, 56, 34, 92, { t: P.slate, l: P.duskL, r: P.nightD })}${leds}</g>`;
  }
});
// the rack that makes her answer (front row, middle)
const TR = [30 + 64 * 7, 410];
const trTop = p(TR[0] + 28, TR[1] + 17, 92);
const trFace = p(TR[0] + 28, TR[1] + 34, 46);

// front walls: lit +Y face and shaded +X face, with ribs, stripe and doors
let front = "";
front += isoFaceL(o, 0, D, 0, W, H, P.cream);
front += isoFaceR(o, W, 0, 0, D, H, P.slateL);
for (let x = 30; x < W; x += 40) front += isoFaceL(o, x, D, 6, 6, H - 12, P.creamS);
for (let y = 30; y < D; y += 40) front += isoFaceR(o, W, y, 6, 6, H - 12, P.slate, 'opacity="0.55"');
front += isoFaceL(o, 0, D, H - 26, W, 10, P.tang);
front += isoFaceR(o, W, 0, H - 26, D, 10, P.tangD);
for (let i = 0; i < 3; i++) front += isoFaceL(o, 80 + i * 130, D, 0, 80, 70, P.slate);
front += isoFaceL(o, W - 150, D, 0, 46, 78, P.deep);
// the same walls cut down low, swapped in for the cutaway
const HL = 34;
let frontLow = isoFaceL(o, 0, D, 0, W, HL, P.cream) + isoFaceR(o, W, 0, 0, D, HL, P.slateL);
frontLow += isoFaceL(o, 0, D, HL - 6, W, 6, P.creamS) + isoFaceR(o, W, 0, HL - 6, D, 6, P.slate);
// roof
let roof = isoBox(o, 0, 0, H, W, D, 8, { t: P.slateL, l: P.creamS, r: P.slate });
for (let i = 0; i < 7; i++) for (let j = 0; j < 2; j++) {
  const x = 40 + i * 122, y = 70 + j * 190;
  roof += isoBox(o, x, y, H + 8, 96, 120, 36, { t: P.slate, l: P.slateL, r: P.slateD });
  const c = p(x + 48, y + 60, H + 44);
  roof += `<g transform="translate(${c[0].toFixed(1)},${c[1].toFixed(1)}) scale(1,0.58)"><circle r="50" fill="${P.deep}"/><g class="s3-fan"><path d="M-42,0 L42,0 M0,-42 L0,42" stroke="${P.slateL}" stroke-width="10" stroke-linecap="round"/></g><circle r="8" fill="${P.slate}"/></g>`;
}
// scale cues: a small car and a person by the door
const car = p(W + 110, D - 60, 0);
const person = p(W - 130, D + 40, 0);
const scaleCues = `
  ${isoBox(o, W + 80, D - 100, 0, 70, 36, 18, { t: P.tang, l: P.tang, r: P.tangD })}
  ${isoBox(o, W + 92, D - 98, 18, 40, 32, 14, { t: P.cream, l: P.aqua, r: P.aquaD })}
  <g transform="translate(${person[0]},${person[1]})"><rect x="-4" y="-34" width="8" height="34" rx="3" fill="${P.slate}"/><circle cy="-40" r="6" fill="${P.skin}"/><path d="M-7,-44 Q0,-54 7,-44 Z" fill="${P.gold}"/></g>`;

const html = `
<div class="cam" id="s3-cam"><svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>${skyDef("s3-sky", P.dusk, P.rose, P.apricot)}${glowDef("s3-g", P.gold, 0.8)}${glowDef("s3-sun", P.gold, 0.5)}</defs>
  <rect x="-1400" y="-1200" width="4800" height="3400" fill="url(#s3-sky)"/>
  ${glow("s3-sun", 1500, -40, 900, 500)}
  ${site}${subst}${trees}
  <g id="s3-inner">${inner}${rackSvg}
    <g id="s3-hot" opacity="0">${glow("s3-g", trFace[0], trFace[1], 160, 120)}${isoBox(o, TR[0], TR[1], 0, 56, 34, 92, { t: P.gold, l: P.gold, r: P.goldD })}</g>
  </g>
  <g id="s3-frontlow" opacity="0">${frontLow}</g><g id="s3-front">${front}</g>
  <g id="s3-roof">${roof}</g>
  ${fence}${scaleCues}
  <g id="s3-pulse" opacity="0">${glow("s3-g", 0, 0, 120, 120)}<circle r="22" fill="${P.gold}"/><circle r="10" fill="${P.cream}"/></g>
  <g id="s3-here" opacity="0">
    <path id="s3-arrow" d="M${trTop[0] - 300},${trTop[1] - 260} C${trTop[0] - 250},${trTop[1] - 140} ${trTop[0] - 150},${trTop[1] - 70} ${trTop[0] - 40},${trTop[1] - 40}" stroke="${P.tang}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M${trTop[0] - 76},${trTop[1] - 70} L${trTop[0] - 36},${trTop[1] - 40} L${trTop[0] - 84},${trTop[1] - 22}" stroke="${P.tang}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${trTop[0] - 330}" y="${trTop[1] - 290}" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="150" fill="${P.tang}">here.</text>
  </g>
  <g id="s3-lbl" opacity="0">
    <path d="M${p(W * 0.5, 120, 92)[0]},${p(W * 0.5, 120, 92)[1] - 10} L${p(W * 0.5, 120, 92)[0] + 120},${p(W * 0.5, 120, 92)[1] - 220}" stroke="${P.cream}" stroke-width="4"/>
    <circle cx="${p(W * 0.5, 120, 92)[0]}" cy="${p(W * 0.5, 120, 92)[1] - 10}" r="9" fill="${P.cream}"/>
    <text x="${p(W * 0.5, 120, 92)[0] + 130}" y="${p(W * 0.5, 120, 92)[1] - 228}" font-family="Barlow" font-weight="700" font-size="44" letter-spacing="5" fill="${P.cream}">SERVER RACKS</text>
  </g>
  ${sparkles(34, 40, [-300, -300, 2600, 700])}
</svg></div>
<div id="s3-title"><span>AI</span> <span>data</span> <span>center</span></div>`;

const css = `
#s3-title{position:absolute;left:150px;top:110px;font-family:"Nunito";font-weight:900;font-size:104px;letter-spacing:-0.01em;color:${P.cream};text-shadow:0 7px 0 ${P.plumD};}
#s3-title span{display:inline-block;}
`;

const camKeys = [
  [0, 0, 1180, 560, 0.66],
  [0.1, 2.4, 1150, 600, 0.72, "sine.inOut"],
  [2.5, 1.0, 1130, 560, 0.86],
  [4.2, 1.0, trFace[0] - 120, trFace[1] - 120, 1.15],
  [6.0, 0.5, trFace[0], trFace[1], 6.5, "power3.in"],
];

const js = `
  K.sparkles(tl, "#s3-cam", 6.5);
  K.cam(tl, "#s3-cam", ${JSON.stringify(camKeys)});
  document.querySelectorAll("#s3-cam .s3-fan").forEach((f, i) => K.spin(tl, f, 0, 6.5, 6 + (i % 3)));
  // title lands word by word, then clears for the cutaway
  document.querySelectorAll("#s3-title span").forEach((s, i) => {
    tl.fromTo(s, { opacity: 0, filter: "blur(10px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2, ease: "power2.out" }, [0.5, 0.92, 1.2][i]);
  });
  tl.fromTo("#s3-title", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.22, ease: "power2.in", immediateRender: false }, 2.45);
  // cutaway: roof lifts away, front walls drop low
  tl.fromTo("#s3-roof", { y: 0, opacity: 1 }, { y: -420, opacity: 0, duration: 0.9, ease: "power3.in" }, 2.5);
  tl.fromTo("#s3-front", { opacity: 1, y: 0 }, { opacity: 0, y: 40, duration: 0.45, ease: "power2.in" }, 2.75);
  tl.fromTo("#s3-frontlow", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 2.85);
  tl.fromTo("#s3-lbl", { opacity: 0 }, { opacity: 1, duration: 0.25 }, 3.0);
  tl.fromTo("#s3-lbl", { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, 4.1);
  // rack LEDs twinkle
  const leds = document.querySelectorAll("#s3-cam .s3-led");
  const o2 = { t: 0 };
  tl.fromTo(o2, { t: 0 }, { t: 6.5, duration: 6.5, ease: "none", onUpdate() {
    leds.forEach((l) => l.setAttribute("opacity", Math.sin(+l.dataset.ph + o2.t * 7) > -0.2 ? 1 : 0.25));
  } }, 0);
  // her question drops in and one rack lights up
  tl.fromTo("#s3-pulse", { x: ${trTop[0]}, y: ${trTop[1] - 600}, opacity: 0 }, { x: ${trTop[0]}, y: ${trTop[1]}, opacity: 1, duration: 0.55, ease: "power2.in" }, 4.3);
  tl.fromTo("#s3-pulse", { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: false }, 4.85);
  tl.fromTo("#s3-hot", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 4.85);
  tl.fromTo("#s3-here", { opacity: 0 }, { opacity: 1, duration: 0.01 }, 5.5);
  tl.fromTo("#s3-arrow", { strokeDasharray: 600, strokeDashoffset: 600 }, { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" }, 5.5);
`;

export default { id: "s3", css, html, js };
