/**
 * palette.ts — 展厅统一色板与调色板工具。
 *
 * 「联机曙光」主色板：深靛底 + 曙光橙 + 数据青 + 回声绿。
 * 「口袋回声」掌机子色板：暮港紫青 5 阶。
 * 全部为本展厅原创配色，不取自任何商业品牌视觉。
 */

export const SHELL = {
  void: '#080b16',
  deep: '#0d1224',
  panel: '#141b33',
  panelHi: '#1c2545',
  line: '#2a3558',
  lineSoft: '#1f2946',
  text: '#e7ecf7',
  textDim: '#9aa6c6',
  textFaint: '#6c789b',
  dawn: '#ff8a3d',
  dawnSoft: '#ffb37a',
  data: '#4fd6ff',
  dataSoft: '#a5ecff',
  echo: '#7cf29a',
  warn: '#ffd166',
  danger: '#ff5d73',
  violet: '#a78bfa',
} as const;

/** 掌机「暮港」5 阶色板（暗部 → 亮部），另附灯火青。 */
export const POCKET = {
  d1: '#1a1424',
  d2: '#2f2440',
  d3: '#573f5c',
  d4: '#9a6a74',
  d5: '#e8c3a0',
  lamp: '#7fe3d4',
  lampDim: '#3f8f88',
  ink: '#0d0912',
  glow: '#fff3d6',
} as const;

export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** 在两个 hex 之间线性插值。 */
export function mix(a: string, b: string, t: number): string {
  const pa = a.replace('#', '');
  const pb = b.replace('#', '');
  const k = Math.max(0, Math.min(1, t));
  const ch = (s: string, i: number) => parseInt(s.slice(i, i + 2), 16);
  const r = Math.round(ch(pa, 0) + (ch(pb, 0) - ch(pa, 0)) * k);
  const g = Math.round(ch(pa, 2) + (ch(pb, 2) - ch(pa, 2)) * k);
  const bl = Math.round(ch(pa, 4) + (ch(pb, 4) - ch(pa, 4)) * k);
  return `#${[r, g, bl].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
