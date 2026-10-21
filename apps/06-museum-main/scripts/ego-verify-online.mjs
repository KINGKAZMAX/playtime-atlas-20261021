// 06-museum-core · 线上核验（Ego）
// 目标：https://kingkazmax.github.io/playtime-atlas-20261021/works/06-museum-main/
const task = await taskSpace("06-museum-core online verify 20261022");
const page = task.page("p1");
const BASE = "https://kingkazmax.github.io/playtime-atlas-20261021/works/06-museum-main/";
const OUT = "/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/06-museum-core/screenshots/online";

await page.goto(BASE + "#/catalog");
await page.waitForSelector(".exhibit-card", { timeout: 30000 });

// ① 字体样式表与字体二进制是否真的取到了
// 权威位置自 2026-10-22 起是 assets/ds/fonts/（16-design-system 接入）；
// art/assets/fonts/fonts.css 是历史兼容 shim，MIGRATION-NOTES §6 的发布前必查仍会 curl 它。
const fonts = await page.evaluate(async (base) => {
  const urls = [
    "assets/ds/fonts/fonts.css",
    "assets/ds/fonts/space-grotesk-latin.woff2",
    "assets/ds/fonts/inter-latin.woff2",
    "assets/ds/fonts/noto-sans-sc-subset.woff2",
    "assets/ds/fonts/space-mono-regular.woff2",
    "assets/ds/fonts/space-mono-bold.woff2",
    "assets/ds/components.css",
    "assets/ds/tokens.css",
    "art/assets/fonts/fonts.css",
  ];
  const out = [];
  for (const u of urls) {
    try {
      const r = await fetch(base + u, { method: "GET" });
      out.push({ url: u, status: r.status, bytes: (await r.arrayBuffer()).byteLength });
    } catch (e) {
      out.push({ url: u, status: 0, bytes: 0, error: String(e) });
    }
  }
  await document.fonts.ready;
  const families = ["Space Grotesk", "Inter", "Space Mono", "Noto Sans SC"];
  return {
    resources: out,
    fontsCheck: families.map((f) => ({ family: f, loaded: document.fonts.check('16px "' + f + '"') })),
  };
}, BASE);
console.log("【① 字体资源】");
for (const r of fonts.resources) console.log(`   ${r.status}  ${String(r.bytes).padStart(7)}B  ${r.url}`);
console.log("   document.fonts.check:", fonts.fontsCheck.map((f) => `${f.family}=${f.loaded}`).join("  "));

// ② 搜索过滤：填完**立刻**读计数器（13 报 211→211 的那一步）
await page.fill("#f-q", "这个词一定不存在zzz");
const immediate = await page.evaluate(() => ({
  items: document.querySelectorAll(".exhibit-card, .exhibit-row").length,
  counter: document.querySelector("#results-count")?.textContent.trim() ?? null,
  empty: document.querySelectorAll("#catalog-results .empty").length,
}));
console.log("\n【② 搜索过滤（填完立刻读）】");
console.log("   ", JSON.stringify(immediate));

await page.fill("#f-q", "掌机");
const some = await page.evaluate(() => ({
  items: document.querySelectorAll(".exhibit-card, .exhibit-row").length,
  counter: document.querySelector("#results-count")?.textContent.trim() ?? null,
}));
console.log("   存在词「掌机」:", JSON.stringify(some));

// ③ 卡片三块的几何（可见盒）
const cards = await page.evaluate(() => {
  const res = [];
  for (const card of document.querySelectorAll(".exhibit-card")) {
    const s = card.querySelector(".card-summary");
    const c = card.querySelector(".card-creator");
    const f = card.querySelector(".fav-text");
    if (!s || !c) continue;
    const b = (el) => { const r = el.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; };
    const inter = (a, b2) => {
      const w = Math.min(a.r, b2.r) - Math.max(a.l, b2.l);
      const h = Math.min(a.b, b2.b) - Math.max(a.t, b2.t);
      return w > 0 && h > 0 ? Math.round(w * h) : 0;
    };
    const bs = b(s), bc = b(c);
    res.push({
      title: card.querySelector(".card-title")?.textContent.trim().slice(0, 14) ?? "",
      summaryBottom: bs.b, creatorTop: bc.t, gap: bc.t - bs.b,
      overlap: inter(bs, bc),
      favOverlap: f ? inter(bs, b(f)) : null,
    });
    if (res.length >= 8) break;
  }
  return res;
});
console.log("\n【③ 卡片三块几何（可见盒）】");
for (const c of cards) {
  console.log(`   ${c.title.padEnd(16)} 摘要底 ${c.summaryBottom} → 作者顶 ${c.creatorTop}  间距 ${c.gap}px  压盖 ${c.overlap}px²${c.favOverlap !== null ? `  摘要×收藏 ${c.favOverlap}px²` : ""}`);
}

// ④ 截图：视口 + 整页
await page.fill("#f-q", "");
await page.waitForTimeout(300);
const shot1 = await page.screenshot({ path: OUT + "/live-catalog-desktop.png" });
console.log("\n【④ 截图】", shot1);
await page.goto(BASE + "#/");
await page.waitForSelector(".exhibit-card, .hall-card", { timeout: 30000 });
const shot2 = await page.screenshot({ path: OUT + "/live-home-fullpage.png", fullPage: true });
console.log("   整页:", shot2);
console.log("   spaceId:", task.spaceId);
