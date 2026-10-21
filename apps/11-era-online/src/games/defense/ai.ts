/**
 * defense/ai.ts — 对手 AI「灰烬协议 / ASH PROTOCOL」。
 *
 * ⚠️ 重要声明（对应 TASK.md 诚信红线）：
 * 本模块是**完全在本机运行的确定性程序**，不是真人玩家，也没有连接任何服务器。
 * 展厅 UI 中会以常驻徽标明示这一点，AI 的每一个决策也会以状态文本播报。
 *
 * AI 的行为目标：制造第二条压力航道（灰烬航道），迫使玩家在同一片战场上
 * 同时照顾两个方向，并通过"观察玩家状态 → 选择编队 → 倒计时预警 → 发动突击"
 * 的循环，形成可读、可应对的对手感，而不是随机刷怪。
 */

import { audio } from '../../core/audio';
import { Rng } from '../../core/rng';
import { CELL, DIFFICULTIES, ENEMIES, RIFT, TOWERS } from './config';
import { cellCenter } from './sim';
import type { DefenseState, EnemyKind, SpawnItem } from './types';

export interface AshSquadPlan {
  /** 编队成员 */
  items: Array<{ kind: EnemyKind; count: number }>;
  /** 灰烬能量消耗 */
  cost: number;
  /** 意图文案 */
  intent: string;
  /** 战术标签 */
  tag: string;
}

function towerNearRift(state: DefenseState, cells: number): number {
  const rp = cellCenter(RIFT.col, RIFT.row);
  let n = 0;
  for (const t of state.towers) {
    const c = cellCenter(t.col, t.row);
    if (Math.hypot(c.x - rp.x, c.y - rp.y) / CELL <= cells) n++;
  }
  return n;
}

/**
 * 根据当前局面选择一套突击编队。
 * 这是 AI 的"决策"部分——它会读玩家的灯塔耐久、储备和布防密度。
 */
export function planAssault(state: DefenseState): AshSquadPlan {
  const def = DIFFICULTIES[state.difficulty];
  const scale = def.squadScale;
  const hpRatio = state.beaconHp / state.beaconMax;
  const guards = towerNearRift(state, 3.2);
  const rich = state.sigma >= 260;
  const armored = state.towers.filter((t) => t.kind === 'rail' || t.kind === 'cryo').length;

  let plan: AshSquadPlan;

  if (hpRatio <= 0.5) {
    // 玩家灯塔已受损：AI 转为低消耗试探，避免直接终结对局
    plan = {
      items: [
        { kind: 'crawler', count: Math.round(4 * scale) },
        { kind: 'skitter', count: Math.round(2 * scale) },
      ],
      cost: 0,
      intent: '灯塔已受损，灰烬协议转为消耗性试探，暂缓重装投入。',
      tag: '试探',
    };
  } else if (guards >= 3) {
    // 玩家在裂隙附近堆了塔：AI 改用高速单位拉扯
    plan = {
      items: [
        { kind: 'skitter', count: Math.round(9 * scale) },
        { kind: 'crawler', count: Math.round(3 * scale) },
      ],
      cost: 0,
      intent: '检测到裂隙周边密集布防，灰烬协议改用高速渗透编队拉扯你的火力。',
      tag: '渗透',
    };
  } else if (rich && armored >= 2) {
    // 玩家储备充裕且有重火力：AI 上重装，逼迫玩家付出代价
    plan = {
      items: [
        { kind: 'bulwark', count: Math.round(3 * scale) },
        { kind: 'crawler', count: Math.round(7 * scale) },
        { kind: 'wisp', count: Math.round(3 * scale) },
      ],
      cost: 0,
      intent: '判定你储备充裕且重火力就位，灰烬协议正在集结重装突击编队。',
      tag: '重装',
    };
  } else {
    plan = {
      items: [
        { kind: 'crawler', count: Math.round(6 * scale) },
        { kind: 'skitter', count: Math.round(4 * scale) },
      ],
      cost: 0,
      intent: '按基准节奏推进，灰烬协议正在整编常规突击分队。',
      tag: '常规',
    };
  }

  plan.cost = plan.items.reduce(
    (sum, it) => sum + ENEMIES[it.kind].sigma * it.count,
    0,
  );
  return plan;
}

