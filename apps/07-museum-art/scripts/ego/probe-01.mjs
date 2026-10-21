/**
 * Ego 能力探测（一次性，确认移植前提，跑完即删）
 * 目标：确认 node 内建模块、CDP、页面内异步断言、交互、截图落盘等能力。
 */

export async function run(cfg) {
const BASE = cfg.base;
const OUT = cfg.outDir;

const probe = {};

/* ① Node 内建模块是否可用 */
try {
  const zlib = await import("node:zlib");
  const fs = await import("node:fs/promises");
  probe.nodeBuiltins = { zlib: typeof zlib.inflateSync === "function", fs: typeof fs.readFile === "function" };
} catch (e) {
  probe.nodeBuiltins = { error: String(e.message || e) };
}

/* ② TaskSpace + Page */
const task = await taskSpace("07-museum-art ego-qa");
probe.spaceId = task.spaceId;
const page = task.page("p1");

/* ③ 视口控制（mobile:true 需 1:1 精确） */
await page.cdp("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: true,
});
await page.goto(`${BASE}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForLoadState("load", { timeout: 60000 }).catch(() => {});
await page.waitForTimeout(1500);
probe.innerWidth = await page.evaluate(() => window.innerWidth);

/* ④ 页面内异步 + rAF 轮询 */
probe.rafPoll = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        const imgs = [...document.querySelectorAll("img")].filter((i) => i.getAttribute("src"));
        const done = imgs.length > 0 && imgs.every((i) => i.complete && i.naturalWidth > 0);
        if (done || Date.now() - t0 > 15000) {
          return resolve({ count: imgs.length, done, waited: Date.now() - t0 });
        }
        requestAnimationFrame(tick);
      };
      tick();
    }),
);

/* ⑤ 元素计数 + 计算样式 */
probe.counts = await page.evaluate(() => ({
  posters: document.querySelectorAll(".poster-card").length,
  icons: document.querySelectorAll(".icon-cell").length,
  accent: getComputedStyle(document.documentElement).getPropertyValue("--ds-accent").trim(),
  title: document.title,
}));

/* ⑥ CDP 网络屏蔽是否可用 */
try {
  await page.cdp("Network.enable", {});
  await page.cdp("Network.setBlockedURLs", { urls: ["**/assets/covers/*"] });
  probe.blockUrls = "ok";
  await page.cdp("Network.setBlockedURLs", { urls: [] });
} catch (e) {
  probe.blockUrls = "err: " + String(e.message || e);
}

/* ⑦ 交互：点击 + 文本变化 */
try {
  const before = await page.evaluate(() => {
    const t = document.getElementById("viewer-title");
    return t ? t.textContent.trim() : null;
  });
  await page.evaluate(() => {
    const el = document.querySelector(".model-tab:nth-child(3)");
    if (el) el.click();
  });
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => {
    const t = document.getElementById("viewer-title");
    return t ? t.textContent.trim() : null;
  });
  probe.click = { before, after, changed: before !== after };
} catch (e) {
  probe.click = { error: String(e.message || e) };
}

/* ⑧ Ego 选择器语法：loc=css */
try {
  await page.click("loc=css:#btn-spin");
  await page.waitForTimeout(300);
  probe.selectorClick = await page.evaluate(() => {
    const b = document.getElementById("btn-spin");
    return b ? b.textContent.trim() : null;
  });
} catch (e) {
  probe.selectorClick = { error: String(e.message || e) };
}

/* ⑨ 键盘 */
try {
  await page.keyboard.press("Escape");
  probe.keyboard = "ok";
} catch (e) {
  probe.keyboard = "err: " + String(e.message || e);
}

/* ⑩ 截图落盘 + 返回值 */
try {
  const fs2 = await import("node:fs/promises");
  await fs2.mkdir(OUT, { recursive: true });
  const p = `${OUT}/probe-shot.png`;
  const ret = await page.screenshot({ path: p });
  const st = await fs2.stat(p);
  probe.screenshot = { returned: typeof ret === "string" ? ret : null, bytes: st.size };
} catch (e) {
  probe.screenshot = { error: String(e.message || e) };
}

/* ⑪ 实际渲染字体 */
try {
  await page.cdp("DOM.enable", {});
  await page.cdp("CSS.enable", {});
  const doc = await page.cdp("DOM.getDocument", { depth: 1 });
  const q = await page.cdp("DOM.querySelector", { nodeId: doc.root.nodeId, selector: "h1" });
  const res = q.nodeId ? await page.cdp("CSS.getPlatformFontsForNode", { nodeId: q.nodeId }) : null;
  probe.platformFonts = res ? res.fonts : "no node";
} catch (e) {
  probe.platformFonts = "err: " + String(e.message || e);
}

/* ⑫ 网络 / 控制台事件 */
try {
  await page.cdp("Log.enable", {});
  const evs = await page.events();
  probe.events = { count: evs.length, sample: evs.slice(0, 3).map((e) => e.method) };
} catch (e) {
  probe.events = "err: " + String(e.message || e);
}

console.log("PROBE_RESULT " + JSON.stringify(probe, null, 2));
await task.finish({ keep: [] });
return { reportPath: "(probe 无报告)", probe };
}
