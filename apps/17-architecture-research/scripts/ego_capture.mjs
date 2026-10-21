#!/usr/bin/env node
/**
 * ego_capture.mjs — 用 **Ego 浏览器**截图（任意地址：http / https / file）
 *
 * ⚠️ 浏览器入口约定（用户长期约定，2026-10-22 起对所有任务生效）：
 *    一切网页访问与截图**只走 Ego 浏览器**（/Users/mekzenx2/.local/bin/ego-browser）。
 *    本脚本**替代**此前的 `capture.sh`（本机无头 Chrome）与 `capture_cdp.mjs`
 *    （原生 CDP）—— 后两者已按约定停用并移除。
 *
 * Ego 实测要点：
 *   ① nodejs 进程**无 argv、不继承环境变量** → 本文件是普通 Node 包装器，
 *      读取命令行参数后生成一次性 .mjs 交给 `ego-browser nodejs`；
 *   ② 视口必须 `mobile: true` → 否则 Chromium 把 1440 放大成 1600；
 *   ③ 截图路径必须**绝对路径**；
 *   ④ 目标站若长时间不触发 `load`（如 Lottie / 常驻动画），`goto` 会超时 →
 *      改用 `waitUntil: "domcontentloaded"` + 静置等待；
 *   ⑤ **失败不得伪装成成功**：先删除目标文件，再以 Ego 返回的 `ok` 字段判定，
 *      避免旧文件残留时把「本次没截到」误报为「已截图」。
 *
 * 用法：
 *   node scripts/ego_capture.mjs --url <地址> --out <绝对路径.png> \
 *        [--width 1440] [--height 900] [--mobile] [--scheme light|dark] \
 *        [--settle 1500] [--space "17-architecture ego-capture"] [--space-id <id>]
 *
 * 退出码：0 = 成功，1 = 失败，2 = 参数/环境错误。
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

const argv = process.argv.slice(2);
const argOf = (k, dflt = null) => {
  const eq = argv.find((a) => a.startsWith(`--${k}=`));
  if (eq) return eq.slice(k.length + 3);
  const i = argv.indexOf(`--${k}`);
  if (i !== -1 && i + 1 < argv.length && !argv[i + 1].startsWith("--")) return argv[i + 1];
  return dflt;
};
const hasFlag = (k) => argv.includes(`--${k}`);

const url = argOf("url");
const out = argOf("out");
if (!url || !out) {
  console.error("用法：node scripts/ego_capture.mjs --url <地址> --out <绝对路径.png> [...]");
  process.exit(2);
}
const outAbs = path.resolve(out);
const width = Number(argOf("width", "1440"));
const height = Number(argOf("height", "900"));
const mobile = hasFlag("mobile");
const scheme = argOf("scheme", "light");
const settle = Number(argOf("settle", "1500"));
const spaceName = argOf("space", "17-architecture ego-capture");
const spaceId = argOf("space-id", null);

const egoScript = `
const task = await taskSpace(${spaceId ? Number(spaceId) : JSON.stringify(spaceName)});
const page = task.page("p1");
const OUT = ${JSON.stringify(outAbs)};
let result = { ok: false, url: ${JSON.stringify(url)}, stage: "start" };
try {
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width: ${width}, height: ${height},
    deviceScaleFactor: ${mobile ? 2 : 1}, mobile: true,
  });
  await page.cdp("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: ${JSON.stringify(scheme)} }],
  });
  result.stage = "goto";
  // 目标站可能长时间不触发 load（Lottie / 常驻动画）→ 用 domcontentloaded + 静置
  await page.goto(${JSON.stringify(url)}, { timeout: 45000, waitUntil: "domcontentloaded" });
  result.stage = "settle";
  await new Promise((r) => setTimeout(r, ${settle}));
  result.stage = "measure";
  const vw = await page.evaluate(() => window.innerWidth);
  const vh = await page.evaluate(() => window.innerHeight);
  const title = await page.evaluate(() => document.title);
  // 取主文档 HTTP 状态码：避免把 404 / 500 错误页当成目标页截下来
  const status = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0];
    return n && typeof n.responseStatus === "number" ? n.responseStatus : null;
  });
  result.stage = "screenshot";
  await page.screenshot({ path: OUT });
  result = { ok: true, url: ${JSON.stringify(url)}, innerWidth: vw, innerHeight: vh, title, status, shot: OUT };
} catch (e) {
  result = { ok: false, url: ${JSON.stringify(url)}, stage: result.stage, error: String((e && e.message) || e).slice(0, 300) };
}
console.log("__EGO_RESULT__" + JSON.stringify(result));
await task.finish({ keep: [] });
`;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ego-17-cap-"));
const scriptPath = path.join(tmpDir, "capture.mjs");
fs.writeFileSync(scriptPath, egoScript, "utf8");
fs.mkdirSync(path.dirname(outAbs), { recursive: true });

const egoBin = process.env.EGO_BROWSER_BIN || "/Users/mekzenx2/.local/bin/ego-browser";
if (!fs.existsSync(egoBin)) {
  console.error("找不到 ego-browser：", egoBin);
  process.exit(2);
}

// 失败不得伪装成成功：先删掉旧文件，残留即代表本次没截到
if (fs.existsSync(outAbs)) fs.rmSync(outAbs, { force: true });

const res = spawnSync(egoBin, ["nodejs"], {
  input: fs.readFileSync(scriptPath, "utf8"),
  // ⚠️ ego-browser 的 nodejs 运行时把脚本的 console.log 写到 **stderr**，
  //    stdout 可能为空 → 两个流都要收下来再找回报标记
  stdio: ["pipe", "pipe", "pipe"],
  encoding: "utf8",
});
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* 忽略 */ }

