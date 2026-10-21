/**
 * 页内探针表达式（共享）—— 由 Ego 版验收脚本 import。
 *
 * 这两段是**纯浏览器侧表达式字符串**（不含任何 Node API），
 * 原先内嵌在自行 spawn 浏览器进程的探针里；自 2026-10-22 起
 * 按用户长期约定改由 **ego-browser** 驱动浏览器，表达式本身原样复用，
 * 以保证改版前后、以及与历史证据的判定口径完全一致。
 *
 * DS_PAGE_PROBE      —— 设计系统验收：溢出 / 对比度 / 焦点环 / 密度 / 令牌 / 旧色板 / 字体 / 来源 / 筛选搜索
 * SELFTEST_PAGE_PROBE —— 功能自测：卡片数 / 年代筛选 / 类型筛选 / 搜索 / 详情展开 / 计算样式
 */
export const DS_PAGE_PROBE = String.raw`
(() => {
  const out = {};
  const doc = document.documentElement;

  // ── V.1 横向溢出 ─────────────────────────────────────────────
  out.overflow = {
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    innerWidth: window.innerWidth,
    horizontalOverflow: doc.scrollWidth > window.innerWidth + 1,
  };
  // 找出真正越界的元素（便于定位）
  const vw = window.innerWidth;
  out.overflowOffenders = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
      out.overflowOffenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className || '').toString().slice(0, 60),
        left: Math.round(r.left),
        right: Math.round(r.right),
      });
    }
  });
  out.overflowOffenders = out.overflowOffenders.slice(0, 12);

  // ── V.2 对比度采样 ───────────────────────────────────────────
  function parseRGB(str) {
    const m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[,\s\/]+/).filter(Boolean).map(Number);
    return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
  }
  function lum(c) {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }
  function over(fg, bg) {
    const a = fg.a;
    return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
  }
  function effectiveBg(el) {
    let node = el;
    let acc = null;
    while (node && node !== document.documentElement.parentNode) {
      const c = parseRGB(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0) {
        acc = acc ? over(acc, c) : c;
        if (acc.a >= 0.999) return acc;
      }
      node = node.parentElement;
    }
    const root = parseRGB(getComputedStyle(document.documentElement).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
    return acc ? over(acc, root) : root;
  }
  function ratio(el) {
    const cs = getComputedStyle(el);
    const fgRaw = parseRGB(cs.color);
    if (!fgRaw) return null;
    const bg = effectiveBg(el);
    const fg = fgRaw.a < 1 ? over(fgRaw, bg) : fgRaw;
    const l1 = lum(fg), l2 = lum(bg);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }
  const SAMPLES = [
    ['正文 · 事实描述', '.ds-catalog__item .ds-detail__body p'],
    ['正文 · 导语', '.ds-catalog__desc'],
    ['条目标题', '.ds-catalog__name'],
    ['年份', '.ds-catalog__year'],
    ['元信息', '.ds-catalog__meta'],
    ['计数', '.ds-catalog__count'],
    ['筛选芯片', '.ds-chip'],
    ['筛选芯片·选中', '.ds-chip[aria-pressed="true"]'],
    ['字段名', '.ds-catalog__kv dt'],
    ['字段值', '.ds-catalog__kv dd'],
    ['来源编号', '.ds-catalog__sources .ds-detail__caption b'],
    ['来源链接', '.ds-catalog__sources a'],
    ['眉标', '.ds-catalog__kicker'],
    ['副题', '.ds-catalog__sub'],
    ['顶栏品牌', '.ds-topbar__brand'],
    ['顶栏链接', '.ds-topbar__link'],
    ['页脚', '.ds-footer p'],
    ['关于本目录', '.ds-catalog__about .ds-body'],
  ];
  out.contrast = [];
  SAMPLES.forEach(([name, sel]) => {
    const el = document.querySelector(sel);
    if (!el) { out.contrast.push({ name, sel, missing: true }); return; }
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const r = ratio(el);
    out.contrast.push({
      name, sel, fontSize: size, fontWeight: weight, large,
      required: large ? 3 : 4.5,
      color: cs.color, ratio: r ? Math.round(r * 100) / 100 : null,
    });
  });

  // ── V.3 焦点环 ───────────────────────────────────────────────
  const focusables = Array.prototype.slice.call(
    document.querySelectorAll('a[href], button, input, summary, [tabindex]:not([tabindex="-1"])')
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
  out.focus = { count: focusables.length };
  const first = focusables[0];
  out.focus.firstIsSkip = !!(first && first.classList.contains('ds-skip'));
  out.focus.firstTag = first ? first.tagName.toLowerCase() + '.' + (first.className || '') : null;
  if (first) {
    first.focus();
    const cs = getComputedStyle(first);
    out.focus.skipBoxShadow = cs.boxShadow;
    out.focus.skipOutline = cs.outline;
    out.focus.skipVisible = cs.boxShadow !== 'none' || (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0);
  }
  // 通用 focus-visible 规则是否存在
  const styleSheets = Array.prototype.slice.call(document.styleSheets);
  let focusRule = null;
  for (const sheet of styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules) {
      if (r.selectorText && r.selectorText.includes(':focus-visible')) {
        focusRule = { selector: r.selectorText, boxShadow: r.style.boxShadow || '', outline: r.style.outline || '' };
        break;
      }
    }
    if (focusRule) break;
  }
  out.focus.rule = focusRule;
  out.focus.ruleOk = !!(focusRule && (focusRule.boxShadow && focusRule.boxShadow !== 'none' || focusRule.outline));

  // ── V.8 数据密度基线 ─────────────────────────────────────────
  const row = document.querySelector('.ds-catalog__row');
  const name = document.querySelector('.ds-catalog__name');
  const year = document.querySelector('.ds-catalog__year');
  if (row) {
    const r = row.getBoundingClientRect();
    const cs = getComputedStyle(row);
    out.density = {
      rowHeight: Math.round(r.height),
      rowPaddingBlock: cs.paddingTop + ' / ' + cs.paddingBottom,
      nameFontSize: name ? getComputedStyle(name).fontSize : null,
      nameFontWeight: name ? getComputedStyle(name).fontWeight : null,
      yearFontSize: year ? getComputedStyle(year).fontSize : null,
      nameFontFamily: name ? getComputedStyle(name).fontFamily : null,
      bodyFontFamily: getComputedStyle(document.body).fontFamily,
    };
  }

  // ── V.5 DS 令牌是否生效 ──────────────────────────────────────
  const rootCS = getComputedStyle(document.documentElement);
  const dsVars = ['--ds-bg', '--ds-ink', '--ds-ink-soft', '--ds-ink-faint', '--ds-accent',
    '--ds-line', '--ds-surface', '--ds-radius-sm', '--ds-space-3', '--ds-type-h3', '--ds-type-body',
    '--ds-font-display', '--ds-font-text', '--ds-font-mono', '--ds-focus-ring', '--ds-base'];
  out.tokens = {};
  dsVars.forEach((v) => { out.tokens[v] = rootCS.getPropertyValue(v).trim(); });
  out.bodyBg = getComputedStyle(document.body).backgroundColor;
  out.bodyColor = getComputedStyle(document.body).color;

  // 旧色板是否还残留在本页样式里（改版后应完全没有）
  const OLD = ['#0a1020', '#ff6a2b', '#4fd6e8', '#dfe4ef', '#97a0b6', '#626c83', '#f3ede1'];
  out.legacyColors = [];
  for (const sheet of styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules) {
      const t = r.cssText || '';
      OLD.forEach((c) => { if (t.toLowerCase().includes(c)) out.legacyColors.push({ color: c, snippet: t.slice(0, 90) }); });
    }
  }
  out.legacyColors = out.legacyColors.slice(0, 10);

  // ── V.7 字体实际加载情况 ─────────────────────────────────────
  out.fonts = [];
  if (document.fonts && document.fonts.forEach) {
    document.fonts.forEach((f) => {
      out.fonts.push({ family: f.family, weight: f.weight, status: f.status });
    });
  }

  // ── V.10 来源可见性 ──────────────────────────────────────────
  const firstItem = document.querySelector('.ds-catalog__item');
  if (firstItem) {
    const meta = firstItem.querySelector('.ds-catalog__meta');
    out.sources = {
      collapsedMeta: meta ? meta.textContent.replace(/\s+/g, ' ').trim() : null,
      collapsedShowsCount: meta ? /来源/.test(meta.textContent) : false,
    };
    firstItem.open = true;
    const caps = Array.prototype.slice.call(firstItem.querySelectorAll('.ds-catalog__sources .ds-detail__caption b'))
      .map((b) => b.textContent.trim());
    out.sources.expandedCaptions = caps;
    out.sources.captionIsMono = caps.length
      ? getComputedStyle(firstItem.querySelector('.ds-catalog__sources .ds-detail__caption b')).fontFamily.includes('Space Mono')
      : false;
    out.sources.linkCount = firstItem.querySelectorAll('.ds-catalog__sources a').length;
    firstItem.open = false;
  }

  // ── V.9 筛选 / 搜索 ──────────────────────────────────────────
  const cards = Array.prototype.slice.call(document.querySelectorAll('#catalog-list .ds-catalog__item'));
  const visible = () => cards.filter((c) => c.style.display !== 'none').length;
  out.functional = { total: cards.length, initial: visible() };
  const eraChips = Array.prototype.slice.call(document.querySelectorAll('.ds-chip[data-era]'));
  const kindChips = Array.prototype.slice.call(document.querySelectorAll('.ds-chip[data-kind]'));
  out.functional.era = {};
  eraChips.forEach((ch) => {
    ch.click();
    out.functional.era[ch.dataset.era || '__all__'] = visible();
  });
  const resetEra = eraChips.find((c) => c.dataset.era === '');
  if (resetEra) resetEra.click();
  out.functional.kind = {};
  kindChips.forEach((ch) => {
    ch.click();
    out.functional.kind[ch.dataset.kind || '__all__'] = visible();
  });
  const resetKind = kindChips.find((c) => c.dataset.kind === '');
  if (resetKind) resetKind.click();
  const q = document.getElementById('q');
  if (q) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(q, 'nintendo');
    q.dispatchEvent(new Event('input', { bubbles: true }));
    out.functional.search = visible();
    setter.call(q, '');
    q.dispatchEvent(new Event('input', { bubbles: true }));
  }
  out.functional.afterReset = visible();

  return out;
})()
`;

