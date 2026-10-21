/**
 * 线上实玩验收 —— 按 13-qa-curation《HANDOFF-14.md》§四 的 9 + 2 项，
 * 在**真实线上 URL** 上逐项取证（通道：Ego 浏览器，用户指定）。
 *
 * 9 项（每件作品都跑）：
 *   1. 页面能打开，控制台零 error
 *   2. 网络面板零 404（含 /favicon.ico）
 *   3. 桌面 1440×900 无横向滚动
 *   4. 移动 390×844 无横向滚动
 *   5. 刷新后 localStorage 存档仍在
 *   6. Tab 可移动焦点且有可见焦点环
 *   7. 3D 作品的 GLB 导出可下载且文件非空（仅 02）
 *   8. 子路径下 iframe 内嵌的展厅能正常加载（06）
 *   9. 策展目录能正常打开并可搜索 / 筛选（05 仓库内留存 → 线上豁免并记录）
 * +2 项（07-museum-art 内容完整性）：
 *   10. 七个区块 childElementCount > 0
 *   11. 页面上搜不到字面量 {count}，且行内 <code> 等宽标记仍存在
 *
 * 每件作品额外做一次**真实交互**（点击主控 + 键盘输入）并记录状态变化。
 *
 * 用法：ego-browser nodejs < verify-online.mjs
 * 证据：online-evidence/ego/verify-online.json + 每件截图
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'online-evidence', 'ego');
const BASE = 'https://kingkazmax.github.io/playtime-atlas-20261021';
const SETTLE = 2500;

await fs.mkdir(OUT, { recursive: true });

const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'works.json'), 'utf8'));
const published = manifest.works.filter((w) => w.publish !== false);
const deepLinks = manifest.works.filter((w) => w.publish === false && w.deepLink === true);

const targets = [
  ...published.map((w) => ({ id: w.id, title: w.title, url: `${BASE}/${w.entry}`, kind: 'hall' })),
  ...deepLinks.map((w) => ({ id: w.id, title: w.title, url: `${BASE}/${w.entry}`, kind: 'deeplink' })),
];

const results = [];
const task = await taskSpace('playtime-atlas-online-qa');
console.log('TaskSpace:', task.spaceId, '目标数:', targets.length);

/** 收集某页自上次清空以来的 CDP 事件。 */
async function drain(page) {
  const evs = await page.events();
  return Array.isArray(evs) ? evs : [];
}

/** 网络 4xx/5xx 与控制台错误 —— 从 CDP 事件流里取。 */
function analyze(events) {
  const bad = [];
  const consoleErrors = [];
  for (const e of events) {
    const m = e.method || '';
    const p = e.params || {};
    if (m === 'Network.responseReceived') {
      const r = p.response || {};
      if (typeof r.status === 'number' && r.status >= 400) {
        bad.push({ status: r.status, url: r.url });
      }
    } else if (m === 'Log.entryAdded') {
      const en = p.entry || {};
      if (en.level === 'error') consoleErrors.push({ source: en.source, text: en.text, url: en.url });
    } else if (m === 'Runtime.consoleAPICalled' && p.type === 'error') {
      consoleErrors.push({
        source: 'console',
        text: (p.args || []).map((a) => a.value ?? a.description ?? a.type).join(' '),
      });
    } else if (m === 'Runtime.exceptionThrown') {
      const d = p.exceptionDetails || {};
      consoleErrors.push({ source: 'exception', text: d.text + ' ' + (d.exception?.description || '') });
    }
  }
  return { bad, consoleErrors };
}

/** 视口切换 + 横向滚动判定。 */
async function scrollCheck(page, width, height, mobile) {
  await page.cdp('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: 1, mobile,
  });
  await page.waitForTimeout(600);
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body ? document.body.scrollWidth : 0,
    innerWidth: window.innerWidth,
  }));
}

