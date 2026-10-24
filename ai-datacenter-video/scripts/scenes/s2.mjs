// Scene 2 · 8.6–14.0 s · "They raced through the cables under your street and landed in a building like this, miles away."
// Cross-section side view: house → street cut open → fibre conduit → fields → the data center.
import { P, skyDef, glowDef, glow, sparkles, rng } from "../kit.mjs";

const GY = 640; // ground line
const CY = 770; // conduit centre
const DCX = 4520; // data center left wall
const R = rng(22);

let trees = "";
for (let x = 1200; x < 4300; x += 150 + Math.floor(R() * 160)) {
  const h = 90 + R() * 70, w = 40 + R() * 20;
  trees += `<rect x="${x - 6}" y="${GY - 40}" width="12" height="40" fill="${P.plumD}"/>
    <path d="M${x},${GY - 40 - h} L${x + w},${GY - 34} L${x - w},${GY - 34} Z" fill="${P.moss}"/>
    <path d="M${x},${GY - 40 - h} L${x + w},${GY - 34} L${x},${GY - 34} Z" fill="${P.mossD}"/>`;
}
let poles = "";
for (let x = 1500; x < 4300; x += 520) {
  poles += `<rect x="${x}" y="${GY - 230}" width="12" height="230" fill="${P.plumD}"/><rect x="${x - 30}" y="${GY - 220}" width="72" height="10" fill="${P.plumD}"/>`;
}
let wires = "";
for (let x = 1500; x < 3700; x += 520) wires += `<path d="M${x + 6},${GY - 214} Q${x + 266},${GY - 170} ${x + 526},${GY - 214}" stroke="${P.deep}" stroke-width="3" fill="none" opacity="0.6"/>`;
let farHills = "";
for (let i = 0; i < 12; i++) {
  const x = -400 + i * 560;
  farHills += `<path d="M${x},${GY} Q${x + 280},${GY - 180 - (i % 3) * 50} ${x + 600},${GY} Z" fill="${P.slate}"/>
  <path d="M${x + 280},${GY - 90 - (i % 3) * 25} Q${x + 450},${GY - 60} ${x + 600},${GY} L${x + 300},${GY} Z" fill="${P.slateD}" opacity="0.5"/>`;
}
// small neighbour houses
const house = (x, w, h, wall, roof, roofD, lit) => `
  <rect x="${x}" y="${GY - h}" width="${w}" height="${h}" fill="${wall}"/>
  <path d="M${x - 24},${GY - h} L${x + w / 2},${GY - h - w * 0.45} L${x + w + 24},${GY - h} Z" fill="${roof}"/>
  <path d="M${x + w / 2},${GY - h - w * 0.45} L${x + w + 24},${GY - h} L${x + w / 2},${GY - h} Z" fill="${roofD}"/>
  <rect x="${x + w * 0.2}" y="${GY - h * 0.7}" width="${w * 0.22}" height="${h * 0.3}" fill="${lit ? P.gold : P.slateD}"/>
  <rect x="${x + w * 0.6}" y="${GY - h * 0.5}" width="${w * 0.2}" height="${h * 0.5}" fill="${P.plumD}"/>`;

let soil = "";
for (let i = 0; i < 90; i++) {
  const x = -400 + R() * 6200, y = GY + 90 + R() * 300;
  soil += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(6 + R() * 12).toFixed(0)}" ry="${(4 + R() * 6).toFixed(0)}" fill="${P.oakS}" opacity="0.6"/>`;
}

// data center in side elevation
let dc = `<g id="s2-dc">
  <rect x="${DCX - 60}" y="${GY - 10}" width="1240" height="14" fill="${P.asphD}"/>
  <rect x="${DCX}" y="${GY - 300}" width="1100" height="300" fill="${P.cream}"/>
  <rect x="${DCX + 700}" y="${GY - 300}" width="400" height="300" fill="${P.creamS}"/>
  ${Array.from({ length: 27 }, (_, i) => `<rect x="${DCX + 20 + i * 40}" y="${GY - 290}" width="8" height="280" fill="${P.creamS}"/>`).join("")}
  <rect x="${DCX}" y="${GY - 250}" width="1100" height="20" fill="${P.tang}"/>
  <rect x="${DCX}" y="${GY - 316}" width="1100" height="18" fill="${P.slate}"/>
  ${Array.from({ length: 6 }, (_, i) => `<rect x="${DCX + 60 + i * 170}" y="${GY - 370}" width="120" height="54" fill="${P.slate}"/><rect x="${DCX + 60 + i * 170}" y="${GY - 370}" width="120" height="12" fill="${P.slateL}"/>`).join("")}
  ${Array.from({ length: 3 }, (_, i) => `<rect x="${DCX + 120 + i * 200}" y="${GY - 130}" width="120" height="130" fill="${P.slate}"/>`).join("")}
  <rect x="${DCX + 860}" y="${GY - 150}" width="70" height="150" fill="${P.deep}"/>
  <g id="s2-dcglow" opacity="0">
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${DCX + 60 + i * 100}" y="${GY - 210}" width="60" height="26" rx="4" fill="${P.gold}"/>`).join("")}
  </g>
  ${Array.from({ length: 30 }, (_, i) => `<rect x="${DCX - 60 + i * 42}" y="${GY - 80}" width="5" height="80" fill="${P.slateD}"/>`).join("")}
  <rect x="${DCX - 60}" y="${GY - 76}" width="1240" height="5" fill="${P.slateD}"/>
