/**
 * 回响电玩馆 — 年代海报生成器
 * AI 生成的无字关键帧 + SVG 精确排版层（中文标题 / 年份 / 编号 / 正文 / 关键词）
 * 输出：poster-<era>.svg（内嵌字体，完全自包含）+ poster-<era>.png（由 render.mjs 光栅化）
 *
 * 运行：node scripts/build-posters.mjs
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { eras, modelById } from './lib/catalog.mjs';
import { textWidth, wrapText } from './lib/text.mjs';
import tokens from './lib/tokens.mjs';
import {
  svgDoc, rect, text, svgPath, line, circle, polygon,
  linearGradient, radialGradient, dotPattern, lineGridPattern, halftonePattern,
  cornerTicks, grainFilter, esc, writeOut,
} from './lib/svg.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'public', 'assets', 'posters');

const W = 1200;
const H = 1800;
const M = 80;

const C = tokens.color;
const F = tokens.typography.fontFamily;


/** 右侧年代刻度尺 */
function timeline(currentId) {
  const x = 1152;
  const top = 200;
  const step = 128;
  const items = eras.map((e, i) => {
    const y = top + i * step;
    const on = e.id === currentId;
    const g = [];
    g.push(
      line(x, y, x + (on ? 34 : 18), y, {
        stroke: on ? C.signal[500] : C.paper[50],
        'stroke-opacity': on ? 1 : 0.28,
        'stroke-width': on ? 3 : 1.4,
        'stroke-linecap': 'round',
      }),
    );
    g.push(
      circle(x, y, on ? 4.2 : 2.4, {
        fill: on ? C.signal[500] : C.paper[50],
        'fill-opacity': on ? 1 : 0.3,
      }),
    );
    if (on) {
      g.push(
        text(String(e.index).padStart(2, '0'), x + 46, y + 6, {
          fill: C.signal[400],
          'font-family': F.mono,
          'font-size': 22,
          'font-weight': 700,
        }),
      );
    }
    return g.join('\n');
  });
  return items.join('\n');
}

/** 关键词胶囊 */
function chips(list, y) {
  const g = [];
  let x = M;
  const size = 19;
  for (const kw of list) {
    const w = Math.round(textWidth(kw, size) + 30);
    g.push(
      `<rect x="${x}" y="${y - 22}" width="${w}" height="34" rx="17" fill="none" ` +
        `stroke="${C.paper[50]}" stroke-opacity="0.34" stroke-width="1.2"/>`,
    );
    g.push(
      text(kw, x + 15, y + 1, {
        fill: C.paper[200],
        'font-family': F.sans,
        'font-size': size,
      }),
    );
    x += w + 12;
  }
  return g.join('\n');
}

