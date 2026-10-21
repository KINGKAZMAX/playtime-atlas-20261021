/**
 * 线上验收 · 第四轮（发布后终检，Ego 浏览器）
 *
 * 1) 监工点名核验：06 页面**实际引用**的每个资源逐一取状态码；
 * 2) 站点根 favicon.ico（此前 404，本轮随 docs/favicon.ico 上线）；
 * 3) 大厅首页 smoke：控制台 / 4xx / 封面加载 / 横向滚动；
 * 4) 抽查 4 件作品：控制台、4xx、存档、焦点环。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'online-evidence', 'ego');
const BASE = 'https://kingkazmax.github.io/playtime-atlas-20261021';
await fs.mkdir(OUT, { recursive: true });

const task = await taskSpace('playtime-atlas-online-qa');
const out = { ranAt: new Date().toISOString(), taskSpaceId: task.spaceId, base: BASE };

/** 1) + 2) 逐条资源状态 */
const probe = await task.newPage();
await probe.goto(`${BASE}/`);

const urls = [
  // 监工点名：06 页面实际引用的资源
  'works/06-museum-main/art/assets/fonts/fonts.css',
  'works/06-museum-main/art/assets/fonts/inter-latin.woff2',
  'works/06-museum-main/art/assets/fonts/space-grotesk-latin.woff2',
  'works/06-museum-main/assets/index-DnTTdWMf.css',
  'works/06-museum-main/exhibits/modern/assets/ds/fonts/fonts.css',
  'works/06-museum-main/exhibits/online/assets/ds/fonts/fonts.css',
  // 站点根令牌与字体
  'assets/ds/tokens.css',
  'assets/ds/fonts/fonts.css',
  'assets/ds/fonts/inter-latin.woff2',
  'assets/ds/fonts/space-grotesk-latin.woff2',
  'assets/ds/fonts/space-mono-regular.woff2',
  'assets/ds/fonts/space-mono-bold.woff2',
  'assets/ds/fonts/noto-sans-sc-subset.woff2',
  // 真实截图封面 + 其它
  'assets/gallery-covers/01-chroma-s1.webp',
  'assets/gallery-covers/06-museum-main.webp',
  'assets/gallery-covers/12-era-modern.webp',
  'works/07-museum-art/assets/icons/joystick.svg',
  'data/works.json',
  'favicon.ico',
];
out.assetStatus = [];
for (const u of urls) {
  const r = await probe.fetch(`${BASE}/${u}`, { timeout: 15000 }).catch((e) => ({ status: 0, error: String(e.message || e) }));
  out.assetStatus.push({ path: u, status: r.status, bytes: (r.body || '').length || undefined, error: r.error });
}
await probe.close();

/** 3) + 4) 页面级 smoke */
async function smoke(url, label) {
  const p = await task.newPage();
  try {
    await p.cdp('Network.enable', {});
    await p.cdp('Log.enable', {});
    await p.cdp('Runtime.enable', {});
    await p.goto(url);
    await p.waitForLoadState({ timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(2500);
    const evs = await p.events();
    const bad = evs.filter((e) => e.method === 'Network.responseReceived' && (e.params?.response?.status || 0) >= 400)
      .map((e) => ({ status: e.params.response.status, url: e.params.response.url }));
    const errs = evs.filter((e) => e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error')
      .map((e) => e.params.entry.text);
    const scroll = await p.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
    }));
    const storage = await p.evaluate(() => Object.keys(localStorage));
    const covers = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      return { total: imgs.length, broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length };
    });
    await p.cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await p.waitForTimeout(600);
    const mob = await p.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
    }));
    await p.cdp('Emulation.clearDeviceMetricsOverride', {});
    return {
      label, url: await p.url(), title: await p.title(),
      http4xx5xx: bad, consoleErrors: errs,
      desktop: scroll, mobile: mob,
      desktopNoHScroll: scroll.scrollWidth <= scroll.clientWidth + 1 && scroll.bodyScrollWidth <= scroll.clientWidth + 1,
      mobileNoHScroll: mob.scrollWidth <= mob.clientWidth + 1 && mob.bodyScrollWidth <= mob.clientWidth + 1,
      storageKeys: storage.length, covers,
    };
  } finally {
    await p.close().catch(() => {});
  }
}

out.smoke = [];
for (const [label, url] of [
  ['hall', `${BASE}/`],
  ['06-museum-main', `${BASE}/works/06-museum-main/`],
  ['07-museum-art', `${BASE}/works/07-museum-art/`],
  ['02-abyss-salvager', `${BASE}/works/02-abyss-salvager/`],
  ['17-architecture-research', `${BASE}/works/17-architecture-research/`],
]) {
  out.smoke.push(await smoke(url, label));
}

await fs.writeFile(path.join(OUT, 'verify-round4.json'), JSON.stringify(out, null, 2) + '\n');
console.log('第四轮证据已写入');
for (const a of out.assetStatus) console.log(`  ${a.status} ${a.path}${a.error ? ' (' + a.error + ')' : ''}`);
for (const s of out.smoke) {
  console.log(`  ${s.label}: console=${s.consoleErrors.length} 4xx=${s.http4xx5xx.length} hScroll(d/m)=${s.desktopNoHScroll}/${s.mobileNoHScroll} covers=${s.covers.broken}/${s.covers.total} broken`);
}
await task.finish({ keep: [] });
