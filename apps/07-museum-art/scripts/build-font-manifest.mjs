/**
 * 回响电玩馆 / PLAYTIME ATLAS — 自托管字体清单生成器
 *
 * 输出：public/assets/fonts/FONT-MANIFEST.json
 *
 * 为什么要有这份文件
 * ------------------
 * 06-museum-core 与 13-qa-curation 都需要一份**机器可读**的字体清单来核对
 * 「字体是否自托管、许可是否完整、文件是否与 16-design-system 逐字节一致」。
 * 16-design-system 用的是同一套 schema，本包按同一 schema **自产**一份
 * （不是复制 16 的文件）：内容全部由本目录 public/assets/fonts/ 的实际文件算出。
 *
 * schema 依据：16-design-system/fonts/FONT-MANIFEST.json（结构对齐，内容自产）
 * 运行：node scripts/build-font-manifest.mjs
 */

import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const FONTS_DIR = path.join(ROOT, 'public', 'assets', 'fonts');
const OUT = path.join(FONTS_DIR, 'FONT-MANIFEST.json');

const DS_FONTS = path.resolve(ROOT, '..', '16-design-system', 'fonts');

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

/* ---------- 1. 清单里登记的字体族与角色 ---------- */
const FAMILIES = [
  {
    family: 'Space Grotesk',
    role: 'display / 展示体',
    usage: '年代标题、编号、数字',
    file: 'space-grotesk-latin.woff2',
    licenseFile: 'OFL-space-grotesk.txt',
    weightRange: '300 700',
    coverage: 'latin + digits',
  },
  {
    family: 'Inter',
    role: 'sans / 正文',
    usage: '段落、说明、界面文案',
    file: 'inter-latin.woff2',
    licenseFile: 'OFL-inter.txt',
    weightRange: '100 900',
    coverage: 'latin + digits',
  },
  {
    family: 'Space Mono',
    role: 'mono / 编号与标签',
    usage: '编号、年份、展品标签',
    styles: [
      { weight: 400, file: 'space-mono-regular.woff2' },
      { weight: 700, file: 'space-mono-bold.woff2' },
    ],
    licenseFile: 'OFL-space-mono-regular.txt',
    coverage: 'latin + digits',
  },
  {
    family: 'Noto Sans SC',
    role: 'cjk / 中文',
    usage: '全部汉字',
    file: 'noto-sans-sc-subset.woff2',
    licenseFile: 'OFL-noto-sans-sc.txt',
    weightRange: '100 900',
    coverage: 'CJK 子集（本包用字）',
  },
];

/* ---------- 2. 逐文件核对存在性、字节数与哈希 ---------- */
const allFiles = [];
for (const f of FAMILIES) {
  if (f.file) allFiles.push(f.file);
  for (const s of f.styles || []) allFiles.push(s.file);
}

const files = [];
for (const name of allFiles) {
  const p = path.join(FONTS_DIR, name);
  if (!existsSync(p)) {
    console.error(`✗ 字体文件缺失：public/assets/fonts/${name}`);
    process.exit(1);
  }
  const buf = readFileSync(p);
  files.push({
    file: name,
    bytes: buf.length,
    format: name.endsWith('.woff2') ? 'woff2' : name.endsWith('.ttf') ? 'ttf' : 'bin',
    sha256: sha256(buf),
  });
}

/* ---------- 3. 与 16 的逐字节一致性 ---------- */
const dsFiles = existsSync(DS_FONTS) ? DS_FONTS : null;
const alignment = {
  alignedTo: '16-design-system/fonts/FONT-MANIFEST.json',
  note:
    '本包字体文件与 16-design-system/fonts/ 下的同名文件逐字节一致（SHA-256 相同）。' +
    '本清单为自产文件，不复制 16 的清单内容。',
  files: [],
  fontsIdentical: true,
};
for (const f of files) {
  const dsPath = dsFiles ? path.join(dsFiles, f.file) : null;
  const dsSha = dsPath && existsSync(dsPath) ? sha256(readFileSync(dsPath)) : null;
  const same = dsSha !== null && dsSha === f.sha256;
  if (!same) alignment.fontsIdentical = false;
  alignment.files.push({ file: f.file, localSha256: f.sha256, dsSha256: dsSha, identical: same });
}

