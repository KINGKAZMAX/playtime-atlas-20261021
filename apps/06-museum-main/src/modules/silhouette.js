/**
 * 展品图形（原创程序化 SVG）
 *
 * 每件展品都有一张独一无二的「展签图形」：由展品 id 决定种子，
 * 在有限的形体词汇中组合出确定性结果。没有第三方素材，也没有任何商标元素。
 */

import { escapeHtml } from '../core/format.js';

/*
 * 展签图形画的是「实物」：浅色机身 + 深色屏幕。
 * 这两个值来自令牌层（--art-paper / --art-ink），与美术包同一套色阶；
 * 它们刻意不跟随主题反转——真实机器就是浅色机身。
 */
const INK = 'var(--art-ink)';
const PAPER = 'var(--art-paper)';

const SHAPES = {
  console: `<rect x="16" y="54" width="88" height="34" rx="9" fill="${PAPER}" opacity="0.92"/><rect x="28" y="66" width="24" height="6" rx="3" fill="${INK}"/><circle cx="84" cy="69" r="5.5" fill="var(--era-accent)"/><rect x="94" y="63" width="8" height="11" rx="3" fill="${PAPER}" opacity="0.5"/>`,
  cabinet: `<path d="M42 18 h36 l8 25 v54 a8 8 0 0 1 -8 8 h-36 a8 8 0 0 1 -8 -8 v-54 z" fill="${PAPER}" opacity="0.92"/><rect x="44" y="30" width="32" height="24" rx="5" fill="${INK}"/><circle cx="60" cy="42" r="5" fill="var(--era-accent)"/><rect x="42" y="66" width="36" height="6" rx="3" fill="${INK}" opacity="0.65"/><rect x="48" y="79" width="24" height="6" rx="3" fill="${INK}" opacity="0.4"/>`,
  handheld: `<rect x="36" y="22" width="48" height="76" rx="12" fill="${PAPER}" opacity="0.92"/><rect x="44" y="30" width="32" height="32" rx="4" fill="${INK}"/><circle cx="52" cy="76" r="5.5" fill="${INK}" opacity="0.55"/><circle cx="68" cy="76" r="5.5" fill="${INK}" opacity="0.55"/><rect x="58" y="68" width="5" height="15" rx="2.5" fill="var(--era-accent)"/>`,
  computer: `<rect x="20" y="30" width="80" height="42" rx="6" fill="${PAPER}" opacity="0.92"/><rect x="28" y="38" width="64" height="26" rx="3" fill="${INK}"/><rect x="42" y="78" width="36" height="9" rx="4" fill="${PAPER}" opacity="0.65"/><rect x="32" y="92" width="56" height="7" rx="3.5" fill="${PAPER}" opacity="0.4"/><circle cx="88" cy="38" r="3" fill="var(--era-accent)"/>`,
  rack: `<rect x="28" y="14" width="64" height="92" rx="7" fill="${PAPER}" opacity="0.92"/><g fill="${INK}" opacity="0.5"><rect x="36" y="24" width="48" height="9" rx="3"/><rect x="36" y="40" width="48" height="9" rx="3"/><rect x="36" y="56" width="48" height="9" rx="3"/><rect x="36" y="72" width="48" height="9" rx="3"/><rect x="36" y="88" width="48" height="9" rx="3"/></g><circle cx="78" cy="29" r="2.4" fill="var(--era-accent)"/><circle cx="78" cy="61" r="2.4" fill="var(--era-accent)"/>`,
  monitor: `<rect x="18" y="26" width="84" height="58" rx="8" fill="${PAPER}" opacity="0.92"/><rect x="27" y="35" width="66" height="40" rx="4" fill="${INK}"/><path d="M35 62 L48 49 L58 59 L69 45 L85 60" fill="none" stroke="var(--era-accent)" stroke-width="2.4" stroke-linecap="round"/><rect x="44" y="88" width="32" height="7" rx="3.5" fill="${PAPER}" opacity="0.55"/><rect x="34" y="99" width="52" height="7" rx="3.5" fill="${PAPER}" opacity="0.35"/>`,
  terminal: `<rect x="22" y="22" width="76" height="56" rx="7" fill="${PAPER}" opacity="0.92"/><rect x="31" y="31" width="58" height="36" rx="3" fill="${INK}"/><g fill="var(--era-accent)" opacity="0.85"><rect x="36" y="37" width="24" height="3.2" rx="1.6"/><rect x="36" y="45" width="38" height="3.2" rx="1.6"/><rect x="36" y="53" width="16" height="3.2" rx="1.6"/></g><rect x="34" y="85" width="52" height="8" rx="4" fill="${PAPER}" opacity="0.5"/>`,
  disc: `<circle cx="60" cy="60" r="40" fill="${PAPER}" opacity="0.92"/><circle cx="60" cy="60" r="25" fill="none" stroke="${INK}" stroke-width="1.3" opacity="0.18"/><circle cx="60" cy="60" r="11" fill="${INK}" opacity="0.22"/><path d="M60 20 A40 40 0 0 1 94 43 L60 43 Z" fill="var(--era-accent)" opacity="0.6"/>`,
  cartridge: `<path d="M32 28 h56 v54 a10 10 0 0 1 -10 10 h-36 a10 10 0 0 1 -10 -10 z" fill="${PAPER}" opacity="0.92"/><rect x="40" y="38" width="40" height="28" rx="4" fill="${INK}" opacity="0.85"/><rect x="40" y="72" width="40" height="5" rx="2.5" fill="${INK}" opacity="0.38"/><rect x="40" y="82" width="24" height="5" rx="2.5" fill="var(--era-accent)" opacity="0.7"/>`,
  chip: `<rect x="30" y="30" width="60" height="60" rx="9" fill="${PAPER}" opacity="0.92"/><rect x="42" y="42" width="36" height="36" rx="5" fill="${INK}" opacity="0.85"/><g stroke="${PAPER}" stroke-width="2.6" opacity="0.85">${[0, 1, 2, 3, 4, 5].map((i) => `<line x1="${36 + i * 8}" y1="30" x2="${36 + i * 8}" y2="21"/><line x1="${36 + i * 8}" y1="90" x2="${36 + i * 8}" y2="99"/><line x1="30" y1="${36 + i * 8}" x2="21" y2="${36 + i * 8}"/><line x1="90" y1="${36 + i * 8}" x2="99" y2="${36 + i * 8}"/>`).join('')}</g><circle cx="60" cy="60" r="6" fill="var(--era-accent)"/>`,
  vr: `<rect x="20" y="40" width="80" height="38" rx="17" fill="${PAPER}" opacity="0.92"/><rect x="30" y="49" width="28" height="20" rx="7" fill="${INK}" opacity="0.85"/><rect x="62" y="49" width="28" height="20" rx="7" fill="${INK}" opacity="0.85"/><circle cx="44" cy="59" r="5.5" fill="var(--era-accent)"/><circle cx="76" cy="59" r="5.5" fill="var(--era-accent)"/>`,
  server: `<rect x="20" y="28" width="80" height="68" rx="8" fill="${PAPER}" opacity="0.92"/><g fill="${INK}" opacity="0.45"><rect x="30" y="38" width="60" height="11" rx="3"/><rect x="30" y="55" width="60" height="11" rx="3"/><rect x="30" y="72" width="60" height="11" rx="3"/></g><circle cx="82" cy="43" r="2.8" fill="var(--era-accent)"/><circle cx="82" cy="60" r="2.8" fill="var(--era-accent)"/><circle cx="82" cy="77" r="2.8" fill="var(--era-accent)" opacity="0.4"/>`,
  paper: `<path d="M32 20 h32 l24 24 v56 a6 6 0 0 1 -6 6 h-50 a6 6 0 0 1 -6 -6 v-74 a6 6 0 0 1 6 -6 z" fill="${PAPER}" opacity="0.92"/><path d="M64 20 v24 h24" fill="none" stroke="${INK}" stroke-width="1.5" opacity="0.3"/><g fill="${INK}" opacity="0.26"><rect x="40" y="56" width="40" height="4" rx="2"/><rect x="40" y="66" width="40" height="4" rx="2"/><rect x="40" y="76" width="24" height="4" rx="2"/></g><circle cx="84" cy="86" r="8" fill="var(--era-accent)" opacity="0.75"/>`,
  phone: `<rect x="42" y="16" width="36" height="88" rx="10" fill="${PAPER}" opacity="0.92"/><rect x="48" y="26" width="24" height="42" rx="3" fill="${INK}" opacity="0.85"/><circle cx="60" cy="82" r="5.5" fill="${INK}" opacity="0.32"/><circle cx="60" cy="82" r="2.6" fill="var(--era-accent)"/>`,
  screen: `<rect x="14" y="28" width="92" height="58" rx="8" fill="${PAPER}" opacity="0.92"/><rect x="23" y="37" width="74" height="40" rx="4" fill="${INK}"/><g fill="var(--era-accent)" opacity="0.9"><rect x="31" y="45" width="9" height="9"/><rect x="44" y="45" width="9" height="9"/><rect x="57" y="45" width="9" height="9"/><rect x="31" y="58" width="9" height="9"/></g><g fill="${PAPER}" opacity="0.4"><rect x="70" y="45" width="8" height="9"/><rect x="82" y="45" width="8" height="9"/><rect x="44" y="58" width="9" height="9"/><rect x="57" y="58" width="9" height="9"/><rect x="70" y="58" width="8" height="9"/><rect x="82" y="58" width="8" height="9"/></g><rect x="42" y="94" width="36" height="6" rx="3" fill="${PAPER}" opacity="0.45"/>`,
};

