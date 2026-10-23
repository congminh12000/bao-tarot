// Storyboard scenes. Each scene: id, time, cue (voice-over), sub (subtitle),
// bg ("paper" | "ink"), art() -> SVG drawn with the strong wobble, text() -> lettering.
var SCENES = [];
function scene(o) { SCENES.push(o); }

function rows(x, y0, n, step, minLen, extra, seed) {
  var out = "";
  for (var i = 0; i < n; i++) {
    var y = y0 + i * step, len = minLen + rnd(i + (seed || 0)) * extra;
    out += '<path class="line" style="stroke-width:5" d="M' + x + " " + y + " L" + (x + len).toFixed(0) + " " + y + '"/>';
  }
  return out;
}

function arrow(x1, y1, x2, y2, cls) {
  var a = Math.atan2(y2 - y1, x2 - x1), h = 26;
  var p1 = [x2 - h * Math.cos(a - 0.5), y2 - h * Math.sin(a - 0.5)], p2 = [x2 - h * Math.cos(a + 0.5), y2 - h * Math.sin(a + 0.5)];
  return '<path class="' + (cls || "line") + '" d="M' + x1 + " " + y1 + " L" + x2 + " " + y2 +
    " M" + p1[0].toFixed(0) + " " + p1[1].toFixed(0) + " L" + x2 + " " + y2 + " L" + p2[0].toFixed(0) + " " + p2[1].toFixed(0) + '"/>';
}

// ------------------------------------------------------------------ 1. Hook
scene({
  id: "01", time: "0:00–0:05", cue: "Bạn đang buồn… hay bạn đang trầm cảm?",
  sub: "Bạn đang buồn… hay bạn đang trầm cảm?",
  art: function () {
    return stringPath("M690 1080 C700 1200 760 1260 752 1352") +
      '<g data-bob="8">' + cloud({ x: 480, y: 700, s: 1, eyes: "right" }) + "</g>" +
      person({ x: 720, y: 1168, hood: true, mood: "sad", arm: "hold" });
  },
  text: function () {
    return '<g data-bob="8">' + label(470, 770, 150, "BUỒN HAY", { color: CREAM }) +
      label(470, 975, 215, "TRẦM CẢM?", { color: CREAM }) + "</g>";
  }
});

// ------------------------------------------------------------------ 2. Everyday sadness
scene({
  id: "02a", time: "0:05–0:07", cue: "Ai cũng có lúc buồn. Thi rớt,", sub: "Ai cũng có lúc buồn. Thi rớt,",
  art: function () {
    return g("translate(540 860) rotate(-6)",
      '<rect class="cream" x="-250" y="-330" width="500" height="660" rx="10"/>' +
      '<path class="line" style="stroke-width:7" d="M-200 -250 L40 -250"/>' + rows(-200, -160, 8, 56, 180, 200, 3) +
      '<path d="M-170 -150 L170 210 M170 -150 L-170 210" stroke="' + INK + '" stroke-width="28" stroke-linecap="round" fill="none"/>');
  },
  text: function () { return ""; }
});

scene({
  id: "02b", time: "0:07–0:08", cue: "mất việc,", sub: "mất việc,",
  art: function () {
    return g("translate(540 900)",
      '<path class="cream" d="M-240 -120 L-330 -200 L-90 -200 L0 -120 Z"/><path class="cream" d="M240 -120 L330 -200 L90 -200 L0 -120 Z"/>' +
      '<path class="line" d="M-110 -120 L-120 -250"/>' +
      '<ellipse class="ink" cx="-150" cy="-260" rx="28" ry="70" transform="rotate(-30 -150 -260)"/>' +
      '<ellipse class="ink" cx="-100" cy="-300" rx="26" ry="72" transform="rotate(8 -100 -300)"/>' +
      '<ellipse class="ink" cx="-60" cy="-240" rx="22" ry="60" transform="rotate(48 -60 -240)"/>' +
      '<g transform="rotate(8 0 -170)"><rect class="ink" x="-30" y="-250" width="100" height="120" rx="6"/><rect class="cream" x="-14" y="-234" width="68" height="88" style="stroke-width:0"/>' +
      '<circle class="ink" cx="20" cy="-200" r="14"/></g>' +
      '<path class="cream" d="M90 -200 L170 -200 L162 -120 L98 -120 Z"/><path class="line" style="stroke-width:5" d="M168 -184 C196 -184 196 -146 164 -146"/>' +
      '<rect class="cream" x="-240" y="-120" width="480" height="320"/><rect class="ink" x="-34" y="-120" width="68" height="74"/>' +
      '<path class="line" style="stroke-width:5" d="M-200 150 L-110 150 M-200 170 L-140 170"/>');
  },
  text: function () { return ""; }
});

