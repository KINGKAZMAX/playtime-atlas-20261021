/**
 * 年代展厅 · #/era/:eraId
 */

import { exhibitCard, hallCard, emptyState } from '../components.js';
import { escapeHtml, kindLabel } from '../../core/format.js';

export function renderEra(ctx, eraId) {
  const { exhibits, eras, halls, favorites } = ctx;
  const era = eras.get(eraId);

  if (!era) {
    return `
<section class="page-head">
  <h1 class="page-title">未找到这个展厅</h1>
  <p class="page-lede">年代编号 <span class="mono">${escapeHtml(eraId)}</span> 不在本馆展厅表内。</p>
  <p><a class="btn btn-primary" href="#/timeline">回到时间长廊</a></p>
</section>`;
  }

  const list = exhibits.filter((e) => e.era === era.id);
  const games = list.filter((e) => e.kind === 'game');
  const hardware = list.filter((e) => e.kind === 'hardware');
  const platforms = list.filter((e) => e.kind === 'platform');

  const hall = era.playableId ? halls.find((h) => h.id === era.playableId) : null;
  const prev = [...eras.values()].filter((e) => e.from < era.from).pop();
  const next = [...eras.values()].find((e) => e.from > era.from);

  const section = (title, items, note) => (items.length
    ? `
<section class="cabinet" aria-labelledby="cab-${escapeHtml(title)}">
  <div class="cabinet-head">
    <h2 class="cabinet-title" id="cab-${escapeHtml(title)}">${escapeHtml(title)}</h2>
    <p class="cabinet-note">${escapeHtml(note)}</p>
  </div>
  <div class="grid grid--cards">
    ${items.map((ex) => exhibitCard(ex, { era, favorite: favorites.has(ex.id) })).join('')}
  </div>
</section>`
    : '');

  return `
<article class="era-page" data-era="${escapeHtml(era.id)}" style="--era-accent:${escapeHtml(era.accent)}">
  <header class="era-hero">
    <div class="era-hero-bg" aria-hidden="true" style="background-image:url('./art/era-${escapeHtml(era.id)}-backdrop.svg')"></div>
    <div class="era-hero-inner">
      <p class="era-hero-code mono">${escapeHtml(era.code)}</p>
      <h1 class="era-hero-title">${escapeHtml(era.label)}</h1>
      <p class="era-hero-en mono">${escapeHtml(era.labelEn)}</p>
      <p class="era-hero-tag">${escapeHtml(era.tagline)}</p>
      <p class="era-hero-count mono">${list.length} 件展品 · ${games.length} 游戏 / ${hardware.length} 硬件${platforms.length ? ` / ${platforms.length} 平台` : ''}</p>
    </div>
  </header>

  <div class="era-body">
    <section class="era-narrative">
      <h2 class="section-title" data-i18n="era.intro">展厅导言</h2>
      <p class="era-narrative-text">${escapeHtml(era.narrative)}</p>
      <p class="era-narrative-note">${escapeHtml(era.note)}</p>
    </section>

    ${hall ? `
<section class="era-hall" aria-labelledby="era-hall-title">
  <h2 class="section-title" id="era-hall-title" data-i18n="era.hallTitle">本年代可玩展厅</h2>
  ${hallCard(hall)}
</section>` : ''}

    ${section('作品展柜', games, '游戏作品：规则、叙事与玩法的陈列柜。')}
    ${section('硬件展柜', hardware, '硬件设备：决定一个时代能做什么的机器。')}
    ${section('平台与服务展柜', platforms, '平台与服务：游戏被分发和持续更新的方式。')}

    ${list.length === 0 ? emptyState('这个展厅还没有展品', '展品正在整理中。') : ''}

    <nav class="era-pager" aria-label="年代展厅翻页">
      ${prev ? `<a class="btn btn-ghost" href="#/era/${encodeURIComponent(prev.id)}">← ${escapeHtml(prev.label)}</a>` : '<span></span>'}
      <a class="btn btn-ghost" href="#/timeline" data-i18n="era.corridor">长时间廊</a>
      ${next ? `<a class="btn btn-ghost" href="#/era/${encodeURIComponent(next.id)}">${escapeHtml(next.label)} →</a>` : '<span></span>'}
    </nav>
  </div>
</article>`;
}
