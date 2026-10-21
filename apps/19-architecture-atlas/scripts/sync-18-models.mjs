/**
 * Re-sync the vendored copy of 18-architecture-models.
 *
 * 19 consumes 18's unified model runtime and its six models directly: the
 * files under src/lab/core/ and src/lab/models/ are byte-for-byte copies of
 * 18's src/core/ and src/models/. They are vendored rather than imported so
 * that 19 builds and runs on its own, without npm-depending on a sibling
 * directory.
 *
 * Because the copy is a copy, it can drift. scripts/validate.mjs fails the
 * build when the two differ, so run this after 18 changes anything.
 *
 * Usage:
 *   node scripts/sync-18-models.mjs          copy 18 → 19
 *   node scripts/sync-18-models.mjs --check  report drift, change nothing
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UPSTREAM = path.join(ROOT, '..', '18-architecture-models', 'src');
const TARGET = path.join(ROOT, 'src', 'lab');
const SUBDIRS = ['core', 'models'];

const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(UPSTREAM)) {
  console.error(`找不到上游：${UPSTREAM}`);
  process.exit(2);
}

let copied = 0;
let drifted = 0;
const details = [];

for (const sub of SUBDIRS) {
  const from = path.join(UPSTREAM, sub);
  const to = path.join(TARGET, sub);
  if (!fs.existsSync(from)) { console.error(`上游缺少 ${sub}/`); process.exit(2); }
  fs.mkdirSync(to, { recursive: true });

  for (const name of fs.readdirSync(from)) {
    if (!name.endsWith('.js')) continue;
    const a = path.join(from, name);
    const b = path.join(to, name);
    const same = fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b));
    if (same) continue;
    drifted += 1;
    details.push(`${sub}/${name}`);
    if (!checkOnly) {
      fs.copyFileSync(a, b);
      copied += 1;
    }
  }
}

if (checkOnly) {
  if (drifted) {
    console.log(`❌ 与 18 有 ${drifted} 处差异：${details.join(', ')}`);
    console.log('   运行 node scripts/sync-18-models.mjs 重新同步');
    process.exit(1);
  }
  console.log('✅ 与 18-architecture-models 一致');
  process.exit(0);
}

console.log(`✅ 已同步 ${copied} 个文件 → src/lab/${drifted ? `（${details.join(', ')}）` : '（无变化）'}`);
