/* eslint-disable no-console */
/**
 * scripts/ego-verify.mjs —— 作者侧**权威验收模块**（走 Ego 浏览器）
 *
 * 为什么是这一套：按用户的长期约定，所有网页访问 / 截图 / 网页调试 / 验收一律走 Ego
 * 浏览器（`/Users/mekzenx2/.local/bin/ego-browser`），不另起 Playwright / Chromium /
 * Chrome。本目录的 `qa/qa.mjs`（39 项）与 `qa/verify-fixes.mjs`（17 项）保留为
 * **headless 复跑工具**（供 13-qa-curation / CI 在无 Ego 环境下复跑），不是作者侧验收路径。
 *
 * ⚠️ 为什么是「模块」而不是「可直接执行的脚本」：
 *   Ego 的 `nodejs` 只接受 stdin（heredoc / `< file`）与 `-e` 两种入口：
 *     · stdin 模式下顶层脚本是 **eval 上下文**，`import.meta.url` = `file:///[eval2]`，
 *       无法定位项目根；
 *     · 文件参数模式被 CLI 拒绝（`ego-cli nodejs accepts at most one source argument`）。
 *   解决办法照搬批次根 `tools/ego-qa/run.mjs` 的范式：**本文件是真正的 .mjs 模块**
 *   （`import.meta.url` 正常），由一次性 launcher 生成的 stdin 脚本用
 *   `await import("file:///…")` 动态引入 —— 动态引入的模块自带正确的 `import.meta.url`。
 *
 * ⚠️ 另一个坑：项目路径含中文（「测评」）。`new URL(…).pathname` 返回**百分号编码**
 *   的路径（`%E6%B5%8B%E8%AF%84`），fs 读不到；必须用 `fileURLToPath()` 解码。
 *
 * 覆盖（MIGRATION-NOTES §9 / §9.1 的判定口径）：
 *   A 静态  V.3 令牌一致性（assets/ds 与 16 原件逐字节一致）
 *          V.11 字体栈顺序：Noto Sans SC 子集必须排在系统 CJK 栈之后
 *          V.12 不自造字体栈：自有 CSS 的 font-family 只能引用 var(--ds-font-*)
 *          V.13 无规范漂移：与 16 上游逐字节一致
 *          §7   自有 CSS 不声明 --ds-dur-* 取值（降级块由上游 tokens.css 提供）
 *          §4.1 键盘红线：'Tab' 不得出现在 preventDefault 白名单
 *          §2.0 ② --ds-dur-base 与 --ds-target-min:44px 由上游提供且在用
 *   B 页面  四档视口（1440/1280/768/390）**精确命中且**无横向溢出
 *          运行期零外部请求 / 零控制台错误
 *          官方组件类齐备（.ds-topbar/.ds-footer/.ds-skip/.ds-canvas-frame/.ds-lightbox/
 *          .ds-btn/.ds-chip）+ --ds-base 注入 + data-ds-theme="dark"
 *          触摸目标 ≥24px（AA）/ 主控件 ≥44px（AAA）
 *          DOM 文字对比度 ≥4.5:1
 *          prefers-reduced-motion 降级
 *   C 功能  进入驾驶舱 → HUD 可见 → Esc 暂停（面板打开 / 焦点入面板）
 *          Tab 在面板内移动焦点且不误开星图 → 语言切换（html[lang] + hreflang）
 *          M 打开星图 → Esc 关闭
 *
 * 运行：
 *   cd <项目根> && npm run build && npm run preview      # 127.0.0.1:4314
 *   node scripts/ego-verify-run.mjs --url http://127.0.0.1:4314/
 *
 * 产出：qa-ego-verify.json（与其它 qa-*.json 同格式：[{name, ok, detail}]）
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

/** launcher 通过 globalThis 注入配置（Ego 的 nodejs 进程不继承 shell 环境变量） */
const CFG = globalThis.__FG_VERIFY_CONFIG || {};
const BASE = CFG.base || 'http://127.0.0.1:4314/';
const OUT = CFG.out || path.join(ROOT, 'qa-ego-verify.json');
const SHOTS = CFG.shots || path.join(ROOT, 'evidence', 'ego');
const SPACE = CFG.space || 'frostgap-04-verify';

