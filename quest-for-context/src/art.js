/* Procedural pixel art: backgrounds are baked once into offscreen canvases (seeded = deterministic),
   props are drawn every frame. */
(function () {
  const E = window.QE;
  const A = (window.QA = {});
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (a, b, p) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * p));
  const css = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;
  A.hex = hex;
  A.mix = mix;
  A.css = css;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const dith = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

  // image from a per-pixel function returning [r,g,b] / [r,g,b,a] / null
  function img(w, h, fn) {
    const c = E.canvas(w, h);
    const x = c.getContext("2d");
    const d = x.createImageData(w, h);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const v = fn(i, j);
        if (!v) continue;
        const k = (j * w + i) * 4;
        d.data[k] = v[0];
        d.data[k + 1] = v[1];
        d.data[k + 2] = v[2];
        d.data[k + 3] = v.length > 3 ? v[3] : 255;
      }
    x.putImageData(d, 0, 0);
    return c;
  }
  A.img = img;

  // ---------- sky (drawn per frame, dithered bands) ----------
  A.sky = function (stops, yTop = 0, yBot = 360) {
    const g = E.g;
    const cols = stops.map((s) => [s[0], hex(s[1])]);
    for (let y = yTop; y < yBot; y++) {
      const p = (y - yTop) / (yBot - yTop);
      let i = 0;
      while (i < cols.length - 2 && p > cols[i + 1][0]) i++;
      const q = E.clamp((p - cols[i][0]) / (cols[i + 1][0] - cols[i][0]));
      const steps = 6;
      const qq = Math.floor(q * steps) / steps;
      const fr = q * steps - Math.floor(q * steps);
      const a = mix(cols[i][1], cols[i + 1][1], qq), b = mix(cols[i][1], cols[i + 1][1], Math.min(1, qq + 1 / steps));
      // dithered row: alternate two colours by Bayer threshold
      g.fillStyle = css(a);
      g.fillRect(0, y, E.LW, 1);
      if (fr > 0.05) {
        g.fillStyle = css(b);
        for (let x = 0; x < E.LW; x++) if (dith(x, y) < fr) g.fillRect(x, y, 1, 1);
      }
    }
  };
  A.SKY_DAY = [[0, "#3f7fd8"], [0.45, "#79b6ee"], [0.8, "#b9def7"], [1, "#e4f3fb"]];
  A.SKY_DUSK = [[0, "#2c2a6b"], [0.35, "#7a4f9a"], [0.62, "#e0787a"], [0.85, "#f6b56b"], [1, "#ffe1a0"]];
  A.SKY_NIGHT = [[0, "#05060f"], [0.5, "#0d1430"], [1, "#24264a"]];
  A.SKY_GOLD = [[0, "#5d8fe0"], [0.35, "#b3cff0"], [0.7, "#ffd98a"], [1, "#fff1c4"]];

  // ---------- generators ----------
  A.ridge = function ({ w, h, seed, base, amp, body, light, snow, snowLine }) {
    const n = E.wave(seed, 3), n2 = E.wave(seed + 9, 4), n3 = E.wave(seed + 17, 3);
    const B = hex(body), L = hex(light), S = snow ? hex(snow) : null, D = mix(hex(body), [20, 30, 50], 0.25);
    const big = (x) => base - amp * (0.5 + 0.5 * n(x));
    const top = (x) => big(x) - 7 * n2(x * 4) - 2 * n3(x * 13);
    return img(w, h, (x, y) => {
      const t = top(x);
      if (y < t) return null;
      // light from the left: lit where the broad shape rises to the right (dithered terminator)
      const slope = (big(x + 6) - big(x - 6)) / 12 + 0.6 * (top(x + 2) - top(x - 2)) / 4;
      const lit = E.clamp(0.5 + slope * 1.4);
      let c = dith(x, y) < lit ? L : B;
      if (S && y < snowLine + 8 * n2(x * 3) && y < t + 16) c = dith(x, y) < 0.85 ? S : c;
      const depth = (y - t) / 70;
      if (depth > 0.4) c = dith(x + 1, y) < Math.min(0.9, depth - 0.4) ? mix(c, D, 0.6) : c;
      return c;
    });
  };

  A.cloud = function (seed, w, h, pal = ["#ffffff", "#dceefe", "#b9d6f2"]) {
    const r = E.rng(seed);
    const c = E.canvas(w, h);
    E.use(c.getContext("2d"));
    const blobs = Array.from({ length: 7 }, (_, i) => ({ x: w * (0.15 + 0.7 * (i / 6)) + (r() - 0.5) * 10, y: h * 0.6 - r() * h * 0.25, r: h * (0.22 + r() * 0.2) }));
    blobs.forEach((b) => E.disc(b.x, b.y + 3, b.r, pal[2]));
    blobs.forEach((b) => E.disc(b.x, b.y + 1, b.r, pal[1]));
    blobs.forEach((b) => E.disc(b.x - 1, b.y - 1, b.r - 2, pal[0]));
    E.rect(w * 0.1, h * 0.62, w * 0.8, h * 0.2, pal[1]);
    return c;
  };

  A.castle = function (pal = { wall: "#c3cde0", shade: "#9eabc8", roof: "#c97f72", roofD: "#a7655d", win: "#5f6f93", hill: "#7fa6a0", hillL: "#94bdb2" }) {
    const w = 300, h = 170;
    const c = E.canvas(w, h);
    E.use(c.getContext("2d"));
    // hill
    E.poly([[0, h], [20, 120], [80, 98], [170, 92], [250, 104], [300, 126], [300, h]], pal.hill);
    E.poly([[20, 120], [80, 98], [120, 96], [60, 125]], pal.hillL);
    // curtain wall
    E.rect(40, 92, 220, 24, pal.wall);
    E.rect(40, 108, 220, 8, pal.shade);
    for (let x = 40; x < 260; x += 8) E.rect(x, 88, 5, 4, pal.wall);
    // houses
    const r = E.rng(5);
    for (let i = 0; i < 9; i++) {
      const hx = 48 + i * 24 + r() * 6, hh = 10 + r() * 10;
      E.rect(hx, 92 - hh, 16, hh, pal.wall);
      E.rect(hx + 11, 92 - hh, 5, hh, pal.shade);
      E.poly([[hx - 2, 92 - hh], [hx + 8, 92 - hh - 9], [hx + 18, 92 - hh]], i % 2 ? pal.roof : pal.roofD);
      E.rect(hx + 5, 92 - hh + 4, 2, 3, pal.win);
    }
    // towers
    [[70, 46, 14], [118, 20, 18], [160, 34, 16], [205, 12, 20], [245, 52, 13]].forEach(([tx, ty, tw]) => {
      E.rect(tx, ty, tw, 100 - ty, pal.wall);
      E.rect(tx + tw * 0.65, ty, tw * 0.35, 100 - ty, pal.shade);
      E.poly([[tx - 3, ty], [tx + tw / 2, ty - tw * 1.5], [tx + tw + 3, ty]], pal.roof);
      E.poly([[tx + tw / 2, ty - tw * 1.5], [tx + tw + 3, ty], [tx + tw / 2, ty]], pal.roofD);
      for (let k = 0; k < 3; k++) E.rect(tx + tw / 2 - 1, ty + 8 + k * 14, 2, 4, pal.win);
    });
    return c;
  };

  // cliff body; side = 'right' means the drop-off is on the right edge
  A.cliff = function ({ w, h, seed, side, pal }) {
    pal = pal || { rock: "#8a7458", rockD: "#6b5843", rockDD: "#4f4133", rockL: "#a99073", grass: "#58a83a", grassD: "#3d822b", grassL: "#8fd04e" };
    const n = E.wave(seed, 5), n2 = E.wave(seed + 3, 4), n3 = E.wave(seed + 7, 3);
    const R = hex(pal.rock), RD = hex(pal.rockD), RDD = hex(pal.rockDD), RL = hex(pal.rockL);
    const G = hex(pal.grass), GD = hex(pal.grassD), GL = hex(pal.grassL);
    const r = E.rng(seed);
    const flowers = new Set();
    for (let i = 0; i < w / 9; i++) flowers.add(Math.floor(r() * w));
    const edge = (y) => {
      const e = 6 + 10 * (0.5 + 0.5 * n(y * 4)) + Math.max(0, y - 120) * 0.22;
      return side === "right" ? w - e : e;
    };
    const topY = (x) => 6 + 2.5 * n3(x * 5);
    return img(w, h, (x, y) => {
      const ex = edge(y);
      const inside = side === "right" ? x < ex : x > ex;
      const ty = topY(x);
      // grass tufts above top line
      if (y < ty) {
        if (y >= ty - 3 && ((x * 7 + Math.floor(ty)) % 5 === 0) && inside) return y >= ty - 1 ? G : GL;
        if (flowers.has(x) && y >= ty - 2 && inside) return y === Math.floor(ty) - 2 ? [255, 228, 120] : GD;
        return null;
      }
      if (!inside) return null;
      if (y < ty + 6) return y < ty + 2 ? GL : G;
      if (y < ty + 8) return (x + y) % 3 ? GD : RD;
      // vines hanging near the edge
      const dEdge = Math.abs(x - ex);
      if (dEdge < 3 && y < ty + 30 + 18 * (0.5 + 0.5 * n2(x * 9)) && (x * 13) % 4 === 0) return GD;
      if (dEdge < 2) return RDD;
      const band = (y + 7 * n2(x * 3)) % 22;
      let c = band < 2 ? RD : band < 3 ? RL : R;
      if (dEdge < 7) c = mix(c, RD, 0.5);
      if (y > h * 0.55) c = mix(c, RDD, (y - h * 0.55) / (h * 0.45));
      const crack = Math.abs(n((x + y * 0.3) * 7)) < 0.015;
      return crack ? RDD : c;
    });
  };

  A.canyon = function ({ w, h, seed }) {
    // the deep chasm seen between the cliffs: receding walls, haze, a river far below
    const n = E.wave(seed, 4);
    const wallT = hex("#7f8fae"), wallB = hex("#2c3650"), lit = hex("#9fb0cc");
    const hazeT = hex("#b9d4ea"), hazeB = hex("#41557a"), river = hex("#6fb6e8"), foam = hex("#e8f6ff");
    return img(w, h, (x, y) => {
      const p = y / h;
      const lw = 30 + 26 * (0.5 + 0.5 * n(y * 3)) + y * 0.55;
      const rw = 30 + 26 * (0.5 + 0.5 * n(y * 3 + 400)) + y * 0.55;
      if (x < lw || x > w - rw) {
        let c = mix(wallT, wallB, p);
        if ((y + Math.floor(6 * n(x * 5))) % 14 < 2) c = mix(c, lit, 0.35);
        if (Math.abs(x - lw) < 2 || Math.abs(x - (w - rw)) < 2) c = mix(c, wallB, 0.5);
        return c;
      }
      if (y > h - 24) {
        const st = (x + Math.floor(y * 1.7)) % 11 === 0;
        return st ? foam : river;
      }
      const q = Math.floor(p * 8) / 8 + (dith(x, y) < (p * 8) % 1 ? 1 / 8 : 0);
      return mix(hazeT, hazeB, Math.min(1, q));
    });
  };

  A.tree = function (seed, s, pal = ["#2f7a3a", "#3f9a45", "#68c055", "#5a3a22"]) {
    const r = E.rng(seed);
    const c = E.canvas(s * 2, s * 2.6);
    E.use(c.getContext("2d"));
    E.rect(s - 2, s * 1.6, 4, s, pal[3]);
    const blobs = Array.from({ length: 6 }, () => ({ x: s + (r() - 0.5) * s * 0.9, y: s * 0.9 + (r() - 0.5) * s * 0.8, r: s * (0.35 + r() * 0.25) }));
    blobs.forEach((b) => E.disc(b.x, b.y + 2, b.r, pal[0]));
    blobs.forEach((b) => E.disc(b.x - 1, b.y, b.r - 2, pal[1]));
    blobs.forEach((b) => E.disc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.4, pal[2]));
    return c;
  };

  A.forestRow = function ({ w, h, seed, pal, size, gap }) {
    const r = E.rng(seed);
    const c = E.canvas(w, h);
    const ctx = c.getContext("2d");
    for (let x = -size; x < w + size; x += gap * (0.6 + r() * 0.8)) {
      const s = size * (0.75 + r() * 0.5);
      const t = A.tree(Math.floor(r() * 1e6), Math.round(s), pal);
      ctx.drawImage(t, Math.round(x - s), Math.round(h - s * 2.5 + r() * 6));
    }
    E.use(ctx);
    E.rect(0, h - 6, w, 6, pal[0]);
    return c;
  };

  A.templeMountain = function () {
    const w = 520, h = 320;
    const c = E.canvas(w, h);
    E.use(c.getContext("2d"));
    const m = A.ridge({ w, h, seed: 77, base: 300, amp: 0, body: "#6d7fa8", light: "#8ea0c6" });
    // a single tall peak
    const pk = img(w, h, (x, y) => {
      const d = Math.abs(x - w / 2);
      const top = 70 + d * 0.9 + Math.max(0, 140 - d) * 0.0 + 8 * Math.sin(x * 0.15) * (d > 30 ? 1 : 0);
      if (y < top) return null;
      const lit = x < w / 2;
      let col = lit ? [150, 166, 200] : [108, 122, 160];
      if (y > 220) col = mix(col, [80, 120, 110], (y - 220) / 100);
      if (dith(x, y) < 0.18) col = mix(col, [70, 82, 118], 0.4);
      return col;
    });
    c.getContext("2d").drawImage(pk, 0, 0);
    // zig-zag path
    E.use(c.getContext("2d"));
    for (let i = 0; i < 9; i++) {
      const y0 = 300 - i * 24, x0 = w / 2 + (i % 2 ? -1 : 1) * (60 - i * 5);
      E.line(x0, y0, w / 2 + (i % 2 ? 1 : -1) * (55 - i * 5), y0 - 24, "#b9a47e", 1);
    }
    // temple on the summit
    const tx = w / 2, ty = 70;
    E.rect(tx - 30, ty - 4, 60, 8, "#d7c9a6");
    E.rect(tx - 26, ty - 26, 52, 22, "#cbbd98");
    for (let k = 0; k < 5; k++) E.rect(tx - 24 + k * 11, ty - 26, 4, 22, "#efe2bf");
    E.poly([[tx - 32, ty - 26], [tx, ty - 42], [tx + 32, ty - 26]], "#b8a67e");
    E.rect(tx - 5, ty - 18, 10, 14, "#3a3226");
    return c;
  };

  A.templeFacade = function () {
    const w = 640, h = 360;
    const c = E.canvas(w, h);
    E.use(c.getContext("2d"));
    const stone = "#bfae86", stoneL = "#ddcfa8", stoneD = "#8f7f5e", dark = "#2a2219";
    // platform + steps
    for (let i = 0; i < 12; i++) {
      const y = 250 + i * 9, inset = 150 - i * 12;
      E.rect(inset, y, w - inset * 2, 9, i % 2 ? stone : stoneL);
      E.rect(inset, y + 7, w - inset * 2, 2, stoneD);
    }
    // body
    E.rect(170, 90, 300, 160, stone);
    for (let y = 90; y < 250; y += 10) for (let x = 170 + ((y / 10) % 2) * 10; x < 470; x += 20) E.rect(x, y, 1, 10, stoneD);
    for (let y = 90; y < 250; y += 10) E.rect(170, y, 300, 1, stoneD);
    // columns
    [190, 240, 380, 430].forEach((x) => {
      E.rect(x, 96, 22, 154, stoneL);
      E.rect(x + 15, 96, 7, 154, stoneD);
      E.rect(x - 4, 92, 30, 6, stoneL);
      E.rect(x - 4, 244, 30, 6, stoneD);
    });
    // pediment
    E.poly([[150, 92], [320, 30], [490, 92]], stoneL);
    E.poly([[175, 88], [320, 42], [465, 88]], stone);
    E.rect(150, 88, 340, 6, stoneD);
    // door
    E.rect(285, 150, 70, 100, dark);
    E.poly([[285, 150], [320, 128], [355, 150]], dark);
    // vines + moss
    const r = E.rng(31);
    for (let i = 0; i < 160; i++) E.px(170 + r() * 300, 90 + r() * 160 * r(), r() > 0.5 ? "#4f8a3a" : "#3a6e2c", 2);
    return c;
  };

  A.interior = function () {
    const w = 900, h = 360;
    const c = E.canvas(w, h);
    E.use(c.getContext("2d"));
    const r = E.rng(12);
    // back wall bricks
    for (let y = 0; y < 300; y += 12)
      for (let x = ((y / 12) % 2) * 14 - 14; x < w; x += 28) {
        const v = r();
        E.rect(x, y, 27, 11, v < 0.33 ? "#5a4a36" : v < 0.66 ? "#62513b" : "#544430");
        E.rect(x, y, 27, 1, "#6f5d44");
      }
    // arches
    for (let k = 0; k < 4; k++) {
      const ax = 90 + k * 240;
      E.rect(ax, 120, 90, 180, "#2b2117");
      E.ellipse(ax + 45, 120, 45, 30, "#2b2117");
    }
    // floor
    for (let y = 300; y < h; y += 10) for (let x = ((y / 10) % 2) * 20; x < w; x += 40) E.rect(x, y, 39, 9, (x + y) % 3 ? "#7a6649" : "#6c5940");
    E.rect(0, 298, w, 3, "#3a2e20");
    return c;
  };

  A.pillar = function (h) {
    const c = E.canvas(44, h);
    E.use(c.getContext("2d"));
    E.rect(4, 0, 36, h, "#8c7856");
    E.rect(4, 0, 8, h, "#a8926b");
    E.rect(30, 0, 10, h, "#6a5a40");
    for (let y = 0; y < h; y += 26) E.rect(4, y, 36, 2, "#5a4b34");
    E.rect(0, 0, 44, 10, "#a8926b");
    E.rect(0, h - 10, 44, 10, "#6a5a40");
    return c;
  };

  // ---------- props (drawn live) ----------
  A.crystal = function (x, y, s, phase, glow = 0.6) {
    const g = E.g;
    if (glow > 0) E.glow(x, y, s * 2.4, "#7fd0ff", glow, 6);
    const w = s * 0.62 * (0.35 + 0.65 * Math.abs(Math.cos(phase)));
    const front = Math.cos(phase) > 0;
    const top = y - s, bot = y + s, mid = y - s * 0.25;
    E.poly([[x, top], [x + w, mid], [x, bot], [x - w, mid]], "#2f6fe0");
    E.poly([[x, top], [x - w, mid], [x, bot]], front ? "#7cc6ff" : "#3d86f0");
    E.poly([[x, top], [x + w * 0.4, mid], [x, bot - s * 0.3], [x - w * 0.35, mid]], front ? "#bfe8ff" : "#5aa8ff");
    E.rect(x - 1, top + s * 0.3, 2, s * 0.5, "#ffffff");
    E.px(x - w * 0.4, mid - 2, "#ffffff", 2);
  };

  A.STONE = ["#9d9384", "#b9b0a1", "#756c60", "#5c544a"];
  A.block = function (x, y, w = 10, h = 7, pal = A.STONE) {
    E.rect(x, y, w, h, pal[0]);
    E.rect(x, y, w, 1, pal[1]);
    E.rect(x, y, 1, h, pal[1]);
    E.rect(x, y + h - 1, w, 1, pal[2]);
    E.rect(x + w - 1, y, 1, h, pal[2]);
  };

  A.DUCK = [
    "......YYYYY.......",
    ".....YYYYYYY......",
    "....YYYYYYYYY.....",
    "..OOOYYBYYYYY.....",
    ".OOOOYYYYYYYY.....",
    "..OOOYYYYYYY......",
    "......YYYYYY......",
    "......YYYYYYY.....",
    "....YYYYYYYYYYYYY.",
    "...YYYYYYYYYYYYYYY",
    "..YYYYYDDDDDYYYYYY",
    "..YYYYYYDDDDDYYYY.",
    "...YYYYYYYDDDYYY..",
    "....YYYYYYYYYYY...",
    "......YYYYYYY.....",
  ];
  A.DUCK_PAL = { Y: ["#f4c430", "#ffe27a", "#c9961c", "#a07214"], O: ["#f08a24", "#ffb060", "#c0601a", "#9a4a12"], D: ["#d9a521", "#efc24a", "#b07e16", "#8a6010"], B: ["#2a1d10", "#4a3520", "#1a120a", "#100a05"] };
  A.duckCells = function () {
    const cells = [];
    A.DUCK.forEach((row, r) => [...row].forEach((ch, k) => ch !== "." && cells.push({ r, k, ch })));
    return cells;
  };

  A.chest = function (x, y, open = 0, glow = 0) {
    // x,y = bottom centre; 36x24
    const L = x - 18, T = y - 18;
    if (glow > 0) E.glow(x, T, 40 * glow + 10, "#ffe27a", 0.7 * glow, 6);
    E.rect(L, T, 36, 18, "#7a4a22");
    E.rect(L, T, 36, 2, "#9a6230");
    E.rect(L, T + 16, 36, 2, "#4f2e14");
    [L + 4, L + 28].forEach((bx) => E.rect(bx, T, 4, 18, "#e0b13a"));
    E.rect(x - 3, T + 3, 6, 6, "#e0b13a");
    E.rect(x - 1, T + 5, 2, 3, "#3a2410");
    // lid: rotates up/back
    const lh = Math.round(10 * Math.cos(open * Math.PI * 0.62));
    if (open > 0.05) {
      E.rect(L + 1, T - 2, 34, 3, "#2a1608");
      if (glow > 0) E.alpha(glow, () => E.rect(L + 2, T - 2, 32, 3, "#fff3b0"));
    }
    const ly = T - Math.max(2, Math.abs(lh)) - (open > 0.5 ? 10 * (open - 0.5) : 0);
    E.rect(L - 1, ly, 38, Math.max(3, Math.abs(lh)), "#8a5426");
    E.rect(L - 1, ly, 38, 2, "#a8672e");
    [L + 3, L + 27].forEach((bx) => E.rect(bx, ly, 4, Math.max(3, Math.abs(lh)), "#f0c14a"));
  };

  A.chalice = function (x, y, s = 1, glow = 0) {
    if (glow > 0) E.glow(x, y - 10 * s, 34 * s * (0.8 + glow * 0.6), "#ffd860", 0.75 * glow, 6);
    const rows = [
      "GGGGGGGGGGGGGG",
      "GHHHHHHHHHHHGG",
      ".GHHHYYHHHHGG.",
      ".GGHHYYHHHHGG.",
      "..GGHHHHHGGG..",
      "...GGGGGGGG...",
      ".....GGGG.....",
      "......GG......",
      "......GG......",
      ".....GGGG.....",
      "...GGGGGGGG...",
      "..GGGGGGGGGG..",
    ];
    E.bitmap(rows, { G: "#e0a628", H: "#ffe27a", Y: "#ffffff" }, x - 7 * s, y - 12 * s, s);
  };

  // hexagon badge with icon
  A.ICONS = {
    target: ["...RRRRR...", "..R.....R..", ".R..RRR..R.", "R..R...R..R", "R..R.W.R..R", "R..R...R..R", ".R..RRR..R.", "..R.....R..", "...RRRRR..."],
    book: ["...........", ".WWWW.WWWW.", ".WBBW.WBBW.", ".WWWW.WWWW.", ".WBBW.WBBW.", ".WWWW.WWWW.", ".WBBW.WBBW.", ".WWWWWWWWW.", "....WWW...."],
    clock: ["...WWWWW...", "..W.....W..", ".W...B...W.", "W....B....W", "W....BBB..W", "W.........W", ".W.......W.", "..W.....W..", "...WWWWW..."],
    tools: [".........WW", "........WWW", ".......WWW.", "......WWW..", ".....WWW...", "....WWW....", "..WWWW.....", ".WW.W......", "WW.WW......"],
  };
  A.SYM_COL = { target: "#ff4d4d", book: "#4da3ff", clock: "#42d96b", tools: "#b55cff" };
  A.symbol = function (kind, x, y, r = 14, a = 1, glow = 0.6) {
    const col = A.SYM_COL[kind];
    E.alpha(a, () => {
      if (glow > 0) E.glow(x, y, r * 2.2, col, glow, 5);
      const pts = [0, 1, 2, 3, 4, 5].map((i) => [x + r * Math.cos(Math.PI / 6 + (i * Math.PI) / 3), y + r * Math.sin(Math.PI / 6 + (i * Math.PI) / 3)]);
      E.poly(pts, col);
      const pin = pts.map(([px, py]) => [x + (px - x) * 0.78, y + (py - y) * 0.78]);
      E.poly(pin, "#1a1530");
      const s = Math.max(1, Math.round(r / 9));
      const pal = { R: "#ff6b6b", W: "#ffffff", B: kind === "book" ? "#4da3ff" : "#42d96b" };
      if (kind === "target") pal.W = "#ffffff";
      E.bitmap(A.ICONS[kind], pal, x - 5.5 * s, y - 4.5 * s, s);
    });
  };

  // the "four connected points around a core" emblem
  A.emblem = function (x, y, r, a = 1, glowAmt = 0.7, spin = 0) {
    E.alpha(a, () => {
      E.glow(x, y, r * 1.8, "#ffd860", glowAmt, 6);
      const nodes = [0, 1, 2, 3].map((i) => [x + r * Math.cos(spin + (i * Math.PI) / 2 - Math.PI / 2), y + r * Math.sin(spin + (i * Math.PI) / 2 - Math.PI / 2)]);
      for (let i = 0; i < 4; i++) E.line(...nodes[i], ...nodes[(i + 1) % 4], "#ffe9a0", 2);
      nodes.forEach((n) => E.line(n[0], n[1], x, y, "#ffd860", 1));
      nodes.forEach((n) => {
        E.disc(n[0], n[1], r * 0.22, "#ffd04a");
        E.disc(n[0] - 1, n[1] - 1, r * 0.1, "#fff6c8");
      });
      E.disc(x, y, r * 0.3, "#fff6c8");
      E.disc(x, y, r * 0.18, "#ffffff");
    });
  };

  // items from the backpack
  A.item = function (kind, x, y, s = 1) {
    const L = x - 9 * s, T = y - 12 * s;
    if (kind === "drawing") {
      E.rect(L, T, 18 * s, 13 * s, "#f3ead2");
      E.rect(L, T, 18 * s, 1 * s, "#d8c9a4");
      E.line(L + 2 * s, T + 9 * s, L + 16 * s, T + 9 * s, "#3d6fd6", s);
      for (let i = 0; i <= 8; i++) {
        const xx = L + (2 + i * 1.75) * s;
        const yy = T + (9 - 4 * Math.sin((i / 8) * Math.PI)) * s;
        E.px(xx, yy, "#3d6fd6", s);
      }
    } else if (kind === "measure") {
      E.rect(L, T, 18 * s, 13 * s, "#e9d7a8");
      for (let i = 1; i < 6; i++) E.rect(L + i * 3 * s, T, 1, 13 * s, "#cdb684");
      for (let i = 1; i < 4; i++) E.rect(L, T + i * 3 * s, 18 * s, 1, "#cdb684");
      E.line(L + 2 * s, T + 4 * s, L + 16 * s, T + 4 * s, "#c0392b", s);
      E.px(L + 2 * s, T + 3 * s, "#c0392b", s);
      E.px(L + 15 * s, T + 3 * s, "#c0392b", s);
      E.rect(L + 4 * s, T + 8 * s, 3 * s, 3 * s, "#6b5a3a");
      E.rect(L + 11 * s, T + 8 * s, 3 * s, 3 * s, "#6b5a3a");
    } else if (kind === "book") {
      E.rect(L + 2 * s, T, 14 * s, 13 * s, "#8a3a22");
      E.rect(L + 2 * s, T, 2 * s, 13 * s, "#5e2414");
      E.rect(L + 14 * s, T + 1 * s, 2 * s, 11 * s, "#f3ead2");
      E.line(L + 6 * s, T + 3 * s, L + 11 * s, T + 8 * s, "#ff4d4d", s);
      E.line(L + 11 * s, T + 3 * s, L + 6 * s, T + 8 * s, "#ff4d4d", s);
    } else if (kind === "toolbox") {
      E.rect(L + 1 * s, T + 4 * s, 16 * s, 9 * s, "#5a6070");
      E.rect(L + 1 * s, T + 4 * s, 16 * s, 2 * s, "#7a8294");
      E.rect(L + 6 * s, T + 1 * s, 6 * s, 1 * s, "#3a3f4a");
      E.rect(L + 6 * s, T + 1 * s, 1 * s, 3 * s, "#3a3f4a");
      E.rect(L + 11 * s, T + 1 * s, 1 * s, 3 * s, "#3a3f4a");
      E.rect(L + 3 * s, T + 2 * s, 2 * s, 3 * s, "#e0b13a");
      E.rect(L + 13 * s, T + 1 * s, 2 * s, 4 * s, "#d64545");
      E.rect(L + 8 * s, T + 8 * s, 2 * s, 2 * s, "#e0b13a");
    }
  };

  A.parchment = function (x, y, w, h, unroll = 1, drawFn) {
    const ww = Math.max(4, w * unroll);
    E.rect(x - ww / 2, y - h / 2, ww, h, "#f1e2b8");
    E.rect(x - ww / 2, y - h / 2, ww, 2, "#d9c48f");
    E.rect(x - ww / 2, y + h / 2 - 2, ww, 2, "#c9b27a");
    E.rect(x - ww / 2 - 4, y - h / 2 - 2, 5, h + 4, "#c9a76a");
    E.rect(x + ww / 2 - 1, y - h / 2 - 2, 5, h + 4, "#c9a76a");
    if (drawFn && unroll > 0.6) E.alpha((unroll - 0.6) / 0.4, () => drawFn(x - ww / 2, y - h / 2, ww, h));
  };

  A.torch = function (x, y, t, k = 0) {
    E.rect(x - 2, y, 4, 12, "#4a3420");
    E.rect(x - 4, y - 2, 8, 3, "#6a4a2a");
    const f = Math.sin(t * 17 + k) * 0.5 + Math.sin(t * 29 + k * 2) * 0.5;
    E.glow(x, y - 6, 26 + f * 3, "#ffb040", 0.35, 5);
    E.ellipse(x, y - 6, 4, 7 + f, "#ff7a1a");
    E.ellipse(x, y - 5, 2.5, 4 + f, "#ffd04a");
    E.px(x, y - 3, "#fff6c8", 2);
  };

  A.bird = function (x, y, t, k = 0) {
    const up = Math.sin(t * 9 + k) > 0;
    const c = "#2b3550";
    E.px(x, y, c);
    if (up) {
      E.px(x - 1, y - 1, c);
      E.px(x - 2, y - 2, c);
      E.px(x + 1, y - 1, c);
      E.px(x + 2, y - 2, c);
    } else {
      E.px(x - 1, y, c);
      E.px(x - 2, y + 1, c);
      E.px(x + 1, y, c);
      E.px(x + 2, y + 1, c);
    }
  };

  A.flower = function (x, y, p, col) {
    if (p <= 0) return;
    const h = Math.round(5 * Math.min(1, p * 2));
    E.rect(x, y - h, 1, h, "#3d822b");
    if (p > 0.5) {
      const r = (p - 0.5) * 2;
      E.px(x - 1, y - h - 1, col, 1);
      E.px(x + 1, y - h - 1, col, 1);
      E.px(x, y - h - 2, col, 1);
      E.px(x, y - h, col, 1);
      if (r > 0.5) E.px(x, y - h - 1, "#fff2a0", 1);
    }
  };
})();
