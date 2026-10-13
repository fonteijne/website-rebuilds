// The hero: a rigged low-poly 3D character built from primitives.
// Joint hierarchy: root > hips > (legs) + spine > chest > (arms, neck > head, scarf, backpack)
import { THREE, toon, roundedBox, OUTLINE, clamp, lerp, rng } from "./core.js";

const C = {
  skin: "#f3b98f", skinD: "#d9946c", hair: "#7a4a26", hair2: "#8f5a2e", hairL: "#a8703a",
  shirt: "#f4f1ea", pants: "#2c3a66", boot: "#7a4a22", bootL: "#9a6230", leather: "#8a5a2c", belt: "#5a3818",
  gold: "#e0b13a", scarf: "#e2481f", scarfD: "#b8341c", glasses: "#141414", pack: "#7a5a2e", packD: "#5e4420",
  roll: "#7d8a4a", steel: "#b9c2cc", dark: "#2a1d14", mouth: "#5a1a14", white: "#ffffff", eye: "#2a1a12",
};

function part(parent, geom, color, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, outline = true, shadow = true } = {}) {
  const m = new THREE.Mesh(geom, toon(color));
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = shadow;
  parent.add(m);
  if (outline) {
    geom.computeBoundingBox();
    const s = new THREE.Vector3();
    geom.boundingBox.getSize(s);
    const o = new THREE.Mesh(geom, OUTLINE);
    const k = 0.016;
    o.scale.set(1 + (2 * k) / Math.max(s.x, 0.02), 1 + (2 * k) / Math.max(s.y, 0.02), 1 + (2 * k) / Math.max(s.z, 0.02));
    m.add(o);
  }
  return m;
}
const grp = (parent, x = 0, y = 0, z = 0) => {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  return g;
};

