// Props: crystal, chest, voxel duck, stone blocks, symbols, emblem, items, scroll, map, grail, torches…
import { THREE, toon, roundedBox, OUTLINE, glowSprite, starSprite, canvasTex, rng, clamp, lerp, easeOut, Builder } from "./core.js";

const outline = (m, k = 0.02) => {
  const o = new THREE.Mesh(m.geometry, OUTLINE);
  m.geometry.computeBoundingBox();
  const s = new THREE.Vector3();
  m.geometry.boundingBox.getSize(s);
  o.scale.set(1 + (2 * k) / Math.max(s.x, 0.02), 1 + (2 * k) / Math.max(s.y, 0.02), 1 + (2 * k) / Math.max(s.z, 0.02));
  m.add(o);
  return m;
};
const mesh = (g, color, o = {}) => {
  const m = new THREE.Mesh(g, o.mat || toon(color, o.matOpts || {}));
  if (o.pos) m.position.set(...o.pos);
  if (o.rot) m.rotation.set(...o.rot);
  m.castShadow = o.shadow !== false;
  m.receiveShadow = !!o.receive;
  if (o.outline) outline(m, o.outline === true ? 0.02 : o.outline);
  return m;
};

// ---------------------------------------------------------------- crystal
export function makeCrystal() {
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const mat = new THREE.MeshToonMaterial({ color: "#5aa8ff", emissive: "#1f5ae0", emissiveIntensity: 0.55 });
  const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), mat);
  c.scale.set(1, 1.75, 1);
  body.add(outline(c, 0.015));
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), new THREE.MeshBasicMaterial({ color: "#e8f8ff" }));
  core.scale.set(1, 1.7, 1);
  body.add(core);
  const glow = glowSprite("#6fc4ff", 1.6, 0.8);
  g.add(glow);
  const light = new THREE.PointLight("#7fc8ff", 0, 6, 1.6);
  g.add(light);
  // orbiting sparkle ring
  const ring = new THREE.Group();
  g.add(ring);
  for (let i = 0; i < 6; i++) {
    const s = starSprite("#dff4ff", 0.12);
    s.position.set(Math.cos((i / 6) * Math.PI * 2) * 0.5, 0, Math.sin((i / 6) * Math.PI * 2) * 0.5);
    ring.add(s);
  }
  return {
    group: g,
    set(t, { glowAmt = 0.6, spin = 1, scale = 1, ringAmt = 0, flash = 0 } = {}) {
      body.rotation.y = t * 1.6 * spin;
      body.scale.setScalar(scale);
      glow.material.opacity = clamp(glowAmt + flash);
      glow.scale.setScalar((0.9 + glowAmt * 1.0 + flash * 2) * scale);
      light.intensity = (glowAmt * 6 + flash * 12) * scale;
      mat.emissiveIntensity = 0.35 + glowAmt * 0.3 + flash;
      ring.visible = ringAmt > 0;
      ring.rotation.y = t * 1.3;
      ring.children.forEach((s, i) => (s.material.opacity = ringAmt * (0.5 + 0.5 * Math.sin(t * 5 + i))));
    },
  };
}