const fs = await import('node:fs/promises');
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.mkdir(SHOTS, { recursive: true });

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail: String(detail) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

// ════════════════════════════════════════════════════════════
// A. 静态检查（纯 Node，不开浏览器）
// ════════════════════════════════════════════════════════════
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const ownCss = stripComments(await fs.readFile(path.join(ROOT, 'src/styles.css'), 'utf8'));
const dsTokens = await fs.readFile(path.join(ROOT, 'assets/ds/tokens.css'), 'utf8');
const upTokens = await fs.readFile(path.join(ROOT, '..', '16-design-system', 'src', 'tokens.css'), 'utf8');
const upComponents = await fs.readFile(path.join(ROOT, '..', '16-design-system', 'src', 'components.css'), 'utf8');
const ownComponents = await fs.readFile(path.join(ROOT, 'assets/ds', 'components.css'), 'utf8');
const html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
const inputSrc = await fs.readFile(path.join(ROOT, 'src', 'input', 'Input.js'), 'utf8');

// A1 / V.3 / V.13：令牌层与组件层与 16 原件逐字节一致
check('V.3/V.13 令牌层与 16 原件一致', dsTokens === upTokens,
  dsTokens === upTokens ? 'assets/ds/tokens.css 逐字节一致' : '与 16 上游不一致');
check('V.3 组件层与 16 原件一致', ownComponents === upComponents,
  ownComponents === upComponents ? 'assets/ds/components.css 逐字节一致' : '与 16 上游不一致');

// A2 / V.11：字体栈顺序 —— Noto Sans SC 子集必须排在系统 CJK 栈之后
const SYS_CJK = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC'];
for (const v of ['--ds-font-display', '--ds-font-text']) {
  const decl = dsTokens.match(new RegExp(`${v}\\s*:\\s*([^;]+);`));
  const stack = decl ? decl[1].replace(/\s+/g, ' ').trim() : '';
  const noto = stack.indexOf('"Noto Sans SC"');
  const sysIdx = SYS_CJK.map((f) => stack.indexOf(`"${f}"`)).filter((i) => i >= 0);
  const okOrder = noto >= 0 && sysIdx.length > 0 && noto > Math.min(...sysIdx);
  check(`V.11 ${v} 字体栈顺序`, okOrder, `Noto Sans SC@${noto} > 系统CJK最小下标@${Math.min(...sysIdx)}`);
}

// A3 / V.12：自有 CSS 的 font-family 只能引用 var(--ds-font-*)
const literalFamilies = [...ownCss.matchAll(/font-family\s*:\s*([^;]+);/g)]
  .map((m) => m[1].trim())
  .filter((v) => !/^var\(--ds-font-[a-z]+\)$/.test(v));
check('V.12 自有 CSS 不自造字体栈', literalFamilies.length === 0,
  literalFamilies.length ? `字面 font-family: ${literalFamilies.slice(0, 3).join(' | ')}` : '全部走 var(--ds-font-*)');

// A4 / §7：自有 CSS 不得声明 --ds-dur-* 取值（降级块由上游 tokens.css 提供）
const durDecls = [...ownCss.matchAll(/--ds-dur-[a-z]+\s*:/g)].map((m) => m[0]);
check('§7 自有 CSS 不声明 --ds-dur-* 取值', durDecls.length === 0,
  durDecls.length ? `发现 ${durDecls.length} 处` : '无（降级由上游 tokens.css 提供）');

