// 第三轮：复跑第一轮的确切序列，并记录线上 JS 包哈希，排查「发版竞速」还是「真·不稳定」
const task = await taskSpace("06-museum-core online verify 20261022");
const page = task.page("p1");
const BASE = "https://kingkazmax.github.io/playtime-atlas-20261021/works/06-museum-main/";

await page.goto(BASE + "#/catalog");
await page.waitForSelector(".exhibit-card", { timeout: 30000 });

const build = await page.evaluate(() => [...document.querySelectorAll("script[src]")].map((s) => s.getAttribute("src")));
console.log("线上 JS 包:", build.join(", "));

for (const kw of ["这个词一定不存在zzz", "掌机", "这个词一定不存在zzz", "掌机"]) {
  await page.fill("#f-q", kw);
  const imm = await page.evaluate(() => ({
    n: document.querySelectorAll(".exhibit-card, .exhibit-row").length,
    c: document.querySelector("#results-count")?.textContent.trim(),
  }));
  await page.waitForTimeout(400);
  const late = await page.evaluate(() => ({
    n: document.querySelectorAll(".exhibit-card, .exhibit-row").length,
    c: document.querySelector("#results-count")?.textContent.trim(),
  }));
  console.log(`  「${kw}」  立刻读 n=${imm.n} (${imm.c})   等 400ms n=${late.n} (${late.c})`);
}
