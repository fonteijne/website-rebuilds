/* The film, shot by shot. Every shot is draw(t) with t = global time in seconds. */
(function () {
  const E = window.QE, A = window.QA;
  const { clamp, lerp, seg, easeOut, easeIn, easeInOut, sine, backOut } = E;
  const S = (window.QS = {});
  const L = {}; // baked layers
  const SKY = {};

  function skyCanvas(key, stops) {
    if (SKY[key]) return SKY[key];
    const c = E.canvas(E.LW, E.LH);
    E.use(c.getContext("2d"));
    A.sky(stops);
    SKY[key] = c;
    return c;
  }
  function blitSky(key, a = 1) {
    E.screen();
    E.alpha(a, () => E.g.drawImage(SKY[key], 0, 0));
  }

  // ---------------------------------------------------------------- world geometry
  const GROUND_L = 262, GROUND_R = 258, DECK = 258;
  const EDGE_L = 300, EDGE_R = 560, GAP_C = 430;
  const HERO_X = 255;
  const CHEST_X = 700;

  // correct stone-arch bridge cells
  const BRIDGE = [];
  (function () {
    const intr = (x) => 335 - 62 * (1 - Math.pow((x - GAP_C) / 136, 2));
    for (let x = 294; x < 566; x += 10)
      for (let y = DECK; y < 336; y += 7) {
        const cx = x + 5, cy = y + 3.5;
        if (y < DECK + 14 || cy < intr(cx)) BRIDGE.push({ x, y });
      }
    // build order: left→right, bottom→top within a column
    BRIDGE.sort((a, b) => a.x - b.x || b.y - a.y);
  })();
  // the wrong bridge: loops back over the hero
  const LOOP = [];
  (function () {
    const cx = 205, cy = DECK + 2;
    for (let layer = 0; layer < 2; layer++) {
      const r = 96 - layer * 8;
      const n = Math.round((Math.PI * r) / 10);
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI;
        LOOP.push({ x: cx + Math.cos(a) * r - 5, y: cy - Math.sin(a) * r - 4, i, layer, n });
      }
    }
    LOOP.sort((a, b) => a.i / a.n - b.i / b.n);
    const r = E.rng(404);
    LOOP.forEach((b) => ((b.vx = (GAP_C + 60 - b.x) * (0.9 + r() * 0.6)), (b.vy = -40 - r() * 90), (b.d = r() * 0.35), (b.rot = (r() - 0.5) * 8)));
  })();
  const DUCK = A.duckCells();
  const DUCK_CELL = 6, DUCK_X = 372, DUCK_Y = 140;

  // ---------------------------------------------------------------- build layers
  S.build = function () {
    L.far = A.ridge({ w: 1700, h: 210, seed: 3, base: 200, amp: 110, body: "#7c92c2", light: "#a3b6dc", snow: "#eef4fb", snowLine: 108 });
    L.mid = A.ridge({ w: 1700, h: 170, seed: 8, base: 165, amp: 80, body: "#5f9584", light: "#7db39a" });
    L.castle = A.castle();
    L.canyon = A.canyon({ w: 520, h: 300, seed: 5 });
    L.cliffL = A.cliff({ w: 780, h: 320, seed: 11, side: "right" });
    L.cliffR = A.cliff({ w: 780, h: 320, seed: 23, side: "left" });
    L.clouds = [0, 1, 2, 3, 4].map((i) => A.cloud(100 + i, 70 + i * 14, 26 + (i % 3) * 6));
    L.treeA = A.tree(7, 22);
    L.treeB = A.tree(9, 16);
    L.templeMtn = A.templeMountain();
    L.facade = A.templeFacade();
    L.interior = A.interior();
    L.pillar = A.pillar(360);
    L.forestFar = A.forestRow({ w: 1400, h: 150, seed: 2, pal: ["#24563a", "#2f6b44", "#3f8150", "#2a1d12"], size: 26, gap: 24 });
    L.forestMid = A.forestRow({ w: 1400, h: 190, seed: 4, pal: ["#2f7a3a", "#3f9a45", "#68c055", "#5a3a22"], size: 34, gap: 40 });
    // night silhouettes for the end card
    L.farNight = A.ridge({ w: 1700, h: 210, seed: 3, base: 200, amp: 110, body: "#141a36", light: "#1c2448" });
    L.castleNight = A.castle({ wall: "#1f2850", shade: "#18203f", roof: "#2a2f5c", roofD: "#20254a", win: "#ffd860", hill: "#121a30", hillL: "#16203a" });
    skyCanvas("day", A.SKY_DAY);
    skyCanvas("dusk", A.SKY_DUSK);
    skyCanvas("night", A.SKY_NIGHT);
    skyCanvas("gold", A.SKY_GOLD);
    skyCanvas("temple", [[0, "#1a120c"], [1, "#3a2a1a"]]);
    skyCanvas("close", [[0, "#5d9be6"], [0.6, "#a7d3f5"], [1, "#e9f5fb"]]);
    skyCanvas("closeGold", [[0, "#5a3a14"], [0.6, "#b8862e"], [1, "#f6d27a"]]);
    skyCanvas("closeDusk", [[0, "#4a3a8a"], [0.6, "#d77a7a"], [1, "#ffd59a"]]);
  };

  // ---------------------------------------------------------------- shared drawing
  function hero(pose, x, y, o = {}) {
    E.shadow(x, y, 14);
    E.sprite(pose, x, y + 1, o);
  }
  function walkBob(t, freq = 4) {
    return -Math.abs(Math.sin(t * Math.PI * freq)) * 2.5;
  }

  // the gap world. cam = {x, y, z}; opts: sky key, gold blend, bridge fn, etc.
  function worldA(t, cam, o = {}) {
    const { x: cx, y: cy, z } = cam;
    blitSky(o.sky || "day");
    if (o.gold) blitSky("gold", o.gold);
    // clouds
    E.cam(cx, cy, z, 0.08);
    L.clouds.forEach((c, i) => {
      const x = (((i * 230 + t * (6 + i * 2)) % 1000) + 1000) % 1000 - 300;
      E.g.drawImage(c, Math.round(x), Math.round(-150 + (i % 3) * 30));
    });
    if (o.templeMountain) {
      E.cam(cx, cy, z, 0.3);
      E.g.drawImage(L.templeMtn, -160, -170);
      // chalice glow on the summit
      const gl = 0.55 + 0.35 * Math.sin(t * 3);
      A.chalice(100, -128, 1, gl);
    } else {
      E.cam(cx, cy, z, 0.2);
      E.g.drawImage(L.far, -560, -96);
    }
    E.cam(cx, cy, z, 0.35);
    if (!o.noCastle) E.g.drawImage(L.castle, -230, -40);
    if (o.crystals) o.crystals(0.35);
    E.cam(cx, cy, z, 0.5);
    E.g.drawImage(L.mid, -520, 8);
    E.rect(-3000, 176, 8000, 900, "#527f74"); // ground beyond the hills, for wide shots
    // canyon behind the gap + waterfall
    E.cam(cx, cy, z, 0.85);
    const cxL = GAP_C * 0.85 - 260;
    waterfall(t, cxL + 300, 150, 22, 120, false);
    E.g.drawImage(L.canyon, Math.round(cxL), 238);
    waterfall(t, cxL + 300, 238, 22, 276);
    // birds
    if (o.birds) {
      E.cam(cx, cy, z, 0.6);
      for (let k = 0; k < 4; k++) A.bird(((t * 28 + k * 37) % 900) - 200, 40 + k * 9 + Math.sin(t * 2 + k) * 3, t, k);
    }
    // cliffs
    E.cam(cx, cy, z, 1);
    if (o.behindCliffs) o.behindCliffs();
    E.g.drawImage(L.cliffL, EDGE_L - 780 + 8, GROUND_L - 7);
    E.g.drawImage(L.cliffR, EDGE_R - 10, GROUND_R - 7);
    // trees on the cliffs
    E.g.drawImage(L.treeA, -60, GROUND_L - 54);
    E.g.drawImage(L.treeB, 30, GROUND_L - 40);
    E.g.drawImage(L.treeA, 820, GROUND_R - 54);
    E.g.drawImage(L.treeB, 905, GROUND_R - 40);
    // broken stubs of the old bridge
    if (!o.noStubs) {
      A.block(EDGE_L - 6, DECK);
      A.block(EDGE_L + 4, DECK + 1);
      A.block(EDGE_L - 2, DECK + 7);
      A.block(EDGE_R - 6, DECK);
      A.block(EDGE_R - 14, DECK + 2);
    }
    // chest
    A.chest(CHEST_X, GROUND_R, o.chestOpen || 0, o.chestGlow || 0);
    if (!o.chestOpen) {
      const k = (t * 1.3) % 3;
      if (k < 0.4) E.star(CHEST_X + 10, GROUND_R - 22, 2, "#fff6c8", Math.sin((k / 0.4) * Math.PI));
    }
    if (o.flowers) o.flowers();
  }

  function waterfall(t, x, y0, w, h, mist = true) {
    const g = E.g;
    for (let i = 0; i < w; i++) {
      const edge = i < 2 || i > w - 3;
      g.fillStyle = edge ? "#8cc8f0" : "#bfe6ff";
      g.fillRect(Math.round(x + i), y0, 1, h);
      // falling streaks
      const sp = 90 + (i * 37) % 50;
      for (let k = 0; k < 4; k++) {
        const yy = ((t * sp + k * 83 + i * 29) % h) + y0;
        g.fillStyle = "#ffffff";
        g.fillRect(Math.round(x + i), Math.round(yy), 1, 6 + (i % 3) * 3);
      }
    }
    // mist
    if (mist) E.alpha(0.7, () => {
      for (let k = 0; k < 7; k++) E.disc(x + w / 2 + Math.sin(t * 1.3 + k) * 18 + (k - 3) * 6, y0 + h - 70 + Math.sin(t * 2 + k * 1.7) * 4, 9 + (k % 3) * 3, "#e8f6ff");
    });
  }

  function closeup(t, head, o = {}) {
    blitSky(o.sky || "close");
    E.screen();
    // bokeh
    const r = E.rng(o.seed || 3);
    for (let i = 0; i < 14; i++) {
      const bx = r() * 640, by = r() * 360, br = 6 + r() * 16;
      E.alpha(0.18, () => E.disc(bx + Math.sin(t * 0.6 + i) * 6, by, br, o.bokeh || "#ffffff"));
    }
    const p = seg(t, o.a, o.b);
    const s = (o.s0 || 1.75) + ((o.s1 || 1.9) - (o.s0 || 1.75)) * sine(p);
    const x = o.x || 320;
    E.sprite(head, x + (o.dx || 0) * p, 372 + (o.lift || 0), { scale: s, flip: o.flip });
    if (o.after) o.after(p, s);
  }

  // ---------------------------------------------------------------- particles helpers
  function burst(t, t0, x, y, n, seed, o = {}) {
    const u = t - t0;
    if (u < 0 || u > (o.life || 1.6)) return;
    const r = E.rng(seed);
    const cols = o.cols || ["#fff6c8", "#ffe27a", "#ffd04a", "#f5b72e"];
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, sp = (o.speed || 120) * (0.3 + r() * 0.9);
      const k = 3;
      const e = (1 - Math.exp(-k * u)) / k;
      const px = x + Math.cos(a) * sp * e, py = y + Math.sin(a) * sp * e + (o.grav || 30) * u * u;
      const life = (o.life || 1.6) * (0.5 + r() * 0.5);
      const al = clamp(1 - u / life);
      if (al <= 0) continue;
      E.alpha(al, () => E.px(px, py, cols[i % cols.length], o.size || (1 + Math.floor(r() * 2))));
    }
  }
  function sparkles(t, t0, dur, x, y, rad, n, seed, col = "#fff6c8") {
    const u = t - t0;
    if (u < 0 || u > dur) return;
    const r = E.rng(seed);
    for (let i = 0; i < n; i++) {
      const d = r() * dur * 0.7, sx = x + (r() - 0.5) * 2 * rad, sy = y + (r() - 0.5) * 2 * rad * 0.7;
      const v = u - d;
      if (v < 0 || v > 0.6) continue;
      E.star(sx, sy - v * 10, 1 + (i % 2), col, Math.sin((v / 0.6) * Math.PI));
    }
  }
  function puff(t, t0, x, y, seed, n = 6, col = "#d9cfbf") {
    const u = t - t0;
    if (u < 0 || u > 0.8) return;
    const r = E.rng(seed);
    for (let i = 0; i < n; i++) {
      const a = Math.PI + r() * Math.PI, d = 6 + u * 30 * (0.5 + r());
      E.alpha(1 - u / 0.8, () => E.disc(x + Math.cos(a) * d, y + Math.sin(a) * d * 0.4, 2 + u * 6 * r(), col));
    }
  }
  function thoughtBubble(x, y, a, drawFn) {
    E.alpha(a, () => {
      E.disc(x - 18, y + 26, 2, "#ffffff");
      E.disc(x - 12, y + 18, 3, "#ffffff");
      E.ellipse(x, y, 30, 18, "#ffffff");
      E.ellipse(x, y, 28, 16, "#eef7ff");
      drawFn(x, y);
    });
  }
  function bridgeIcon(x, y, col = "#3d6fd6") {
    E.rect(x - 18, y + 2, 36, 2, col);
    for (let i = 0; i <= 12; i++) E.px(x - 18 + i * 3, y + 2 - Math.round(7 * Math.sin((i / 12) * Math.PI)), col, 2);
    E.rect(x - 18, y + 2, 2, 8, col);
    E.rect(x + 16, y + 2, 2, 8, col);
  }

  // ---------------------------------------------------------------- SCENE 1 · De wereld van AI
  S.s1 = function (t) {
    const pTilt = easeInOut(seg(t, 0, 3.4));
    const pPan = easeInOut(seg(t, 3.4, 4.8));
    const pBack = easeInOut(seg(t, 5.4, 6.4));
    const cx = 330 + 290 * pPan - 290 * pBack + 10 * seg(t, 7, 10);
    const cy = lerp(40, 178, pTilt) - 12 * seg(t, 7, 10);
    const z = 1 + 0.35 * easeInOut(seg(t, 7.2, 10));
    worldA(t, { x: cx, y: cy, z }, { birds: true });
    E.cam(cx, cy, z, 1);
    // hero: looks at the gap (back), then turns and reaches into his backpack
    const turned = t > 5.9;
    const crystalOut = seg(t, 6.3, 7.5);
    if (!turned) hero("back", HERO_X, GROUND_L);
    else hero("three-quarter", HERO_X, GROUND_L + (t < 6.4 ? -1 : 0), { sy: t > 6.2 && t < 6.5 ? 0.96 : 1 });
    // crystal emerges and floats up
    if (t > 6.3) {
      const p = easeOut(crystalOut);
      const fl = seg(t, 7.5, 10);
      const x = lerp(HERO_X - 6, 300, easeInOut(fl)) ;
      const y = lerp(GROUND_L - 60, GROUND_L - 66, p) - 30 * easeInOut(fl) + Math.sin(t * 2.6) * 2 * fl;
      const s = lerp(4, 10, p) + 2 * fl;
      A.crystal(x, y, s, t * 2.2, 0.25 + 0.6 * fl);
      if (fl > 0) {
        for (let i = 0; i < 6; i++) {
          const a = t * 2 + (i * Math.PI) / 3;
          E.alpha(0.8 * fl, () => E.px(x + Math.cos(a) * 22, y + Math.sin(a) * 7, "#bfe8ff", 2));
        }
      }
      sparkles(t, 7.5, 1.6, x, y, 26, 14, 21, "#dff4ff");
      burst(t, 6.35, HERO_X - 6, GROUND_L - 60, 18, 9, { cols: ["#bfe8ff", "#7fd0ff", "#ffffff"], speed: 60, life: 0.9 });
    }
  };

  // ---------------------------------------------------------------- SCENE 2 · De verkeerde magie
  const CRY2 = { x: 305, y: 190 };
  function duck(t, built, poof) {
    // cells fly in from the crystal, bob together, then poof apart
    const bob = Math.sin(t * 5) * 2;
    DUCK.forEach((c, i) => {
      const tx = DUCK_X + (17 - c.k) * DUCK_CELL, ty = DUCK_Y + c.r * DUCK_CELL + bob;
      const d = (i / DUCK.length) * 0.75;
      const p = clamp((built - d) / 0.25);
      if (p <= 0) return;
      let x = lerp(CRY2.x, tx, easeOut(p)), y = lerp(CRY2.y, ty, easeOut(p)) - Math.sin(p * Math.PI) * 30;
      let a = 1;
      if (poof > 0) {
        const r = E.rng(i + 50);
        x += (r() - 0.5) * 220 * poof;
        y += (r() - 0.6) * 160 * poof + 120 * poof * poof;
        a = 1 - poof;
      }
      const pal = A.DUCK_PAL[c.ch];
      E.alpha(a, () => A.block(x, y, DUCK_CELL, DUCK_CELL, pal));
    });
  }
  function loopBridge(t, built, fall) {
    LOOP.forEach((b, i) => {
      const d = (i / LOOP.length) * 0.85;
      const p = clamp((built - d) / 0.15);
      if (p <= 0) return;
      let x = lerp(CRY2.x, b.x, easeOut(p)), y = lerp(CRY2.y, b.y, easeOut(p));
      // wobble before the fall
      const wob = t > 18.4 && t < 19.6 ? Math.sin(t * 30) * 1.5 * seg(t, 18.4, 19.6) * (1 - b.y / 300) : 0;
      x += wob;
      if (fall > 0) {
        const u = Math.max(0, fall - b.d);
        x += b.vx * u;
        y += b.vy * u + 520 * u * u;
      }
      if (y > 520) return;
      A.block(x, y);
    });
  }
  S.s2 = function (t) {
    // 10.0–13.4 wide: the bubble, the projection, the duck
    // 15.2–21.0 wide: the big scroll, the wrong bridge, the collapse
    const cx = 400, cy = 170;
    const shake = t > 19.6 && t < 20.8 ? (1 - seg(t, 19.6, 20.8)) * 5 : 0;
    const sx = shake * Math.sin(t * 80), sy = shake * Math.cos(t * 67);
    const z = t < 15.2 ? 1.05 : 1.0;
    worldA(t, { x: cx + sx, y: cy + sy, z });
    E.cam(cx + sx, cy + sy, z, 1);
    const fl = Math.sin(t * 2.6) * 2;
    // hero
    if (t < 15.2) {
      hero("three-quarter", HERO_X, GROUND_L);
    } else if (t < 18.4) {
      hero("map", HERO_X, GROUND_L);
    } else {
      hero(t < 19.6 ? "three-quarter" : "back-three-quarter", HERO_X, GROUND_L);
    }
    // crystal
    const blink = (t > 11.3 && t < 11.6) || (t > 15.9 && t < 16.1) ? 1 : 0;
    A.crystal(CRY2.x, CRY2.y + fl, 12, t * 2.4 + (t > 15.9 ? t * 4 : 0), 0.7 + blink * 0.6);
    if (blink) E.glow(CRY2.x, CRY2.y, 40, "#ffffff", 0.6, 4);

    if (t < 15.2) {
      // thought bubble with a little bridge, then a beam of blue particles to the crystal
      const ba = seg(t, 10.1, 10.5) * (1 - seg(t, 11.3, 11.6));
      if (ba > 0) thoughtBubble(HERO_X + 26, GROUND_L - 118, ba, (x, y) => bridgeIcon(x, y - 2));
      if (t > 10.6 && t < 11.5) {
        for (let i = 0; i < 16; i++) {
          const q = ((t - 10.6) * 1.6 + i / 16) % 1;
          E.alpha(0.9, () => E.px(lerp(HERO_X + 26, CRY2.x, q), lerp(GROUND_L - 112, CRY2.y, q) + Math.sin(q * 9 + i) * 3, "#9fe0ff", 2));
        }
      }
      // the duck
      const built = seg(t, 11.6, 13.0);
      duck(t, built, 0);
      if (t > 13.0) {
        // pop + reaction
        sparkles(t, 13.0, 1.2, DUCK_X + 54, DUCK_Y + 45, 60, 14, 5);
        const ea = seg(t, 13.05, 13.2);
        E.alpha(ea, () => {
          E.bitmap([".RR..R.", ".RR.R.R", ".RR...R", ".RR..R.", ".RR..R.", "......", ".RR..R."], { R: "#e83a3a" }, HERO_X - 14, GROUND_L - 104, 2);
        });
      }
    } else {
      // duck poofs as the big scroll unrolls
      duck(t, 1, easeOut(seg(t, 15.2, 15.8)));
      const ua = seg(t, 15.2, 15.7), uf = 1 - seg(t, 16.3, 16.8);
      if (uf > 0)
        E.alpha(uf, () =>
          A.parchment(HERO_X + 10, GROUND_L - 130, 120, 54, easeOut(ua), (x, y, w, h) => {
            bridgeIcon(x + w / 2, y + h / 2 - 2);
            for (let i = 0; i < 5; i++) E.rect(x + 10 + i * 22, y + 8, 14, 1, "#9bb6e8");
            for (let i = 0; i < 3; i++) E.rect(x + 8, y + h - 10 + i * 3 - 4, w - 16, 1, "#c9b27a");
          }),
        );
      // the wrong bridge: built super fast, wobbles, falls
      const built = seg(t, 16.0, 18.4);
      const fall = Math.max(0, t - 19.6);
      loopBridge(t, built, fall);
      if (t > 19.6) {
        puff(t, 19.6, 210, 170, 77, 10, "#cfc6b6");
        puff(t, 19.9, EDGE_L, DECK, 78, 8, "#cfc6b6");
      }
      if (t > 18.6 && t < 19.6) {
        // cracks
        E.alpha(seg(t, 18.6, 19.0), () => {
          E.line(200, 166, 206, 178, "#3a3026", 1);
          E.line(206, 178, 201, 186, "#3a3026", 1);
        });
      }
    }
  };
  S.s2sigh = function (t) {
    closeup(t, "head-sigh", { a: 13.4, b: 15.2, s0: 1.7, s1: 1.82, after: (p) => {
      // sweat drop slides down
      const y = 120 + p * 26;
      E.disc(470, y, 6, "#8fd0ff");
      E.poly([[464, y - 2], [470, y - 16], [476, y - 2]], "#8fd0ff");
      E.px(467, y - 3, "#ffffff", 3);
    } });
  };
  S.s2frown = function (t) {
    closeup(t, "head-frown", { a: 20.8, b: 22.2, s0: 1.85, s1: 1.95, seed: 9, after: (p) => {
      // storm scribble above the head
      const cx = 330, cy = 34;
      for (let i = 0; i < 40; i++) {
        const a = i * 0.5 + t * 6, r = 10 + (i % 8) * 3;
        E.px(cx + Math.cos(a) * r * 1.6, cy + Math.sin(a) * r * 0.5 + i * 0.3, "#3a3f55", 3);
      }
    } });
  };

  // ---------------------------------------------------------------- SCENE 3 · De zoektocht begint
  S.s3map = function (t) {
    // the map slips out of the backpack and flutters down
    const cx = HERO_X + 10, cy = GROUND_L - 50;
    worldA(t, { x: cx, y: cy, z: 2.1 }, {});
    E.cam(cx, cy, 2.1, 1);
    hero("front", HERO_X, GROUND_L);
    const p = seg(t, 22.2, 23.4);
    const mx = HERO_X + 14 + Math.sin(p * 9) * 8 * (1 - p) + 16 * p;
    const my = lerp(GROUND_L - 56, GROUND_L - 4, easeIn(p));
    A.parchment(mx, my, 20 * (0.6 + 0.4 * Math.abs(Math.cos(p * 8))), 13, 1, (x, y, w, h) => A.chalice(x + w / 2, y + h - 1, 0.5, 0));
    if (p >= 1) puff(t, 23.4, mx, GROUND_L, 33, 5);
  };
  S.s3mapClose = function (t) {
    E.screen();
    E.rect(0, 0, 640, 360, "#3a2a1a");
    const p = seg(t, 23.6, 25.2);
    const z = 1 + 0.12 * sine(p);
    E.g.setTransform(z, 0, 0, z, 320 - 320 * z, 180 - 180 * z);
    A.parchment(320, 180, 560, 320, 1, (x, y, w, h) => {
      // terrain sketch
      for (let i = 0; i < 4; i++) E.poly([[x + 330 + i * 40, y + 170], [x + 355 + i * 40, y + 110 - (i % 2) * 20], [x + 380 + i * 40, y + 170]], "#b89766");
      E.poly([[x + 385, y + 165], [x + 425, y + 80], [x + 465, y + 165]], "#9a7646");
      E.poly([[x + 425, y + 80], [x + 465, y + 165], [x + 425, y + 165]], "#7f5f36");
      // red dashed path
      for (let i = 0; i < 30; i++) {
        const q = i / 30;
        const px = x + 70 + q * 340, py = y + 260 - q * 140 + Math.sin(q * 9) * 24;
        if (i % 2 === 0 && q < seg(t, 23.8, 24.8)) E.rect(px, py, 5, 3, "#c0392b");
      }
      E.line(x + 60, y + 250, x + 76, y + 266, "#c0392b", 3);
      E.line(x + 76, y + 250, x + 60, y + 266, "#c0392b", 3);
      // the chalice
      A.chalice(x + 425, y + 74, 3, 0.4 + 0.4 * Math.sin(t * 4));
      // compass rose
      E.ring(x + 90, y + 70, 22, "#8a6a3a", 2);
      E.line(x + 90, y + 44, x + 90, y + 96, "#8a6a3a", 2);
      E.line(x + 64, y + 70, x + 116, y + 70, "#8a6a3a", 2);
    });
  };
  S.s3look = function (t) {
    const p = easeInOut(seg(t, 25.2, 27.6));
    const cx = lerp(HERO_X + 30, 120, p), cy = lerp(GROUND_L - 40, -80, p), z = lerp(2, 1.0, p);
    worldA(t, { x: cx, y: cy, z }, { templeMountain: true, noCastle: true });
    E.cam(cx, cy, z, 1);
    hero("back", HERO_X, GROUND_L);
    sparkles(t, 25.6, 2.2, 100 * 0.3 + 0, -130, 30, 8, 3);
  };

  // montage
  function montageRun(t, t0, kind) {
    const u = t - t0;
    E.screen();
    if (kind === "forest") {
      blitSky("day");
      E.g.drawImage(L.forestFar, -((u * 120 + 200) % 700), 140);
      E.g.drawImage(L.forestMid, -((u * 300 + 100) % 700), 150);
      E.rect(0, 300, 640, 60, "#7a5a36");
      E.rect(0, 300, 640, 4, "#5aa83a");
      for (let i = 0; i < 12; i++) E.rect(((i * 90 - u * 520) % 700 + 700) % 700 - 40, 318 + (i % 3) * 12, 18, 3, "#6a4a2a");
      const by = 300 + walkBob(u, 5) * 2;
      hero("run", 300, by, { scale: 0.42 });
      for (let k = 0; k < 4; k++) puff(t, t0 + k * 0.22, 270, 300, 40 + k, 4);
      // foreground trunks rushing past
      for (let i = 0; i < 3; i++) {
        const x = ((i * 300 - u * 1100) % 900 + 900) % 900 - 120;
        E.rect(x, 0, 34, 360, "#2a1d12");
        E.rect(x + 4, 0, 8, 360, "#3a2a1a");
      }
    } else if (kind === "ridge") {
      blitSky("day");
      E.g.drawImage(L.far, -((u * 40) % 400) - 200, 40);
      // rocky platforms with gaps
      const off = u * 380;
      for (let i = 0; i < 8; i++) {
        const x = i * 180 - off - 100;
        E.rect(x, 290, 130, 70, "#8a7458");
        E.rect(x, 290, 130, 6, "#58a83a");
        E.rect(x + 100, 296, 30, 64, "#6b5843");
      }
      const jp = seg(u, 0.2, 0.75);
      const y = 290 - Math.sin(jp * Math.PI) * 90;
      hero("run", 300, y, { scale: 0.42, rot: jp > 0 && jp < 1 ? -0.25 + jp * 0.3 : 0 });
      if (jp >= 1) puff(t, t0 + 0.75, 300, 290, 41, 6);
    } else if (kind === "rocks") {
      blitSky("dusk");
      E.g.drawImage(L.far, -((u * 60) % 400) - 100, 60);
      E.rect(0, 300, 640, 60, "#6b5843");
      E.rect(0, 300, 640, 4, "#8a7458");
      const dodge = Math.sin(seg(u, 0.25, 0.55) * Math.PI) * -40;
      hero("run", 320 + dodge, 300, { scale: 0.42 });
      const r = E.rng(17);
      for (let i = 0; i < 7; i++) {
        const d = r() * 0.6, x = 120 + r() * 420, s = 10 + r() * 14;
        const v = u - d;
        if (v < 0) continue;
        const y = -30 + 900 * v * v;
        if (y < 300 - s) {
          E.disc(x, y, s, "#6b4a2e");
          E.disc(x - s * 0.3, y - s * 0.3, s * 0.5, "#80603f");
        } else puff(t, t0 + d + Math.sqrt((300 - s + 30) / 900), x, 300, 60 + i, 7, "#b8a888");
      }
    } else {
      blitSky("dusk");
      E.rect(0, 300, 640, 60, "#6b5843");
      E.rect(0, 300, 640, 4, "#8a7458");
      // boulder rolling after him
      const bx = -60 + u * 420;
      E.disc(bx, 262, 40, "#5a4030");
      E.disc(bx - 12, 250, 18, "#6f5038");
      E.line(bx, 262, bx + Math.cos(u * 12) * 36, 262 + Math.sin(u * 12) * 36, "#3a2a1a", 3);
      hero("run", 380 + u * 60, 300 + walkBob(u, 6), { scale: 0.42 });
      // speed lines
      for (let i = 0; i < 10; i++) E.rect(((i * 97 - u * 1400) % 700 + 700) % 700 - 30, 40 + i * 28, 60, 2, "rgba(255,255,255,0.7)");
    }
  }
  S.s3m1 = (t) => montageRun(t, 27.6, "forest");
  S.s3m2 = (t) => montageRun(t, 28.5, "ridge");
  S.s3m3 = (t) => montageRun(t, 29.4, "rocks");
  S.s3m4 = (t) => montageRun(t, 30.3, "boulder");
  S.s3temple = function (t) {
    const p = easeInOut(seg(t, 31.4, 34));
    E.screen();
    blitSky("dusk");
    E.g.drawImage(L.forestFar, -100, 170);
    const z = 1 + 0.25 * p;
    E.g.setTransform(z, 0, 0, z, 320 - 320 * z, 200 - 200 * z);
    E.g.drawImage(L.facade, 0, 0);
    A.chalice(320, 110, 1.4, 0.5 + 0.3 * Math.sin(t * 3) + 0.3 * p);
    // hero climbs the stairs
    const hy = lerp(372, 262, easeInOut(seg(t, 31.6, 33.8)));
    hero("back", 320, hy, { scale: lerp(0.34, 0.22, seg(t, 31.6, 33.8)) });
  };

  // ---------------------------------------------------------------- SCENE 4 · De Heilige Graal
  const ALTAR_X = 450, ALTAR_Y = 300, GRAIL_Y = 222;
  const SYM_POS = [["target", 380, 170], ["book", 425, 140], ["clock", 475, 140], ["tools", 520, 170]];
  function interior(t, cam, o = {}) {
    const { x: cx, y: cy, z } = cam;
    blitSky("temple");
    E.cam(cx, cy, z, 0.9);
    E.g.drawImage(L.interior, -20, 0);
    E.cam(cx, cy, z, 1);
    // altar
    E.rect(ALTAR_X - 40, ALTAR_Y - 10, 80, 10, "#8c7856");
    E.rect(ALTAR_X - 30, ALTAR_Y - 28, 60, 18, "#a8926b");
    E.rect(ALTAR_X - 30, ALTAR_Y - 28, 60, 3, "#c4ad84");
    E.rect(ALTAR_X - 34, ALTAR_Y - 31, 68, 4, "#6a5a40");
    // torches
    [150, 330, 570, 750].forEach((x, k) => A.torch(x, 150, t, k));
    // light shaft
    const sh = o.shaft == null ? 1 : o.shaft;
    E.alpha(0.16 * sh, () => E.poly([[ALTAR_X - 30, -20], [ALTAR_X + 30, -20], [ALTAR_X + 70, ALTAR_Y - 28], [ALTAR_X - 70, ALTAR_Y - 28]], "#ffe9a0"));
    // dust motes in the shaft
    for (let i = 0; i < 18; i++) {
      const r = E.rng(i + 7);
      const y = ((r() * 300 + t * (6 + r() * 8)) % 280) - 10;
      E.alpha(0.6 * sh, () => E.px(ALTAR_X - 40 + r() * 80 + Math.sin(t + i) * 6, 280 - y, "#fff6c8", 1));
    }
  }
  function pillarsFront(cx, cy, z) {
    E.cam(cx, cy, z, 1.4);
    E.g.drawImage(L.pillar, 40, -10);
    E.g.drawImage(L.pillar, 820, -10);
  }
  S.s4 = function (t) {
    const pApproach = seg(t, 34, 37);
    const pReach = seg(t, 37, 39.5);
    const pBack = easeInOut(seg(t, 40.3, 42.4));
    const zoom = (t < 37 ? 1 : lerp(1, 1.6, easeInOut(pReach))) + (1.2 - 1.6) * pBack;
    const cx = (t < 37 ? lerp(300, 380, easeInOut(pApproach)) : lerp(380, 430, easeInOut(pReach))) + 20 * pBack;
    const cy = (t < 37 ? 190 : lerp(190, 235, easeInOut(pReach))) - 40 * pBack;
    const sh = t > 38.8 && t < 39.5 ? 1.5 * Math.sin(t * 70) : t > 39.5 && t < 40.4 ? 6 * (1 - seg(t, 39.5, 40.4)) * Math.sin(t * 80) : 0;
    interior(t, { x: cx + sh, y: cy, z: zoom });
    E.cam(cx + sh, cy, zoom, 1);
    const bob = Math.sin(t * 2) * 3;
    const exploded = t >= 39.5;
    if (!exploded) {
      const gl = 0.5 + 0.2 * Math.sin(t * 3) + 0.6 * pReach;
      A.chalice(ALTAR_X, GRAIL_Y + bob, 1.4, gl);
      if (pReach > 0.5) E.alpha((pReach - 0.5) * 2, () => E.glow(ALTAR_X, GRAIL_Y - 14 + bob, 50, "#ffffff", 0.5, 4));
    }
    // hero walks in carefully, then reaches
    if (t < 37) {
      const hx = lerp(150, 372, easeInOut(pApproach));
      hero("side", hx, ALTAR_Y + walkBob(t, 1.6));
    } else if (!exploded) {
      hero("three-quarter", 392 + 6 * easeOut(pReach), ALTAR_Y);
    } else {
      // knocked back, surprised
      const kb = easeOut(seg(t, 39.5, 40.1));
      hero("front", 398 - 22 * kb, ALTAR_Y, { rot: -0.06 * (1 - seg(t, 40.1, 40.6)) });
    }
    // explosion: a thousand golden pixels that then swirl into the four symbols
    if (exploded) {
      const r = E.rng(99);
      const N = 520;
      for (let i = 0; i < N; i++) {
        const a = r() * Math.PI * 2, sp = 40 + Math.pow(r(), 0.5) * 260;
        const target = SYM_POS[i % 4];
        const ox = ALTAR_X, oy = GRAIL_Y - 10;
        const u = t - 39.5;
        const k = 2.6, e = (1 - Math.exp(-k * u)) / k;
        let x = ox + Math.cos(a) * sp * e, y = oy + Math.sin(a) * sp * e * 0.8 + 10 * u * u;
        // gather into symbols from 41.6
        const gp = easeInOut(clamp((t - 41.4 - (i % 4) * 0.4 - r() * 0.5) / 0.9));
        const ang = r() * 6.28, rad = r() * 12;
        x = lerp(x, target[1] + Math.cos(ang) * rad, gp);
        y = lerp(y, target[2] + Math.sin(ang) * rad, gp);
        const col = ["#fff6c8", "#ffe27a", "#ffd04a", "#f5b72e"][i % 4];
        const al = gp >= 1 ? 0 : 1;
        if (al) E.px(x, y, col, 1 + (i % 3 === 0 ? 1 : 0));
      }
      if (t < 40.0) E.alpha(1 - seg(t, 39.5, 40.0), () => E.glow(ALTAR_X, GRAIL_Y, 120, "#fff6c8", 0.9, 6));
      // symbols appear one by one
      SYM_POS.forEach(([kind, x, y], k) => {
        const tp = 42.6 + k * 0.42;
        const p = seg(t, tp - 0.2, tp + 0.15);
        if (p <= 0) return;
        const s = 13 * backOut(p);
        A.symbol(kind, x, y + Math.sin(t * 2 + k) * 2, s, 1, 0.6);
        sparkles(t, tp - 0.1, 0.8, x, y, 16, 6, 70 + k, "#ffffff");
      });
    }
    pillarsFront(cx + sh, cy, zoom);
  };
  S.s4surprised = (t) => closeup(t, "head-surprised", { a: 44.6, b: 45.4, s0: 1.85, s1: 1.95, sky: "closeGold", bokeh: "#ffe27a", seed: 4 });
  S.s4smile = (t) => closeup(t, "head-smirk", { a: 45.4, b: 46.4, s0: 1.85, s1: 1.98, sky: "closeGold", bokeh: "#ffe27a", seed: 4 });

  // ---------------------------------------------------------------- SCENE 5 · De ontdekking
  S.s5idea = (t) =>
    closeup(t, "head-determined", {
      a: 46.0, b: 48.6, s0: 1.8, s1: 1.9, sky: "closeGold", bokeh: "#ffe27a", seed: 6,
      after: () => {
        const p = seg(t, 46.15, 46.4);
        if (p <= 0) return;
        const s = 3 * backOut(p);
        const x = 520, y = 70;
        E.glow(x, y, 50 * p, "#ffe27a", 0.7, 5);
        E.disc(x, y, 7 * s, "#ffe27a");
        E.disc(x - 2 * s, y - 2 * s, 2.5 * s, "#fff6c8");
        E.rect(x - 4 * s, y + 6 * s, 8 * s, 4 * s, "#9a9aa8");
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          E.rect(x + Math.cos(a) * 12 * s, y + Math.sin(a) * 12 * s, 3, 3, "#ffe27a");
        }
      },
    });
  const ITEMS = [["drawing", "target"], ["measure", "book"], ["book", "clock"], ["toolbox", "tools"]];
  const ITEM_FLOOR = [392, 428, 472, 508];
  S.s5 = function (t) {
    const cx = 450, cy = lerp(225, 210, seg(t, 48.6, 58)), z = lerp(1.55, 1.3, easeInOut(seg(t, 48.6, 57)));
    const lightUp = seg(t, 58.4, 61.8);
    interior(t, { x: cx, y: cy, z }, { shaft: 1 + lightUp * 2 });
    E.cam(cx, cy, z, 1);
    const ordered = seg(t, 56.4, 57.6);
    // symbols hovering
    SYM_POS.forEach(([kind, x, y], k) => {
      const hit = 54.0 + k * 0.6;
      const flash = t > hit && t < hit + 0.5 ? 1 - seg(t, hit, hit + 0.5) : 0;
      A.symbol(kind, x, y + Math.sin(t * 2 + k) * 2 * (1 - ordered), 13 + flash * 4, 1, 0.5 + flash);
    });
    // beams connecting the symbols + the core
    if (t > 56.0) {
      const p = seg(t, 56.0, 56.8);
      const core = [ALTAR_X, 105];
      const pts = SYM_POS.map((s) => [s[1], s[2]]);
      E.alpha(p, () => {
        for (let i = 0; i < 3; i++) E.line(...pts[i], ...pts[i + 1], "#ffe27a", 2);
        pts.forEach((q) => E.line(q[0], q[1], core[0], core[1], "#ffd860", 1));
        A.emblem(core[0], core[1], 16 + 6 * ordered, p, 0.8 + lightUp, t * 0.4 * ordered);
      });
      // chaos → order: particles swirl randomly, then lock into neat orbits
      const r = E.rng(5);
      for (let i = 0; i < 90; i++) {
        const ra = r() * 6.28, rr = 30 + r() * 110, sp = 1 + r() * 3;
        const chaosX = ALTAR_X + Math.cos(ra + t * sp) * rr * (0.6 + 0.4 * Math.sin(t * 3 + i));
        const chaosY = 170 + Math.sin(ra * 1.7 + t * sp * 1.3) * rr * 0.5;
        const ring = i % 3, ang = (i / 30) * 6.283 + t * (0.8 + ring * 0.3);
        const ordX = core[0] + Math.cos(ang) * (36 + ring * 18), ordY = core[1] + 60 + Math.sin(ang) * (12 + ring * 6);
        E.px(lerp(chaosX, ordX, easeInOut(ordered)), lerp(chaosY, ordY, easeInOut(ordered)), "#ffe9a0", 2);
      }
    }
    // hero by the altar, backpack items pop out and land on the floor, then fly into the symbols
    hero(t < 53.6 ? "front" : "three-quarter", 340, ALTAR_Y);
    ITEMS.forEach(([kind], k) => {
      const tPop = 49.0 + k * 1.0;
      const tFly = 53.5 + k * 0.6;
      if (t < tPop) return;
      const pp = seg(t, tPop, tPop + 0.45);
      let x = lerp(340, ITEM_FLOOR[k], pp), y = lerp(ALTAR_Y - 50, ALTAR_Y - 4, pp) - Math.sin(pp * Math.PI) * 50;
      let s = 1.6;
      if (t > tFly) {
        const fp = easeInOut(seg(t, tFly, tFly + 0.5));
        const [, , sx, sy] = [0, 0, SYM_POS[k][1], SYM_POS[k][2]];
        x = lerp(ITEM_FLOOR[k], sx, fp);
        y = lerp(ALTAR_Y - 4, sy + 10, fp) - Math.sin(fp * Math.PI) * 20;
        s = 1.6 - 1.1 * fp;
        if (fp >= 1) return;
      }
      A.item(kind, x, y, s);
      if (pp < 1) sparkles(t, tPop, 0.6, x, y - 6, 8, 4, 30 + k);
    });
    if (lightUp > 0) E.alpha(lightUp * 0.6, () => E.glow(ALTAR_X, 140, 260, "#fff6c8", 1, 6));
    pillarsFront(cx, cy, z);
  };

  // ---------------------------------------------------------------- SCENE 6 · De kracht van context
  const CRY6 = { x: 340, y: 180 };
  function orbit(t, cx, cy, a, front) {
    const kinds = ["target", "book", "clock", "tools"];
    kinds.forEach((k, i) => {
      const ang = t * 1.4 + (i * Math.PI) / 2;
      const depth = Math.sin(ang);
      if (front !== depth > 0) return;
      const x = cx + Math.cos(ang) * 46, y = cy + depth * 14;
      if (front) E.alpha(a * 0.8, () => E.line(x, y, cx, cy, "#ffd860", 1));
      A.symbol(k, x, y, 9 + depth * 2, a, 0.4);
    });
  }
  S.s6 = function (t) {
    const pRise = seg(t, 62.2, 63.8);
    const pIn = easeInOut(seg(t, 64.0, 65.6));
    const pOut = easeInOut(seg(t, 66.4, 68.8));
    let cx = lerp(340, 320, pIn), cy = lerp(172, 190, pIn), z = lerp(1.15, 1.7, pIn);
    cx = lerp(cx, 440, pOut);
    cy = lerp(cy, 190, pOut);
    z = lerp(z, 1.0, pOut);
    if (t > 73) z += 0.15 * easeInOut(seg(t, 73, 76));
    worldA(t, { x: cx, y: cy, z }, {});
    E.cam(cx, cy, z, 1);
    // the bridge
    const built = t < 70.4 ? 0 : (t - 70.4) / 2.4;
    const n = BRIDGE.length;
    // blueprint ghost
    const bpA = seg(t, 67.2, 67.8) * (1 - seg(t, 72.6, 73.0));
    if (bpA > 0)
      BRIDGE.forEach((b, i) => {
        const flick = 0.55 + 0.25 * Math.sin(t * 12 + i);
        E.alpha(bpA * flick, () => {
          E.rect(b.x, b.y, 10, 1, "#8fe8ff");
          E.rect(b.x, b.y, 1, 7, "#8fe8ff");
        });
      });
    BRIDGE.forEach((b, i) => {
      const d = (i / n) * 0.92;
      const p = clamp((built - d) / 0.08);
      if (p <= 0) return;
      const x = lerp(CRY6.x, b.x, easeOut(p)), y = lerp(CRY6.y, b.y, easeOut(p)) - Math.sin(p * Math.PI) * 26;
      A.block(x, y);
      if (p >= 1 && built - d < 0.12) E.alpha(1 - (built - d - 0.08) / 0.04, () => E.rect(b.x, b.y, 10, 7, "#fff6c8"));
    });
    // completion shimmer along the deck
    if (t > 72.8 && t < 74) {
      const sx = lerp(EDGE_L - 20, EDGE_R + 20, seg(t, 72.8, 73.6));
      E.alpha(0.8 * (1 - seg(t, 73.6, 74)), () => E.glow(sx, DECK + 4, 30, "#fff6c8", 0.8, 4));
      sparkles(t, 72.85, 1.2, GAP_C, DECK - 10, 140, 20, 88);
    }
    // hero
    if (t < 72.8) hero("three-quarter", HERO_X, GROUND_L);
    else {
      const j = (t - 72.9) % 0.55;
      const hop = t > 72.9 ? Math.sin(clamp(j / 0.45) * Math.PI) * 14 : 0;
      hero("cheer", HERO_X, GROUND_L - hop);
    }
    // crystal
    const cy2 = lerp(GROUND_L - 40, CRY6.y, easeOut(pRise)) + Math.sin(t * 2.4) * 2;
    if (t > 64.2) orbit(t, CRY6.x, cy2, seg(t, 64.2, 64.9), false);
    A.crystal(CRY6.x, cy2, 13, t * 2.6, 0.6 + 0.4 * seg(t, 68.8, 70.4));
    if (t > 64.2) orbit(t, CRY6.x, cy2, seg(t, 64.2, 64.9), true);
    if (t > 62.2 && t < 63.6) sparkles(t, 62.3, 1.3, CRY6.x, cy2, 20, 10, 61, "#dff4ff");
    // scan: a beam from the crystal sweeping across the gap, dimension lines appear
    if (t > 66.6 && t < 69.4) {
      const sp = easeInOut(seg(t, 66.7, 68.3));
      const sx = lerp(EDGE_L - 10, EDGE_R + 10, sp);
      E.alpha(0.5 * (1 - seg(t, 68.6, 69.4)), () => {
        E.poly([[CRY6.x, cy2], [sx - 6, 340], [sx + 6, 340]], "#8fe8ff");
        E.rect(sx - 1, 150, 2, 200, "#ffffff");
      });
    }
    if (t > 67.0 && t < 73) {
      const a = seg(t, 67.0, 67.6) * (1 - seg(t, 72.4, 73));
      const w = (EDGE_R - EDGE_L) * seg(t, 67.0, 68.2);
      E.alpha(a, () => {
        E.rect(EDGE_L, 236, w, 1, "#ffe27a");
        E.rect(EDGE_L, 232, 1, 9, "#ffe27a");
        if (w > 250) E.rect(EDGE_R, 232, 1, 9, "#ffe27a");
        const h = 70 * seg(t, 67.4, 68.4);
        E.rect(EDGE_R + 16, DECK, 1, h, "#ffe27a");
        E.rect(EDGE_R + 12, DECK, 9, 1, "#ffe27a");
        for (let i = 0; i < w; i += 26) E.rect(EDGE_L + i, 234, 1, 5, "#ffe27a");
      });
    }
  };
  S.s6laugh = (t) => closeup(t, "head-laugh", { a: 74.6, b: 76.2, s0: 1.8, s1: 1.95, seed: 8, after: () => sparkles(t, 74.6, 1.6, 320, 120, 260, 18, 12) });

  // ---------------------------------------------------------------- SCENE 7 · De echte schat
  function fullBridge() {
    BRIDGE.forEach((b) => A.block(b.x, b.y));
  }
  const WORLD_CRYSTALS = [[-160, 0, 0.35], [-100, -50, 0.35], [-40, -20, 0.35], [10, 10, 0.35], [-1, 0, 1], [880, 190, 1], [980, 150, 1], [140, 205, 1], [-120, 205, 1]];
  S.s7 = function (t) {
    const walk = seg(t, 76.0, 78.8);
    const hx = lerp(HERO_X + 10, CHEST_X - 34, easeInOut(walk));
    const hy = hx < EDGE_L ? GROUND_L : hx > EDGE_R ? GROUND_R : DECK;
    const zoomOut = easeInOut(seg(t, 82.4, 84.6));
    let cx = t < 78.8 ? hx + 30 : lerp(hx + 30, CHEST_X, easeInOut(seg(t, 78.8, 79.6)));
    let cy = t < 78.8 ? 185 : lerp(185, 200, seg(t, 78.8, 79.6));
    let z = t < 78.8 ? 1.25 : lerp(1.25, 1.9, easeInOut(seg(t, 78.8, 80.4)));
    cy = lerp(cy, 175, seg(t, 80.4, 82.4));
    cx = lerp(cx, 430, zoomOut);
    cy = lerp(cy, 120, zoomOut);
    z = lerp(z, 0.62, zoomOut);
    const open = easeOut(seg(t, 79.0, 79.5));
    const bloom = seg(t, 82.6, 84.8);
    worldA(t, { x: cx, y: cy, z }, {
      gold: bloom * 0.75,
      chestOpen: open,
      chestGlow: open * (1 - 0.5 * bloom),
      birds: bloom > 0,
      crystals: (p) => {
        WORLD_CRYSTALS.filter((c) => c[2] === p).forEach(([x, y], i) => {
          const on = seg(t, 82.9 + i * 0.25, 83.3 + i * 0.25);
          if (on > 0) E.alpha(0.3 * on, () => E.poly([[x - 2, y], [x + 2, y], [x + 8, y - 200], [x - 8, y - 200]], "#bfe8ff"));
          A.crystal(x, y, 8, t * 2 + i, on * 1.2);
        });
      },
      flowers: () => {
        const r = E.rng(77);
        for (let i = 0; i < 70; i++) {
          const left = i % 2 === 0;
          const x = left ? -300 + r() * 590 : 575 + r() * 500;
          const d = Math.abs(x - CHEST_X) / 600;
          A.flower(x, left ? GROUND_L : GROUND_R, seg(t, 83.0 + d * 1.4, 83.5 + d * 1.4), ["#ff7aa8", "#ffd860", "#ffffff", "#b08cff"][i % 4]);
        }
      },
    });
    E.cam(cx, cy, z, 1);
    fullBridge();
    WORLD_CRYSTALS.filter((c) => c[2] === 1).forEach(([x, y], i) => {
      if (x < 0) return;
      const on = seg(t, 83.4 + i * 0.3, 83.8 + i * 0.3);
      E.rect(x - 3, y + 10, 6, 30, "#8c7856");
      if (on > 0) E.alpha(0.35 * on, () => E.poly([[x - 3, y], [x + 3, y], [x + 10, y - 260], [x - 10, y - 260]], "#bfe8ff"));
      A.crystal(x, y, 10, t * 2 + i, on * 1.2);
    });
    // hero
    if (t < 78.8) hero("side", hx, hy + walkBob(t, 3.6));
    else hero("three-quarter", hx, hy);
    // the emblem rises out of the chest
    if (t > 79.4) {
      const rise = easeOut(seg(t, 79.6, 80.6));
      const fly = easeIn(seg(t, 82.2, 82.8));
      const ex = CHEST_X, ey = lerp(GROUND_R - 26, GROUND_R - 70, rise) - fly * 140;
      const nodes = seg(t, 80.5, 81.4);
      A.emblem(ex, ey, 12 * Math.max(0.2, rise), 1 - fly * 0.3, 0.7, t * 0.8 * nodes);
      sparkles(t, 79.4, 3, ex, ey, 30, 16, 51);
      if (t > 82.6) {
        // golden wave spreading over the world
        const w = seg(t, 82.6, 84.8);
        E.alpha(1 - w, () => {
          E.ring(ex, ey, 30 + w * 900, "#ffe27a", 4);
          E.ring(ex, ey, 20 + w * 860, "#fff6c8", 2);
        });
      }
    }
    if (t > 79.0 && t < 80.2) burst(t, 79.0, CHEST_X, GROUND_R - 22, 40, 12, { speed: 90, life: 1.2 });
    if (bloom > 0) {
      E.screen();
      const r = E.rng(808);
      for (let i = 0; i < 70; i++) {
        const x = r() * 640, y = (r() * 400 - (t - 82.6) * (20 + r() * 30)) % 380;
        E.alpha(bloom * (0.4 + 0.5 * Math.sin(t * 3 + i)), () => E.px(x + Math.sin(t + i) * 8, (y + 380) % 380, "#ffe9a0", 2));
      }
    }
  };

  // ---------------------------------------------------------------- SCENE 8 · De onthulling
  S.s8grin = (t) => closeup(t, "head-smirk", { a: 85.0, b: 87.0, s0: 1.8, s1: 2.05, sky: "closeDusk", bokeh: "#ffd59a", seed: 11 });
  S.s8wink = (t) =>
    closeup(t, "head-wink", {
      a: 87.0, b: 88.8, s0: 2.0, s1: 2.1, sky: "closeDusk", bokeh: "#ffd59a", seed: 11,
      after: () => {
        const p = seg(t, 87.5, 88.1);
        if (p > 0 && p < 1) {
          const s = Math.sin(p * Math.PI);
          E.glow(392, 176, 34 * s, "#ffffff", 0.8, 4);
          E.star(392, 176, Math.round(8 * s) + 1, "#ffffff", s);
        }
      },
    });
  S.s8wide = function (t) {
    const p = easeInOut(seg(t, 88.8, 90.6));
    const cx = lerp(HERO_X, 330, p), cy = lerp(GROUND_L - 55, 150, p), z = lerp(3.2, 1.0, p);
    worldA(t, { x: cx, y: cy, z }, { sky: "dusk", gold: 0.25 });
    E.cam(cx, cy, z, 1);
    fullBridge();
    // flowing scarf tail in the wind (behind the hero)
    const nx = HERO_X - 2, ny = GROUND_L - 62;
    for (let i = 0; i < 26; i++) {
      const q = i / 26;
      const x = nx - i * 1.6, y = ny + i * 0.45 + Math.sin(t * 9 - i * 0.45) * (1 + q * 5);
      E.rect(x, y - 1, 3, Math.max(2, 6 - q * 4), i % 5 === 0 ? "#b8341c" : "#e2481f");
    }
    hero("side", HERO_X, GROUND_L);
    // wind streaks + petals
    for (let i = 0; i < 10; i++) {
      const x = ((i * 113 - t * 140) % 900 + 900) % 900 - 200, y = 120 + i * 17;
      E.alpha(0.5, () => E.rect(x, y, 14, 1, "#ffffff"));
      E.px(x + 30, y + Math.sin(t * 4 + i) * 5, "#ff9aa8", 2);
    }
  };
  S.title = function (t) {
    blitSky("night");
    E.screen();
    const r = E.rng(1);
    for (let i = 0; i < 120; i++) {
      const x = r() * 640, y = r() * 230, tw = 0.5 + 0.5 * Math.sin(t * (1 + r() * 3) + i);
      E.alpha(0.3 + 0.7 * tw, () => E.px(x, y, "#ffffff", r() > 0.9 ? 2 : 1));
    }
    E.cam(330, 110, 1, 0.2);
    E.g.drawImage(L.farNight, -560, -10);
    E.cam(330, 110, 1, 0.35);
    E.g.drawImage(L.castleNight, -50, 110);
    // little glowing crystals over the sleeping world
    [[20, 120], [140, 100], [230, 140], [-30, 150]].forEach(([x, y], i) => A.crystal(x, y, 4, t + i, 0.6));
    E.screen();
    E.rect(0, 330, 640, 30, "#0a0d1c");
  };
})();
