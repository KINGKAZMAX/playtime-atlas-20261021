import { read, write } from './store.js';
import { bus } from './bus.js';

const KEY = 'settings';

const DEFAULTS = {
  /** 静音（全局） */
  muted: false,
  /** 视觉节拍模式：完全不使用音频，以视觉替代节拍信息 */
  visualPulse: false,
  /** 减少动效：以平滑过渡替代闪烁/位移 */
  reducedMotion: false,
  /** 高对比：提高前景与背景对比度 */
  highContrast: false,
  /** 判定校准偏移（毫秒，正=判定窗后移） */
  offsetMs: 0,
  /** 显示帧率 */
  showFps: false,
};

let state = { ...DEFAULTS, ...(read(KEY, {}) || {}) };
if (typeof state.offsetMs !== 'number' || !Number.isFinite(state.offsetMs)) {
  state.offsetMs = 0;
}
state.offsetMs = Math.max(-200, Math.min(200, Math.round(state.offsetMs)));

export function getSettings() {
  return { ...state };
}

export function setSetting(key, value) {
  if (!(key in DEFAULTS)) return;
  const next = { ...state, [key]: value };
  if (next.offsetMs !== state.offsetMs) {
    next.offsetMs = Math.max(-200, Math.min(200, Math.round(Number(next.offsetMs) || 0)));
  }
  const changed = Object.keys(next).filter((k) => next[k] !== state[k]);
  if (!changed.length) return;
  state = next;
  write(KEY, state);
  changed.forEach((k) => bus.emit(`settings:${k}`, state[k]));
  bus.emit('settings:change', getSettings());
}

export function resetSettings() {
  state = { ...DEFAULTS };
  write(KEY, state);
  bus.emit('settings:change', getSettings());
  Object.keys(DEFAULTS).forEach((k) => bus.emit(`settings:${k}`, state[k]));
}

/** 把设置映射到 <html> 上的 data 属性，供 CSS 做主题化。 */
export function applySettingsToDocument(settings = getSettings()) {
  const root = document.documentElement;
  root.dataset.muted = String(settings.muted);
  root.dataset.visualPulse = String(settings.visualPulse);
  root.dataset.reducedMotion = String(settings.reducedMotion);
  // 减少动效：改用设计系统自带的**强制降级开关** `[data-rm="reduce"]`。
  // 该开关的完整降级（时长归 1ms、入场位移与模糊归零、导航轴景深模糊归零）
  // 由 16-design-system/src/components.css 实现，本目录不另写一份
  // !important 规则去覆盖组件类（MIGRATION-NOTES §7 / 派单 G.4）。
  if (settings.reducedMotion) root.setAttribute('data-rm', 'reduce');
  else root.removeAttribute('data-rm');
  root.dataset.highContrast = String(settings.highContrast);
}