const GAME_SHAPES = ['screen', 'cartridge', 'disc', 'paper', 'console'];
const HW_SHAPES = ['console', 'cabinet', 'handheld', 'computer', 'rack', 'monitor', 'terminal', 'chip', 'vr', 'server'];
const PLATFORM_SHAPES = ['server', 'network', 'disc'];

/** 简易确定性哈希 → 32 位种子 */
function hashCode(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 为一件展品挑选形体 */
export function pickShape(exhibit) {
  if (exhibit.art && SHAPES[exhibit.art]) return exhibit.art;
  const pools = {
    game: GAME_SHAPES,
    hardware: HW_SHAPES,
    platform: PLATFORM_SHAPES,
  };
  const pool = pools[exhibit.kind] ?? GAME_SHAPES;
  const r = mulberry(hashCode(exhibit.id));
  return pool[Math.floor(r() * pool.length) % pool.length];
}

/**
 * 生成展签图形（内联 SVG）
 *
 * 性能说明：馆藏有 200+ 件展品，若每张卡片都内联一份完整图形，
 * 一次重绘会产生 6000+ 个 DOM 节点，检索时主线程要忙 400ms 左右。
 * 因此所有形体只定义一次（`<symbol>` 精灵图），卡片里只放一个 `<use>` 引用，
 * 每张卡片降到 2 个节点，重绘成本显著下降。
 *
 * @param {object} exhibit
 * @param {{variant?: 'card'|'hero'}} options
 */
export function exhibitArt(exhibit, options = {}) {
  const { variant = 'card' } = options;
  const shape = pickShape(exhibit);
  const r = mulberry(hashCode(exhibit.id + shape));
  const cx = (10 + r() * 100).toFixed(0);
  const cy = (10 + r() * 100).toFixed(0);
  const label = `${exhibit.title} 展签图形`;
  return `<svg class="exhibit-art exhibit-art--${variant}" viewBox="0 0 120 120" role="img" aria-label="${escapeHtml(label)}" focusable="false">`
    + `<circle cx="${cx}" cy="${cy}" r="1.8" fill="var(--era-accent)" opacity="0.5"/>`
    + `<use href="#shape-${shape}"/></svg>`;
}

/**
 * 形体精灵图：整页只注入一次，供所有卡片通过 `<use>` 引用。
 */
export function spriteMarkup() {
  const symbols = Object.entries(SHAPES)
    .map(([name, body]) => `<symbol id="shape-${name}" viewBox="0 0 120 120">${body}</symbol>`)
    .join('');
  return `<svg class="art-sprite" aria-hidden="true" focusable="false" width="0" height="0">${symbols}</svg>`;
}
