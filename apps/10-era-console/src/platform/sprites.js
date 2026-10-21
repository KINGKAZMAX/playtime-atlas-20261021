/**
 * 10-era-console — 色块远征 / CHROMA VOYAGE
 * 程序化精灵烘焙 + 瓦片贴图生成（全部资产在运行时生成，无外部图片）
 */

import {
  PALETTE,
  HERO_W,
  HERO_H,
  CUSP_W,
  CUSP_H,
  WISP_W,
  WISP_H,
  SHARD_W,
  SHARD_H,
  ANCHOR_W,
  ANCHOR_H,
  CUSP_FRAMES,
  WISP_FRAMES,
  SHARD_FRAMES,
  ANCHOR_IDLE,
  ANCHOR_ON,
  heroFrame,
} from './spriteData.js';

export const TILE = 16;

function makeCanvas(w, h) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  return cv;
}

/** 把字符矩阵烘焙成 canvas */
export function bakeSprite(rows) {
  const w = rows[0].length;
  const h = rows.length;
  const cv = makeCanvas(w, h);
  const ctx = cv.getContext('2d');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === '0') continue;
      const color = PALETTE[ch];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return cv;
}

/**
 * 按主题生成瓦片贴图。
 * 返回 { top, fill, oneway, spike, liquid: [f0, f1], mover }
 */
export function bakeTiles(theme) {
  const top = makeCanvas(TILE, TILE);
  const fill = makeCanvas(TILE, TILE);
  const oneway = makeCanvas(TILE, TILE);
  const spike = makeCanvas(TILE, TILE);
  const mover = makeCanvas(TILE * 2, TILE);

  // ---- 地表（顶部一条亮边 + 主体 + 噪点） ----
  let c = top.getContext('2d');
  c.fillStyle = theme.dirtTop;
  c.fillRect(0, 0, TILE, 4);
  c.fillStyle = theme.dirt;
  c.fillRect(0, 4, TILE, TILE - 4);
  c.fillStyle = theme.dirtDark;
  // 固定噪点图案（可重复，不依赖随机数）
  const specks = [[2, 6], [7, 5], [11, 8], [4, 10], [9, 12], [13, 6], [6, 9], [14, 11]];
  for (const [x, y] of specks) {
    c.fillRect(x, y, 1, 1);
    c.fillRect((x + 5) % TILE, (y + 4) % TILE, 1, 1);
  }
  c.fillStyle = theme.rock;
  c.fillRect(0, TILE - 1, TILE, 1);

  // ---- 填充块 ----
  c = fill.getContext('2d');
  c.fillStyle = theme.dirt;
  c.fillRect(0, 0, TILE, TILE);
  c.fillStyle = theme.dirtDark;
  for (const [x, y] of specks) c.fillRect(x, y, 2, 2);
  c.fillStyle = theme.rock;
  c.fillRect(0, TILE - 1, TILE, 1);
  c.fillRect(TILE - 1, 0, 1, TILE);

  // ---- 单向平台：一条带高光的横条 + 两侧挂件 ----
  c = oneway.getContext('2d');
  c.fillStyle = theme.rockLit;
  c.fillRect(0, 0, TILE, 5);
  c.fillStyle = theme.accent;
  c.fillRect(0, 0, TILE, 1);
  c.fillRect(0, 4, TILE, 1);
  c.fillStyle = theme.rock;
  c.fillRect(3, 5, 2, 3);
  c.fillRect(11, 5, 2, 3);

  // ---- 尖刺 ----
  c = spike.getContext('2d');
  c.fillStyle = theme.hazard;
  for (let i = 0; i < 4; i++) {
    const x = i * 4;
    c.fillRect(x + 1, 9, 2, 7);
    c.fillRect(x, 12, 4, 4);
    c.fillRect(x + 2, 6, 1, 4);
  }
  c.fillStyle = theme.accent;
  c.fillRect(2, 8, 1, 2);
  c.fillRect(10, 8, 1, 2);

  // ---- 色浆（2 帧波动） ----
  const liquids = [];
  for (let f = 0; f < 2; f++) {
    const cv = makeCanvas(TILE, TILE);
    const lc = cv.getContext('2d');
    lc.fillStyle = theme.liquid;
    lc.fillRect(0, 4, TILE, TILE - 4);
    lc.fillStyle = theme.liquidHi;
    const off = f * 3;
    for (let x = 0; x < TILE; x++) {
      const y = 4 + Math.round(Math.sin((x + off) * 0.8) * 1.5);
      lc.fillRect(x, y, 1, 2);
    }
    liquids.push(cv);
  }

  // ---- 移动平台 ----
  c = mover.getContext('2d');
  c.fillStyle = theme.rockLit;
  c.fillRect(0, 0, TILE * 2, 6);
  c.fillStyle = theme.accent;
  c.fillRect(0, 0, TILE * 2, 1);
  c.fillStyle = theme.rock;
  c.fillRect(0, 6, TILE * 2, 2);
  c.fillRect(2, 0, 2, 8);
  c.fillRect(TILE * 2 - 4, 0, 2, 8);

  return { top, fill, oneway, spike, liquid: liquids, mover };
}

