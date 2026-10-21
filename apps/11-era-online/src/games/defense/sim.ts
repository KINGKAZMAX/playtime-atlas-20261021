/**
 * defense/sim.ts — 《灯塔协议》的纯逻辑模拟。
 *
 * 本文件不接触 DOM 与 Canvas，方便单独推理与测试。
 * 渲染层只读取状态，不修改状态。
 */

import { audio } from '../../core/audio';
import { Rng } from '../../core/rng';
import {
  ASH_PATH,
  BEACON,
  CANVAS_W,
  CELL,
  DIFFICULTIES,
  ENEMIES,
  GRID_COLS,
  GRID_ROWS,
  MAIN_PATH,
  RIFT,
  TOTAL_WAVES,
  TOWERS,
  buildWave,
  isBuildable,
} from './config';
import type {
  DefenseState,
  Difficulty,
  Enemy,
  EnemyKind,
  Lane,

  Tower,
  TowerKind,
} from './types';

export const PREP_FIRST = 22;
export const PREP_NORMAL = 12;
export const FLUX_REGEN = 2.3;
export const SIGMA_REGEN = 1.6;
export const SELL_REFUND = 0.6;

export function createState(seed = 20261021, difficulty: Difficulty = 'standard'): DefenseState {
  const def = DIFFICULTIES[difficulty];
  const s: DefenseState = {
    wave: 0,
    inWave: false,
    prepTimer: PREP_FIRST,
    sigma: 240,
    flux: 70,
    fluxMax: 120,
    beaconHp: 100,
    beaconMax: 100,
    towers: [],
    enemies: [],
    queue: [],
    ashQueue: [],
    riftFlash: 0,
    waveClock: 0,
    ashClock: 0,
    difficulty,
    speed: 1,
    paused: false,
    over: null,
    ashPool: 26,
    ashRate: def.ashRate,
    assaultCountdown: def.assaultInterval,
    assaultInterval: def.assaultInterval,
    assaultCount: 0,
    aiIntent: '灰烬协议正在校准首轮突击向量。',
    aiLog: [],
    preview: buildWave(1),
    nextId: 1,
    seed,
    stats: {
      killed: 0,
      leaked: 0,
      built: 0,
      upgrades: 0,
      sigmaEarned: 0,
      startedAt: Date.now(),
    },
    floaters: [],
    sparks: [],
    beams: [],
    cursor: { col: 0, row: 0 },
    buildKind: null,
    selectedTower: null,
    targetMode: 'first',
    banner: '',
    bannerT: 0,
  };
  return s;
}

// ─────────────────────────── 路径与坐标 ───────────────────────────

export function pathLength(lane: Lane): number {
  return (lane === 'main' ? MAIN_PATH : ASH_PATH).length;
}

