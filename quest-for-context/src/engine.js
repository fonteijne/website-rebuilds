/* The Quest for Context — tiny deterministic pixel-art engine.
   Everything renders into a 640x360 canvas that the page upscales x3 with nearest-neighbour.
   Every frame is a pure function of time t (seconds), so HyperFrames can seek anywhere. */
(function () {
  const LW = 640, LH = 360;
  const E = (window.QE = {});
  E.LW = LW;
  E.LH = LH;

  // ---------- math ----------
  E.clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  E.lerp = (a, b, p) => a + (b - a) * p;
  E.seg = (t, a, b) => E.clamp((t - a) / (b - a));
  E.easeOut = (p) => 1 - Math.pow(1 - p, 3);
  E.easeIn = (p) => p * p * p;
  E.easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  E.sine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);
  E.backOut = (p, s = 1.7) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);
  E.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  // smooth deterministic 1D noise (sum of sines with seeded phases)
  E.wave = function (seed, n = 5) {
    const r = E.rng(seed);
    const comps = Array.from({ length: n }, (_, i) => ({ f: (0.004 + r() * 0.01) * Math.pow(1.9, i), a: 1 / Math.pow(1.8, i), p: r() * 6.283 }));
    const norm = comps.reduce((s, c) => s + c.a, 0);
    return (x) => comps.reduce((s, c) => s + c.a * Math.sin(x * c.f + c.p), 0) / norm;
  };

  // ---------- canvases ----------
  E.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    return c;
  };
  E.g = null; // current target context
  E.use = (ctx) => (E.g = ctx);

  // ---------- pixel primitives (on E.g, in current transform) ----------
  E.rect = (x, y, w, h, c) => {
    E.g.fillStyle = c;
    E.g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  E.px = (x, y, c, s = 1) => {
    E.g.fillStyle = c;
    E.g.fillRect(Math.round(x), Math.round(y), s, s);
  };
  E.disc = (cx, cy, r, c) => {
    const g = E.g;
    g.fillStyle = c;
    cx = Math.round(cx);
    cy = Math.round(cy);
    const rr = Math.max(0.5, r);
    for (let dy = -Math.ceil(rr); dy <= Math.ceil(rr); dy++) {
      const w = Math.floor(Math.sqrt(Math.max(0, rr * rr - dy * dy)));
      if (rr * rr - dy * dy < 0) continue;
      g.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
    }
  };
  E.ellipse = (cx, cy, rx, ry, c) => {
    const g = E.g;
    g.fillStyle = c;
    for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
      const k = 1 - (dy * dy) / (ry * ry);
      if (k < 0) continue;
      const w = Math.floor(rx * Math.sqrt(k));
      g.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
    }
  };
  E.ring = (cx, cy, r, c, th = 1) => {
    const g = E.g;
    g.fillStyle = c;
    const n = Math.max(12, Math.round(r * 7));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), th, th);
    }
  };
  E.line = (x0, y0, x1, y1, c, th = 1) => {
    const g = E.g;
    g.fillStyle = c;
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) {
      g.fillRect(Math.round(x0 + ((x1 - x0) * i) / n - th / 2 + 0.5), Math.round(y0 + ((y1 - y0) * i) / n - th / 2 + 0.5), th, th);
    }
  };
  // scanline polygon fill (crisp, no antialiasing)
  E.poly = (pts, c) => {
    const g = E.g;
    g.fillStyle = c;
    let y0 = Infinity, y1 = -Infinity;
    pts.forEach((p) => ((y0 = Math.min(y0, p[1])), (y1 = Math.max(y1, p[1]))));
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [];
      const yc = y + 0.5;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) g.fillRect(Math.round(xs[i]), y, Math.round(xs[i + 1]) - Math.round(xs[i]), 1);
    }
  };
  // bitmap: rows of chars, palette {char: colour}; '.' = transparent
  E.bitmap = (rows, pal, x, y, s = 1, flip = false) => {
    const g = E.g;
    const w = rows[0].length;
    for (let r = 0; r < rows.length; r++)
      for (let k = 0; k < w; k++) {
        const ch = rows[r][flip ? w - 1 - k : k];
        if (ch === "." || ch === " " || !pal[ch]) continue;
        g.fillStyle = pal[ch];
        g.fillRect(Math.round(x + k * s), Math.round(y + r * s), s, s);
      }
  };
  // soft pixel glow: stacked translucent discs
  E.glow = (cx, cy, r, c, a = 0.5, steps = 5) => {
    const g = E.g;
    const old = g.globalAlpha;
    for (let i = steps; i >= 1; i--) {
      g.globalAlpha = old * a * (1 / steps) * 1.6;
      E.disc(cx, cy, (r * i) / steps, c);
    }
    g.globalAlpha = old;
  };
  E.alpha = (a, fn) => {
    const g = E.g;
    const old = g.globalAlpha;
    g.globalAlpha = old * a;
    fn();
    g.globalAlpha = old;
  };
  E.star = (x, y, s, c, a = 1) =>
    E.alpha(a, () => {
      E.rect(x - s * 2, y, s * 4 + 1, 1, c);
      E.rect(x, y - s * 2, 1, s * 4 + 1, c);
      if (s > 1) E.rect(x - 1, y - 1, 3, 3, c);
    });

  // ---------- camera ----------
  // world point (cx, cy) at the screen centre, zoom z, parallax factor p (1 = world plane)
  E.cam = (cx, cy, z = 1, p = 1) => {
    const g = E.g;
    const tx = LW / 2 - cx * p * z + (cx * (1 - p) * 0);
    const ty = LH / 2 - cy * p * z;
    g.setTransform(z, 0, 0, z, Math.round(tx), Math.round(ty));
  };
  E.screen = () => E.g.setTransform(1, 0, 0, 1, 0, 0);

  // ---------- sprites ----------
  E.SPR = {};
  E.loadSprites = function (names) {
    return Promise.all(
      names.map(
        (n) =>
          new Promise((res) => {
            const im = new Image();
            im.onload = () => {
              E.SPR[n] = im;
              res();
            };
            im.onerror = () => res();
            im.src = "assets/sprites/" + n + ".png";
          }),
      ),
    );
  };
  E.HERO_SCALE = 0.3;
  // draw a sprite with its bottom-centre at (x, y)
  E.sprite = (name, x, y, opt = {}) => {
    const im = E.SPR[name];
    if (!im) return;
    const g = E.g;
    const s = (opt.scale || E.HERO_SCALE) * (opt.sx || 1);
    const sy = (opt.scale || E.HERO_SCALE) * (opt.sy || 1);
    const w = im.width * s, h = im.height * sy;
    g.save();
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    if (opt.alpha != null) g.globalAlpha *= opt.alpha;
    g.translate(Math.round(x), Math.round(y));
    if (opt.rot) g.rotate(opt.rot);
    if (opt.flip) g.scale(-1, 1);
    g.drawImage(im, -w / 2, -h, w, h);
    g.restore();
  };
  E.shadow = (x, y, w) => E.alpha(0.28, () => E.ellipse(x, y, w, Math.max(1, w * 0.22), "#1d1410"));
})();
