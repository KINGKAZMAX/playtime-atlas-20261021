/**
 * 字体本地化构建脚本
 * ------------------------------------------------------------------
 * 目标：把「织造车间调度台」用到的两套字型，裁剪成只包含界面实际字符的
 * woff2 文件，落到 public/fonts/ 下。所有字型随产物一起发布，运行时不请求
 * 任何外部字体 CDN。
 *
 *  - Noto Serif SC  (SIL OFL 1.1) —— 标题 / 栏目名 / 中文正文
 *  - JetBrains Mono (SIL OFL 1.1) —— 数字读数 / 遥测 / 日志时间戳
 *
 * 依赖全部来自 npm（subset-font / @fontsource-variable/*），不走 CDN。
 *
 * 字符集不是手工维护的：脚本扫描 src/ 与 public/ 下所有文本文件，收集
 * 真正出现过的字符，再并上一个「基础可见集」。这样新增界面文案后重新
 * 构建即可，不会漏字。
 */

import { mkdir, readFile, writeFile, access, readdir, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'fonts');
const CACHE_DIR = path.join(ROOT, 'node_modules', '.cache', 'loomdeck-fonts');

/** 基础可见集：数字、常用拉丁、标点、箭头与几何符号。 */
const BASE_GLYPHS = [
  '0123456789',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  ' .,:;!?%+-*/=()[]{}<>#@&_|~^$"\'`\\',
  '·—–…※→←↑↓⇒▸▾●○◆◇■□▲△✕✓↺⟳№™℃°±≈≤≥',
  'LOOMDECK',
].join('');

const TEXT_EXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.md', '.svg', '.txt']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'screenshots', 'fonts']);

async function exists(p) {
  try {
    await access(p, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/** 递归收集源码目录中的所有文本内容。 */
async function collectSourceText(dir, acc) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await collectSourceText(full, acc);
      continue;
    }
    if (!TEXT_EXT.has(path.extname(entry.name))) continue;
    const info = await stat(full);
    if (info.size > 2 * 1024 * 1024) continue;
    acc.push(await readFile(full, 'utf8'));
  }
  return acc;
}

/** 取出字体源文件：优先本机原始字型，其次 npm 包。 */
async function resolveSource(kind) {
  if (kind === 'serif') {
    // fontsource 的 CJK 包按 unicode-range 切成 101 个分片，无法直接交给
    // subset-font 处理；因此优先使用上游完整的变量字型。
    const candidates = [
      path.join(CACHE_DIR, 'NotoSerifSC-VF.otf'),
      path.join(ROOT, 'fonts', 'source', 'NotoSerifSC-VF.otf'),
    ];
    for (const c of candidates) {
      if (await exists(c)) {
        return { buf: await readFile(c), license: 'SIL OFL 1.1', name: 'Noto Serif SC VF' };
      }
    }
    throw new Error(
      '缺少 Noto Serif SC 原始字型。请先执行：bash scripts/fetch-sources.sh'
    );
  }

  const monoPkg = path.join(ROOT, 'node_modules', '@fontsource-variable', 'jetbrains-mono');
  const monoFile = path.join(monoPkg, 'files', 'jetbrains-mono-latin-wght-normal.woff2');
  if (await exists(monoFile)) {
    return { buf: await readFile(monoFile), license: 'SIL OFL 1.1', name: 'JetBrains Mono VF' };
  }
  throw new Error('缺少 @fontsource-variable/jetbrains-mono，请先执行 npm install。');
}

async function build() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(CACHE_DIR, { recursive: true });

  // 1) 收集界面里真正用到的字符
  const chunks = [];
  for (const d of ['src', 'public', 'scripts']) {
    await collectSourceText(path.join(ROOT, d), chunks);
  }
  const used = chunks.join('\n');
  const glyphs = new Set(BASE_GLYPHS);
  for (const ch of used) {
    const code = ch.codePointAt(0);
    // 只保留可打印字符，跳过控制字符与代理项
    if (code >= 0x20 && code !== 0x7f) glyphs.add(ch);
  }
  const glyphString = [...glyphs].join('');
  const cjkCount = [...glyphs].filter((c) => c.codePointAt(0) > 0x2e80).length;
  console.log(`[fonts] collected ${glyphs.size} glyphs from source (${cjkCount} CJK)`);

  // 2) 裁剪并输出
  const jobs = [
    { kind: 'serif', out: 'noto-serif-sc-loomdeck.woff2' },
    { kind: 'mono', out: 'jetbrains-mono-loomdeck.woff2' },
  ];

  for (const job of jobs) {
    const src = await resolveSource(job.kind);
    const out = await subsetFont(src.buf, glyphString, {
      targetFormat: 'woff2',
      variationAxes: { wght: { min: 400, max: 700 } },
    });
    await writeFile(path.join(OUT_DIR, job.out), out);
    console.log(
      `[fonts] ${job.out}  ${(out.length / 1024).toFixed(1)} KB  (source: ${src.name}, ${src.license})`
    );
  }

  await writeFile(
    path.join(OUT_DIR, 'LICENSES.txt'),
    [
      'LOOMDECK bundled fonts',
      '',
      'noto-serif-sc-loomdeck.woff2',
      '  Noto Serif SC — SIL Open Font License 1.1',
      '  Copyright The Noto Project Authors (https://github.com/notofonts/noto-cjk)',
      '  Subset to characters actually used by this interface.',
      '',
      'jetbrains-mono-loomdeck.woff2',
      '  JetBrains Mono — SIL Open Font License 1.1',
      '  Copyright The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)',
      '  Subset to characters actually used by this interface.',
      '',
      'Both fonts are bundled locally and served from /fonts/. No font CDN is contacted at runtime.',
      '',
    ].join('\n'),
    'utf8'
  );
  console.log('[fonts] done ->', path.relative(ROOT, OUT_DIR));
}

build().catch((err) => {
  console.error('[fonts] FAILED:', err.message);
  process.exit(1);
});
