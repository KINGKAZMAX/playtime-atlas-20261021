#!/usr/bin/env node
/**
 * 中文字体子集化（改版后重写）
 * --------------------------------------------------------------------------
 * 背景：16-design-system 随包的 noto-sans-sc-subset.woff2 只覆盖 07-museum-art
 *       的用字，实测缺本作品 168 个汉字（织/簿/遥/麻/缎…）。直接引用会出现
 *       「部分汉字 Noto Sans SC、其余回退系统黑体」的混排，
 *       与「统一视觉语言」相悖。
 * 处理：以完整 Noto Sans SC（OFL 1.1）为源，按本作品**实际用字**重新子集化，
 *       并把 name 表族名规整为「Noto Sans SC / Regular」，
 *       输出 public/fonts/noto-sans-sc-subset.woff2。
 *
 * 源字型查找顺序（均为本地文件，运行期零外部请求）：
 *   1. 环境变量 NOTO_SANS_SC_SRC
 *   2. 本项目 assets/fonts/noto-sans-sc.ttf
 *   3. 本项目 node_modules/.cache/loomdeck-fonts/NotoSansSC-VF.ttf（scripts/fetch-sources.sh 下载物）
 *   4. 同批次 07-museum-art/scripts/.cache/fonts/noto-sans-sc.ttf
 *   5. 同批次 06-museum-core/scripts/.cache/fonts/noto-sans-sc.ttf
 * 找不到源字型时**不报错**：保留仓库内已生成的子集，交由
 * scripts/check-fonts.mjs 做覆盖校验（npm run build 不会因此中断）。
 *
 * 运行：node scripts/build-fonts.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
import * as hb from 'harfbuzzjs';
import { compress, decompress } from 'wawoff2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public/fonts/noto-sans-sc-subset.woff2');

const SOURCE_CANDIDATES = [
  process.env.NOTO_SANS_SC_SRC,
  path.join(ROOT, 'assets/fonts/noto-sans-sc.ttf'),
  path.join(ROOT, 'node_modules/.cache/loomdeck-fonts/NotoSansSC-VF.ttf'),
  path.resolve(ROOT, '../07-museum-art/scripts/.cache/fonts/noto-sans-sc.ttf'),
  path.resolve(ROOT, '../06-museum-core/scripts/.cache/fonts/noto-sans-sc.ttf'),
].filter(Boolean);

/* ── name 表规整 ────────────────────────────────────────────────────────
   源字型是 Noto Sans SC 的可变字体（wght 100–900，默认实例 Thin），
   其 name 表把族名写成「Noto Sans SC Thin」。本脚本把 wght 实例化到 400
   并把族名改回「Noto Sans SC / Regular」，与 16 的 FONT-MANIFEST 对齐，
   否则浏览器按 CSS `font-family: 'Noto Sans SC'` 匹配不到该文件。 */
const FAMILY = 'Noto Sans SC';
const NEW_NAMES = { 1: FAMILY, 2: 'Regular', 4: FAMILY, 6: 'NotoSansSC', 16: FAMILY, 17: 'Regular' };

function tableDirectory(buf) {
  const numTables = buf.readUInt16BE(4);
  const tables = [];
  for (let i = 0; i < numTables; i += 1) {
    const rec = 12 + i * 16;
    tables.push({
      tag: buf.toString('ascii', rec, rec + 4),
      checksum: buf.readUInt32BE(rec + 4),
      offset: buf.readUInt32BE(rec + 8),
      length: buf.readUInt32BE(rec + 12),
    });
  }
  return tables;
}

function checksum(buf) {
  let sum = 0;
  const padded = buf.length % 4 ? Buffer.concat([buf, Buffer.alloc(4 - (buf.length % 4))]) : buf;
  for (let i = 0; i < padded.length; i += 4) sum = (sum + padded.readUInt32BE(i)) >>> 0;
  return sum;
}

function encodeName(text, platformId) {
  if (platformId === 1) return Buffer.from(text, 'latin1');       // Mac Roman（ASCII 足够）
  return Buffer.from(text, 'utf16le').swap16();                    // UTF-16BE
}

