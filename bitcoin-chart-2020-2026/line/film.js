// Stateless scene: every worker can seek to any frame. Logical stage is 1080x1920.
(function () {
  const C = globalThis.CoinTrail, P = globalThis.SCORE.LINE, Studio = globalThis.Studio;
  const colors = P.coin.colors || {}, primary = colors.accent || '#F7931A', special = P.coin.special || '#00E5FF';
  let logo;
  const hash = (i) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const money = (v) => '$' + (v < 1 ? +v.toPrecision(4) : v.toLocaleString('en-US', { maximumFractionDigits: v < 100 ? 2 : 0 }));
  function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
  function text(ctx, value, x, y, size, color = '#F7F5EF', align = 'left') {
    ctx.font = `700 ${size}px Inter`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(value, x, y);
  }
  function captionLines(ctx, caption, diameter) {
    const size = diameter >= 240 ? 34 : diameter >= 190 ? 29 : 25;
    ctx.font = `700 ${size}px Inter`;
    const width = diameter * 0.73, words = caption.split(/\s+/), lines = []; let current = '';
    for (const word of words) {
      const next = (current + ' ' + word).trim();
      if (ctx.measureText(next).width <= width) current = next;
      else { if (current) lines.push(current); current = word; }
    }
    if (current) lines.push(current);
    if (lines.length > 3) { lines.length = 3; lines[2] += '…'; }
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      while (ctx.measureText(line).width > width && line.length > 1) line = line.replace(/…$/, '').slice(0, -1) + '…';
      lines[i] = line;
    }
    return { lines, size };
  }
  function drawBubble(ctx, e, f) {
    const p = C.screen({ x: e.cx, y: e.cy }, f), dt = f.t - e.t;
    const last = e === P.events.at(-1);
    if (p.x < -190 || p.x > 1090 || p.y < 500 || p.y > 1500 || dt > (last ? 1.05 : 0.9)) return;
    const fade = dt < 0 || last ? 1 : 1 - C.smooth((dt - 0.25) / 0.65);
    const color = e.tag ? special : primary, strength = e.turn ? 1 : [0.22, 0.5, 0.8][e.hit];
    const pulse = 0.5 + 0.5 * Math.sin(f.t * (2.1 + strength * 1.7) + e.x * 0.01), r = e.diameter / 2;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.shadowColor = color; ctx.shadowBlur = (14 + pulse * (8 + strength * 18)) * (globalThis.G.scale || 1);
    circle(ctx, p.x, p.y, r); ctx.fillStyle = '#10100DED'; ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 2 + strength * 2; ctx.stroke(); ctx.shadowBlur = 0;
    circle(ctx, p.x, p.y, r - 7); ctx.strokeStyle = color; ctx.globalAlpha = fade * 0.16; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = fade;
    const cap = captionLines(ctx, e.caption, e.diameter), lh = cap.size * 1.12;
    cap.lines.forEach((line, i) => text(ctx, line, p.x, p.y + (i - (cap.lines.length - 1) / 2) * lh, cap.size, '#FFF8DF', 'center'));
    ctx.restore();
    if (dt >= 0) {
      ctx.save();
      const life = C.clamp(dt / 0.8), waves = e.turn || e.hit === 2 ? 3 : 1;
      for (let j = 0; j < waves; j++) {
        ctx.globalAlpha = (1 - life) * (0.5 + strength * 0.4) / (j + 1);
        circle(ctx, p.x, p.y, r + life * (70 + strength * 140) + j * 18);
        ctx.strokeStyle = color; ctx.lineWidth = 3 - j * 0.5; ctx.stroke();
      }
      const n = e.turn ? 24 : [5, 11, 18][e.hit];
      for (let i = 0; i < n; i++) {
        const angle = hash(i + e.x) * Math.PI * 2, rr = r + life * (45 + hash(i + 8) * 150);
        ctx.globalAlpha = (1 - life) * 0.8; ctx.fillStyle = color;
        circle(ctx, p.x + Math.cos(angle) * rr, p.y + Math.sin(angle) * rr, 1.5 + strength * 2); ctx.fill();
      }
      ctx.restore();
    }
  }
  function draw(ctx, t) {
    const f = C.frame(P, t), head = C.screen(f.head, f);
    const bg = ctx.createRadialGradient(500, 900, 0, 500, 900, 1300);
    bg.addColorStop(0, colors.bg1 || '#1A1408'); bg.addColorStop(1, colors.bg0 || '#070502');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 65; i++) {
      ctx.globalAlpha = 0.08 + hash(i + 10) * 0.16; ctx.fillStyle = primary;
      circle(ctx, (hash(i) * 1080 - f.camera.x * 0.018 % 1080 + 1080) % 1080,
        (hash(i + 99) * 1920 + Math.sin(t * 0.2 + i) * 12 + 1920) % 1920, 0.8 + hash(i + 43) * 1.4); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Platform-safe chart viewport, clipping also contains collision waves.
    ctx.save(); ctx.beginPath(); ctx.rect(46, 560, 844, 890); ctx.clip();
    const hit = P.events.filter((e) => e.t <= t && t < e.t + 0.4 && (e.hit === 2 || e.turn)).at(-1);
    if (hit) { const a = (1 - (t - hit.t) / 0.4) * (hit.turn ? 3 : 1.7); ctx.translate(Math.sin((t - hit.t) * 49) * a, Math.sin((t - hit.t) * 37) * a); }
    const points = [];
    for (let x = Math.max(P.path[0].x, f.head.x - 1100); x < f.head.x; x += 4) points.push(C.screen(C.atX(P.path, x), f));
    points.push(head);
    for (const [width, alpha, blur] of [[22, 0.09, 24], [12, 0.24, 14], [5, 1, 5], [1.7, 0.9, 0]]) {
      ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = blur ? primary : '#FFF5D8'; ctx.lineWidth = width;
      ctx.globalAlpha = alpha; ctx.shadowColor = primary; ctx.shadowBlur = blur * (globalThis.G.scale || 1); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    P.events.forEach((e) => drawBubble(ctx, e, f));
    ctx.shadowColor = primary; ctx.shadowBlur = 26 * (globalThis.G.scale || 1);
    circle(ctx, head.x, head.y, C.LOGO_R); ctx.fillStyle = '#19160D'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = primary; ctx.stroke(); ctx.shadowBlur = 0;
    ctx.save(); circle(ctx, head.x, head.y, C.LOGO_R - 4); ctx.clip();
    if (logo) { const size = 68, ratio = logo.width / logo.height; const w = ratio >= 1 ? size : size * ratio, h = ratio >= 1 ? size / ratio : size; ctx.drawImage(logo, head.x - w / 2, head.y - h / 2, w, h); }
    ctx.restore(); ctx.restore();
    text(ctx, P.coin.pair, 70, 312, 34, primary);
    text(ctx, money(f.hud.price), 70, 395, 76);
    const day = new Date(f.hud.date + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    text(ctx, day, 72, 472, 30, '#C2BFAF');
    const up = f.hud.phase.type === 'uptrend';
    text(ctx, (up ? '▲ ' : '▼ ') + f.hud.phase.type.toUpperCase(), 880, 472, 25, up ? '#66E7AE' : '#FF8296', 'right');
    if (f.hud.event && t - f.hud.event.t < 0.45) {
      ctx.save(); ctx.globalAlpha = (1 - (t - f.hud.event.t) / 0.45) * 0.65;
      circle(ctx, 865, 395, 6 + (t - f.hud.event.t) * 30); ctx.strokeStyle = primary; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    }
    text(ctx, 'COIN TRAIL', 72, 1458, 21, '#8C897E');
    if (P.parts > 1) text(ctx, `PART ${P.part} / ${P.parts}`, 880, 1458, 21, '#8C897E', 'right');
  }
  globalThis.TrailScene = { draw, captionLines };
  Studio.film({ draw, duration: P.duration, fadeOut: 0, post: { grain: 0, paper: 0, vignette: 0.1 },
    init: async () => {
      const approval = await Studio.loadJSON('render-approval.json');
      if (!approval || !approval.approved || approval.contentHash !== P.contentHash) throw new Error('Event/caption review pending; rendering is blocked.');
      logo = await Studio.loadImage(P.coin.logo);
    } });
})();
