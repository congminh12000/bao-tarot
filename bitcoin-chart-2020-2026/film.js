// THE FILM — draws frame t. Everything is a pure function of t (no state), so any frame
// can be rendered in any order by any worker, and it always lines up with song.js.
(function () {
  const U = globalThis.U, G = globalThis.G, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, DAYS, NDAYS, hits, EVENTS } = S;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H;
  const FAM = 'Patrick Hand'; // hand lettering with every Vietnamese diacritic
  const UP = '#3DDC84', DOWN = '#FF4A5C', INK = '#E9E4D8', DIM = '#2A2A30', BG = '#07070A';

  // ---------- layout ----------
  const PLOT_R = 1660; // the price axis column starts here
  const HEAD_X = 1390; // where the live candle sits once the camera follows
  const Y0 = 190, Y1 = 935; // plot top / bottom
  const PPD = 9.5; // pixels per day while following
  const LEFT = 70;

  const fmt = (p) => '$' + Math.round(p).toLocaleString('en-US');
  const yearOf = (d) => S.dateOf(clamp(d, 0, NDAYS - 1)).getUTCFullYear();
  const pad2 = (x) => String(x).padStart(2, '0');
  const dateStr = (d) => { const x = S.dateOf(clamp(d, 0, NDAYS - 1)); return `${pad2(x.getUTCDate())}/${pad2(x.getUTCMonth() + 1)}/${x.getUTCFullYear()}`; };

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
    lo -= r * 0.1; hi += r * 0.14;
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

  // ---------- drawing ----------
  const H_ = U.hash;
  const jit = (seed, i, amp) => G.jit(seed, i, amp);

  function grid(ctx, cam, X, Y, t) {
    // price lines at round numbers
    const pLo = Math.exp(cam.lo), pHi = Math.exp(cam.hi);
    const span = pHi - pLo, raw = span / 6, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw);
    const levels = [];
    if (cam.k > 0.5) { for (const p of [5000, 10000, 20000, 50000, 100000]) if (p > pLo && p < pHi) levels.push(p); }
    else for (let p = Math.ceil(pLo / step) * step; p < pHi; p += step) levels.push(p);
    for (const p of levels) {
      const y = Y(p);
      if (y < Y0 - 30 || y > Y1 + 10) continue;
      G.line(ctx, [[0, y], [PLOT_R, y]], { color: DIM, lw: 1.6, seed: Math.round(p / 10) % 997, amp: 1.2, step: 120 });
      G.text(ctx, fmt(p), PLOT_R + 22, y + 10, { size: 30, fam: FAM, weight: 400, color: '#8C887E', boil: 0.5 });
    }
    // months and years
    const d0 = Math.floor(cam.off / cam.ppd) - 31, d1 = Math.ceil((PLOT_R + cam.off) / cam.ppd) + 31;
    const s0 = S.dateOf(0);
    for (let mo = 0; mo < 7 * 12; mo++) {
      const dt = Date.UTC(s0.getUTCFullYear(), mo, 1);
      const d = Math.round((dt - s0.getTime()) / 86400000);
      if (d < d0 || d > d1) continue;
      const x = X(d);
      if (x < 0 || x > PLOT_R) continue;
      const jan = mo % 12 === 0;
      if (jan || cam.k < 0.5) G.line(ctx, [[x, Y0 - 40], [x, Y1 + 8]], { color: jan ? '#3A3A42' : '#1A1A1F', lw: jan ? 2.2 : 1.3, seed: mo + 50, amp: 1.2, step: 120 });
      if (jan) G.text(ctx, String(2020 + mo / 12), x + 10, Y1 + 50, { size: 38, fam: FAM, weight: 400, color: INK, boil: 0.6 });
      else if (cam.k < 0.3) G.text(ctx, 'Th' + ((mo % 12) + 1), x + 6, Y1 + 42, { size: 24, fam: FAM, weight: 400, color: '#6E6A62', boil: 0.5, alpha: 1 - cam.k / 0.3 });
    }
  }

  function candle(ctx, i, c, x, Y, bw, live) {
    const up = c.c >= c.o, col = up ? UP : DOWN;
    const yh = Y(c.h), yl = Y(c.l), yo = Y(c.o), yc = Y(c.c);
    const top = Math.min(yo, yc), bot = Math.max(Math.max(yo, yc), top + 1.5);
    ctx.strokeStyle = col; ctx.lineCap = 'round';
    // wick: one pencil stroke
    const j = jit(i * 7 + 1, 1, 0.8);
    ctx.lineWidth = bw > 3 ? 1.7 : Math.max(1, bw * 0.9);
    ctx.beginPath(); ctx.moveTo(x + j[0], yh); ctx.lineTo(x - j[0] * 0.5, yl); ctx.stroke();
    if (bw <= 2.2) { // zoomed out: the whole candle is a pencil tick
      ctx.lineWidth = Math.max(1, bw); ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); return;
    }
    // body: a wobbly box, filled, outlined twice like a quick sketch
    const a = jit(i, 2, 0.9), b = jit(i, 3, 0.9), cc = jit(i, 4, 0.9), d = jit(i, 5, 0.9);
    const hw = bw / 2;
    ctx.beginPath();
    ctx.moveTo(x - hw + a[0], top + a[1] * 0.5); ctx.lineTo(x + hw + b[0], top + b[1] * 0.5);
    ctx.lineTo(x + hw + cc[0], bot + cc[1] * 0.5); ctx.lineTo(x - hw + d[0], bot + d[1] * 0.5); ctx.closePath();
    ctx.globalAlpha = up ? 0.85 : 0.9; ctx.fillStyle = col; ctx.fill();
    ctx.globalAlpha = 1; ctx.lineWidth = 1.4; ctx.strokeStyle = G.tint(col, 0.35); ctx.stroke();
    if (bot - top > 14) { // hatching inside tall bodies
      ctx.save(); ctx.clip(); ctx.strokeStyle = G.tint(col, -0.35); ctx.lineWidth = 1.1; ctx.globalAlpha = 0.55;
      ctx.beginPath();
      for (let y = top - bw; y < bot; y += 6) { ctx.moveTo(x - hw - 1, y + bw); ctx.lineTo(x + hw + 1, y); }
      ctx.stroke(); ctx.restore();
    }
    if (live) {
      const g = ctx.createRadialGradient(x, yc, 0, x, yc, 60);
      g.addColorStop(0, up ? 'rgba(61,220,132,0.45)' : 'rgba(255,74,92,0.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - 60, yc - 60, 120, 120); ctx.restore();
    }
  }

  function labels(ctx, t, X, Y, cam) {
    const fade = 1 - clamp(cam.k * 3);
    if (fade <= 0) return;
    EVENTS.forEach((e, n) => {
      const age = t - e.t;
      if (age < 0) return;
      const x = X(e.day + 0.5);
      if (x < -300 || x > PLOT_R + 50) return;
      const alpha = fade * clamp(1 - (age - 7) / 1.5);
      if (alpha <= 0) return;
      const pop = ease.outBack(clamp(age / 0.3), 2.2);
      const up = e.kind !== 'down';
      const size = e.big ? 60 : e.hit ? 44 : 32;
      const ay = Y(e.price) + (up ? -12 : 12);
      let dy = (e.hit ? 120 : 165) + (n % 2) * 30;
      let ty = up ? ay - dy : ay + dy;
      if (ty < Y0 - 40) ty = Y0 - 40;
      if (ty > Y1 - 10) ty = Y1 - 10;
      const tw = G.measure(ctx, e.text, size, FAM, 400);
      const tx = clamp(x - tw / 2, 20, PLOT_R - tw - 30);
      const col = e.kind === 'down' ? DOWN : e.kind === 'up' ? UP : '#F2C14E';
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, ay); ctx.scale(pop, pop); ctx.translate(-x, -ay);
      // the arrow from the note to the wick
      const by = up ? ty + 16 : ty - size - 6;
      G.line(ctx, [[x + (tx + tw / 2 - x) * 0.6, by], [x, ay]], { color: col, lw: 3, seed: 300 + n, amp: 1.6, step: 18 });
      const ang = Math.atan2(ay - by, x - (x + (tx + tw / 2 - x) * 0.6));
      for (const s of [-0.5, 0.5]) G.line(ctx, [[x, ay], [x - Math.cos(ang + s) * 16, ay - Math.sin(ang + s) * 16]], { color: col, lw: 3, seed: 310 + n, amp: 1 });
      G.rrect(ctx, tx - 14, ty - size * 0.95, tw + 28, size * 1.25, 10, { fill: 'rgba(10,10,12,0.88)', stroke: col, lw: e.hit ? 3 : 2, seed: 400 + n });
      G.text(ctx, e.text, tx, ty, { size, fam: FAM, weight: 400, color: e.hit ? col : INK, boil: 0.7 });
      ctx.restore();
    });
  }

  function bubble(ctx, t, cam, Y, X) {
    const tt = Math.min(t, ev.end);
    const D = S.dayAt(tt);
    const i = Math.min(NDAYS - 1, Math.max(0, Math.floor(D)));
    const c = D >= NDAYS ? { o: DAYS[i][0], c: DAYS[i][3] } : S.candleAt(i, tt) || { o: DAYS[0][0], c: DAYS[0][0] };
    const p = D < 0 ? DAYS[0][0] : c.c;
    const up = c.c >= c.o, col = up ? UP : DOWN;
    const y = clamp(Y(p), Y0 - 20, Y1);
    const hx = X(Math.max(0, D));
    // dashed price line from the live candle to the bubble
    ctx.save();
    ctx.setLineDash([10, 9]); ctx.lineDashOffset = -t * 30;
    ctx.globalAlpha = 0.75 * (1 - cam.k);
    G.line(ctx, [[hx + 8, y], [PLOT_R + 6, y]], { color: col, lw: 2, seed: 77, amp: 0.8, step: 60 });
    ctx.restore();
    const txt = fmt(p), size = 40;
    const tw = G.measure(ctx, txt, size, FAM, 400);
    const bx = PLOT_R + 14, bw = Math.max(tw + 34, 200), bh = 62;
    G.poly(ctx, [[bx - 18, y], [bx, y - bh / 2], [bx + bw, y - bh / 2], [bx + bw, y + bh / 2], [bx, y + bh / 2]], { fill: col, stroke: G.tint(col, 0.5), lw: 3, seed: 91, hatch: false });
    G.text(ctx, txt, bx + bw / 2, y + 14, { size, fam: FAM, weight: 400, color: '#08080A', align: 'center', boil: 0.5 });
    return { p, up, col, hx, y };
  }

  function hud(ctx, t, D) {
    G.text(ctx, 'BTC / USD', 96, 92, { size: 56, fam: FAM, weight: 400, color: INK });
    G.text(ctx, '· 1D', 330, 92, { size: 40, fam: FAM, weight: 400, color: '#F2A93B' });
    G.text(ctx, D < 0 ? '01/01/2020' : dateStr(D), 96, 142, { size: 36, fam: FAM, weight: 400, color: '#A9A49A' });
  }

  function watermark(ctx, D) {
    const y = yearOf(Math.max(0, D));
    G.text(ctx, String(y), (PLOT_R) / 2, H / 2 + 120, { size: 360, fam: FAM, weight: 400, color: '#111116', align: 'center', boil: 0.3 });
  }

  // light floating dust, hairs and specks: the old-film overlay
  function dust(ctx, t) {
    ctx.save();
    for (let i = 0; i < 110; i++) {
      const sp = 6 + H_(i, 3) * 22;
      const x = ((H_(i, 1) * W + t * sp * (H_(i, 4) - 0.5) * 2 + U.noise1(t * 0.3, i) * 40) % W + W) % W;
      const y = ((H_(i, 2) * H - t * sp * 0.6 + U.noise1(t * 0.25, i + 99) * 30) % H + H) % H;
      const r = 0.8 + H_(i, 5) * 2.2;
      ctx.globalAlpha = (0.12 + H_(i, 6) * 0.25) * (0.6 + 0.4 * Math.sin(t * (1 + H_(i, 7) * 3) + i));
      ctx.fillStyle = '#E8E0CC';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    // a few specks and hairs that flash for one drawing (12 fps "on twos")
    const b = G.boil;
    for (let k = 0; k < 3; k++) {
      if (H_(b, k, 11) > 0.35) continue;
      const x = H_(b, k, 12) * W, y = H_(b, k, 13) * H, L = 20 + H_(b, k, 14) * 60, a = H_(b, k, 15) * Math.PI;
      ctx.globalAlpha = 0.18 + H_(b, k, 16) * 0.2; ctx.strokeStyle = '#DDD5C2'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 12, y + Math.sin(a) * L * 0.5 - 10, x + Math.cos(a) * L, y + Math.sin(a) * L); ctx.stroke();
    }
    if (H_(b, 21) < 0.25) { ctx.globalAlpha = 0.08; ctx.fillStyle = '#EDE6D6'; ctx.fillRect(H_(b, 22) * W, 0, 1.5, H); } // a vertical film scratch
    ctx.restore();
  }

  function titles(ctx, t) {
    // intro: written in before the first candle
    if (t < ev.start + 1.2) {
      const a = 1 - clamp((t - ev.start - 0.3) / 0.9);
      const k = ease.outBack(clamp(t / 0.6), 1.6);
      ctx.save(); ctx.globalAlpha = a;
      ctx.translate(W / 2, H / 2 - 40); ctx.scale(k, k); ctx.translate(-W / 2, -(H / 2 - 40));
      G.text(ctx, 'BITCOIN', W / 2, H / 2 - 20, { size: 170, fam: FAM, weight: 400, color: '#F2A93B', align: 'center', stroke: '#07070A', strokeW: 12 });
      G.text(ctx, '2020  →  2026', W / 2, H / 2 + 80, { size: 70, fam: FAM, weight: 400, color: INK, align: 'center', stroke: '#07070A', strokeW: 10 });
      ctx.restore();
    }
    // outro: the six years in one line
    if (t > ZOOM1 - 0.6) {
      const a = clamp((t - (ZOOM1 - 0.6)) / 0.6);
      const p0 = DAYS[0][0], p1 = DAYS[NDAYS - 1][3];
      const pct = Math.round((p1 / p0 - 1) * 100);
      ctx.save(); ctx.globalAlpha = a;
      G.rrect(ctx, 880, 700, 760, 200, 18, { fill: 'rgba(8,8,10,0.92)', stroke: '#F2A93B', lw: 3, seed: 5 });
      G.text(ctx, '2020  →  2026', 1260, 775, { size: 64, fam: FAM, weight: 400, color: INK, align: 'center' });
      G.text(ctx, `${fmt(p0)}  →  ${fmt(p1)}   (+${pct}%)`, 1260, 860, { size: 52, fam: FAM, weight: 400, color: UP, align: 'center' });
      ctx.restore();
    }
  }

  Studio.film({
    draw(ctx, t) {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const cam = camera(t);
      const D = S.dayAt(Math.min(t, ev.end));
      // a hit = a kick of the camera and a flash of the move's colour
      let shake = 0, flash = 0, fcol = UP;
      for (const h of [...hits, { t: ev.end, kind: 'up', big: true }]) {
        const a = t - h.t;
        if (a >= 0 && a < 0.8) { const e = Math.exp(-a * 7); if (e > flash) { flash = e; fcol = h.kind === 'down' ? DOWN : UP; } shake = Math.max(shake, (h.big ? 16 : 10) * Math.exp(-a * 6)); }
      }
      ctx.save();
      ctx.translate(U.noise1(t * 30, 1) * shake, U.noise1(t * 30, 2) * shake);
      const X = (d) => d * cam.ppd - cam.off;
      const Y = (p) => Y1 - ((Math.log(p) - cam.lo) / (cam.hi - cam.lo)) * (Y1 - Y0);
      watermark(ctx, D);
      grid(ctx, cam, X, Y, t);
      // the candles
      const bw = Math.max(1, cam.ppd * 0.66);
      const i0 = Math.max(0, Math.floor(cam.off / cam.ppd) - 1), i1 = Math.min(NDAYS - 1, Math.floor(D));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, PLOT_R, H); ctx.clip();
      for (let i = i0; i <= i1; i++) {
        const x = X(i + 0.5);
        if (x > PLOT_R + 10) break;
        const c = S.candleAt(i, Math.min(t, ev.end));
        if (c) candle(ctx, i, c, x, Y, bw, !c.done);
      }
      labels(ctx, t, X, Y, cam);
      ctx.restore();
      // the price axis column
      ctx.fillStyle = 'rgba(7,7,10,0.0)';
      G.line(ctx, [[PLOT_R, Y0 - 60], [PLOT_R, Y1 + 10]], { color: '#3A3A42', lw: 2, seed: 3, step: 80 });
      bubble(ctx, t, cam, Y, X);
      ctx.restore();
      hud(ctx, t, D);
      if (flash > 0.01) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = flash * 0.32; ctx.fillStyle = fcol; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      titles(ctx, t);
      dust(ctx, t);
    },
    post: { paper: 0, vignette: 0.45, grain: 0.07 },
    fadeOut: 1.2,
  });
})();
