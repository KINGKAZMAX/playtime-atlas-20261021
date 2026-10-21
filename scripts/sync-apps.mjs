#!/usr/bin/env node
/**
 * 上游成果同步 —— 把同级任务目录中的可部署源码复制进 release/apps/。
 *
 * 原则：
 *  - **只读**同级目录，绝不修改其内容；
 *  - 只复制源码与必要资产，排除 node_modules / dist / 原始抓取日志 / 大体积视频；
 *  - 每个同步进来的应用补一份 manifest.json（id/title/description/entry/buildCommand/outputDir/status）。
 *
 * 用法：node scripts/sync-apps.mjs [--dry]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyPatches } from './patches.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const BATCH = path.resolve(ROOT, '..', '..'); // flash-showcase-20261021/
const dry = process.argv.includes('--dry');

/** 顶层允许复制的文件 */
const ALLOW_FILES = new Set([
  'package.json', 'package-lock.json', 'vite.config.js', 'vite.config.ts', 'vite.config.mjs',
  'index.html', 'README.md', 'QA.md', 'CONTROLS.md', 'LICENSE', 'LICENSES.md', 'SOURCES.md',
  'REFERENCE-DESIGN.md', 'DIFF-AUDIT.md', 'HANDOFF-14.md', 'QA-MATRIX.md', 'QA-CHECKLIST.md',
  'catalog.json', 'issues.json', 'manifest.json', 'design-tokens.json', 'asset-manifest.json',
  'index.data.json', 'TOP3.md', 'RANKING.md', 'cases.json', 'STATUS.md', 'TASK.md',
  'SOURCE.md', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
  'svelte.config.js', 'astro.config.mjs', 'next.config.js', 'vercel.json',
]);

/** 顶层允许复制的目录 */
const ALLOW_DIRS = new Set([
  'src', 'public', 'scripts', 'models', 'assets', 'exhibits', 'data', 'fonts', 'static', 'lib',
]);

/** 明确排除（体积大 / 属于私有原始素材 / 构建垃圾） */
const DENY = new Set([
  'node_modules', 'dist', 'build', '.git', '.DS_Store', 'raw', 'media', 'frames',
  'references', 'screenshots', 'tmp', 'coverage', '.cache',
  '.venv', 'venv', '__pycache__', '.mypy_cache', '.pytest_cache', '.ruff_cache',
  '.idea', '.vscode', '.next', '.turbo',
]);

const DENY_EXT = new Set(['.pyc', '.pyo', '.log', '.db', '.sqlite']);

/**
 * 嵌套重复资源包：某些上游把另一个任务的 public/ 整目录拷进 public/xxx/public，
 * 体积大且不被引用（引用关系已逐个核验），同步时剔除。
 */
function isNestedPublicBundle(rel) {
  return /(^|\/)public\/[^/]+\/public(\/|$)/.test(rel);
}

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest, rel = '') {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (DENY.has(e.name)) continue;
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (isNestedPublicBundle(r)) continue;
      copyDir(s, d, r);
    } else if (e.isFile()) {
      if (DENY_EXT.has(path.extname(e.name).toLowerCase())) continue;
      try {
        fs.copyFileSync(s, d);
      } catch (e) {
        // 上游正在改写文件：源文件可能在这一瞬间被替换或删除，跳过即可
        console.warn(`[sync] ! 跳过消失的文件 ${r}/${e.name}`);
      }
    }
  }
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'works.json'), 'utf8'));
  const seen = new Set();
  let copied = 0;
  let skipped = 0;

  for (const work of manifest.works) {
    const upstream = work.upstream;
    if (!upstream) continue;
    const appRel = work.build?.appDir;
    if (!appRel) continue;

    const src = path.join(BATCH, upstream);
    const dest = path.join(ROOT, appRel);
    const overlay = path.join(ROOT, 'authored', appRel);

    if (!fs.existsSync(src)) {
      console.log(`[sync] —  ${upstream.padEnd(20)} 目录不存在，跳过`);
      skipped++;
      continue;
    }

    if (!dry && fs.existsSync(dest)) {
      // 只清理本脚本会写入的条目，保留 node_modules（避免重复安装）
      for (const e of fs.readdirSync(dest, { withFileTypes: true })) {
        if (e.isFile() && (ALLOW_FILES.has(e.name) || e.name.endsWith('.html'))) {
          fs.rmSync(path.join(dest, e.name), { force: true });
        } else if (e.isDirectory() && ALLOW_DIRS.has(e.name)) {
          rmrf(path.join(dest, e.name));
        }
      }
    }
    fs.mkdirSync(dest, { recursive: true });

    let n = 0;
    for (const e of fs.readdirSync(src, { withFileTypes: true })) {
      if (e.isFile() && (ALLOW_FILES.has(e.name) || (e.name.endsWith('.html') && e.name !== 'index.html'))) {
        fs.copyFileSync(path.join(src, e.name), path.join(dest, e.name));
        n++;
      } else if (e.isDirectory() && ALLOW_DIRS.has(e.name)) {
        copyDir(path.join(src, e.name), path.join(dest, e.name));
        n++;
      }
    }

    // 部署总控自撰的覆盖层（同步后恢复，避免被清空）
    if (fs.existsSync(overlay)) {
      copyDir(overlay, dest);
      n++;
    }

    // 部署补丁层：修复上游已确认但尚未修复的缺陷（只改副本，不动上游）
    const applied = applyPatches(path.basename(dest), dest);
    for (const p of applied) {
      console.log(`[patch] ⚠  ${p.upstream} → ${p.file}`);
      console.log(`[patch]    ${p.reason}`);
      console.log(`[patch]    上游修复建议：${p.upstreamFix}`);
    }

    // 每个应用补一份标准 manifest.json
    if (!dry) {
      const mPath = path.join(dest, 'manifest.json');
      const existing = fs.existsSync(mPath) ? JSON.parse(fs.readFileSync(mPath, 'utf8')) : {};
      const merged = {
        id: work.id,
        title: work.title,
        description: work.description,
        entry: work.entry,
        buildCommand: work.buildCommand,
        outputDir: work.outputDir,
        status: work.status,
        upstream,
        license: work.license,
        sources: work.sources,
        ...existing,
      };
      fs.writeFileSync(mPath, JSON.stringify(merged, null, 2));
    }

    console.log(`[sync] ✓  ${upstream.padEnd(20)} → ${appRel}  (${n} 项)`);
    copied++;
  }

  console.log(`[sync] 完成：同步 ${copied} 个，跳过 ${skipped} 个${dry ? '（dry-run，未写入）' : ''}`);
}

main();
