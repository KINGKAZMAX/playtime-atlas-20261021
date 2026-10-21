/**
 * 回响电玩馆 — 资产完整性自动校验
 *
 * 运行：npm run qa
 * 退出码 0 = 全部通过；1 = 存在失败项。
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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

/* 1. 设计令牌（已对齐 16-design-system） */
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

  /* 与 16 对齐后的结构 */
  for (const sec of ['meta', 'designSystem', 'local', 'compat', 'cssVars']) {
    if (t[sec]) ok(`对齐结构分区 ${sec}`);
    else fail(`对齐结构缺少分区 ${sec}`);
  }
  for (const sec of ['color', 'typography', 'space', 'radius', 'shadow', 'motion', 'zIndex', 'layout', 'component', 'a11y']) {
    if (t.designSystem?.[sec]) ok(`16 令牌树分区 ${sec}`);
    else fail(`16 令牌树缺少分区 ${sec}`);
  }

  /* 展品内嵌三色（已烘焙进资产文件） */
  if (t.local?.color?.ink?.[800] && t.local?.color?.paper?.[50] && t.local?.color?.signal?.[500]) {
    ok('展品内嵌三色：墨蓝 / 纸白 / 信号橙');
  } else fail('展品内嵌三色不完整');

  /* 对齐元信息 */
  const al = t.meta?.alignment;
  if (al?.designSystem && al?.alignedTo && al?.alignedAt) {
    ok(`对齐元信息：${al.designSystem} v${al.designSystemVersion} → ${al.alignedTo}`);
  } else fail('缺少对齐元信息（meta.alignment）');
  if (al?.fingerprints?.fontsIdentical === true) ok('字体与 16 逐字节一致');
  else fail(`字体与 16 不一致（fontsIdentical=${al?.fingerprints?.fontsIdentical}）`);
  if (Array.isArray(al?.drift)) {
    /* drift 记录的是「16 自身的 JSON ↔ CSS 跨层不一致」，
       本包 CSS 层与 JSON 层各自照抄来源，因此每一项都必须登记 inherited + 说明，
       且不允许有本包自行引入的差异。 */
    const unjustified = al.drift.filter((d) => d.inherited !== true || !d.note);
    if (al.drift.length === 0) {
      ok('与 16 的取值零差异');
    } else if (unjustified.length === 0) {
      ok(`跨层差异 ${al.drift.length} 项，均为 16 自身 JSON↔CSS 不一致（已逐项登记来源与说明）`);
      for (const d of al.drift) {
        console.log(`      · ${d.variable}  ${d.kind}  css=${d.css}  json=${d.json}`);
      }
    } else {
      fail(`存在未登记来源的差异 ${unjustified.length} 项：${unjustified.map((d) => d.variable).join(', ')}`);
    }
  } else fail('对齐元信息缺少 drift 记录');

  /* 对齐分层元信息：CSS 层与 JSON 层各自的来源与指纹 */
  if (al?.alignmentLayers?.cssLayer?.sha256 && al?.alignmentLayers?.jsonLayer?.sha256) {
    ok(`对齐分层登记完整：CSS 层 ← ${al.alignmentLayers.cssLayer.source}，JSON 层 ← ${al.alignmentLayers.jsonLayer.source}`);
  } else fail('对齐元信息缺少 alignmentLayers（双层来源与指纹）');

  /* CSS 令牌层：--ds-* 必须与 16 的取值一致 */
  const cssPath = path.join(ROOT, 'public', 'assets', 'tokens.css');
  if (existsSync(cssPath)) {
    const css = readFileSync(cssPath, 'utf8');
    const dsVars = Object.keys(t.cssVars?.root || {});
    const declared = dsVars.filter((v) => new RegExp(`\\${v}\\s*:`).test(css));
    if (declared.length === dsVars.length && dsVars.length > 100) {
      ok(`tokens.css 声明 ${declared.length} 个 --ds-* 变量（与 16 一致）`);
    } else fail(`tokens.css 的 --ds-* 变量数不符：${declared.length}/${dsVars.length}`);
    if (/--atlas-semantic-accent:\s*var\(--ds-accent\)/.test(css)) {
      ok('--atlas-* 语义别名重定向到 --ds-*（随主题自适应）');
    } else fail('--atlas-* 语义别名未重定向到 --ds-*');
    if (/@media \(prefers-reduced-motion: reduce\)/.test(css)) ok('tokens.css 含 reduced-motion 降级块');
    else fail('tokens.css 缺少 prefers-reduced-motion 降级块');

    /* 字体栈顺序规则（16 §字体栈 / 05 基线错位实测）：
       覆盖完整的系统 CJK 族必须排在覆盖有限的 Noto Sans SC 子集之前，
       否则 CSS 按字符回退会让同段中文混入两套字形、基线错位。 */
    const stackOf = (name) => {
      const m = css.match(new RegExp(`${name}:\\s*([^;]+);`));
      return m ? m[1].replace(/["']/g, '').split(',').map((x) => x.trim()).filter(Boolean) : [];
    };
    const FULL_CJK = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC'];
    const orderProblems = [];
    for (const name of ['--ds-font-display', '--ds-font-text']) {
      const stack = stackOf(name);
      const subsetAt = stack.indexOf('Noto Sans SC');
      const lastFull = Math.max(...FULL_CJK.map((f) => stack.indexOf(f)));
      if (subsetAt < 0) orderProblems.push(`${name} 缺少 Noto Sans SC 子集`);
      else if (lastFull < 0) orderProblems.push(`${name} 缺少完整系统 CJK 栈`);
      else if (subsetAt < lastFull) orderProblems.push(`${name} 把有限子集排在了完整系统栈之前`);
    }
    if (orderProblems.length === 0) ok('字体栈顺序合规：完整系统 CJK 栈在前、Noto Sans SC 子集在后');
    else fail(`字体栈顺序违反 CJK 基线规则：${orderProblems.join('；')}`);
  } else fail('缺少 public/assets/tokens.css');
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

/* 9b. 与 16 规范的对齐声明（供 06 / 13 核对） */
section('9b. 对齐声明与预览页外壳');
const amPath = path.join(ROOT, 'public', 'assets', 'assets.manifest.json');
if (existsSync(amPath)) {
  const am = JSON.parse(readFileSync(amPath, 'utf8'));
  const al = am.alignment;
  const need = ['designSystem', 'designSystemVersion', 'alignedTo', 'alignedToCss', 'spec', 'audit', 'alignedAt', 'fingerprints', 'drift'];
  const miss = need.filter((k) => !(al && k in al));
  if (miss.length === 0) ok(`assets.manifest.json 含对齐字段（${al.designSystem} v${al.designSystemVersion}）`);
  else fail(`assets.manifest.json 对齐字段缺少：${miss.join(', ')}`);
  if (al?.fingerprints?.fontsIdentical === true) ok('assets.manifest.json 记录：字体与 16 逐字节一致');
  else fail('assets.manifest.json 未记录字体一致性');
  if (am.fonts?.alignedTo) ok(`assets.manifest.json 记录字体清单依据：${am.fonts.alignedTo}`);
  else fail('assets.manifest.json 缺少字体清单依据');
} else {
  fail('缺少 public/assets/assets.manifest.json');
}

/* 预览页外壳：DS 主题、组件类、双语、reduced-motion、子路径 */
const idxPath = path.join(ROOT, 'index.html');
if (existsSync(idxPath)) {
  const html = readFileSync(idxPath, 'utf8');
  const read = (p) => (existsSync(path.join(ROOT, p)) ? readFileSync(path.join(ROOT, p), 'utf8') : '');
  const css = read('src/styles.css');
  const tokCss = read('public/assets/tokens.css');
  const mainJs = read('src/main.js');
  /* 组件类可能写在 HTML、样式表或 JS 模板里，三者并查 */
  const all = `${html}\n${css}\n${tokCss}\n${mainJs}`;
  if (/data-ds-theme="dark"/.test(html)) ok('预览页声明 DS 主题（data-ds-theme="dark"）');
  else fail('预览页未声明 data-ds-theme');
  for (const cls of ['ds-topbar', 'ds-btn', 'ds-chip', 'ds-tag', 'ds-lightbox', 'ds-iconbtn', 'ds-skip', 'ds-canvas-frame']) {
    if (all.includes(cls)) ok(`预览页使用 .${cls} 组件类`);
    else fail(`预览页缺少 .${cls} 组件类`);
  }
  if (/--ds-base/.test(html)) ok('预览页注入 --ds-base 基准路径变量');
  else fail('预览页缺少 --ds-base 注入');
  if (/lang="zh-CN"/.test(html)) ok('预览页 <html lang="zh-CN">');
  else fail('预览页 html lang 属性缺失');
  if (/data-i18n=/.test(html)) ok('预览页带 data-i18n 双语标注');
  else fail('预览页缺少 data-i18n 标注');
  if (existsSync(path.join(ROOT, 'src', 'i18n.js'))) ok('src/i18n.js 存在（zh/en 词条）');
  else fail('缺少 src/i18n.js');
  if (/role="dialog"/.test(html) && /aria-modal="true"/.test(html)) ok('灯箱具备 role=dialog + aria-modal');
  else fail('灯箱缺少 role=dialog / aria-modal');
  if (/:focus-visible/.test(css) && /--ds-focus-ring/.test(css)) ok('样式表实现 DS 焦点环（任何状态不移除）');
  else fail('样式表缺少 DS 焦点环');
  if (/prefers-reduced-motion: reduce/.test(css) || /prefers-reduced-motion: reduce/.test(tokCss)) ok('样式表含 prefers-reduced-motion 降级');
  else fail('样式表缺少 prefers-reduced-motion 降级');
  if (/letter-spacing:\s*var\(--ds-track-cjk\)/.test(css) || /letter-spacing:\s*var\(--ds-track-cjk\)/.test(tokCss)) {
    ok('中文排版字距归零（--ds-track-cjk）');
  } else fail('中文排版未使用 --ds-track-cjk');
  if (/white-space:\s*nowrap/.test(css)) fail('样式表出现 white-space: nowrap（390px 必然溢出）');
  else ok('样式表无 white-space: nowrap');
  if (/min-height:\s*44px/.test(css)) ok('主按钮最小高度 44px（触摸目标 AAA）');
  else fail('主按钮未达 44px 触摸目标');
  /* --ds-* 取值不得在 :root 内重复声明（命名空间冲突风险 B）；
     主题块（[data-ds-theme="dark"] / prefers-color-scheme）里的覆盖是合法的主题机制。 */
  const rootBlock = (tokCss.match(/:root\s*\{([\s\S]*?)\n\}/) || [])[1] || '';
  const rootVars = [...rootBlock.matchAll(/(--ds-[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
  const rootUniq = new Set(rootVars);
  if (rootVars.length === rootUniq.size) {
    ok(`tokens.css 的 :root 中 --ds-* 各声明一次（${rootUniq.size} 个，无覆盖冲突）`);
  } else {
    fail(`tokens.css 的 :root 中 --ds-* 存在重复声明（${rootVars.length} 次 / ${rootUniq.size} 个）`);
  }
  const darkBlock = (tokCss.match(/\[data-ds-theme="dark"\]\s*\{([\s\S]*?)\n\}/) || [])[1] || '';
  const darkVars = [...darkBlock.matchAll(/(--ds-[a-z0-9-]+)\s*:/g)].map((m) => m[1]);
  const orphan = darkVars.filter((v) => !rootUniq.has(v));
  if (orphan.length === 0) ok(`深色主题块覆盖 ${darkVars.length} 个变量，均在 :root 中有定义`);
  else fail(`深色主题块覆盖了未定义变量：${orphan.join(', ')}`);
}

/* 9c. i18n 结构与 DOM 引用完整性 */
section('9c. i18n 结构与 DOM 引用完整性');

/**
 * 极简 HTML 元素扫描器：返回每个元素的标签、属性、直接子元素与后代标签集合。
 * 只需覆盖本包 index.html 的写法（无脚本内嵌、无畸形闭合）。
 */
function scanElements(html) {
  const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const stack = [];
  const out = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [, close, rawTag, attrs, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (close) {
      let idx = -1;
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) { idx = i; break; }
      }
      if (idx >= 0) {
        stack[idx].end = m.index;
        stack.length = idx;
      }
      continue;
    }
    const node = { tag, attrs, children: [], descendants: new Set(), start: m.index, end: -1 };
    if (stack.length) stack[stack.length - 1].children.push(node);
    out.push(node);
    if (!selfClose && !VOID.has(tag)) stack.push(node);
  }
  /* 补后代标签集合：用区间法（元素区间内出现的其它起始标签都是其后代） */
  for (const n of out) {
    if (n.end < 0) n.end = html.length;
    const inner = html.slice(n.start, n.end);
    for (const m2 of inner.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)[\s/>]/g)) {
      const t2 = m2[1].toLowerCase();
      if (t2 !== n.tag) n.descendants.add(t2);
    }
  }
  return out;
}

const attrOf = (node, name) => {
  const re = new RegExp(`${name}\\s*=\\s*"([^"]*)"`);
  return (node.attrs.match(re) || [])[1];
};

if (existsSync(idxPath)) {
  const html = readFileSync(idxPath, 'utf8');
  const mainJs = readFileSync(path.join(ROOT, 'src', 'main.js'), 'utf8');
  const els = scanElements(html);

  /* ① main.js 里 $('#id') 引用的 id 必须都存在于 index.html
        —— 这条断言直接封堵"节点缺失 → textContent 空引用 → 整页白屏"这一类事故 */
  const htmlIds = new Set(els.filter((e) => e.attrs.includes('id=')).map((e) => attrOf(e, 'id')).filter(Boolean));
  const usedIds = [...mainJs.matchAll(/\$\(\s*'#([a-zA-Z0-9_-]+)'/g)].map((m) => m[1]);
  const missingIds = [...new Set(usedIds)].filter((id) => !htmlIds.has(id));
  if (missingIds.length === 0) {
    ok(`main.js 引用的 ${new Set(usedIds).size} 个 #id 全部存在于 index.html`);
  } else {
    fail(`main.js 引用了 index.html 中不存在的 #id：${missingIds.join(', ')}`);
  }

  /* ② data-i18n 节点必须不含元素子节点
        （textContent 覆盖会连同子元素一起抹掉——本轮真实事故） */
  const i18nNodes = els.filter((e) => attrOf(e, 'data-i18n') !== undefined);
  const richNodes = els.filter((e) => attrOf(e, 'data-i18n-rich') !== undefined);
  const withChildren = i18nNodes.filter((e) => e.children.length > 0);
  if (withChildren.length === 0) {
    ok(`${i18nNodes.length} 个 data-i18n 节点均不含元素子节点（不会误删内容）`);
  } else {
    fail(`data-i18n 节点含元素子节点（textContent 会抹掉它们）：${withChildren.map((e) => attrOf(e, 'data-i18n')).join(', ')}`);
  }

  /* ③ data-i18n-rich 节点：文案必须自带内联标记，且 zh/en 两侧标记一致 */
  const { DICT } = await import(pathToFileURL(path.join(ROOT, 'src', 'i18n.js')).href);
  const tagsOf = (s) => new Set([...String(s).matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)[\s/>]/g)].map((m) => m[1].toLowerCase()));
  let richBad = 0;
  for (const node of richNodes) {
    const key = attrOf(node, 'data-i18n-rich');
    const htmlTags = [...node.descendants].filter((t) => t !== 'br').sort();
    for (const lang of ['zh', 'en']) {
      const val = DICT[lang]?.[key];
      if (typeof val !== 'string') {
        fail(`data-i18n-rich="${key}" 在 ${lang} 词表中不存在`);
        richBad++;
        continue;
      }
      const dictTags = [...tagsOf(val)].sort();
      if (dictTags.join(',') !== htmlTags.join(',')) {
        fail(`data-i18n-rich="${key}" 的 ${lang} 文案内联标记 [${dictTags.join(',')}] 与 HTML [${htmlTags.join(',')}] 不一致`);
        richBad++;
      }
    }
  }
  if (richBad === 0) ok(`${richNodes.length} 个 data-i18n-rich 节点的 zh/en 内联标记与 HTML 一致`);

  /* ④ 所有引用到的 key 在 zh/en 两侧都必须存在 */
  const attrKeys = els.flatMap((e) =>
    ['data-i18n', 'data-i18n-rich'].flatMap((a) => {
      const v = attrOf(e, a);
      return v === undefined ? [] : [v];
    }),
  );
  const missingKey = [...new Set(attrKeys)].filter(
    (k) => typeof DICT.zh?.[k] !== 'string' || typeof DICT.en?.[k] !== 'string',
  );
  if (missingKey.length === 0) ok(`${new Set(attrKeys).size} 个 i18n key 在 zh/en 两侧均已登记`);
  else fail(`i18n 词表缺少 key：${missingKey.join(', ')}`);

  /* ⑤ 词表两侧 key 集合必须一致 */
  const zhKeys = new Set(Object.keys(DICT.zh));
  const enKeys = new Set(Object.keys(DICT.en));
  const onlyZh = [...zhKeys].filter((k) => !enKeys.has(k));
  const onlyEn = [...enKeys].filter((k) => !zhKeys.has(k));
  if (!onlyZh.length && !onlyEn.length) ok(`zh/en 词表 key 完全一致（${zhKeys.size} 条）`);
  else fail(`zh/en 词表 key 不一致：仅 zh ${onlyZh.join(', ') || '无'}；仅 en ${onlyEn.join(', ') || '无'}`);
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
