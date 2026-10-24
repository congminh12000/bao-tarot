// Scene 6 · 37.3–41.9 s · "One AI data center can use as much electricity as a small city."
// A balance: the data center on one pan, a small city on the other — they level out.
import { P, isoBox, isoTile, isoFaceL, isoFaceR, isoP, skyDef, glowDef, glow, sparkles, rng } from "../kit.mjs";

const R = rng(66);
const PIV = [960, 330], ARM = 520; // pivot and half beam length

// a small isometric data center for the left pan (origin = centre of the pan surface)
function miniDC() {
  const o = [0, -60];
  let s = isoBox(o, -150, -80, 0, 300, 160, 60, { t: P.slateL, l: P.cream, r: P.slateL });
  s += isoFaceL(o, -150, 80, 40, 300, 8, P.tang) + isoFaceR(o, 150, -80, 40, 160, 8, P.tangD);
  for (let i = 0; i < 4; i++) s += isoBox(o, -130 + i * 72, -60, 60, 50, 120, 16, { t: P.slate, l: P.slateL, r: P.slateD });
  for (let x = -130; x < 150; x += 22) s += isoFaceL(o, x, 80, 6, 4, 30, P.creamS);
  return s;
}
// a small city: a cluster of towers and houses with lit windows
function miniCity() {
  const o = [0, -60];
  const B = [[-150, -70, 60, 60, 110], [-80, -80, 50, 50, 170], [-20, -60, 60, 60, 80], [50, -90, 50, 50, 140], [110, -50, 40, 40, 70],
    [-140, 10, 50, 50, 60], [-70, 20, 60, 50, 90], [10, 20, 50, 50, 120], [80, 20, 60, 50, 50]];
  B.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  const cols = [[P.rose, P.roseD], [P.aqua, P.aquaD], [P.cream, P.creamS], [P.slateL, P.slate], [P.apricot, P.clay]];
  let s = "";
  B.forEach(([x, y, w, d, h], i) => {
    const c = cols[i % cols.length];
    s += isoBox(o, x, y, 0, w, d, h, { t: c[1], l: c[0], r: c[1] });
    for (let z = 14; z < h - 10; z += 22) for (let k = 0; k < Math.floor(w / 18); k++) {
      s += isoFaceL(o, x + 6 + k * 16, y + d, z, 8, 10, R() < 0.7 ? P.gold : P.slateD, 'class="s6-win"');
    }
  });
  return s;
}
// a pan hanging on three cords from (0,0); its surface sits 150 px below
const pan = (id, content) => `<g id="${id}">
  <path d="M0,0 L-190,150 M0,0 L190,150 M0,0 L0,150" stroke="${P.creamS}" stroke-width="5"/>
  <circle r="12" fill="${P.goldD}"/>
  <g transform="translate(0,150)">
    <g class="s6-load">${content}</g>
    <ellipse cx="0" cy="0" rx="230" ry="38" fill="${P.goldD}"/>
    <ellipse cx="0" cy="-6" rx="230" ry="38" fill="${P.gold}"/>
    <path d="M-230,-6 Q0,60 230,-6 L230,4 Q0,74 -230,4 Z" fill="${P.goldD}"/>
  </g></g>`;

let hills = "";
for (let i = 0; i < 6; i++) {
  const x = -200 + i * 420;
  hills += `<path d="M${x},860 Q${x + 230},${700 - (i % 2) * 60} ${x + 470},860 Z" fill="${i % 2 ? P.sage : P.moss}"/>`;
}

