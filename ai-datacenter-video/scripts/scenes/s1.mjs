// Scene 1 · 0.0–8.6 s · "You type a question … your six words just left your house."
import { P, womanProfile, laptop, duskWindow, skyDef, glowDef, glow, sparkles, star } from "../kit.mjs";

const WORDS = ["How", "do", "I", "make", "potato", "salad?"];
// woman at seat (560,800) scale 1.35; laptop origin (706,606) scale 1.35
const W0 = [560, 800], LS = 1.35, L0 = [706, 606];
const scr = (x, y) => [L0[0] + x * LS, L0[1] + y * LS];
const SC = scr(130, -118); // screen centre in world px

// six word tiles start on the laptop screen, burst into an arc, then fly out the window
const tiles = WORDS.map((w, i) => {
  const wpx = 34 + w.length * 19;
  return `<g class="s1-tile" id="s1-t${i}" data-layout-allow-overlap><g class="s1-tin" data-layout-allow-overlap>
    <rect x="${-wpx / 2}" y="-34" width="${wpx}" height="68" rx="16" fill="${P.cream}"/>
    <rect x="${-wpx / 2}" y="22" width="${wpx}" height="12" rx="6" fill="${P.creamS}"/>
    <text x="0" y="12" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="34" fill="${P.deep}">${w}</text></g></g>`;
}).join("");

