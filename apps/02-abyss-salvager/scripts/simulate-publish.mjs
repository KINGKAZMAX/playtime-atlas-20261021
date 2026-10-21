#!/usr/bin/env node
/**
 * 发布链路离线模拟（只读本任务目录，不写入 14-publish）。
 *
 * 复刻 `14-publish/release/scripts/sync-apps.mjs` 与 `build.mjs` 对本作品
 * 实际会走的每一步，在 /tmp 下重建一遍，用来回答三个问题：
 *
 *   1. 同步后 `apps/02-abyss-salvager/` 里模型到底落在哪、有几份；
 *   2. 构建产物 `dist/` 复制到 `docs/works/02-abyss-salvager/` 后，
 *      `models/` 下是否只剩一份正确命名的 GLB；
 *   3. 产物里有没有根绝对路径（GitHub Pages 子路径下会 404）。
 *
 * 全部在临时目录内完成，结束后清理，不触碰 14-publish 的任何文件。
 *
 *   node scripts/simulate-publish.mjs
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const BATCH = path.resolve(ROOT, '..');
const PUBLISH = path.join(BATCH, '14-publish', 'release');

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'abyss-publish-sim-'));
const APP = path.join(TMP, 'apps', '02-abyss-salvager');
const OUT = path.join(TMP, 'docs', 'works', '02-abyss-salvager');

/** —— 与 sync-apps.mjs 保持一致 ——
 *  真实脚本 L119 的规则是：
 *    `ALLOW_FILES.has(e.name) || (e.name.endsWith('.html') && e.name !== 'index.html')`
 *  即**任何非 index 的 .html 都会被同步**（本项目的第二入口 notes.html 靠这一条进去）。
 *  漏掉这一条会让多页构建在发布流水线里因缺少 notes.html 而失败。 */
const ALLOW_FILES = new Set([
  'package.json', 'package-lock.json', 'vite.config.js', 'vite.config.ts', 'vite.config.mjs',
  'index.html', 'README.md', 'QA.md', 'CONTROLS.md', 'LICENSE', 'LICENSES.md', 'SOURCES.md',
  'REFERENCE-DESIGN.md', 'DIFF-AUDIT.md', 'HANDOFF-14.md', 'QA-MATRIX.md', 'QA-CHECKLIST.md',
  'catalog.json', 'issues.json', 'manifest.json', 'design-tokens.json', 'asset-manifest.json',
  'index.data.json', 'TOP3.md', 'RANKING.md', 'cases.json', 'STATUS.md', 'TASK.md',
  'SOURCE.md', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json',
  'svelte.config.js', 'astro.config.mjs', 'next.config.js', 'vercel.json',
]);
/** 真实同步脚本额外放行的顶层 .html（index.html 已在上表）。 */
const EXTRA_HTML = (name) => name.endsWith('.html') && name !== 'index.html';
const ALLOW_DIRS = new Set([
  'src', 'public', 'scripts', 'models', 'assets', 'exhibits', 'data', 'fonts', 'static', 'lib',
]);
const DENY = new Set([
  'node_modules', 'dist', 'build', '.git', '.DS_Store', 'raw', 'media', 'frames',
  'references', 'screenshots', 'tmp', 'coverage', '.cache',
  '.venv', 'venv', '__pycache__', '.mypy_cache', '.pytest_cache', '.ruff_cache',
  '.idea', '.vscode', '.next', '.turbo',
]);
const DENY_EXT = new Set(['.pyc', '.pyo', '.log', '.db', '.sqlite']);

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (DENY.has(e.name)) continue;
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else if (e.isFile() && !DENY_EXT.has(path.extname(e.name).toLowerCase())) {
      fs.copyFileSync(s, d);
    }
  }
}

/** —— 与 build.mjs 一致 —— */
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
      if (/^https?:\/\//.test(url)) continue;
      hits.push({ file: path.relative(TMP, p), url });
    }
  };
  walk(dir);
  return hits;
}

