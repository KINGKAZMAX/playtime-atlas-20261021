/**
 * ego-acceptance.mjs — 《联机曙光 LINK DAWN》实机验收（Ego 浏览器版，53 项断言）
 *
 * 这是 `scripts/acceptance.cjs`（旧版无头浏览器脚本）的 **完整移植版**：
 * 断言名称、判定口径、截图文件名与源脚本一一对应，**未删减、未弱化**。
 * 唯一的路径差异是浏览器驱动：按用户的长期约定，网页访问 / 截图 / 网页验收
 * 一律只走 Ego 浏览器（`/Users/mekzenx2/.local/bin/ego-browser`），
 * 不另起任何其它浏览器进程。
 *
 * 移植要点（旧 API → Ego）：
 *   - 浏览器启动 + newContext()  → `taskSpace(name)` + `task.page("p1")`
 *   - `page.locator(x).innerText()`  → `page.evaluate(fn, arg)` 取 innerText
 *   - `page.locator(x).count()`      → `page.evaluate(fn, arg)` 取 length
 *   - `page.locator(x).isVisible()`  → `page.evaluate(fn, arg)` 判可见性
 *   - `page.locator(x).click()`      → 滚动到视口 + 命中测试 + `page.mouse.click`
 *   - `canvas.click({position})`     → 画布格子换算成视口坐标 + `page.mouse.click`
 *   - `selectOption(sel, value)`     → 设 value 后派发 `change` 事件（产品监听 change）
 *   - `dispatchEvent('pointerdown')` → 真实指针 `mouse.down` / `mouse.up`
 *   - `page.on('console'/'pageerror'/'requestfailed'/'request')`
 *                                  → `Runtime.enable` / `Network.enable` + `page.events()`
 *   - `page.setViewportSize()`      → `Emulation.setDeviceMetricsOverride`（**必须 mobile:true**）
 *   - `browser.close()`             → `task.finish({ keep: [] })`（只在最后一轮调一次）
 *
 * Ego 侧的三条硬约束（见 tools/ego-qa/MIGRATION.md）：
 *   ① Ego 的 nodejs 进程没有 argv、也不继承环境变量 → 配置必须由调用方写进脚本；
 *   ② `page.evaluate` 回调不能引用模块作用域 → 页面内辅助函数一律定义在回调内部；
 *   ③ 视口必须 `mobile: true`，否则 Chromium 把 1440 放大成 1600，污染响应式与溢出判定。
 *
 * 运行（普通 node 包装器负责生成一次性脚本交给 Ego）：
 *   node scripts/run-ego-acceptance.mjs --url http://127.0.0.1:4332/ \
 *     --out /abs/out --shot-dir /abs/out/screenshots
 *
 * 产出：<outDir>/qa-ego-acceptance.json —— 与 qa-result.json 同格式：[{ name, ok, detail }]
 */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ═══════════════════════════════════════════════════════════════════
 * Node 侧辅助函数（不进入页面上下文）
 * ═══════════════════════════════════════════════════════════════════ */

/** 取第 idx 个匹配元素的 innerText（找不到返回 ''）。 */
function textOf(page, sel, idx = 0) {
  return page.evaluate(
    ({ sel, idx }) => {
      const el = document.querySelectorAll(sel)[idx];
      return el ? el.innerText : "";
    },
    { sel, idx },
  );
}

/** 取匹配元素个数。 */
function countOf(page, sel) {
  return page.evaluate((s) => document.querySelectorAll(s).length, sel);
}

/** 判可见性：等价于旧脚本的 isVisible()（存在 + 未 hidden + 有尺寸）。 */
function isVisible(page, sel, idx = 0) {
  return page.evaluate(
    ({ sel, idx }) => {
      const el = document.querySelectorAll(sel)[idx];
      if (!el) return false;
      if (el.hidden) return false;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    },
    { sel, idx },
  );
}

/**
 * 指针坐标标定：Ego / Chromium 的**输入坐标**与布局视口的 CSS 像素之间存在一个
 * 缩放系数（实测恒为 0.9 —— 请求 1440 的视口，输入坐标 100 落在 CSS 90 处）。
 * 该系数在 page.click()、page.mouse.click()、原始 CDP Input.dispatchMouseEvent
 * 上**一视同仁**，所以所有指针动作都必须先除以它，否则点击会整体偏到左上角。
 *
 * 标定方式：发一次 **mouseMoved**（不产生任何 click，不会误触产品），
 * 用页面里的 pointermove 监听读回真实的 clientX/clientY。
 */
async function calibratePointer(page) {
  const cands = [
    [200, 150],
    [321, 241],
    [143, 377],
  ];
  for (const [rx, ry] of cands) {
    await page.evaluate(() => {
      window.__qaMove = [];
      if (!window.__qaMoveHooked) {
        window.__qaMoveHooked = true;
        window.addEventListener(
          "pointermove",
          (e) => {
            window.__qaMove.push({ x: e.clientX, y: e.clientY });
          },
          true,
        );
      }
    });
    await page.mouse.move(rx, ry, { label: "calibrate pointer scale" });
    await page.waitForTimeout(180);
    const s = await page.evaluate(() => {
      const l = window.__qaMove || [];
      return l.length ? l[l.length - 1] : null;
    });
    if (s && typeof s.x === "number") {
      const sx = s.x / rx;
      const sy = s.y / ry;
      if (sx > 0.2 && sx < 5 && sy > 0.2 && sy < 5) {
        return { sx, sy, probe: { rx, ry, landed: s } };
      }
    }
  }
  throw new Error("指针坐标标定失败：未能读到 pointermove 落点");
}

/** 在 CSS 坐标 (x, y) 处落一次真实点击（内部按标定系数换算输入坐标）。 */
async function mouseClick(page, x, y, scale, label = "click page") {
  await page.mouse.click(x / scale.sx, y / scale.sy, { label });
}