scene({
  id: "02c", time: "0:08–0:10", cue: "cãi nhau,", sub: "cãi nhau,",
  art: function () {
    return g("translate(540 860)",
      '<rect class="ink" x="-200" y="-360" width="400" height="720" rx="54"/>' +
      '<rect class="cream" x="-170" y="-300" width="340" height="590" rx="20" style="stroke-width:0"/>' +
      '<rect class="ink" x="-150" y="-250" width="230" height="120" rx="34"/><path class="ink" d="M-130 -140 L-150 -100 L-96 -134 Z"/>' +
      '<rect class="line" x="-20" y="-80" width="170" height="110" rx="34" style="fill:' + PAPER + '"/><path class="line" style="fill:' + PAPER + '" d="M120 26 L146 64 L100 30"/>' +
      '<rect class="ink" x="-150" y="80" width="250" height="120" rx="34"/><path class="ink" d="M-130 190 L-150 230 L-96 196 Z"/>' +
      '<circle class="cream" cx="0" cy="326" r="14" style="stroke-width:0"/>');
  },
  text: function () {
    return label(505, 710, 96, "#@!", { color: CREAM }) + label(605, 868, 90, "?!") + label(515, 1036, 96, "#@!!", { color: CREAM });
  }
});

// ------------------------------------------------------------------ 3–4. Rain passes
scene({
  id: "03", time: "0:10–0:13", cue: "hay chỉ một ngày mưa.", sub: "hay chỉ một ngày mưa.",
  art: function () {
    var an = { x: 470, y: 1160, pose: "walk", arm: "chest", mood: "sad", hood: true };
    var h = handPos(an);
    return rain(40, 200, 1000, 1300, 190, [[h[0] - 160, 1030, h[0] + 160, 1520]]) +
      person(an) + umbrellaOpen(h[0], h[1] - 150, 1);
  },
  text: function () { return ""; }
});

scene({
  id: "04", time: "0:13–0:20", cue: "Nhưng nỗi buồn giống như cơn mưa: hoàn cảnh thay đổi, trời sẽ tạnh.",
  sub: "Nhưng nỗi buồn giống như cơn mưa: hoàn cảnh thay đổi, trời sẽ tạnh.",
  art: function () {
    var an = { x: 470, y: 1160, arm: "down", mood: "smile", tilt: 16, hood: true };
    var h = handPos(an);
    return sunOutline(290, 520, 110) + rain(560, 220, 420, 360, 10) + umbrellaClosed(h[0], h[1], 0.6) + person(an);
  },
  text: function () { return ""; }
});

// ------------------------------------------------------------------ 5–7. Depression is different
scene({
  id: "05", time: "0:20–0:27", cue: "Trầm cảm thì khác. Đó là một bệnh lý, kéo dài ít nhất hai tuần liền,",
  sub: "Trầm cảm thì khác. Đó là một bệnh lý, kéo dài ít nhất hai tuần liền,",
  art: function () {
    var cl = { x: 540, y: 660, s: 0.72, eyes: "right" };
    var an = { x: 700, y: 1168, arm: "hold", mood: "sad", hood: true };
    var tally = "";
    for (var k = 0; k < 14; k++) {
      var grp = Math.floor(k / 5), i = k % 5, x0 = 130 + grp * 150;
      tally += i < 4
        ? '<path class="line" style="stroke-width:8" d="M' + (x0 + i * 28) + " 1180 L" + (x0 + i * 28 + 4) + ' 1300"/>'
        : '<path class="line" style="stroke-width:8" d="M' + (x0 - 14) + " 1282 L" + (x0 + 104) + ' 1196"/>';
    }
    return tether(cl, handPos(an)) + cloud(cl) + person(an) + tally;
  },
  text: function () { return label(300, 1430, 110, "14 NGÀY"); }
});

scene({
  id: "06", time: "0:27–0:32", cue: "khiến bạn khó làm việc, khó vui chơi, thậm chí khó yêu thương.",
  sub: "khiến bạn khó làm việc, khó vui chơi, thậm chí khó yêu thương.",
  art: function () {
    var panel = function (y) { return '<rect class="line" style="stroke-width:6" x="70" y="' + y + '" width="860" height="410" rx="26"/>'; };
    return panel(210) + panel(650) + panel(1090) +
      // work: blank black laptop screen
      person({ x: 500, y: 300, s: 0.9, pose: "sit", arm: "table", mood: "sad", hood: true }) +
      cloud({ x: 720, y: 272, s: 0.12 }) +
      '<rect class="ink" x="230" y="520" width="600" height="20" rx="6"/><rect class="ink" x="262" y="540" width="16" height="70"/><rect class="ink" x="782" y="540" width="16" height="70"/>' +
      '<rect class="ink" x="350" y="506" width="180" height="14" rx="4"/><path class="ink" d="M352 512 L320 398 L338 394 L370 512 Z"/>' +
      // play: friend waves, An turns away
      person({ x: 640, y: 780, s: 0.75, coat: "ink", hair: "puff", arm: "up", mood: "smile" }) +
      person({ x: 200, y: 780, s: 0.75, arm: "down", mood: "sad", hood: true }) +
      cloud({ x: 320, y: 728, s: 0.11 }) +
      // love: the cloud covers the heart
      heart(470, 1320, 1.7) + cloud({ x: 650, y: 1262, s: 0.31, eyes: "left", look: [-6, 10] });
  },
  text: function () { return ""; }
});

