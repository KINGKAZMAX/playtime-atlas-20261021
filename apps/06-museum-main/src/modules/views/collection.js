/**
 * 我的收藏 · #/collection
 */

import { exhibitCard, emptyState } from '../components.js';
import { escapeHtml } from '../../core/format.js';

export function renderCollection(ctx) {
  const ids = [...ctx.favorites];
  const items = ids.map((id) => ctx.exhibits.find((e) => e.id === id)).filter(Boolean);
  const missing = ids.length - items.length;

  return `
<section class="page-head page-head--slim">
  <p class="page-eyebrow mono">MY COLLECTION</p>
  <h1 class="page-title">我的收藏</h1>
  <p class="page-lede">
    收藏保存在这台设备的浏览器本地（localStorage），不会上传到任何服务器，
    换设备或清除浏览器数据后会消失。
  </p>
</section>

${
  items.length === 0
    ? emptyState('还没有收藏任何展品', '在展品卡片或详情页点击「收藏」，就能把它们收进这里。')
    : `
<div class="collection-bar">
  <p class="results-count" role="status" aria-live="polite">已收藏 ${items.length} 件展品</p>
  <div class="collection-tools">
    <button class="btn btn-ghost btn-sm" type="button" id="export-fav">导出清单</button>
    <button class="btn btn-ghost btn-sm btn-danger" type="button" id="clear-fav">清空收藏</button>
  </div>
</div>
<div class="grid grid--cards">
  ${items.map((ex) => exhibitCard(ex, { era: ctx.eras.get(ex.era), favorite: true })).join('')}
</div>
${missing > 0 ? `<p class="muted collection-note">另有 ${missing} 条收藏记录在当前馆藏中已不存在（策展目录更新所致），已自动忽略。</p>` : ''}`
}`;
}
