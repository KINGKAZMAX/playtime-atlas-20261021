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

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..');

/** 整个目录都不进公开面（隔离区 / 取证截图 / 未授权参考 / 原始截图）。 */
const REFERENCE_CAPTURE_DIRS = [
  'research-ref',      // 17 把参考站抓取件移入的隔离目录
  '_QUARANTINE__',     // 19 的参考站隔离目录
  'screenshots',       // 原始截图（含参考站截图）
  'references',        // 00 的 references/mia-100-html/（该仓库无 LICENSE）
  'evidence/ref',      // 16 的参考站取证截图
  'evidence/ego-ref',  // 17 的参考站视口度量等观察证据
  'docs/reference',    // 18 的参考站对照截图
  'evidence',          // 各任务的观察证据根目录（16 / 17 / 18 / 19 / 00）
  // 注意：发布面上的 docs/research/catalog.html（05 策展目录）是**站点产物**，
  // 不是观察证据目录，因此不整目录排除；19 的参考站材料由更精确的
  // `_QUARANTINE__/` 规则与文件名规则（olek*）覆盖。
];

/** 单个文件名命中即拦截。 */
const REFERENCE_CAPTURE_FILES = [
  /^olek[^/]*$/i,     // olek-index.js / olek-css-blocks.txt / olek-tokens.json / oleksi-*.png
  /^ref-[^/]*$/i,     // ref-home-2560.png 之类
  /^sitemap\.xml$/i,  // 抓取的 sitemap
];

/** 参考站域名特征：命中即视为参考站派生文件（用于体积规则的佐证）。 */
const REFERENCE_SITE_HINT = /olek\.si/i;


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

/** 大体积第三方 bundle 阈值：200 KB。 */
const LARGE_BUNDLE_BYTES = 200 * 1024;

function walkFiles(root, base = '', out = []) {
  let entries;
  try {
    entries = fs.readdirSync(root, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const abs = path.join(root, e.name);
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) walkFiles(abs, rel, out);
    else if (e.isFile()) out.push({ abs, rel, size: fs.statSync(abs).size });
  }
  return out;
}

function sha1(file) {
  try {
    return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex');
  } catch {
    return null;
  }
}

/**
 * 本批**自己构建产物**的内容哈希集合 —— 用作大体积规则的放行依据。
 *
 * 判定逻辑：>200KB 的 .js/.css 若内容与 docs/works/、docs/assets/ 或各作品的 dist/
 * 中的构建产物一致，就是本批自己的打包结果（vite chunk、vendored three.js 等），放行；
 * 否则视为「疑似外部整包」（如参考站 bundle），报出待人工复核。
 *
 * 注意：允许集来自**仓库根**（而不是被扫描的子目录），否则扫描 apps/ 时会失去依据。
 * 残余风险：若参考站整包被改名后混进 docs/works/**，其哈希会进入允许集；
 * 因此文件/目录名规则（REFERENCE_CAPTURE_FILES / DIRS）仍是第一道防线。
 */
function buildOutputHashes(root) {
  const set = new Set();
  const roots = [path.join(root, 'docs', 'works'), path.join(root, 'docs', 'assets')];
  const appsDir = path.join(root, 'apps');
  try {
    for (const name of fs.readdirSync(appsDir)) {
      const d = path.join(appsDir, name, 'dist');
      if (fs.existsSync(d)) roots.push(d);
    }
  } catch { /* apps/ 不存在 */ }
  for (const r of roots) {
    for (const f of walkFiles(r)) {
      if (/\.(js|css)$/i.test(f.rel)) {
        const h = sha1(f.abs);
        if (h) set.add(h);
      }
    }
  }
  return set;
}

/**
 * 扫描一棵目录树，报告参考站抓取件与疑似外部大体积 bundle。
 * @returns {{hits: Array, scanned: number}}
 */
