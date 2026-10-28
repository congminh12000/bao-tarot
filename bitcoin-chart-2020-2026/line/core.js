// Coin Trail geometry and absolute-time playback. Shared by Node tests and browser workers.
(function () {
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, u) => a + (b - a) * u;
  const smooth = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
  const LOGO_R = 40;
  const diameter = (e) => e.turn ? 270 : Math.max(e.tag ? 190 : 0, [150, 190, 240][e.hit]);
  const budget = (e) => e.turn ? 1.8 : e.tag ? Math.max(1.2, [1, 1.2, 1.6][e.hit]) : [1, 1.2, 1.6][e.hit];
  // Monotone Hermite: derivative's Bezier control points are all bounded by 3*secant.
  // dx >= 3.05*|dy| therefore proves |dy/dx| < 1, including INSIDE each segment.
  function slopes(points, xKey = 'x', yKey = 'y') {
    const d = points.slice(1).map((p, i) => (p[yKey] - points[i][yKey]) / (p[xKey] - points[i][xKey]));
    return points.map((p, i) => {
      if (!i || i === points.length - 1) return 0;
      const a = d[i - 1], b = d[i];
      return a * b <= 0 ? 0 : Math.sign(a) * Math.min(Math.abs(2 * a * b / (a + b)), 1.5 * Math.min(Math.abs(a), Math.abs(b)));
    });
  }
  function locate(points, value, key = 'x') {
    let lo = 0, hi = points.length - 1;
    while (hi - lo > 1) { const mid = (hi + lo) >> 1; if (points[mid][key] <= value) lo = mid; else hi = mid; }
    return lo;
  }
  function hermite(a, b, ma, mb, x) {
    const dx = b.x - a.x, u = clamp((x - a.x) / dx), u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * a.y + (u3 - 2 * u2 + u) * dx * ma + (-2 * u3 + 3 * u2) * b.y + (u3 - u2) * dx * mb;
  }
  function atX(path, x) {
    const i = locate(path, x), a = path[i], b = path[i + 1];
    return { x: clamp(x, path[0].x, path.at(-1).x), y: hermite(a, b, a.m, b.m, x) };
  }
  function pathFor(prices, events) {
    const path = []; let x = 0, prevEvent = null;
    for (const p of prices) {
      const onDay = events.filter((e) => e.date === p.date);
      const y = -Math.log(p.price) * 260;
      x += path.length ? Math.max(18, 3.05 * Math.abs(y - path.at(-1).y)) : 0;
      if (onDay.length && prevEvent) x = Math.max(x, prevEvent.x + (prevEvent.diameter + diameter(onDay[0])) / 2 + 150);
      path.push({ ...p, x, y });
      onDay.forEach((e, j) => {
        if (j) { x += (onDay[j - 1].diameter + diameter(e)) / 2 + 150; path.push({ ...p, x, y, presentation: true }); }
        Object.assign(e, { x, y, diameter: diameter(e), price: p.price, priceField: p.field, priceSource: p.source });
        // Bubble lies ahead, tangent to the moving logo at this exact source anchor.
        e.cx = x + e.diameter / 2 + LOGO_R; e.cy = y;
        prevEvent = e;
      });
    }
    if (path.length === 1) path.push({ ...path[0], x: x + 1 });
    const m = slopes(path); path.forEach((p, i) => { p.m = m[i]; });
    return path;
  }
  function schedule(path, events, target = 45) {
    // Each bubble gets a slow readable approach over its last 100 px. Long empty
    // stretches get compressed travel time. Timing knots share a monotone C1 map.
    const knots = [{ x: path[0].x - 360, seconds: 0 }]; let seconds = 0, x0 = knots[0].x;
    for (const e of events) {
      const approach = Math.max(x0 + 1, e.x - 100);
      seconds += 0.3 + Math.min(1.8, Math.log1p(Math.max(0, approach - x0) / 500) * 0.6);
      knots.push({ x: approach, seconds });
      seconds += budget(e);
      knots.push({ x: e.x, seconds }); e.t = seconds; x0 = e.x;
    }
    const minimum = seconds + 1;
    if (minimum > 60 + 1e-8) throw new Error('Part exceeds 60 seconds: split before scheduling');
    const duration = Math.ceil(clamp(Math.max(minimum, target), 35, 60) * 60) / 60;
    const scale = (duration - 1) / seconds;
    knots.forEach((k) => { k.t = k.seconds * scale; delete k.seconds; });
    events.forEach((e) => { e.t *= scale; e.readSeconds = budget(e) * scale; });
    const timePoints = knots.map((k) => ({ x: k.t, y: k.x })), m = slopes(timePoints);
    knots.forEach((k, i) => { k.v = m[i]; });
    return { knots, duration, minimum };
  }
  function xAt(part, t) {
    const k = part.knots;
    if (t >= k.at(-1).t) return k.at(-1).x;
    const i = locate(k, Math.max(0, t), 't'), a = k[i], b = k[i + 1];
    return hermite({ x: a.t, y: a.x }, { x: b.t, y: b.x }, a.v, b.v, Math.max(0, t));
  }
  function phaseAt(part, t) { return part.cues.filter((c) => c.t <= t + 1e-9).at(-1); }
  function hudAt(part, t) {
    const e = part.events.filter((e) => e.t <= t + 1e-9).at(-1);
    return { date: e ? e.date : part.from, price: e ? e.price : part.startPrice, phase: phaseAt(part, t), event: e || null };
  }
  function frame(part, t) {
    t = clamp(t, 0, part.duration);
    const x = xAt(part, t), head = atX(part.path, x);
    // Linear continuation only for the opening approach; not invented price data.
    if (x < part.path[0].x) { head.x = x; head.y = part.path[0].y; }
    // Symmetric offline camera smoothing: deterministic seeking, no stateful lag.
    const ahead = atX(part.path, Math.max(part.path[0].x, xAt(part, t + 0.32)));
    const behind = atX(part.path, Math.max(part.path[0].x, xAt(part, t - 0.32)));
    const cameraY = head.y + 160 * Math.tanh((ahead.y + behind.y - 2 * head.y) / 640);
    return { t, head, camera: { x: x - 460, y: cameraY - 980, zoom: 1 }, hud: hudAt(part, t) };
  }
  function screen(p, f) { return { x: (p.x - f.camera.x) * f.camera.zoom, y: (p.y - f.camera.y) * f.camera.zoom }; }
  const API = { clamp, mix, smooth, LOGO_R, diameter, budget, slopes, hermite, locate, atX, pathFor, schedule, xAt, phaseAt, hudAt, frame, screen };
  if (typeof module !== 'undefined') module.exports = API; else globalThis.CoinTrail = API;
})();
