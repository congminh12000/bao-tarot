// Scene 8 · 46.5–52.5 s · "So the next time you ask AI something, that's where your question goes."
// Back in her room, now at night. Through the window: the data center glowing on the horizon.
import { P, womanProfile, laptop, glowDef, glow, sparkles, star, isoBox, isoFaceL } from "../kit.mjs";

const W0 = [560, 800], LS = 1.35, L0 = [706, 606];
const scr = (x, y) => [L0[0] + x * LS, L0[1] + y * LS];
const SC = scr(130, -118);
const WIN = [1080, 150, 340, 290];
// the far-off data center inside the window
const dcO = [WIN[0] + 92, WIN[1] + 214];
let dc = isoBox(dcO, 0, 0, 0, 130, 56, 22, { t: P.slateL, l: P.creamS, r: P.slate });
for (let i = 0; i < 4; i++) dc += isoBox(dcO, 8 + i * 30, 10, 22, 22, 36, 7, { t: P.slate, l: P.slateL, r: P.slateD });
for (let i = 0; i < 7; i++) dc += isoFaceL(dcO, 8 + i * 17, 56, 7, 9, 6, P.gold);
const DCP = [dcO[0] + 40, dcO[1] - 4];

const html = `
<div class="cam" id="s8-cam">
<svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="s8-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.nightD}"/><stop offset="0.7" stop-color="${P.dusk}"/><stop offset="1" stop-color="${P.plum}"/></linearGradient>
    ${glowDef("s8-lamp", P.gold, 0.55)}${glowDef("s8-scr", P.cream, 0.55)}${glowDef("s8-dcg", P.gold, 0.9)}${glowDef("s8-pg", P.gold, 1)}
    <clipPath id="s8-winclip"><rect x="${WIN[0]}" y="${WIN[1]}" width="${WIN[2]}" height="${WIN[3]}"/></clipPath>
  </defs>
  <rect x="-400" y="-300" width="2720" height="1300" fill="${P.night}"/>
  <rect x="-400" y="-300" width="1000" height="1300" fill="${P.dusk}" opacity="0.35"/>
  <rect x="-400" y="700" width="2720" height="180" fill="${P.nightD}"/>
  <rect x="-400" y="700" width="2720" height="14" fill="${P.slateD}"/>
  <rect x="-400" y="870" width="2720" height="500" fill="${P.oakS}"/>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${-400 + i * 200}" y="870" width="6" height="500" fill="${P.plumD}" opacity="0.4"/>`).join("")}
  <!-- the window at night, with the data center far away -->
  <rect x="${WIN[0] - 18}" y="${WIN[1] - 18}" width="${WIN[2] + 36}" height="${WIN[3] + 36}" fill="${P.creamS}"/>
  <g clip-path="url(#s8-winclip)">
    <rect x="${WIN[0]}" y="${WIN[1]}" width="${WIN[2]}" height="${WIN[3]}" fill="url(#s8-sky)"/>
    ${[[30, 30], [90, 60], [170, 24], [250, 70], [310, 36], [130, 110], [210, 120]].map(([x, y]) => star(WIN[0] + x, WIN[1] + y, 6, P.cream)).join("")}
    <circle cx="${WIN[0] + 270}" cy="${WIN[1] + 64}" r="26" fill="${P.cream}"/><circle cx="${WIN[0] + 282}" cy="${WIN[1] + 56}" r="24" fill="${P.nightD}"/>
    <path d="M${WIN[0]},${WIN[1] + 214} Q${WIN[0] + 110},${WIN[1] + 196} ${WIN[0] + 200},${WIN[1] + 226} T${WIN[0] + 340},${WIN[1] + 220} L${WIN[0] + 340},${WIN[1] + 290} L${WIN[0]},${WIN[1] + 290} Z" fill="${P.slateD}"/>
    <g id="s8-dcglow" opacity="0.5">${glow("s8-dcg", DCP[0], DCP[1], 120, 70)}</g>
    ${dc}
    <path d="M${WIN[0]},${WIN[1] + 262} Q${WIN[0] + 150},${WIN[1] + 236} ${WIN[0] + 340},${WIN[1] + 258} L${WIN[0] + 340},${WIN[1] + 290} L${WIN[0]},${WIN[1] + 290} Z" fill="${P.deep}"/>
    <path id="s8-route" d="M${WIN[0] + 150},${WIN[1] + 286} Q${WIN[0] + 150},${WIN[1] + 236} ${DCP[0]},${DCP[1] + 6}" stroke="${P.gold}" stroke-width="3" stroke-dasharray="3 9" fill="none" opacity="0"/>
  </g>
  <rect x="${WIN[0] + WIN[2] / 2 - 6}" y="${WIN[1]}" width="12" height="${WIN[3]}" fill="${P.creamS}"/>
  <rect x="${WIN[0]}" y="${WIN[1] + WIN[3] * 0.45 - 6}" width="${WIN[2]}" height="12" fill="${P.creamS}"/>
  <rect x="${WIN[0] - 30}" y="${WIN[1] + WIN[3] + 10}" width="${WIN[2] + 60}" height="16" fill="${P.oak}"/>
  <!-- wall frame, shelf -->
  <rect x="190" y="200" width="200" height="150" fill="${P.creamS}"/><rect x="206" y="216" width="168" height="118" fill="${P.moss}"/>
  <path d="M206,334 L270,262 L320,310 L346,286 L374,334 Z" fill="${P.mossD}"/><circle cx="330" cy="248" r="14" fill="${P.cream}"/>
  <rect x="1560" y="330" width="300" height="16" fill="${P.oak}"/><rect x="1560" y="346" width="300" height="8" fill="${P.oakS}"/>
  <rect x="1580" y="246" width="30" height="84" fill="${P.tang}"/><rect x="1612" y="262" width="26" height="68" fill="${P.aqua}"/>
  <rect x="1640" y="236" width="34" height="94" fill="${P.plum}"/><rect x="1676" y="270" width="24" height="60" fill="${P.gold}"/>
  <path d="M1760,330 L1830,330 L1820,280 L1770,280 Z" fill="${P.clay}"/>
  <path d="M1795,282 C1760,240 1740,220 1750,190 C1780,210 1795,240 1795,282 C1800,230 1820,200 1850,196 C1850,230 1830,260 1795,282 Z" fill="${P.sage}"/>
  ${glow("s8-lamp", 1330, 480, 560, 400)}
  <!-- desk, lamp, mug -->
  <path d="M600,612 L1540,612 L1500,560 L640,560 Z" fill="${P.oak}"/>
  <rect x="600" y="612" width="940" height="30" fill="${P.oakS}"/>
  <rect x="640" y="642" width="34" height="250" fill="${P.oakS}"/><rect x="1470" y="642" width="34" height="250" fill="${P.oakS}"/>
  <ellipse cx="1060" cy="900" rx="520" ry="26" fill="${P.nightD}" opacity="0.4"/>
  <ellipse cx="1340" cy="578" rx="58" ry="14" fill="${P.deep}"/>
  <path d="M1336,574 L1300,430 L1314,426 L1350,570 Z" fill="${P.slateD}"/>
  <path d="M1306,430 L1400,360 L1408,372 L1316,440 Z" fill="${P.slateD}"/>
  <path d="M1370,330 L1460,390 L1420,440 L1350,380 Z" fill="${P.tang}"/>
  <path d="M1420,440 L1460,390 L1468,400 L1428,450 Z" fill="${P.tangD}"/>
  <ellipse cx="1430" cy="432" rx="34" ry="14" fill="${P.gold}" transform="rotate(-50 1430 432)"/>
  <path d="M1170,520 L1222,520 L1218,580 L1174,580 Z" fill="${P.aqua}"/><path d="M1200,520 L1222,520 L1218,580 L1198,580 Z" fill="${P.aquaD}"/>
  <ellipse cx="1196" cy="520" rx="26" ry="7" fill="${P.deep}"/>
  <!-- chair -->
  <path d="M396,560 L428,560 L436,900 L404,900 Z" fill="${P.slateD}"/>
  <path d="M380,420 C380,380 420,370 430,400 L440,640 L396,640 Z" fill="${P.slate}"/>
  <path d="M420,800 L700,800 L690,830 L420,830 Z" fill="${P.slate}"/>
  <rect x="540" y="846" width="26" height="80" fill="${P.deep}"/><path d="M460,930 L650,930 L640,946 L470,946 Z" fill="${P.deep}"/>
  <g transform="translate(${W0[0]},${W0[1]}) scale(${LS})">${womanProfile("s8")}</g>
  ${glow("s8-scr", SC[0] - 120, SC[1], 380, 300)}
  <g transform="translate(${L0[0]},${L0[1]}) scale(${LS})">
    ${laptop("s8", P.cream)}
    <g transform="matrix(1,0.044,0.034,1,0,0)">
      <rect x="66" y="-140" width="128" height="30" rx="8" fill="#FFFBF2" stroke="${P.creamS}" stroke-width="2"/>
      <circle cx="182" cy="-125" r="9" fill="${P.tang}"/>
      <g id="s8-ans" opacity="0">
        <rect x="66" y="-96" width="128" height="62" rx="8" fill="#FFFBF2"/>
        <path d="M84,-66 L120,-66 Q118,-46 102,-44 Q86,-46 84,-66 Z" fill="${P.aqua}"/>
        <path d="M85,-66 C88,-80 116,-80 119,-66 Z" fill="${P.gold}"/>
        <rect x="128" y="-84" width="54" height="6" rx="3" fill="${P.slateL}"/><rect x="128" y="-70" width="44" height="6" rx="3" fill="${P.slateL}"/><rect x="128" y="-56" width="50" height="6" rx="3" fill="${P.slateL}"/>
      </g>
    </g>
  </g>
  <g id="s8-pulse" opacity="0">${glow("s8-pg", 0, 0, 60, 60)}<circle r="10" fill="${P.gold}"/><circle r="4" fill="${P.cream}"/></g>
  ${sparkles(88, 24, [0, 40, 1920, 800], [P.cream, P.gold])}
