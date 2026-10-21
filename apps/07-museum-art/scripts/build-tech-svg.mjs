/**
 * 回响电玩馆 — 硬件技术插画（降级图）
 *
 * 从真实 3D 网格中提取特征棱边与轮廓边，正交投影成「正视图 + 侧视图」
 * 的工程制图风格 SVG。即使没有 WebGL，也能看到展品的真实结构。
 *
 * 运行：node scripts/build-tech-svg.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { models } from './lib/catalog.mjs';
import { buildModel } from './lib/models.mjs';
import tokens from './lib/tokens.mjs';
import {
  svgDoc, rect, text, line, circle,
  linearGradient, dotPattern, lineGridPattern, writeOut,
} from './lib/svg.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'public', 'assets', 'models');

const W = 1200;
const H = 900;

const C = tokens.color;
const F = tokens.typography.fontFamily;

/* ------------------------------------------------------------------ *
 * 特征棱边提取
 * ------------------------------------------------------------------ */

/**
 * 顶点焊接：box / roundedBox 按面生成独立顶点，棱边无法共享。
 * 按位置量化合并顶点后，每条棱边才会恰好邻接两个面。
 */
function weld(mesh, tol = 2e-5) {
  const map = new Map();
  const remap = new Int32Array(mesh.positions.length / 3);
  const positions = [];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    const key = `${Math.round(mesh.positions[i] / tol)}|${Math.round(mesh.positions[i + 1] / tol)}|${Math.round(mesh.positions[i + 2] / tol)}`;
    let idx = map.get(key);
    if (idx === undefined) {
      idx = positions.length / 3;
      map.set(key, idx);
      positions.push(mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2]);
    }
    remap[i / 3] = idx;
  }
  const indices = [];
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const a = remap[mesh.indices[i]];
    const b = remap[mesh.indices[i + 1]];
    const c = remap[mesh.indices[i + 2]];
    if (a !== b && b !== c && a !== c) indices.push(a, b, c);
  }
  return { positions, normals: new Array(positions.length).fill(0), indices };
}

/** 计算每个三角面的法线 */
function faceNormals(mesh) {
  const out = [];
  const { positions, indices } = mesh;
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
    const ux = positions[b] - positions[a];
    const uy = positions[b + 1] - positions[a + 1];
    const uz = positions[b + 2] - positions[a + 2];
    const vx = positions[c] - positions[a];
    const vy = positions[c + 1] - positions[a + 1];
    const vz = positions[c + 2] - positions[a + 2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz) || 1;
    out.push([nx / len, ny / len, nz / len]);
  }
  return out;
}

/**
 * 提取可见棱边。
 * @param {object} mesh
 * @param {number[]} viewDir 视线方向（单位向量）
 * @returns {{feature:number[][], silhouette:number[][]}} 边（顶点索引对）
 */
function extractEdges(mesh, viewDir) {
  const { positions, indices } = mesh;
  const fn = faceNormals(mesh);
  const edges = new Map();

  for (let f = 0; f < indices.length / 3; f++) {
    const a = indices[f * 3], b = indices[f * 3 + 1], c = indices[f * 3 + 2];
    const tri = [[a, b], [b, c], [c, a]];
    for (const [p, q] of tri) {
      const key = p < q ? `${p}_${q}` : `${q}_${p}`;
      if (!edges.has(key)) edges.set(key, { a: Math.min(p, q), b: Math.max(p, q), faces: [] });
      edges.get(key).faces.push(f);
    }
  }

  const feature = [];
  const silhouette = [];

  for (const e of edges.values()) {
    const n = e.faces.length;
    if (n === 1) {
      /* 开放边（模型内部网格通常闭合，忽略） */
      continue;
    }
    const n0 = fn[e.faces[0]];
    const n1 = fn[e.faces[1]];
    const dot = n0[0] * n1[0] + n0[1] * n1[1] + n0[2] * n1[2];
    const crease = dot < 0.925; /* 夹角 > ~22° */

    const d0 = n0[0] * viewDir[0] + n0[1] * viewDir[1] + n0[2] * viewDir[2];
    const d1 = n1[0] * viewDir[0] + n1[1] * viewDir[1] + n1[2] * viewDir[2];
    const sil = d0 * d1 < 0;

    if (sil) silhouette.push([e.a, e.b]);
    else if (crease) feature.push([e.a, e.b]);
  }
  return { feature, silhouette };
}

