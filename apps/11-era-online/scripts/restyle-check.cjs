/**
 * restyle-check.cjs — 改版接入自检（对齐 16-design-system/tools/verify-preview.mjs 的检查口径）
 *
 * 检查项：
 *   1. 四档视口（1440 / 1280 / 768 / 390）无横向溢出
 *   2. ds 资源在子路径下全部可取（tokens / components / fonts）
 *   3. .ds-topbar / .ds-footer / .ds-skip / .ds-canvas-frame 到位
 *   4. --ds-base 注入生效
 *   5. 焦点环可见、Tab 序列不被吞
 *   6. reduced-motion 下动效归零
 *   7. 三条诚实声明（本地单机 / AI 非真人 / 无联网）在改版后**仍清晰可见**
 *   8. 主要控件触摸目标 ≥ 24px
 *   9. 运行期零外部请求
 *
 * 用法：需先 npm run build 并在 4331 提供 dist/，然后
 *   cp scripts/restyle-check.cjs /tmp/linkdawn-qa/ && cd /tmp/linkdawn-qa && node restyle-check.cjs
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.QA_BASE || 'http://127.0.0.1:4331/';
const SHOTS = process.env.QA_SHOTS || path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ── 1. 四档视口无横向溢出 ──
  for (const [w, h] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    const page = await ctx.newPage();
    const external = [];
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith(BASE) && !u.startsWith('data:') && !u.startsWith('blob:')) external.push(u);
    });
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
    await page.waitForTimeout(900);
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      return { scrollW: de.scrollWidth, clientW: de.clientWidth };
    });
    check(`视口 ${w} 无横向溢出`, m.scrollW <= m.clientW + 2, `scrollWidth ${m.scrollW} / clientWidth ${m.clientW}`);
    if (w === 1440) {
      check('运行期零外部请求（无 CDN / 外链字体）', external.length === 0, external.slice(0, 3).join(' | ') || '0 条');
    }
    await ctx.close();
  }

  // ── 2. ds 资源可达（子路径口径） ──
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  const assetStatus = await page.evaluate(async () => {
    const urls = [
      './assets/ds/tokens.css',
      './assets/ds/components.css',
      './assets/ds/fonts/fonts.css',
      './assets/ds/fonts/inter-latin.woff2',
      './assets/ds/fonts/space-grotesk-latin.woff2',
    ];
    const out = [];
    for (const u of urls) {
      const res = await fetch(u, { method: 'GET' });
      out.push(`${u} ${res.status}`);
    }
    return out;
  });
  check(
    'ds 资源全部可达（tokens / components / fonts）',
    assetStatus.every((s) => s.endsWith(' 200')),
    assetStatus.join(' | '),
  );

  // ── 3. 组件类到位 ──
  const comps = await page.evaluate(() => ({
    topbar: !!document.querySelector('.ds-topbar'),
    topbarSticky: (() => {
      const t = document.querySelector('.ds-topbar');
      return t ? getComputedStyle(t).position === 'sticky' : false;
    })(),
    footer: !!document.querySelector('.ds-footer'),
    skip: !!document.querySelector('.ds-skip'),
    skipFirst: document.querySelector('.ds-skip') === document.querySelector('a[href]'),
    canvasFrame: !!document.querySelector('.ds-canvas-frame'),
    bodyShell: document.body.classList.contains('ds-shell'),
    dsBase: getComputedStyle(document.documentElement).getPropertyValue('--ds-base').trim(),
    navCurrent: document.querySelectorAll('.ds-topbar__link[aria-current="page"]').length,
  }));
  check('.ds-topbar 存在且 sticky', comps.topbar && comps.topbarSticky, `sticky=${comps.topbarSticky}`);
  check('.ds-footer 存在', comps.footer);
  check('.ds-skip 是首个可聚焦元素', comps.skip && comps.skipFirst);
  check('.ds-canvas-frame 包裹游戏画布', comps.canvasFrame);
  check('body 带 ds-shell', comps.bodyShell);
  check('--ds-base 已注入', comps.dsBase.replace(/^["']|["']$/g, '') === '/playtime-atlas-20261021/', comps.dsBase);
  check('导航当前项用 aria-current="page" 标注', comps.navCurrent === 1, `${comps.navCurrent} 项`);

  // ── 4. 焦点环 + Tab 序列不被吞 ──
  await page.keyboard.press('Tab');
  const focusState = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { ok: false, reason: '焦点仍在 body（Tab 被吞）' };
    const cs = getComputedStyle(el);
    const ring = cs.boxShadow && cs.boxShadow !== 'none';
    const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
    return { ok: ring || outline, tag: el.tagName, cls: el.className, ring, outline };
  });
  check('Tab 后焦点落在可聚焦元素（未被吞）', focusState.ok, focusState.reason || `${focusState.tag}.${focusState.cls}`);
  check('焦点环可见（box-shadow 或 outline）', !!focusState.ring || !!focusState.outline, `shadow=${focusState.ring} outline=${focusState.outline}`);

  // ── 5. 三条诚实声明改版后仍清晰可见 ──
  const honesty = await page.evaluate(() => {
    const notice = document.querySelector('.notice__body');
    const badge = document.querySelector('.badge--ai');
    const vis = (n) => {
      if (!n) return { ok: false, text: '' };
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      const visible = cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.1 && r.width > 0 && r.height > 0;
      return { ok: visible, text: (n.textContent || '').trim().slice(0, 60), size: cs.fontSize, color: cs.color };
    };
    return { notice: vis(notice), badge: vis(badge) };
  });
  check('「本地单机」声明可见', honesty.notice.ok && /联网/.test(honesty.notice.text), `${honesty.notice.text} (${honesty.notice.size})`);
  check('AI「非真人 / 无联网」徽标可见', honesty.badge.ok && /非真人/.test(honesty.badge.text) && /无联网/.test(honesty.badge.text), `${honesty.badge.text} (${honesty.badge.size})`);

  // ── 6. 主要控件触摸目标 ──
  const small = await page.evaluate(() => {
    const sel = ['.ds-topbar__link', '.btn', '.tab', '.ds-skip'];
    const bad = [];
    for (const s of sel) {
      document.querySelectorAll(s).forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.width > 0 && r.height > 0 && (r.height < 24 || r.width < 24)) bad.push(`${s} ${Math.round(r.width)}×${Math.round(r.height)}`);
      });
    }
    return bad;
  });
  check('主要控件触摸目标 ≥ 24px', small.length === 0, small.slice(0, 5).join(' | ') || '全部达标');

  // 取景前移除焦点态（跳转链接聚焦时会盖住顶栏品牌）
  await page.evaluate(() => {
    if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '10-restyle-desktop.png') });
  await ctx.close();

  // ── 7. reduced-motion 降级 ──
  const rmCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rm = await rmCtx.newPage();
  await rm.goto(BASE, { waitUntil: 'domcontentloaded' });
  await rm.waitForTimeout(600);
  const rmState = await rm.evaluate(() => {
    const dur = getComputedStyle(document.querySelector('.btn')).transitionDuration;
    const scroll = getComputedStyle(document.documentElement).scrollBehavior;
    return { dur, scroll };
  });
  check('reduced-motion 下过渡归 1ms', /0\.001s|1ms/.test(rmState.dur), rmState.dur);
  check('reduced-motion 下 scroll-behavior 为 auto', rmState.scroll === 'auto', rmState.scroll);
  await rmCtx.close();

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n===== 改版自检：${results.length - failed.length}/${results.length} 通过 =====`);
  if (failed.length) for (const f of failed) console.log('  - ' + f.name + (f.detail ? ' :: ' + f.detail : ''));
  fs.writeFileSync(path.join(__dirname, '..', 'qa-restyle.json'), JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('脚本异常：', e);
  process.exit(2);
});
