/**
 * geo.js — 共享几何工具箱 / Shared procedural-geometry toolkit
 *
 * 所有构件均为程序化生成（procedural），不下载任何外部模型。
 * 所有 builder 返回的对象以「构件自身几何中心」为局部原点，Y 轴向上。
 * 单位约定见各模型文件的 scaleNote。
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

/* ------------------------------------------------------------------ 基础体 */

/** 带收分（梭柱）的中式木柱：下径略粗，向上微微收分。 */
export function pillar({ height = 3, rBottom = 0.16, rTop = 0.135, segments = 14, mat }) {
  const g = new THREE.CylinderGeometry(rTop, rBottom, height, segments, 1);
  g.translate(0, height / 2, 0);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** 方木梁：长轴沿 X。 */
export function beam({ length = 4, w = 0.2, h = 0.3, mat }) {
  const g = new THREE.BoxGeometry(length, h, w);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** 檩条 purlin：沿 X 的方木或圆木。 */
export function purlin({ length = 6, r = 0.09, round = true, mat }) {
  const g = round
    ? new THREE.CylinderGeometry(r, r, length, 12)
    : new THREE.BoxGeometry(length, r * 2, r * 2);
  if (round) g.rotateZ(Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** 椽子 rafter：沿 Z 的细圆木。 */
export function rafter({ length = 2, r = 0.045, mat }) {
  const g = new THREE.CylinderGeometry(r, r, length, 8);
  g.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = true;
  return m;
}

/**
 * 斗 dou —— 斗栱最下层的方形木块。
 * 由 斗底(bottom slab) + 斗欹(tapered body) + 斗耳(ears) 组成。
 * 局部坐标：X = 栱的横向（南北），Y = 上，Z = 翘/昂的纵向（前后）。
 * ears 位于 ±X，两耳之间是安放横向栱的卯口。
 */
export function dou({ w = 0.62, h = 0.42, d = 0.62, earsAxis = 'z', mat }) {
  const parts = [];
  const bottomH = h * 0.26;
  const earH = h * 0.30;
  const bodyH = h - bottomH - earH;

  // 斗底
  const bg = new THREE.BoxGeometry(w, bottomH, d).toNonIndexed();
  bg.translate(0, -h / 2 + bottomH / 2, 0);
  parts.push(bg);

  // 斗欹（上窄下宽的四棱台）
  const sh = new THREE.Shape();
  const inset = Math.min(w, d) * 0.13;
  sh.moveTo(-w / 2, 0);
  sh.lineTo(w / 2, 0);
  sh.lineTo(w / 2 - inset, bodyH);
  sh.lineTo(-w / 2 + inset, bodyH);
  sh.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(sh, { depth: d - inset * 2, bevelEnabled: false });
  bodyGeo.translate(0, -h / 2 + bottomH, -(d - inset * 2) / 2);
  parts.push(bodyGeo);

  // 斗耳（两片，位于所承构件走向的垂直两侧）
  const earW = earsAxis === 'z' ? w * 0.9 : d * 0.16;
  const earD = earsAxis === 'z' ? d * 0.16 : w * 0.9;
  for (const s of [-1, 1]) {
    const eg = new THREE.BoxGeometry(earW, earH, earD).toNonIndexed();
    eg.translate(
      earsAxis === 'z' ? 0 : (s * (w - earD)) / 2,
      h / 2 - earH / 2,
      earsAxis === 'z' ? (s * (d - earD)) / 2 : 0,
    );
    parts.push(eg);
  }

  const merged = mergeGeometries(parts, false);
  const m = new THREE.Mesh(merged, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/**
 * 栱 gong —— 横向短枋木，断面近矩、两端做卷杀（弧形收头）。
 * 长轴沿 X。profile 为「长度 × 高度」的侧立面轮廓，厚度沿 Z。
 */
export function gong({ length = 2.4, height = 0.34, thickness = 0.2, mat }) {
  const L = length / 2;
  const H = height;
  const sh = new THREE.Shape();
  const footR = H * 0.2;   // 底部起翘
  const headR = H * 0.26;  // 卷杀幅度

  sh.moveTo(-L, footR);
  sh.lineTo(-L + H * 0.3, 0);
  sh.lineTo(L - H * 0.3, 0);
  sh.lineTo(L, footR);
  sh.lineTo(L, H - headR);
  // 卷杀：上缘两端的内凹弧
  sh.quadraticCurveTo(L - H * 0.05, H - headR * 0.18, L - H * 0.42, H);
  sh.lineTo(-L + H * 0.42, H);
  sh.quadraticCurveTo(-L + H * 0.05, H - headR * 0.18, -L, H - headR);
  sh.closePath();

  const g = new THREE.ExtrudeGeometry(sh, { depth: thickness, bevelEnabled: false });
  g.translate(0, -H / 2, -thickness / 2);
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/**
 * 翘 qiao —— 纵向（前后）伸出的短木，两端翘起并做卷杀。
 * 长轴沿 Z。
 */
export function qiao({ length = 2.2, height = 0.3, thickness = 0.18, mat }) {
  const m = gong({ length, height, thickness, mat });
  m.rotation.y = Math.PI / 2;
  return m;
}

/**
 * 昂 ang —— 纵向斜置的挑出构件：前端斜下（有昂嘴），尾端斜上。
 * 长轴沿 Z，前端（+Z）向下斜。
 */
export function ang({ length = 2.6, w = 0.22, h = 0.26, drop = 0.55, mat }) {
  const pivot = new THREE.Group();
  const angle = Math.atan2(drop, length);

  // 昂身：绕 X 轴下倾，前端（+Z）下沉，尾端翘起
  const bodyGeo = new THREE.BoxGeometry(w, h, length);
  const body = new THREE.Mesh(bodyGeo, mat);
  body.castShadow = body.receiveShadow = true;
  body.rotation.x = angle;
  pivot.add(body);

  // 昂嘴：前端斜削的尖角
  const tipGeo = new THREE.BoxGeometry(w * 0.96, h * 0.7, 0.26);
  const tip = new THREE.Mesh(tipGeo, mat);
  tip.castShadow = true;
  tip.position.set(
    0,
    -Math.sin(angle) * (length / 2) - h * 0.12,
    Math.cos(angle) * (length / 2) + 0.04,
  );
  tip.rotation.x = angle;
  pivot.add(tip);

  pivot.userData.tip = tip;
  pivot.userData.frontTip = new THREE.Vector3(
    0,
    -Math.sin(angle) * (length / 2) - h * 0.2,
    Math.cos(angle) * (length / 2) + 0.12,
  );
  return pivot;
}

/* -------------------------------------------------------------- 平面屋面 */

/** 屋面板：给定四角高度生成斜面（用于起翘屋面）。 */
export function roofPanel({ width, z0, z1, y0, y1, yEave0, yEave1, thickness = 0.05, mat }) {
  const g = new THREE.BufferGeometry();
  const hw = width / 2;
  const v = [];
  const push = (a, b, c) => v.push(...a, ...b, ...c);
  const A = [-hw, y0, z0], B = [hw, y0, z0], C = [hw, y1, z1], D = [-hw, y1, z1];
  const E = [-hw, yEave0, z0], F = [hw, yEave0, z0], G = [hw, yEave1, z1], H = [-hw, yEave1, z1];
  push(A, B, C); push(A, C, D);
  push(E, D, C); push(E, C, F);
  push(A, D, H); push(A, H, E);
  push(B, G, C); push(B, F, G);
  push(A, E, F); push(A, F, B);
  push(D, H, G); push(D, G, C);
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/* -------------------------------------------------------------- 石作 / 拱 */

/**
 * 拱券圈 arch ring：按弧长排布的楔形券石（voussoir）。
 * 圆心在原点，拱脚位于角度 ±halfSpan（自 +X 轴起算的极角）。
 * 厚度沿 Y（径向），进深沿 Z。
 */
export function archRing({
  radius = 5, ringThickness = 0.5, halfSpan = Math.PI / 2.4,
  depth = 1.4, blocks = 22, mat, gap = 0.012,
}) {
  const g = new THREE.Group();
  const step = (halfSpan * 2) / blocks;
  for (let i = 0; i < blocks; i++) {
    const a0 = -halfSpan + i * step + gap / radius;
    const a1 = -halfSpan + (i + 1) * step - gap / radius;
    const ri = radius, ro = radius + ringThickness;
    const pts = [];
    const N = 4;
    for (let k = 0; k <= N; k++) {
      const a = a0 + (a1 - a0) * (k / N);
      pts.push(new THREE.Vector2(Math.cos(a) * ro, Math.sin(a) * ro));
    }
    for (let k = N; k >= 0; k--) {
      const a = a0 + (a1 - a0) * (k / N);
      pts.push(new THREE.Vector2(Math.cos(a) * ri, Math.sin(a) * ri));
    }
    const shape = new THREE.Shape(pts);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geo.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
  }
  return g;
}

/**
 * 坦弧（圆弧段）拱的轮廓点：过 (-a,0)、(0,f)、(a,0) 的圆弧。
 * 用于生成拱洞轮廓与拱券石。
 */
export function segmentalArcPoints({ halfSpan: a, rise: f, segments = 24, invert = false }) {
  const R = (a * a + f * f) / (2 * f);
  const cy = f - R;
  const pts = [];
  const theta0 = Math.atan2(0 - cy, -a);
  const theta1 = Math.atan2(0 - cy, a);
  for (let i = 0; i <= segments; i++) {
    const t = theta0 + (theta1 - theta0) * (i / segments);
    pts.push(new THREE.Vector2(R * Math.cos(t), cy + R * Math.sin(t)));
  }
  if (invert) pts.reverse();
  return { points: pts, radius: R, centerY: cy };
}

/** 生成拱洞轮廓（供 Shape 挖洞用）：拱弧 + 下方闭合线。 */
export function archHolePath({ halfSpan: a, rise: f, baseY = 0, segments = 20 }) {
  const { points } = segmentalArcPoints({ halfSpan: a, rise: f, segments });
  const p = new THREE.Path();
  p.moveTo(points[0].x, baseY);
  for (const pt of points) p.lineTo(pt.x, pt.y);
  p.lineTo(points[points.length - 1].x, baseY);
  p.closePath();
  return p;
}

/** 平板（带洞）沿 Z 挤出：用于拱上填石（spandrel）、墙体等。 */
export function extrudedPanel({ outerPoints, holes = [], depth = 1, mat }) {
  const shape = new THREE.Shape(outerPoints);
  for (const h of holes) shape.holes.push(h);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/* ---------------------------------------------------------------- 土作 */

/** 夯土墙体的一段（可沿圆弧排布）：内外半径 + 高度 + 厚度收分。 */
export function rammedEarthWall({
  angleStart = 0, angleEnd = Math.PI, segments = 48,
  rInner = 6, rOuterBottom = 8, rOuterTop = 7.4, height = 9, mat,
}) {
  const pos = [];
  const idx = [];
  const ring = 4; // inner-bottom, inner-top, outer-bottom, outer-top
  const push3 = (x, y, z) => pos.push(x, y, z);
  const V4 = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const a = angleStart + (angleEnd - angleStart) * t;
    const c = Math.cos(a), s = Math.sin(a);
    V4.push([rInner * c, 0, rInner * s], [rInner * c, height, rInner * s],
      [rOuterBottom * c, 0, rOuterBottom * s], [rOuterTop * c, height, rOuterTop * s]);
  }
  // 四个面带
  const quad = (a, b, c, d) => { idx.push(a, b, c, a, c, d); };
  for (let i = 0; i < segments; i++) {
    const o = i * 4, n = (i + 1) * 4;
    // inner face (0,1)
    quad(o + 0, n + 0, n + 1, o + 1);
    // outer face (2,3)
    quad(o + 2, o + 3, n + 3, n + 2);
    // top (1,3)
    quad(o + 1, n + 1, n + 3, o + 3);
    // bottom (0,2)
    quad(o + 0, o + 2, n + 2, n + 0);
  }
  // 两侧封口
  const last = segments * 4;
  quad(0, 1, 3, 2);
  quad(last + 0, last + 2, last + 3, last + 1);
  const g = new THREE.BufferGeometry();
  for (const v of V4) push3(v[0], v[1], v[2]);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/* ------------------------------------------------------------- 组合工具 */

/** 合并一组几何体为单一 mesh（减少 draw call）。 */
export function mergeMeshes(meshes, mat) {
  const geos = meshes.map((m) => {
    let g = m.geometry.clone();
    m.updateMatrix();
    g.applyMatrix4(m.matrix);
    if (g.index) { const ng = g.toNonIndexed(); g.dispose(); g = ng; }
    return g;
  });
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  if (!merged) return null;
  const out = new THREE.Mesh(merged, mat);
  out.castShadow = out.receiveShadow = true;
  return out;
}

/** 给一个对象数组设置统一的 userData.partId（由核心自动调用）。 */
export function tagParts(objects, id) {
  for (const o of objects) {
    o.traverse((c) => { c.userData.partId = id; });
  }
  return objects;
}