/** 焦点环检测：Tab 一次后看 activeElement 与其可见焦点样式。 */
async function focusRingCheck(page) {
  await page.evaluate(() => {
    if (document.body) document.body.focus?.();
    const el = document.querySelector('a,button,input,select,textarea,[tabindex]');
    if (el && el.blur) el.blur();
  });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(400);
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { moved: false };
    const cs = getComputedStyle(el);
    const hasOutline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth || '0') > 0;
    const hasShadow = cs.boxShadow && cs.boxShadow !== 'none';
    return {
      moved: true,
      tag: el.tagName,
      id: el.id || '',
      text: (el.textContent || '').trim().slice(0, 40),
      outlineWidth: cs.outlineWidth,
      outlineStyle: cs.outlineStyle,
      outlineColor: cs.outlineColor,
      hasOutline,
      hasShadow,
      visibleRing: hasOutline || hasShadow,
    };
  });
}

/** 真实交互：点主控按钮 + 键盘输入，记录状态变化。 */
async function interact(page) {
  const before = await page.evaluate(() => ({
    text: (document.body?.innerText || '').length,
    buttons: [...document.querySelectorAll('button,a.btn,[role=button]')].map((b) =>
      (b.innerText || b.textContent || '').trim()
    ).filter(Boolean).slice(0, 12),
    storage: Object.keys(localStorage),
    canvases: document.querySelectorAll('canvas').length,
  }));

  let clicked = null;
  const startRe = /开始|启动|进入|start|play|开始游戏|进入展厅|体验/i;
  for (const label of before.buttons) {
    if (startRe.test(label)) {
      const sel = `text="${label}"`;
      try {
        await page.click(sel, { timeout: 3000 });
        clicked = label;
        break;
      } catch { /* 试下一个 */ }
    }
  }
  await page.waitForTimeout(700);
  for (const key of ['Space', 'ArrowRight']) {
    try { await page.keyboard.press(key); } catch { /* ignore */ }
  }
  await page.waitForTimeout(900);

  const after = await page.evaluate(() => ({
    text: (document.body?.innerText || '').length,
    storage: Object.keys(localStorage),
    canvases: document.querySelectorAll('canvas').length,
    overlays: [...document.querySelectorAll('[class*=modal],[class*=overlay],[class*=dialog],[class*=hud],[class*=panel]')]
      .map((n) => (n.className || '').toString()).slice(0, 6),
  }));

  const newKeys = after.storage.filter((k) => !before.storage.includes(k));
  return {
    clicked,
    buttonsSeen: before.buttons.length,
    textChanged: after.text !== before.text,
    storageBefore: before.storage,
    storageAfter: after.storage,
    storageNewKeys: newKeys,
    storageGrew: newKeys.length > 0,
    canvases: after.canvases,
    stateChanged: after.text !== before.text || newKeys.length > 0 || after.canvases !== before.canvases,
  };
}

/** 05 之外：子路径 iframe 是否加载成功（06 的内嵌展厅）。 */
async function iframeCheck(page) {
  return page.evaluate(() => {
    const frames = [...document.querySelectorAll('iframe')];
    return {
      count: frames.length,
      frames: frames.slice(0, 6).map((f) => {
        let ok = false;
        let title = '';
        let textLen = 0;
        try {
          const d = f.contentDocument;
          ok = !!d && d.readyState === 'complete';
          title = d?.title || '';
          textLen = (d?.body?.innerText || '').length;
        } catch { /* 跨源 */ }
        return { src: f.getAttribute('src') || '', ok, title, textLen };
      }),
    };
  });
}

/** 07 的七个内容区块 + {count} 占位符检查。 */
async function sevenBlocksCheck(page) {
  return page.evaluate(() => {
    const ids = ['font-cards', 'icon-grid', 'poster-grid', 'cover-grid', 'model-cards', 'fallback-grid', 'case-grid'];
    const blocks = ids.map((id) => {
      const el = document.getElementById(id);
      return { id, found: !!el, children: el ? el.childElementCount : 0 };
    });
    const html = document.documentElement.innerHTML;
    const text = document.body ? document.body.innerText : '';
    return {
      blocks,
      allFilled: blocks.every((b) => b.found && b.children > 0),
      literalCountPlaceholder: /\{count\}/.test(html) || /\{count\}/.test(text),
      codeTags: document.querySelectorAll('code').length,
      hasInlineCode: document.querySelectorAll('code').length > 0,
    };
  });
}

