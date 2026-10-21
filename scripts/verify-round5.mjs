/**
 * 线上验收 · 第五轮（发布后复验 09 与大厅，Ego 浏览器）
 *
 * 监工口径：
 *   · 09 作品页深链 ?game=lattice → mode=game / state=playing → 点暂停 → paused=true、文案切「继续」、aria-pressed=true；
 *   · 大厅与 09 页面零 console error、零 4xx/5xx；
 *   · 抽查站点根资源（favicon / 06 字体 / 令牌）仍为 200。
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

/** 页面级：console / 4xx / 横向滚动 */
async function pageHealth(page) {
  const evs = await page.events();
  return {
    consoleErrors: evs.filter((e) => e.method === 'Log.entryAdded' && e.params?.entry?.level === 'error').map((e) => e.params.entry.text),
    http4xx5xx: evs.filter((e) => e.method === 'Network.responseReceived' && (e.params?.response?.status || 0) >= 400)
      .map((e) => ({ status: e.params.response.status, url: e.params.response.url })),
  };
}

/* 1) 09 深链交互 */
const p09 = await task.newPage();
await p09.cdp('Network.enable', {});
await p09.cdp('Log.enable', {});
await p09.cdp('Runtime.enable', {});
await p09.goto(`${BASE}/works/09-era-arcade/?game=lattice`);
await p09.waitForLoadState({ timeout: 20000 }).catch(() => {});
await p09.waitForTimeout(3500);
out.arcade09 = { url: await p09.url(), title: await p09.title() };
out.arcade09.stateBefore = await p09.evaluate(() => {
  const body = document.body;
  const txt = (body?.innerText || '').slice(0, 400);
  const pressable = [...document.querySelectorAll('button,[aria-pressed]')].map((b) => ({
    text: (b.innerText || b.textContent || '').trim().slice(0, 20),
    ariaPressed: b.getAttribute('aria-pressed'),
    id: b.id || '',
  }));
  return {
    text: txt,
    hasGameMode: /mode=game|game/i.test(txt) || /lattice/i.test(txt),
    playing: /playing|进行中|游玩中|运行中/i.test(txt),
    pressable,
    pauseCandidate: pressable.filter((b) => /暂停|pause/i.test(b.text) || b.ariaPressed === 'false'),
  };
});
// 点「暂停」
const pauseSel = await p09.evaluate(() => {
  const cand = [...document.querySelectorAll('button,[aria-pressed]')].find((b) => /暂停|pause/i.test((b.innerText || b.textContent || '').trim()));
  if (!cand) return null;
  return cand.id ? `#${cand.id}` : null;
});
try {
  if (pauseSel) await p09.click(pauseSel, { timeout: 4000 });
  else {
    const label = out.arcade09.stateBefore.pressable.find((b) => /暂停|pause/i.test(b.text))?.text;
    if (label) await p09.click(`text="${label}"`, { timeout: 4000 });
  }
} catch (e) {
  out.arcade09.clickError = String(e.message || e).slice(0, 160);
}
await p09.waitForTimeout(1500);
out.arcade09.stateAfter = await p09.evaluate(() => {
  const txt = (document.body?.innerText || '').slice(0, 400);
  const btn = [...document.querySelectorAll('button,[aria-pressed]')].find((b) => /暂停|继续|pause|resume/i.test((b.innerText || b.textContent || '').trim()));
  return {
    text: txt,
    paused: /paused|已暂停|暂停中/i.test(txt),
    resumeLabel: btn ? (btn.innerText || btn.textContent || '').trim() : null,
    ariaPressed: btn ? btn.getAttribute('aria-pressed') : null,
  };
});
out.arcade09.health = await pageHealth(p09);
out.arcade09.screenshot = await p09.screenshot({ path: path.join(OUT, '09-era-arcade-paused.png') });
await p09.close();

/* 2) 大厅 */
const hall = await task.newPage();
await hall.cdp('Network.enable', {});
await hall.cdp('Log.enable', {});
await hall.cdp('Runtime.enable', {});
await hall.goto(`${BASE}/`);
await hall.waitForLoadState({ timeout: 20000 }).catch(() => {});
await hall.waitForTimeout(3000);
out.hall = {
  url: await hall.url(),
  title: await hall.title(),
  health: await pageHealth(hall),
  entries: await hall.evaluate(() => {
    const cards = [...document.querySelectorAll('a[href*="works/"]')];
    return { count: cards.length, hrefs: cards.slice(0, 14).map((a) => a.getAttribute('href')) };
  }),
  covers: await hall.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    return { total: imgs.length, broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length };
  }),
};
out.hall.screenshot = await hall.screenshot({ path: path.join(OUT, 'hall-index.png') });
await hall.close();

/* 3) 关键资源抽查 */
const probe = await task.newPage();
await probe.goto(`${BASE}/`);
out.assets = [];
for (const u of ['favicon.ico', 'assets/ds/tokens.css', 'assets/ds/fonts/fonts.css', 'works/06-museum-main/art/assets/fonts/fonts.css', 'data/works.json', 'assets/gallery-covers/09-era-arcade.webp']) {
  const r = await probe.fetch(`${BASE}/${u}`, { timeout: 15000 }).catch((e) => ({ status: 0, error: String(e.message || e) }));
  out.assets.push({ path: u, status: r.status });
}
await probe.close();

await fs.writeFile(path.join(OUT, 'verify-round5.json'), JSON.stringify(out, null, 2) + '\n');
console.log('第五轮证据已写入');
console.log('09 before:', JSON.stringify(out.arcade09.stateBefore?.hasGameMode), 'playing:', out.arcade09.stateBefore?.playing, 'pauseBtns:', JSON.stringify(out.arcade09.stateBefore?.pauseCandidate));
console.log('09 after :', JSON.stringify(out.arcade09.stateAfter));
console.log('09 health: console=' + out.arcade09.health.consoleErrors.length + ' 4xx=' + out.arcade09.health.http4xx5xx.length);
console.log('hall     : console=' + out.hall.health.consoleErrors.length + ' 4xx=' + out.hall.health.http4xx5xx.length + ' entries=' + out.hall.entries.count + ' covers=' + out.hall.covers.broken + '/' + out.hall.covers.total + ' broken');
console.log('assets   :', out.assets.map((a) => `${a.status} ${a.path}`).join(' | '));
await task.finish({ keep: [] });
