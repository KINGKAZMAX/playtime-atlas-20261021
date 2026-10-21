// 06-museum-core · 整页截图（Ego，带高度守卫）
// 做法与 README 里给 13 的配方一致：
//   先量 scrollHeight → 超上限就**如实记录「未完成」并跳过**，不假装截到了。
const task = await taskSpace("06-museum-core local verify 20261022");
const page = task.page("p1");
const BASE = "http://127.0.0.1:4333/playtime-atlas-20261021/works/06-museum-main/";
const OUT = "/Users/mekzenx2/Documents/ChatGPT/Minimax测评/output/flash-showcase-20261021/06-museum-core/screenshots/ego";
const MAX = 15000;

const routes = [
  ["#/", "ego-home-fullpage"],
  ["#/catalog", "ego-catalog-fullpage"],
  ["#/timeline", "ego-timeline-fullpage"],
  ["#/era/e04", "ego-era-fullpage"],
  ["#/hall", "ego-hall-fullpage"],
];

for (const [route, name] of routes) {
  await page.goto(BASE + route);
  await page.waitForTimeout(800);
  const h = await page.evaluate(() => Math.max(
    document.documentElement.scrollHeight,
    document.body ? document.body.scrollHeight : 0,
  ));
  if (h > MAX) {
    console.log(`  ✗ ${route} 整页未完成：页面高 ${h}px > ${MAX}px（Chromium 贴图上限约 16384px）`);
    continue;
  }
  try {
    const p = await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    console.log(`  ✓ ${route} 整页（高 ${h}px）→ ${p}`);
  } catch (err) {
    console.log(`  ✗ ${route} 整页未完成：${String(err).split("\n")[0]}`);
  }
}
console.log("spaceId:", task.spaceId);
