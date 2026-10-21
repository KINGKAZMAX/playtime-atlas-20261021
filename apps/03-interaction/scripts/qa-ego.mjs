#!/usr/bin/env node
/**
 * Ego 验收入口 —— 把 scripts/qa-smoke-ego.mjs 交给 **Ego 浏览器**执行。
 * ---------------------------------------------------------------------------
 * 为什么要包一层（三条实测得来的原因）：
 *   1. Ego 的 nodejs 进程**不继承 shell 环境变量、也没有 argv**，工作目录固定为 '/'，
 *      脚本经 stdin 进入时是 eval 模式 —— 相对 import 与 import.meta.url 都不可用。
 *      因此绝对路径必须由普通 node 侧算好后注入脚本。
 *   2. Ego 的 nodejs 进程**开不了本地监听端口**（实测：进程会在 listen 之后
 *      静默退出，无报错、无堆栈）。所以静态服务器必须由**本包装器**在普通
 *      node 进程里起好，Ego 只负责访问。
 *   3. 端口由系统随机分配 → 每次都是**全新 origin** → localStorage 天然为空
 *      = 首访态，不需要清理用户浏览器数据。
 *
 * （与 16-design-system/tools/ego-qa/run.mjs 同一模式：包装器负责把
 *   「绝对路径 + 目标地址」写进脚本，再交给 Ego。）
 *
 * 跑法：node scripts/qa-ego.mjs   （或 npm run qa:ego）
 * 退出码：0 = 全部通过，1 = 有失败项，2 = 环境/参数错误。
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC = path.join(HERE, 'qa-smoke-ego.mjs');
const EGO = process.env.EGO_BROWSER_BIN || '/Users/mekzenx2/.local/bin/ego-browser';

if (!fs.existsSync(SRC)) {
  console.error('[qa-ego] 找不到 scripts/qa-smoke-ego.mjs');
  process.exit(2);
}
if (!fs.existsSync(EGO)) {
  console.error('[qa-ego] 找不到 ego-browser：', EGO);
  console.error('[qa-ego] 可用 EGO_BROWSER_BIN 环境变量指定路径');
  process.exit(2);
}
if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
  console.error('[qa-ego] 未找到 dist/index.html，请先执行：npm run build');
  process.exit(2);
}

const server = await startServer({ root: path.join(ROOT, 'dist'), port: 0 });
console.log(`[qa-ego] 项目根：${ROOT}`);
console.log(`[qa-ego] 临时服务器：${server.url}（随机端口 → 全新 origin → 首访态）`);

const code = fs
  .readFileSync(SRC, 'utf8')
  .replaceAll('__LOOMDECK_ROOT__', JSON.stringify(ROOT))
  .replaceAll('__LOOMDECK_URL__', JSON.stringify(server.url));

/* 落一份临时副本便于事后排查（Ego 仍从 stdin 读取） */
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'loomdeck-ego-qa-'));
const tmpScript = path.join(tmpDir, 'qa-smoke-ego.mjs');
fs.writeFileSync(tmpScript, code, 'utf8');
console.log(`[qa-ego] 临时脚本：${tmpScript}`);

let status = 2;
try {
  const res = spawnSync(EGO, ['nodejs'], {
    input: code,
    stdio: ['pipe', 'inherit', 'inherit'],
    encoding: 'utf8',
  });
  status = res.status === null ? 2 : res.status;
} finally {
  await server.close();
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    /* 临时目录清理失败不影响验收结论 */
  }
}

process.exit(status);
