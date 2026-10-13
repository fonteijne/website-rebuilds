// The three sets: the gap (plateaus + chasm), the trail (montage + temple outside), the temple hall.
import { THREE, Builder, VCOL, toon, skyDome, rng, noise2, canvasTex, glowSprite, roundedBox } from "./core.js";
import { makeCrystal, makeChest, makeTorch, makeFlowers, makePoints } from "./props.js";

const ROCK = ["#8a7458", "#7a6650", "#9a8466", "#6e5c48"];
const GRASS = (n) => (n > 0.45 ? "#86c850" : n > 0.1 ? "#6cba44" : n > -0.3 ? "#58a83a" : "#47932f");

function sunRig(scene, color = "#fff4dc", intensity = 2.4) {
  const sun = new THREE.DirectionalLight(color, intensity);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const c = sun.shadow.camera;
  c.left = -14;
  c.right = 14;
  c.top = 14;
  c.bottom = -14;
  c.near = 1;
  c.far = 140;
  sun.shadow.bias = -0.0008;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight("#dff0ff", "#6a5a40", 1.3);
  scene.add(hemi);
  return { sun, hemi, aim(x, y, z, dir = [-0.55, 0.75, 0.45]) {
    sun.target.position.set(x, y, z);
    sun.position.set(x + dir[0] * 60, y + dir[1] * 60, z + dir[2] * 60);
  } };
}