// ---------------------------------------------------------------- chest
export function makeChest() {
  const g = new THREE.Group();
  const wood = "#7a4a22", band = "#e0b13a";
  g.add(mesh(roundedBox(1.0, 0.55, 0.65, 0.04), wood, { pos: [0, 0.275, 0], outline: true }));
  [-0.36, 0.36].forEach((x) => g.add(mesh(new THREE.BoxGeometry(0.1, 0.57, 0.67), band, { pos: [x, 0.275, 0] })));
  g.add(mesh(new THREE.BoxGeometry(0.16, 0.18, 0.04), band, { pos: [0, 0.42, 0.33] }));
  const lid = new THREE.Group();
  lid.position.set(0, 0.55, -0.325);
  g.add(lid);
  // half-cylinder lid (dome up, axis along x), hinged at the back edge
  lid.add(mesh(new THREE.CylinderGeometry(0.325, 0.325, 1.0, 10, 1, false, 0, Math.PI), wood, { pos: [0, 0, 0.325], rot: [0, 0, Math.PI / 2], outline: true }));
  [-0.36, 0.36].forEach((x) => lid.add(mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.1, 10, 1, false, 0, Math.PI), band, { pos: [x, 0, 0.325], rot: [0, 0, Math.PI / 2] })));
  const inner = glowSprite("#ffe27a", 1.8, 0);
  inner.position.set(0, 0.6, 0);
  g.add(inner);
  const light = new THREE.PointLight("#ffd860", 0, 7, 1.5);
  light.position.set(0, 0.9, 0.2);
  g.add(light);
  return {
    group: g,
    set(open, glow = 0) {
      lid.rotation.x = -open * 1.9;
      inner.material.opacity = glow;
      inner.scale.setScalar(1.4 + glow * 1.6);
      light.intensity = glow * 5;
    },
  };
}

