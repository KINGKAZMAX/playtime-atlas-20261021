/**
 * 首页 · 馆前广场
 */

import { eraDoor, exhibitCard, hallCard } from '../components.js';
import { escapeHtml } from '../../core/format.js';

export function renderHome(ctx) {
  const { exhibits, eras, halls, favorites } = ctx;
  const eraList = [...eras.values()];
  const counts = new Map();
  for (const ex of exhibits) counts.set(ex.era, (counts.get(ex.era) ?? 0) + 1);

  // 每个年代挑一件代表展品：优先游戏类，其次硬件
  const featured = [];
  for (const era of eraList) {
    const inEra = exhibits.filter((e) => e.era === era.id);
    if (!inEra.length) continue;
    const pick = inEra.find((e) => e.kind === 'game') ?? inEra[0];
    featured.push({ exhibit: pick, era });
    if (featured.length >= 6) break;
  }

  const sourceCount = exhibits.reduce((n, e) => n + (e.sourceUrls?.length ?? 0), 0);

  return `
<section class="hero">
  <div class="hero-grid">
    <div class="hero-copy">
      <p class="hero-eyebrow mono">PLAYTIME ATLAS · 馆方原创策展</p>
      <h1 class="hero-title">回响电玩馆</h1>
      <p class="hero-title-en mono">PLAYTIME ATLAS</p>
      <p class="hero-lede">
        一座关于电子游戏时间的常设馆。十个年代门沿时间长廊排开，
        硬件与作品各安其位；你可以检索、筛选、收藏，
        也可以在年代展厅里直接坐下玩一局。
      </p>
      <div class="hero-actions">
        <a class="btn btn-primary" href="#/timeline">开始漫游</a>
        <a class="btn btn-ghost" href="#/catalog">打开 2D 无障碍目录</a>
      </div>
      <dl class="hero-stats">
        <div><dt>年代展厅</dt><dd class="mono">${eraList.length}</dd></div>
        <div><dt>在册展品</dt><dd class="mono">${exhibits.length}</dd></div>
        <div><dt>登记来源</dt><dd class="mono">${sourceCount}</dd></div>
        <div><dt>我的收藏</dt><dd class="mono" data-fav-count>${favorites.size}</dd></div>
      </dl>
    </div>
    <div class="hero-panel" aria-hidden="true">
      <div class="hero-orb"></div>
      <div class="hero-frame"></div>
      <p class="hero-frame-label mono">TIMELINE HALL · 时间长廊</p>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="home-corridor">
  <div class="section-head">
    <h2 class="section-title" id="home-corridor">时间长廊</h2>
    <a class="section-link" href="#/timeline">查看完整长廊 →</a>
  </div>
  <p class="section-desc">十个年代门自 1950 年代排到 2020 年代，每道门后是一间展厅。</p>
  <div class="corridor corridor--compact">
    ${eraList.map((era) => eraDoor(era, counts.get(era.id) ?? 0)).join('')}
  </div>
</section>

<section class="section" aria-labelledby="home-featured">
  <div class="section-head">
    <h2 class="section-title" id="home-featured">本期推荐展品</h2>
    <a class="section-link" href="#/catalog">全部展品 →</a>
  </div>
  <div class="grid grid--cards">
    ${featured.map(({ exhibit, era }) => exhibitCard(exhibit, { era, favorite: favorites.has(exhibit.id) })).join('')}
  </div>
</section>

<section class="section" aria-labelledby="home-halls">
  <div class="section-head">
    <h2 class="section-title" id="home-halls">可玩展厅</h2>
    <span class="section-note mono">08 — 12 号展厅</span>
  </div>
  <p class="section-desc">每个年代展厅都接一个可玩的小展项；仍在制作的展项会如实标注「待集成」。</p>
  <div class="grid grid--halls">
    ${halls.map((h) => hallCard(h)).join('')}
  </div>
</section>

<section class="section section--about" aria-labelledby="home-about">
  <div class="about-strip">
    <h2 class="section-title" id="home-about">关于本馆</h2>
    <p>
      回响电玩馆的展品叙述、视觉方案与展厅动线均为本项目原创设计，
      只借鉴公开博物馆站点在「时间线 / 检索 / 展签」上的做法，不复制任何既有展陈或商业素材。
      展品信息来自公开可查的百科条目与官方资料，每件展品都可点开来源核对。
    </p>
    <ul class="about-facts">
      <li><span class="mono">覆盖</span>1950 年代早期电子实验 → 2020 年代云端与新形态</li>
      <li><span class="mono">立场</span>代表性样本，不宣称穷尽全部作品</li>
      <li><span class="mono">数据</span>${ctx.dataNote}</li>
    </ul>
    <a class="btn btn-ghost" href="#/about">馆方说明与许可</a>
  </div>
</section>`;
}