/** AI 状态机推进。 */
export function updateAi(state: DefenseState, dt: number): void {
  if (state.over) return;

  const def = DIFFICULTIES[state.difficulty];
  state.ashRate = def.ashRate;
  state.assaultInterval = def.assaultInterval;

  state.ashPool += state.ashRate * dt;
  state.assaultCountdown -= dt;

  if (state.assaultCountdown > 0) {
    // 临近预警时持续播报意图，让玩家有时间反应
    if (state.assaultCountdown < 6 && state.assaultCountdown > 0) {
      const plan = planAssault(state);
      state.aiIntent = `${plan.tag}编队锁定中 · ${state.assaultCountdown.toFixed(1)}s 后发动突击`;
    }
    return;
  }

  const plan = planAssault(state);
  if (state.ashPool < plan.cost) {
    // 能量不足，继续蓄力
    state.assaultCountdown = 2.5;
    state.aiIntent = `${plan.tag}编队成型中，灰烬能量不足 ${Math.ceil(plan.cost - state.ashPool)}，继续蓄力。`;
    return;
  }

  // 发动突击
  state.ashPool -= plan.cost;
  state.assaultCount++;
  const rng = new Rng(state.seed * 31 + state.assaultCount * 9173);
  const items: SpawnItem[] = [];
  let at = 0.4;
  for (const it of plan.items) {
    for (let i = 0; i < it.count; i++) {
      items.push({ kind: it.kind, at, elite: state.difficulty === 'aggressive' && rng.chance(0.25) });
      at += it.kind === 'skitter' ? 0.26 : it.kind === 'bulwark' ? 0.85 : 0.46;
    }
  }
  items.sort((a, b) => a.at - b.at);
  // 灰烬编队独立计时：从"现在"起算（用灰烬航道自己的时钟）
  const offset = state.ashClock;
  for (const it of items) it.at += offset;
  state.ashQueue.push(...items);

  state.aiIntent = `⚡ ${plan.tag}突击已发动：${plan.items
    .map((i) => `${ENEMIES[i.kind].name}×${i.count}`)
    .join('、')}`;
  state.aiLog.unshift({
    at: Date.now(),
    kind: 'assault',
    text: `[第 ${state.assaultCount} 次突击] ${plan.tag}编队入场`,
  });
  if (state.aiLog.length > 6) state.aiLog.pop();

  audio.play('alarm');
  // 复位倒计时，叠加一点不可预测的抖动
  const jitter = 0.85 + rng.next() * 0.3;
  state.assaultCountdown = def.assaultInterval * jitter;
}

/** AI 面板需要展示的只读快照。 */
export interface AiSnapshot {
  name: string;
  en: string;
  badge: string;
  pool: number;
  poolNext: number;
  countdown: number;
  interval: number;
  intent: string;
  count: number;
  log: Array<{ text: string; kind: string }>;
  difficulty: string;
  towerKinds: string[];
}

export function aiSnapshot(state: DefenseState): AiSnapshot {
  const plan = planAssault(state);
  return {
    name: '灰烬协议',
    en: 'ASH PROTOCOL',
    badge: '本机 AI · 非真人玩家 · 无联网',
    pool: Math.floor(state.ashPool),
    poolNext: Math.floor(plan.cost),
    countdown: Math.max(0, state.assaultCountdown),
    interval: state.assaultInterval,
    intent: state.aiIntent,
    count: state.assaultCount,
    log: state.aiLog.map((e) => ({ text: e.text, kind: e.kind })),
    difficulty: DIFFICULTIES[state.difficulty].name,
    towerKinds: state.towers.map((t) => TOWERS[t.kind].name),
  };
}
