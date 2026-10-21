#!/usr/bin/env node
/**
 * 兄弟任务同步器 · sync-exhibits
 *
 * 把 05 / 07 / 08—12 的产物**复制**到本任务的 public/ 下：
 *   05 → public/data/catalog.json          （策展目录，运行时优先级最高）
 *   07 → public/art/assets/**  + public/data/design-tokens.json
 *   08—12 → public/exhibits/<dir>/**        （可玩展厅包体）
 *
 * 规则：
 *   - **只复制，不修改源目录**
 *   - 包体必须是「可直接静态部署」的产物：会检查 index.html 是否存在、
 *     是否仍引用源码目录、是否为占位页、引用的静态资源是否存在
 *   - 源产物缺失或未构建时，对应展项标记 pending，
 *     主站渲染「待集成」占位而非假入口
 *   - 每次运行生成 public/data/exhibits.json 供主站读取
 *
 * 用法：node scripts/sync-exhibits.mjs [--clean]
 *   --clean  先清空 public/exhibits 与 public/data，再同步
 */

import { cp, mkdir, rm, readdir, stat, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { symlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SIBLINGS = path.resolve(ROOT, '..');
const PUBLIC = path.join(ROOT, 'public');
const CLEAN = process.argv.includes('--clean');

const log = (...a) => console.log(...a);
const rel = (p) => path.relative(ROOT, p) || path.basename(p);

async function dirSize(dir) {
  let total = 0;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) total += await dirSize(p);
    else if (entry.isFile()) total += (await stat(p)).size;
  }
  return total;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

/* ── 05：策展目录 ──────────────────────────────────────────────────────────── */
function wikiUrl(title) {
  if (!title) return null;
  return `https://en.wikipedia.org/wiki/${String(title).trim().replace(/\s+/g, '_')}`;
}

/** 从 05 的中间产物（seed_items + curated）拼装目录 */
async function buildCatalogFromSeed() {
  const seedPath = path.join(SIBLINGS, '05-museum-catalog', 'data', 'seed_items.json');
  if (!existsSync(seedPath)) return null;
  const seed = await readJson(seedPath);
  if (!Array.isArray(seed) || !seed.length) return null;

  const curatedDir = path.join(SIBLINGS, '05-museum-catalog', 'data', 'curated');
  let curated = {};
  if (existsSync(curatedDir)) {
    for (const f of await readdir(curatedDir)) {
      if (!f.endsWith('.json')) continue;
      const part = await readJson(path.join(curatedDir, f));
      if (part && typeof part === 'object') curated = { ...curated, ...part };
    }
  }

  const items = seed.map((s) => {
    const c = curated[s.id] ?? {};
    const url = wikiUrl(s.wiki ?? c.wiki);
    return {
      id: s.id,
      title: c.title ?? c.titleZh ?? s.wiki ?? s.id,
      titleZh: c.titleZh ?? '',
      year: s.year ?? 0,
      era: s.era ?? '',
      platform: s.platform ?? '',
      creator: s.creator ?? '',
      kind: s.kind ?? 'game',
      summary: c.summary ?? '',
      significance: c.significance ?? '',
      sourceUrls: url ? [url] : [],
      sourceTitles: url ? [s.wiki ?? c.wiki] : [],
      imageLicense: c.imageLicense ?? '展签图形为自绘 SVG（回响电玩馆原创资产，项目自有）',
    };
  }).filter((i) => i.sourceUrls.length);

  return items.length ? items : null;
}

async function syncCatalog() {
  await mkdir(path.join(PUBLIC, 'data'), { recursive: true });
  const target = path.join(PUBLIC, 'data', 'catalog.json');

  // 1) 首选 05 正式交付的 catalog.json
  const formal = [
    path.join(SIBLINGS, '05-museum-catalog', 'catalog.json'),
    path.join(SIBLINGS, '05-museum-catalog', 'dist', 'catalog.json'),
    path.join(SIBLINGS, '05-museum-catalog', 'public', 'catalog.json'),
    path.join(SIBLINGS, '05-museum-catalog', 'data', 'catalog.json'),
  ];
  for (const p of formal) {
    if (!existsSync(p)) continue;
    const raw = await readJson(p);
    const items = Array.isArray(raw) ? raw : raw?.items;
    if (!Array.isArray(items) || !items.length) continue;
    await writeFile(target, JSON.stringify(items), 'utf8');
    log(`✓ 策展目录已同步：05-museum-research 正式目录（${items.length} 条）← ${rel(p)}`);
    return { ok: true, count: items.length, from: rel(p), mode: 'formal' };
  }

  // 2) 回落到 05 的中间产物（seed_items + curated）
  const seeded = await buildCatalogFromSeed();
  if (seeded) {
    await writeFile(target, JSON.stringify(seeded), 'utf8');
    log(`✓ 策展目录已同步：05-museum-research 中间产物拼装（${seeded.length} 条）← data/seed_items.json + data/curated/`);
    return { ok: true, count: seeded.length, from: '05/data/seed_items.json', mode: 'seed' };
  }

  // 3) 未交付：删除旧文件，运行时回落到本馆本地初版
  await rm(target, { force: true });
  log('· 策展目录：05-museum-research 尚未交付 → 运行时使用本馆本地初版（未生成 public/data/catalog.json）');
  return { ok: false, count: 0, from: null, mode: 'none' };
}

/* ── 07：美术包 ────────────────────────────────────────────────────────────── */
const ART_FILE = /\.(svg|png|webp|jpg|jpeg|woff2?|ttf|otf|txt)$/i;

/** 本项目自有、不从上游覆盖的文件（相对 public/art/assets） */
const KEEP_OWN = new Set(['assets/fonts/fonts.css']);

/**
 * 上游包体里**绝不能上线**的目录名。
 * 典型事故：07 的美术包里混进了做字体子集用的 Python 虚拟环境（.venv，124 MB），
 * 照抄进 public/ 就会把整个 venv 发布到 GitHub Pages。
 */
const ART_JUNK_DIRS = new Set([
  '.venv', 'venv', 'env', '__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache',
  '.tox', '.ipynb_checkpoints', 'node_modules', '.git', '.DS_Store',
]);

/**
 * 同源但**用不上**的字体格式。
 *
 * 07 的 fonts/ 里同时给了 woff2 和 ttf；本馆的 @font-face 全部走 woff2
 * （见 src/assets/fonts/fonts.css，5 条规则无一例外），ttf 合计约 824 KB
 * 纯属白上线的体积。这里不落 ttf。
 *
 * woff2 也不在这里落：字体二进制自 2026-10-22 起统一由
 * `syncDesignSystem()` 从 16-design-system/fonts/ 拷到 public/assets/ds/fonts/，
 * 07 与 16 的 woff2 逐字节一致（已用 cmp 核过 5/5），
 * 两处各留一份只会让产物体积凭空多 393 KB。
 */
const ART_SKIP_FILES = new Set(['.ttf', '.woff2']);

async function copyAssets(fromDir, toDir, base = '') {
  if (!existsSync(fromDir)) return 0;
  let n = 0;
  const entries = await readdir(fromDir, { withFileTypes: true });
  await mkdir(toDir, { recursive: true });
  for (const e of entries) {
    if (ART_JUNK_DIRS.has(e.name)) continue;
    if (ART_SKIP_FILES.has(path.extname(e.name).toLowerCase())) continue;
    const src = path.join(fromDir, e.name);
    const dst = path.join(toDir, e.name);
    const relPath = path.join(base, e.name);
    if (KEEP_OWN.has(relPath.split(path.sep).join('/'))) continue;
    if (e.isDirectory()) {
      n += await copyAssets(src, dst, relPath);
    } else if (e.isFile() && ART_FILE.test(e.name)) {
      await cp(src, dst, { force: true });
      n += 1;
    }
  }
  return n;
}

async function syncArt() {
  const artRoot = path.join(PUBLIC, 'art');
  await mkdir(artRoot, { recursive: true });

  /*
   * 07 的美术包里，本馆**只用** fonts/（5 个 OFL woff2 + 许可全文）。
   * 其余 covers / posters / cases / models / fallback 共约 51 MB 是 07 自己
   * 画廊页的媒体素材，本馆一张都没引用——照抄进来会让 GitHub Pages 发布
   * 凭空多出 50 MB 以上的无关负载（实测 `dist/art` 曾达 124 MB，
   * 因为连字体子集工具用的 .venv 都被拷了进来）。
   *
   * 因此这里只同步 fonts/，其余目录不落地。
   * 依据：16-design-system/DESIGN-SPEC.md §10（资源本地化与体积）、
   *      15-supervisor/RESTYLE-SPEC.md §6.4（资源本地化，无 CDN）。
   */
  const assetSources = [
    path.join(SIBLINGS, '07-museum-art', 'public', 'assets'),
    path.join(SIBLINGS, '07-museum-art', 'assets'),
  ];
  const WANTED = new Set(['fonts']);
  let copied = 0;
  let used = null;
  for (const src of assetSources) {
    if (!existsSync(src)) continue;
    for (const sub of WANTED) {
      const from = path.join(src, sub);
      if (!existsSync(from)) continue;
      const n = await copyAssets(from, path.join(artRoot, 'assets', sub), path.join('assets', sub));
      if (n) {
        copied += n;
        used = rel(src);
      }
    }
    if (copied) break;
  }

  // 设计令牌
  let tokensFrom = null;
  for (const c of [
    path.join(SIBLINGS, '07-museum-art', 'design-tokens.json'),
    path.join(SIBLINGS, '07-museum-art', 'public', 'assets', 'design-tokens.json'),
  ]) {
    if (!existsSync(c)) continue;
    const json = await readJson(c);
    if (!json) continue;
    await mkdir(path.join(PUBLIC, 'data'), { recursive: true });
    await writeFile(path.join(PUBLIC, 'data', 'design-tokens.json'), JSON.stringify(json, null, 2), 'utf8');
    tokensFrom = rel(c);
    break;
  }

  // 令牌 CSS（可选，运行时按需引入）
  for (const c of [
    path.join(SIBLINGS, '07-museum-art', 'public', 'assets', 'tokens.css'),
    path.join(SIBLINGS, '07-museum-art', 'assets', 'tokens.css'),
  ]) {
    if (!existsSync(c)) continue;
    await mkdir(path.join(PUBLIC, 'data'), { recursive: true });
    await cp(c, path.join(PUBLIC, 'data', 'tokens.css'), { force: true });
    break;
  }

  if (copied) log(`✓ 美术包已同步：07-museum-art（${copied} 个资产）← ${used}`);
  else log('· 美术包：07-museum-art 尚未交付 → 使用本馆程序化生成的原创 SVG（public/art/）');
  if (tokensFrom) log(`✓ 设计令牌已同步：${tokensFrom}`);

  return { ok: copied > 0, tokens: Boolean(tokensFrom), count: copied };
}

/* ── 16：设计系统接入（assets/ds/）────────────────────────────────────────── */

/**
 * 把 16-design-system 的**权威产物**接入本项目 public/assets/ds/。
 *
 * 依据：
 *   16-design-system/MIGRATION-NOTES.md §1 接入四步 ①③（token 层 / 换外壳）
 *   16-design-system/MIGRATION-NOTES.md §6 Pages 子路径资源拼接
 *     「发布前必查」列出 /assets/ds/tokens.css、/assets/ds/components.css、
 *     /assets/ds/fonts/fonts.css、/assets/ds/fonts/inter-latin.woff2
 *   15-supervisor 派单「接入三步」第 1、2 条
 *
 * 三个文件都是**逐字节复制**，不做任何改写：
 *   src/tokens.css     → public/assets/ds/tokens.css      （130 个 --ds-* 权威值）
 *   src/components.css → public/assets/ds/components.css  （27 类 .ds-* 组件层）
 *   fonts/             → public/assets/ds/fonts/          （5 woff2 + OFL 全文 + fonts.css）
 *
 * 为什么 tokens.css 是「复制但不接管」：
 *   本目录自有的 src/styles/tokens.css 才是**页面里唯一生效**的令牌层
 *   （它 = DS 取值 + 67 条语义别名 + 本馆深色主题 + 2 个 --ds-art-* 本地令牌），
 *   已由 scripts/check-tokens.mjs 与 check-tokens-runtime.mjs 逐名核验 0 不一致。
 *   若同时把 DS 的 tokens.css 引入页面，同一批 --ds-* 会被声明两遍
 *   （MIGRATION-NOTES §0 风险 B），谁后加载谁生效，纯属脆弱。
 *   所以：文件照抄发布（供全批对照与 §6 的 curl 必查），页面不重复引入。
 *
 * 为什么 fonts/ 必须是 DS 版本而不是 07 版本：
 *   16 的 fonts.css 带 CJK 回落顺序的成文约束（覆盖完整的系统 CJK 族必须排在
 *   有限覆盖的子集之前，否则同段文字混排基线错位），
 *   07 的同名文件没有这段约束。两者 @font-face 声明等价（族名/字重/src 全同），
 *   5 个 woff2 与 5 份 OFL 全文已用 cmp 核过逐字节一致。
 */
async function syncDesignSystem() {
  const dsRoot = path.join(SIBLINGS, '16-design-system');
  const outRoot = path.join(PUBLIC, 'assets', 'ds');
  await mkdir(outRoot, { recursive: true });

  const files = [
    { from: path.join(dsRoot, 'src', 'tokens.css'), to: path.join(outRoot, 'tokens.css') },
    { from: path.join(dsRoot, 'src', 'components.css'), to: path.join(outRoot, 'components.css') },
  ];

  let n = 0;
  for (const f of files) {
    if (!existsSync(f.from)) continue;
    await cp(f.from, f.to, { force: true });
    n += 1;
  }

  // fonts/：5 个 woff2 + 5 份 OFL 全文 + fonts.css + FONT-MANIFEST.json
  let fontCount = 0;
  const fontSrc = path.join(dsRoot, 'fonts');
  const fontDst = path.join(outRoot, 'fonts');
  if (existsSync(fontSrc)) {
    await mkdir(fontDst, { recursive: true });
    const entries = await readdir(fontSrc, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!/\.(woff2|css|txt|json)$/i.test(e.name)) continue;
      await cp(path.join(fontSrc, e.name), path.join(fontDst, e.name), { force: true });
      fontCount += 1;
    }
  }

  if (n === 2) {
    log(`✓ 设计系统已接入：16-design-system → public/assets/ds/（tokens.css + components.css + fonts/${fontCount} 个文件）`);
  } else {
    log('· 设计系统：16-design-system 尚未交付 → public/assets/ds/ 保持上一版');
  }

  return { ok: n === 2, files: n, fonts: fontCount };
}

