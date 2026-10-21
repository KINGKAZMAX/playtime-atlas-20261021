#!/usr/bin/env node
/**
 * 设计系统机械验收 —— **已停用的无头 Chrome 入口（保留为转交壳）**
 * --------------------------------------------------------------------------
 * 2026-10-22 起，本目录的浏览器验收**一律走 Ego 浏览器**
 * （用户长期约定：禁止本地另起 Playwright / Chromium / Chrome + CDP）。
 * 本文件原先自带 headless Chrome + 原生 CDP，现已移除浏览器启动逻辑，
 * 改为把调用**转交**给 Ego 驱动 `scripts/verify-ds-ego.mjs`。
 *
 * 为什么不直接删：
 *   批次内其他脚本或 13-qa-curation 可能仍以 `node scripts/verify-ds.mjs` 调用，
 *   保留一个同入同出的转交壳可以让这些调用不报错，同时不再违反浏览器入口约定。
 *
 * 用法（与旧版兼容）：
 *   PRISM_BASE="http://127.0.0.1:4399/repo/prism-era" node scripts/verify-ds.mjs
 *
 * 想直接跑 Ego 驱动：
 *   ego-browser nodejs -e "await import('file:///<绝对路径>/scripts/verify-ds-ego.mjs')"
 *
 * 退出码：0 = 无失败项（允许警告）；1 = 存在失败项；2 = 环境或服务不可用。
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CONFIG_FILE = path.join(HERE, 'ds-verify.config.json');
const EGO_DRIVER = path.join(HERE, 'verify-ds-ego.mjs');
const EGO_BIN = process.env.EGO_BROWSER_BIN || '/Users/mekzenx2/.local/bin/ego-browser';

console.log('⚠️  scripts/verify-ds.mjs 的无头 Chrome 实现已停用（用户长期约定：浏览器只走 Ego）。');
console.log('   本次调用已转交 scripts/verify-ds-ego.mjs（Ego 驱动）。');

// Ego 的 nodejs 进程不继承环境变量，也没有 argv —— 目标地址必须写进配置文件。
const base = (process.env.PRISM_BASE || '').trim();
if (base) {
  const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  cfg.base = base.replace(/\/+$/, '');
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2) + '\n', 'utf8');
  console.log('   目标地址：', cfg.base);
}

if (!fs.existsSync(EGO_BIN)) {
  console.error('❌ 找不到 ego-browser：', EGO_BIN);
  console.error('   请先运行 `ego-browser skill` 阅读当前版本指南。');
  process.exit(2);
}

const driverUrl = encodeURI('file://' + EGO_DRIVER);
// 注意：路径含中文时**不能**把 import 语句放进 `-e` 参数 —— Ego 的参数处理会把
// 非 ASCII 弄坏，表现为「无任何输出 + 退出码 1」。改走 stdin，并把 file URL
// 做百分号编码（纯 ASCII）。
const bootstrap = `await import(${JSON.stringify(driverUrl)});\n`;
const res = spawnSync(EGO_BIN, ['nodejs'], {
  input: bootstrap,
  stdio: ['pipe', 'inherit', 'inherit'],
  encoding: 'utf8',
});

process.exit(res.status === null ? 2 : res.status);
