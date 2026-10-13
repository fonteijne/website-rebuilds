// Core helpers for the 3D film: math, seeded randomness, toon materials,
// a tiny geometry "builder" that merges many low-poly pieces into one mesh.
import * as THREE from "three";
export { THREE };

// ---------------------------------------------------------------- math
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, p) => a + (b - a) * p;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const easeOut = (p) => 1 - Math.pow(1 - p, 3);
export const easeIn = (p) => p * p * p;
export const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const sine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);
export const backOut = (p, s = 1.7) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);
export const smooth = (p) => p * p * (3 - 2 * p);
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// smooth deterministic value noise in 2D (for terrain jitter)
export function noise2(seed) {
  const r = rng(seed);
  const P = Array.from({ length: 256 }, () => r());
  const h = (i, j) => P[(i * 73856093 ^ j * 19349663) & 255];
  return (x, y) => {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = h(i, j), b = h(i + 1, j), c = h(i, j + 1), d = h(i + 1, j + 1);
    return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
  };
}

// ---------------------------------------------------------------- materials
const GRAD = (() => {
  const t = new THREE.DataTexture(new Uint8Array([70, 150, 215, 255]), 4, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
})();
const matCache = new Map();
export function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: GRAD, ...opts });
  matCache.set(key, m);
  return m;
}
export const VCOL = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: GRAD });
export function glowMat(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}
export const OUTLINE = new THREE.MeshBasicMaterial({ color: "#1a1210", side: THREE.BackSide });

// ---------------------------------------------------------------- geometry
// rounded box: a segmented box whose vertices are pushed onto a rounded shell
export function roundedBox(w, h, d, r = 0.05, seg = 3) {
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg);
  const p = g.attributes.position;
  const v = new THREE.Vector3(), inner = new THREE.Vector3();
  const hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    inner.set(clamp(v.x, -hw, hw), clamp(v.y, -hh, hh), clamp(v.z, -hd, hd));
    const off = v.clone().sub(inner);
    if (off.lengthSq() > 0) off.setLength(r);
    p.setXYZ(i, inner.x + off.x, inner.y + off.y, inner.z + off.z);
  }
  g.computeVertexNormals();
  return g;
}

// Builder: collect pieces (geometry + transform + colour), merge into one flat-shaded mesh
export class Builder {
  constructor() {
    this.pos = [];
    this.col = [];
  }
  add(geom, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, color = "#ffffff", jitter = 0, seed = 1, colorFn = null } = {}) {
    let g = geom.index ? geom.toNonIndexed() : geom.clone();
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)),
      new THREE.Vector3(sx, sy, sz),
    );
    g.applyMatrix4(m);
    const p = g.attributes.position;
    if (jitter) {
      // deterministic jitter keyed on rounded position so shared corners move together
      const r = (k) => {
        const s = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453;
        return (s - Math.floor(s)) * 2 - 1;
      };
      for (let i = 0; i < p.count; i++) {
        const X = p.getX(i), Y = p.getY(i), Z = p.getZ(i);
        const k = Math.round(X * 100) * 0.131 + Math.round(Y * 100) * 0.717 + Math.round(Z * 100) * 0.391;
        p.setXYZ(i, X + r(k) * jitter, Y + r(k + 1.7) * jitter, Z + r(k + 3.1) * jitter);
      }
    }
    const c = new THREE.Color(color);
    for (let i = 0; i < p.count; i++) {
      this.pos.push(p.getX(i), p.getY(i), p.getZ(i));
      if (colorFn) {
        const cc = new THREE.Color(colorFn(p.getX(i), p.getY(i), p.getZ(i)));
        this.col.push(cc.r, cc.g, cc.b);
      } else this.col.push(c.r, c.g, c.b);
    }
    return this;
  }
  // per-triangle colouring (e.g. snow caps): colour picked from the triangle's centroid
  addFaceColored(geom, opts, faceColorFn) {
    const start = this.pos.length;
    this.add(geom, opts);
    for (let i = start; i < this.pos.length; i += 9) {
      const cx = (this.pos[i] + this.pos[i + 3] + this.pos[i + 6]) / 3;
      const cy = (this.pos[i + 1] + this.pos[i + 4] + this.pos[i + 7]) / 3;
      const cz = (this.pos[i + 2] + this.pos[i + 5] + this.pos[i + 8]) / 3;
      const c = new THREE.Color(faceColorFn(cx, cy, cz));
      for (let k = 0; k < 3; k++) {
        this.col[i + k * 3] = c.r;
        this.col[i + k * 3 + 1] = c.g;
        this.col[i + k * 3 + 2] = c.b;
      }
    }
    return this;
  }
  mesh(material = VCOL) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.col, 3));
    g.computeVertexNormals(); // non-indexed → flat faceted normals
    const m = new THREE.Mesh(g, material);
    return m;
  }
}

