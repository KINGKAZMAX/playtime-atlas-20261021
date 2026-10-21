#!/usr/bin/env node
/**
 * 构建产物自检
 * ------------------------------------------------------------------
 * 检查 dist/ 是否满足发布要求：
 *  1. index.html 存在
 *  2. 产物中不含指向外部 CDN / API 的资源引用
 *  3. 字体已本地化到 dist/fonts/
 *  4. 不含凭据、密钥等敏感文件
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const failures = [];
const warnings = [];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error('✗ dist/index.html 不存在 —— 请先执行 npm run build');
  process.exit(1);
}

const files = walk(DIST);
console.log(`检查 dist/ 共 ${files.length} 个文件`);

// 2) 外部引用检查
const EXTERNAL = /(?:src|href)\s*=\s*["'](https?:)?\/\/([^"'/]+)/gi;
const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1']);

for (const file of files) {
  if (!/\.(html|css|js|json)$/i.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  let m;
  EXTERNAL.lastIndex = 0;
  while ((m = EXTERNAL.exec(text)) !== null) {
    const host = m[2];
    if (!ALLOWED_HOSTS.has(host)) {
      failures.push(`${path.relative(DIST, file)} → 外部引用 http(s)://${host}`);
    }
  }
}

// 3) 字体本地化
const fontDir = path.join(DIST, 'fonts');
if (!fs.existsSync(fontDir)) {
  failures.push('dist/fonts/ 不存在 —— 字体未本地化');
} else {
  const fonts = fs.readdirSync(fontDir);
  console.log(`  字体：${fonts.join(', ')}`);
  if (!fonts.some((f) => f.endsWith('.woff2'))) failures.push('dist/fonts/ 中没有 woff2 字体文件');
}

// 4) 敏感文件
const SENSITIVE = /(^|\/)(\.env|\.env\..*|.*\.pem|.*\.key|id_rsa.*|credentials.*|.*\.log)$/i;
for (const file of files) {
  if (SENSITIVE.test(file)) failures.push(`产物中包含敏感文件：${path.relative(DIST, file)}`);
}

// 5) 体积报告
let total = 0;
for (const file of files) total += fs.statSync(file).size;
console.log(`  产物体积：${(total / 1024).toFixed(1)} KB`);

if (warnings.length) {
  console.log('\n警告：');
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (failures.length) {
  console.error('\n✗ 自检未通过：');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('\n✓ 自检通过：无外部资源引用，字体已本地化，产物中无敏感文件。');
