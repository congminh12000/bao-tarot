// Scene 4 · 20.5–27.6 s · "Inside, rows of chips turn your words into numbers and run billions of
// tiny math problems on them, all at the same time."
import { P, isoP, isoBox, isoTile, isoFaceL, glowDef, glow, sparkles, rng } from "../kit.mjs";

const R = rng(44);
const o = [700, 120];
const p = (X, Y, Z = 0) => isoP(o, X, Y, Z);

// --- part A: an isometric server board with rows of chips ---
let board = isoTile(o, -200, -200, 2200, 1500, P.night);
for (let i = 0; i < 40; i++) {
  const y = -180 + R() * 1460, x = -180 + R() * 1800;
  board += isoTile(o, x, y, 200 + R() * 400, 5, P.goldD, 0.5, 'opacity="0.55"');
  board += isoTile(o, x + R() * 200, y, 5, 120 + R() * 200, P.goldD, 0.5, 'opacity="0.45"');
}
let chips = "";
const CH = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) CH.push([c * 300, r * 300]);
CH.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
CH.forEach(([x, y]) => {
  chips += isoBox(o, x - 10, y - 10, 0, 200, 200, 10, { t: P.slateD, l: P.slate, r: P.deep });
  for (let k = 0; k < 9; k++) chips += isoFaceL(o, x + 4 + k * 20, y + 190, 0, 8, 6, P.gold);
  chips += isoBox(o, x + 30, y + 30, 10, 140, 140, 18, { t: P.deep, l: P.duskL, r: P.nightD });
  // heat sink fins
  for (let k = 0; k < 7; k++) chips += isoBox(o, x + 36 + k * 19, y + 36, 28, 8, 128, 44, { t: P.slateL, l: P.slate, r: P.slateD });
});
// the chip we dive into (row 2, column 2)
const DIVE = p(2 * 300 + 90, 1 * 300 + 90, 72);

// --- part B: top-down die ---
const N = 10, CELL = 62, GAP = 6, G0 = [960 - (N * (CELL + GAP)) / 2 + GAP / 2, 600 - (N * (CELL + GAP)) / 2 + GAP / 2];
const ops = ["3×7", "8+5", "2×9", "6×4", "9+1", "5×5", "7+2", "4×8", "1+6", "0.3×2"];
let cells = "";
for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
  const x = G0[0] + j * (CELL + GAP), y = G0[1] + i * (CELL + GAP);
  const op = ops[Math.floor(R() * ops.length)];
  cells += `<g class="s4-cell" data-i="${i}" data-j="${j}">
    <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="6" fill="${P.duskL}"/>
    <rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="6" fill="${P.gold}" class="s4-on" opacity="0"/>
    <text x="${x + CELL / 2}" y="${y + CELL / 2 + 7}" text-anchor="middle" font-family="Barlow" font-weight="700" font-size="19" fill="${P.deep}" class="s4-op" opacity="0">${op}</text></g>`;
}
let traces = "";
for (let i = 0; i < 26; i++) {
  const y = 40 + i * 40;
  traces += `<path d="M0,${y} H${200 + R() * 300} l40,40 H${700}" stroke="${P.goldD}" stroke-width="4" fill="none" opacity="0.35"/>`;
  traces += `<path d="M1920,${y} H${1720 - R() * 300} l-40,40 H${1220}" stroke="${P.goldD}" stroke-width="4" fill="none" opacity="0.35"/>`;
}
let pins = "";
for (let k = 0; k < 22; k++) {
  const a = 960 - 420 + 20 + k * 38;
  pins += `<rect x="${a}" y="152" width="16" height="30" fill="${P.gold}"/><rect x="${a}" y="1018" width="16" height="30" fill="${P.gold}"/>`;
  pins += `<rect x="512" y="${180 + k * 38}" width="30" height="16" fill="${P.gold}"/><rect x="1378" y="${180 + k * 38}" width="30" height="16" fill="${P.gold}"/>`;
}
const WORDS = ["How", "do", "I", "make", "potato", "salad?"];
const NUMS = ["4438", "656", "357", "1520", "38734", "33819"];
const TX = (i) => 260 + i * 280;
let toks = "";
WORDS.forEach((w, i) => {
  toks += `<g transform="translate(${TX(i)},96)"><g id="s4-k${i}">
    <g class="s4-w"><rect x="-110" y="-38" width="220" height="76" rx="18" fill="${P.cream}"/><rect x="-110" y="26" width="220" height="12" rx="6" fill="${P.creamS}"/>
    <text y="13" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="40" fill="${P.deep}">${w}</text></g>
    <g class="s4-n" opacity="0"><rect x="-110" y="-38" width="220" height="76" rx="18" fill="${P.aqua}"/><rect x="-110" y="26" width="220" height="12" rx="6" fill="${P.aquaD}"/>
    <text y="15" text-anchor="middle" font-family="Barlow" font-weight="700" font-size="46" letter-spacing="2" fill="${P.deep}">${NUMS[i]}</text></g>
  </g></g>`;
});