scene({
  id: "07", time: "0:32–0:36", cue: "Và nó không biến mất chỉ vì bạn muốn.", sub: "Và nó không biến mất chỉ vì bạn muốn.",
  art: function () {
    return stringPath("M621 900 C600 1050 540 1150 520 1250 C516 1272 528 1284 538 1276") +
      cloud({ x: 640, y: 640, s: 0.62, eyes: "left", look: [-8, 12] }) +
      person({ x: 280, y: 1170, pose: "walk", arm: "down", mood: "sad", hood: true }) +
      '<path class="line" d="M500 1260 L560 1260 M512 1300 L572 1300 M500 1340 L540 1340"/>';
  },
  text: function () { return ""; }
});

// ------------------------------------------------------------------ 8–10. Signs
function signsScene(id, time, cue, shown) {
  scene({
    id: id, time: time, cue: cue, sub: cue,
    art: function () {
      var an = { x: 620, y: 1130, s: 0.9, arm: "hold", mood: "sad", hood: true };
      var cl = { x: 450, y: 1180, s: 0.15 };
      return symptomGrid(shown)[0] + tether(cl, handPos(an)) + cloud(cl) + person(an);
    },
    text: function () { return symptomGrid(shown)[1]; }
  });
}
signsScene("08", "0:36–0:46", "Dấu hiệu có thể là: buồn bã kéo dài, mất hứng thú, ăn uống thất thường, ngủ quá nhiều hoặc mất ngủ, mệt mỏi,", 5);
signsScene("09", "0:46–0:54", "khó tập trung, bồn chồn hoặc chậm chạp, thấy mình vô giá trị, thậm chí nghĩ đến cái chết.", 9);

scene({
  id: "10a", time: "0:54–1:00", cue: "Nếu có từ năm dấu hiệu trở lên, kéo dài hơn hai tuần, trong đó có buồn bã hoặc mất hứng thú,",
  sub: "Nếu có từ năm dấu hiệu trở lên, kéo dài hơn hai tuần,",
  art: function () {
    var out = '<rect class="cream" x="280" y="530" width="520" height="760" rx="24"/><rect class="ink" x="450" y="500" width="180" height="60" rx="14"/>';
    var checked = [0, 1, 4, 5, 7];
    for (var i = 0; i < 9; i++) {
      var y = 620 + i * 74;
      out += '<rect class="line" style="stroke-width:5;fill:' + PAPER + '" x="330" y="' + (y - 22) + '" width="44" height="44" rx="6"/>';
      out += '<path class="line" style="stroke-width:5" d="M400 ' + y + " L" + (560 + rnd(i + 40) * 180).toFixed(0) + " " + y + '"/>';
      if (checked.indexOf(i) >= 0) out += '<path class="line" style="stroke-width:12" d="M330 ' + (y - 4) + " L350 " + (y + 16) + " L390 " + (y - 34) + '"/>';
    }
    return out;
  },
  text: function () { return label(540, 330, 120, "TỪ 5 DẤU HIỆU") + label(540, 455, 110, "+ HƠN 2 TUẦN"); }
});

scene({
  id: "10b", time: "1:00–1:05", cue: "hãy gặp bác sĩ. Đừng tự chẩn đoán.", sub: "hãy gặp bác sĩ. Đừng tự chẩn đoán.",
  art: function () {
    var an = { x: 330, y: 1106, flip: true, pose: "walk", arm: "hold", mood: "neutral", hood: true };
    var cl = { x: 260, y: 1000, s: 0.14 };
    return '<path class="line" d="M80 1440 L960 1440"/>' +
      '<rect class="cream" x="700" y="900" width="200" height="540"/><circle class="ink" cx="728" cy="1180" r="11"/>' +
      '<rect class="ink" x="750" y="780" width="100" height="92" rx="14"/><path class="cline" style="stroke-width:14" d="M800 798 L800 854 M772 826 L828 826"/>' +
      tether(cl, handPos(an)) + cloud(cl) + person(an);
  },
  text: function () { return label(520, 430, 210, "ĐỪNG TỰ") + label(520, 640, 210, "CHẨN ĐOÁN"); }
});

// ------------------------------------------------------------------ 11–15. The brain
var HEAD_PATH = "M118 18 C150 20 166 58 154 92 C146 114 120 124 96 118 C86 116 78 110 72 104 L64 102 C58 101 56 96 60 92 L38 86 C30 84 30 76 38 74 L66 66 C66 40 88 16 118 18 Z";

scene({
  id: "11", time: "1:05–1:10", cue: "Trầm cảm không phải do bạn nghĩ nhiều. Nó thay đổi cả não bộ:",
  sub: "Trầm cảm không phải do bạn nghĩ nhiều. Nó thay đổi cả não bộ:",
  art: function () {
    return '<path class="ink" d="M500 980 L740 980 C780 1120 900 1220 940 1500 L200 1500 C280 1260 460 1140 500 980 Z"/>' +
      g("translate(-90 284) scale(6)", '<path class="ink" d="' + HEAD_PATH + '"/>') +
      brain("translate(480 450) scale(1.15)");
  },
  text: function () { return ""; }
});

