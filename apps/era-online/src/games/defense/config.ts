/**
 * defense/config.ts — 《灯塔协议》的战场布局、塔种与敌人数值。
 *
 * 全部数值为**本展厅自行设计**的玩法参数，不是任何商业作品的数据。
 */

import type {
  CellKind,
  Difficulty,
  EnemyDef,
  EnemyKind,
  TowerDef,
  TowerKind,
  WaveDef,
} from './types';

export const GRID_COLS = 16;
export const GRID_ROWS = 10;
export const CELL = 40;
export const CANVAS_W = GRID_COLS * CELL;
export const CANVAS_H = GRID_ROWS * CELL;

export const BEACON = { col: 0, row: 8 };

/** 主航道（玩家要防守的那一路）折点。 */
const MAIN_WAYPOINTS: Array<[number, number]> = [
  [16, 1],
  [9, 1],
  [9, 4],
  [4, 4],
  [4, 7],
  [10, 7],
  [10, 2],
  [13, 2],
  [13, 8],
  [0, 8],
];

/** 灰烬航道（AI 对手那一路），末端是"灰烬裂隙"。 */
const ASH_WAYPOINTS: Array<[number, number]> = [
  [-1, 0],
  [5, 0],
  [5, 3],
  [0, 3],
  [0, 5],
];

/** 灰烬裂隙（AI 突袭能量的落点）。 */
export const RIFT = { col: 0, row: 5 };

export interface PathPoint {
  /** 格坐标 */
  col: number;
  row: number;
  /** 中心点像素坐标 */
  x: number;
  y: number;
}

function expandWaypoints(wps: Array<[number, number]>): PathPoint[] {
  const out: PathPoint[] = [];
  for (let i = 0; i < wps.length - 1; i++) {
    const [c0, r0] = wps[i]!;
    const [c1, r1] = wps[i + 1]!;
    const stepC = Math.sign(c1 - c0);
    const stepR = Math.sign(r1 - r0);
    let c = c0;
    let r = r0;
    out.push({ col: c, row: r, x: (c + 0.5) * CELL, y: (r + 0.5) * CELL });
    let guard = 0;
    while ((c !== c1 || r !== r1) && guard++ < 200) {
      if (c !== c1) c += stepC;
      else if (r !== r1) r += stepR;
      out.push({ col: c, row: r, x: (c + 0.5) * CELL, y: (r + 0.5) * CELL });
    }
  }
  return out;
}

export const MAIN_PATH = expandWaypoints(MAIN_WAYPOINTS);
export const ASH_PATH = expandWaypoints(ASH_WAYPOINTS);

/** 不可建造的装饰岩块（坐标经过挑选，避开两条航道）。 */
const ROCK_CELLS: Array<[number, number]> = [
  [7, 0],
  [8, 0],
  [2, 1],
  [3, 1],
  [11, 4],
  [12, 4],
  [6, 5],
  [1, 6],
  [11, 8],
  [15, 1],
];

export function buildGrid(): CellKind[][] {
  const grid: CellKind[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    grid.push(new Array<CellKind>(GRID_COLS).fill('build'));
  }
  for (const p of MAIN_PATH) {
    if (p.col >= 0 && p.col < GRID_COLS && p.row >= 0 && p.row < GRID_ROWS) {
      grid[p.row]![p.col] = 'main';
    }
  }
  for (const p of ASH_PATH) {
    if (p.col < 0 || p.col >= GRID_COLS || p.row < 0 || p.row >= GRID_ROWS) continue;
    if (grid[p.row]![p.col] === 'build') grid[p.row]![p.col] = 'ash';
  }
  grid[BEACON.row]![BEACON.col] = 'beacon';
  grid[RIFT.row]![RIFT.col] = 'rift';
  for (const [c, r] of ROCK_CELLS) {
    if (grid[r]![c] === 'build') grid[r]![c] = 'rock';
  }
  return grid;
}

export const GRID = buildGrid();

export function isBuildable(col: number, row: number): boolean {
  if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return false;
  return GRID[row]![col] === 'build';
}

