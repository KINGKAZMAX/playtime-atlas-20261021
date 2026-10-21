/**
 * ego-verify.mjs — 作者侧**权威验收脚本**（走 Ego 浏览器）
 *
 * 为什么是这一套：按用户的长期约定，所有网页访问 / 截图 / 网页调试 / 验收一律走 Ego 浏览器
 * （`/Users/mekzenx2/.local/bin/ego-browser`），不另起 Playwright / Chromium / Chrome。
 * 仓库里的 `scripts/{acceptance,spotcheck-6,restyle-check,ds-conformance}.cjs` 保留为
 * **headless 复跑工具**（供 13-qa-curation / CI 在无 Ego 环境下复跑），不是作者侧验收路径。
 *
 * 覆盖：
 *   静态  V.3 令牌一致性 / V.11 字体栈顺序 / V.12 不自造字体栈 / V.13 无规范漂移
 *         §7  reduced-motion 降级写法 + 自有 CSS 不声明 --ds-dur-*
 *         与 16 上游逐字节一致
 *   页面  四档视口无溢出 / ds 资源 200 / 官方组件类 / --ds-base / aria-current
 *         焦点环 + Tab 不被吞 / 三条诚实声明 / 触摸目标 24px + 44px
 *         §4.2 HUD DOM 文字对比度 ≥4.5:1（canvas 内豁免，两个展项各一遍）
 *         V.11b 渲染层证据：汉字不混排
 *         reduced-motion 生效 / 运行期零外部请求 / 两个展项可切换
 *   功能  展项 A 纯键盘建造 + U 升级；展项 B 对话说话人 / 来源角标 / 年份 / https 外链
 *
 * 运行：
 *   cd <项目根>/dist && python3 -m http.server 4331 --bind 127.0.0.1 &
 *   ego-browser nodejs <本文件绝对路径>
 *
 * 产出：qa-ego-verify.json（与其它 qa-*.json 同格式：[{name, ok, detail}]）
 */

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const DS = ROOT.replace(/\/11-era-online$/, '/16-design-system');
const BASE = 'http://127.0.0.1:4331/';
const OUT = `${ROOT}/qa-ego-verify.json`;

const fs = await import('node:fs/promises');

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: !!ok, detail: String(detail) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

// ════════════════════════════════════════════════════════════
// A. 静态检查（纯 Node，不开浏览器）
// ════════════════════════════════════════════════════════════
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

function blockDecls(css, selector) {
  const out = {};
  let from = 0;
  for (;;) {
    const at = css.indexOf(selector, from);
    if (at < 0) break;
    from = at + selector.length;
    const after = css.slice(from).match(/^\s*\{/);
    if (!after) continue;
    const open = from + after[0].length - 1;
    let depth = 0, i = open;
    for (; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') { depth--; if (depth === 0) break; }
    }
    for (const d of css.slice(open + 1, i).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      if (!(d[1] in out)) out[d[1]] = d[2].replace(/\s+/g, ' ').trim();
    }
  }
  return out;
}

function mediaDecls(css, condition) {
  const out = {};
  const idx = css.indexOf(condition);
  if (idx < 0) return out;
  const start = css.indexOf('{', idx);
  let depth = 0, i = start;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') { depth--; if (depth === 0) break; }
  }
  for (const d of css.slice(start + 1, i).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    out[d[1]] = d[2].replace(/\s+/g, ' ').trim();
  }
  return out;
}

