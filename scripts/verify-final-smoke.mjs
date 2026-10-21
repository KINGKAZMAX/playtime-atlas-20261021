/**
 * 线上验收 · 最终 smoke（Ego 浏览器，发布后）
 *
 * 1) 大厅 + 3 条深链 + 3 件带 DS 依赖的作品：控制台错误、4xx/5xx、封面破图；
 * 2) 监督点名资源：06 的 art/assets/fonts/fonts.css 必须是 200；
 * 3) 撤回对照：16/17/18 深链与站点根 DS 必须是 404。
 *
 * 用法：ego-browser nodejs -e "await import('file://$PWD/scripts/verify-final-smoke.mjs')"
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'online-evidence', 'ego');
const BASE = 'https://kingkazmax.github.io/playtime-atlas-20261021';
await fs.mkdir(OUT, { recursive: true });

const task = await taskSpace('playtime-atlas-online-qa');
const out = { ranAt: new Date().toISOString(), taskSpaceId: task.spaceId, base: BASE, smoke: [], assets: [] };

async function smoke(url, label) {
  const p = await task.newPage();
  try {
    await p.cdp('Network.enable', {});
    await p.cdp('Log.enable', {});
    await p.cdp('Runtime.enable', {});
    await p.goto(url);
    await p.waitForLoadState({ timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(2200);
    const evs = await p.events();
    const bad = evs
      .filter((e) => e.method === 'Network.responseReceived' && (e.params?.response?.status || 0) >= 400)
      .map((e) => ({ status: e.params.response.status, url: e.params.response.url }));
    const errs = evs
      .filter((e) => e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error')
      .map((e) => e.params.entry.text);
    const exc = evs
      .filter((e) => e.method === 'Runtime.exceptionThrown')
      .map((e) => e.params?.exceptionDetails?.text || 'exception');
    const covers = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      return { total: imgs.length, broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length };
    });
    const hscroll = await p.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    return {
      label,
      url: await p.url(),
      title: await p.title(),
      http4xx5xx: bad,
      consoleErrors: errs,
      exceptions: exc,
      covers,
      horizontalScroll: hscroll.scrollWidth > hscroll.clientWidth + 1,
    };
  } finally {
    await p.close().catch(() => {});
  }
}

for (const [label, url] of [
  ['hall', `${BASE}/`],
  ['00-research-dossier', `${BASE}/works/00-research-dossier/`],
  ['05-museum-catalog', `${BASE}/research/catalog.html`],
  ['13-qa-report', `${BASE}/qa/`],
  ['01-chroma-s1', `${BASE}/works/01-chroma-s1/`],
  ['06-museum-main', `${BASE}/works/06-museum-main/`],
  ['11-era-online', `${BASE}/works/11-era-online/`],
]) {
  out.smoke.push(await smoke(url, label));
}

// 资源状态（含撤回对照，cache-busting 绕开边缘缓存）
const probe = await task.newPage();
await probe.goto(`${BASE}/`);
const RESOURCES = [
  ['works/06-museum-main/art/assets/fonts/fonts.css', 200],
  ['works/06-museum-main/assets/ds/tokens.css', 200],
  ['works/01-chroma-s1/assets/ds/tokens.css', 200],
  ['works/11-era-online/assets/ds/fonts/fonts.css', 200],
  ['data/works.json', 200],
  ['favicon.ico', 200],
  ['works/16-design-system/index.html', 404],
  ['works/17-architecture-research/index.html', 404],
  ['works/18-architecture-models/index.html', 404],
  ['assets/ds/tokens.css', 404],
];
for (const [u, expect] of RESOURCES) {
  const r = await probe
    .fetch(`${BASE}/${u}?cb=${Date.now()}`, { timeout: 20000 })
    .catch(() => ({ status: 0 }));
  out.assets.push({ path: u, expected: expect, status: r.status, ok: r.status === expect });
}
await probe.close();

await fs.writeFile(path.join(OUT, 'verify-final-smoke.json'), JSON.stringify(out, null, 2) + '\n');
await task.finish({ keep: [] });

console.log(`=== 最终 smoke ${out.ranAt} ===`);
for (const s of out.smoke) {
  console.log(
    `  ${s.label.padEnd(20)} console=${s.consoleErrors.length} exc=${s.exceptions.length} 4xx/5xx=${s.http4xx5xx.length} 破图=${s.covers.broken}/${s.covers.total} 横向溢出=${s.horizontalScroll}`
  );
  for (const e of s.http4xx5xx.slice(0, 5)) console.log(`      ${e.status} ${e.url}`);
  for (const e of s.consoleErrors.slice(0, 3)) console.log(`      console: ${String(e).slice(0, 160)}`);
}
console.log('--- 资源状态 ---');
for (const a of out.assets) console.log(`  ${a.ok ? '✓' : '✗'} ${String(a.status).padStart(3)} (期望 ${a.expected}) ${a.path}`);
const badSmoke = out.smoke.filter((s) => s.consoleErrors.length || s.exceptions.length || s.http4xx5xx.length);
const badAssets = out.assets.filter((a) => !a.ok);
console.log(`页面 ${out.smoke.length} 个（异常 ${badSmoke.length}）；资源 ${out.assets.length} 条（不符 ${badAssets.length}）`);
if (badSmoke.length || badAssets.length) process.exitCode = 1;
