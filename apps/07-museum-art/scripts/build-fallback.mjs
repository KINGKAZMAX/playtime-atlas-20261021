/**
 * 回响电玩馆 — 降级与离线图形
 * 当主视觉缺失、模型不可用或网络中断时使用。
 *
 * 运行：node scripts/build-fallback.mjs
 */

import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tokens from './lib/tokens.mjs';
import {
  svgDoc, rect, text, line, circle, polygon,
  linearGradient, radialGradient, dotPattern, halftonePattern, cornerTicks, writeOut,
} from './lib/svg.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'public', 'assets', 'fallback');

const C = tokens.color;
const F = tokens.typography.fontFamily;

const defs = [
  linearGradient('fb-bg', [
    { offset: '0%', color: C.ink[800] },
    { offset: '100%', color: C.ink[900] },
  ]),
  linearGradient('fb-stripe', [
    { offset: '0%', color: C.signal[600], opacity: 0.85 },
    { offset: '100%', color: C.signal[500], opacity: 0.25 },
  ]),
  radialGradient('fb-glow', [
    { offset: '0%', color: C.signal[500], opacity: 0.28 },
    { offset: '100%', color: C.signal[500], opacity: 0 },
  ]),
  dotPattern('fb-dots', { size: 20, r: 1.5, color: C.paper[50], opacity: 0.14 }),
  halftonePattern('fb-half', { size: 14, color: C.ink[900], opacity: 0.14, maxR: 2.4 }),
];

function shell(W, H, inner) {
  return svgDoc({
    w: W,
    h: H,
    defs,
    background: 'url(#fb-bg)',
    body: [
      rect(0, 0, W, H, { fill: 'url(#fb-half)', opacity: 0.5 }),
      rect(0, 0, W, H, { fill: 'url(#fb-dots)', opacity: 0.6 }),
      ...inner,
    ],
  });
}

/** 海报降级图 */
function posterFallback() {
  const W = 1200, H = 1800;
  const body = [
    rect(0, 0, W, 320, { fill: 'url(#fb-stripe)', opacity: 0.9 }),
    text('回响电玩馆', 80, 140, {
      fill: C.ink[900],
      'font-family': F.display,
      'font-size': 54,
      'font-weight': 700,
    }),
    text('PLAYTIME ATLAS · 主视觉暂缺', 80, 210, {
      fill: C.ink[800],
      'font-family': F.mono,
      'font-size': 24,
      'letter-spacing': '0.2em',
    }),
    circle(600, 900, 330, { fill: 'url(#fb-glow)' }),
    rect(400, 700, 400, 400, {
      fill: 'none',
      stroke: C.paper[50],
      'stroke-opacity': 0.22,
      'stroke-width': 2,
      'stroke-dasharray': '10 12',
    }),
    text('年代主视觉', 600, 880, {
      fill: C.paper[200],
      'font-family': F.sans,
      'font-size': 44,
      'text-anchor': 'middle',
    }),
    text('KEY VISUAL UNAVAILABLE', 600, 940, {
      fill: C.paper[400],
      'font-family': F.mono,
      'font-size': 22,
      'letter-spacing': '0.24em',
      'text-anchor': 'middle',
    }),
    line(80, 1660, 1120, 1660, { stroke: C.paper[50], 'stroke-opacity': 0.18, 'stroke-width': 1 }),
    text('此图为本馆自动降级占位，展品文字与年代信息仍由页面数据提供。', 80, 1712, {
      fill: C.paper[400],
      'font-family': F.sans,
      'font-size': 24,
    }),
    cornerTicks(W, H, 34, 30, { stroke: C.signal[500], 'stroke-width': 3, opacity: 0.8 }),
  ];
  return shell(W, H, body);
}