/** 重写 name 表并重建 sfnt（目录排序、逐表校验和、head.checkSumAdjustment）。 */
function rebuildWithNames(sfnt, newNames) {
  const tables = tableDirectory(sfnt);
  const nameTable = tables.find((t) => t.tag === 'name');
  if (!nameTable) throw new Error('源字型缺少 name 表');

  const base = nameTable.offset;
  const count = sfnt.readUInt16BE(base + 2);
  const storageBase = base + sfnt.readUInt16BE(base + 4);

  const records = [];
  for (let i = 0; i < count; i += 1) {
    const rec = base + 6 + i * 12;
    records.push({
      platformID: sfnt.readUInt16BE(rec),
      encodingID: sfnt.readUInt16BE(rec + 2),
      languageID: sfnt.readUInt16BE(rec + 4),
      nameID: sfnt.readUInt16BE(rec + 6),
      length: sfnt.readUInt16BE(rec + 8),
      offset: sfnt.readUInt16BE(rec + 10),
    });
  }

  // 只保留 Windows / Unicode 平台的记录，英文（en-US）
  const kept = records.filter((r) => (r.platformID === 3 || r.platformID === 0));
  const chunks = [];
  let storageLen = 0;
  for (const r of kept) {
    const text = newNames[r.nameID];
    let data;
    if (text !== undefined) {
      data = encodeName(text, r.platformID);
    } else {
      data = Buffer.from(sfnt.subarray(storageBase + r.offset, storageBase + r.offset + r.length));
    }
    r.newLength = data.length;
    r.newOffset = storageLen;
    storageLen += data.length;
    chunks.push(data);
  }

  const header = Buffer.alloc(6 + kept.length * 12);
  header.writeUInt16BE(0, 0);            // format
  header.writeUInt16BE(kept.length, 2);
  header.writeUInt16BE(6 + kept.length * 12, 4);
  kept.forEach((r, i) => {
    const rec = 6 + i * 12;
    header.writeUInt16BE(r.platformID, rec);
    header.writeUInt16BE(r.encodingID, rec + 2);
    header.writeUInt16BE(r.languageID, rec + 4);
    header.writeUInt16BE(r.nameID, rec + 6);
    header.writeUInt16BE(r.newLength, rec + 8);
    header.writeUInt16BE(r.newOffset, rec + 10);
  });
  const newNameTable = Buffer.concat([header, ...chunks]);

  // 重建整个 sfnt
  const others = tables.filter((t) => t.tag !== 'name');
  const all = [...others, { tag: 'name', data: newNameTable }].sort((a, b) => (a.tag < b.tag ? -1 : 1));

  const numTables = all.length;
  const searchRange = 16 * (2 ** Math.floor(Math.log2(numTables)));
  const entrySelector = Math.floor(Math.log2(numTables));
  const rangeShift = numTables * 16 - searchRange;

  const dir = Buffer.alloc(12 + numTables * 16);
  dir.writeUInt32BE(0x00010000, 0);
  dir.writeUInt16BE(numTables, 4);
  dir.writeUInt16BE(searchRange, 6);
  dir.writeUInt16BE(entrySelector, 8);
  dir.writeUInt16BE(rangeShift, 10);

  let offset = dir.length;
  const bodies = [];
  all.forEach((t, i) => {
    const data = t.tag === 'name' ? t.data : sfnt.subarray(t.offset, t.offset + t.length);
    const padded = data.length % 4 ? Buffer.concat([data, Buffer.alloc(4 - (data.length % 4))]) : data;
    const rec = 12 + i * 16;
    dir.write(t.tag, rec, 4, 'ascii');
    dir.writeUInt32BE(t.tag === 'head' ? 0 : checksum(padded), rec + 4);
    dir.writeUInt32BE(offset, rec + 8);
    dir.writeUInt32BE(data.length, rec + 12);
    bodies.push(padded);
    offset += padded.length;
  });

  const out = Buffer.concat([dir, ...bodies]);

  // head.checkSumAdjustment = 0xB1B0AFBA - 整表校验和
  const outTables = tableDirectory(out);
  const head = outTables.find((t) => t.tag === 'head');
  const headRec = outTables.findIndex((t) => t.tag === 'head');
  out.writeUInt32BE(0, head.offset + 8);
  const total = checksum(out);
  out.writeUInt32BE((0xb1b0afba - total) >>> 0, head.offset + 8);
  void headRec;
  return out;
}

/* ── 主流程 ─────────────────────────────────────────────────────────── */
const SOURCE_FILES = [
  path.join(ROOT, 'index.html'),
  ...['main.js', 'ui.js', 'workshop.js', 'storage.js'].map((f) => path.join(ROOT, 'src', f)),
];
const text = SOURCE_FILES
  .filter((p) => fs.existsSync(p))
  .map((p) => fs.readFileSync(p, 'utf8'))
  .join('\n');

const chars = new Set();
for (const ch of text) chars.add(ch);
const cjkCount = [...chars].filter((c) => c.codePointAt(0) > 0x2e80).length;

const source = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
if (!source) {
  const exists = fs.existsSync(OUT);
  console.log('· 未找到本地 Noto Sans SC 源字型，保留仓库内既有子集：'
    + (exists ? path.relative(ROOT, OUT) : '（缺失！）'));
  console.log('  如需重新生成：设置 NOTO_SANS_SC_SRC=<完整 Noto Sans SC .ttf 路径> 后重跑本脚本。');
  if (!exists) process.exit(1);
  process.exit(0);
}

console.log(`· 源字型：${source}`);
console.log(`· 用字集：${chars.size} 个字符（其中 CJK 及中文标点 ${cjkCount} 个）`);

