/**
 * 回响电玩馆 — 年代封面生成器
 * 1600×900 横幅，供 06-museum-core 用作年代展厅头图与卡片封面。
 *
 * 运行：node scripts/build-covers.mjs
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eras, modelById } from './lib/catalog.mjs';
import tokens from './lib/tokens.mjs';
import {
  svgDoc, rect, text, line, circle,
  linearGradient, radialGradient, dotPattern, halftonePattern, cornerTicks,
  grainFilter, writeOut,
} from './lib/svg.mjs';
import { textWidth } from './lib/text.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'public', 'assets', 'covers');

const W = 1600;
const H = 900;
const M = 96;

const C = tokens.color;
const F = tokens.typography.fontFamily;

function buildCover(era) {
  const keyRel = `key/cover-${era.id}.jpg`;
  const hasKey = existsSync(path.join(OUT, keyRel));

  const defs = [
    linearGradient('cv-left', [
      { offset: '0%', color: C.ink[900], opacity: 0.95 },
      { offset: '42%', color: C.ink[900], opacity: 0.7 },
      { offset: '100%', color: C.ink[900], opacity: 0.05 },
    ], { x1: 0, y1: 0, x2: 1, y2: 0 }),
    linearGradient('cv-bottom', [
      { offset: '0%', color: C.ink[900], opacity: 0 },
      { offset: '100%', color: C.ink[900], opacity: 0.85 },
    ]),
    radialGradient('cv-vig', [
      { offset: '58%', color: C.ink[900], opacity: 0 },
      { offset: '100%', color: C.ink[900], opacity: 0.6 },
    ]),
    dotPattern('cv-dots', { size: 20, r: 1.6, color: C.paper[50], opacity: 0.14 }),
    halftonePattern('cv-half', { size: 15, color: C.ink[900], opacity: 0.14, maxR: 2.4 }),
    grainFilter('cv-grain', { freq: 0.9, opacity: 0.14, seed: 3 }),
  ];

  const body = [];

  if (hasKey) {
    body.push(
      `<image href="${keyRel}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`,
    );
  } else {
    body.push(rect(0, 0, W, H, { fill: C.ink[700] }));
  }

  body.push(rect(0, 0, W, H, { fill: 'url(#cv-half)', opacity: 0.45 }));
  body.push(rect(0, 0, W, H, { fill: 'url(#cv-vig)' }));
  body.push(rect(0, 0, W, H, { fill: 'url(#cv-left)' }));
  body.push(rect(0, 0, W, H, { fill: 'url(#cv-bottom)' }));

  /* 左侧文字区 */
  body.push(
    text(`ERA ${String(era.index).padStart(2, '0')}`, M, 172, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 26,
      'font-weight': 700,
      'letter-spacing': '0.24em',
    }),
  );
  body.push(
    text(era.name, M - 4, 306, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 132,
      'font-weight': 700,
      'letter-spacing': '0.01em',
    }),
  );
  body.push(
    text(era.latin, M, 366, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 28,
      'font-weight': 700,
      'letter-spacing': '0.2em',
    }),
  );
  body.push(
    text(era.range, M, 412, {
      fill: C.paper[200],
      'font-family': F.mono,
      'font-size': 22,
      'letter-spacing': '0.12em',
    }),
  );
  body.push(
    line(M, 452, M + 420, 452, { stroke: C.signal[500], 'stroke-width': 2.5 }),
  );
  body.push(
    text(era.tagline, M, 508, {
      fill: C.paper[100],
      'font-family': F.display,
      'font-size': 38,
      'font-weight': 500,
    }),
  );

  /* 关联展品小标 */
  const ex = era.exhibits || [];
  ex.forEach((mid, i) => {
    const m = modelById[mid];
    if (!m) return;
    const yy = 584 + i * 42;
    body.push(circle(M + 6, yy - 7, 4, { fill: C.signal[500] }));
    body.push(
      text(`${m.name} · ${m.form}`, M + 24, yy, {
        fill: C.paper[200],
        'font-family': F.sans,
        'font-size': 20,
      }),
    );
  });

  /* 顶部与底部标识 */
  body.push(
    text('回响电玩馆 / PLAYTIME ATLAS', M, 92, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 24,
      'font-weight': 700,
      'letter-spacing': '0.08em',
    }),
  );
  body.push(
    text('电子游戏硬件年代馆 · 原创策展分段', W - M, 92, {
      fill: C.paper[300],
      'font-family': F.sans,
      'font-size': 18,
      'text-anchor': 'end',
    }),
  );
  body.push(
    text(`ATLAS-ERA-${String(era.index).padStart(2, '0')}`, W - M, H - 68, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 20,
      'font-weight': 700,
      'letter-spacing': '0.12em',
      'text-anchor': 'end',
    }),
  );
  body.push(
    text('原创虚构展品 · 视觉与模型自绘自建', M, H - 68, {
      fill: C.paper[400],
      'font-family': F.sans,
      'font-size': 18,
    }),
  );

  /* 右侧网点装饰 */
  body.push(rect(W - 320, 140, 224, 224, { fill: 'url(#cv-dots)' }));
  body.push(cornerTicks(W, H, 32, 28, { stroke: C.signal[500], 'stroke-width': 3, opacity: 0.8 }));

  return svgDoc({ w: W, h: H, defs, body, background: C.ink[900] });
}