/** 正交投影 */
function project(mesh, idx, mode) {
  const p = mesh.positions;
  const i = idx * 3;
  if (mode === 'front') return [p[i], -p[i + 1]];
  if (mode === 'side') return [p[i + 2], -p[i + 1]];
  return [p[i], -p[i + 2]];
}

/* ------------------------------------------------------------------ *
 * 绘制
 * ------------------------------------------------------------------ */

function drawView(parts, mode, viewDir, box, scale) {
  const { x, y, w, h } = box;
  const g = [];

  const sil = [];
  const feat = [];

  for (const part of parts) {
    const { feature, silhouette } = extractEdges(part.mesh, viewDir);
    for (const e of feature) feat.push([part.mesh, e]);
    for (const e of silhouette) sil.push([part.mesh, e]);
  }

  /* 视图框 */
  g.push(
    rect(x, y, w, h, {
      fill: 'none',
      stroke: C.paper[50],
      'stroke-opacity': 0.14,
      'stroke-width': 1,
      'stroke-dasharray': '6 8',
    }),
  );

  const cx = x + w / 2;
  const cy = y + h / 2;
  const toScreen = (mesh, idx) => {
    const [ax, ay] = project(mesh, idx, mode);
    return [cx + ax * scale, cy + ay * scale];
  };

  const drawEdges = (list, stroke, width, opacity) => {
    for (const [mesh, e] of list) {
      const [x1, y1] = toScreen(mesh, e[0]);
      const [x2, y2] = toScreen(mesh, e[1]);
      g.push(
        line(x1, y1, x2, y2, {
          stroke,
          'stroke-width': width,
          'stroke-opacity': opacity,
          'stroke-linecap': 'round',
        }),
      );
    }
  };

  drawEdges(feat, C.paper[200], 0.85, 0.42);
  drawEdges(sil, C.signal[400], 1.6, 0.95);

  return g.join('\n');
}

/** 尺寸标注线 */
function dimension(x1, x2, y, label, anchor = 'middle') {
  const g = [];
  g.push(line(x1, y, x2, y, { stroke: C.signal[400], 'stroke-width': 1.1, 'stroke-opacity': 0.8 }));
  g.push(line(x1, y - 6, x1, y + 6, { stroke: C.signal[400], 'stroke-width': 1.1, 'stroke-opacity': 0.8 }));
  g.push(line(x2, y - 6, x2, y + 6, { stroke: C.signal[400], 'stroke-width': 1.1, 'stroke-opacity': 0.8 }));
  g.push(
    text(label, (x1 + x2) / 2, y - 10, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 14,
      'text-anchor': anchor,
    }),
  );
  return g.join('\n');
}