export function pathPos(lane: Lane, t: number): { x: number; y: number } {
  const path = lane === 'main' ? MAIN_PATH : ASH_PATH;
  const max = path.length - 1;
  const clamped = Math.max(0, Math.min(max, t));
  const i = Math.floor(clamped);
  const f = clamped - i;
  const a = path[i]!;
  const b = path[Math.min(max, i + 1)]!;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

export function cellCenter(col: number, row: number): { x: number; y: number } {
  return { x: (col + 0.5) * CELL, y: (row + 0.5) * CELL };
}

export function towerAt(state: DefenseState, col: number, row: number): Tower | undefined {
  return state.towers.find((t) => t.col === col && t.row === row);
}

export function towerById(state: DefenseState, id: number): Tower | undefined {
  return state.towers.find((t) => t.id === id);
}

export function upgradeCost(tower: Tower): { sigma: number; flux: number } | null {
  const def = TOWERS[tower.kind];
  if (tower.level >= 3) return null;
  return tower.level === 1 ? def.up2 : def.up3;
}

// ─────────────────────────── 建造操作 ───────────────────────────

export function canBuild(state: DefenseState, col: number, row: number): boolean {
  if (state.over) return false;
  if (!isBuildable(col, row)) return false;
  if (towerAt(state, col, row)) return false;
  return true;
}

export function buildTower(state: DefenseState, kind: TowerKind, col: number, row: number): boolean {
  if (!canBuild(state, col, row)) return false;
  const def = TOWERS[kind];
  if (state.sigma < def.cost) {
    flashBanner(state, '晶格不足', '#ff5d73');
    audio.play('alarm');
    return false;
  }
  state.sigma -= def.cost;
  const tower: Tower = {
    id: state.nextId++,
    kind,
    col,
    row,
    level: 1,
    cooldown: 0,
    kills: 0,
    invested: def.cost,
    mode: state.targetMode,
    aim: -Math.PI / 2,
    pulse: 0,
  };
  state.towers.push(tower);
  state.stats.built++;
  state.stats.sigmaEarned += 0;
  audio.play('place');
  burst(state, cellCenter(col, row).x, cellCenter(col, row).y, def.color, 12);
  return true;
}

export function upgradeTower(state: DefenseState, id: number): boolean {
  const tower = towerById(state, id);
  if (!tower) return false;
  const cost = upgradeCost(tower);
  if (!cost) {
    flashBanner(state, '已是最高等级', '#9aa6c6');
    return false;
  }
  if (state.sigma < cost.sigma || state.flux < cost.flux) {
    flashBanner(state, '资源不足以升级', '#ff5d73');
    audio.play('alarm');
    return false;
  }
  state.sigma -= cost.sigma;
  state.flux -= cost.flux;
  tower.level++;
  tower.invested += cost.sigma;
  state.stats.upgrades++;
  audio.play('levelup');
  const c = cellCenter(tower.col, tower.row);
  burst(state, c.x, c.y, TOWERS[tower.kind].accent, 18);
  return true;
}

export function sellTower(state: DefenseState, id: number): boolean {
  const idx = state.towers.findIndex((t) => t.id === id);
  if (idx < 0) return false;
  const tower = state.towers[idx]!;
  const refund = Math.floor(tower.invested * SELL_REFUND);
  state.sigma += refund;
  state.towers.splice(idx, 1);
  if (state.selectedTower === id) state.selectedTower = null;
  audio.play('coin');
  flashBanner(state, `回收 +${refund} 晶格`, '#ffd166');
  return true;
}

// ─────────────────────────── 战斗 ───────────────────────────

function spawnEnemy(state: DefenseState, kind: EnemyKind, lane: Lane, elite: boolean): void {
  const def = ENEMIES[kind];
  const hpMul = elite ? 1.6 : 1;
  const speedMul = elite ? 0.92 : 1;
  state.enemies.push({
    id: state.nextId++,
    kind,
    lane,
    t: 0,
    hp: def.hp * hpMul,
    maxHp: def.hp * hpMul,
    speedMul,
    slowT: 0,
    slowFactor: 1,
    flash: 0,
    dying: 0,
    alive: true,
    damageTaken: 0,
  });
}

/** 计算某座塔周围的增伤光环（谐振塔为相邻友塔提供加伤）。 */
function auraBonus(state: DefenseState, tower: Tower): number {
  let bonus = 0;
  const c = cellCenter(tower.col, tower.row);
  for (const other of state.towers) {
    if (other.id === tower.id) continue;
    if (other.kind !== 'reso') continue;
    const o = cellCenter(other.col, other.row);
    const d = Math.hypot(o.x - c.x, o.y - c.y) / CELL;
    if (d <= 1.5) {
      const lvl = TOWERS.reso.levels[other.level - 1]!;
      bonus = Math.max(bonus, lvl.aura);
    }
  }
  return bonus;
}

function pickTarget(
  state: DefenseState,
  tower: Tower,
  rangePx: number,
): Enemy | null {
  const c = cellCenter(tower.col, tower.row);
  let best: Enemy | null = null;
  let bestScore = -Infinity;
  for (const e of state.enemies) {
    if (!e.alive || e.dying > 0) continue;
    const p = pathPos(e.lane, e.t);
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    if (d > rangePx) continue;
    let score: number;
    switch (tower.mode) {
      case 'strong':
        score = e.hp;
        break;
      case 'close':
        score = -d;
        break;
      case 'first':
      default:
        score = e.t;
        break;
    }
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }
  return best;
}

function damageEnemy(state: DefenseState, enemy: Enemy, raw: number, source: Tower): void {
  if (!enemy.alive || enemy.dying > 0) return;
  const def = ENEMIES[enemy.kind];
  const dealt = Math.max(1, raw - def.armor);
  enemy.hp -= dealt;
  enemy.damageTaken += dealt;
  enemy.flash = 0.12;
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.dying = 0.28;
    enemy.alive = false;
    state.stats.killed++;
    source.kills++;
    const reward = def.sigma * (enemy.kind === 'annihilator' ? 1 : 1);
    state.sigma += reward;
    state.stats.sigmaEarned += reward;
    const p = pathPos(enemy.lane, enemy.t);
    burst(state, p.x, p.y, def.color, enemy.kind === 'annihilator' ? 40 : 12);
    audio.play(enemy.kind === 'annihilator' ? 'boom' : 'hit');
  }
}

