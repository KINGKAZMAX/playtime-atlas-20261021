/**
 * handheld/sim.ts — 《口袋回声》的纯逻辑模拟（不接触 DOM）。
 */

import { audio } from '../../core/audio';
import { Rng } from '../../core/rng';
import {
  AREAS,
  BEACON_SPOT,
  LEVER_SPOT,
  MAP_H,
  MAP_W,
  NPCS,
  PLAYER_MAX_HP,
  SHARD_SPOTS,
  START_SPOT,
  TILE,
  type AreaDef,
  type AreaId,
  type NpcDef,
} from './world';

export type Dir = 'down' | 'up' | 'left' | 'right';

export interface Crab {
  x: number;
  y: number;
  dir: Dir;
  /** 换向倒计时 */
  timer: number;
  /** 步态动画 */
  step: number;
}

export interface HandheldState {
  area: AreaId;
  /** 玩家脚部中心点（像素坐标） */
  px: number;
  py: number;
  dir: Dir;
  moving: boolean;
  animT: number;
  hp: number;
  maxHp: number;
  /** 已收集的碎片名 */
  shards: string[];
  leverOn: boolean;
  /** 每个 NPC 已读到的对话序号 */
  npcFlags: Record<string, number>;
  crabs: Crab[];
  /** 区域内的碎片是否已拾取 */
  taken: string[];
  /** 场景提示（下屏） */
  prompt: string;
  /** 对话中的 NPC */
  talking: NpcDef | null;
  talkLine: number;
  /** 结局 */
  over: null | 'win';
  /** 受击无敌时间 */
  invuln: number;
  /** 场景切换淡入淡出 */
  fade: number;
  /** 事件日志（用于下屏滚动） */
  log: string[];
  /** 玩家是否刚被击中（用于画面闪烁） */
  hurtFlash: number;
  /** 随机种子 */
  seed: number;
  /** 统计 */
  steps: number;
}

export const WALK_SPEED = 22; // px/s
export const CRAB_SPEED = 9;
export const DIALOGUE_FADE = 0.18;

export function createState(): HandheldState {
  const s: HandheldState = {
    area: START_SPOT.area,
    px: (START_SPOT.col + 0.5) * TILE,
    py: (START_SPOT.row + 1) * TILE - 1,
    dir: 'down',
    moving: false,
    animT: 0,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    shards: [],
    leverOn: false,
    npcFlags: {},
    crabs: [],
    taken: [],
    prompt: '',
    talking: null,
    talkLine: 0,
    over: null,
    invuln: 0,
    fade: 0,
    log: ['你抵达渡口小镇。灯塔的影子落在海面上。'],
    hurtFlash: 0,
    seed: 20261021,
    steps: 0,
  };
  enterArea(s, s.area, false);
  return s;
}

export function areaOf(state: HandheldState): AreaDef {
  return AREAS[state.area];
}

/** 地图字符查询（越界返回墙）。 */
export function tileAt(area: AreaDef, col: number, row: number): string {
  if (col < 0 || col >= MAP_W || row < 0 || row >= MAP_H) return '#';
  return area.rows[row]![col]!;
}

export function isSolid(ch: string): boolean {
  return ch === '#' || ch === '~' || ch === 'X';
}

export function npcAt(area: AreaId, col: number, row: number): NpcDef | undefined {
  return NPCS.find((n) => n.area === area && n.col === col && n.row === row);
}

function collides(area: AreaDef, x: number, y: number): boolean {
  const hw = 3;
  const top = y - 7;
  const pts: Array<[number, number]> = [
    [x - hw, top],
    [x + hw, top],
    [x - hw, y - 1],
    [x + hw, y - 1],
  ];
  for (const [px, py] of pts) {
    const c = Math.floor(px / TILE);
    const r = Math.floor(py / TILE);
    if (isSolid(tileAt(area, c, r))) return true;
  }
  return false;
}

