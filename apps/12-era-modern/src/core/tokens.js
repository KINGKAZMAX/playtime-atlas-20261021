/**
 * 读取当前生效的设计系统令牌。
 *
 * Canvas 2D 与 Three.js 无法直接使用 CSS 变量，必须在运行时取值，
 * 否则程序化绘制会与页面外壳脱色。
 *
 * 用法：
 *   const accent = readToken('--ds-accent', '#b4432b');
 */

/**
 * 读取一个 CSS 自定义属性的当前值。
 * @param {string} name 形如 `--ds-accent`
 * @param {string} [fallback] 取不到时的兜底值
 * @returns {string}
 */
export function readToken(name, fallback = '') {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  try {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  } catch {
    return fallback;
  }
}

/**
 * 读取一个字体栈令牌（`--ds-font-display` / `--ds-font-mono`），
 * 返回可直接拼进 Canvas 2D `ctx.font` 简写的字体族列表。
 *
 * 注意两点：
 * 1. CSS 自定义属性的声明常跨行书写，`getPropertyValue` 会原样保留换行与缩进，
 *    Canvas 的 font 简写解析器对空白敏感，故此处做空白归一化。
 * 2. 本函数只读**根元素**上的令牌。字体令牌不随主题（浅色 / 深色）变化，
 *    因此不需要按作用域分别读取。
 *
 * @param {string} name 形如 `--ds-font-mono`
 * @param {string} [fallback] 取不到时的兜底字体族
 * @returns {string} 例：`'Space Mono', ui-monospace, monospace`
 */
export function readFontStack(name, fallback = 'sans-serif') {
  const raw = readToken(name, '');
  if (!raw) return fallback;
  const stack = raw.replace(/\s+/g, ' ').replace(/;+$/, '').trim();
  return stack || fallback;
}

/**
 * 读取一个颜色令牌并转成 `rgba(...)` 形式。
 * 只支持 `#rgb` / `#rrggbb` 两种写法（设计系统令牌目前的取值形式）。
 * @param {string} name
 * @param {number} [alpha]
 * @param {string} [fallback]
 * @returns {string}
 */
export function readTokenRgba(name, alpha = 1, fallback = 'rgba(0,0,0,0)') {
  const raw = readToken(name, '');
  const hex = raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hex) return fallback;
  let r;
  let g;
  let b;
  if (hex[1].length === 3) {
    r = parseInt(hex[1][0] + hex[1][0], 16);
    g = parseInt(hex[1][1] + hex[1][1], 16);
    b = parseInt(hex[1][2] + hex[1][2], 16);
  } else {
    r = parseInt(hex[1].slice(0, 2), 16);
    g = parseInt(hex[1].slice(2, 4), 16);
    b = parseInt(hex[1].slice(4, 6), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