/* ── 08—12：可玩展厅 ──────────────────────────────────────────────────────── */
const HALLS = [
  { id: 'origins', task: '08-era-origins', dir: 'origins' },
  { id: 'arcade', task: '09-era-arcade', dir: 'arcade' },
  { id: 'console', task: '10-era-console', dir: 'console' },
  { id: 'online', task: '11-era-online', dir: 'online' },
  { id: 'modern', task: '12-era-modern', dir: 'modern' },
];

/** 功能性资源（缺失即视为不可部署） */
const FUNCTIONAL_REF = /\.(js|mjs|css|wasm|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|eot|mp3|ogg|wav|json)$/i;

/** 判断一个目录是否是「可直接静态部署」的包体 */
async function inspectBundle(dir) {
  const indexPath = path.join(dir, 'index.html');
  if (!existsSync(indexPath)) return { ok: false, reason: '缺少 index.html' };
  const html = await readFile(indexPath, 'utf8');

  if (/(?:src|href)=["'][^"']*\/src\//i.test(html)) {
    return { ok: false, reason: '仍引用源码目录，尚未构建为静态包' };
  }
  if (/type=["']module["'][^>]*\ssrc=["']\//i.test(html)) {
    return { ok: false, reason: '引用了绝对路径模块，无法在子路径下部署' };
  }
  if (/展厅建设中|建设中|敬请期待|coming soon/i.test(html)) {
    return { ok: false, reason: '仍是占位页面' };
  }

  // 收集所有页面里缺失的本地引用
  const missing = new Set();
  for (const f of await readdir(dir)) {
    if (!f.endsWith('.html')) continue;
    const page = await readFile(path.join(dir, f), 'utf8');
    for (const m of page.matchAll(/(?:src|href)=["'](\.\/[^"']+)["']/g)) {
      const ref = m[1].split('?')[0].split('#')[0];
      if (!existsSync(path.join(dir, ref))) missing.add(ref);
    }
  }

  // 功能性资源缺失 → 不可部署；仅说明文档缺失 → 可部署但要清理链接
  const functional = [...missing].filter((r) => FUNCTIONAL_REF.test(r));
  if (functional.length) {
    return { ok: false, reason: `引用了不存在的静态资源 ${functional[0]}` };
  }
  return {
    ok: true,
    reason: '可静态部署',
    missingDocs: [...missing],
  };
}

/**
 * 清理副本中指向缺失说明文档的链接（只改副本，不动源目录），
 * 避免这些链接在部署后产生 404。
 */
async function stripMissingDocLinks(dir, missingDocs) {
  if (!missingDocs?.length) return 0;
  let patched = 0;
  for (const f of await readdir(dir)) {
    if (!f.endsWith('.html')) continue;
    const p = path.join(dir, f);
    let html = await readFile(p, 'utf8');
    let changed = false;
    for (const ref of missingDocs) {
      const needle = `href="./${ref.replace(/^\.\//, '')}"`;
      if (html.includes(needle)) {
        html = html.split(needle).join(`data-missing-doc="${ref.replace(/^\.\//, '')}"`);
        changed = true;
        patched += 1;
      }
    }
    if (changed) await writeFile(p, html, 'utf8');
  }
  return patched;
}

/** 在本任务目录内的临时副本中构建兄弟任务（绝不写入源目录） */
async function tryTempBuild(task) {
  const srcRoot = path.join(SIBLINGS, task);
  const pkgPath = path.join(srcRoot, 'package.json');
  if (!existsSync(pkgPath)) return { ok: false, reason: '来源目录没有 package.json，无法构建' };

  const tmp = path.join(ROOT, '.tmpbuild', task);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });

  // 复制源码（排除 node_modules 与已有产物）
  await cp(srcRoot, tmp, {
    recursive: true,
    filter: (src) => {
      const base = path.basename(src);
      if (base === 'node_modules' || base === 'dist' || base === '.git') return false;
      return true;
    },
  });

  // 复用来源目录的依赖，避免重复安装
  const srcModules = path.join(srcRoot, 'node_modules');
  if (existsSync(srcModules)) {
    await symlink(srcModules, path.join(tmp, 'node_modules'), 'dir');
  }

  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  try {
    await run('npx', ['vite', 'build'], { cwd: tmp, timeout: 300000, maxBuffer: 32 * 1024 * 1024 });
  } catch (err) {
    const detail = (err.stderr?.toString() || err.stdout?.toString() || err.message)
      .split('\n')
      .filter((l) => l.trim())
      .slice(-2)
      .join(' ')
      .slice(0, 160);
    await rm(tmp, { recursive: true, force: true });
    return { ok: false, reason: `来源任务尚未构建完成（${detail}）` };
  }

  const dist = path.join(tmp, 'dist');
  if (!existsSync(dist)) {
    await rm(tmp, { recursive: true, force: true });
    return { ok: false, reason: '来源任务构建未产出 dist' };
  }
  return { ok: true, dist, tmp };
}

