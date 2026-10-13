// The film: shot list, camera work and the hero's performance. update(t) poses everything for time t.
import { THREE, clamp, lerp, seg, easeOut, easeIn, easeInOut, sine, backOut, smooth, rng, setCam, lerp3, camPath, applySky, glowSprite, starSprite, toon, roundedBox } from "./core.js";
import { buildHero, P, track, addPose, gait, blinkAt, mixPose } from "./hero.js";
import { buildGap, buildTrail, buildHall, GAP, TRAIL, HALL } from "./worlds.js";
import { makeCrystal, makeBlocks, duckVoxels, makeColoredInstances, makeSymbol, makeEmblem, makeItem, makeScroll, makeGrail, makePoints, makeMapTex, blueprintTex, SYM_COLORS } from "./props.js";

const KINDS = ["target", "book", "clock", "tools"];
const v3 = new THREE.Vector3();
const RIGHT = Math.PI / 2; // hero facing +x

// ---------------------------------------------------------------- poses
const IDLE = (t, o = {}) => P({ spX: 0.02 * Math.sin(t * 2.1), hipY: 0.006 * Math.sin(t * 2.1), lsZ: 0.12 + 0.02 * Math.sin(t * 2.1), rsZ: -0.12 - 0.02 * Math.sin(t * 2.1), t, ...o });
export const KNEEL = { hipY: -0.37, llX: -1.45, lkX: 1.5, lfX: 0.0, rlX: 0.3, rkX: 1.85, rfX: 0.45, spX: 0.18 };
export const CROUCH = { hipY: -0.32, llX: -1.05, lkX: 1.75, rlX: -1.05, rkX: 1.75, lfX: -0.6, rfX: -0.6, spX: 0.55, lsX: -2.7, lsZ: -0.5, leX: -1.7, rsX: -2.7, rsZ: 0.5, reX: -1.7, hdX: 0.3 };
export const REACH_R = { rsX: -1.65, rsZ: 0.05, reX: -0.15, rwX: 0.1, spX: 0.08 };
export const FACEPALM = { rsX: -1.4, rsZ: 0.55, reX: -1.15, rwX: 0.3, hdX: 0.35, nkX: 0.1, spX: 0.15, eyeL: 0.15, eyeR: 0.15, mouth: "frown", browL: -0.3, browR: -0.3 };
export const SCROLL = { lsX: -1.25, lsZ: -0.28, leX: -0.75, rsX: -1.25, rsZ: 0.28, reX: -0.75, hdX: 0.12 };
export const CHEER = { lsZ: 2.7, rsZ: -2.7, leX: -0.35, reX: -0.35, mouth: "grin", happyEyes: 1, browY: 1, hdX: -0.15 };
export const SHIELD = { lsX: -1.9, lsZ: -0.35, leX: -1.9, rsX: -1.9, rsZ: 0.35, reX: -1.9, spX: -0.3, hdX: -0.05, hdY: 0.35, mouth: "open", browY: 1, eyeL: 0.4, eyeR: 0.4 };
export const LOOKUP = { hdX: -0.45, nkX: -0.2, spX: -0.08, browY: 0.8 };
export const GLASSES = { rsX: -1.75, rsZ: 0.3, rsY: 0.4, reX: -1.15, rwX: 0.1, hdX: 0.12 };
export const IDEA = { rsX: -0.95, rsZ: 0.25, reX: -2.2, rwX: -0.2, mouth: "grin", browY: 1, browL: -0.1, browR: -0.1 };

// ---------------------------------------------------------------- stage
export function buildFilm() {
  const F = {};
  const gap = buildGap(), trail = buildTrail(), hall = buildHall();
  const hero = buildHero();
  F.worlds = { gap, trail, hall };
  F.hero = hero;
  // ---- gap props
  const crystal = makeCrystal();
  gap.scene.add(crystal.group);
  const duck = makeColoredInstances(duckVoxels(), 0.25);
  gap.scene.add(duck.mesh);
  // the wrong bridge: a loop over the hero's head
  const LOOP = [];
  {
    const cx = -4.6, R = 4.6;
    for (let layer = 0; layer < 2; layer++) {
      const n = 30;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI;
        LOOP.push({ x: cx + Math.cos(a) * R, y: Math.sin(a) * R - 0.18, z: layer ? 0.32 : -0.32, rz: a - Math.PI / 2, i, n });
      }
    }
    const r = rng(404);
    LOOP.forEach((b) => Object.assign(b, { vx: 2 + r() * 5 + (b.x + 4.6) * 0.6, vy: 1 + r() * 3, vz: (r() - 0.5) * 3, d: r() * 0.4 + (1 - b.y / 5) * 0.2, sp: (r() - 0.5) * 10 }));
  }
  const loop = makeBlocks(LOOP.length, [0.5, 0.35, 0.6], "#a89c8a");
  gap.scene.add(loop.mesh);
  // the real bridge: a stone arch, 4 blocks deep, with parapets
  const BR = [];
  {
    const intr = (x) => -4.4 + 3.6 * (1 - Math.pow((x - 5) / 5.3, 2));
    for (let x = -0.25; x < 10.25; x += 0.5)
      for (let y = -0.35; y > -4.6; y -= 0.35) {
        const cx = x + 0.25, cy = y + 0.175;
        if (y > -0.75 || cy > intr(cx)) for (let z = -0.9; z <= 0.91; z += 0.6) BR.push({ x: cx, y: cy, z });
      }
    for (let x = -0.25; x < 10.25; x += 0.5) [-1.1, 1.1].forEach((z) => BR.push({ x: x + 0.25, y: 0.2, z, rail: true }));
    BR.sort((a, b) => a.x - b.x || a.y - b.y || a.z - b.z);
    BR.forEach((b, i) => (b.k = i / BR.length));
  }
  const bridge = makeBlocks(BR.length, [0.5, 0.35, 0.6], "#a0968a");
  gap.scene.add(bridge.mesh);
  const GH = BR.filter((b) => b.z > 0.8);
  const ghost = new THREE.InstancedMesh(new THREE.BoxGeometry(0.48, 0.33, 0.58), new THREE.MeshBasicMaterial({ color: "#5fd0ff", transparent: true, opacity: 0.25, depthWrite: false }), GH.length);
  {
    const d = new THREE.Object3D();
    GH.forEach((b, i) => {
      d.position.set(b.x, b.y, b.z);
      d.updateMatrix();
      ghost.setMatrixAt(i, d.matrix);
    });
  }
  gap.scene.add(ghost);
  const scroll = makeScroll();
  gap.scene.add(scroll.group);
  const holo = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshBasicMaterial({ map: blueprintTex(), transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  gap.scene.add(holo);
  const gapSyms = KINDS.map((k) => makeSymbol(k));
  gapSyms.forEach((s) => gap.scene.add(s.group));
  const links = KINDS.map(() => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1, 4), new THREE.MeshBasicMaterial({ color: "#ffd860", transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
    gap.scene.add(m);
    return m;
  });
  const gapEmblem = makeEmblem();
  gap.scene.add(gapEmblem.group);
  const wave = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 6, 64), new THREE.MeshBasicMaterial({ color: "#ffe27a", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  wave.rotation.x = Math.PI / 2;
  gap.scene.add(wave);
  const scan = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: "#8fe8ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  gap.scene.add(scan);
  const dims = new THREE.Group();
  const dimMat = new THREE.MeshBasicMaterial({ color: "#ffe27a", transparent: true, opacity: 0, depthWrite: false });
  const dimBar = new THREE.Mesh(new THREE.BoxGeometry(1, 0.04, 0.04), dimMat);
  dims.add(dimBar);
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const tk = new THREE.Mesh(new THREE.BoxGeometry(0.04, i % 5 ? 0.18 : 0.36, 0.04), dimMat);
    dims.add(tk);
    ticks.push(tk);
  }
  const dimV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1, 0.04), dimMat);
  dims.add(dimV);
  gap.scene.add(dims);
  const sparks = makePoints(220, "#fff2b0", 4);
  gap.scene.add(sparks.points);
  const debris = makePoints(120, "#d8cfbf", 5);
  debris.mat.blending = THREE.NormalBlending;
  gap.scene.add(debris.points);
  const beamPts = makePoints(60, "#9fe0ff", 4);
  gap.scene.add(beamPts.points);
  const glint = starSprite("#ffffff", 0.25);
  gap.scene.add(glint);
  // rain cloud for the facepalm
  const rainCloud = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16 + (i % 2) * 0.05, 0), toon("#5a6070"));
    c.position.set((i - 2) * 0.17, (i % 2) * 0.06, 0);
    rainCloud.add(c);
  }
  gap.scene.add(rainCloud);
  const rain = makePoints(40, "#8fc8ff", 3);
  gap.scene.add(rain.points);
  // falling map
  const mapTex = makeMapTex();
  const mapMat = new THREE.MeshToonMaterial({ map: mapTex.tex, side: THREE.DoubleSide });
  const map = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), mapMat);
  map.castShadow = true;
  gap.scene.add(map);
  // ---- hall props
  const grail = makeGrail();
  hall.scene.add(grail.group);
  const goldCubes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: "#ffd04a" }), 600);
  goldCubes.frustumCulled = false;
  {
    const c = new THREE.Color();
    for (let i = 0; i < 600; i++) goldCubes.setColorAt(i, c.set(["#fff6c8", "#ffe27a", "#ffd04a", "#f5b72e"][i % 4]));
  }
  hall.scene.add(goldCubes);
  const hallSyms = KINDS.map((k) => makeSymbol(k));
  hallSyms.forEach((s) => hall.scene.add(s.group));
  const hallEmblem = makeEmblem();
  hall.scene.add(hallEmblem.group);
  const items = ["drawing", "measure", "book", "toolbox"].map((k) => {
    const g = makeItem(k);
    hall.scene.add(g);
    return g;
  });
  const packProp = new THREE.Group();
  {
    const pk = (g, c, x, y, z) => {
      const m = new THREE.Mesh(g, toon(c));
      m.position.set(x, y, z);
      m.castShadow = true;
      packProp.add(m);
    };
    pk(roundedBox(0.38, 0.42, 0.22, 0.06), "#7a5a2e", 0, 0.21, 0);
    pk(new THREE.CylinderGeometry(0.075, 0.075, 0.44, 8).rotateZ(Math.PI / 2), "#7d8a4a", 0, 0.47, -0.05);
    pk(roundedBox(0.39, 0.06, 0.24, 0.02), "#5e4420", 0, 0.43, 0.12);
  }
  packProp.scale.setScalar(0.85);
  hall.scene.add(packProp);
  const hallBeams = Array.from({ length: 8 }, () => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 4), new THREE.MeshBasicMaterial({ color: "#ffd860", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    hall.scene.add(m);
    return m;
  });
  const swirl = makePoints(260, "#ffe9a0", 4);
  hall.scene.add(swirl.points);
  const bulb = new THREE.Group();
  {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), new THREE.MeshBasicMaterial({ color: "#fff1a0" }));
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 8), toon("#9a9aa8"));
    base.position.y = -0.13;
    bulb.add(b, base, glowSprite("#ffe27a", 1.0, 0.9));
  }
  hall.scene.add(bulb);
  const hallSparks = makePoints(160, "#fff2b0", 4);
  hall.scene.add(hallSparks.points);
  // ---- trail props are inside the trail world

  F.p = { crystal, duck, LOOP, loop, BR, bridge, ghost, scroll, holo, gapSyms, links, gapEmblem, wave, scan, dims, dimBar, ticks, dimV, dimMat, sparks, debris, beamPts, glint, rainCloud, rain, map, mapTex, grail, goldCubes, hallSyms, hallEmblem, items, packProp, hallBeams, swirl, bulb, hallSparks };
  return F;
}

