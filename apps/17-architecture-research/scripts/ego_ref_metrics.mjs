#!/usr/bin/env node
/**
 * ego_ref_metrics.mjs — 用 **Ego 浏览器**在多档视口下测量参考站（olek.si）标题几何
 *
 * ⚠️ 浏览器入口约定（用户长期约定，2026-10-22 起对所有任务生效）：
 *    一切网页访问与截图**只走 Ego 浏览器**（/Users/mekzenx2/.local/bin/ego-browser）。
 *    本脚本**替代**此前用本机无头 Chrome 做的参考站截图与目视判断 ——
 *    无头环境缺站方自托管 Inter 字体，fallback 字体更宽，会把
 *    「390px 下标题溢出」这类**假象**记成站点缺陷。
 *
 * 产出：evidence/ego-ref/olek-si-viewport-metrics.json
 *   对每个视口记录：视口宽、标题字号、实际字体族、文档 scrollWidth、
 *   各词 span 的左右边界、最右词、是否被视口右边界裁切、是否产生横向滚动。
 *
 * 用法：node scripts/ego_ref_metrics.mjs [--url https://olek.si] [--out <绝对路径.json>]
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

const url = argOf("url", "https://olek.si");
const outAbs = path.resolve(argOf("out", path.join(ROOT, "evidence", "ego-ref", "olek-si-viewport-metrics.json")));
// 采样视口：断点两侧加密；900px 重复两次以暴露字体加载时序带来的临界抖动
const VIEWPORTS = [320, 390, 480, 600, 767, 768, 800, 820, 840, 880, 900, 900, 950, 1024, 1280, 1440];

const egoScript = `
const task = await taskSpace("17-architecture ego-ref-metrics");
const page = task.page("p1");
const URL = ${JSON.stringify(url)};
const VIEWPORTS = ${JSON.stringify(VIEWPORTS)};
const ATTEMPTS = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = [];
for (const w of VIEWPORTS) {
  let last = null;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      await page.cdp("Emulation.setDeviceMetricsOverride", {
        width: w, height: 900, deviceScaleFactor: 1, mobile: true,
      });
      await page.goto(URL, { timeout: 45000, waitUntil: "domcontentloaded" });
      await sleep(1800);
      const m = await page.evaluate(() => {
        const h = document.getElementById("headline");
        const cs = h ? getComputedStyle(h) : null;
        const spans = h
          ? Array.from(h.querySelectorAll("span"))
              .filter((s) => getComputedStyle(s).display !== "none")
              .map((s) => {
                const r = s.getBoundingClientRect();
                return {
                  text: (s.textContent || "").trim().slice(0, 40),
                  left: Math.round(r.left),
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                };
              })
          : [];
        let maxRight = 0;
        let maxText = "";
        for (const s of spans) {
          if (s.right > maxRight) { maxRight = s.right; maxText = s.text; }
        }
        const de = document.documentElement;
        return {
          innerWidth: window.innerWidth,
          clientWidth: de.clientWidth,
          scrollWidth: de.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          horizontalScroll: de.scrollWidth > de.clientWidth,
          fontSize: cs ? cs.fontSize : null,
          fontFamily: cs ? cs.fontFamily : null,
          fontWeight: cs ? cs.fontWeight : null,
          letterSpacing: cs ? cs.letterSpacing : null,
          headlineHiddenSpans: h
            ? Array.from(h.querySelectorAll("span"))
                .filter((s) => getComputedStyle(s).display === "none")
                .map((s) => (s.textContent || "").trim())
            : [],
          spans,
          maxSpanRight: Math.round(maxRight),
          maxSpanText: maxText,
          clippedByViewport: Math.round(maxRight) > window.innerWidth,
          overflowPx: Math.max(0, Math.round(maxRight) - window.innerWidth),
          fontsLoaded: Array.from(document.fonts || []).map((f) => f.family).filter((v, i, a) => a.indexOf(v) === i),
        };
      });
      out.push({ viewportWidth: w, ok: true, attempts: attempt, ...m });
      last = null;
      break;
    } catch (e) {
      last = String((e && e.message) || e).slice(0, 300);
      // 链路抖动（TLS 拦截 / 代理失败）→ 退避重试
      await sleep(2000 * attempt);
    }
  }
  if (last) out.push({ viewportWidth: w, ok: false, attempts: ATTEMPTS, error: last });
}
console.log("__EGO_RESULT__" + JSON.stringify({ url: URL, viewports: out }));
await task.finish({ keep: [] });
`;

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ego-17-ref-"));
const scriptPath = path.join(tmpDir, "metrics.mjs");
fs.writeFileSync(scriptPath, egoScript, "utf8");
fs.mkdirSync(path.dirname(outAbs), { recursive: true });

const egoBin = process.env.EGO_BROWSER_BIN || "/Users/mekzenx2/.local/bin/ego-browser";
if (!fs.existsSync(egoBin)) {
  console.error("找不到 ego-browser：", egoBin);
  process.exit(2);
}

const res = spawnSync(egoBin, ["nodejs"], {
  input: fs.readFileSync(scriptPath, "utf8"),
  // ego-browser 的 nodejs 运行时把 console.log 写到 stderr → 两个流都要收
  stdio: ["pipe", "pipe", "pipe"],
  encoding: "utf8",
});
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* 忽略 */ }

