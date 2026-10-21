#!/usr/bin/env node
/**
 * run-ego-qa.mjs —— 调用**批次共享**的 Ego 验收工具，并按报告判定退出码。
 *
 * 为什么要包一层：共享工具 `tools/ego-qa/run.mjs` 的文档写明
 * 「退出码：0 = PASS，1 = FAIL，2 = 参数/环境错误」，但实测**报告判 FAIL 时退出码仍是 0**
 * —— 生成的临时脚本没有把 `report.verdict` 映射到退出码，CI 会误放行。
 * 共享目录不归本任务改，故在本目录包一层：跑完共享工具后读它产出的 JSON，
 * verdict 非 PASS 即以 1 退出。
 *
 * 用法：
 *   node scripts/run-ego-qa.mjs \
 *     --url http://127.0.0.1:4331/ \
 *     --out /abs/path/11-era-online/evidence/ego-qa \
 *     --require ".ds-topbar,.ds-footer" \
 *     --contrast "标题:.brand__title" \
 *     --font-selector ".brand__title"
 *
 * 其余参数（--space / --label / --viewport / --allow-external / --no-reduced-motion）
 * 原样透传给共享工具。
 *
 * 退出码：0 = PASS，1 = FAIL，2 = 参数/环境错误。
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SHARED = path.resolve(ROOT, "..", "tools", "ego-qa", "run.mjs");

const args = process.argv.slice(2);
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
if (!fs.existsSync(SHARED)) {
  console.error("找不到批次共享验收工具：", SHARED);
  process.exit(2);
}

const outDir = path.resolve(argOf("out", path.join(ROOT, "evidence", "ego-qa")));
const label = argOf("label", path.basename(ROOT));

// 透传其余参数
const passthrough = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--url" || a.startsWith("--url=")) {
    if (a === "--url") i++; // 跳过其值
    continue;
  }
  if (a === "--out" || a.startsWith("--out=")) {
    if (a === "--out") i++;
    continue;
  }
  if (a === "--label" || a.startsWith("--label=")) {
    if (a === "--label") i++;
    continue;
  }
  passthrough.push(a);
}

const cmd = [process.execPath, SHARED, "--url", url, "--out", outDir, "--label", label, ...passthrough];
console.log("→ 共享工具：", cmd.join(" "));
const res = spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit" });

// 共享工具不把 verdict 映射到退出码，这里按报告 JSON 判定
const reportPath = path.join(outDir, `${label}.json`);
if (!fs.existsSync(reportPath)) {
  console.error("未找到报告文件：", reportPath);
  process.exit(2);
}
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const errors = (report.errors || []).length;
const warnings = (report.warnings || []).length;
console.log(`\n报告判定：${report.verdict} — errors ${errors} / warnings ${warnings}`);
console.log("报告路径：", reportPath);

if (report.verdict === "PASS") process.exit(0);
process.exit(1);
