#!/usr/bin/env node
/**
 * 主页发布检查（gallery-check）
 * ------------------------------------------------------------------
 * 校验 docs/ 发布根：公开数据白名单、11 个公开入口与封面确实存在、
 * 内嵌 JSON 与数据文件一致、禁用文案、工程面板、根绝对资源路径，
 * 以及发布 JS / 脚本语法。任何一项不过一律非零退出。
 *
 * 零依赖、自包含。用法：node scripts/gallery-check.mjs [--root <dir>]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** 公开数据里不允许出现的内部台账 / 工程字段（递归）。 */
const FORBIDDEN_FIELDS = [
  'source', 'sources', 'license', 'licenses', 'differences', 'upstream',
  'build', 'buildCommand', 'outputDir', 'qaNote', 'statusNote',
  'buildNotes', 'notes', 'absolutePathRisks',
];
/** 主页与其引用的 hall 脚本 / 样式里不允许出现的文案。 */
const FORBIDDEN_PHRASES = [
  '关于这些作品', '作品与资产', '工程构建面板', '来源许可', '来源与许可',
  '授权来源', '内部台账',
];
const FORBIDDEN_PHRASES_CI = ['build board'];
/** 不允许存在的工程面板节点 id。 */
const FORBIDDEN_IDS = ['build', 'overview'];

function parseArgs(argv) {
  const out = { root: path.resolve(HERE, '..'), help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--root') {
      const v = argv[++i];
      if (!v) throw new Error('--root 需要一个目录参数');
      out.root = path.resolve(v);
    } else if (a.startsWith('--root=')) out.root = path.resolve(a.slice('--root='.length));
    else throw new Error('未知参数：' + a);
  }
  return out;
}

const HELP = [
  '用法：node scripts/gallery-check.mjs [--root <dir>]',
  '',
  '校验 docs/ 发布根：公开数据白名单、公开入口与封面存在性、内嵌 JSON 与数据文件',
  '一致、禁用文案、工程面板、根绝对资源路径，以及发布 JS / 脚本语法。',
  '',
  '选项：',
  '  --root <dir>   仓库根目录（默认：本脚本所在目录的上一级）',
  '  -h, --help    显示本帮助',
  '',
  '输出：单行 JSON（ok / checks / errors）。ok=false 时退出码为 1。',
  '',
].join('\n');

function isSafeRel(p) {
  if (typeof p !== 'string' || !p.trim()) return false;
  if (p.includes('\0') || p.includes('\\')) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
  if (p.startsWith('/')) return false;
  const parts = p.split('/');
  if (parts.some((s) => s === '' || s === '.' || s === '..')) return false;
  return true;
}

function isInside(base, target) {
  const b = path.resolve(base);
  const t = path.resolve(target);
  return t === b || t.startsWith(b + path.sep);
}

function safeJoin(base, rel) {
  if (!isSafeRel(rel)) return null;
  const abs = path.resolve(base, rel);
  return isInside(base, abs) ? abs : null;
}

function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (typeof a !== 'object') return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

function listFiles(dir, exts) {
  const out = [];
  const walk = (d) => {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && exts.some((x) => e.name.toLowerCase().endsWith(x))) out.push(p);
    }
  };
  walk(dir);
  return out.sort();
}

function rel(root, p) {
  const r = path.relative(root, p);
  return r.startsWith('..') ? p : r;
}

function parseAttrs(tag) {
  const attrs = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m;
  while ((m = re.exec(tag))) attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? '';
  return attrs;
}

/** 找出 id=... 且 type=application/json 的 script 块（属性顺序可变）。 */
function findJsonBlocks(html, id) {
  const out = [];
  const re = /<script\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const attrs = parseAttrs(m[0]);
    if (attrs.id !== id) continue;
    if (String(attrs.type || '').toLowerCase() !== 'application/json') continue;
    const start = m.index + m[0].length;
    const end = html.indexOf('</script>', start);
    const stop = end === -1 ? html.length : end;
    out.push({ start, end: stop, body: html.slice(start, stop) });
  }
  return out;
}

