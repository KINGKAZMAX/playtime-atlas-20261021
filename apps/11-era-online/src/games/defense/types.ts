/** defense/types.ts — 《灯塔协议》类型定义。 */

export type TowerKind = 'pulse' | 'cryo' | 'rail' | 'reso';
export type EnemyKind = 'crawler' | 'skitter' | 'bulwark' | 'wisp' | 'annihilator';
export type Lane = 'main' | 'ash';
export type Difficulty = 'cautious' | 'standard' | 'aggressive';
export type TargetMode = 'first' | 'strong' | 'close';

export type CellKind = 'build' | 'main' | 'ash' | 'beacon' | 'rock' | 'rift';

export interface TowerLevelStat {
  damage: number;
  /** 每秒发射次数 */
  rate: number;
  /** 射程（格） */
  range: number;
  /** 溅射半径（格），0 表示单体 */
  splash: number;
  /** 减速比例 0–1 */
  slow: number;
  /** 减速持续秒数 */
  slowDur: number;
  /** 连锁目标数 */
  chain: number;
  /** 相邻友方增伤比例 */
  aura: number;
}

export interface TowerDef {
  kind: TowerKind;
  name: string;
  en: string;
  role: string;
  cost: number;
  /** 升到 2 级的开销 */
  up2: { sigma: number; flux: number };
  /** 升到 3 级的开销 */
  up3: { sigma: number; flux: number };
  levels: [TowerLevelStat, TowerLevelStat, TowerLevelStat];
  color: string;
  accent: string;
}

export interface EnemyDef {
  kind: EnemyKind;
  name: string;
  hp: number;
  /** 格/秒 */
  speed: number;
  /** 到达终点时对灯塔造成的伤害 */
  leak: number;
  /** 固定减伤 */
  armor: number;
  /** 减速抗性 0–1 */
  slowResist: number;
  sigma: number;
  radius: number;
  color: string;
  shape: 'blob' | 'dart' | 'block' | 'flame' | 'boss';
}

export interface Tower {
  id: number;
  kind: TowerKind;
  col: number;
  row: number;
  level: number;
  cooldown: number;
  kills: number;
  /** 累计投入，用于出售返还 */
  invested: number;
  /** 索敌模式（玩家可切换） */
  mode: TargetMode;
  /** 上次开火角度，用于绘制炮口 */
  aim: number;
  pulse: number;
}

export interface Enemy {
  id: number;
  kind: EnemyKind;
  lane: Lane;
  /** 沿路径的进度（格） */
  t: number;
  hp: number;
  maxHp: number;
  /** 精英强化的移速系数（1 表示普通） */
  speedMul: number;
  /** 减速剩余时间 */
  slowT: number;
  slowFactor: number;
  /** 受击闪白剩余时间 */
  flash: number;
  /** 死亡动画剩余时间 */
  dying: number;
  alive: boolean;
  /** 已造成的伤害累计（用于结算） */
  damageTaken: number;
}

export interface SpawnItem {
  kind: EnemyKind;
  /** 相对本波开始的延迟（秒） */
  at: number;
  /** 该组是否精英强化 */
  elite: boolean;
}

export interface WaveDef {
  index: number;
  items: SpawnItem[];
  elite: boolean;
  boss: boolean;
  label: string;
}

export interface FloatText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

export interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Beam {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  life: number;
  color: string;
  width: number;
}

export interface AiEvent {
  at: number;
  kind: 'assault' | 'intel' | 'sustain';
  text: string;
}

export interface DefenseState {
  wave: number;
  /** 当前波次进行中 */
  inWave: boolean;
  /** 下一波开始的倒计时（秒） */
  prepTimer: number;
  sigma: number;
  flux: number;
  fluxMax: number;
  beaconHp: number;
  beaconMax: number;
  towers: Tower[];
  enemies: Enemy[];
  /** 已生成但还未出场的敌人（按时间排好） */
  queue: SpawnItem[];
  /** 灰烬 AI 侧的待出场突袭编队 */
  ashQueue: SpawnItem[];
  /** 灰烬裂隙的冲击闪光计时 */
  riftFlash: number;
  waveClock: number;
  /**
   * 灰烬航道独立时钟。
   * 灰烬 AI 在自己的时间线上发动突击，不受玩家波次状态影响：
   * 否则在「准备阶段」（inWave=false）waveClock 不推进，AI 明明宣布突击，
   * 编队却迟迟不出现在场上。
   */
  ashClock: number;
  difficulty: Difficulty;
  speed: number;
  paused: boolean;
  over: null | 'win' | 'lose';
  /** 灰烬 AI 状态 */
  ashPool: number;
  ashRate: number;
  assaultCountdown: number;
  assaultInterval: number;
  assaultCount: number;
  aiIntent: string;
  aiLog: AiEvent[];
  /** 下一波预告 */
  preview: WaveDef;
  nextId: number;
  seed: number;
  /** 统计 */
  stats: {
    killed: number;
    leaked: number;
    built: number;
    upgrades: number;
    sigmaEarned: number;
    startedAt: number;
  };
  floaters: FloatText[];
  sparks: Spark[];
  beams: Beam[];
  /** 玩家选中的格子 */
  cursor: { col: number; row: number };
  /** 玩家当前选中的塔种（建造模式） */
  buildKind: TowerKind | null;
  /** 玩家选中的已有塔 */
  selectedTower: number | null;
  /** 目标索敌模式 */
  targetMode: TargetMode;
  /** 胜利后的胜利统计用 */
  banner: string;
  bannerT: number;
}
