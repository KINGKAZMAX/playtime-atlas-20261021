/**
 * 探测 04：对照实验 —— 同一份 dist，分别经「仅绑 127.0.0.1」与「绑 0.0.0.0」两个端口访问。
 * 目的：判定 Ego 浏览器能否访问只绑定回环地址的服务器。
 */
export async function run(cfg) {
  const out = { targets: [] };
  const task = await taskSpace(cfg.spaceName || "07-museum-art ego-qa");

  const pages = await task.pages();
  for (const p of pages) {
    try {
      if (p.openedBy === "agent") await p.close();
    } catch {
      /* 关不掉就换新页 */
    }
  }
  const page = await task.newPage();

  for (const [name, url] of [
    ["loopback-only", "http://127.0.0.1:8951/index.html"],
    ["all-interfaces", "http://127.0.0.1:8952/index.html"],
  ]) {
    const rec = { name, url };
    const t0 = Date.now();
    try {
      await page.goto(url, { waitUntil: "commit", timeout: 15000 });
      rec.nav = "commit";
    } catch (e) {
      rec.nav = "ERR " + String(e.message || e).split("\n")[0];
    }
    rec.ms = Date.now() - t0;
    try {
      rec.ready = await page.evaluate(() => document.readyState);
    } catch (e) {
      rec.ready = "ERR " + String(e.message || e).split("\n")[0];
    }
    out.targets.push(rec);
    /* 页面若已卡死，后面就没法再测了 —— 换新页继续 */
    try {
      await page.close();
    } catch {
      /* ignore */
    }
  }

  console.log("PROBE4 " + JSON.stringify(out, null, 2));
  return { reportPath: "(probe)", probe: out };
}
