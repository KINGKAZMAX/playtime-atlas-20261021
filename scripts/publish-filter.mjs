#!/usr/bin/env node
/**
 * 发布过滤器 —— 构建产物里的“公开台账”清理
 * ------------------------------------------------------------------
 * 线上站点只呈现作品与直接体验。以下内容属于**仓库内台账**，不得随站点发布：
 *   · 随产物打包的 Markdown 台账文档（SOURCES.md / DIFFERENCES.md / LICENSES.md / README.md / QA.md …）
 *   · 页面里指向这些文档的链接与说明文字
 *   · 明确以“来源与许可 / 来源与差异”命名的页面区块
 *
 * 约束：
 *   1. 只清理**构建产物**（docs/works/**），不改动 apps/ 源码副本，也不改动仓库内的台账文件；
 *   2. `.txt` 形式的第三方许可原文（例如字体 OFL-*.txt）**保留** —— 依法需要的许可文本随资产分发；
 *   3. 只删区块与链接，不重写作品的运行逻辑与玩法数据。
 *
 * 用法：node scripts/publish-filter.mjs <dir> [dir...]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** 视为“台账区块”的元素 id。 */
const LEDGER_IDS = [
  'sources', 'source', 'sources-list', 'source-list',
  'licenses', 'licences', 'license',
  'differences', 'sources-and-differences', 'sources-and-licenses',
];

/** 句子里出现这些词，就属于“来源 / 许可 / 差异说明”，整句移除。 */
const LEDGER_PHRASES = [
  '来源与差异', '来源与许可', '来源台账', '来源与出处', '参考来源',
  '逐条附来源', '附来源', '来源说明见', '出处说明', '许可说明',
  // 一刀切的所有权声明：线上不做“全部素材归我所有”的断言
  '全部原创', '均为原创',
];

const ID_RE = new RegExp('^(' + LEDGER_IDS.join('|') + ')$', 'i');
const PHRASE_RE = new RegExp(LEDGER_PHRASES.join('|'));

function walk(dir, fn) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, fn);
    else if (entry.isFile()) fn(p);
  }
}

/** 去掉句子里带台账措辞的部分；句末以 。； 断句。 */
function scrubSentences(html) {
  return html
    .split(/(?<=。)|(?<=；)/)
    .filter((chunk) => !PHRASE_RE.test(chunk))
    .join('');
}

/** 段落级清洗：整段只有台账内容时删掉整段，否则只删句子。 */
function scrubParagraphs(html) {
  return html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/gi, (m, attrs, inner) => {
    if (!PHRASE_RE.test(inner)) return m;
    const cleaned = scrubSentences(inner).replace(/<\/?code[^>]*>/gi, '').trim();
    if (!cleaned || !/[\u4e00-\u9fa5A-Za-z0-9]/.test(cleaned)) return '';
    return '<p' + attrs + '>' + cleaned + '</p>';
  });
}


/** 找出从 openIdx 开始的、标签配对完整的 <div>…</div> 结束位置。 */
function findBalancedDiv(html, openIdx) {
  const re = /<\/div>|<div\b[^>]*>/gi;
  re.lastIndex = openIdx;
  let depth = 0;
  let m;
  while ((m = re.exec(html))) {
    if (m[0] === '</div>') {
      depth--;
      if (depth === 0) return m.index + m[0].length;
    } else {
      depth++;
    }
  }
  return -1;
}

/** 小区块（例如“17 条可核验来源”这样的计数）整块删除。 */
function scrubSmallBlocks(html) {
  let out = '';
  let i = 0;
  while (i < html.length) {
    const idx = html.indexOf('<div', i);
    if (idx < 0) {
      out += html.slice(i);
      break;
    }
    out += html.slice(i, idx);
    const end = findBalancedDiv(html, idx);
    if (end < 0) {
      out += html.slice(idx);
      break;
    }
    const block = html.slice(idx, end);
    const text = block.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (PHRASE_RE.test(text) && text.length <= 40) {
      // 整块丢弃
    } else {
      out += block;
    }
    i = end;
  }
  return out;
}

/** 注释里的台账措辞一并清掉，避免源码里留下“来源与差异”之类的痕迹。 */
function scrubComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, (m) => (PHRASE_RE.test(m) ? '' : m));
}