function buildTech(model) {
  const built = buildModel(model.id);
  const parts = built.parts;

  /* 全局包围盒 */
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const part of parts) {
    const p = part.mesh.positions;
    for (let i = 0; i < p.length; i += 3) {
      minX = Math.min(minX, p[i]); maxX = Math.max(maxX, p[i]);
      minY = Math.min(minY, p[i + 1]); maxY = Math.max(maxY, p[i + 1]);
      minZ = Math.min(minZ, p[i + 2]); maxZ = Math.max(maxZ, p[i + 2]);
    }
  }

  /* 把模型中心移到原点，方便投影 */
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  for (const part of parts) {
    const p = part.mesh.positions;
    for (let i = 0; i < p.length; i += 3) {
      p[i] -= cx; p[i + 1] -= cy; p[i + 2] -= cz;
    }
    /* 焊接顶点，使棱边可共享 */
    part.mesh = weld(part.mesh);
  }

  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const spanZ = maxZ - minZ || 1;

  /* 正视图：XZ 平面展开为 X 与 Y */
  const frontW = 430, frontH = 460;
  const frontBox = { x: 90, y: 190, w: frontW, h: frontH };
  const sideBox = { x: 660, y: 190, w: 430, h: frontH };

  const defs = [
    lineGridPattern('tech-grid', { size: 24, color: C.paper[50], opacity: 0.05 }),
    dotPattern('tech-dots', { size: 16, r: 1.3, color: C.paper[50], opacity: 0.12 }),
    linearGradient('tech-bg', [
      { offset: '0%', color: C.ink[800] },
      { offset: '100%', color: C.ink[900] },
    ]),
  ];

  const body = [];
  body.push(rect(0, 0, W, H, { fill: 'url(#tech-bg)' }));
  body.push(rect(0, 0, W, H, { fill: 'url(#tech-grid)' }));

  /* 视图 */
  const frontScale = Math.min(frontW / (spanX * 1.16), frontH / (spanY * 1.16));
  const sideScale = Math.min(430 / (spanZ * 1.16), frontH / (spanY * 1.16));
  body.push(drawView(parts, 'front', [0, 0, 1], frontBox, frontScale));
  body.push(drawView(parts, 'side', [1, 0, 0], sideBox, sideScale));

  /* 视图标题 */
  body.push(
    text('正视图 · FRONT ELEVATION', 90, 172, {
      fill: C.paper[300],
      'font-family': F.mono,
      'font-size': 15,
      'letter-spacing': '0.18em',
    }),
  );
  body.push(
    text('侧视图 · SIDE ELEVATION', 660, 172, {
      fill: C.paper[300],
      'font-family': F.mono,
      'font-size': 15,
      'letter-spacing': '0.18em',
    }),
  );

  /* 尺寸标注 */
  body.push(
    dimension(90, 90 + frontW, 700, `宽 ${model.dims.w} m`),
  );
  body.push(
    dimension(660, 660 + 430, 700, `深 ${model.dims.d} m`),
  );
  body.push(
    line(600, 190, 600, 700, { stroke: C.paper[50], 'stroke-opacity': 0.1, 'stroke-width': 1, 'stroke-dasharray': '4 10' }),
  );

  /* 高度标注（竖直） */
  body.push(
    line(70, 190, 70, 650, { stroke: C.signal[400], 'stroke-width': 1.1, 'stroke-opacity': 0.7 }),
  );
  body.push(
    text(`高 ${model.dims.h} m`, 60, 420, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 14,
      'text-anchor': 'middle',
      transform: `rotate(-90 60 420)`,
    }),
  );

  /* 标题区 */
  body.push(
    text(`${model.name}　${model.latin}`, 90, 92, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 38,
      'font-weight': 700,
    }),
  );
  body.push(
    text(`${model.form} · ${model.range} · 原创虚构展品`, 90, 128, {
      fill: C.paper[400],
      'font-family': F.sans,
      'font-size': 18,
    }),
  );
  body.push(
    text(`ATLAS-HW-${model.id.toUpperCase()}`, W - 90, 92, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 18,
      'font-weight': 700,
      'letter-spacing': '0.12em',
      'text-anchor': 'end',
    }),
  );
  body.push(
    text('技术插画 · 由 3D 网格正交投影生成', W - 90, 128, {
      fill: C.paper[400],
      'font-family': F.sans,
      'font-size': 16,
      'text-anchor': 'end',
    }),
  );

  /* 部件清单 */
  const list = parts.map((p) => p.name);
  body.push(
    text(`部件清单 · ${list.length} 件`, 90, 762, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 15,
      'font-weight': 700,
      'letter-spacing': '0.16em',
    }),
  );
  const perCol = Math.ceil(list.length / 3);
  const colW = 340;
  list.forEach((nm, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const x = 90 + col * colW;
    const y = 796 + row * 24;
    if (y > 872) return;
    body.push(circle(x + 4, y - 5, 2.6, { fill: C.signal[500] }));
    body.push(
      text(nm, x + 16, y, {
        fill: C.paper[200],
        'font-family': F.sans,
        'font-size': 15,
      }),
    );
  });

  /* 底部说明 */
  body.push(
    line(90, 878, W - 90, 878, { stroke: C.paper[50], 'stroke-opacity': 0.14, 'stroke-width': 1 }),
  );

  return svgDoc({ w: W, h: H, defs, body, background: C.ink[900] });
}

function main() {
  mkdirSync(OUT, { recursive: true });
  for (const model of models) {
    const svg = buildTech(model);
    const file = path.join(OUT, `model-${model.id}.tech.svg`);
    writeFileSync(file, svg, 'utf8');
    console.log(`✓ model-${model.id}.tech.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(0)} KB`);
  }
  console.log(`\n✓ ${models.length} 张技术插画降级图生成完毕`);
}

main();