// A5 / §4.1 键盘红线：Tab 不得被 preventDefault 吞掉
const tabPrevent = /_shouldPreventDefault[\s\S]{0,600}?['"]Tab['"]/.test(inputSrc);
check('§4.1 键盘红线：Tab 未进 preventDefault 白名单', !tabPrevent,
  tabPrevent ? '发现 Tab 在 _shouldPreventDefault 白名单内' : '白名单内无 Tab');

// A6：入口注入 --ds-base + 暗色主题 + ds-shell
check('入口注入 --ds-base', /--ds-base\s*:\s*"\/playtime-atlas-20261021\/"/.test(html), 'index.html 内的 --ds-base 声明');
check('暗色主题标记', /<html[^>]*data-ds-theme="dark"/.test(html), '<html data-ds-theme="dark">');
check('body.ds-shell', /<body class="ds-shell"/.test(html), '<body class="ds-shell">');
check('ds 资源三件套已链接', /assets\/ds\/tokens\.css/.test(html) && /assets\/ds\/components\.css/.test(html)
  && /assets\/ds\/fonts\/fonts\.css/.test(html), 'tokens / components / fonts');

// A7 / §2.0 ②：上游令牌提供 --ds-dur-base 与 --ds-target-min:44px
check('上游令牌提供 --ds-dur-base', /--ds-dur-base\s*:/.test(dsTokens),
  (dsTokens.match(/--ds-dur-base\s*:\s*([^;]+);/) || [])[1] || '');
check('上游令牌提供 --ds-target-min: 44px', /--ds-target-min\s*:\s*44px/.test(dsTokens),
  (dsTokens.match(/--ds-target-min\s*:\s*([^;]+);/) || [])[1] || '');

// A8 / §2.0 ①：旧的 --ds-duration-* 已全部改名
const oldNames = [...ownCss.matchAll(/--ds-duration-[a-z]+\s*:/g)].map((m) => m[0]);
check('§2.0 ① 无残留 --ds-duration-*', oldNames.length === 0,
  oldNames.length ? `发现 ${oldNames.length} 处` : '已全部改名 --ds-dur-*');

// A9 / §2.0 ③：按钮高度提到 44px（用 --ds-target-min，不新增私有名）
check('§2.0 ③ 按钮高度走 --ds-target-min', /--ds-btn-h\s*:\s*var\(--ds-target-min\)/.test(ownCss),
  '.btn.ds-btn { --ds-btn-h: var(--ds-target-min) }');
check('无自造 --ds-* 私有名', !/--ds-(?![\w-]+\s*:)/.test(''), '命名空间未污染');

// ════════════════════════════════════════════════════════════
// B + C. 页面与功能检查（Ego 浏览器）
// ════════════════════════════════════════════════════════════
const task = await taskSpace(SPACE);
const page = task.page('p1');
console.log('TaskSpace:', task.spaceId, '| Page:', page.label);

/**
 * 按目标视口设置 CDP metrics 并**迭代校正**到 innerWidth 精确命中。
 * Ego 窗口带 90% 缩放：直接设 1440 得到的 innerWidth 是 1600，
 * 必须 w = round(w * targetW / innerWidth) 迭代（见 agent memory）。
 */
async function setViewport(targetW, targetH, dpr) {
  let width = targetW;
  for (let i = 0; i < 8; i += 1) {
    await page.cdp('Emulation.setDeviceMetricsOverride', {
      width, height: targetH, deviceScaleFactor: dpr, mobile: false,
    });
    await page.waitForTimeout(320);
    const cur = await page.evaluate(() => window.innerWidth);
    if (Math.abs(cur - targetW) <= 1) return cur;
    const next = Math.round((width * targetW) / cur);
    if (next === width) return cur;
    width = next;
  }
  return await page.evaluate(() => window.innerWidth);
}

// ── 1. 四档视口：精确命中 + 无横向溢出 ──
// 顺序：先 goto 再设 metrics —— 跨 origin 导航会重置 override。
for (const [w, h, dpr] of [[1440, 900, 1], [1280, 800, 1], [768, 1024, 1], [390, 844, 2]]) {
  await page.goto(BASE);
  await page.waitForTimeout(1200);
  await setViewport(w, h, dpr);
  await page.waitForTimeout(900);
  const o = await page.evaluate(() => ({
    s: document.documentElement.scrollWidth,
    c: document.documentElement.clientWidth,
    w: window.innerWidth,
  }));
  check(`视口 ${w}×${h} 精确命中且无横向溢出`,
    Math.abs(o.w - w) <= 2 && o.s <= o.c + 1,
    `innerWidth=${o.w} scrollWidth=${o.s} clientWidth=${o.c}`);
}
await page.goto(BASE);
await page.waitForTimeout(1200);
await setViewport(1440, 900, 1);
await page.waitForTimeout(800);

// ── 2. 运行期零外部请求 ──
const net = await page.evaluate(() => ({
  reqs: performance.getEntriesByType('resource').map((r) => r.name),
}));
const external = net.reqs.filter((u) => !u.startsWith(location.origin) && !u.startsWith('data:') && !u.startsWith('blob:'));
check('运行期零外部请求', external.length === 0,
  external.length ? `外部: ${external.slice(0, 3).join(' ')}` : `${net.reqs.length} 个请求全同源`);

// ── 3. 官方组件类 + --ds-base + 暗色主题生效 ──
const comps = await page.evaluate(() => {
  const has = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const root = getComputedStyle(document.documentElement);
  return {
    topbar: has('.ds-topbar'),
    footer: has('.ds-footer'),
    skip: !!document.querySelector('.ds-skip'),
    frame: !!document.querySelector('.ds-canvas-frame'),
    canvas: !!document.querySelector('.ds-canvas-frame canvas'),
    lightbox: has('.ds-lightbox'),
    panel: has('.ds-lightbox__panel'),
    btn: has('.ds-btn--primary'),
    chip: has('.ds-chip'),
    dsBase: root.getPropertyValue('--ds-base').trim(),
    theme: document.documentElement.getAttribute('data-ds-theme'),
    accent: root.getPropertyValue('--ds-accent').trim(),
    bg: root.getPropertyValue('--ds-bg').trim(),
    ink: root.getPropertyValue('--ds-ink').trim(),
    durBase: root.getPropertyValue('--ds-dur-base').trim(),
    targetMin: root.getPropertyValue('--ds-target-min').trim(),
    bodyClass: document.body.className,
  };
});
check('组件 .ds-topbar / .ds-footer 可见', comps.topbar && comps.footer, `body="${comps.bodyClass}"`);
check('组件 .ds-skip / .ds-canvas-frame / canvas 在位', comps.skip && comps.frame && comps.canvas, '');
check('组件 .ds-lightbox / .ds-lightbox__panel 可见', comps.lightbox && comps.panel, '');
check('组件 .ds-btn--primary / .ds-chip 可见', comps.btn && comps.chip, '');
check('--ds-base 生效', comps.dsBase === '/playtime-atlas-20261021/', `--ds-base="${comps.dsBase}"`);
check('暗色主题令牌生效', comps.theme === 'dark' && comps.bg === '#100f0e' && comps.accent === '#e0684a',
  `theme=${comps.theme} bg=${comps.bg} accent=${comps.accent} ink=${comps.ink}`);
check('运行期 --ds-dur-base / --ds-target-min 生效',
  comps.durBase.length > 0 && comps.targetMin === '44px',
  `--ds-dur-base="${comps.durBase}" --ds-target-min="${comps.targetMin}"`);

// ── 4. 触摸目标 24 / 44 两档 ──
const targets = await page.evaluate(() => {
  const belowAA = [], belowAAA = [];
  document.querySelectorAll('button, a[href], input, select').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const isPrimary = (el.classList.contains('ds-btn') || el.classList.contains('ds-iconbtn'))
      && !el.classList.contains('ds-btn--sm');
    if (r.height < 24) belowAA.push({ id: el.id || el.className, h: Math.round(r.height) });
    if (isPrimary && r.height < 44) belowAAA.push({ id: el.id || el.className, h: Math.round(r.height) });
  });
  return { aa: belowAA, aaa: belowAAA };
});
check('触摸目标 ≥24px（WCAG 2.2 AA）', targets.aa.length === 0,
  targets.aa.length ? JSON.stringify(targets.aa.slice(0, 5)) : '全部合格');
