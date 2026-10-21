/**
 * 可观测运行状态 —— 供自动化验收（13-qa-curation）与调试使用。
 *
 * 约定（13 的验收脚本按以下约定探测）：
 *   - window 上**只暴露一个** `__` 前缀的全局对象，且它带有**字符串** `state` 字段；
 *   - 全局名取 `__eraGame`（13 的已知调试句柄之一），保证验收脚本命中确定对象，
 *     而不是退回到「扫描第一个 `__` 全局」的模糊匹配；
 *   - `state` 取值使用语义化英文（idle / countdown / playing / paused / results / solved …）；
 *   - `score` 为数值型分数；
 *   - `player` 为含数值字段的对象（节奏游戏为轨道 / 按键计数，解谜为坐标）；
 *   - 验收脚本通过比较这些字段的**前后差异**来判断按键是否真的驱动了游戏。
 *
 * 这些字段只读地反映真实运行状态，不参与游戏逻辑，也不影响可玩性。
 */

const state = {
  /** 当前界面 / 玩法状态 */
  state: 'idle',
  /** 作品内路由 */
  route: '/',
  /** 当前关卡 / 曲目 id */
  chapter: null,
  /** 分数（节奏游戏） */
  score: 0,
  /** 连击（节奏游戏） */
  combo: 0,
  /** 玩家 / 光标状态 */
  player: { x: 0, y: 0, lane: -1, presses: 0 },
  /** 附加信息（关卡通过状态等） */
  extra: {},
};

let exposed = false;

/** 全局句柄名 —— 与 13-qa-curation 的已知调试句柄列表对齐。 */
export const DEBUG_HANDLE = '__eraGame';

/** 挂到 window 上（只挂一次，避免出现多个 `__` 全局对象）。 */
function expose() {
  if (exposed) return state;
  try {
    window[DEBUG_HANDLE] = state;
    exposed = true;
  } catch {
    /* 极端环境（如严格 CSP）下忽略 */
  }
  return state;
}

/**
 * 发布状态快照。只覆盖传入的字段。
 * @param {Record<string, unknown>} patch
 */
export function publishState(patch) {
  const s = expose();
  for (const [k, v] of Object.entries(patch || {})) {
    s[k] = v;
  }
  return s;
}

/** 读取当前快照的副本。 */
export function getState() {
  return { ...state, player: { ...state.player }, extra: { ...state.extra } };
}