scene({
  id: "12", time: "1:10–1:16", cue: "vùng thùy trán và hồi hải mã có thể nhỏ đi,", sub: "vùng thùy trán và hồi hải mã có thể nhỏ đi,", bg: "ink",
  art: function () {
    return g("translate(150 520) scale(2.6)",
      '<path fill="url(#hatch)" d="M40 120 C18 64 70 14 140 20 C122 70 112 120 122 176 C92 186 52 168 40 120 Z"/>' +
      '<ellipse fill="url(#hatch)" cx="172" cy="146" rx="26" ry="14"/>') +
      brain("translate(150 520) scale(2.6)") +
      g("translate(150 520) scale(2.6)", '<path class="cline thin" d="M150 150 C150 128 186 124 192 144 C198 164 172 172 166 154"/>') +
      arrow(170, 640, 236, 680, "cline thin") + arrow(180, 900, 250, 860, "cline thin") +
      '<path class="cline thin" d="M330 460 L360 610"/><path class="cline thin" d="M690 1250 L610 930"/>';
  },
  text: function () { return label(330, 440, 110, "THÙY TRÁN", { color: CREAM }) + label(720, 1340, 110, "HỒI HẢI MÃ", { color: CREAM }); }
});

scene({
  id: "13", time: "1:16–1:22", cue: "các chất như serotonin hay dopamine hoạt động bất thường,", sub: "các chất như serotonin hay dopamine hoạt động bất thường,", bg: "ink",
  art: function () {
    var out = '<circle cx="300" cy="560" r="62" fill="' + CREAM + '"/>' +
      '<path class="cline" d="M260 520 L190 450 L150 460 M190 450 L180 400 M250 600 L170 660 L130 650 M170 660 L170 710 M320 498 L330 420 L300 380 M330 420 L370 390 M360 540 L430 500"/>' +
      '<path class="cline" d="M340 610 C420 720 520 860 620 1000"/>' +
      '<path class="cline" d="M620 1000 L590 1050 M620 1000 L640 1056 M620 1000 L690 1036"/>' +
      '<circle cx="590" cy="1056" r="13" fill="' + CREAM + '"/><circle cx="642" cy="1062" r="13" fill="' + CREAM + '"/><circle cx="696" cy="1040" r="13" fill="' + CREAM + '"/>' +
      '<circle cx="780" cy="1320" r="62" fill="' + CREAM + '"/>' +
      '<path class="cline" d="M750 1264 L690 1150 L660 1130 M690 1150 L700 1120 M790 1260 L780 1160 L740 1130 M780 1160 L810 1130 M840 1300 L900 1250 M830 1360 L900 1420"/>';
    var dots = [[620, 1090, 1], [655, 1100, 0], [690, 1086, 0], [710, 1110, 0], [600, 1112, 0], [665, 1124, 1], [735, 1094, 0]];
    dots.forEach(function (d) {
      out += d[2] ? '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="9" fill="' + CREAM + '"/>'
                  : '<circle class="cline thin" style="stroke-width:4" cx="' + d[0] + '" cy="' + d[1] + '" r="8"/>';
    });
    return out;
  },
  text: function () { return label(540, 330, 100, "SEROTONIN · DOPAMINE", { color: CREAM }); }
});

scene({
  id: "14", time: "1:22–1:28", cue: "giấc ngủ rối loạn, hormone căng thẳng tăng cao.", sub: "giấc ngủ rối loạn, hormone căng thẳng tăng cao.",
  art: function () {
    return '<rect class="line" x="580" y="290" width="320" height="300" rx="8"/><path class="line" style="stroke-width:5" d="M740 290 L740 590 M580 440 L900 440"/>' +
      '<circle class="ink" cx="680" cy="370" r="54"/><circle cx="704" cy="356" r="48" fill="' + PAPER + '"/>' +
      arrow(760, 860, 760, 700) +
      '<rect class="ink" x="100" y="1150" width="170" height="290" rx="8"/><path class="cline thin" d="M130 1230 L240 1230"/>' + clock(185, 1076, 62) +
      '<rect class="ink" x="300" y="980" width="40" height="460" rx="10"/><rect class="ink" x="300" y="1250" width="630" height="60" rx="8"/>' +
      '<rect class="ink" x="900" y="1300" width="26" height="140"/>' +
      '<rect class="cream" x="340" y="1200" width="590" height="50"/><ellipse class="cream" cx="420" cy="1182" rx="80" ry="34"/>' +
      g("translate(430 1112) rotate(90) translate(-110 -70)", head({ mood: "awake" })) +
      '<path class="cream" d="M480 1250 C470 1160 540 1120 620 1130 L930 1140 L930 1250 Z"/>';
  },
  text: function () { return label(560, 830, 120, "CORTISOL"); }
});

