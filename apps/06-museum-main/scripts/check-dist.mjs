#!/usr/bin/env node
/**
 * 产物体积守卫（postbuild）
 *
 * 为什么要它：本轮实测发现 `public/art/.venv`（124 MB 的 Python 虚拟环境）
 * 被一并打进 dist——静态站要发布到 GitHub Pages，124 MB 的工具链残留
 * 既拖垮部署，也把第三方依赖的源码泄露到线上。
 *
 * 守卫做三件事：
 *   1. 扫描 dist 里不该上线的目录（虚拟环境 / 缓存 / 依赖目录）
 *   2. 统计总体积与最大的几个文件
 *   3. 超阈值时以**非零码退出**，让构建失败——而不是悄悄发布
 *
 * 用法：node scripts/check-dist.mjs [dist 目录]
 */

import { readdir, stat, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.argv[2] ?? path.join(ROOT, 'dist'));

/** 不该出现在静态产物里的目录名 */
const JUNK_DIRS = new Set([
  '.venv', 'venv', 'env', '__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache',
  '.tox', 'node_modules', '.git', '.cache', 'coverage',
]);

/** 总体积上限（MB）。本馆真实产物约 3 MB；留出余量取 30 MB。 */
const MAX_TOTAL_MB = 30;
/** 单文件上限（MB） */
const MAX_FILE_MB = 6;
/** 单目录上限（MB） */
const MAX_DIR_MB = 12;

function mb(bytes) {
  return Math.round((bytes / 1024 / 1024) * 100) / 100;
}

async function dirSize(dir) {
  let total = 0;
  const files = [];
  async function walk(d) {
    let entries;
    try { entries = await readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        await walk(p);
      } else if (e.isFile()) {
        const s = await stat(p).catch(() => null);
        if (!s) continue;
        total += s.size;
        files.push({ path: path.relative(DIST, p), size: s.size });
      }
    }
  }
  await walk(dir);
  return { total, files };
}

async function main() {
  if (!existsSync(DIST)) {
    console.error(`✗ 产物目录不存在：${DIST}`);
    process.exit(1);
  }

  const { total, files } = await dirSize(DIST);
  const problems = [];

  // 1) 垃圾目录
  async function findJunk(dir) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const p = path.join(dir, e.name);
      if (JUNK_DIRS.has(e.name)) {
        problems.push(`不该上线的目录：${path.relative(DIST, p)}`);
        await rm(p, { recursive: true, force: true });
        console.log(`  · 已移除 ${path.relative(DIST, p)}`);
        continue;
      }
      await findJunk(p);
    }
  }
  await findJunk(DIST);

  // 2) 体积
  const top = files.sort((a, b) => b.size - a.size).slice(0, 5);
  console.log(`\n▶ 产物检查：${DIST}`);
  console.log(`  总体积：${mb(total)} MB（上限 ${MAX_TOTAL_MB} MB）`);
  console.log(`  文件数：${files.length}`);
  for (const f of top) console.log(`  · ${mb(f.size)} MB  ${f.path}`);

  if (mb(total) > MAX_TOTAL_MB) problems.push(`总体积 ${mb(total)} MB 超过上限 ${MAX_TOTAL_MB} MB`);
  for (const f of files) {
    if (mb(f.size) > MAX_FILE_MB) problems.push(`单文件过大 ${mb(f.size)} MB：${f.path}`);
  }

  // 3) 顶层目录体积
  for (const e of await readdir(DIST, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const s = await dirSize(path.join(DIST, e.name));
    if (mb(s.total) > MAX_DIR_MB) problems.push(`目录过大 ${mb(s.total)} MB：${e.name}/`);
  }

  if (problems.length) {
    console.error('\n✗ 产物检查未通过：');
    for (const p of problems) console.error(`  · ${p}`);
    process.exit(1);
  }
  console.log('\n✓ 产物检查通过：体积与内容均可安全发布');
}

main().catch((err) => {
  console.error('✗ 产物检查异常：', err);
  process.exit(1);
});