/**
 * 把元素滚到视口中央并做**命中测试**，返回可点击的视口坐标（CSS 像素）。
 *
 * 为什么不用 page.click(selector)：
 *   ① Ego 的 page.click 内部也按 0.9 系数换算输入坐标（与 page.mouse.click 同源），
 *      在 mobile:true 的视口下会整体点到元素的左上角 —— 命中测试能提前发现。
 *   ② 本站 html 上有 `scroll-behavior: smooth`，自动滚动走平滑动画，
 *      动画途中做命中测试会点到别的元素；这里一律先 `scrollIntoView({behavior:"instant"})`。
 *   ③ 命中测试能保证点击真的落在目标上，而不是被遮挡。
 */
async function locate(page, sel, { idx = 0, text = null } = {}) {
  return await page.evaluate(
    ({ sel, idx, text }) => {
      const list = Array.from(document.querySelectorAll(sel));
      const el = text
        ? list.find((n) => (n.innerText || n.textContent || "").trim().includes(text))
        : list[idx];
      if (!el) return null;
      el.scrollIntoView({ block: "center", behavior: "instant" });
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const spots = [
        [0.5, 0.5],
        [0.5, 0.32],
        [0.5, 0.68],
        [0.32, 0.5],
        [0.68, 0.5],
        [0.25, 0.5],
        [0.75, 0.5],
      ];
      for (const [fx, fy] of spots) {
        const cx = r.left + r.width * fx;
        const cy = r.top + r.height * fy;
        if (cx < 0 || cx > vw || cy < 0 || cy > vh) continue;
        const hit = document.elementFromPoint(cx, cy);
        if (hit && (hit === el || el.contains(hit))) {
          return {
            cx,
            cy,
            hitOk: true,
            hit: `${hit.tagName}.${typeof hit.className === "string" ? hit.className : ""}`,
            rect: { left: r.left, top: r.top, width: r.width, height: r.height },
          };
        }
      }
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      return {
        cx,
        cy,
        hitOk: false,
        hit: hit ? `${hit.tagName}.${typeof hit.className === "string" ? hit.className : ""}` : null,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
      };
    },
    { sel, idx, text },
  );
}

/** 真实点击一个元素（滚到视口 → 命中测试 → 换算坐标 → page.mouse.click）。 */
async function clickAt(page, sel, scale, { idx = 0, text = null, label = "click element" } = {}) {
  const info = await locate(page, sel, { idx, text });
  if (!info) throw new Error(`clickAt: 找不到元素 ${sel}${text ? `（含文字「${text}」）` : ""}`);
  if (!info.hitOk) throw new Error(`clickAt: ${sel} 被 ${info.hit} 遮挡，点击坐标 ${info.cx},${info.cy}`);
  await mouseClick(page, info.cx, info.cy, scale, label);
  return info;
}

/**
 * 画布格子坐标 → 视口坐标。
 * 逻辑 640×400（16 列 × 10 行），CSS 盒按比例缩放，故列宽 = w/16、行高 = h/10。
 */
async function canvasCellPoint(page, sel, col, row) {
  await page.evaluate(
    (s) => {
      const e = document.querySelector(s);
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    },
    sel,
  );
  await page.waitForTimeout(150);
  return await page.evaluate(
    ({ sel, col, row }) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cx = r.left + ((col + 0.5) * r.width) / 16;
      const cy = r.top + ((row + 0.5) * r.height) / 10;
      const hit = document.elementFromPoint(cx, cy);
      return {
        cx,
        cy,
        hitOk: !!hit && (hit === el || el.contains(hit)),
        hit: hit ? `${hit.tagName}.${typeof hit.className === "string" ? hit.className : ""}` : null,
      };
    },
    { sel, col, row },
  );
}

/** 点击画布的某个格子。 */
async function clickCanvasCell(page, sel, col, row, scale, label = "click canvas cell") {
  const p = await canvasCellPoint(page, sel, col, row);
  if (!p) throw new Error(`clickCanvasCell: 找不到画布 ${sel}`);
  if (!p.hitOk) throw new Error(`clickCanvasCell: 格子 (${col},${row}) 被 ${p.hit} 遮挡`);
  await mouseClick(page, p.cx, p.cy, scale, label);
  return p;
}

/**
 * 轻点一个键：down → 间隔 → up。
 *
 * 为什么不用 press()：产品对方向键 / A / B / START 走的是「本帧刚按下」轮询
 * （input.wasPressed），keydown 与 keyup 若落在同一帧会被吞掉。down→间隔→up
 * 保证 keydown 与 keyup 跨过渲染帧，等价于真实轻点。
 * 间隔 160ms < 产品的连发延迟 0.4s，故一次轻点只触发一次。
 */
async function tapKey(page, key, holdMs = 160) {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(120);
}

/** 长按一个键。 */
async function holdKey(page, key, holdMs) {
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(150);
}

/**
 * 轮询直到条件成立，返回最后一次读数。
 *
 * 为什么不用固定 sleep：Ego 是**用户真实浏览器**，后台 / 被遮挡窗口的
 * requestAnimationFrame 会被 Chromium 节流（实测 ~10fps），产品固定步长主循环
 * 的推进速度随之下降，键盘事件与状态变更也会被排队延后。固定等待会偶发误判。
 * 这里只把**等待**改成条件轮询，**断言条件一字不改**。
 */
async function pollUntil(read, ok, { timeout = 8000, step = 200 } = {}) {
  const t0 = Date.now();
  let v = await read();
  while (!ok(v) && Date.now() - t0 < timeout) {
    await sleep(step);
    v = await read();
  }
  return v;
}

/** 轮询某个选择器的文本，直到匹配 re。 */
function pollText(page, sel, re, opts = {}) {
  return pollUntil(() => textOf(page, sel), (v) => re.test(v), opts);
}

/* ═══════════════════════════════════════════════════════════════════
 * 主入口
 * ═══════════════════════════════════════════════════════════════════ */

/**
 * @param {{url:string, spaceName:string, outDir:string, shotDir:string}} config
 * @returns {Promise<{results:Array, failed:number, passed:number, total:number}>}
 */
