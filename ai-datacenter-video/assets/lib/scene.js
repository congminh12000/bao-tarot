// Shared timeline helpers for every scene. All motion is a function of timeline time.
window.K = {
  // drifting, twinkling sparkles: every .spk under root drifts over the scene's length
  sparkles(tl, root, dur) {
    document.querySelectorAll(root + " .spk").forEach((el) => {
      const a = +el.dataset.a, ph = +el.dataset.ph, dx = +el.dataset.dx, dy = +el.dataset.dy;
      const o = { t: 0 };
      tl.fromTo(o, { t: 0 }, {
        t: 1, duration: dur, ease: "none",
        onUpdate() {
          const k = o.t, tw = 0.55 + 0.45 * Math.sin(ph + k * dur * 2.2);
          el.setAttribute("opacity", (a * tw).toFixed(3));
          el.setAttribute("transform", `translate(${(dx * k).toFixed(2)},${(dy * k).toFixed(2)})`);
        },
      }, 0);
    });
  },
  // blinks: quick close/open of eyelids at given times
  blink(tl, sel, times) {
    times.forEach((t) => {
      tl.fromTo(sel, { scaleY: 0 }, { scaleY: 1, duration: 0.06, ease: "power1.in" }, t);
      tl.fromTo(sel, { scaleY: 1 }, { scaleY: 0, duration: 0.08, ease: "power1.out", immediateRender: false }, t + 0.09);
    });
  },
  // type text into an element letter by letter between t0 and t1, with a caret
  type(tl, sel, text, t0, t1) {
    const el = document.querySelector(sel);
    const o = { n: 0 };
    el.textContent = "";
    tl.fromTo(o, { n: 0 }, {
      n: text.length, duration: t1 - t0, ease: "none",
      onUpdate() { el.textContent = text.slice(0, Math.round(o.n)); },
    }, t0);
  },
  // constant spin
  spin(tl, sel, t0, dur, turns) {
    tl.fromTo(sel, { rotation: 0 }, { rotation: 360 * turns, duration: dur, ease: "none", transformOrigin: "50% 50%" }, t0);
  },
};
// Camera: a div holding the scene's world. Each key = [t, dur, px, py, zoom, ease]; the camera
// centres world point (px,py) at the given zoom. First key's dur is ignored (it is the start state).
K.cam = function (tl, sel, keys) {
  const st = (k) => ({ x: 960 - k[2] * k[4], y: 540 - k[3] * k[4], scale: k[4] });
  gsap.set(sel, { transformOrigin: "0 0" });
  tl.fromTo(sel, st(keys[0]), { ...st(keys[0]), duration: 0.001 }, 0);
  for (let i = 1; i < keys.length; i++) {
    tl.fromTo(sel, st(keys[i - 1]), { ...st(keys[i]), duration: keys[i][1], ease: keys[i][5] || "power2.inOut", immediateRender: false }, keys[i][0]);
  }
};
// Rig: drive an SVG element's transform attribute from a plain proxy, pivoting on (cx,cy) in the
// element's own coordinates. Tween the proxy (x, y, s, sx, sy, r); the timeline's onUpdate applies it.
K.rig = function (tl, sel, cx, cy) {
  const el = typeof sel === "string" ? document.querySelector(sel) : sel;
  const p = { x: 0, y: 0, s: 1, sx: 1, sy: 1, r: 0 };
  const apply = () => el.setAttribute("transform",
    `translate(${p.x + cx},${p.y + cy}) rotate(${p.r}) scale(${p.s * p.sx},${p.s * p.sy}) translate(${-cx},${-cy})`);
  if (!tl._rigs) { tl._rigs = []; tl.eventCallback("onUpdate", () => tl._rigs.forEach((f) => f())); }
  tl._rigs.push(apply);
  apply();
  return p;
};