function scanForbiddenFields(value, trail, out) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => scanForbiddenFields(v, trail + '[' + i + ']', out));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [k, v] of Object.entries(value)) {
    if (FORBIDDEN_FIELDS.includes(k)) out.push({ path: trail + '.' + k });
    scanForbiddenFields(v, trail + '.' + k, out);
  }
}

function scanPhrases(text, file, out) {
  for (const p of FORBIDDEN_PHRASES) if (text.includes(p)) out.push({ file, phrase: p });
  const lower = text.toLowerCase();
  for (const p of FORBIDDEN_PHRASES_CI) if (lower.includes(p)) out.push({ file, phrase: p });
}

function scanAbsolutePaths(text, file, kind, out) {
  const hits = [];
  let re;
  if (kind === 'html') re = /(?:src|href)\s*=\s*["'](\/[^"']*)["']/g;
  else if (kind === 'css') re = /url\(\s*["']?(\/[^"')]*)/g;
  else re = /["']\/(?:assets|works|images|img|static|media|data|fonts)\//g;
  let m;
  while ((m = re.exec(text))) hits.push(m[1] || m[0]);
  for (const h of hits) out.push({ file, path: h });
}

function nodeCheck(file) {
  const res = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  const msg = (res.stderr || res.stdout || '').trim().split('\n').slice(0, 3).join(' ').trim();
  return { ok: res.status === 0, message: msg };
}

function bashCheck(file) {
  const res = spawnSync('bash', ['-n', file], { encoding: 'utf8' });
  const msg = (res.stderr || res.stdout || '').trim().split('\n').slice(0, 3).join(' ').trim();
  return { ok: res.status === 0, message: msg };
}

function finish(root, checks, errors) {
  const ok = errors.length === 0;
  process.stdout.write(JSON.stringify({ ok, root, checks, errors }) + '\n');
  return ok ? 0 : 1;
}

function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (e) {
    process.stdout.write(JSON.stringify({ ok: false, errors: [{ message: String(e.message || e) }] }) + '\n');
    return 2;
  }
  if (args.help) { process.stdout.write(HELP); return 0; }

  const root = args.root;
  const docsDir = path.join(root, 'docs');
  const hallDir = path.join(root, 'hall');
  const errors = [];
  const checks = [];
  const add = (id, ok, note) => checks.push({ id, ok, ...(note ? { note } : {}) });
  const fail = (check, message, file, p) => {
    const e = { check, message };
    if (file) e.file = file;
    if (p) e.path = p;
    errors.push(e);
  };

  // 1) 发布主页存在
  const docsIndex = path.join(docsDir, 'index.html');
  if (!fs.existsSync(docsIndex)) {
    fail('docs-index', '缺少发布主页 docs/index.html', rel(root, docsIndex));
    add('docs-index', false);
    return finish(root, checks, errors);
  }
  add('docs-index', true, rel(root, docsIndex));
  const html = fs.readFileSync(docsIndex, 'utf8');

  // 2) 内嵌 JSON 标记必须唯一
  const blocks = {};
  for (const id of ['works-data', 'build-report']) {
    const found = findJsonBlocks(html, id);
    blocks[id] = found;
    if (found.length !== 1) {
      fail('markers', '主页内 id="' + id + '" 的 application/json 标记' + (found.length ? '重复' : '缺失')
        + '（找到 ' + found.length + ' 个）', rel(root, docsIndex));
    }
  }
  add('markers', blocks['works-data'].length === 1 && blocks['build-report'].length === 1);
  if (blocks['works-data'].length !== 1 || blocks['build-report'].length !== 1) return finish(root, checks, errors);

  // 3) 内嵌 JSON 可解析
  let embeddedWorks = null, embeddedReport = null;
  try { embeddedWorks = JSON.parse(blocks['works-data'][0].body); } catch (e) {
    fail('embedded-json', 'works-data 解析失败：' + (e.message || e), rel(root, docsIndex));
  }
  try { embeddedReport = JSON.parse(blocks['build-report'][0].body); } catch (e) {
    fail('embedded-json', 'build-report 解析失败：' + (e.message || e), rel(root, docsIndex));
  }
  add('embedded-json', !!embeddedWorks && !!embeddedReport);
  if (!embeddedWorks || !embeddedReport) return finish(root, checks, errors);

  const embeddedList = Array.isArray(embeddedWorks) ? embeddedWorks
    : (Array.isArray(embeddedWorks.works) ? embeddedWorks.works : null);
  const embeddedSections = Array.isArray(embeddedWorks) ? []
    : (Array.isArray(embeddedWorks.sections) ? embeddedWorks.sections : []);
  if (!embeddedList) {
    fail('embedded-json', 'works-data 既不是数组也不含 works 数组', rel(root, docsIndex));
    return finish(root, checks, errors);
  }

  // 4) 数据文件与内嵌一致
  const dataWorksFile = path.join(docsDir, 'data', 'works.json');
  const dataReportFile = path.join(docsDir, 'data', 'build-report.json');
  let dataWorks = null, dataReport = null;
  try { dataWorks = readJson(dataWorksFile); } catch (e) {
    fail('data-files', '无法解析 data/works.json：' + (e.message || e), rel(root, dataWorksFile));
  }
  try { dataReport = readJson(dataReportFile); } catch (e) {
    fail('data-files', '无法解析 data/build-report.json：' + (e.message || e), rel(root, dataReportFile));
  }
  add('data-files', !!dataWorks && !!dataReport);
  const dataList = Array.isArray(dataWorks) ? dataWorks
    : (dataWorks && Array.isArray(dataWorks.works) ? dataWorks.works : null);
  if (!dataList) {
    fail('data-files', 'data/works.json 既不是数组也不含 works 数组', rel(root, dataWorksFile));
  } else if (!deepEqual(dataList, embeddedList)) {
    fail('payload-consistency', 'data/works.json 与主页内嵌 works-data 的作品列表不一致', rel(root, dataWorksFile));
  }
  if (dataReport && !deepEqual(dataReport, embeddedReport)) {
    fail('payload-consistency', 'data/build-report.json 与主页内嵌 build-report 不一致', rel(root, dataReportFile));
  }
  add('payload-consistency', !errors.some((e) => e.check === 'payload-consistency'));

  // 5) 与根清单比对：唯一 id、无遗漏、无额外隐藏项目
  let manifest = null;
  try { manifest = readJson(path.join(root, 'works.json')); } catch (e) {
    fail('manifest', '无法解析根清单 works.json：' + (e.message || e), 'works.json');
  }
  const expectedWorks = manifest && Array.isArray(manifest.works)
    ? manifest.works.filter((w) => w && w.publish !== false) : null;
  const expectedSections = manifest && Array.isArray(manifest.sections)
    ? manifest.sections.filter((s) => s && s.publish !== false) : null;
  const ids = embeddedList.map((w) => (w && w.id) || '');
  const uniq = new Set(ids);
  if (uniq.size !== ids.length) {
    fail('unique-ids', '公开作品 id 不唯一（共 ' + ids.length + ' 条，去重后 ' + uniq.size + ' 条）');
  }
  add('unique-ids', uniq.size === ids.length);

  if (expectedWorks) {
    const expIds = expectedWorks.map((w) => w.id);
    const missing = expIds.filter((id) => !uniq.has(id));
    const extra = ids.filter((id) => !expIds.includes(id));
    for (const id of missing) fail('manifest-consistency', '根清单中已发布的作品未出现在公开数据：' + id);
    for (const id of extra) fail('manifest-consistency', '公开数据出现根清单之外的（或未发布的）作品：' + id);
    add('manifest-consistency', !missing.length && !extra.length, '公开 ' + ids.length + ' 件');
  } else {
    add('manifest-consistency', false, '缺少根清单 works.json，无法核对公开集合');
  }

  if (expectedSections) {
    const expSec = expectedSections.map((s) => s.id).sort();
    const gotSec = embeddedSections.map((s) => s.id).sort();
    for (const id of expSec) if (!gotSec.includes(id)) fail('sections', '公开数据缺少已发布分区：' + id);
    for (const id of gotSec) if (!expSec.includes(id)) fail('sections', '公开数据出现未发布分区：' + id);
    add('sections', expSec.length === gotSec.length && expSec.every((x) => gotSec.includes(x)), expSec.join(','));
  } else {
    add('sections', false, '缺少根清单分区，无法核对公开分区');
  }

  // 6) 每件作品：分区 / 入口 / 封面 / 状态诚实性
  let entryBad = 0, coverBad = 0, secBad = 0, stateBad = 0;
  const secIds = new Set(embeddedSections.map((s) => s.id));
  for (const w of embeddedList) {
    const id = w.id || '(无 id)';
    if (!secIds.has(w.section)) { fail('work-section', '作品 ' + id + ' 的分区 ' + w.section + ' 不在公开分区中'); secBad++; }
    if (!isSafeRel(w.entry)) {
      fail('entry', '作品 ' + id + ' 的入口路径不安全（根绝对路径或含 ../）：' + w.entry);
      entryBad++;
    } else {
      const abs = safeJoin(docsDir, w.entry);
      if (!abs || !fileExists(abs)) { fail('entry', '作品 ' + id + ' 的入口文件不存在：' + w.entry, 'docs', w.entry); entryBad++; }
    }
    if (!isSafeRel(w.cover)) {
      fail('cover', '作品 ' + id + ' 的封面路径不安全：' + w.cover);
      coverBad++;
    } else {
      const abs = safeJoin(docsDir, w.cover);
      if (!abs || !fileExists(abs)) { fail('cover', '作品 ' + id + ' 的封面文件不存在：' + w.cover, 'docs', w.cover); coverBad++; }
    }
    if (w.published === true && w.entryExists !== true) {
      fail('state', '作品 ' + id + ' 标记 published 但入口不存在', 'docs', w.entry);
      stateBad++;
    }
    if (w.published === true && !['built', 'fallback', 'built-no-entry'].includes(w.buildState)) {
      fail('state', '作品 ' + id + ' 标记 published 但 buildState=' + w.buildState + ' 与既有状态不符');
      stateBad++;
    }
    // 监督指令 §二：声明必须与线上实测 HTTP 码逐条对齐
    //   · online 只能是 HTTP 状态码（number）或 null；
    //   · status=ready 必须对应 200；
    //   · 入口不存在时 online 必须是 null。
    if (w.online !== null && !Number.isInteger(w.online)) {
      fail('state', '作品 ' + id + ' 的 online 必须是 HTTP 状态码或 null，实际为 ' + JSON.stringify(w.online), 'docs', w.entry);
      stateBad++;
    }
    if (w.status === 'ready' && w.online !== 200) {
      fail('state', '作品 ' + id + ' 标 status=ready 但线上实测码为 ' + JSON.stringify(w.online), 'docs', w.entry);
      stateBad++;
    }
    if (w.entryExists === false && w.online !== null) {
      fail('state', '作品 ' + id + ' 入口不存在但 online=' + JSON.stringify(w.online), 'docs', w.entry);
      stateBad++;
    }
    if (w.published === true && !Number.isInteger(w.online)) {
      fail('state', '作品 ' + id + ' 已发布但缺少线上实测 HTTP 码（online=null）', 'docs', w.entry);
      stateBad++;
    }
  }
  add('work-section', secBad === 0);
  add('entry', entryBad === 0, embeddedList.length + ' 个公开入口');
  add('cover', coverBad === 0, embeddedList.length + ' 个封面');
  add('state-honesty', stateBad === 0);

  // 7) fallback 不得被伪造成 built
  const repList = Array.isArray(embeddedReport.works) ? embeddedReport.works : [];
  const repById = new Map(repList.map((r) => [r.id, r]));
  let fbBad = 0;
  for (const w of embeddedList) {
    const rep = repById.get(w.id);
    if (!rep) continue;
    if (rep.buildState === 'fallback' && w.buildState !== 'fallback') {
      fail('fallback-honesty', '作品 ' + w.id + ' 的报告状态是 fallback，公开数据却写成 ' + w.buildState);
      fbBad++;
    }
    if (rep.entryExists === true && w.entryExists === false) {
      fail('fallback-honesty', '作品 ' + w.id + ' 报告称入口存在，公开数据却写成不存在');
      fbBad++;
    }
  }
  add('fallback-honesty', fbBad === 0);

  // 8) 公开数据不得含内部台账字段（递归）
  const fieldHits = [];
  scanForbiddenFields(embeddedWorks, 'works-data', fieldHits);
  scanForbiddenFields(embeddedReport, 'build-report', fieldHits);
  if (dataWorks) scanForbiddenFields(dataWorks, 'data/works.json', fieldHits);
  if (dataReport) scanForbiddenFields(dataReport, 'data/build-report.json', fieldHits);
  for (const h of fieldHits) fail('no-internal-fields', '公开数据含内部字段 ' + h.path, h.path.split('.')[0]);
  add('no-internal-fields', fieldHits.length === 0, fieldHits.length ? fieldHits.length + ' 处' : '干净');

  // 9) 禁用文案（主页 + 引用的 hall 脚本 / 样式）
  const textFiles = [docsIndex];
  for (const dir of [path.join(docsDir, 'assets'), path.join(hallDir, 'assets')]) {
    for (const f of listFiles(dir, ['.js', '.css'])) textFiles.push(f);
  }
  const hallIndex = path.join(hallDir, 'index.html');
  if (fs.existsSync(hallIndex)) textFiles.push(hallIndex);
  const copyHits = [];
  for (const f of textFiles) scanPhrases(fs.readFileSync(f, 'utf8'), rel(root, f), copyHits);
  for (const h of copyHits) fail('forbidden-copy', '出现禁用文案「' + h.phrase + '」', h.file);
  add('forbidden-copy', copyHits.length === 0, '扫描 ' + textFiles.length + ' 个文件');

  // 10) 工程面板节点不得存在
  let idBad = 0;
  for (const id of FORBIDDEN_IDS) {
    const re = new RegExp('id\\s*=\\s*["\']' + id + '["\']', 'i');
    if (re.test(html)) { fail('no-engineering-panel', '主页仍存在工程面板节点 id="' + id + '"', rel(root, docsIndex)); idBad++; }
  }
  add('no-engineering-panel', idBad === 0);

  // 11) 根绝对资源路径（主页 + 相关 hall 资源；不递归进 11 个游戏 bundle）
  const absHits = [];
  for (const f of textFiles) {
    const ext = path.extname(f).toLowerCase();
    const kind = ext === '.html' ? 'html' : (ext === '.css' ? 'css' : 'js');
    scanAbsolutePaths(fs.readFileSync(f, 'utf8'), rel(root, f), kind, absHits);
  }
  for (const h of absHits) fail('no-absolute-paths', '根绝对资源路径 ' + h.path, h.file);
  add('no-absolute-paths', absHits.length === 0, absHits.length ? absHits.length + ' 处' : '干净');

  // 12) 语法：发布的 hall JS + 两个新 mjs + loop bash -n
  const jsFiles = [
    ...listFiles(path.join(docsDir, 'assets'), ['.js']),
    ...listFiles(path.join(hallDir, 'assets'), ['.js']),
    path.join(root, 'scripts', 'refresh-gallery.mjs'),
    path.join(root, 'scripts', 'gallery-check.mjs'),
  ];
  let synBad = 0, synSkipped = 0;
  for (const f of jsFiles) {
    if (!fs.existsSync(f)) { synSkipped++; continue; }
    let res;
    if (f.endsWith('.mjs')) {
      res = nodeCheck(f);
    } else {
      // hall 的 JS 以 type="module" 加载：复制为 .mjs 后再做语法检查
      const tmp = path.join(os.tmpdir(), 'gallery-check-' + process.pid + '-' + path.basename(f) + '.mjs');
      fs.copyFileSync(f, tmp);
      try { res = nodeCheck(tmp); } finally { fs.rmSync(tmp, { force: true }); }
    }
    if (!res.ok) { fail('syntax', 'node --check 失败：' + res.message, rel(root, f)); synBad++; }
  }
  const loopSh = path.join(root, 'scripts', 'minimax-gallery-loop.sh');
  if (fs.existsSync(loopSh)) {
    const res = bashCheck(loopSh);
    if (!res.ok) { fail('syntax', 'bash -n 失败：' + res.message, rel(root, loopSh)); synBad++; }
  } else synSkipped++;
  add('syntax', synBad === 0, '检查 ' + (jsFiles.length - synSkipped) + ' 个 JS'
    + (synSkipped ? '，跳过 ' + synSkipped + ' 个缺失文件' : ''));

  return finish(root, checks, errors);
}

process.exit(main());
