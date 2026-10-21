// 06-museum-core · 线上核验第二轮（同一个 TaskSpace）
// 目的：区分「线上过滤器彻底坏了」与「线上还是旧版、带 220ms 去抖」
const task = await taskSpace("06-museum-core online verify 20261022");
const page = task.page("p1");
const BASE = "https://kingkazmax.github.io/playtime-atlas-20261021/works/06-museum-main/";

await page.goto(BASE + "#/catalog");
await page.waitForSelector(".exhibit-card", { timeout: 30000 });

const read = () => page.evaluate(() => ({
  items: document.querySelectorAll(".exhibit-card, .exhibit-row").length,
  counter: document.querySelector("#results-count")?.textContent.trim() ?? null,
  empty: document.querySelectorAll("#catalog-results .empty").length,
  hash: location.hash,
}));

console.log("【A. 填入不存在的关键词后，等 800ms 再读】");
await page.fill("#f-q", "这个词一定不存在zzz");
console.log("   立刻读:", JSON.stringify(await read()));
await page.waitForTimeout(800);
console.log("   等 800ms:", JSON.stringify(await read()));

console.log("\n【B. 填入存在的关键词「掌机」，等 800ms】");
await page.fill("#f-q", "掌机");
await page.waitForTimeout(800);
console.log("   ", JSON.stringify(await read()));

console.log("\n【C. 线上 JS 包里是否还有 220 去抖 / q 参数兼容】");
const js = await page.evaluate(async (base) => {
  const src = [...document.querySelectorAll("script[src]")].map((s) => s.getAttribute("src"));
  const texts = [];
  for (const s of src) {
    const r = await fetch(new URL(s, base).href);
    texts.push(await r.text());
  }
  const all = texts.join("\n");
  return {
    scripts: src,
    has220: /setTimeout\([^)]*220/.test(all),
    hasQFallback: /q\s*\?\?\s*["']{2}/.test(all) || /options\.q/.test(all),
    hasQueryRead: /options\.query/.test(all),
    debounceSnippets: (all.match(/.{60}setTimeout\([^)]*220.{20}/g) || []).slice(0, 2),
  };
}, BASE);
console.log("   scripts:", js.scripts.join(", "));
console.log("   含 220ms setTimeout:", js.has220);
console.log("   含 options.q 兼容:", js.hasQFallback);
console.log("   含 options.query:", js.hasQueryRead);
for (const s of js.debounceSnippets) console.log("   片段:", s.replace(/\s+/g, " ").slice(0, 150));
