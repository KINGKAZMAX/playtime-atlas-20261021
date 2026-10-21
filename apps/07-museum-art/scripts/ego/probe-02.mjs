/**
 * 探测 02：定位 Ego 导航 / 网络可达性（分层）
 */
export async function run(cfg) {
  const BASE = cfg.base;
  const out = {};

  const task = await taskSpace(cfg.spaceName || "07-museum-art ego-qa");
  out.spaceId = task.spaceId;
  out.tabs = (await task.tabs()).map((t) => ({ label: t.label, url: t.url, active: t.active, openedBy: t.openedBy }));
  const page = task.page("p1");
  out.pageUrlBefore = await page.url();

  /* ① 页面内 fetch 能否访问本地服务器（绕过导航） */
  try {
    out.fetchLocal = await page.evaluate(
      async (u) => {
        try {
          const r = await fetch(u, { cache: "no-store" });
          const t = await r.text();
          return { ok: r.ok, status: r.status, len: t.length, head: t.slice(0, 60) };
        } catch (e) {
          return { error: String(e && e.message ? e.message : e) };
        }
      },
      `${BASE}/index.html`,
    );
  } catch (e) {
    out.fetchLocal = { outerError: String(e.message || e) };
  }

  /* ② 导航 commit 级（最宽松） */
  try {
    await page.goto(`${BASE}/index.html`, { waitUntil: "commit", timeout: 20000 });
    out.navCommit = { url: await page.url(), title: await page.title() };
  } catch (e) {
    out.navCommit = { error: String(e.message || e) };
  }

  /* ③ 若已提交，等 domcontentloaded */
  try {
    await page.waitForLoadState("domcontentloaded", { timeout: 30000 });
    out.dcl = "ok";
  } catch (e) {
    out.dcl = "err: " + String(e.message || e);
  }

  out.state = await page.evaluate(() => ({
    readyState: document.readyState,
    title: document.title,
    imgs: document.querySelectorAll("img").length,
  })).catch((e) => ({ error: String(e.message || e) }));

  /* ④ file:// 兜底 */
  try {
    const fileUrl = "file://" + cfg.targetDir + "/index.html";
    await page.goto(fileUrl, { waitUntil: "commit", timeout: 20000 });
    out.navFile = { url: await page.url() };
  } catch (e) {
    out.navFile = { error: String(e.message || e) };
  }

  console.log("PROBE2 " + JSON.stringify(out, null, 2));
  await task.finish({ keep: [] });
  return { reportPath: "(probe)", probe: out };
}