</g>`;

const html = `
<div class="cam" id="s2-far"><svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>${skyDef("s2-sky", P.dusk, P.rose, P.apricot)}</defs>
  <rect x="-2000" y="-1400" width="14000" height="2100" fill="url(#s2-sky)"/>
  <circle cx="2300" cy="${GY - 120}" r="90" fill="${P.gold}" opacity="0.85"/>
  ${Array.from({ length: 9 }, (_, i) => { const x = -200 + i * 700, y = 180 + (i % 3) * 90; return `<g opacity="0.45"><ellipse cx="${x}" cy="${y}" rx="160" ry="34" fill="${P.cream}"/><ellipse cx="${x + 60}" cy="${y - 26}" rx="90" ry="40" fill="${P.cream}"/><ellipse cx="${x - 50}" cy="${y - 14}" rx="70" ry="30" fill="${P.cream}"/><ellipse cx="${x}" cy="${y + 18}" rx="150" ry="14" fill="${P.rose}"/></g>`; }).join("")}
  ${farHills}
</svg></div>
<div class="cam" id="s2-cam"><svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>${glowDef("s2-pg", P.gold, 0.9)}${glowDef("s2-win", P.gold, 0.5)}</defs>
  <!-- ground and cutaway -->
  <rect x="-1200" y="${GY}" width="7600" height="1200" fill="${P.clay}"/>
  <rect x="-1200" y="${GY}" width="7600" height="40" fill="${P.sage}"/>
  <rect x="-1200" y="${GY + 40}" width="7600" height="50" fill="${P.oakS}"/>
  <rect x="-1200" y="${GY + 300}" width="7600" height="900" fill="${P.plum}" opacity="0.55"/>
  ${soil}
  <!-- street: asphalt slab with a cut face -->
  <rect x="560" y="${GY - 4}" width="900" height="34" fill="${P.asph}"/>
  <rect x="560" y="${GY + 30}" width="900" height="16" fill="${P.asphD}"/>
  ${Array.from({ length: 6 }, (_, i) => `<rect x="${600 + i * 150}" y="${GY + 6}" width="70" height="8" fill="${P.cream}" opacity="0.8"/>`).join("")}
  <!-- conduit -->
  <rect x="-200" y="${CY - 22}" width="${DCX + 300}" height="44" rx="22" fill="${P.slateD}"/>
  <rect x="-200" y="${CY - 22}" width="${DCX + 300}" height="12" rx="6" fill="${P.slate}"/>
  <rect id="s2-fibre" x="-200" y="${CY - 3}" width="${DCX + 300}" height="6" fill="${P.gold}" opacity="0.45"/>
  <!-- riser from the house and into the data center -->
  <rect x="330" y="${GY - 10}" width="40" height="${CY - GY + 10}" fill="${P.slateD}"/>
  <rect x="${DCX + 60}" y="${GY - 10}" width="40" height="${CY - GY + 10}" fill="${P.slateD}"/>
  <!-- her house -->
  <rect x="80" y="${GY - 330}" width="500" height="330" fill="${P.cream}"/>
  <rect x="380" y="${GY - 330}" width="200" height="330" fill="${P.creamS}"/>
  <path d="M40,${GY - 330} L330,${GY - 520} L620,${GY - 330} Z" fill="${P.plum}"/>
  <path d="M330,${GY - 520} L620,${GY - 330} L330,${GY - 330} Z" fill="${P.plumD}"/>
  <rect x="440" y="${GY - 470}" width="44" height="90" fill="${P.clay}"/>
  ${glow("s2-win", 230, GY - 220, 260, 200)}
  <rect id="s2-window" x="150" y="${GY - 300}" width="170" height="150" fill="${P.gold}"/>
  <rect x="${150 + 85 - 5}" y="${GY - 300}" width="10" height="150" fill="${P.creamS}"/>
  <rect x="150" y="${GY - 300 + 62}" width="170" height="10" fill="${P.creamS}"/>
  <rect x="140" y="${GY - 150}" width="190" height="14" fill="${P.oak}"/>
  <rect x="420" y="${GY - 170}" width="90" height="170" fill="${P.plumD}"/>
  <circle cx="496" cy="${GY - 84}" r="6" fill="${P.gold}"/>
  <!-- neighbours, trees, poles -->
  ${house(1520, 260, 200, P.rose, P.slateD, P.deep, true)}
  ${house(1900, 220, 170, P.aqua, P.plum, P.plumD, false)}
  ${trees}${poles}${wires}
  <!-- street lamp -->
  <rect x="700" y="${GY - 260}" width="12" height="260" fill="${P.deep}"/>
  <path d="M706,${GY - 260} Q706,${GY - 290} 760,${GY - 290}" stroke="${P.deep}" stroke-width="10" fill="none"/>
  <rect x="750" y="${GY - 296}" width="40" height="14" rx="6" fill="${P.gold}"/>
  ${dc}
  <!-- pulses (the six words) -->
  ${Array.from({ length: 6 }, (_, i) => `<g id="s2-p${i}"><ellipse rx="110" ry="60" fill="url(#s2-pg)"/><rect x="-40" y="-14" width="80" height="28" rx="14" fill="${P.gold}"/><rect x="-28" y="-6" width="46" height="9" rx="4" fill="${P.cream}"/></g>`).join("")}
  <!-- distance marker -->
  <g id="s2-miles" opacity="0">
    <path d="M${DCX - 80},${GY - 440} L${DCX - 1100},${GY - 440}" stroke="${P.cream}" stroke-width="6" stroke-dasharray="4 18" stroke-linecap="round"/>
    <path d="M${DCX - 1080},${GY - 462} L${DCX - 1112},${GY - 440} L${DCX - 1080},${GY - 418}" stroke="${P.cream}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${DCX - 590}" y="${GY - 470}" text-anchor="middle" font-family="Barlow" font-weight="700" font-size="60" letter-spacing="6" fill="${P.cream}">MILES AWAY</text>
  </g>
  ${sparkles(23, 40, [-200, 0, 5800, 600])}