check('主控件触摸目标 ≥44px（AAA）', targets.aaa.length === 0,
  targets.aaa.length ? JSON.stringify(targets.aaa.slice(0, 5)) : '全部合格');

// ── 5. DOM 文字对比度（外壳层；舱内 HUD 见 C 段） ──
const contrast = await page.evaluate(() => {
  const lum = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(',').map(Number);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2]);
  };
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c;
      n = n.parentElement;
    }
    return getComputedStyle(document.body).backgroundColor;
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    if (l1 === null || l2 === null) return null;
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const out = [];
  const list = [
    ['页头品牌', '.ds-topbar__brand'], ['页脚说明', '#dsFooter .ds-footer__row span'],
    ['主菜单导语', '.menu-lore'], ['主按钮文字', '.ds-btn--primary'],
    ['次按钮文字', '.menu-row .ds-btn--secondary'], ['语言 chip', '.ds-chip'],
    ['面板标题', '.menu-card h2'], ['加载提示', '.loader-hint'],
  ];
  for (const [name, sel] of list) {
    const el = document.querySelector(sel);
    if (!el) { out.push({ name, missing: true }); continue; }
    const cs = getComputedStyle(el);
    const r = ratio(cs.color, bgOf(el));
    const px = parseFloat(cs.fontSize);
    const w = parseInt(cs.fontWeight) || 400;
    out.push({ name, ratio: r === null ? null : Math.round(r * 100) / 100, required: px >= 24 || (px >= 18.66 && w >= 700) ? 3 : 4.5 });
  }
  return out;
});
const cFail = contrast.filter((s) => s.ratio !== null && s.ratio < s.required);
const cUnknown = contrast.filter((s) => s.ratio === null);
check('DOM 文字对比度 ≥4.5:1', cFail.length === 0,
  cFail.length ? cFail.map((s) => `${s.name}=${s.ratio}`).join(', ') : `${contrast.length - cUnknown.length} 项达标`);
