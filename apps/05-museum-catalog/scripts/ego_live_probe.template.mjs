/**
 * 05 目录页 · 线上实探（**ego-browser 版**）
 *
 * 依用户 2026-10-22 长期约定：**线上核验一律走 Ego**（不使用内置浏览器，也不另起其他浏览器）。
 * 用 `page.fetch()` 在 Ego 的 Page 上下文里发请求，拿到真实 HTTP 状态与响应体；
 * 状态 200 时再导航一次取渲染后的卡片数与核验状态标注。
 *
 * 模板占位符：__URL__
 */

const URL = "__URL__";

async function main() {
  const task = await taskSpace("05-catalog-liveprobe");
  const page = await task.newPage();
  try {
    const resp = await page.fetch(URL, { timeout: 25_000 });
    const body = resp.body || "";
    const out = {
      url: URL,
      ok: resp.ok,
      status: resp.status,
      bytes: body.length,
      cardCount: (body.match(/<details class="card"/g) || []).length,
      verifiedLabels: (body.match(/来源已核验/g) || []).length,
      pendingLabels: (body.match(/来源待复核/g) || []).length,
      eraChips: (body.match(/class="chip" type="button" data-era=/g) || []).length,
      kindChips: (body.match(/class="chip" type="button" data-kind=/g) || []).length,
    };
    if (resp.ok) {
      await page.goto(URL);
      await page.waitForLoadState();
      out.renderedCards = await page.evaluate(
        `document.querySelectorAll('#catalog-list .ds-catalog__item').length`
      );
      out.title = await page.title();
    }
    console.log(JSON.stringify(out));
  } catch (err) {
    console.log(
      JSON.stringify({
        url: URL,
        ok: false,
        skipped: true,
        reason: String(err && err.message ? err.message : err),
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