export function buildHero() {
  const H = {};
  const root = new THREE.Group();
  root.scale.setScalar(0.85);
  H.root = root;

  // ---- hips + legs
  const hips = grp(root, 0, 0.84, 0);
  H.hips = hips;
  part(hips, roundedBox(0.36, 0.2, 0.24, 0.06), C.pants);
  part(hips, roundedBox(0.39, 0.065, 0.27, 0.02), C.belt, { y: 0.08 });
  part(hips, new THREE.BoxGeometry(0.07, 0.055, 0.02), C.gold, { y: 0.08, z: 0.138, outline: false });
  part(hips, roundedBox(0.1, 0.11, 0.09, 0.025), C.leather, { x: 0.19, y: 0.02, z: 0.05 });
  part(hips, roundedBox(0.1, 0.11, 0.09, 0.025), C.leather, { x: -0.19, y: 0.02, z: 0.05 });
  const leg = (side) => {
    const hip = grp(hips, 0.1 * side, -0.06, 0);
    part(hip, roundedBox(0.155, 0.36, 0.165, 0.05), C.pants, { y: -0.16 });
    const knee = grp(hip, 0, -0.33, 0);
    part(knee, roundedBox(0.145, 0.27, 0.155, 0.045), C.pants, { y: -0.12 });
    const ankle = grp(knee, 0, -0.28, 0);
    part(ankle, roundedBox(0.17, 0.2, 0.27, 0.05), C.boot, { y: -0.07, z: 0.035 });
    part(ankle, roundedBox(0.185, 0.075, 0.2, 0.025), C.bootL, { y: 0.03, outline: false });
    return { hip, knee, ankle };
  };
  H.legL = leg(1);
  H.legR = leg(-1);

  // ---- torso
  const spine = grp(hips, 0, 0.1, 0);
  H.spine = spine;
  part(spine, roundedBox(0.42, 0.42, 0.26, 0.07), C.shirt, { y: 0.2 });
  // leather harness: diagonal strap, side panels, collar
  part(spine, new THREE.BoxGeometry(0.07, 0.5, 0.02), C.leather, { y: 0.2, z: 0.135, rz: 0.62, outline: false });
  part(spine, new THREE.BoxGeometry(0.07, 0.5, 0.02), C.leather, { y: 0.2, z: -0.135, rz: -0.62, outline: false });
  part(spine, roundedBox(0.09, 0.3, 0.27, 0.03), C.leather, { x: 0.18, y: 0.12, outline: false });
  part(spine, roundedBox(0.09, 0.3, 0.27, 0.03), C.leather, { x: -0.18, y: 0.12, outline: false });
  part(spine, new THREE.BoxGeometry(0.06, 0.05, 0.03), C.gold, { x: 0.02, y: 0.2, z: 0.145, outline: false });
  const chest = grp(spine, 0, 0.38, 0);
  H.chest = chest;

  // ---- scarf around the neck + a flowing tail chain
  part(chest, new THREE.TorusGeometry(0.17, 0.075, 6, 14), C.scarf, { y: 0.03, rx: Math.PI / 2 });
  part(chest, roundedBox(0.12, 0.12, 0.1, 0.03), C.scarfD, { x: 0.09, y: -0.03, z: 0.16 });
  H.scarf = [];
  let prev = grp(chest, -0.06, 0.02, -0.17);
  for (let i = 0; i < 8; i++) {
    const s = grp(prev, 0, 0, i === 0 ? 0 : -0.12);
    part(s, new THREE.BoxGeometry(0.12 - i * 0.006, 0.035, 0.14), i % 3 === 2 ? C.scarfD : C.scarf, { z: -0.06, outline: i < 6 });
    H.scarf.push(s);
    prev = s;
  }
  // a second short tail at the front knot
  H.scarf2 = [];
  prev = grp(chest, 0.1, -0.06, 0.18);
  for (let i = 0; i < 3; i++) {
    const s = grp(prev, 0, i === 0 ? 0 : -0.075, 0);
    part(s, new THREE.BoxGeometry(0.1 - i * 0.012, 0.085, 0.03), C.scarf, { y: -0.04, outline: false });
    H.scarf2.push(s);
    prev = s;
  }

  // ---- backpack + sword
  const pack = grp(spine, 0, 0.22, -0.23);
  H.pack = pack;
  part(pack, roundedBox(0.38, 0.42, 0.2, 0.06), C.pack);
  part(pack, roundedBox(0.39, 0.16, 0.215, 0.04), C.packD, { y: 0.15 });
  part(pack, roundedBox(0.25, 0.15, 0.07, 0.03), C.packD, { y: -0.08, z: -0.12 });
  part(pack, new THREE.CylinderGeometry(0.075, 0.075, 0.44, 8), C.roll, { y: 0.27, rz: Math.PI / 2 });
  part(pack, new THREE.BoxGeometry(0.06, 0.06, 0.02), C.gold, { y: 0.08, z: -0.112, outline: false });
  const sword = grp(pack, 0.0, 0.05, -0.13);
  sword.rotation.z = -0.62;
  part(sword, new THREE.BoxGeometry(0.06, 0.72, 0.02), C.steel, { y: -0.05, outline: false });
  part(sword, new THREE.BoxGeometry(0.22, 0.04, 0.05), C.gold, { y: 0.33 });
  part(sword, new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), C.dark, { y: 0.44 });
  part(sword, new THREE.SphereGeometry(0.04, 6, 4), C.gold, { y: 0.55, outline: false });
  // shoulder straps
  part(chest, new THREE.BoxGeometry(0.07, 0.04, 0.3), C.leather, { x: 0.15, y: 0.0, z: -0.02, outline: false });
  part(chest, new THREE.BoxGeometry(0.07, 0.04, 0.3), C.leather, { x: -0.15, y: 0.0, z: -0.02, outline: false });

  // ---- arms
  const arm = (side) => {
    const sh = grp(chest, 0.26 * side, -0.02, 0);
    part(sh, roundedBox(0.135, 0.31, 0.14, 0.05), C.shirt, { y: -0.13 });
    const el = grp(sh, 0, -0.28, 0);
    part(el, roundedBox(0.1, 0.25, 0.105, 0.035), C.skin, { y: -0.1 });
    part(el, roundedBox(0.12, 0.13, 0.125, 0.03), "#6e4422", { y: -0.15 });
    const wr = grp(el, 0, -0.25, 0);
    part(wr, roundedBox(0.105, 0.115, 0.095, 0.035), C.skin, { y: -0.05 });
    part(wr, roundedBox(0.04, 0.07, 0.045, 0.015), C.skin, { x: -0.055 * side * -1, y: -0.03, z: 0.04, outline: false });
    const socket = grp(wr, 0, -0.08, 0.02);
    return { sh, el, wr, socket };
  };
  H.armL = arm(1);
  H.armR = arm(-1);

  // ---- head
  const neck = grp(chest, 0, 0.03, 0);
  H.neck = neck;
  part(neck, new THREE.CylinderGeometry(0.065, 0.07, 0.1, 8), C.skin, { y: 0.03, outline: false });
  const head = grp(neck, 0, 0.07, 0.01);
  H.head = head;
  const face = grp(head, 0, 0.23, 0);
  H.face = face;
  part(face, roundedBox(0.5, 0.46, 0.44, 0.12, 4), C.skin);
  part(face, roundedBox(0.06, 0.1, 0.08, 0.025), C.skin, { x: 0.255, y: -0.02 });
  part(face, roundedBox(0.06, 0.1, 0.08, 0.025), C.skin, { x: -0.255, y: -0.02 });
  part(face, roundedBox(0.045, 0.055, 0.04, 0.015), C.skinD, { y: -0.07, z: 0.225, outline: false });
  // eyes (scale.y = openness), highlights, closed-happy arcs
  H.eyes = [1, -1].map((s) => {
    const g = grp(face, 0.1 * s, -0.005, 0.214);
    const e = part(g, new THREE.BoxGeometry(0.055, 0.085, 0.02), C.eye, { outline: false, shadow: false });
    const hl = part(g, new THREE.BoxGeometry(0.018, 0.022, 0.01), C.white, { x: -0.012, y: 0.018, z: 0.012, outline: false, shadow: false });
    const arc = part(g, new THREE.TorusGeometry(0.03, 0.009, 3, 8, Math.PI), C.eye, { y: -0.01, z: 0.008, outline: false, shadow: false });
    arc.visible = false;
    return { g, e, hl, arc };
  });
  H.brows = [1, -1].map((s) => part(face, new THREE.BoxGeometry(0.11, 0.026, 0.02), "#4a2a14", { x: 0.1 * s, y: 0.085, z: 0.224, outline: false, shadow: false }));
  // glasses
  const glasses = grp(face, 0, 0, 0.236);
  H.glasses = glasses;
  const gm = (w, h, d, x, y, z, ry = 0) => part(glasses, new THREE.BoxGeometry(w, h, d), C.glasses, { x, y, z, ry, outline: false, shadow: false });
  [1, -1].forEach((s) => {
    gm(0.16, 0.02, 0.02, 0.105 * s, 0.05, 0);
    gm(0.16, 0.02, 0.02, 0.105 * s, -0.055, 0);
    gm(0.02, 0.125, 0.02, 0.185 * s, -0.002, 0);
    gm(0.02, 0.125, 0.02, 0.025 * s, -0.002, 0);
    gm(0.02, 0.02, 0.24, 0.2 * s, 0.035, -0.12);
  });
  gm(0.05, 0.018, 0.02, 0, 0.02, 0);
  H.lenses = [1, -1].map((s) => {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.09), new THREE.MeshBasicMaterial({ color: "#dff2ff", transparent: true, opacity: 0.18, depthWrite: false }));
    l.position.set(0.105 * s, -0.002, 0.004);
    glasses.add(l);
    return l;
  });
  // mouths
  const mouth = grp(face, 0, -0.135, 0.224);
  H.mouths = {};
  const mm = (name, geom, color, o = {}) => {
    const m = part(mouth, geom, color, { ...o, outline: false, shadow: false });
    H.mouths[name] = m;
    m.visible = false;
    return m;
  };
  mm("smile", new THREE.TorusGeometry(0.05, 0.012, 3, 10, Math.PI), C.mouth, { rz: Math.PI, y: 0.03 });
  mm("frown", new THREE.TorusGeometry(0.045, 0.012, 3, 10, Math.PI), C.mouth, { y: -0.03 });
  mm("flat", new THREE.BoxGeometry(0.07, 0.015, 0.01), C.mouth);
  mm("smirk", new THREE.TorusGeometry(0.05, 0.012, 3, 10, Math.PI * 0.75), C.mouth, { rz: Math.PI + 0.25, x: 0.015, y: 0.03 });
  const open = new THREE.Group();
  mouth.add(open);
  H.mouths.open = open;
  open.visible = false;
  part(open, new THREE.CircleGeometry(0.038, 10), C.mouth, { outline: false, shadow: false });
  part(open, new THREE.CircleGeometry(0.018, 8), "#d9606a", { y: -0.018, z: 0.002, outline: false, shadow: false });
  const grin = new THREE.Group();
  mouth.add(grin);
  H.mouths.grin = grin;
  grin.visible = false;
  part(grin, new THREE.CircleGeometry(0.075, 12, Math.PI, Math.PI), C.mouth, { y: 0.02, outline: false, shadow: false });
  part(grin, new THREE.BoxGeometry(0.12, 0.022, 0.005), C.white, { y: 0.008, z: 0.003, outline: false, shadow: false });
  part(grin, new THREE.CircleGeometry(0.03, 8, Math.PI, Math.PI), "#d9606a", { y: -0.03, z: 0.002, outline: false, shadow: false });

  // hair: cap + spikes
  part(face, roundedBox(0.54, 0.24, 0.5, 0.1), C.hair, { y: 0.14, z: -0.02 });
  part(face, roundedBox(0.52, 0.32, 0.18, 0.08), C.hair, { y: 0.02, z: -0.17 });
  part(face, roundedBox(0.08, 0.16, 0.2, 0.03), C.hair, { x: 0.25, y: 0.07, z: -0.02 });
  part(face, roundedBox(0.08, 0.16, 0.2, 0.03), C.hair, { x: -0.25, y: 0.07, z: -0.02 });
  // fringe
  for (let i = 0; i < 5; i++) part(face, new THREE.ConeGeometry(0.06, 0.16, 4), i % 2 ? C.hair2 : C.hair, { x: -0.18 + i * 0.09, y: 0.17, z: 0.2, rx: 2.3, rz: (i - 2) * 0.15 - 0.3 });
  const r = rng(17);
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 20; i++) {
    const a = r() * Math.PI * 2, el = 0.35 + r() * 0.85;
    const dir = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el) - 0.35).normalize();
    const h = 0.18 + r() * 0.16;
    const m = part(face, new THREE.ConeGeometry(0.075 + r() * 0.03, h, 5), [C.hair, C.hair2, C.hairL][i % 3], {});
    m.quaternion.setFromUnitVectors(up, dir);
    m.position.set(dir.x * 0.2, 0.17 + dir.y * 0.12, -0.02 + dir.z * 0.2).addScaledVector(dir, h * 0.4);
  }

  root.traverse((o) => {
    if (o.isMesh && o.material !== OUTLINE) o.receiveShadow = false;
  });
  H.setPose = (p) => applyPose(H, p);
  return H;
}

