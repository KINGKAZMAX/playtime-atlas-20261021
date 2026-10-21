/** 探测 07：确认 Ego 的 `>> nth=` 基准，以及旋转按钮的初始状态语义 */
export async function run(cfg) {
  const task = await taskSpace(cfg.spaceName || "07-museum-art ego-qa");
  const page = await task.newPage();
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width: 1440, height: 900, deviceScaleFactor: 1, mobile: true,
  });
  await page.goto(`${cfg.base}/index.html`, { waitUntil: "commit", timeout: 45000 });
  await page.waitForLoadState("load", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const out = {};

  /* ① 旋转按钮的初始语义 + reduced-motion */
  out.spin = await page.evaluate(() => {
    const b = document.getElementById("btn-spin");
    return {
      text: b ? b.textContent.trim() : null,
      ariaPressed: b ? b.getAttribute("aria-pressed") : null,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      durBase: getComputedStyle(document.documentElement).getPropertyValue("--ds-dur-base").trim(),
    };
  });

  /* ② 筛选 chip 的真实结构 */
  out.chips = await page.evaluate(() =>
    [...document.querySelectorAll(".filter-chip")].map((c, i) => ({
      i,
      cat: c.dataset.cat,
      pressed: c.getAttribute("aria-pressed"),
      text: c.textContent.trim().slice(0, 20),
      parentTag: c.parentElement ? c.parentElement.tagName : null,
      parentCls: c.parentElement ? String(c.parentElement.className) : null,
      isNthChild: c.parentElement ? [...c.parentElement.children].indexOf(c) : -1,
    })),
  );

  /* ③ 点击不同 nth，看谁会真正筛选 */
  const attempts = [];
  for (const n of [0, 1, 2]) {
    await page.evaluate(() => {
      document.querySelectorAll(".filter-chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      document.querySelectorAll(".icon-cell").forEach((c) => c.classList.remove("is-hidden"));
    });
    await page.waitForTimeout(200);
    try {
      await page.click(`loc=css:.filter-chip >> nth=${n}`, { force: true, timeout: 6000 });
    } catch (e) {
      attempts.push({ n, error: String(e.message || e).split("\n")[0] });
      continue;
    }
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      visible: [...document.querySelectorAll(".icon-cell")].filter((c) => !c.classList.contains("is-hidden")).length,
      pressed: [...document.querySelectorAll(".filter-chip")].findIndex((c) => c.getAttribute("aria-pressed") === "true"),
      pressedCat: [...document.querySelectorAll(".filter-chip")].find((c) => c.getAttribute("aria-pressed") === "true")?.dataset.cat,
    }));
    attempts.push({ n, ...r });
  }
  out.nthAttempts = attempts;

  console.log("PROBE7 " + JSON.stringify(out, null, 2));
  return { reportPath: "(probe)", probe: out };
}