// ---------------------------------------------------------------- sky
export function skyDome(radius = 400) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color("#3f7fd8") },
      mid: { value: new THREE.Color("#8cc4f2") },
      bot: { value: new THREE.Color("#e4f3fb") },
      sunDir: { value: new THREE.Vector3(0.4, 0.5, -0.7).normalize() },
      sunCol: { value: new THREE.Color("#fff3c8") },
      sunAmt: { value: 0.4 },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bot; uniform vec3 sunDir; uniform vec3 sunCol; uniform float sunAmt; varying vec3 vDir;
      void main(){
        float h = vDir.y;
        vec3 c = h > 0.12 ? mix(mid, top, smoothstep(0.12, 0.75, h)) : mix(bot, mid, smoothstep(-0.05, 0.12, h));
        float s = max(dot(normalize(vDir), sunDir), 0.0);
        c += sunCol * (pow(s, 64.0) * 1.2 + pow(s, 6.0) * 0.25) * sunAmt;
        // posterise slightly for the pixel-art look
        c = floor(c * 24.0 + 0.5) / 24.0;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), mat);
  m.renderOrder = -10;
  return m;
}
export const SKIES = {
  day: { top: "#3f7fd8", mid: "#8cc4f2", bot: "#e4f3fb", sun: "#fff3c8", sunAmt: 0.5, fog: "#cfe6f7" },
  gold: { top: "#4f86d8", mid: "#f2cf8a", bot: "#ffe9b8", sun: "#fff0b0", sunAmt: 1.0, fog: "#f5dfae" },
  dusk: { top: "#2f2d70", mid: "#e0787a", bot: "#ffd08a", sun: "#ffd27a", sunAmt: 1.2, fog: "#e7a28a" },
  night: { top: "#04050d", mid: "#0f1636", bot: "#26294e", sun: "#000000", sunAmt: 0, fog: "#141a36" },
};
export function applySky(sky, fog, name, mixName = null, k = 0) {
  const a = SKIES[name], b = mixName ? SKIES[mixName] : null;
  const L = (key) => (b ? new THREE.Color(a[key]).lerp(new THREE.Color(b[key]), k) : new THREE.Color(a[key]));
  sky.material.uniforms.top.value.copy(L("top"));
  sky.material.uniforms.mid.value.copy(L("mid"));
  sky.material.uniforms.bot.value.copy(L("bot"));
  sky.material.uniforms.sunCol.value.copy(L("sun"));
  sky.material.uniforms.sunAmt.value = b ? lerp(a.sunAmt, b.sunAmt, k) : a.sunAmt;
  if (fog) fog.color.copy(L("fog"));
}

// ---------------------------------------------------------------- canvas textures
export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d");
  draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = opts.smooth ? THREE.LinearFilter : THREE.NearestFilter;
  t.minFilter = opts.smooth ? THREE.LinearMipmapLinearFilter : THREE.NearestFilter;
  t.generateMipmaps = !!opts.smooth;
  if (opts.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
  }
  t.userData.ctx = x;
  t.userData.canvas = c;
  return t;
}
// soft round glow sprite texture (shared)
export const GLOW_TEX = canvasTex(
  64,
  64,
  (x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, w, w);
  },
  { smooth: true },
);
export function glowSprite(color, size = 1, opacity = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_TEX, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1);
  return s;
}
export const STAR_TEX = canvasTex(32, 32, (x, w) => {
  x.fillStyle = "#fff";
  x.fillRect(15, 2, 2, 28);
  x.fillRect(2, 15, 28, 2);
  x.fillRect(13, 13, 6, 6);
  x.fillRect(11, 15, 10, 2);
  x.fillRect(15, 11, 2, 10);
});
export function starSprite(color = "#fff6c8", size = 0.3) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: STAR_TEX, color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(size, size, 1);
  return s;
}

// camera helper: set from {p:[x,y,z], l:[x,y,z], fov}
const _v = new THREE.Vector3();
export function setCam(cam, p, l, fov = 40, roll = 0) {
  cam.position.set(p[0], p[1], p[2]);
  cam.up.set(Math.sin(roll), Math.cos(roll), 0);
  cam.lookAt(_v.set(l[0], l[1], l[2]));
  if (cam.fov !== fov) {
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }
}
export const lerp3 = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
// keyframed camera path: keys = [[t, pos, look, fov], ...] with smooth interpolation
export function camPath(keys, t, ease = easeInOut) {
  if (t <= keys[0][0]) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b[0]) {
      const p = ease(seg(t, a[0], b[0]));
      return [t, lerp3(a[1], b[1], p), lerp3(a[2], b[2], p), lerp(a[3] || 40, b[3] || 40, p)];
    }
  }
  return keys[keys.length - 1];
}