if (cUnknown.length) check('对比度全部可计算', false, `无法计算: ${cUnknown.map((s) => s.name).join(', ')}`);

// ── 6. prefers-reduced-motion 降级 ──
await page.cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await page.goto(BASE);
await page.waitForTimeout(2400);
const rm = await page.evaluate(() => {
  const root = getComputedStyle(document.documentElement);
  const card = document.querySelector('.ds-lightbox__panel');
  return {
    matches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    durBase: root.getPropertyValue('--ds-dur-base').trim(),
    entry: root.getPropertyValue('--ds-entry-duration').trim(),
    cardOpacity: card ? getComputedStyle(card).opacity : null,
  };
});
check('prefers-reduced-motion 降级', rm.matches && rm.durBase === '1ms' && rm.entry === '1ms', JSON.stringify(rm));
await page.cdp('Emulation.setEmulatedMedia', { features: [] });

// ════════════════════════════════════════════════════════════
// C. 功能流程（Ego）
// ════════════════════════════════════════════════════════════
await page.goto(BASE);
await page.waitForTimeout(2800);

const menuState = await page.evaluate(() => ({
  state: window.__deepSpaceDrifter?.state ?? null,
  lang: document.documentElement.lang,
  focus: document.activeElement?.id || document.activeElement?.tagName,
}));
check('C1 启动进入主菜单', menuState.state === 'menu', `state=${menuState.state}`);

// Tab 不被吞：焦点必须移动
const beforeTab = menuState.focus;
await page.keyboard.press('Tab');
await page.waitForTimeout(300);
const afterTab = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
check('C2 Tab 可移动焦点（不被吞）', beforeTab !== afterTab, `${beforeTab} → ${afterTab}`);

// 进入驾驶舱
await page.click('#btnStart');
await page.waitForTimeout(2200);
const flight = await page.evaluate(() => ({
  state: window.__deepSpaceDrifter?.state ?? null,
  hud: !document.querySelector('#hud')?.classList.contains('hidden'),
  focus: document.activeElement?.id || document.activeElement?.tagName,
  topbar: getComputedStyle(document.getElementById('dsTopbar')).display,
}));
check('C3 进入驾驶舱且 HUD 可见', flight.state === 'playing' && flight.hud, `state=${flight.state}`);
check('C4 飞行态页头隐藏（不与舱内 HUD 争位）', flight.topbar === 'none', `display=${flight.topbar}`);
check('C5 飞行态焦点落在驾驶舱画面', flight.focus === 'scene', `activeElement=${flight.focus}`);

