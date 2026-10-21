/**
 * 回响电玩馆 / PLAYTIME ATLAS — 设计令牌唯一事实来源
 * design-tokens.json / tokens.css / tokens.js 全部由此文件生成。
 */

export const meta = {
  id: 'playtime-atlas',
  title: '回响电玩馆',
  titleLatin: 'PLAYTIME ATLAS',
  subtitle: '电子游戏硬件年代馆',
  version: '1.0.0',
  scheme: '深墨蓝 + 暖纸白 + 信号橙',
  updated: '2026-10-21',
};

export const color = {
  ink: {
    900: '#070E19',
    800: '#0C1726',
    700: '#122236',
    600: '#1A3149',
    500: '#24415E',
    400: '#33567A',
    300: '#4B7096',
    200: '#7A9BB8',
    100: '#AFC4D6',
  },
  paper: {
    50: '#FBF7EF',
    100: '#F3EBDC',
    200: '#E7DCC7',
    300: '#D3C4A8',
    400: '#B9A784',
    500: '#9C8A68',
  },
  signal: {
    700: '#B23A0F',
    600: '#D94A15',
    500: '#F0601F',
    400: '#FF7A33',
    300: '#FF9A5E',
    200: '#FFC08E',
  },
  teal: {
    600: '#2F7A6D',
    500: '#3E9C8B',
    400: '#4FB3A0',
    300: '#7FD0C0',
  },
};

export const semantic = {
  bgBase: color.ink[800],
  bgDeep: color.ink[900],
  bgPanel: color.ink[700],
  bgRaised: color.ink[600],
  bgHairline: color.ink[500],
  textPrimary: color.paper[50],
  textSecondary: color.paper[200],
  textMuted: color.paper[400],
  textOnSignal: color.ink[900],
  accent: color.signal[500],
  accentDeep: color.signal[600],
  accentSoft: color.signal[300],
  positive: color.teal[400],
  hairline: 'rgba(251, 247, 239, 0.14)',
  hairlineStrong: 'rgba(251, 247, 239, 0.28)',
  scrim: 'rgba(7, 14, 25, 0.72)',
};

export const typography = {
  fontFamily: {
    display: "'Space Grotesk', 'Noto Sans SC', -apple-system, system-ui, sans-serif",
    sans: "'Inter', 'Noto Sans SC', -apple-system, system-ui, sans-serif",
    mono: "'Space Mono', 'Noto Sans Mono', ui-monospace, SFMono-Regular, monospace",
    cjk: "'Noto Sans SC', -apple-system, system-ui, sans-serif",
  },
  fontSize: {
    '2xs': '0.6875rem',
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    md: '1.125rem',
    lg: '1.375rem',
    xl: '1.75rem',
    '2xl': '2.25rem',
    '3xl': '3rem',
    '4xl': '4rem',
    '5xl': '5.5rem',
    '6xl': '7rem',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.08,
    snug: 1.28,
    normal: 1.55,
    loose: 1.85,
  },
  letterSpacing: {
    tightest: '-0.032em',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.045em',
    wider: '0.1em',
    widest: '0.2em',
  },
};

export const space = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '24px',
  6: '32px',
  7: '40px',
  8: '48px',
  9: '64px',
  10: '96px',
  11: '128px',
};

export const radius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '14px',
  xl: '22px',
  pill: '999px',
};

export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(7, 14, 25, 0.5)',
  md: '0 6px 18px rgba(7, 14, 25, 0.55)',
  lg: '0 18px 48px rgba(7, 14, 25, 0.62)',
  glow: '0 0 0 1px rgba(240, 96, 31, 0.4), 0 10px 34px rgba(240, 96, 31, 0.28)',
  inner: 'inset 0 1px 0 rgba(251, 247, 239, 0.08)',
};

export const grid = {
  columns: 12,
  gutter: space[5],
  margin: space[6],
  maxWidth: '1360px',
  poster: { width: 1200, height: 1800 },
  cover: { width: 1600, height: 900 },
  modelRender: { width: 1024, height: 1024 },
  icon: { width: 24, height: 24, stroke: 1.5 },
  labelPlate: { width: 520, height: 180 },
};

export const motion = {
  instant: '120ms',
  fast: '180ms',
  base: '260ms',
  slow: '420ms',
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
};

export const z = {
  base: 0,
  raised: 10,
  sticky: 100,
  overlay: 500,
  modal: 800,
  toast: 900,
};

export const tokens = {
  meta,
  color,
  semantic,
  typography,
  space,
  radius,
  shadow,
  grid,
  motion,
  z,
};

export default tokens;