// helpers ------------------------------------------------------------------
function handPos(hero, side = "R") {
  hero.root.updateMatrixWorld(true);
  return (side === "R" ? hero.armR.socket : hero.armL.socket).getWorldPosition(new THREE.Vector3());
}
function headPos(hero) {
  hero.root.updateMatrixWorld(true);
  return hero.face.getWorldPosition(new THREE.Vector3());
}
function faceCam(hero, dist, side = 0.2, up = 0.03, fov = 34, lookUp = 0) {
  hero.root.updateMatrixWorld(true);
  const hp = hero.face.getWorldPosition(new THREE.Vector3());
  const ry = hero.root.rotation.y + (hero.head.rotation.y + hero.spine.rotation.y) * 0.5;
  const fwd = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry));
  const right = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry));
  const c = hp.clone().addScaledVector(fwd, dist).addScaledVector(right, side);
  c.y += up;
  return [c.toArray(), [hp.x, hp.y + lookUp, hp.z], fov];
}
function placeRod(m, a, b) {
  const d = new THREE.Vector3().subVectors(b, a);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.scale.set(1, Math.max(0.001, d.length()), 1);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
}
const shake = (t, t0, dur, amp) => {
  const u = t - t0;
  if (u < 0 || u > dur) return [0, 0, 0];
  const k = amp * Math.pow(1 - u / dur, 1.5);
  return [k * Math.sin(u * 71), k * Math.sin(u * 83 + 1), k * Math.sin(u * 59 + 2)];
};
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// ---------------------------------------------------------------- the shots
// each shot returns { world: "gap"|"trail"|"hall", cam: [pos, look, fov] }
export function frame(F, t) {
  const { hero } = F;
  const p = F.p;
  const G = F.worlds.gap;
  // defaults: hide transient props
  p.duck.mesh.visible = false;
  p.loop.mesh.visible = false;
  p.bridge.mesh.visible = false;
  p.ghost.visible = false;
  p.scroll.group.visible = false;
  p.holo.visible = false;
  p.gapSyms.forEach((s) => (s.group.visible = false));
  p.links.forEach((l) => (l.visible = false));
  p.gapEmblem.group.visible = false;
  p.wave.visible = false;
  p.scan.visible = false;
  p.dims.visible = false;
  p.sparks.points.visible = false;
  p.debris.points.visible = false;
  p.beamPts.points.visible = false;
  p.glint.visible = false;
  p.rainCloud.visible = false;
  p.rain.points.visible = false;
  p.map.visible = false;
  p.crystal.group.visible = false;
  p.hallSyms.forEach((s) => (s.group.visible = false));
  p.hallEmblem.group.visible = false;
  p.items.forEach((i) => (i.visible = false));
  p.packProp.visible = false;
  p.hallBeams.forEach((b) => (b.visible = false));
  p.swirl.points.visible = false;
  p.bulb.visible = false;
  p.goldCubes.visible = false;
  p.hallSparks.points.visible = false;
  hero.pack.visible = true;
  hero.root.visible = true;
  const TR = F.worlds.trail;
  TR.rocks.forEach((m) => (m.visible = false));
  TR.boulder.visible = false;
  TR.dust.points.visible = false;
  applySky(TR.sky, TR.fog, "day");
  TR.sun.color.set("#fff4dc");
  G.stars.points.visible = false;
  G.beacon.material.opacity = 0.35;
  G.beam.material.opacity = 0;
  G.chest.set(0, 0);
  G.worldCrystals.forEach((c) => c.set(t, { glowAmt: 0, scale: 1 }));
  G.pillars.forEach((m) => (m.material.opacity = 0));
  G.flowers.set(() => 0);
  applySky(G.sky, G.fog, "day");
  G.sun.color.set("#fff4dc");
  G.sun.intensity = 2.4;
  G.hemi.intensity = 1.3;
  G.hemi.color.set("#dff0ff");
  G.aim(0, 0, 0);

  for (const s of SHOTS) if (t >= s[0] && t < s[1]) return s[2](F, t, t - s[0]);
  return SHOTS[SHOTS.length - 1][2](F, t, t - SHOTS[SHOTS.length - 1][0]);
}

// ---- crystal hover position used across scene 1/2
const CRY = [0.55, 2.05, 0.15];
function bridgeBuilt(F, k, opts = {}) {
  const { bridge, BR, crystal } = F.p;
  bridge.mesh.visible = true;
  const src = opts.src || CRY;
  BR.forEach((b, i) => {
    const q = clamp((k - b.k * 0.92) / 0.08);
    if (q <= 0) return bridge.set(i, 0, -999, 0, 0, 0, 0, 0);
    const e = easeOut(q);
    const x = lerp(src[0], b.x, e), y = lerp(src[1], b.y, e) + Math.sin(q * Math.PI) * 1.4, z = lerp(src[2], b.z, e);
    bridge.set(i, x, y, z, (1 - e) * 3, (1 - e) * 2, 0, 0.5 + 0.5 * e);
  });
  bridge.done();
}

