#!/usr/bin/env node
/**
 * 来源核验档案页生成器
 * 输入：apps/research-top3/data.json
 * 输出：site/research/index.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC = path.join(ROOT, 'apps', 'research-top3', 'data.json');
const OUT_DIR = path.join(ROOT, 'docs', 'research');
const OUT = path.join(OUT_DIR, 'index.html');

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const li = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('[research] 数据缺失：', path.relative(ROOT, SRC));
    process.exit(1);
  }
  const d = JSON.parse(fs.readFileSync(SRC, 'utf8'));

  const cases = d.cases.map((c) => {
    const meta = [
      ['原作者', `${c.author}${c.handle ? `（${c.handle}）` : ''}`],
      ['原帖 URL', c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.url)}</a>` : '未在公开端点中锁定，待补'],
      ['平台 / 时间', `${c.platform} · ${c.date}`],
      ['互动量快照', c.metrics],
      ['模型归属', c.model],
      ['本批承接任务', c.assignedTo],
    ]
      .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v}</dd></div>`)
      .join('');

    return `
  <details class="card" open>
    <summary>
      <span class="no">CASE ${esc(c.no)}</span>
      <span class="nm">${esc(c.name)}</span>
      <span class="me">${esc(c.nameEn)}</span>
      <span class="mt">${esc(c.metrics)}</span>
    </summary>
    <div class="cbody">
      <dl class="kv">${meta}</dl>
      <div>
        <h4>模型归属原文证据</h4>
        <blockquote>${esc(c.attribution)}</blockquote>
      </div>
      <div>
        <h4>页面结构拆解</h4>
        ${li(c.structure.map((s) => esc(s)))}
      </div>
      <div>
        <h4>关键交互</h4>
        ${li(c.interactions.map((s) => esc(s)))}
      </div>
      <div>
        <h4>资产许可与授权边界</h4>
        <p>${esc(c.license)}</p>
      </div>
      <div>
        <h4>本批改编说明</h4>
        <p>${esc(c.note)}</p>
      </div>
    </div>
  </details>`;
  }).join('\n');

  const platformRows = d.platformNotes
    .map(
      (p) => `<tr>
      <td><b>${esc(p.platform)}</b></td>
      <td>${esc(p.visible)}</td>
      <td>${esc(p.hidden)}</td>
    </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(d.title)} · ${esc(d.titleEn)} | PLAYTIME ATLAS</title>
<meta name="description" content="MiniMax M3.1 Flash 公开案例逐条核验档案：原作者、原帖 URL、互动量快照、模型归属证据与改编边界。" />
<meta name="theme-color" content="#0a1020" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230a1020'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23ff6a2b' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%234fd6e8'/%3E%3C/svg%3E" />
<link rel="stylesheet" href="../assets/page.css" />
</head>
<body>
<div class="wrap">
  <nav class="crumbs"><a href="../">← 作品总廊</a><span>/</span><span>来源档案</span></nav>

  <header class="phead">
    <p class="kicker">${esc(d.titleEn)}</p>
    <h1>${esc(d.title)}</h1>
    <p class="sub">${esc(d.subtitle)}</p>
    <p class="desc">${esc(d.method)} 所有平台指标均为 <b>${esc(d.observedAt)}</b> 观测快照。${esc(d.comparability)}</p>
  </header>

  ${cases}

  <div class="panel warn">
    <h3>素材红线（复刻与收录前必读）</h3>
    ${li(d.redlines.map((s) => esc(s)))}
  </div>

  <div class="panel">
    <h3>平台口径与不可比性</h3>
    <table class="tbl">
      <thead><tr><th>平台</th><th>可见指标</th><th>本次不可见项</th></tr></thead>
      <tbody>${platformRows}</tbody>
    </table>
  </div>

  <div class="panel info">
    <h3>收录原则</h3>
    <p>本档案只记录<b>可核验的公开信息</b>与<b>自有的改编决策</b>。引用第三方内容仅作研究引用，<b>引用不等于授权</b>；本批所有实现均为独立重新实现，未复制任何作者代码或商业游戏素材。</p>
  </div>

  <footer class="foot">
    <p>PLAYTIME ATLAS · 回响电玩馆 — 来源核验档案</p>
    <p>生成于 ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC · 部署总控 14-publish</p>
  </footer>
</div>
</body>
</html>
`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log('[research] 生成', path.relative(ROOT, OUT));
}

main();
