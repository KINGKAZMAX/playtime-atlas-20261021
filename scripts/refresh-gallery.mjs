#!/usr/bin/env node
/**
 * 轻量主页发布工具（refresh-gallery）
 * ------------------------------------------------------------------
 * 把 hall/ 的静态内容发布到 docs/，并把作品数据净化后写进主页内嵌 JSON。
 *
 * 边界（重要）：
 *   · 只读：根 works.json、docs/data/works.json、docs/data/build-report.json、hall/**；
 *   · **不构建作品**：docs/works/** 快照原样保留，绝不清空 docs/、不重建单件作品；
 *   · 复制 hall/ 时禁止覆盖 docs/works、docs/data，禁止符号链接逃逸出 hall/；
 *   · 公开数据只保留白名单字段，剔除来源 / 许可 / 差异 / 构建等内部台账与工程细节；
 *   · 先校验后落盘：数据不合法直接失败，绝不"复制一半才发现坏数据"；
 *   · 不负责用正则改写 hall 主页文案（那是模型/作者的活），检查失败如实报告。
 *
 * 用法：node scripts/refresh-gallery.mjs [--root <dir>]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** 公开作品白名单（顺序即输出顺序）。 */
const PUBLIC_WORK_FIELDS = [
  'id', 'title', 'subtitle', 'description', 'entry', 'section', 'era', 'kind',
  'tags', 'controls', 'cover', 'playable', 'status', 'qaState', 'buildState',
  'entryExists', 'published', 'online', 'bytes', 'artifacts',
];
/** 公开元信息白名单。 */
const PUBLIC_META_FIELDS = ['project', 'projectCn', 'hall', 'hallEn', 'repo', 'batch', 'updated'];
/** 公开分区白名单。 */
const PUBLIC_SECTION_FIELDS = ['id', 'label', 'labelEn', 'desc'];
/** 公开报告：每件作品只留渲染必需状态。 */
const PUBLIC_REPORT_WORK_FIELDS = ['id', 'buildState', 'entryExists', 'online'];
/** 公开报告汇总白名单。 */
const PUBLIC_TOTAL_FIELDS = ['total', 'built', 'fallback', 'unavailable', 'bytes'];

/** 不随站点发布的开发文件（文件名 / 扩展名）。 */
const DEV_FILE_NAMES = new Set(['cover-map.json', 'package.json', 'package-lock.json', 'tsconfig.json', 'Thumbs.db']);
const DEV_FILE_RE = /\.(md|log|map|bak|orig|rej|tmp|swp)$/i;
const SKIP_DIRS = new Set(['node_modules', '.git', '.cache', '__pycache__']);

// ------------------------------------------------------------------ utils

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
    else throw new Error(`未知参数：${a}`);
  }
  return out;
}

const HELP = `用法：node scripts/refresh-gallery.mjs [--root <dir>]

把 hall/ 的静态内容与净化后的作品数据发布到 docs/（不构建作品、不动 docs/works 快照）。

选项：
  --root <dir>   仓库根目录（默认：本脚本所在目录的上一级）
  -h, --help    显示本帮助

输出：单行 JSON 状态。成功时 ok=true；失败时 ok=false 且 errors 列出具体问题，退出码非 0。
`;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function isSafeRel(p) {
  if (typeof p !== 'string' || !p.trim()) return false;
  if (p.includes('\0') || p.includes('\\')) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;      // http: / data: / file:
  if (p.startsWith('/')) return false;                     // 根绝对路径
  const parts = p.split('/');
  if (parts.some((s) => s === '' || s === '.' || s === '..')) return false;
  return true;
}

function isInside(base, target) {
  const b = path.resolve(base);
  const t = path.resolve(target);
  return t === b || t.startsWith(b + path.sep);
}

/** 在 base 下安全地解析相对路径；越界返回 null。 */
function safeJoin(base, rel) {
  if (!isSafeRel(rel)) return null;
  const abs = path.resolve(base, rel);
  return isInside(base, abs) ? abs : null;
}