// ---------------------------------------------------------------- instanced blocks
export function makeBlocks(count, size = [0.5, 0.35, 0.6], color = "#a0968a") {
  const geo = roundedBox(size[0] * 0.96, size[1] * 0.94, size[2] * 0.96, 0.035, 2);
  const im = new THREE.InstancedMesh(geo, toon("#ffffff"), count);
  im.castShadow = true;
  im.receiveShadow = true;
  const c = new THREE.Color();
  const r = rng(count + 3);
  for (let i = 0; i < count; i++) {
    c.set(color).offsetHSL(0, (r() - 0.5) * 0.06, (r() - 0.5) * 0.1);
    im.setColorAt(i, c);
  }
  im.frustumCulled = false;
  const dummy = new THREE.Object3D();
  return {
    mesh: im,
    hide() {
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      for (let i = 0; i < count; i++) im.setMatrixAt(i, dummy.matrix);
      im.instanceMatrix.needsUpdate = true;
    },
    set(i, x, y, z, rx = 0, ry = 0, rz = 0, s = 1) {
      dummy.position.set(x, y, z);
      dummy.rotation.set(rx, ry, rz);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    },
    done() {
      im.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- voxel duck
export function duckVoxels() {
  const v = [];
  const S = 0.25;
  for (let x = -8; x <= 8; x++)
    for (let y = 0; y <= 13; y++)
      for (let z = -5; z <= 5; z++) {
        const p = new THREE.Vector3(x * S, y * S, z * S);
        const body = ((p.x - 0.2) / 1.35) ** 2 + ((p.y - 0.95) / 0.8) ** 2 + (p.z / 0.95) ** 2;
        const head = ((p.x + 0.95) / 0.62) ** 2 + ((p.y - 2.2) / 0.62) ** 2 + (p.z / 0.58) ** 2;
        const tail = ((p.x - 1.45) / 0.35) ** 2 + ((p.y - 1.5) / 0.35) ** 2 + (p.z / 0.4) ** 2;
        const beak = p.x < -1.35 && p.x > -2.0 && Math.abs(p.y - 2.05) < 0.17 && Math.abs(p.z) < 0.3;
        const inside = body < 1 || head < 1 || tail < 1;
        if (!inside && !beak) continue;
        // keep a shell only
        const shell = body > 0.55 || head > 0.4 || tail > 0.2 || beak;
        if (!shell) continue;
        let col = "#f4c430";
        if (beak) col = "#f08a24";
        else if (head < 1 && Math.abs(p.z) > 0.38 && Math.abs(p.y - 2.35) < 0.15 && Math.abs(p.x + 1.15) < 0.15) col = "#1a120a";
        else if (body < 1 && Math.abs(p.z) > 0.7 && p.y > 0.8 && p.y < 1.3 && p.x > -0.1 && p.x < 0.9) col = "#d9a521";
        else if (p.y < 0.4) col = "#e0b020";
        v.push({ x: p.x, y: p.y, z: p.z, col });
      }
  return v;
}
export function makeColoredInstances(list, size = 0.25) {
  const geo = new THREE.BoxGeometry(size * 0.96, size * 0.96, size * 0.96);
  const im = new THREE.InstancedMesh(geo, toon("#ffffff"), list.length);
  im.castShadow = true;
  im.frustumCulled = false;
  const c = new THREE.Color();
  list.forEach((v, i) => im.setColorAt(i, c.set(v.col)));
  const dummy = new THREE.Object3D();
  return {
    mesh: im,
    list,
    set(i, x, y, z, rx = 0, ry = 0, rz = 0, s = 1) {
      dummy.position.set(x, y, z);
      dummy.rotation.set(rx, ry, rz);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    },
    done() {
      im.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- symbols
const ICON = {
  target(x, w) {
    x.strokeStyle = "#fff";
    x.lineWidth = 7;
    [38, 24, 10].forEach((r) => {
      x.beginPath();
      x.arc(w / 2, w / 2, r, 0, 7);
      x.stroke();
    });
    x.fillStyle = "#fff";
    x.beginPath();
    x.arc(w / 2, w / 2, 5, 0, 7);
    x.fill();
  },
  book(x, w) {
    x.fillStyle = "#fff";
    x.fillRect(22, 30, 40, 52);
    x.fillRect(66, 30, 40, 52);
    x.fillStyle = "#4da3ff";
    for (let i = 0; i < 4; i++) {
      x.fillRect(28, 40 + i * 10, 28, 4);
      x.fillRect(72, 40 + i * 10, 28, 4);
    }
  },
  clock(x, w) {
    x.strokeStyle = "#fff";
    x.lineWidth = 8;
    x.beginPath();
    x.arc(w / 2, w / 2, 36, 0, 7);
    x.stroke();
    x.lineWidth = 7;
    x.beginPath();
    x.moveTo(w / 2, w / 2);
    x.lineTo(w / 2, w / 2 - 24);
    x.moveTo(w / 2, w / 2);
    x.lineTo(w / 2 + 18, w / 2 + 8);
    x.stroke();
  },
  tools(x, w) {
    x.fillStyle = "#fff";
    x.save();
    x.translate(w / 2, w / 2);
    x.rotate(-0.78);
    x.fillRect(-6, -10, 12, 50);
    x.beginPath();
    x.arc(0, -22, 18, 0, 7);
    x.fill();
    x.fillStyle = "#b55cff";
    x.fillRect(-6, -44, 12, 18);
    x.restore();
  },
};
export const SYM_COLORS = { target: "#ff4d4d", book: "#4da3ff", clock: "#42d96b", tools: "#b55cff" };
export function makeSymbol(kind) {
  const g = new THREE.Group();
  const col = SYM_COLORS[kind];
  const rim = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 6), col, { rot: [Math.PI / 2, 0, 0], matOpts: { emissive: col, emissiveIntensity: 0.6 }, shadow: false });
  g.add(rim);
  const inner = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 6), "#1a1530", { rot: [Math.PI / 2, 0, 0], shadow: false });
  g.add(inner);
  const tex = canvasTex(128, 128, (x, w) => ICON[kind](x, w));
  const iconMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, color: "#ffffff" });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.52), iconMat);
  f.position.z = 0.065;
  g.add(f);
  const b = f.clone();
  b.rotation.y = Math.PI;
  b.position.z = -0.065;
  g.add(b);
  const glow = glowSprite(col, 2.2, 0.7);
  g.add(glow);
  return {
    group: g,
    set(t, { scale = 1, glowAmt = 0.6, face = 0 } = {}) {
      g.scale.setScalar(Math.max(0.0001, scale));
      glow.material.opacity = glowAmt;
      g.visible = scale > 0.001;
    },
  };
}

