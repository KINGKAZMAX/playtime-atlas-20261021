#!/usr/bin/env node
/**
 * 作品与资产总览 · 总构建编排
 * ------------------------------------------------------------------
 * 逐件构建本批作品 → 组装 site/（GitHub Pages 发布根）。
 *
 * 设计要点：
 *  1. 单件失败不阻断其余作品；
 *  2. 失败且仓库中已有上一版产物 → 回退到已提交版本并标记 fallback；
 *  3. 失败且无历史产物 → 标记 unavailable，大厅中该条不提供可点击入口；
 *  4. 扫描产物中的绝对路径（/assets/、src="/）并报告 Pages 子路径风险；
 *  5. 生成 data/works.json 与 data/build-report.json 供大厅与验收使用。
 *
 * 用法：node scripts/build.mjs [--no-clean] [--only <id,...>]
 */

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { filterOutput } from './publish-filter.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'docs');
const argv = process.argv.slice(2);
const only = (() => {
  const i = argv.indexOf('--only');
  return i >= 0 ? argv[i + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
})();
const noClean = argv.includes('--no-clean');
const fast = argv.includes('--fast'); // 已存在 node_modules 时跳过依赖安装

// ---------------------------------------------------------------- utils

const log = (...a) => console.log('[build]', ...a);
const warn = (...a) => console.warn('[build][warn]', ...a);

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function ensure(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest, filter) {
  ensure(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      copyDir(s, d, filter);
    } else if (entry.isFile()) {
      if (filter && !filter(s)) continue;
      fs.copyFileSync(s, d);
    }
  }
}

function du(dir) {
  let total = 0;
  const walk = (p) => {
    let st;
    try {
      st = fs.statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const e of fs.readdirSync(p)) walk(path.join(p, e));
    } else total += st.size;
  };
  walk(dir);
  return total;
}

function run(cmd, args, cwd, opts = {}) {
  const res = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    stdio: opts.quiet ? 'pipe' : 'inherit',
    env: { ...process.env, ...(opts.env || {}) },
    shell: process.platform === 'win32',
  });
  if (res.status !== 0) {
    const out = `${res.stdout || ''}${res.stderr || ''}`.trim().split('\n').slice(-14).join('\n');
    throw new Error(`${cmd} ${args.join(' ')} 失败 (exit ${res.status})\n${out}`);
  }
  return res;
}

/** 扫描 HTML/JS 中的根绝对路径，Pages 子路径下会 404。 */
function scanAbsolutePaths(dir) {
  const hits = [];
  const walk = (p) => {
    let st;
    try {
      st = fs.statSync(p);
    } catch {
      return;
    }
    if (st.isDirectory()) {
      for (const e of fs.readdirSync(p)) walk(path.join(p, e));
      return;
    }
    if (!/\.(html|js|css)$/i.test(p)) return;
    const txt = fs.readFileSync(p, 'utf8');
    const re = /(?:src|href)\s*=\s*["']((?:https?:)?\/\/[^"']+|\/[^"'/][^"']*)["']/g;
    let m;
    while ((m = re.exec(txt))) {
      const url = m[1];
      if (url.startsWith('//') || url.startsWith('data:') || url.startsWith('mailto:')) continue;
      if (/^https?:\/\//.test(url)) continue; // 外链允许
      hits.push({ file: path.relative(ROOT, p), url });
    }
  };
  walk(dir);
  return hits;
}

// ---------------------------------------------------------------- manifest

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'works.json'), 'utf8'));
const works = manifest.works.filter((work) => work.publish !== false);

// ---------------------------------------------------------------- 公开净化

/**
 * 内部台账字段：来源出处、授权说明、与参考作品的差异对照、内部流程引用。
 * 这些内容保留在仓库的 works.json 中供内部核验，**不进入发布产物**。
 */
const LEDGER_FIELDS = ['sources', 'license', 'differences', 'upstream'];

/** 公开 manifest 元信息白名单：note / caveat 等内部说明不外发。 */
const PUBLIC_META_FIELDS = ['project', 'projectCn', 'hall', 'hallEn', 'repo', 'batch', 'updated'];

function toPublicWorks(list) {
  return list.map((w) => {
    const out = { ...w };
    for (const f of LEDGER_FIELDS) delete out[f];
    return out;
  });
}

function toPublicMeta(meta) {
  const out = {};
  for (const f of PUBLIC_META_FIELDS) if (meta[f] !== undefined) out[f] = meta[f];
  return out;
}

// ---------------------------------------------------------------- build

const results = [];

