/**
 * 回响电玩馆 — 馆内统一材质库
 * 6 件硬件展品共用同一套材质，让整个馆看起来像一次收藏，而不是六次拼凑。
 * 颜色取自 design-tokens.json（深墨蓝 / 暖纸白 / 信号橙）。
 */

export const MATERIALS = {
  'shell-deep': {
    baseColorFactor: [0.027, 0.055, 0.098, 1],
    metallicFactor: 0.1,
    roughnessFactor: 0.72,
  },
  'shell-dark': {
    baseColorFactor: [0.071, 0.133, 0.212, 1],
    metallicFactor: 0.16,
    roughnessFactor: 0.62,
  },
  'shell-mid': {
    baseColorFactor: [0.102, 0.192, 0.286, 1],
    metallicFactor: 0.22,
    roughnessFactor: 0.54,
  },
  'shell-light': {
    baseColorFactor: [0.141, 0.255, 0.369, 1],
    metallicFactor: 0.28,
    roughnessFactor: 0.46,
  },
  cream: {
    baseColorFactor: [0.984, 0.969, 0.937, 1],
    metallicFactor: 0.02,
    roughnessFactor: 0.4,
  },
  'cream-dim': {
    baseColorFactor: [0.906, 0.863, 0.78, 1],
    metallicFactor: 0.02,
    roughnessFactor: 0.56,
  },
  accent: {
    baseColorFactor: [0.941, 0.376, 0.122, 1],
    metallicFactor: 0.05,
    roughnessFactor: 0.42,
  },
  'accent-lit': {
    baseColorFactor: [1, 0.478, 0.2, 1],
    metallicFactor: 0,
    roughnessFactor: 0.28,
    emissiveFactor: [0.62, 0.24, 0.07],
  },
  'screen-glow': {
    baseColorFactor: [0.145, 0.451, 0.396, 1],
    metallicFactor: 0,
    roughnessFactor: 0.34,
    emissiveFactor: [0.055, 0.170, 0.148],
  },
  'screen-glass': {
    baseColorFactor: [0.02, 0.043, 0.075, 1],
    metallicFactor: 0.45,
    roughnessFactor: 0.12,
  },
  'metal': {
    baseColorFactor: [0.576, 0.639, 0.71, 1],
    metallicFactor: 0.92,
    roughnessFactor: 0.3,
  },
  'metal-dark': {
    baseColorFactor: [0.333, 0.392, 0.435, 1],
    metallicFactor: 0.86,
    roughnessFactor: 0.44,
  },
};

export const MATERIAL_NAMES = Object.keys(MATERIALS);