/** 各区域进入时的落点（避开门牌本身）。 */
const AREA_ENTRY: Record<AreaId, { col: number; row: number }> = {
  town: { col: START_SPOT.col, row: START_SPOT.row },
  cavern: { col: 9, row: 14 },
  lighthouse: { col: 18, row: 14 },
};

/** 从洞窟回到小镇时的落点（洞窟门正上方）。 */
const TOWN_ENTRY_FROM_CAVERN = { col: 8, row: 13 };
/** 从灯塔回到小镇时的落点（灯塔门正下方）。 */
const TOWN_ENTRY_FROM_LIGHTHOUSE = { col: 15, row: 3 };

export function enterArea(
  state: HandheldState,
  areaId: AreaId,
  keepPosition = false,
  entry?: { col: number; row: number },
): void {
  state.area = areaId;
  const def = AREAS[areaId];
  state.crabs = def.crabs.map(([c, r]) => ({
    x: (c + 0.5) * TILE,
    y: (r + 1) * TILE - 1,
    dir: 'down' as Dir,
    timer: 0.6,
    step: 0,
  }));
  if (!keepPosition) {
    // 注意：落点要避开门牌本身，否则玩家一进场就站在门上，按 A 会立刻被弹回上一个区域。
    const spot = entry ?? AREA_ENTRY[areaId];
    state.px = (spot.col + 0.5) * TILE;
    state.py = (spot.row + 1) * TILE - 1;
  }
  state.fade = 0.35;
  const label = `进入 ${def.name}（${def.en}）`;
  if (!state.log.includes(label)) state.log.unshift(label);
}

/** 当前可交互对象。 */
export type InteractKind = 'npc' | 'lever' | 'door' | 'beacon' | 'none';

export interface Interaction {
  kind: InteractKind;
  label: string;
  npc?: NpcDef;
  doorTo?: AreaId;
}

export function currentInteraction(state: HandheldState): Interaction {
  const def = areaOf(state);
  const pc = state.px / TILE;
  const pr = (state.py - 4) / TILE;

  // NPC 采用半径判定（1.6 格），触屏与键盘都更容易对准
  let npc: NpcDef | undefined;
  let bestD = 1.6;
  for (const n of NPCS) {
    if (n.area !== state.area) continue;
    const d = Math.hypot(n.col + 0.5 - pc, n.row + 0.5 - pr);
    if (d < bestD) {
      bestD = d;
      npc = n;
    }
  }
  if (npc) {
    return { kind: 'npc', label: `与 ${npc.name}（${npc.role}）交谈`, npc };
  }

  // 机关 / 门 / 灯芯：查自身格与朝向格
  const c = Math.floor(state.px / TILE);
  const r = Math.floor((state.py - 4) / TILE);
  const frontCol = c + (state.dir === 'left' ? -1 : state.dir === 'right' ? 1 : 0);
  const frontRow = r + (state.dir === 'up' ? -1 : state.dir === 'down' ? 1 : 0);

  for (const [col, row] of [
    [frontCol, frontRow],
    [c, r],
  ] as Array<[number, number]>) {
    const ch = tileAt(def, col, row);
    if (ch === 'L') {
      return { kind: 'lever', label: state.leverOn ? '关闭灯闸' : '扳开灯闸' };
    }
    if (ch === 'D') {
      return { kind: 'door', label: '进入 潮汐洞窟', doorTo: 'cavern' };
    }
    if (ch === 'A') {
      return state.leverOn
        ? { kind: 'door', label: '进入 灯塔顶台', doorTo: 'lighthouse' }
        : { kind: 'none', label: '灯闸未开——先去镇子南边扳开它' };
    }
    if (ch === 'B') {
      return { kind: 'beacon', label: '点亮灯芯' };
    }
  }
  return { kind: 'none', label: '' };
}

