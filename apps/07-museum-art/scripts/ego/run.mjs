#!/usr/bin/env node
/**
 * Ego 验收包装器 —— 07-museum-art 的浏览器验收统一入口。
 *
 * 为什么要有这一层（与批次共享的 tools/ego-qa/run.mjs 同构）：
 *   1. Ego 的 nodejs 进程**没有 argv、也不继承 shell 环境变量**，
 *      配置必须写进脚本；这里负责把 CLI 参数烘进一次性 .mjs。
 *   2. 验收需要一个本地静态服务器托管 dist/（含 .glb / .woff2 等 MIME），
 *      服务器必须在 Ego 进程运行期间存活，跑完立即关闭，不留常驻进程。
 *   3. 本包按批次约束**不再另起 Playwright / Chromium / Chrome**，
 *      所有浏览器动作都走用户自己的 Ego 浏览器。
 *
 * 用法：
 *   node scripts/ego/run.mjs --script scripts/ego/qa-page.mjs \
 *     --target dist --out evidence/ego --label 07-museum-art
 *
 * 退出码：0 = PASS，1 = FAIL，2 = 参数/环境错误。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { startServer } from "../lib/server.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");

const args = process.argv.slice(2);
const argOf = (k, dflt = null) => {
  const eq = args.find((a) => a.startsWith(`--${k}=`));
  if (eq) return eq.slice(k.length + 3);
  const i = args.indexOf(`--${k}`);
  if (i !== -1 && i + 1 < args.length && !args[i + 1].startsWith("--")) return args[i + 1];
  return dflt;
};

const scriptArg = argOf("script");
if (!scriptArg) {
  console.error("缺少 --script=<Ego 侧脚本路径>");
  process.exit(2);
}
const scriptPath = path.resolve(ROOT, scriptArg);
if (!fs.existsSync(scriptPath)) {
  console.error("找不到脚本：", scriptPath);
  process.exit(2);
}

const targetDir = path.resolve(ROOT, argOf("target", "dist"));
if (!fs.existsSync(path.join(targetDir, "index.html"))) {
  console.error(`缺少 ${targetDir}/index.html，请先执行 npm run build`);
  process.exit(2);
}

const outDir = path.resolve(ROOT, argOf("out", "evidence/ego"));
const label = argOf("label", "07-museum-art");
const spaceName = argOf("space", "07-museum-art ego-qa");
const port = Number(argOf("port", "0"));
/** 模拟线上子路径：/playtime-atlas-20261021/exhibits/07-museum-art */
const prefix = argOf("prefix", "");

/** 端口被占用时退回随机端口，避免验收因环境残留端口而失败 */
let server = null;
let realPort = 0;
for (const p of port === 0 ? [0] : [port, 0]) {
  try {
    const s = await startServer(targetDir, p, prefix);
    server = s.server;
    realPort = s.port;
    break;
  } catch (e) {
    if (p !== 0) console.warn(`  ! 端口 ${p} 不可用（${e.code || e.message}），改用随机端口`);
  }
}
if (!server) {
  console.error("无法启动本地静态服务器");
  process.exit(2);
}
const base = `http://127.0.0.1:${realPort}${prefix}`;
console.log(`· Ego 验收：${base}`);
console.log(`  space : ${spaceName}`);
console.log(`  输出  : ${path.relative(ROOT, outDir)}`);
console.log(`  脚本  : ${path.relative(ROOT, scriptPath)}`);

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas07-ego-"));
const genPath = path.join(tmpDir, "run-configured.mjs");
const moduleUrl = "file://" + scriptPath;
const config = {
  base,
  outDir,
  label,
  spaceName,
  targetDir,
  prefix,
};
fs.writeFileSync(
  genPath,
  `const mod = await import(${JSON.stringify(moduleUrl)});\n` +
    `const report = await mod.run(${JSON.stringify(config)});\n` +
    `console.log("\\n报告：", report.reportPath);\n` +
    `if (report.verdict && report.verdict !== "PASS") process.exit(1);\n`,
  "utf8",
);

/**
 * 必须用**异步** spawn —— 不能用 spawnSync。
 * spawnSync 会阻塞父进程的事件循环：本进程里的 HTTP 服务器就无法响应任何请求，
 * 浏览器连接会一直挂在「已连接但无响应」的状态，导航永远提交不了
 * （表现为 page.goto 超时 + 页面完全无响应）。
 * 批次共享的 tools/ego-qa/run.mjs 也用 spawnSync，但它的服务器由外部进程提供，
 * 所以没有这个坑 —— 本包自带服务器，必须避开。
 */
const egoBin = process.env.EGO_BROWSER_BIN || "/Users/mekzenx2/.local/bin/ego-browser";
if (!fs.existsSync(egoBin)) {
  console.error("找不到 ego-browser：", egoBin);
  server.close();
  process.exit(2);
}

const exitCode = await new Promise((resolve) => {
  const child = spawn(egoBin, ["nodejs"], {
    stdio: ["pipe", "inherit", "inherit"],
  });
  child.on("error", (e) => {
    console.error("ego-browser 启动失败：", e.message);
    resolve(2);
  });
  child.on("close", (code) => resolve(code === null ? 2 : code));
  child.stdin.end(fs.readFileSync(genPath, "utf8"));
});

server.close();
try {
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch {
  /* 临时目录清理失败不影响验收结论 */
}
process.exit(exitCode);