async function buildWork(work) {
  const started = Date.now();
  const appDir = path.join(ROOT, work.build?.appDir || `apps/${work.id}`);
  const outDir = path.join(ROOT, work.outputDir);
  const type = work.build?.type || 'npm';

  const rec = {
    id: work.id,
    title: work.title,
    type,
    qaState: work.qaState || (work.status === 'ready' ? 'verified' : 'pending-reverify'),
    outputDir: work.outputDir,
    buildState: 'pending',
    built: false,
    fallback: false,
    bytes: 0,
    durationMs: 0,
    notes: [],
    absolutePathRisks: [],
    entryExists: false,
  };

  try {
    if (!fs.existsSync(appDir)) {
      throw new Error(`源码目录缺失：${path.relative(ROOT, appDir)}`);
    }

    if (type === 'npm') {
      if (!fs.existsSync(path.join(appDir, 'package.json'))) {
        throw new Error('缺少 package.json，无法构建');
      }
      const pkg = JSON.parse(fs.readFileSync(path.join(appDir, 'package.json'), 'utf8'));
      const hasLock = fs.existsSync(path.join(appDir, 'package-lock.json'));
      const hasModules = fs.existsSync(path.join(appDir, 'node_modules'));
      if (fast && hasModules) {
        log(`→ ${work.id}: 复用已有 node_modules (--fast)`);
      } else {
        log(`→ ${work.id}: 安装依赖 (${hasLock ? 'npm ci' : 'npm install'})`);
        try {
          run('npm', hasLock ? ['ci', '--no-audit', '--no-fund'] : ['install', '--no-audit', '--no-fund'], appDir, {
            quiet: true,
          });
        } catch (e) {
          // lock 与 package.json 不同步时回退到 install
          warn(`${work.id}: npm ci 失败，改用 npm install`);
          run('npm', ['install', '--no-audit', '--no-fund'], appDir, { quiet: true });
        }
      }
      const buildScript = pkg.scripts?.build;
      if (!buildScript) throw new Error('package.json 未定义 build 脚本');
      log(`→ ${work.id}: ${buildScript}`);
      run('npm', ['run', 'build'], appDir, { quiet: true });

      // 产物目录：优先 dist，其次 build，再其次 appDir 本身
      const candidates = [path.join(appDir, 'dist'), path.join(appDir, 'build'), appDir];
      const src = candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isDirectory());
      if (!src) throw new Error('构建后未找到产物目录');
      rmrf(outDir);
      copyDir(src, outDir);

      // 随包模型等大件产物：Vite 不会把 appDir/models 复制进 dist，这里补齐
      for (const extra of ['models']) {
        const from = path.join(appDir, extra);
        if (fs.existsSync(from) && fs.statSync(from).isDirectory()) {
          const to = path.join(outDir, extra);
          rmrf(to);
          copyDir(from, to);
        }
      }
    } else if (type === 'static') {
      rmrf(outDir);
      // 纯静态产物：只发布网页文件，不带 package.json / README 等开发文件
      const keepDirs = ['data', 'public', 'assets', 'exhibits', 'models', 'fonts'];
      const keepExts = new Set(['.html', '.css', '.js', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.glb', '.woff2', '.woff', '.ico', '.map']);
      // 发布排除项：内部台账与研究档案（manifest / cases / data 等）不随站点发布
      const exclude = new Set((work.build?.exclude || []).map((e) => e.replace(/\/$/, '')));
      for (const e of fs.readdirSync(appDir, { withFileTypes: true })) {
        const s = path.join(appDir, e.name);
        try {
          if (e.isDirectory()) {
            if (exclude.has(e.name)) continue;
            if (keepDirs.includes(e.name)) copyDir(s, path.join(outDir, e.name));
          } else if (e.isFile()) {
            if (exclude.has(e.name)) continue;
            const ext = path.extname(e.name).toLowerCase();
            if (keepExts.has(ext) && e.name !== 'package.json') {
              fs.copyFileSync(s, path.join(outDir, e.name));
            }
          }
        } catch (err) {
          // 上游正在改写文件：源文件可能在这一瞬间被替换或删除，跳过即可
          warn(`静态复制跳过 ${e.name}：${err.code || err.message}`);
        }
      }
      if (!fs.existsSync(path.join(outDir, 'index.html'))) {
        throw new Error('静态产物缺少 index.html');
      }
    } else if (type === 'page') {
      if (!work.buildCommand) throw new Error('缺少 buildCommand');
      const parts = work.buildCommand.trim().split(/\s+/);
      log(`→ ${work.id}: ${work.buildCommand}`);
      run(parts[0], parts.slice(1), ROOT, { quiet: true });
      if (!fs.existsSync(outDir)) throw new Error('页面构建后未生成产物目录');
    } else {
      throw new Error(`未知构建类型 ${type}`);
    }

    const filtered = filterOutput(outDir);
    if (filtered.removedDocs || filtered.sanitizedHtml) {
      rec.notes.push(`发布过滤：移除台账文档 ${filtered.removedDocs} 份、清理页面 ${filtered.sanitizedHtml} 处`);
    }

    const entryRel = work.entry.replace(/^site\//, '');
    rec.entryExists = fs.existsSync(path.join(SITE, entryRel));
    rec.built = true;
    rec.buildState = 'built';
    rec.bytes = du(outDir);
    rec.durationMs = Date.now() - started;
    rec.absolutePathRisks = scanAbsolutePaths(outDir).slice(0, 20);
    if (rec.absolutePathRisks.length) {
      rec.notes.push(`发现 ${rec.absolutePathRisks.length} 处根绝对路径，Pages 子路径下可能 404`);
    }
    if (!rec.entryExists) {
      rec.notes.push(`入口文件未找到：${entryRel}`);
      rec.buildState = 'built-no-entry';
    }
  } catch (err) {
    rec.durationMs = Date.now() - started;
    rec.notes.push(String(err.message || err).split('\n')[0]);
    // 回退：尝试用 git 中已提交的上一版产物
    const restored = tryFallback(outDir);
    if (restored) {
      rec.fallback = true;
      rec.buildState = 'fallback';
      rec.bytes = du(outDir);
      const entryRel = work.entry.replace(/^site\//, '');
      rec.entryExists = fs.existsSync(path.join(SITE, entryRel));
    } else {
      rec.buildState = 'unavailable';
      rec.built = false;
    }
    warn(`${work.id} 构建失败：${String(err.message || err).split('\n')[0]}`);
  }

  return rec;
}

function tryFallback(outDir) {
  if (!fs.existsSync(outDir)) return false;
  const rel = path.relative(ROOT, outDir);
  try {
    const res = spawnSync('git', ['cat-file', '-e', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf8' });
    if (res.status !== 0) return false;
    run('git', ['checkout', 'HEAD', '--', rel], ROOT, { quiet: true });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- assemble

function buildCovers() {
  const script = path.join(ROOT, 'scripts', 'make-covers.mjs');
  if (!fs.existsSync(script)) return;
  try {
    run('node', [script], ROOT, { quiet: true });
  } catch (e) {
    warn('封面生成失败：', e.message);
  }
}

function assembleHall(runtimeWorks, report) {
  const hallSrc = path.join(ROOT, 'hall');
  if (!fs.existsSync(hallSrc)) {
    warn('hall/ 不存在，跳过大厅组装');
    return;
  }
  // hall 静态资源 → site/
  copyDir(hallSrc, SITE, (p) => !p.endsWith('index.html') || p === path.join(hallSrc, 'index.html'));

  const indexPath = path.join(SITE, 'index.html');
  if (!fs.existsSync(indexPath)) {
    warn('hall/index.html 缺失');
    return;
  }
  let html = fs.readFileSync(indexPath, 'utf8');

  const inject = (source, id, payload) => {
    const marker = new RegExp(`(<script id="${id}" type="application/json">)[\\s\\S]*?(</script>)`);
    if (!marker.test(source)) {
      warn(`未找到 ${id} 占位标记`);
      return source;
    }
    // 避免 $ 序列在 replace 中被当作替换模式
    return source.replace(marker, (_m, a, b) => `${a}${payload}${b}`);
  };

  // 公开产物只带净化后的清单：台账字段（来源 / 许可 / 差异）不外发
  const publicWorks = toPublicWorks(runtimeWorks);
  const manifestPayload = JSON.stringify(
    { meta: toPublicMeta(manifest.meta), sections: manifest.sections.filter((section) => section.publish !== false), works: publicWorks },
    null,
    2
  );
  html = inject(html, 'works-data', manifestPayload);
  html = inject(html, 'build-report', JSON.stringify(report, null, 2));

  fs.writeFileSync(indexPath, html);

  ensure(path.join(SITE, 'data'));
  fs.writeFileSync(path.join(SITE, 'data', 'works.json'), JSON.stringify(publicWorks, null, 2));
}

/**
 * 最终公开主页数据与封面生成步骤。
 *
 * assembleHall 注入的是源 manifest（封面仍是旧的 SVG、字段偏多），
 * 因此发布链路的最后一步交给 refresh-gallery.mjs：以 hall/cover-map.json 的真实截图封面
 * 与白名单净化字段重写主页内嵌 JSON。
 *
 * 该步骤失败必须中断整个构建（抛错 → main() 的 catch 退出码 1），
 * 绝不允许在失败时静默继续，否则会把旧封面当作成功产物发布。
 */
function refreshGallery() {
  const script = path.join(ROOT, 'scripts', 'refresh-gallery.mjs');
  if (!fs.existsSync(script)) {
    throw new Error('缺少 scripts/refresh-gallery.mjs：无法生成最终公开主页数据与真实封面');
  }

  const res = run('node', [script, '--root', ROOT], ROOT, { quiet: true });

  const tail = String(res.stdout || '').trim().split('\n').filter(Boolean).pop() || '';
  let note = '';
  try {
    const data = JSON.parse(tail);
    if (data && data.ok) {
      note = `作品 ${data.works} 件 · 封面覆盖 ${Object.keys(data.coverOverrides || {}).length} 张`;
    }
  } catch {
    /* 摘要解析失败不影响发布结果，run() 已保证退出码为 0 */
  }
  log('最终公开主页数据与封面已生成：', note || 'refresh-gallery 完成');
}

// ---------------------------------------------------------------- main

async function main() {
  log('仓库根：', ROOT);
  if (!noClean) {
    // 发布根整体重建：所有内容都是生成物，避免残留过期页面
    rmrf(SITE);
  }
  ensure(SITE);
  // GitHub Pages 分支式发布：跳过 Jekyll 处理，原样托管
  fs.writeFileSync(path.join(SITE, '.nojekyll'), '');
  buildCovers();

  const targets = only ? works.filter((w) => only.includes(w.id)) : works;
  for (const work of targets) {
    const rec = await buildWork(work);
    results.push(rec);
    const flag =
      rec.buildState === 'built' ? '✓' : rec.buildState === 'built-no-entry' ? '!' : rec.buildState === 'fallback' ? '↺' : '✗';
    log(`${flag} ${work.id.padEnd(18)} ${rec.buildState.padEnd(14)} ${(rec.bytes / 1024).toFixed(0).padStart(7)} KB`);
  }

  // 运行时清单：把真实构建结果写回状态
  const byId = new Map(results.map((r) => [r.id, r]));
  const runtimeWorks = works.map((w) => {
    const rec = byId.get(w.id);
    const out = { ...w };
    if (rec) {
      out.buildState = rec.buildState;
      out.buildNotes = rec.notes;
      out.bytes = rec.bytes;
      out.entryExists = rec.entryExists;
      out.online = rec.buildState === 'built' || rec.buildState === 'built-no-entry' || rec.buildState === 'fallback';
      if (rec.buildState === 'unavailable' || !rec.entryExists) {
        out.online = false;
        out.playable = false;
        out.statusNote =
          out.statusNote ||
          `本次构建未通过：${(rec.notes[0] || '未知原因').slice(0, 120)}`;
      }
    } else {
      out.buildState = 'skipped';
      out.online = false;
    }
    return out;
  });

  const report = {
    builtAt: new Date().toISOString(),
    node: process.version,
    works: results,
    totals: {
      total: results.length,
      built: results.filter((r) => r.buildState === 'built' || r.buildState === 'built-no-entry').length,
      fallback: results.filter((r) => r.buildState === 'fallback').length,
      unavailable: results.filter((r) => r.buildState === 'unavailable').length,
      bytes: results.reduce((a, r) => a + r.bytes, 0),
    },
  };
  ensure(path.join(SITE, 'data'));
  fs.writeFileSync(path.join(SITE, 'data', 'build-report.json'), JSON.stringify(report, null, 2));

  assembleHall(runtimeWorks, report);
  // 公开主页的最终形态由 refresh-gallery 决定（真实封面 + 净化字段）
  refreshGallery();

  log('---- 构建汇总 ----');
  log(`成功 ${report.totals.built} · 回退 ${report.totals.fallback} · 不可用 ${report.totals.unavailable} · 合计 ${(report.totals.bytes / 1024 / 1024).toFixed(2)} MB`);
  const bad = results.filter((r) => r.buildState === 'unavailable');
  if (bad.length) log('不可用项：', bad.map((b) => b.id).join(', '));
  log('产物：', path.relative(process.cwd(), SITE));
}

main().catch((e) => {
  console.error('[build][fatal]', e);
  process.exit(1);
});
