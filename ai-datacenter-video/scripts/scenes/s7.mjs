// Scene 7 · 41.9–46.5 s · "And since 2019, more than a thousand of them have gone up around the world."
import { P, glowDef, glow, sparkles, rng } from "../kit.mjs";

const R = rng(77);
const GC = [1220, 560], GR = 400;
const MS = (2 * GR) / 1200; // map scale: map height fills the globe's diameter
const LAND = {
  na: [[130, 180], [400, 120], [700, 140], [820, 230], [700, 330], [640, 420], [560, 520], [500, 560], [420, 500], [330, 420], [250, 330], [170, 260]],
  gl: [[820, 80], [960, 70], [930, 190], [850, 200]],
  sa: [[600, 590], [720, 600], [820, 680], [780, 820], [700, 960], [650, 1000], [640, 880], [590, 720]],
  eu: [[1150, 170], [1300, 140], [1420, 200], [1380, 300], [1260, 330], [1180, 300]],
  af: [[1130, 380], [1300, 360], [1420, 450], [1480, 560], [1400, 720], [1330, 850], [1260, 820], [1230, 640], [1120, 520]],
  as: [[1420, 140], [1800, 100], [2150, 150], [2280, 240], [2150, 380], [2000, 460], [1880, 560], [1760, 480], [1640, 500], [1520, 430], [1420, 320]],
  au: [[1960, 720], [2140, 700], [2220, 800], [2120, 880], [1980, 860]],
};
const inPoly = (x, y, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const smooth = (pts) => {
  // closed Catmull-Rom → cubic Béziers
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length], p1 = pts[i], p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(0)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(0)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(0)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(0)} ${p2[0]},${p2[1]}`;
  }
  return d + "Z";
};
let land = "";
Object.values(LAND).forEach((pl) => {
  land += `<path d="${smooth(pl)}" fill="${P.sage}"/>`;
  land += `<path d="${smooth(pl)}" fill="${P.moss}" transform="translate(10,14)" opacity="0.5"/>`;
});
// data-center dots on land (illustrative placement, weighted to where they cluster)
const dots = [];
const weight = { na: 0.34, eu: 0.22, as: 0.3, au: 0.05, sa: 0.04, af: 0.03, gl: 0 };
const keys = Object.keys(LAND);
let guard = 0;
while (dots.length < 150 && guard++ < 20000) {
  const x = R() * 2400, y = 60 + R() * 1000;
  const k = keys.find((kk) => inPoly(x, y, LAND[kk]));
  if (k && R() < weight[k] * 2.6) dots.push([x, y]);
}
const firstDot = [560, 300]; // the one from the last scene, in North America
let dotSvg = "";
const order = dots.map((d, i) => [R(), i]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
dots.forEach(([x, y], i) => {
  dotSvg += `<g class="s7-dot" data-k="${order.indexOf(i)}" transform="translate(${x.toFixed(0)},${y.toFixed(0)})"><g class="s7-dp"><circle r="22" fill="${P.gold}" opacity="0.35"/><circle r="12" fill="${P.tang}"/><circle r="5" fill="${P.cream}"/></g></g>`;
});
const mapLayer = (dx) => `<g transform="translate(${dx},0)">${land}${dotSvg}</g>`;

const html = `
<div class="cam" id="s7-cam"><svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    ${glowDef("s7-halo", P.aqua, 0.35)}
    <radialGradient id="s7-shade" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${P.cream}" stop-opacity="0.28"/><stop offset="0.5" stop-color="${P.cream}" stop-opacity="0"/><stop offset="0.85" stop-color="${P.nightD}" stop-opacity="0.45"/><stop offset="1" stop-color="${P.nightD}" stop-opacity="0.7"/></radialGradient>
    <clipPath id="s7-clip"><circle cx="${GC[0]}" cy="${GC[1]}" r="${GR}"/></clipPath>
  </defs>
  <rect x="-1000" y="-1000" width="4000" height="3200" fill="${P.night}"/>
  ${glow("s7-halo", GC[0], GC[1], GR * 1.6, GR * 1.6)}
  ${sparkles(78, 60, [-200, -100, 2400, 1300], [P.cream, P.gold, P.aqua])}
  <circle cx="${GC[0]}" cy="${GC[1]}" r="${GR + 14}" fill="${P.duskL}" opacity="0.5"/>
  <circle cx="${GC[0]}" cy="${GC[1]}" r="${GR}" fill="${P.dusk}"/>
  <g clip-path="url(#s7-clip)">
    <g transform="translate(${GC[0] - GR},${GC[1] - GR}) scale(${MS})">
      <g id="s7-map">${mapLayer(0)}${mapLayer(2400)}
        <g transform="translate(${firstDot[0]},${firstDot[1]})"><circle r="30" fill="${P.gold}" opacity="0.4"/><circle r="16" fill="${P.tang}"/><circle r="7" fill="${P.cream}"/></g>
      </g>
    </g>
    <circle cx="${GC[0]}" cy="${GC[1]}" r="${GR}" fill="url(#s7-shade)"/>
  </g>