// ---------------------------------------------------------------- poses
export const BASE = {
  x: 0, y: 0, z: 0, ry: 0,
  hipY: 0, hipX: 0, hipY_r: 0, hipZ: 0,
  spX: 0, spY: 0, spZ: 0, nkX: 0, nkY: 0, hdX: 0, hdY: 0, hdZ: 0,
  lsX: 0, lsY: 0, lsZ: 0.12, leX: -0.15, lwX: 0, lwZ: 0,
  rsX: 0, rsY: 0, rsZ: -0.12, reX: -0.15, rwX: 0, rwZ: 0,
  llX: 0, llZ: 0.03, lkX: 0, lfX: 0, rlX: 0, rlZ: -0.03, rkX: 0, rfX: 0,
  browL: 0, browR: 0, browY: 0, eyeL: 1, eyeR: 1, lookX: 0, lookY: 0,
  mouth: "smile", mouthS: 1, glassesY: 0, wind: 0.3, t: 0, happyEyes: 0, winkR: 0,
};
export const P = (o) => ({ ...BASE, ...o });

export function mixPose(a, b, k) {
  const o = {};
  for (const key in BASE) {
    const va = a[key] ?? BASE[key], vb = b[key] ?? BASE[key];
    o[key] = typeof va === "number" ? lerp(va, vb, k) : k < 0.5 ? va : vb;
  }
  return o;
}
// keyframes: [[t, pose], ...] → pose at time t (smooth step between keys)
export function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [ta, a] = keys[i], [tb, b] = keys[i + 1];
    if (t <= tb) {
      const p = clamp((t - ta) / (tb - ta));
      return mixPose(a, b, p * p * (3 - 2 * p));
    }
  }
  return keys[keys.length - 1][1];
}
// add a delta pose (numbers only) on top of a pose
export function addPose(p, d, k = 1) {
  const o = { ...p };
  for (const key in d) if (typeof d[key] === "number" && key !== "t") o[key] = (o[key] ?? 0) + d[key] * k;
  return o;
}
// procedural gait: phase in radians, amp 0..1, run blends to a sprint
export function gait(phase, amp = 1, run = 0) {
  const s = Math.sin(phase), c = Math.cos(phase);
  const legA = lerp(0.5, 0.95, run) * amp, armA = lerp(0.45, 0.9, run) * amp;
  return {
    llX: -s * legA, rlX: s * legA,
    lkX: Math.max(0, Math.sin(phase + 1.2)) * lerp(0.7, 1.5, run) * amp + 0.05,
    rkX: Math.max(0, Math.sin(phase + 1.2 + Math.PI)) * lerp(0.7, 1.5, run) * amp + 0.05,
    lfX: Math.max(0, -s) * 0.3 * amp, rfX: Math.max(0, s) * 0.3 * amp,
    lsX: s * armA, rsX: -s * armA, leX: -0.25 - run * 1.2 * amp, reX: -0.25 - run * 1.2 * amp,
    hipY: -Math.abs(c) * lerp(0.035, 0.08, run) * amp + 0.02 * amp,
    spX: run * 0.32 * amp, spY: s * 0.08 * amp, hipY_r: -s * 0.06 * amp,
  };
}
export function blinkAt(t, seed = 0) {
  const period = 3.3 + (seed % 3) * 0.4;
  const u = (t + seed * 1.37) % period;
  return u < 0.13 ? Math.abs(u - 0.065) / 0.065 : 1;
}