/** 移动。dx/dy 为 -1/0/1。 */
export function movePlayer(state: HandheldState, dx: number, dy: number, dt: number): void {
  if (state.over || state.talking) {
    state.moving = false;
    return;
  }
  if (dx === 0 && dy === 0) {
    state.moving = false;
    return;
  }
  state.dir = dx < 0 ? 'left' : dx > 0 ? 'right' : dy < 0 ? 'up' : 'down';
  const def = areaOf(state);
  const step = WALK_SPEED * dt;

  if (dx !== 0) {
    const nx = state.px + dx * step;
    if (!collides(def, nx, state.py)) state.px = nx;
  }
  if (dy !== 0) {
    const ny = state.py + dy * step;
    if (!collides(def, state.px, ny)) state.py = ny;
  }
  state.moving = true;
  state.animT += dt;
  state.steps += step / TILE;
}

/** 推进世界一步。 */
export function stepHandheld(state: HandheldState, dt: number): void {
  if (state.over) return;
  if (state.fade > 0) state.fade = Math.max(0, state.fade - dt);
  if (state.invuln > 0) state.invuln = Math.max(0, state.invuln - dt);
  if (state.hurtFlash > 0) state.hurtFlash = Math.max(0, state.hurtFlash - dt);

  updateCrabs(state, dt);
  checkPickups(state);
  updatePrompt(state);
}

function updateCrabs(state: HandheldState, dt: number): void {
  const def = areaOf(state);
  for (const crab of state.crabs) {
    crab.timer -= dt;
    if (crab.timer <= 0) {
      const rng = new Rng(state.seed + Math.floor(crab.x * 31 + crab.y * 17) + state.steps);
      const dirs: Dir[] = ['up', 'down', 'left', 'right'];
      crab.dir = rng.pick(dirs);
      crab.timer = rng.range(0.5, 1.6);
    }
    const vx = crab.dir === 'left' ? -1 : crab.dir === 'right' ? 1 : 0;
    const vy = crab.dir === 'up' ? -1 : crab.dir === 'down' ? 1 : 0;
    const nx = crab.x + vx * CRAB_SPEED * dt;
    const ny = crab.y + vy * CRAB_SPEED * dt;
    if (!collides(def, nx, crab.y)) crab.x = nx;
    else crab.timer = 0;
    if (!collides(def, crab.x, ny)) crab.y = ny;
    else crab.timer = 0;
    crab.step += dt * 6;

    // 接触伤害
    if (state.invuln <= 0 && Math.hypot(crab.x - state.px, crab.y - (state.py - 4)) < 7) {
      state.hp -= 1;
      state.invuln = 1.3;
      state.hurtFlash = 0.35;
      state.log.unshift('噬潮蟹撞了你一下。体力 -1。');
      audio.play('hurt');
      // 击退
      const dx = state.px - crab.x;
      const dy = state.py - crab.y;
      const len = Math.hypot(dx, dy) || 1;
      const bx = state.px + (dx / len) * 8;
      const by = state.py + (dy / len) * 8;
      if (!collides(def, bx, by)) {
        state.px = bx;
        state.py = by;
      }
      if (state.hp <= 0) {
        state.hp = 0;
        state.log.unshift('体力耗尽……你在渡口小镇醒来，碎片仍在。');
        state.px = (START_SPOT.col + 0.5) * TILE;
        state.py = (START_SPOT.row + 1) * TILE - 1;
        state.area = START_SPOT.area;
        state.invuln = 1.6;
        enterArea(state, START_SPOT.area, true);
        state.crabs = [];
        audio.play('lose');
      }
    }
  }
}

function checkPickups(state: HandheldState): void {
  for (const spot of SHARD_SPOTS) {
    if (spot.area !== state.area) continue;
    const key = `${spot.area}:${spot.col},${spot.row}`;
    if (state.taken.includes(key)) continue;
    const sx = (spot.col + 0.5) * TILE;
    const sy = (spot.row + 0.7) * TILE;
    if (Math.hypot(state.px - sx, state.py - sy) < 7) {
      state.taken.push(key);
      state.shards.push(spot.name);
      state.log.unshift(`拾取了「${spot.name}」（${state.shards.length}/3）`);
      audio.play('pickup');
    }
  }
}