export async function runEgoAcceptance(config) {
  const { url, spaceName, outDir, shotDir } = config || {};
  if (!url || !spaceName || !outDir) {
    throw new Error("runEgoAcceptance 需要 url / spaceName / outDir");
  }
  const shots = shotDir || `${outDir}/screenshots`;

  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(shots, { recursive: true });

  const results = [];
  const check = (name, ok, detail = "") => {
    results.push({ name, ok: !!ok, detail: String(detail) });
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  };

  const BASE = url;
  const shot = (name) => path.join(shots, name);

  // ── 指针缩放系数（Ego/Chromium 输入坐标 ↔ 布局视口 CSS 像素）──
  let pointerScale = { sx: 1, sy: 1 };

  // ── 视口：必须 mobile:true，否则 Chromium 把 1440 放大成 1600 ──
  const setViewport = async (w, h, dpr = 1) => {
    await page.cdp("Emulation.setDeviceMetricsOverride", {
      width: w,
      height: h,
      deviceScaleFactor: dpr,
      mobile: true,
    });
    await page.waitForTimeout(300);
    const got = await page.evaluate(() => document.documentElement.clientWidth);
    if (Math.abs(got - w) > 2) {
      // 回读校准：仍用 mobile:true，按实测比例重设
      await page.cdp("Emulation.setDeviceMetricsOverride", {
        width: Math.round(w * (w / got)),
        height: Math.round(h * (w / got)),
        deviceScaleFactor: dpr,
        mobile: true,
      });
      await page.waitForTimeout(300);
    }
    const m = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    if (Math.abs(m.clientWidth - w) > 2) {
      throw new Error(`视口精度自检失败：请求 ${w}px，实测 ${m.clientWidth}px`);
    }
    console.log(`  · 视口 ${w}×${h}（dpr ${dpr}）实测 clientWidth=${m.clientWidth}`);
    return m;
  };

  /** 重新标定指针坐标系数（每次导航 / 换视口后都要重标 —— 文档换了，探针也没了）。 */
  const recalibratePointer = async () => {
    pointerScale = await calibratePointer(page);
    console.log(
      `  · 指针坐标标定：输入 × ${pointerScale.sx.toFixed(4)} = CSS（探针 ${pointerScale.probe.rx},${pointerScale.probe.ry} → ${pointerScale.probe.landed.x},${pointerScale.probe.landed.y}）`,
    );
    return pointerScale;
  };

  /** 打开地址：导航已提交但 load 事件偶发超时时，继续用 waitForLoadState 兜底。 */
  const gotoUrl = async (u) => {
    try {
      await page.goto(u);
    } catch (e) {
      console.log(`  ! goto 报告超时（${e.name}），导航已提交，继续等待 load`);
    }
    try {
      await page.waitForLoadState("load", { timeout: 20000 });
    } catch {
      console.log("  ! load 事件超时，按当前已加载状态继续");
    }
  };

  /**
   * 重新加载当前页。
   * Ego 的 reload 默认 15s 等 load 事件；机器负载高 / 后台窗口节流时会超时，
   * 但导航其实已经提交 —— 所以超时不算失败，继续等 load 再兜底。
   */
  const reloadPage = async () => {
    try {
      await page.reload();
    } catch (e) {
      console.log(`  ! reload 报告超时（${e.name}），导航已提交，继续等待 load`);
    }
    try {
      await page.waitForLoadState("load", { timeout: 20000 });
    } catch {
      console.log("  ! load 事件超时，按当前已加载状态继续");
    }
  };

  // ── 事件收集：Runtime / Network 域 + page.events() 缓冲 ──
  /**
   * 判定「外部请求」的口径：只统计**跨源的 http(s) 请求**。
   *
   * 为什么不能照抄源脚本的「URL 不以 BASE 开头」：
   *   源脚本跑在全新无头浏览器里，网络事件只有被测页面的请求；
   *   Ego 是用户真实浏览器，网络事件里会混进浏览器自身的资源 ——
   *   chrome:// 、chrome-untrusted://（新标签页的 Google 搜索条）、
   *   chrome-extension://（扩展注入）等。这些不是被测页面的责任，
   *   计入会造成误报。判定口径与 tools/ego-qa/lib/runner.mjs 一致：
   *   **只把跨源的真实网络请求算作外部请求**。
   */
  const BASE_ORIGIN = new URL(url).origin;
  const isRealNetwork = (u) => {
    if (!u) return false;
    const scheme = u.split(":")[0].toLowerCase();
    if (scheme !== "http" && scheme !== "https") return false;
    try {
      return new URL(u).origin !== BASE_ORIGIN;
    } catch {
      return false;
    }
  };

  const makeBucket = () => ({
    consoleErrors: [],
    pageErrors: [],
    failedRequests: [],
    externalRequests: [],
    httpErrors: [],
  });
  const desktopNet = makeBucket();
  const mobileNet = makeBucket();
  let bucket = desktopNet;
  const reqUrls = new Map();

  const argText = (args) =>
    (args || [])
      .map((a) => (a && a.value !== undefined ? String(a.value) : a && a.description ? String(a.description) : ""))
      .join(" ");

  /** 取出并清空 Ego 的事件缓冲，合并进当前 bucket。 */
  const drain = async () => {
    const events = await page.events();
    for (const e of events) {
      const m = e.method;
      const p = e.params || {};
      if (m === "Network.requestWillBeSent") {
        const u = p.request?.url || "";
        if (p.requestId) reqUrls.set(p.requestId, u);
        if (isRealNetwork(u)) bucket.externalRequests.push(u);
      } else if (m === "Network.responseReceived") {
        const st = p.response?.status;
        if (st && st >= 400) {
          bucket.httpErrors.push(`${st} ${p.response?.url || ""}`);
        }
      } else if (m === "Network.loadingFailed") {
        const u = reqUrls.get(p.requestId) || "";
        // 只统计被测页面自身的失败请求；浏览器自身的资源失败不算被测页面的责任
        if (u && u.startsWith(BASE)) bucket.failedRequests.push(`${u} :: ${p.errorText || "unknown"}`);
      } else if (m === "Runtime.consoleAPICalled" && p.type === "error") {
        bucket.consoleErrors.push(argText(p.args));
      } else if (m === "Runtime.exceptionThrown") {
        const d = p.exceptionDetails || {};
        bucket.pageErrors.push(d.exception?.description || d.text || "unknown");
      }
    }
    return events.length;
  };

  // ── TaskSpace：按名复用，保留用户登录态，不清 cookies ──
  const task = await taskSpace(spaceName);
  const page = task.page("p1");
  console.log(`TaskSpace: ${spaceName} (id=${task.spaceId})`);
  let fatalError = null;

  /** 关闭平滑滚动 —— 与源脚本 page.addStyleTag 同义，避免滚动与点击互相干扰。 */
  const killSmoothScroll = () =>
    page.evaluate(() => {
      let st = document.getElementById("__qa_no_smooth_scroll");
      if (!st) {
        st = document.createElement("style");
        st.id = "__qa_no_smooth_scroll";
        document.head.appendChild(st);
      }
      st.textContent = "html{scroll-behavior:auto !important}";
    });

  /** 等样式表就绪：readyState complete 且 CSS 规则数 > 0（不靠固定 sleep 赌运气）。 */
  const waitForStyles = async (timeout = 10000) => {
    const t0 = Date.now();
    let last = null;
    while (Date.now() - t0 < timeout) {
      try {
        last = await page.evaluate(() => {
          let rules = 0;
          for (const sh of document.styleSheets) {
            try {
              rules += sh.cssRules.length;
            } catch {
              /* 跨源样式表读不到规则，跳过 */
            }
          }
          return { readyState: document.readyState, rules };
        });
        if (last && last.readyState === "complete" && last.rules > 0) return last;
      } catch {
        /* 页面还在导航，稍后重试 */
      }
      await sleep(150);
    }
    return last;
  };

  try {
    await page.cdp("Runtime.enable", {});
    await page.cdp("Network.enable", {});
    await page.cdp("Log.enable", {});
    await drain(); // 清空既有缓冲

    await setViewport(1440, 900, 1);
    await gotoUrl(url);
    await waitForStyles();
    await killSmoothScroll();
    await recalibratePointer();
    await page.waitForTimeout(1200);

    // 可复现性：源脚本跑在全新浏览器 profile（无 localStorage），
    // Ego 的 TaskSpace 会跨轮保留 localStorage —— 故先清掉本应用自己的键
    // （前缀 linkdawn.v1.），只动本应用的数据，不碰 cookies 与其它站点。
    const cleared = await page.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("linkdawn.")) keys.push(k);
      }
      for (const k of keys) localStorage.removeItem(k);
      return keys;
    });
    if (cleared.length) console.log(`  · 已清理本应用旧存档：${cleared.join(", ")}`);
    await reloadPage();
    await waitForStyles();
    await killSmoothScroll();
    await recalibratePointer();
    await page.waitForTimeout(1200);

    /* ═══════ 1. 外壳与诚信声明 ═══════ */
    const noticeText = await textOf(page, ".notice__body");
    check("顶部「本地单机」声明存在", /没有任何联网对战功能/.test(noticeText));
    check(
      "声明点名 AI 非真人",
      /由本机程序控制的 ?AI/.test(noticeText) || /由本机程序控制的AI/.test(noticeText),
    );

    const aiBadge = await textOf(page, ".badge--ai");
    check("AI 对手常驻标识", /非真人/.test(aiBadge) && /无联网/.test(aiBadge), aiBadge);

    const productText = await page.evaluate(() => {
      const parts = [];
      for (const sel of [".shell__head", ".notice", "#exhibits", ".shell__foot"]) {
        document.querySelectorAll(sel).forEach((n) => parts.push(n.innerText));
      }
      return parts.join("\n");
    });
    const badOnline = [];
    for (const sentence of productText.split(/[。！？\n]+/)) {
      if (!/多人在线|联网对战|真人匹配|在线对战/.test(sentence)) continue;
      if (/没有|无|不|非|禁止|而非|不存在|本地单机|不连接|历史|史料|描述|澄清/.test(sentence)) continue;
      badOnline.push(sentence.trim());
    }
    check("产品区域无误导性「多人在线」表述", badOnline.length === 0, badOnline.join(" | "));

    const clarify = await textOf(page, "#sources .notice--soft");
    check("史料区含「多人在线=史料描述」澄清", /描述的是史料/.test(clarify));

    /* ═══════ 2. 来源角标 ═══════ */
    const srcCount = await countOf(page, "#timeline .src");
    check("年表来源角标数量充足", srcCount >= 30, `${srcCount} 枚`);
    const srcTotal = await countOf(page, ".src");
    check("全站来源角标数量", srcTotal >= 80, `${srcTotal} 枚`);
    const ledgerCount = await countOf(page, ".srclist__item");
    check("史料台账条目数", ledgerCount >= 55, `${ledgerCount} 条`);
    const badHref = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll(".src"));
      return els.filter((e) => !/^https:\/\//.test(e.getAttribute("href") || "")).length;
    });
    check("所有来源角标为 https 外链", badHref === 0, `${badHref} 个异常`);

    await page.screenshot({ path: shot("01-shell-hero.png") });
    await page.evaluate(() => {
      const e = document.querySelector("#timeline");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: shot("02-timeline.png") });
    await page.evaluate(() => {
      const e = document.querySelector("#sources");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: shot("03-sources-ledger.png") });

    /* ═══════ 3. 展项 A：建造 / 升级 / 资源 / 暂停 / 存读档 ═══════ */
    await page.evaluate(() => {
      const e = document.querySelector("#exhibits");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(500);

    // 测试期稳定器：把「准备阶段自动开波」的倒计时拉长，并保证灯塔耐久不被波次打穿。
    // 原因：若放任 22s 自动开波，会出现「波次自行开始 → 灯塔被打穿 → 结算遮罩
    // 挡住后续点击」的竞态。这是测试侧白盒干预，不改变产品行为。
    const stabilize = () =>
      page.evaluate(() => {
        const s = window.__linkDawn.defense.getState();
        s.prepTimer = 600;
        if (s.beaconHp < 100) s.beaconHp = 100;
      });
    await stabilize();

    // 选塔种
    await clickAt(page, 'button[data-kind="pulse"]', pointerScale, { label: "select pulse tower" });
    const pressed = await pollUntil(
      () =>
        page.evaluate(() =>
          document.querySelector('button[data-kind="pulse"]').getAttribute("aria-pressed"),
        ),
      (v) => v === "true",
      { timeout: 5000 },
    );
    check("塔种按钮进入建造模式", pressed === "true");

    const sigmaBefore = parseInt(await textOf(page, ".panel--hud .stat__value"), 10);

    // 在主航道旁的可建造格 (6,3) 上建造 —— 该格为 'build'
    await clickCanvasCell(page, ".defense__canvas", 6, 3, pointerScale, "build tower at cell 6,3");
    const sigmaAfter = await pollUntil(
      async () => parseInt(await textOf(page, ".panel--hud .stat__value"), 10),
      (v) => v < sigmaBefore,
      { timeout: 5000 },
    );
    check("建造消耗晶格", sigmaAfter < sigmaBefore, `${sigmaBefore} → ${sigmaAfter}`);

    // 再建一座
    await clickCanvasCell(page, ".defense__canvas", 7, 3, pointerScale, "build second tower");
    await page.waitForTimeout(200);

    // 选中塔 → 升级
    await clickCanvasCell(page, ".defense__canvas", 6, 3, pointerScale, "select tower at 6,3");
    const selName = await pollText(page, ".sel__name", /脉冲塔/, { timeout: 5000 });
    check("点选已有塔显示详情", /脉冲塔/.test(selName), selName);

    const upLabelBefore = await textOf(page, ".sel__actions .btn--primary");
    await clickAt(page, ".sel__actions .btn--primary", pointerScale, { label: "upgrade tower" });
    const selNameAfter = await pollText(page, ".sel__name", /Lv2/, { timeout: 5000 });
    check("升级生效（Lv1→Lv2）", /Lv2/.test(selNameAfter), `${selName} → ${selNameAfter}`);
    const dmgAfter = await pollText(page, ".sel__list li", /21/, { timeout: 5000 });
    check("升级后数值变化", /21/.test(dmgAfter), dmgAfter);

    // 开波状态提示（常驻文案，说明按钮为什么亮/灭）
    const barNote = await textOf(page, ".bar__countdown");
    check(
      "开波状态提示常驻可见",
      /(\d+s 后自动开波|第 \d+ 波进行中|本局已结束)/.test(barNote.trim()),
      barNote,
    );

    // 开波：把准备倒计时调回正常值再开波，避免测试稳定器造成不真实的巨额「提前出击」奖励
    await page.evaluate(() => {
      window.__linkDawn.defense.getState().prepTimer = 12;
    });
    const waveBefore = parseInt((await textOf(page, ".panel--hud .stat__value", 2)).split("/")[0], 10);
    const startEnabled = await page.evaluate(() => {
      const b = document.querySelector('[data-act="start"]');
      return !!b && !b.disabled;
    });
    if (startEnabled) {
      await clickAt(page, '[data-act="start"]', pointerScale, { label: "start wave now" });
    }
    const waveText = await pollUntil(
      async () => await textOf(page, ".panel--hud .stat__value", 2),
      (t) => parseInt(t.split("/")[0], 10) >= 1,
      { timeout: 8000 },
    );
    const waveAfter = parseInt(waveText.split("/")[0], 10);
    check(
      "开波后波次推进",
      waveAfter >= 1 && (!startEnabled || waveAfter > waveBefore),
      `${waveBefore}/18 → ${waveText}${startEnabled ? "" : "（准备阶段已自动开波）"}`,
    );

    // 等敌人真正生成。
    // 为什么不固定 sleep：Ego 是用户真实浏览器，后台窗口的 requestAnimationFrame
    // 会被 Chromium 节流（实测 ~10fps），产品的固定步长主循环推进速度随之下降，
    // 固定 4.5s 等待会偶发误判。**判定条件不变**，只是把等待改成条件轮询。
    let combat = { enemies: 0, wave: 0, over: null };
    for (let i = 0; i < 24; i++) {
      await page.waitForTimeout(500);
      combat = await page.evaluate(() => {
        const s = window.__linkDawn.defense.getState();
        return { enemies: s.enemies.length, wave: s.wave, over: s.over };
      });
      if (combat.enemies > 0) break;
    }
    check(
      "战斗循环在运行（敌人已在战场生成）",
      combat.enemies > 0 && combat.over === null,
      `场上敌人 ${combat.enemies} · 第 ${combat.wave} 波`,
    );

    // 取景：把战场画布滚到视口内，保证截图里能看到真实渲染的战场
    await page.evaluate(() => {
      const e = document.querySelector(".defense__canvas");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot("04-exhibit-defense.png") });

    // 暂停
    await tapKey(page, "KeyP");
    const pauseVisible = await pollUntil(
      () => isVisible(page, ".defense__overlay"),
      (v) => v === true,
      { timeout: 6000 },
    );
    check("P 键暂停并显示遮罩", pauseVisible);
    const waveFrozen = await textOf(page, ".panel--hud .stat__value", 2);
    await page.waitForTimeout(1500);
    const waveFrozen2 = await textOf(page, ".panel--hud .stat__value", 2);
    check("暂停时模拟冻结", waveFrozen === waveFrozen2, `${waveFrozen} / ${waveFrozen2}`);
    await page.evaluate(() => {
      const e = document.querySelector(".defense__canvas");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot("05-defense-paused.png") });
    await tapKey(page, "KeyP");
    const resumed = await pollUntil(
      async () => !(await isVisible(page, ".defense__overlay")),
      (v) => v === true,
      { timeout: 6000 },
    );
    check("再次按 P 恢复", resumed);

    // 存档 → 读档
    await clickAt(page, '[data-act="save"]', pointerScale, { label: "save game" });
    await page.waitForTimeout(400);
    const saved = await page.evaluate(() => {
      const k = Object.keys(localStorage).find((x) => x.includes("defense.save"));
      return k ? localStorage.getItem(k) : null;
    });
    check("存档写入 localStorage", !!saved && saved.includes('"v":1'));

    await clickAt(page, '[data-act="load"]', pointerScale, { label: "load game" });
    await page.waitForTimeout(500);
    await stabilize();
    const loadedSigma = parseInt(await textOf(page, ".panel--hud .stat__value"), 10);
    check("读档恢复资源", Number.isFinite(loadedSigma), `Σ=${loadedSigma}`);

    // AI 对手：切到「激进」档，缩短突击间隔，验证 AI 真的发动了突击
    const diffSet = await page.evaluate(() => {
      const sel = document.querySelector(".game__bar select");
      if (!sel) return false;
      sel.value = "aggressive";
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      return sel.value === "aggressive";
    });
    if (!diffSet) throw new Error("找不到 AI 难度下拉框 .game__bar select");
    await page.waitForTimeout(400);
    await clickCanvasCell(page, ".defense__canvas", 6, 3, pointerScale, "select tower at 6,3");
    await page.waitForTimeout(200);
    const intentPre = await textOf(page, ".ai__intent");
    const countPre = parseInt(await textOf(page, ".panel--ai .stat__value", 2), 10);
    let aiAssaulted = false;
    // 观察窗口比源脚本更宽（源 40×700ms=28s，这里 90×700ms=63s）：
    // 突击间隔 16s 是**游戏内**时间，后台窗口的 rAF 节流会拉长墙钟等待。
    // 判定条件不变（突击次数确实增长）。
    for (let i = 0; i < 90; i++) {
      await page.waitForTimeout(700);
      await stabilize();
      await drain();
      const c = parseInt(await textOf(page, ".panel--ai .stat__value", 2), 10);
      if (c > countPre) {
        aiAssaulted = true;
        break;
      }
    }
    const countPost = parseInt(await textOf(page, ".panel--ai .stat__value", 2), 10);
    check("AI 对手真实发动突击（非随机刷怪）", aiAssaulted, `突击次数 ${countPre} → ${countPost}`);
    const aiLogText = await textOf(page, ".ai__log");
    check("AI 面板记录突击事件", /突击/.test(aiLogText), aiLogText.split("\n")[0] || "(空)");
    const intentPost = await textOf(page, ".ai__intent");
    check("AI 意图文本随状态变化", intentPre !== intentPost, intentPost.slice(0, 50));

    // AI 突击单位真实出现在灰烬航道（lane === 'ash'，而不是只数总数）
    let laneCount = { ash: 0, total: 0 };
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(700);
      await drain();
      laneCount = await page.evaluate(() => {
        const es = window.__linkDawn.defense.getState().enemies;
        return { ash: es.filter((e) => e.lane === "ash").length, total: es.length };
      });
      if (laneCount.ash > 0) break;
    }
    check(
      "AI 突击单位真实生成在灰烬航道",
      laneCount.ash > 0,
      `灰烬航道 ${laneCount.ash} / 场上共 ${laneCount.total}`,
    );

    // 胜负路径（白盒：直接构造终局条件）
    await page.evaluate(() => {
      window.__linkDawn.defense.getState().beaconHp = 0;
    });
    const loseTitle = await pollText(page, ".overlay__title", /失守/, { timeout: 10000 });
    check("失败结局可达（灯塔耐久归零）", /失守/.test(loseTitle), loseTitle);
    await page.evaluate(() => {
      const e = document.querySelector(".defense__canvas");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot("05b-defense-lose.png") });

    // 重开 → 制造胜利条件
    await clickAt(page, ".overlay__actions .btn--primary", pointerScale, { label: "restart battle" });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const s = window.__linkDawn.defense.getState();
      s.wave = 18;
      s.inWave = true;
      s.queue = [];
      s.enemies = [];
    });
    const winTitle = await pollText(page, ".overlay__title", /肃清|长明/, { timeout: 10000 });
    check("胜利结局可达（肃清第 18 波）", /肃清|长明/.test(winTitle), winTitle);
    const resultRows = await pollUntil(
      async () => countOf(page, ".result li"),
      (v) => v >= 6,
      { timeout: 8000 },
    );
    check("结算面板给出统计", resultRows >= 6, `${resultRows} 项`);
    await page.evaluate(() => {
      const e = document.querySelector(".defense__canvas");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: shot("05c-defense-win.png") });

    // 重新开局后继续键盘路径测试
    await clickAt(page, ".overlay__actions .btn--primary", pointerScale, { label: "restart battle again" });
    await page.waitForTimeout(500);

    // 键盘建造路径：数字键选塔 + 方向键移动光标 + Enter 建造
    const sigmaPre2 = parseInt(await textOf(page, ".panel--hud .stat__value"), 10);
    await tapKey(page, "Digit4"); // 谐振塔
    await page.waitForTimeout(150);
    // 真实轻点语义：按下→抬起之间不留连发窗口（产品的连发延迟为 0.4s，轻点只应移动 1 格）
    await tapKey(page, "ArrowRight");
    await page.waitForTimeout(150);
    await tapKey(page, "ArrowDown");
    const cursorPos = await pollUntil(
      async () => await page.evaluate(() => window.__linkDawn.defense.getState().cursor),
      (c) => c.col === 1 && c.row === 1,
      { timeout: 6000 },
    );
    check(
      "方向键可移动建造光标",
      cursorPos.col === 1 && cursorPos.row === 1,
      JSON.stringify(cursorPos),
    );
    await tapKey(page, "Enter");
    const sigmaPost2 = await pollUntil(
      async () => parseInt(await textOf(page, ".panel--hud .stat__value"), 10),
      (v) => v < sigmaPre2,
      { timeout: 8000 },
    );
    check(
      "纯键盘路径可建造（1-4 + 方向键 + Enter）",
      sigmaPost2 < sigmaPre2,
      `${sigmaPre2} → ${sigmaPost2}`,
    );
    const towerCount = await pollUntil(
      async () =>
        await page.evaluate(() => window.__linkDawn.defense.getState().towers.length),
      (v) => v >= 1,
      { timeout: 8000 },
    );
    check("键盘建造后场上确有设施", towerCount >= 1, `${towerCount} 座`);

    // 再按 Enter 选中刚建好的塔，然后 U 升级
    await tapKey(page, "Enter");
    const selBefore = await pollText(page, ".sel__name", /谐振塔|脉冲塔/, { timeout: 8000 });
    check("Enter 可选中已建成的设施", /谐振塔|脉冲塔/.test(selBefore), selBefore);
    await tapKey(page, "KeyU");
    const selAfter = await pollText(page, ".sel__name", /Lv2/, { timeout: 8000 });
    check("U 键升级生效", /Lv2/.test(selAfter), `${selBefore} → ${selAfter}`);

    /* ═══════ 4. 展项 B：掌机 ═══════ */
    await clickAt(page, 'button[data-tab="handheld"]', pointerScale, { label: "switch to handheld" });
    const panelVisible = await pollUntil(
      () => isVisible(page, ".pocket__body"),
      (v) => v === true,
      { timeout: 8000 },
    );
    check("切换到展项 B", panelVisible);

    const hpBefore = await countOf(page, ".status__hp .pip.is-on");
    const shardBefore = await countOf(page, ".status__shards .pip--shard.is-on");
    check("掌机状态条显示体力", hpBefore === 5, `${hpBefore}/5`);
    check("掌机初始碎片数", shardBefore === 0, `${shardBefore}/3`);

    // 先向上走靠近 NPC 岑（2,2），玩家初始在 (2,4)
    await holdKey(page, "ArrowUp", 700);
    await page.waitForTimeout(400);

    // 若键盘走位没落在 NPC 的交互半径内，用白盒把角色放到 岑 (2,2) 旁边
    const near = await page.evaluate(() => {
      const s = window.__linkDawn.handheld.getState();
      const pc = s.px / 8;
      const pr = (s.py - 4) / 8;
      return { d: Math.hypot(2.5 - pc, 2.5 - pr), px: s.px, py: s.py };
    });
    if (!(near.d < 1.6)) {
      console.log(`  · 键盘走位未贴近 NPC（d=${near.d.toFixed(2)}），改用白盒落位`);
      await page.evaluate(() => {
        const s = window.__linkDawn.handheld.getState();
        s.px = (2 + 0.5) * 8;
        s.py = (3 + 0.5) * 8 - 1;
      });
      await page.waitForTimeout(300);
    }

    // 用 A 键与 NPC 对话
    await tapKey(page, "KeyZ"); // A
    const speaker = await pollText(page, ".touch__speaker", /岑|守灯人|岚|薇|拾遗者|记录员/, {
      timeout: 8000,
    });
    check("对话显示说话人", /岑|守灯人|岚|薇|拾遗者|记录员/.test(speaker), speaker);

    // 推进对话直到出现带来源的历史陈述
    let sawSource = false;
    let sawHistory = false;
    let maxSrc = 0;
    let capturedHref = "";
    for (let i = 0; i < 8; i++) {
      const txtBefore = await textOf(page, ".touch__text");
      await tapKey(page, "KeyZ");
      // 等这一句真的被消费掉（后台窗口的 rAF 节流会延后按键处理）
      const txt = await pollUntil(
        async () => await textOf(page, ".touch__text"),
        (v) => v !== txtBefore,
        { timeout: 5000 },
      );
      const nSrc = await countOf(page, ".touch__src .src");
      maxSrc = Math.max(maxSrc, nSrc);
      if (nSrc > 0) {
        sawSource = true;
        if (!capturedHref) {
          capturedHref = await page.evaluate(() => {
            const el = document.querySelector(".touch__src .src");
            return el ? el.getAttribute("href") || "" : "";
          });
        }
      }
      if (/2002|2003|2004|2005|2006/.test(txt)) sawHistory = true;
    }
    check("NPC 对话含带来源角标的历史陈述", sawSource, `最多 ${maxSrc} 枚角标`);
    check("NPC 对话含具体年份史实", sawHistory);
    check("对话来源角标为可点击外链", /^https:\/\//.test(capturedHref), capturedHref);
    await page.screenshot({ path: shot("06-exhibit-handheld-dialogue.png") });

    // B 键结束对话
    await tapKey(page, "KeyX");
    const speakerAfterB = await pollUntil(
      async () => await textOf(page, ".touch__speaker"),
      (v) => !/岑|守灯人/.test(v),
      { timeout: 8000 },
    );
    check("B 键可结束对话", !/岑|守灯人/.test(speakerAfterB), speakerAfterB);

    // 触屏：按住 D-pad 右（持续按住直到角色真的走出一段距离）
    // 说明：mouse.down()/mouse.up() 不接受 label 选项（见 ego-browser 指南 v2.1.0）。
    // 为什么要轮询而不是固定 900ms：后台窗口的 rAF 被节流，产品固定步长主循环的
    // 推进速度随之下降，固定 900ms 的墙钟等待可能只换来 0.1s 的游戏内位移。
    // **判定条件不变**（px > 24），只是把等待改成条件轮询。
    const dpad = await locate(page, '.dpad__btn[aria-label="右"]');
    if (!dpad || !dpad.hitOk) throw new Error(`D-pad 右键不可点击：${dpad && dpad.hit}`);
    await page.mouse.move(dpad.cx / pointerScale.sx, dpad.cy / pointerScale.sy, { label: "hold dpad right" });
    await page.mouse.down();
    let movedX = await page.evaluate(() => window.__linkDawn.handheld.getState().px);
    for (let i = 0; i < 32 && movedX <= 24; i++) {
      await page.waitForTimeout(250);
      movedX = await page.evaluate(() => window.__linkDawn.handheld.getState().px);
    }
    await page.mouse.up();
    await page.waitForTimeout(300);
    check("触屏 D-pad 可移动角色", movedX > 24, `px=${movedX.toFixed(1)}`);

    // 暂停菜单
    await tapKey(page, "Enter"); // START
    const menuOpen = await pollUntil(
      () => isVisible(page, ".touch__menu"),
      (v) => v === true,
      { timeout: 8000 },
    );
    check("START 打开暂停菜单", menuOpen);
    await page.screenshot({ path: shot("07-handheld-pause.png") });
    // 存档
    await clickAt(page, ".touch__menu .btn", pointerScale, { text: "存档", label: "save handheld" });
    await page.waitForTimeout(400);
    const savedH = await page.evaluate(() => {
      const k = Object.keys(localStorage).find((x) => x.includes("handheld.save"));
      return k ? localStorage.getItem(k) : null;
    });
    check("掌机存档写入 localStorage", !!savedH && savedH.includes('"v":1'));
    await clickAt(page, ".touch__menu .btn", pointerScale, { text: "继续游戏", label: "resume handheld" });
    await page.waitForTimeout(300);

    // 掌机胜利路径（白盒：集齐三枚碎片后点亮灯芯）
    await page.evaluate(() => {
      const s = window.__linkDawn.handheld.getState();
      s.shards = ["回声碎片 · 潮", "回声碎片 · 隙", "回声碎片 · 顶"];
      s.leverOn = true;
      s.area = "lighthouse";
      s.px = (8 + 0.5) * 8;
      s.py = (4 + 1) * 8 - 1;
    });
    await page.waitForTimeout(500);
    await tapKey(page, "KeyZ"); // A
    const endSpeaker = await pollText(page, ".touch__speaker", /结局/, { timeout: 8000 });
    check("掌机胜利结局可达（集齐碎片点亮灯芯）", /结局/.test(endSpeaker), endSpeaker);
    await page.screenshot({ path: shot("07b-handheld-ending.png") });

    // 体力耗尽的失败处理：切回小镇并检查状态
    // 说明：reload 后必须重新注入 scroll-behavior 覆盖样式，并显式等待页签按钮出现；
    // 否则在机器负载高时页签渲染会晚于点击等待而误判为失败。
    await drain(); // 桌面阶段收尾
    await reloadPage();
    await page.waitForSelector('loc=css:button[data-tab="handheld"]', { timeout: 20000 });
    await waitForStyles();
    await killSmoothScroll();
    await recalibratePointer();
    await page.waitForTimeout(900);

    /* ═══════ 5. 响应式：移动端视口 ═══════ */
    // 源脚本在这里开的是**新页面**（独立于桌面页的视口与事件流），
    // 故此处把事件流切到移动端桶，与源脚本的页面边界一一对应。
    await drain();
    bucket = mobileNet;
    await setViewport(390, 844, 2);
    await reloadPage();
    await waitForStyles();
    await killSmoothScroll();
    await recalibratePointer();
    await page.waitForTimeout(1200);
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return { scrollW: de.scrollWidth, clientW: de.clientWidth };
    });
    check("移动端无横向溢出", overflow.scrollW <= overflow.clientW + 2, JSON.stringify(overflow));
    await page.evaluate(() => {
      const e = document.querySelector("#exhibits");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(600);
    await page.evaluate(() => {
      const e = document.querySelector(".defense__canvas");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot("08-mobile-defense.png") });
    await clickAt(page, 'button[data-tab="handheld"]', pointerScale, { label: "switch to handheld mobile" });
    await page.waitForTimeout(800);
    await page.evaluate(() => {
      const e = document.querySelector(".pocket__canvas");
      if (e) e.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: shot("09-mobile-handheld.png") });
    const mOverflow2 = await page.evaluate(() => {
      const de = document.documentElement;
      return { scrollW: de.scrollWidth, clientW: de.clientWidth };
    });
    check(
      "移动端掌机展项无横向溢出",
      mOverflow2.scrollW <= mOverflow2.clientW + 2,
      JSON.stringify(mOverflow2),
    );
    check("移动端无 JS 错误", mobileNet.pageErrors.length === 0, mobileNet.pageErrors.join(" | "));

    /* ═══════ 6. 网络与控制台 ═══════ */
    await drain();
    check("无 JS 运行时错误", desktopNet.pageErrors.length === 0, desktopNet.pageErrors.join(" | "));
    check("无 console error", desktopNet.consoleErrors.length === 0, desktopNet.consoleErrors.join(" | "));
    check("无失败请求", desktopNet.failedRequests.length === 0, desktopNet.failedRequests.join(" | "));
    check(
      "运行期零外部请求（无 CDN / 无在线 API）",
      desktopNet.externalRequests.length === 0,
      desktopNet.externalRequests.slice(0, 5).join(" | "),
    );
    if (desktopNet.httpErrors.length) {
      console.log(`  ! HTTP ≥400（源脚本口径不计入失败请求，仅提示）：${desktopNet.httpErrors.join(" | ")}`);
    }
  } catch (e) {
    // 致命错误（环境 / 页面异常）：写报告 + 写错误侧车文件，再抛出去
    fatalError = e;
    console.error("验收过程中出现致命错误：", e && e.message ? e.message : e);
  } finally {
    await task.finish({ keep: [] });
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n===== 验收结果：${results.length - failed.length}/${results.length} 通过 =====`);
  if (failed.length) {
    console.log("未通过：");
    for (const f of failed) console.log(`  - ${f.name}${f.detail ? " :: " + f.detail : ""}`);
  }
  const outPath = path.join(outDir, "qa-ego-acceptance.json");
  await fs.writeFile(outPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`报告：${outPath}`);
  console.log(`截图：${shots}`);

  // 错误侧车：让包装器能区分「跑完了但有失败」与「中途炸了」，避免读到旧报告
  const errPath = path.join(outDir, "qa-ego-acceptance.error.json");
  if (fatalError) {
    await fs.writeFile(
      errPath,
      JSON.stringify(
        {
          error: String((fatalError && fatalError.message) || fatalError),
          stack: fatalError && fatalError.stack ? String(fatalError.stack) : "",
          completedChecks: results.length,
        },
        null,
        2,
      ),
      "utf8",
    );
    console.error(`错误报告：${errPath}`);
  } else {
    try {
      await fs.unlink(errPath);
    } catch {
      /* 没有旧错误文件就不用管 */
    }
  }

  return {
    results,
    passed: results.length - failed.length,
    failed: failed.length,
    total: results.length,
    reportPath: outPath,
    fatalError: fatalError ? String((fatalError && fatalError.message) || fatalError) : null,
  };
}
