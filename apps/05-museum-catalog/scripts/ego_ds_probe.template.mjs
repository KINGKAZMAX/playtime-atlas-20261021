/**
 * 05 目录页 · 设计系统验收探针（**ego-browser 版**）
 *
 * 依用户 2026-10-22 长期约定：**Ego 浏览器是唯一浏览器入口**，
 * 禁止另起 Playwright / Chromium / Chrome 等替代路径 —— 故本脚本不 spawn 任何浏览器进程，
 * 而是由 `ego-browser nodejs` 承载，直接使用 ego-lite 的 TaskSpace / Page API。
 *
 * 覆盖项（与改版前 Chrome 版探针**判定口径完全一致**，表达式取自 scripts/page_probe.mjs）：
 *   V.1 四档视口无横向溢出   V.6 无运行期外部请求
 *   V.2 对比度 ≥ 4.5          V.7 自托管字体加载且无 404
 *   V.3 焦点环可见            V.8 数据密度未被压缩
 *   V.4 Tab 序列不被吞        V.9 筛选与搜索仍可用
 *   V.5 DS 令牌生效 / 旧色板无残留   V.10 来源可见（角标 + mono 编号）
 *   控制台错误 / 未捕获异常 / 404 计数
 *
 * 运行方式（由 scripts/ds_check.py 生成临时实例后调用）：
 *   ego-browser nodejs < <本文件的渲染实例>
 *
 * 模板占位符：__PROBE_IMPORT__（page_probe.mjs 的绝对路径）、__URL__、__OUT_DIR__
 */

import { DS_PAGE_PROBE } from "__PROBE_IMPORT__";

const URL = "__URL__";
const OUT_DIR = "__OUT_DIR__";

const VIEWPORTS = [
  // ⚠️ 四档一律 mobile:true —— mobile:false 时 Chromium 按 1/0.9 放大视口，
  //    2026-10-22 01:5x 用 Ego 实测：请求 1440 → innerWidth 1600、1280 → 1422、
  //    768 → 853（dpr 0.9），会同时污染横向溢出判定、对比度采样与截图尺寸。
  //    详见 tools/ego-qa/MIGRATION.md §1③；下方每档都有「视口精度自检」兜底。
  { name: "desktop-1440", width: 1440, height: 900, mobile: true },
  { name: "desktop-1280", width: 1280, height: 800, mobile: true },
  { name: "tablet-768", width: 768, height: 1024, mobile: true },
  { name: "mobile-390", width: 390, height: 844, mobile: true },
];

/** 从 Ego 的协议事件缓冲里挑出控制台错误 / 未捕获异常 / 4xx-5xx / 网络失败 / 外部请求 */
function digestEvents(events) {
  const out = {
    consoleErrors: [],
    exceptions: [],
    httpErrors: [],
    netFailures: [],
    externalRequests: [],
  };
  for (const e of events || []) {
    const m = e.method;
    const p = e.params || {};
    if (m === "Runtime.consoleAPICalled" && p.type === "error") {
      out.consoleErrors.push(
        (p.args || [])
          .map((a) => (a.value !== undefined ? String(a.value) : a.description || a.type))
          .join(" ")
      );
    } else if (m === "Runtime.exceptionThrown") {
      const d = p.exceptionDetails || {};
      out.exceptions.push(d.exception?.description || d.text || "unknown exception");
    } else if (m === "Network.responseReceived" && p.response) {
      const st = p.response.status || 0;
      const url = p.response.url || "";
      if (st >= 400) out.httpErrors.push({ status: st, url });
      // 只把「页面自身的 http(s) 外链请求」算作外部请求；
      // chrome-extension:// 与 data:/blob:/about: 属浏览器自身与页面内资源，不计入
      if (/^https?:\/\//.test(url) && !/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(url)) {
        out.externalRequests.push(url);
      }
    } else if (m === "Network.loadingFailed") {
      out.netFailures.push({ url: p.requestId || "", text: p.errorText || "" });
    }
  }
  out.consoleErrorCount = out.consoleErrors.length;
  out.exceptionCount = out.exceptions.length;
  out.httpErrorCount = out.httpErrors.length;
  out.netFailureCount = out.netFailures.length;
  out.externalRequestCount = out.externalRequests.length;
  return out;
}