</svg></div>
<div id="s7-since" class="lbl">since <span>2019</span></div>
<div id="s7-count"><span id="s7-num">0</span><span id="s7-plus">+</span></div>
<div id="s7-what" class="lbl">AI data centers</div>`;

const css = `
#s7-since{position:absolute;left:150px;top:300px;font-size:48px;color:${P.gold};}
#s7-since span{font-size:64px;color:${P.cream};margin-left:8px;}
#s7-count{position:absolute;left:140px;top:380px;font-family:"Barlow";font-weight:700;font-size:200px;line-height:1;color:${P.cream};letter-spacing:0.01em;}
#s7-plus{color:${P.tang};}
#s7-what{position:absolute;left:150px;top:600px;font-size:44px;color:${P.aqua};}
`;

// first dot in screen space at t=0 (map scrolls from 0)
const FD = [GC[0] - GR + firstDot[0] * MS, GC[1] - GR + firstDot[1] * MS];

const js = `
  K.sparkles(tl, "#s7-cam", 4.6);
  K.cam(tl, "#s7-cam", [
    [0, 0, ${FD[0].toFixed(0)}, ${FD[1].toFixed(0)}, 7],
    [0.05, 1.1, 960, 560, 1.0, "expo.out"],
    [1.2, 2.8, 940, 540, 1.04, "sine.inOut"],
    [4.05, 0.55, 1300, 470, 9, "power3.in"],
  ]);
  // the globe turns
  tl.fromTo("#s7-map", { x: 0 }, { x: -260, duration: 4.6, ease: "none" }, 0);
  // labels
  tl.fromTo("#s7-since", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2 }, 0.45);
  tl.fromTo("#s7-count", { opacity: 0 }, { opacity: 1, duration: 0.15 }, 1.55);
  tl.fromTo("#s7-what", { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.2 }, 1.9);
  tl.fromTo("#s7-plus", { opacity: 0 }, { opacity: 1, duration: 0.05 }, 2.35);
  const num = document.querySelector("#s7-num"), c = { n: 0 };
  tl.fromTo(c, { n: 0 }, { n: 1000, duration: 0.75, ease: "power2.out", onUpdate() { num.textContent = Math.round(c.n).toLocaleString("en-US"); } }, 1.6);
  tl.fromTo(["#s7-since", "#s7-count", "#s7-what"], { opacity: 1 }, { opacity: 0, duration: 0.2, immediateRender: false }, 4.0);
  // dots pop up around the world
  document.querySelectorAll("#s7-cam .s7-dp").forEach((d) => {
    const k = +d.closest(".s7-dot").dataset.k;
    tl.fromTo(d, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, 1.6 + (k / 150) * 2.2);
  });
`;

export default { id: "s7", css, html, js };
