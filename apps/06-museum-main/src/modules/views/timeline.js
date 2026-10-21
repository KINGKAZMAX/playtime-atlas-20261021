/**
 * 时间长廊 · 十道年代门
 *
 * 交互：
 *  - 横向滚轮 + 键盘 ←/→ 在年代门之间移动
 *  - 每道门可直接进入该年代展厅
 *  - 下方为纵向时间轴，逐年代展开展品数量与代表展品
 */

import { eraDoor, exhibitCard } from '../components.js';
import { escapeHtml } from '../../core/format.js';

export function renderTimeline(ctx) {
  const { exhibits, eras, favorites } = ctx;
  const eraList = [...eras.values()].sort((a, b) => a.from - b.from);

  const counts = new Map();
  const byEra = new Map();
  for (const ex of exhibits) {
    counts.set(ex.era, (counts.get(ex.era) ?? 0) + 1);
    if (!byEra.has(ex.era)) byEra.set(ex.era, []);
    byEra.get(ex.era).push(ex);
  }

  const cards = eraList.map((era) => {
    const list = byEra.get(era.id) ?? [];
    const picks = list.filter((e) => e.kind === 'game').slice(0, 2);
    const fallback = list.slice(0, 2);
    const chosen = picks.length ? picks : fallback;
    return `
<section class="tl-era" data-era="${escapeHtml(era.id)}" style="--era-accent:${escapeHtml(era.accent)}">
  <div class="tl-era-head">
    <p class="tl-era-code mono">${escapeHtml(era.code)}</p>
    <div>
      <h2 class="tl-era-title">${escapeHtml(era.label)}</h2>
      <p class="tl-era-en mono">${escapeHtml(era.labelEn)}</p>
    </div>
    <p class="tl-era-count mono">${counts.get(era.id) ?? 0} 件</p>
  </div>
  <p class="tl-era-text">${escapeHtml(era.narrative)}</p>
  <p class="tl-era-note">${escapeHtml(era.note)}</p>
  <div class="tl-era-acts">
    <a class="btn btn-primary" href="#/era/${encodeURIComponent(era.id)}">进入${escapeHtml(era.label)}</a>
    ${era.playableId ? `<a class="btn btn-ghost" href="#/hall/${encodeURIComponent(era.playableId)}">可玩展厅</a>` : ''}
  </div>
  <div class="grid grid--cards grid--tight">
    ${chosen.map((ex) => exhibitCard(ex, { era, favorite: favorites.has(ex.id) })).join('')}
  </div>
</section>`;
  });

  return `
<section class="page-head">
  <p class="page-eyebrow mono">TIMELINE HALL</p>
  <h1 class="page-title">时间长廊</h1>
  <p class="page-lede">
    从真空管与打孔纸开始，走到串流与订阅服务。左右方向键可在年代门之间移动，
    回车进入展厅。这是本馆唯一的横向长廊，其余页面都是 2D 展签。
  </p>
</section>

<section class="section" aria-labelledby="tl-doors">
  <h2 class="visually-hidden" id="tl-doors">年代门快速导航</h2>
  <div class="corridor" id="corridor" tabindex="0" role="group"
       aria-label="年代门，可用左右方向键移动">
    ${eraList.map((era) => eraDoor(era, counts.get(era.id) ?? 0)).join('')}
  </div>
</section>

<div class="timeline">
  ${cards.join('')}
</div>`;
}

/** 长廊键盘导航：←/→ 聚焦相邻年代门 */
export function mountTimeline(root) {
  const corridor = root.querySelector('#corridor');
  if (!corridor) return;
  const doors = () => [...corridor.querySelectorAll('.era-door')];

  corridor.addEventListener('keydown', (ev) => {
    if (ev.key !== 'ArrowLeft' && ev.key !== 'ArrowRight') return;
    const list = doors();
    const idx = list.indexOf(document.activeElement);
    if (idx < 0) return;
    ev.preventDefault();
    const next = ev.key === 'ArrowRight' ? idx + 1 : idx - 1;
    if (next < 0 || next >= list.length) return;
    list[next].focus();
    list[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}