function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function pick(obj, fields) {
  const out = {};
  for (const f of fields) if (obj[f] !== undefined) out[f] = obj[f];
  return out;
}

/** 内嵌 JSON 的安全转义：< > & 以及 U+2028/9，避免 </script> 截断。 */
const HTML_ESCAPES = { '<': '\\u003c', '>': '\\u003e', '&': '\\u0026', '\u2028': '\\u2028', '\u2029': '\\u2029' };
function escapeForScript(json) {
  return json.replace(/[<>&\u2028\u2029]/g, (c) => HTML_ESCAPES[c]);
}

// ------------------------------------------------------- 主页 JSON 标记

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
    out.push({ start, end: end === -1 ? html.length : end, body: html.slice(start, end === -1 ? html.length : end) });
  }
  return out;
}

function injectJson(html, id, payload) {
  const blocks = findJsonBlocks(html, id);
  if (blocks.length !== 1) {
    return { html, error: `主页内 id="${id}" 的 application/json 标记${blocks.length ? '重复' : '缺失'}（找到 ${blocks.length} 个）` };
  }
  const b = blocks[0];
  return { html: html.slice(0, b.start) + payload + html.slice(b.end), error: null };
}

// ------------------------------------------------------------- 封面映射

/** 宽容解析 cover-map.json：{id:path} / {covers:{id:path}} / {id:{cover:path}}。 */
function parseCoverMap(raw) {
  const map = new Map();
  const add = (id, val) => {
    if (typeof id !== 'string' || !id) return;
    if (typeof val === 'string') { map.set(id, val); return; }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      for (const k of ['cover', 'path', 'src']) {
        if (typeof val[k] === 'string') { map.set(id, val[k]); return; }
      }
    }
  };
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return map;
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'covers' && v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [id, val] of Object.entries(v)) add(id, val);
      continue;
    }
    add(k, v);
  }
  return map;
}

// ------------------------------------------------------------ 公开数据

function resolveBuildState(runtime, rep) {
  if (typeof runtime.buildState === 'string' && runtime.buildState) return runtime.buildState;
  if (typeof rep.buildState === 'string' && rep.buildState) return rep.buildState;
  if (rep.fallback === true) return 'fallback';
  if (rep.built === true) return 'built';
  return 'pending';
}

function normalizeMeta(meta) {
  const out = {};
  for (const f of PUBLIC_META_FIELDS) {
    if (!meta || meta[f] === undefined) continue;
    let v = meta[f];
    // 大厅名称若含「作品与资产」一律归一为「作品」，避免旧清单把禁用文案带回来。
    if (f === 'hall' && typeof v === 'string') v = v.replace(/作品与资产总览/g, '作品').replace(/作品与资产/g, '作品');
    if (f === 'hallEn' && typeof v === 'string') v = v.replace(/WORKS\s*&\s*ASSETS/gi, 'WORKS');
    out[f] = v;
  }
  return out;
}

