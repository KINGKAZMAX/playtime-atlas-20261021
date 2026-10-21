/**
 * 回响电玩馆 — 字体管线
 * 1. 下载 SIL OFL 1.1 开源字体到 scripts/.cache/fonts（缓存，可离线重跑）
 * 2. 扫描本包全部文案，抽取实际用到的字符集
 * 3. 用 fontTools 子集化为 woff2 + ttf，输出到 public/assets/fonts
 * 4. 产出本地 @font-face 样式 fonts.css 与 OFL 许可证副本
 *
 * 运行：node scripts/build-fonts.mjs
 */

import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CACHE = path.join(HERE, '.cache', 'fonts');
const OUT = path.join(ROOT, 'public', 'assets', 'fonts');
const VENV_PY = path.join(ROOT, '.venv', 'bin', 'python');

/** 下载源：google/fonts 官方仓库（各家族目录内附 OFL.txt） */
const SOURCES = [
  {
    key: 'space-grotesk',
    label: 'Space Grotesk',
    ttf: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf',
    license: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt',
    out: 'space-grotesk-latin',
    scope: 'latin',
  },
  {
    key: 'inter',
    label: 'Inter',
    ttf: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf',
    license: 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt',
    out: 'inter-latin',
    scope: 'latin',
  },
  {
    key: 'space-mono-regular',
    label: 'Space Mono Regular',
    ttf: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/SpaceMono-Regular.ttf',
    license: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/OFL.txt',
    out: 'space-mono-regular',
    scope: 'latin',
    weight: 400,
  },
  {
    key: 'space-mono-bold',
    label: 'Space Mono Bold',
    ttf: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/SpaceMono-Bold.ttf',
    license: 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/OFL.txt',
    out: 'space-mono-bold',
    scope: 'latin',
    weight: 700,
  },
  {
    key: 'noto-sans-sc',
    label: 'Noto Sans SC',
    ttf: 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf',
    license: 'https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt',
    out: 'noto-sans-sc-subset',
    scope: 'cjk',
  },
];

/** 拉丁字符集：基础拉丁 + 常用符号 + 箭头 + 几何图形 */
const LATIN_UNICODES =
  'U+0020-007E,U+00A0-00FF,U+0100-017F,U+2000-206F,U+2070-209F,U+20A0-20BF,U+2100-214F,U+2190-21FF,U+2200-22FF,U+2460-24FF,U+25A0-25FF,U+2600-26FF,U+2713-2717,U+3000-303F,U+FF00-FFEF';

/** 递归收集仓库内文本文件中的字符 */
function collectSourceChars() {
  const dirs = [
    path.join(ROOT, 'scripts', 'lib'),
    path.join(ROOT, 'scripts'),
    path.join(ROOT, 'src'),
  ];
  const files = new Set();
  for (const d of dirs) {
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      if (/\.(mjs|js|css|html|json|md)$/.test(f)) files.add(path.join(d, f));
    }
  }
  for (const f of ['index.html', 'README.md', 'TASK.md']) {
    const p = path.join(ROOT, f);
    if (existsSync(p)) files.add(p);
  }
  const text = [...files].map((f) => readFileSync(f, 'utf8')).join('\n');
  const set = new Set();
  for (const ch of text) set.add(ch);
  return set;
}

/** 额外必留字符：界面通用中文与符号 */
const EXTRA_CHARS = [
  '回响电玩馆', '年代展厅', '时间长廊', '硬件', '游戏', '展柜', '收藏', '搜索', '筛选',
  '导览', '目录', '无障碍', '可玩', '来源', '详情', '编号', '年代', '返回', '关闭',
  '加载中', '离线', '降级', '预览', '资产', '令牌', '图标', '海报', '封面', '模型',
  '字体', '许可证', '安装', '构建', '预览页', '模型查看器', '旋转', '重置', '全屏',
  '下一件', '上一件', '播放', '暂停', '声音', '画质', '高清', '标准', '细节',
  '年', '年代', '至今', '约', '展品', '虚构', '原创', '提炼', '形制', '材质',
  '颜色', '尺寸', '重量', '年代', '所属', '分类', '标签',
  '·—…、。，；：？！（）「」《》【】“”‘’', '0123456789',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz',
].join('');

function cjkCharset() {
  const set = new Set();
  for (const ch of collectSourceChars()) {
    const cp = ch.codePointAt(0);
    // CJK 统一表意文字 + 扩展A + 中文标点 + 全角
    if (
      (cp >= 0x4e00 && cp <= 0x9fff) ||
      (cp >= 0x3400 && cp <= 0x4dbf) ||
      (cp >= 0x3000 && cp <= 0x303f) ||
      (cp >= 0xff00 && cp <= 0xffef) ||
      (cp >= 0x2000 && cp <= 0x206f)
    ) {
      set.add(ch);
    }
  }
  for (const ch of EXTRA_CHARS) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x2e80) set.add(ch);
  }
  return [...set].sort().join('');
}