scene({
  id: "15", time: "1:28–1:34", cue: "Nguyên nhân thì khoa học vẫn chưa hiểu hết, có lẽ là sự kết hợp giữa gene và môi trường.",
  sub: "Nguyên nhân có lẽ là sự kết hợp giữa gene và môi trường.",
  art: function () {
    var s1 = "", s2 = "", rungs = "";
    for (var y = 240; y <= 1000; y += 8) {
      var t = (y - 240) / 380 * 2 * Math.PI, dx = 170 * Math.sin(t) * (1 - (y - 240) / 1400);
      s1 += (y === 240 ? "M" : " L") + (540 + dx).toFixed(1) + " " + y;
      s2 += (y === 240 ? "M" : " L") + (540 - dx).toFixed(1) + " " + y;
      if ((y - 240) % 40 === 20 && Math.abs(Math.sin(t)) > 0.25) {
        rungs += '<path class="line" style="stroke-width:6" d="M' + (540 + dx).toFixed(0) + " " + y + " L" + (540 - dx).toFixed(0) + " " + y + '"/>';
      }
    }
    var out = rungs + '<path class="line" style="stroke-width:12" d="' + s1 + '"/><path class="line" style="stroke-width:12" d="' + s2 + '"/>';
    var b = [[120, 1180, 120, 260], [250, 1090, 110, 350], [370, 1240, 90, 200], [470, 1000, 140, 440], [620, 1150, 100, 290], [730, 1070, 120, 370], [860, 1220, 70, 220]];
    b.forEach(function (r, bi) {
      out += '<rect class="ink" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>';
      for (var wy = r[1] + 30; wy < 1400; wy += 56) {
        for (var wx = r[0] + 20; wx < r[0] + r[2] - 24; wx += 40) {
          if (rnd(bi * 100 + wy + wx) > 0.45) out += '<rect x="' + wx + '" y="' + wy + '" width="18" height="24" fill="' + CREAM + '"/>';
        }
      }
    });
    return out + '<path class="line" d="M60 1440 L1020 1440"/>';
  },
  text: function () { return label(270, 470, 120, "GENE") + label(820, 1010, 90, "+ MÔI TRƯỜNG"); }
});

// ------------------------------------------------------------------ 16. Looks fine outside
scene({
  id: "16", time: "1:34–1:42", cue: "Và một người trông vẫn ổn có thể đang rất chật vật bên trong.",
  sub: "Một người trông vẫn ổn có thể đang rất chật vật bên trong.",
  art: function () {
    return '<path class="line" style="stroke-width:5" d="M60 1420 L1020 1420"/>' + huddle() +
      stringPath("M606 960 C650 820 630 680 600 560") + cloud({ x: 550, y: 410, s: 0.42, eyes: "center" }) +
      person({ x: 280, y: 1022, flip: true, pose: "sit", arm: "table", mood: "laugh", tilt: 14, hood: true }) +
      person({ x: 620, y: 1018, coat: "ink", hair: "puff", pose: "sit", arm: "table", mood: "laugh", tilt: -8 }) +
      '<rect class="ink" x="250" y="1250" width="580" height="40" rx="8"/><rect class="ink" x="300" y="1286" width="26" height="136" rx="6"/>' +
      '<rect class="ink" x="754" y="1286" width="26" height="136" rx="6"/>' + cup(470, 1184) + cup(610, 1184, true);
  },
  text: function () { return ""; }
});

// ------------------------------------------------------------------ 17–20. Treatment (hope colour enters)
scene({
  id: "17", time: "1:42–1:50", cue: "Trung bình, người mắc bệnh tâm thần mất hơn mười năm mới đi tìm sự giúp đỡ,",
  sub: "Trung bình, người mắc bệnh tâm thần mất hơn mười năm mới đi tìm sự giúp đỡ,",
  art: function () {
    var out = '<rect class="cream" x="300" y="500" width="480" height="520" rx="10"/><rect class="ink" x="300" y="500" width="480" height="120" rx="10"/>' +
      '<rect class="cream" x="380" y="466" width="22" height="64" rx="8"/><rect class="cream" x="678" y="466" width="22" height="64" rx="8"/>';
    for (var r = 0; r < 5; r++) for (var c = 0; c < 7; c++) {
      var x = 340 + c * 66, y = 670 + r * 70;
      out += '<path class="line" style="stroke-width:5" d="M' + (x - 12) + " " + (y - 12) + " L" + (x + 12) + " " + (y + 12) + " M" + (x + 12) + " " + (y - 12) + " L" + (x - 12) + " " + (y + 12) + '"/>';
    }
    [[180, 420, -25], [840, 600, 20], [830, 930, -12], [140, 800, 15]].forEach(function (p) {
      out += g("translate(" + p[0] + " " + p[1] + ") rotate(" + p[2] + ")",
        '<rect class="cream" x="-60" y="-64" width="120" height="128" rx="6"/><rect class="ink" x="-60" y="-64" width="120" height="30" rx="6"/>');
    });
    out += '<rect class="ink" x="150" y="1110" width="160" height="20" rx="6"/><rect class="ink" x="150" y="1370" width="160" height="20" rx="6"/>' +
      '<path class="line" d="M170 1130 C170 1210 222 1230 230 1250 C238 1270 290 1290 290 1370 M290 1130 C290 1210 238 1230 230 1250 C222 1270 170 1290 170 1370"/>' +
      '<path class="ink" d="M196 1176 L264 1176 L230 1240 Z"/><path class="ink" d="M180 1370 C200 1318 260 1318 280 1370 Z"/>';
    return out + sunHope(870, 290, 34);
  },
  text: function () { return label(640, 1340, 230, "10+ NĂM"); }
});