async function syncExhibits() {
  const results = [];

  for (const hall of HALLS) {
    const srcRoot = path.join(SIBLINGS, hall.task);
    const target = path.join(PUBLIC, 'exhibits', hall.dir);

    if (!existsSync(srcRoot)) {
      results.push({ id: hall.id, task: hall.task, status: 'pending', entryPath: null, note: `来源目录不存在：${hall.task}` });
      log(`· ${hall.task} → 待集成（来源目录尚未创建）`);
      continue;
    }

    // 优先使用构建产物；包体根目录仅在通过部署性检查时接受
    const candidates = [
      path.join(srcRoot, 'dist'),
      path.join(srcRoot, 'build'),
      path.join(srcRoot, 'public'),
      srcRoot,
    ];
    let chosen = null;
    let chosenReason = '';
    let missingDocs = [];
    for (const c of candidates) {
      if (!existsSync(c)) continue;
      const check = await inspectBundle(c);
      if (check.ok) {
        chosen = c;
        chosenReason = check.reason;
        missingDocs = check.missingDocs ?? [];
        break;
      }
      chosenReason = check.reason;
    }

    // 上游尚未构建时：在本任务目录内的临时副本中代为构建一次
    if (!chosen) {
      const built = await tryTempBuild(hall.task);
      if (built.ok) {
        const check = await inspectBundle(built.dist);
        if (check.ok) {
          chosen = built.dist;
          chosenReason = `由来源任务源码在临时副本中构建（${check.reason}）`;
          missingDocs = check.missingDocs ?? [];
        } else {
          chosenReason = `临时构建产物未通过部署性检查：${check.reason}`;
        }
      } else {
        chosenReason = built.reason;
      }
    }

    if (!chosen) {
      await rm(target, { recursive: true, force: true });
      results.push({ id: hall.id, task: hall.task, status: 'pending', entryPath: null, note: `${hall.task}：${chosenReason}` });
      log(`· ${hall.task} → 待集成（${chosenReason}）`);
      continue;
    }

    await rm(target, { recursive: true, force: true });
    await mkdir(path.dirname(target), { recursive: true });
    await cp(chosen, target, { recursive: true, force: true });
    await prune(target);
    const stripped = await stripMissingDocLinks(target, missingDocs);
    if (stripped) log(`  · ${hall.task}：清理了 ${stripped} 处指向缺失说明文档的链接（${missingDocs.join(', ')}）`);

    const size = await dirSize(target);
    results.push({
      id: hall.id,
      task: hall.task,
      status: 'integrated',
      entryPath: `${hall.dir}/index.html`,
      note: `已从 ${rel(chosen)} 复制（${chosenReason}）`,
      bytes: size,
    });
    log(`✓ ${hall.task} → 已并入 public/exhibits/${hall.dir}/（${(size / 1024).toFixed(0)} KB ← ${rel(chosen)}）`);
  }

  // 清理临时构建目录
  await rm(path.join(ROOT, '.tmpbuild'), { recursive: true, force: true });

  await mkdir(path.join(PUBLIC, 'data'), { recursive: true });
  await writeFile(
    path.join(PUBLIC, 'data', 'exhibits.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), halls: results }, null, 2),
    'utf8',
  );

  return results;
}

/** 清理包体里不该上线的内容 */
async function prune(dir) {
  const JUNK = new Set([
    'node_modules', '.git', '.vite', 'coverage', '.cache', 'tests', 'test',
    // 工具链产物：Python 虚拟环境、字节码缓存、系统垃圾——一律不上线
    '.venv', 'venv', 'env', '__pycache__', '.pytest_cache', '.mypy_cache', '.ruff_cache',
    '.tox', '.ipynb_checkpoints',
  ]);
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && JUNK.has(e.name)) {
      await rm(path.join(dir, e.name), { recursive: true, force: true });
    }
    if (e.isFile() && (/\.map$/i.test(e.name) || e.name === '.DS_Store' || /\.pyc$/i.test(e.name))) {
      await rm(path.join(dir, e.name), { force: true });
    }
  }
}

