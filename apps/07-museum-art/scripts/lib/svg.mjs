/**
 * 回响电玩馆 — SVG 构建工具集
 * 纯字符串拼装，无第三方依赖，输出可被 Chromium / rsvg-convert 解析。
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..', '..');
export const ASSETS = path.join(ROOT, 'public', 'assets');

/** XML 转义 */
export function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 属性字符串 */
export function attrs(map = {}) {
  return Object.entries(map)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k}="${typeof v === 'number' ? v : esc(v)}"`)
    .join(' ');
}

/** 读取文件为 data URI */
export function dataUri(file, mime) {
  const buf = readFileSync(file);
  const b64 = buf.toString('base64');
  return `data:${mime};base64,${b64}`;
}

/* ------------------------------------------------------------------ *
 * 字体：把本地子集字体内联为 @font-face，使 SVG 完全自包含
 * ------------------------------------------------------------------ */

const FONT_DIR = path.join(ASSETS, 'fonts');
const FONT_FACE_SOURCES = [
  { family: 'Space Grotesk', file: 'space-grotesk-latin.woff2', weight: '300 700', display: 'swap' },
  { family: 'Inter', file: 'inter-latin.woff2', weight: '100 900', display: 'swap' },
  { family: 'Space Mono', file: 'space-mono-latin.woff2', weight: '400 700', display: 'swap' },
  { family: 'Noto Sans SC', file: 'noto-sans-sc-subset.woff2', weight: '100 900', display: 'swap' },
];

let fontFaceCache = null;

/**
 * 生成内联 @font-face CSS。
 * @param {{subset?:boolean}} [opts] subset=true 时仅嵌入子集（体积极小）
 */
export function inlineFontFaces() {
  if (fontFaceCache) return fontFaceCache;
  const rules = [];
  for (const src of FONT_FACE_SOURCES) {
    const p = path.join(FONT_DIR, src.file);
    if (!existsSync(p)) continue;
    rules.push(
      `@font-face{font-family:'${src.family}';font-style:normal;font-weight:${src.weight};` +
        `font-display:${src.display};src:url('${dataUri(p, 'font/woff2')}') format('woff2');}`,
    );
  }
  fontFaceCache = rules.join('\n');
  return fontFaceCache;
}

/** 字体是否已构建 */
export function fontsReady() {
  return FONT_FACE_SOURCES.every((s) => existsSync(path.join(FONT_DIR, s.file)));
}

/* ------------------------------------------------------------------ *
 * 基础图形
 * ------------------------------------------------------------------ */

export function rect(x, y, w, h, a = {}) {
  return `<rect ${attrs({ x, y, width: w, height: h, ...a })}/>`;
}

export function circle(cx, cy, r, a = {}) {
  return `<circle ${attrs({ cx, cy, r, ...a })}/>`;
}

export function svgPath(d, a = {}) {
  return `<path ${attrs({ d, ...a })}/>`;
}

export function line(x1, y1, x2, y2, a = {}) {
  return `<line ${attrs({ x1, y1, x2, y2, ...a })}/>`;
}

export function polygon(points, a = {}) {
  return `<polygon ${attrs({ points: points.map((p) => p.join(',')).join(' '), ...a })}/>`;
}

export function text(str, x, y, a = {}) {
  const { children, ...rest } = a;
  return `<text ${attrs({ x, y, ...rest })}>${children ?? esc(str)}</text>`;
}

/** 多行文本块，逐行独立定位（避免 foreignObject 依赖） */
export function textLines(lines, x, y, a = {}) {
  const { lineHeight = 1.3, ...rest } = a;
  return lines
    .map((ln, i) => {
      const lx = typeof ln === 'object' && ln.x !== undefined ? ln.x : x;
      const ly = typeof ln === 'object' && ln.y !== undefined ? ln.y : y + i * lineHeight;
      const content = typeof ln === 'object' ? ln.text : ln;
      const opts = typeof ln === 'object' ? { ...rest, ...ln, text: undefined, x: undefined, y: undefined } : rest;
      return `<text ${attrs({ x: lx, y: ly, ...opts })}>${esc(content)}</text>`;
    })
    .join('\n');
}

/** 渐变 */
export function linearGradient(id, stops, o = {}) {
  const s = stops
    .map(
      (st) =>
        `<stop ${attrs({ offset: st.offset, 'stop-color': st.color, 'stop-opacity': st.opacity })}/>`,
    )
    .join('');
  return `<linearGradient ${attrs({ id, x1: o.x1 ?? 0, y1: o.y1 ?? 0, x2: o.x2 ?? 0, y2: o.y2 ?? 1 })}>${s}</linearGradient>`;
}

export function radialGradient(id, stops, o = {}) {
  const s = stops
    .map(
      (st) =>
        `<stop ${attrs({ offset: st.offset, 'stop-color': st.color, 'stop-opacity': st.opacity })}/>`,
    )
    .join('');
  return `<radialGradient ${attrs({ id, cx: o.cx ?? 0.5, cy: o.cy ?? 0.5, r: o.r ?? 0.5 })}>${s}</radialGradient>`;
}

/** 点阵网格图案（装饰用，不承载可读文字） */
export function dotPattern(id, o = {}) {
  const { size = 16, r = 1.6, color = '#FBF7EF', opacity = 0.18, origin = 0 } = o;
  return (
    `<pattern ${attrs({
      id,
      width: size,
      height: size,
      patternUnits: 'userSpaceOnUse',
      x: origin,
      y: origin,
    })}>` +
    circle(size / 2, size / 2, r, { fill: color, opacity }) +
    `</pattern>`
  );
}

/** 细网格线图案 */
export function lineGridPattern(id, o = {}) {
  const { size = 24, color = '#FBF7EF', opacity = 0.08, width = 0.7 } = o;
  return (
    `<pattern ${attrs({ id, width: size, height: size, patternUnits: 'userSpaceOnUse' })}>` +
    `<path d="M ${size} 0 L 0 0 0 ${size}" fill="none" ${attrs({ stroke: color, 'stroke-width': width, opacity })}/>` +
    `</pattern>`
  );
}

/** 半调网点图案（按对角密度模拟印刷） */
export function halftonePattern(id, o = {}) {
  const { size = 12, color = '#0C1726', opacity = 0.2, maxR = 3 } = o;
  return (
    `<pattern ${attrs({ id, width: size, height: size, patternUnits: 'userSpaceOnUse' })}>` +
    circle(size * 0.25, size * 0.25, maxR * 0.7, { fill: color, opacity }) +
    circle(size * 0.75, size * 0.75, maxR, { fill: color, opacity }) +
    `</pattern>`
  );
}

/** 角标（museum-style corner ticks） */
export function cornerTicks(w, h, inset = 28, len = 26, a = {}) {
  const { stroke = '#F0601F', 'stroke-width': sw = 2.5, opacity = 1 } = a;
  const d = [
    `M ${inset} ${inset + len} L ${inset} ${inset} L ${inset + len} ${inset}`,
    `M ${w - inset - len} ${inset} L ${w - inset} ${inset} L ${w - inset} ${inset + len}`,
    `M ${inset} ${h - inset - len} L ${inset} ${h - inset} L ${inset + len} ${h - inset}`,
    `M ${w - inset - len} ${h - inset} L ${w - inset} ${h - inset} L ${w - inset} ${h - inset - len}`,
  ].join(' ');
  return `<path d="${d}" fill="none" ${attrs({ stroke, 'stroke-width': sw, opacity })}/>`;
}

/** 纸张噪点（feTurbulence）——给暖纸白面一点质感 */
export function grainFilter(id, o = {}) {
  const { freq = 0.9, opacity = 0.22, seed = 7 } = o;
  return (
    `<filter ${attrs({ id, x: '0%', y: '0%', width: '100%', height: '100%' })}>` +
    `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>` +
    `<feColorMatrix ${attrs({ in: 'n', type: 'saturate', values: '0' })}/>` +
    `<feComponentTransfer><feFuncA type="linear" slope="${opacity}" intercept="0"/></feComponentTransfer>` +
    `</filter>`
  );
}

/* ------------------------------------------------------------------ *
 * 文档组装
 * ------------------------------------------------------------------ */

export function svgDoc({ w, h, defs = [], body = [], background = null, embedFonts = true }) {
  const style = embedFonts
    ? `<style>${inlineFontFaces()}</style>`
    : '';
  const bg = background ? rect(0, 0, w, h, { fill: background }) : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `${attrs({ width: w, height: h, viewBox: `0 0 ${w} ${h}` })}>` +
    (defs.length ? `<defs>${defs.join('')}</defs>` : '') +
    style +
    bg +
    body.join('\n') +
    `</svg>`
  );
}

/** 写文件并确保目录存在 */
export function writeOut(file, content) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
  return file;
}