/* ---------- 4. 字体栈（与 tokens.css 的 --ds-font-* 一致） ---------- */
const tokensCss = readFileSync(path.join(ROOT, 'src', 'tokens.css'), 'utf8');
const stackOf = (name) => {
  const m = tokensCss.match(new RegExp(`${name}:\\s*([^;]+);`));
  return m
    ? m[1].replace(/["']/g, '').split(',').map((x) => x.trim()).filter(Boolean)
    : [];
};

/* ---------- 5. 许可 ---------- */
const licenses = [];
for (const f of readdirSync(FONTS_DIR)) {
  if (!f.startsWith('OFL-') || !f.endsWith('.txt')) continue;
  const buf = readFileSync(path.join(FONTS_DIR, f));
  licenses.push({
    file: f,
    bytes: buf.length,
    sha256: sha256(buf),
    license: 'SIL Open Font License 1.1',
    verified: /SIL OPEN FONT LICENSE Version 1\.1/.test(buf.toString('utf8')),
  });
}
const unlicensed = licenses.filter((l) => !l.verified);
if (unlicensed.length) {
  console.error('✗ 许可原文校验失败：', unlicensed.map((l) => l.file).join(', '));
  process.exit(1);
}

/* ---------- 6. CJK 子集字数 ---------- */
let cjkChars = null;
try {
  const am = readJSON(path.join(ROOT, 'public', 'assets', 'assets.manifest.json'));
  cjkChars = am.fonts?.cjkChars ?? null;
} catch { /* 清单尚未生成时跳过 */ }

/* ---------- 7. 输出 ---------- */
const manifest = {
  $comment:
    '回响电玩馆 / PLAYTIME ATLAS — 可自托管字体清单。全部为 SIL Open Font License 1.1，' +
    '许可原文随包附于本目录。运行期零外部 CDN 请求。',
  generatedAt: new Date().toISOString(),
  version: '1.1.0',
  policy: {
    selfHostedOnly: true,
    externalCdn: false,
    preload: ['space-grotesk-latin.woff2', 'inter-latin.woff2'],
    fontDisplay: 'swap',
    cjkStrategy:
      '拉丁字体仅覆盖拉丁与数字；中文优先使用系统字体栈（零字节、覆盖完整），' +
      'Noto Sans SC 子集作为渐进增强。顺序规则：覆盖完整的系统 CJK 族必须排在覆盖有限的子集之前' +
      '（CSS 按字符回退，子集在前会让同一段文字混入两套字形、基线错位）。',
    note:
      '字体为 SIL Open Font License 1.1 的开源字体，自托管分发；' +
      '本包未取自任何参考站，也未使用任何商业字库或品牌字体。',
  },
  stackResolution: {
    display: stackOf('--ds-font-display'),
    text: stackOf('--ds-font-text'),
    mono: stackOf('--ds-font-mono'),
    source: 'src/tokens.css 的 --ds-font-display / --ds-font-text / --ds-font-mono',
  },
  faces: FAMILIES.map((f) => ({
    family: f.family,
    role: f.role,
    usage: f.usage,
    license: 'SIL Open Font License 1.1',
    licenseFile: f.licenseFile,
    file: f.file,
    styles: f.styles,
    weightRange: f.weightRange,
    coverage: f.coverage,
  })),
  files,
  licenses,
  coverage: {
    cjkChars,
    note: cjkChars
      ? `中文字形子集覆盖本包实际用字 ${cjkChars} 个；若全站用字超出覆盖，需要重新子集化并同步 16。`
      : '子集字数待 assets.manifest.json 生成后回填。',
  },
  alignment,
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log('✓ 字体清单生成完成 → public/assets/fonts/FONT-MANIFEST.json');
console.log(`  · 字体族 ${FAMILIES.length} 个 · 文件 ${files.length} 个 · 许可原文 ${licenses.length} 份（均已校验为 OFL 1.1）`);
console.log(`  · 与 16 逐字节一致：${alignment.fontsIdentical ? '是 ✓' : '否 ✗'}`);
console.log(`  · 中文字形子集：${cjkChars ?? '待回填'} 字`);
if (!alignment.fontsIdentical) process.exit(1);