/** 路径上（含主航道与灰烬航道）的格子集合，用于塔索敌判定。 */
export const LANE_CELLS: Set<string> = new Set();
for (const p of MAIN_PATH) LANE_CELLS.add(`${p.col},${p.row}`);
for (const p of ASH_PATH) LANE_CELLS.add(`${p.col},${p.row}`);

// ─────────────────────────── 塔种 ───────────────────────────

export const TOWERS: Record<TowerKind, TowerDef> = {
  pulse: {
    kind: 'pulse',
    name: '脉冲塔',
    en: 'PULSE',
    role: '高频单体',
    cost: 60,
    up2: { sigma: 55, flux: 18 },
    up3: { sigma: 95, flux: 34 },
    levels: [
      { damage: 13, rate: 1.6, range: 2.2, splash: 0, slow: 0, slowDur: 0, chain: 0, aura: 0 },
      { damage: 21, rate: 1.95, range: 2.5, splash: 0, slow: 0, slowDur: 0, chain: 0, aura: 0 },
      { damage: 33, rate: 2.35, range: 2.9, splash: 0, slow: 0, slowDur: 0, chain: 0, aura: 0 },
    ],
    color: '#4fd6ff',
    accent: '#a5ecff',
  },
  cryo: {
    kind: 'cryo',
    name: '霜凝场',
    en: 'CRYO',
    role: '范围减速',
    cost: 85,
    up2: { sigma: 70, flux: 22 },
    up3: { sigma: 120, flux: 42 },
    levels: [
      { damage: 6, rate: 0.8, range: 1.9, splash: 1.0, slow: 0.35, slowDur: 1.6, chain: 0, aura: 0 },
      { damage: 9, rate: 0.95, range: 2.2, splash: 1.2, slow: 0.45, slowDur: 1.9, chain: 0, aura: 0 },
      { damage: 14, rate: 1.1, range: 2.5, splash: 1.4, slow: 0.55, slowDur: 2.3, chain: 0, aura: 0 },
    ],
    color: '#7cf29a',
    accent: '#c8ffd8',
  },
  rail: {
    kind: 'rail',
    name: '磁轨炮',
    en: 'RAIL',
    role: '远程重击',
    cost: 140,
    up2: { sigma: 120, flux: 30 },
    up3: { sigma: 210, flux: 58 },
    levels: [
      { damage: 58, rate: 0.45, range: 3.6, splash: 0, slow: 0, slowDur: 0, chain: 0, aura: 0 },
      { damage: 86, rate: 0.52, range: 4.0, splash: 0, slow: 0, slowDur: 0, chain: 0, aura: 0 },
      { damage: 128, rate: 0.6, range: 4.5, splash: 0, slow: 0, slowDur: 0, chain: 0, aura: 0 },
    ],
    color: '#ff8a3d',
    accent: '#ffd0a8',
  },
  reso: {
    kind: 'reso',
    name: '谐振塔',
    en: 'RESO',
    role: '连锁与增益',
    cost: 110,
    up2: { sigma: 95, flux: 26 },
    up3: { sigma: 165, flux: 50 },
    levels: [
      { damage: 7, rate: 1.0, range: 2.2, splash: 0, slow: 0, slowDur: 0, chain: 1, aura: 0.12 },
      { damage: 11, rate: 1.15, range: 2.5, splash: 0, slow: 0, slowDur: 0, chain: 2, aura: 0.2 },
      { damage: 17, rate: 1.32, range: 2.8, splash: 0, slow: 0, slowDur: 0, chain: 3, aura: 0.3 },
    ],
    color: '#a78bfa',
    accent: '#d9c8ff',
  },
};

export const TOWER_ORDER: TowerKind[] = ['pulse', 'cryo', 'rail', 'reso'];

