/**
 * Runtime QA — driver.
 *
 * The actual browser work happens in scripts/ego/qa-runtime.mjs, which runs
 * inside the ego-browser Node runtime (the project's single browser entry
 * point). This file is plain Node: it runs that script through
 * scripts/run-ego.mjs and turns the result into a process exit code.
 *
 * Usage: node scripts/qa-runtime.mjs
 * Exits non-zero when any check fails.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = path.join(ROOT, 'evidence', 'qa', 'qa-runtime.json');
const EGO_SCRIPT = path.join(ROOT, 'scripts', 'ego', 'qa-runtime.mjs');

if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
  console.error('dist/index.html 不存在 —— 先运行 npm run build');
  process.exit(2);
}

const child = spawn(process.execPath, [path.join(ROOT, 'scripts', 'run-ego.mjs'), EGO_SCRIPT], {
  cwd: ROOT,
  stdio: 'inherit',
});

child.on('exit', () => {
  let report = null;
  try { report = JSON.parse(fs.readFileSync(REPORT, 'utf8')); } catch { /* no report */ }

  if (!report) {
    console.error('\x1b[31m未取得运行时自检报告\x1b[0m');
    process.exit(1);
  }

  const failed = (report.reports || []).filter((r) => !r.ok);
  if (failed.length) {
    console.log(`\x1b[31m${failed.length} / ${report.reports.length} 轮未通过\x1b[0m`);
    process.exit(1);
  }
  console.log('\x1b[32m全部运行时检查通过。\x1b[0m');
  process.exit(0);
});