// ---------------------------------------------------------------- emblem (four connected points around a core)
export function makeEmblem() {
  const g = new THREE.Group();
  const gold = toon("#ffd04a", { emissive: "#ffb020", emissiveIntensity: 0.7 });
  const nodes = [];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 2;
    const n = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), gold);
    n.position.set(Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0);
    g.add(outline(n, 0.015));
    nodes.push(n);
  }
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), toon("#fff6c8", { emissive: "#fff0a0", emissiveIntensity: 1 }));
  g.add(core);
  const rods = [];
  const rodGeo = new THREE.CylinderGeometry(0.03, 0.03, 1, 6);
  for (let i = 0; i < 8; i++) {
    const rod = new THREE.Mesh(rodGeo, gold);
    g.add(rod);
    rods.push(rod);
  }
  const place = (rod, a, b) => {
    const d = new THREE.Vector3().subVectors(b, a);
    rod.position.copy(a).addScaledVector(d, 0.5);
    rod.scale.set(1, d.length(), 1);
    rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  };
  for (let i = 0; i < 4; i++) {
    place(rods[i], nodes[i].position, nodes[(i + 1) % 4].position);
    place(rods[i + 4], nodes[i].position, core.position);
  }
  const glow = glowSprite("#ffd860", 3, 0.8);
  g.add(glow);
  const light = new THREE.PointLight("#ffd860", 0, 8, 1.5);
  g.add(light);
  return {
    group: g,
    set(t, { scale = 1, glowAmt = 0.8, spin = 0, build = 1 } = {}) {
      g.scale.setScalar(Math.max(0.0001, scale));
      g.visible = scale > 0.001;
      g.rotation.z = spin;
      nodes.forEach((n, i) => (n.visible = build > i / 4));
      rods.forEach((r, i) => (r.visible = build >= 1));
      glow.material.opacity = glowAmt;
      glow.scale.setScalar(2 + glowAmt * 2);
      light.intensity = glowAmt * 8 * scale;
    },
  };
}

// ---------------------------------------------------------------- paper textures
export function blueprintTex() {
  return canvasTex(256, 160, (x, w, h) => {
    x.fillStyle = "#2f5fae";
    x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(255,255,255,0.18)";
    x.lineWidth = 1;
    for (let i = 0; i < w; i += 16) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i, h);
      x.stroke();
    }
    for (let i = 0; i < h; i += 16) {
      x.beginPath();
      x.moveTo(0, i);
      x.lineTo(w, i);
      x.stroke();
    }
    x.strokeStyle = "#ffffff";
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(20, 90);
    x.lineTo(236, 90);
    x.stroke();
    x.beginPath();
    x.arc(128, 150, 92, Math.PI * 1.13, Math.PI * 1.87);
    x.stroke();
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      x.moveTo(40 + i * 22, 90);
      x.lineTo(40 + i * 22, 90 + Math.max(0, 45 - Math.abs(i - 4) * 12));
      x.stroke();
    }
    x.fillStyle = "#fff";
    x.font = "bold 14px monospace";
    x.fillText("BRIDGE", 100, 30);
  });
}
export function paperTex(draw, w = 256, h = 180, bg = "#efe0b4") {
  return canvasTex(w, h, (x) => {
    x.fillStyle = bg;
    x.fillRect(0, 0, w, h);
    x.strokeStyle = "#c9b07a";
    x.lineWidth = 6;
    x.strokeRect(3, 3, w - 6, h - 6);
    draw(x, w, h);
  });
}
// a dynamic map whose red path draws itself: call redraw(p)
export function makeMapTex() {
  const tex = canvasTex(256, 180, () => {});
  const x = tex.userData.ctx;
  const draw = (p, glow = 0.5) => {
    x.fillStyle = "#efe0b4";
    x.fillRect(0, 0, 256, 180);
    x.strokeStyle = "#c9b07a";
    x.lineWidth = 6;
    x.strokeRect(3, 3, 250, 174);
    // mountains
    x.fillStyle = "#b89766";
    [[150, 120, 30], [185, 125, 34], [215, 122, 26]].forEach(([mx, my, s]) => {
      x.beginPath();
      x.moveTo(mx - s, my);
      x.lineTo(mx, my - s * 1.6);
      x.lineTo(mx + s, my);
      x.fill();
    });
    x.fillStyle = "#8a6a3a";
    x.beginPath();
    x.moveTo(185, 125);
    x.lineTo(185, 70);
    x.lineTo(219, 125);
    x.fill();
    // chalice on top of the tallest mountain
    x.fillStyle = `rgba(255,220,90,${0.35 + glow * 0.4})`;
    x.beginPath();
    x.arc(185, 52, 20, 0, 7);
    x.fill();
    x.fillStyle = "#d9a12a";
    x.beginPath();
    x.moveTo(173, 40);
    x.lineTo(197, 40);
    x.lineTo(190, 54);
    x.lineTo(180, 54);
    x.fill();
    x.fillRect(183, 54, 4, 8);
    x.fillRect(177, 62, 16, 4);
    // X marks the start
    x.strokeStyle = "#c0392b";
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(26, 140);
    x.lineTo(40, 154);
    x.moveTo(40, 140);
    x.lineTo(26, 154);
    x.stroke();
    // dashed path
    x.fillStyle = "#c0392b";
    for (let i = 0; i < 40; i++) {
      const q = i / 40;
      if (q > p) break;
      if (i % 2) continue;
      const px = 40 + q * 140, py = 145 - q * 70 + Math.sin(q * 9) * 14;
      x.fillRect(px, py, 6, 3);
    }
    // compass
    x.strokeStyle = "#8a6a3a";
    x.lineWidth = 2;
    x.beginPath();
    x.arc(42, 40, 16, 0, 7);
    x.moveTo(42, 18);
    x.lineTo(42, 62);
    x.moveTo(20, 40);
    x.lineTo(64, 40);
    x.stroke();
    tex.needsUpdate = true;
  };
  draw(0);
  return { tex, draw };
}

