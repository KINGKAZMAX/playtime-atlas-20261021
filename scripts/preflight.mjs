#!/usr/bin/env node
/**
 * 发布前合规闸门（preflight）
 * ------------------------------------------------------------------
 * 在**提交 / 推送之前**机械检查，发现问题直接以非 0 退出码中断：
 *
 *   1. 发布守卫自检（判定规则自身是否正确）；
 *   2. 参考站抓取件扫描 —— 全仓库树（apps/ docs/ hall/ scripts/ 根文件）；
 *   3. git 暂存清单扫描 —— 只看将要进入提交的文件；
 *   4. 大体积第三方 bundle 规则（>200KB 的 .js/.css 且不匹配本批构建产物）；
 *   5. 凭据类文件不得入库（.env / *.pem / *.key / credentials.json / secrets.json …）。
 *
 * 用法：node scripts/preflight.mjs
 * 退出码：0 = 全部通过；1 = 存在必须处理的问题（禁止提交）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scanTree, scanStaged, checkReferenceCapture } from './publish-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const notes = [];

function step(label, fn) {
  process.stdout.write(`\n[preflight] ${label}\n`);
  const ok = fn();
  if (!ok) problems.push(label);
  return ok;
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8' });
  return { status: res.status, stdout: String(res.stdout || ''), stderr: String(res.stderr || '') };
}

/* 1) 守卫自检 */
step('发布守卫自检', () => {
  const res = run('node', ['scripts/publish-guard.mjs', '--selftest']);
  process.stdout.write(res.stdout.trim() + '\n');
  if (res.status !== 0) process.stderr.write(res.stderr.trim() + '\n');
  return res.status === 0;
});

/* 2) 全仓库树扫描 */
step('参考站抓取件扫描（仓库树）', () => {
  let ok = true;
  for (const dir of ['apps', 'docs', 'hall', 'scripts']) {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    const res = scanTree(abs);
    if (res.hits.length) {
      ok = false;
      process.stderr.write(`   ✗ ${dir}/：${res.hits.length} 项\n`);
      for (const h of res.hits) process.stderr.write(`     · [${h.type}] ${h.path}（${h.size || 0} B）—— ${h.why}\n`);
    } else {
      process.stdout.write(`   ✓ ${dir}/（${res.scanned} 个文件，无命中）\n`);
    }
  }
  // 仓库根的散落文件
  for (const name of fs.readdirSync(ROOT)) {
    const abs = path.join(ROOT, name);
    if (!fs.statSync(abs).isFile()) continue;
    const check = checkReferenceCapture(name);
    if (check.blocked) {
      ok = false;
      process.stderr.write(`   ✗ 根目录 ${name} —— ${check.why}\n`);
    }
  }
  return ok;
});

/* 3) 暂存清单扫描 */
step('git 暂存清单扫描', () => {
  const res = scanStaged(ROOT);
  if (res.error) {
    process.stderr.write(`   ! ${res.error}（本次可能没有暂存内容）\n`);
    notes.push('暂存清单为空：若本次不提交任何文件可忽略');
    return true;
  }
  if (res.hits.length) {
    process.stderr.write(`   ✗ ${res.hits.length} 项必须移出暂存区\n`);
    for (const h of res.hits) process.stderr.write(`     · [${h.type}] ${h.path}（${h.size || 0} B）—— ${h.why}\n`);
    return false;
  }
  process.stdout.write(`   ✓ ${res.scanned} 个暂存文件，无命中\n`);
  return true;
});

/* 4) 凭据类文件 */
step('凭据类文件检查', () => {
  const res = run('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR']);
  const files = res.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
  const bad = files.filter((f) =>
    /(^|\/)(\.env(\..*)?|.*\.pem|.*\.key|credentials\.json|secrets\.json|id_rsa|\.npmrc)$/i.test(f)
  );
  if (bad.length) {
    process.stderr.write(`   ✗ 暂存区含凭据类文件：${bad.join(', ')}\n`);
    return false;
  }
  process.stdout.write(`   ✓ ${files.length} 个暂存文件中无凭据类文件\n`);
  return true;
});

/* 汇总 */
process.stdout.write('\n────────────────────────────\n');
if (problems.length) {
  process.stderr.write(`✗ preflight 未通过：${problems.join('；')}\n`);
  process.stderr.write('  禁止提交 / 推送，请先处理上述问题。\n');
  process.exit(1);
}
for (const n of notes) process.stdout.write(`! ${n}\n`);
process.stdout.write('✓ preflight 全部通过，可以提交。\n');