function updatePrompt(state: HandheldState): void {
  if (state.talking) {
    state.prompt = '';
    return;
  }
  const it = currentInteraction(state);
  state.prompt = it.label;
}

// ─────────────────────────── 交互动作 ───────────────────────────

export type ActionResult = 'none' | 'talk' | 'advance' | 'close' | 'lever' | 'door' | 'locked' | 'end';

export function pressA(state: HandheldState): ActionResult {
  if (state.over) return 'none';
  if (state.talking) {
    const npc = state.talking;
    const idx = state.talkLine;
    if (idx >= npc.lines.length - 1) {
      state.npcFlags[npc.id] = npc.lines.length;
      state.talking = null;
      state.talkLine = 0;
      return 'close';
    }
    state.talkLine = idx + 1;
    return 'advance';
  }

  const it = currentInteraction(state);
  switch (it.kind) {
    case 'npc': {
      const npc = it.npc!;
      const seen = state.npcFlags[npc.id] ?? 0;
      state.talking = npc;
      state.talkLine = Math.min(seen, npc.lines.length - 1);
      state.npcFlags[npc.id] = state.talkLine;
      audio.play('select');
      return 'talk';
    }
    case 'lever': {
      state.leverOn = !state.leverOn;
      state.log.unshift(state.leverOn ? '灯闸扳开了。灯塔门应该已经能进。' : '灯闸合上了。');
      audio.play(state.leverOn ? 'levelup' : 'place');
      return 'lever';
    }
    case 'door': {
      if (it.doorTo) {
        // 回到小镇时从对应的门口出来，而不是回到出生点
        const entry =
          it.doorTo === 'town' && state.area === 'cavern'
            ? TOWN_ENTRY_FROM_CAVERN
            : it.doorTo === 'town' && state.area === 'lighthouse'
              ? TOWN_ENTRY_FROM_LIGHTHOUSE
              : undefined;
        enterArea(state, it.doorTo, false, entry);
        audio.play('place');
        return 'door';
      }
      return 'none';
    }
    case 'beacon': {
      if (state.shards.length >= 3) {
        state.over = 'win';
        audio.play('win');
        return 'end';
      }
      state.log.unshift(`灯芯还差一点：还需要 ${3 - state.shards.length} 枚回声碎片。`);
      audio.play('alarm');
      return 'none';
    }
    default:
      return 'none';
  }
}

export function pressB(state: HandheldState): ActionResult {
  if (state.talking) {
    const npc = state.talking;
    state.npcFlags[npc.id] = npc.lines.length;
    state.talking = null;
    state.talkLine = 0;
    return 'close';
  }
  return 'none';
}

// ─────────────────────────── 存读档 ───────────────────────────

export interface HandheldSave {
  v: 1;
  area: AreaId;
  px: number;
  py: number;
  hp: number;
  shards: string[];
  leverOn: boolean;
  npcFlags: Record<string, number>;
  taken: string[];
  savedAt: number;
}

export function serializeHandheld(state: HandheldState): HandheldSave {
  return {
    v: 1,
    area: state.area,
    px: state.px,
    py: state.py,
    hp: state.hp,
    shards: [...state.shards],
    leverOn: state.leverOn,
    npcFlags: { ...state.npcFlags },
    taken: [...state.taken],
    savedAt: Date.now(),
  };
}

export function deserializeHandheld(save: HandheldSave): HandheldState {
  const state = createState();
  state.area = save.area;
  state.px = save.px;
  state.py = save.py;
  state.hp = save.hp;
  state.shards = [...save.shards];
  state.leverOn = save.leverOn;
  state.npcFlags = { ...save.npcFlags };
  state.taken = [...save.taken];
  enterArea(state, save.area, true);
  state.fade = 0.2;
  return state;
}

export { BEACON_SPOT, LEVER_SPOT, SHARD_SPOTS };
