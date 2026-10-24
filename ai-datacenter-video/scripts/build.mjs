// Generates compositions/*.html from scripts/scenes/*.mjs. Run: node scripts/build.mjs
import fs from "node:fs";
const FONTS = `
@font-face{font-family:"Nunito";src:url("assets/fonts/Nunito-var.woff2") format("woff2");font-weight:200 1000;}
@font-face{font-family:"Caveat";src:url("assets/fonts/Caveat-700.woff2") format("woff2");font-weight:700;}
@font-face{font-family:"Barlow";src:url("assets/fonts/Barlow-600.woff2") format("woff2");font-weight:600;}
@font-face{font-family:"Barlow";src:url("assets/fonts/Barlow-700.woff2") format("woff2");font-weight:700;}`;
const files = fs.readdirSync("scripts/scenes").filter((f) => f.endsWith(".mjs")).sort();
for (const f of files) {
  const m = await import(`./scenes/${f}?v=${Date.now()}`);
  const { id, css = "", html, js } = m.default;
  const out = `<template>
<style>${FONTS}
#root{position:absolute;inset:0;overflow:hidden;font-family:"Nunito",sans-serif;}
.cam{position:absolute;left:0;top:0;width:1920px;height:1080px;}
.cam>svg{position:absolute;left:0;top:0;overflow:visible;}
.lbl{font-family:"Barlow",sans-serif;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}
${css}
</style>
<div id="root" data-composition-id="${id}" data-width="1920" data-height="1080">
${html}
</div>
<script>
(function () {
  const tl = gsap.timeline({ paused: true });
${js}
  window.__timelines["${id}"] = tl;
})();
</script>
</template>
`;
  fs.writeFileSync(`compositions/${id}.html`, out);
  console.log("wrote", id, (out.length / 1024).toFixed(0) + "KB");
}
