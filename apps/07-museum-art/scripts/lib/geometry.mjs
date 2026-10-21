/**
 * 回响电玩馆 — 3D 几何构建库
 * 纯 JS，无外部依赖。输出 { positions:[], normals:[], indices:[] } 三角网格。
 * 单位：米。所有模型共享同一套馆内配色材质（见 materials.mjs）。
 */

/* ------------------------------------------------------------------ *
 * 基础工具
 * ------------------------------------------------------------------ */

export function emptyMesh() {
  return { positions: [], normals: [], indices: [] };
}

function pushVert(mesh, x, y, z, nx, ny, nz) {
  mesh.positions.push(x, y, z);
  mesh.normals.push(nx, ny, nz);
  return mesh.positions.length / 3 - 1;
}

export function cloneMesh(mesh) {
  return {
    positions: mesh.positions.slice(),
    normals: mesh.normals.slice(),
    indices: mesh.indices.slice(),
  };
}

export function mergeMeshes(list) {
  const out = emptyMesh();
  for (const m of list) {
    if (!m) continue;
    const offset = out.positions.length / 3;
    out.positions.push(...m.positions);
    out.normals.push(...m.normals);
    for (const i of m.indices) out.indices.push(i + offset);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 变换
 * ------------------------------------------------------------------ */

const DEG = Math.PI / 180;

export function transformMesh(mesh, o = {}) {
  const t = o.translate || [0, 0, 0];
  const r = o.rotate || [0, 0, 0]; // XYZ 欧拉角，单位度
  const s = o.scale || [1, 1, 1];

  const [rx, ry, rz] = r.map((d) => d * DEG);
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cz = Math.cos(rz), sz = Math.sin(rz);

  // R = Rz * Ry * Rx
  const m = [
    cz * cy, cz * sy * sx - sz * cx, cz * sy * cx + sz * sx,
    sz * cy, sz * sy * sx + cz * cx, sz * sy * cx - cz * sx,
    -sy, cy * sx, cy * cx,
  ];

  const apply = (x, y, z) => {
    let X = x * s[0], Y = y * s[1], Z = z * s[2];
    const ox = m[0] * X + m[1] * Y + m[2] * Z;
    const oy = m[3] * X + m[4] * Y + m[5] * Z;
    const oz = m[6] * X + m[7] * Y + m[8] * Z;
    return [ox + t[0], oy + t[1], oz + t[2]];
  };

  for (let i = 0; i < mesh.positions.length; i += 3) {
    const p = apply(mesh.positions[i], mesh.positions[i + 1], mesh.positions[i + 2]);
    mesh.positions[i] = p[0];
    mesh.positions[i + 1] = p[1];
    mesh.positions[i + 2] = p[2];

    // 法线只用旋转部分（忽略非等比缩放）
    const nx = mesh.normals[i], ny = mesh.normals[i + 1], nz = mesh.normals[i + 2];
    const mx = m[0] * nx + m[1] * ny + m[2] * nz;
    const my = m[3] * nx + m[4] * ny + m[5] * nz;
    const mz = m[6] * nx + m[7] * ny + m[8] * nz;
    const len = Math.hypot(mx, my, mz) || 1;
    mesh.normals[i] = mx / len;
    mesh.normals[i + 1] = my / len;
    mesh.normals[i + 2] = mz / len;
  }
  return mesh;
}

export function place(mesh, t, r, s) {
  return transformMesh(mesh, { translate: t, rotate: r, scale: s });
}

/* ------------------------------------------------------------------ *
 * 基本体
 * ------------------------------------------------------------------ */

/** 立方体（中心在原点） */
export function box(w, h, d) {
  const mesh = emptyMesh();
  const hx = w / 2, hy = h / 2, hz = d / 2;
  /**
   * 每个面：法线 n、面心 o、面内两个基向量 u / v，以及对应的面内半长 su / sv。
   * 注意 su / sv 必须取该面实际张开的两个轴的半长，否则薄板会被撑成方块。
   */
  const faces = [
    { n: [0, 0, 1], o: [0, 0, hz], u: [1, 0, 0], v: [0, 1, 0], su: hx, sv: hy },
    { n: [0, 0, -1], o: [0, 0, -hz], u: [-1, 0, 0], v: [0, 1, 0], su: hx, sv: hy },
    { n: [1, 0, 0], o: [hx, 0, 0], u: [0, 0, -1], v: [0, 1, 0], su: hz, sv: hy },
    { n: [-1, 0, 0], o: [-hx, 0, 0], u: [0, 0, 1], v: [0, 1, 0], su: hz, sv: hy },
    { n: [0, 1, 0], o: [0, hy, 0], u: [1, 0, 0], v: [0, 0, -1], su: hx, sv: hz },
    { n: [0, -1, 0], o: [0, -hy, 0], u: [1, 0, 0], v: [0, 0, 1], su: hx, sv: hz },
  ];
  for (const f of faces) {
    const base = mesh.positions.length / 3;
    for (const [su, sv] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      pushVert(
        mesh,
        f.o[0] + f.u[0] * su * f.su + f.v[0] * sv * f.sv,
        f.o[1] + f.u[1] * su * f.su + f.v[1] * sv * f.sv,
        f.o[2] + f.u[2] * su * f.su + f.v[2] * sv * f.sv,
        f.n[0], f.n[1], f.n[2],
      );
    }
    mesh.indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return mesh;
}

/** 圆角立方体：把立方体表面点吸附到圆角壳体上 */
export function roundedBox(w, h, d, r, seg = 4) {
  const mesh = emptyMesh();
  const hx = w / 2, hy = h / 2, hz = d / 2;
  const rr = Math.min(r, hx, hy, hz);
  const ix = hx - rr, iy = hy - rr, iz = hz - rr;
  const clamp = (v, lim) => (v > lim ? lim : v < -lim ? -lim : v);

  const axes = [
    { n: [1, 0, 0], build: (a, b) => [hx, a * hy, b * hz] },
    { n: [-1, 0, 0], build: (a, b) => [-hx, a * hy, b * hz] },
    { n: [0, 1, 0], build: (a, b) => [a * hx, hy, b * hz] },
    { n: [0, -1, 0], build: (a, b) => [a * hx, -hy, b * hz] },
    { n: [0, 0, 1], build: (a, b) => [a * hx, b * hy, hz] },
    { n: [0, 0, -1], build: (a, b) => [a * hx, b * hy, -hz] },
  ];

  for (const ax of axes) {
    const base = mesh.positions.length / 3;
    for (let i = 0; i <= seg; i++) {
      for (let j = 0; j <= seg; j++) {
        const a = (i / seg) * 2 - 1;
        const b = (j / seg) * 2 - 1;
        const p = ax.build(a, b);
        const inner = [clamp(p[0], ix), clamp(p[1], iy), clamp(p[2], iz)];
        let dx = p[0] - inner[0], dy = p[1] - inner[1], dz = p[2] - inner[2];
        const len = Math.hypot(dx, dy, dz) || 1;
        dx /= len; dy /= len; dz /= len;
        pushVert(
          mesh,
          inner[0] + dx * rr,
          inner[1] + dy * rr,
          inner[2] + dz * rr,
          dx, dy, dz,
        );
      }
    }
    for (let i = 0; i < seg; i++) {
      for (let j = 0; j < seg; j++) {
        const a = base + i * (seg + 1) + j;
        const b = a + seg + 1;
        mesh.indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  return mesh;
}

/** 圆柱 / 圆台（轴沿 Y） */
export function cylinder(rTop, rBot, h, radial = 24, capped = true) {
  const mesh = emptyMesh();
  const hh = h / 2;
  const slope = (rBot - rTop) / h;

  for (let i = 0; i <= radial; i++) {
    const a = (i / radial) * Math.PI * 2;
    const ca = Math.cos(a), sa = Math.sin(a);
    const nl = Math.hypot(1, slope);
    for (const [y, rr] of [[hh, rTop], [-hh, rBot]]) {
      pushVert(mesh, ca * rr, y, sa * rr, ca / nl, slope / nl, sa / nl);
    }
  }
  for (let i = 0; i < radial; i++) {
    const a = i * 2;
    mesh.indices.push(a, a + 1, a + 2, a + 2, a + 1, a + 3);
  }
  if (capped) {
    for (const [y, rr, ny] of [[hh, rTop, 1], [-hh, rBot, -1]]) {
      if (rr <= 0) continue;
      const c = pushVert(mesh, 0, y, 0, 0, ny, 0);
      const start = mesh.positions.length / 3;
      for (let i = 0; i <= radial; i++) {
        const a = (i / radial) * Math.PI * 2;
        pushVert(mesh, Math.cos(a) * rr, y, Math.sin(a) * rr, 0, ny, 0);
      }
      for (let i = 0; i < radial; i++) {
        if (ny > 0) mesh.indices.push(c, start + i, start + i + 1);
        else mesh.indices.push(c, start + i + 1, start + i);
      }
    }
  }
  return mesh;
}

/** 球 */
export function sphere(r, segW = 20, segH = 14) {
  const mesh = emptyMesh();
  for (let j = 0; j <= segH; j++) {
    const v = j / segH;
    const phi = v * Math.PI;
    for (let i = 0; i <= segW; i++) {
      const u = i / segW;
      const theta = u * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      pushVert(mesh, nx * r, ny * r, nz * r, nx, ny, nz);
    }
  }
  for (let j = 0; j < segH; j++) {
    for (let i = 0; i < segW; i++) {
      const a = j * (segW + 1) + i;
      const b = a + segW + 1;
      mesh.indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return mesh;
}

/** 圆环（面朝 XY 平面，环轴 Z） */
export function torus(R, r, radial = 8, tubular = 28) {
  const mesh = emptyMesh();
  for (let j = 0; j <= radial; j++) {
    const v = (j / radial) * Math.PI * 2;
    const cv = Math.cos(v), sv = Math.sin(v);
    for (let i = 0; i <= tubular; i++) {
      const u = (i / tubular) * Math.PI * 2;
      const cu = Math.cos(u), su = Math.sin(u);
      const nx = cv * cu, ny = cv * su, nz = sv;
      pushVert(mesh, (R + r * cv) * cu, (R + r * cv) * su, r * sv, nx, ny, nz);
    }
  }
  for (let j = 0; j < radial; j++) {
    for (let i = 0; i < tubular; i++) {
      const a = j * (tubular + 1) + i;
      const b = a + tubular + 1;
      mesh.indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return mesh;
}

/** 平面（XZ，朝上 Y） */
export function plane(w, d, sw = 1, sd = 1) {
  const mesh = emptyMesh();
  for (let j = 0; j <= sd; j++) {
    for (let i = 0; i <= sw; i++) {
      pushVert(mesh, (i / sw - 0.5) * w, 0, (j / sd - 0.5) * d, 0, 1, 0);
    }
  }
  for (let j = 0; j < sd; j++) {
    for (let i = 0; i < sw; i++) {
      const a = j * (sw + 1) + i;
      const b = a + sw + 1;
      mesh.indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  return mesh;
}

/** 沿折线生成管（用于线缆） */
export function tube(points, radius, radial = 8) {
  const mesh = emptyMesh();
  const segs = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const dir = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(...dir) || 1e-6;
    segs.push({ a, b, dir: dir.map((v) => v / len), len });
  }
  for (const s of segs) {
    // 构造与方向垂直的两个基向量
    const up = Math.abs(s.dir[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    let u = [
      up[1] * s.dir[2] - up[2] * s.dir[1],
      up[2] * s.dir[0] - up[0] * s.dir[2],
      up[0] * s.dir[1] - up[1] * s.dir[0],
    ];
    const ul = Math.hypot(...u) || 1;
    u = u.map((v) => v / ul);
    const w = [
      s.dir[1] * u[2] - s.dir[2] * u[1],
      s.dir[2] * u[0] - s.dir[0] * u[2],
      s.dir[0] * u[1] - s.dir[1] * u[0],
    ];
    const base = mesh.positions.length / 3;
    for (const end of [s.a, s.b]) {
      for (let i = 0; i <= radial; i++) {
        const ang = (i / radial) * Math.PI * 2;
        const ca = Math.cos(ang), sa = Math.sin(ang);
        const nx = u[0] * ca + w[0] * sa;
        const ny = u[1] * ca + w[1] * sa;
        const nz = u[2] * ca + w[2] * sa;
        pushVert(mesh, end[0] + nx * radius, end[1] + ny * radius, end[2] + nz * radius, nx, ny, nz);
      }
    }
    for (let i = 0; i < radial; i++) {
      const a = base + i;
      mesh.indices.push(a, a + 1, a + radial + 1, a + 1, a + radial + 2, a + radial + 1);
    }
  }
  return mesh;
}

/** 圆角矩形轮廓挤出（用于铭牌、按键面板等） */
export function slab(w, h, d, r = 0.004) {
  return roundedBox(w, h, d, Math.min(r, Math.min(w, h, d) / 2 - 1e-4), 3);
}

/** 十字键（d-pad） */
export function dpad(size = 0.02, thick = 0.006, arm = 0.35) {
  const a = size * arm;
  const b = size - a;
  return mergeMeshes([
    place(box(a * 2, thick, size), [0, 0, 0]),
    place(box(size, thick, a * 2), [0, 0, 0]),
  ]);
}

/** 网格包围盒（用于渲染取景） */
export function bounds(mesh) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < mesh.positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      if (mesh.positions[i + k] < min[k]) min[k] = mesh.positions[i + k];
      if (mesh.positions[i + k] > max[k]) max[k] = mesh.positions[i + k];
    }
  }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
}
