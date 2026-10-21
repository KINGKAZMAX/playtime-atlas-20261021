// 06-museum-core · 本地产物核验与截图（Ego）
// 说明：本目录的**交付截图**一律走 Ego；线上核验走 Ego；自动化回归由项目自带的
// scripts/acceptance.mjs 产出（那是给 13 复用的交付物，不是我的交互式浏览）。
const task = await taskSpace("06-museum-core local verify 20261022");
const page = task.page("p1");
const BASE = "http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/";
const OUT = "/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/06-museum-core/screenshots/ego";

await page.goto(BASE + "#/");
await page.waitForSelector(".exhibit-card, .hall-card", { timeout: 30000 });
await page.waitForTimeout(600);
console.log("首页视口截图:", await page.screenshot({ path: OUT + "/ego-home-desktop.png" }));
console.log("首页整页截图:", await page.screenshot({ path: OUT + "/ego-home-fullpage.png", fullPage: true }));

await page.goto(BASE + "#/catalog");
await page.waitForSelector(".exhibit-card", { timeout: 30000 });
await page.waitForTimeout(600);

// 搜索：填完立刻读（本轮修好的关键点）
await page.fill("#f-q", "这个词一定不存在zzz");
const imm = await page.evaluate(() => ({
  n: document.querySelectorAll(".exhibit-card, .exhibit-row").length,
  c: document.querySelector("#results-count")?.textContent.trim(),
  empty: document.querySelectorAll("#catalog-results .empty").length,
}));
console.log("\n搜索「不存在词」填完立刻读:", JSON.stringify(imm));
await page.fill("#f-q", "掌机");
const some = await page.evaluate(() => ({
  n: document.querySelectorAll(".exhibit-card, .exhibit-row").length,
  c: document.querySelector("#results-count")?.textContent.trim(),
}));
console.log("搜索「掌机」填完立刻读:  ", JSON.stringify(some));
await page.fill("#f-q", "");
await page.waitForTimeout(300);
console.log("清空后:                 ", JSON.stringify(await page.evaluate(() => ({
  n: document.querySelectorAll(".exhibit-card, .exhibit-row").length,
  c: document.querySelector("#results-count")?.textContent.trim(),
}))));

// 卡片三块几何
const geo = await page.evaluate(() => {
  const out = [];
  for (const card of document.querySelectorAll(".exhibit-card")) {
    const s = card.querySelector(".card-summary");
    const c = card.querySelector(".card-creator");
    const f = card.querySelector(".fav-text");
    if (!s || !c) continue;
    const b = (el) => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
    const inter = (a, z) => {
      const w = Math.min(a.r, z.r) - Math.max(a.l, z.l);
      const h = Math.min(a.b, z.b) - Math.max(a.t, z.t);
      return w > 0 && h > 0 ? Math.round(w * h) : 0;
    };
    const bs = b(s), bc = b(c);
    out.push({
      t: card.querySelector(".card-title")?.textContent.trim().slice(0, 12) ?? "",
      gap: Math.round(bc.t - bs.b),
      ov: inter(bs, bc),
      ovFav: f ? inter(bs, b(f)) : null,
    });
    if (out.length >= 6) break;
  }
  return out;
});
console.log("\n卡片三块几何（可见盒）：");
for (const g of geo) console.log(`   ${g.t.padEnd(14)} 间距 ${g.gap}px  摘要×作者 ${g.ov}px²  摘要×收藏 ${g.ovFav}px²`);

console.log("\n目录整页截图:", await page.screenshot({ path: OUT + "/ego-catalog-fullpage.png", fullPage: true }));

await page.goto(BASE + "#/timeline");
await page.waitForTimeout(700);
console.log("时间轴整页截图:", await page.screenshot({ path: OUT + "/ego-timeline-fullpage.png", fullPage: true }));
console.log("spaceId:", task.spaceId);
