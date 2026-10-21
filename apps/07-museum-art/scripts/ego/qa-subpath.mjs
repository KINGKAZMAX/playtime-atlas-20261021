/**
 * 07-museum-art —— 线上子路径部署复验（Ego 路径）
 *
 * 取代旧的 `scripts/qa-subpath.mjs`（本地 Playwright / Chromium）。
 * 按批次强制约束，所有浏览器动作走用户自己的 Ego 浏览器。
 *
 * 挂载前缀模拟线上真实部署：
 *   /playtime-atlas-20261021/exhibits/07-museum-art/
 *
 * 检查口径与旧脚本逐条对齐：
 *   1. 构建产物存在性 + 令牌已构建期内联
 *   2. 子路径下的资源请求状态（关键资源 200 / 无 404 / 无失败 / 全 200）
 *   3. 运行期可用性（ATLAS_TOKENS / --ds-* 变量 / 渲染计数 / 字体）
 *   3b. 关键资源显式 GET
 *   4. 产物洁净度（无 /public/ 残留、相对路径引用）
 *   5. 子路径部署截图
 */

import path from "node:path";
import { existsSync, statSync, readFileSync, readdirSync } from "node:fs";
import { isFlat } from "./lib/png.mjs";

export async function run(cfg) {
  const BASE = cfg.base;
  const DIST = cfg.targetDir;
  const OUT = cfg.outDir;
  const fs = await import("node:fs/promises");

  const checks = [];
  const ok = (m) => { checks.push({ ok: true, m }); console.log("  ✓", m); };
  const bad = (m) => { checks.push({ ok: false, m }); console.log("  ✗", m); };

  console.log("回响电玩馆 — 线上子路径部署复验（Ego）");
  console.log("=".repeat(58));
  console.log(`  挂载 ${cfg.prefix || ""} → ${BASE}`);

  /* ---------- 1. 构建产物 ---------- */
  console.log("\n· 1. 构建产物");
  const idx = path.join(DIST, "index.html");
  if (existsSync(idx) && statSync(idx).size > 1000) ok(`dist/index.html 存在（${(statSync(idx).size / 1024).toFixed(1)} KB）`);
  else bad("缺少 dist/index.html");

  for (const rel of [
    "assets/fonts/fonts.css",
    "assets/tokens.css",
    "assets/design-tokens.json",
    "assets/assets.manifest.json",
    "assets/icons/icons.svg",
    "assets/models/model-console-02.glb",
  ]) {
    const p = path.join(DIST, rel);
    if (existsSync(p) && statSync(p).size > 100) ok(`dist/${rel}  (${(statSync(p).size / 1024).toFixed(1)} KB)`);
    else bad(`dist/${rel} 缺失或过小`);
  }

  const bundle = { files: readdirSync(path.join(DIST, "assets")) };
  const anyBundle = bundle.files.filter((f) => f.endsWith(".js"));
  let tokenInlined = false;
  for (const f of anyBundle) {
    const txt = readFileSync(path.join(DIST, "assets", f), "utf8");
    if (txt.includes("playtime-atlas") && txt.includes("ink") && txt.includes("signal")) { tokenInlined = true; break; }
  }
  if (tokenInlined) ok("设计令牌已构建期内联进 JS bundle（运行期无需 fetch）");
  else bad("未在 bundle 中找到内联的设计令牌");

  /* ---------- 2. 子路径下的请求状态 ---------- */
  console.log("\n· 2. 子路径资源请求状态");
  const task = await taskSpace(cfg.spaceName || "07-museum-art ego-qa");
  const spaceId = task.spaceId;
  for (const p of await task.pages()) {
    try { if (p.openedBy === "agent") await p.close(); } catch { /* ignore */ }
  }
  const page = await task.newPage();
  await page.cdp("Log.enable", {});
  await page.cdp("Network.enable", {});
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width: 1440, height: 1000, deviceScaleFactor: 1, mobile: true,
  });

  const responses = [];
  const consoleErrors = [];
  const BROWSER_OWN = /^(chrome|chrome-extension|devtools|about|edge):/;

  async function drain() {
    let events = [];
    try { events = await page.events(); } catch { return; }
    for (const e of events) {
      if (e.method === "Network.requestWillBeSent") {
        const u = e.params?.request?.url || "";
        if (BROWSER_OWN.test(u)) continue;
        responses.push({ url: u, status: null });
      } else if (e.method === "Network.responseReceived") {
        const u = e.params?.response?.url || "";
        if (BROWSER_OWN.test(u)) continue;
        const hit = responses.find((r) => r.url === u && r.status === null);
        if (hit) hit.status = e.params?.response?.status ?? null;
      } else if (e.method === "Network.loadingFailed") {
        responses.push({ url: e.params?.request?.url || "", status: `FAILED ${e.params?.errorText || ""}` });
      } else if (e.method === "Log.entryAdded" && e.params?.entry?.level === "error") {
        consoleErrors.push(e.params?.entry?.text || "");
      }
    }
  }

  await page.goto(BASE, { waitUntil: "commit", timeout: 45000 });
  await page.waitForLoadState("load", { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await drain();

  /* 滚动整页触发 loading="lazy" 的图片请求 */
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 2500));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });

  /* 懒加载在滚动时序下不保证全部命中：再主动切 eager 并等解码完成，
     确保「页面引用的每一张图」都真的向子路径发起过请求并成功返回。 */
  const imgFetch = await page.evaluate(async () => {
    const imgs = [...document.querySelectorAll("img")].filter((i) => i.getAttribute("src"));
    imgs.forEach((i) => { i.loading = "eager"; });
    await Promise.all(
      imgs.map((i) =>
        i.complete
          ? Promise.resolve()
          : new Promise((res) => {
              i.addEventListener("load", res, { once: true });
              i.addEventListener("error", res, { once: true });
            }),
      ),
    );
    return imgs.map((i) => ({ src: i.getAttribute("src"), ok: i.complete && i.naturalWidth > 1, natural: i.naturalWidth }));
  });
  await page.waitForTimeout(1500);
  await drain();

  const rel = (u) => (u || "").replace(BASE, "").split("?")[0];
  const byPath = new Map(responses.map((r) => [rel(r.url), r.status]));

  const critical = [
    "assets/fonts/fonts.css",
    "assets/tokens.css",
    "assets/icons/icons.svg",
    "assets/posters/poster-dawn.png",
    "assets/covers/cover-atlas-hero.png",
    "assets/cases/case-console-02.png",
    "assets/models/model-cabinet-01.glb",
    "assets/models/model-cabinet-01.png",
    "assets/fallback/model-fallback.png",
  ];
  for (const c of critical) {
    const st = byPath.get(c);
    if (st === 200) ok(`200  ${c}`);
    else bad(`${st ?? "未请求"}  ${c}`);
  }

  const badImgs = imgFetch.filter((i) => !i.ok);
  if (badImgs.length === 0) ok(`页面引用的 ${imgFetch.length} 张图片在子路径下全部取回并解码成功`);
  else bad(`${badImgs.length} 张图片未取回成功：${badImgs.slice(0, 5).map((i) => i.src).join(", ")}`);

  const notFound = responses.filter((r) => r.status === 404);
  if (notFound.length === 0) ok("无任何 404 请求");
  else bad(`${notFound.length} 个 404：${notFound.slice(0, 5).map((r) => rel(r.url)).join(", ")}`);

  const failed = responses.filter((r) => typeof r.status === "string" && r.status.startsWith("FAILED"));
  if (failed.length === 0) ok("无失败请求");
  else bad(`${failed.length} 个失败请求：${failed.slice(0, 5).map((r) => rel(r.url)).join(" | ")}`);

  const non200 = responses.filter((r) => typeof r.status === "number" && r.status !== 200 && r.status !== 304);
  if (non200.length === 0) ok("所有请求均为 200");
  else bad(`非 200 请求 ${non200.length} 个：${non200.slice(0, 5).map((r) => `${r.status} ${rel(r.url)}`).join(", ")}`);

  /* ---------- 3. 运行期可用性 ---------- */
  console.log("\n· 3. 运行期可用性");
  const runtime = await page.evaluate(() => {
    const T = window.ATLAS_TOKENS;
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      tokensGlobal: !!T,
      /* v1.1.0 起令牌结构为 meta / designSystem / local / compat / cssVars；
         16 的色板在 designSystem.color 下。 */
      tokenCount: T ? Object.keys(T.designSystem?.color || {}).length : 0,
      hasCssVars: !!(T && T.cssVars && Object.keys(T.cssVars.root || {}).length),
      dsBg: rootStyle.getPropertyValue("--ds-bg").trim(),
      dsAccent: rootStyle.getPropertyValue("--ds-accent").trim(),
      swatches: document.querySelectorAll(".swatch").length,
      posters: document.querySelectorAll(".poster-card").length,
      icons: document.querySelectorAll(".icon-cell").length,
      models: document.querySelectorAll(".model-card").length,
      fontLoaded: document.fonts.check('700 40px "Space Grotesk"'),
      cjkLoaded: document.fonts.check('700 40px "Noto Sans SC"'),
      bodyFont: getComputedStyle(document.body).fontFamily,
    };
  });

  if (runtime.tokensGlobal && runtime.tokenCount >= 4 && runtime.hasCssVars) {
    ok(`window.ATLAS_TOKENS 可用（${runtime.tokenCount} 个色阶分组 + ${runtime.dsBg ? "CSS 变量已生效" : "CSS 变量缺失"}）`);
  } else bad("运行期未取得设计令牌");
  if (runtime.dsBg && runtime.dsAccent) ok(`设计令牌在运行期生效（--ds-bg=${runtime.dsBg}，--ds-accent=${runtime.dsAccent}）`);
  else bad("设计令牌未在运行期生效（--ds-* 变量取不到值）");
  if (runtime.swatches >= 30) ok(`令牌色板渲染 ${runtime.swatches} 项`);
  else bad(`令牌色板仅 ${runtime.swatches} 项`);
  if (runtime.posters === 7) ok("7 张年代海报渲染");
  else bad(`海报渲染 ${runtime.posters} / 7`);
  if (runtime.icons === 48) ok("48 枚图标渲染");
  else bad(`图标渲染 ${runtime.icons} / 48`);
  if (runtime.models === 6) ok("6 件展品渲染");
  else bad(`展品渲染 ${runtime.models} / 6`);
  const glbStatus = byPath.get("assets/models/model-cabinet-01.glb");
  if (glbStatus === 200) ok("默认展品 GLB 在子路径下成功加载（200）");
  else bad(`默认展品 GLB 未成功加载：${glbStatus ?? "未请求"}`);
  if (runtime.fontLoaded) ok("Space Grotesk 在子路径下正常加载");
  else bad("Space Grotesk 未加载");
  if (runtime.cjkLoaded) ok("Noto Sans SC 在子路径下正常加载");
  else bad("Noto Sans SC 未加载");
  if (runtime.bodyFont.includes("Inter")) ok(`正文字体栈：${runtime.bodyFont.slice(0, 46)}…`);
  else bad(`正文字体栈异常：${runtime.bodyFont}`);

  /* ---------- 3b. 关键资源显式请求 ---------- */
  console.log("\n· 3b. 关键资源显式请求");
  for (const c of ["assets/fonts/fonts.css", "assets/tokens.css", "assets/tokens.js"]) {
    const st = await page.evaluate(async (u) => {
      const r = await fetch(u, { cache: "no-store" });
      return r.status;
    }, c);
    if (st === 200) ok(`显式 GET 200  ${c}`);
    else bad(`显式 GET ${st}  ${c}`);
  }

  /* 切换展品后第二个 GLB 也应可加载 */
  await page.evaluate(() => {
    const t = document.querySelectorAll(".model-tab")[2];
    if (t) t.click();
  });
  await page.waitForTimeout(6000);
  await drain();
  const glb2 = byPath.get("assets/models/model-console-03.glb") || responses.find((r) => r.url.includes("model-console-03.glb"))?.status;
  if (glb2 === 200) ok("切换展品后 model-console-03.glb 亦返回 200");
  else bad(`切换展品后 model-console-03.glb：${glb2 ?? "未请求"}`);

  /* ---------- 4. 产物洁净度 ---------- */
  console.log("\n· 4. 产物洁净度");
  const leak = [];
  for (const f of anyBundle) {
    const txt = readFileSync(path.join(DIST, "assets", f), "utf8");
    if (txt.includes("/public/")) leak.push(f);
  }
  if (leak.length === 0) ok("bundle 中无 /public/ 残留引用");
  else bad(`bundle 仍引用 /public/：${leak.join(", ")}`);

  const html = readFileSync(idx, "utf8");
  if (!/\.\/assets\/tokens\.css/.test(html) || !/\.\/assets\/fonts\/fonts\.css/.test(html)) {
    bad("index.html 中样式表引用不是相对路径");
  } else ok("index.html 样式表引用为相对路径（子路径可用）");
  if (/\.\/assets\/index-[^"']+\.js/.test(html)) ok("index.html 脚本引用为相对路径（子路径可用）");
  else bad("index.html 脚本引用不是相对路径");

  /* ---------- 5. 截图 ---------- */
  console.log("\n· 5. 子路径部署截图");
  const SHOTS = path.join(OUT, "screenshots");
  await fs.mkdir(SHOTS, { recursive: true });
  await page.cdp("Emulation.setDeviceMetricsOverride", {
    width: 1200, height: 820, deviceScaleFactor: 1, mobile: true,
  });
  await page.waitForTimeout(1500);
  const shotFile = path.join(SHOTS, "subpath-deploy.png");
  let shotOk = false;
  let shotStat = null;
  for (let attempt = 0; attempt < 3 && !shotOk; attempt++) {
    await page.screenshot({ path: shotFile });
    shotStat = await isFlat(shotFile);
    if (!shotStat.flat) shotOk = true;
    else {
      console.warn(`  ! 子路径截图第 ${attempt + 1} 次为平图，重试`);
      await page.waitForTimeout(2000);
    }
  }
  if (shotOk) ok(`子路径部署截图 → evidence/ego/screenshots/subpath-deploy.png（stddev=${shotStat?.stddev}）`);
  else bad("子路径部署截图未能生成");

  const realErrors = consoleErrors.filter((e) => !/favicon/i.test(e));
  if (realErrors.length === 0) ok("控制台无错误");
  else bad(`控制台错误 ${realErrors.length} 条：${realErrors.slice(0, 4).join(" | ")}`);

  /* ---------- 收尾 ---------- */
  try {
    for (const p of await task.pages()) {
      if (p.openedBy === "agent") await p.close();
    }
  } catch { /* ignore */ }

  const failures = checks.filter((c) => !c.ok);
  const report = {
    target: `${cfg.label || "07-museum-art"}-subpath`,
    url: BASE,
    prefix: cfg.prefix || "",
    browser: "ego-browser (ego-lite)",
    spaceId,
    generatedAt: new Date().toISOString(),
    verdict: failures.length ? "FAIL" : "PASS",
    total: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
    checks,
    responses: responses.map((r) => ({ path: rel(r.url), status: r.status })),
    consoleErrors,
  };
  const reportPath = path.join(OUT, `${cfg.label || "07-museum-art"}-subpath.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log("\n" + "=".repeat(58));
  console.log(`通过 ${checks.length - failures.length} / ${checks.length} 项`);
  if (failures.length) {
    console.log("\n失败项：");
    failures.forEach((f) => console.log("  ✗ " + f.m));
  } else {
    console.log("\n✓ 子路径部署复验全部通过，临时服务器已关闭。");
  }
  return { reportPath, verdict: report.verdict, passed: report.passed, total: report.total };
}
