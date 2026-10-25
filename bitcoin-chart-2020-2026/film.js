// THE FILM — draws frame t. Everything is a pure function of t (no state), so any frame
// can be rendered in any order by any worker, and it always lines up with song.js.
// Look: "Glow Technology" — neon candles, bloom, HUD panels. Three variants in LOOKS, picked by look.js.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, DAYS, NDAYS, hits, EVENTS } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H;

  const LOOKS = {
    // A: cyan hologram — a trading terminal projected in the dark
    hologram: {
      bg0: '#01040C', bg1: '#03142B', accent: '#00E5FF', accent2: '#8AF6FF', text: '#D6FBFF', dim: '#4F8FA0',
      grid: 'rgba(0,229,255,0.09)', gridMajor: 'rgba(0,229,255,0.32)', up: '#00FFA3', down: '#FF2E63',
      font: 'Inter', mono: 'Inter', title: 'Bungee', hex: true, floor: false, rain: false, scan: 0.05,
    },
    // B: cyberpunk — magenta + cyan, a synthwave floor grid under the chart
    cyber: {
      bg0: '#04010A', bg1: '#1A0533', accent: '#FF2BD6', accent2: '#00E5FF', text: '#FBE6FF', dim: '#A06AB4',
      grid: 'rgba(255,43,214,0.09)', gridMajor: 'rgba(0,229,255,0.35)', up: '#00FFA3', down: '#FF2E63',
      font: 'Inter', mono: 'Inter', title: 'Bungee', hex: false, floor: true, rain: false, scan: 0.04,
    },
    // C: terminal — black glass, teal phosphor, falling digits behind the chart
    terminal: {
      bg0: '#000000', bg1: '#00130E', accent: '#2BFFD0', accent2: '#B6FFEE', text: '#D8FFF4', dim: '#3C9E86',
      grid: 'rgba(43,255,208,0.08)', gridMajor: 'rgba(43,255,208,0.30)', up: '#00FF7F', down: '#FF3355',
      font: '"DejaVu Sans Mono", monospace', mono: '"DejaVu Sans Mono", monospace', title: '"DejaVu Sans Mono", monospace', hex: false, floor: false, rain: true, scan: 0.09,
    },
  };
  const L = LOOKS[globalThis.LOOK] || LOOKS.hologram;
  const UP = L.up, DOWN = L.down;

  // ---------- layout ----------
  const PLOT_R = 1660; // the price axis column starts here
  const HEAD_X = 1390; // where the live candle sits once the camera follows
  const Y0 = 190, Y1 = 935; // plot top / bottom
  const PPD = 9.5; // pixels per day while following
  const LEFT = 70;

  const fmt = (p) => '$' + (p >= 100 ? Math.round(p).toLocaleString('en-US') : p >= 1 ? (Number.isInteger(p) ? String(p) : p.toFixed(2)) : p.toPrecision(2));
  const Y_START = S.dateOf(0).getUTCFullYear(), Y_END = S.dateOf(NDAYS - 1).getUTCFullYear();
  let LOGO = null;
  const yearOf = (d) => S.dateOf(clamp(d, 0, NDAYS - 1)).getUTCFullYear();
  const pad2 = (x) => String(x).padStart(2, '0');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateStr = (d) => { const x = S.dateOf(clamp(d, 0, NDAYS - 1)); return `${MON[x.getUTCMonth()]} ${pad2(x.getUTCDate())}, ${x.getUTCFullYear()}`; };
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  // ---------- the camera ----------
  const camX0 = (D) => Math.max(D * PPD - HEAD_X, -LEFT - 40);
  function rawRange(tt) {
    const D = S.dayAt(tt), cx = camX0(D);
    const i0 = Math.max(0, Math.floor((cx + LEFT * 0.5) / PPD)), i1 = Math.min(NDAYS - 1, Math.floor(D));
    let lo = Infinity, hi = -Infinity;
    for (let i = i0; i < i1; i++) { lo = Math.min(lo, DAYS[i][2]); hi = Math.max(hi, DAYS[i][1]); }
    if (D >= 0 && i1 >= 0) { const c = S.candleAt(i1, tt) || { l: DAYS[i1][3], h: DAYS[i1][3] }; lo = Math.min(lo, c.l); hi = Math.max(hi, c.h); }
    if (!isFinite(lo)) { lo = DAYS[0][0] * 0.85; hi = DAYS[0][0] * 1.15; }
    return [Math.log(lo), Math.log(hi)];
  }
  // smoothed over ±0.5 s (a gaussian), so the vertical zoom glides instead of jumping
  function followCam(t) {
    let lo = 0, hi = 0, wsum = 0;
    for (let k = -8; k <= 8; k++) {
      const w = Math.exp(-(k * k) / 24), r = rawRange(Math.min(t + k * 0.0625, ev.end));
      lo += r[0] * w; hi += r[1] * w; wsum += w;
    }
    lo /= wsum; hi /= wsum;
    const lp = Math.log(S.priceAt(Math.min(t, ev.end)));
    if (hi - lo < Math.log(1.35)) { const mid = (hi + lo) / 2; lo = mid - Math.log(1.35) / 2; hi = mid + Math.log(1.35) / 2; }
    const r = hi - lo;
    lo -= r * 0.2; hi += r * 0.2; // headroom for the event labels, above and below
    lo = Math.min(lo, lp - r * 0.06); hi = Math.max(hi, lp + r * 0.08); // the live price never leaves the frame
    return { ppd: PPD, off: camX0(S.dayAt(t)), lo, hi };
  }
  // after the last candle the camera pulls back to show all six years
  const ZOOM0 = ev.end + 0.5, ZOOM1 = ev.end + 2.8;
  let FULL = null;
  function fullCam() {
    if (FULL) return FULL;
    let lo = Infinity, hi = -Infinity;
    for (const c of DAYS) { lo = Math.min(lo, c[2]); hi = Math.max(hi, c[1]); }
    const ppd = (HEAD_X + 120 - LEFT) / NDAYS, l = Math.log(lo), h = Math.log(hi), r = h - l;
    return (FULL = { ppd, off: -LEFT, lo: l - r * 0.06, hi: h + r * 0.1 });
  }
  function camera(t) {
    const a = followCam(Math.min(t, ZOOM0));
    if (t <= ZOOM0) return { ...a, k: 0 };
    const b = fullCam(), k = ease.inOutCubic(clamp((t - ZOOM0) / (ZOOM1 - ZOOM0)));
    return { ppd: lerp(a.ppd, b.ppd, k), off: lerp(a.off, b.off, k), lo: lerp(a.lo, b.lo, k), hi: lerp(a.hi, b.hi, k), k };
  }

  // ---------- drawing helpers ----------
  const H_ = U.hash;
  const font = (size, w = 700, fam = L.font) => `${w} ${size}px ${/[,"]/.test(fam) ? fam : '"' + fam + '"'}`;
  function txt(ctx, s, x, y, { size = 32, w = 700, fam = L.font, color = L.text, align = 'left', glow = 0, alpha = 1, spacing = 0 } = {}) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = font(size, w, fam); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    if (spacing) ctx.letterSpacing = spacing + 'px';
    ctx.fillStyle = color;
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; ctx.fillText(s, x, y); }
    ctx.shadowBlur = 0; ctx.fillText(s, x, y);
    ctx.restore();
  }
  const measure = (ctx, s, size, w = 700, fam = L.font) => { ctx.save(); ctx.font = font(size, w, fam); const m = ctx.measureText(s).width; ctx.restore(); return m; };
  function glowLine(ctx, pts, color, lw = 2, blur = 12, alpha = 1) {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.shadowColor = color; ctx.shadowBlur = blur;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) ctx.lineTo(p[0], p[1]); ctx.stroke();
    ctx.restore();
  }
  // a HUD panel: dark glass, thin border, bright corner brackets
  function panel(ctx, x, y, w, h, color, { fill = 'rgba(2,8,16,0.72)', corner = 16, glow = 14, alpha = 1 } = {}) {
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.fillStyle = fill; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = rgba(color, 0.35); ctx.lineWidth = 1.2; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.shadowColor = color; ctx.shadowBlur = glow;
    ctx.beginPath();
    for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      ctx.moveTo(cx, cy + sy * corner); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * corner, cy);
    }
    ctx.stroke(); ctx.restore();
  }

  // the ₿ coin drawn from lines: ring, ticks, the B with its two bars; it turns on its vertical axis
  function bitcoinLogo(ctx, cx, cy, R, t) {
    ctx.save();
    ctx.translate(cx, cy);
    // a soft orange halo, then the coin, then a cyan scan ring around it
    const g = ctx.createRadialGradient(0, 0, R * 0.4, 0, 0, R * 1.6);
    g.addColorStop(0, 'rgba(8,108,229,0.07)'); g.addColorStop(1, 'rgba(8,108,229,0)');
    ctx.fillStyle = g; ctx.fillRect(-R * 1.6, -R * 1.6, R * 3.2, R * 3.2);
    ctx.save(); ctx.rotate(Math.sin(t * 0.4) * 0.08); ctx.scale(1 + 0.02 * Math.sin(t * 1.3), 1 + 0.02 * Math.sin(t * 1.3));
    if (LOGO) { ctx.globalAlpha = 0.1; ctx.drawImage(LOGO, -R, -R, R * 2, R * 2); }
    ctx.restore();
    ctx.strokeStyle = rgba(L.accent, 0.14); ctx.lineWidth = 1.5; ctx.shadowColor = L.accent; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(0, 0, R * 1.12, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath();
    for (let k = 0; k < 72; k++) { const a = (k / 72) * Math.PI * 2 + t * 0.15, r0 = R * (k % 6 ? 1.16 : 1.14); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * R * 1.2, Math.sin(a) * R * 1.2); }
    ctx.stroke();
    ctx.restore();
  }

  // ---------- background ----------
  let SCAN = null;
  function background(ctx, t, cam, D) {
    const g = ctx.createRadialGradient(W * 0.55, H * 0.45, 100, W * 0.55, H * 0.45, W * 0.8);
    g.addColorStop(0, L.bg1); g.addColorStop(1, L.bg0);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (L.hex) { // a field of tiny tech dots that drifts with the camera
      ctx.save(); ctx.fillStyle = rgba(L.accent, 0.13);
      const off = (cam.off * 0.3) % 48;
      for (let y = 24; y < H; y += 42) for (let x = -off + ((y / 42) % 2) * 24; x < W; x += 48) ctx.fillRect(x, y, 2, 2);
      ctx.restore();
    }
    if (L.rain) { // falling digits, very faint
      ctx.save(); ctx.font = font(18, 400, L.mono); ctx.textAlign = 'center';
      for (let c = 0; c < 64; c++) {
        const x = 15 + c * 30, sp = 60 + H_(c, 1) * 120, len = 8 + Math.floor(H_(c, 2) * 14);
        const head = ((H_(c, 3) * H * 1.5 + t * sp) % (H * 1.5)) - 100;
        for (let k = 0; k < len; k++) {
          const y = head - k * 22;
          if (y < -20 || y > H) continue;
          ctx.fillStyle = rgba(L.accent, (k ? 0.10 : 0.30) * (1 - k / len));
          ctx.fillText(String(Math.floor(H_(c, k, Math.floor(t * 8 + k)) * 10)), x, y);
        }
      }
      ctx.restore();
    }
    if (L.floor) { // a synthwave perspective floor under the chart
      ctx.save();
      const hz = Y1 - 30, vx = W * 0.45;
      const fg = ctx.createLinearGradient(0, hz, 0, H); fg.addColorStop(0, 'rgba(255,43,214,0)'); fg.addColorStop(1, 'rgba(255,43,214,0.10)');
      ctx.fillStyle = fg; ctx.fillRect(0, hz, W, H - hz);
      ctx.strokeStyle = rgba(L.accent, 0.22); ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = -20; i <= 20; i++) { ctx.moveTo(vx + i * 30, hz); ctx.lineTo(vx + i * 260, H); }
      const ph = (t * 0.9) % 1;
      for (let k = 0; k < 8; k++) { const z = (k + ph) / 8, y = hz + (H - hz) * z * z; ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke(); ctx.restore();
    }
    // the Bitcoin coin, a slowly turning hologram behind the chart
    bitcoinLogo(ctx, PLOT_R / 2, H / 2 + 20, 230, t);
  }

  function grid(ctx, cam, X, Y) {
    const pLo = Math.exp(cam.lo), pHi = Math.exp(cam.hi);
    const span = pHi - pLo, raw = span / 6, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw);
    const levels = [];
    if (cam.k > 0.5) { for (const p of [0.01, 0.1, 1, 10, 100, 1000, 10000, 100000]) if (p > pLo && p < pHi) levels.push(p); }
    else for (let p = Math.ceil(pLo / step) * step; p < pHi; p += step) levels.push(p);
    ctx.save();
    for (const p of levels) {
      const y = Math.round(Y(p)) + 0.5;
      if (y < Y0 - 30 || y > Y1 + 10) continue;
      ctx.strokeStyle = L.grid; ctx.lineWidth = 1; ctx.setLineDash([2, 6]);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(PLOT_R, y); ctx.stroke();
      ctx.setLineDash([]);
      txt(ctx, fmt(p), PLOT_R + 22, y + 9, { size: 24, w: 400, fam: L.mono, color: L.dim });
    }
    const d0 = Math.floor(cam.off / cam.ppd) - 31, d1 = Math.ceil((PLOT_R + cam.off) / cam.ppd) + 31;
    const s0 = S.dateOf(0);
    for (let mo = 0; mo < (Y_END - Y_START + 2) * 12; mo++) {
      const d = Math.round((Date.UTC(Y_START, mo, 1) - s0.getTime()) / 86400000);
      if (d < d0 || d > d1) continue;
      const x = Math.round(X(d)) + 0.5;
      if (x < 0 || x > PLOT_R) continue;
      const jan = mo % 12 === 0;
      if (jan) {
        glowLine(ctx, [[x, Y0 - 40], [x, Y1 + 8]], L.gridMajor, 1.2, 8);
        if (cam.k < 0.5 || (Y_START + mo / 12) % 2 === 0 || cam.ppd > 0.5) txt(ctx, String(Y_START + mo / 12), x + 10, Y1 + 50, { size: 30, w: 800, color: L.accent, glow: 12 });
      } else if (cam.k < 0.5) {
        ctx.strokeStyle = L.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, Y0 - 40); ctx.lineTo(x, Y1 + 8); ctx.stroke();
        if (cam.k < 0.3) txt(ctx, MON[mo % 12].toUpperCase(), x + 6, Y1 + 40, { size: 18, w: 700, fam: L.mono, color: L.dim, alpha: 1 - cam.k / 0.3, spacing: 1 });
      }
    }
    // the plot frame
    ctx.strokeStyle = rgba(L.accent, 0.25); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, Y1 + 8.5); ctx.lineTo(PLOT_R, Y1 + 8.5); ctx.stroke();
    ctx.restore();
  }

  // neon candles: a translucent body, a bright edge; the bloom pass makes them glow
  function candle(ctx, i, c, x, Y, bw, live, t) {
    const up = c.c >= c.o, col = up ? UP : DOWN;
    const yh = Y(c.h), yl = Y(c.l), yo = Y(c.o), yc = Y(c.c);
    const top = Math.min(yo, yc), bot = Math.max(Math.max(yo, yc), top + 1.5);
    ctx.strokeStyle = col; ctx.lineWidth = bw > 3 ? 1.4 : Math.max(1, bw * 0.9);
    ctx.beginPath(); ctx.moveTo(x, yh); ctx.lineTo(x, yl); ctx.stroke();
    if (bw <= 2.2) { ctx.lineWidth = Math.max(1, bw); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); return; }
    const hw = bw / 2;
    ctx.fillStyle = rgba(col, up ? 0.38 : 0.5); ctx.fillRect(x - hw, top, bw, bot - top);
    ctx.lineWidth = 1.5; ctx.strokeRect(x - hw, top, bw, bot - top);
    if (live) {
      ctx.save();
      ctx.shadowColor = col; ctx.shadowBlur = 25; ctx.fillStyle = col; ctx.fillRect(x - hw, top, bw, bot - top);
      // a pulsing ring on the live price
      const ph = (t * 1.6) % 1;
      ctx.shadowBlur = 0; ctx.strokeStyle = rgba(col, 0.8 * (1 - ph)); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, yc, 6 + ph * 26, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, yc, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // ---------- event labels ----------
  // Each label is placed ONCE, at the moment its event happens, and then stays fixed to its candle:
  // up events above the candles, down events below them, never over a candle, never over an earlier label.
  // A two-segment callout (a diagonal, then a horizontal run) points from the candle to the label.
  const DIAG = 34, RUN = 30, PAD = 14; // callout geometry, px
  const MEASURE = G.makeCanvas(8, 8).getContext('2d');
  const PLACE = [];
  const sizeOf = (e) => (e.big ? 62 : e.hit ? 40 : 22); // the big moments shout, the small ones whisper
  const camAt = (t) => { const c = camera(t); return { X: (d) => d * c.ppd - c.off, Y: (p) => Y1 - ((Math.log(p) - c.lo) / (c.hi - c.lo)) * (Y1 - Y0), c }; };
  function placeLabel(n) {
    if (PLACE[n]) return PLACE[n];
    const e = EVENTS[n], up = e.kind !== 'down', size = sizeOf(e), h = size * 1.3;
    const s = e.text.toUpperCase(), tw = measure(MEASURE, s, size, 800);
    const { X, Y, c } = camAt(e.t);
    const x = X(e.day + 0.5), ay = Y(e.price) + (up ? -8 : 8);
    const bw = tw + PAD * 2;
    // candidates: a callout to the right (dir 1), to the left (-1), or the box straight above/below the candle (0);
    // the callout wins unless its line would get long and the straight one is shorter
    const cand = [];
    for (const dir of [1, -1, 0]) {
      const off = dir > 0 ? DIAG + RUN : dir < 0 ? -(DIAG + RUN + bw) : -bw / 2; // box left edge relative to the anchor x
      if (x + off + bw > PLOT_R - 20 && dir >= 0) continue;
      // every candle under the callout and the box, including the ones still to come
      const x0 = Math.min(x, x + off) - 6, x1 = Math.max(x, x + off + bw) + 6;
      const dA = Math.max(0, Math.floor((x0 + c.off) / c.ppd - 1)), dB = Math.min(NDAYS - 1, Math.ceil((x1 + c.off) / c.ppd));
      let ref = up ? 0 : Infinity;
      for (let d = dA; d <= dB; d++) ref = up ? Math.max(ref, DAYS[d][1]) : Math.min(ref, DAYS[d][2]);
      const min = dir ? 44 : 34 + h / 2; // the shortest line each shape allows
      const base = up ? Math.min(Y(ref) - 22 - h / 2, ay - min) : Math.max(Y(ref) + 22 + h / 2, ay + min); // box middle
      cand.push({ dir, off, ref, base, len: Math.abs(base - ay) - (dir ? 0 : h / 2) });
    }
    const elbow = cand.filter((q) => q.dir).sort((a, b) => a.len - b.len)[0], straight = cand.find((q) => !q.dir);
    const { dir, off, ref, base } = !elbow || (straight && elbow.len > 110 && straight.len < elbow.len) ? straight : elbow;
    const step = h + 12;
    // boxes of the earlier labels still on screen at this moment
    const others = [];
    for (let m = 0; m < n; m++) {
      const o = EVENTS[m];
      if (e.t - o.t > 8.5 || e.t < o.t) continue;
      const P = placeLabel(m), ox = X(o.day + 0.5) + P.off, oy = Y(P.ref) + P.gap;
      others.push([ox, oy - P.h / 2, ox + P.bw, oy + P.h / 2]);
    }
    const bx = x + off, clash = (my) => others.some((q) => bx < q[2] + 10 && bx + bw > q[0] - 10 && my - h / 2 < q[3] + 10 && my + h / 2 > q[1] - 10);
    const inside = (my) => (up ? my - h / 2 >= (bx > 700 ? 112 : Y0 - 10) : my + h / 2 <= Y1 - 4);
    let mid = base;
    for (let k = 0; k < 6; k++) { const my = base + (up ? -1 : 1) * k * step; if (!inside(my)) break; mid = my; if (!clash(my)) break; }
    return (PLACE[n] = { s, tw, bw, h, size, up, off, dir, ref, gap: mid - Y(ref) }); // gap: px from the reference candle
  }

  function labels(ctx, t, X, Y, cam) {
    const fade = 1 - clamp(cam.k * 3);
    if (fade <= 0) return;
    EVENTS.forEach((e, n) => {
      const age = t - e.t;
      if (age < 0) return;
      const P = placeLabel(n);
      const x = X(e.day + 0.5);
      if (x + Math.min(0, P.off) > PLOT_R + 50 || x + Math.max(0, P.off + P.bw) < -50) return;
      const alpha = fade * clamp(1 - (age - 7) / 1.5);
      if (alpha <= 0) return;
      const ay = Y(e.price) + (P.up ? -8 : 8), my = Y(P.ref) + P.gap, bx = x + P.off;
      const col = e.kind === 'down' ? DOWN : e.kind === 'up' ? UP : L.accent2;
      // the line, drawn out over 0.35 s: anchor -> diagonal -> horizontal -> box, or straight up/down into the box
      const k = ease.outCubic(clamp(age / 0.35));
      const pts = [[x, ay]];
      if (P.dir) {
        const B = [x + P.dir * DIAG, my], C = [P.dir > 0 ? bx : bx + P.bw, my];
        const l1 = Math.hypot(B[0] - x, B[1] - ay), l2 = Math.abs(C[0] - B[0]), L_ = (l1 + l2) * k;
        if (L_ <= l1) pts.push([lerp(x, B[0], L_ / l1), lerp(ay, B[1], L_ / l1)]);
        else pts.push(B, [lerp(B[0], C[0], (L_ - l1) / l2), my]);
      } else pts.push([x, lerp(ay, my + (P.up ? P.h / 2 : -P.h / 2), k)]);
      const tier = e.big ? 2 : e.hit ? 1 : 0;
      ctx.save(); ctx.globalAlpha = alpha;
      glowLine(ctx, pts, col, [1.3, 2.2, 3][tier], [6, 12, 18][tier]);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, ay, 4, 0, Math.PI * 2); ctx.fill();
      if (age > 0.25) {
        const shown = P.s.slice(0, Math.ceil(P.s.length * clamp((age - 0.25) / 0.3)));
        // three tiers: small = quiet grey box; hit = coloured, tinted, glowing; big = brighter, pulsing glow
        const pulse = tier === 2 ? 0.6 + 0.4 * Math.sin(age * 6) : 1;
        panel(ctx, bx, my - P.h / 2, P.bw, P.h, col, { fill: tier ? `rgba(2,8,16,0.82)` : 'rgba(2,8,16,0.6)', corner: [8, 12, 16][tier], glow: [4, 18, 30 * pulse][tier], alpha: tier ? 1 : 0.85 });
        if (tier) { ctx.save(); ctx.fillStyle = rgba(col, tier === 2 ? 0.2 : 0.12); ctx.fillRect(bx, my - P.h / 2, P.bw, P.h); ctx.restore(); }
        txt(ctx, shown, bx + PAD, my + P.size * 0.35, { size: P.size, w: 800, color: tier ? col : rgba(L.text, 0.85), glow: [0, 14, 26 * pulse][tier] });
      }
      ctx.restore();
    });
  }

  // the live candle (the one forming at t), or the last one after the end
  function live(t) {
    const tt = Math.min(t, ev.end), D = S.dayAt(tt);
    const i = Math.min(NDAYS - 1, Math.max(0, Math.floor(D)));
    const c = D < 0 ? { o: DAYS[0][0], c: DAYS[0][0] } : D >= NDAYS ? { o: DAYS[i][0], c: DAYS[i][3] } : S.candleAt(i, tt);
    return { D, o: c.o, p: c.c, up: c.c >= c.o };
  }

  // the dotted price line from the live candle across to the axis
  function priceLine(ctx, t, cam, Y, X) {
    const L0 = live(t), col = L0.up ? UP : DOWN;
    const y = clamp(Y(L0.p), Y0 - 20, Y1), hx = X(Math.max(0, L0.D));
    ctx.save();
    ctx.globalAlpha = 1 - cam.k;
    const g = ctx.createLinearGradient(hx, 0, PLOT_R, 0); g.addColorStop(0, rgba(col, 0.9)); g.addColorStop(1, rgba(col, 0.3));
    ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.shadowColor = col; ctx.shadowBlur = 10; ctx.setLineDash([3, 7]); ctx.lineCap = 'round'; ctx.lineDashOffset = -t * 40;
    ctx.beginPath(); ctx.moveTo(hx + 10, y); ctx.lineTo(PLOT_R + 6, y); ctx.stroke();
    ctx.restore();
  }

  function hud(ctx, t, D) {
    const x = 96, y = 104;
    txt(ctx, 'BTC / USD', x, y, { size: 44, w: 800, color: L.text, glow: 10, spacing: 2 });
    const w = measure(ctx, 'BTC / USD', 44, 800) + 9 * 2;
    txt(ctx, dateStr(Math.max(0, D)), x + w + 30, y, { size: 25, w: 700, fam: L.mono, color: L.accent2, glow: 8, spacing: 2 });
    // the live price and its change on the day, on the same line, right side
    const L0 = live(t), col = L0.up ? UP : DOWN;
    const pct = `${L0.up ? '▲' : '▼'} ${Math.abs((L0.p / L0.o - 1) * 100).toFixed(2)}%`;
    const xr = W - 96, pw = measure(ctx, fmt(L0.p), 44, 800, L.mono);
    txt(ctx, fmt(L0.p), xr, y, { size: 44, w: 800, fam: L.mono, color: '#FFFFFF', align: 'right', glow: 10 }); // price on the right
    txt(ctx, pct, xr - pw - 24, y, { size: 21, w: 800, fam: L.mono, color: col, align: 'right', glow: 8 }); // the day's change, left of it
  }

  // light glowing dust: specks of light drifting through the beam
  function dust(ctx, t) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 120; i++) {
      const sp = 6 + H_(i, 3) * 22;
      const x = ((H_(i, 1) * W + t * sp * (H_(i, 4) - 0.5) * 2 + U.noise1(t * 0.3, i) * 40) % W + W) % W;
      const y = ((H_(i, 2) * H - t * sp * 0.6 + U.noise1(t * 0.25, i + 99) * 30) % H + H) % H;
      const r = 0.6 + H_(i, 5) * 1.8;
      ctx.globalAlpha = (0.10 + H_(i, 6) * 0.30) * (0.55 + 0.45 * Math.sin(t * (1 + H_(i, 7) * 3) + i));
      ctx.fillStyle = H_(i, 8) < 0.3 ? L.accent2 : '#FFFFFF';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  function scanlines(ctx, t) {
    if (!SCAN) { SCAN = G.makeCanvas(4, 4); const s = SCAN.getContext('2d'); s.fillStyle = '#000'; s.fillRect(0, 0, 4, 2); }
    ctx.save(); ctx.globalAlpha = L.scan * 3; ctx.fillStyle = ctx.createPattern(SCAN, 'repeat'); ctx.fillRect(0, 0, W, H);
    // a slow bright band rolling down the screen
    const y = ((t * 140) % (H + 300)) - 150;
    const g = ctx.createLinearGradient(0, y - 80, 0, y + 80); g.addColorStop(0, rgba(L.accent, 0)); g.addColorStop(0.5, rgba(L.accent, 0.035)); g.addColorStop(1, rgba(L.accent, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, y - 80, W, 160);
    ctx.restore();
  }

  function titles(ctx, t) {
    if (t < ev.start + 1.2) {
      const a = 1 - clamp((t - ev.start - 0.3) / 0.9);
      const k = ease.outCubic(clamp(t / 0.6));
      const flick = t < 0.5 ? (H_(Math.floor(t * 24), 3) > 0.4 ? 1 : 0.3) : 1; // neon tube flickering on
      ctx.save(); ctx.globalAlpha = a * flick;
      txt(ctx, 'BITCOIN', W / 2, H / 2 - 10, { size: 150, w: 400, fam: L.title, color: L.accent, align: 'center', glow: 40, spacing: 12 * k });
      txt(ctx, `${Y_START}  →  ${Y_END}`, W / 2, H / 2 + 80, { size: 56, w: 700, fam: L.mono, color: L.text, align: 'center', glow: 12, spacing: 6 });
      ctx.restore();
    }
    if (t > ZOOM1 - 0.6) {
      const a = clamp((t - (ZOOM1 - 0.6)) / 0.6);
      const p0 = DAYS[0][0], p1 = DAYS[NDAYS - 1][3];
      const mult = p1 / p0, gain = mult >= 100 ? `×${Math.round(mult).toLocaleString('en-US')}` : `+${Math.round((mult - 1) * 100)}%`;
      ctx.save(); ctx.globalAlpha = a;
      panel(ctx, 880, 700, 760, 200, L.accent, { fill: 'rgba(2,6,12,0.88)', corner: 22, glow: 20 });
      txt(ctx, `${Y_START}  →  ${Y_END}`, 1260, 778, { size: 52, w: 800, color: L.text, align: 'center', glow: 10, spacing: 3 });
      txt(ctx, `${fmt(p0)}  →  ${fmt(p1)}   (${gain})`, 1260, 856, { size: 40, w: 800, fam: L.mono, color: UP, align: 'center', glow: 16 });
      ctx.restore();
    }
  }

  Studio.film({
    draw(ctx, t) {
      const cam = camera(t);
      const D = S.dayAt(Math.min(t, ev.end));
      let shake = 0, flash = 0, fcol = UP;
      for (const h of [...EVENTS.filter((e) => e.kind !== 'info'), { t: ev.end, kind: 'up', big: true, hit: 1 }]) {
        const a = t - h.t;
        const k = h.hit ? 1 : 0.45; // the smaller moments flash and shake less
        if (a >= 0 && a < 0.8) { const e = Math.exp(-a * 7) * k; if (e > flash) { flash = e; fcol = h.kind === 'down' ? DOWN : UP; } shake = Math.max(shake, (h.big ? 16 : h.kind === 'down' ? 11 : 7) * k * Math.exp(-a * 6)); }
      }
      const mood = t < ev.end ? S.moodAt(D) : { up: 0, down: 0 };
      const rumble = 4.5 * mood.down; // the screen trembles more and more as a crash comes
      background(ctx, t, cam, D);
      ctx.save();
      ctx.translate(U.noise1(t * 30, 1) * shake + U.noise1(t * 17, 5) * rumble, U.noise1(t * 30, 2) * shake + U.noise1(t * 17, 6) * rumble);
      const X = (d) => d * cam.ppd - cam.off;
      const Y = (p) => Y1 - ((Math.log(p) - cam.lo) / (cam.hi - cam.lo)) * (Y1 - Y0);
      grid(ctx, cam, X, Y);
      const bw = Math.max(1, cam.ppd * 0.62);
      const i0 = Math.max(0, Math.floor(cam.off / cam.ppd) - 1), i1 = Math.min(NDAYS - 1, Math.floor(D));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, PLOT_R, H); ctx.clip();
      for (let i = i0; i <= i1; i++) {
        const x = X(i + 0.5);
        if (x > PLOT_R + 10) break;
        const c = S.candleAt(i, Math.min(t, ev.end));
        if (c) candle(ctx, i, c, x, Y, bw, !c.done, t);
      }
      labels(ctx, t, X, Y, cam);
      ctx.restore();
      glowLine(ctx, [[PLOT_R + 0.5, Y0 - 60], [PLOT_R + 0.5, Y1 + 8]], rgba(L.accent, 0.5), 1.2, 8);
      priceLine(ctx, t, cam, Y, X);
      ctx.restore();
      hud(ctx, t, D);
      if (mood.up > 0.01) { // a rally lights the screen up from the edges
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, W * 0.8);
        g.addColorStop(0, rgba(UP, 0.03 * mood.up)); g.addColorStop(1, rgba(UP, 0.16 * mood.up));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
      if (mood.down > 0.01) { // a crash darkens the edges, red creeping in
        ctx.save();
        const g = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, W * 0.75);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(40,0,10,${0.45 * mood.down})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
      if (flash > 0.01) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.75);
        g.addColorStop(0, rgba(fcol, 0.12 * flash)); g.addColorStop(1, rgba(fcol, 0.45 * flash));
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
      }
      titles(ctx, t);
      dust(ctx, t);
      scanlines(ctx, t);
    },
    async init() { LOGO = await Studio.loadImage('assets/bitcoin-logo-negative.png'); },
    post: { paper: 0, vignette: 0.5, grain: 0.035, bloom: 1.1 },
    fadeOut: 1.2,
  });
})();