function buildPublicWorks(ctx) {
  const { published, runtimeById, reportById, docsDir, hallDir, coverMap } = ctx;
  const works = [];
  const coverOverrides = {};
  const warnings = [];

  for (const w of published) {
    const runtime = runtimeById.get(w.id) || {};
    const rep = reportById.get(w.id) || {};
    const entry = typeof w.entry === 'string' && w.entry ? w.entry : (typeof runtime.entry === 'string' ? runtime.entry : '');
    const buildState = resolveBuildState(runtime, rep);

    const entryAbs = entry ? safeJoin(docsDir, entry) : null;
    const entryExists = !!(entryAbs && fileExists(entryAbs));
    const priorPublished = runtime.published === true || rep.built === true || rep.fallback === true
      || buildState === 'built' || buildState === 'fallback' || buildState === 'built-no-entry';
    const published = entryExists && priorPublished;
    // online = **线上实测 HTTP 状态码**（number）；未发布或未实测一律 null，绝不猜测。
    const online = published && Number.isInteger(runtime.online) ? runtime.online : null;

    const out = {
      ...pick(w, ['id', 'title', 'subtitle', 'description', 'section', 'era', 'kind', 'tags', 'controls', 'artifacts']),
      entry,
      cover: typeof w.cover === 'string' ? w.cover : '',
      playable: w.playable === true && published,
      status: w.status,
      qaState: runtime.qaState ?? w.qaState,
      buildState,
      entryExists,
      published,
      online,
    };
    if (typeof runtime.bytes === 'number') out.bytes = runtime.bytes;
    else if (typeof rep.bytes === 'number') out.bytes = rep.bytes;

    // 封面覆盖：仅当相对路径安全且 hall/ 或 docs/ 里确有该文件。
    const candidate = coverMap.get(w.id);
    if (candidate) {
      if (!isSafeRel(candidate)) {
        warnings.push(`封面映射 ${w.id} 的路径不安全，已保留原封面：${candidate}`);
      } else {
        const inHall = fileExists(path.join(hallDir, candidate));
        const inDocs = fileExists(path.join(docsDir, candidate));
        if (inHall || inDocs) {
          out.cover = candidate;
          coverOverrides[w.id] = candidate;
        } else {
          warnings.push(`封面映射 ${w.id} 指向的文件不存在，已保留原封面：${candidate}`);
        }
      }
    }

    works.push(pick(out, PUBLIC_WORK_FIELDS));
  }
  return { works, coverOverrides, warnings };
}

function buildPublicReport(report, publicWorks) {
  const byId = new Map((report && Array.isArray(report.works) ? report.works : []).map((r) => [r.id, r]));
  const out = { works: [] };
  if (report && typeof report.builtAt === 'string') out.builtAt = report.builtAt; // 绝不重新声称构建时间
  for (const w of publicWorks) {
    const rep = byId.get(w.id) || {};
    out.works.push(pick({
      id: w.id,
      buildState: w.buildState ?? rep.buildState,
      entryExists: w.entryExists ?? rep.entryExists,
      online: w.online ?? rep.online,
    }, PUBLIC_REPORT_WORK_FIELDS));
  }
  const totals = {};
  const src = (report && report.totals) || {};
  for (const f of PUBLIC_TOTAL_FIELDS) {
    if (typeof src[f] === 'number') totals[f] = src[f];
  }
  if (totals.total === undefined) totals.total = out.works.length;
  if (totals.built === undefined) totals.built = out.works.filter((w) => w.buildState === 'built').length;
  if (totals.fallback === undefined) totals.fallback = out.works.filter((w) => w.buildState === 'fallback').length;
  if (totals.unavailable === undefined) totals.unavailable = out.works.filter((w) => w.buildState === 'unavailable').length;
  if (totals.bytes === undefined) totals.bytes = publicWorks.reduce((s, w) => s + (typeof w.bytes === 'number' ? w.bytes : 0), 0);
  out.totals = totals;
  return out;
}

// -------------------------------------------------------------- 复制计划

function isDevFile(name) {
  if (DEV_FILE_NAMES.has(name)) return true;
  if (name.startsWith('.')) return true;
  if (DEV_FILE_RE.test(name)) return true;
  if (name.endsWith('~')) return true;
  return false;
}

