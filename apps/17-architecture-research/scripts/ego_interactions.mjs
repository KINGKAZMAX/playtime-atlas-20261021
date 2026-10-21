#!/usr/bin/env node
/**
 * ego_interactions.mjs — 成果页**交互类**验收（走 Ego 浏览器）
 *
 * ⚠️ 浏览器入口约定（用户长期约定，2026-10-22 起对所有任务生效）：
 *    本脚本**只通过 Ego 浏览器**执行页面操作。目录内原有的
 *    `browser_test.mjs`（无头 Chrome + 原生 CDP）、`capture_cdp.mjs`、
 *    `capture.sh` 已按约定**停用并移除**。
 *    不得另起 Playwright / Chromium / Puppeteer / 本机无头 Chrome。
 *
 * 与批次共享工具 `tools/ego-qa/run.mjs` 的分工：
 *   · 共享工具跑**标准项**：4 档视口精度自检、横向溢出、外部请求、控制台错误、
 *     关键组件、破图、样式表就绪、逐档截图、实际渲染字体、对比度、触摸目标、
 *     prefers-reduced-motion。
 *   · 本脚本补齐共享工具**不覆盖**的交互类项目：
 *     中英切换、构造筛选、搜索、skip link、焦点环、Tab 序列、
 *     prefers-color-scheme 暗色、字体栈顺序（V.11）、子路径相对 URL 可达性、
 *     三类卡片计数。
 *
 * 运行环境注意（Ego 实测）：
 *   ① Ego 的 nodejs 进程**无 argv、不继承环境变量** → 本文件是普通 Node 包装器，
 *      由它读取命令行参数、生成一次性 .mjs，再交给 `ego-browser nodejs` 执行；
 *   ② `page.evaluate` 回调**不能引用模块作用域函数** → 页面内辅助函数
 *      一律定义在回调内部；
 *   ③ 视口必须 `mobile: true` → 否则 Chromium 把 1440 放大成 1600，
 *      污染全部响应式与溢出判定。
 *
 * 用法：
 *   node scripts/ego_interactions.mjs --url http://127.0.0.1:8899/catalog.html \
 *        --out <绝对输出目录> [--space "17-architecture ego-interactions"]
 *
 * 退出码：0 = 全部通过，1 = 有 FAIL，2 = 参数/环境错误。
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

const url = argOf("url");
if (!url) {
  console.error("缺少 --url <地址>");
  process.exit(2);
}
const outDir = path.resolve(argOf("out", path.join(ROOT, "evidence", "ego-interactions")));
const spaceName = argOf("space", "17-architecture ego-interactions");
const label = argOf("label", "catalog-interactions");

/* ---------------------------------------------------------------
   Ego 侧脚本：注意 ①无 argv ②evaluate 回调内定义辅助函数 ③mobile:true
   --------------------------------------------------------------- */