export function makeItem(kind) {
  const g = new THREE.Group();
  if (kind === "drawing" || kind === "measure") {
    const tex =
      kind === "drawing"
        ? paperTex((x, w, h) => {
            x.strokeStyle = "#2f5fae";
            x.lineWidth = 6;
            x.beginPath();
            x.moveTo(20, 110);
            x.lineTo(236, 110);
            x.stroke();
            x.beginPath();
            x.arc(128, 175, 95, Math.PI * 1.15, Math.PI * 1.85);
            x.stroke();
            for (let i = 0; i < 8; i++) {
              x.beginPath();
              x.moveTo(45 + i * 24, 110);
              x.lineTo(45 + i * 24, 112 + Math.max(0, 40 - Math.abs(i - 3.5) * 12));
              x.stroke();
            }
          })
        : paperTex((x, w, h) => {
            x.strokeStyle = "#cdb684";
            x.lineWidth = 1;
            for (let i = 0; i < w; i += 20) {
              x.beginPath();
              x.moveTo(i, 0);
              x.lineTo(i, h);
              x.stroke();
            }
            for (let i = 0; i < h; i += 20) {
              x.beginPath();
              x.moveTo(0, i);
              x.lineTo(w, i);
              x.stroke();
            }
            x.fillStyle = "#6b5a3a";
            x.fillRect(16, 100, 60, 70);
            x.fillRect(180, 100, 60, 70);
            x.strokeStyle = "#c0392b";
            x.lineWidth = 4;
            x.beginPath();
            x.moveTo(80, 80);
            x.lineTo(176, 80);
            x.moveTo(80, 70);
            x.lineTo(80, 90);
            x.moveTo(176, 70);
            x.lineTo(176, 90);
            x.stroke();
            x.fillStyle = "#c0392b";
            x.font = "bold 22px monospace";
            x.fillText("10m", 106, 66);
          });
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.012), [toon("#efe0b4"), toon("#efe0b4"), toon("#efe0b4"), toon("#efe0b4"), new THREE.MeshToonMaterial({ map: tex }), toon("#e3d3a4")]);
    p.castShadow = true;
    g.add(outline(p, 0.012));
  } else if (kind === "book") {
    const tex = canvasTex(64, 80, (x) => {
      x.fillStyle = "#8a3a22";
      x.fillRect(0, 0, 64, 80);
      x.fillStyle = "#5e2414";
      x.fillRect(0, 0, 8, 80);
      x.strokeStyle = "#ff4d4d";
      x.lineWidth = 6;
      x.beginPath();
      x.moveTo(20, 24);
      x.lineTo(50, 56);
      x.moveTo(50, 24);
      x.lineTo(20, 56);
      x.stroke();
    });
    const coverMat = new THREE.MeshToonMaterial({ map: tex });
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.09), [toon("#f3ead2"), toon("#5e2414"), toon("#f3ead2"), toon("#f3ead2"), coverMat, toon("#8a3a22")]);
    b.castShadow = true;
    g.add(outline(b, 0.012));
  } else if (kind === "toolbox") {
    g.add(mesh(roundedBox(0.5, 0.26, 0.26, 0.03), "#5a6070", { pos: [0, 0.13, 0], outline: 0.015 }));
    g.add(mesh(new THREE.BoxGeometry(0.52, 0.05, 0.28), "#7a8294", { pos: [0, 0.27, 0] }));
    g.add(mesh(new THREE.TorusGeometry(0.08, 0.018, 4, 8, Math.PI), "#2a2e36", { pos: [0, 0.29, 0] }));
    g.add(mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), "#e0b13a", { pos: [-0.15, 0.32, 0.05], rot: [0, 0, 0.3] }));
    g.add(mesh(new THREE.BoxGeometry(0.05, 0.18, 0.05), "#d64545", { pos: [0.16, 0.33, -0.04], rot: [0, 0, -0.2] }));
    g.add(mesh(new THREE.BoxGeometry(0.12, 0.05, 0.05), "#9aa3b0", { pos: [0.16, 0.43, -0.04], rot: [0, 0, -0.2] }));
    g.children.forEach((c) => (c.position.y -= 0.15));
  }
  return g;
}