function tree(dir, prefix = '', depth = 0) {
  if (depth > 2) return '';
  let out = '';
  const entries = fs.existsSync(dir)
    ? fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.name !== '.DS_Store')
    : [];
  for (const e of entries) {
    const s = path.join(dir, e.name);
    if (e.isDirectory()) {
      out += `${prefix}${e.name}/\n`;
      out += tree(s, `${prefix}  `, depth + 1);
    } else {
      out += `${prefix}${e.name}  ${(fs.statSync(s).size / 1048576).toFixed(2)} MB\n`;
    }
  }
  return out;
}

const problems = [];
const note = (ok, label, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  ${detail ?? ''}`);
  if (!ok) problems.push(label);
};

try {
  // ============ 步骤 1：sync-apps 同步 ============
  console.log('\n=== 步骤 1：模拟 sync-apps.mjs 同步上游源码 ===');
  fs.mkdirSync(APP, { recursive: true });
  let n = 0;
  for (const e of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (e.isFile() && (ALLOW_FILES.has(e.name) || EXTRA_HTML(e.name))) {
      fs.copyFileSync(path.join(ROOT, e.name), path.join(APP, e.name));
      n++;
    } else if (e.isDirectory() && ALLOW_DIRS.has(e.name)) {
      copyDir(path.join(ROOT, e.name), path.join(APP, e.name));
      n++;
    }
  }
  // 复用本项目已装好的依赖，不重复 npm ci
  fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(APP, 'node_modules'));
  console.log(`[sim] 同步 ${n} 个顶层条目 → ${path.relative(TMP, APP)}`);
  console.log(`[sim] apps 目录内容：\n${tree(APP)}`);

  note(
    !fs.existsSync(path.join(APP, 'models')),
    'apps 内无根 models/ 残留',
    '同步后根 models/ 不存在'
  );
  note(
    fs.existsSync(path.join(APP, 'public', 'models', 'abyss-salvager-ac-vii.glb')),
    'apps 内模型位于 public/models/',
    'public/models/abyss-salvager-ac-vii.glb'
  );
  note(
    !fs.existsSync(path.join(APP, 'dist')),
    'apps 内无 dist/（DENY）',
    'dist 由发布流水线现场构建'
  );
  note(
    fs.existsSync(path.join(APP, 'notes.html')),
    'apps 内含第二入口 notes.html',
    '真实 sync-apps 会同步任何非 index 的 .html；缺它多页构建会失败'
  );

  // ============ 步骤 2：build.mjs 执行 npm run build ============
  console.log('\n=== 步骤 2：模拟 build.mjs 执行 npm run build ===');
  const build = spawnSync('npm', ['run', 'build'], { cwd: APP, encoding: 'utf8', shell: false });
  console.log((build.stdout || '').trim().split('\n').slice(-8).join('\n'));
  note(build.status === 0, 'npm run build 成功', `exit=${build.status}`);
  const dist = path.join(APP, 'dist');
  note(fs.existsSync(path.join(dist, 'index.html')), 'dist/index.html 存在', '');
  note(fs.existsSync(path.join(dist, 'notes.html')), 'dist/notes.html 存在（多页构建）', '');

  // ============ 步骤 3：build.mjs 组装 outDir ============
  console.log('\n=== 步骤 3：模拟 build.mjs 组装 docs/works/02-abyss-salvager ===');
  fs.mkdirSync(OUT, { recursive: true });
  if (!fs.existsSync(dist)) {
    note(false, 'dist 存在（构建未产出，无法组装）', dist);
  } else {
    copyDir(dist, OUT);
  }
  // build.mjs 的随包模型补齐步骤
  const extraFrom = path.join(APP, 'models');
  if (fs.existsSync(extraFrom) && fs.statSync(extraFrom).isDirectory()) {
    fs.rmSync(path.join(OUT, 'models'), { recursive: true, force: true });
    copyDir(extraFrom, path.join(OUT, 'models'));
    console.log('[sim] 补齐步骤执行：appDir/models 存在');
  } else {
    console.log('[sim] 补齐步骤跳过：appDir/models 不存在（模型已随 public/ 进 dist）');
  }
  console.log(`[sim] outDir 内容：\n${tree(OUT)}`);

  // ============ 步骤 4：断言产物形态 ============
  console.log('\n=== 步骤 4：断言发布产物 ===');
  const outModels = path.join(OUT, 'models');
  const glbs = fs.existsSync(outModels)
    ? fs.readdirSync(outModels).filter((f) => f.toLowerCase().endsWith('.glb'))
    : [];
  note(glbs.length === 1, 'outDir/models 恰好一份 GLB', glbs.join(', ') || 'none');
  note(
    glbs[0] === 'abyss-salvager-ac-vii.glb',
    'outDir/models 文件名正确',
    glbs[0] || 'none'
  );
  note(
    !fs.existsSync(path.join(outModels, 'mech-sandworm-1312m.glb')),
    'outDir 内无 legacy 旧名',
    'mech-sandworm-1312m.glb 不存在'
  );
  // 线上 artifact 路径（works.json 里声明的）
  const works = JSON.parse(fs.readFileSync(path.join(PUBLISH, 'works.json'), 'utf8'));
  const work = works.works.find((w) => w.id === '02-abyss-salvager');
  const declared = (work.artifacts || []).map((a) => a.path);
  const produced = fs
    .readdirSync(outModels)
    .map((f) => `works/02-abyss-salvager/models/${f}`);
  for (const p of declared) {
    note(produced.includes(p), `works.json 声明的 artifact 存在：${p}`, '');
  }
  // 说明页引用的文档必须随产物走，否则线上 notes.html 的链接会 404
  for (const doc of ['SOURCE.md', 'LICENSES.md']) {
    note(
      fs.existsSync(path.join(OUT, doc)),
      `outDir 含说明页引用的文档：${doc}`,
      ''
    );
  }
  // 字节一致性
  const srcGlb = path.join(ROOT, 'public', 'models', 'abyss-salvager-ac-vii.glb');
  const outGlb = path.join(outModels, 'abyss-salvager-ac-vii.glb');
  note(
    fs.existsSync(outGlb) && fs.statSync(outGlb).size === fs.statSync(srcGlb).size,
    'outDir GLB 与源文件字节一致',
    `${fs.existsSync(outGlb) ? fs.statSync(outGlb).size : 0} bytes`
  );

  // ============ 步骤 5：根绝对路径风险 ============
  console.log('\n=== 步骤 5：扫描根绝对路径（Pages 子路径风险）===');
  const risks = scanAbsolutePaths(OUT);
  note(risks.length === 0, '产物无根绝对路径', risks.length ? JSON.stringify(risks) : 'none');

  // ============ 步骤 6：manifest 合并后的 id ============
  console.log('\n=== 步骤 6：模拟 sync-apps 的 manifest 合并 ===');
  const mine = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
  const merged = {
    id: work.id,
    title: work.title,
    description: work.description,
    entry: work.entry,
    buildCommand: work.buildCommand,
    outputDir: work.outputDir,
    status: work.status,
    upstream: work.upstream,
    license: work.license,
    sources: work.sources,
    ...mine,
  };
  note(merged.id === '02-abyss-salvager', '合并后 id 与 works.json 一致', merged.id);
  console.log(`[sim] merged manifest.id = ${merged.id}`);
  console.log(`[sim] merged manifest.entry = ${merged.entry}`);
  console.log(`[sim] merged manifest.outputDir = ${merged.outputDir}`);
  console.log(`[sim] merged manifest.buildCommand = ${merged.buildCommand}`);
} finally {
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log('\n[sim] 临时目录已清理，未写入 14-publish');
}

console.log(
  problems.length ? `\n[sim] ${problems.length} 项未通过：${problems.join(' / ')}` : '\n[sim] 全部通过'
);
process.exit(problems.length ? 1 : 0);