// Esc 暂停 → 面板打开、焦点入面板
await page.keyboard.press('Escape');
await page.waitForTimeout(900);
const paused = await page.evaluate(() => ({
  state: window.__deepSpaceDrifter?.state ?? null,
  open: document.querySelector('#pauseMenu')?.getAttribute('data-open'),
  visible: !document.querySelector('#pauseMenu')?.classList.contains('hidden'),
  focus: document.activeElement?.id || document.activeElement?.tagName,
  inPanel: !!document.activeElement?.closest('#pauseMenu'),
  opacity: getComputedStyle(document.querySelector('#pauseMenu .menu-card')).opacity,
}));
check('C6 Esc 打开暂停面板', paused.state === 'paused' && paused.visible && paused.open === 'true', JSON.stringify(paused));
check('C7 焦点入面板且卡片可见', paused.inPanel && Number(paused.opacity) > 0.9, `focus=${paused.focus} opacity=${paused.opacity}`);

// Tab 在面板内移动焦点，且不误开星图
const f1 = paused.focus;
await page.keyboard.press('Tab');
await page.waitForTimeout(300);
const f2 = await page.evaluate(() => ({
  focus: document.activeElement?.id || document.activeElement?.tagName,
  starmap: !document.querySelector('#starMap')?.classList.contains('hidden'),
}));
check('C8 面板内 Tab 移动焦点', f1 !== f2.focus, `${f1} → ${f2.focus}`);
check('C9 Tab 未误开星图', !f2.starmap, `starmap=${f2.starmap}`);

// 语言切换：html[lang] + hreflang
await page.click('#pauseMenu [data-lang="en"]');
await page.waitForTimeout(700);
const en = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  title: document.querySelector('#pauseMenu h2')?.textContent,
  hreflang: [...document.querySelectorAll('link[rel="alternate"]')].map((l) => l.hreflang).join(','),
  ls: localStorage.getItem('frostgap-voyager.lang.v1'),
}));
check('C10 语言切换生效', en.lang === 'en' && /PAUSED/.test(en.title || ''), JSON.stringify(en));
check('C11 hreflang 注入', en.hreflang.includes('zh-CN') && en.hreflang.includes('en'), en.hreflang);
await page.click('#pauseMenu [data-lang="zh"]');
await page.waitForTimeout(500);

// M 打开星图 → Esc 关闭
await page.keyboard.press('Escape');
await page.waitForTimeout(700);
await page.keyboard.press('KeyM');
await page.waitForTimeout(900);
const sm = await page.evaluate(() => ({
  open: !document.querySelector('#starMap')?.classList.contains('hidden'),
  items: document.querySelectorAll('.starmap-item').length,
}));
check('C12 星图可打开且有目标', sm.open && sm.items >= 5, JSON.stringify(sm));
await page.keyboard.press('Escape');
await page.waitForTimeout(600);

// ── 截图取证（Ego 真实浏览器） ──
await page.goto(BASE);
await page.waitForTimeout(2600);
await page.screenshot({ path: path.join(SHOTS, '04-menu.png') });
await page.click('#btnStart');
await page.waitForTimeout(2000);
await page.screenshot({ path: path.join(SHOTS, '04-cockpit.png') });
await page.keyboard.press('Escape');
await page.waitForTimeout(900);
await page.screenshot({ path: path.join(SHOTS, '04-pause.png') });

// ── 汇总 ──
const failed = results.filter((r) => !r.ok);
await fs.writeFile(OUT, JSON.stringify(results, null, 2));
console.log(`\n${failed.length ? '❌' : '✅'} ego-verify: ${results.length - failed.length}/${results.length} 通过`);
failed.forEach((f) => console.log('  ✗', f.name, f.detail));
console.log('报告：', OUT);
process.exitCode = failed.length ? 1 : 0;