// big blueprint scroll held with both hands: unroll 0..1
export function makeScroll() {
  const g = new THREE.Group();
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.9), new THREE.MeshToonMaterial({ map: blueprintTex(), side: THREE.DoubleSide }));
  g.add(paper);
  const rollerGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8);
  const rl = mesh(rollerGeo, "#c9a76a", { outline: 0.01 }), rr = mesh(rollerGeo, "#c9a76a", { outline: 0.01 });
  g.add(rl, rr);
  return {
    group: g,
    set(unroll) {
      const w = Math.max(0.02, 1.6 * unroll);
      paper.scale.x = w;
      paper.material.map.repeat.set(1, 1);
      rl.position.x = -w / 2;
      rr.position.x = w / 2;
    },
  };
}

export function makeGrail() {
  const g = new THREE.Group();
  const pts = [[0, 0], [0.22, 0], [0.22, 0.04], [0.06, 0.08], [0.05, 0.3], [0.08, 0.36], [0.22, 0.42], [0.26, 0.62], [0.24, 0.64], [0.19, 0.46], [0.0, 0.42]].map((p) => new THREE.Vector2(p[0], p[1]));
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 12), toon("#f2b632", { emissive: "#c07a10", emissiveIntensity: 0.55 }));
  m.castShadow = true;
  g.add(outline(m, 0.012));
  [0, 1, 2, 3].forEach((i) => {
    const gem = mesh(new THREE.OctahedronGeometry(0.035), i % 2 ? "#ff4d4d" : "#4da3ff", { matOpts: { emissive: i % 2 ? "#ff4d4d" : "#4da3ff", emissiveIntensity: 0.6 } });
    const a = (i / 4) * Math.PI * 2;
    gem.position.set(Math.cos(a) * 0.235, 0.53, Math.sin(a) * 0.235);
    g.add(gem);
  });
  const glow = glowSprite("#ffd860", 2.0, 0.55);
  glow.position.y = 0.35;
  g.add(glow);
  const light = new THREE.PointLight("#ffd27a", 6, 9, 1.4);
  light.position.y = 0.5;
  g.add(light);
  return {
    group: g,
    set(t, glowAmt = 0.6) {
      glow.material.opacity = clamp(glowAmt);
      glow.scale.setScalar(1.6 + glowAmt * 2.2);
      light.intensity = 1.5 + glowAmt * 4;
    },
  };
}

