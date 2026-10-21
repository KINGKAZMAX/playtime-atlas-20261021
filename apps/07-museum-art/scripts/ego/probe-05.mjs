/** 探测 05：定位那 2 张「破图」到底是真破图还是尚未赋 src 的占位元素 */
export async function run(cfg) {
  const task = await taskSpace(cfg.spaceName || "07-museum-art ego-qa");
  const page = await task.newPage();
  await page.goto(`${cfg.base}/index.html`, { waitUntil: "commit", timeout: 30000 });
  await page.waitForLoadState("load", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const detail = await page.evaluate(() =>
    [...document.images].map((i) => ({
      cls: String(i.className || "").slice(0, 40),
      id: i.id || "",
      srcAttr: i.getAttribute("src"),
      curSrc: i.currentSrc ? i.currentSrc.slice(-60) : "",
      complete: i.complete,
      natural: i.naturalWidth,
      loading: i.getAttribute("loading"),
      inDom: !!i.closest("body"),
      hidden: i.closest("[hidden]") ? true : false,
      display: getComputedStyle(i).display,
      parent: i.parentElement ? String(i.parentElement.className || i.parentElement.id || "").slice(0, 30) : "",
    })),
  );

  const broken = detail.filter((d) => d.complete && d.natural === 0);
  const noSrc = detail.filter((d) => !d.srcAttr);

  console.log(
    "PROBE5 " +
      JSON.stringify(
        {
          total: detail.length,
          broken: broken.map((b) => ({ id: b.id, cls: b.cls, src: b.srcAttr, parent: b.parent, hidden: b.hidden })),
          noSrc: noSrc.map((b) => ({ id: b.id, cls: b.cls, parent: b.parent, hidden: b.hidden })),
          lazy: detail.filter((d) => d.loading === "lazy").length,
        },
        null,
        2,
      ),
  );
  return { reportPath: "(probe)", probe: { total: detail.length, broken, noSrc } };
}
