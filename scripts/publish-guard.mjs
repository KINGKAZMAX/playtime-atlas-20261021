#!/usr/bin/env node
/**
 * 参考站抓取件 —— 机械拦截（发布守卫）
 * ------------------------------------------------------------------
 * 16 / 17 / 19 的目录里含有对参考站（olek.si 等）的抓取件与取证材料：
 * 抓取的 JS / CSS 文本、令牌 JSON、sitemap、参考截图与隔离目录。
 * 它们只用于内部观察，依合规红线**不得进入公开仓库**。
 *
 * 本模块是唯一的判定处：scripts/build.mjs 在**每一条复制路径**上调用它，
 * 命中即跳过并记入构建报告（data/build-report.json → blockedReferenceCaptures）。
 * 采用**白名单式排除**：按目录名与文件名排除，不依赖上游先清理、
 * 不依赖人工确认，也不依赖某次同步的时机。
 *
 * 自检：node scripts/publish-guard.mjs --selftest
 */

/** 整个目录都不进公开面（隔离区 / 取证截图 / 未授权参考 / 原始截图）。 */
const REFERENCE_CAPTURE_DIRS = [
  'research-ref',      // 17 把参考站抓取件移入的隔离目录
  '_QUARANTINE__',     // 19 的参考站隔离目录
  'screenshots',       // 原始截图（含参考站截图）
  'references',        // 00 的 references/mia-100-html/（该仓库无 LICENSE）
  'evidence/ref',      // 16 的参考站取证截图
];

/** 单个文件名命中即拦截。 */
const REFERENCE_CAPTURE_FILES = [
  /^olek[^/]*$/i,     // olek-index.js / olek-css-blocks.txt / olek-tokens.json
  /^ref-[^/]*$/i,     // ref-home-2560.png 之类
  /^sitemap\.xml$/i,  // 抓取的 sitemap
];

/** 判定规则（按相对路径）。 */
export const REFERENCE_CAPTURE_PATTERNS = [
  ...REFERENCE_CAPTURE_DIRS.map((d) => ({
    re: new RegExp(`(^|/)${d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|$)`, 'i'),
    why: `参考站/取证隔离目录（${d}/）`,
  })),
  ...REFERENCE_CAPTURE_FILES.map((re) => ({ re, why: '参考站抓取件' })),
];

/**
 * 判定某个（相对）路径是否为参考站抓取件。
 * 目录规则按**整条路径**判定；文件规则按**文件名**判定（无论它在多深的目录里）。
 * @param {string} relPath 相对发布根的路径，例如 "data/olek-index.js"
 * @returns {{blocked: boolean, why: string|null}}
 */
export function checkReferenceCapture(relPath) {
  const p = String(relPath).replace(/\\/g, '/').replace(/^\/+/, '');
  const base = p.split('/').pop() || p;

  for (const d of REFERENCE_CAPTURE_DIRS) {
    const re = new RegExp(`(^|/)${d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(/|$)`, 'i');
    if (re.test(p)) return { blocked: true, why: `参考站/取证隔离目录（${d}/）` };
  }
  for (const re of REFERENCE_CAPTURE_FILES) {
    if (re.test(base)) return { blocked: true, why: '参考站抓取件' };
  }
  return { blocked: false, why: null };
}

/** 供 build.mjs 使用的布尔判定。 */
export function isReferenceCapture(relPath) {
  return checkReferenceCapture(relPath).blocked;
}

/* ----------------------------------------------------------------- 自检 */

function selftest() {
  const blocked = [
    'data/olek-index.js',
    'data/olek-css-blocks.txt',
    'data/olek-tokens.json',
    'data/sitemap.xml',
    'screenshots/olek-si-desktop-1440x900.png',
    'screenshots/01-hero.png',
    'evidence/ref/desktop-home.png',
    'public/art/ref-home-2560.png',
    'nested/deep/olek-x.json',
    'research-ref/olek-index.js',
    'research-ref/bundle.js',
    '_QUARANTINE__/olek-si.html',
    '_QUARANTINE__/nested/olek-tokens.json',
    'references/mia-100-html/index.html',
    'references/mia-100-html/100.html',
  ];
  const allowed = [
    'index.html',
    'assets/app.js',
    'data/catalog.json',
    'data/raw_sources.json',
    'data/validate-report.json',
    'evidence/local/preview-desktop-1444.png',
    'design-tokens.json',
    'fonts/inter-latin.woff2',
    'LICENSE',
    'works/06-museum-main/data/catalog.json',
  ];
  let fail = 0;
  for (const p of blocked) {
    if (!isReferenceCapture(p)) { console.error(`✗ 应拦截但放行：${p}`); fail++; }
  }
  for (const p of allowed) {
    if (isReferenceCapture(p)) { console.error(`✗ 应放行但拦截：${p}`); fail++; }
  }
  if (fail) {
    console.error(`发布守卫自检失败：${fail} 项不符合预期`);
    process.exit(1);
  }
  console.log(`发布守卫自检通过：应拦截 ${blocked.length} 项、应放行 ${allowed.length} 项`);
}

if (process.argv.includes('--selftest')) selftest();
