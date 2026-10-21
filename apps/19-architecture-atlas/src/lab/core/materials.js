/**
 * materials.js — 统一材质与色板 / Shared materials & palette
 *
 * 界面 chrome 一律走 16-design-system 的 token（见 src/ui/tokens.css）；
 * 3D 场景内用克制的材质色区分「木 / 石 / 土 / 瓦」四种构造体系。
 *
 * 场景强调色与界面强调色同源：--ds-accent #B4432B（朱砂）。
 */
import * as THREE from 'three';

export const PALETTE = {
  // 界面（与 src/ui/tokens.css 的 --ds-* 对齐，场景内不直接引用 CSS 变量）
  paper: '#FCFBF9',
  paperDeep: '#F2EEE9',
  card: '#F2EEE9',
  ink: '#14110F',
  inkSoft: '#59514B',
  muted: '#6E655E',
  hairline: 'rgba(20,17,15,0.12)',
  // 场景
  timber: '#9A7448',
  timberDark: '#7A5630',
  timberLight: '#B78F5F',
  stone: '#9C978D',
  stoneDark: '#7E7A72',
  earth: '#B08A5F',
  earthDark: '#8E6C46',
  tile: '#5C5F63',
  water: '#8FA9AE',
  accent: '#B4432B',   // 朱砂：选中高亮（= --ds-accent）
  force: '#2E6A5E',   // 青（= --ds-jade）：受力箭头
  react: '#B07A1E',   // 赭（= --ds-warning）：反力
};

const cache = new Map();

/** 取得（或缓存）一个 MeshStandardMaterial。 */
export function mat(name, opts = {}) {
  const key = `${name}|${JSON.stringify(opts)}`;
  if (cache.has(key)) return cache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE[name] || name),
    roughness: opts.roughness ?? 0.82,
    metalness: opts.metalness ?? 0.02,
    flatShading: opts.flatShading ?? false,
    side: opts.side ?? THREE.FrontSide,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    ...opts.extra,
  });
  cache.set(key, m);
  return m;
}

/** 每个模型构建时拿到的一组便捷材质句柄。 */
export function createMaterials() {
  return {
    timber: mat('timber', { roughness: 0.78 }),
    timberDark: mat('timberDark', { roughness: 0.8 }),
    timberLight: mat('timberLight', { roughness: 0.74 }),
    stone: mat('stone', { roughness: 0.92 }),
    stoneDark: mat('stoneDark', { roughness: 0.95 }),
    earth: mat('earth', { roughness: 0.98 }),
    earthDark: mat('earthDark', { roughness: 0.98 }),
    tile: mat('tile', { roughness: 0.7 }),
    water: mat('water', { roughness: 0.22, metalness: 0.05 }),
    accent: mat('accent', { roughness: 0.6 }),
    force: mat('force', { roughness: 0.5 }),
    react: mat('react', { roughness: 0.5 }),
  };
}

/** 选中态高亮材质（描边式：用 emissive + 颜色偏移）。 */
export function makeHighlight() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(PALETTE.accent),
    emissive: new THREE.Color(PALETTE.accent),
    emissiveIntensity: 0.45,
    roughness: 0.5,
    metalness: 0.0,
  });
}
