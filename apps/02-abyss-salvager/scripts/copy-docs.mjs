#!/usr/bin/env node
/**
 * 构建后把来源与许可文档复制进 dist/。
 *
 * 说明页 notes.html 直接链接 SOURCE.md / LICENSES.md / CHANGELOG.md，
 * 而发布链路只搬运 dist/，因此这三份文档必须先进入 dist，
 * 否则线上说明页的链接会 404（13 的「无 404」检查会命中）。
 *
 *   node scripts/copy-docs.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'dist');

const DOCS = ['SOURCE.md', 'LICENSES.md', 'CHANGELOG.md', 'manifest.json', 'RESTYLE-MAP.md'];

if (!fs.existsSync(DIST)) {
  console.error('[copy-docs] dist/ 不存在，请先执行 vite build');
  process.exit(1);
}

let n = 0;
for (const name of DOCS) {
  const src = path.join(ROOT, name);
  if (!fs.existsSync(src)) {
    // 发布流水线的同步白名单（14-publish/release/scripts/sync-apps.mjs 的
    // ALLOW_FILES）只放行 SOURCE.md / LICENSES.md / manifest.json，
    // CHANGELOG.md 与 RESTYLE-MAP.md 不在其列，因此线上产物里没有这两份是**预期**的。
    // 说明页只链接 SOURCE.md 与 LICENSES.md（两者都在白名单内），因此不会 404。
    console.log(`[copy-docs] 跳过（发布同步白名单未包含）：${name}`);
    continue;
  }
  fs.copyFileSync(src, path.join(DIST, name));
  n++;
}
console.log(`[copy-docs] 已复制 ${n} 份文档到 dist/`);

/* 清理 macOS 垃圾文件：public/ 下的 .DS_Store 会被 Vite 原样复制进 dist，
   随发布链路进入线上产物，属于不该出现的杂项。 */
let cleaned = 0;
const sweep = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sweep(full);
    else if (entry.name === '.DS_Store') {
      fs.rmSync(full, { force: true });
      cleaned++;
    }
  }
};
sweep(DIST);
if (cleaned) console.log(`[copy-docs] 已清理 dist/ 中 ${cleaned} 个 .DS_Store`);