function applySlow(enemy: Enemy, slow: number, dur: number): void {
  if (slow <= 0) return;
  const def = ENEMIES[enemy.kind];
  const effective = slow * (1 - def.slowResist);
  const factor = Math.max(0.25, 1 - effective);
  if (factor < enemy.slowFactor || enemy.slowT <= 0) {
    enemy.slowFactor = Math.min(enemy.slowFactor, factor);
    enemy.slowT = Math.max(enemy.slowT, dur);
  }
}

function fireTower(state: DefenseState, tower: Tower, target: Enemy): void {
  const def = TOWERS[tower.kind];
  const lvl = def.levels[tower.level - 1]!;
  const bonus = 1 + auraBonus(state, tower);
  const dmg = lvl.damage * bonus;
  const from = cellCenter(tower.col, tower.row);
  const tp = pathPos(target.lane, target.t);
  tower.aim = Math.atan2(tp.y - from.y, tp.x - from.x);
  tower.pulse = 0.18;

  if (tower.kind === 'reso') {
    // 连锁：先打主目标，再跳到附近的其他目标
    const hit = new Set<number>();
    let current: Enemy | null = target;
    let cx = tp.x;
    let cy = tp.y;
    for (let i = 0; i <= lvl.chain && current; i++) {
      hit.add(current.id);
      damageEnemy(state, current, dmg * Math.pow(0.8, i), tower);
      if (lvl.splash > 0) {
        for (const other of state.enemies) {
          if (!other.alive || other.dying > 0 || hit.has(other.id)) continue;
          const op = pathPos(other.lane, other.t);
          if (Math.hypot(op.x - cx, op.y - cy) <= lvl.splash * CELL) {
            hit.add(other.id);
            damageEnemy(state, other, dmg * 0.45, tower);
          }
        }
      }
      cx = pathPos(current.lane, current.t).x;
      cy = pathPos(current.lane, current.t).y;
      // 找最近的未命中目标
      let next: Enemy | null = null;
      let nd = 2.2 * CELL;
      for (const other of state.enemies) {
        if (!other.alive || other.dying > 0 || hit.has(other.id)) continue;
        const op = pathPos(other.lane, other.t);
        const d = Math.hypot(op.x - cx, op.y - cy);
        if (d < nd) {
          nd = d;
          next = other;
        }
      }
      current = next;
    }
    state.beams.push({ x0: from.x, y0: from.y, x1: tp.x, y1: tp.y, life: 0.18, color: def.color, width: 2.4 });
    audio.play('shoot');
    return;
  }

  if (lvl.splash > 0) {
    for (const other of state.enemies) {
      if (!other.alive || other.dying > 0) continue;
      const op = pathPos(other.lane, other.t);
      if (Math.hypot(op.x - tp.x, op.y - tp.y) <= lvl.splash * CELL) {
        damageEnemy(state, other, dmg, tower);
        applySlow(other, lvl.slow, lvl.slowDur);
      }
    }
    burst(state, tp.x, tp.y, def.color, 8);
    audio.play('select');
  } else {
    damageEnemy(state, target, dmg, tower);
    if (lvl.slow > 0) applySlow(target, lvl.slow, lvl.slowDur);
    state.beams.push({
      x0: from.x,
      y0: from.y,
      x1: tp.x,
      y1: tp.y,
      life: tower.kind === 'rail' ? 0.24 : 0.12,
      color: def.color,
      width: tower.kind === 'rail' ? 3.2 : 1.8,
    });
    audio.play(tower.kind === 'rail' ? 'boom' : 'shoot');
  }
}

