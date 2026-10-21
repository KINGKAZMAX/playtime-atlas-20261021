/**
 * 探测 03：在**同一个 TaskSpace** 里换一张干净页面重测导航与响应性。
 * 背景：探测 02 是在上一轮已失效的旧页面上 evaluate（服务器已关闭），
 *       fetch 挂起 → 后续导航被级联阻塞。
 */
export async function run(cfg) {
  const BASE = cfg.base;
  const out = {};

  const task = await taskSpace(cfg.spaceName || "07-museum-art ego-qa");
  out.spaceId = task.spaceId;

  /* 关掉上一轮留下的页面（都是 agent 开的），换一张干净的 */
  const pages = await task.pages();
  out.closed = [];
  for (const p of pages) {
    try {
      if (p.openedBy === "agent") {
        await p.close();
        out.closed.push(p.label);
      }
    } catch (e) {
      out.closed.push(`${p.label}: ${e.message}`);
    }
  }

  const page = await task.newPage();
  out.newLabel = page.label;

  /* 导航：commit 是最宽松的一档 */
  const t0 = Date.now();
  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: "commit", timeout: 30000 });
    out.navMs = Date.now() - t0;
    out.navOk = true;
  } catch (e) {
    out.navOk = false;
    out.navErr = String(e.message || e);
    out.navMs = Date.now() - t0;
  }
  out.url = await page.url().catch((e) => "urlErr:" + e.message);

  /* 立即做一次轻量 evaluate */
  try {
    out.readyState = await page.evaluate(() => document.readyState);
  } catch (e) {
    out.readyState = "err: " + String(e.message || e);
  }

  /* 等一会儿再看是否响应 */
  await page.waitForTimeout(4000).catch(() => {});
  try {
    out.after = await page.evaluate(() => ({
      readyState: document.readyState,
      posters: document.querySelectorAll(".poster-card").length,
      imgs: document.images.length,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
      accent: getComputedStyle(document.documentElement).getPropertyValue("--ds-accent").trim(),
      fontStatus: [...document.fonts].map((f) => `${f.family}:${f.status}`).slice(0, 8),
    }));
  } catch (e) {
    out.after = "err: " + String(e.message || e);
  }

  /* 截图看渲染 */
  try {
    const fs = await import("node:fs/promises");
    await fs.mkdir(cfg.outDir, { recursive: true });
    const p = `${cfg.outDir}/probe03-page.png`;
    const ret = await page.screenshot({ path: p });
    const st = await fs.stat(p);
    out.shot = { returned: typeof ret === "string" ? ret : null, bytes: st.size };
  } catch (e) {
    out.shot = "err: " + String(e.message || e);
  }

  console.log("PROBE3 " + JSON.stringify(out, null, 2));
  return { reportPath: "(probe)", probe: out };
}