// low-poly tree into a builder
function tree(B, x, y, z, s, r, pal = ["#2f7a3a", "#3f9a45", "#58b04e"]) {
  B.add(new THREE.CylinderGeometry(0.18 * s, 0.26 * s, 2.2 * s, 5), { x, y: y + 1.1 * s, z, color: "#5a3a22", jitter: 0.03 * s, seed: x * 7 + z });
  const n = 2 + Math.floor(r() * 2);
  for (let i = 0; i < n; i++) {
    const rr = (1.0 + r() * 0.5) * s * (1 - i * 0.18);
    B.add(new THREE.IcosahedronGeometry(rr, 0), { x: x + (r() - 0.5) * 0.6 * s, y: y + (2.4 + i * 1.0) * s, z: z + (r() - 0.5) * 0.6 * s, ry: r() * 6, color: pal[i % pal.length], jitter: 0.12 * s, seed: x + z * 3 + i });
  }
}
function pine(B, x, y, z, s, r) {
  B.add(new THREE.CylinderGeometry(0.15 * s, 0.2 * s, 1.2 * s, 5), { x, y: y + 0.6 * s, z, color: "#5a3a22" });
  for (let i = 0; i < 3; i++) B.add(new THREE.ConeGeometry((1.3 - i * 0.32) * s, 1.7 * s, 6), { x, y: y + (1.6 + i * 0.9) * s, z, ry: r() * 3, color: i % 2 ? "#2f6b44" : "#24563a", jitter: 0.08 * s, seed: x * 3 + z + i });
}
function rockLayers(B, { x0, x1, z0, z1, yTop, yBot, seed, faceSide, taper = 0.12 }) {
  const r = rng(seed);
  let y = yTop;
  let k = 0;
  while (y > yBot) {
    const h = 2.2 + r() * 1.4;
    const inset = (r() - 0.3) * 0.9 + k * taper;
    let a = x0, b = x1;
    if (faceSide === "right") b = x1 - inset;
    if (faceSide === "left") a = x0 + inset;
    const w = b - a, d = z1 - z0;
    B.add(new THREE.BoxGeometry(w, h, d, Math.max(2, Math.round(w / 3)), 2, Math.max(2, Math.round(d / 3))), {
      x: (a + b) / 2, y: y - h / 2, z: (z0 + z1) / 2, color: ROCK[k % 4], jitter: 0.35, seed: seed + k,
    });
    y -= h * 0.92;
    k++;
  }
}
function plateauTop(B, { x0, x1, z0, z1, seed, hills = 0 }) {
  const n = noise2(seed), nc = noise2(seed + 5);
  const w = x1 - x0, d = z1 - z0;
  const g = new THREE.PlaneGeometry(w, d, Math.round(w / 1.5), Math.round(d / 1.5));
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const X = p.getX(i) + (x0 + x1) / 2, Z = p.getZ(i) + (z0 + z1) / 2;
    const edge = Math.min(Math.abs(X - x0), Math.abs(X - x1), Math.abs(Z - z0), Math.abs(Z - z1));
    const far = Math.min(1, Math.max(0, (Math.abs(X - 5) - 22) / 15), 1) * Math.min(1, Math.max(0, (Math.abs(X - 5) - 22) / 15) + Math.max(0, (-Z - 18) / 12));
    const hill = hills * Math.max(0, n(X * 0.03, Z * 0.03)) * Math.min(1, edge / 20) * Math.min(1, Math.max(far, Math.max(0, (-Z - 18) / 12)));
    p.setY(i, n(X * 0.25, Z * 0.25) * 0.12 + hill * 6);
  }
  B.add(g, { x: (x0 + x1) / 2, z: (z0 + z1) / 2, colorFn: (X, Y, Z) => GRASS(nc(X * 0.12, Z * 0.12) * 0.7 + nc(X * 0.6 + 9, Z * 0.6) * 0.35 + Y * 0.05) });
  // dirt lip under the grass
  B.add(new THREE.BoxGeometry(w, 0.6, d, Math.round(w / 3), 1, Math.round(d / 3)), { x: (x0 + x1) / 2, y: -0.5, z: (z0 + z1) / 2, color: "#6b5236", jitter: 0.08, seed });
}
function grassTufts(B, n, area, seed, avoid = () => false) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2]);
    if (avoid(x, z)) continue;
    for (let k = 0; k < 3; k++) B.add(new THREE.ConeGeometry(0.06, 0.32 + r() * 0.2, 3), { x: x + (r() - 0.5) * 0.2, y: 0.15, z: z + (r() - 0.5) * 0.2, rz: (r() - 0.5) * 0.6, color: k % 2 ? "#6fbf45" : "#4e9e34" });
  }
}
function mountains(B, seed, list) {
  const r = rng(seed);
  list.forEach(([x, z, rad, h], i) => {
    const g = new THREE.ConeGeometry(rad, h, 7, 4);
    B.addFaceColored(g, { x, y: h / 2 - 4, z, ry: r() * 6, jitter: rad * 0.06, seed: seed + i }, (cx, cy) => (cy > h * 0.68 - 4 ? "#eef4fb" : cy > h * 0.35 ? "#8a9cc4" : "#6f86b4"));
  });
}
function clouds(scene, seed, n, ring = [110, 230], yr = [40, 75]) {
  const r = rng(seed);
  const list = [];
  for (let i = 0; i < n; i++) {
    const B = new Builder();
    const k = 4 + Math.floor(r() * 4);
    for (let j = 0; j < k; j++) B.add(new THREE.IcosahedronGeometry(3 + r() * 3, 1), { x: j * 3.2 - k * 1.6, y: r() * 1.5, z: (r() - 0.5) * 3, color: j % 2 ? "#ffffff" : "#eef6ff", jitter: 0.3, seed: i * 10 + j });
    const m = B.mesh(new THREE.MeshToonMaterial({ vertexColors: true, emissive: "#9fb8d8", emissiveIntensity: 0.35, fog: false }));
    const a = -Math.PI * 0.95 + r() * Math.PI * 0.9, d = ring[0] + r() * (ring[1] - ring[0]);
    m.position.set(Math.cos(a) * d, yr[0] + r() * (yr[1] - yr[0]), Math.sin(a) * d);
    m.scale.set(1.4, 0.8, 1);
    scene.add(m);
    list.push({ m, base: m.position.clone(), sp: 0.6 + r() * 0.8 });
  }
  return {
    update(t) {
      list.forEach((c) => (c.m.position.x = c.base.x + t * c.sp));
    },
  };
}
function animatedWater(color = "#5fb2e8", streak = "#e8f6ff", vertical = false) {
  const tex = canvasTex(
    64,
    128,
    (x, w, h) => {
      x.fillStyle = color;
      x.fillRect(0, 0, w, h);
      const r = rng(9);
      for (let i = 0; i < 60; i++) {
        x.fillStyle = i % 3 ? streak : "#9fd8ff";
        const sx = Math.floor(r() * w), sy = Math.floor(r() * h);
        if (vertical) x.fillRect(sx, sy, 2, 10 + r() * 20);
        else x.fillRect(sx, sy, 8 + r() * 14, 2);
      }
    },
    { repeat: true },
  );
  return tex;
}

