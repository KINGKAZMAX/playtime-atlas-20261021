/**
 * 05-museum-research — 参考站截图抓取（**ego-browser 版**）
 *
 * 依用户 2026-10-22 长期约定：**Ego 浏览器是唯一浏览器入口**，
 * 禁止另起 Playwright / Chromium / Chrome 等替代路径 —— 故本脚本不 spawn 任何浏览器进程。
 *
 * 用法：ego-browser nodejs < 本文件的渲染实例
 *   （由 scripts/capture_refs.py 渲染 __OUT_DIR__ / __SLUGS__ 后调用）
 *
 * 产出：<OUT>/<slug>.png + <OUT>/INDEX.tsv
 *
 * 截图仅作研究参考存档，不随交付物再分发（各站许可多为 ARR / CC-NC，见 LICENSES.md）。
 */

const OUT = "__OUT_DIR__";
const SLUGS = __SLUGS__;

const fs = await import("node:fs/promises");
const path = await import("node:path");

async function mainImpl() {
  const task = await taskSpace("05-catalog-refshots");
  const page = await task.newPage();
  try {
    const rows = ["slug\turl\thttp_status\tbytes\tfile\tshot_at"];
    for (const { slug, url } of SLUGS) {
      const safe = slug.replace(/[^A-Za-z0-9._-]/g, "_");
      const file = path.join(OUT, `${safe}.png`);
      let status = 0;
      let bytes = 0;
      try {
        const resp = await page.fetch(url, { timeout: 30_000 });
        status = resp.status;
        await page.goto(url);
        await page.waitForLoadState();
        await page.screenshot({ path: file });
        const st = await fs.stat(file);
        bytes = st.size;
      } catch (e) {
        status = 0;
      }
      rows.push(
        [slug, url, status, bytes, `${safe}.png`, new Date().toISOString().replace(/\.\d+Z$/, "Z")].join("\t")
      );
      console.log(`  ${slug} -> http=${status} bytes=${bytes}`);
    }
    await fs.writeFile(path.join(OUT, "INDEX.tsv"), rows.join("\n") + "\n", "utf8");
    console.log(`\n== screenshots written to ${OUT}`);
    console.log(rows.join("\n"));
  } finally {
    try {
      await page.close();
    } catch {
      /* ignore */
    }
  }
}

await mainImpl();