/** meta 描述里的台账措辞同样清掉。 */
function scrubMeta(html) {
  return html.replace(/(<meta\b[^>]*\bcontent=)(["'])([\s\S]*?)\2/gi, (m, head, q, content) => {
    if (!PHRASE_RE.test(content)) return m;
    const cleaned = scrubSentences(content).replace(/\s+/g, ' ').trim();
    if (!cleaned) return '';
    return head + q + cleaned + q;
  });
}

/** 删除 id 属于台账的区块（section / div），并记录被删掉的 id。 */
function removeLedgerBlocks(html) {
  const removedIds = new Set();
  let out = html;
  for (const tag of ['section', 'div']) {
    const re = new RegExp('<' + tag + '\\b[^>]*\\bid=["\']([^"\']+)["\'][^>]*>[\\s\\S]*?<\\/' + tag + '>', 'gi');
    out = out.replace(re, (m, id) => {
      if (!ID_RE.test(id)) return m;
      const inner = m.slice(m.indexOf('>') + 1, m.lastIndexOf('</' + tag + '>'));
      // 区块内部还有同级标签时不做粗暴截断，避免误删整页
      if (new RegExp('<' + tag + '\\b', 'i').test(inner)) return m;
      removedIds.add(id.toLowerCase());
      return '';
    });
  }
  return { html: out, removedIds };
}

/** 删除指向 .md 台账文档的链接，以及指向已删除区块的导航链接。 */
function removeLedgerLinks(html, removedIds) {
  let out = html;
  // Some exhibits use a hash router rather than an element id for this page.
  out = out.replace(/<a\b[^>]*\b(?:data-route=["']sources["']|href=["']#\/sources["'])[^>]*>[\s\S]*?<\/a>/gi, '');
  // 列表项只放台账链接 → 删掉整项；否则只保留非链接文字
  out = out.replace(/<li\b[^>]*>[\s\S]*?<\/li>/gi, (m) => {
    const links = m.match(/<a\b[^>]*href=["'][^"']+\.md(?:[?#][^"']*)?["'][^>]*>/gi) || [];
    if (!links.length) return m;
    const text = m.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, '').replace(/<[^>]+>/g, '').trim();
    return text ? m.replace(/<a\b[^>]*href=["'][^"']+\.md(?:[?#][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi, '') : '';
  });
  // 剩下的裸链接（指向 .md）→ 删掉
  out = out.replace(/<a\b[^>]*href=["'][^"']+\.md(?:[?#][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi, '');
  // 导航里指向已删除区块的链接 → 删掉
  out = out.replace(/<a\b[^>]*href=["'](#[^"']+)["'][^>]*>[\s\S]*?<\/a>/gi, (m, href) => {
    const id = href.replace(/^#/, '').toLowerCase();
    return removedIds.has(id) ? '' : m;
  });
  return out;
}

function sanitizeHtml(file) {
  const original = fs.readFileSync(file, 'utf8');
  let html = original;
  const res = removeLedgerBlocks(html);
  html = res.html;
  html = removeLedgerLinks(html, res.removedIds);
  html = scrubSmallBlocks(html);
  html = scrubParagraphs(html);
  html = scrubMeta(html);
  html = scrubComments(html);
  if (html !== original) {
    fs.writeFileSync(file, html);
    return true;
  }
  return false;
}

/** 清理一个构建产物目录。 */
export function filterOutput(dir) {
  const stats = { removedDocs: 0, sanitizedHtml: 0 };
  if (!dir || !fs.existsSync(dir)) return stats;
  const toDelete = [];
  walk(dir, (file) => {
    if (/\.md$/i.test(file)) toDelete.push(file);
  });
  for (const file of toDelete) {
    fs.rmSync(file, { force: true });
    stats.removedDocs++;
  }
  walk(dir, (file) => {
    if (/\.html?$/i.test(file) && sanitizeHtml(file)) stats.sanitizedHtml++;
  });
  return stats;
}

function main() {
  const dirs = process.argv.slice(2);
  if (!dirs.length) {
    console.error('[filter] 用法：node scripts/publish-filter.mjs <dir> [dir...]');
    process.exit(1);
  }
  for (const dir of dirs) {
    const stats = filterOutput(dir);
    console.log('[filter] ' + dir + ' —— 删除台账文档 ' + stats.removedDocs + ' 份，清理页面 ' + stats.sanitizedHtml + ' 个');
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