// ================================================================ THE GAP
export const GAP = { EDGE_L: 0, EDGE_R: 10, CHEST: [17, 0, -0.5], HERO: [-1.3, 0, 0] };
export function buildGap() {
  const scene = new THREE.Scene();
  const fog = new THREE.Fog("#cfe6f7", 80, 360);
  scene.fog = fog;
  const sky = skyDome(480);
  scene.add(sky);
  const light = sunRig(scene);
  const B = new Builder(), T = new Builder();
  const r = rng(42);
  // plateaus
  plateauTop(B, { x0: -70, x1: 0, z0: -55, z1: 30, seed: 3, hills: 1 });
  plateauTop(B, { x0: 10, x1: 80, z0: -55, z1: 30, seed: 4, hills: 1 });
  rockLayers(B, { x0: -70, x1: 0, z0: -55, z1: 30, yTop: -0.6, yBot: -44, seed: 10, faceSide: "right" });
  rockLayers(B, { x0: 10, x1: 80, z0: -55, z1: 30, yTop: -0.6, yBot: -44, seed: 20, faceSide: "left" });
  // the far end of the canyon with a waterfall notch
  rockLayers(B, { x0: -1, x1: 3.2, z0: -62, z1: -48, yTop: 1.2, yBot: -44, seed: 30 });
  rockLayers(B, { x0: 6.8, x1: 11, z0: -62, z1: -48, yTop: 1.2, yBot: -44, seed: 31 });
  rockLayers(B, { x0: 3.2, x1: 6.8, z0: -62, z1: -50, yTop: -1.0, yBot: -44, seed: 32 });
  // boulders in the river and on the plateaus
  for (let i = 0; i < 14; i++) B.add(new THREE.DodecahedronGeometry(0.8 + r() * 1.6, 0), { x: 1 + r() * 8, y: -37.5, z: -45 + r() * 70, color: "#6e5c48", jitter: 0.2, seed: i });
  for (let i = 0; i < 26; i++) {
    const x = r() < 0.5 ? -4 - r() * 40 : 14 + r() * 40, z = -30 + r() * 26;
    B.add(new THREE.DodecahedronGeometry(0.25 + r() * 0.6, 0), { x, y: 0.1, z, color: "#8d8577", jitter: 0.08, seed: 100 + i });
  }
  // old broken bridge stubs
  [[-0.2, -0.3, 0.9], [0.4, -0.6, -0.6], [-0.1, -0.9, 0.0], [9.7, -0.3, -0.8], [9.2, -0.65, 0.5]].forEach(([x, y, z], i) =>
    B.add(roundedBox(0.5, 0.35, 0.6, 0.04, 1), { x, y, z, rz: (r() - 0.5) * 0.3, color: "#9d9384", seed: i }));
  grassTufts(B, 260, [-40, 0, -28, 14], 7, (x, z) => x > -6 && Math.abs(z) < 3);
  grassTufts(B, 220, [10, 50, -28, 14], 8, (x, z) => x < 22 && Math.abs(z + 0.5) < 3);
  // trees
  const treeSpots = [];
  for (let i = 0; i < 70; i++) {
    const left = i % 2 === 0;
    const x = left ? -8 - r() * 55 : 22 + r() * 55, z = -50 + r() * 62;
    if (z > -6 && ((left && x > -14) || (!left && x < 26))) continue;
    treeSpots.push([x, z]);
    if (r() < 0.6) tree(T, x, 0, z, 0.8 + r() * 0.6, r);
    else pine(T, x, 0, z, 0.8 + r() * 0.6, r);
  }
  tree(T, -9, 0, 4, 1.0, r);
  pine(T, 24, 0, 5, 1.1, r);
  // distant world: hills ring, mountains, castle, temple mountain
  const D = new Builder();
  for (let i = 0; i < 18; i++) {
    const a = -Math.PI + (i / 18) * Math.PI * 1.05 - 0.1, d = 120 + r() * 40;
    D.add(new THREE.SphereGeometry(1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), { x: Math.cos(a) * d, y: -3, z: Math.sin(a) * d - 10, sx: 30 + r() * 25, sy: 10 + r() * 12, sz: 20, color: i % 2 ? "#6aa27e" : "#5e9474", jitter: 0.6, seed: i });
  }
  mountains(D, 77, [[-160, -230, 55, 90], [-80, -260, 70, 120], [10, -280, 60, 100], [110, -250, 70, 110], [200, -200, 55, 85], [-230, -150, 50, 70], [260, -120, 45, 65], [-40, -210, 40, 60], [160, -180, 40, 55]]);
  // castle on its hill
  const CX = -60, CZ = -80;
  D.add(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), { x: CX, y: -2, z: CZ, sx: 34, sy: 12, sz: 26, color: "#6fa07a", jitter: 0.5, seed: 9 });
  D.add(new THREE.BoxGeometry(34, 6, 2), { x: CX, y: 12.5, z: CZ + 8, color: "#cfd6e4" });
  D.add(new THREE.BoxGeometry(2, 6, 18), { x: CX - 16, y: 12.5, z: CZ, color: "#c3cbdc" });
  D.add(new THREE.BoxGeometry(2, 6, 18), { x: CX + 16, y: 12.5, z: CZ, color: "#c3cbdc" });
  for (let i = 0; i < 12; i++) D.add(new THREE.BoxGeometry(1.2, 1.2, 1.2), { x: CX - 16 + i * 2.9, y: 16, z: CZ + 8, color: "#cfd6e4" });
  const towers = [[-16, 8, 2.4, 14], [16, 8, 2.4, 14], [-8, -2, 2.2, 22], [6, -4, 3, 28], [-16, -8, 2, 16], [16, -8, 2, 18], [0, 4, 1.8, 18]];
  const towerTops = [];
  towers.forEach(([dx, dz, rad, h], i) => {
    D.add(new THREE.CylinderGeometry(rad, rad * 1.1, h, 8), { x: CX + dx, y: 9 + h / 2, z: CZ + dz, color: i % 2 ? "#d5dbe8" : "#c3cbdc" });
    D.add(new THREE.ConeGeometry(rad + 0.7, rad * 2.6, 8), { x: CX + dx, y: 9 + h + rad * 1.3, z: CZ + dz, color: i % 2 ? "#c9605a" : "#b04e48" });
    for (let k = 0; k < 3; k++) D.add(new THREE.BoxGeometry(0.5, 1.0, 0.3), { x: CX + dx, y: 12 + k * 4, z: CZ + dz + rad, color: "#3d4a6a" });
    towerTops.push([CX + dx, 9 + h + rad * 2.8, CZ + dz]);
  });
  for (let i = 0; i < 10; i++) {
    const hx = CX - 12 + i * 2.6, hz = CZ + 11 + (i % 3);
    D.add(new THREE.BoxGeometry(2, 2.4, 2), { x: hx, y: 10.6 + (i % 2) * 0.4, z: hz, color: "#e6dcc8" });
    D.add(new THREE.ConeGeometry(1.7, 1.6, 4), { x: hx, y: 12.6 + (i % 2) * 0.4, z: hz, ry: Math.PI / 4, color: "#b85a4a" });
  }
  // the temple mountain far away on the right
  const TX = 70, TZ = -175;
  D.addFaceColored(new THREE.ConeGeometry(42, 82, 9, 5), { x: TX, y: 37, z: TZ, jitter: 2.2, seed: 5 }, (x, y) => (y > 62 ? "#d8e2f2" : y > 30 ? "#8696bc" : "#6a7fa8"));
  const templeY = 78;
  D.add(new THREE.BoxGeometry(10, 1.2, 7), { x: TX, y: templeY, z: TZ, color: "#d8c9a6" });
  for (let k = 0; k < 5; k++) D.add(new THREE.CylinderGeometry(0.45, 0.45, 4, 6), { x: TX - 4 + k * 2, y: templeY + 2.6, z: TZ + 2.5, color: "#efe2bf" });
  D.add(new THREE.BoxGeometry(10.5, 0.8, 7.5), { x: TX, y: templeY + 5, z: TZ, color: "#cbbd98" });
  D.add(new THREE.ConeGeometry(6.2, 2.6, 4), { x: TX, y: templeY + 6.7, z: TZ, ry: Math.PI / 4, sx: 1.2, sz: 0.85, color: "#b8a67e" });
  const beacon = glowSprite("#ffd860", 22, 0.0);
  beacon.position.set(TX, templeY + 3, TZ + 4);
  scene.add(beacon);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.5, 90, 10, 1, true), new THREE.MeshBasicMaterial({ color: "#ffe9a0", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  beam.position.set(TX, templeY + 48, TZ);
  scene.add(beam);

  const world = B.mesh();
  world.receiveShadow = true;
  scene.add(world);
  const trees = T.mesh();
  trees.castShadow = true;
  trees.receiveShadow = true;
  scene.add(trees);
  const far = D.mesh();
  scene.add(far);
  // water: river + waterfall
  const riverTex = animatedWater();
  riverTex.repeat.set(2, 10);
  const river = new THREE.Mesh(new THREE.PlaneGeometry(12, 120), new THREE.MeshToonMaterial({ map: riverTex, emissive: "#1f4f7a", emissiveIntensity: 0.4 }));
  river.rotation.x = -Math.PI / 2;
  river.position.set(5, -37.8, -10);
  scene.add(river);
  const fallTex = animatedWater("#bfe6ff", "#ffffff", true);
  fallTex.repeat.set(2, 4);
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 40), new THREE.MeshBasicMaterial({ map: fallTex, color: "#ffffff" }));
  fall.position.set(5, -18.5, -49.8);
  scene.add(fall);
  const mist = makePoints(70, "#ffffff", 6);
  scene.add(mist.points);
  const cl = clouds(scene, 5, 14);
  // birds
  const birds = new THREE.Group();
  const birdGeo = new THREE.BoxGeometry(0.5, 0.06, 0.12);
  for (let i = 0; i < 6; i++) {
    const b = new THREE.Group();
    const w1 = new THREE.Mesh(birdGeo, toon("#2b3550")), w2 = new THREE.Mesh(birdGeo, toon("#2b3550"));
    w1.position.x = 0.24;
    w2.position.x = -0.24;
    b.add(w1, w2);
    b.userData = { w1, w2, k: i };
    birds.add(b);
  }
  scene.add(birds);
  // chest
  const chest = makeChest();
  chest.group.position.set(...GAP.CHEST);
  chest.group.rotation.y = -0.35;
  scene.add(chest.group);
  // world crystals (light up at the end) on stone pedestals + castle towers
  const crystalSpots = [[-14, 0, -13], [-28, 0, -24], [-44, 0, -10], [26, 0, -12], [38, 0, -26], [52, 0, -8], ...towerTops.slice(2, 5)];
  const P = new Builder();
  const worldCrystals = crystalSpots.map(([x, y, z], i) => {
    if (y === 0) {
      P.add(new THREE.CylinderGeometry(0.35, 0.5, 1.6, 6), { x, y: 0.8, z, color: "#b9b0a1", jitter: 0.03, seed: i });
      P.add(new THREE.CylinderGeometry(0.55, 0.55, 0.2, 6), { x, y: 1.65, z, color: "#9d9384" });
    }
    const c = makeCrystal();
    c.group.position.set(x, y === 0 ? 2.35 : y + 1, z);
    c.group.scale.setScalar(y === 0 ? 1.6 : 4.5);
    scene.add(c.group);
    return c;
  });
  const pillars = crystalSpots.map(([x, y, z]) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.8, 60, 8, 1, true), new THREE.MeshBasicMaterial({ color: "#bfe8ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    m.position.set(x, (y === 0 ? 2.4 : y + 1) + 30, z);
    scene.add(m);
    return m;
  });
  const ped = P.mesh();
  ped.castShadow = true;
  scene.add(ped);
  // flowers for the bloom
  const fl = [];
  const fr = rng(55);
  const fcols = ["#ff7aa8", "#ffd860", "#ffffff", "#b08cff", "#ff9a5a"];
  for (let i = 0; i < 420; i++) {
    const left = i % 2 === 0;
    const x = left ? -1 - fr() * 34 : 11 + fr() * 34, z = -22 + fr() * 30;
    fl.push({ x, y: 0.02, z, col: fcols[i % fcols.length], d: Math.hypot(x - GAP.CHEST[0], z) });
  }
  const flowers = makeFlowers(fl);
  scene.add(flowers.group);
  // stars for the night version
  const stars = makePoints(400, "#ffffff", 2);
  const sr = rng(8);
  const starPos = Array.from({ length: 400 }, () => {
    const a = sr() * Math.PI * 2, e = 0.08 + sr() * 1.2, R = 420;
    return [Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R];
  });
  stars.set((i) => starPos[i]);
  stars.mat.fog = false;
  stars.points.visible = false;
  scene.add(stars.points);

  return {
    scene, sky, fog, ...light, chest, worldCrystals, pillars, flowers, beacon, beam, stars, birds,
    update(t) {
      riverTex.offset.y = -t * 0.35;
      fallTex.offset.y = t * 0.9;
      cl.update(t);
      const mr = rng(3);
      mist.set((i) => {
        const a = mr() * 6.28, d = mr() * 3, sp = 0.6 + mr();
        const u = (t * sp + mr() * 4) % 4;
        return [5 + Math.cos(a) * (d + u * 0.8), -36.5 + u * 1.2, -48 + Math.sin(a) * d * 0.5 + u];
      });
      birds.children.forEach((b) => {
        const k = b.userData.k;
        const u = t * 3 + k * 9;
        b.position.set(-60 + ((u * 1.6) % 140), 22 + Math.sin(t + k) * 2 + (k % 3) * 1.5, -40 - (k % 2) * 6 + (k % 3) * 2);
        const f = Math.sin(t * 9 + k) * 0.6;
        b.userData.w1.rotation.z = f;
        b.userData.w2.rotation.z = -f;
      });
    },
  };
}

