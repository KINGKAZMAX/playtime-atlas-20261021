/**
 * Driver for the in-ego measurement scripts.
 *
 * The project's single browser entry point is ego-browser (see the project
 * convention: all website access, screenshots and online verification go
 * through it — never a separately launched Chromium). This driver is plain
 * Node: it runs an ego-browser script, then turns the JSON report that
 * script writes into a process exit code.
 *
 * Usage: node scripts/run-ego.mjs scripts/ego/diagnose.mjs
 *        node scripts/run-ego.mjs scripts/ego/qa-runtime.mjs
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EGO = process.env.EGO_BROWSER || '/Users/mekzenx2/.local/bin/ego-browser';

const arg = process.argv[2];
if (!arg) {
  console.error('用法：node scripts/run-ego.mjs <script.mjs>');
  process.exit(2);
}

const script = path.isAbsolute(arg) ? arg : path.join(ROOT, arg);
if (!fs.existsSync(script)) {
  console.error(`找不到脚本：${script}`);
  process.exit(2);
}
if (!fs.existsSync(EGO)) {
  console.error(`找不到 ego-browser：${EGO}`);
  process.exit(2);
}

const code = `await import(${JSON.stringify(pathToFileURL(script).href)});`;
const child = spawn(EGO, ['nodejs', '-e', code], {
  cwd: ROOT,
  stdio: 'inherit',
  env: { ...process.env },
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`ego-browser 被信号 ${signal} 终止`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
