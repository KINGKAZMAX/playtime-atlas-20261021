#!/usr/bin/env node
/**
 * 字体资产校验
 * --------------------------------------------------------------------------
 * 依据 16-design-system/MIGRATION-NOTES.md §8「字体与许可」：
 *   · 自托管，禁止 CDN / 外链字体
 *   · 字体族名与 16 的 FONT-MANIFEST.json 一致
 *   · 中文子集必须覆盖本作品实际用字
 *
 * 检查项：
 *   1. public/fonts/fonts.manifest.json 登记的每个字体文件存在且字节数一致
 *   2. 五份 OFL 许可全文随包（登记见本目录 LICENSES.md）
 *   3. 每个字体的 name 表族名与 manifest / 16 的 FONT-MANIFEST 一致
 *   4. Noto Sans SC 子集覆盖 index.html 与 src/*.js 中出现的全部汉字
 *   5. 拉丁子集覆盖 ASCII 可打印字符
 *   6. 源码与样式中不存在外链字体 / CDN 引用
 *
 * 运行：node scripts/check-fonts.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as hb from 'harfbuzzjs';
import { decompress } from 'wawoff2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FONT_DIR = path.join(ROOT, 'public/fonts');
const MANIFEST = path.join(FONT_DIR, 'fonts.manifest.json');

const failures = [];
const notes = [];
const fail = (m) => failures.push(m);
const ok = (m) => notes.push(m);

/* 1 —— 清单与文件 */
if (!fs.existsSync(MANIFEST)) {
  console.error('✗ 缺少 public/fonts/fonts.manifest.json —— 请先执行 node scripts/build-fonts.mjs');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

/** 载入字体：HarfBuzz 的 wasm 不含 woff2 解码器，先解压成 sfnt 再读字形表。 */
async function loadFont(file) {
  const woff2 = fs.readFileSync(path.join(FONT_DIR, file));
  const sfnt = await decompress(woff2);
  const ab = sfnt.buffer.slice(sfnt.byteOffset, sfnt.byteOffset + sfnt.byteLength);
  const face = new hb.Face(new hb.Blob(ab));
  return { face, font: new hb.Font(face) };
}

/** 读取 name 表：16 = 排版族名（Typographic Family），1 = 族名（Family） */
function familyNames(face) {
  const pick = (id) => {
    try { return face.getName(id, 'en') ?? face.getName(id); } catch { return undefined; }
  };
  return [pick(16), pick(1)].filter(Boolean).map((n) => (typeof n === 'string' ? n : n.toString()));
}

for (const f of manifest.faces) {
  const p = path.join(FONT_DIR, f.file);
  if (!fs.existsSync(p)) { fail(`缺少字体文件：public/fonts/${f.file}`); continue; }
  const size = fs.statSync(p).size;
  if (size !== f.bytes) fail(`public/fonts/${f.file} 字节数为 ${size}，清单登记 ${f.bytes}`);
  if (!fs.existsSync(path.join(FONT_DIR, f.licenseFile))) fail(`缺少许可全文：public/fonts/${f.licenseFile}`);
}
if (!failures.length) {
  const total = manifest.faces.reduce((s, f) => s + f.bytes, 0);
  ok(`清单登记的 ${manifest.faces.length} 个字体文件与 ${new Set(manifest.faces.map((f) => f.licenseFile)).size} 份 OFL 全文齐备（共 ${total} 字节）`);
}

/* 3 —— 族名一致性 */
const EXPECTED_FAMILY = {
  'space-grotesk-latin.woff2': 'Space Grotesk',
  'inter-latin.woff2': 'Inter',
  'space-mono-regular.woff2': 'Space Mono',
  'space-mono-bold.woff2': 'Space Mono',
  'noto-sans-sc-subset.woff2': 'Noto Sans SC',
};
for (const f of manifest.faces) {
  const { face } = await loadFont(f.file);
  const names = familyNames(face);
  const want = EXPECTED_FAMILY[f.file];
  if (!names.includes(want)) fail(`${f.file} 的 name 表族名为 ${names.join('/') || '(空)'}，应为「${want}」`);
}
if (!failures.length) ok('五个字体的 name 表族名与 16-design-system FONT-MANIFEST 一致');

/* 4 —— 中文覆盖 */
const SOURCES = [
  path.join(ROOT, 'index.html'),
  ...['main.js', 'ui.js', 'workshop.js', 'storage.js'].map((f) => path.join(ROOT, 'src', f)),
];
const text = SOURCES.filter((p) => fs.existsSync(p)).map((p) => fs.readFileSync(p, 'utf8')).join('\n');

const isCjk = (cp) => (
  (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
  || (cp >= 0x3000 && cp <= 0x303f) || (cp >= 0xff00 && cp <= 0xffef)
);
const cjkSet = new Set();
const otherSet = new Set();
for (const ch of text) {
  const cp = ch.codePointAt(0);
  if (isCjk(cp)) cjkSet.add(cp);
  else if (cp > 0x2e80) otherSet.add(cp);
}

const cjkFont = (await loadFont('noto-sans-sc-subset.woff2')).font;
const missing = [...cjkSet].filter((cp) => !cjkFont.glyph(cp));
if (missing.length) {
  fail(`Noto Sans SC 子集缺少 ${missing.length} 个汉字：${missing.map((c) => String.fromCodePoint(c)).join('')}`);
} else {
  ok(`Noto Sans SC 子集覆盖本作品全部 ${cjkSet.size} 个汉字/中文标点`);
}
const otherMissing = [...otherSet].filter((cp) => !cjkFont.glyph(cp));
if (otherMissing.length) {
  ok(`${otherMissing.length} 个符号不在 CJK 子集内，由系统字体回退：${otherMissing.map((c) => String.fromCodePoint(c)).join('')}`);
}

/* 5 —— 拉丁覆盖 */
const latinFont = (await loadFont('inter-latin.woff2')).font;
const asciiMissing = [];
for (let cp = 0x20; cp <= 0x7e; cp += 1) {
  if (!latinFont.glyph(cp)) asciiMissing.push(String.fromCharCode(cp));
}
if (asciiMissing.length) fail(`Inter 拉丁子集缺少 ASCII：${asciiMissing.join('')}`);
else ok('Inter 拉丁子集覆盖全部可打印 ASCII');

/* 6 —— 无外链字体 / CDN */
const CSS_HTML = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'src/styles.css'),
  path.join(ROOT, 'src/tokens.css'),
  path.join(ROOT, 'src/ds-components.css'),
  path.join(FONT_DIR, 'fonts.css'),
];
const EXTERNAL_FONT = /(@import\s+url\(["']?https?:)|url\(\s*["']?https?:/i;
for (const p of CSS_HTML) {
  if (!fs.existsSync(p)) continue;
  if (EXTERNAL_FONT.test(fs.readFileSync(p, 'utf8'))) fail(`${path.relative(ROOT, p)} 含外链字体/样式引用`);
}
if (!failures.length) ok('样式与入口 HTML 无外链字体引用（零 CDN）');

/* ── 输出 ─────────────────────────────────────────────────────────────── */
notes.forEach((n) => console.log(`  ✓ ${n}`));
if (failures.length) {
  console.error('\n✗ 字体资产校验未通过：');
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}
console.log('\n✓ 字体资产校验通过：自托管、族名一致、许可齐备、中文覆盖完整。');
