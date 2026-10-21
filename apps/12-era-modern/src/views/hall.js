import { el, clear } from '../core/dom.js';
import { EXHIBITS, KEYWORDS, HALL_FACTS } from '../data/hall.js';
import { TIMELINE, TIMELINE_TAGS } from '../data/timeline.js';
import { getSettings } from '../core/settings.js';
import { markVisited } from '../core/progress.js';
import { readToken, readTokenRgba } from '../core/tokens.js';
import { navigate } from '../ui/router.js';

/**
 * 展厅落地页。
 * 包含：主视觉、三件展项入口、关键词导览、2010–2026 时间轴、无障碍 2D 目录、原创与来源声明。
 */
export function mountHall(root) {
  markVisited('hall');
  clear(root);

  const sections = [];
  const section = (index, title, subtitle, body) => {
    const node = el(
      'section.hall-section.wrap',
      {},
      el(
        'div.section-head',
        {},
        el(
          'div',
          {},
          el('span.section-index', {}, index),
          el('h2', {}, title),
          subtitle ? el('p', {}, subtitle) : null,
        ),
      ),
      body,
    );
    sections.push(node);
    return node;
  };

  /* ---------- 主视觉 ---------- */
  const canvas = el('canvas.hero-canvas', { 'aria-hidden': 'true' });
  const hero = el(
    'section.hall-hero.ds-cover',
    {},
    canvas,
    el(
      'div.hero-inner',
      {},
      el('span.hero-eyebrow.ds-cover__eyebrow', {}, '回响电玩馆 · 现代时代分厅'),
      el('h1.hero-title.ds-cover__title', {}, el('span.prism', {}, '折光纪')),
      el('p.hero-sub.ds-caps', {}, 'PRISM ERA · 2010s — NOW'),
      el(
        'p.hero-lead.ds-cover__lede',
        {},
        '当游戏离开客厅、进入口袋、缠上手腕、罩住双眼，一整套新的身体经验被建立起来。折光纪收集这段历史里的三件可玩展品：节奏反应、空间解谜，以及一座诚实的桌面观景台。',
      ),
      el(
        'div.hero-cta.ds-cover__actions',
        {},
        el(
          'a.btn.btn-primary.ds-btn.ds-btn--primary',
          {
            href: '#/pulse',
            'data-exhibit': 'pulse',
            style: { '--prisma': 'var(--prism-cyan)' },
          },
          '进入《脉冲走廊》',
        ),
        el('a.btn.ds-btn.ds-btn--secondary', { href: '#/atrium', 'data-exhibit': 'atrium' }, '进入《折光阁》'),
        el('a.btn.btn-ghost.ds-btn.ds-btn--ghost', { href: '#/halo', 'data-exhibit': 'halo' }, '进入《光环台》'),
      ),
      el(
        'div.hero-facts',
        {},
        HALL_FACTS.map((f) =>
          el('div.hero-fact', {}, el('b', {}, f.value), el('span', {}, f.label)),
        ),
      ),
    ),
  );
  root.appendChild(hero);

  /* ---------- 展项 ---------- */
  const cards = EXHIBITS.map((ex) =>
    el(
      'a.exhibit-card.panel.ds-work',
      {
        href: `#${ex.path}`,
        'data-exhibit': ex.id,
        style: { '--prisma': ex.color, '--prisma-soft': ex.soft },
      },
      el('span.exhibit-glow', { 'aria-hidden': 'true' }),
      el('span.exhibit-no', {}, ex.no),
      el('h3.exhibit-name.ds-work__title', {}, ex.name),
      el('span.exhibit-en.ds-work__meta', {}, ex.nameEn),
      el('p.exhibit-desc.ds-work__desc', {}, ex.desc),
      el(
        'div.exhibit-meta',
        {},
        ex.meta.map((m, i) =>
          el('span.tag.ds-tag', { class: i === 0 ? 'tag-cyan' : '' }, m),
        ),
      ),
      el('p.exhibit-note', {}, ex.note),
      el('span.exhibit-go', {}, '进入展项 →'),
    ),
  );
  root.appendChild(
    section(
      '01 / EXHIBITS',
      '三件可玩展品',
      '全部为本厅原创：没有复刻任何具体作品，只借用了公开作品成熟的机制与品质标准。',
      el('div.exhibit-grid', {}, cards),
    ),
  );

  /* ---------- 关键词 ---------- */
  root.appendChild(
    section(
      '02 / THREADS',
      '这一时代的四条线索',
      '触屏化、独立化、服务化、沉浸化——它们共同决定了 2010 年以后游戏长成的样子。',
      el(
        'div.keyword-grid',
        {},
        KEYWORDS.map((k) =>
          el(
            'div.keyword.panel',
            { style: { '--prisma': k.color } },
            el(
              'h3',
              {},
              k.zh,
              el('em', {}, k.en),
            ),
            el('p', {}, k.text),
          ),
        ),
      ),
    ),
  );

  /* ---------- 时间轴 ---------- */
  const timelineItems = [];
  const timeline = el(
    'ol.timeline',
    {},
    TIMELINE.map((item) => {
      const tag = TIMELINE_TAGS[item.tag] || TIMELINE_TAGS.indie;
      const li = el(
        'li.tl-item',
        {
          style: { '--tl-color': tag.color },
          'data-timeline-tag': item.tag,
          'data-timeline-year': String(item.year),
        },
        el('div.tl-year', {}, String(item.year), ' · ', tag.label),
        el(
          'h3.tl-title',
          {},
          item.title,
          item.titleZh ? el('small', {}, item.titleZh) : null,
        ),
        el('p.tl-fact', {}, item.fact),
        el('p.tl-why', {}, `入馆理由：${item.why}`),
        el(
          'p.tl-src',
          {},
          el('span.muted', {}, '平台：'),
          item.platform,
          ' · ',
          el('span.muted', {}, '来源：'),
          el(
            'a',
            { href: item.source.url, target: '_blank', rel: 'noopener noreferrer' },
            item.source.label,
          ),
          item.extraSources
            ? el(
                'span',
                {},
                ' / ',
                item.extraSources.map((s, i) =>
                  el(
                    'span',
                    {},
                    i > 0 ? ' / ' : '',
                    el('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.label),
                  ),
                ),
              )
            : null,
        ),
      );
      timelineItems.push(li);
      return li;
    }),
  );

  /* 筛选：线索 chip（.ds-chip，aria-pressed）+ 关键词搜索（.ds-input）
     + 年份跳转轴（.ds-rail），三者共用同一套过滤逻辑。 */
  const countLine = el('p.ds-xs.timeline-count', { 'aria-live': 'polite' });
  const chips = [];
  let activeTag = 'all';
  let keyword = '';

  const applyFilter = () => {
    let shown = 0;
    for (const li of timelineItems) {
      const byTag = activeTag === 'all' || li.getAttribute('data-timeline-tag') === activeTag;
      const text = li.textContent || '';
      const byText = !keyword || text.toLowerCase().includes(keyword);
      if (byTag && byText) {
        li.removeAttribute('hidden');
        shown += 1;
      } else {
        li.setAttribute('hidden', '');
      }
    }
    for (const chip of chips) {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === activeTag));
    }
    countLine.textContent = `显示 ${shown} / ${timelineItems.length} 条史料条目`;
  };

  const FILTER_KEYS = ['all', ...Object.keys(TIMELINE_TAGS)];
  const filterBar = el(
    'div.ds-filters.timeline-filters',
    { role: 'group', 'aria-label': '按线索筛选时间轴' },
    FILTER_KEYS.map((key) => {
      const label = key === 'all' ? '全部' : TIMELINE_TAGS[key].label;
      const chip = el(
        'button.ds-chip',
        {
          type: 'button',
          'aria-pressed': String(key === 'all'),
          'data-filter': key,
        },
        label,
      );
      chip.addEventListener('click', () => {
        activeTag = key;
        applyFilter();
      });
      chips.push(chip);
      return chip;
    }),
  );

  const searchInput = el('input.ds-input.timeline-search', {
    type: 'search',
    id: 'timeline-search',
    placeholder: '搜索标题、平台或关键词',
    'aria-label': '搜索时间轴条目',
    autocomplete: 'off',
  });
  searchInput.addEventListener('input', () => {
    keyword = searchInput.value.trim().toLowerCase();
    applyFilter();
  });
  const searchField = el(
    'div.ds-field.timeline-search-field',
    {},
    el('label.ds-field__label', { for: 'timeline-search' }, '搜索条目'),
    searchInput,
  );

  /* 年份跳转轴：.ds-rail（横向变体），按年份定位到第一条 */
  const years = [...new Set(TIMELINE.map((item) => item.year))].sort((a, b) => a - b);
  const railButtons = [];
  const yearRail = el(
    'nav.ds-rail.ds-rail--horizontal.timeline-rail',
    { 'aria-label': '按年份跳转' },
    years.map((year) => {
      const btn = el(
        'button.ds-rail__item',
        { type: 'button', 'data-year': String(year) },
        String(year),
      );
      btn.addEventListener('click', () => {
        const target = timelineItems.find(
          (li) => li.getAttribute('data-timeline-year') === String(year) && !li.hasAttribute('hidden'),
        );
        for (const b of railButtons) b.removeAttribute('aria-current');
        btn.setAttribute('aria-current', 'true');
        if (target) {
          // 禁止强制 smooth：reduced-motion 下必须是瞬时滚动（§7）
          target.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
      });
      railButtons.push(btn);
      return btn;
    }),
  );

  applyFilter();

  root.appendChild(
    section(
      '03 / TIMELINE',
      '2010 — 2026 时间轴',
      '代表性选样，而非编年全集。年份、平台与厂商信息均以官方或一手来源为准。',
      el('div.panel', {}, yearRail, filterBar, searchField, countLine, timeline),
    ),
  );

  /* ---------- 无障碍目录 ---------- */
  const catalog = el(
    'ul.catalog-list',
    {},
    EXHIBITS.map((ex) =>
      el(
        'li',
        {},
        el('b', {}, ex.no.split(' ')[1]),
        el('span', {}, `${ex.name} / ${ex.nameEn} — ${ex.kind}`),
      ),
    ),
    TIMELINE.map((item) =>
      el(
        'li',
        {},
        el('b', {}, String(item.year)),
        el('span', {}, `${item.title} — ${item.platform}`),
      ),
    ),
  );

  root.appendChild(
    section(
      '04 / CATALOG',
      '纯文本目录',
      '不使用图形界面的阅读方式：展项与全部史料条目的可读列表。',
      el('div.panel', {}, catalog),
    ),
  );

  /* ---------- 声明 ---------- */
  root.appendChild(
    section(
      '05 / NOTES',
      '关于本厅',
      null,
      el(
        'div',
        { style: { display: 'grid', gap: '16px' } },
        el(
          'div.notice',
          {},
          el('span.notice-icon', { 'aria-hidden': 'true' }, '◆'),
          el(
            'p',
            {},
            el('b', {}, '原创声明：'),
            '本厅的命名、文案、音乐、视觉、布局与关卡均为原创作品，参考的是公开作品成熟的机制与品质标准，不声称原创任何参考作品，也不复制任何未授权 ROM、商业游戏资源或品牌视觉。',
          ),
        ),
        el(
          'div.notice',
          {},
          el('span.notice-icon', { 'aria-hidden': 'true' }, '●'),
          el(
            'p',
            {},
            el('b', {}, '《光环台》说明：'),
            '该展项是桌面端交互演示，使用鼠标拖拽与键盘模拟头部转动，未接入 WebXR，不支持 VR 头显。展台内提供「检测本机 WebXR 沉浸式 VR 支持」按钮，其结果来自浏览器真实返回值。',
          ),
        ),
        el(
          'div.notice',
          {},
          el('span.notice-icon', { 'aria-hidden': 'true' }, '▲'),
          el(
            'p',
            {},
            el('b', {}, '来源与限制：'),
            '时间轴共 24 条，全部链接已于 2026-10-21 核验可达；本厅未使用任何图片素材，页面图形均为程序化绘制。',
          ),
        ),
      ),
    ),
  );

  /* ---------- 分区进度指示器（.ds-indicator：底部圆点 ↔ 箭头形变） ---------- */
  const indicatorDots = sections.map((_, i) =>
    el('span.ds-indicator__dot', { 'aria-current': i === 0 ? 'true' : 'false' }),
  );
  const indicator = el(
    'div.ds-indicator.hall-indicator',
    { 'aria-hidden': 'true', 'data-visible': 'true' },
    el('div.ds-indicator__dots', {}, indicatorDots),
    el('span.ds-indicator__chevron', {
      html:
        '<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">' +
        '<path d="M4 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    }),
  );
  root.appendChild(indicator);

  let observer = null;
  if (typeof IntersectionObserver === 'function') {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = sections.indexOf(entry.target);
          if (idx < 0) continue;
          indicatorDots.forEach((dot, i) => {
            dot.setAttribute('aria-current', String(i === idx));
          });
          // 指示器只在「还有下文」或「已到末段」时出现：
          // 首段显示圆点，末段切换为箭头形态，中段隐藏，避免压住正文。
          const isLast = idx === sections.length - 1;
          indicator.setAttribute('data-visible', idx === 0 || isLast ? 'true' : 'false');
          indicator.setAttribute('data-state', isLast ? 'chevron' : 'dots');
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    for (const s of sections) observer.observe(s);
  }

  /* ---------- 主视觉动画 ---------- */
  const cleanupHero = startHeroAnimation(canvas);

  return () => {
    cleanupHero();
    if (observer) observer.disconnect();
  };
}

/** 主视觉：程序化棱镜漂浮 + 指针视差。 */
function startHeroAnimation(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const settings = getSettings();
  let w = 0;
  let h = 0;
  let dpr = 1;
  let raf = 0;
  let pointer = { x: 0.5, y: 0.5 };
  const shards = [];

  // 英雄区取设计系统令牌（浅色主题：暖白纸 + 朱砂 / 墨绿 / 靛蓝）
  const palette = [
    readToken('--ds-accent', '#b4432b'),
    readToken('--ds-jade', '#2e6a5e'),
    readToken('--ds-info', '#2c5c8f'),
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    shards.length = 0;
    const count = Math.max(12, Math.min(30, Math.round(w / 46)));
    for (let i = 0; i < count; i += 1) {
      shards.push({
        x: Math.random(),
        y: Math.random(),
        s: 8 + Math.random() * 30,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.0016,
        vy: 0.00006 + Math.random() * 0.00022,
        vx: (Math.random() - 0.5) * 0.00012,
        hue: Math.random(),
        a: 0.06 + Math.random() * 0.2,
        kind: Math.random() < 0.45 ? 0 : 1,
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, w, h);

    // 背景光晕（DESIGN-SPEC §1.1：柔光只允许出现在英雄区）
    const g = ctx.createRadialGradient(w * (0.22 + pointer.x * 0.2), h * 0.2, 0, w * 0.6, h * 0.5, w * 0.9);
    g.addColorStop(0, readTokenRgba('--ds-accent', 0.07, 'rgba(180,67,43,0.07)'));
    g.addColorStop(0.55, readTokenRgba('--ds-jade', 0.05, 'rgba(46,106,94,0.05)'));
    g.addColorStop(1, readTokenRgba('--ds-bg', 0, 'rgba(252,251,249,0)'));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    for (const s of shards) {
      s.y -= s.vy;
      s.x += s.vx;
      s.r += s.vr;
      if (s.y < -0.1) {
        s.y = 1.1;
        s.x = Math.random();
      }
      if (s.x < -0.1) s.x = 1.1;
      if (s.x > 1.1) s.x = -0.1;

      const px = s.x * w + (pointer.x - 0.5) * 26 * s.s * 0.06;
      const py = s.y * h + (pointer.y - 0.5) * 20 * s.s * 0.06;
      const size = s.s * (0.7 + pointer.x * 0.5);

      const hue = palette[Math.min(palette.length - 1, Math.floor(s.hue * palette.length))];

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(s.r);
      ctx.strokeStyle = hue;
      ctx.globalAlpha = s.a;
      ctx.fillStyle = hue;
      ctx.globalAlpha = s.a * 0.18;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      if (s.kind === 0) {
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.86, size * 0.7);
        ctx.lineTo(-size * 0.86, size * 0.7);
        ctx.closePath();
      } else {
        ctx.rect(-size * 0.62, -size * 0.62, size * 1.24, size * 1.24);
      }
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 底部细线
    const line = ctx.createLinearGradient(0, 0, w, 0);
    line.addColorStop(0, readTokenRgba('--ds-accent', 0, 'rgba(180,67,43,0)'));
    line.addColorStop(0.5, readTokenRgba('--ds-ink-faint', 0.28, 'rgba(110,101,94,0.28)'));
    line.addColorStop(1, readTokenRgba('--ds-info', 0, 'rgba(44,92,143,0)'));
    ctx.fillStyle = line;
    ctx.fillRect(0, h - 1, w, 1);

    raf = window.requestAnimationFrame(draw);
  }

  function onPointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width);
    pointer.y = (event.clientY - rect.top) / Math.max(1, rect.height);
  }

  function onLeave() {
    pointer = { x: 0.5, y: 0.5 };
  }

  resize();
  seed();
  window.addEventListener('resize', resize);
  canvas.addEventListener('pointermove', onPointer);
  canvas.addEventListener('pointerleave', onLeave);

  if (settings.reducedMotion) {
    // 减少动效：只绘制一帧静态画面
    draw(0);
  } else {
    raf = window.requestAnimationFrame(draw);
  }

  return () => {
    window.cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('pointerleave', onLeave);
  };
}