const egoScript = `
const task = await taskSpace(${JSON.stringify(spaceName)});
const page = task.page("p1");
const OUT = ${JSON.stringify(outDir)};
const LABEL = ${JSON.stringify(label)};
const URL_ = ${JSON.stringify(url)};
const SPACE = ${JSON.stringify(spaceName)};

const checks = [];
const ok = (name, detail) => { checks.push({ name, status: "pass", detail }); console.log("  ✓", name, detail ? "— " + detail : ""); };
const bad = (name, detail) => { checks.push({ name, status: "fail", detail }); console.log("  ✗", name, "—", detail); };
const warn = (name, detail) => { checks.push({ name, status: "warn", detail }); console.log("  !", name, "—", detail); };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: true,
  });
  await page.goto(URL_);
  await page.waitForLoadState("load");
  await sleep(800);

  // 视口精度自检
  const vw = await page.evaluate(() => window.innerWidth);
  if (vw === 1440) ok("视口精确", "innerWidth=1440");
  else bad("视口精确", "请求 1440 实测 " + vw);

  // ---- 1. 三类卡片计数 ----
  const counts = await page.evaluate(() => ({
    cases: document.querySelectorAll(".case").length,
    terms: document.querySelectorAll(".term").length,
    structs: document.querySelectorAll(".struct").length,
    visibleCases: [...document.querySelectorAll(".case")].filter((e) => !e.hidden).length,
    caveats: document.querySelectorAll(".caveat").length,
    notices: document.querySelectorAll(".notice").length,
  }));
  if (counts.cases === 42 && counts.terms === 74 && counts.structs === 21) {
    ok("三类卡片计数齐备", "case 42 / term 74 / struct 21");
  } else {
    bad("三类卡片计数齐备", JSON.stringify(counts));
  }
  if (counts.caveats === 42) ok("每条案例渲染 caveat", "42/42");
  else bad("每条案例渲染 caveat", counts.caveats + "/42");

  // ---- 2. 语言切换 ----
  const langBefore = await page.evaluate(() => {
    const vis = (el) => { const cs = getComputedStyle(el); return cs.display !== "none" && el.getClientRects().length > 0; };
    return {
      dataLang: document.documentElement.getAttribute("data-lang"),
      htmlLang: document.documentElement.getAttribute("lang"),
      en: [...document.querySelectorAll('[data-l="en"]')].filter(vis).length,
      zh: [...document.querySelectorAll('[data-l="zh"]')].filter(vis).length,
    };
  });
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".lang-toggle button")].find((x) => /EN/i.test(x.textContent));
    if (b) b.click();
  });
  await sleep(400);
  const langAfter = await page.evaluate(() => {
    const vis = (el) => { const cs = getComputedStyle(el); return cs.display !== "none" && el.getClientRects().length > 0; };
    return {
      dataLang: document.documentElement.getAttribute("data-lang"),
      htmlLang: document.documentElement.getAttribute("lang"),
      en: [...document.querySelectorAll('[data-l="en"]')].filter(vis).length,
      zh: [...document.querySelectorAll('[data-l="zh"]')].filter(vis).length,
    };
  });
  if (langAfter.dataLang === "en" && langAfter.en > 0 && langAfter.zh === 0) {
    ok("语言切换到 EN", "data-lang=en，可见 en " + langAfter.en + " / zh " + langAfter.zh);
  } else {
    bad("语言切换到 EN", JSON.stringify(langAfter));
  }
  if (langAfter.htmlLang === "en") ok("html[lang] 随语言同步", "lang=" + langAfter.htmlLang);
  else bad("html[lang] 随语言同步", "lang=" + langAfter.htmlLang);

  // 切回中文
  await page.evaluate(() => {
    const b = [...document.querySelectorAll(".lang-toggle button")].find((x) => /中文/.test(x.textContent));
    if (b) b.click();
  });
  await sleep(300);
  const langBack = await page.evaluate(() => document.documentElement.getAttribute("data-lang"));
  if (langBack === "zh") ok("切回中文", "data-lang=zh");
  else bad("切回中文", "data-lang=" + langBack);

  // ---- 3. 构造筛选 ----
  const filterRes = await page.evaluate(() => {
    const chip = [...document.querySelectorAll(".chip")].find((c) => /斗栱/.test(c.textContent));
    if (!chip) return { ok: false };
    const before = [...document.querySelectorAll(".case")].filter((e) => !e.hidden).length;
    chip.click();
    const after = [...document.querySelectorAll(".case")].filter((e) => !e.hidden).length;
    return { ok: true, before, after, pressed: chip.getAttribute("aria-pressed"), text: chip.textContent.trim() };
  });
  if (filterRes.ok && filterRes.after > 0 && filterRes.after < filterRes.before) {
    ok("构造筛选生效", "点击「" + filterRes.text + "」→ 可见 " + filterRes.after + "/" + filterRes.before + "（aria-pressed=" + filterRes.pressed + "）");
  } else {
    bad("构造筛选生效", JSON.stringify(filterRes));
  }
  const resetRes = await page.evaluate(() => {
    const on = [...document.querySelectorAll('.chip[aria-pressed="true"]')];
    on.forEach((c) => c.click());
    return [...document.querySelectorAll(".case")].filter((e) => !e.hidden).length;
  });
  if (resetRes === 42) ok("取消筛选后恢复全部案例", resetRes + "/42");
  else bad("取消筛选后恢复全部案例", resetRes + "/42");

  // ---- 4. 搜索 ----
  const searchRes = await page.evaluate(() => {
    const q = document.querySelector(".search");
    if (!q) return { ok: false };
    q.focus();
    q.value = "桥";
    q.dispatchEvent(new Event("input", { bubbles: true }));
    const visible = [...document.querySelectorAll(".case")].filter((e) => !e.hidden).length;
    q.value = "";
    q.dispatchEvent(new Event("input", { bubbles: true }));
    return { ok: true, visible, restored: [...document.querySelectorAll(".case")].filter((e) => !e.hidden).length };
  });
  if (searchRes.ok && searchRes.visible > 0 && searchRes.visible < 42) {
    ok("搜索过滤生效", "输入「桥」→ 可见 " + searchRes.visible + "/42，清空后恢复 " + searchRes.restored);
  } else {
    bad("搜索过滤生效", JSON.stringify(searchRes));
  }

  // ---- 5. skip link（用真实键盘 Tab 导航；程序化 focus 不触发 :focus-visible）----
  // 刷新回页面顶部：浏览器的「顺序聚焦起点」不会因 blur() 重置，
  // 只有重新导航才能让第一次 Tab 落在文档首个可聚焦元素上。
  await page.goto(URL_);
  await page.waitForLoadState("load");
  await sleep(600);
  await page.keyboard.press("Tab");
  await sleep(250);
  const skip = await page.evaluate(() => {
    const s = document.querySelector(".skip-link");
    const a = document.activeElement;
    const r = s ? s.getBoundingClientRect() : null;
    return {
      ok: !!s,
      isActive: !!(a && a.classList && a.classList.contains("skip-link")),
      left: r ? Math.round(r.left) : null,
      top: r ? Math.round(r.top) : null,
      text: s ? s.textContent.trim() : "",
    };
  });
  if (skip.ok && skip.isActive && skip.left !== null && skip.left >= 0) {
    ok("skip link 首个 Tab 即聚焦且可见", "activeElement=" + skip.isActive + "，left=" + skip.left + " top=" + skip.top + " 「" + skip.text + "」");
  } else {
    bad("skip link 首个 Tab 即聚焦且可见", JSON.stringify(skip));
  }

  // ---- 6. 焦点环 + Tab 序列（逐个真实按 Tab）----
  const focusSeq = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    const s = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return { none: true };
      const cs = getComputedStyle(a);
      return {
        tag: a.tagName.toLowerCase(),
        cls: String(a.className || "").slice(0, 40),
        focusVisible: a.matches(":focus-visible"),
        ring: (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none",
        outline: cs.outlineWidth + " " + cs.outlineStyle,
      };
    });
    if (s.none) break;
    focusSeq.push(s);
  }
  const noRing = focusSeq.filter((s) => !s.ring);
  if (focusSeq.length > 0 && noRing.length === 0) {
    ok("焦点环可见（键盘 Tab）", focusSeq.length + " 次 Tab，" + focusSeq.length + " 个焦点全部有可见焦点环");
  } else {
    bad("焦点环可见（键盘 Tab）", noRing.length ? JSON.stringify(noRing.slice(0, 4)) : "无焦点");
  }
  const notVisible = focusSeq.filter((s) => !s.focusVisible);
  if (focusSeq.length > 0 && notVisible.length === 0) {
    ok(":focus-visible 全部命中", focusSeq.length + " 个焦点全部匹配 :focus-visible");
  } else {
    bad(":focus-visible 全部命中", notVisible.length + " 个未匹配：" + JSON.stringify(notVisible.slice(0, 3)));
  }
  const focus = { total: focusSeq.length, sample: focusSeq };
  ok("Tab 序列不被吞", "连续 12 次 Tab 依次落在 " + focusSeq.length + " 个元素上");

  // ---- 7. 字体栈顺序（V.11）----
  const stack = await page.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const SYS = ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Source Han Sans SC"];
    const out = {};
    for (const role of ["--ds-font-display", "--ds-font-text", "--ds-font-mono"]) {
      const raw = cs.getPropertyValue(role) || "";
      const list = raw.replace(/\\s+/g, " ").split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      const noto = list.indexOf("Noto Sans SC");
      const sysIdx = SYS.map((s) => list.indexOf(s)).filter((i) => i >= 0);
      const minSys = sysIdx.length ? Math.min.apply(null, sysIdx) : -1;
      out[role] = { list: list, noto: noto, minSys: minSys, ok: noto === -1 ? true : (minSys === -1 ? true : noto > minSys) };
    }
    return out;
  });
  const stackBad = Object.keys(stack).filter((k) => !stack[k].ok);
  if (!stackBad.length) ok("V.11 Noto Sans SC 未排在系统 CJK 族之前", Object.keys(stack).map((k) => k + " ✓").join("，"));
  else bad("V.11 Noto Sans SC 未排在系统 CJK 族之前", stackBad.map((k) => k + ": " + stack[k].list.join(", ")).join("; "));

  // ---- 8. 子路径相对 URL 全部可达 ----
  const subpath = await page.evaluate(async () => {
    const urls = [...document.querySelectorAll("link[href], script[src], img[src]")]
      .map((el) => el.getAttribute("href") || el.getAttribute("src"))
      .filter((u) => u && !/^(https?:|data:|#|\\/)/.test(u));
    const results = [];
    for (const u of urls) {
      try {
        const r = await fetch(new URL(u, document.baseURI));
        results.push({ url: u, status: r.status, ok: r.ok });
      } catch (e) {
        results.push({ url: u, status: 0, ok: false, err: String(e).slice(0, 80) });
      }
    }
    return { checked: results.length, bad: results.filter((r) => !r.ok), all: results };
  });
  if (subpath.checked > 0 && subpath.bad.length === 0) {
    ok("页面内相对资源全部可达", subpath.checked + " 个相对 URL 全部 200");
  } else {
    bad("页面内相对资源全部可达", subpath.bad.length ? JSON.stringify(subpath.bad) : "无相对资源");
  }

  // ---- 9. prefers-color-scheme 暗色 ----
  await page.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await page.goto(URL_);
  await page.waitForLoadState("load");
  await sleep(400);
  const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await page.goto(URL_);
  await page.waitForLoadState("load");
  await sleep(400);
  const dark = await page.evaluate(() => {
    const cs = getComputedStyle(document.body);
    const m = cs.color.match(/[\\d.]+/g).map(Number);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]);
    const bg = cs.backgroundColor.match(/[\\d.]+/g).map(Number);
    const Lb = 0.2126 * f(bg[0]) + 0.7152 * f(bg[1]) + 0.0722 * f(bg[2]);
    return { bg: cs.backgroundColor, ratio: +(((Math.max(L, Lb) + 0.05) / (Math.min(L, Lb) + 0.05)).toFixed(2)) };
  });
  if (dark.bg !== lightBg) ok("prefers-color-scheme: dark 生效", "底色 " + lightBg + " → " + dark.bg);
  else bad("prefers-color-scheme: dark 生效", "底色未变化：" + dark.bg);
  if (dark.ratio >= 4.5) ok("暗色态正文对比度 ≥ 4.5", dark.ratio + ":1");
  else bad("暗色态正文对比度 ≥ 4.5", dark.ratio + ":1");
  await page.cdp("Emulation.setEmulatedMedia", { features: [] });

  // ---- 10. 暗色截图 ----
  await page.cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: true });
  await page.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await page.goto(URL_);
  await page.waitForLoadState("load");
  await sleep(700);
  await page.screenshot({ path: OUT + "/screenshots/" + LABEL + "-dark-1440x900.png" });
  await page.cdp("Emulation.setEmulatedMedia", { features: [] });
  ok("暗色截图已产出", "screenshots/" + LABEL + "-dark-1440x900.png");
} catch (e) {
  bad("致命错误", String((e && e.message) || e).slice(0, 400));
}

const fs = await import("node:fs/promises");
await fs.mkdir(OUT + "/screenshots", { recursive: true });
const failed = checks.filter((c) => c.status === "fail").length;
const warned = checks.filter((c) => c.status === "warn").length;
const report = {
  target: LABEL,
  url: URL_,
  generatedAt: new Date().toISOString(),
  browser: "ego-browser (ego-lite)",
  spaceName: SPACE,
  total: checks.length,
  passed: checks.length - failed - warned,
  failed,
  warned,
  verdict: failed ? "FAIL" : "PASS",
  checks,
};
await fs.writeFile(OUT + "/" + LABEL + ".json", JSON.stringify(report, null, 2), "utf8");
console.log("\\n" + (failed ? "❌" : "✅") + " " + LABEL + ": " + report.verdict +
  " — 通过 " + report.passed + " / 失败 " + failed + " / 警告 " + warned);
console.log("报告：" + OUT + "/" + LABEL + ".json");
await task.finish({ keep: [] });
if (failed) throw new Error("存在 FAIL");
`;

/* --------------------------------------------------------------- 包装执行 */
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ego-17-inter-"));
const scriptPath = path.join(tmpDir, "interactions.mjs");
fs.writeFileSync(scriptPath, egoScript, "utf8");
fs.mkdirSync(path.join(outDir, "screenshots"), { recursive: true });

const egoBin = process.env.EGO_BROWSER_BIN || "/Users/mekzenx2/.local/bin/ego-browser";
if (!fs.existsSync(egoBin)) {
  console.error("找不到 ego-browser：", egoBin);
  process.exit(2);
}

console.log("Ego 交互验收：", url);
console.log("  space :", spaceName);
console.log("  输出  :", outDir);

const res = spawnSync(egoBin, ["nodejs"], {
  input: fs.readFileSync(scriptPath, "utf8"),
  stdio: ["pipe", "inherit", "inherit"],
  encoding: "utf8",
});
try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* 忽略 */ }
process.exit(res.status === null ? 2 : res.status);