/* ── 主流程 ────────────────────────────────────────────────────────────────── */
async function main() {
  log('▶ 同步兄弟任务产物（只复制，不修改源目录）');
  if (CLEAN) {
    await rm(path.join(PUBLIC, 'exhibits'), { recursive: true, force: true });
    await rm(path.join(PUBLIC, 'data'), { recursive: true, force: true });
    await rm(path.join(PUBLIC, 'art', 'assets'), { recursive: true, force: true });
    log('· 已清空 public/exhibits、public/data、public/art/assets');
  }

  const catalog = await syncCatalog();
  const art = await syncArt();
  const ds = await syncDesignSystem();
  const halls = await syncExhibits();

  const integrated = halls.filter((h) => h.status === 'integrated').length;
  log('');
  log(`✓ 同步完成：策展目录 ${catalog.ok ? `${catalog.count} 条（${catalog.mode}）` : '未交付（使用本地初版）'} · `
    + `美术包 ${art.ok ? `${art.count} 个资产` : '未交付（使用本馆生成）'} · `
    + `设计系统 ${ds.ok ? '已接入 assets/ds/' : '未交付'} · 可玩展厅 ${integrated}/${halls.length} 已并入`);
  log('  产物清单：public/data/exhibits.json');
}

main().catch((err) => {
  console.error('✗ 同步失败：', err);
  process.exit(1);
});
