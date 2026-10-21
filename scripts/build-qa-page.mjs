#!/usr/bin/env node
/**
 * 全作品验收报告页生成器
 * 输入：apps/qa-report/QA-MATRIX.md 与 apps/qa-report/issues.json（由 13-qa-curation 交付）
 * 输出：site/qa/index.html
 * 上游数据缺失时以非零码退出 —— 大厅据此把该条标记为“未就绪”。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC_DIR = path.join(ROOT, 'apps', 'qa-report');
const MD = path.join(SRC_DIR, 'QA-MATRIX.md');
const ISSUES = path.join(SRC_DIR, 'issues.json');
const OUT_DIR = path.join(ROOT, 'site', 'qa');
const OUT = path.join(OUT_DIR, 'index.html');

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** 极简 Markdown → HTML（够用即可：标题 / 表格 / 列表 / 代码 / 引用 / 强调） */
function md2html(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;

  const inline = (s) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/(^|[\s(])(https?:\/\/[^\s)]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');

  while (i < lines.length) {
    const line = lines[i];

    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre style="overflow-x:auto;background:rgba(255,255,255,.04);border:1px solid rgba(243,237,225,.09);border-radius:3px;padding:13px 15px;font:12px/1.7 var(--mono);color:#97a0b6">${esc(buf.join('\n'))}</pre>`);
      continue;
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const lvl = h[1].length;
      out.push(`<h${lvl} style="margin:${lvl === 1 ? '30px 0 12px' : '22px 0 9px'};font-size:${18 - lvl * 1.4}px;font-weight:700;border-bottom:${lvl <= 2 ? '1px solid rgba(243,237,225,.13)' : 'none'};padding-bottom:${lvl <= 2 ? '7px' : '0'}">${inline(h[2])}</h${lvl}>`);
      i++;
      continue;
    }

    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const rows = [];
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(
        `<div style="overflow-x:auto"><table class="tbl"><thead><tr>${head
          .map((c) => `<th>${inline(c)}</th>`)
          .join('')}</tr></thead><tbody>${rows
          .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
          .join('')}</tbody></table></div>`
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      out.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
      out.push(`<ol style="margin:0 0 10px;padding-left:22px;font-size:13.5px;color:#97a0b6;line-height:1.8">${items
        .map((t) => `<li>${inline(t)}</li>`)
        .join('')}</ol>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote style="margin:0 0 12px;padding:12px 16px;border-left:2px solid #4fd6e8;background:rgba(79,214,232,.06);font-size:13px;color:#97a0b6;line-height:1.8;border-radius:0 3px 3px 0">${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|\s*[-*]\s|\s*\d+\.\s|>|\s*\|)/.test(lines[i])) {
      buf.push(lines[i++]);
    }
    out.push(`<p style="margin:0 0 11px;font-size:13.5px;color:#97a0b6;line-height:1.85">${inline(buf.join(' '))}</p>`);
  }
  return out.join('\n');
}

function main() {
  if (!fs.existsSync(MD)) {
    console.error('[qa] 上游 QA-MATRIX.md 尚未交付：', path.relative(ROOT, MD));
    process.exit(1);
  }
  const md = fs.readFileSync(MD, 'utf8');
  const issues = fs.existsSync(ISSUES) ? JSON.parse(fs.readFileSync(ISSUES, 'utf8')) : [];

  const list = Array.isArray(issues) ? issues : issues.issues || [];
  const issuesHtml = list.length
    ? `<div class="panel warn"><h3>问题清单（${list.length} 条）</h3><ul>${list
        .map((it) => {
          const sev = String(it.severity || it.priority || '—');
          const title = esc(it.title || it.summary || it.id || '未命名问题');
          const where = it.work || it.target || it.file ? ` <span class="tag">${esc(it.work || it.target || it.file)}</span>` : '';
          const fix = it.fix || it.recommendation ? `<br><span style="color:#626c83">建议修复：${esc(it.fix || it.recommendation)}</span>` : '';
          return `<li><span class="tag pk">${esc(sev)}</span> ${title}${where}${fix}</li>`;
        })
        .join('')}</ul></div>`
    : '<div class="panel info"><h3>问题清单</h3><p>上游未提供结构化问题清单；下方为完整验收矩阵原文。</p></div>';

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>全作品验收报告 · QA MATRIX | PLAYTIME ATLAS</title>
<meta name="description" content="对本批全部作品的实机验收：桌面与移动端、开始/暂停/重置、存档、键盘焦点、控制台错误、资源 404、子路径与原创差异审计。" />
<meta name="theme-color" content="#0a1020" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230a1020'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='%23ff6a2b' stroke-width='2'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%234fd6e8'/%3E%3C/svg%3E" />
<link rel="stylesheet" href="../assets/page.css" />
</head>
<body>
<div class="wrap">
  <nav class="crumbs"><a href="../">← 作品总廊</a><span>/</span><span>验收报告</span></nav>

  <header class="phead">
    <p class="kicker">QA MATRIX</p>
    <h1>全作品验收与差异审计</h1>
    <p class="sub">FLASH-SHOWCASE-20261021 · 00—13</p>
    <p class="desc">本报告由 13-qa-curation 以<b>浏览器实际测试</b>方式产出，覆盖桌面与移动端、开始 / 暂停 / 重置、存档、键盘焦点、控制台错误、资源 404、页面子路径、模型导出、原创差异与来源许可。缺失项记为未通过，不记为通过。</p>
  </header>

  ${issuesHtml}

  <div class="panel">
    <h3>验收矩阵原文</h3>
    <div>${md2html(md)}</div>
  </div>

  <footer class="foot">
    <p>PLAYTIME ATLAS · 回响电玩馆 — 验收报告</p>
    <p>生成于 ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC · 部署总控 14-publish</p>
  </footer>
</div>
</body>
</html>
`;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log('[qa] 生成', path.relative(ROOT, OUT));
}

main();