/** 全馆封面（用展厅关键帧） */
function buildHero() {
  const keyRel = 'key/cover-atlas-hero.jpg';
  const hasKey = existsSync(path.join(OUT, keyRel));
  const defs = [
    linearGradient('hr-bottom', [
      { offset: '0%', color: C.ink[900], opacity: 0 },
      { offset: '100%', color: C.ink[900], opacity: 0.92 },
    ]),
    radialGradient('hr-vig', [
      { offset: '50%', color: C.ink[900], opacity: 0 },
      { offset: '100%', color: C.ink[900], opacity: 0.72 },
    ]),
    halftonePattern('hr-half', { size: 16, color: C.ink[900], opacity: 0.14, maxR: 2.4 }),
  ];
  const body = [];
  if (hasKey) body.push(`<image href="${keyRel}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`);
  else body.push(rect(0, 0, W, H, { fill: C.ink[700] }));
  body.push(rect(0, 0, W, H, { fill: 'url(#hr-half)', opacity: 0.4 }));
  body.push(rect(0, 0, W, H, { fill: 'url(#hr-vig)' }));
  body.push(rect(0, 0, W, H, { fill: 'url(#hr-bottom)' }));
  body.push(
    text('回响电玩馆', M, 420, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 132,
      'font-weight': 700,
      'letter-spacing': '0.02em',
    }),
  );
  body.push(
    text('PLAYTIME ATLAS', M, 482, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 30,
      'font-weight': 700,
      'letter-spacing': '0.34em',
    }),
  );
  body.push(
    text('电子游戏硬件年代馆 — 七个年代，六件原创展品', M, 540, {
      fill: C.paper[200],
      'font-family': F.sans,
      'font-size': 26,
    }),
  );
  body.push(line(M, 592, M + 520, 592, { stroke: C.signal[500], 'stroke-width': 3 }));
  body.push(
    text('原创分段 · 自绘美术 · 自建模型 · 自托管字体', M, 638, {
      fill: C.paper[400],
      'font-family': F.sans,
      'font-size': 20,
      'letter-spacing': '0.04em',
    }),
  );
  return svgDoc({ w: W, h: H, defs, body, background: C.ink[900] });
}

function main() {
  mkdirSync(OUT, { recursive: true });
  for (const era of eras) {
    const svg = buildCover(era);
    writeOut(path.join(OUT, `cover-${era.id}.svg`), svg);
    console.log(`✓ cover-${era.id}.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(0)} KB  ${era.name}`);
  }
  const hero = buildHero();
  writeOut(path.join(OUT, 'cover-atlas-hero.svg'), hero);
  console.log(`✓ cover-atlas-hero.svg  ${(Buffer.byteLength(hero) / 1024).toFixed(0)} KB`);
  console.log(`\n✓ ${eras.length + 1} 张封面 SVG 生成完毕`);
}

main();