/** 封面降级图 */
function coverFallback() {
  const W = 1600, H = 900;
  const body = [
    rect(0, 0, 720, 8, { fill: 'url(#fb-stripe)' }),
    text('回响电玩馆', 96, 420, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 116,
      'font-weight': 700,
    }),
    text('PLAYTIME ATLAS', 96, 480, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 28,
      'font-weight': 700,
      'letter-spacing': '0.3em',
    }),
    line(96, 530, 560, 530, { stroke: C.signal[500], 'stroke-width': 3 }),
    text('封面主视觉暂缺 · FALLBACK COVER', 96, 590, {
      fill: C.paper[400],
      'font-family': F.mono,
      'font-size': 20,
      'letter-spacing': '0.16em',
    }),
  ];
  return shell(W, H, body);
}

/** 模型降级图 */
function modelFallback() {
  const W = 1024, H = 1024;
  const body = [
    rect(140, 200, 744, 560, {
      fill: 'none',
      stroke: C.paper[50],
      'stroke-opacity': 0.2,
      'stroke-width': 2,
      'stroke-dasharray': '12 14',
    }),
    polygon(
      [[512, 320], [740, 440], [740, 620], [512, 740], [284, 620], [284, 440]],
      { fill: 'none', stroke: C.signal[400], 'stroke-width': 2.5, 'stroke-opacity': 0.9 },
    ),
    text('3D 模型暂不可用', 512, 860, {
      fill: C.paper[200],
      'font-family': F.sans,
      'font-size': 40,
      'text-anchor': 'middle',
    }),
    text('MODEL UNAVAILABLE · 请查看技术插画降级图', 512, 912, {
      fill: C.paper[400],
      'font-family': F.mono,
      'font-size': 22,
      'letter-spacing': '0.14em',
      'text-anchor': 'middle',
    }),
  ];
  return shell(W, H, body);
}

/** 无 WebGL 提示 */
function noWebgl() {
  const W = 1024, H = 512;
  const body = [
    rect(64, 96, 896, 320, {
      fill: 'none',
      stroke: C.signal[500],
      'stroke-width': 2.5,
      'stroke-dasharray': '10 10',
    }),
    text('此浏览器未启用 WebGL', 512, 220, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 48,
      'font-weight': 700,
      'text-anchor': 'middle',
    }),
    text('WEBGL NOT AVAILABLE', 512, 274, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 24,
      'letter-spacing': '0.24em',
      'text-anchor': 'middle',
    }),
    text('已自动切换到技术插画降级图，展品结构与规格信息完整保留。', 512, 336, {
      fill: C.paper[300],
      'font-family': F.sans,
      'font-size': 24,
      'text-anchor': 'middle',
    }),
  ];
  return shell(W, H, body);
}

/** 离线提示 */
function offlineNotice() {
  const W = 1024, H = 420;
  const body = [
    rect(64, 70, 896, 280, {
      fill: 'none',
      stroke: C.paper[50],
      'stroke-opacity': 0.24,
      'stroke-width': 2,
    }),
    circle(200, 210, 46, { fill: 'none', stroke: C.signal[400], 'stroke-width': 4 }),
    line(170, 180, 230, 240, { stroke: C.signal[400], 'stroke-width': 4 }),
    line(230, 180, 170, 240, { stroke: C.signal[400], 'stroke-width': 4 }),
    text('当前处于离线状态', 300, 200, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 44,
      'font-weight': 700,
    }),
    text('本馆全部字体、图像与模型均已本地化，离线仍可浏览。', 300, 262, {
      fill: C.paper[300],
      'font-family': F.sans,
      'font-size': 24,
    }),
    text('OFFLINE · ALL ASSETS SELF-HOSTED', 300, 310, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 19,
      'letter-spacing': '0.16em',
    }),
  ];
  return shell(W, H, body);
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const sets = [
    ['poster-fallback.svg', posterFallback()],
    ['cover-fallback.svg', coverFallback()],
    ['model-fallback.svg', modelFallback()],
    ['no-webgl.svg', noWebgl()],
    ['offline-notice.svg', offlineNotice()],
  ];
  for (const [name, svg] of sets) {
    writeOut(path.join(OUT, name), svg);
    console.log(`✓ fallback/${name}  ${(Buffer.byteLength(svg) / 1024).toFixed(0)} KB`);
  }
  console.log(`\n✓ ${sets.length} 个降级图形生成完毕`);
}

main();