function planCopy(hallDir, docsDir) {
  const files = [];
  const errors = [];
  const skipped = [];
  let hallReal;
  try { hallReal = fs.realpathSync(hallDir); } catch { hallReal = path.resolve(hallDir); }

  const visit = (relDir) => {
    const absDir = path.join(hallDir, relDir);
    let entries;
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const rel = relDir ? `${relDir}/${e.name}` : e.name;
      const abs = path.join(absDir, e.name);
      // hall 内部目录不得越界覆盖 docs/works、docs/data
      if (!relDir && (e.name === 'works' || e.name === 'data')) {
        errors.push(`hall/${rel} 会覆盖受保护的 docs/${e.name}/，已拒绝发布`);
        continue;
      }
      if (SKIP_DIRS.has(e.name)) { skipped.push(rel); continue; }
      if (isDevFile(e.name)) { skipped.push(rel); continue; }
      let st;
      try { st = fs.lstatSync(abs); } catch { continue; }
      if (st.isSymbolicLink()) {
        let real, rst;
        try { real = fs.realpathSync(abs); rst = fs.statSync(abs); } catch { errors.push(`符号链接无法解析：hall/${rel}`); continue; }
        if (!isInside(hallReal, real)) { errors.push(`符号链接逃逸出 hall/：hall/${rel} → ${real}`); continue; }
        if (!rst.isFile()) { errors.push(`暂不支持发布符号链接目录：hall/${rel}`); continue; }
        files.push({ from: abs, to: path.join(docsDir, rel), rel });
        continue;
      }
      if (st.isDirectory()) { visit(rel); continue; }
      if (st.isFile()) { files.push({ from: abs, to: path.join(docsDir, rel), rel }); continue; }
      skipped.push(rel);
    }
  };
  visit('');
  return { files, errors, skipped };
}

// ------------------------------------------------------------------ 主流程

