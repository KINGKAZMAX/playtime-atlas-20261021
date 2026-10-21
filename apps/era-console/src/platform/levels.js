/**
 * 10-era-console — 色块远征 / CHROMA VOYAGE
 * 关卡数据（3 关）与关卡构建器
 *
 * 【可通关性设计约束】（由 tests/levels.test.js 逐条校验）
 *  1. 跳跃参数：重力 0.34、起跳速度 6.0、跑速 2.1 px/帧
 *     → 最高上升 ≈ 53px（3.3 格），水平射程 ≈ 73px（4.5 格）
 *  2. 玩家宽 12px。跨过 g 格空隙需要的水平位移 = g×16 + 12
 *     → g = 3 时需 60px（可跳过），g = 4 时需 76px（超出射程，必须有落脚点）
 *  3. 因此所有空隙统一为 3 格，并在每个空隙起始处自动铺设一块
 *     单向落脚板（高度 = max(两侧地面行) − 1，两侧各差 1 格），
 *     保证任意位置失足都能安全通过 —— 关卡必定可通关。
 *  4. 相邻两段地面高差 ≤ 2 格，保证跳跃上升量在射程之内。
 *
 * 角色 / 关卡 / 命名全部原创，未使用任何商业游戏资产。
 */

import { TILE } from './physics.js';

export const LEVEL_HEIGHT = 15;

/* ------------------------------------------------------------------ *
 * 主题（每关一套原创配色）
 * ------------------------------------------------------------------ */
const THEME_DAWN = {
  skyTop: '#4fbde8',
  skyMid: '#9fe3ff',
  skyBot: '#ffe3a6',
  far: '#bcd9ef',
  mid: '#8fb9d8',
  near: '#5f8aa8',
  dirtTop: '#7bf0c4',
  dirt: '#39a888',
  dirtDark: '#217a63',
  rock: '#3b3660',
  rockLit: '#524a80',
  accent: '#ffd166',
  hazard: '#ff7a6b',
  liquid: '#4f7fd8',
  liquidHi: '#8fc0ff',
  tint: '#eafff6',
};

const THEME_LADDER = {
  skyTop: '#3b2a6b',
  skyMid: '#6b4bb0',
  skyBot: '#d98fb8',
  far: '#5f4794',
  mid: '#7b58b8',
  near: '#b48aff',
  dirtTop: '#c9a6ff',
  dirt: '#7c5bc4',
  dirtDark: '#4d3486',
  rock: '#2c2450',
  rockLit: '#453a75',
  accent: '#ffe08a',
  hazard: '#ff7a6b',
  liquid: '#5ec8ff',
  liquidHi: '#b6ecff',
  tint: '#f2e8ff',
};

const THEME_FORGE = {
  skyTop: '#141228',
  skyMid: '#3a2144',
  skyBot: '#8a3a44',
  far: '#2a1c3d',
  mid: '#45264a',
  near: '#6b3350',
  dirtTop: '#ff9f7a',
  dirt: '#c05a52',
  dirtDark: '#7c3638',
  rock: '#241a34',
  rockLit: '#3d2c52',
  accent: '#ffd166',
  hazard: '#ff5d6c',
  liquid: '#ff7a3d',
  liquidHi: '#ffc08a',
  tint: '#ffe7d6',
};

/* ------------------------------------------------------------------ *
 * 关卡定义
 * ------------------------------------------------------------------ */

/** 第一关「黎明色阶」——教学：跳跃 / 单向板 / 首个敌人 / 检查点 */
const LEVEL_DAWN = {
  id: 'dawn',
  name: '黎明色阶',
  subtitle: 'DAWN STEPS',
  blurb: '墨豆的第一段远征：晨色阶梯上的三枚色晶。',
  width: 100,
  pitRow: 14,
  theme: THEME_DAWN,
  segs: [
    [0, 17, 13],
    [21, 32, 13],
    [36, 47, 12],
    [51, 62, 13],
    [66, 77, 12],
    [81, 99, 13],
  ],
  extraOneways: [],
  spikes: [],
  player: [3, 13],
  goal: [95, 13],
  shards: [
    [25, 11],
    [42, 10],
    [72, 10],
  ],
  checkpoints: [
    [22, 13],
    [52, 13],
  ],
  enemies: [
    { type: 'cusp', x: 27, y: 13, range: 5 },
    { type: 'cusp', x: 56, y: 13, range: 5 },
    { type: 'wisp', x: 40, y: 8, range: 6 },
  ],
  movers: [
    { axis: 'h', x: 36, y: 10, range: 6, speed: 0.28 },
  ],
};