const html = `
<div class="cam" id="s1-cam">
<svg width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    ${skyDef("s1-sky")}
    ${glowDef("s1-lamp", P.gold, 0.6)}
    ${glowDef("s1-scr", P.cream, 0.5)}
    ${glowDef("s1-bowlg", P.gold, 0.8)}
    <clipPath id="s1-lensclip"><circle cx="0" cy="0" r="150"/></clipPath>
  </defs>
  <!-- room -->
  <rect x="-400" y="-300" width="2720" height="1300" fill="${P.dusk}"/>
  <rect x="-400" y="-300" width="1000" height="1300" fill="${P.duskL}" opacity="0.5"/>
  <rect x="-400" y="700" width="2720" height="180" fill="${P.slateD}"/>
  <rect x="-400" y="700" width="2720" height="14" fill="${P.slate}"/>
  <rect x="-400" y="870" width="2720" height="500" fill="${P.oak}"/>
  ${Array.from({ length: 14 }, (_, i) => `<rect x="${-400 + i * 200}" y="870" width="6" height="500" fill="${P.oakS}" opacity="0.5"/>`).join("")}
  <rect x="-400" y="870" width="2720" height="12" fill="${P.oakS}"/>
  ${duskWindow("s1", 1080, 150, 340, 290)}
  <path d="M1080,440 L1420,440 L1200,1080 L640,1080 Z" fill="${P.apricot}" opacity="0.10"/>
  <!-- frame on the wall -->
  <rect x="190" y="200" width="200" height="150" fill="${P.creamS}"/><rect x="206" y="216" width="168" height="118" fill="${P.sage}"/>
  <path d="M206,334 L270,262 L320,310 L346,286 L374,334 Z" fill="${P.moss}"/><circle cx="330" cy="248" r="14" fill="${P.gold}"/>
  <!-- shelf with books and a plant -->
  <rect x="1560" y="330" width="300" height="16" fill="${P.oak}"/><rect x="1560" y="346" width="300" height="8" fill="${P.oakS}"/>
  <rect x="1580" y="246" width="30" height="84" fill="${P.tang}"/><rect x="1612" y="262" width="26" height="68" fill="${P.aqua}"/>
  <rect x="1640" y="236" width="34" height="94" fill="${P.plum}"/><rect x="1676" y="270" width="24" height="60" fill="${P.gold}"/>
  <path d="M1760,330 L1830,330 L1820,280 L1770,280 Z" fill="${P.clay}"/>
  <path d="M1795,282 C1760,240 1740,220 1750,190 C1780,210 1795,240 1795,282 C1800,230 1820,200 1850,196 C1850,230 1830,260 1795,282 Z" fill="${P.sage}"/>
  <!-- lamp glow -->
  ${glow("s1-lamp", 1330, 480, 520, 360)}
  <!-- desk -->
  <path d="M600,612 L1540,612 L1500,560 L640,560 Z" fill="${P.oak}"/>
  <rect x="600" y="612" width="940" height="30" fill="${P.oakS}"/>
  <rect x="640" y="642" width="34" height="250" fill="${P.oakS}"/><rect x="1470" y="642" width="34" height="250" fill="${P.oakS}"/>
  <rect x="640" y="642" width="12" height="250" fill="${P.oak}"/><rect x="1470" y="642" width="12" height="250" fill="${P.oak}"/>
  <!-- lamp -->
  <ellipse cx="1340" cy="578" rx="58" ry="14" fill="${P.deep}"/>
  <path d="M1336,574 L1300,430 L1314,426 L1350,570 Z" fill="${P.slateD}"/>
  <path d="M1306,430 L1400,360 L1408,372 L1316,440 Z" fill="${P.slateD}"/>
  <path d="M1370,330 L1460,390 L1420,440 L1350,380 Z" fill="${P.tang}"/>
  <path d="M1420,440 L1460,390 L1468,400 L1428,450 Z" fill="${P.tangD}"/>
  <ellipse cx="1430" cy="432" rx="34" ry="14" fill="${P.gold}" transform="rotate(-50 1430 432)"/>
  <!-- mug -->
  <path d="M1170,520 L1222,520 L1218,580 L1174,580 Z" fill="${P.aqua}"/>
  <path d="M1200,520 L1222,520 L1218,580 L1198,580 Z" fill="${P.aquaD}"/>
  <path d="M1222,534 Q1246,540 1222,566" stroke="${P.aquaD}" stroke-width="8" fill="none"/>
  <ellipse cx="1196" cy="520" rx="26" ry="7" fill="${P.deep}"/>
  <ellipse cx="1060" cy="900" rx="520" ry="26" fill="${P.deep}" opacity="0.22"/>
  <ellipse cx="580" cy="944" rx="200" ry="18" fill="${P.deep}" opacity="0.25"/>
  <!-- chair back -->
  <path d="M396,560 L428,560 L436,900 L404,900 Z" fill="${P.slateD}"/>
  <path d="M380,420 C380,380 420,370 430,400 L440,640 L396,640 Z" fill="${P.slate}"/>
  <path d="M420,800 L700,800 L690,830 L420,830 Z" fill="${P.slate}"/>
  <path d="M420,830 L690,830 L688,846 L420,846 Z" fill="${P.slateD}"/>
  <rect x="540" y="846" width="26" height="80" fill="${P.deep}"/>
  <path d="M460,930 L650,930 L640,946 L470,946 Z" fill="${P.deep}"/>
  <!-- woman -->
  <g transform="translate(${W0[0]},${W0[1]}) scale(${LS})">${womanProfile("s1")}</g>
  <!-- screen light on desk -->
  ${glow("s1-scr", SC[0], SC[1] + 40, 300, 220)}
  <!-- laptop -->
  <g transform="translate(${L0[0]},${L0[1]}) scale(${LS})">
    ${laptop("s1", P.cream)}
    <g transform="matrix(1,0.044,0.034,1,0,0)">
      <rect x="66" y="-140" width="128" height="30" rx="8" fill="#FFFBF2" stroke="${P.creamS}" stroke-width="2"/>
      <circle cx="182" cy="-125" r="9" fill="${P.tang}"/>
      <text id="s1-mini" opacity="0" x="74" y="-120" font-family="Nunito" font-weight="800" font-size="8.6" fill="${P.deep}">How do I make potato salad?</text>
    </g>
  </g>
  <!-- the forearm sits over the laptop base -->
  <!-- lens: x-ray of the laptop showing the imagined answer inside -->
  <g id="s1-lens" transform="translate(${SC[0]},${SC[1]})">
    <g id="s1-lensin">
      <circle r="164" fill="${P.creamS}"/>
      <g clip-path="url(#s1-lensclip)">
        <circle r="150" fill="${P.nightD}"/>
        ${Array.from({ length: 7 }, (_, i) => `<path d="M-150,${-90 + i * 30} H${-60 + (i % 3) * 30} V${-70 + i * 30} H150" stroke="${P.duskL}" stroke-width="5" fill="none"/>`).join("")}
        <rect x="-60" y="-40" width="120" height="80" rx="8" fill="${P.slateD}"/>
        <g id="s1-bowl">
          ${glow("s1-bowlg", 0, 10, 130, 110)}
          <path d="M-80,10 L80,10 Q76,74 0,82 Q-76,74 -80,10 Z" fill="${P.aqua}"/>
          <path d="M20,10 L80,10 Q76,74 0,82 Q30,60 20,10 Z" fill="${P.aquaD}"/>
          <path d="M-78,12 C-70,-30 -30,-44 0,-40 C40,-46 72,-26 78,12 Z" fill="${P.cream}"/>
          ${[[-46, -6], [-18, -22], [14, -14], [44, -4], [-6, 2], [28, -30]].map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="18" rx="5" fill="${P.gold}" transform="rotate(${x % 20} ${x} ${y})"/>`).join("")}
          ${[[-30, -16], [6, -28], [36, -16], [-50, 4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="${P.sage}"/>`).join("")}
          ${star(-96, -60, 14, P.gold)}${star(98, -40, 10, P.cream)}${star(70, -92, 8, P.gold)}
        </g>
        <g id="s1-poof" opacity="0">
          ${[[-40, -10, 34], [10, -30, 40], [44, 10, 30], [-6, 24, 36]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${P.creamS}"/>`).join("")}
        </g>
      </g>
      <circle r="158" fill="none" stroke="${P.slateL}" stroke-width="10"/>
      <path d="M100,112 L170,190" stroke="${P.slateD}" stroke-width="26" stroke-linecap="round"/>
    </g>
  </g>
  ${sparkles(11, 22, [0, 60, 1920, 760])}
  <!-- tiles -->
  ${tiles}
  <text id="s1-six" class="lbl" x="${SC[0]}" y="${SC[1] - 335}" text-anchor="middle" font-family="Barlow" font-weight="700" font-size="30" letter-spacing="3" fill="${P.gold}" opacity="0">6 WORDS</text>
</svg>
</div>
<!-- the screen, seen straight on -->
<div id="s1-ui">
  <div id="s1-glass">
    <div id="s1-box"><span id="s1-q"></span><span id="s1-caret"></span>
      <div id="s1-send"><svg width="44" height="44" viewBox="0 0 44 44"><path d="M22,34 V12 M12,21 L22,11 L32,21" stroke="${P.cream}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    </div>
  </div>
</div>`;

const css = `
#s1-ui{position:absolute;left:0;top:0;width:1920px;height:1080px;background:${P.deep};opacity:0;}
#s1-glass{position:absolute;left:70px;top:60px;right:70px;bottom:60px;border-radius:18px;background:radial-gradient(ellipse at 50% 45%, #FFF4DE 0%, ${P.cream} 55%, ${P.creamS} 100%);}
#s1-box{position:absolute;left:260px;right:260px;top:420px;height:150px;border-radius:40px;background:#FFFBF2;border:4px solid ${P.creamS};box-shadow:0 14px 0 ${P.creamS};display:flex;align-items:center;padding-left:64px;}
#s1-q{font-family:"Nunito";font-weight:800;font-size:66px;color:${P.deep};white-space:pre;}
#s1-caret{display:inline-block;width:6px;height:70px;background:${P.tang};margin-left:6px;}
#s1-send{position:absolute;right:28px;top:28px;width:94px;height:94px;border-radius:47px;background:${P.tang};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 0 ${P.tangD};}
`;

const js = `
  K.sparkles(tl, "#s1-cam", 8.6);
  // camera: wide, push through the screen, pull back out, then into the window
  K.cam(tl, "#s1-cam", [
    [0, 0, 960, 540, 1.0],
    [0.15, 1.15, ${SC[0]}, ${SC[1]}, 4.6, "power3.in"],
    [3.55, 0.01, ${SC[0]}, ${SC[1]}, 1.7],
    [3.56, 0.9, ${SC[0] - 60}, ${SC[1] - 110}, 1.5, "expo.out"],
    [7.7, 0.9, 1250, 295, 3.4, "power3.in"],
  ]);
  // rigs (pivot points in each element's own coordinates)
  const fore = K.rig(tl, "#s1-fore", 44, -140), head = K.rig(tl, "#s1-head", 14, -266);
  const lens = K.rig(tl, "#s1-lensin", 0, 150), bowl = K.rig(tl, "#s1-bowl", 0, 60), poof = K.rig(tl, "#s1-poof", 0, 0);
  const mouth = K.rig(tl, "#s1-mouth", 58, -297);
  // typing hands in the wide shot (forearm jiggles from the elbow)
  for (let i = 0; i < 8; i++) {
    tl.fromTo(fore, { r: 0 }, { r: (i % 2 ? -2.2 : 1.8), duration: 0.08, ease: "sine.inOut", yoyo: true, repeat: 1, immediateRender: false }, 0.02 + i * 0.16);
  }
  K.blink(tl, "#s1-lid", [0.9, 4.0, 6.2]);
  // the screen becomes the world
  tl.fromTo("#s1-ui", { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 1.08);
  K.type(tl, "#s1-q", "How do I make potato salad?", 1.3, 2.75);
  tl.fromTo("#s1-caret", { opacity: 1 }, { opacity: 0, duration: 0.01, yoyo: true, repeat: 5, repeatDelay: 0.24, immediateRender: false }, 2.8);
  // enter
  tl.fromTo("#s1-send", { scale: 1 }, { scale: 0.84, duration: 0.12, ease: "power2.in" }, 3.3);
  tl.fromTo("#s1-send", { scale: 0.84 }, { scale: 1.06, duration: 0.25, ease: "back.out(3)", immediateRender: false }, 3.44);
  tl.fromTo("#s1-ui", { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.3, duration: 0.35, ease: "power3.in", immediateRender: false }, 3.55);
  tl.fromTo("#s1-mini", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 3.7);
  // the answer seems to live inside the laptop: an x-ray lens shows a little bowl of potato salad
  tl.fromTo(lens, { s: 0, r: -10 }, { s: 1, r: 0, duration: 0.6, ease: "back.out(1.7)" }, 4.2);
  tl.fromTo(bowl, { s: 0.2, y: 40 }, { s: 1, y: 0, duration: 0.5, ease: "back.out(2.2)" }, 4.72);
  tl.fromTo(bowl, { r: -4 }, { r: 4, duration: 0.45, ease: "sine.inOut", yoyo: true, repeat: 3, immediateRender: false }, 5.2);
  tl.fromTo(head, { r: 0 }, { r: -5, duration: 0.5, ease: "power2.out" }, 4.5);
  tl.fromTo(mouth, { sx: 1 }, { sx: 1.4, duration: 0.3 }, 4.8);
  // "But" — the idea pops
  tl.fromTo(poof, { s: 0.4 }, { s: 1.25, duration: 0.2, ease: "power2.out" }, 6.8);
  tl.fromTo("#s1-poof", { opacity: 0 }, { opacity: 1, duration: 0.06 }, 6.8);
  tl.fromTo(bowl, { s: 1 }, { s: 0, duration: 0.14, ease: "power3.in", immediateRender: false }, 6.8);
  tl.fromTo("#s1-poof", { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: false }, 7.0);
  tl.fromTo(lens, { s: 1 }, { s: 0, duration: 0.25, ease: "power3.in", immediateRender: false }, 7.05);
  tl.fromTo(head, { r: -5 }, { r: 4, duration: 0.3, ease: "back.out(2)", immediateRender: false }, 6.85);
  tl.fromTo(mouth, { sx: 1.4, sy: 1 }, { sx: 0.6, sy: 1.6, duration: 0.2, immediateRender: false }, 6.85);
  // six words burst out of the screen, then race out of the window
  const arc = ${JSON.stringify(WORDS.map((w, i) => [SC[0] - 380 + i * 152 + (i > 3 ? 20 : 0) + (i > 4 ? 30 : 0), SC[1] - 250 - Math.sin((i / 5) * Math.PI) * 50]))};
  arc.forEach(([x, y], i) => {
    const t0 = 7.12 + i * 0.07;
    tl.fromTo("#s1-t" + i, { x: ${SC[0]}, y: ${SC[1]}, scale: 0.15, opacity: 0 }, { x, y, scale: 1, opacity: 1, duration: 0.42, ease: "back.out(1.6)" }, t0);
    tl.fromTo("#s1-t" + i, { x, y, scale: 1 }, { x: 1250 + (i - 2.5) * 30, y: 280 + (i % 2) * 24, scale: 0.18, duration: 0.55, ease: "power3.in", immediateRender: false }, 7.8 + i * 0.03);
  });
  tl.fromTo("#s1-six", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 7.4);
  tl.fromTo("#s1-six", { opacity: 1 }, { opacity: 0, duration: 0.15, immediateRender: false }, 7.86);
`;

export default { id: "s1", css, html, js };
