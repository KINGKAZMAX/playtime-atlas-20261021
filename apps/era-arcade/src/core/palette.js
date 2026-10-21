/**
 * 霓虹街廊 · 街机可玩展厅
 * src/core/palette.js — 全站统一配色
 *
 * 原创配色方案：以「靛蓝夜幕 + 品红霓虹 + 电离青」为主轴，
 * 辅以琥珀警示与绯红危险色。与任何商业街机品牌的视觉识别无关。
 */

export const PAL = {
  // 底色
  voidDeep: '#07031a',
  voidMid: '#0d0626',
  voidLite: '#150b36',
  wall: '#1a0f42',
  wallEdge: '#2a1a5e',
  grid: '#241356',

  // 霓虹主色
  magenta: '#ff2e88',
  magentaSoft: '#ff7ab5',
  cyan: '#26e6ff',
  cyanSoft: '#9df3ff',

  // 功能色
  amber: '#ffb347',
  amberSoft: '#ffd79a',
  crimson: '#ff4d5e',
  lime: '#8bff6b',
  violet: '#a56bff',

  // 文字
  text: '#e8f4ff',
  textDim: '#93a6c8',
  textFaint: '#5a6b90',

  // 游戏专用
  crystal: '#7dfcff',
  core: '#ffe27a',
  wisp: '#ff8adf',
  warden: '#ff5f6d',
  echo: '#b58cff',
  meteorA: '#5ce1ff',
  meteorB: '#ffc24d',
  meteorC: '#ff5f7e',
  ship: '#9df3ff',
};

/** 亮度调节：把 hex 颜色变亮/变暗，用于霓虹辉光与阴影 */
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (amount >= 0) {
    r += (255 - r) * amount;
    g += (255 - g) * amount;
    b += (255 - b) * amount;
  } else {
    const k = 1 + amount;
    r *= k;
    g *= k;
    b *= k;
  }
  const to = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

/** 难度主题：三个档位各自有专属霓虹色 */
export const DIFFICULTY = [
  {
    key: 'dim',
    label: '微光',
    en: 'DIM',
    accent: '#7ad7ff',
    desc: '敌人稀疏、移动迟缓，适合初次探路。',
  },
  {
    key: 'glow',
    label: '辉光',
    en: 'GLOW',
    accent: '#ffb347',
    desc: '标准节奏。游丝巡逻、巡守会追踪你的残响。',
  },
  {
    key: 'blaze',
    label: '灼目',
    en: 'BLAZE',
    accent: '#ff4d5e',
    desc: '高压巡演。巡守更快，相位能量恢复更慢。',
  },
];
