/**
 * 线上验收 · 第三轮定向取证（Ego 浏览器）
 *
 * A) 02-abyss-salvager：精确定位移动端 390px 溢出的元素（right 落在 390—430 之间）；
 * B) 画布类作品：用「画布像素指纹」证明输入确实驱动了渲染（canvas 作品本来就没有文本变化）；
 * C) 17 研究页 / 00 案例索引：真实输入搜索词并核对结果集变化（HANDOFF §四 第 9 项的可搜索性）。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'online-evidence', 'ego');
const BASE = 'https://kingkazmax.github.io/playtime-atlas-20261021';
await fs.mkdir(OUT, { recursive: true });

const task = await taskSpace('playtime-atlas-online-qa');
const out = { ranAt: new Date().toISOString(), taskSpaceId: task.spaceId };

/** A) 02 溢出元素精确定位 */
const p02 = await task.newPage();
await p02.goto(`${BASE}/works/02-abyss-salvager/`);
await p02.waitForLoadState({ timeout: 20000 }).catch(() => {});
await p02.waitForTimeout(2200);
await p02.cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await p02.waitForTimeout(900);
out.abyssOverflowPrecise = await p02.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const list = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 1 && r.right <= vw + 60) {
      const cs = getComputedStyle(el);
      list.push({
        tag: el.tagName,
        id: el.id || '',
        cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 60),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        overflowX: cs.overflowX,
        minWidth: cs.minWidth,
        position: cs.position,
      });
    }
  }
  // 只保留最外层的溢出元素
  const outer = list.filter((x) => !list.some((y) => y !== x && y.left <= x.left && y.right >= x.right && (y.right - y.left) > (x.right - x.left)));
  return { viewport: vw, docScrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, outermost: outer.slice(0, 8), total: list.length };
});
await p02.cdp('Emulation.clearDeviceMetricsOverride', {});
await p02.close();

/** B) 画布类作品：像素指纹变化 */
const canvasTargets = [
  { id: '01-chroma-s1', url: `${BASE}/works/01-chroma-s1/` },
  { id: '06-museum-main', url: `${BASE}/works/06-museum-main/` },
  { id: '07-museum-art', url: `${BASE}/works/07-museum-art/` },
  { id: '08-era-origins', url: `${BASE}/works/08-era-origins/` },
  { id: '09-era-arcade', url: `${BASE}/works/09-era-arcade/` },
  { id: '10-era-console', url: `${BASE}/works/10-era-console/` },
  { id: '16-design-system', url: `${BASE}/works/16-design-system/` },
  { id: '18-architecture-models', url: `${BASE}/works/18-architecture-models/` },
];

const canvasFingerprint = () => {
  const cs = [...document.querySelectorAll('canvas')];
  let h = 0;
  let n = 0;
  for (const c of cs) {
    try {
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) continue;
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let s = 0;
      for (let i = 0; i < d.length; i += 997) s = (s * 31 + d[i]) >>> 0;
      h = (h * 33 + s) >>> 0;
      n++;
    } catch { /* WebGL 画布读不到 2d */ }
  }
  return { hash: h, readable: n, canvases: cs.length };
};

out.canvasPlay = [];
for (const t of canvasTargets) {
  const p = await task.newPage();
  try {
    await p.goto(t.url);
    await p.waitForLoadState({ timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(2500);
    const before = await p.evaluate(canvasFingerprint);
    // 点画布中心 + 常见游戏键
    const box = await p.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (box && box.w > 0) {
      await p.mouse.click(box.x, box.y, { label: 'canvas center' }).catch(() => {});
      await p.waitForTimeout(600);
    }
    for (const k of ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyW', 'KeyA']) {
      await p.keyboard.press(k).catch(() => {});
      await p.waitForTimeout(120);
    }
    await p.waitForTimeout(1200);
    const after = await p.evaluate(canvasFingerprint);
    const textDelta = await p.evaluate(() => (document.body?.innerText || '').length);
    out.canvasPlay.push({
      id: t.id,
      canvasCount: before.canvases,
      readable2d: before.readable,
      hashBefore: before.hash,
      hashAfter: after.hash,
      pixelsChanged: before.readable > 0 && before.hash !== after.hash,
      note: before.readable === 0 ? 'WebGL 画布（2D 上下文不可读），改以 DOM 状态判定' : '',
    });
  } catch (e) {
    out.canvasPlay.push({ id: t.id, error: String(e.message || e).slice(0, 160) });
  } finally {
    await p.close().catch(() => {});
  }
}

/** C) 搜索可用性：17 研究页 + 00 案例索引 */
async function searchCheck(page, inputSelector, label) {
  const before = await page.evaluate(() => ({
    count: document.querySelectorAll('[class*=card],[class*=item],[class*=row],li,article').length,
    text: (document.body?.innerText || '').length,
  }));
  let typed = false;
  try {
    await page.fill(inputSelector, '塔');
    typed = true;
    await page.waitForTimeout(900);
  } catch { /* 选择器可能不匹配 */ }
  const after = await page.evaluate(() => ({
    count: document.querySelectorAll('[class*=card],[class*=item],[class*=row],li,article').length,
    text: (document.body?.innerText || '').length,
    visibleItems: [...document.querySelectorAll('[class*=card],[class*=item],[class*=row],li,article')]
      .filter((n) => n.offsetParent !== null).length,
  }));
  return { label, typed, before, after, filtered: after.visibleItems < after.count };
}

out.search = [];
for (const t of [
  { id: '17-architecture-research', url: `${BASE}/works/17-architecture-research/`, sel: 'input[type=search], input[type=text], input:not([type])' },
  { id: '00-research-dossier', url: `${BASE}/works/00-research-dossier/`, sel: 'input[type=search], input[type=text], input:not([type])' },
]) {
  const p = await task.newPage();
  try {
    await p.goto(t.url);
    await p.waitForLoadState({ timeout: 20000 }).catch(() => {});
    await p.waitForTimeout(2200);
    out.search.push(await searchCheck(p, t.sel, t.id));
  } catch (e) {
    out.search.push({ id: t.id, error: String(e.message || e).slice(0, 160) });
  } finally {
    await p.close().catch(() => {});
  }
}

await fs.writeFile(path.join(OUT, 'verify-round3.json'), JSON.stringify(out, null, 2) + '\n');
console.log('第三轮证据已写入');
console.log('02 溢出:', JSON.stringify(out.abyssOverflowPrecise?.outermost));
console.log('画布响应:', out.canvasPlay.map((c) => `${c.id}:${c.pixelsChanged ? 'pixels-changed' : 'no-change'}`).join(' '));
console.log('搜索:', JSON.stringify(out.search.map((s) => ({ id: s.label, typed: s.typed, filtered: s.filtered, before: s.before?.visibleItems ?? s.before?.count, after: s.after?.visibleItems ?? s.after?.count }))));

await task.finish({ keep: [] });
