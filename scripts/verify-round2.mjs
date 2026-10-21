/**
 * 线上验收 · 第二轮定向取证（Ego 浏览器）
 *
 * 1) 大厅首页本身：控制台 / 404 / 封面图 / 横向滚动；
 * 2) 站点根关键资源逐一 200 核验（此前 404 的三条 + 真实截图封面）；
 * 3) 02-abyss-salvager：定位移动端 390px 溢出元素；重试 GLB 导出；
 * 4) 交互未命中的作品：用画布/键盘做一次真实操作并留证。
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

/** 1) 大厅首页 */
const hall = await task.newPage();
await hall.cdp('Network.enable', {});
await hall.cdp('Log.enable', {});
await hall.cdp('Runtime.enable', {});
await hall.goto(`${BASE}/`);
await hall.waitForLoadState({ timeout: 20000 }).catch(() => {});
await hall.waitForTimeout(3000);
const hallEvents = await hall.events();
const hallBad = hallEvents
  .filter((e) => e.method === 'Network.responseReceived' && (e.params?.response?.status || 0) >= 400)
  .map((e) => ({ status: e.params.response.status, url: e.params.response.url }));
const hallErrs = hallEvents
  .filter((e) => e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error')
  .map((e) => e.params.entry.text);
out.hall = {
  url: await hall.url(),
  title: await hall.title(),
  http4xx5xx: hallBad,
  consoleErrors: hallErrs,
  cards: await hall.evaluate(() => document.querySelectorAll('a[href*="works/"], article, [class*=card]').length),
  coverImgs: await hall.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    return {
      total: imgs.length,
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
      sample: imgs.slice(0, 4).map((i) => i.getAttribute('src')),
    };
  }),
  scroll: await hall.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
  })),
  screenshot: await hall.screenshot({ path: path.join(OUT, 'hall-index.png') }),
};
await hall.close();

/** 2) 站点根关键资源逐一核验（走 Ego 的 page.fetch，与浏览器同源同会话） */
const probe = await task.newPage();
await probe.goto(`${BASE}/`);
const assets = [
  'assets/ds/tokens.css',
  'assets/ds/fonts/fonts.css',
  'assets/ds/fonts/inter-latin.woff2',
  'assets/ds/fonts/space-grotesk-latin.woff2',
  'assets/ds/fonts/space-mono-regular.woff2',
  'assets/ds/fonts/space-mono-bold.woff2',
  'assets/ds/fonts/noto-sans-sc-subset.woff2',
  'assets/gallery-covers/01-chroma-s1.webp',
  'assets/gallery-covers/07-museum-art.webp',
  'assets/gallery-covers/12-era-modern.webp',
  'works/06-museum-main/art/assets/fonts/fonts.css',
  'works/06-museum-main/art/assets/fonts/inter-latin.woff2',
  'works/07-museum-art/assets/icons/joystick.svg',
  'data/works.json',
  'favicon.ico',
];
out.assetStatus = [];
for (const a of assets) {
  const r = await probe.fetch(`${BASE}/${a}`, { timeout: 15000 }).catch((e) => ({ status: 0, error: String(e.message || e) }));
  out.assetStatus.push({ path: a, status: r.status, bytes: (r.body || '').length || undefined, error: r.error });
}
await probe.close();

/** 3) 02：移动端溢出元素定位 + GLB 导出重试 */
const p02 = await task.newPage();
await p02.cdp('Runtime.enable', {});
await p02.goto(`${BASE}/works/02-abyss-salvager/`);
await p02.waitForLoadState({ timeout: 20000 }).catch(() => {});
await p02.waitForTimeout(2500);
await p02.cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await p02.waitForTimeout(800);
out.abyssOverflow = await p02.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const offenders = [];
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1) {
      offenders.push({
        tag: el.tagName,
        id: el.id || '',
        cls: (el.className || '').toString().slice(0, 60),
        right: Math.round(r.right),
        width: Math.round(r.width),
      });
    }
  }
  return {
    viewport: vw,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
    offenders: offenders.slice(0, 12),
  };
});
await p02.cdp('Emulation.clearDeviceMetricsOverride', {});
await p02.waitForTimeout(500);

// GLB 导出：先看页面上的导出控件到底怎么触发
out.abyssExport = await p02.evaluate(() => {
  const nodes = [...document.querySelectorAll('button,a,[role=button],[data-action]')].map((n) => ({
    tag: n.tagName,
    id: n.id || '',
    cls: (n.className || '').toString().slice(0, 50),
    text: (n.innerText || n.textContent || '').trim().slice(0, 30),
    download: n.getAttribute('download'),
    href: (n.getAttribute('href') || '').slice(0, 60),
  }));
  return {
    candidates: nodes.filter((n) => /glb|导出|export/i.test(n.text + ' ' + n.id + ' ' + n.cls + ' ' + n.href)),
    allButtons: nodes.filter((n) => n.tag === 'BUTTON').slice(0, 20),
  };
});