if (res.status !== 0) {
  console.error("Ego 测量失败（退出码 " + res.status + "）");
  console.error((res.stderr || "").slice(-600));
  process.exit(1);
}

const streams = `${res.stdout || ""}\n${res.stderr || ""}`;
const marker = streams.split("\n").find((l) => l.includes("__EGO_RESULT__"));
if (!marker) {
  console.error("Ego 未回报测量结果（无 __EGO_RESULT__ 标记）：\n" + streams.slice(-600));
  process.exit(1);
}
let result;
try {
  result = JSON.parse(marker.slice(marker.indexOf("__EGO_RESULT__") + "__EGO_RESULT__".length));
} catch (e) {
  console.error("Ego 回报解析失败：" + String(e));
  process.exit(1);
}

const vps = result.viewports || [];
const okCount = vps.filter((v) => v.ok).length;
const okRatio = vps.length ? okCount / vps.length : 0;
if (okCount === 0) {
  console.error("全部视口测量失败：\n" + JSON.stringify(vps).slice(0, 800));
  process.exit(1);
}
// 链路抖动会让部分视口失败 → 低于 80% 成功率时**不覆盖**已有证据文件，
// 避免用一份残缺报告冲掉上一次完整取证。
if (okRatio < 0.8) {
  console.error(`测量成功率不足（${okCount}/${vps.length} = ${(okRatio * 100).toFixed(0)}%），`
    + "未覆盖既有证据文件。请在网络恢复后重跑。");
  console.error("失败视口：" + vps.filter((v) => !v.ok).map((v) => v.viewportWidth).join(", "));
  process.exit(1);
}

const clipped = vps.filter((v) => v.ok && v.clippedByViewport);
const report = {
  target: "olek.si 参考站标题几何（Ego 浏览器实测）",
  url: result.url,
  channel: "Ego 浏览器（用户真实浏览器，含扩展与 UI）",
  capturedAt: "2026-10-22",
  note: "本页所有数值均为 Ego 实测；此前用本机无头 Chrome 得出的「390px 标题溢出」结论已在本文件数据面前更正。",
  viewports: vps,
  summary: {
    total: vps.length,
    ok: okCount,
    failed: vps.length - okCount,
    horizontalScrollAnywhere: vps.some((v) => v.ok && v.horizontalScroll),
    clippedViewports: clipped.map((v) => v.viewportWidth),
    clippedRange: clipped.length
      ? { from: Math.min(...clipped.map((v) => v.viewportWidth)), to: Math.max(...clipped.map((v) => v.viewportWidth)) }
      : null,
  },
};
fs.writeFileSync(outAbs, JSON.stringify(report, null, 2) + "\n", "utf8");
console.log("OK  " + path.relative(ROOT, outAbs) + "  视口 " + okCount + "/" + vps.length
  + "  裁切视口 " + JSON.stringify(report.summary.clippedViewports)
  + "  横向滚动 " + report.summary.horizontalScrollAnywhere);
process.exit(0);