/**
 * 目标闸门（跃迁塔）——程序化绘制，每帧根据开合状态变化。
 */
export function drawGate(ctx, x, y, open, phase) {
  const w = 16;
  const h = 32;
  ctx.save();
  ctx.translate(x, y);

  // 底座
  ctx.fillStyle = '#2a2740';
  ctx.fillRect(1, h - 8, w - 2, 8);
  ctx.fillStyle = '#4d4666';
  ctx.fillRect(1, h - 8, w - 2, 2);

  // 塔身
  ctx.fillStyle = '#3b3660';
  ctx.fillRect(3, 8, w - 6, h - 16);
  ctx.fillStyle = '#524a80';
  ctx.fillRect(3, 8, 2, h - 16);

  // 顶部拱
  ctx.fillStyle = '#524a80';
  ctx.fillRect(4, 3, w - 8, 6);

  // 光柱
  const glow = open ? 1 : 0.28;
  const pulse = 0.7 + 0.3 * Math.sin(phase * 0.12);
  ctx.globalAlpha = glow * pulse;
  const grd = ctx.createLinearGradient(0, 2, 0, h - 6);
  grd.addColorStop(0, open ? '#fff3c4' : '#5c6a92');
  grd.addColorStop(1, open ? '#ffd166' : '#3b3660');
  ctx.fillStyle = grd;
  ctx.fillRect(6, 4, w - 12, h - 10);
  ctx.globalAlpha = 1;

  // 指示灯
  ctx.fillStyle = open ? '#ffd166' : '#ff7a6b';
  ctx.fillRect(6, 1, 4, 3);
  ctx.fillStyle = open ? '#fff3c4' : '#ffb0a6';
  ctx.fillRect(7, 1, 2, 1);

  // 锁扣（未集齐色晶时显示）
  if (!open) {
    ctx.fillStyle = '#101018';
    ctx.fillRect(4, h - 14, w - 8, 6);
    ctx.fillStyle = '#ff7a6b';
    ctx.fillRect(6, h - 13, w - 12, 2);
  }
  ctx.restore();
}

/**
 * 一次性烘焙全部精灵帧。
 */
export function bakeAllSprites() {
  return {
    hero: {
      idle: bakeSprite(heroFrame('idle')),
      walkA: bakeSprite(heroFrame('walkA')),
      walkB: bakeSprite(heroFrame('walkB')),
      jump: bakeSprite(heroFrame('jump')),
      fall: bakeSprite(heroFrame('fall')),
    },
    cusp: [bakeSprite(CUSP_FRAMES[0]), bakeSprite(CUSP_FRAMES[1])],
    wisp: [bakeSprite(WISP_FRAMES[0]), bakeSprite(WISP_FRAMES[1])],
    shard: [bakeSprite(SHARD_FRAMES[0]), bakeSprite(SHARD_FRAMES[1]), bakeSprite(SHARD_FRAMES[2])],
    anchor: {
      idle: bakeSprite(ANCHOR_IDLE),
      on: bakeSprite(ANCHOR_ON),
    },
    dims: {
      hero: [HERO_W, HERO_H],
      cusp: [CUSP_W, CUSP_H],
      wisp: [WISP_W, WISP_H],
      shard: [SHARD_W, SHARD_H],
      anchor: [ANCHOR_W, ANCHOR_H],
    },
  };
}
