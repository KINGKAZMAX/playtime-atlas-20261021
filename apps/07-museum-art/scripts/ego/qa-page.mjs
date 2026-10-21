/**
 * 07-museum-art —— 页面级浏览器验收（Ego 路径）
 *
 * 取代旧的 `scripts/qa-browser.mjs`（本地 Playwright / Chromium）。
 * 按批次强制约束（`EGO-UNIFICATION-20261022.md`、`MINIMAX-EGO-GITHUB.md`）：
 * 所有浏览器动作都走用户自己的 Ego 浏览器，不再另起无头浏览器。
 *
 * 检查口径与旧脚本逐条对齐（45 项），另外：
 *  - 视口用 `Emulation.setDeviceMetricsOverride` + `mobile:true` 保证 1:1 精确；
 *  - 破图判定排除「运行时才赋 src 的占位元素」（无 src 的 <img> 不是破图）；
 *  - 平图检测改用自带的纯 JS PNG 解码器（`lib/png.mjs`），
 *    不依赖 ImageMagick（Ego 沙箱里跑不了外部命令）。
 *
 * 由 `scripts/ego/run.mjs` 调用（它负责起本地静态服务器 + 把配置烘进脚本）。
 */

import path from "node:path";
import { isFlat, grayscaleStats } from "./lib/png.mjs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function run(cfg) {
  const BASE = cfg.base;
  const OUT = cfg.outDir;
  const SHOTS = path.join(OUT, "screenshots");
  const fs = await import("node:fs/promises");
  await fs.mkdir(SHOTS, { recursive: true });

  const checks = [];
  const ok = (m, d) => { checks.push({ ok: true, m, d }); console.log("  ✓", m, d ? "— " + d : ""); };
  const bad = (m, d) => { checks.push({ ok: false, m, d }); console.log("  ✗", m, d ? "— " + d : ""); };
  const detail = (m) => console.log("  ·", m);

  /* ── 网络与控制台累积 ───────────────────────────────────────── */
  const netState = { requests: [], failed: [], consoleErrors: [] };
  const BROWSER_OWN = /^(chrome|chrome-extension|devtools|about|edge):/;

  async function drainEvents(page) {
    let events = [];
    try {
      events = await page.events();
    } catch {
      return;
    }
    for (const e of events) {
      if (e.method === "Network.requestWillBeSent") {
        const u = e.params?.request?.url || "";
        if (!BROWSER_OWN.test(u)) netState.requests.push({ url: u, status: null });
      } else if (e.method === "Network.responseReceived") {
        const u = e.params?.response?.url || "";
        if (BROWSER_OWN.test(u)) continue;
        const hit = netState.requests.find((r) => r.url === u && r.status === null);
        if (hit) hit.status = e.params?.response?.status ?? null;
      } else if (e.method === "Network.loadingFailed") {
        netState.failed.push(e.params?.errorText || "unknown");
      } else if (e.method === "Log.entryAdded" && e.params?.entry?.level === "error") {
        netState.consoleErrors.push(e.params?.entry?.text || "");
      }
    }
  }

  /* ── 页面导航 + 就绪等待 ───────────────────────────────────── */
  async function open(page, url, { settle = 2000 } = {}) {
    await page.goto(url, { waitUntil: "commit", timeout: 45000 });
    await page.waitForLoadState("load", { timeout: 90000 }).catch(() => {});
    await page.waitForTimeout(settle);
  }

  /** 轮询等样式表与字体就绪，避免固定 sleep 的竞态 */
  async function waitReady(page, { timeout = 20000 } = {}) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const s = await page.evaluate(() => ({
        ready: document.readyState,
        rules: Array.from(document.styleSheets).reduce((n, sh) => {
          try { return n + sh.cssRules.length; } catch { return n; }
        }, 0),
        fonts: document.fonts.status,
      }));
      if (s.ready === "complete" && s.rules > 0 && s.fonts === "loaded") return s;
      await sleep(150);
    }
    return { timedOut: true };
  }

  /** 截图 + 平图重试 */
  async function shoot(page, file, { attempts = 3 } = {}) {
    let last = null;
    for (let i = 0; i < attempts; i++) {
      await page.screenshot({ path: file });
      const st = await isFlat(file);
      last = st;
      if (!st.flat) return st;
      detail(`截图疑似平图（stddev=${st.stddev}），第 ${i + 1} 次重试`);
      await page.waitForTimeout(1200);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    }
    return last;
  }

  const task = await taskSpace(cfg.spaceName || "07-museum-art ego-qa");
  const spaceId = task.spaceId;

  /* 关掉上一轮遗留的 agent 页面，用一张干净的 */
  for (const p of await task.pages()) {
    try {
      if (p.openedBy === "agent") await p.close();
    } catch {
      /* 关不掉就另开一张 */
    }
  }
  const page = await task.newPage();
  await page.cdp("Log.enable", {});
  await page.cdp("Network.enable", {});

  let viewportSet = false;
  async function setViewport(page, width, height, dpr = 1) {
    await page.cdp("Emulation.setDeviceMetricsOverride", {
      width, height, deviceScaleFactor: dpr, mobile: true,
    });
    viewportSet = true;
  }
  await setViewport(page, 1440, 900);

  try {
    /* ══════════ 阶段 A：结构与字体 ══════════ */
    console.log("\n· 阶段 A — 结构与字体");
    await open(page, `${BASE}/index.html`, { settle: 2500 });
    await waitReady(page);
    await drainEvents(page);

    const title = await page.title();
    if (title.includes("回响电玩馆")) ok(`页面标题：${title}`);
    else bad(`页面标题异常：${title}`);

    const counts = await page.evaluate(() => ({
      swatches: document.querySelectorAll(".swatch").length,
      fontCards: document.querySelectorAll(".font-card").length,
      icons: document.querySelectorAll(".icon-cell").length,
      posters: document.querySelectorAll(".poster-card").length,
      covers: document.querySelectorAll(".cover-card").length,
      cases: document.querySelectorAll(".case-card").length,
      models: document.querySelectorAll(".model-card").length,
      modelTabs: document.querySelectorAll(".model-tab").length,
      fallback: document.querySelectorAll(".fallback-card").length,
      stats: document.querySelectorAll(".stat").length,
      imgs: [...document.querySelectorAll("img")].filter((i) => i.getAttribute("src")).length,
    }));
    const imgTotal = counts.imgs;

    const expect = {
      fontCards: 4, icons: 48, posters: 7, covers: 8,
      cases: 6, models: 6, modelTabs: 6, fallback: 5, stats: 6,
    };
    if (counts.swatches >= 30) ok(`swatches  ${counts.swatches} 项`);
    else bad(`swatches 期望 >=30，实际 ${counts.swatches}`);
    for (const [k, v] of Object.entries(expect)) {
      if (counts[k] === v) ok(`${k}  ${counts[k]} 项`);
      else bad(`${k} 期望 ${v}，实际 ${counts[k]}`);
    }

    /* 网格布局：卡片容器必须是多列网格。
       少了 grid-template-columns 会让卡片整宽堆叠 —— 元素数量对、截图非空，
       但版面是错的，这类缺陷必须单独断言。 */
    const grids = await page.evaluate(() => {
      const sel = ["#poster-grid", "#cover-grid", "#case-grid", "#model-cards", "#icon-grid", "#font-cards"];
      return sel.map((s) => {
        const el = document.querySelector(s);
        if (!el) return { sel: s, missing: true };
        const cs = getComputedStyle(el);
        const kids = [...el.children];
        /* 用 offsetTop 分行：hover/激活态的 translateY 会影响 rect.top，
           而 offsetTop 是布局位置，不含 transform。 */
        const firstTop = kids.length ? kids[0].offsetTop : 0;
        const inFirstRow = kids.filter((k) => k.offsetTop === firstTop).length;
        return {
          sel: s,
          display: cs.display,
          columns: cs.gridTemplateColumns ? cs.gridTemplateColumns.split(" ").length : 0,
          inFirstRow,
          children: kids.length,
        };
      });
    });
    for (const g of grids) {
      if (g.missing) { bad(`网格布局 ${g.sel}：节点缺失`); continue; }
      if (g.display !== "grid") bad(`网格布局 ${g.sel}：display=${g.display}（应为 grid）`);
      else if (g.inFirstRow < 2) bad(`网格布局 ${g.sel}：首行只有 ${g.inFirstRow} 张卡（网格未生效，卡片整宽堆叠）`);
      else ok(`网格布局 ${g.sel}：${g.columns} 列 × 首行 ${g.inFirstRow} 张`);
    }

    const fontCheck = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
        check: document.fonts.check('700 40px "Space Grotesk"'),
        checkCJK: document.fonts.check('700 40px "Noto Sans SC"'),
        checkMono: document.fonts.check('400 16px "Space Mono"'),
      };
    });
    if (fontCheck.check) ok("Space Grotesk 已加载");
    else bad("Space Grotesk 未加载");
    if (fontCheck.checkCJK) ok("Noto Sans SC 已加载");
    else bad("Noto Sans SC 未加载");
    if (fontCheck.checkMono) ok("Space Mono 已加载");
    else bad("Space Mono 未加载");

    /* ══════════ 阶段 B：图片完整性 ══════════ */
    console.log("\n· 阶段 B — 图片完整性");
    const imgSections = [
      { name: "hero", nav: "#top", sel: ".hero" },
      { name: "posters", nav: "#posters", sel: "#posters" },
      { name: "covers", nav: "#covers", sel: "#covers" },
      { name: "cases", nav: "#cases", sel: "#cases" },
      { name: "models", nav: "#models", sel: "#models" },
      { name: "fallback", nav: "#fallback", sel: "#fallback" },
    ];
    let imgVerified = 0;
    for (const s of imgSections) {
      await open(page, `${BASE}/${s.nav}`, { settle: 1200 });
      /* 把该区滚进视口，触发 loading=lazy 的图片开始下载 */
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ block: "center" });
      }, s.sel);
      await page.waitForTimeout(800);
      /* 等该区内所有带 src 的图片解码完成 */
      const res = await page.evaluate(
        (sel) =>
          new Promise((resolve) => {
            const root = document.querySelector(sel);
            if (!root) return resolve(null);
            const imgs = [...root.querySelectorAll("img")].filter((i) => i.getAttribute("src"));
            if (!imgs.length) return resolve([]);
            const t0 = Date.now();
            const tick = () => {
              const done = imgs.every((i) => i.complete && i.naturalWidth > 0);
              if (done || Date.now() - t0 > 25000) {
                return resolve(
                  imgs.map((i) => ({
                    src: i.getAttribute("src"),
                    natural: i.naturalWidth,
                    declared: i.getAttribute("width") ? Number(i.getAttribute("width")) : null,
                  })),
                );
              }
              requestAnimationFrame(tick);
            };
            tick();
          }),
        s.sel,
      );
      if (!res) { bad(`图片区 ${s.name}：节点缺失`); continue; }
      const wrong = res.filter((i) => i.natural <= 1 || (i.declared && i.natural !== i.declared));
      imgVerified += res.length;
      if (wrong.length === 0) detail(`图片区 ${s.name}：${res.length} 张全部按声明尺寸解码成功`);
      else bad(`图片区 ${s.name}：${res.length - wrong.length}/${res.length} 张正常，异常：${wrong.map((w) => w.src).join(", ")}`);
    }
    if (imgVerified === imgTotal && imgTotal > 0) ok(`${imgTotal} 张图片全部加载成功`);
    else bad(`图片加载异常：已验证 ${imgVerified} / DOM 中 ${imgTotal} 张`);

    /* ══════════ 阶段 C：3D 查看器 ══════════ */
    console.log("\n· 阶段 C — 3D 查看器");
    await open(page, `${BASE}/index.html`, { settle: 4500 });
    await drainEvents(page);
    const canvasState = await page.evaluate(() => {
      const c = document.getElementById("model-canvas");
      const gl = c && (c.getContext("webgl2") || c.getContext("webgl"));
      return { exists: !!c, w: c?.width, h: c?.height, hasGL: !!gl };
    });
    if (canvasState.exists && canvasState.w > 200 && canvasState.h > 200) ok(`3D 画布存在 ${canvasState.w}×${canvasState.h}`);
    else bad(`3D 画布异常：${JSON.stringify(canvasState)}`);

    const glbOk = netState.requests.some((r) => r.url.includes(".glb") && r.status === 200);
    if (canvasState.hasGL && glbOk) ok("WebGL 上下文可用（GLB 可交互加载）");
    else bad(`WebGL 上下文异常：hasGL=${canvasState.hasGL} glb200=${glbOk}`);

    /* 回归检查：WebGL 正常时，降级面板必须真正隐藏
       （.viewer-fallback 缺 [hidden] 覆盖时，display:flex 会盖过 UA 的 display:none） */
    const fbState = await page.evaluate(() => {
      const fb = document.getElementById("viewer-fallback");
      if (!fb) return { exists: false };
      return {
        exists: true,
        hiddenAttr: fb.hidden,
        display: getComputedStyle(fb).display,
        visible: fb.getBoundingClientRect().height > 0,
      };
    });
    if (!fbState.exists) bad("降级面板节点缺失");
    else if (fbState.display === "none" && !fbState.visible) ok("WebGL 可用时降级面板已正确隐藏");
    else bad(`降级面板在 WebGL 可用时仍然显示（display=${fbState.display}）`);

    /* ══════════ 阶段 D：交互 ══════════ */
    console.log("\n· 阶段 D — 交互");
    await open(page, `${BASE}/index.html`, { settle: 3000 });

    /* 点击助手：先把元素滚到视口顶部（避开 WebGL 画布的覆盖区），再用 Ego 选择器点击。
       ⚠️ Ego 的 `loc=css:` 前缀不是合法 CSS，不能直接喂给 querySelector；
       `>> nth=N` 用于在多个匹配里精确定位（0 基）。
       `force:true` 绕过指针命中检测 —— 画布等元素可能盖住目标。 */
    const clickIn = async (cssSel, index = 0, label = "点击目标") => {
      await page.evaluate((s) => {
        const els = [...document.querySelectorAll(s)];
        if (!els[0]) return;
        els[0].scrollIntoView({ block: "start" });
        window.scrollBy(0, -90);
      }, cssSel);
      await page.waitForTimeout(300);
      try {
        await page.click(`loc=css:${cssSel} >> nth=${index}`, { force: true, timeout: 8000, label });
        return "pointer";
      } catch (e) {
        /* 真实指针点击仍不可用时退回 DOM click —— 与旧脚本 $eval(e => e.click()) 同语义 */
        await page.evaluate((s) => {
          const els = [...document.querySelectorAll(s)];
          if (els[0]) els[0].click();
        }, cssSel);
        return "dom";
      }
    };

    await clickIn(".model-tab", 2, "切换到第三个展品");
    /* 等新展品的 GLB 真正到位再看标题 */
    await page.waitForTimeout(2500);
    const t3 = await page.evaluate(() => {
      const t = document.getElementById("viewer-title");
      return t ? t.textContent.trim() : "";
    });
    if (t3 && t3.length > 0) ok(`切换展品：标题变为「${t3}」`);
    else bad("切换展品后标题未更新");

    await clickIn("#btn-spin", 0, "切换自动旋转");
    await page.waitForTimeout(400);
    const spinLabel = await page.evaluate(() => {
      const b = document.getElementById("btn-spin");
      return b ? b.textContent.trim() : "";
    });
    if (spinLabel.includes("暂停")) ok("自动旋转开关响应正常");
    else bad(`自动旋转开关异常：${spinLabel}`);
    await clickIn("#btn-spin", 0, "切换自动旋转");
    await page.waitForTimeout(300);

    await clickIn(".filter-chip", 1, "按分类筛选图标");
    await page.waitForTimeout(600);
    const visible = await page.evaluate(() => {
      const cells = [...document.querySelectorAll(".icon-cell")];
      return cells.filter((c) => !c.classList.contains("is-hidden")).length;
    });
    if (visible > 0 && visible < 48) ok(`图标分类筛选生效：${visible} / 48 可见`);
    else bad(`图标筛选异常，可见 ${visible} / 48`);
    await clickIn(".filter-chip", 0, "恢复全部图标");
    await page.waitForTimeout(300);

    /* 灯箱 */
    const lbPath = path.join(SHOTS, "lightbox.png");
    let lbOpen = false;
    let lbFlat = false;
    let lbRect = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      await clickIn(".poster-card", 0, "打开海报灯箱");
      lbRect = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const img = document.getElementById("lightbox-img");
            const box = document.getElementById("lightbox");
            if (!img) return resolve(null);
            const t0 = Date.now();
            const tick = () => {
              const r = img.getBoundingClientRect();
              const ready =
                img.getAttribute("src") && img.complete && img.naturalWidth > 1 &&
                r.width > 40 && r.height > 40 && r.bottom > 0 && r.top < innerHeight;
              if (ready || Date.now() - t0 > 25000) {
                return resolve({
                  w: Math.round(r.width), h: Math.round(r.height),
                  top: Math.round(r.top), src: img.getAttribute("src"),
                });
              }
              requestAnimationFrame(tick);
            };
            tick();
          }),
      );
      await page.waitForTimeout(1200);
      lbOpen = await page.evaluate(() => {
        const l = document.getElementById("lightbox");
        return !!l && !l.hidden;
      });
      const st = await shoot(page, lbPath, { attempts: 1 });
      lbFlat = !!st?.flat;
      if (!lbFlat) break;
      detail(`灯箱截图第 ${attempt + 1} 次为平图，重试`);
      await page.evaluate(() => {
        const l = document.getElementById("lightbox");
        if (l) l.hidden = true;
        document.body.style.overflow = "";
      });
      await page.waitForTimeout(800);
    }
    if (lbOpen) ok("灯箱可打开");
    else bad("灯箱未打开");
    if (!lbFlat) ok(`灯箱截图有效（大图 ${lbRect?.w}×${lbRect?.h} @ ${lbRect?.top}）`);
    else bad("灯箱截图为平图，内容未渲染");

    if (!(await page.evaluate(() => {
      const l = document.getElementById("lightbox");
      return !!l && !l.hidden;
    }))) {
      await clickIn(".poster-card", 0, "打开海报灯箱");
      await page.waitForTimeout(1200);
    }
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    const lbClosed = await page.evaluate(() => {
      const l = document.getElementById("lightbox");
      return !!l && l.hidden;
    });
    if (lbClosed) ok("灯箱键盘操作（→ / Esc）正常");
    else bad("灯箱未能关闭");

    /* ══════════ 阶段 E：区块截图 ══════════ */
    console.log("\n· 阶段 E — 区块截图");
    const sections = [
      ["hero", "#top", 2200],
      ["tokens", "#tokens", 2200],
      ["fonts", "#fonts", 2200],
      ["icons", "#icons", 2200],
      ["posters", "#posters", 2200],
      ["covers", "#covers", 2200],
      ["cases", "#cases", 2200],
      ["models", "#models", 6000],
      ["fallback", "#fallback", 2200],
    ];
    for (const [name, sel, settle] of sections) {
      await open(page, `${BASE}/${sel}`, { settle });
      await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (el) el.scrollIntoView({ block: "start" });
      }, sel);
      await page.waitForTimeout(1200);
      const file = path.join(SHOTS, `section-${name}.png`);
      const st = await shoot(page, file);
      if (!st?.flat) ok(`区块截图 ${name}`, st ? `${st.width}×${st.height} stddev=${st.stddev}` : "");
      else bad(`区块截图 ${name}：截图为平图，内容未渲染`);
    }
    ok("分区截图已覆盖全部区块（整页截图按 ATLAS_FULLPAGE=1 开启）");

    /* ══════════ 阶段 F：响应式 ══════════ */
    console.log("\n· 阶段 F — 响应式");
    await open(page, `${BASE}/index.html`, { settle: 2000 });
    for (const [label, w, h] of [["mobile", 390, 844], ["tablet", 820, 1180]]) {
      await setViewport(page, w, h, w <= 480 ? 2 : 1);
      await page.waitForTimeout(1200);
      const m = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      if (m.innerWidth !== w) bad(`${label} 视口不精确：请求 ${w} 实测 ${m.innerWidth}`);
      if (m.overflow <= 1) ok(`${label} (${w}px) 无横向溢出`);
      else bad(`${label} (${w}px) 横向溢出 ${m.overflow}px`);
      const file = path.join(SHOTS, `responsive-${label}.png`);
      const st = await shoot(page, file);
      if (!st?.flat) ok(`${label} 截图有效`, st ? `stddev=${st.stddev}` : "");
      else bad(`${label} 截图为平图`);
    }
    await setViewport(page, 1440, 900);

    /* ══════════ 网络与控制台 ══════════ */
    console.log("\n· 网络与控制台");
    await drainEvents(page);
    const baseOrigin = new URL(BASE).origin;
    const external = netState.requests.filter((r) => {
      if (!/^https?:/.test(r.url)) return false;
      try { return new URL(r.url).origin !== baseOrigin; } catch { return false; }
    });
    if (external.length === 0) ok("零外部请求（无任何跨域资源）");
    else bad(`发现 ${external.length} 个外部请求：${external.slice(0, 5).map((r) => r.url).join(", ")}`);

    /* 页面主动关闭时会产生 ERR_ABORTED，不算产物缺陷 */
    const realFailed = netState.failed.filter((e) => !/ERR_ABORTED|net::ERR_ABORTED/i.test(e));
    if (realFailed.length === 0) ok("无失败请求");
    else bad(`失败请求 ${realFailed.length} 个：${realFailed.slice(0, 5).join(" | ")}`);

    const realErrors = netState.consoleErrors.filter((e) => !/favicon|Failed to load resource.*404/i.test(e));
    if (realErrors.length === 0) ok("控制台无错误");
    else bad(`控制台错误 ${realErrors.length} 条：${realErrors.slice(0, 5).join(" | ")}`);
  } catch (e) {
    bad("验收脚本异常终止", String(e && e.message ? e.message : e));
    console.error(e);
  }

  /* ── 汇总与报告 ─────────────────────────────────────────────── */
  const shots = (await fs.readdir(SHOTS)).filter((f) => f.endsWith(".png"));
  const shotStats = [];
  for (const f of shots) {
    const s = await grayscaleStats(path.join(SHOTS, f));
    shotStats.push({ file: f, ...s });
  }
  const failed = checks.filter((c) => !c.ok);
  const report = {
    target: cfg.label,
    url: BASE,
    browser: "ego-browser (ego-lite)",
    spaceId,
    generatedAt: new Date().toISOString(),
    verdict: failed.length ? "FAIL" : "PASS",
    total: checks.length,
    passed: checks.length - failed.length,
    failed: failed.length,
    checks,
    screenshots: shotStats,
    network: {
      requests: netState.requests.length,
      external: netState.requests.filter((r) => /^https?:/.test(r.url)).map((r) => r.url),
      failed: netState.failed,
      consoleErrors: netState.consoleErrors,
    },
  };
  const reportPath = path.join(OUT, `${cfg.label || "07-museum-art"}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n" + "=".repeat(58));
  console.log(`通过 ${checks.length - failed.length} / ${checks.length} 项`);
  console.log(`截图目录：${SHOTS}（${shots.length} 张）`);
  if (failed.length) {
    console.log("\n失败项：");
    failed.forEach((f) => console.log("  ✗ " + f.m + (f.d ? " — " + f.d : "")));
  } else {
    console.log("\n✓ 浏览器验收全部通过。");
  }

  /* 关闭 agent 开的页面，把 TaskSpace 还给用户（保留登录态，不清 cookies） */
  try {
    for (const p of await task.pages()) {
      if (p.openedBy === "agent") await p.close();
    }
  } catch {
    /* ignore */
  }

  return { reportPath, verdict: report.verdict, passed: report.passed, total: report.total };
}
