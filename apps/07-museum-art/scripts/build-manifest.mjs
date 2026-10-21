/**
 * 回响电玩馆 — 资产索引生成器
 * 扫描 public/assets 产出机器可读的资产清单，并同步生成预览页用的 ES 模块。
 *
 * 运行：node scripts/build-manifest.mjs
 */

import {
  existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync,
} from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eras, models, caseCopy } from './lib/catalog.mjs';
import tokens from './lib/tokens.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const ASSETS = path.join(ROOT, 'public', 'assets');

function bytes(rel) {
  const p = path.join(ASSETS, rel);
  return existsSync(p) ? statSync(p).size : 0;
}

function listDir(dir) {
  const p = path.join(ASSETS, dir);
  if (!existsSync(p)) return [];
  return readdirSync(p).sort();
}

function main() {
  mkdirSync(ASSETS, { recursive: true });

  /* ---------- 字体 ---------- */
  const fontFiles = listDir('fonts').filter((f) => /\.(woff2|ttf)$/.test(f));
  const fonts = fontFiles.map((f) => ({
    file: `./fonts/${f}`,
    bytes: bytes(`fonts/${f}`),
    format: f.endsWith('.woff2') ? 'woff2' : 'ttf',
    sha256: createHash('sha256').update(readFileSync(path.join(ASSETS, 'fonts', f))).digest('hex'),
  }));
  const fontFamilies = [
    { family: 'Space Grotesk', role: 'display / 展示体', license: 'OFL-1.1', file: 'OFL-space-grotesk.txt' },
    { family: 'Inter', role: 'sans / 正文', license: 'OFL-1.1', file: 'OFL-inter.txt' },
    { family: 'Space Mono', role: 'mono / 编号与标签', license: 'OFL-1.1', file: 'OFL-space-mono-regular.txt' },
    { family: 'Noto Sans SC', role: 'cjk / 中文', license: 'OFL-1.1', file: 'OFL-noto-sans-sc.txt' },
  ];
  /* ---------- 图标 ---------- */
  const iconIndex = JSON.parse(readFileSync(path.join(ASSETS, 'icons', 'index.json'), 'utf8'));

  /* ---------- 年代 ---------- */
  const eraList = eras.map((e) => ({
    id: e.id,
    index: e.index,
    name: e.name,
    latin: e.latin,
    range: e.range,
    tagline: e.tagline,
    story: e.story,
    keywords: e.keywords.split(' · '),
    exhibits: e.exhibits || [],
    icon: `./assets/icons/era-0${e.index}.svg`,
    poster: {
      svg: `./assets/posters/poster-${e.id}.svg`,
      png: `./assets/posters/poster-${e.id}.png`,
      key: `./assets/posters/key/poster-${e.id}.jpg`,
    },
    cover: {
      svg: `./assets/covers/cover-${e.id}.svg`,
      png: `./assets/covers/cover-${e.id}.png`,
      key: `./assets/covers/key/cover-${e.id}.jpg`,
    },
  }));

  /* ---------- 封面 ---------- */
  const covers = [
    {
      id: 'atlas-hero',
      name: '全馆封面',
      svg: './assets/covers/cover-atlas-hero.svg',
      png: './assets/covers/cover-atlas-hero.png',
      key: './assets/covers/key/cover-atlas-hero.jpg',
    },
    ...eraList.map((e) => ({
      id: e.id,
      name: `${e.name} 封面`,
      svg: e.cover.svg,
      png: e.cover.png,
      key: e.cover.key,
    })),
  ];

  /* ---------- 展柜 ---------- */
  const cases = models.map((m, i) => ({
    id: m.id,
    name: m.name,
    latin: m.latin,
    label: (caseCopy[m.id] || {}).label || m.name,
    index: i + 1,
    svg: `./assets/cases/case-${m.id}.svg`,
    png: `./assets/cases/case-${m.id}.png`,
  }));

  /* ---------- 模型 ---------- */
  const modelList = models.map((m) => {
    const meta = JSON.parse(
      readFileSync(path.join(ASSETS, 'models', `model-${m.id}.json`), 'utf8'),
    );
    return {
      id: m.id,
      name: m.name,
      latin: m.latin,
      range: m.range,
      form: m.form,
      story: m.story,
      note: m.note,
      partCount: meta.partCount,
      triangleCount: meta.triangleCount,
      dimensions: m.dims,
      parts: meta.parts.map((p) => p.name),
      glb: `./assets/models/model-${m.id}.glb`,
      png: `./assets/models/model-${m.id}.png`,
      techSvg: `./assets/models/model-${m.id}.tech.svg`,
      json: `./assets/models/model-${m.id}.json`,
      glbBytes: bytes(`models/model-${m.id}.glb`),
    };
  });

  /* ---------- 降级图 ---------- */
  const fallback = listDir('fallback')
    .filter((f) => f.endsWith('.svg'))
    .map((f) => ({
      id: f.replace(/\.svg$/, ''),
      svg: `./assets/fallback/${f}`,
      png: `./assets/fallback/${f.replace(/\.svg$/, '.png')}`,
      purpose: {
        'poster-fallback': '年代海报主视觉缺失时的占位',
        'cover-fallback': '年代封面主视觉缺失时的占位',
        'model-fallback': '3D 模型不可用时的占位',
        'no-webgl': '浏览器未启用 WebGL 时的提示图',
        'offline-notice': '离线状态提示图',
      }[f.replace(/\.svg$/, '')] || '降级图形',
    }));

  /* 对齐后的 canonical 令牌（由 scripts/sync-ds-tokens.mjs 从 16-design-system 对齐生成） */
  const aligned = JSON.parse(readFileSync(path.join(ROOT, 'design-tokens.json'), 'utf8'));
  const align = aligned.meta.alignment;

  const manifest = {
    id: 'playtime-atlas-art',
    title: '回响电玩馆 / PLAYTIME ATLAS — 原创美术与硬件模型包',
    titleCn: '回响电玩馆',
    titleLatin: 'PLAYTIME ATLAS',
    subtitle: '电子游戏硬件年代馆 · 美术资产包',
    version: '1.1.0',
    generated: '2026-10-21',
    scheme: {
      name: 'UI：余晖设计系统深色主题；展品内嵌：深墨蓝 + 暖纸白 + 信号橙',
      uiBackground: aligned.meta.scheme.uiBackground,
      uiAccent: aligned.meta.scheme.uiAccent,
      exhibitInk: aligned.meta.scheme.exhibitInk,
      exhibitPaper: aligned.meta.scheme.exhibitPaper,
      exhibitSignal: aligned.meta.scheme.exhibitSignal,
    },
    license: {
      artwork: 'CC0-1.0（本馆原创）',
      fonts: 'SIL Open Font License 1.1',
      thirdParty: '无',
    },
    /* ── 对齐信息：供 06 / 13 核对各作品是否用到了对齐后的资产 ── */
    alignment: {
      designSystem: align.designSystem,
      designSystemEn: align.designSystemEn,
      designSystemId: align.designSystemId,
      designSystemVersion: align.designSystemVersion,
      alignedTo: align.alignedTo,
      alignedToCss: align.alignedToCss,
      spec: align.spec,
      audit: align.audit,
      migration: align.migration,
      source: align.source,
      alignedAt: align.alignedAt,
      cssVariablePrefix: align.cssVariablePrefix,
      tokenFile: './design-tokens.json',
      fingerprints: align.fingerprints,
      drift: align.drift,
      note:
        '本资产包的 UI 令牌与字体清单已对齐 16-design-system（余晖设计系统 v' +
        align.designSystemVersion +
        '）。fonts 下的 5 个 woff2 与 16 的字体清单逐字节一致（fingerprints.fontsIdentical）。' +
        '展品内嵌配色（scheme.exhibit*）是海报/封面/展柜/GLB 已烘焙的取色，不随 UI 主题变化。',
    },
    tokens: {
      json: './design-tokens.json',
      css: './assets/tokens.css',
      js: './assets/tokens.js',
      cssVariablePrefix: align.cssVariablePrefix,
      designSystem: align.designSystemId,
      designSystemVersion: align.designSystemVersion,
    },
    fonts: {
      stylesheet: './assets/fonts/fonts.css',
      manifest: './assets/fonts/FONT-MANIFEST.json',
      families: fontFamilies,
      files: fonts,
      totalBytes: fonts.reduce((s, f) => s + f.bytes, 0),
      cjkChars: 746,
      alignedTo: '16-design-system/fonts/FONT-MANIFEST.json',
      alignedDesignSystem: align.designSystemVersion,
      fontsIdentical: align.fingerprints?.fontsIdentical ?? null,
    },
    icons: {
      sprite: './assets/icons/icons.svg',
      index: './assets/icons/index.json',
      sheet: './assets/icons/sheet.svg',
      count: iconIndex.count,
      categories: iconIndex.categories,
      items: iconIndex.icons,
    },
    eras: eraList,
    covers,
    cases,
    models: modelList,
    fallback,
    counts: {
      eras: eraList.length,
      covers: covers.length,
      cases: cases.length,
      models: modelList.length,
      icons: iconIndex.count,
      fonts: fonts.length,
      fallback: fallback.length,
    },
  };

  const json = JSON.stringify(manifest, null, 2) + '\n';
  writeFileSync(path.join(ASSETS, 'assets.manifest.json'), json, 'utf8');
  writeFileSync(path.join(ROOT, 'src', 'data.js'), `/* 由 scripts/build-manifest.mjs 自动生成 */\nexport const ATLAS = ${JSON.stringify(manifest, null, 2)};\nexport default ATLAS;\n`, 'utf8');

  console.log('✓ 资产索引完成 → public/assets/assets.manifest.json + src/data.js');
  console.log(
    `  年代 ${manifest.counts.eras} · 封面 ${manifest.counts.covers} · 展柜 ${manifest.counts.cases} · ` +
      `模型 ${manifest.counts.models} · 图标 ${manifest.counts.icons} · 字体文件 ${manifest.counts.fonts}`,
  );
}

main();
