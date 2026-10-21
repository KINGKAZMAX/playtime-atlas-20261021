#!/usr/bin/env node
/**
 * run-ego-acceptance.mjs —— 用**普通 node** 调用 Ego 版实机验收。
 *
 * 为什么要包一层：Ego 的 nodejs 进程**没有 argv、也不继承环境变量**
 * （见 tools/ego-qa/MIGRATION.md 硬约束 ①），所以配置必须写进脚本。
 * 本包装器负责：读命令行参数 → 生成一次性临时 .mjs →
 * `ego-browser nodejs < 脚本内容` → 按**断言结果**映射退出码。
 *
 * 用法：
 *   node scripts/run-ego-acceptance.mjs \
 *     --url http://127.0.0.1:4332/ \
 *     --out /abs/path/11-era-online/evidence/ego-acceptance \
 *     --shot-dir /abs/path/11-era-online/evidence/ego-acceptance/screenshots \
 *     --space linkdawn-era-online-acceptance \
 *     --label linkdawn-era-online
 *
 * 退出码：
 *   0 = 全部断言通过
 *   1 = 有断言未通过
 *   2 = 环境 / 参数错误
 * （退出码**必须**反映断言结果 —— 批次共享工具 tools/ego-qa/run.mjs
 *   没把 verdict 映射到退出码，本包装器不照抄那个缺陷。）
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ACCEPTANCE = path.join(HERE, "ego-acceptance.mjs");
const EGO = "/Users/mekzenx2/.local/bin/ego-browser";

const args = process.argv.slice(2);
/** 同时支持 `--key=value` 与 `--key value` 两种写法。 */
const argOf = (k, dflt = null) => {
  const eq = args.find((a) => a.startsWith(`--${k}=`));
  if (eq) return eq.slice(k.length + 3);
  const i = args.indexOf(`--${k}`);
  if (i !== -1 && i + 1 < args.length && !args[i + 1].startsWith("--")) return args[i + 1];
  return dflt;
};

const url = argOf("url");
if (!url) {
  console.error("缺少 --url=<地址>");
  process.exit(2);
}
if (!fs.existsSync(ACCEPTANCE)) {
  console.error("找不到验收模块：", ACCEPTANCE);
  process.exit(2);
}
if (!fs.existsSync(EGO)) {
  console.error("找不到 ego-browser：", EGO);
  process.exit(2);
}

const outDir = path.resolve(argOf("out", path.join(HERE, "..", "evidence", "ego-acceptance")));
const shotDir = path.resolve(argOf("shot-dir", path.join(outDir, "screenshots")));
const spaceName = argOf("space", "linkdawn-era-online-acceptance");
const label = argOf("label", "linkdawn-era-online");

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(shotDir, { recursive: true });

// Ego 的 nodejs 进程没有 argv / 环境变量 —— 配置必须写进脚本内容。
const script = [
  `const { runEgoAcceptance } = await import(${JSON.stringify("file://" + ACCEPTANCE)});`,
  `const r = await runEgoAcceptance(${JSON.stringify({ url, spaceName, outDir, shotDir, label })});`,
  `console.log("__EGO_RESULT__" + JSON.stringify({ passed: r.passed, failed: r.failed, total: r.total, reportPath: r.reportPath }));`,
].join("\n");

const tmpFile = path.join(os.tmpdir(), `ego-acceptance-${Date.now()}-${process.pid}.mjs`);
fs.writeFileSync(tmpFile, script, "utf8");
console.log(`→ Ego 验收：${url}`);
console.log(`  space=${spaceName}`);
console.log(`  out=${outDir}`);
console.log(`  shots=${shotDir}`);

// 先清掉上一轮的报告，避免中途失败时读到**旧**报告当成新结果
const reportPath = path.join(outDir, "qa-ego-acceptance.json");
const errPath = path.join(outDir, "qa-ego-acceptance.error.json");
for (const p of [reportPath, errPath]) {
  try {
    fs.unlinkSync(p);
  } catch {
    /* 没有旧文件就不用管 */
  }
}

let res;
try {
  res = spawnSync(EGO, ["nodejs"], {
    input: script,
    stdio: ["pipe", "inherit", "inherit"],
    encoding: "utf8",
  });
} finally {
  try {
    fs.unlinkSync(tmpFile);
  } catch {
    /* 临时文件清不掉不影响结论 */
  }
}

if (res.error) {
  console.error("调用 ego-browser 失败：", res.error.message);
  process.exit(2);
}

// 中途致命错误：模块会写错误侧车文件
if (fs.existsSync(errPath)) {
  let err = {};
  try {
    err = JSON.parse(fs.readFileSync(errPath, "utf8"));
  } catch {
    /* 侧车读不出来也按环境错误处理 */
  }
  console.error(`\n验收中途致命错误：${err.error || "未知错误"}`);
  if (err.completedChecks !== undefined) {
    console.error(`  已完成断言：${err.completedChecks} 项（未跑完 53 项）`);
  }
  process.exit(2);
}

if (res.status === null || res.status === undefined) {
  console.error(`ego-browser 未正常退出（signal=${res.signal}）`);
  process.exit(2);
}

// 以**报告文件**为准判定退出码（进程退出码只反映运行是否成功跑完）
if (!fs.existsSync(reportPath)) {
  console.error("未找到验收报告：", reportPath);
  process.exit(2);
}
let report;
try {
  report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
} catch (e) {
  console.error("验收报告无法解析：", e.message);
  process.exit(2);
}
if (!Array.isArray(report)) {
  console.error("验收报告格式异常（应为 [{name, ok, detail}] 数组）");
  process.exit(2);
}
if (report.length !== 53) {
  console.error(`验收报告只有 ${report.length} 项断言（应为 53 项），判定为运行未完成`);
  process.exit(2);
}
const failed = report.filter((r) => !r.ok);
console.log(`\n报告判定：${report.length - failed.length}/${report.length} 通过`);
console.log(`报告路径：${reportPath}`);
if (failed.length) {
  console.log("未通过：");
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? " :: " + f.detail : ""}`);
}
process.exit(failed.length ? 1 : 0);
