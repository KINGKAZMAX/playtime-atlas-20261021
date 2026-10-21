/**
 * 回响电玩馆 — 资产完整性自动校验
 *
 * 运行：npm run qa
 * 退出码 0 = 全部通过；1 = 存在失败项。
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eras, models } from './lib/catalog.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ASSETS = path.join(ROOT, 'public', 'assets');

let pass = 0;
const failures = [];
const warnings = [];

function ok(msg) {
  pass++;
  console.log(`  ✓ ${msg}`);
}
function fail(msg) {
  failures.push(msg);
  console.log(`  ✗ ${msg}`);
}
function warn(msg) {
  warnings.push(msg);
  console.log(`  ! ${msg}`);
}
function section(t) {
  console.log(`\n· ${t}`);
}

/** 读取 PNG 尺寸（IHDR） */
function pngSize(file) {
  const buf = readFileSync(file);
  if (buf.length < 24) return null;
  const sig = buf.readUInt32BE(0);
  if (sig !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** 校验 GLB 头 */
function glbOk(file) {
  const buf = readFileSync(file);
  if (buf.length < 20) return false;
  if (buf.readUInt32LE(0) !== 0x46546c67) return false; // 'glTF'
  const version = buf.readUInt32LE(4);
  const total = buf.readUInt32LE(8);
  if (version !== 2) return false;
  if (total !== buf.length) return false;
  const chunkLen = buf.readUInt32LE(12);
  const chunkType = buf.readUInt32LE(16);
  if (chunkType !== 0x4e4f534a) return false; // 'JSON'
  const json = JSON.parse(buf.subarray(20, 20 + chunkLen).toString('utf8').replace(/\0+$/, ''));
  return !!(json.meshes && json.meshes.length && json.nodes && json.nodes.length);
}

function mustExist(rel, minBytes = 512) {
  const p = path.join(ASSETS, rel);
  if (!existsSync(p)) return fail(`缺失文件：assets/${rel}`);
  const size = statSync(p).size;
  if (size < minBytes) return fail(`文件过小（${size} B < ${minBytes} B）：assets/${rel}`);
  ok(`${rel}  (${(size / 1024).toFixed(1)} KB)`);
  return true;
}

/* ------------------------------------------------------------------ */
console.log('回响电玩馆 / PLAYTIME ATLAS — 资产完整性校验');
console.log('='.repeat(58));

/* 1. 设计令牌 */
section('1. 设计令牌');
if (existsSync(path.join(ROOT, 'design-tokens.json'))) {
  const t = JSON.parse(readFileSync(path.join(ROOT, 'design-tokens.json'), 'utf8'));
  const flat = (() => {
    const out = [];
    const walk = (o, p = []) => {
      for (const [k, v] of Object.entries(o)) {
        if (v && typeof v === 'object' && !Array.isArray(v)) walk(v, [...p, k]);
        else out.push([...p, k].join('-'));
      }
    };
    walk(t);
    return out;
  })();
  if (flat.length >= 100) ok(`design-tokens.json  ${flat.length} 个令牌`);
  else fail(`design-tokens.json 令牌过少：${flat.length}`);
  for (const sec of ['color', 'typography', 'space', 'radius', 'shadow', 'grid', 'motion', 'z', 'semantic']) {
    if (t[sec]) ok(`令牌分区 ${sec}`);
    else fail(`令牌缺少分区 ${sec}`);
  }
  if (t.color.ink[800] && t.color.paper[50] && t.color.signal[500]) ok('三色体系：墨蓝 / 纸白 / 信号橙');
  else fail('三色体系不完整');
} else {
  fail('缺少 design-tokens.json');
}
for (const f of ['tokens.css', 'tokens.js', 'design-tokens.json', 'assets.manifest.json']) {
  mustExist(f);
}

/* 2. 字体 */
section('2. 字体（自托管 OFL）');
const fontFiles = [
  'fonts/space-grotesk-latin.woff2', 'fonts/inter-latin.woff2',
  'fonts/space-mono-regular.woff2', 'fonts/space-mono-bold.woff2',
  'fonts/noto-sans-sc-subset.woff2',
];
for (const f of fontFiles) mustExist(f, 2048);
mustExist('fonts/fonts.css', 512);
for (const lic of ['OFL-space-grotesk.txt', 'OFL-inter.txt', 'OFL-space-mono-regular.txt', 'OFL-noto-sans-sc.txt']) {
  mustExist(`fonts/${lic}`, 1000);
}

/* 3. 图标 */
section('3. 图标');
const iconDir = path.join(ASSETS, 'icons');
if (existsSync(iconDir)) {
  const svgs = readdirSync(iconDir).filter((f) => /^[a-z0-9-]+\.svg$/.test(f) && f !== 'icons.svg' && f !== 'sheet.svg');
  if (svgs.length === 48) ok(`48 枚独立图标 SVG`);
  else fail(`图标数量异常：${svgs.length}（应为 48）`);
  mustExist('icons/icons.svg', 2048);
  mustExist('icons/index.json', 512);
  const idx = JSON.parse(readFileSync(path.join(iconDir, 'index.json'), 'utf8'));
  if (idx.count === 48) ok('图标索引 count = 48');
  else fail(`图标索引 count = ${idx.count}`);
  const bad = svgs.filter((f) => !readFileSync(path.join(iconDir, f), 'utf8').includes('currentColor'));
  if (bad.length === 0) ok('全部图标使用 currentColor（可换色）');
  else fail(`以下图标未使用 currentColor：${bad.join(', ')}`);
} else {
  fail('缺少 icons 目录');
}

/* 4. 海报 */
section('4. 年代海报');
for (const e of eras) {
  mustExist(`posters/poster-${e.id}.svg`, 20000);
  const png = path.join(ASSETS, 'posters', `poster-${e.id}.png`);
  if (existsSync(png)) {
    const s = pngSize(png);
    if (s && s.w === 1200 && s.h === 1800) ok(`poster-${e.id}.png  1200×1800`);
    else fail(`poster-${e.id}.png 尺寸异常：${s ? `${s.w}×${s.h}` : '无法解析'}`);
  } else {
    fail(`缺失 posters/poster-${e.id}.png`);
  }
}

/* 5. 封面 */
section('5. 封面');
for (const e of eras) {
  mustExist(`covers/cover-${e.id}.svg`, 20000);
  const png = path.join(ASSETS, 'covers', `cover-${e.id}.png`);
  if (existsSync(png)) {
    const s = pngSize(png);
    if (s && s.w === 1600 && s.h === 900) ok(`cover-${e.id}.png  1600×900`);
    else fail(`cover-${e.id}.png 尺寸异常：${s ? `${s.w}×${s.h}` : '无法解析'}`);
  } else {
    fail(`缺失 covers/cover-${e.id}.png`);
  }
}
{
  const png = path.join(ASSETS, 'covers', 'cover-atlas-hero.png');
  if (existsSync(png)) {
    const s = pngSize(png);
    if (s && s.w === 1600 && s.h === 900) ok('cover-atlas-hero.png  1600×900');
    else fail('cover-atlas-hero.png 尺寸异常');
  } else fail('缺失 covers/cover-atlas-hero.png');
}

/* 6. 展柜 */
section('6. 展柜');
for (const m of models) {
  mustExist(`cases/case-${m.id}.svg`, 20000);
  const png = path.join(ASSETS, 'cases', `case-${m.id}.png`);
  if (existsSync(png)) {
    const s = pngSize(png);
    if (s && s.w === 1000 && s.h === 1250) ok(`case-${m.id}.png  1000×1250`);
    else fail(`case-${m.id}.png 尺寸异常：${s ? `${s.w}×${s.h}` : '无法解析'}`);
  } else {
    fail(`缺失 cases/case-${m.id}.png`);
  }
}

/* 7. 3D 模型 */
section('7. 硬件 3D 模型');
for (const m of models) {
  const glb = path.join(ASSETS, 'models', `model-${m.id}.glb`);
  if (!existsSync(glb)) {
    fail(`缺失 models/model-${m.id}.glb`);
    continue;
  }
  if (glbOk(glb)) ok(`model-${m.id}.glb  合法 GLB v2  (${(statSync(glb).size / 1024).toFixed(1)} KB)`);
  else fail(`model-${m.id}.glb 不是合法的 GLB`);

  const meta = JSON.parse(readFileSync(path.join(ASSETS, 'models', `model-${m.id}.json`), 'utf8'));
  if (meta.partCount > 1) ok(`model-${m.id}  部件 ${meta.partCount} 个`);
  else fail(`model-${m.id} 部件数不足：${meta.partCount}`);

  const png = path.join(ASSETS, 'models', `model-${m.id}.png`);
  if (existsSync(png)) {
    const s = pngSize(png);
    if (s && s.w === 1024 && s.h === 1024) ok(`model-${m.id}.png  1024×1024`);
    else fail(`model-${m.id}.png 尺寸异常：${s ? `${s.w}×${s.h}` : '无法解析'}`);
  } else fail(`缺失 models/model-${m.id}.png`);

  mustExist(`models/model-${m.id}.tech.svg`, 5000);
}

/* 8. 降级图 */
section('8. 降级与离线图形');
for (const f of ['poster-fallback', 'cover-fallback', 'model-fallback', 'no-webgl', 'offline-notice']) {
  mustExist(`fallback/${f}.svg`, 1000);
  const png = path.join(ASSETS, 'fallback', `${f}.png`);
  if (!existsSync(png)) fail(`缺失 fallback/${f}.png`);
}

/* 9. 预览页与清单 */
section('9. 预览页与交付清单');
for (const f of ['index.html', 'src/main.js', 'src/styles.css', 'src/data.js', 'vite.config.js', 'package.json']) {
  const p = path.join(ROOT, f);
  if (existsSync(p) && statSync(p).size > 100) ok(`${f}  (${(statSync(p).size / 1024).toFixed(1)} KB)`);
  else fail(`缺失或过小：${f}`);
}
for (const f of ['TASK.md', 'STATUS.md', 'README.md', 'INTERFACE.md', 'LICENSES.md', 'manifest.json']) {
  const p = path.join(ROOT, f);
  if (existsSync(p) && statSync(p).size > 200) ok(`${f}  (${(statSync(p).size / 1024).toFixed(1)} KB)`);
  else fail(`缺失或过小：${f}`);
}
if (existsSync(path.join(ROOT, 'manifest.json'))) {
  const mf = JSON.parse(readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  const need = ['id', 'title', 'description', 'entry', 'buildCommand', 'outputDir', 'status'];
  const miss = need.filter((k) => !(k in mf));
  if (miss.length === 0) ok('manifest.json 字段齐全');
  else fail(`manifest.json 缺少字段：${miss.join(', ')}`);
}

/* 10. 外链检查 */
section('10. 零外部请求检查');
function scanDir(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    const st = statSync(p);
    if (st.isDirectory()) scanDir(p, out);
    else if (/\.(html|css|js|json)$/.test(f)) out.push(p);
  }
  return out;
}
const scanRoots = [path.join(ROOT, 'dist'), path.join(ROOT, 'public'), path.join(ROOT, 'src'), path.join(ROOT, 'index.html')];
let extHits = 0;
for (const root of scanRoots) {
  const files = statSync(root).isDirectory() ? scanDir(root) : [root];
  for (const f of files) {
    const txt = readFileSync(f, 'utf8');
    const rel = path.relative(ROOT, f);
    const hits = txt.match(/(?:src|href)\s*=\s*["'](https?:)?\/\/[^"']+["']/g) || [];
    const cssHits = txt.match(/url\(\s*["']?(https?:)?\/\/[^)]+\)/g) || [];
    const real = hits.filter((h) => !/w3\.org|schema\.org/.test(h));
    if (real.length || cssHits.length) {
      fail(`发现外部引用：${rel} → ${[...real, ...cssHits].slice(0, 3).join(' | ')}`);
      extHits++;
    }
  }
}
if (extHits === 0) ok('未发现任何外部资源引用（零 CDN / 零在线 API）');

/* 11. 品牌与版权扫描 */
section('11. 品牌标识扫描');
const brandTerms = [
  'nintendo', 'sega', 'sony', 'playstation', 'xbox', 'atari', 'sega ', 'nintendo ',
  'gameboy', 'game boy', 'n64', 'playstation', 'joy-con', 'dualshock',
];
let brandHits = 0;
for (const root of [path.join(ROOT, 'public', 'assets', 'posters'), path.join(ROOT, 'public', 'assets', 'covers'), path.join(ROOT, 'public', 'assets', 'models')]) {
  for (const f of scanDir(root)) {
    const txt = readFileSync(f, 'utf8').toLowerCase();
    for (const t of brandTerms) {
      if (txt.includes(t)) {
        fail(`在 ${path.relative(ROOT, f)} 中发现品牌词 "${t.trim()}"`);
        brandHits++;
      }
    }
  }
}
if (brandHits === 0) ok('资产中未出现任何品牌名称');

/* ------------------------------------------------------------------ */
console.log('\n' + '='.repeat(58));
console.log(`通过 ${pass} 项，失败 ${failures.length} 项，警告 ${warnings.length} 项`);
if (warnings.length) {
  console.log('\n警告：');
  warnings.forEach((w) => console.log('  ! ' + w));
}
if (failures.length) {
  console.log('\n失败项：');
  failures.forEach((f) => console.log('  ✗ ' + f));
  process.exit(1);
}
console.log('\n✓ 全部校验通过。');