const famList = (s) => (s.match(/["'][^"']+["']/g) || []).map((x) => x.replace(/["']/g, '').trim());
const SYS_CJK = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC'];

const tokensCss = stripComments(await fs.readFile(`${ROOT}/public/assets/ds/tokens.css`, 'utf8'));
const upstreamCss = stripComments(await fs.readFile(`${DS}/src/tokens.css`, 'utf8'));
const dt = JSON.parse(await fs.readFile(`${DS}/design-tokens.json`, 'utf8'));

check('ds 令牌层与 16 上游逐字节一致', tokensCss === upstreamCss, tokensCss === upstreamCss ? 'tokens.css 一致' : 'tokens.css 不一致');

const rootDecls = blockDecls(tokensCss, ':root');
const darkDecls = blockDecls(tokensCss, '[data-ds-theme="dark"]');

// V.3
const camel2kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const v3miss = [], v3diff = [];
for (const [k, v] of Object.entries(dt.color.dark)) {
  if (k.startsWith('$') || !v || typeof v !== 'object') continue;
  const name = `--ds-${camel2kebab(k)}`;
  const got = darkDecls[name] ?? rootDecls[name];
  if (got === undefined) { v3miss.push(name); continue; }
  if (String(got).replace(/["']/g, '').trim().toLowerCase() !== String(v.$value).replace(/["']/g, '').trim().toLowerCase()) {
    v3diff.push(`${name}: ${got} != ${v.$value}`);
  }
}
check('V.3 令牌一致性（深色主题 --ds-* == design-tokens.json）', !v3miss.length && !v3diff.length,
  v3miss.length ? `缺失 ${v3miss.length} 个：${v3miss.slice(0, 4).join(',')}` : v3diff.length ? v3diff.slice(0, 3).join(' | ') : '全部一致');

// V.11
const v11 = [];
for (const v of ['--ds-font-display', '--ds-font-text']) {
  const stack = rootDecls[v] || '';
  const fams = famList(stack);
  const noto = fams.indexOf('Noto Sans SC');
  const sys = SYS_CJK.map((f) => fams.indexOf(f)).filter((i) => i >= 0);
  if (noto < 0) { v11.push(`${v} 缺少 "Noto Sans SC" 子集`); continue; }
  if (!sys.length) { v11.push(`${v} 未声明任何系统 CJK 族`); continue; }
  if (noto < Math.min(...sys)) v11.push(`${v} 的 Noto Sans SC 排在系统 CJK 族之前`);
}
check('V.11 字体栈顺序（系统 CJK 族在前、Noto 子集在后）', !v11.length, v11.join(' | ') || 'display / text 均合规');

// V.12
const styleDir = `${ROOT}/src/styles`;
const ownFiles = (await fs.readdir(styleDir)).filter((f) => f.endsWith('.css'));
const v12 = [];
for (const f of ownFiles) {
  const txt = await fs.readFile(`${styleDir}/${f}`, 'utf8');
  for (const m of txt.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    if (/["'][^"']+["']/.test(m[1].trim())) v12.push(`${f}: ${m[1].trim().slice(0, 60)}`);
  }
}
check('V.12 自有 CSS 不自造字体栈（只引用 var(--ds-font-*)）', !v12.length, v12.slice(0, 3).join(' | ') || `${ownFiles.length} 个自有 CSS 文件全部合规`);

// V.13
const v13 = [];
for (const [cssName, jsonName] of [['--ds-font-display', 'display'], ['--ds-font-text', 'text'], ['--ds-font-mono', 'mono']]) {
  const a = famList(rootDecls[cssName] || '').map((s) => s.replace(/["']/g, '').trim());
  const b = famList(dt.typography.family[jsonName].$value).map((s) => s.replace(/["']/g, '').trim());
  if (JSON.stringify(a) !== JSON.stringify(b)) v13.push(`${cssName} 序列漂移`);
}
check('V.13 无规范漂移（字体族序列逐项相等含顺序）', !v13.length, v13.join(' | ') || 'display / text / mono 三项序列完全一致');

// §7
const rmDecls = mediaDecls(tokensCss, '@media (prefers-reduced-motion: reduce)');
const durVars = Object.keys(rootDecls).filter((k) => k.startsWith('--ds-dur-') || k === '--ds-entry-duration');
const rootIs1ms = durVars.filter((v) => /1ms/.test(rootDecls[v]));
const rmAll1ms = durVars.filter((v) => !/1ms/.test(rmDecls[v] || ''));
check('§7 reduced-motion 降级写在 @media 块内（:root 不含 1ms）', !rootIs1ms.length && !rmAll1ms.length && durVars.length > 0,
  rootIs1ms.length ? `:root 中被误写为 1ms：${rootIs1ms.join(',')}` : rmAll1ms.length ? `reduce 块内缺少：${rmAll1ms.join(',')}` : `${durVars.length} 个时长变量：:root 为真实值、reduce 块内归 1ms`);

const ownDeclDur = [];
for (const f of ownFiles) {
  const txt = await fs.readFile(`${styleDir}/${f}`, 'utf8');
  for (const m of txt.matchAll(/(--ds-dur-[\w-]+|--ds-entry-duration)\s*:/g)) ownDeclDur.push(`${f}: ${m[1]}`);
}
check('自有 CSS 不声明 --ds-dur-*（不覆盖降级逻辑）', !ownDeclDur.length, ownDeclDur.slice(0, 3).join(' | ') || '仅消费，不声明');

// ════════════════════════════════════════════════════════════
// B. 页面检查（Ego 浏览器）
// ════════════════════════════════════════════════════════════
const task = await taskSpace('linkdawn-era-online-verify');
const page = task.page('p1');

const setViewport = async (w, h) => {
  await page.cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
  await page.waitForTimeout(250);
};

const AUDIT = `(() => {
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null;
    const p = m[1].split(/[\\s,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (fg, bg) => ({ r: fg.r*fg.a + bg.r*(1-fg.a), g: fg.g*fg.a + bg.g*(1-fg.a), b: fg.b*fg.a + bg.b*(1-fg.a), a: 1 });
  const lum = (c) => { const f = (v) => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(c.r) + 0.7152*f(c.g) + 0.0722*f(c.b); };
  const ratio = (a,b) => { const l1=lum(a), l2=lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
  const effBg = (el) => { let n = el;
    while (n && n !== document.documentElement) { const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.05) return c; n = n.parentElement; }
    return { r:16, g:15, b:14, a:1 }; };
  const bad = []; let count = 0;
  for (const root of document.querySelectorAll('.game--defense, .pocket')) {
    root.querySelectorAll('*').forEach((el) => {
      if (el.children.length !== 0) return;
      if (el.closest('canvas')) return;
      const txt = (el.textContent || '').trim(); if (!txt) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.15) return;
      const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) return;
      const fg0 = parse(cs.color); if (!fg0) return;
      const bg = effBg(el); const fg = fg0.a < 1 ? over(fg0, bg) : fg0;
      const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight, 10) >= 700;
      const need = (size >= 24 || (size >= 19 && bold)) ? 3 : 4.5;
      const cr = ratio(fg, bg); count++;
      if (cr < need) bad.push({ sel: el.className || el.tagName, text: txt.slice(0,24), cr: Math.round(cr*100)/100, need, fg: cs.color });
    });
  }
  return { bad, count };
})()`;

const TARGETS = `(() => {
  const sel = 'a[href], button, input, select, textarea, [role="button"], .ds-btn, .ds-iconbtn, .ds-topbar__link, .tab, .chipbtn, .btn, .src, .chip';
  const seen = new Set(); const bad24 = []; const bad44 = [];
  for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0) continue;
    const cls = typeof el.className === 'string' ? el.className : '';
    const key = cls + '|' + (el.textContent || '').trim().slice(0, 12);
    if (seen.has(key)) continue; seen.add(key);
    const label = cls + ' "' + (el.textContent || '').trim().slice(0,12) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height);
    if (r.height < 24 || r.width < 24) bad24.push(label);
    const isPrimary = (cls.includes('ds-btn') || cls.includes('ds-iconbtn')) && !cls.includes('ds-btn--sm');
    if (isPrimary && (r.height < 44 || r.width < 44)) bad44.push(label);
  }
  return { bad24, bad44, total: seen.size };
})()`;

const MIX = `(() => {
  const ink = (font, ch) => {
    const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48;
    const c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0,0,48,48);
    c.fillStyle = '#000'; c.font = font; c.textBaseline = 'top'; c.fillText(ch, 4, 4);
    const d = c.getImageData(0,0,48,48).data; let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] < 128) n++;
    return n;
  };
  const stack = getComputedStyle(document.body).fontFamily;
  const text = (document.body.innerText || '').replace(/\\s+/g, '');
  const chars = [...new Set(text.split(''))].filter(c => /[\\u3000-\\u9fff\\uff00-\\uffef]/.test(c));
  let sys = 0, noto = 0, other = 0, sample = [];
  for (const ch of chars) {
    const real = ink('32px ' + stack, ch);
    const s = ink('32px "PingFang SC", sans-serif', ch);
    const n = ink('32px "Noto Sans SC", sans-serif', ch);
    if (Math.abs(real - s) <= Math.abs(real - n)) sys++;
    else if (Math.abs(real - n) <= Math.abs(real - s)) { noto++; if (sample.length < 6) sample.push(ch); }
    else other++;
  }
  return { total: chars.length, sys, noto, other, sample };
})()`;

// ── 1. 四档视口无横向溢出 ──
await setViewport(1440, 900);
await page.goto(BASE);
await page.waitForTimeout(1200);

for (const [w, h] of [[1440, 900], [1280, 800], [768, 1024], [390, 844]]) {
  await setViewport(w, h);
  await page.waitForTimeout(350);
  const m = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
  check(`视口 ${w} 无横向溢出`, m.s <= m.c + 2, `scrollWidth ${m.s} / clientWidth ${m.c}`);
}
await setViewport(1440, 900);
await page.waitForTimeout(300);

// ── 2. 运行期零外部请求 ──
const extReq = await page.evaluate(() =>
  performance.getEntriesByType('resource').map((e) => e.name).filter((u) => !u.startsWith(location.origin) && !u.startsWith('data:') && !u.startsWith('blob:')));
check('运行期零外部请求（无 CDN / 外链字体）', extReq.length === 0, extReq.slice(0, 3).join(' | ') || '0 条');

// ── 3. ds 资源可达 ──
const assets = await page.evaluate(async () => {
  const urls = ['./assets/ds/tokens.css', './assets/ds/components.css', './assets/ds/fonts/fonts.css',
    './assets/ds/fonts/inter-latin.woff2', './assets/ds/fonts/space-grotesk-latin.woff2'];
  const out = [];
  for (const u of urls) { const r = await fetch(u, { method: 'GET' }); out.push(u + ' ' + r.status); }
  return out;
});
check('ds 资源全部可达（tokens / components / fonts）', assets.every((s) => s.endsWith(' 200')), assets.join(' | '));

// ── 4. 官方组件类 + --ds-base ──
const comps = await page.evaluate(() => {
  const tb = document.querySelector('.ds-topbar');
  return {
    shell: document.body.classList.contains('ds-shell'),
    topbar: !!tb, sticky: tb ? getComputedStyle(tb).position === 'sticky' : false,
    footer: !!document.querySelector('.ds-footer'),
    skip: !!document.querySelector('.ds-skip'),
    skipFirst: document.querySelector('.ds-skip') === document.querySelector('a[href]'),
    canvasFrame: !!document.querySelector('.ds-canvas-frame'),
    dsBase: getComputedStyle(document.documentElement).getPropertyValue('--ds-base').trim(),
    navCurrent: document.querySelectorAll('.ds-topbar__link[aria-current="page"]').length,
  };
});
check('body 带 ds-shell', comps.shell);
check('.ds-topbar 存在且 sticky', comps.topbar && comps.sticky, `sticky=${comps.sticky}`);
check('.ds-footer 存在', comps.footer);
check('.ds-skip 是首个可聚焦元素', comps.skip && comps.skipFirst);
check('.ds-canvas-frame 包裹游戏画布', comps.canvasFrame);
check('--ds-base 已注入', comps.dsBase.replace(/^["']|["']$/g, '') === '/playtime-atlas-20261021/', comps.dsBase);
check('导航当前项用 aria-current="page" 标注', comps.navCurrent === 1, `${comps.navCurrent} 项`);

// ── 5. V.11b 渲染层：汉字不混排 ──
const mix = await page.evaluate(MIX);
check('V.11b 渲染层：汉字不混排（系统 CJK 族与 Noto 子集不同时出现）', mix.noto === 0 || mix.sys === 0,
  `全页 ${mix.total} 个汉字/全角标点：系统族 ${mix.sys} / 子集 ${mix.noto} / 其它 ${mix.other}` +
  (mix.noto > 0 && mix.sys > 0 ? ` —— **混排**，样例：${mix.sample.join(' ')}` : ' —— 无混排'));

// ── 6. 三条诚实声明 ──
const honesty = await page.evaluate(() => {
  const vis = (n) => { if (!n) return { ok: false, text: '' };
    const cs = getComputedStyle(n); const r = n.getBoundingClientRect();
    return { ok: cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.1 && r.width > 0 && r.height > 0,
             text: (n.textContent || '').trim().slice(0, 70) }; };
  return { notice: vis(document.querySelector('.notice__body')), badge: vis(document.querySelector('.badge--ai')) };
});
check('「本地单机」声明可见', honesty.notice.ok && /联网/.test(honesty.notice.text), honesty.notice.text);
check('AI「非真人 / 无联网」徽标可见', honesty.badge.ok && /非真人/.test(honesty.badge.text) && /无联网/.test(honesty.badge.text), honesty.badge.text);

// ── 7. 焦点环 + Tab 不被吞 ──
await page.keyboard.press('Tab');
const focus = await page.evaluate(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return { ok: false, reason: '焦点仍在 body（Tab 被吞）' };
  const cs = getComputedStyle(el);
  const ring = cs.boxShadow && cs.boxShadow !== 'none';
  const outline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
  return { ok: ring || outline, tag: el.tagName, cls: el.className, ring, outline };
});
check('Tab 后焦点落在可聚焦元素（未被吞）', focus.ok, focus.reason || `${focus.tag}.${focus.cls}`);
check('焦点环可见（box-shadow 或 outline）', !!focus.ring || !!focus.outline, `shadow=${focus.ring} outline=${focus.outline}`);

// ── 8. 触摸目标两档 ──
const tg = await page.evaluate(TARGETS);
check('§5.1 全部可交互元素触摸目标 ≥24px', !tg.bad24.length, tg.bad24.slice(0, 6).join(' | ') || `${tg.total} 类全部达标`);
check('§5.1 主控件触摸目标 ≥44px（紧凑变体豁免）', !tg.bad44.length, tg.bad44.slice(0, 6).join(' | ') || '无违反项');

// ── 9. 两个展项的 HUD DOM 对比度 ──
for (const [idx, name] of [[0, 'A'], [1, 'B']]) {
  await page.evaluate((i) => {
    const tabs = [...document.querySelectorAll('.tab')];
    if (tabs[i]) tabs[i].click();
  }, idx);
  await page.waitForTimeout(700);
  const a = await page.evaluate(AUDIT);
  check(`§4.2 展项 ${name} HUD DOM 文字对比度 ≥4.5:1（canvas 内豁免）`, !a.bad.length,
    a.bad.length ? a.bad.slice(0, 6).map((b) => `${b.sel} "${b.text}" ${b.cr}<${b.need}`).join(' | ') : `${a.count} 个文字元素达标`);
  const t = await page.evaluate(TARGETS);
  check(`§5.1 展项 ${name} 触摸目标 ≥24px`, !t.bad24.length, t.bad24.slice(0, 6).join(' | ') || `${t.total} 类全部达标`);
}
const tabsVisible = await page.evaluate(() =>
  [...document.querySelectorAll('.tab')].map((t) => (t.textContent || '').trim().slice(0, 14)));
check('两个展项均可切换激活', tabsVisible.length >= 2, tabsVisible.join(' | '));

// ── 10. 功能抽检：展项 A 纯键盘建造 + U 升级 ──
await page.evaluate(() => { const t = document.querySelectorAll('.tab')[0]; if (t) t.click(); });
await page.waitForTimeout(700);
const before = await page.evaluate(() => {
  const s = window.__linkDawn.defense.getState();
  return { sigma: s.sigma, facilities: s.facilities.length, selected: s.selectedTower, kind: s.buildKind };
});
await page.keyboard.press('Digit1');
await page.waitForTimeout(200);
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(250);
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
const afterBuild = await page.evaluate(() => {
  const s = window.__linkDawn.defense.getState();
  return { sigma: s.sigma, facilities: s.facilities.length, kinds: s.facilities.map((f) => f.kind + ' Lv' + f.level) };
});
check('展项 A 纯键盘路径可建造（1 + 方向键 + Enter）', afterBuild.facilities > before.facilities,
  `设施 ${before.facilities} → ${afterBuild.facilities}（${afterBuild.kinds.join(', ')}），Σ ${before.sigma} → ${afterBuild.sigma}`);

await page.keyboard.press('Enter');   // 选中刚建的塔
await page.waitForTimeout(250);
const sel = await page.evaluate(() => window.__linkDawn.defense.getState().selectedTower);
await page.keyboard.press('KeyU');
await page.waitForTimeout(300);
const afterUp = await page.evaluate(() => {
  const s = window.__linkDawn.defense.getState();
  return { facilities: s.facilities.map((f) => f.kind + ' Lv' + f.level), sigma: s.sigma };
});
check('展项 A U 键升级生效（需先选中塔）', afterUp.facilities.some((k) => /Lv2/.test(k)),
  `选中 ${sel ? '有' : '无'} → ${afterUp.facilities.join(', ')}，Σ ${afterUp.sigma}`);

// ── 11. 功能抽检：展项 B 对话（说话人 / 来源角标 / 年份 / https 外链）──
await page.evaluate(() => { const t = document.querySelectorAll('.tab')[1]; if (t) t.click(); });
await page.waitForTimeout(800);
const talk = await page.evaluate(() => {
  const s = window.__linkDawn.handheld.getState();
  s.px = (2 + 0.5) * 8; s.py = (3 + 0.5) * 8 - 1;   // 站到 NPC 岑 (2,2) 相邻格
  return { area: s.area };
});
await page.waitForTimeout(300);
await page.keyboard.press('KeyZ');
await page.waitForTimeout(700);
const dlg = await page.evaluate(() => ({
  speaker: (document.querySelector('.touch__speaker') || {}).textContent || '',
  text: (document.querySelector('.touch__text') || {}).textContent || '',
  chips: [...document.querySelectorAll('.touch__src .src')].map((e) => ({ href: e.getAttribute('href'), text: (e.textContent || '').trim() })),
}));
const years = [...new Set((dlg.text.match(/(19|20)\d{2}/g) || []))];
check('展项 B 对话显示说话人', /岑|守灯人|岚|薇|拾遗者|记录员/.test(dlg.speaker), `「${dlg.speaker.trim()}」（${JSON.stringify(talk)}）`);
check('展项 B NPC 对话含带来源角标的历史陈述', dlg.chips.length > 0, `角标 ${dlg.chips.length} 枚：${dlg.chips.map((c) => `${c.text}→${c.href}`).join(' | ') || '无'}`);
check('展项 B NPC 对话含具体年份史实', years.length > 0, `年份 ${years.join(' / ') || '无'}`);
check('展项 B 对话来源角标为可点击外链', dlg.chips.length > 0 && dlg.chips.every((c) => /^https:\/\//.test(c.href || '')), dlg.chips.map((c) => c.href).join(' | ') || '无角标');

// ── 12. reduced-motion 生效 ──
await page.cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await page.waitForTimeout(400);
const rm = await page.evaluate(() => ({
  dur: getComputedStyle(document.querySelector('.btn')).transitionDuration,
  scroll: getComputedStyle(document.documentElement).scrollBehavior,
}));
check('reduced-motion 下过渡归 1ms', /0\.001s|1ms/.test(rm.dur), rm.dur);
check('reduced-motion 下 scroll-behavior 为 auto', rm.scroll === 'auto', rm.scroll);
await page.cdp('Emulation.setEmulatedMedia', { features: [] });

// ── 13. 截图（证据留档）──
await page.evaluate(() => {
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const t = document.querySelectorAll('.tab')[1]; if (t) t.click();
  window.scrollTo(0, 0);
});
await page.waitForTimeout(700);
const shot = await page.screenshot({ path: `${ROOT}/screenshots/13-ego-verify-handheld.png` });
console.log('截图：' + shot);

await fs.writeFile(OUT, JSON.stringify(results, null, 2));

const failed = results.filter((r) => !r.ok);
console.log(`\n===== Ego 权威验收：${results.length - failed.length}/${results.length} 通过 =====`);
for (const f of failed) console.log('  - ' + f.name + (f.detail ? ' :: ' + f.detail : ''));
console.log({ taskSpaceId: task.spaceId, page: page.label, result: `${results.length - failed.length}/${results.length}` });
