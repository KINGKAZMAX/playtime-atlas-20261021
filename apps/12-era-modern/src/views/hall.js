import { el, clear } from '../core/dom.js';
import { EXHIBITS, KEYWORDS, HALL_FACTS } from '../data/hall.js';
import { TIMELINE, TIMELINE_TAGS } from '../data/timeline.js';
import { getSettings } from '../core/settings.js';
import { markVisited } from '../core/progress.js';
import { navigate } from '../ui/router.js';

/**
 * 展厅落地页。
 * 包含：主视觉、三件展项入口、关键词导览、2010–2026 时间轴、无障碍 2D 目录、原创与来源声明。
 */
export function mountHall(root) {
  markVisited('hall');
  clear(root);

  const section = (index, title, subtitle, body) =>
    el(
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

  /* ---------- 主视觉 ---------- */
  const canvas = el('canvas.hero-canvas', { 'aria-hidden': 'true' });
  const hero = el(
    'section.hall-hero',
    {},
    canvas,
    el(
      'div.hero-inner',
      {},
      el('span.hero-eyebrow', {}, '回响电玩馆 · 现代时代分厅'),
      el('h1.hero-title', {}, el('span.prism', {}, '折光纪')),
      el('p.hero-sub', {}, 'PRISM ERA · 2010s — NOW'),
      el(
        'p.hero-lead',
        {},
        '当游戏离开客厅、进入口袋、缠上手腕、罩住双眼，一整套新的身体经验被建立起来。折光纪收集这段历史里的三件可玩展品：节奏反应、空间解谜，以及一座诚实的桌面观景台。',
      ),
      el(
        'div.hero-cta',
        {},
        el(
          'a.btn.btn-primary',
          { href: '#/pulse', style: { '--prisma': 'var(--prism-cyan)' } },
          '进入《脉冲走廊》',
        ),
        el('a.btn', { href: '#/atrium' }, '进入《折光阁》'),
        el('a.btn.btn-ghost', { href: '#/halo' }, '进入《光环台》'),
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
      'a.exhibit-card.panel',
      {
        href: `#${ex.path}`,
        style: { '--prisma': ex.color, '--prisma-soft': ex.soft },
      },
      el('span.exhibit-glow', { 'aria-hidden': 'true' }),
      el('span.exhibit-no', {}, ex.no),
      el('h3.exhibit-name', {}, ex.name),
      el('span.exhibit-en', {}, ex.nameEn),
      el('p.exhibit-desc', {}, ex.desc),
      el(
        'div.exhibit-meta',
        {},
        ex.meta.map((m, i) => el('span.tag', { class: i === 0 ? 'tag-cyan' : '' }, m)),
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
  const timeline = el(
    'ol.timeline',
    {},
    TIMELINE.map((item) => {
      const tag = TIMELINE_TAGS[item.tag] || TIMELINE_TAGS.indie;
      return el(
        'li.tl-item',
        { style: { '--tl-color': tag.color } },
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
    }),
  );

  root.appendChild(
    section(
      '03 / TIMELINE',
      '2010 — 2026 时间轴',
      '代表性选样，而非编年全集。年份、平台与厂商信息均以官方或一手来源为准。',
      el('div.panel', {}, timeline),
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

  /* ---------- 主视觉动画 ---------- */
  const cleanupHero = startHeroAnimation(canvas);

  return () => {
    cleanupHero();
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

    // 背景光晕
    const g = ctx.createRadialGradient(w * (0.22 + pointer.x * 0.2), h * 0.2, 0, w * 0.6, h * 0.5, w * 0.9);
    g.addColorStop(0, 'rgba(79,227,208,0.13)');
    g.addColorStop(0.55, 'rgba(157,123,255,0.07)');
    g.addColorStop(1, 'rgba(4,6,26,0)');
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

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(s.r);
      const hue = s.hue < 0.34 ? '79,227,208' : s.hue < 0.68 ? '157,123,255' : '255,95,162';
      ctx.strokeStyle = `rgba(${hue},${s.a})`;
      ctx.fillStyle = `rgba(${hue},${s.a * 0.24})`;
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
    line.addColorStop(0, 'rgba(79,227,208,0)');
    line.addColorStop(0.5, 'rgba(157,123,255,0.35)');
    line.addColorStop(1, 'rgba(255,95,162,0)');
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