function buildPoster(era) {
  const keyRel = `key/poster-${era.id}.jpg`;
  const keyFile = path.join(OUT, keyRel);
  const hasKey = existsSync(keyFile);

  const defs = [
    linearGradient('scrim-bottom', [
      { offset: '0%', color: C.ink[900], opacity: 0 },
      { offset: '38%', color: C.ink[900], opacity: 0.55 },
      { offset: '72%', color: C.ink[900], opacity: 0.9 },
      { offset: '100%', color: C.ink[900], opacity: 0.98 },
    ]),
    linearGradient('scrim-top', [
      { offset: '0%', color: C.ink[900], opacity: 0.88 },
      { offset: '100%', color: C.ink[900], opacity: 0 },
    ]),
    linearGradient('scrim-left', [
      { offset: '0%', color: C.ink[900], opacity: 0.6 },
      { offset: '100%', color: C.ink[900], opacity: 0 },
    ], { x1: 0, y1: 0, x2: 1, y2: 0 }),
    dotPattern('dots', { size: 18, r: 1.5, color: C.paper[50], opacity: 0.16 }),
    lineGridPattern('grid', { size: 40, color: C.paper[50], opacity: 0.05 }),
    halftonePattern('halftone', { size: 14, color: C.ink[900], opacity: 0.16, maxR: 2.6 }),
    grainFilter('grain', { freq: 0.85, opacity: 0.16, seed: 11 }),
    radialGradient('vig', [
      { offset: '55%', color: C.ink[900], opacity: 0 },
      { offset: '100%', color: C.ink[900], opacity: 0.72 },
    ]),
  ];

  const body = [];

  /* 关键帧 */
  if (hasKey) {
    body.push(
      `<image href="${keyRel}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`,
    );
  } else {
    body.push(rect(0, 0, W, H, { fill: C.ink[700] }));
    body.push(rect(0, 0, W, H, { fill: 'url(#grid)' }));
    body.push(
      text('关键帧待生成 · KEY VISUAL PENDING', W / 2, H / 2, {
        fill: C.paper[400],
        'font-family': F.mono,
        'font-size': 24,
        'text-anchor': 'middle',
      }),
    );
  }

  /* 网点 / 网格 / 暗角 / 压暗 */
  body.push(rect(0, 0, W, H, { fill: 'url(#halftone)', opacity: 0.5 }));
  body.push(rect(0, 0, W, H, { fill: 'url(#vig)' }));
  body.push(rect(0, 0, W, 260, { fill: 'url(#scrim-top)' }));
  body.push(rect(0, 0, W, H, { fill: 'url(#scrim-bottom)' }));
  body.push(rect(0, 0, 420, H, { fill: 'url(#scrim-left)' }));
  body.push(rect(880, 0, 320, 260, { fill: 'url(#dots)' }));

  /* 巨型编号水印 */
  body.push(
    text(String(era.index).padStart(2, '0'), M - 14, 560, {
      fill: 'none',
      stroke: C.paper[50],
      'stroke-opacity': 0.17,
      'stroke-width': 2.5,
      'font-family': F.display,
      'font-size': 300,
      'font-weight': 700,
      'letter-spacing': '-0.03em',
    }),
  );

  /* 顶栏 */
  body.push(
    text('回响电玩馆', M, 96, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 30,
      'font-weight': 700,
      'letter-spacing': '0.06em',
    }),
  );
  body.push(
    text('PLAYTIME ATLAS', M, 124, {
      fill: C.paper[400],
      'font-family': F.mono,
      'font-size': 15,
      'letter-spacing': '0.28em',
    }),
  );
  body.push(
    text(`ERA ${String(era.index).padStart(2, '0')} / ${String(eras.length).padStart(2, '0')}`, W - M, 100, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 24,
      'font-weight': 700,
      'letter-spacing': '0.12em',
      'text-anchor': 'end',
    }),
  );
  body.push(
    text('电子游戏硬件年代馆 · 原创策展分段', W - M, 126, {
      fill: C.paper[400],
      'font-family': F.sans,
      'font-size': 16,
      'text-anchor': 'end',
    }),
  );
  body.push(line(M, 150, W - M, 150, { stroke: C.paper[50], 'stroke-opacity': 0.22, 'stroke-width': 1 }));

  /* 标题区 */
  body.push(
    rect(M, 660, 8, 74, { fill: C.signal[500] }),
  );
  body.push(
    text(era.name, M + 30, 726, {
      fill: C.paper[50],
      'font-family': F.display,
      'font-size': 92,
      'font-weight': 700,
      'letter-spacing': '0.02em',
    }),
  );
  body.push(
    text(era.latin, M + 32, 786, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 27,
      'font-weight': 700,
      'letter-spacing': '0.22em',
    }),
  );
  body.push(
    text(era.range, M + 32, 830, {
      fill: C.paper[200],
      'font-family': F.mono,
      'font-size': 22,
      'letter-spacing': '0.14em',
    }),
  );

  /* 分隔线 */
  body.push(line(M, 880, W - 150, 880, { stroke: C.paper[50], 'stroke-opacity': 0.18, 'stroke-width': 1 }));

  /* 一句话 */
  body.push(
    text(era.tagline, M, 944, {
      fill: C.paper[100],
      'font-family': F.display,
      'font-size': 44,
      'font-weight': 500,
      'letter-spacing': '0.01em',
    }),
  );

  /* 正文 */
  const body2 = wrapText(era.story, 900, 25);
  body2.forEach((ln, i) => {
    body.push(
      text(ln, M, 1012 + i * 43, {
        fill: C.paper[200],
        'font-family': F.sans,
        'font-size': 25,
      }),
    );
  });

  /* 关键词 */
  body.push(chips(era.keywords.split(' · '), 1236));

  /* 说明条 */
  body.push(
    text('本馆原创分段，非官方分期；仅覆盖代表性成果，不宣称穷尽全部作品。', M, 1312, {
      fill: C.paper[400],
      'font-family': F.sans,
      'font-size': 17,
    }),
  );

  /* 关联展品 */
  body.push(line(M, 1362, W - M, 1362, { stroke: C.paper[50], 'stroke-opacity': 0.14, 'stroke-width': 1 }));
  body.push(
    text('本馆相关展品', M, 1400, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 17,
      'font-weight': 700,
      'letter-spacing': '0.16em',
    }),
  );
  (era.exhibits || []).forEach((mid, i) => {
    const m = modelById[mid];
    if (!m) return;
    const yy = 1450 + i * 52;
    body.push(
      rect(M, yy - 20, 4, 26, { fill: C.signal[500], opacity: 0.85 }),
    );
    body.push(
      text(`${m.name}　${m.latin}`, M + 18, yy, {
        fill: C.paper[100],
        'font-family': F.sans,
        'font-size': 22,
      }),
    );
    body.push(
      text(`${m.form} · ${m.range}`, W - M, yy, {
        fill: C.paper[400],
        'font-family': F.mono,
        'font-size': 17,
        'text-anchor': 'end',
      }),
    );
  });

  /* 底栏 */
  body.push(line(M, 1660, W - M, 1660, { stroke: C.paper[50], 'stroke-opacity': 0.18, 'stroke-width': 1 }));
  body.push(
    text(`ATLAS-ERA-${String(era.index).padStart(2, '0')}`, M, 1704, {
      fill: C.signal[400],
      'font-family': F.mono,
      'font-size': 20,
      'font-weight': 700,
      'letter-spacing': '0.1em',
    }),
  );
  body.push(
    text('原创虚构展品 · 视觉与模型均自绘自建', W / 2, 1704, {
      fill: C.paper[400],
      'font-family': F.sans,
      'font-size': 17,
      'text-anchor': 'middle',
    }),
  );
  body.push(
    text(`P.${String(era.index).padStart(2, '0')}`, W - M, 1704, {
      fill: C.paper[200],
      'font-family': F.mono,
      'font-size': 20,
      'letter-spacing': '0.1em',
      'text-anchor': 'end',
    }),
  );

  /* 角标与刻度尺 */
  body.push(cornerTicks(W, H, 34, 30, { stroke: C.signal[500], 'stroke-width': 3, opacity: 0.85 }));
  body.push(timeline(era.id));

  return svgDoc({ w: W, h: H, defs, body, background: C.ink[900] });
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const missing = [];
  for (const era of eras) {
    const svg = buildPoster(era);
    const file = path.join(OUT, `poster-${era.id}.svg`);
    writeOut(file, svg);
    const kb = (Buffer.byteLength(svg) / 1024).toFixed(0);
    if (!existsSync(path.join(OUT, `key/poster-${era.id}.jpg`))) missing.push(era.id);
    console.log(`✓ poster-${era.id}.svg  ${kb} KB  ${era.name}`);
  }
  if (missing.length) console.warn(`⚠ 缺少关键帧：${missing.join(', ')}（已生成占位版本）`);
  console.log(`\n✓ ${eras.length} 张年代海报 SVG 生成完毕`);
}

main();