// ================================================================ THE TRAIL (montage) + TEMPLE OUTSIDE
export const TRAIL = { RIDGE: [96, 136], ROCKS: [142, 182], BOULDER: [188, 232], TEMPLE_X: 262, TEMPLE_Y: 6 };
export function buildTrail() {
  const scene = new THREE.Scene();
  const fog = new THREE.Fog("#cfe6f7", 40, 220);
  scene.fog = fog;
  const sky = skyDome(480);
  scene.add(sky);
  const light = sunRig(scene);
  const B = new Builder(), T = new Builder();
  const r = rng(11);
  const n = noise2(4);
  // ground: forest part and after the ridge
  const ground = (x0, x1) => {
    const w = x1 - x0;
    const g = new THREE.PlaneGeometry(w, 70, Math.round(w / 1.5), 40);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const X = p.getX(i) + (x0 + x1) / 2, Z = p.getZ(i);
      p.setY(i, Math.abs(Z) < 2 ? 0 : n(X * 0.15, Z * 0.15) * 0.4 + Math.max(0, Math.abs(Z) - 12) * 0.2);
    }
    B.add(g, { x: (x0 + x1) / 2, colorFn: (X, Y, Z) => (Math.abs(Z) < 1.6 ? "#b08a5a" : GRASS(n(X * 0.1, Z * 0.1))) });
    B.add(new THREE.BoxGeometry(w, 4, 70, Math.round(w / 4), 1, 6), { x: (x0 + x1) / 2, y: -2.6, color: "#6b5236", jitter: 0.15, seed: x0 });
  };
  ground(-30, TRAIL.RIDGE[0]);
  ground(TRAIL.RIDGE[1], 300);
  // ridge: rock pillars with gaps over a misty drop
  for (let x = TRAIL.RIDGE[0]; x < TRAIL.RIDGE[1]; x += 8) {
    rockLayers(B, { x0: x, x1: x + 5, z0: -3, z1: 3, yTop: 0, yBot: -30, seed: x, taper: 0.05 });
    B.add(new THREE.BoxGeometry(5, 0.3, 6, 4, 1, 4), { x: x + 2.5, y: 0.0, z: 0, color: "#5cae3c", jitter: 0.05, seed: x });
  }
  // rockfall cliff wall along the path
  rockLayers(B, { x0: TRAIL.ROCKS[0] - 4, x1: TRAIL.ROCKS[1] + 4, z0: -16, z1: -4, yTop: 18, yBot: -1, seed: 77 });
  // forest
  for (let i = 0; i < 160; i++) {
    const x = -20 + r() * 115, side = r() < 0.5 ? -1 : 1, z = side * (3.2 + r() * 22);
    if (r() < 0.55) tree(T, x, 0, z, 0.9 + r() * 0.7, r);
    else pine(T, x, 0, z, 1 + r() * 0.8, r);
  }
  for (let i = 0; i < 60; i++) {
    const x = 140 + r() * 140, z = (r() < 0.5 ? -1 : 1) * (5 + r() * 20);
    if (Math.abs(x - TRAIL.TEMPLE_X) < 16 && Math.abs(z) < 12) continue;
    tree(T, x, 0, z, 0.9 + r() * 0.6, r, ["#2a6a36", "#358a40", "#4ea048"]);
  }
  grassTufts(B, 300, [-20, 95, -12, 12], 3, (x, z) => Math.abs(z) < 2);
  // temple: stairs up to a plateau and the facade
  const TX = TRAIL.TEMPLE_X, TY = TRAIL.TEMPLE_Y;
  for (let i = 0; i < 12; i++) B.add(new THREE.BoxGeometry(1.0, (i + 1) * 0.5, 9 - i * 0.2), { x: TX - 14 + i * 1.0, y: ((i + 1) * 0.5) / 2, z: 0, color: i % 2 ? "#cdbd96" : "#bfae86" });
  B.add(new THREE.BoxGeometry(30, TY, 30), { x: TX + 13, y: TY / 2, z: 0, color: "#a8987a", jitter: 0.1, seed: 4 });
  B.add(new THREE.BoxGeometry(18, 0.6, 14), { x: TX + 8, y: TY + 0.3, z: 0, color: "#d8c9a6" });
  B.add(new THREE.BoxGeometry(12, 8, 10), { x: TX + 10, y: TY + 4.6, z: 0, color: "#bfae86" });
  for (let k = 0; k < 6; k++) B.add(new THREE.CylinderGeometry(0.45, 0.5, 7, 8), { x: TX + 3.2, y: TY + 4.1, z: -5 + k * 2, color: "#efe2bf" });
  B.add(new THREE.BoxGeometry(2.4, 0.8, 13), { x: TX + 3.4, y: TY + 8, z: 0, color: "#d8c9a6" });
  B.add(new THREE.CylinderGeometry(7.2, 7.2, 13, 3, 1), { x: TX + 4.5, y: TY + 9.4, z: 0, rx: Math.PI / 2, rz: Math.PI / 2, sx: 0.32, color: "#cbbd98" });
  B.add(new THREE.BoxGeometry(0.4, 4.2, 2.6), { x: TX + 3.9, y: TY + 2.7, z: 0, color: "#2a2219" });
  const emblem = glowSprite("#ffd860", 3.4, 0.8);
  emblem.position.set(TX + 3.6, TY + 6.2, 0);
  scene.add(emblem);
  const world = B.mesh();
  world.receiveShadow = true;
  scene.add(world);
  const trees = T.mesh();
  trees.castShadow = true;
  trees.receiveShadow = true;
  scene.add(trees);
  const D = new Builder();
  mountains(D, 21, [[60, -200, 60, 100], [160, -220, 70, 120], [260, -200, 60, 110], [340, -160, 50, 80], [-40, -180, 50, 80]]);
  scene.add(D.mesh());
  const cl = clouds(scene, 7, 10, [120, 220]);
  // falling rocks + boulder (dynamic)
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rocks = Array.from({ length: 7 }, (_, i) => {
    const m = new THREE.Mesh(rockGeo, toon("#7a6650"));
    m.castShadow = true;
    scene.add(m);
    return m;
  });
  const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 1), toon("#6e5c48"));
  boulder.castShadow = true;
  scene.add(boulder);
  const dust = makePoints(160, "#e8dcc4", 5);
  dust.mat.blending = THREE.NormalBlending;
  dust.mat.opacity = 0.7;
  scene.add(dust.points);
  return { scene, sky, fog, ...light, rocks, boulder, dust, emblem, update(t) { cl.update(t); } };
}

