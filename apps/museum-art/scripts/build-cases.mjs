/**
 * 回响电玩馆 — 展柜图形生成器
 * 每个展品一套展柜：玻璃罩 + 底座 + 铭牌，柜内放置该展品的实机渲染图。
 *
 * 运行：node scripts/build-cases.mjs   （需先完成 build-models + render models）
 */

import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { models, caseCopy } from './lib/catalog.mjs';
import tokens from './lib/tokens.mjs';
import {
  svgDoc, rect, text, line, circle, polygon,
  linearGradient, radialGradient, dotPattern, halftonePattern, grainFilter, writeOut,
} from './lib/svg.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'public', 'assets', 'cases');

const W = 1000;
const H = 1250;

const C = tokens.color;
const F = tokens.typography.fontFamily;

function buildCase(model, index) {
  const modelPng = `../models/model-${model.id}.png`;
  const hasPng = existsSync(path.join(ROOT, 'public', 'assets', 'models', `model-${model.id}.png`));
  const copy = caseCopy[model.id] || { label: model.name, blurb: model.story };

  const defs = [
    linearGradient('case-bg', [
      { offset: '0%', color: C.ink[800] },
      { offset: '55%', color: C.ink[900] },
      { offset: '100%', color: '#04080E' },
    ]),
    linearGradient('case-glass', [
      { offset: '0%', color: C.paper[50], opacity: 0.16 },
      { offset: '45%', color: C.paper[50], opacity: 0.03 },
      { offset: '100%', color: C.paper[50], opacity: 0 },
    ], { x1: 0, y1: 0, x2: 1, y2: 1 }),
    linearGradient('case-plate', [
      { offset: '0%', color: '#FBF7EF' },
      { offset: '100%', color: '#E7DCC7' },
    ]),
    linearGradient('case-plinth', [
      { offset: '0%', color: C.ink[600] },
      { offset: '100%', color: C.ink[900] },
    ]),
    radialGradient('case-spot', [
      { offset: '0%', color: C.paper[50], opacity: 0.2 },
      { offset: '100%', color: C.paper[50], opacity: 0 },
    ]),
    dotPattern('case-dots', { size: 18, r: 1.4, color: C.paper[50], opacity: 0.12 }),
    halftonePattern('case-half', { size: 14, color: C.ink[900], opacity: 0.12, maxR: 2.2 }),
    grainFilter('case-grain', { freq: 0.9, opacity: 0.13, seed: 5 + index }),
  ];

  const body = [];
  body.push(rect(0, 0, W, H, { fill: 'url(#case-bg)' }));
  body.push(rect(0, 0, W, H, { fill: 'url(#case-half)', opacity: 0.5 }));

  /* ---- 玻璃罩 ---- */
  const GX = 56, GY = 56, GW = W - 112, GH = 828;
  body.push(rect(GX, GY, GW, GH, { fill: C.ink[900], opacity: 0.55 }));
  body.push(circle(GX + GW / 2, GY + 300, 330, { fill: 'url(#case-spot)' }));
  body.push(rect(GX, GY, GW, GH, { fill: 'url(#case-dots)', opacity: 0.5 }));

  /* 柜内展品 */
  if (hasPng) {
    body.push(
      `<image href="${modelPng}" x="${GX + 40}" y="${GY + 44}" width="${GW - 80}" height="${GW - 80}" ` +
        `preserveAspectRatio="xMidYMid meet"/>`,
    );
  } else {
    body.push(
      rect(GX + 40, GY + 44, GW - 80, GW - 80, { fill: C.ink[700], opacity: 0.6 }),
    );
    body.push(
      text('模型渲染待生成', W / 2, GY + GH / 2, {
        fill: C.paper[400],
        'font-family': F.mono,
        'font-size': 22,
        'text-anchor': 'middle',
      }),
    );
  }

  /* 玻璃反光：两道斜向高光 */
  body.push(
    polygon(
      [
        [GX + 30, GY + GH],
        [GX + 250, GY],
        [GX + 390, GY],
        [GX + 170, GY + GH],
      ],
      { fill: 'url(#case-glass)' },
    ),
  );
  body.push(
    polygon(
      [
        [GX + 330, GY + GH],
        [GX + 500, GY],
        [GX + 570, GY],
        [GX + 400, GY + GH],
      ],
      { fill: 'url(#case-glass)', opacity: 0.55 },
    ),
  );

  /* 罩体框 */
  body.push(
    rect(GX, GY, GW, GH, {
      fill: 'none',
      stroke: C.paper[50],
      'stroke-opacity': 0.22,
      'stroke-width': 2,
    }),
  );
  /* 上沿灯条 */
  body.push(rect(GX + 40, GY + 18, GW - 80, 5, { fill: C.signal[500], opacity: 0.9 }));

  /* ---- 底座 ---- */
  body.push(rect(GX, GY + GH, GW, 74, { fill: 'url(#case-plinth)' }));
  body.push(
    line(GX, GY + GH, GX + GW, GY + GH, {
      stroke: C.paper[50],
      'stroke-opacity': 0.24,
      'stroke-width': 1.5,
    }),
  );
  body.push(
    text(`EXHIBIT ${String(index + 1).padStart(2, '0')} / ${models.length}`, GX + 24, GY + GH + 46, {
      fill: C.paper[300],
      'font-family': F.mono,
      'font-size': 17,
      'letter-spacing': '0.16em',
    }),
  );
  body.push(
    text(`ATLAS-HW-${model.id.toUpperCase()}`, GX + GW - 24, GY + GH + 46, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 17,
      'font-weight': 700,
      'letter-spacing': '0.1em',
      'text-anchor': 'end',
    }),
  );

  /* ---- 铭牌 ---- */
  const PX = 56, PY = 1000, PW = W - 112, PH = 190;
  body.push(rect(PX, PY, PW, PH, { fill: 'url(#case-plate)' }));
  body.push(rect(PX, PY, 7, PH, { fill: C.signal[500] }));

  body.push(
    text(copy.label, PX + 34, PY + 48, {
      fill: C.ink[900],
      'font-family': F.display,
      'font-size': 32,
      'font-weight': 700,
    }),
  );
  body.push(
    text(`${model.latin} · ${model.form} · ${model.range}`, PX + 34, PY + 80, {
      fill: C.ink[500],
      'font-family': F.mono,
      'font-size': 16,
      'letter-spacing': '0.08em',
    }),
  );

  /* 铭牌说明（两行内折行） */
  const blurb = copy.blurb;
  let line1 = '';
  let line2 = '';
  for (const ch of blurb) {
    if (line1.length < 30) line1 += ch;
    else line2 += ch;
  }
  body.push(
    text(line1, PX + 34, PY + 114, {
      fill: C.ink[700],
      'font-family': F.sans,
      'font-size': 17,
    }),
  );
  if (line2) {
    body.push(
      text(line2, PX + 34, PY + 140, {
        fill: C.ink[700],
        'font-family': F.sans,
        'font-size': 17,
      }),
    );
  }

  /* 铭牌底部：规格行 */
  const dims = `${model.dims.w} × ${model.dims.h} × ${model.dims.d} m`;
  body.push(
    text(`规格 ${dims}`, PX + 34, PY + 172, {
      fill: C.ink[500],
      'font-family': F.mono,
      'font-size': 14,
    }),
  );
  body.push(
    text('原创虚构展品 · 无品牌标识', PX + PW - 34, PY + 172, {
      fill: C.ink[500],
      'font-family': F.sans,
      'font-size': 14,
      'text-anchor': 'end',
    }),
  );

  /* 角标 */
  body.push(
    line(28, 28, 96, 28, { stroke: C.signal[500], 'stroke-width': 2.5 }),
  );
  body.push(line(28, 28, 28, 96, { stroke: C.signal[500], 'stroke-width': 2.5 }));
  body.push(
    line(W - 28, 28, W - 96, 28, { stroke: C.signal[500], 'stroke-width': 2.5 }),
  );
  body.push(line(W - 28, 28, W - 28, 96, { stroke: C.signal[500], 'stroke-width': 2.5 }));

  return svgDoc({ w: W, h: H, defs, body, background: C.ink[900] });
}

function main() {
  mkdirSync(OUT, { recursive: true });
  models.forEach((model, i) => {
    const svg = buildCase(model, i);
    writeOut(path.join(OUT, `case-${model.id}.svg`), svg);
    console.log(`✓ case-${model.id}.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(0)} KB  ${model.name}`);
  });
  console.log(`\n✓ ${models.length} 组展柜 SVG 生成完毕`);
}

main();