let dl = { ok: false };
try {
  const dlPromise = p02.waitForEvent('download', { timeout: 25000 });
  await p02.click('text="导出 GLB"', { timeout: 5000 });
  const d = await dlPromise;
  const p = path.join(OUT, '02-abyss-salvager-export.glb');
  await d.saveAs(p);
  const st = await fs.stat(p);
  dl = { ok: true, filename: d.suggestedFilename(), bytes: st.size, path: p };
} catch (e) {
  dl = { ok: false, error: String(e.message || e).slice(0, 200) };
}
out.abyssExport.download = dl;
out.abyssExport.screenshot = await p02.screenshot({ path: path.join(OUT, '02-abyss-salvager-after-export.png') });
await p02.close();

/** 4) 交互未命中的作品：用画布点击 + 键盘做一次真实操作 */
const playTargets = [
  { id: '01-chroma-s1', url: `${BASE}/works/01-chroma-s1/` },
  { id: '06-museum-main', url: `${BASE}/works/06-museum-main/` },
  { id: '07-museum-art', url: `${BASE}/works/07-museum-art/` },
  { id: '08-era-origins', url: `${BASE}/works/08-era-origins/` },
  { id: '09-era-arcade', url: `${BASE}/works/09-era-arcade/` },
  { id: '10-era-console', url: `${BASE}/works/10-era-console/` },
  { id: '11-era-online', url: `${BASE}/works/11-era-online/` },
  { id: '16-design-system', url: `${BASE}/works/16-design-system/` },
  { id: '17-architecture-research', url: `${BASE}/works/17-architecture-research/` },
  { id: '18-architecture-models', url: `${BASE}/works/18-architecture-models/` },
];
out.play = [];
for (const t of playTargets) {
  const p = await task.newPage();
  try {
    await p.goto(t.url);
    await p.waitForLoadState({ timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(2200);
    const before = await p.evaluate(() => ({
      text: (document.body?.innerText || '').length,
      storage: Object.keys(localStorage).length,
      canvas: [...document.querySelectorAll('canvas')].map((c) => ({ w: c.width, h: c.height })),
    }));
    // 画布点击（居中）
    const box = await p.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) };
    });
    let canvasClicked = false;
    if (box && box.w > 0) {
      await p.mouse.click(box.x, box.y, { label: 'click canvas center' }).catch(() => {});
      canvasClicked = true;
      await p.waitForTimeout(800);
    }
    for (const k of ['Space', 'Enter', 'ArrowUp', 'ArrowRight']) {
      await p.keyboard.press(k).catch(() => {});
    }
    await p.waitForTimeout(1200);
    const after = await p.evaluate(() => ({
      text: (document.body?.innerText || '').length,
      storage: Object.keys(localStorage).length,
      visible: [...document.querySelectorAll('[class*=hud],[class*=panel],[class*=overlay],[class*=modal],[class*=status],[class*=card]')]
        .map((n) => (n.innerText || '').trim().slice(0, 40)).filter(Boolean).slice(0, 6),
    }));
    out.play.push({
      id: t.id,
      canvasClicked,
      textBefore: before.text,
      textAfter: after.text,
      storageBefore: before.storage,
      storageAfter: after.storage,
      storageGrew: after.storage > before.storage,
      visiblePanels: after.visible,
      stateChanged: after.text !== before.text || after.storage > before.storage,
    });
  } catch (e) {
    out.play.push({ id: t.id, error: String(e.message || e).slice(0, 160) });
  } finally {
    await p.close().catch(() => {});
  }
}

await fs.writeFile(path.join(OUT, 'verify-round2.json'), JSON.stringify(out, null, 2) + '\n');
console.log('第二轮证据已写入');
console.log('hall:', JSON.stringify(out.hall?.http4xx5xx), 'consoleErrors:', out.hall?.consoleErrors?.length, 'covers:', JSON.stringify(out.hall?.coverImgs));
console.log('assets:', out.assetStatus.map((a) => `${a.status} ${a.path}`).join('\n  '));
console.log('abyss overflow:', JSON.stringify(out.abyssOverflow?.offenders));
console.log('abyss export:', JSON.stringify(out.abyssExport?.download));
console.log('play:', out.play.map((p) => `${p.id}:${p.stateChanged ? 'changed' : 'no-change'}${p.storageGrew ? '(storage+)' : ''}`).join(' '));

await task.finish({ keep: [] });