scene({
  id: "18", time: "1:50–1:57", cue: "dù trầm cảm có cách điều trị rất hiệu quả. Thuốc và trị liệu tâm lý hỗ trợ lẫn nhau.",
  sub: "Thuốc và trị liệu tâm lý hỗ trợ lẫn nhau.",
  art: function () {
    var an = { x: 150, y: 1066, flip: true, pose: "sitfull", arm: "hold", mood: "neutral", hood: true };
    var cl = { x: 370, y: 820, s: 0.28 };
    return '<path class="line" d="M60 1400 L1020 1400"/>' +
      '<path class="line" style="stroke-width:8" d="M110 880 L110 1396"/><ellipse class="ink" cx="110" cy="1400" rx="48" ry="10"/>' +
      '<path d="M50 880 L170 880 L140 790 L80 790 Z" fill="' + HOPE + '"/>' +
      '<rect class="ink" x="150" y="1060" width="64" height="340" rx="18"/><rect class="ink" x="150" y="1300" width="300" height="60" rx="14"/>' +
      '<rect class="ink" x="820" y="1060" width="64" height="340" rx="18"/><rect class="ink" x="580" y="1300" width="300" height="60" rx="14"/>' +
      '<rect class="ink" x="452" y="1236" width="96" height="14" rx="4"/><rect class="ink" x="494" y="1250" width="12" height="150"/>' +
      pillBottle(478, 1160, 1) +
      tether(cl, handPos(an)) + cloud(cl) + person(an) +
      person({ x: 620, y: 1066, pose: "sitfull", arm: "lap", mood: "smile", hair: "bun", glasses: true });
  },
  text: function () { return ""; }
});

scene({
  id: "19", time: "1:57–2:04", cue: "Trường hợp nặng có liệu pháp sốc điện khi người bệnh được gây mê, hoặc kích thích từ xuyên sọ.",
  sub: "Trường hợp nặng có liệu pháp sốc điện khi người bệnh được gây mê, hoặc kích thích từ xuyên sọ.",
  art: function () {
    return '<path class="line" d="M60 1440 L1020 1440"/>' +
      '<rect class="ink" x="660" y="560" width="250" height="170" rx="18"/>' +
      '<path d="M684 650 L736 650 L756 606 L780 694 L800 636 L820 650 L886 650" fill="none" stroke="' + HOPE + '" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<rect class="ink" x="160" y="1236" width="540" height="50" rx="8"/><rect class="ink" x="180" y="1286" width="24" height="154"/><rect class="ink" x="656" y="1286" width="24" height="154"/>' +
      '<path class="ink" d="M160 1240 L210 1060 L250 1070 L206 1250 Z"/>' +
      '<rect class="cream" x="210" y="1204" width="490" height="34"/>' +
      g("translate(268 1120) rotate(70) translate(-110 -70)", head({ mood: "closed" })) +
      '<path class="cream" d="M300 1238 C296 1170 360 1150 430 1158 L700 1176 L700 1238 Z"/>' +
      // TMS device cart with a soft gooseneck arm (no straight overhead beam)
      '<rect class="ink" x="40" y="1250" width="120" height="160" rx="14"/><rect class="cream" x="58" y="1270" width="84" height="50" rx="6" style="stroke-width:0"/>' +
      '<circle class="cream" cx="66" cy="1420" r="14"/><circle class="cream" cx="134" cy="1420" r="14"/>' +
      '<path class="line" style="stroke-width:12" d="M110 1250 C100 1150 150 1060 214 1028"/>' +
      '<circle class="cream" cx="234" cy="1012" r="28"/><circle class="cream" cx="288" cy="1012" r="28"/>' +
      person({ x: 720, y: 1110, mood: "smile", arm: "down" });
  },
  text: function () { return label(540, 330, 110, "CÓ GÂY MÊ") + label(540, 450, 110, "BÁC SĨ THEO DÕI"); }
});

scene({
  id: "20", time: "2:04–2:09", cue: "Trầm cảm là bệnh, và bệnh thì có thể chữa.", sub: "Trầm cảm là bệnh, và bệnh thì có thể chữa.",
  art: function () {
    var cl = { x: 470, y: 700, s: 0.55, eyes: "center", look: [0, 12] };
    var an = { x: 440, y: 1150, mood: "smile", tilt: 16, arm: "hold", hood: true };
    var rays = [[700, 500, 300, 860], [740, 540, 430, 960], [780, 560, 600, 980], [660, 470, 230, 700]].map(function (r) {
      return '<path d="M' + r[0] + " " + r[1] + " L" + r[2] + " " + r[3] + '" stroke="' + HOPE + '" stroke-width="18" stroke-linecap="round"/>';
    }).join("");
    return sunHope(770, 430, 130) + tether(cl, handPos(an), "left") + cloud(cl) + rays + person(an);
  },
  text: function () { return ""; }
});