const html = `
<div class="cam" id="s4-camA"><svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>${glowDef("s4-ga", P.aqua, 0.35)}</defs>
  <rect x="-2000" y="-2000" width="6000" height="6000" fill="${P.nightD}"/>
  ${board}${chips}
  ${glow("s4-ga", 960, 540, 1200, 700)}
</svg></div>
<div class="cam" id="s4-camB"><svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>${glowDef("s4-gb", P.gold, 0.7)}${glowDef("s4-gh", P.tang, 0.8)}</defs>
  <rect x="-600" y="-600" width="3120" height="2280" fill="${P.night}"/>
  ${traces}
  <rect x="520" y="160" width="880" height="880" rx="26" fill="${P.slateD}"/>
  <rect x="520" y="160" width="880" height="24" rx="12" fill="${P.slate}"/>
  ${pins}
  <rect x="${G0[0] - 30}" y="${G0[1] - 30}" width="${N * (CELL + GAP) + 54}" height="${N * (CELL + GAP) + 54}" rx="14" fill="${P.deep}"/>
  <path d="M${G0[0] - 30},${G0[1] - 16} L${G0[0] + 160},${G0[1] - 30} L${G0[0] - 30},${G0[1] + 170} Z" fill="${P.cream}" opacity="0.08"/>
  ${cells}
  <g id="s4-flash" opacity="0">${glow("s4-gb", 960, 600, 700, 700)}</g>
  <g id="s4-heat" opacity="0">${glow("s4-gh", 960, 600, 760, 760)}</g>
  ${sparkles(45, 26, [0, 0, 1920, 1080], [P.gold, P.cream])}
</svg></div>
<svg id="s4-tok" width="1920" height="1080" viewBox="0 0 1920 1080">${toks}</svg>`;

const css = `
#s4-tok{position:absolute;left:0;top:0;overflow:visible;}
#s4-camB{opacity:0;}
`;

const js = `
  K.sparkles(tl, "#s4-camB", 7.1);
  // A: glide along the rows of chips, then dive into one
  K.cam(tl, "#s4-camA", [
    [0, 0, ${DIVE[0] - 380}, ${DIVE[1] - 260}, 1.6],
    [0.05, 1.0, ${DIVE[0] - 60}, ${DIVE[1] - 40}, 1.15, "sine.inOut"],
    [1.05, 0.5, ${DIVE[0]}, ${DIVE[1]}, 5, "power3.in"],
  ]);
  // B: the chip, top down, becomes the world
  tl.fromTo("#s4-camB", { opacity: 0, scale: 0.55, transformOrigin: "50% 55%" }, { opacity: 1, scale: 1, duration: 0.45, ease: "expo.out" }, 1.45);
  tl.fromTo("#s4-camA", { opacity: 1 }, { opacity: 0, duration: 0.2 }, 1.5);
  tl.fromTo("#s4-camB", { scale: 1 }, { scale: 1.06, duration: 5.1, ease: "none", immediateRender: false }, 2.0);
  // the six words arrive, flip into numbers, and pour into the die
  for (let i = 0; i < 6; i++) {
    const k = "#s4-k" + i;
    tl.fromTo(k + " .s4-w", { opacity: 0, y: -160 }, { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.5)" }, 1.55 + i * 0.06);
    tl.fromTo(k + " .s4-w", { scaleY: 1 }, { scaleY: 0, duration: 0.1, ease: "power2.in", transformOrigin: "50% 50%", immediateRender: false }, 2.1 + i * 0.06);
    tl.fromTo(k + " .s4-n", { opacity: 1, scaleY: 0 }, { scaleY: 1, duration: 0.14, ease: "power2.out", transformOrigin: "50% 50%" }, 2.2 + i * 0.06);
    tl.fromTo(k, { x: ${0}, y: 0, scale: 1, opacity: 1 }, { x: (960 - [${[0, 1, 2, 3, 4, 5].map(TX).join(",")}][i]), y: 480, scale: 0.2, opacity: 0, duration: 0.5, ease: "power3.in" }, 2.9 + i * 0.07);
  }
  // billions of tiny sums: a wave rolls across the cores, one by one
  const cells = document.querySelectorAll("#s4-camB .s4-cell");
  cells.forEach((c) => {
    const i = +c.dataset.i, j = +c.dataset.j, t0 = 3.3 + (i + j) * 0.12;
    const on = c.querySelector(".s4-on"), op = c.querySelector(".s4-op");
    tl.fromTo(on, { opacity: 0 }, { opacity: 0.9, duration: 0.08 }, t0);
    tl.fromTo(op, { opacity: 0 }, { opacity: 1, duration: 0.08 }, t0);
    const fo = Math.min(0.3, 5.92 - (t0 + 0.25));
    tl.fromTo(on, { opacity: 0.9 }, { opacity: 0, duration: fo, immediateRender: false }, t0 + 0.25);
    tl.fromTo(op, { opacity: 1 }, { opacity: 0, duration: fo, immediateRender: false }, t0 + 0.25);
    // all at the same time
    tl.fromTo([on, op], { opacity: 0 }, { opacity: 1, duration: 0.06, immediateRender: false }, 5.94);
    tl.fromTo(on, { fill: "${P.gold}" }, { fill: "${P.tang}", duration: 0.6, immediateRender: false }, 6.4);
  });
  tl.fromTo("#s4-flash", { opacity: 0 }, { opacity: 1, duration: 0.08 }, 5.94);
  tl.fromTo("#s4-flash", { opacity: 1 }, { opacity: 0.4, duration: 0.5, immediateRender: false }, 6.1);
  tl.fromTo("#s4-heat", { opacity: 0 }, { opacity: 0.8, duration: 0.6 }, 6.4);
`;

export default { id: "s4", css, html, js };
