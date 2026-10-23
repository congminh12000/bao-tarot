// Component library for the "Trầm cảm là gì?" storyboard.
// Every function returns an SVG string. Characters are drawn facing left in a
// local box of about 200 x 335 (feet at y = 334); `flip` mirrors them to face right.
var INK = "#141414", CREAM = "#E8E2CF", HOPE = "#F2B33D", PAPER = "#FFFFFF";

function place(x, y, s, flip, w) {
  s = s || 1; w = w || 200;
  return flip
    ? "translate(" + x + " " + y + ") scale(" + -s + " " + s + ") translate(" + -w + " 0)"
    : "translate(" + x + " " + y + ") scale(" + s + ")";
}

function g(transform, body, extra) {
  return '<g transform="' + transform + '"' + (extra ? " " + extra : "") + ">" + body + "</g>";
}

// Deterministic pseudo-random in [0, 1): same input -> same output on every render.
function rnd(i) {
  var x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function label(x, y, size, text, o) {
  o = o || {};
  var color = o.color || INK, anchor = o.anchor || "middle";
  return '<text class="letter" x="' + x + '" y="' + y + '" font-size="' + size +
    '" style="fill:' + color + '" text-anchor="' + anchor + '"' +
    (o.rot ? ' transform="rotate(' + o.rot + " " + x + " " + y + ')"' : "") + ">" + text + "</text>";
}

function stringPath(d) { return '<path class="string" d="' + d + '"/>'; }

// ---------------------------------------------------------------- people

var BODY = {
  stand: "M92 118 C62 138 48 200 56 262 L158 264 C172 214 170 150 140 116 Z",
  sit: "M92 118 C62 138 50 190 52 240 L160 240 C168 196 168 150 140 116 Z"
};

var ARM = {
  hold: ["M102 150 C82 166 58 174 36 182", 32, 182],
  down: ["M104 150 C96 180 94 210 96 236", 96, 242],
  up: ["M102 148 C84 120 66 96 52 70", 50, 64],
  chest: ["M102 150 C84 168 70 160 64 140", 62, 134],
  table: ["M98 150 C76 170 60 196 40 214", 36, 216],
  lap: ["M100 150 C84 176 70 196 50 206", 46, 208]
};

var LEGS = {
  stand: ["M70 262 L72 318 L98 318 L100 262 Z", "M115 262 L122 316 L148 314 L150 262 Z",
          "M48 334 C48 312 102 310 102 334 Z", "M108 332 C108 310 156 310 156 332 Z"],
  walk: ["M74 262 L50 314 L76 322 L102 262 Z", "M118 262 L146 310 L168 298 L150 262 Z",
         "M26 334 C28 312 80 314 78 336 Z", "M146 322 C152 298 200 300 194 326 Z"],
  sitfull: ["M40 196 L-40 200 C-52 202 -52 240 -40 242 L60 242 Z", "M-46 232 L-44 318 L-18 318 L-16 232 Z",
            "M-68 334 C-68 312 -14 310 -14 334 Z", ""]
};

var HAIR = {
  cap: "M70 52 C76 22 120 6 150 34 C160 46 162 60 158 70 C150 52 128 40 104 42 C90 43 78 48 70 52 Z",
  puff: "M66 56 C56 20 80 -14 116 -10 C150 -8 172 22 164 60 C158 76 156 86 150 92 C150 66 136 46 110 44 C92 44 76 50 66 56 Z",
  long: "M70 52 C76 18 130 6 158 40 C170 60 172 110 160 150 L138 150 C150 110 150 70 128 50 C110 42 88 44 70 52 Z"
};

var FACE = {
  sad: '<path class="line" d="M78 58 Q90 54 100 59" style="stroke-width:5"/><circle class="ink" cx="90" cy="67" r="5"/>' +
       '<path class="line" d="M58 100 Q67 93 76 99" style="stroke-width:5"/>',
  neutral: '<circle class="ink" cx="90" cy="64" r="5"/><path class="line" d="M60 98 L74 98" style="stroke-width:5"/>',
  smile: '<circle class="ink" cx="90" cy="64" r="5"/><path class="line" d="M58 95 Q67 104 77 96" style="stroke-width:5"/>',
  laugh: '<path class="line" d="M80 68 Q90 58 100 68" style="stroke-width:5"/><path class="ink" d="M60 96 Q72 116 88 100 Z"/>',
  closed: '<path class="line" d="M80 66 Q90 72 100 66" style="stroke-width:5"/><path class="line" d="M60 98 L72 98" style="stroke-width:5"/>',
  awake: '<circle class="ink" cx="90" cy="64" r="6"/><path class="line" d="M80 50 L100 55" style="stroke-width:5"/>' +
         '<path class="line" d="M60 100 Q67 95 74 100" style="stroke-width:5"/>'
};

function head(o) {
  var hair = o.hair || "cap";
  var out = '<path class="cream" d="M118 18 C150 20 166 58 154 92 C146 114 120 124 96 118 C86 116 78 110 72 104 L64 102 C58 101 56 96 60 92 L38 86 C30 84 30 76 38 74 L66 66 C66 40 88 16 118 18 Z"/>';
  if (hair === "bun") out += '<circle class="ink" cx="158" cy="36" r="20"/>';
  out += '<path class="ink" d="' + HAIR[hair === "bun" ? "cap" : hair] + '"/>';
  out += '<circle class="cream" cx="124" cy="76" r="10" style="stroke-width:4"/>';
  out += FACE[o.mood || "sad"];
  if (o.glasses) out += '<circle class="line" cx="88" cy="64" r="15" style="stroke-width:4"/><path class="line" d="M73 64 L64 66" style="stroke-width:4"/>';
  return g("rotate(" + (o.tilt || 0) + " 110 70)", out);
}

function sleeve(d, coat) {
  if (coat === "ink") {
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="26" stroke-linecap="round"/>' +
           '<path class="cline thin" d="' + d + '"/>';
  }
  return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="30" stroke-linecap="round"/>' +
         '<path d="' + d + '" fill="none" stroke="' + CREAM + '" stroke-width="20" stroke-linecap="round"/>';
}

// o: {x, y, s, flip, coat: cream|ink, hair: cap|puff|bun|long, hood, glasses,
//     mood, pose: stand|walk|sit|sitfull, arm: hold|down|up|chest|table|lap, tilt}
function person(o) {
  var coat = o.coat || "cream", pose = o.pose || "stand", arm = o.arm || "hold";
  var fill = coat === "ink" ? 'class="ink"' : 'class="cream"';
  var detail = coat === "ink" ? "cline thin" : "line";
  var out = "";
  if (o.hood) out += "<path " + fill + ' d="M128 112 C150 100 172 118 165 140 C160 155 140 158 128 150 Z"/>';
  if (LEGS[pose]) {
    var L = LEGS[pose];
    out += "<path " + fill + ' d="' + L[0] + '"/>';
    if (L[1]) out += "<path " + fill + ' d="' + L[1] + '"/>';
    out += '<path class="ink" d="' + L[2] + '"/>';
    if (L[3]) out += '<path class="ink" d="' + L[3] + '"/>';
  }
  out += "<path " + fill + ' d="' + (pose === "stand" || pose === "walk" ? BODY.stand : BODY.sit) + '"/>';
  out += '<path class="' + detail + '" d="' + (pose === "stand" || pose === "walk"
    ? "M130 152 C142 190 137 226 120 242" : "M130 152 C142 186 138 214 124 232") + '"/>';
  var a = ARM[arm];
  out += sleeve(a[0], coat);
  out += '<circle class="cream" cx="' + a[1] + '" cy="' + a[2] + '" r="13"/>';
  out += head(o);
  return g(place(o.x, o.y, o.s, o.flip), out);
}

// Global position of a person's hand, for attaching strings and props.
function handPos(o) {
  var a = ARM[o.arm || "hold"], s = o.s || 1;
  return [o.flip ? o.x + s * (200 - a[1]) : o.x + s * a[1], o.y + s * a[2]];
}

// The huddled silhouette from scene 16, facing right. Local box ~ 110..665 x 630..1248.
function huddle(t) {
  return g(t || "",
    '<path class="ink" d="M200 1248 C130 1120 150 880 250 770 C290 725 330 700 360 690 C400 630 500 630 530 690 C550 730 545 770 520 790 L532 802 C560 770 630 790 630 850 C630 900 615 1000 612 1170 C650 1180 665 1245 620 1248 Z"/>' +
    '<path class="cline" d="M318 790 C330 900 360 985 420 998 C500 1004 560 990 604 974"/>' +
    '<circle cx="606" cy="972" r="13" fill="' + CREAM + '"/>');
}

// ---------------------------------------------------------------- the cloud

var CLOUD = [[-230, -80, 190], [-30, -220, 230], [210, -180, 200], [320, 0, 150],
             [220, 200, 210], [-30, 230, 230], [-250, 150, 190], [0, 0, 280]];
var CLOUD_EYES = { right: [[160, -230], [272, -220]], center: [[-60, -200], [60, -200]], left: [[-272, -220], [-160, -230]] };

// o: {x, y, s, eyes: right|center|left|none, look: [dx, dy], broken}
// `broken` draws the cloud breaking apart into small puffs.
function cloud(o) {
  var s = o.s || 1, look = o.look || [6, 10];
  var spread = o.broken ? 1.5 : 1, shrink = o.broken ? 0.55 : 1;
  var circles = CLOUD.map(function (c) {
    return '<circle cx="' + c[0] * spread + '" cy="' + c[1] * spread + '" r="' + c[2] * shrink + '"/>';
  }).join("");
  var out = '<g class="ink">' + circles + "</g>";
  var eyes = o.eyes || "right";
  if (eyes !== "none" && !o.broken && s >= 0.12) {
    var sw = Math.max(9, 3 / s);
    CLOUD_EYES[eyes].forEach(function (e) {
      out += '<ellipse cx="' + e[0] + '" cy="' + e[1] + '" rx="36" ry="22" fill="none" stroke="' + CREAM + '" stroke-width="' + sw + '"/>' +
             '<path d="M' + (e[0] - 34) + " " + (e[1] - 4) + " L" + (e[0] + 34) + " " + (e[1] - 4) + '" stroke="' + CREAM + '" stroke-width="' + sw + '" stroke-linecap="round"/>' +
             '<ellipse cx="' + (e[0] + look[0]) + '" cy="' + (e[1] + look[1]) + '" rx="10" ry="6" fill="' + CREAM + '"/>';
    });
  }
  return g(place(o.x, o.y, s), out);
}

// Point on the underside of a cloud where a string attaches.
function cloudBottom(o, side) {
  var s = o.s || 1;
  var p = side === "left" ? [-30, 450] : [220, 400];
  return [o.x + s * p[0], o.y + s * p[1]];
}

// String from a cloud to a hand with a gentle sag.
function tether(cl, hand, side) {
  var b = cloudBottom(cl, side);
  var dx = hand[0] - b[0], dy = hand[1] - b[1];
  return stringPath("M" + b[0] + " " + (b[1] - 20) + " C" + (b[0] + dx * 0.1) + " " + (b[1] + dy * 0.45) + " " +
    (hand[0] + 10) + " " + (hand[1] - dy * 0.35) + " " + hand[0] + " " + hand[1]);
}

// ---------------------------------------------------------------- props

function umbrellaOpen(x, y, s) {
  return g(place(x, y, s),
    '<path class="ink" d="M-150 0 C-150 -110 150 -110 150 0 C125 -18 100 -18 75 0 C50 -18 25 -18 0 0 C-25 -18 -50 -18 -75 0 C-100 -18 -125 -18 -150 0 Z"/>' +
    '<path class="line" d="M0 -82 L0 -104"/><path class="line" d="M0 -10 L0 150 C0 174 -28 174 -28 154"/>');
}

function umbrellaClosed(x, y, s) {
  return g(place(x, y, s),
    '<path class="line" d="M0 0 C0 -24 -26 -24 -26 -6"/><path class="ink" d="M0 0 C16 30 20 120 4 200 L-4 200 C-20 120 -16 30 0 0 Z"/>' +
    '<path class="line" d="M0 200 L0 222"/>');
}

// Short diagonal rain strokes over a box, skipping any rectangles in `holes`.
function rain(x0, y0, w, h, n, holes) {
  var out = "";
  for (var i = 0; i < n; i++) {
    var x = x0 + rnd(i) * w, y = y0 + rnd(i + 500) * h;
    var hidden = (holes || []).some(function (r) { return x > r[0] && x < r[2] && y > r[1] && y < r[3]; });
    if (!hidden) out += '<path class="line" style="stroke-width:5" d="M' + x.toFixed(0) + " " + y.toFixed(0) + " l-14 42\"/>";
  }
  return out;
}

function sunOutline(x, y, r) {
  var out = '<circle class="line" cx="' + x + '" cy="' + y + '" r="' + r + '"/>';
  for (var i = 0; i < 12; i++) {
    var a = i * Math.PI / 6, c = Math.cos(a), sn = Math.sin(a);
    out += '<path class="line" d="M' + (x + c * (r + 26)).toFixed(0) + " " + (y + sn * (r + 26)).toFixed(0) +
           " L" + (x + c * (r + 70)).toFixed(0) + " " + (y + sn * (r + 70)).toFixed(0) + '"/>';
  }
  return out;
}

function sunHope(x, y, r, rays) {
  var out = '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + HOPE + '"/>';
  if (rays) {
    for (var i = 0; i < 16; i++) {
      var a = i * Math.PI / 8, c = Math.cos(a), sn = Math.sin(a);
      out += '<path d="M' + (x + c * (r + 30)).toFixed(0) + " " + (y + sn * (r + 30)).toFixed(0) + " L" +
             (x + c * (r + rays)).toFixed(0) + " " + (y + sn * (r + rays)).toFixed(0) +
             '" stroke="' + HOPE + '" stroke-width="12" stroke-linecap="round"/>';
    }
  }
  return out;
}

function heart(x, y, s) {
  return g(place(x, y, s), '<path class="cream" d="M0 60 C-110 -10 -90 -120 0 -60 C90 -120 110 -10 0 60 Z" style="stroke-width:3"/>');
}

function brain(t, cls) {
  cls = cls || "cline";
  return g(t,
    '<path class="' + cls + '" d="M40 120 C18 64 70 14 140 20 C200 6 280 40 284 110 C300 150 270 196 214 190 C196 214 150 216 132 196 C96 210 48 190 40 120 Z"/>' +
    '<path class="' + cls + ' thin" d="M80 70 C100 50 120 80 140 60"/>' +
    '<path class="' + cls + ' thin" d="M160 40 C180 70 200 40 230 60"/>' +
    '<path class="' + cls + ' thin" d="M70 120 C90 100 110 130 130 110"/>' +
    '<path class="' + cls + ' thin" d="M168 100 C186 80 204 110 222 90 C238 80 252 100 262 90"/>' +
    '<path class="' + cls + ' thin" d="M96 164 C118 146 132 172 150 156"/>' +
    '<path class="' + cls + ' thin" d="M226 140 C242 122 256 150 270 135"/>' +
    '<path class="' + cls + ' thin" d="M150 22 C140 70 160 110 150 160"/>' +
    '<path class="' + cls + ' thin" d="M214 190 C230 222 276 214 278 182"/>' +
    '<path class="' + cls + ' thin" d="M190 200 C192 220 196 236 200 252"/>');
}

function clock(x, y, r, color) {
  var out = '<circle class="cream" cx="' + x + '" cy="' + y + '" r="' + r + '"/>';
  for (var i = 0; i < 4; i++) {
    var a = i * Math.PI / 2;
    out += '<path class="line" style="stroke-width:5" d="M' + (x + Math.cos(a) * r * 0.72).toFixed(0) + " " + (y + Math.sin(a) * r * 0.72).toFixed(0) +
           " L" + (x + Math.cos(a) * r * 0.86).toFixed(0) + " " + (y + Math.sin(a) * r * 0.86).toFixed(0) + '"/>';
  }
  out += '<path class="line" d="M' + x + " " + y + " L" + x + " " + (y - r * 0.68) + '"/>' +
         '<path class="line" style="stroke-width:8" d="M' + x + " " + y + " L" + (x + r * 0.48) + " " + y + '"/>';
  return out;
}

function pillBottle(x, y, s) {
  return g(place(x, y, s), '<rect class="cream" x="0" y="14" width="44" height="62" rx="6"/><rect class="ink" x="-4" y="0" width="52" height="18" rx="4"/>' +
    '<path class="line" style="stroke-width:4" d="M10 40 L34 40 M10 52 L28 52"/>');
}

function cup(x, y, flip) {
  return g(place(x, y, 1, flip, 60),
    '<path class="cream" d="M0 0 L60 0 L54 58 C53 64 48 68 42 68 L18 68 C12 68 7 64 6 58 Z"/>' +
    '<path class="line" style="stroke-width:5" d="M58 14 C82 12 84 44 56 44"/>' +
    '<path class="line" style="stroke-width:4" d="M18 -18 C10 -32 28 -42 20 -58"/>' +
    '<path class="line" style="stroke-width:4" d="M40 -18 C32 -32 50 -42 42 -58"/>');
}

// ---------------------------------------------------------------- 9 symptom icons (centred on 0,0, ~ ±85)

var ICONS = {
  tear: '<path class="line" d="M0 -78 C30 -26 52 6 52 32 C52 64 28 84 0 84 C-28 84 -52 64 -52 32 C-52 6 -30 -26 0 -78 Z"/>' +
        '<path class="line" style="stroke-width:5" d="M-26 34 C-26 50 -16 60 -4 62"/>',
  guitar: '<g transform="rotate(-30)"><path class="line" d="M-8 -90 L8 -90 L8 0 L-8 0 Z"/><path class="line" d="M0 0 C40 -6 50 30 32 44 C56 62 44 100 0 96 C-44 100 -56 62 -32 44 C-50 30 -40 -6 0 0 Z"/>' +
          '<circle class="ink" cx="0" cy="40" r="12"/><path class="line" style="stroke-width:4" d="M-14 -96 L14 -96"/></g>' +
          '<path class="line" style="stroke-width:3" d="M40 -84 L84 -84 M40 -84 L84 -40 M40 -84 L60 -30 M52 -84 C56 -72 64 -66 74 -64 M66 -84 C68 -66 76 -56 84 -54"/>',
  bowl: '<path class="line" d="M-78 0 L78 0 C78 56 40 80 0 80 C-40 80 -78 56 -78 0 Z"/><path class="line" style="stroke-width:5" d="M-56 0 C-40 -14 -24 -8 -10 -12 C6 -8 22 -14 40 0"/>' +
        '<path class="line" d="M30 -84 L-10 -6 M54 -78 L4 -4"/>',
  bed: '<path class="line" d="M-84 -30 L-84 58 M-84 26 L84 26 L84 58 M-84 26 L-84 4 L84 4 L84 26"/><path class="cream" d="M-76 4 C-76 -16 -30 -16 -30 4 Z" style="stroke-width:4"/>' +
       '<path class="ink" d="M40 -84 C10 -78 2 -40 28 -24 C50 -12 74 -24 80 -40 C56 -32 34 -48 40 -84 Z"/>',
  battery: '<rect class="line" x="-80" y="-40" width="148" height="80" rx="14"/><rect class="ink" x="70" y="-16" width="14" height="32" rx="4"/><rect class="ink" x="-66" y="-26" width="26" height="52" rx="4"/>',
  book: '<path class="line" d="M0 -50 C-30 -64 -70 -64 -90 -50 L-90 56 C-70 42 -30 42 0 56 Z M0 -50 C30 -64 70 -64 90 -50 L90 56 C70 42 30 42 0 56 Z"/>' +
        '<path class="line" style="stroke-width:4" d="M-74 -28 C-60 -32 -40 -24 -18 -30 M-70 -22 C-56 -26 -36 -18 -14 -24 M-74 2 C-58 -2 -42 6 -20 0 M-70 8 C-54 4 -38 12 -16 6 M18 -28 C34 -32 52 -24 74 -30 M22 -22 C38 -26 56 -18 78 -24 M18 2 C36 -2 52 6 72 0"/>',
  snail: '<circle class="line" cx="10" cy="-6" r="48"/><path class="line" style="stroke-width:5" d="M10 -6 C20 -6 22 8 10 10 C-6 12 -8 -14 10 -18 C32 -20 38 10 22 24"/>' +
         '<path class="line" d="M-80 50 L70 50 C80 50 80 36 66 36 M-80 50 C-86 30 -74 14 -60 20 L-46 36"/><path class="line" style="stroke-width:4" d="M-66 18 L-78 -14 M-58 18 L-56 -18"/>' +
         '<circle class="ink" cx="-78" cy="-16" r="5"/><circle class="ink" cx="-56" cy="-20" r="5"/>',
  mirror: '<ellipse class="line" cx="0" cy="-6" rx="58" ry="78"/><path class="line" d="M0 72 L0 90 M-30 90 L30 90"/>' +
          '<path class="line" style="stroke-width:4" d="M14 -46 L-4 -18 L18 4 L-10 30 M-4 -18 L-30 -8 M18 4 L40 -6"/>',
  candle: '<rect class="line" x="-26" y="-20" width="52" height="100" rx="4"/><path class="line" d="M0 -20 L0 -38"/>' +
          '<path class="line" style="stroke-width:4" d="M0 -44 C-16 -58 12 -70 -2 -86 M6 -48 C18 -60 2 -72 14 -90"/><path class="line" d="M-40 80 L40 80"/>'
};

var SYMPTOMS = [["tear", "BUỒN BÃ"], ["guitar", "MẤT HỨNG THÚ"], ["bowl", "ĂN UỐNG"], ["bed", "GIẤC NGỦ"], ["battery", "MỆT MỎI"],
                ["book", "KHÓ TẬP TRUNG"], ["snail", "BỒN CHỒN · CHẬM"], ["mirror", "VÔ GIÁ TRỊ"], ["candle", "NGHĨ VỀ CÁI CHẾT"]];

// 3x3 grid of symptom cards; the first `shown` cards get their icon.
function symptomGrid(shown) {
  var out = "", text = "";
  for (var i = 0; i < 9; i++) {
    var col = i % 3, row = Math.floor(i / 3);
    var x = 90 + col * 275, y = 230 + row * 275;
    out += '<rect class="line" style="stroke-width:5" x="' + x + '" y="' + y + '" width="250" height="250" rx="22"/>';
    text += label(x + 24, y + 48, 40, String(i + 1), { anchor: "start" });
    if (i < shown) {
      out += g("translate(" + (x + 125) + " " + (y + 110) + ") scale(0.85)", ICONS[SYMPTOMS[i][0]]);
      text += label(x + 125, y + 230, 38, SYMPTOMS[i][1]);
    }
  }
  return [out, text];
}
