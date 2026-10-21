/**
 * 展品详情 · #/exhibit/:id
 *
 * 每件展品都给出：所属年代、类别、创作者、平台、叙述、史实意义、
 * 逐条可点的来源链接、图片许可与收藏操作。
 */

import { sourceList, exhibitCard, emptyState } from '../components.js';
import { escapeHtml, displayTitle, displaySubtitle, kindLabel, formatYear } from '../../core/format.js';

export function renderExhibit(ctx, id) {
  const exhibit = ctx.exhibits.find((e) => e.id === id);
  if (!exhibit) {
    return `
<section class="page-head">
  <h1 class="page-title">展品未上架</h1>
  <p class="page-lede">编号 <span class="mono">${escapeHtml(id)}</span> 在当前馆藏中没有对应条目。</p>
  <p><a class="btn btn-primary" href="#/catalog">返回目录</a></p>
</section>`;
  }

  const era = ctx.eras.get(exhibit.era);
  const related = ctx.exhibits
    .filter((e) => e.era === exhibit.era && e.id !== exhibit.id)
    .slice(0, 4);
  const fav = ctx.favorites.has(exhibit.id);
  const hall = era?.playableId ? ctx.halls.find((h) => h.id === era.playableId) : null;

  const rows = [
    ['年代', era ? `${era.code} · ${era.label}` : '—'],
    ['类别', kindLabel(exhibit.kind)],
    ['年份', formatYear(exhibit.year)],
    ['创作者 / 厂商', exhibit.creator],
    ['平台 / 载体', exhibit.platform],
  ];

  return `
<article class="exhibit-page" data-era="${escapeHtml(exhibit.era)}" style="--era-accent:${escapeHtml(era?.accent ?? 'var(--ds-accent)')}">
  <nav class="crumbs" aria-label="面包屑">
    <a href="#/">馆前广场</a>
    <span aria-hidden="true">/</span>
    <a href="#/era/${encodeURIComponent(exhibit.era)}">${escapeHtml(era?.label ?? exhibit.era)}</a>
    <span aria-hidden="true">/</span>
    <span aria-current="page">${escapeHtml(displayTitle(exhibit))}</span>
  </nav>

  <header class="exhibit-hero">
    <div class="exhibit-hero-art" aria-hidden="true">${ctx.artFor(exhibit)}</div>
    <div class="exhibit-hero-copy">
      <p class="exhibit-kicker">
        <span class="tag tag-kind">${escapeHtml(kindLabel(exhibit.kind))}</span>
        <span class="mono">${escapeHtml(formatYear(exhibit.year))}</span>
        <span class="dot">·</span>
        <span>${escapeHtml(exhibit.creator)}</span>
      </p>
      <h1 class="exhibit-title">${escapeHtml(displayTitle(exhibit))}</h1>
      ${displaySubtitle(exhibit) ? `<p class="exhibit-title-en mono">${escapeHtml(displaySubtitle(exhibit))}</p>` : ''}
      <p class="exhibit-summary">${escapeHtml(exhibit.summary)}</p>
      <div class="exhibit-actions">
        <button class="btn ${fav ? 'btn-primary' : 'btn-ghost'}" type="button" data-fav="${escapeHtml(exhibit.id)}"
                aria-pressed="${fav ? 'true' : 'false'}">
          <span aria-hidden="true">${fav ? '★' : '☆'}</span> ${fav ? '已收藏' : '加入收藏'}
        </button>
        ${era ? `<a class="btn btn-ghost" href="#/era/${encodeURIComponent(era.id)}">回到${escapeHtml(era.label)}</a>` : ''}
      </div>
    </div>
  </header>

  <div class="exhibit-body">
    <section class="exhibit-main">
      <h2 class="section-title" data-i18n="exhibit.narrative">展品叙述</h2>
      <p class="exhibit-text">${escapeHtml(exhibit.summary)}</p>
      <h2 class="section-title" data-i18n="exhibit.significance">史实意义</h2>
      <p class="exhibit-text">${escapeHtml(exhibit.significance)}</p>

      <h2 class="section-title" data-i18n="exhibit.sources">来源与核对</h2>
      <p class="section-desc">以下为公开可查的资料入口。馆方叙述为原创改写，请以原始来源为准。</p>
      ${sourceList(exhibit)}

      <h2 class="section-title" data-i18n="exhibit.license">图片与素材许可</h2>
      <p class="exhibit-text">${escapeHtml(exhibit.imageLicense)}</p>
      <p class="exhibit-text muted">本馆展签图形为程序化生成的原创 SVG，不含任何第三方商标或商业游戏素材。</p>
    </section>

    <aside class="exhibit-side" aria-label="展品信息">
      <div class="plaque">
        <p class="plaque-title">展签</p>
        <dl class="plaque-list">
          ${rows.map(([k, v]) => `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`).join('')}
        </dl>
      </div>

      ${
        hall
          ? `<div class="plaque plaque--hall">
              <p class="plaque-title">同年代可玩展厅</p>
              <p class="plaque-text">${escapeHtml(hall.title)} · ${escapeHtml(hall.subtitle)}</p>
              ${
                hall.status === 'integrated'
                  ? `<a class="btn btn-primary btn-sm" href="#/hall/${encodeURIComponent(hall.id)}">进入可玩展厅</a>`
                  : `<p class="plaque-note">待集成 · 该展厅仍在制作中，暂不可进入。</p>`
              }
            </div>`
          : ''
      }
    </aside>
  </div>

  ${
    related.length
      ? `<section class="section" aria-labelledby="related-title">
          <div class="section-head">
            <h2 class="section-title" id="related-title" data-i18n="exhibit.related">同展厅展品</h2>
            <a class="section-link" href="#/era/${encodeURIComponent(exhibit.era)}">查看全部 →</a>
          </div>
          <div class="grid grid--cards">
            ${related.map((ex) => exhibitCard(ex, { era, favorite: ctx.favorites.has(ex.id) })).join('')}
          </div>
        </section>`
      : ''
  }
</article>`;
}