// ─────────────────────────── 主循环 ───────────────────────────

export function stepDefense(state: DefenseState, dt: number): void {
  if (state.over) return;

  // 资源回复
  state.sigma += SIGMA_REGEN * dt;
  state.flux = Math.min(state.fluxMax, state.flux + FLUX_REGEN * dt);

  // 波次：准备阶段
  if (!state.inWave) {
    state.prepTimer -= dt;
    if (state.prepTimer <= 0) startNextWave(state);
  } else {
    state.waveClock += dt;
    while (state.queue.length && state.queue[0]!.at <= state.waveClock) {
      const item = state.queue.shift()!;
      spawnEnemy(state, item.kind, 'main', item.elite);
    }
  }

  // 灰烬 AI 编队出场：用灰烬航道自己的时钟，不受玩家波次状态影响
  state.ashClock += dt;
  while (state.ashQueue.length && state.ashQueue[0]!.at <= state.ashClock) {
    const item = state.ashQueue.shift()!;
    spawnEnemy(state, item.kind, 'ash', item.elite);
  }

  // 敌人推进
  for (const e of state.enemies) {
    if (!e.alive) {
      e.dying = Math.max(0, e.dying - dt);
      continue;
    }
    if (e.slowT > 0) {
      e.slowT -= dt;
      if (e.slowT <= 0) e.slowFactor = 1;
    }
    if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);

    const def = ENEMIES[e.kind];
    e.t += def.speed * e.speedMul * e.slowFactor * dt;

    if (e.t >= pathLength(e.lane) - 1) {
      e.alive = false;
      e.dying = 0;
      state.stats.leaked++;
      if (e.lane === 'main') {
        state.beaconHp -= def.leak;
        const bp = cellCenter(BEACON.col, BEACON.row);
        burst(state, bp.x, bp.y, '#ff5d73', 20);
      } else {
        // 灰烬裂隙冲击：能量沿链路打到灯塔
        state.beaconHp -= def.leak;
        state.riftFlash = 0.5;
        const rp = cellCenter(RIFT.col, RIFT.row);
        const bp = cellCenter(BEACON.col, BEACON.row);
        state.beams.push({ x0: rp.x, y0: rp.y, x1: bp.x, y1: bp.y, life: 0.35, color: '#ff5d73', width: 4 });
        burst(state, rp.x, rp.y, '#ff5d73', 22);
      }
      audio.play('hurt');
    }
  }
  state.enemies = state.enemies.filter((e) => e.alive || e.dying > 0);

  // 塔开火
  for (const tower of state.towers) {
    const def = TOWERS[tower.kind];
    const lvl = def.levels[tower.level - 1]!;
    tower.pulse = Math.max(0, tower.pulse - dt);
    tower.cooldown -= dt;
    if (tower.cooldown > 0) continue;
    const target = pickTarget(state, tower, lvl.range * CELL);
    if (!target) {
      tower.cooldown = 0;
      continue;
    }
    fireTower(state, tower, target);
    tower.cooldown = 1 / lvl.rate;
  }

  // 波次结束判定
  if (state.inWave && state.queue.length === 0 && !state.enemies.some((e) => e.alive)) {
    const bonus = 34 + state.wave * 9;
    state.sigma += bonus;
    state.stats.sigmaEarned += bonus;
    if (state.wave >= TOTAL_WAVES) {
      state.over = 'win';
      state.banner = '全部航道肃清 · 灯塔长明';
      state.bannerT = 2.4;
      audio.play('win');
    } else {
      state.inWave = false;
      state.prepTimer = PREP_NORMAL;
      state.preview = buildWave(state.wave + 1);
      flashBanner(state, `第 ${state.wave} 波肃清 · +${bonus} 晶格`, '#7cf29a');
    }
  }

  // 失败判定
  if (state.beaconHp <= 0 && !state.over) {
    state.beaconHp = 0;
    state.over = 'lose';
    state.banner = '灯塔失守';
    state.bannerT = 2.4;
    audio.play('lose');
  }

  if (state.riftFlash > 0) state.riftFlash = Math.max(0, state.riftFlash - dt);
  if (state.bannerT > 0) state.bannerT = Math.max(0, state.bannerT - dt);

  // 特效衰减
  for (const f of state.floaters) f.life -= dt;
  state.floaters = state.floaters.filter((f) => f.life > 0);
  for (const s of state.sparks) {
    s.life -= dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 40 * dt;
  }
  state.sparks = state.sparks.filter((s) => s.life > 0);
  for (const b of state.beams) b.life -= dt;
  state.beams = state.beams.filter((b) => b.life > 0);
}