</svg></div>`;

// camera keys (scene-local seconds)
const keys = [
  [0, 0, 235, 395, 3.2],
  [0.12, 0.85, 700, 520, 1.0],
  [1.0, 2.0, DCX + 420, 470, 0.92],
  [3.3, 2.0, DCX + 200, 400, 0.9, "power1.inOut"],
];
const farKeys = keys.map((k) => [k[0], k[1], 700 + (k[2] - 700) * 0.35, k[3], k[4], k[5]]);
farKeys[0][2] = 235; // match the start framing

const js = `
  K.sparkles(tl, "#s2-cam", 5.4);
  K.cam(tl, "#s2-cam", ${JSON.stringify(keys)});
  K.cam(tl, "#s2-far", ${JSON.stringify(farKeys)});
  // words leave her window, drop to the street riser, then race along the conduit
  for (let i = 0; i < 6; i++) {
    const p = "#s2-p" + i;
    tl.fromTo(p, { x: 235 + (i - 2.5) * 14, y: ${GY - 225}, scale: 0.35, opacity: 0 }, { x: 350, y: ${GY - 20}, scale: 0.7, opacity: 1, duration: 0.5, ease: "power2.in" }, 0.05 + i * 0.05);
    tl.fromTo(p, { x: 350, y: ${GY - 20} }, { x: 380 + i * 4, y: ${CY}, scale: 1, duration: 0.3, ease: "power2.in", immediateRender: false }, 0.55 + i * 0.05);
    tl.fromTo(p, { x: 380 + i * 4 }, { x: ${DCX + 80} - i * 90, duration: 2.05, ease: "power2.inOut", immediateRender: false }, 0.95 + i * 0.03);
    tl.fromTo(p, { x: ${DCX + 80} - i * 90, y: ${CY} }, { x: ${DCX + 80}, y: ${GY - 30}, scale: 0.5, duration: 0.35 + i * 0.06, ease: "power2.in", immediateRender: false }, 2.95 + i * 0.04);
    tl.fromTo(p, { opacity: 1 }, { opacity: 0, duration: 0.1, immediateRender: false }, 3.3 + i * 0.06);
  }
  tl.fromTo("#s2-fibre", { opacity: 0.45 }, { opacity: 1, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut" }, 1.0);
  // landed: the building lights up
  tl.fromTo("#s2-dcglow", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 3.2);
  tl.fromTo("#s2-dc", { y: 0 }, { y: -6, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" }, 3.22);
  tl.fromTo("#s2-miles", { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, 4.2);
`;

export default { id: "s2", html, js };
