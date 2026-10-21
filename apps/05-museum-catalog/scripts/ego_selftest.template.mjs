/**
 * 05 目录页 · 功能自测探针（**ego-browser 版**）
 *
 * 依用户 2026-10-22 长期约定：**Ego 浏览器是唯一浏览器入口**，
 * 禁止另起 Playwright / Chromium / Chrome 等替代路径 —— 故本脚本不 spawn 任何浏览器进程，
 * 而是由 `ego-browser nodejs` 承载，直接使用 ego-lite 的 TaskSpace / Page API。
 *
 * 覆盖项（与改版前 Chrome 版探针**判定口径完全一致**，表达式取自 scripts/page_probe.mjs）：
 *   卡片数 / 初始计数 / 年代筛选逐项命中 / 年代互斥 / 全部时代复位 /
 *   类型筛选逐项命中 / 全部类型复位 / 搜索命中集合 / 搜索清空复原 /
 *   条目详情展开与字段 / 控制台错误 / 未捕获异常 / 404 与网络失败
 *
 * 运行方式（由 scripts/restyle_selftest.py 生成临时实例后调用）：
 *   ego-browser nodejs < <本文件的渲染实例>
 *
 * 模板占位符：__PROBE_IMPORT__、__URL__、__TERM__、__SHOT_PATH__（可选）
 */

import { SELFTEST_PAGE_PROBE } from "__PROBE_IMPORT__";

const URL = "__URL__";
const TERM = "__TERM__";
const SHOT = "__SHOT_PATH__";

function digestEvents(events) {
  const out = { consoleErrors: [], consoleWarnings: [], exceptions: [], httpErrors: [], netFailures: [] };
  for (const e of events || []) {
    const m = e.method;
    const p = e.params || {};
    if (m === "Runtime.consoleAPICalled") {
      const text = (p.args || [])
        .map((a) => (a.value !== undefined ? String(a.value) : a.description || a.type))
        .join(" ");
      if (p.type === "error") out.consoleErrors.push(text);
      else if (p.type === "warning") out.consoleWarnings.push(text);
    } else if (m === "Runtime.exceptionThrown") {
      const d = p.exceptionDetails || {};
      out.exceptions.push(d.exception?.description || d.text || "unknown exception");
    } else if (m === "Network.responseReceived" && p.response && p.response.status >= 400) {
      out.httpErrors.push({ status: p.response.status, url: p.response.url });
    } else if (m === "Network.loadingFailed") {
      out.netFailures.push({ url: p.requestId || "", text: p.errorText || "" });
    }
  }
  out.consoleErrorCount = out.consoleErrors.length;
  out.consoleWarningCount = out.consoleWarnings.length;
  out.exceptionCount = out.exceptions.length;
  out.httpErrorCount = out.httpErrors.length;
  out.netFailureCount = out.netFailures.length;
  return out;
}

async function main() {
  const warnings = [];
  const task = await taskSpace("05-catalog-selftest");
  const page = await task.newPage();

  try {
    await page.cdp("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      // ⚠️ 必须 mobile:true —— mobile:false 时 Chromium 按 1/0.9 放大，
      //    2026-10-22 01:5x 用 Ego 实测：请求 1440 → innerWidth 1600（dpr 0.9）。
      //    详见 tools/ego-qa/MIGRATION.md §1③。
      mobile: true,
    });
    await page.goto(URL);
    await page.waitForLoadState();

    // 视口精度自检：实测内宽必须 1:1 等于请求宽
    const measuredInnerWidth = await page.evaluate('window.innerWidth');
    const viewportExact = measuredInnerWidth === 1440;
    if (!viewportExact) {
      warnings.push(`视口精度不达标：请求 1440 实测 ${measuredInnerWidth} —— 缺 mobile:true 会被放大 1/0.9`);
    }

    const probeExpr = SELFTEST_PAGE_PROBE.replace('__PROBE_TERM__', JSON.stringify(TERM));
    const result = await page.evaluate(probeExpr);
    const events = await page.events();
    const digest = digestEvents(events);

    let screenshot = null;
    if (SHOT) {
      try {
        const path = await page.screenshot({ path: SHOT });
        screenshot = { path };
      } catch (e) {
        screenshot = { error: String(e && e.message ? e.message : e) };
      }
    }

    console.log(
      JSON.stringify({
        ok: !!result,
        url: URL,
        driver: "ego-browser",
        evalError: null,
        viewportExact,
        measuredInnerWidth,
        result,
        screenshot,
        consoleErrors: digest.consoleErrors,
        consoleWarnings: digest.consoleWarnings,
        exceptions: digest.exceptions,
        httpErrors: digest.httpErrors,
        netFailures: digest.netFailures,
        consoleErrorCount: digest.consoleErrorCount,
        consoleWarningCount: digest.consoleWarningCount,
        exceptionCount: digest.exceptionCount,
        httpErrorCount: digest.httpErrorCount,
        netFailureCount: digest.netFailureCount,
        warnings,
      })
    );
  } catch (err) {
    console.log(
      JSON.stringify({
        ok: false,
        url: URL,
        driver: "ego-browser",
        error: String(err && err.message ? err.message : err),
        warnings,
      })
    );
    process.exitCode = 5;
  } finally {
    try {
      await page.close();
    } catch {
      /* ignore */
    }
  }
}

await main();
