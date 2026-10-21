/**
 * 馆方说明 · #/about
 *
 * 说明本馆的设计立场、数据来源、许可与已知限制。
 */

import { escapeHtml } from '../../core/format.js';

export function renderAbout(ctx) {
  const remote = ctx.remoteCount;
  const local = ctx.localCount;
  const sourceLabel = ctx.dataSource === 'remote'
    ? '策展目录：05-museum-research 交付的 catalog.json'
    : ctx.dataSource === 'merged'
      ? `策展目录：05-museum-research 的 catalog.json 与本馆本地初版合并（外部 ${remote} 条 / 本地 ${local} 条）`
      : '策展目录：本馆本地初版（05-museum-research 的 catalog.json 尚未并入）';

  const hallRows = ctx.halls.map((h) => `
    <tr>
      <td>${escapeHtml(h.title)}</td>
      <td class="mono">${escapeHtml(h.task)}</td>
      <td>${escapeHtml(h.subtitle)}</td>
      <td><span class="pill ${h.status === 'integrated' ? 'pill--ok' : 'pill--pending'}">${h.status === 'integrated' ? '已并入' : '待集成'}</span></td>
    </tr>`).join('');

  return `
<section class="page-head page-head--slim">
  <p class="page-eyebrow mono">ABOUT THE MUSEUM</p>
  <h1 class="page-title" data-i18n="about.title">馆方说明</h1>
  <p class="page-lede" data-i18n="about.lede">
    回响电玩馆是一个关于电子游戏时间的原创策展项目。馆名、叙述、视觉与展厅动线由本项目独立设计，
    只在「时间线 / 检索 / 展签 / 可玩入口」这类通行做法上参考了公开博物馆站点的思路。
  </p>
</section>

<div class="about-grid">
  <section class="about-card">
    <h2 class="section-title" data-i18n="about.stance">策展立场</h2>
    <ul class="about-list">
      <li>馆藏是<strong>代表性样本</strong>，覆盖 1950 年代早期电子实验到 2020 年代云端与新形态，
          但不宣称穷尽全部作品，也不以「完整」自居。</li>
      <li>每件展品都登记了可点开核对的公开来源；馆方叙述为原创改写，与来源原文分开表述。</li>
      <li>不复制 ROM、不使用商业游戏美术、不复刻任何品牌标识或产品外形。</li>
      <li>2D 无障碍目录是完整可用的主路径；3D 展厅是可选增强，关闭后不影响任何展签信息。</li>
    </ul>
  </section>

  <section class="about-card">
    <h2 class="section-title" data-i18n="about.data">数据与集成状态</h2>
    <dl class="plaque-list">
      <div><dt>${escapeHtml(sourceLabel)}</dt><dd class="mono">馆藏 ${ctx.exhibits.length} 件</dd></div>
      <div><dt>美术资产</dt><dd class="mono">${ctx.artNote}</dd></div>
      <div><dt>3D 展厅</dt><dd class="mono">${ctx.hallNote}</dd></div>
      <div><dt>字体</dt><dd class="mono">仅系统字体，无外部请求</dd></div>
    </dl>
  </section>

  <section class="about-card">
    <h2 class="section-title" data-i18n="about.halls">可玩展厅接入状态</h2>
    <div class="table-scroll">
      <table class="table">
        <caption class="visually-hidden">可玩展厅接入状态</caption>
        <thead><tr><th scope="col">展厅</th><th scope="col">来源任务</th><th scope="col">年代</th><th scope="col">状态</th></tr></thead>
        <tbody>${hallRows}</tbody>
      </table>
    </div>
    <p class="muted">「待集成」表示对应任务的包体尚未交付，本馆不会渲染无法使用的假入口。</p>
  </section>

  <section class="about-card">
    <h2 class="section-title" data-i18n="about.licenses">素材与许可</h2>
    <ul class="about-list">
      <li>展签图形、年代海报、底纹与馆徽：全部由本项目脚本程序化生成的原创 SVG，许可随本项目分发。</li>
      <li>3D 展厅中的硬件体块：用基础几何体现场拼装的原创简化造型，与任何真实产品外形不同。</li>
      <li>展品条目中的作品名、厂商名仅用于史实指涉，商标权利归各自权利人所有。</li>
      <li>正文与界面文案为原创撰写，未复制任何既有博物馆的文字。</li>
    </ul>
    <p class="muted">详细清单见仓库中的 <span class="mono">LICENSES.md</span> 与 <span class="mono">SOURCES.md</span>。</p>
  </section>

  <section class="about-card about-card--wide">
    <h2 class="section-title" data-i18n="about.limits">已知限制</h2>
    <ul class="about-list">
      <li>馆内 2D 展厅在早期年代的收录密度高于近年；近年条目仍在持续补充。</li>
      <li>「年代」划分是本馆为了叙事清晰而做的编辑判断，并非唯一标准切法。</li>
      <li>3D 展厅为桌面浏览器体验，触屏设备会看到提示并引导至 2D 目录；VR 相关展项在本馆仅为桌面交互演示，
          不代表对头显设备的支持。</li>
      <li>收藏与参观足迹只存在浏览器本地，不跨设备同步，也不做任何上报。</li>
      <li>本馆未接入在线服务，所有内容离线可用；唯一的外部链接是展品来源，供核对使用。</li>
    </ul>
  </section>
</div>`;
}
