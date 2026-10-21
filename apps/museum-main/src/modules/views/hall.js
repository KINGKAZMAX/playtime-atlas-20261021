/**
 * 3D 展厅页面 · #/hall 与 #/hall/:hallId
 *
 * 若 hallId 对应 08—12 的某个可玩展厅，则在 3D 场景之上叠加该展厅的 iframe；
 * 未并入时只显示说明，不提供假入口。
 */

import { escapeHtml } from '../../core/format.js';
import { emptyState } from '../components.js';

export function renderHall(ctx, hallId) {
  const hall = hallId ? ctx.halls.find((h) => h.id === hallId) : null;

  if (hallId && !hall) {
    return `
<section class="page-head">
  <h1 class="page-title">未找到这个展厅</h1>
  <p class="page-lede">编号 <span class="mono">${escapeHtml(hallId)}</span> 不在可玩展厅表内。</p>
  <p><a class="btn btn-primary" href="#/hall">回到 3D 展厅</a></p>
</section>`;
  }

  const embedded = hall && hall.status === 'integrated';

  return `
<section class="page-head page-head--slim">
  <p class="page-eyebrow mono">3D HALL · 可选增强</p>
  <h1 class="page-title">3D 展厅</h1>
  <p class="page-lede">
    一条可漫游的实体长廊，十个展柜按年代排布。柜中体块为程序化生成的**原创简化造型**，
    不复刻任何真实产品的外形与商标。这只是一个可选的观展方式——完整的展签与检索都在
    <a href="#/catalog">2D 无障碍目录</a>里。
  </p>
</section>

<div class="hall-stage" id="hall-stage">
  <canvas id="hall-canvas" aria-label="3D 展厅可交互画布" role="img"></canvas>
  <div class="hall-loading" id="hall-loading" role="status">正在点亮展厅灯光…</div>
  <aside class="hall-panel" id="hall-panel" aria-live="polite">
    <p class="hall-panel-hint">点击展柜查看该年代展品</p>
  </aside>
  <div class="hall-hud" aria-hidden="true">
    <span class="mono">拖拽转视角</span>
    <span class="mono">滚轮 / ↑↓ 移动</span>
    <span class="mono">点击展柜</span>
  </div>
</div>

${
  hall
    ? `<section class="section" aria-labelledby="hall-embed-title">
        <div class="section-head">
          <h2 class="section-title" id="hall-embed-title">${escapeHtml(hall.title)} · ${escapeHtml(hall.subtitle)}</h2>
          <span class="section-note mono">${escapeHtml(hall.task)}</span>
        </div>
        ${
          embedded
            ? `<div class="embed-wrap">
                 <iframe class="embed-frame" src="./exhibits/${escapeHtml(hall.targetDir)}/${escapeHtml(hall.entry)}"
                         title="${escapeHtml(hall.title)} 可玩展厅" loading="lazy"
                         allow="autoplay; fullscreen; gamepad"></iframe>
               </div>
               <p class="embed-note">
                 上方是可玩展厅的实际内容。如果画面没有出现，请确认该展厅包已随
                 <span class="mono">public/exhibits/${escapeHtml(hall.targetDir)}/</span> 一并部署。
               </p>`
            : `<div class="pending-box">
                 <p class="pending-title">待集成 · ${escapeHtml(hall.title)} 仍在制作中</p>
                 <p class="pending-text">
                   该展厅由 <span class="mono">${escapeHtml(hall.task)}</span> 提供，
                   目前尚未交付到本馆目录，因此这里没有可点击的入口。
                   包体到位后，这一页会自动变为可直接试玩的展项。
                 </p>
               </div>`
        }
      </section>`
    : `<section class="section">
        <h2 class="section-title">可玩展厅一览</h2>
        <div class="grid grid--halls">
          ${ctx.halls.map((h) => `
            <a class="hall-mini" href="#/hall/${encodeURIComponent(h.id)}" style="--era-accent:${escapeHtml(h.accent)}">
              <span class="hall-mini-title">${escapeHtml(h.title)}</span>
              <span class="hall-mini-sub mono">${escapeHtml(h.subtitle)}</span>
              <span class="hall-mini-status ${h.status === 'integrated' ? 'is-ok' : 'is-pending'}">
                ${h.status === 'integrated' ? '已并入' : '待集成'}
              </span>
            </a>`).join('')}
        </div>
      </section>`
}`;
}

/** 挂载 3D 场景（失败时降级） */
export async function mountHall(root, ctx, hallId) {
  const stage = root.querySelector('#hall-stage');
  const canvas = root.querySelector('#hall-canvas');
  const loading = root.querySelector('#hall-loading');
  const panel = root.querySelector('#hall-panel');
  if (!stage || !canvas) return;

  // WebGL 能力检测
  const probe = document.createElement('canvas');
  const hasWebGL = !!(probe.getContext('webgl2') || probe.getContext('webgl'));
  if (!hasWebGL) {
    loading.innerHTML = '<p class="pending-title">当前浏览器未启用 WebGL</p><p class="pending-text">3D 展厅无法显示，展品仍可在 <a href="#/catalog">2D 无障碍目录</a> 中完整浏览。</p>';
    loading.classList.add('is-error');
    return;
  }

  let mod;
  try {
    mod = await import('../hall3d.js');
  } catch (err) {
    loading.innerHTML = '<p class="pending-title">3D 模块加载失败</p><p class="pending-text">展品仍可在 <a href="#/catalog">2D 无障碍目录</a> 中完整浏览。</p>';
    loading.classList.add('is-error');
    console.error('[hall] 加载失败', err);
    return;
  }

  const api = mod.buildHallScene(canvas, {
    eras: ctx.eras,
    onSelect: (eraId) => {
      const era = ctx.eras.get(eraId);
      if (!era) return;
      const count = ctx.exhibits.filter((e) => e.era === eraId).length;
      panel.innerHTML = `
        <p class="hall-panel-code mono">${escapeHtml(era.code)}</p>
        <p class="hall-panel-title">${escapeHtml(era.label)}</p>
        <p class="hall-panel-text">${escapeHtml(era.tagline)}</p>
        <p class="hall-panel-count mono">${count} 件展品</p>
        <a class="btn btn-primary btn-sm" href="#/era/${encodeURIComponent(eraId)}">进入展厅</a>`;
    },
  });

  loading.remove();
  if (hallId) api.focusEra(hallId);
  ctx._hall = api;
}