/** 00 案例索引：条目数与搜索可用性。 */
async function caseIndexCheck(page) {
  return page.evaluate(() => {
    const cards = document.querySelectorAll('[class*=case], article, li.case');
    const input = document.querySelector('input[type=search], input[type=text], input:not([type])');
    return { cardCount: cards.length, hasSearch: !!input, title: document.title };
  });
}

/** 17 研究成果页：条目数与中英切换。 */
async function researchCheck(page) {
  return page.evaluate(() => {
    const langBtns = [...document.querySelectorAll('[data-l],[lang],[data-lang]')].length;
    const text = document.body ? document.body.innerText : '';
    return { langControls: langBtns, textLen: text.length, hasCn: /[一-龥]/.test(text), hasEn: /[A-Za-z]{4,}/.test(text) };
  });
}

/** 18 模型页：WebGL 与降级。 */
async function modelsCheck(page) {
  return page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    let webgl = false;
    for (const c of canvases) {
      try { webgl = !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { /* ignore */ }
      if (webgl) break;
    }
    return {
      canvasCount: canvases.length,
      webgl,
      fallbackImgs: document.querySelectorAll('img').length,
      textLen: (document.body?.innerText || '').length,
    };
  });
}

/** 02 的 GLB 导出：点导出按钮 → 等待下载 → 落盘 → 校验非空。 */
async function glbExportCheck(page) {
  const btns = await page.evaluate(() =>
    [...document.querySelectorAll('button,a,[role=button]')]
      .map((b) => ({ label: (b.innerText || b.textContent || '').trim(), id: b.id || '' }))
      .filter((b) => /glb|导出|export/i.test(b.label + ' ' + b.id))
      .slice(0, 5)
  );
  if (!btns.length) return { found: false, note: '未找到导出控件' };
  let saved = null;
  for (const b of btns) {
    try {
      const dlPromise = page.waitForEvent('download', { timeout: 15000 });
      await page.click(`text="${b.label}"`, { timeout: 3000 }).catch(async () => {
        if (b.id) await page.click(`#${b.id}`, { timeout: 3000 });
      });
      const dl = await dlPromise;
      const out = path.join(OUT, `02-abyss-salvager-export${path.extname(dl.suggestedFilename() || '') || '.glb'}`);
      await dl.saveAs(out);
      const st = await fs.stat(out);
      saved = { filename: dl.suggestedFilename(), bytes: st.size, path: out };
      break;
    } catch (e) {
      saved = { error: String(e.message || e).slice(0, 160) };
    }
  }
  return { found: true, candidates: btns.map((b) => b.label), download: saved };
}

