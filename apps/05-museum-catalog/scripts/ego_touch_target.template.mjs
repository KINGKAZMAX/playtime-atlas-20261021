/**
 * 05 目录页 · 触摸目标审计探针（**ego-browser 版**）
 *
 * 依用户 2026-10-22 长期约定：**Ego 浏览器是唯一浏览器入口**，
 * 禁止另起 Playwright / Chromium / Chrome 等替代路径 —— 故本脚本不 spawn 任何浏览器进程。
 *
 * 为什么要单独写这个探针（而不是直接用批次共享的 tools/ego-qa）：
 *   共享工具判定「目标是否可见」用的是 `getBoundingClientRect()` 非零，
 *   而 Chromium 对**折叠的 `<details>` 内容**（`::details-content` +
 *   `content-visibility: hidden`）仍返回**未折叠时的固有尺寸**——即「幽灵矩形」。
 *   于是折叠内容里的链接被误判成「可见且不足 24px」，
 *   2026-10-22 02:1x 实测：共享工具报 416 个不足，真实被绘制的不足为 **0 个**。
 *
 * 本探针的判据：
 *   ① 用 `checkVisibility()` 区分「真正绘制」与「幽灵矩形」；
 *   ② 对真正被绘制且 < 24×24 的目标，按 **WCAG 2.2 SC 2.5.8 的间距例外**判定：
 *      以目标边界框中心为圆心、直径 24px 的圆，若与任一其他目标边界框
 *      或另一个不足目标的圆相交，则不满足例外 → 计为违例；
 *   ③ 初始态（全部折叠）与展开态（全部展开）分别统计。
 *
 * 视口：mobile:true（否则 Chromium 把 1440 放大成 1600，污染判定）
 *
 * 运行方式（由 scripts/touch_target_audit.py 渲染后调用）：
 *   ego-browser nodejs < <本文件的渲染实例>
 *
 * 模板占位符：__URL__、__OUT_DIR__
 */

const URL = "__URL__";
const OUT_DIR = "__OUT_DIR__";

const VIEWPORTS = [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-390", width: 390, height: 844 },
];

/** 页内表达式：所有辅助函数必须定义在回调内部（Ego 的 evaluate 不能引用模块作用域） */
const TOUCH_PROBE = `(() => {
  const R = 12; // 24px 直径圆的半径

  const isPainted = (el) => {
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    }
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  };

  const collect = () =>
    [...document.querySelectorAll('button, a[href], input, select')]
      .map((el) => {
        const b = el.getBoundingClientRect();
        return {
          tag: el.tagName.toLowerCase(),
          cls: String(el.className || '').slice(0, 60),
          text: (el.textContent || '').trim().slice(0, 40),
          t: b.top, b: b.bottom, l: b.left, r: b.right,
          w: b.width, h: b.height,
          painted: isPainted(el),
        };
      })
      .filter((x) => x.w > 0 && x.h > 0);

  const center = (x) => ({ x: (x.l + x.r) / 2, y: (x.t + x.b) / 2 });

  // 直径 24px 的圆是否与某个矩形相交
  const circleHitsBox = (c, bx) => {
    const dx = Math.max(bx.l - c.x, 0, c.x - bx.r);
    const dy = Math.max(bx.t - c.y, 0, c.y - bx.b);
    return Math.hypot(dx, dy) < R;
  };

  // 两个直径 24px 的圆是否相交
  const circleHitsCircle = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < 2 * R;

  const analyze = () => {
    const all = collect();
    const painted = all.filter((x) => x.painted);
    const phantom = all.filter((x) => !x.painted);
    const undersized = painted.filter((x) => x.w < 24 || x.h < 24);

    const violations = [];
    for (const u of undersized) {
      const cu = center(u);
      // (a) 圆是否命中其他目标的边界框
      for (const o of painted) {
        if (o === u) continue;
        if (circleHitsBox(cu, o)) {
          violations.push({
            target: u.tag + '.' + u.cls,
            targetSize: Math.round(u.w) + 'x' + Math.round(u.h),
            reason: '24px 圆命中其他目标 ' + o.tag + '.' + o.cls,
          });
          break;
        }
      }
      if (violations.length && violations[violations.length - 1].target === u.tag + '.' + u.cls) continue;
      // (b) 圆是否与另一个不足目标的圆相交
      for (const o of undersized) {
        if (o === u) continue;
        if (circleHitsCircle(cu, center(o))) {
          violations.push({
            target: u.tag + '.' + u.cls,
            targetSize: Math.round(u.w) + 'x' + Math.round(u.h),
            reason: '24px 圆与另一不足目标 ' + o.tag + '.' + o.cls + ' 相交',
          });
          break;
        }
      }
    }

    const rects = undersized.map((x) => ({
      tag: x.tag, cls: x.cls, text: x.text,
      w: Math.round(x.w), h: Math.round(x.h),
    }));

    return {
      totalNonZeroRect: all.length,
      paintedTargets: painted.length,
      phantomTargets: phantom.length,
      paintedUndersized: undersized.length,
      paintedUndersizedSamples: rects.slice(0, 8),
      spacingExceptionViolations: violations.length,
      violationSamples: violations.slice(0, 8),
    };
  };

  const closed = analyze();

  // 展开全部条目，测「详情展开态」的真实触摸目标
  document.querySelectorAll('details').forEach((d) => { d.open = true; });
  const opened = analyze();

  return {
    closed,
    opened,
    detailsTotal: document.querySelectorAll('details').length,
  };
})()`;

async function main() {
  const task = await taskSpace("05-catalog-touchtarget");
  const page = await task.newPage();
  const viewports = [];
  const warnings = [];

  try {
    for (const vp of VIEWPORTS) {
      await page.cdp("Emulation.setDeviceMetricsOverride", {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        // 必须 mobile:true —— mobile:false 会被 Chromium 放大 1/0.9
        mobile: true,
      });
      await page.goto(URL);
      await page.waitForLoadState();

      const measuredInnerWidth = await page.evaluate("window.innerWidth");
      const viewportExact = measuredInnerWidth === vp.width;
      if (!viewportExact) {
        warnings.push(`视口精度不达标：${vp.name} 请求 ${vp.width} 实测 ${measuredInnerWidth}`);
      }

      const r = await page.evaluate(TOUCH_PROBE);
      viewports.push({ viewport: vp.name, width: vp.width, height: vp.height, viewportExact, measuredInnerWidth, ...r });
    }

    const report = {
      ok: true,
      url: URL,
      driver: "ego-browser",
      standard: "WCAG 2.2 SC 2.5.8 Target Size (Minimum) AA —— 24x24 CSS px，含间距例外",
      method:
        "checkVisibility() 区分真正绘制 vs 折叠 details 的幽灵矩形；" +
        "不足目标以边界框中心为圆心、直径 24px 的圆判定间距例外",
      viewports,
      allViewportsExact: viewports.every((v) => v.viewportExact),
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
  } finally {
    try {
      await page.close();
    } catch {
      /* ignore */
    }
  }
}

await main();
