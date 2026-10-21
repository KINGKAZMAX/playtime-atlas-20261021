#!/usr/bin/env node
/**
 * 清理构建产物中的系统垃圾文件（.DS_Store）
 * macOS 会在浏览目录时自动生成 .DS_Store；public/ 下的会被原样复制进 dist/。
 * 这里在构建后统一剔除，避免把系统元数据带进发布产物。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');

let removed = 0;
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === '.DS_Store') { fs.rmSync(full); removed += 1; }
  }
}
walk(DIST);
console.log(removed ? `· 清理 dist/ 中 ${removed} 个 .DS_Store` : '· dist/ 无 .DS_Store');