async function main() {
  const warnings = [];
  const task = await taskSpace("05-catalog-dsverify");
  const page = await task.newPage();
  const viewports = [];

  try {
    for (const vp of VIEWPORTS) {
      await page.cdp("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await page.goto(URL);
      await page.waitForLoadState();

      const result = await page.evaluate(DS_PAGE_PROBE);

      // 视口精度自检：实测内宽必须 1:1 等于请求宽，否则本档的溢出/对比度/截图判定全部不可信
      const measuredInnerWidth = result.overflow.innerWidth;
      const viewportExact = measuredInnerWidth === vp.width;
      if (!viewportExact) {
        warnings.push(
          `视口精度不达标：${vp.name} 请求 ${vp.width} 实测 ${measuredInnerWidth} —— 缺 mobile:true 会被放大 1/0.9`
        );
      }
      const events = await page.events();
      const digest = digestEvents(events);

      // 视口截图（供 13/15 目视复核）
      let shot = null;
      try {
        const path = await page.screenshot({ path: `${OUT_DIR}/ds-${vp.name}.png` });
        shot = { path };
      } catch (e) {
        shot = { error: String(e && e.message ? e.message : e) };
      }

      // V.3b 键盘驱动的焦点环检验
      // 说明：程序化 element.focus() 在用户真实浏览器配置下**可能不触发 :focus-visible**
      //（Chromium 的启发式取决于此前是否有指针交互），故焦点环必须用**真实键盘 Tab** 检验。
      await page.evaluate(
        `(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); document.body.setAttribute('tabindex','-1'); document.body.focus(); document.body.removeAttribute('tabindex'); })()`
      );
      await page.keyboard.press("Tab");
      const focusRing = await page.evaluate(`(() => {
        const a = document.activeElement;
        if (!a) return null;
        const cs = getComputedStyle(a);
        return {
          tag: a.tagName.toLowerCase(),
          cls: (a.className || '').toString(),
          isSkip: !!a.classList.contains('ds-skip'),
          matchesFocusVisible: !!a.matches(':focus-visible'),
          boxShadow: cs.boxShadow,
          outline: cs.outline,
          visible: cs.boxShadow !== 'none' || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0),
        };
      })()`);

      // V.4 Tab 序列不被吞（仅在最大视口做一次）
      let tab = null;
      if (vp.name === "desktop-1440") {
        await page.evaluate(`document.querySelector('.ds-skip') && document.querySelector('.ds-skip').focus();`);
        const sequence = [];
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press("Tab");
          const active = await page.evaluate(
            `(() => { const a = document.activeElement; return a ? a.tagName.toLowerCase() + '|' + (a.className || '') : 'none'; })()`
          );
          sequence.push(active);
        }
        tab = { sequence, unique: new Set(sequence).size, progressed: new Set(sequence).size > 1 };
      }

      viewports.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        viewportExact,
        measuredInnerWidth,
        overflow: result.overflow,
        overflowOffenders: result.overflowOffenders,
        contrast: result.contrast,
        focus: result.focus,
        focusRing,
        tab,
        tokens: result.tokens,
        legacyColors: result.legacyColors,
        density: result.density,
        fonts: result.fonts,
        sources: result.sources,
        functional: result.functional,
        bodyBg: result.bodyBg,
        bodyColor: result.bodyColor,
        consoleErrors: digest.consoleErrors,
        exceptions: digest.exceptions,
        httpErrors: digest.httpErrors,
        netFailures: digest.netFailures,
        externalRequests: digest.externalRequests,
        consoleErrorCount: digest.consoleErrorCount,
        exceptionCount: digest.exceptionCount,
        httpErrorCount: digest.httpErrorCount,
        netFailureCount: digest.netFailureCount,
        externalRequestCount: digest.externalRequestCount,
        shot,
      });
    }

    // 暗色主题（另行验算，与 16 的深色口径一致）
    await page.cdp("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await page.goto(URL);
    await page.waitForLoadState();
    const darkInnerWidth = await page.evaluate(`window.innerWidth`);
    const darkViewportExact = darkInnerWidth === 1440;
    if (!darkViewportExact) {
      warnings.push(`视口精度不达标：深色主题请求 1440 实测 ${darkInnerWidth}`);
    }
    await page.evaluate(`document.documentElement.setAttribute('data-ds-theme', 'dark');`);
    const dark = await page.evaluate(`(() => ({
      bg: getComputedStyle(document.querySelector('.ds-shell') || document.body).backgroundColor,
      ink: getComputedStyle(document.documentElement).getPropertyValue('--ds-ink').trim(),
      accent: getComputedStyle(document.documentElement).getPropertyValue('--ds-accent').trim(),
    }))()`);
    await page.evaluate(`document.documentElement.setAttribute('data-ds-theme', 'light');`);

    const report = {
      ok: true,
      url: URL,
      driver: "ego-browser",
      viewports,
      darkTheme: dark,
      darkViewport: { requested: 1440, measuredInnerWidth: darkInnerWidth, exact: darkViewportExact },
      allViewportsExact: viewports.every((v) => v.viewportExact) && darkViewportExact,
      styleWarnings: warnings,
    };
    console.log(JSON.stringify(report));
  } catch (err) {
    console.log(
      JSON.stringify({
        ok: false,
        driver: "ego-browser",
        url: URL,
        error: String(err && err.message ? err.message : err),
        styleWarnings: warnings,
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