function ensureCache() {
  mkdirSync(CACHE, { recursive: true });
  mkdirSync(OUT, { recursive: true });
}

function download(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 1024) return dest;
  console.log(`  ↓ 下载 ${path.basename(dest)}`);
  execFileSync('curl', ['-sSL', '--fail', '--max-time', '300', '-o', dest, url], { stdio: 'inherit' });
  return dest;
}

function pySubset(src, outFile, opts) {
  const args = [
    '-m',
    'fontTools.subset',
    src,
    `--output-file=${outFile}`,
    '--layout-features=*',
    '--name-IDs=*',
    '--name-languages=*',
    '--notdef-outline',
    '--recommended-glyphs',
    '--drop-tables+=DSIG',
    '--no-hinting',
  ];
  if (opts.flavor === 'woff2') args.push('--flavor=woff2');
  if (opts.textFile) args.push(`--text-file=${opts.textFile}`);
  if (opts.unicodes) args.push(`--unicodes=${opts.unicodes}`);
  if (opts.flavor === 'ttf') args.push('--flavor=');
  execFileSync(VENV_PY, args, { stdio: ['ignore', 'inherit', 'inherit'] });
}

function human(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function main() {
  if (!existsSync(VENV_PY)) {
    console.error('缺少字体工具链：请先执行 uv venv .venv && uv pip install --python .venv/bin/python fonttools brotli');
    process.exit(1);
  }
  ensureCache();

  console.log('· 收集用字集…');
  const cjk = cjkCharset();
  const cjkFile = path.join(CACHE, 'cjk-charset.txt');
  writeFileSync(cjkFile, cjk, 'utf8');
  console.log(`  中文及全角符号 ${[...cjk].length} 个`);

  const results = [];

  for (const src of SOURCES) {
    console.log(`· ${src.label}`);
    const rawTtf = path.join(CACHE, `${src.key}.ttf`);
    download(src.ttf, rawTtf);
    const oflRaw = path.join(CACHE, `${src.key}-OFL.txt`);
    download(src.license, oflRaw);

    const isCjk = src.scope === 'cjk';
    const opts = isCjk
      ? { textFile: cjkFile, flavor: 'woff2' }
      : { unicodes: LATIN_UNICODES, flavor: 'woff2' };

    const woff2 = path.join(OUT, `${src.out}.woff2`);
    const ttf = path.join(OUT, `${src.out}.ttf`);

    pySubset(rawTtf, woff2, opts);
    pySubset(rawTtf, ttf, { ...opts, flavor: 'ttf' });

    writeFileSync(
      path.join(OUT, `OFL-${src.key}.txt`),
      readFileSync(oflRaw, 'utf8'),
      'utf8',
    );

    results.push({
      key: src.key,
      label: src.label,
      files: [`${src.out}.woff2`, `${src.out}.ttf`],
      woff2Bytes: statSync(woff2).size,
      ttfBytes: statSync(ttf).size,
    });
    console.log(`  ✓ ${path.basename(woff2)} ${human(statSync(woff2).size)} | ${path.basename(ttf)} ${human(statSync(ttf).size)}`);
  }

  /* ---------- fonts.css ---------- */
  const faces = [
    { fam: 'Space Grotesk', file: 'space-grotesk-latin.woff2', weight: '300 700' },
    { fam: 'Inter', file: 'inter-latin.woff2', weight: '100 900' },
    { fam: 'Space Mono', file: 'space-mono-regular.woff2', weight: '400' },
    { fam: 'Space Mono', file: 'space-mono-bold.woff2', weight: '700' },
    { fam: 'Noto Sans SC', file: 'noto-sans-sc-subset.woff2', weight: '100 900' },
  ];
  const css = [
    '/* 回响电玩馆 / PLAYTIME ATLAS — 自托管字体',
    ' * Space Grotesk, Inter, Space Mono, Noto Sans SC — SIL Open Font License 1.1',
    ' * 全部子集化并存放于本目录，运行期无外部字体请求。',
    ' */',
    '',
    ...faces.map(
      (f) =>
        `@font-face {\n  font-family: '${f.fam}';\n  font-style: normal;\n  font-weight: ${f.weight};\n  font-display: swap;\n  src: url('./${f.file}') format('woff2');\n}`,
    ),
    '',
  ].join('\n');
  writeFileSync(path.join(OUT, 'fonts.css'), css, 'utf8');

  /* ---------- 记录供 LICENSES.md 使用 ---------- */
  writeFileSync(
    path.join(CACHE, 'font-report.json'),
    JSON.stringify({ cjkCount: [...cjk].length, fonts: results }, null, 2),
    'utf8',
  );

  console.log('\n✓ 字体管线完成 → public/assets/fonts');
}

main();