</svg>
</div>
<svg id="s8-iris" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><mask id="s8-irism"><rect width="1920" height="1080" fill="#fff"/><circle id="s8-irisc" cx="960" cy="540" r="0" fill="#000"/></mask></defs><rect width="1920" height="1080" fill="${P.night}" mask="url(#s8-irism)"/></svg>`;

const css = `#s8-iris{position:absolute;left:0;top:0;}`;

const js = `
  K.sparkles(tl, "#s8-cam", 6);
  // iris opens from the globe's dot onto her room
  tl.fromTo("#s8-irisc", { attr: { r: 0 } }, { attr: { r: 1150 }, duration: 0.6, ease: "power2.inOut" }, 0);
  K.cam(tl, "#s8-cam", [
    [0, 0, 960, 520, 1.25],
    [0.05, 1.9, 900, 520, 1.05, "sine.out"],
    [2.0, 1.3, ${DCP[0] + 30}, ${DCP[1] - 10}, 2.7],
    [3.75, 1.4, ${WIN[0] - 60}, ${WIN[1] + WIN[3] / 2 + 120}, 1.6, "power2.inOut"],
  ]);
  const fore = K.rig(tl, "#s8-fore", 44, -140), head = K.rig(tl, "#s8-head", 14, -266), mouth = K.rig(tl, "#s8-mouth", 58, -297);
  for (let i = 0; i < 8; i++) tl.fromTo(fore, { r: 0 }, { r: (i % 2 ? -2.2 : 1.8), duration: 0.08, ease: "sine.inOut", yoyo: true, repeat: 1, immediateRender: false }, 0.6 + i * 0.15);
  K.blink(tl, "#s8-lid", [1.0, 3.2, 5.2]);
  // her question leaves the laptop, out of the window, over the hills to the data center
  const route = document.querySelector("#s8-route");
  const L = route.getTotalLength();
  const pulse = document.querySelector("#s8-pulse"), q = { t: 0 };
  const S = [${SC[0].toFixed(0)}, ${SC[1].toFixed(0)}];
  tl.fromTo("#s8-pulse", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 2.15);
  tl.fromTo(q, { t: 0 }, { t: 1, duration: 1.3, ease: "power2.inOut", onUpdate() {
    // first leg: from the screen to the window sill; second leg: along the route to the horizon
    let x, y, s;
    if (q.t < 0.4) { const k = q.t / 0.4; x = S[0] + (${WIN[0] + 150} - S[0]) * k; y = S[1] + (${WIN[1] + 286} - S[1]) * k - Math.sin(k * Math.PI) * 120; s = 1 - k * 0.4; }
    else { const k = (q.t - 0.4) / 0.6, pt = route.getPointAtLength(L * k); x = pt.x; y = pt.y; s = 0.6 - k * 0.35; }
    pulse.setAttribute("transform", "translate(" + x + "," + y + ") scale(" + s + ")");
  } }, 2.2);
  tl.fromTo("#s8-route", { opacity: 0 }, { opacity: 0.9, duration: 0.3 }, 2.6);
  tl.fromTo("#s8-pulse", { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: false }, 3.5);
  tl.fromTo("#s8-dcglow", { opacity: 0.5 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, 3.45);
  tl.fromTo("#s8-dcglow", { opacity: 1 }, { opacity: 0.7, duration: 1.2, ease: "sine.inOut", immediateRender: false }, 3.7);
  // the answer comes back; she smiles
  tl.fromTo("#s8-ans", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 4.3);
  tl.fromTo(head, { r: 0 }, { r: -5, duration: 0.5, ease: "power2.out" }, 4.4);
  tl.fromTo(mouth, { sx: 1, sy: 1 }, { sx: 1.5, sy: 1.3, duration: 0.3 }, 4.5);
`;

export default { id: "s8", css, html, js };
