/**
 * 10-era-console — 等距测绘所
 * 等距地形生成（纯函数，无 DOM 依赖，可在 Node 中单测）
 *
 * 地形为高度图 + 类型图：网格高程决定绘制顺序（画家算法），
 * 起伏用多倍频值噪声叠加，中部"测绘所庭院"人为压平，
 * 边缘抬起形成环抱山脊，水域沿低洼处自然汇聚。
 */

export const TILE_W = 32;   // 等距菱形宽
export const TILE_H = 16;   // 等距菱形高（2:1）
export const Z_H = 13;     // 每级高程的像素高度

export const TERRAIN_TYPES = {
  WATER: 0,
  SHORE: 1,
  GRASS: 2,
  ROCK: 3,
  PRISM: 4,
};

export const TYPE_NAMES = ['water', 'shore', 'grass', 'rock', 'prism'];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 双线性平滑的值噪声 */
function makeNoise(seed, cols, rows) {
  const rnd = mulberry32(seed);
  const grid = new Float32Array(cols * rows);
  for (let i = 0; i < grid.length; i++) grid[i] = rnd();
  return (x, y) => {
    const fx = x * (cols - 1);
    const fy = y * (rows - 1);
    const x0 = Math.min(cols - 2, Math.max(0, Math.floor(fx)));
    const y0 = Math.min(rows - 2, Math.max(0, Math.floor(fy)));
    const tx = fx - x0;
    const ty = fy - y0;
    const sx = tx * tx * (3 - 2 * tx);
    const sy = ty * ty * (3 - 2 * ty);
    const i00 = grid[y0 * cols + x0];
    const i10 = grid[y0 * cols + x0 + 1];
    const i01 = grid[(y0 + 1) * cols + x0];
    const i11 = grid[(y0 + 1) * cols + x0 + 1];
    return (i00 * (1 - sx) + i10 * sx) * (1 - sy) + (i01 * (1 - sx) + i11 * sx) * sy;
  };
}

/**
 * 生成地形。
 * @param {number} seed
 * @param {number} w 网格宽
 * @param {number} h 网格高
 */
export function generateTerrain(seed = 20261021, w = 30, h = 22) {
  const n1 = makeNoise(seed, 4, 3);
  const n2 = makeNoise(seed + 977, 7, 5);
  const n3 = makeNoise(seed + 4231, 13, 10);
  const heights = new Int8Array(w * h);
  const types = new Uint8Array(w * h);

  // 庭院矩形（中部压平区域），坐标为网格比例
  const yard = { x0: 7, x1: 22, y0: 6, y1: 15 };

  for (let gy = 0; gy < h; gy++) {
    for (let gx = 0; gx < w; gx++) {
      const u = gx / (w - 1);
      const v = gy / (h - 1);

      let e = 0;
      e += n1(u, v) * 2.4;
      e += n2(u, v) * 1.15;
      e += n3(u, v) * 0.42;

      // 边缘抬起：环形山脊
      const dx = (u - 0.5) * 2;
      const dy = (v - 0.5) * 2;
      const rad = Math.sqrt(dx * dx + dy * dy);
      const edge = Math.max(0, (rad - 0.52) / 0.48);
      e += edge * edge * 3.4;

      // 庭院压平
      const inYard = gx >= yard.x0 && gx <= yard.x1 && gy >= yard.y0 && gy <= yard.y1;
      if (inYard) {
        const ex = Math.min(gx - yard.x0, yard.x1 - gx);
        const ey = Math.min(gy - yard.y0, yard.y1 - gy);
        const blend = Math.min(1, (Math.min(ex, ey) + 0.5) / 2.5);
        e = e * (1 - blend) + 2.05 * blend;
      }

      const level = Math.max(0, Math.min(4, Math.round(e - 1.1)));
      heights[gy * w + gx] = level;
      types[gy * w + gx] = level;
    }
  }

  // 抹平孤立尖峰，避免出现无法行走的单格柱
  const smoothed = Int8Array.from(heights);
  for (let gy = 1; gy < h - 1; gy++) {
    for (let gx = 1; gx < w - 1; gx++) {
      const i = gy * w + gx;
      const neigh = [
        heights[i - 1], heights[i + 1], heights[i - w], heights[i + w],
      ];
      const maxN = Math.max(...neigh);
      const minN = Math.min(...neigh);
      if (maxN - minN >= 3) smoothed[i] = Math.round((heights[i] + maxN + minN) / 3);
    }
  }
  heights.set(smoothed);

  return { w, h, heights, types, seed };
}

/** 网格坐标 → 等距投影的"地面"屏幕坐标（未加相机偏移） */
export function gridToScreen(gx, gy, height) {
  return {
    x: (gx - gy) * (TILE_W / 2),
    y: (gx + gy) * (TILE_H / 2) - (height || 0) * Z_H,
  };
}

/** 屏幕坐标 → 网格坐标（近似，用于点击拾取） */
export function screenToGrid(sx, sy) {
  const a = sx / (TILE_W / 2);
  const b = sy / (TILE_H / 2);
  return { gx: Math.round((a + b) / 2), gy: Math.round((b - a) / 2) };
}

/** 地形在屏幕上的包围盒（用于居中与缩放限制） */
export function terrainBounds(t) {
  const corners = [
    gridToScreen(0, 0, 0),
    gridToScreen(t.w - 1, 0, 0),
    gridToScreen(0, t.h - 1, 0),
    gridToScreen(t.w - 1, t.h - 1, 0),
  ];
  const minX = Math.min(...corners.map((c) => c.x));
  const maxX = Math.max(...corners.map((c) => c.x));
  const minY = Math.min(...corners.map((c) => c.y)) - 4 * Z_H;
  const maxY = Math.max(...corners.map((c) => c.y));
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}
