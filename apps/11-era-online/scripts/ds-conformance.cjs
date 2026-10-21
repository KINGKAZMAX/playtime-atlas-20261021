/**
 * ds-conformance.cjs — §9 验收清单的**本目录**机械复核（V.3 / V.11 / V.12 / V.13 + §7 降级 + §4.2 + §5.1）
 *
 * 依据：16-design-system/MIGRATION-NOTES.md
 *   - §9  验收清单（V.1—V.13）        —— 本脚本实现静态的 V.3 / V.11 / V.12 / V.13
 *   - §7  prefers-reduced-motion 降级 —— 「1ms 只能出现在 reduce 块内，不能写进 :root 默认值」
 *   - §4.2 游戏画布豁免边界          —— 「像素在 canvas 里 → 豁免；像素在 DOM 里 → 不豁免」
 *                                       「HUD 文字对比度 ≥4.5:1 不豁免」
 *   - §5.1 触摸目标两档               —— 全部 ≥24px；主控件 ≥44px（紧凑变体 .ds-btn--sm 豁免 44px）
 *
 * 用法：
 *   npm run build && (cd dist && python3 -m http.server 4331 --bind 127.0.0.1 &) && sleep 2
 *   NODE_PATH=/tmp/linkdawn-qa/node_modules node scripts/ds-conformance.cjs
 *
 * 产出：qa-ds-conformance.json
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = process.env.QA_BASE || 'http://127.0.0.1:4331/';
const DS = path.join(ROOT, '..', '16-design-system');

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
}

// ─────────────────────────────────────────────────────────────
// 静态检查：解析 CSS
// ─────────────────────────────────────────────────────────────
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** 取某个顶层块（:root / [data-ds-theme="dark"]）内的声明 */
function blockDecls(css, selector) {
  const out = {};
  let from = 0;
  for (;;) {
    const at = css.indexOf(selector, from);
    if (at < 0) break;
    from = at + selector.length;
    // 必须是块起始：其后紧跟空白与 '{'
    const after = css.slice(from).match(/^\s*\{/);
    if (!after) continue;
    const open = from + after[0].length - 1;
    let depth = 0, i = open;
    for (; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') { depth--; if (depth === 0) break; }
    }
    const body = css.slice(open + 1, i);
    for (const d of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      if (!(d[1] in out)) out[d[1]] = d[2].replace(/\s+/g, ' ').trim();
    }
  }
  return out;
}

/** 取出某个 @media 块内的声明 */
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

const famList = (stack) => (stack.match(/["'][^"']+["']/g) || []).map((s) => s.replace(/["']/g, '').trim());
const famIndex = (stack, fam) => famList(stack).indexOf(fam);
const normFam = (s) => s.replace(/["']/g, '').replace(/\s+/g, ' ').trim();

const SYS_CJK = ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Source Han Sans SC'];

(async () => {
  // ══════════ A. 静态检查 ══════════
  const tokensCssPath = path.join(ROOT, 'public/assets/ds/tokens.css');
  const tokensCss = stripComments(fs.readFileSync(tokensCssPath, 'utf8'));
  const upstreamCssPath = path.join(DS, 'src/tokens.css');
  const upstreamCss = stripComments(fs.readFileSync(upstreamCssPath, 'utf8'));
  const dt = JSON.parse(fs.readFileSync(path.join(DS, 'design-tokens.json'), 'utf8'));

  // A0 与上游逐字节一致（拷贝口径的底线）
  check(
    'ds 令牌层与 16 上游逐字节一致',
    tokensCss === upstreamCss,
    tokensCss === upstreamCss ? 'tokens.css 一致' : 'tokens.css 不一致',
  );

  const rootDecls = blockDecls(tokensCss, ':root');
  const darkDecls = blockDecls(tokensCss, '[data-ds-theme="dark"]');

  // ── V.3 令牌一致性：目录内 --ds-* 取值 == design-tokens.json（本目录为深色主题）──
  const camel2kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const v3miss = [], v3diff = [];
  for (const [k, v] of Object.entries(dt.color.dark)) {
    if (k.startsWith('$') || !v || typeof v !== 'object') continue;
    const name = `--ds-${camel2kebab(k)}`;
    const got = darkDecls[name] ?? rootDecls[name];
    if (got === undefined) { v3miss.push(name); continue; }
    if (normFam(got).toLowerCase() !== normFam(String(v.$value)).toLowerCase()) v3diff.push(`${name}: ${got} != ${v.$value}`);
  }
  check(
    'V.3 令牌一致性（深色主题 --ds-* == design-tokens.json）',
    v3miss.length === 0 && v3diff.length === 0,
    v3miss.length ? `缺失 ${v3miss.length} 个：${v3miss.slice(0, 4).join(',')}` : v3diff.length ? v3diff.slice(0, 3).join(' | ') : '全部一致',
  );

  // ── V.11 字体栈顺序：Noto Sans SC 必须排在所有系统 CJK 族之后 ──
  const v11 = [];
  for (const v of ['--ds-font-display', '--ds-font-text']) {
    const stack = rootDecls[v] || '';
    const noto = famIndex(stack, 'Noto Sans SC');
    const sys = SYS_CJK.map((f) => famIndex(stack, f));
    if (noto < 0) { v11.push(`${v} 缺少 "Noto Sans SC" 子集`); continue; }
    if (!sys.some((i) => i >= 0)) { v11.push(`${v} 未声明任何系统 CJK 族`); continue; }
    if (noto < Math.min(...sys.filter((i) => i >= 0))) v11.push(`${v} 的 Noto Sans SC 排在系统 CJK 族之前`);
  }
  check('V.11 字体栈顺序（系统 CJK 族在前、Noto 子集在后）', v11.length === 0, v11.join(' | ') || `display/text 均合规`);

  // ── V.12 不自造字体栈：自有 CSS 的 font-family 只允许引用 var(--ds-font-*) ──
  const ownCssDir = path.join(ROOT, 'src/styles');
  const ownFiles = fs.readdirSync(ownCssDir).filter((f) => f.endsWith('.css'));
  const v12 = [];
  for (const f of ownFiles) {
    const txt = fs.readFileSync(path.join(ownCssDir, f), 'utf8');
    for (const m of txt.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
      const decl = m[1].trim();
      if (/["'][^"']+["']/.test(decl)) v12.push(`${f}: ${decl.slice(0, 60)}`);
    }
  }
  check('V.12 自有 CSS 不自造字体栈（只引用 var(--ds-font-*)）', v12.length === 0, v12.slice(0, 3).join(' | ') || `${ownFiles.length} 个自有 CSS 文件全部合规`);

  // ── V.13 无规范漂移：tokens.css 的字体族序列 == design-tokens.json → typography.family ──
  const v13 = [];
  for (const [cssName, jsonName] of [['--ds-font-display', 'display'], ['--ds-font-text', 'text'], ['--ds-font-mono', 'mono']]) {
    const cssFams = famList(rootDecls[cssName] || '');
    const jsonFams = famList(dt.typography.family[jsonName].$value);
    const norm = (a) => a.map((s) => s.replace(/["']/g, '').trim());
    if (JSON.stringify(norm(cssFams)) !== JSON.stringify(norm(jsonFams))) {
      v13.push(`${cssName} 序列漂移：CSS[${norm(cssFams).join(',')}] vs JSON[${norm(jsonFams).join(',')}]`);
    }
  }
  check('V.13 无规范漂移（字体族序列逐项相等含顺序）', v13.length === 0, v13.join(' | ') || 'display / text / mono 三项序列完全一致');

  // ── §7 reduced-motion：1ms 只能在 reduce 块内，不得写进 :root 默认值 ──
  const rmDecls = mediaDecls(tokensCss, '@media (prefers-reduced-motion: reduce)');
  const durVars = Object.keys(rootDecls).filter((k) => k.startsWith('--ds-dur-') || k === '--ds-entry-duration');
  const rootIs1ms = durVars.filter((v) => /1ms/.test(rootDecls[v]));
  const rmAll1ms = durVars.filter((v) => !/1ms/.test(rmDecls[v] || ''));
  check(
    '§7 reduced-motion 降级写在 @media 块内（:root 不含 1ms）',
    rootIs1ms.length === 0 && rmAll1ms.length === 0 && durVars.length > 0,
    rootIs1ms.length ? `:root 中被误写为 1ms：${rootIs1ms.join(',')}` : rmAll1ms.length ? `reduce 块内缺少：${rmAll1ms.join(',')}` : `${durVars.length} 个时长变量：:root 为真实值、reduce 块内归 1ms`,
  );

  // 自有 CSS 不得声明 --ds-dur-* / --ds-entry-duration（会覆盖降级）
  const ownDeclDur = [];
  for (const f of ownFiles) {
    const txt = fs.readFileSync(path.join(ownCssDir, f), 'utf8');
    for (const m of txt.matchAll(/(--ds-dur-[\w-]+|--ds-entry-duration)\s*:/g)) ownDeclDur.push(`${f}: ${m[1]}`);
  }
  check('自有 CSS 不声明 --ds-dur-*（不覆盖降级逻辑）', ownDeclDur.length === 0, ownDeclDur.slice(0, 3).join(' | ') || '仅消费，不声明');

  // ══════════ B. 页面检查（需要 4331 提供 dist/）══════════
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await page.waitForTimeout(900);

  // ── V.11b 渲染层证据：汉字实际取自系统 CJK 族，且**不混排** ──
  // 静态解析只能证明「顺序写对了」；真正要证的是「同一段文字不会混入两套字形」。
  // 方法：把每个唯一汉字分别按「页面真实栈」「强制系统族」「强制子集」渲染，比对墨迹像素，
  //       判定该字实际来自哪一族；只要「系统族」与「子集」同时出现，即为混排。
  const mixAudit = await page.evaluate(() => {
    const ink = (font, ch) => {
      const cv = document.createElement('canvas'); cv.width = 48; cv.height = 48;
      const c = cv.getContext('2d');
      c.fillStyle = '#fff'; c.fillRect(0, 0, 48, 48);
      c.fillStyle = '#000'; c.font = font; c.textBaseline = 'top';
      c.fillText(ch, 4, 4);
      const d = c.getImageData(0, 0, 48, 48).data;
      let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 128) n++;
      return n;
    };
    const stack = getComputedStyle(document.body).fontFamily;
    const text = (document.body.innerText || '').replace(/\s+/g, '');
    const chars = [...new Set(text.split(''))].filter((c) => /[　-鿿＀-￯]/.test(c));
    let sys = 0, noto = 0, other = 0, sampleMixed = [];
    for (const ch of chars) {
      const real = ink('32px ' + stack, ch);
      const s = ink('32px "PingFang SC", sans-serif', ch);
      const n = ink('32px "Noto Sans SC", sans-serif', ch);
      const isSys = Math.abs(real - s) <= Math.abs(real - n);
      const isNoto = !isSys && Math.abs(real - n) <= Math.abs(real - s);
      if (isSys) sys++;
      else if (isNoto) { noto++; if (sampleMixed.length < 6) sampleMixed.push(ch); }
      else other++;
    }
    return { total: chars.length, sys, noto, other, sampleMixed };
  });
  check(
    'V.11b 渲染层：汉字不混排（系统 CJK 族与 Noto 子集不同时出现）',
    mixAudit.noto === 0 || mixAudit.sys === 0,
    `全页 ${mixAudit.total} 个汉字/全角标点：系统族 ${mixAudit.sys} / 子集 ${mixAudit.noto} / 其它 ${mixAudit.other}` +
      (mixAudit.noto > 0 && mixAudit.sys > 0 ? ` —— **混排**，子集样例：${mixAudit.sampleMixed.join(' ')}` : ' —— 无混排'),
  );


  // ── §4.2 HUD DOM 文字对比度 ≥4.5:1（canvas 内豁免，DOM 内不豁免）──
  // 两个展项各扫一遍：切页签后另一个展项才进入渲染态（display:none 的元素量不到）
  const AUDIT = `(() => {
    const parse = (c) => {
      const m = c.match(/rgba?\\(([^)]+)\\)/);
      if (!m) return null;
      const p = m[1].split(/[\\s,/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const over = (fg, bg) => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });
    const lum = (c) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
    };
    const ratio = (a, b) => {
      const l1 = lum(a), l2 = lum(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const effBg = (el) => {
      let n = el;
      while (n && n !== document.documentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0.05) return c;
        n = n.parentElement;
      }
      return { r: 16, g: 15, b: 14, a: 1 };
    };
    const bad = []; let count = 0;
    const roots = [...document.querySelectorAll('.game--defense, .pocket')];
    for (const root of roots) {
      root.querySelectorAll('*').forEach((el) => {
        if (el.children.length !== 0) return;                 // 只看叶子节点
        if (el.closest('canvas')) return;                    // canvas 内像素豁免
        const txt = (el.textContent || '').trim();
        if (!txt) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.15) return;
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const fg0 = parse(cs.color);
        if (!fg0) return;
        const bg = effBg(el);
        const fg = fg0.a < 1 ? over(fg0, bg) : fg0;
        const size = parseFloat(cs.fontSize);
        const bold = parseInt(cs.fontWeight, 10) >= 700;
        const need = (size >= 24 || (size >= 19 && bold)) ? 3 : 4.5;
        const cr = ratio(fg, bg);
        count++;
        if (cr < need) bad.push({
          sel: el.className || el.tagName, text: txt.slice(0, 24),
          cr: Math.round(cr * 100) / 100, need, size,
          fg: cs.color, bg: 'rgb(' + Math.round(bg.r) + ',' + Math.round(bg.g) + ',' + Math.round(bg.b) + ')',
        });
      });
    }
    return { bad, count };
  })()`;

  const contrastAudit = await page.evaluate(AUDIT);
  check(
    '§4.2 HUD DOM 文字对比度 ≥4.5:1（canvas 内豁免）',
    contrastAudit.bad.length === 0,
    contrastAudit.bad.length
      ? `${contrastAudit.bad.length}/${contrastAudit.count} 项不达标：` + contrastAudit.bad.slice(0, 6).map((b) => `${b.sel} "${b.text}" ${b.cr}<${b.need} (${b.fg} on ${b.bg})`).join(' | ')
      : `实测 ${contrastAudit.count} 个 DOM 文字元素全部达标`,
  );

  // ── §5.1 触摸目标两档 ──
  const TARGETS = `(() => {
    const sel = 'a[href], button, input, select, textarea, [role="button"], .ds-btn, .ds-iconbtn, .ds-topbar__link, .tab, .chipbtn, .btn, .src, .chip';
    const seen = new Set(); const bad24 = []; const bad44 = [];
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      const cls = typeof el.className === 'string' ? el.className : '';
      const key = cls + '|' + (el.textContent || '').trim().slice(0, 12);
      if (seen.has(key)) continue;
      seen.add(key);
      const label = cls + ' "' + (el.textContent || '').trim().slice(0, 12) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height);
      if (r.height < 24 || r.width < 24) bad24.push(label);
      const isPrimary = (cls.includes('ds-btn') || cls.includes('ds-iconbtn')) && !cls.includes('ds-btn--sm');
      if (isPrimary && (r.height < 44 || r.width < 44)) bad44.push(label);
    }
    return { bad24, bad44, total: seen.size };
  })()`;

  const targets = await page.evaluate(TARGETS);
  check('§5.1 全部可交互元素触摸目标 ≥24px', targets.bad24.length === 0, targets.bad24.slice(0, 6).join(' | ') || `${targets.total} 类全部达标`);
  check('§5.1 主控件触摸目标 ≥44px（紧凑变体豁免）', targets.bad44.length === 0, targets.bad44.slice(0, 6).join(' | ') || '无违反项');

  // ── 两个展项都激活后再查一次 HUD（切换页签，量测另一个展项的 DOM HUD）──
  const tabAudit = [];
  for (const idx of [0, 1]) {
    const r = await page.evaluate(async (i) => {
      const tabs = [...document.querySelectorAll('.tab')];
      if (!tabs[i]) return { tab: '(缺)', visible: '' };
      tabs[i].click();
      await new Promise((res) => setTimeout(res, 500));
      const vis = [...document.querySelectorAll('.game--defense, .pocket')].filter(
        (n) => getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().height > 0,
      );
      return { tab: (tabs[i].textContent || '').trim().slice(0, 14), visible: vis.map((v) => v.className).join(',') || '(无)' };
    }, idx);
    const a = await page.evaluate(AUDIT);
    const t = await page.evaluate(TARGETS);
    tabAudit.push({ ...r, contrastBad: a.bad.length, contrastCount: a.count, smallTargets: t.bad24.length });
    if (idx === 0) {
      check('展项 A 激活后 HUD DOM 文字对比度达标', a.bad.length === 0, a.bad.length ? a.bad.slice(0, 4).map((b) => `${b.sel} "${b.text}" ${b.cr}<${b.need}`).join(' | ') : `${a.count} 个文字元素达标`);
    } else {
      check('展项 B 激活后 HUD DOM 文字对比度达标', a.bad.length === 0, a.bad.length ? a.bad.slice(0, 6).map((b) => `${b.sel} "${b.text}" ${b.cr}<${b.need} (${b.fg} on ${b.bg})`).join(' | ') : `${a.count} 个文字元素达标`);
      check('展项 B 激活后触摸目标 ≥24px', t.bad24.length === 0, t.bad24.slice(0, 6).join(' | ') || `${t.total} 类全部达标`);
    }
  }
  check('两个展项均可切换激活（HUD 容器进入渲染态）', tabAudit.every((t) => t.visible !== '(无)'), tabAudit.map((t) => `${t.tab}→${t.visible}`).join(' | '));

  await ctx.close();
  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n===== ds 规范机械复核：${results.length - failed.length}/${results.length} 通过 =====`);
  if (failed.length) for (const f of failed) console.log('  - ' + f.name + (f.detail ? ' :: ' + f.detail : ''));
  fs.writeFileSync(path.join(ROOT, 'qa-ds-conformance.json'), JSON.stringify(results, null, 2));
  process.exit(failed.length ? 1 : 0);
})().catch((e) => {
  console.error('脚本异常：', e);
  process.exit(2);
});