const src = fs.readFileSync(source);

/* 源字型实际收录的码位：不在其中的符号（如 ⌨）交由系统字体回退，不强行并入子集 */
const srcSfnt = src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength);
const srcFace = new hb.Face(new hb.Blob(srcSfnt));
const available = new Set(srcFace.collectUnicodes());
const subsetChars = [...chars].filter((c) => available.has(c.codePointAt(0)));
const dropped = [...chars].filter((c) => !available.has(c.codePointAt(0)));
console.log(`· 源字型收录 ${available.size} 个码位；本作品用字中 ${dropped.length} 个不在其中（回退系统字体）：${dropped.join('')}`);

/* 子集化 + wght 实例化到 400（静态 Regular，避免依赖可变字体的轴应用） */
const sfntSubset = await subsetFont(src, subsetChars.join(''), {
  targetFormat: 'sfnt',
  variationAxes: { wght: 400 },
  preserveNameIds: [1, 2, 4, 6, 16, 17],
});

const patched = rebuildWithNames(Buffer.from(sfntSubset), NEW_NAMES);
const woff2 = await compress(patched);

/* 产物自检 */
const back = Buffer.from(await decompress(woff2));
const ab = back.buffer.slice(back.byteOffset, back.byteOffset + back.byteLength);
const face = new hb.Face(new hb.Blob(ab));
const font = new hb.Font(face);

const family = face.getName(1, 'en');
if (family !== FAMILY) {
  console.error(`✗ 族名未修正为「${FAMILY}」，当前为「${family}」`);
  process.exit(1);
}
const missingCjk = [...chars].filter((c) => {
  const cp = c.codePointAt(0);
  const isCjk = (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)
    || (cp >= 0x3000 && cp <= 0x303f) || (cp >= 0xff00 && cp <= 0xffef);
  return isCjk && !font.glyph(cp);
});
if (missingCjk.length) {
  console.error(`✗ 子集化后仍缺 ${missingCjk.length} 个汉字：${missingCjk.slice(0, 30).join('')}`);
  process.exit(1);
}

// head 包围盒哨兵值（32767）会让 Chrome OTS 判定字体损坏
const headOffset = (() => {
  for (const t of tableDirectory(back)) if (t.tag === 'head') return t.offset;
  return -1;
})();
if (headOffset >= 0) {
  const bbox = [back.readInt16BE(headOffset + 36), back.readInt16BE(headOffset + 38),
    back.readInt16BE(headOffset + 40), back.readInt16BE(headOffset + 42)];
  if (bbox.some((v) => Math.abs(v) >= 32767)) {
    console.error(`✗ head 包围盒出现哨兵值 ${bbox.join(',')}（Chrome 会判字体损坏）`);
    process.exit(1);
  }
}

fs.writeFileSync(OUT, woff2);
console.log(`✓ 已生成 ${path.relative(ROOT, OUT)}（${woff2.length} 字节，族名「${family}」，覆盖 ${subsetChars.length}/${chars.size} 个用字）`);

/* 登记本目录字体清单：族名 / 文件 / 字节 / 许可，供 scripts/check-fonts.mjs 校验 */
const MANIFEST = path.join(ROOT, 'public/fonts/fonts.manifest.json');
const faces = [
  { family: 'Space Grotesk', file: 'space-grotesk-latin.woff2', licenseFile: 'OFL-space-grotesk.txt' },
  { family: 'Inter', file: 'inter-latin.woff2', licenseFile: 'OFL-inter.txt' },
  { family: 'Space Mono', file: 'space-mono-regular.woff2', licenseFile: 'OFL-space-mono-regular.txt' },
  { family: 'Space Mono', file: 'space-mono-bold.woff2', licenseFile: 'OFL-space-mono-bold.txt' },
  { family: 'Noto Sans SC', file: 'noto-sans-sc-subset.woff2', licenseFile: 'OFL-noto-sans-sc.txt' },
];
const manifest = {
  $comment: 'LOOMDECK 自托管字体清单。族名与 16-design-system/fonts/FONT-MANIFEST.json 一致（MIGRATION-NOTES §8）。',
  generatedAt: new Date().toISOString(),
  fontDisplay: 'swap',
  cjkStrategy: 'Noto Sans SC 自托管子集覆盖本作品全部汉字（wght 实例化到 400 的静态 Regular）；源字型缺失的符号（如 ⌨）回退系统字体。',
  faces: faces.map((f) => ({
    family: f.family,
    file: f.file,
    license: 'SIL Open Font License 1.1',
    licenseFile: f.licenseFile,
    bytes: fs.statSync(path.join(ROOT, 'public/fonts', f.file)).size,
    format: 'woff2',
  })),
};
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`✓ 已更新 ${path.relative(ROOT, MANIFEST)}`);
