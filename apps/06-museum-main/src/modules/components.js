/**
 * 通用视图组件（返回 HTML 字符串，外部数据一律先转义）
 */

import { displayTitle, displaySubtitle, escapeHtml, highlight, kindLabel, formatYear } from '../core/format.js';
import { exhibitArt } from './silhouette.js';

/** 展品卡片（网格 / 列表两种形态） */
export function exhibitCard(exhibit, { era, query = '', variant = 'grid', favorite = false } = {}) {
  const title = displayTitle(exhibit);
  const subtitle = displaySubtitle(exhibit);
  const art = exhibitArt(exhibit, { size: variant === 'list' ? 68 : 108 });
  const favLabel = favorite ? '取消收藏' : '加入收藏';
  const favIcon = favorite ? '★' : '☆';

  if (variant === 'list') {
    return `
<article class="exhibit-row" data-era="${escapeHtml(exhibit.era)}" data-id="${escapeHtml(exhibit.id)}">
  <a class="row-art" href="#/exhibit/${encodeURIComponent(exhibit.id)}" tabindex="-1" aria-hidden="true">${art}</a>
  <div class="row-main">
    <h3 class="row-title"><a href="#/exhibit/${encodeURIComponent(exhibit.id)}">${highlight(title, query)}</a></h3>
    <p class="row-meta">
      <span class="tag tag-kind">${escapeHtml(kindLabel(exhibit.kind))}</span>
      <span class="mono">${escapeHtml(formatYear(exhibit.year))}</span>
      <span class="dot">·</span>
      <span>${escapeHtml(exhibit.creator)}</span>
      ${era ? `<span class="dot">·</span><span>${escapeHtml(era.label)}</span>` : ''}
    </p>
    <p class="row-summary">${highlight(exhibit.summary, query)}</p>
  </div>
  <button class="fav-btn fav-btn--row" type="button" data-fav="${escapeHtml(exhibit.id)}"
          aria-pressed="${favorite ? 'true' : 'false'}" aria-label="${favLabel}：${escapeHtml(title)}">
    <span aria-hidden="true">${favIcon}</span>
  </button>
</article>`;
  }

  return `
<article class="exhibit-card" data-era="${escapeHtml(exhibit.era)}" data-id="${escapeHtml(exhibit.id)}">
  <a class="card-art" href="#/exhibit/${encodeURIComponent(exhibit.id)}" tabindex="-1" aria-hidden="true">${art}</a>
  <div class="card-body">
    <p class="card-kicker">
      <span class="tag tag-kind">${escapeHtml(kindLabel(exhibit.kind))}</span>
      <span class="mono">${escapeHtml(formatYear(exhibit.year))}</span>
    </p>
    <h3 class="card-title"><a href="#/exhibit/${encodeURIComponent(exhibit.id)}">${highlight(title, query)}</a></h3>
    ${subtitle ? `<p class="card-sub mono">${highlight(subtitle, query)}</p>` : ''}
    <p class="card-summary">${highlight(exhibit.summary, query)}</p>
    <div class="card-foot">
      <span class="card-creator" title="创作者">${escapeHtml(exhibit.creator)}</span>
      <button class="fav-btn" type="button" data-fav="${escapeHtml(exhibit.id)}"
              aria-pressed="${favorite ? 'true' : 'false'}" aria-label="${favLabel}：${escapeHtml(title)}">
        <span aria-hidden="true">${favIcon}</span><span class="fav-text">${favorite ? '已收藏' : '收藏'}</span>
      </button>
    </div>
  </div>
</article>`;
}

/** 年代门（时间长廊用） */
export function eraDoor(era, count, { active = false } = {}) {
  return `
<a class="era-door${active ? ' is-active' : ''}" href="#/era/${encodeURIComponent(era.id)}"
   data-era="${escapeHtml(era.id)}" style="--era-accent:${escapeHtml(era.accent)}"
   aria-label="${escapeHtml(era.code)} ${escapeHtml(era.label)}，${count} 件展品">
  <div class="door-frame">
    <div class="door-light" aria-hidden="true"></div>
    <p class="door-code mono">${escapeHtml(era.code)}</p>
    <h3 class="door-label">${escapeHtml(era.label)}</h3>
    <p class="door-tagline">${escapeHtml(era.tagline)}</p>
    <p class="door-count mono">${count} 件展品</p>
  </div>
</a>`;
}

/** 可玩展厅卡片（已并入 / 待集成） */
export function hallCard(hall) {
  const integrated = hall.status === 'integrated';
  return `
<div class="hall-card hall-card--${hall.status}" style="--identity-accent:${escapeHtml(hall.accent)}">
  <div class="hall-head">
    <p class="hall-kicker mono">${escapeHtml(hall.subtitle)}</p>
    <h3 class="hall-title">${escapeHtml(hall.title)}</h3>
  </div>
  <p class="hall-summary">${escapeHtml(hall.summary)}</p>
  ${
    integrated
      ? `<p class="hall-status hall-status--ok"><span aria-hidden="true">●</span> 已并入本馆，可直接进入</p>
         <a class="btn btn-primary" href="#/hall/${encodeURIComponent(hall.id)}">进入可玩展厅</a>`
      : `<p class="hall-status hall-status--pending"><span aria-hidden="true">○</span> 待集成 · 该展厅仍在制作中</p>
         <p class="hall-note">来源任务：<span class="mono">${escapeHtml(hall.task)}</span>。包体就位后此处会自动变为可点击入口。</p>`
  }
</div>`;
}

/** 来源清单 */
export function sourceList(exhibit) {
  if (!exhibit.sourceUrls?.length) {
    return '<p class="muted">本条目暂未登记外部来源。</p>';
  }
  return `<ul class="source-list">${exhibit.sourceUrls
    .map((url, i) => {
      const title = exhibit.sourceTitles?.[i] ?? url;
      let host = '';
      try {
        host = new URL(url).hostname.replace(/^www\./, '');
      } catch {
        host = '外部链接';
      }
      return `<li>
        <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(title)}</span>
          <span class="mono source-host">${escapeHtml(host)}</span>
        </a>
      </li>`;
    })
    .join('')}</ul>`;
}

/** 空状态 */
export function emptyState(title, detail = '') {
  return `<div class="empty">
    <p class="empty-mark" aria-hidden="true">◍</p>
    <p class="empty-title">${escapeHtml(title)}</p>
    ${detail ? `<p class="empty-detail">${escapeHtml(detail)}</p>` : ''}
  </div>`;
}