function main() {
  let args;
  try { args = parseArgs(process.argv.slice(2)); } catch (e) {
    process.stdout.write(JSON.stringify({ ok: false, errors: [String(e.message || e)] }) + '\n');
    process.exit(2);
  }
  if (args.help) { process.stdout.write(HELP); return 0; }

  const root = args.root;
  const docsDir = path.join(root, 'docs');
  const hallDir = path.join(root, 'hall');
  const errors = [];
  const warnings = [];

  // 1) 读根清单
  let manifest;
  try { manifest = readJson(path.join(root, 'works.json')); } catch (e) {
    errors.push(`无法读取根清单 works.json：${e.message || e}`);
    manifest = null;
  }
  if (manifest && !Array.isArray(manifest.works)) errors.push('根清单 works.json 缺少 works 数组');

  const publishedSections = manifest && Array.isArray(manifest.sections)
    ? manifest.sections.filter((s) => s && s.publish !== false)
    : [];
  const published = manifest && Array.isArray(manifest.works)
    ? manifest.works.filter((w) => w && w.publish !== false)
    : [];
  const sectionIds = new Set(publishedSections.map((s) => s.id));

  // 2) 读既有运行态数据
  const runtimeFile = path.join(docsDir, 'data', 'works.json');
  const reportFile = path.join(docsDir, 'data', 'build-report.json');
  let runtimeData = [], report = { works: [] };
  try {
    if (fs.existsSync(runtimeFile)) {
      const parsed = readJson(runtimeFile);
      runtimeData = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.works) ? parsed.works : []);
    }
  } catch (e) { errors.push(`无法解析 ${path.relative(root, runtimeFile)}：${e.message || e}`); }
  try {
    if (fs.existsSync(reportFile)) {
      const parsed = readJson(reportFile);
      if (parsed && typeof parsed === 'object') report = parsed;
    }
  } catch (e) { errors.push(`无法解析 ${path.relative(root, reportFile)}：${e.message || e}`); }

  const runtimeById = new Map(runtimeData.map((w) => [w.id, w]));
  const reportById = new Map((Array.isArray(report.works) ? report.works : []).map((r) => [r.id, r]));

  // 3) 封面映射（可选）
  let coverMap = new Map();
  const coverMapFile = path.join(hallDir, 'cover-map.json');
  if (fs.existsSync(coverMapFile)) {
    try { coverMap = parseCoverMap(readJson(coverMapFile)); } catch (e) {
      errors.push(`无法解析 hall/cover-map.json：${e.message || e}`);
    }
  }

  // 4) 组装公开数据
  const { works: publicWorks, coverOverrides, warnings: coverWarnings } = buildPublicWorks({
    published, runtimeById, reportById, docsDir, hallDir, coverMap,
  });
  warnings.push(...coverWarnings);
  const publicSections = publishedSections.map((s) => pick(s, PUBLIC_SECTION_FIELDS));
  const publicMeta = normalizeMeta(manifest && manifest.meta);
  const publicReport = buildPublicReport(report, publicWorks);

  // 5) 校验（先校验后落盘）
  if (!publicWorks.length) errors.push('没有可发布作品（根清单 publish!==false 的作品为空）');
  const seenIds = new Set();
  for (const w of publicWorks) {
    if (!w.id) { errors.push('存在缺少 id 的作品'); continue; }
    if (seenIds.has(w.id)) errors.push(`作品 id 重复：${w.id}`);
    seenIds.add(w.id);
    if (!w.entry || !isSafeRel(w.entry)) errors.push(`作品 ${w.id} 的入口路径不安全：${w.entry}`);
    if (!w.cover || !isSafeRel(w.cover)) errors.push(`作品 ${w.id} 的封面路径不安全：${w.cover}`);
    if (!sectionIds.has(w.section)) errors.push(`作品 ${w.id} 属于未发布分区：${w.section}`);
  }
  const hallIndex = path.join(hallDir, 'index.html');
  if (!fs.existsSync(hallIndex)) errors.push('缺少 hall/index.html，无法发布主页');
  else {
    const html = fs.readFileSync(hallIndex, 'utf8');
    for (const id of ['works-data', 'build-report']) {
      const n = findJsonBlocks(html, id).length;
      if (n !== 1) errors.push(`hall/index.html 内 id="${id}" 的 application/json 标记${n ? '重复' : '缺失'}（找到 ${n} 个）`);
    }
  }

  const copyPlan = planCopy(hallDir, docsDir);
  errors.push(...copyPlan.errors);

  if (errors.length) {
    process.stdout.write(JSON.stringify({ ok: false, root, errors, warnings }) + '\n');
    return 1;
  }

  // 6) 落盘：hall → docs（不含 works/ 与 data/）
  let copied = 0;
  let unchanged = 0;
  for (const f of copyPlan.files) {
    const buf = fs.readFileSync(f.from);
    let same = false;
    try { same = fs.readFileSync(f.to).equals(buf); } catch { same = false; }
    if (same) { unchanged++; continue; }
    fs.mkdirSync(path.dirname(f.to), { recursive: true });
    fs.writeFileSync(f.to, buf);
    copied++;
  }

  // 7) 写数据文件 + 注入主页
  const docsData = path.join(docsDir, 'data');
  fs.mkdirSync(docsData, { recursive: true });
  fs.writeFileSync(path.join(docsData, 'works.json'), JSON.stringify(publicWorks, null, 2) + '\n');
  fs.writeFileSync(path.join(docsData, 'build-report.json'), JSON.stringify(publicReport, null, 2) + '\n');

  const manifestPayload = escapeForScript(JSON.stringify({ meta: publicMeta, sections: publicSections, works: publicWorks }, null, 2));
  const reportPayload = escapeForScript(JSON.stringify(publicReport, null, 2));
  if (JSON.parse(manifestPayload).works.length !== publicWorks.length) errors.push('内嵌 works-data 转义后解析不一致，已中止写入主页');
  if (errors.length) {
    process.stdout.write(JSON.stringify({ ok: false, root, errors, warnings }) + '\n');
    return 1;
  }

  const docsIndex = path.join(docsDir, 'index.html');
  let html = fs.readFileSync(docsIndex, 'utf8');
  const r1 = injectJson(html, 'works-data', manifestPayload);
  if (r1.error) { process.stdout.write(JSON.stringify({ ok: false, root, errors: [r1.error], warnings }) + '\n'); return 1; }
  html = r1.html;
  const r2 = injectJson(html, 'build-report', reportPayload);
  if (r2.error) { process.stdout.write(JSON.stringify({ ok: false, root, errors: [r2.error], warnings }) + '\n'); return 1; }
  fs.writeFileSync(docsIndex, r2.html);

  process.stdout.write(JSON.stringify({
    ok: true,
    root,
    works: publicWorks.length,
    sections: publicSections.map((s) => s.id),
    copied,
    unchanged,
    skipped: copyPlan.skipped.length,
    coverOverrides,
    warnings,
  }) + '\n');
  return 0;
}

process.exit(main());
