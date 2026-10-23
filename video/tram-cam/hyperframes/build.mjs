// Builds the HyperFrames composition (index.html) from the storyboard library.
//   node build.mjs            -> writes index.html next to this file
// Scene timing comes from each scene's `time` ("m:ss–m:ss"); retime there once the voice-over lands.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const storyboard = path.join(here, "..", "storyboard");
const styleFrames = path.join(here, "..", "style-frames");

const ctx = vm.createContext({ Math, String, Number, Array });
vm.runInContext(fs.readFileSync(path.join(storyboard, "lib.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(storyboard, "scenes.js"), "utf8"), ctx);
const { SCENES, INK, CREAM, PAPER } = ctx;

const secs = (s) => { const [m, x] = s.split(":"); return Number(m) * 60 + Number(x); };
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Split a voice-over line into subtitle chunks: break at punctuation, split any phrase longer
// than ~42 characters into balanced halves (never mid-word), then pack short phrases together.
function chunks(text, max = 42) {
  const phrases = [];
  for (const part of text.split(/(?<=[,.:;?!…])\s+/)) {
    const words = part.split(" "), n = Math.ceil(part.length / max), target = part.length / n;
    let cur = "";
    for (const w of words) {
      if (cur && (cur + " " + w).length > target + 6 && phrases.length < 999) { phrases.push(cur); cur = w; }
      else cur = cur ? cur + " " + w : w;
    }
    if (cur) phrases.push(cur);
  }
  const out = [];
  for (const p of phrases) {
    const last = out[out.length - 1];
    if (last !== undefined && (last + " " + p).length <= max) out[out.length - 1] = last + " " + p;
    else out.push(p);
  }
  return out;
}

let scenesHtml = "", subsHtml = "", total = 0, subN = 0;
for (const sc of SCENES) {
  const [a, b] = sc.time.split("–").map(secs);
  const dur = b - a;
  total = Math.max(total, b);
  const bg = sc.bg === "ink" ? INK : PAPER;
  scenesHtml += `
    <div class="clip scene" id="s${sc.id}" data-start="${a}" data-duration="${dur}" data-cam="${sc.cam || "none"}" style="background:${bg}">
      <div class="cam"><svg viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
        <rect width="1080" height="1920" fill="${bg}"/>
        <g filter="url(#wobble)">${sc.art()}</g>
        <g filter="url(#wobble-soft)">${sc.text()}</g>
      </svg></div>
    </div>`;
  const parts = !sc.cue ? [] : sc.cue.includes("|") ? sc.cue.split("|") : chunks(sc.cue);
  const weight = parts.reduce((n, p) => n + p.length, 0);
  let t = a;
  for (const p of parts) {
    const d = +(dur * p.length / weight).toFixed(3);
    subsHtml += `
    <div class="clip subtitle" id="sub-${++subN}" data-start="${t.toFixed(3)}" data-duration="${d}"><span>${esc(p)}</span></div>`;
    t += d;
  }
}

const fontsCss = fs.readFileSync(path.join(styleFrames, "fonts", "fonts.css"), "utf8").replace(/url\(/g, "url(assets/fonts/");
const baseCss = fs.readFileSync(path.join(styleFrames, "style.css"), "utf8").replace(/@import[^;]+;/, "");

const html = `<!doctype html>
<html lang="vi" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>Trầm cảm là gì?</title>
<script src="assets/gsap.min.js"></script>
<style>
${fontsCss}
${baseCss}
.cline.thin { stroke-width: 6; }
.line.thin { stroke-width: 4; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: var(--paper); }
.scene { position: absolute; inset: 0; overflow: hidden; }
.scene .cam { position: absolute; inset: 0; transform-origin: 50% 45%; }
.scene svg { width: 1080px; height: 1920px; display: block; }
.subtitle { z-index: 10; }
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="1" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="wobble-soft" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="6" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="${CREAM}" stroke-width="2.4"/>
    </pattern>
  </defs>
</svg>
<div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1080" data-height="1920">
${scenesHtml}
${subsHtml}
</div>
<script>
  // Every motion is placed on one paused GSAP timeline, so any frame can be seeked deterministically.
  const TOTAL = ${total};
  const tl = gsap.timeline({ paused: true });
  const stepped = (d) => "steps(" + Math.max(1, Math.round(d * 12)) + ")"; // hand-made 12 fps feel
  const CAM = {
    in:   [{ scale: 1 },    { scale: 1.06 }],
    out:  [{ scale: 1.06 }, { scale: 1 }],
    zoom: [{ scale: 1 },    { scale: 1.14 }],
    panL: [{ x: 40 },       { x: -40 }],
    panR: [{ x: -40 },      { x: 40 }]
  };

  document.querySelectorAll(".scene").forEach((sc) => {
    const t0 = +sc.dataset.start, d = +sc.dataset.duration;
    const cam = CAM[sc.dataset.cam];
    if (cam) tl.fromTo(sc.querySelector(".cam"), cam[0], Object.assign({ duration: d, ease: stepped(d) }, cam[1]), t0);

    sc.querySelectorAll("[data-pop]").forEach((el) => {
      tl.fromTo(el, { scale: 0, opacity: 0, transformOrigin: "50% 50%" },
        { scale: 1, opacity: 1, duration: 0.34, ease: "back.out(2.2)", immediateRender: true }, t0 + +el.dataset.pop);
    });
    sc.querySelectorAll("[data-wipe]").forEach((el) => {
      tl.fromTo(el, { scaleX: 0, transformOrigin: "0% 50%" },
        { scaleX: 1, duration: 0.5, ease: "steps(6)", immediateRender: true }, t0 + +el.dataset.wipe);
    });
    sc.querySelectorAll("[data-drift]").forEach((el) => {
      const [dx, dy, r] = el.dataset.drift.split(",").map(Number);
      tl.fromTo(el, { x: 0, y: 0, rotation: 0 }, { x: dx, y: dy, rotation: r || 0, duration: d, ease: stepped(d) }, t0);
    });
    sc.querySelectorAll("[data-scale]").forEach((el) => {
      const [a, b] = el.dataset.scale.split(",").map(Number);
      const origin = el.dataset.origin ? { svgOrigin: el.dataset.origin } : { transformOrigin: "50% 50%" };
      tl.fromTo(el, Object.assign({ scale: a }, origin), Object.assign({ scale: b, duration: d * 0.85, ease: stepped(d * 0.85) }, origin), t0);
    });
    sc.querySelectorAll("[data-bob]").forEach((el) => {
      const amp = +el.dataset.bob;
      tl.fromTo(el, { y: -amp }, { y: amp, duration: 1.25, ease: "steps(15)", repeat: Math.ceil(d / 1.25), yoyo: true }, t0);
    });
    sc.querySelectorAll("[data-fall]").forEach((el) => {
      tl.fromTo(el, { y: 0 }, { y: +el.dataset.fall, duration: 0.25, ease: "steps(3)", repeat: Math.ceil(d / 0.25) }, t0);
    });
  });

  // Line "boil": swap the noise seed 8 times a second.
  const noise = [...document.querySelectorAll("feTurbulence")];
  for (let i = 0; i < TOTAL * 8; i++) {
    noise.forEach((n, k) => tl.set(n, { attr: { seed: 1 + (i % 4) + k * 5 } }, i / 8));
  }

  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
  tl.seek(0);
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(here, "index.html"), html);
console.log("scenes:", SCENES.length, "· duration:", total + "s", "· subtitle chunks:", (subsHtml.match(/class="clip subtitle"/g) || []).length);