if (res.status !== 0) {
  console.error("Ego 截图失败（退出码 " + res.status + "）");
  console.error((res.stderr || "").slice(-600));
  process.exit(1);
}

// 解析 Ego 回报的本次截图结果（stdout + stderr 都要找）
const streams = `${res.stdout || ""}\n${res.stderr || ""}`;
const marker = streams.split("\n").find((l) => l.includes("__EGO_RESULT__"));
if (!marker) {
  console.error("Ego 未回报截图结果（无 __EGO_RESULT__ 标记），按失败处理：\n" + streams.slice(-600));
  process.exit(1);
}
let result;
try {
  result = JSON.parse(marker.slice(marker.indexOf("__EGO_RESULT__") + "__EGO_RESULT__".length));
} catch (e) {
  console.error("Ego 回报解析失败：" + String(e));
  process.exit(1);
}
if (!result.ok) {
  console.error("Ego 截图失败：stage=" + result.stage + " " + (result.error || ""));
  console.error("（目标文件已删除，未产出任何截图）");
  if (fs.existsSync(outAbs)) fs.rmSync(outAbs, { force: true });
  process.exit(1);
}
if (result.status !== null && result.status !== undefined && Number(result.status) >= 400) {
  console.error("目标页 HTTP " + result.status + "（错误页，不作为取证截图）：" + result.url);
  console.error("（目标文件已删除，未产出任何截图）");
  if (fs.existsSync(outAbs)) fs.rmSync(outAbs, { force: true });
  process.exit(1);
}
if (!fs.existsSync(outAbs) || fs.statSync(outAbs).size <= 0) {
  console.error("Ego 截图未产出有效文件：" + outAbs);
  process.exit(1);
}
console.log("OK  " + path.relative(ROOT, outAbs) + "  " + fs.statSync(outAbs).size + " bytes  "
  + width + "x" + height + (mobile ? " @2x" : "") + "  " + scheme
  + "  inner=" + result.innerWidth + "x" + result.innerHeight
  + "  http=" + result.status
  + "  title=" + JSON.stringify(result.title || ""));
process.exit(0);