function applyPose(H, p) {
  H.root.position.set(p.x, p.y, p.z);
  H.root.rotation.y = p.ry;
  H.hips.position.y = 0.84 + p.hipY;
  H.hips.rotation.set(p.hipX, p.hipY_r, p.hipZ);
  H.spine.rotation.set(p.spX, p.spY, p.spZ);
  H.neck.rotation.set(p.nkX, p.nkY, 0);
  H.head.rotation.set(p.hdX, p.hdY, p.hdZ);
  H.armL.sh.rotation.set(p.lsX, p.lsY, p.lsZ);
  H.armL.el.rotation.set(p.leX, 0, 0);
  H.armL.wr.rotation.set(p.lwX, 0, p.lwZ);
  H.armR.sh.rotation.set(p.rsX, p.rsY, p.rsZ);
  H.armR.el.rotation.set(p.reX, 0, 0);
  H.armR.wr.rotation.set(p.rwX, 0, p.rwZ);
  H.legL.hip.rotation.set(p.llX, 0, p.llZ);
  H.legL.knee.rotation.set(p.lkX, 0, 0);
  H.legL.ankle.rotation.set(p.lfX, 0, 0);
  H.legR.hip.rotation.set(p.rlX, 0, p.rlZ);
  H.legR.knee.rotation.set(p.rkX, 0, 0);
  H.legR.ankle.rotation.set(p.rfX, 0, 0);
  // face
  const happy = p.happyEyes > 0.5;
  H.eyes.forEach((e, i) => {
    const open = i === 0 ? p.eyeL : p.eyeR;
    const wink = i === 1 && p.winkR > 0.5;
    const arc = happy || wink;
    e.e.visible = !arc;
    e.hl.visible = !arc && open > 0.5;
    e.arc.visible = arc;
    e.e.scale.y = Math.max(0.08, open);
    e.g.position.x = (i === 0 ? 0.1 : -0.1) + p.lookX * 0.025;
    e.g.position.y = -0.005 + p.lookY * 0.02;
  });
  H.brows[0].rotation.z = p.browL;
  H.brows[1].rotation.z = -p.browR;
  H.brows[0].position.y = 0.085 + p.browY * 0.03;
  H.brows[1].position.y = 0.085 + p.browY * 0.03;
  for (const k in H.mouths) H.mouths[k].visible = k === p.mouth;
  const m = H.mouths[p.mouth];
  if (m) m.scale.setScalar(p.mouthS);
  H.glasses.position.y = p.glassesY;
  // scarf: hangs, sways and streams with the wind
  const t = p.t, w = p.wind;
  H.scarf.forEach((s, i) => {
    const wave = Math.sin(t * (5 + w * 6) - i * 0.8) * (0.12 + w * 0.35);
    s.rotation.x = i === 0 ? lerp(-1.25, -0.25, w) + wave * 0.4 : lerp(0.12, 0.02, w) + wave;
    s.rotation.y = Math.sin(t * 3.1 - i * 0.6) * (0.08 + w * 0.25);
  });
  H.scarf2.forEach((s, i) => {
    s.rotation.x = Math.sin(t * 4 - i) * 0.15 * (0.3 + w);
    s.rotation.z = Math.sin(t * 3 - i * 0.7) * 0.12 * (0.3 + w);
  });
}