/** 第二关「晶脉天梯」——纵向攀爬 + 升降色台 */
const LEVEL_LADDER = {
  id: 'ladder',
  name: '晶脉天梯',
  subtitle: 'CRYSTAL LADDER',
  blurb: '垂直的紫色矿脉，靠移动色台逐级而上。',
  width: 112,
  pitRow: 14,
  theme: THEME_LADDER,
  segs: [
    [0, 12, 13],
    [16, 21, 11],
    [25, 30, 9],
    [34, 39, 11],
    [43, 48, 10],
    [52, 58, 8],
    [62, 68, 10],
    [72, 78, 12],
    [82, 89, 13],
    [93, 100, 12],
    [104, 111, 12],
  ],
  extraOneways: [],
  spikes: [],
  player: [3, 13],
  goal: [108, 12],
  shards: [
    [27, 7],
    [54, 6],
    [84, 11],
  ],
  checkpoints: [
    [17, 11],
    [53, 8],
  ],
  enemies: [
    { type: 'cusp', x: 28, y: 9, range: 4 },
    { type: 'cusp', x: 84, y: 13, range: 4 },
    { type: 'wisp', x: 36, y: 7, range: 7 },
    { type: 'wisp', x: 86, y: 9, range: 6 },
  ],
  movers: [
    { axis: 'v', x: 26, y: 5, range: 4, speed: 0.3 },
    { axis: 'h', x: 53, y: 6, range: 5, speed: 0.35 },
    { axis: 'h', x: 93, y: 11, range: 5, speed: 0.32 },
  ],
};

/** 第三关「暮光熔炉」——尖刺 + 熔浆 + 高低错落 */
const LEVEL_FORGE = {
  id: 'forge',
  name: '暮光熔炉',
  subtitle: 'TWILIGHT FORGE',
  blurb: '熔炉的余烬仍在燃烧，最后三枚色晶藏在最深处。',
  width: 124,
  pitRow: 13,
  theme: THEME_FORGE,
  segs: [
    [0, 10, 13],
    [14, 20, 12],
    [24, 29, 13],
    [33, 39, 11],
    [43, 49, 12],
    [53, 60, 13],
    [64, 69, 11],
    [73, 79, 13],
    [83, 89, 11],
    [93, 99, 12],
    [103, 110, 13],
    [114, 123, 13],
  ],
  extraOneways: [],
  spikes: [
    [17, 11, 2],
    [35, 10, 2],
    [56, 12, 3],
    [75, 12, 2],
    [86, 10, 2],
    [106, 12, 2],
    [117, 12, 2],
  ],
  player: [3, 13],
  goal: [119, 13],
  shards: [
    [36, 9],
    [66, 9],
    [108, 11],
  ],
  checkpoints: [
    [15, 12],
    [54, 13],
    [94, 12],
  ],
  enemies: [
    { type: 'cusp', x: 26, y: 13, range: 3 },
    { type: 'cusp', x: 46, y: 12, range: 4 },
    { type: 'cusp', x: 60, y: 13, range: 3 },
    { type: 'cusp', x: 84, y: 11, range: 3 },
    { type: 'wisp', x: 37, y: 7, range: 6 },
    { type: 'wisp', x: 78, y: 9, range: 7 },
    { type: 'wisp', x: 108, y: 9, range: 6 },
  ],
  movers: [
    { axis: 'h', x: 33, y: 9, range: 6, speed: 0.4 },
    { axis: 'v', x: 61, y: 8, range: 3, speed: 0.35 },
    { axis: 'h', x: 94, y: 10, range: 5, speed: 0.38 },
  ],
};

export const LEVEL_DEFS = [LEVEL_DAWN, LEVEL_LADDER, LEVEL_FORGE];

/* ------------------------------------------------------------------ *
 * 构建器
 * ------------------------------------------------------------------ */

/**
 * 把 DSL 定义编译成瓦片网格 + 实体列表。
 * @returns {object} 已构建的关卡
 */