export function makeTorch() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.6, 6), "#4a3420", { pos: [0, 0, 0] }));
  g.add(mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.12, 6), "#6a4a2a", { pos: [0, 0.3, 0] }));
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 6), new THREE.MeshBasicMaterial({ color: "#ff9a2a" }));
  flame.position.y = 0.48;
  g.add(flame);
  const core = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.16, 6), new THREE.MeshBasicMaterial({ color: "#fff1a0" }));
  core.position.y = 0.44;
  g.add(core);
  const glow = glowSprite("#ffb040", 1.6, 0.6);
  glow.position.y = 0.48;
  g.add(glow);
  const light = new THREE.PointLight("#ffa040", 4, 9, 1.6);
  light.position.y = 0.6;
  g.add(light);
  return {
    group: g,
    light,
    set(t, k) {
      const f = 0.85 + 0.15 * Math.sin(t * 17 + k) + 0.1 * Math.sin(t * 29 + k * 2);
      flame.scale.set(1, f, 1);
      core.scale.set(1, f, 1);
      light.intensity = 4 * f;
      glow.material.opacity = 0.5 * f;
    },
  };
}

// particles: a Points cloud whose positions are set every frame by a closed-form function
export function makePoints(n, color = "#ffe27a", size = 3) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  const mat = new THREE.PointsMaterial({ color, size, sizeAttenuation: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(geo, mat);
  p.frustumCulled = false;
  return {
    points: p,
    mat,
    set(fn) {
      const a = geo.attributes.position.array;
      for (let i = 0; i < n; i++) {
        const v = fn(i);
        if (!v) {
          a[i * 3] = 0;
          a[i * 3 + 1] = -9999;
          a[i * 3 + 2] = 0;
        } else {
          a[i * 3] = v[0];
          a[i * 3 + 1] = v[1];
          a[i * 3 + 2] = v[2];
        }
      }
      geo.attributes.position.needsUpdate = true;
    },
  };
}

export function makeFlowers(spots) {
  // instanced little flowers: stem + head (two instanced meshes)
  const n = spots.length;
  const stem = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.22, 0.03), toon("#3d822b"), n);
  const head = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.07, 0), toon("#ffffff", { emissive: "#332211", emissiveIntensity: 0.2 }), n);
  const c = new THREE.Color();
  spots.forEach((s, i) => head.setColorAt(i, c.set(s.col)));
  stem.frustumCulled = head.frustumCulled = false;
  const d = new THREE.Object3D();
  return {
    group: (() => {
      const g = new THREE.Group();
      g.add(stem, head);
      return g;
    })(),
    set(fn) {
      spots.forEach((s, i) => {
        const k = clamp(fn(s, i));
        d.position.set(s.x, s.y + 0.11 * k, s.z);
        d.rotation.set(0, 0, 0);
        d.scale.set(1, Math.max(0.001, k), 1);
        d.updateMatrix();
        stem.setMatrixAt(i, d.matrix);
        d.position.set(s.x, s.y + 0.24 * k, s.z);
        d.scale.setScalar(Math.max(0.001, k > 0.5 ? (k - 0.5) * 2 : 0.001));
        d.updateMatrix();
        head.setMatrixAt(i, d.matrix);
      });
      stem.instanceMatrix.needsUpdate = true;
      head.instanceMatrix.needsUpdate = true;
    },
  };
}
