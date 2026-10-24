// Drawing kit: palette, isometric helpers, props and the two characters.
// Every scene file in compositions/ is generated from scripts/scenes/*.mjs with these helpers,
// so the world shares one light direction (key from upper left) and one facet style.

export const P = {
  // backgrounds
  night: "#1E3F4F", dusk: "#2F5F6F", apricot: "#F2B880", cream: "#FBE6C4",
  // accents
  tang: "#FF7A45", gold: "#FFD15C", aqua: "#5ED6C6",
  // mid tones for shading
  deep: "#15303D", slate: "#4F7F8A", clay: "#C7876A", plum: "#7E4F66", rose: "#E9A58A",
  // floors and land
  sage: "#6E9C6C", moss: "#4B7457", oak: "#D4A372", oakS: "#A87A50", asph: "#5E6B75", asphD: "#46525C",
  // characters
  skin: "#E7A884", skinS: "#C98468", hair: "#35222E", hairL: "#4E3443",
  // derived facet shades (each one a fixed darker/lighter step of a palette colour)
  plumD: "#5E3A4D", slateD: "#3B6470", slateL: "#6A9AA3", roseD: "#D48A74", aquaD: "#3FAFA2",
  tangD: "#D95E33", goldD: "#E0AE3A", creamS: "#EBCB9E", duskL: "#3E7585", nightD: "#173342",
  sageD: "#5A8659", mossD: "#3D6148",
};

export const C30 = Math.cos(Math.PI / 6), S30 = 0.5;

// seeded random, so every render draws the same world
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n) => Math.round(n * 10) / 10;
export const pts = (a) => a.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
export const poly = (a, fill, extra = "") => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;

// isometric projection: +X runs right-down, +Y runs left-down, +Z is up
export function isoP(o, X, Y, Z = 0) {
  return [o[0] + (X - Y) * C30, o[1] + (X + Y) * S30 - Z];
}

// a box with three visible faces: top, left (+Y face, lit) and right (+X face, shade)
export function isoBox(o, x, y, z, w, d, h, c, extra = "") {
  const p = (X, Y, Z) => isoP(o, X, Y, Z);
  const top = [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)];
  const left = [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)];
  const right = [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)];
  return `<g ${extra}>${poly(left, c.l)}${poly(right, c.r)}${poly(top, c.t)}</g>`;
}
// a flat quad on the ground plane
export function isoTile(o, x, y, w, d, fill, z = 0, extra = "") {
  const p = (X, Y) => isoP(o, X, Y, z);
  return poly([p(x, y), p(x + w, y), p(x + w, y + d), p(x, y + d)], fill, extra);
}
// a quad on the +Y face plane (faces lower-left) at y = yy
export function isoFaceL(o, x, yy, z, w, h, fill, extra = "") {
  const p = (X, Z) => isoP(o, X, yy, Z);
  return poly([p(x, z), p(x + w, z), p(x + w, z + h), p(x, z + h)], fill, extra);
}
// a quad on the +X face plane (faces lower-right) at x = xx
export function isoFaceR(o, xx, y, z, d, h, fill, extra = "") {
  const p = (Y, Z) => isoP(o, xx, Y, Z);
  return poly([p(y, z), p(y + d, z), p(y + d, z + h), p(y, z + h)], fill, extra);
}

// four-point sparkle star
export function star(x, y, r, fill, extra = "") {
  const k = r * 0.28;
  return `<path d="M${r1(x)},${r1(y - r)} Q${r1(x + k)},${r1(y - k)} ${r1(x + r)},${r1(y)} Q${r1(x + k)},${r1(y + k)} ${r1(x)},${r1(y + r)} Q${r1(x - k)},${r1(y + k)} ${r1(x - r)},${r1(y)} Q${r1(x - k)},${r1(y - k)} ${r1(x)},${r1(y - r)}Z" fill="${fill}" ${extra}/>`;
}
// a field of drifting sparkles; the scene script animates every .spk (see assets/lib/scene.js)
export function sparkles(seed, n, box, colors = [P.cream, P.gold]) {
  const R = rng(seed);
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = box[0] + R() * box[2], y = box[1] + R() * box[3];
    const r = 5 + R() * 8, c = colors[Math.floor(R() * colors.length)];
    const a = (0.25 + R() * 0.45).toFixed(2);
    s += `<g class="spk" data-a="${a}" data-ph="${(R() * 6.28).toFixed(2)}" data-dx="${(R() * 40 - 20).toFixed(0)}" data-dy="${(-20 - R() * 30).toFixed(0)}">${star(x, y, r, c)}</g>`;
  }
  return `<g class="spk-field">${s}</g>`;
}