export const SELFTEST_PAGE_PROBE = String.raw`
(() => {
  const cards = Array.prototype.slice.call(document.querySelectorAll('#list .card, #catalog-list .ds-catalog__item'));
  const eraChips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-era], .ds-chip[data-era]'));
  const kindChips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-kind], .ds-chip[data-kind]'));
  const countEl = document.getElementById('count');
  const visible = () => cards.filter(c => c.style.display !== 'none');
  const countText = () => (countEl ? countEl.textContent.trim() : '');
  const out = {};

  out.cardCount = cards.length;
  out.eraChipCount = eraChips.length;
  out.kindChipCount = kindChips.length;
  out.title = document.title;
  out.lang = document.documentElement.lang;
  out.initial = { visible: visible().length, count: countText() };

  out.era = {};
  eraChips.forEach(chip => {
    chip.click();
    const key = chip.dataset.era || '__all__';
    out.era[key] = {
      visible: visible().length,
      count: countText(),
      pressed: chip.getAttribute('aria-pressed'),
      pressedCount: document.querySelectorAll('.chip[data-era][aria-pressed="true"], .ds-chip[data-era][aria-pressed="true"]').length,
    };
  });
  const resetEra = eraChips.find(c => c.dataset.era === '');
  if (resetEra) resetEra.click();
  out.afterEraReset = { visible: visible().length, count: countText() };

  out.kind = {};
  kindChips.forEach(chip => {
    chip.click();
    const key = chip.dataset.kind || '__all__';
    out.kind[key] = {
      visible: visible().length,
      count: countText(),
      pressed: chip.getAttribute('aria-pressed'),
      pressedCount: document.querySelectorAll('.chip[data-kind][aria-pressed="true"], .ds-chip[data-kind][aria-pressed="true"]').length,
    };
  });
  const resetKind = kindChips.find(c => c.dataset.kind === '');
  if (resetKind) resetKind.click();
  out.afterKindReset = { visible: visible().length, count: countText() };

  const q = document.getElementById('q');
  const setValue = (v) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(q, v);
    q.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const term = __PROBE_TERM__;
  setValue(term);
  out.search = {
    term,
    visible: visible().length,
    count: countText(),
    titles: visible().map(c => (c.querySelector('.nm, .ds-catalog__name') ? c.querySelector('.nm, .ds-catalog__name').textContent.trim() : '')),
  };
  setValue('');
  out.searchReset = { visible: visible().length, count: countText() };

  // 条目详情（展开一张卡）
  const first = cards[0];
  if (first) {
    first.open = true;
    const kvDivs = first.querySelectorAll('.kv > div, .ds-catalog__kv > div');
    const dtLabels = Array.prototype.slice.call(first.querySelectorAll('.kv dt, .ds-catalog__kv dt')).map(n => n.textContent.trim());
    out.detail = {
      open: first.open,
      kvRows: kvDivs.length,
      kvLabels: dtLabels,
      verifyText: kvDivs[5] ? kvDivs[5].textContent.replace(/\s+/g, ' ').trim() : '',
      sourceLinks: first.querySelectorAll('.cbody ul li a, .ds-catalog__sources a').length,
      headings: Array.prototype.slice.call(first.querySelectorAll('.cbody h4, .ds-detail__body h3')).map(n => n.textContent.trim()),
    };
    first.open = false;
  }

  // 全量核验状态分布（逐条读卡片里的"核验状态"）
  out.verifyLabels = {};
  cards.forEach(c => {
    const kvDivs = c.querySelectorAll('.kv > div, .ds-catalog__kv > div');
    const label = kvDivs[5] ? kvDivs[5].textContent.replace(/\s+/g, ' ').trim() : '—';
    out.verifyLabels[label] = (out.verifyLabels[label] || 0) + 1;
  });

  // 样式表是否真的挂上了
  out.styleSheets = Array.prototype.slice.call(document.querySelectorAll('link[rel=stylesheet]')).map(l => l.getAttribute('href'));
  const probeCard = cards[0];
  out.computed = probeCard
    ? (() => {
        const s = getComputedStyle(probeCard);
        const nm = probeCard.querySelector('.nm, .ds-catalog__name');
        const chip = document.querySelector('.chip[data-era], .ds-chip[data-era]');
        const cs = chip ? getComputedStyle(chip) : null;
        return {
          bodyBg: getComputedStyle(document.body).backgroundColor,
          bodyColor: getComputedStyle(document.body).color,
          bodyFontFamily: getComputedStyle(document.body).fontFamily,
          cardRadius: s.borderRadius,
          cardBorderColor: s.borderTopColor,
          cardMarginBottom: s.marginBottom,
          nmFontSize: nm ? getComputedStyle(nm).fontSize : null,
          nmFontWeight: nm ? getComputedStyle(nm).fontWeight : null,
          chipRadius: cs ? cs.borderRadius : null,
          chipFontSize: cs ? cs.fontSize : null,
          chipColor: cs ? cs.color : null,
        };
      })()
    : null;

  return out;
})()
`;