export function scanTree(root, opts = {}) {
  const allowLarge = opts.allowLarge || buildOutputHashes(REPO_ROOT);
  const hits = [];
  let scanned = 0;
  for (const f of walkFiles(root)) {
    scanned++;
    const check = checkReferenceCapture(f.rel);
    if (check.blocked) {
      hits.push({ path: f.rel, type: 'reference-capture', why: check.why, size: f.size });
      continue;
    }
    if (/\.(js|css)$/i.test(f.rel) && f.size > LARGE_BUNDLE_BYTES) {
      const h = sha1(f.abs);
      if (!h || !allowLarge.has(h)) {
        hits.push({
          path: f.rel,
          type: 'large-bundle',
          why: `>${LARGE_BUNDLE_BYTES / 1024}KB 的 JS/CSS，且内容不匹配本批构建产物（疑似外部整包）`,
          size: f.size,
        });
      }
    }
  }
  return { hits, scanned };
}

/** 扫描 git 已暂存的新增/修改文件清单。 */
export function scanStaged(root) {
  const res = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    cwd: root, encoding: 'utf8',
  });
  if (res.status !== 0) return { hits: [], scanned: 0, error: '无法读取暂存清单' };
  const allowLarge = buildOutputHashes(REPO_ROOT);
  const hits = [];
  const files = String(res.stdout || '').split('\n').map((s) => s.trim()).filter(Boolean);
  for (const rel of files) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    const check = checkReferenceCapture(rel);
    if (check.blocked) {
      hits.push({ path: rel, type: 'reference-capture', why: check.why, size: fs.statSync(abs).size });
      continue;
    }
    const size = fs.statSync(abs).size;
    if (/\.(js|css)$/i.test(rel) && size > LARGE_BUNDLE_BYTES) {
      const h = sha1(abs);
      if (!h || !allowLarge.has(h)) {
        hits.push({ path: rel, type: 'large-bundle', why: '>200KB 的 JS/CSS，且不匹配本批构建产物', size });
      }
    }
  }
  return { hits, scanned: files.length };
}

function fmtSize(n) {
  return `${(n / 1024).toFixed(1)}KB`;
}

function report(label, res) {
  if (res.error) {
    console.error(`✗ ${label}：${res.error}`);
    process.exit(1);
  }
  if (!res.hits.length) {
    console.log(`✓ ${label}：未发现参考站抓取件或疑似外部大体积 bundle（扫描 ${res.scanned} 个文件）`);
    return true;
  }
  console.error(`✗ ${label}：发现 ${res.hits.length} 项必须处理的问题`);
  for (const h of res.hits) {
    console.error(`   · [${h.type}] ${h.path}（${fmtSize(h.size || 0)}）—— ${h.why}`);
  }
  return false;
}


function selftest() {
  const blocked = [
    'data/olek-index.js',
    'data/olek-css-blocks.txt',
    'data/olek-tokens.json',
    'data/sitemap.xml',
    'screenshots/olek-si-desktop-1440x900.png',
    'screenshots/01-hero.png',
    'evidence/ref/desktop-home.png',
    'evidence/ego-ref/olek-si-viewport-metrics.json',
    'docs/reference/oleksi-01-hero.png',
    'research/_QUARANTINE__/olek-si/bundle.js',
    'evidence/d1-review/desktop-1440.png',
    'evidence/local/preview.png',
    'evidence/local/preview-desktop-1444.png',
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

const argv = process.argv.slice(2);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (!isMain) {
  // 被其它脚本 import 时只提供 API，不执行命令行分派
} else if (argv.includes('--selftest')) {
  selftest();
} else if (argv.includes('--scan')) {
  const i = argv.indexOf('--scan');
  const dirs = argv.slice(i + 1).filter((a) => !a.startsWith('--'));
  const targets = dirs.length ? dirs : ['.'];
  let ok = true;
  for (const d of targets) {
    ok = report(`扫描 ${d}`, scanTree(path.resolve(REPO_ROOT, d))) && ok;
  }
  process.exit(ok ? 0 : 1);
} else if (argv.includes('--staged')) {
  process.exit(report('git 暂存清单', scanStaged(REPO_ROOT)) ? 0 : 1);
} else {
  console.log('用法：node scripts/publish-guard.mjs [--selftest | --scan [dir...] | --staged]');
}