const SHOTS = [
  // ============================================================ SCENE 1 · De wereld van AI
  [0, 3.4, (F, t) => {
    const { hero } = F;
    hero.setPose(IDLE(t, { x: GAP.HERO[0], ry: RIGHT + 0.25, hdY: -0.2 + 0.25 * sine(seg(t, 0.5, 3)), wind: 0.4, eyeL: blinkAt(t), eyeR: blinkAt(t), mouth: "flat" }));
    F.worlds.gap.scene.add(hero.root);
    const c = camPath([[0, [-9, 16, 20], [-30, 22, -80], 42], [3.4, [-5.2, 2.0, 4.6], [3, 0.6, -3], 40]], t, easeInOut);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],
  [3.4, 5.2, (F, t) => {
    const { hero } = F;
    hero.setPose(IDLE(t, { x: GAP.HERO[0], ry: RIGHT + 0.25, wind: 0.4, eyeL: blinkAt(t), eyeR: blinkAt(t), mouth: "flat" }));
    F.worlds.gap.scene.add(hero.root);
    const k = (t * 1.3) % 3;
    F.p.glint.visible = k < 0.5;
    F.p.glint.position.set(GAP.CHEST[0] + 0.2, 0.9, GAP.CHEST[2] + 0.4);
    F.p.glint.scale.setScalar(0.5 * Math.sin((k / 0.5) * Math.PI));
    const c = camPath([[3.4, [-1, 3.2, 4.5], [6, -8, -10], 44], [4.3, [5, 4.0, 6.5], [9, -4, -6], 44], [5.2, [11, 2.2, 4.8], [17, 0.5, -0.5], 32]], t, sine);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],
  [5.2, 7.6, (F, t) => {
    const { hero, p } = F;
    // he turns, reaches into his backpack and brings out the crystal
    const pose = track([
      [5.2, IDLE(t, { ry: RIGHT, mouth: "flat" })],
      [5.7, P({ ry: 0.75, hdY: -0.3 })],
      [6.2, P({ ry: 0.75, rsX: 0.9, rsZ: -0.55, reX: -1.7, spY: 0.35, hdY: -0.6, mouth: "flat" })],
      [6.7, P({ ry: 0.75, rsX: 0.6, rsZ: -0.5, reX: -1.5, spY: 0.3, hdY: -0.5, mouth: "flat" })],
      [7.2, P({ ry: 0.75, rsX: -1.15, rsZ: 0.15, reX: -0.9, rwX: -0.5, hdX: 0.35, hdY: 0.15, mouth: "smile", browY: 0.6 })],
      [7.6, P({ ry: 0.75, rsX: -1.2, rsZ: 0.15, reX: -0.85, rwX: -0.5, hdX: 0.3, hdY: 0.15, mouth: "smile", browY: 0.8 })],
    ], t);
    hero.setPose({ ...pose, x: GAP.HERO[0], t, wind: 0.35, eyeL: blinkAt(t), eyeR: blinkAt(t) });
    F.worlds.gap.scene.add(hero.root);
    if (t > 6.55) {
      const h = handPos(hero);
      p.crystal.group.visible = true;
      p.crystal.group.position.set(h.x, h.y + 0.16 + 0.02 * Math.sin(t * 4), h.z);
      p.crystal.set(t, { glowAmt: 0.25 + 0.35 * seg(t, 6.6, 7.6), scale: 0.55 + 0.15 * seg(t, 6.6, 7.4) });
    }
    const c = camPath([[5.2, [1.6, 1.5, 3.6], [-1.3, 1.1, 0], 34], [7.6, [1.0, 1.35, 2.6], [-1.2, 1.15, 0.1], 32]], t);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],
  [7.6, 10.0, (F, t) => {
    const { hero, p } = F;
    const fl = easeInOut(seg(t, 7.6, 9.2));
    const pose = track([
      [7.6, P({ ry: 0.75, rsX: -1.2, rsZ: 0.15, reX: -0.85, rwX: -0.5, hdX: 0.3, hdY: 0.15, mouth: "smile", browY: 0.8 })],
      [8.4, P({ ry: 0.9, rsX: -1.9, rsZ: 0.1, reX: -0.3, rwX: -0.6, hdX: -0.25, mouth: "open", browY: 1, mouthS: 0.8 })],
      [9.2, P({ ry: 1.0, rsX: -0.4, reX: -0.4, hdX: -0.45, nkX: -0.15, mouth: "smile", browY: 1 })],
      [10, P({ ry: 1.05, hdX: -0.4, nkX: -0.15, mouth: "smile", browY: 0.9 })],
    ], t);
    hero.setPose({ ...pose, x: GAP.HERO[0], t, wind: 0.35, eyeL: blinkAt(t, 2), eyeR: blinkAt(t, 2) });
    F.worlds.gap.scene.add(hero.root);
    const h = t < 8.0 ? handPos(hero) : null;
    p.crystal.group.visible = true;
    const start = [-0.95, 1.2, 0.85];
    const pos = lerp3(start, CRY, fl);
    p.crystal.group.position.set(pos[0], pos[1] + Math.sin(t * 2.4) * 0.05 * fl, pos[2]);
    p.crystal.set(t, { glowAmt: 0.6 + 0.4 * fl, scale: 0.7 + 0.5 * fl, ringAmt: fl, spin: 1 + fl });
    p.sparks.points.visible = true;
    const r = rng(11);
    p.sparks.set((i) => {
      if (i > 60) return null;
      const d = r() * 1.6, a = r() * 6.28, u = (t - 7.6 - r() * 1.8);
      if (u < 0 || u > 1.2) return null;
      return [pos[0] + Math.cos(a) * (0.3 + u * 0.6), pos[1] + (r() - 0.5) * 0.8 + u * 0.4, pos[2] + Math.sin(a) * (0.3 + u * 0.6)];
    });
    const ang = lerp(0.2, 1.1, sine(seg(t, 7.6, 10)));
    const cp = [CRY[0] - 1.2 + Math.cos(ang) * 0.3, 0.9, 2.4 + Math.sin(ang) * 1.2];
    return { world: "gap", cam: [[-0.2 + Math.sin(ang) * 2.6, 0.75, 1.0 + Math.cos(ang) * 2.4], lerp3([-0.9, 1.3, 0.4], [0.0, 1.7, 0.1], fl), 40] };
  }],

  // ============================================================ SCENE 2 · De verkeerde magie
  [10.0, 13.4, (F, t) => {
    const { hero, p } = F;
    const pose = track([
      [10.0, P({ ry: RIGHT, hdX: -0.25, mouth: "smile" })],
      [10.5, P({ ry: RIGHT, ...REACH_R, rsX: -1.9, hdX: -0.2, mouth: "flat", browL: 0.2, browR: 0.2 })],
      [11.4, P({ ry: RIGHT, ...REACH_R, rsX: -1.9, hdX: -0.2, mouth: "flat", browL: 0.25, browR: 0.25 })],
      [11.9, P({ ry: RIGHT, hdX: -0.15, hdY: -0.3, mouth: "flat" })],
      [13.0, P({ ry: RIGHT, hdX: -0.05, hdY: -0.4, mouth: "flat" })],
      [13.25, P({ ry: RIGHT, spX: -0.15, hdX: -0.15, hdY: -0.4, mouth: "open", mouthS: 1.3, browY: 1.2, lsZ: 0.5, rsZ: -0.5 })],
      [13.4, P({ ry: RIGHT, spX: -0.15, hdX: -0.15, hdY: -0.4, mouth: "open", mouthS: 1.3, browY: 1.2, lsZ: 0.5, rsZ: -0.5 })],
    ], t);
    hero.setPose({ ...pose, x: GAP.HERO[0], t, wind: 0.35, eyeL: blinkAt(t, 1), eyeR: blinkAt(t, 1) });
    F.worlds.gap.scene.add(hero.root);
    p.crystal.group.visible = true;
    p.crystal.group.position.set(CRY[0], CRY[1] + Math.sin(t * 2.4) * 0.05, CRY[2]);
    const flash = t > 11.4 && t < 11.7 ? 1 - seg(t, 11.4, 11.7) : 0;
    p.crystal.set(t, { glowAmt: 0.9, scale: 1.2, ringAmt: 0.6, flash, spin: t > 11.4 ? 4 : 1 });
    // the projected image: a little bridge drawing travels from his hand into the crystal
    if (t > 10.5 && t < 11.6) {
      const h = handPos(hero);
      const q = easeInOut(seg(t, 10.7, 11.45));
      p.holo.visible = true;
      p.holo.position.set(lerp(h.x + 0.6, CRY[0], q), lerp(h.y + 0.25, CRY[1], q), lerp(h.z, CRY[2], q));
      p.holo.rotation.y = -RIGHT + 0.9;
      p.holo.scale.setScalar(lerp(0.6, 0.05, easeIn(q)));
      p.holo.material.opacity = 0.85 * seg(t, 10.5, 10.7);
      p.beamPts.points.visible = true;
      const r = rng(5);
      p.beamPts.set((i) => {
        const u = (t * 1.6 + r()) % 1;
        return [lerp(h.x, CRY[0], u), lerp(h.y, CRY[1], u) + Math.sin(u * 9 + i) * 0.08, lerp(h.z, CRY[2], u) + Math.cos(u * 7 + i) * 0.08];
      });
    }
    // the duck assembles
    duckFrame(F, t, seg(t, 11.6, 13.0), 0);
    const sh = shake(t, 13.0, 0.3, 0.05);
    return { world: "gap", cam: [add3([3.6, 2.4, 11.5], sh), [3.2, 1.4, 0], 40] };
  }],
  [13.4, 15.2, (F, t) => {
    // close-up: the sigh
    const { hero, p } = F;
    const pose = track([
      [13.4, P({ ry: RIGHT - 0.9, hdY: 0.1, mouth: "flat", browL: -0.1, browR: -0.1 })],
      [13.9, P({ ry: RIGHT - 0.9, spX: -0.12, hdX: -0.15, hdY: 0.1, lsZ: 0.3, rsZ: -0.3, mouth: "open", mouthS: 0.6, browY: 0.4 })],
      [14.6, P({ ry: RIGHT - 0.9, spX: 0.28, hdX: 0.35, nkX: 0.1, hdY: 0.1, lsZ: 0.05, rsZ: -0.05, mouth: "open", mouthS: 0.8, eyeL: 0.35, eyeR: 0.35, browL: -0.35, browR: -0.35 })],
      [15.2, P({ ry: RIGHT - 0.9, spX: 0.24, hdX: 0.3, hdY: 0.1, mouth: "frown", eyeL: 0.5, eyeR: 0.5, browL: -0.3, browR: -0.3 })],
    ], t);
    const shakeHead = t > 14.7 ? Math.sin((t - 14.7) * 18) * 0.18 * (1 - seg(t, 14.7, 15.2)) : 0;
    hero.setPose({ ...pose, hdY: pose.hdY + shakeHead, x: GAP.HERO[0], t, wind: 0.35 });
    F.worlds.gap.scene.add(hero.root);
    duckFrame(F, t, 1, 0);
    return { world: "gap", cam: faceCam(hero, 1.6, 0.35, 0.05, 34, -0.05) };
  }],
  [15.2, 20.8, (F, t) => {
    const { hero, p } = F;
    // duck poofs, the giant scroll, the wrong bridge, collapse
    const pose = track([
      [15.2, P({ ry: RIGHT, mouth: "flat", browL: 0.2, browR: 0.2 })],
      [15.6, P({ ry: RIGHT, ...SCROLL, mouth: "flat", browL: 0.3, browR: 0.3 })],
      [16.1, P({ ry: RIGHT, ...SCROLL, hdX: -0.2, mouth: "smirk", browL: 0.3, browR: 0.3 })],
      [16.6, P({ ry: RIGHT, ...LOOKUP, hdY: 0.2, mouth: "open", mouthS: 0.7 })],
      [17.4, P({ ry: RIGHT, ...LOOKUP, hdX: -0.7, hdY: 0.9, mouth: "open", mouthS: 0.9, browY: 1 })],
      [18.4, P({ ry: RIGHT - 0.5, ...LOOKUP, hdX: -0.6, hdY: 1.2, mouth: "open", mouthS: 1.1, browY: 1.2 })],
      [19.5, P({ ry: RIGHT - 0.5, ...LOOKUP, hdX: -0.55, hdY: 1.2, mouth: "open", mouthS: 1.3, browY: 1.3 })],
      [19.8, P({ ry: RIGHT - 0.5, ...CROUCH, mouth: "open", mouthS: 1.2, eyeL: 0.2, eyeR: 0.2, browY: 1 })],
      [20.5, P({ ry: RIGHT - 0.5, ...CROUCH, mouth: "open", mouthS: 1.0, eyeL: 0.2, eyeR: 0.2, browY: 1 })],
      [20.8, P({ ry: RIGHT - 0.5, hdX: 0.2, mouth: "frown", browL: -0.3, browR: -0.3 })],
    ], t);
    hero.setPose({ ...pose, x: GAP.HERO[0], t, wind: 0.4, eyeL: pose.eyeL * blinkAt(t), eyeR: pose.eyeR * blinkAt(t) });
    F.worlds.gap.scene.add(hero.root);
    duckFrame(F, t, 1, easeIn(seg(t, 15.2, 16.4)));
    // scroll in both hands
    const unroll = easeOut(seg(t, 15.5, 16.0)) * (1 - seg(t, 16.5, 16.8));
    if (unroll > 0.01 || t < 16.8) {
      const a = handPos(hero, "L"), b = handPos(hero, "R");
      p.scroll.group.visible = t < 16.8;
      p.scroll.group.position.set((a.x + b.x) / 2 + 0.1, (a.y + b.y) / 2 + 0.35, (a.z + b.z) / 2);
      p.scroll.group.rotation.set(0, -RIGHT + Math.PI, 0);
      p.scroll.set(Math.max(0.02, unroll));
      p.scroll.group.scale.setScalar(t < 15.5 ? 0.0001 : 1);
    }
    p.crystal.group.visible = true;
    p.crystal.group.position.set(CRY[0], CRY[1] + Math.sin(t * 2.4) * 0.05, CRY[2]);
    const flash = t > 15.9 && t < 16.2 ? 1 - seg(t, 15.9, 16.2) : 0;
    p.crystal.set(t, { glowAmt: 1, scale: 1.25, ringAmt: 0.8, flash, spin: t > 16 && t < 18.4 ? 8 : 1 });
    // the wrong bridge
    const { loop, LOOP } = p;
    loop.mesh.visible = true;
    const built = seg(t, 16.0, 18.4), fall = Math.max(0, t - 19.6);
    LOOP.forEach((b, i) => {
      const q = clamp((built - (b.i / b.n) * 0.85) / 0.15);
      if (q <= 0) return loop.set(i, 0, -999, 0, 0, 0, 0, 0);
      const e = easeOut(q);
      let x = lerp(CRY[0], b.x, e), y = lerp(CRY[1], b.y, e), z = lerp(CRY[2], b.z, e), rz = b.rz, rx = 0;
      if (t > 18.4 && t < 19.6) x += Math.sin(t * 28) * 0.06 * seg(t, 18.4, 19.6) * (b.y / 4.6);
      if (fall > 0) {
        const u = Math.max(0, fall - b.d);
        x += b.vx * u;
        z += b.vz * u;
        y += b.vy * u - 9.8 * u * u * 0.5;
        rz += b.sp * u;
        rx += b.sp * 0.7 * u;
        // blocks over the plateau come to rest on the grass
        if (x < -0.3 && y < 0.17) {
          y = 0.17;
          rx = Math.round(rx / (Math.PI / 2)) * (Math.PI / 2);
          rz = Math.round(rz / (Math.PI / 2)) * (Math.PI / 2);
        }
      }
      loop.set(i, x, y, z, rx, 0, rz, 1);
    });
    loop.done();
    if (t > 19.6) {
      p.debris.points.visible = true;
      const r = rng(8);
      p.debris.set((i) => {
        const u = t - 19.6 - r() * 0.5;
        if (u < 0 || u > 1.0) return null;
        const a = r() * 6.28, sp = 1 + r() * 2;
        return [-4.6 + (r() - 0.5) * 9 + Math.cos(a) * sp * u, 0.2 + u * 0.8 * r(), Math.sin(a) * sp * u];
      });
    }
    const sh = shake(t, 19.6, 1.1, 0.18);
    const c = camPath([[15.2, [1.5, 2.4, 9.5], [-1.0, 1.6, 0], 42], [17.2, [0.5, 3.0, 12.5], [-3.5, 2.6, 0], 44], [20.8, [0.2, 2.6, 12.0], [-3.5, 1.4, 0], 44]], t);
    return { world: "gap", cam: [add3(c[1], sh), c[2], c[3]] };
  }],
  [20.8, 22.2, (F, t) => {
    // close-up: facepalm under his own little rain cloud
    const { hero, p } = F;
    const pose = track([
      [20.8, P({ ry: 0.55, hdX: 0.2, mouth: "frown", browL: -0.3, browR: -0.3 })],
      [21.2, P({ ry: 0.55, ...FACEPALM })],
      [22.2, P({ ry: 0.55, ...FACEPALM })],
    ], t);
    const sh = t > 21.3 ? Math.sin((t - 21.3) * 14) * 0.12 : 0;
    hero.setPose({ ...pose, hdY: (pose.hdY || 0) + sh, x: GAP.HERO[0], t, wind: 0.35 });
    F.worlds.gap.scene.add(hero.root);
    const hp = headPos(hero);
    p.rainCloud.visible = true;
    const ca = seg(t, 21.0, 21.4);
    p.rainCloud.position.set(hp.x, hp.y + 0.62 + Math.sin(t * 3) * 0.02, hp.z);
    p.rainCloud.scale.setScalar(Math.max(0.001, 0.7 * backOut(ca)));
    p.rain.points.visible = t > 21.4;
    const r = rng(2);
    p.rain.set(() => {
      const x = (r() - 0.5) * 0.6, z = (r() - 0.5) * 0.3, u = (t * 2.2 + r()) % 1;
      return [hp.x + x, hp.y + 0.55 - u * 0.6, hp.z + z];
    });
    const fc = faceCam(hero, 1.75, 0.45, 0.25, 36, 0.12);
    return { world: "gap", cam: fc };
  }],

  // ============================================================ SCENE 3 · De zoektocht begint
  [22.2, 23.6, (F, t) => {
    const { hero, p } = F;
    const pose = track([
      [22.2, P({ ry: 0.55, spX: 0.2, hdX: 0.3, mouth: "frown", browL: -0.3, browR: -0.3 })],
      [22.8, P({ ry: 0.55, spX: 0.2, hdX: 0.5, mouth: "open", mouthS: 0.6, browY: 0.8 })],
      [23.2, P({ ry: 0.55, ...KNEEL, hdX: 0.45, rsX: -0.9, reX: -0.2, mouth: "open", mouthS: 0.6, browY: 0.8 })],
      [23.6, P({ ry: 0.55, ...KNEEL, hdX: 0.4, rsX: -0.9, reX: -0.2, mouth: "smile", browY: 0.8 })],
    ], t);
    hero.setPose({ ...pose, x: GAP.HERO[0], t, wind: 0.3, eyeL: blinkAt(t), eyeR: blinkAt(t) });
    F.worlds.gap.scene.add(hero.root);
    // the map slips from the backpack and flutters down
    p.map.visible = true;
    const q = seg(t, 22.3, 23.0);
    const fx = GAP.HERO[0] + 0.25 + Math.sin(q * 8) * 0.15 * (1 - q), fy = lerp(1.25, 0.02, easeIn(q)), fz = 0.45 * q + 0.1;
    p.map.position.set(fx, t < 23.15 ? Math.max(0.1, fy) : lerp(0.1, 0.4, seg(t, 23.15, 23.6)), fz + 0.25);
    p.map.scale.setScalar(1.4);
    p.map.rotation.set(q < 1 ? -Math.PI / 2 + Math.sin(q * 11) * 0.8 * (1 - q) : -Math.PI / 2 + seg(t, 23.15, 23.6) * 0.9, 0, Math.sin(q * 7) * 0.5);
    F.p.mapTex.draw(0, 0.3);
    return { world: "gap", cam: [[GAP.HERO[0] + 2.0, 0.75, 2.4], [GAP.HERO[0] + 0.2, 0.5, 0.35], 40] };
  }],
  [23.6, 25.2, (F, t) => {
    // the map in his hands: the path draws itself to a mountain with a chalice
    const { hero, p } = F;
    hero.setPose(P({ ry: 0.55, ...KNEEL, hdX: 0.45, lsX: -1.1, lsZ: -0.25, leX: -0.9, rsX: -1.1, rsZ: 0.25, reX: -0.9, mouth: "open", mouthS: 0.6, browY: 1, t, x: GAP.HERO[0] }));
    F.worlds.gap.scene.add(hero.root);
    const a = handPos(hero, "L"), b = handPos(hero, "R");
    p.map.visible = true;
    p.map.scale.setScalar(1);
    p.map.position.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.12, (a.z + b.z) / 2);
    p.map.rotation.set(-0.55, 0.55, 0);
    p.map.rotation.order = "YXZ";
    p.map.rotation.set(-0.6, 0.55, 0);
    p.mapTex.draw(seg(t, 23.8, 24.9), 0.5 + 0.5 * Math.sin(t * 5));
    hero.root.visible = false;
    const mp = p.map.position;
    const dir = new THREE.Vector3(Math.sin(0.55), 0.65, Math.cos(0.55)).normalize();
    const d = lerp(0.62, 0.52, sine(seg(t, 23.6, 25.2)));
    return { world: "gap", cam: [[mp.x + dir.x * d, mp.y + dir.y * d, mp.z + dir.z * d], [mp.x, mp.y, mp.z], 40] };
  }],
  [25.2, 27.6, (F, t) => {
    // he stands and looks up — far away, the temple on the mountain lights up
    const { hero } = F;
    const G = F.worlds.gap;
    const face = Math.atan2(70 - GAP.HERO[0], -175);
    const pose = track([
      [25.2, P({ ry: 0.55, ...KNEEL, hdX: 0.2, mouth: "open", mouthS: 0.6 })],
      [25.8, P({ ry: face, hdX: -0.2, mouth: "open", mouthS: 0.6, browY: 1 })],
      [27.6, P({ ry: face, ...LOOKUP, hdX: -0.35, mouth: "smirk", browL: 0.25, browR: 0.25 })],
    ], t);
    hero.setPose({ ...pose, x: GAP.HERO[0], t, wind: 0.5 });
    G.scene.add(hero.root);
    G.beacon.material.opacity = 0.4 + 0.6 * seg(t, 25.8, 26.6);
    G.beacon.scale.setScalar(18 + 8 * Math.sin(t * 3));
    G.beam.material.opacity = 0.35 * seg(t, 25.9, 26.8);
    const c = camPath([[25.2, [-2.6, 1.0, 3.6], [-1.2, 1.2, 0], 40], [26.4, [-3.4, 1.3, 3.8], [20, 22, -60], 30], [27.6, [-3.6, 1.6, 4.2], [70, 70, -175], 16]], t);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],
  // montage: run, jump, dodge, flee
  [27.6, 28.5, (F, t, u) => {
    const { hero } = F;
    const W = F.worlds.trail;
    const x = 20 + u * 8.5;
    const g = gait(u * 15, 1, 1);
    hero.setPose(P({ ...g, x, y: 0, z: 0, ry: RIGHT, mouth: "flat", browL: 0.3, browR: 0.3, t, wind: 1 }));
    W.scene.add(hero.root);
    W.aim(x, 0, 0);
    return { world: "trail", cam: [[x + 0.6, 1.0, 4.6], [x + 1.2, 1.0, 0], 46] };
  }],
  [28.5, 29.4, (F, t, u) => {
    const { hero } = F;
    const W = F.worlds.trail;
    // leap from one rock pillar to the next
    const jp = seg(u, 0.15, 0.7);
    const x = lerp(99.5, 106.5, u < 0.15 ? u / 0.15 * 0.15 : 0.15 + 0.7 * jp + Math.max(0, u - 0.7) * 1.5);
    const y = Math.sin(jp * Math.PI) * 1.6;
    const air = jp > 0 && jp < 1;
    const pose = air ? P({ llX: -1.3, lkX: 0.6, rlX: 0.7, rkX: 1.4, lsZ: 1.1, rsZ: -1.1, lsX: -0.6, rsX: 0.6, spX: 0.25, mouth: "open", browY: 1 }) : P({ ...gait(u * 15, 1, 1), mouth: "flat" });
    hero.setPose({ ...pose, x, y, z: 0, ry: RIGHT, t, wind: 1 });
    W.scene.add(hero.root);
    W.aim(x, 0, 0);
    return { world: "trail", cam: [[103.2, -1.6, 5.2], [x, 1.2 + y * 0.5, 0], 52] };
  }],
  [29.4, 30.3, (F, t, u) => {
    const { hero } = F;
    const W = F.worlds.trail;
    const x = 152 + u * 7.5;
    const dodge = sine(seg(u, 0.2, 0.45)) * 1.4;
    hero.setPose(P({ ...gait(u * 15, 1, 1), x, z: dodge, ry: RIGHT - 0.25 * Math.sin(seg(u, 0.15, 0.5) * Math.PI), hdY: 0.5 * Math.sin(seg(u, 0.1, 0.5) * Math.PI), mouth: "open", mouthS: 1.1, browY: 1, t, wind: 1 }));
    W.scene.add(hero.root);
    W.aim(x, 0, 0);
    // rocks fall from the cliff and smash on the path
    const r = rng(23);
    W.rocks.forEach((m, i) => {
      const d = 0.05 + i * 0.1, rx = 153 + i * 1.3 + r() * 0.6, s = 0.4 + r() * 0.5;
      const v = u + 0.5 - d;
      const yy = Math.max(s * 0.6, 14 - 30 * v * v);
      m.visible = v > -0.2;
      m.position.set(rx, v < 0 ? 18 : yy, -3.2 + r() * 2.6);
      m.scale.setScalar(s);
      m.rotation.set(v * 6, v * 4, 0);
    });
    W.dust.points.visible = true;
    W.dust.set((i) => {
      const k = i % 7, v = u + 0.5 - (0.05 + k * 0.1) - Math.sqrt(14 / 30);
      if (v < 0) return null;
      const rr = rng(i * 13 + 1);
      const a = rr() * 6.28, sp = 1 + rr() * 2;
      return [153 + k * 1.3 + Math.cos(a) * sp * v, 0.3 + v * rr() * 1.5, -2 + Math.sin(a) * sp * v];
    });
    const sh = shake(t, 29.6, 0.6, 0.08);
    return { world: "trail", cam: [add3([x + 6.5, 1.3, 3.8], sh), [x + 1, 2.2, -1], 48] };
  }],
  [30.3, 31.4, (F, t, u) => {
    const { hero } = F;
    const W = F.worlds.trail;
    W.dust.points.visible = false;
    W.rocks.forEach((m) => (m.visible = false));
    const x = 196 + u * 8.0;
    hero.setPose(P({ ...gait(u * 16, 1, 1), x, ry: RIGHT, mouth: "open", mouthS: 1.3, browY: 1.2, eyeL: 1.2, eyeR: 1.2, t, wind: 1 }));
    W.scene.add(hero.root);
    W.aim(x, 0, 0);
    const bx = x - 4.2 + u * 0.8;
    W.boulder.visible = true;
    W.boulder.position.set(bx, 2.2, 0);
    W.boulder.rotation.z = -bx / 2.2;
    return { world: "trail", cam: [[x + 5.5, 1.3, 1.2], [x - 1.5, 1.5, 0], 50] };
  }],
  [31.4, 34.0, (F, t, u) => {
    const { hero } = F;
    const W = F.worlds.trail;
    W.boulder.visible = false;
    applySky(W.sky, W.fog, "dusk", "day", 0.5);
    W.sun.color.set("#ffd9a8");
    // he climbs the temple stairs
    const TX = TRAIL.TEMPLE_X;
    const k = seg(t, 31.6, 33.8);
    const x = lerp(TX - 16, TX - 1.5, k);
    const y = clamp((x - (TX - 14)) / 12) * 6;
    hero.setPose(P({ ...gait(t * 9, 0.9, 0.2), x, y, ry: RIGHT, hdX: -0.2, t, wind: 0.5 }));
    W.scene.add(hero.root);
    W.aim(x, y, 0);
    W.emblem.material.opacity = 0.75 + 0.25 * Math.sin(t * 3);
    W.emblem.scale.setScalar(3.4 + 0.6 * Math.sin(t * 3));
    const c = camPath([[31.4, [TX - 19, 1.2, 4.2], [TX - 13, 1.6, 0], 44], [34, [TX - 11.5, 5.2, 6.5], [TX - 2, 6.6, 0], 46]], t);
    return { world: "trail", cam: [c[1], c[2], c[3]] };
  }],

  // ============================================================ SCENE 4 · De Heilige Graal
  [34.0, 37.0, (F, t) => {
    const { hero, p } = F;
    const H = F.worlds.hall;
    const k = easeInOut(seg(t, 34.0, 37.0));
    const z = lerp(7.5, -4.6, k);
    const look = Math.sin(t * 1.6) * 0.5;
    hero.setPose(P({ ...gait((t - 34) * 6.5, 0.7, 0), x: 0, z, ry: Math.PI, hdY: look, hdX: -0.15, mouth: "open", mouthS: 0.5, browY: 0.8, t, wind: 0.1, eyeL: blinkAt(t), eyeR: blinkAt(t) }));
    H.scene.add(hero.root);
    H.update(t);
    grailFrame(F, t, 0.5);
    return { world: "hall", cam: [[2.4, 2.4, -6.0], [0, 1.5, lerp(5, -2, k)], 46] };
  }],
  [37.0, 39.5, (F, t) => {
    const { hero, p } = F;
    const H = F.worlds.hall;
    const k = seg(t, 37.0, 38.0);
    const z = lerp(-4.6, -6.15, easeInOut(k));
    const y = z < -5.4 ? 0.8 : z < -5.0 ? 0.4 : 0;
    const pose = track([
      [37.0, P({ ...gait(0, 0.7, 0), ry: Math.PI, hdX: -0.3, mouth: "open", mouthS: 0.5, browY: 1 })],
      [38.0, P({ ry: Math.PI, hdX: -0.35, mouth: "open", mouthS: 0.5, browY: 1 })],
      [39.0, P({ ry: Math.PI, ...REACH_R, rsX: -2.0, hdX: -0.35, spX: 0.12, mouth: "flat", browY: 0.6 })],
      [39.5, P({ ry: Math.PI, ...REACH_R, rsX: -2.15, hdX: -0.35, spX: 0.18, mouth: "flat", browY: 0.6 })],
    ], t);
    const walk = t < 38 ? gait((t - 37) * 6.5, 0.6, 0) : {};
    hero.setPose({ ...addPose(pose, walk), x: 0, y, z, t, wind: 0.1 });
    H.scene.add(hero.root);
    H.update(t, 1 + seg(t, 38, 39.5));
    grailFrame(F, t, 0.5 + 0.8 * seg(t, 37.8, 39.5));
    const sh = shake(t, 38.7, 0.8, 0.03);
    const c = camPath([[37, [3.0, 2.2, -4.4], [0, 2.0, -7.4], 42], [39.5, [2.2, 2.4, -5.6], [0, 2.4, -7.6], 36]], t);
    return { world: "hall", cam: [add3(c[1], sh), c[2], c[3]] };
  }],
  [39.5, 44.6, (F, t) => {
    const { hero, p } = F;
    const H = F.worlds.hall;
    H.update(t, 1.4);
    // blown back off the altar steps, then gets up and looks at the symbols
    const kb = easeOut(seg(t, 39.5, 40.1));
    const pose = track([
      [39.5, P({ ry: Math.PI, ...SHIELD })],
      [40.6, P({ ry: Math.PI, ...SHIELD })],
      [41.4, P({ ry: Math.PI, ...LOOKUP, hdX: -0.5, mouth: "open", mouthS: 1.0, browY: 1.2 })],
      [44.6, P({ ry: Math.PI, ...LOOKUP, hdX: -0.55, mouth: "open", mouthS: 0.8, browY: 1.2, lsZ: 0.35, rsZ: -0.35 })],
    ], t);
    hero.setPose({ ...pose, x: 0, y: lerp(0.8, 0, seg(t, 39.6, 39.9)), z: lerp(-6.15, -3.6, kb), t, wind: 0.6 * (1 - seg(t, 39.5, 41)), eyeL: (pose.eyeL ?? 1) * blinkAt(t), eyeR: (pose.eyeR ?? 1) * blinkAt(t) });
    H.scene.add(hero.root);
    explosionFrame(F, t);
    const sh = shake(t, 39.5, 0.9, 0.2);
    const c = camPath([[39.5, [3.4, 2.6, -2.5], [0, 2.4, -7.4], 44], [41.5, [4.2, 2.4, 0.5], [0, 2.8, -6.5], 46], [44.6, [3.0, 1.4, -0.2], [0, 3.4, -7.5], 44]], t);
    return { world: "hall", cam: [add3(c[1], sh), c[2], c[3]] };
  }],
  [44.6, 46.0, (F, t) => {
    const { hero } = F;
    const H = F.worlds.hall;
    H.update(t, 1.4);
    const pose = track([
      [44.6, P({ ry: Math.PI, ...LOOKUP, hdX: -0.35, mouth: "open", mouthS: 1.2, browY: 1.4, eyeL: 1.25, eyeR: 1.25 })],
      [45.2, P({ ry: Math.PI, ...LOOKUP, hdX: -0.3, mouth: "open", mouthS: 1.2, browY: 1.4, eyeL: 1.25, eyeR: 1.25 })],
      [45.6, P({ ry: Math.PI, hdX: -0.2, mouth: "smirk", browL: 0.15, browR: 0.15, browY: 0.2 })],
      [46.0, P({ ry: Math.PI, hdX: -0.2, mouth: "smirk", browL: 0.2, browR: 0.2, browY: 0.2 })],
    ], t);
    hero.setPose({ ...pose, x: 0, z: -3.6, t, wind: 0.1 });
    H.scene.add(hero.root);
    symbolsHall(F, t, 1);
    return { world: "hall", cam: faceCam(hero, 1.45, 0.3, 0.02, 36) };
  }],

  // ============================================================ SCENE 5 · De ontdekking
  [46.0, 48.6, (F, t) => {
    const { hero, p } = F;
    const H = F.worlds.hall;
    H.update(t, 1.4);
    const pose = track([
      [46.0, P({ ry: Math.PI, hdX: -0.2, mouth: "smirk", browL: 0.2, browR: 0.2 })],
      [46.3, P({ ry: Math.PI, ...IDEA })],
      [48.6, P({ ry: Math.PI, ...IDEA, hdY: 0.15 })],
    ], t);
    hero.setPose({ ...pose, x: 0, z: -3.6, t, wind: 0.1, eyeL: blinkAt(t, 1), eyeR: blinkAt(t, 1) });
    H.scene.add(hero.root);
    symbolsHall(F, t, 1);
    const hp = headPos(hero);
    p.bulb.visible = t > 46.15;
    const bs = backOut(seg(t, 46.15, 46.45));
    p.bulb.position.set(hp.x - 0.45, hp.y + 0.6 + Math.sin(t * 3) * 0.03, hp.z - 0.1);
    p.bulb.scale.setScalar(Math.max(0.001, bs));
    return { world: "hall", cam: faceCam(hero, 1.8, 0.35, 0.12, 40, 0.15) };
  }],
  [48.6, 53.5, (F, t) => {
    const { hero, p } = F;
    const H = F.worlds.hall;
    H.update(t, 1.4);
    // backpack off, kneel, items pop out one by one
    const off = seg(t, 48.7, 49.0);
    const pose = track([
      [48.6, P({ ry: Math.PI, rsX: -0.4, rsZ: -0.6, reX: -1.8, mouth: "smile" })],
      [49.0, P({ ry: Math.PI, ...KNEEL, lsX: -0.9, rsX: -0.9, leX: -0.6, reX: -0.6, hdX: 0.4, mouth: "smile", browY: 0.6 })],
      [53.5, P({ ry: Math.PI, ...KNEEL, lsX: -0.7, rsX: -0.7, leX: -0.6, reX: -0.6, hdX: 0.15, mouth: "grin", browY: 0.8 })],
    ], t);
    hero.setPose({ ...pose, x: 0, z: -3.0, t, wind: 0.1, eyeL: blinkAt(t), eyeR: blinkAt(t) });
    H.scene.add(hero.root);
    hero.pack.visible = off < 0.5;
    p.packProp.visible = off >= 0.5;
    p.packProp.position.set(0, 0, -3.85);
    p.packProp.rotation.set(0, Math.PI, 0);
    symbolsHall(F, t, 1);
    itemsFrame(F, t);
    return { world: "hall", cam: [[3.3, 2.0, -1.0], [0, 0.55, -4.4], 42] };
  }],
  [53.5, 58.4, (F, t) => {
    const { hero, p } = F;
    const H = F.worlds.hall;
    H.update(t, 1.4 + seg(t, 56, 58.4));
    const pose = track([
      [53.5, P({ ry: Math.PI, ...KNEEL, hdX: 0.15, mouth: "grin" })],
      [53.9, P({ ry: Math.PI, ...LOOKUP, mouth: "smile", browY: 0.8 })],
      [56.0, P({ ry: Math.PI, ...LOOKUP, hdX: -0.55, mouth: "open", mouthS: 0.8, browY: 1.2, lsZ: 0.5, rsZ: -0.5 })],
      [58.4, P({ ry: Math.PI, ...LOOKUP, hdX: -0.55, mouth: "grin", browY: 1, lsZ: 0.7, rsZ: -0.7, leX: -0.4, reX: -0.4 })],
    ], t);
    hero.setPose({ ...pose, x: 0, z: -3.0, t, wind: 0.2 + 0.6 * seg(t, 56.5, 58.4) });
    H.scene.add(hero.root);
    hero.pack.visible = false;
    p.packProp.visible = true;
    symbolsHall(F, t, 1);
    itemsFrame(F, t);
    connectFrame(F, t);
    const c = camPath([[53.5, [1.2, 1.0, -0.8], [0, 3.4, -8], 50], [56.2, [2.4, 1.6, -1.2], [0, 3.8, -8], 50], [58.4, [1.2, 2.4, -2.2], [0, 4.0, -8], 44]], t);
    return { world: "hall", cam: [c[1], c[2], c[3]] };
  }],
  [58.4, 62.0, (F, t) => {
    const { hero, p } = F;
    const H = F.worlds.hall;
    H.update(t, 2.4 + seg(t, 58.4, 61) * 3);
    hero.setPose(P({ ry: Math.PI, ...LOOKUP, hdX: -0.55, mouth: "grin", browY: 1, lsZ: 0.8, rsZ: -0.8, leX: -0.4, reX: -0.4, x: 0, z: -3.0, t, wind: 0.9 }));
    H.scene.add(hero.root);
    hero.pack.visible = false;
    p.packProp.visible = true;
    symbolsHall(F, t, 1);
    connectFrame(F, t);
    const c = camPath([[58.4, [1.2, 2.4, -2.2], [0, 4.0, -8], 44], [62, [0.3, 3.8, -5.6], [0, 4.0, -8], 30]], t, easeIn);
    return { world: "hall", cam: [c[1], c[2], c[3]] };
  }],

  // ============================================================ SCENE 6 · De kracht van context
  [62.0, 64.2, (F, t) => {
    const { hero, p } = F;
    const pose = track([
      [62.0, P({ ry: RIGHT, rsX: 0.7, rsZ: -0.5, reX: -1.6, spY: 0.3, hdY: -0.4, mouth: "smirk", browL: 0.2, browR: 0.2 })],
      [62.6, P({ ry: RIGHT, rsX: -1.3, rsZ: 0.1, reX: -0.8, rwX: -0.4, hdX: -0.1, mouth: "smirk", browL: 0.25, browR: 0.25 })],
      [63.4, P({ ry: RIGHT, ...REACH_R, rsX: -2.0, hdX: -0.3, mouth: "smirk", browL: 0.25, browR: 0.25 })],
      [64.2, P({ ry: RIGHT, ...REACH_R, rsX: -2.0, hdX: -0.3, mouth: "smirk", browL: 0.25, browR: 0.25 })],
    ], t);
    hero.setPose({ ...pose, x: GAP.HERO[0], t, wind: 0.45, eyeL: blinkAt(t), eyeR: blinkAt(t) });
    F.worlds.gap.scene.add(hero.root);
    const h = handPos(hero);
    const k = easeInOut(seg(t, 62.7, 63.8));
    p.crystal.group.visible = t > 62.4;
    p.crystal.group.position.set(lerp(h.x, CRY[0], k), lerp(h.y + 0.18, CRY[1], k) + Math.sin(t * 2.4) * 0.05 * k, lerp(h.z, CRY[2], k));
    p.crystal.set(t, { glowAmt: 0.5 + 0.5 * k, scale: 0.5 + 0.6 * k, ringAmt: k });
    const c = camPath([[62, [1.6, 1.4, 4.0], [-0.8, 1.3, 0], 38], [64.2, [2.4, 1.6, 3.6], [0, 1.7, 0], 40]], t);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],
  [64.2, 66.6, (F, t) => {
    const { hero, p } = F;
    hero.setPose(P({ ry: RIGHT, ...REACH_R, rsX: -2.0, hdX: -0.3, mouth: "smile", browY: 0.6, x: GAP.HERO[0], t, wind: 0.5, eyeL: blinkAt(t), eyeR: blinkAt(t) }));
    F.worlds.gap.scene.add(hero.root);
    crystalWithSymbols(F, t, seg(t, 64.2, 65.0));
    const a = lerp(-0.6, 0.9, sine(seg(t, 64.2, 66.6)));
    return { world: "gap", cam: [[CRY[0] + Math.sin(a) * 3.8, CRY[1] + 0.2, CRY[2] + Math.cos(a) * 3.8], [CRY[0] - 0.4, CRY[1] - 0.15, CRY[2]], 42] };
  }],
  [66.6, 70.4, (F, t) => {
    const { hero, p } = F;
    hero.setPose(P({ ry: RIGHT, ...REACH_R, rsX: -1.9, hdX: -0.1, mouth: "flat", browL: 0.25, browR: 0.25, x: GAP.HERO[0], t, wind: 0.5, eyeL: blinkAt(t), eyeR: blinkAt(t) }));
    F.worlds.gap.scene.add(hero.root);
    crystalWithSymbols(F, t, 1, 0.3 * seg(t, 68.8, 70.4));
    // scanning cone sweeps the gap
    if (t < 68.6) {
      const sp = easeInOut(seg(t, 66.7, 68.4));
      const tx = lerp(-0.5, 10.5, sp);
      const from = new THREE.Vector3(...CRY), to = new THREE.Vector3(tx, -6, 0);
      p.scan.visible = true;
      const d = new THREE.Vector3().subVectors(to, from);
      p.scan.position.copy(from).addScaledVector(d, 0.5);
      p.scan.scale.set(2.2, d.length(), 0.5);
      p.scan.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), d.clone().normalize());
      p.scan.material.opacity = 0.22 * seg(t, 66.6, 66.9) * (1 - seg(t, 68.2, 68.6));
    }
    dimsFrame(F, t);
    p.ghost.visible = t > 67.6;
    p.ghost.material.opacity = (0.16 + 0.06 * Math.sin(t * 10)) * seg(t, 67.6, 68.2);
    const c = camPath([[66.6, [4.8, 6.0, 15.5], [5, -1.0, 0], 42], [68.8, [5.6, 5.2, 14.0], [5, -1.2, 0], 40], [70.4, [-4.0, 2.0, 3.2], [5, -0.5, -1], 46]], t);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],
  [70.4, 72.8, (F, t) => {
    const { hero, p } = F;
    hero.setPose(P({ ry: RIGHT, ...REACH_R, rsX: -1.9, lsX: -1.2, leX: -0.3, hdX: 0.05, mouth: "open", mouthS: 0.7, browY: 1, x: GAP.HERO[0], t, wind: 0.7, eyeL: blinkAt(t), eyeR: blinkAt(t) }));
    F.worlds.gap.scene.add(hero.root);
    crystalWithSymbols(F, t, 1, 0.5);
    dimsFrame(F, t);
    p.ghost.visible = true;
    p.ghost.material.opacity = 0.16 * (1 - seg(t, 72.3, 72.8));
    bridgeBuilt(F, seg(t, 70.4, 72.8));
    const c = camPath([[70.4, [1.4, -1.6, 9.5], [5, -1.4, 0], 46], [72.8, [8.6, 0.4, 8.6], [4, -1.0, 0], 46]], t, sine);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],
  [72.8, 74.6, (F, t) => {
    const { hero, p } = F;
    const hop = Math.abs(Math.sin((t - 72.8) * 5.2)) * 0.45 * (t > 72.95 ? 1 : 0);
    hero.setPose(P({ ...CHEER, x: GAP.HERO[0], y: hop, ry: RIGHT - 0.9, hipY: hop > 0.2 ? 0.0 : -0.06, llX: -0.2 * hop * 2, lkX: 0.6 * hop * 2, rlX: -0.1, rkX: 0.4 * hop * 2, t, wind: 0.6 }));
    F.worlds.gap.scene.add(hero.root);
    crystalWithSymbols(F, t, 1, 0);
    bridgeBuilt(F, 1);
    // golden shimmer along the deck
    p.sparks.points.visible = true;
    const r = rng(31);
    p.sparks.set((i) => {
      const u = t - 72.8 - r() * 1.2;
      if (u < 0 || u > 0.8) return null;
      return [r() * 10, 0.3 + u * 1.5 + r() * 0.3, (r() - 0.5) * 2.4];
    });
    return { world: "gap", cam: [[1.0, 1.4, 4.6], [-0.8, 1.35, 0], 42] };
  }],
  [74.6, 76.0, (F, t) => {
    const { hero, p } = F;
    hero.setPose(P({ ry: RIGHT - 1.1, mouth: "grin", happyEyes: 1, hdX: -0.3, spX: -0.12, lsZ: 0.5, rsZ: -0.5, browY: 1, x: GAP.HERO[0], t, wind: 0.6 }));
    F.worlds.gap.scene.add(hero.root);
    bridgeBuilt(F, 1);
    return { world: "gap", cam: faceCam(hero, 1.5, 0.45, -0.1, 36, 0.05) };
  }],

  // ============================================================ SCENE 7 · De echte schat
  [76.0, 78.8, (F, t) => {
    const { hero } = F;
    const k = seg(t, 76.0, 78.8);
    const x = lerp(-0.8, 15.6, k);
    hero.setPose(P({ ...gait((t - 76) * 10.5, 1, 0.3), x, ry: RIGHT, mouth: "smile", browY: 0.5, t, wind: 0.6, eyeL: blinkAt(t), eyeR: blinkAt(t) }));
    F.worlds.gap.scene.add(hero.root);
    bridgeBuilt(F, 1);
    F.worlds.gap.aim(x, 0, 0);
    return { world: "gap", cam: [[x - 1.0, 1.0, 5.4], [x + 1.4, 0.4, 0], 46] };
  }],
  [78.8, 82.6, (F, t) => {
    const { hero, p } = F;
    const G = F.worlds.gap;
    G.aim(16, 0, 0);
    const pose = track([
      [78.8, P({ ry: RIGHT - 0.3, mouth: "smile" })],
      [79.1, P({ ry: RIGHT - 0.3, ...KNEEL, lsX: -1.4, rsX: -1.4, leX: -0.5, reX: -0.5, hdX: 0.25, mouth: "smile", browY: 0.6 })],
      [79.7, P({ ry: RIGHT - 0.3, ...KNEEL, lsX: -1.8, rsX: -1.8, leX: -0.3, reX: -0.3, spX: -0.05, hdX: 0.0, mouth: "open", mouthS: 0.9, browY: 1.2 })],
      [80.6, P({ ry: RIGHT - 0.3, mouth: "open", mouthS: 0.9, browY: 1.2, ...LOOKUP, hdX: -0.25 })],
      [82.6, P({ ry: RIGHT - 0.3, mouth: "open", mouthS: 1.0, browY: 1.3, ...LOOKUP, hdX: -0.6, lsZ: 0.3, rsZ: -0.3 })],
    ], t);
    hero.setPose({ ...pose, x: 15.75, z: -0.1, t, wind: 0.5, eyeL: blinkAt(t), eyeR: blinkAt(t) });
    G.scene.add(hero.root);
    bridgeBuilt(F, 1);
    const open = easeOut(seg(t, 79.05, 79.6));
    G.chest.set(open, open * (0.8 + 0.2 * Math.sin(t * 6)));
    // the emblem rises from the chest
    if (t > 79.6) {
      const rise = easeOut(seg(t, 79.7, 80.8));
      p.gapEmblem.group.visible = true;
      p.gapEmblem.group.position.set(GAP.CHEST[0], lerp(0.6, 2.3, rise) + Math.sin(t * 2) * 0.05, GAP.CHEST[2]);
      p.gapEmblem.group.rotation.y = -0.6;
      p.gapEmblem.set(t, { scale: 0.35 + 0.5 * rise, build: seg(t, 80.5, 81.3) * 1.01, spin: t * 0.6, glowAmt: 0.9 });
    }
    const c = camPath([[78.8, [18.9, 1.0, 2.0], [16.4, 1.0, -0.2], 40], [80.6, [19.3, 0.9, 2.6], [16.8, 1.3, -0.3], 40], [82.6, [19.8, 0.7, 3.6], [16.8, 2.0, -0.4], 42]], t);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],
  [82.6, 85.0, (F, t) => {
    const { hero, p } = F;
    const G = F.worlds.gap;
    const bloom = seg(t, 82.7, 84.6);
    applySky(G.sky, G.fog, "day", "gold", bloom);
    G.sun.color.set("#fff4dc").lerp(new THREE.Color("#ffd98a"), bloom);
    hero.setPose(P({ ry: RIGHT - 0.5, ...CHEER, happyEyes: 0, mouth: "open", mouthS: 1.1, x: 15.75, z: -0.1, t, wind: 0.8, lsZ: 2.0, rsZ: -2.0 }));
    G.scene.add(hero.root);
    bridgeBuilt(F, 1);
    G.chest.set(1, 0.6);
    const fly = easeIn(seg(t, 82.6, 83.1));
    p.gapEmblem.group.visible = t < 83.2;
    p.gapEmblem.group.position.set(GAP.CHEST[0], 2.3 + fly * 10, GAP.CHEST[2]);
    p.gapEmblem.set(t, { scale: 0.85, build: 1, spin: t * 0.6, glowAmt: 1 });
    // golden wave spreading over the world
    const w = seg(t, 83.1, 85.0);
    p.wave.visible = w > 0;
    p.wave.position.set(GAP.CHEST[0], 1.5, GAP.CHEST[2]);
    p.wave.scale.set(1 + w * 110, 1 + w * 110, 1 + w * 30);
    p.wave.material.opacity = (1 - w);
    G.worldCrystals.forEach((c, i) => c.set(t, { glowAmt: clamp((t - 83.3 - i * 0.18) / 0.4), scale: 1, ringAmt: 0 }));
    G.pillars.forEach((m, i) => (m.material.opacity = 0.45 * clamp((t - 83.3 - i * 0.18) / 0.4) * (1 - 0.5 * seg(t, 84.4, 85))));
    G.flowers.set((s) => clamp((t - 83.2 - s.d * 0.04) / 0.5));
    const c = camPath([[82.6, [19.8, 0.7, 3.6], [16.8, 2.4, -0.4], 42], [85, [10, 22, 46], [2, 2, -30], 48]], t, easeInOut);
    return { world: "gap", cam: [c[1], c[2], c[3]] };
  }],

  // ============================================================ SCENE 8 · De onthulling
  [85.0, 87.0, (F, t) => {
    const { hero } = F;
    const G = F.worlds.gap;
    applySky(G.sky, G.fog, "gold", "dusk", 0.35);
    G.sun.color.set("#ffc890");
    G.aim(16, 0, 0);
    G.worldCrystals.forEach((c) => c.set(t, { glowAmt: 0.8 }));
    G.flowers.set(() => 1);
    hero.setPose(P({ ry: 0.25, mouth: "smirk", browL: 0.25, browR: 0.25, hdY: 0.1, hdX: 0.05, x: 15.75, z: -0.1, t, wind: 0.7, eyeL: blinkAt(t, 3), eyeR: blinkAt(t, 3) }));
    G.scene.add(hero.root);
    bridgeBuilt(F, 1);
    G.chest.set(1, 0.3);
    return { world: "gap", cam: faceCam(hero, lerp(1.7, 1.3, sine(seg(t, 85, 87))), 0.3, 0.0, 34) };
  }],
  [87.0, 88.8, (F, t) => {
    const { hero, p } = F;
    const G = F.worlds.gap;
    applySky(G.sky, G.fog, "gold", "dusk", 0.4);
    G.sun.color.set("#ffc890");
    G.aim(16, 0, 0);
    G.worldCrystals.forEach((c) => c.set(t, { glowAmt: 0.8 }));
    G.flowers.set(() => 1);
    const pose = track([
      [87.0, P({ ry: 0.25, mouth: "smirk", browL: 0.25, browR: 0.25 })],
      [87.35, P({ ry: 0.25, ...GLASSES, mouth: "smirk", browL: 0.25, browR: 0.25 })],
      [87.6, P({ ry: 0.25, ...GLASSES, glassesY: 0.015, mouth: "smirk", browL: 0.25, browR: 0.25 })],
      [87.9, P({ ry: 0.25, glassesY: 0.0, mouth: "smirk", winkR: 1, browL: 0.2, browR: -0.1, hdZ: -0.08 })],
      [88.8, P({ ry: 0.25, mouth: "smirk", winkR: 1, browL: 0.2, browR: -0.1, hdZ: -0.08 })],
    ], t);
    hero.setPose({ ...pose, winkR: t > 87.85 && t < 88.55 ? 1 : 0, x: 15.75, z: -0.1, t, wind: 0.7 });
    G.scene.add(hero.root);
    bridgeBuilt(F, 1);
    G.chest.set(1, 0.3);
    const hp = headPos(hero);
    hero.root.updateMatrixWorld(true);
    const lens = hero.lenses[0].getWorldPosition(new THREE.Vector3());
    const gk = seg(t, 87.6, 88.0);
    p.glint.visible = gk > 0 && gk < 1;
    p.glint.position.copy(lens).add(new THREE.Vector3(0.0, 0.02, 0.05));
    p.glint.scale.setScalar(0.35 * Math.sin(gk * Math.PI));
    p.glint.material.rotation = gk * 1.5;
    return { world: "gap", cam: faceCam(hero, 1.25, 0.22, 0.0, 34) };
  }],
  [88.8, 91.0, (F, t) => {
    const { hero } = F;
    const G = F.worlds.gap;
    applySky(G.sky, G.fog, "dusk");
    G.sun.color.set("#ffb07a");
    G.sun.intensity = 2.0;
    G.hemi.color.set("#ffc8b0");
    G.aim(14, 0, 0, [0.7, 0.35, -0.6]);
    G.worldCrystals.forEach((c) => c.set(t, { glowAmt: 0.9 }));
    G.flowers.set(() => 1);
    hero.setPose(P({ ry: 0.5, hdY: -0.5, mouth: "smile", hdX: -0.1, x: 13.0, z: 0.4, t, wind: 1, eyeL: blinkAt(t), eyeR: blinkAt(t) }));
    G.scene.add(hero.root);
    bridgeBuilt(F, 1);
    G.chest.set(1, 0.2);
    const hp = headPos(hero);
    const k = easeInOut(seg(t, 88.8, 91.0));
    const near = [hp.x + 0.9, hp.y + 0.1, hp.z + 1.0], far = [hp.x + 9, hp.y + 3.0, hp.z + 9];
    return { world: "gap", cam: [lerp3(near, far, k), lerp3([hp.x, hp.y, hp.z], [6, 1.0, -2], k), lerp(36, 46, k)] };
  }],
  [91.0, 95.1, (F, t) => {
    const { hero } = F;
    const G = F.worlds.gap;
    applySky(G.sky, G.fog, "night");
    G.sun.intensity = 0.25;
    G.sun.color.set("#8fa8ff");
    G.hemi.intensity = 0.35;
    G.hemi.color.set("#5a6aa8");
    G.stars.points.visible = true;
    G.stars.mat.opacity = 0.6 + 0.4 * Math.sin(t * 2);
    G.worldCrystals.forEach((c, i) => c.set(t, { glowAmt: 0.9 + 0.1 * Math.sin(t * 2 + i) }));
    G.flowers.set(() => 1);
    bridgeBuilt(F, 1);
    hero.root.parent && hero.root.parent.remove(hero.root);
    const k = seg(t, 91, 95);
    return { world: "gap", cam: [[lerp(-6, -2, k), 7, 34], [0, 12, -60], 50] };
  }],
];

// ---------------------------------------------------------------- sub-routines
function duckFrame(F, t, built, poof) {
  const { duck } = F.p;
  duck.mesh.visible = true;
  const n = duck.list.length;
  const bob = Math.sin(t * 4) * 0.08;
  const squash = t > 13.0 && t < 13.4 ? 1 + Math.sin(seg(t, 13.0, 13.4) * Math.PI) * 0.12 : 1;
  const ox = 5.4, oy = -0.3;
  duck.list.forEach((v, i) => {
    const d = (i / n) * 0.75;
    const q = clamp((built - d) / 0.25);
    if (q <= 0) return duck.set(i, 0, -999, 0, 0, 0, 0, 0);
    const e = easeOut(q);
    let x = lerp(CRY[0], ox + v.x, e), y = lerp(CRY[1], oy + v.y * squash + bob, e) + Math.sin(q * Math.PI) * 1.0, z = lerp(CRY[2], v.z, e);
    let rx = 0, rz = 0;
    if (poof > 0) {
      const r = rng(i + 7);
      x += (r() - 0.5) * 6 * poof;
      z += (r() - 0.5) * 6 * poof;
      y += (r() * 2 - 0.5) * 3 * poof - 14 * poof * poof;
      rx = r() * 8 * poof;
      rz = r() * 8 * poof;
    }
    duck.set(i, x, y, z, rx, 0, rz, 1);
  });
  duck.done();
}

function grailFrame(F, t, glow) {
  const { grail } = F.p;
  grail.group.visible = true;
  grail.group.position.set(HALL.ALTAR[0], HALL.GRAIL_Y + Math.sin(t * 1.8) * 0.08, HALL.ALTAR[2]);
  grail.group.rotation.y = t * 0.5;
  grail.set(t, glow);
}

const SYM_HALL = [[-2.1, 3.5, -8.4], [-0.75, 4.3, -8.6], [0.75, 4.3, -8.6], [2.1, 3.5, -8.4]];
function symbolsHall(F, t, appear) {
  F.p.hallSyms.forEach((s, i) => {
    const tp = 42.6 + i * 0.42;
    const k = t > 44.5 ? 1 : seg(t, tp - 0.25, tp + 0.15);
    s.group.position.set(SYM_HALL[i][0], SYM_HALL[i][1] + Math.sin(t * 1.6 + i) * 0.06, SYM_HALL[i][2]);
    s.group.rotation.y = Math.sin(t * 0.8 + i) * 0.35;
    const hit = 54.0 + i * 0.6;
    const flash = t > hit && t < hit + 0.5 ? 1 - seg(t, hit, hit + 0.5) : 0;
    s.set(t, { scale: backOut(k) * (1 + flash * 0.4), glowAmt: 0.5 + flash });
  });
}

function explosionFrame(F, t) {
  const { goldCubes, grail } = F.p;
  grail.group.visible = false;
  goldCubes.visible = true;
  const d = new THREE.Object3D();
  const r = rng(99);
  const o = [HALL.ALTAR[0], HALL.GRAIL_Y + 0.3, HALL.ALTAR[2]];
  const u = t - 39.5;
  for (let i = 0; i < 600; i++) {
    const a = r() * Math.PI * 2, b = (r() - 0.5) * Math.PI, sp = 1.5 + Math.pow(r(), 0.5) * 7;
    const tgt = SYM_HALL[i % 4];
    const k = 2.4, e = (1 - Math.exp(-k * u)) / k;
    let x = o[0] + Math.cos(a) * Math.cos(b) * sp * e, y = o[1] + Math.sin(b) * sp * e * 0.7 - 0.6 * u * u * 0.3, z = o[2] + Math.sin(a) * Math.cos(b) * sp * e;
    const gp = easeInOut(clamp((t - 41.3 - (i % 4) * 0.42 - r() * 0.5) / 0.9));
    const sw = r() * 6.28;
    x = lerp(x, tgt[0] + Math.cos(sw + t * 3) * 0.35 * (1 - gp), gp);
    y = lerp(y, tgt[1] + Math.sin(sw + t * 3) * 0.35 * (1 - gp), gp);
    z = lerp(z, tgt[2], gp);
    const s = gp >= 1 ? 0 : 1 - gp * 0.6;
    d.position.set(x, y, z);
    d.rotation.set(u * 4 + i, u * 3, 0);
    d.scale.setScalar(s);
    d.updateMatrix();
    goldCubes.setMatrixAt(i, d.matrix);
  }
  goldCubes.instanceMatrix.needsUpdate = true;
  symbolsHall(F, t, 1);
  // the flash of light
  F.p.hallSparks.points.visible = u < 1.2;
  const r2 = rng(3);
  F.p.hallSparks.set(() => {
    const a = r2() * 6.28, b = (r2() - 0.5) * 3, sp = 2 + r2() * 5;
    return [o[0] + Math.cos(a) * sp * u, o[1] + b * u, o[2] + Math.sin(a) * sp * u];
  });
}

const ITEM_ROW = [[-1.5, 0.02, -4.9], [-0.5, 0.02, -5.1], [0.5, 0.02, -5.1], [1.5, 0.02, -4.9]];
function itemsFrame(F, t) {
  const { items } = F.p;
  items.forEach((g, k) => {
    const tPop = 49.0 + k * 1.0, tFly = 53.5 + k * 0.6;
    if (t < tPop) return;
    g.visible = true;
    const pp = easeOut(seg(t, tPop, tPop + 0.5));
    const src = [0, 0.5, -3.85];
    let x = lerp(src[0], ITEM_ROW[k][0], pp), y = lerp(src[1], ITEM_ROW[k][1] + 0.18, pp) + Math.sin(pp * Math.PI) * 0.9, z = lerp(src[2], ITEM_ROW[k][2], pp);
    let s = 1, rx = -0.5, ry = Math.PI + (k - 1.5) * 0.25;
    if (t > tFly) {
      const fp = easeInOut(seg(t, tFly, tFly + 0.5));
      const tg = SYM_HALL[k];
      x = lerp(ITEM_ROW[k][0], tg[0], fp);
      y = lerp(ITEM_ROW[k][1] + 0.18, tg[1], fp) + Math.sin(fp * Math.PI) * 0.6;
      z = lerp(ITEM_ROW[k][2], tg[2] + 0.2, fp);
      s = 1 - 0.9 * fp;
      rx = lerp(-0.5, 0, fp);
      if (fp >= 1) return (g.visible = false);
    }
    g.position.set(x, y, z);
    g.rotation.set(rx + (pp < 1 ? (1 - pp) * 6 : 0), ry, 0);
    g.scale.setScalar(Math.max(0.001, s * 1.3));
  });
}

function connectFrame(F, t) {
  const { hallBeams, hallEmblem, swirl } = F.p;
  if (t < 56.0) return;
  const k = seg(t, 56.0, 56.8);
  const core = new THREE.Vector3(0, 5.2, -8.6);
  const pts = SYM_HALL.map((s) => new THREE.Vector3(...s));
  hallBeams.forEach((b, i) => {
    b.visible = true;
    b.material.opacity = 0.85 * k;
    if (i < 3) placeRod(b, pts[i], pts[i].clone().lerp(pts[i + 1], k));
    else if (i < 7) placeRod(b, pts[i - 3], pts[i - 3].clone().lerp(core, k));
    else b.visible = false;
  });
  hallEmblem.group.visible = true;
  hallEmblem.group.position.copy(core);
  const order = easeInOut(seg(t, 56.6, 57.8));
  hallEmblem.set(t, { scale: 0.6 + 0.5 * order + 0.5 * seg(t, 58.4, 61.5), build: 1.01 * k, spin: t * 0.4, glowAmt: 0.8 + 0.6 * seg(t, 58.4, 61.5) });
  swirl.points.visible = true;
  const r = rng(5);
  swirl.set((i) => {
    const ra = r() * 6.28, rr = 0.8 + r() * 3.2, sp = 1 + r() * 2.5, rb = r() * 6.28;
    const cx = Math.cos(ra + t * sp) * rr * (0.6 + 0.4 * Math.sin(t * 3 + i)), cy = 4 + Math.sin(rb + t * sp * 1.3) * 1.6, cz = Math.sin(ra * 1.7 + t * sp) * rr * 0.6;
    const ring = i % 3, ang = (i / 87) * 6.283 + t * (0.8 + ring * 0.3);
    const ox = Math.cos(ang) * (1.2 + ring * 0.6), oy = Math.sin(ang) * (1.2 + ring * 0.6), oz = 0;
    return [lerp(cx, core.x + ox, order), lerp(cy, core.y + oy, order), lerp(cz - 8, core.z + oz, order)];
  });
}

function crystalWithSymbols(F, t, appear, extraGlow = 0) {
  const { crystal, gapSyms, links } = F.p;
  crystal.group.visible = true;
  crystal.group.position.set(CRY[0], CRY[1] + Math.sin(t * 2.4) * 0.05, CRY[2]);
  crystal.set(t, { glowAmt: 1 + extraGlow, scale: 1.25, ringAmt: 0.6, spin: 1.5 });
  gapSyms.forEach((s, i) => {
    const a = t * 1.1 + (i * Math.PI) / 2;
    const k = backOut(clamp((appear - i * 0.15) / 0.4));
    const pos = new THREE.Vector3(CRY[0] + Math.cos(a) * 1.15, CRY[1] + Math.sin(a * 1.0) * 0.25, CRY[2] + Math.sin(a) * 1.15);
    s.group.position.copy(pos);
    s.group.lookAt(pos.x + Math.cos(a) * 3, pos.y, pos.z + Math.sin(a) * 3);
    s.set(t, { scale: 0.42 * k, glowAmt: 0.45 });
    links[i].visible = k > 0.2;
    placeRod(links[i], pos, new THREE.Vector3(...CRY));
    links[i].material.opacity = 0.7 * clamp(k);
  });
}

function dimsFrame(F, t) {
  const { dims, dimBar, ticks, dimV, dimMat } = F.p;
  if (t < 67.2) return;
  dims.visible = true;
  dimMat.opacity = seg(t, 67.2, 67.6) * (1 - seg(t, 72.2, 72.8));
  const w = 10 * easeOut(seg(t, 67.2, 68.3));
  dimBar.scale.x = Math.max(0.01, w);
  dimBar.position.set(w / 2, 1.3, 1.6);
  ticks.forEach((tk, i) => {
    tk.visible = i * 1.0 <= w + 0.01;
    tk.position.set(i, 1.3, 1.6);
  });
  const h = 4.4 * easeOut(seg(t, 67.6, 68.6));
  dimV.scale.y = Math.max(0.01, h);
  dimV.position.set(10.6, -h / 2, 1.6);
}