// soft radial light pool
export function glowDef(id, color, a0 = 0.55) {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${a0}"/><stop offset="0.45" stop-color="${color}" stop-opacity="${(a0 * 0.35).toFixed(2)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}
export const glow = (id, cx, cy, rx, ry = rx, extra = "") =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" ${extra}/>`;

// ---------------------------------------------------------------------------------------------
// The woman, in profile, facing right, seated. Origin = the seat under her hip.
// Animated parts: #<p>-head (pivot neck), #<p>-lid (eyelid blink), #<p>-fore (forearm, pivot elbow)
export function womanProfile(p) {
  return `
  <g id="${p}-woman">
    <path d="M-44,-36 L118,-44 Q144,-44 144,-18 L142,4 L-44,10 Z" fill="${P.plum}"/>
    <path d="M60,-42 L118,-44 Q144,-44 144,-18 L142,4 L60,6 Z" fill="${P.plumD}" opacity="0.55"/>
    <path d="M112,-8 L142,-8 L152,126 L122,126 Z" fill="${P.plumD}"/>
    <path d="M116,122 L170,120 Q182,134 170,140 L116,140 Z" fill="${P.deep}"/>
    <path d="M-58,-252 C-90,-210 -92,-110 -74,-28 L52,-34 C64,-110 60,-200 32,-252 Z" fill="${P.rose}"/>
    <path d="M2,-252 L32,-252 C60,-200 64,-110 52,-34 L14,-32 C22,-120 18,-200 2,-252 Z" fill="${P.roseD}"/>
    <path d="M-40,-246 C-62,-210 -66,-150 -62,-110" stroke="${P.cream}" stroke-opacity="0.35" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M0,-270 L26,-270 L30,-244 L-2,-244 Z" fill="${P.skinS}"/>
    <g id="${p}-head">
      <path d="M-30,-330 C-32,-385 10,-405 45,-385 C62,-372 66,-352 64,-338 L76,-320 L64,-314 C66,-298 60,-284 40,-280 C20,-276 -10,-282 -24,-300 Z" fill="${P.skin}"/>
      <path d="M8,-281 C30,-277 52,-280 62,-294 L60,-306 C48,-296 30,-292 8,-281 Z" fill="${P.skinS}"/>
      <path d="M64,-338 L76,-320 L64,-314 Z" fill="${P.skinS}"/>
      <circle cx="40" cy="-308" r="10" fill="${P.rose}" opacity="0.7"/>
      <path d="M-48,-298 C-64,-352 -40,-412 22,-410 C62,-408 80,-382 72,-350 C54,-360 32,-368 10,-364 L4,-330 C-2,-310 -6,-296 -8,-280 C-26,-274 -42,-282 -48,-298 Z" fill="${P.hair}"/>
      <path d="M-38,-362 C-30,-394 0,-406 28,-404 C0,-396 -20,-382 -28,-352 Z" fill="${P.hairL}"/>
      <path d="M10,-364 C30,-368 54,-360 72,-350 C60,-346 42,-348 26,-352 Z" fill="${P.hairL}"/>
      <ellipse cx="0" cy="-322" rx="9" ry="13" fill="${P.skinS}"/>
      <path d="M34,-354 Q44,-358 54,-353" stroke="${P.hair}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="46" cy="-337" rx="5" ry="7" fill="${P.hair}"/>
      <circle cx="48" cy="-340" r="1.8" fill="${P.cream}"/>
      <path id="${p}-lid" d="M39,-346 L54,-346 L54,-329 L39,-329 Z" fill="${P.skin}" transform="scale(1,0)" style="transform-origin:46px -346px"/>
      <path id="${p}-mouth" d="M54,-297 Q60,-295 63,-299" stroke="${P.plumD}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    </g>
    <path d="M-28,-244 L14,-240 L60,-152 L30,-126 Z" fill="${P.roseD}"/>
    <g id="${p}-fore">
      <path d="M28,-150 L52,-126 L176,-146 L172,-170 Z" fill="${P.rose}"/>
      <path d="M40,-138 L52,-126 L176,-146 L174,-156 Z" fill="${P.roseD}"/>
      <path d="M170,-170 Q196,-174 200,-160 Q198,-146 176,-144 Z" fill="${P.skin}"/>
      <path d="M180,-150 Q196,-150 200,-160 Q198,-146 176,-144 Z" fill="${P.skinS}"/>
    </g>
  </g>`;
}

// The woman facing the viewer (ending), lit from below-front by her screen.
// Origin = centre of her collar. Animated: #<p>-head, #<p>-lidL/#<p>-lidR, #<p>-smile
export function womanFront(p) {
  return `
  <g id="${p}-woman">
    <path d="M-150,40 C-140,-40 -90,-70 0,-72 C90,-70 140,-40 150,40 L150,140 L-150,140 Z" fill="${P.rose}"/>
    <path d="M0,-72 C90,-70 140,-40 150,40 L150,140 L30,140 C40,60 30,-20 0,-72 Z" fill="${P.roseD}"/>
    <path d="M-24,-100 L24,-100 L28,-66 Q0,-54 -28,-66 Z" fill="${P.skinS}"/>
    <g id="${p}-head">
      <path d="M-80,-250 C-150,-160 -126,-60 -86,-60 L-60,-150 Z" fill="${P.hair}"/>
      <path d="M80,-250 C150,-160 126,-60 86,-60 L60,-150 Z" fill="${P.hair}"/>
      <path d="M-70,-200 C-72,-268 -36,-296 0,-296 C36,-296 72,-268 70,-200 C70,-140 40,-96 0,-92 C-40,-96 -70,-140 -70,-200 Z" fill="${P.skin}"/>
      <path d="M0,-296 C36,-296 72,-268 70,-200 C70,-140 40,-96 0,-92 C26,-120 34,-170 30,-210 Z" fill="${P.skinS}" opacity="0.75"/>
      <path d="M-86,-200 C-96,-290 -40,-322 4,-320 C60,-318 98,-280 86,-196 C70,-230 40,-246 10,-250 C-20,-240 -50,-236 -86,-200 Z" fill="${P.hair}"/>
      <path d="M-74,-232 C-70,-286 -30,-312 10,-312 C-24,-300 -50,-272 -60,-226 Z" fill="${P.hairL}"/>
      <circle cx="-38" cy="-150" r="12" fill="${P.rose}" opacity="0.75"/>
      <circle cx="38" cy="-150" r="12" fill="${P.rose}" opacity="0.6"/>
      <path d="M-46,-206 Q-32,-214 -18,-207" stroke="${P.hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M18,-207 Q32,-214 46,-206" stroke="${P.hair}" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="-32" cy="-184" rx="7" ry="10" fill="${P.hair}"/>
      <ellipse cx="32" cy="-184" rx="7" ry="10" fill="${P.hair}"/>
      <circle cx="-29" cy="-188" r="2.6" fill="${P.cream}"/>
      <circle cx="35" cy="-188" r="2.6" fill="${P.cream}"/>
      <rect id="${p}-lidL" x="-41" y="-196" width="18" height="24" fill="${P.skin}" transform="scale(1,0)" style="transform-origin:-32px -196px"/>
      <rect id="${p}-lidR" x="23" y="-196" width="18" height="24" fill="${P.skin}" transform="scale(1,0)" style="transform-origin:32px -196px"/>
      <path d="M-4,-176 L-10,-148 L4,-146" stroke="${P.skinS}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path id="${p}-smile" d="M-20,-124 Q0,-116 20,-124" stroke="${P.plumD}" stroke-width="5" fill="none" stroke-linecap="round"/>
    </g>
  </g>`;
}

// The technician, standing, 3/4 view facing right. Origin = between the feet.
// Animated: #<p>-head, #<p>-armR (pivot shoulder, holds the tablet), #<p>-armL, #<p>-lid
export function technician(p) {
  return `
  <g id="${p}-tech">
    <path d="M-38,-180 L-6,-180 L-10,-6 L-40,-6 Z" fill="${P.slateD}"/>
    <path d="M2,-180 L36,-180 L40,-6 L8,-6 Z" fill="${P.slate}"/>
    <path d="M-46,-10 L-4,-10 L-2,8 L-50,8 Z" fill="${P.deep}"/>
    <path d="M4,-10 L52,-10 L56,8 L6,8 Z" fill="${P.deep}"/>
    <g id="${p}-armL">
      <path d="M-44,-330 L-20,-330 L-30,-200 L-58,-206 Z" fill="${P.slateD}"/>
      <ellipse cx="-44" cy="-196" rx="14" ry="12" fill="${P.skinS}"/>
    </g>
    <path d="M-50,-336 C-50,-356 50,-356 50,-336 L44,-170 L-44,-170 Z" fill="${P.slate}"/>
    <path d="M6,-352 C30,-350 50,-346 50,-336 L44,-170 L10,-170 Z" fill="${P.slateD}"/>
    <path d="M-46,-250 L46,-250 L45,-232 L-45,-232 Z" fill="${P.tang}"/>
    <path d="M10,-250 L46,-250 L45,-232 L10,-232 Z" fill="${P.tangD}"/>
    <path d="M-30,-326 L-12,-326 L-12,-288 L-30,-288 Z" fill="${P.gold}"/>
    <path d="M-12,-366 L14,-366 L16,-346 L-14,-346 Z" fill="${P.skinS}"/>
    <g id="${p}-head">
      <path d="M-36,-420 C-38,-458 -10,-474 14,-472 C42,-470 52,-446 50,-424 L58,-408 L48,-404 C48,-380 34,-362 10,-360 C-14,-360 -34,-380 -36,-420 Z" fill="${P.skin}"/>
      <path d="M10,-360 C34,-362 48,-380 48,-404 L36,-396 C30,-378 22,-368 10,-360 Z" fill="${P.skinS}"/>
      <path d="M-38,-404 C-46,-430 -40,-452 -26,-456 L-22,-404 Z" fill="${P.hair}"/>
      <ellipse cx="-14" cy="-410" rx="8" ry="11" fill="${P.skinS}"/>
      <path d="M22,-432 Q30,-436 38,-432" stroke="${P.hair}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="31" cy="-420" rx="4.5" ry="6.5" fill="${P.hair}"/>
      <rect id="${p}-lid" x="25" y="-428" width="13" height="16" fill="${P.skin}" transform="scale(1,0)" style="transform-origin:31px -428px"/>
      <path d="M30,-382 Q38,-380 44,-386" stroke="${P.plumD}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M-50,-446 C-50,-500 56,-504 58,-446 Z" fill="${P.gold}"/>
      <path d="M8,-500 C40,-496 58,-476 58,-446 L20,-446 C22,-470 18,-488 8,-500 Z" fill="${P.goldD}"/>
      <path d="M-58,-450 L72,-450 L70,-438 L-58,-438 Z" fill="${P.goldD}"/>
      <path d="M-4,-502 L10,-502 L12,-450 L-6,-450 Z" fill="${P.cream}" opacity="0.45"/>
    </g>
    <g id="${p}-armR">
      <path d="M22,-336 L48,-332 L84,-236 L62,-222 Z" fill="${P.slate}"/>
      <path d="M62,-238 L84,-236 L132,-276 L118,-292 Z" fill="${P.slateD}"/>
      <path d="M104,-330 L150,-300 L118,-246 L72,-276 Z" fill="${P.deep}"/>
      <path d="M108,-318 L140,-298 L116,-258 L84,-278 Z" fill="${P.aqua}" opacity="0.85"/>
      <path d="M100,-300 L118,-288 M96,-290 L112,-280" stroke="${P.cream}" stroke-width="3" opacity="0.8"/>
      <ellipse cx="124" cy="-282" rx="13" ry="11" fill="${P.skin}"/>
    </g>
  </g>`;
}

// laptop in 3/4 view facing left-front, origin = front-left corner of the base
export function laptop(p, glowColor = P.cream) {
  return `
  <g id="${p}-laptop">
    <path d="M0,0 L190,6 L214,-22 L30,-30 Z" fill="${P.slateL}"/>
    <path d="M0,0 L190,6 L190,14 L0,8 Z" fill="${P.slateD}"/>
    <path d="M30,-24 L196,-18 L204,-26 L40,-30 Z" fill="${P.slate}"/>
    <path d="M60,-10 L150,-6 L158,-14 L70,-18 Z" fill="${P.slate}" opacity="0.6"/>
    <path d="M34,-30 L214,-22 L226,-206 L40,-226 Z" fill="${P.deep}"/>
    <path d="M214,-22 L222,-24 L234,-208 L226,-206 Z" fill="${P.slateD}"/>
    <path id="${p}-screen" d="M46,-40 L204,-33 L214,-196 L52,-214 Z" fill="${glowColor}"/>
  </g>`;
}

// window with a dusk sky and hills, for interior walls. x,y = top-left, w,h size
export function duskWindow(p, x, y, w, h) {
  return `
  <g id="${p}-window">
    <rect x="${x - 18}" y="${y - 18}" width="${w + 36}" height="${h + 36}" fill="${P.creamS}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${p}-sky)"/>
    <circle cx="${x + w * 0.7}" cy="${y + h * 0.62}" r="${h * 0.12}" fill="${P.gold}" opacity="0.9"/>
    <path d="M${x},${y + h * 0.78} Q${x + w * 0.3},${y + h * 0.6} ${x + w * 0.55},${y + h * 0.74} T${x + w},${y + h * 0.68} L${x + w},${y + h} L${x},${y + h} Z" fill="${P.slate}"/>
    <path d="M${x},${y + h * 0.88} Q${x + w * 0.4},${y + h * 0.76} ${x + w},${y + h * 0.86} L${x + w},${y + h} L${x},${y + h} Z" fill="${P.slateD}"/>
    <rect x="${x + w / 2 - 6}" y="${y}" width="12" height="${h}" fill="${P.creamS}"/>
    <rect x="${x}" y="${y + h * 0.45 - 6}" width="${w}" height="12" fill="${P.creamS}"/>
    <rect x="${x - 30}" y="${y + h + 10}" width="${w + 60}" height="16" fill="${P.oak}"/>
    <rect x="${x - 30}" y="${y + h + 26}" width="${w + 60}" height="8" fill="${P.oakS}"/>
  </g>`;
}
export const skyDef = (id, top = P.dusk, mid = P.rose, bot = P.apricot) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${bot}"/></linearGradient>`;

// the data center building in isometric, origin o; returns markup. Used in several scenes so seams match.
export function dataCenter(p, o, opts = {}) {
  const W = opts.w ?? 760, D = opts.d ?? 380, H = opts.h ?? 120;
  let s = `<g id="${p}-dc">`;
  // shadow
  s += isoTile(o, -20, -20, W + 80, D + 90, P.mossD, 0, 'opacity="0.55"');
  // pad
  s += isoTile(o, -40, -40, W + 80, D + 80, P.asph);
  // walls
  s += isoBox(o, 0, 0, 0, W, D, H, { t: P.creamS, l: P.cream, r: P.slateL });
  // wall ribs
  for (let x = 30; x < W; x += 40) s += isoFaceL(o, x, D, 6, 6, H - 12, P.creamS);
  for (let y = 30; y < D; y += 40) s += isoFaceR(o, W, y, 6, 6, H - 12, P.slate, 'opacity="0.55"');
  // stripe
  s += isoFaceL(o, 0, D, H - 26, W, 10, P.tang);
  s += isoFaceR(o, W, 0, H - 26, D, 10, P.tangD);
  // loading doors
  for (let i = 0; i < 3; i++) s += isoFaceL(o, 80 + i * 110, D, 0, 70, 64, P.slate);
  s += isoFaceL(o, W - 140, D, 0, 46, 72, P.deep);
  // roof group (lifts off in scene 3)
  s += `<g id="${p}-roof">`;
  s += isoBox(o, 0, 0, H, W, D, 8, { t: P.slateL, l: P.creamS, r: P.slate });
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 2; j++) {
      const x = 50 + i * 115, y = 60 + j * 160;
      s += isoBox(o, x, y, H + 8, 90, 110, 36, { t: P.slate, l: P.slateL, r: P.slateD });
      const c = isoP(o, x + 45, y + 55, H + 44);
      s += `<g transform="translate(${r1(c[0])},${r1(c[1])}) scale(1,0.58)"><circle r="50" fill="${P.deep}"/><g class="${p}-fan"><path d="M-42,0 L42,0 M0,-42 L0,42" stroke="${P.slateL}" stroke-width="10" stroke-linecap="round"/></g><circle r="8" fill="${P.slate}"/></g>`;
    }
  }
  s += `</g></g>`;
  return s;
}