for (const t of targets) {
  const rec = { id: t.id, title: t.title, kind: t.kind, url: t.url, checks: {}, errors: [] };
  let page = null;
  try {
    page = await task.newPage();
    await page.cdp('Network.enable', {});
    await page.cdp('Log.enable', {});
    await page.cdp('Runtime.enable', {});
    await page.goto(t.url);
    await page.waitForLoadState({ timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(SETTLE);

    rec.checks.title = await page.title();
    rec.checks.finalUrl = await page.url();

    // 3) 桌面 1440×900 无横向滚动
    const desk = await scrollCheck(page, 1440, 900, false);
    rec.checks.desktopNoHScroll = desk.scrollWidth <= desk.clientWidth + 1 && desk.bodyScrollWidth <= desk.clientWidth + 1;
    rec.checks.desktop = desk;

    // 4) 移动 390×844 无横向滚动
    const mob = await scrollCheck(page, 390, 844, true);
    rec.checks.mobileNoHScroll = mob.scrollWidth <= mob.clientWidth + 1 && mob.bodyScrollWidth <= mob.clientWidth + 1;
    rec.checks.mobile = mob;

    // 5) localStorage 存档刷新后仍在
    const storageBefore = await page.evaluate(() => Object.keys(localStorage));
    await page.reload();
    await page.waitForLoadState({ timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const storageAfter = await page.evaluate(() => ({
      keys: Object.keys(localStorage),
      sample: Object.fromEntries(
        Object.keys(localStorage).slice(0, 8).map((k) => [k, String(localStorage.getItem(k)).slice(0, 120)])
      ),
    }));
    rec.checks.storageKeysBefore = storageBefore;
    rec.checks.storageKeysAfter = storageAfter.keys;
    rec.checks.storagePersisted = storageBefore.every((k) => storageAfter.keys.includes(k));
    rec.checks.storageSample = storageAfter.sample;

    // 6) Tab 焦点环
    rec.checks.focus = await focusRingCheck(page);

    // 真实交互
    rec.checks.interaction = await interact(page);

    // 8) 子路径 iframe
    rec.checks.iframes = await iframeCheck(page);

    // 专项
    if (t.id === '07-museum-art') {
      rec.checks.sevenBlocks = await sevenBlocksCheck(page);
    }
    if (t.id === '02-abyss-salvager') {
      rec.checks.glbExport = await glbExportCheck(page);
    }
    if (t.id === '00-research-dossier') {
      rec.checks.caseIndex = await caseIndexCheck(page);
    }
    if (t.id === '17-architecture-research') {
      rec.checks.research = await researchCheck(page);
    }
    if (t.id === '18-architecture-models') {
      rec.checks.models = await modelsCheck(page);
    }
    if (t.id === '16-design-system') {
      rec.checks.dsTokens = await page.evaluate(() => ({
        tokensVar: (() => {
          const cs = getComputedStyle(document.documentElement);
          return cs.getPropertyValue('--ds-color-bg') || cs.getPropertyValue('--ds-bg') || '(未取到)';
        })(),
        fontFaces: document.fonts ? document.fonts.size : -1,
      }));
    }

    // 截图留证
    const shot = path.join(OUT, `${t.id}.png`);
    rec.screenshot = await page.screenshot({ path: shot });

    // 1) + 2) 事件流判定（截图后取，避免漏掉懒加载请求）
    const events = await drain(page);
    const { bad, consoleErrors } = analyze(events);
    rec.checks.http4xx5xx = bad;
    rec.checks.consoleErrors = consoleErrors;
    rec.checks.zeroConsoleError = consoleErrors.length === 0;
    rec.checks.zero404 = bad.filter((b) => b.status === 404).length === 0;
    rec.checks.badRequests = bad.length;
  } catch (e) {
    rec.errors.push(String(e.message || e).slice(0, 300));
  } finally {
    if (page) {
      try { await page.close(); } catch { /* ignore */ }
    }
  }
  results.push(rec);
  const c = rec.checks;
  console.log(
    `${t.id.padEnd(26)} console=${c.zeroConsoleError === false ? 'FAIL' : 'ok'}` +
    ` 404=${c.zero404 === false ? 'FAIL' : 'ok'}` +
    ` hScroll(d/m)=${c.desktopNoHScroll}/${c.mobileNoHScroll}` +
    ` focus=${c.focus?.visibleRing ? 'ok' : 'no'}` +
    ` interact=${c.interaction?.stateChanged ? 'changed' : 'no-change'}` +
    ` err=${rec.errors.length}`
  );
}

const summary = {
  base: BASE,
  taskSpaceId: task.spaceId,
  ranAt: new Date().toISOString(),
  note: '通道：Ego 浏览器（用户指定）；每件作品独立标签页；证据：online-evidence/ego/',
  results,
};
await fs.writeFile(path.join(OUT, 'verify-online.json'), JSON.stringify(summary, null, 2) + '\n');
console.log('证据已写入：', path.join(OUT, 'verify-online.json'));

await task.finish({ keep: [] });
console.log('TaskSpace 已关闭：', task.spaceId);
