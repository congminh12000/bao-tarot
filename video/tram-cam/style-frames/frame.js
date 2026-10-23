// Shared preview driver for style frames.
// Every visual change is a pure function of time t (seconds), so a frame-seeking
// renderer (HyperFrames) gets the same image for the same t.
(function () {
  var BOIL_FPS = 8;    // how often the hand-drawn wobble changes
  var MOTION_FPS = 12; // stepped "on twos" feel for movement

  function step(t, fps) { return Math.floor(t * fps) / fps; }

  window.renderFrame = function (t) {
    var seed = 1 + (Math.floor(t * BOIL_FPS) % 4);
    document.querySelectorAll("feTurbulence").forEach(function (n) {
      n.setAttribute("seed", String(seed + Number(n.dataset.offset || 0)));
    });

    var ts = step(t, MOTION_FPS);
    document.querySelectorAll("[data-bob]").forEach(function (n) {
      var amp = Number(n.dataset.bob);
      var y = Math.sin(ts * 1.3) * amp;
      n.setAttribute("transform", "translate(0 " + y.toFixed(2) + ")");
    });
  };

  document.querySelector(".guides").classList.toggle("on", /guides/.test(location.search + location.hash));
  window.renderFrame(0);

  // Live preview in a browser; screenshots add ?static to freeze at t = 0.
  if (location.search.indexOf("static") === -1) {
    var start = performance.now();
    (function loop(now) {
      window.renderFrame((now - start) / 1000);
      requestAnimationFrame(loop);
    })(start);
  }
})();