// ─────────────────────────── 敌人 ───────────────────────────

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  crawler: {
    kind: 'crawler',
    name: '爬行者',
    hp: 62,
    speed: 1.05,
    leak: 4,
    armor: 0,
    slowResist: 0,
    sigma: 8,
    radius: 11,
    color: '#ff6b6b',
    shape: 'blob',
  },
  skitter: {
    kind: 'skitter',
    name: '游丝',
    hp: 36,
    speed: 1.72,
    leak: 3,
    armor: 0,
    slowResist: 0.15,
    sigma: 7,
    radius: 9,
    color: '#ffb03a',
    shape: 'dart',
  },
  bulwark: {
    kind: 'bulwark',
    name: '壁垒',
    hp: 195,
    speed: 0.72,
    leak: 12,
    armor: 6,
    slowResist: 0.25,
    sigma: 21,
    radius: 14,
    color: '#8f9ec9',
    shape: 'block',
  },
  wisp: {
    kind: 'wisp',
    name: '幽焰',
    hp: 92,
    speed: 1.26,
    leak: 6,
    armor: 2,
    slowResist: 0.55,
    sigma: 15,
    radius: 11,
    color: '#c07bff',
    shape: 'flame',
  },
  annihilator: {
    kind: 'annihilator',
    name: '湮灭体',
    hp: 2600,
    speed: 0.55,
    leak: 60,
    armor: 11,
    slowResist: 0.7,
    sigma: 160,
    radius: 22,
    color: '#ff4d6d',
    shape: 'boss',
  },
};

// ─────────────────────────── 波次编排 ───────────────────────────

export const TOTAL_WAVES = 18;

export function buildWave(index: number): WaveDef {
  const n = index;
  const elite = n % 6 === 0;
  const boss = n === TOTAL_WAVES;
  const items: WaveDef['items'] = [];

  const crawler = 8 + n * 3;
  const skitter = Math.floor(crawler * 0.45) + Math.floor(n / 2);
  const bulwark = Math.floor(n / 2.6);
  const wisp = n >= 6 ? Math.floor(n / 3) : 0;

  const gap = Math.max(0.32, 0.74 - n * 0.018);
  let t = 0;

  const push = (kind: EnemyKind, count: number, startDelay: number, spacing: number): void => {
    for (let i = 0; i < count; i++) {
      items.push({ kind, at: startDelay + i * spacing, elite });
      t = Math.max(t, startDelay + i * spacing);
    }
  };

  push('crawler', crawler, 0.4, gap);
  push('skitter', skitter, 1.6, gap * 0.62);
  if (bulwark > 0) push('bulwark', bulwark, 2.6, gap * 2.1);
  if (wisp > 0) push('wisp', wisp, 3.4, gap * 1.3);
  if (boss) {
    push('annihilator', 1, 2.2, 1);
    push('bulwark', 6, 3.0, gap * 1.8);
    push('wisp', 8, 4.2, gap * 0.9);
  }

  items.sort((a, b) => a.at - b.at);

  const label = boss
    ? '湮灭体降临'
    : elite
      ? '精英波 · 高强度编队'
      : n <= 3
        ? '试探编队'
        : n <= 8
          ? '常规推进'
          : '密集攻势';

  return { index: n, items, elite, boss, label };
}

export function waveLabel(w: WaveDef): string {
  return w.label;
}

// ─────────────────────────── 难度 ───────────────────────────

export interface DifficultyDef {
  key: Difficulty;
  name: string;
  en: string;
  desc: string;
  ashRate: number;
  assaultInterval: number;
  squadScale: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyDef> = {
  cautious: {
    key: 'cautious',
    name: '谨慎',
    en: 'CAUTIOUS',
    desc: '灰烬协议积累缓慢，突击间隔长。适合熟悉规则。',
    ashRate: 0.85,
    assaultInterval: 34,
    squadScale: 0.7,
  },
  standard: {
    key: 'standard',
    name: '标准',
    en: 'STANDARD',
    desc: '灰烬协议按基准节奏施压，需要兼顾两条航道。',
    ashRate: 1.5,
    assaultInterval: 24,
    squadScale: 1,
  },
  aggressive: {
    key: 'aggressive',
    name: '激进',
    en: 'AGGRESSIVE',
    desc: '灰烬协议高压突击，突袭前只有很短的预警时间。',
    ashRate: 2.4,
    assaultInterval: 16,
    squadScale: 1.35,
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['cautious', 'standard', 'aggressive'];

// ─────────────────────────── 颜色 ───────────────────────────

export const LANE_COLOR = {
  main: '#4fd6ff',
  mainDim: '#1c3f5c',
  ash: '#ff5d73',
  ashDim: '#4a1f31',
  build: '#1a2440',
  rock: '#2b3452',
  beacon: '#ff8a3d',
} as const;