export function buildLevel(def) {
  const width = def.width;
  const height = LEVEL_HEIGHT;
  const grid = new Array(width * height).fill('.');

  const set = (x, y, ch) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    grid[y * width + x] = ch;
  };
  const rect = (x, y, w, h, ch) => {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) set(x + dx, y + dy, ch);
    }
  };

  // 地面段：从 surfaceRow 一直填到地图底部
  for (const [x0, x1, surface] of def.segs) {
    rect(x0, surface, x1 - x0 + 1, height - surface, '#');
  }

  // 自动落脚板：每个空隙起始处铺 2 格单向板，高度 = max(两侧地面行) − 1
  const bridges = [];
  for (let i = 0; i < def.segs.length - 1; i++) {
    const [x0, x1, sA] = def.segs[i];
    const [, x2, sB] = def.segs[i + 1];
    const gapStart = x1 + 1;
    const gapEnd = x2 - 1;
    if (gapEnd < gapStart) continue;
    const row = Math.max(sA, sB) - 1;
    rect(gapStart, row, Math.min(2, gapEnd - gapStart + 1), 1, '=');
    bridges.push({ x: gapStart, y: row, w: Math.min(2, gapEnd - gapStart + 1) });
  }

  // 额外手工单向板
  for (const [x, y, w] of def.extraOneways || []) rect(x, y, w, 1, '=');

  // 尖刺
  for (const [x, y, w] of def.spikes || []) rect(x, y, w, 1, '^');

  // 坑底色浆：所有空隙列的 pitRow
  if (def.pitRow != null) {
    for (let i = 0; i < def.segs.length - 1; i++) {
      const [, x1] = def.segs[i];
      const [, x2] = def.segs[i + 1];
      for (let x = x1 + 1; x <= x2 - 1; x++) set(x, def.pitRow, '~');
    }
  }

  // 目标闸门（2 格高）
  const goalX = def.goal[0];
  const goalSurface = def.goal[1];
  const goal = {
    x: goalX * TILE,
    y: (goalSurface - 2) * TILE,
    w: TILE,
    h: TILE * 2,
    tx: goalX,
    ty: goalSurface - 2,
    surfaceRow: goalSurface,
    open: false,
  };

  const spawn = {
    x: def.player[0] * TILE + 2,
    y: def.player[1] * TILE - 16,
  };

  const shards = def.shards.map(([x, y], i) => ({
    id: `${def.id}-shard-${i}`,
    x: x * TILE + 4,
    y: y * TILE + 4,
    w: 8,
    h: 8,
    tx: x,
    ty: y,
    collected: false,
  }));

  const checkpoints = def.checkpoints.map(([x, surface], i) => ({
    id: `${def.id}-cp-${i}`,
    x: x * TILE + 4,
    y: surface * TILE - 16,
    w: 8,
    h: 16,
    tx: x,
    ty: surface - 1,
    surfaceRow: surface,
    activated: false,
  }));

  const enemies = def.enemies.map((e, i) => ({
    id: `${def.id}-enemy-${i}`,
    type: e.type,
    x: e.x * TILE,
    y: e.y * TILE - 14,
    w: e.type === 'cusp' ? 14 : 12,
    h: e.type === 'cusp' ? 14 : 12,
    homeX: e.x * TILE,
    homeY: e.y * TILE - 14,
    range: e.range * TILE,
    dir: -1,
    vx: 0,
    vy: 0,
    dead: false,
  }));

  const movers = def.movers.map((m, i) => ({
    id: `${def.id}-mover-${i}`,
    axis: m.axis,
    x: m.x * TILE,
    y: m.y * TILE,
    w: TILE * 2,
    h: 8,
    originX: m.x * TILE,
    originY: m.y * TILE,
    range: m.range * TILE,
    speed: m.speed,
    dir: 1,
  }));

  return {
    id: def.id,
    name: def.name,
    subtitle: def.subtitle,
    blurb: def.blurb,
    width,
    height,
    grid,
    theme: def.theme,
    spawn,
    goal,
    shards,
    checkpoints,
    enemies,
    movers,
    bridges,
  };
}

/** 构建全部关卡 */
export function buildAllLevels() {
  return LEVEL_DEFS.map(buildLevel);
}

export const TOTAL_SHARDS = LEVEL_DEFS.reduce((n, d) => n + d.shards.length, 0);
