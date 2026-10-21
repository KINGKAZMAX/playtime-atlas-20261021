#!/usr/bin/env node
/**
 * Extract route paths, color values, font-family declarations and CSS custom
 * properties from a minified frontend bundle (olek.si) for design-token evidence.
 *
 * ⚠️ 用途限定（合规红线）
 *   本脚本产出的是「参考站实测记录」，用于**机制层参考**，例如：
 *     · 该站按底色亮度自动判定 dark/light 并切换前景色；
 *     · 该站只有一个 768px 断点；
 *     · 该站主缓动为 cubic-bezier(0.1,0.1,0,1)。
 *   ❌ 不得直接沿用其色值、字体文件、圆角与阴影数值。
 *   ❌ 不得复用其字体资源：olek.si 的 @font-face 指向其自有字体资产。
 *   设计令牌的**取值由 16-design-system 原创决定**。
 *
 *   输入与输出都限定在隔离目录 research-ref/（见 research-ref/README.md）：
 *   该目录是「参考站观察证据」，**不进入交付物、不随站点发布**。
 *
 * Usage: node scripts/extract_tokens.js research-ref/olek-index.js research-ref
 */
const fs = require('fs');
const path = require('path');

const bundlePath = process.argv[2];
const outDir = process.argv[3] || 'research-ref';
const src = fs.readFileSync(bundlePath, 'utf8');

const uniq = (arr) => [...new Set(arr)].sort();

// 1. Route-like path strings
const routeRe = /path:\s*"([^"]{1,80})"|["'](\/)([a-z0-9][a-z0-9\-_/]{1,60})["']/g;
const routes = [];
let m;
while ((m = routeRe.exec(src)) !== null) {
  const r = m[1] !== undefined ? m[1] : m[2] + m[3];
  if (/^[a-z0-9][a-z0-9\-_/]*$/i.test(r) && r.length > 1) routes.push(r);
}

// 2. Hex colors (normalize to lowercase, expand #abc)
const hexRe = /#([0-9a-fA-F]{3,8})\b/g;
const hexes = [];
while ((m = hexRe.exec(src)) !== null) {
  let h = m[1].toLowerCase();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 6 || h.length === 8) hexes.push('#' + h);
}

// 3. rgb()/rgba() literals
const rgbRe = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/g;
const rgbs = [];
while ((m = rgbRe.exec(src)) !== null) {
  const a = m[4] !== undefined ? m[4] : '1';
  rgbs.push(`rgba(${m[1]}, ${m[2]}, ${m[3]}, ${a})`);
}

// 4. font-family declarations
const ffRe = /fontFamily:\s*"([^"]+)"|font-family:\s*([^;}"']+)/g;
const families = [];
while ((m = ffRe.exec(src)) !== null) families.push((m[1] || m[2]).trim());

// 5. CSS custom properties (design tokens)
const cssVarRe = /--([a-zA-Z0-9-]{2,40})\s*:\s*([^;}"']{1,80})/g;
const cssVars = [];
while ((m = cssVarRe.exec(src)) !== null) {
  cssVars.push({ name: '--' + m[1], value: m[2].trim() });
}

// 6. Numeric-looking animation / transition tokens
const durRe = /duration:\s*([\d.]+)|transitionDuration:\s*"([^"]+)"/g;
const durations = [];
while ((m = durRe.exec(src)) !== null) durations.push(m[1] || m[2]);

// 7. @font-face family names actually declared
const fontFaceRe = /@font-face\s*\{[^}]*?font-family:\s*['"]([^'"]+)['"]/g;
const declaredFonts = [];
while ((m = fontFaceRe.exec(src)) !== null) declaredFonts.push(m[1]);

const out = {
  source: path.basename(bundlePath),
  bytes: src.length,
  extractedAt: new Date().toISOString(),
  routes: uniq(routes).filter((r) => r !== '/'),
  hexColors: uniq(hexes),
  rgbColors: uniq(rgbs),
  fontFamilies: uniq(families),
  declaredFontFaces: uniq(declaredFonts),
  cssCustomProperties: cssVars.slice(0, 400),
  durations: uniq(durations),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'olek-tokens.json'), JSON.stringify(out, null, 2));

console.log('routes        :', out.routes.length, out.routes.slice(0, 40).join(' '));
console.log('hex colors    :', out.hexColors.length, out.hexColors.slice(0, 40).join(' '));
console.log('font families :', out.fontFamilies.slice(0, 20).join(' | '));
console.log('font-face     :', out.declaredFontFaces.join(' | '));
console.log('css vars      :', out.cssCustomProperties.length);
console.log('durations     :', out.durations.slice(0, 20).join(' '));
console.log('-> ' + path.join(outDir, 'olek-tokens.json'));
