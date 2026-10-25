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
  const PPD = 16.06; // pixels per day while following (zoomed in 30% twice)
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
    lo -= r * 0.26; hi += r * 0.2; // headroom for the event labels, above and below
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
  const sizeOf = (e) => (e.big ? 34 : 22); // hit 2 (milestone / crisis) ~50% bigger than hit 1
  const CAMS = new Map();
  const camAt = (t) => { const key = Math.round(t * 1000); if (CAMS.has(key)) return CAMS.get(key); const c = camera(t); return { X: (d) => d * c.ppd - c.off, Y: (p) => Y1 - ((Math.log(p) - c.lo) / (c.hi - c.lo)) * (Y1 - Y0), c }; }; // eslint-disable-line
  const camAtM = (t) => { const key = Math.round(t * 1000); let v = CAMS.get(key); if (!v) { v = camAt(t); CAMS.set(key, v); } return v; };
  // A label lives as long as it is on screen (it fades only as it scrolls out on the left), so it must keep clear of
  // every other label for that whole time. Samples run on a shared 0.4 s grid (the camera cache is reused).
  const GRID = 0.4, GAPX = 28, GAPY = 22, FAR = [-1e9, -1e9, -1e9, -1e9], GONE = [FAR, FAR];
  const gridFrom = (t) => Math.ceil(t / GRID - 1e-9) * GRID;
  const gone = (K, o, off, bw) => K.X(o.day + 0.5) + off + bw < -10; // the box has left the frame
  // a label's footprint at a camera: [its box, the strip its line runs through]
  const footprint = (K, o, P, gap) => {
    const ox = K.X(o.day + 0.5), oy = K.Y(P.ref) + gap, oay = K.Y(o.price), bx0 = ox + P.off;
    const box = [bx0, oy - P.h / 2, bx0 + P.bw, oy + P.h / 2];
    const lx0 = P.dir < 0 ? ox - DIAG - 4 : ox - 4, lx1 = P.dir > 0 ? ox + DIAG + 4 : ox + 4;
    return [box, [lx0, Math.min(oay, oy), lx1, Math.max(oay, oy)]];
  };
  function exitTime(o, P) { // when this label has scrolled out of the frame
    for (let ts = gridFrom(o.t); ts < DUR_END; ts += GRID) if (gone(camAtM(ts), o, P.off, P.bw)) return ts;
    return DUR_END;
  }
  const DUR_END = S.DURATION;

  function placeLabel(n) {
    if (PLACE[n]) return PLACE[n];
    const e = EVENTS[n], up = e.kind !== 'down', size = sizeOf(e), h = size * 1.3;
    const s = e.text.toUpperCase(), tw = measure(MEASURE, s, size, 800);
    const { X, Y, c } = camAt(e.t);
    const x = X(e.day + 0.5), ay = Y(e.price) + (up ? -8 : 8);
    const bw = tw + PAD * 2;
    const RLIM = W - 24;
    // Candidate spots, best first. The eye follows the price to the right, so: RIGHT of the candle (a callout), or
    // CENTRED over it (a straight line), then further right with a longer callout, then LEFT of the candle; each on
    // the label's own side (up events above the candles, down events below), stepping away from the candles. Only
    // when none of those is clear does it go to the other side, to the upper / lower LEFT. No label is ever dropped.
    const shapes = [[1, 0], [0, 0], [1, 110], [1, 220], [1, 330], [-1, 0], [-1, 110], [-1, 220]];
    // a spot: the box's left edge `off` from the anchor, above or below the candles under the callout and the box
    // (including the ones still to come), starting at the shortest line the shape allows
    const spot = (dir, off, above, extra = 0) => {
      const x0 = Math.min(x, x + off) - 6, x1 = Math.max(x, x + off + bw) + 6;
      const dA = Math.max(0, Math.floor((x0 + c.off) / c.ppd - 1)), dB = Math.min(NDAYS - 1, Math.ceil((x1 + c.off) / c.ppd));
      let ref = above ? 0 : Infinity;
      for (let d = dA; d <= dB; d++) ref = above ? Math.max(ref, DAYS[d][1]) : Math.min(ref, DAYS[d][2]);
      const min = dir ? 44 : 34 + h / 2;
      const base = above ? Math.min(Y(ref) - 22 - h / 2, ay - min) : Math.max(Y(ref) + 22 + h / 2, ay + min);
      return { dir, off, ref, base, above, extra, len: Math.abs(base - ay) };
    };
    const cand = [];
    for (const above of [up, !up]) {
      for (const [dir, extra] of shapes) {
        if (above !== up && dir > 0) continue; // the other side: left or centred only
        let off = dir > 0 ? DIAG + RUN + extra : dir < 0 ? -(DIAG + RUN + extra + bw) : -bw / 2; // box left edge vs the anchor
        if (dir > 0 && x + off + bw > RLIM) continue;
        if (dir === 0 && x + off + bw > RLIM) off = RLIM - bw - x; // slide left just enough
        if (dir < 0 && x + off < 8) continue;
        cand.push(spot(dir, off, above, extra));
      }
    }
    // a callout whose line would get long gives its place to the straight line
    const r0 = cand.find((q) => q.dir > 0 && !q.extra && q.above === up), st = cand.find((q) => !q.dir && q.above === up);
    if (r0 && st && r0.len > 110 && st.len < r0.len) { cand.splice(cand.indexOf(st), 1); cand.splice(cand.indexOf(r0), 0, st); }

    // what else is on screen while this label is: earlier labels until they scroll out, and the spot each important
    // label still to come will want (its line and box right under / over its candle)
    const others = [];
    for (let m = 0; m < n; m++) { const o = EVENTS[m]; if (o.t <= e.t && placeLabel(m).exit > e.t) others.push(m); }
    const coming = EVENTS.map((o, m) => ({ o, m })).filter(({ o, m }) => m > n && o.hit > 0 && o.t > e.t && o.t < e.t + 20)
      .map(({ o }) => ({ o, h: sizeOf(o) * 1.3, bw: measure(MEASURE, o.text.toUpperCase(), sizeOf(o), 800) + PAD * 2, up: o.kind !== 'down' }));
    const samples = [];
    for (let ts = gridFrom(e.t); ts < DUR_END; ts += GRID) {
      const K = camAtM(ts);
      if (K.X(e.day + 0.5) + 600 < 0) break; // even the widest spot has left the frame
      const rects = others.map((m) => { const P = placeLabel(m); return ts < P.exit ? footprint(K, EVENTS[m], P, P.gap) : GONE; });
      for (const r of coming) {
        if (ts < r.o.t) continue;
        const ax = K.X(r.o.day + 0.5), a2 = K.Y(r.o.price) + (r.up ? -8 : 8), reach = 44 + r.h + 6;
        rects.push([[ax - 10, r.up ? a2 - reach : a2, ax + DIAG + RUN + r.bw + 10, r.up ? a2 : a2 + reach], FAR]);
      }
      samples.push({ K, rects });
    }
    const hits = (a, q, gx, gy) => a[0] < q[2] + gx && a[2] > q[0] - gx && a[1] < q[3] + gy && a[3] > q[1] - gy;
    const clash = (q, my) => samples.some(({ K, rects }) => {
      if (gone(K, e, q.off, bw)) return false;
      const [box, line] = footprint(K, e, { ...q, h, bw }, my - Y(q.ref));
      return rects.some(([ob, ol]) => hits(box, ob, GAPX, GAPY) || hits(line, ob, 2, 4) || hits(box, ol, 6, 4));
    });
    const inside = (q, my) => (q.above ? my - h / 2 >= (x + q.off > 700 ? 112 : Y0 - 10) : my + h / 2 <= H - 4);
    const step = h + GAPY;
    // own side: every shape at the first level before stepping a level further from the candles (left beats deep)
    let pick = null, fallback = null;
    const own = cand.filter((q) => q.above === up), other = cand.filter((q) => q.above !== up);
    for (let k = 0; k < 8 && !pick; k++) for (const q of own) {
      const my = q.base + (q.above ? -1 : 1) * k * step;
      if (!inside(q, my)) continue;
      if (!fallback) fallback = { q, my };
      if (!clash(q, my)) { pick = { q, my }; break; }
    }
    for (let k = 0; k < 8 && !pick; k++) for (const q of other) {
      const my = q.base + (q.above ? -1 : 1) * k * step;
      if (inside(q, my) && !clash(q, my)) { pick = { q, my }; break; }
    }
    // still nothing: search every free spot on the screen (any callout length, centred or either side, every level)
    for (const above of [up, !up]) {
      if (pick) break;
      const offs = [];
      for (let o = DIAG + RUN; x + o + bw <= RLIM; o += 40) offs.push([1, o]);
      for (let o = -bw + 12; o <= -12; o += 40) offs.push([0, o]);
      for (let o = -(DIAG + RUN + bw); x + o >= 8; o -= 40) offs.push([-1, o]);
      for (let k = 0; k < 40 && !pick; k++) {
        let any = false;
        for (const [dir, off] of offs) {
          const q = spot(dir, off, above), my = q.base + (above ? -1 : 1) * k * (h / 2 + 4);
          if (!inside(q, my)) continue;
          any = true;
          if (!clash(q, my)) { pick = { q, my }; break; }
        }
        if (!any) break;
      }
    }
    // the screen is truly full: take the first spot and let the labels in its way fade out just before this one
    // appears (an earlier label leaves early rather than two labels ever overlapping)
    let cut = [];
    if (!pick) {
      pick = fallback || { q: cand[0], my: cand[0].base };
      const q = pick.q;
      cut = others.filter((m, i) => samples.some(({ K, rects }) => {
        if (gone(K, e, q.off, bw)) return false;
        const [box, line] = footprint(K, e, { ...q, h, bw }, pick.my - Y(q.ref)), [ob, ol] = rects[i];
        return hits(box, ob, GAPX, GAPY) || hits(line, ob, 2, 4) || hits(box, ol, 6, 4);
      }));
      for (const m of cut) { PLACE[m].exit = e.t; PLACE[m].cut = e.t; }
    }
    const { q: ch, my: mid } = pick;
    const P = { s, tw, bw, h, size, up, above: ch.above, off: ch.off, dir: ch.dir, ref: ch.ref, gap: mid - Y(ch.ref), forced: cut.length > 0 };
    P.exit = exitTime(e, P);
    return (PLACE[n] = P);
  }

  // labels that only fit by making earlier labels leave early: SCORE_DEBUG.crowded() in the browser console
  // and an independent check, as drawn: every `step` s, any two label boxes touching (or a box over another's line)
  globalThis.SCORE_DEBUG = {
    crowded: () => EVENTS.map((e, n) => ({ e, P: placeLabel(n) })).filter((x) => x.P.forced).map((x) => `${x.e.date} ${x.e.text}`),
    overlaps(step = 0.2) {
      const out = [], meet = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
      for (let t = 0; t < ev.end + 2; t += step) {
        const K = camAt(t), on = [];
        EVENTS.forEach((e, n) => {
          const P = placeLabel(n);
          if (t < e.t + 0.25 || (P.cut && t >= P.cut)) return;
          const bx = K.X(e.day + 0.5) + P.off;
          if (bx > W + 50 || bx + P.bw < -20) return;
          on.push({ e, f: footprint(K, e, P, P.gap) });
        });
        for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) {
          const [a, al] = on[i].f, [b, bl] = on[j].f;
          if (meet(a, b) || meet(a, bl) || meet(b, al)) out.push(`${t.toFixed(1)}s ${on[i].e.date} ${on[i].e.text} x ${on[j].e.date} ${on[j].e.text}`);
        }
      }
      return out;
    },
  };

  function labels(ctx, t, X, Y, cam) {
    const fade = 1 - clamp(cam.k * 3);
    if (fade <= 0) return;
    EVENTS.forEach((e, n) => {
      const age = t - e.t;
      if (age < 0) return;
      const P = placeLabel(n);
      const x = X(e.day + 0.5), bx = x + P.off;
      if (bx > W + 50 || bx + P.bw < -20) return;
      // on screen = fully there; it fades only while it scrolls out past the left edge
      const alpha = fade * clamp((bx + P.bw + 10) / 160) * (P.cut ? clamp((P.cut - t) / 0.3) : 1);
      if (alpha <= 0) return;
      const ay = Y(e.price) + (P.up ? -8 : 8), my = clamp(Y(P.ref) + P.gap, 112 + P.h / 2, H - 8 - P.h / 2);
      const col = e.kind === 'down' ? DOWN : e.kind === 'up' ? UP : L.accent2;
      // the line, drawn out over 0.35 s: anchor -> diagonal -> horizontal -> box, or straight up/down into the box
      const k = ease.outCubic(clamp(age / 0.35));
      const pts = [[x, ay]];
      if (P.dir) {
        const B = [x + P.dir * DIAG, my], C = [P.dir > 0 ? bx : bx + P.bw, my];
        const l1 = Math.hypot(B[0] - x, B[1] - ay), l2 = Math.abs(C[0] - B[0]), L_ = (l1 + l2) * k;
        if (L_ <= l1) pts.push([lerp(x, B[0], L_ / l1), lerp(ay, B[1], L_ / l1)]);
        else pts.push(B, [lerp(B[0], C[0], (L_ - l1) / l2), my]);
      } else pts.push([x, lerp(ay, my + (my < ay ? P.h / 2 : -P.h / 2), k)]);
      const tier = e.big ? 2 : 0; // hit 1 = the quiet grey label, hit 2 = the bright pulsing one
      ctx.save(); ctx.globalAlpha = alpha;
      glowLine(ctx, pts, col, [1.3, 2.2, 3][tier], [6, 12, 18][tier]);
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, ay, 4, 0, Math.PI * 2); ctx.fill();
      if (age > 0.25) {
        const shown = P.s.slice(0, Math.ceil(P.s.length * clamp((age - 0.25) / 0.3)));
        // two looks: hit 1 = quiet grey box; hit 2 = coloured, tinted, bright pulsing glow (tier 1 is unused)
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
    // the live price, on the same line, right side
    const L0 = live(t);
    txt(ctx, fmt(L0.p), PLOT_R - 12, y, { size: 44, w: 800, fam: L.mono, color: '#FFFFFF', align: 'right', glow: 10 });
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

  // a hit-2 moment: two glowing rings race out from the candle, a light burst at its centre
  function shockwave(ctx, x, y, a, col) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [d, w] of [[0, 7], [0.14, 4]]) {
      const b = a - d;
      if (b <= 0 || b > 1.4) continue;
      const k = ease.outCubic(b / 1.4), fade = (1 - b / 1.4) ** 2;
      ctx.globalAlpha = fade; ctx.strokeStyle = col; ctx.lineWidth = w * (1 - k * 0.7); ctx.shadowColor = col; ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.arc(x, y, 20 + k * 1100, 0, Math.PI * 2); ctx.stroke();
    }
    const g = ctx.createRadialGradient(x, y, 0, x, y, 260);
    g.addColorStop(0, rgba(col, 0.55 * Math.exp(-a * 5))); g.addColorStop(1, rgba(col, 0));
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(x - 260, y - 260, 520, 520);
    ctx.restore();
  }

  Studio.film({
    draw(ctx, t) {
      const cam = camera(t);
      const D = S.dayAt(Math.min(t, ev.end));
      // only hit-2 events (and the last candle) hit the picture: a flash, a hard shake, a zoom punch, shockwave rings
      let shake = 0, flash = 0, fcol = UP, punch = 0;
      const booms = [];
      for (const h of [...S.hits, { t: ev.end, kind: 'up', end: true }]) {
        const a = t - h.t;
        if (a < 0 || a >= 1.6) continue;
        const e = Math.exp(-a * 4.5);
        if (e > flash) { flash = e; fcol = h.kind === 'down' ? DOWN : UP; }
        shake = Math.max(shake, (h.kind === 'down' ? 22 : 15) * Math.exp(-a * 5));
        punch = Math.max(punch, Math.exp(-a * 7));
        if (!h.end) booms.push({ h, a });
      }
      const mood = t < ev.end ? S.moodAt(D) : { up: 0, down: 0 };
      const rumble = 4.5 * mood.down; // the screen trembles more and more as a crash comes
      background(ctx, t, cam, D);
      ctx.save();
      ctx.translate(U.noise1(t * 30, 1) * shake + U.noise1(t * 17, 5) * rumble, U.noise1(t * 30, 2) * shake + U.noise1(t * 17, 6) * rumble);
      if (punch > 0.001) { const z = 1 + 0.045 * punch; ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2); }
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
      ctx.restore();
      glowLine(ctx, [[PLOT_R + 0.5, Y0 - 60], [PLOT_R + 0.5, Y1 + 8]], rgba(L.accent, 0.5), 1.2, 8);
      priceLine(ctx, t, cam, Y, X);
      labels(ctx, t, X, Y, cam); // on top of everything in the plot; may reach over the price axis
      for (const { h, a } of booms) shockwave(ctx, X(h.day + 0.5), Y(h.price), a, h.kind === 'down' ? DOWN : UP);
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
        g.addColorStop(0, rgba(fcol, 0.18 * flash)); g.addColorStop(1, rgba(fcol, 0.6 * flash));
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