const html = `
<div class="cam" id="s6-cam"><svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>${skyDef("s6-sky", P.night, P.dusk, P.rose)}${glowDef("s6-g", P.gold, 0.6)}${glowDef("s6-bolt", P.gold, 0.9)}</defs>
  <rect x="-400" y="-300" width="2720" height="1700" fill="url(#s6-sky)"/>
  ${glow("s6-g", 960, 820, 1100, 300)}
  ${hills}
  <rect x="-400" y="850" width="2720" height="500" fill="${P.mossD}"/>
  <ellipse cx="960" cy="935" rx="300" ry="36" fill="${P.nightD}" opacity="0.5"/>
  <!-- stand -->
  <path d="M850,930 L1070,930 L1040,890 L880,890 Z" fill="${P.plum}"/>
  <path d="M960,890 L1040,890 L1070,930 L960,930 Z" fill="${P.plumD}"/>
  <path d="M940,${PIV[1]} L980,${PIV[1]} L996,890 L924,890 Z" fill="${P.plum}"/>
  <path d="M960,${PIV[1]} L980,${PIV[1]} L996,890 L960,890 Z" fill="${P.plumD}"/>
  <g id="s6-beam">
    <rect x="${960 - ARM - 20}" y="${PIV[1] - 14}" width="${ARM * 2 + 40}" height="28" rx="14" fill="${P.clay}"/>
    <rect x="${960 - ARM - 20}" y="${PIV[1] - 14}" width="${ARM * 2 + 40}" height="10" rx="5" fill="${P.rose}"/>
  </g>
  <circle cx="960" cy="${PIV[1]}" r="30" fill="${P.gold}"/><circle cx="960" cy="${PIV[1]}" r="12" fill="${P.goldD}"/>
  ${pan("s6-panL", `<g id="s6-dc">${miniDC()}</g>`)}
  ${pan("s6-panR", `<g id="s6-city">${miniCity()}</g>`)}
  <g id="s6-bolts" opacity="0">
    ${[[-1, 0], [1, 1]].map(([sd, k]) => `<g transform="translate(${960 + sd * ARM},${PIV[1] - 40})">${glow("s6-bolt", 0, -40, 90, 90)}<path d="M-6,-110 L22,-110 L6,-54 L30,-54 L-18,20 L-4,-36 L-26,-36 Z" fill="${P.gold}"/></g>`).join("")}
  </g>
  ${sparkles(67, 30, [0, 0, 1920, 800], [P.cream, P.gold])}
</svg></div>`;

const js = `
  K.sparkles(tl, "#s6-cam", 4.6);
  K.cam(tl, "#s6-cam", [[0, 0, 1560, 560, 1.12], [0.0, 0.4, 960, 560, 1.1, "expo.out"], [0.45, 4.1, 960, 540, 1.0, "sine.inOut"]]);
  // the beam: angle a (degrees). Pans hang from its ends and stay level.
  const st = { a: 0 };
  const beam = document.querySelector("#s6-beam"), pl = document.querySelector("#s6-panL"), pr = document.querySelector("#s6-panR");
  const apply = () => {
    const r = st.a * Math.PI / 180, dx = Math.cos(r) * ${ARM}, dy = Math.sin(r) * ${ARM};
    beam.setAttribute("transform", "rotate(" + st.a + " 960 ${PIV[1]})");
    pl.setAttribute("transform", "translate(" + (960 - dx) + "," + (${PIV[1]} - dy) + ")");
    pr.setAttribute("transform", "translate(" + (960 + dx) + "," + (${PIV[1]} + dy) + ")");
  };
  const dc = K.rig(tl, "#s6-dc", 0, 0), city = K.rig(tl, "#s6-city", 0, 0);
  tl._rigs.push(apply); apply();
  // the data center drops onto the left pan and tips the beam all the way down
  tl.fromTo(dc, { y: -700 }, { y: 0, duration: 0.45, ease: "power3.in" }, 0.35);
  tl.fromTo(dc, { sy: 1 }, { sy: 0.9, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out", immediateRender: false }, 0.8);
  tl.fromTo(st, { a: 0 }, { a: -16, duration: 0.7, ease: "back.out(2.2)" }, 0.8);
  // electricity crackles on both ends
  tl.fromTo("#s6-bolts", { opacity: 0 }, { opacity: 1, duration: 0.06, yoyo: true, repeat: 5, ease: "none" }, 2.3);
  // the small city drops onto the right pan: level
  tl.fromTo(city, { y: -760 }, { y: 0, duration: 0.45, ease: "power3.in" }, 2.95);
  tl.fromTo(city, { sy: 1 }, { sy: 0.9, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out", immediateRender: false }, 3.4);
  tl.fromTo(st, { a: -16 }, { a: 0, duration: 0.9, ease: "elastic.out(1, 0.45)", immediateRender: false }, 3.4);
  // city windows switch on
  document.querySelectorAll("#s6-cam .s6-win").forEach((w, i) => {
    tl.fromTo(w, { opacity: 0.3 }, { opacity: 1, duration: 0.05 }, 3.45 + (i % 9) * 0.04);
  });
`;

export default { id: "s6", html, js };