export function startNextWave(state: DefenseState): void {
  if (state.over) return;
  const next = state.wave + 1;
  if (next > TOTAL_WAVES) return;
  const early = state.prepTimer > 0.5 ? Math.ceil(state.prepTimer) : 0;
  if (early > 0) {
    const bonus = early * 3;
    state.sigma += bonus;
    state.stats.sigmaEarned += bonus;
    flashBanner(state, `提前出击 +${bonus} 晶格`, '#ffd166');
  }
  state.wave = next;
  state.preview = buildWave(next);
  state.queue = state.preview.items.map((i) => ({ ...i }));
  state.waveClock = 0;
  state.inWave = true;
  audio.play('alarm');
  flashBanner(state, `第 ${next} 波 · ${state.preview.label}`, '#4fd6ff');
}

// ─────────────────────────── 特效 ───────────────────────────

export function burst(state: DefenseState, x: number, y: number, color: string, count: number): void {
  const rng = new Rng(state.seed + state.nextId * 7919 + state.sparks.length);
  for (let i = 0; i < count; i++) {
    const a = rng.range(0, Math.PI * 2);
    const sp = rng.range(30, 150);
    state.sparks.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: rng.range(0.25, 0.6),
      maxLife: 0.6,
      color,
      size: rng.range(1.5, 3.6),
    });
  }
  if (state.sparks.length > 420) state.sparks.splice(0, state.sparks.length - 420);
}

export function flashBanner(state: DefenseState, text: string, color: string): void {
  state.banner = text;
  state.bannerT = 1.8;
  state.floaters.push({ x: CANVAS_W / 2, y: 26, text, life: 1.6, color });
}

// ─────────────────────────── 存读档 ───────────────────────────

export interface DefenseSave {
  v: 1;
  wave: number;
  sigma: number;
  flux: number;
  beaconHp: number;
  difficulty: Difficulty;
  towers: Array<Pick<Tower, 'id' | 'kind' | 'col' | 'row' | 'level' | 'kills' | 'invested' | 'mode'>>;
  stats: DefenseState['stats'];
  assaultCount: number;
  ashPool: number;
  savedAt: number;
}

export function serialize(state: DefenseState): DefenseSave {
  return {
    v: 1,
    wave: state.wave,
    sigma: Math.floor(state.sigma),
    flux: Math.floor(state.flux),
    beaconHp: state.beaconHp,
    difficulty: state.difficulty,
    towers: state.towers.map((t) => ({
      id: t.id,
      kind: t.kind,
      col: t.col,
      row: t.row,
      level: t.level,
      kills: t.kills,
      invested: t.invested,
      mode: t.mode,
    })),
    stats: { ...state.stats },
    assaultCount: state.assaultCount,
    ashPool: state.ashPool,
    savedAt: Date.now(),
  };
}

export function deserialize(save: DefenseSave): DefenseState {
  const state = createState(20261021, save.difficulty);
  state.wave = save.wave;
  state.sigma = save.sigma;
  state.flux = save.flux;
  state.beaconHp = save.beaconHp;
  state.towers = save.towers.map((t) => ({
    ...t,
    cooldown: 0,
    pulse: 0,
    aim: -Math.PI / 2,
  }));
  state.stats = { ...save.stats };
  state.assaultCount = save.assaultCount;
  state.ashPool = save.ashPool;
  state.nextId = save.towers.reduce((m, t) => Math.max(m, t.id), 0) + 1;
  state.inWave = false;
  state.prepTimer = PREP_NORMAL;
  state.preview = buildWave(Math.min(TOTAL_WAVES, state.wave + 1));
  return state;
}

export function isInsideGrid(col: number, row: number): boolean {
  return col >= 0 && col < GRID_COLS && row >= 0 && row < GRID_ROWS;
}