// ------------------------------------------------------------------ 21–24. Helping someone
scene({
  id: "21", time: "2:09–2:17", cue: "Nếu người thân bạn bị trầm cảm, đừng chỉ nói “cố lên”. Hãy giúp việc cụ thể: tìm một chuyên gia tâm lý, hay cùng họ ghi câu hỏi cho bác sĩ.",
  sub: "Hãy giúp việc cụ thể: tìm một chuyên gia tâm lý, hay cùng họ ghi câu hỏi cho bác sĩ.",
  art: function () {
    var an = { x: 60, y: 1066, flip: true, pose: "sitfull", arm: "lap", mood: "neutral", hood: true };
    var cl = { x: 200, y: 900, s: 0.16 };
    return '<path class="line" d="M40 1400 L1040 1400"/>' +
      '<rect class="ink" x="40" y="1060" width="60" height="340" rx="16"/><rect class="ink" x="70" y="1300" width="250" height="50" rx="12"/>' +
      '<rect class="ink" x="880" y="1060" width="56" height="340" rx="16"/><rect class="ink" x="690" y="1300" width="250" height="50" rx="12"/>' +
      '<rect class="ink" x="360" y="1230" width="320" height="20" rx="6"/><rect class="ink" x="380" y="1250" width="16" height="150"/><rect class="ink" x="644" y="1250" width="16" height="150"/>' +
      '<rect class="ink" x="420" y="1216" width="170" height="14" rx="4"/><path class="cream" d="M432 1218 L452 1080 L578 1080 L598 1218 Z"/>' +
      '<path class="ink" d="M515 1104 C494 1104 484 1126 494 1142 L515 1176 L536 1142 C546 1126 536 1104 515 1104 Z"/><circle cx="515" cy="1128" r="9" fill="' + CREAM + '"/>' +
      '<rect class="cream" x="604" y="1196" width="66" height="34" rx="4"/><path class="line" style="stroke-width:4" d="M614 1206 L656 1206 M614 1218 L644 1218"/>' +
      tether(cl, handPos(an)) + cloud(cl) + person(an) +
      person({ x: 740, y: 1066, coat: "ink", hair: "puff", pose: "sitfull", arm: "table", mood: "smile" });
  },
  text: function () { return ""; }
});

scene({
  id: "22", time: "2:17–2:23", cue: "Nhắc họ rằng đây là bệnh, giống hen suyễn hay tiểu đường, không phải yếu đuối.",
  sub: "Đây là bệnh, giống hen suyễn hay tiểu đường, không phải yếu đuối.",
  art: function () {
    var p1 = { x: 100, y: 1112, flip: true, hair: "long", arm: "table", mood: "smile" };
    var p2 = { x: 390, y: 1112, flip: true, coat: "ink", hair: "bun", arm: "table", mood: "smile" };
    var an = { x: 680, y: 1112, flip: true, arm: "hold", mood: "neutral", hood: true };
    var h1 = handPos(p1), h2 = handPos(p2), cl = { x: 790, y: 1000, s: 0.13 };
    return '<path class="line" d="M60 1446 L1020 1446"/>' + person(p1) + person(p2) +
      g("translate(" + (h1[0] + 6) + " " + (h1[1] - 6) + ") scale(0.8)",
        '<rect class="ink" x="-13" y="-112" width="26" height="40" rx="6"/><path class="cream" d="M-16 -76 L16 -76 L16 0 L50 0 L50 30 L-16 30 Z"/>') +
      g("translate(" + (h2[0] + 6) + " " + h2[1] + ") rotate(35) scale(0.8)",
        '<rect class="cream" x="-11" y="-120" width="22" height="160" rx="6"/><rect class="ink" x="-13" y="-140" width="26" height="40" rx="6"/><rect class="ink" x="-13" y="34" width="26" height="22" rx="4"/>') +
      tether(cl, handPos(an)) + cloud(cl) + person(an);
  },
  text: function () { return label(540, 520, 170, "KHÔNG PHẢI") + label(540, 720, 170, "YẾU ĐUỐI"); }
});

scene({
  id: "23", time: "2:23–2:28", cue: "Đừng so sánh với những lúc bạn buồn.", sub: "Đừng so sánh với những lúc bạn buồn.",
  art: function () {
    return '<path class="line" d="M60 1446 L1020 1446"/>' +
      '<path class="line" style="fill:' + PAPER + '" d="M190 380 L860 380 Q900 380 900 420 L900 760 Q900 800 860 800 L380 800 L300 1060 L320 800 L190 800 Q150 800 150 760 L150 420 Q150 380 190 380 Z"/>' +
      person({ x: 120, y: 1112, flip: true, coat: "ink", hair: "puff", arm: "down", mood: "neutral" }) +
      person({ x: 640, y: 1112, arm: "down", mood: "sad", hood: true }) + cloud({ x: 790, y: 1010, s: 0.13 });
  },
  text: function () {
    return label(525, 560, 130, "MÌNH CŨNG TỪNG") + label(525, 720, 130, "BUỒN MÀ…") +
      '<path d="M190 780 L870 410" stroke="' + INK + '" stroke-width="18" stroke-linecap="round"/>';
  }
});