// ================================================================ THE TEMPLE HALL
export const HALL = { ALTAR: [0, 0, -8], GRAIL_Y: 2.6 };
export function buildHall() {
  const scene = new THREE.Scene();
  const fog = new THREE.Fog("#1a120c", 14, 46);
  scene.fog = fog;
  scene.background = new THREE.Color("#120c08");
  const hemi = new THREE.HemisphereLight("#ffe2b0", "#3a2a1a", 0.9);
  scene.add(hemi);
  const shaftLight = new THREE.SpotLight("#ffe9b0", 40, 30, 0.36, 0.5, 1.2);
  shaftLight.position.set(0, 14, -8);
  shaftLight.target.position.set(0, 0, -8);
  shaftLight.castShadow = true;
  shaftLight.shadow.mapSize.set(1024, 1024);
  scene.add(shaftLight, shaftLight.target);
  const B = new Builder();
  const r = rng(12);
  // floor tiles
  for (let x = -9; x < 9; x += 1.5)
    for (let z = -20; z < 8; z += 1.5) B.add(new THREE.BoxGeometry(1.46, 0.2, 1.46), { x: x + 0.75, y: -0.1 - r() * 0.03, z: z + 0.75, color: (Math.floor(x / 1.5) + Math.floor(z / 1.5)) % 2 ? "#7a6649" : "#6c5940" });
  // walls of bricks
  const wall = (x0, x1, z0, z1, h) => {
    const alongX = Math.abs(x1 - x0) > Math.abs(z1 - z0);
    const L = alongX ? x1 - x0 : z1 - z0;
    for (let y = 0; y < h; y += 0.6)
      for (let s = ((y / 0.6) % 2) * 0.6; s < L; s += 1.2) {
        const w = Math.min(1.18, L - s);
        const c = ["#5a4a36", "#62513b", "#544430", "#6a5840"][Math.floor(r() * 4)];
        if (alongX) B.add(new THREE.BoxGeometry(w, 0.58, 0.8), { x: x0 + s + w / 2, y: y + 0.3, z: z0, color: c, jitter: 0.02, seed: s + y });
        else B.add(new THREE.BoxGeometry(0.8, 0.58, w), { x: x0, y: y + 0.3, z: z0 + s + w / 2, color: c, jitter: 0.02, seed: s + y });
      }
  };
  wall(-9, 9, -20, -20, 11);
  wall(-9, -9, -20, 8, 11);
  wall(9, 9, -20, 8, 11);
  // front wall with the doorway (z = 8)
  wall(-9, -1.6, 8, 8, 11);
  wall(1.6, 9, 8, 8, 11);
  B.add(new THREE.BoxGeometry(3.2, 6.6, 0.8), { x: 0, y: 7.7, z: 8, color: "#5a4a36" });
  // ceiling
  B.add(new THREE.BoxGeometry(20, 0.8, 30), { x: 0, y: 11.2, z: -6, color: "#3a2e20" });
  // pillars
  const pillarSpots = [];
  [-5.5, 5.5].forEach((x) =>
    [-16, -10, -4, 2].forEach((z) => {
      B.add(new THREE.CylinderGeometry(0.55, 0.6, 10, 8), { x, y: 5, z, color: "#8c7856", jitter: 0.02, seed: x + z });
      B.add(new THREE.BoxGeometry(1.5, 0.5, 1.5), { x, y: 10.2, z, color: "#a8926b" });
      B.add(new THREE.BoxGeometry(1.5, 0.5, 1.5), { x, y: 0.25, z, color: "#6a5a40" });
      pillarSpots.push([x, z]);
    }),
  );
  // altar
  const [ax, , az] = HALL.ALTAR;
  B.add(new THREE.BoxGeometry(4.4, 0.4, 4.4), { x: ax, y: 0.2, z: az, color: "#8c7856" });
  B.add(new THREE.BoxGeometry(3.4, 0.4, 3.4), { x: ax, y: 0.6, z: az, color: "#9a8462" });
  B.add(new THREE.BoxGeometry(1.4, 1.0, 1.4), { x: ax, y: 1.3, z: az, color: "#a8926b" });
  B.add(new THREE.BoxGeometry(1.7, 0.18, 1.7), { x: ax, y: 1.88, z: az, color: "#c4ad84" });
  // carved symbols on the back wall (faint)
  const world = B.mesh();
  world.receiveShadow = true;
  world.castShadow = true;
  scene.add(world);
  // torches on the pillars facing the aisle (4 with real light, the rest emissive only)
  const torches = pillarSpots.map(([x, z], i) => {
    const tc = makeTorch();
    tc.group.position.set(x + (x < 0 ? 0.75 : -0.75), 3.4, z);
    tc.group.rotation.z = x < 0 ? -0.3 : 0.3;
    if (i % 2) tc.light.visible = false;
    scene.add(tc.group);
    return tc;
  });
  // light shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 2.2, 11, 16, 1, true), new THREE.MeshBasicMaterial({ color: "#ffe9b0", transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  shaft.position.set(ax, 5.5, az);
  scene.add(shaft);
  const motes = makePoints(120, "#fff2c0", 3);
  scene.add(motes.points);
  // doorway light
  const doorGlow = glowSprite("#ffe9c0", 6, 0.5);
  doorGlow.position.set(0, 2.2, 8.6);
  scene.add(doorGlow);
  return {
    scene, fog, hemi, shaftLight, shaft, torches, motes,
    update(t, shaftAmt = 1) {
      torches.forEach((tc, i) => tc.set(t, i * 1.7));
      shaft.material.opacity = 0.12 * shaftAmt;
      shaftLight.intensity = 40 * shaftAmt;
      const mr = rng(4);
      motes.set((i) => {
        const a = mr() * 6.28, d = mr() * 1.6, sp = 0.15 + mr() * 0.2;
        const y = (mr() * 9 + t * sp) % 9;
        return [ax + Math.cos(a + t * 0.1) * d, 9.5 - y, az + Math.sin(a + t * 0.1) * d];
      });
    },
  };
}