scene({
  id: "24", time: "2:28–2:38", cue: "Đừng so sánh… Và đừng ngại hỏi thẳng về ý nghĩ tự sát, vì hỏi thẳng có thể giúp giảm nguy cơ.",
  sub: "Đừng ngại hỏi thẳng về ý nghĩ tự sát, vì hỏi thẳng có thể giúp giảm nguy cơ.",
  art: function () {
    var an = { x: 180, y: 1066, flip: true, pose: "sitfull", arm: "hold", mood: "neutral", hood: true };
    var fr = { x: 560, y: 1066, coat: "ink", hair: "puff", pose: "sitfull", arm: "hold", mood: "smile", tilt: -6 };
    var ha = handPos(an), hf = handPos(fr);
    var out = '<path d="M310 1060 A230 230 0 0 1 770 1060 Z" fill="' + HOPE + '"/><path class="line" style="stroke-width:5" d="M40 1060 L1040 1060"/>' +
      '<rect class="ink" x="40" y="1110" width="1000" height="18" rx="6"/><rect class="ink" x="40" y="1318" width="1000" height="14" rx="4"/>';
    for (var x = 70; x < 1040; x += 70) out += '<rect class="ink" x="' + x + '" y="1128" width="12" height="190"/>';
    out += '<rect class="ink" x="170" y="1306" width="720" height="26" rx="8"/><rect class="ink" x="200" y="1332" width="20" height="108"/><rect class="ink" x="840" y="1332" width="20" height="108"/>' +
      '<path class="line" d="M40 1440 L1040 1440"/>';
    out += stringPath("M470 880 C440 1000 360 1150 " + ha[0] + " " + ha[1]) + stringPath("M478 880 C520 1000 580 1150 " + hf[0] + " " + hf[1]);
    return out + cloud({ x: 470, y: 800, s: 0.2, eyes: "center" }) + person(an) + person(fr);
  },
  text: function () { return ""; }
});

// ------------------------------------------------------------------ 25. Closing
scene({
  id: "25a", time: "2:38–2:48", cue: "Càng nói cởi mở, càng nhiều người dám tìm đến sự giúp đỡ. Bạn không một mình.",
  sub: "Càng nói cởi mở, càng nhiều người dám tìm đến sự giúp đỡ.",
  art: function () {
    var people = [
      { x: 70, hair: "cap", hood: true, flip: true, mood: "smile" },
      { x: 210, coat: "ink", hair: "puff", mood: "smile" },
      { x: 350, hair: "long", flip: true, mood: "neutral" },
      { x: 490, coat: "ink", hair: "bun", mood: "smile" },
      { x: 630, hair: "cap", flip: true, mood: "smile" },
      { x: 770, coat: "ink", hair: "long", mood: "neutral" }
    ];
    var out = sunHope(540, 700, 230, 90) + '<path class="line" d="M40 1446 L1040 1446"/>';
    people.forEach(function (p, i) {
      p.y = 1246; p.s = 0.6; p.arm = "hold";
      // every other cloud has come loose and is floating away, smaller
      var h = handPos(p), loose = i % 2 === 0;
      var cl = loose
        ? { x: h[0] + (p.flip ? 60 : -60), y: 860 + i * 18, s: 0.08, eyes: "none" }
        : { x: h[0] + (p.flip ? 30 : -30), y: 1060 + (i % 3) * 20, s: 0.13, eyes: "center" };
      out += loose ? '<path class="line thin" d="M' + cl.x + " " + (cl.y + 40) + " C" + (cl.x - 10) + " " + (cl.y + 80) + " " +
                     (cl.x + 14) + " " + (cl.y + 100) + " " + cl.x + " " + (cl.y + 130) + '"/>' : tether(cl, h);
      out += cloud(cl) + person(p);
    });
    return out;
  },
  text: function () { return ""; }
});

scene({
  id: "25b", time: "2:48–2:55", cue: "(Màn hình kết thúc)", sub: "",
  art: function () { return sunHope(540, 300, 54, 50); },
  text: function () {
    return label(540, 600, 220, "BẠN KHÔNG") + label(540, 820, 220, "MỘT MÌNH") +
      '<rect x="130" y="920" width="820" height="250" rx="40" fill="' + HOPE + '"/>' +
      label(540, 1010, 76, "ĐƯỜNG DÂY NÓNG NGÀY MAI") +
      '<text x="540" y="1124" text-anchor="middle" style="font-family:\'Be Vietnam Pro\';font-weight:600;font-size:96px;fill:' + INK + '">096 306 1414</text>' +
      '<text x="540" y="1270" text-anchor="middle" style="font-family:\'Be Vietnam Pro\';font-weight:600;font-size:34px;fill:' + INK + '">Nội dung tham khảo, không thay thế chẩn đoán y khoa.</text>' +
      '<text x="540" y="1322" text-anchor="middle" style="font-family:\'Be Vietnam Pro\';font-weight:600;font-size:34px;fill:' + INK + '">Nguồn: WHO · NIMH · DSM-5</text>';
  }
});
