/**
 * handheld/render.ts — 《口袋回声》的点阵渲染。
 *
 * 画面逻辑分辨率 160×144（原创设定，非任何商业掌机的原生分辨率），
 * 使用本展厅自绘的 5×7 点阵字体与「暮港」5 阶色板，所有图形均为程序化绘制。
 */

import { POCKET } from '../../core/palette';
import { drawText, measure } from '../../core/pixelFont';
import {
  LEVER_SPOT,
  MAP_H,
  MAP_W,
  NPCS,
  SCREEN_H,
  SCREEN_W,
  SHARD_SPOTS,
  TILE,
  type AreaDef,
} from './world';
import { areaOf, tileAt, type HandheldState } from './sim';

function px(ctx: CanvasRenderingContext2D, x: number, y: number, c: string, w = 1, h = 1): void {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

/** 棋盘抖动，用来在有限色阶里制造过渡。 */
function dither(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: string,
  phase = 0,
): void {
  ctx.fillStyle = c;
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      if ((i + j + phase) % 2 === 0) ctx.fillRect(x + i, y + j, 1, 1);
    }
  }
}

function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number): void {
  px(ctx, x, y, POCKET.d2, TILE, TILE);
  px(ctx, x, y, POCKET.d3, TILE, 1);
  // 砖缝
  const offset = seed % 3 === 0 ? 0 : 3;
  px(ctx, x, y + 4 - offset, POCKET.d1, TILE, 1);
  px(ctx, x + ((seed % 2) * 3 + 2), y + 4 - offset, POCKET.d1, 1, 4);
  px(ctx, x + 5, y + 8 - offset, POCKET.d1, 1, 4);
  // 顶部高光
  px(ctx, x + 1, y + 1, POCKET.d3, 2, 1);
  px(ctx, x + 5, y + 1, POCKET.d3, 1, 1);
}

function drawPlaza(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number): void {
  px(ctx, x, y, POCKET.d3, TILE, TILE);
  dither(ctx, x, y, TILE, TILE, POCKET.d2, seed % 2);
  px(ctx, x + (seed % 6), y + 3, POCKET.d4, 1, 1);
}

function drawDeck(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number): void {
  px(ctx, x, y, POCKET.d3, TILE, TILE);
  px(ctx, x, y, POCKET.d2, TILE, 1);
  px(ctx, x, y + 3, POCKET.d2, TILE, 1);
  px(ctx, x, y + 6, POCKET.d2, TILE, 1);
  px(ctx, x + (seed % 5), y + 1, POCKET.d4, 2, 1);
}

function drawWater(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, seed: number): void {
  px(ctx, x, y, POCKET.d1, TILE, TILE);
  const phase = Math.floor(time * 2 + seed) % 4;
  px(ctx, x, y + 2, POCKET.d2, TILE, 1);
  px(ctx, x + ((phase * 2) % TILE), y + 5, POCKET.d2, 3, 1);
  px(ctx, x + 2, y + 6, POCKET.lampDim, 1, 1);
}

function drawCrate(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  px(ctx, x, y, POCKET.d1, TILE, TILE);
  px(ctx, x + 1, y + 1, POCKET.d2, TILE - 2, TILE - 2);
  px(ctx, x + 1, y + 1, POCKET.d4, TILE - 2, 1);
  px(ctx, x + 3, y + 3, POCKET.d4, 1, 1);
  px(ctx, x + 4, y + 4, POCKET.d4, 1, 1);
  px(ctx, x + 5, y + 5, POCKET.d4, 1, 1);
  px(ctx, x + 1, y + 1, POCKET.d3, 1, 1);
}

function drawArch(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  px(ctx, x, y, POCKET.d3, TILE, TILE);
  dither(ctx, x, y, TILE, TILE, POCKET.d2, 0);
  px(ctx, x, y, POCKET.d1, 1, TILE);
  px(ctx, x + TILE - 1, y, POCKET.d1, 1, TILE);
  px(ctx, x + 2, y, POCKET.d4, 1, 1);
  px(ctx, x + 5, y, POCKET.d4, 1, 1);
}

function drawDoor(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, locked: boolean): void {
  px(ctx, x, y, POCKET.d1, TILE, TILE);
  // 拱形门框
  px(ctx, x + 1, y + 1, POCKET.d5, TILE - 2, TILE - 1);
  px(ctx, x + 2, y + 2, POCKET.ink, TILE - 4, TILE - 2);
  const glow = locked ? '#ff5d73' : POCKET.lamp;
  const pulse = locked ? 0.5 : 0.5 + 0.5 * Math.sin(time * 3);
  px(ctx, x + 3, y + 4, glow, 2, 2);
  ctx.fillStyle = glow;
  ctx.globalAlpha = 0.18 + pulse * 0.2;
  ctx.fillRect(x + 2, y + 3, TILE - 4, TILE - 3);
  ctx.globalAlpha = 1;
}

function drawLeverTile(ctx: CanvasRenderingContext2D, x: number, y: number, on: boolean): void {
  px(ctx, x, y, POCKET.d3, TILE, TILE);
  dither(ctx, x, y, TILE, TILE, POCKET.d2, 1);
  // 底座
  px(ctx, x + 2, y + 5, POCKET.d1, 4, 2);
  // 立杆
  px(ctx, x + 3, y + 2, POCKET.d4, 2, 4);
  // 手柄（开=斜上，关=斜下）
  if (on) {
    px(ctx, x + 3, y + 1, POCKET.lamp, 3, 2);
  } else {
    px(ctx, x + 3, y + 4, POCKET.d4, 3, 2);
  }
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  time: number,
  seed: number,
  state: HandheldState,
): void {
  switch (ch) {
    case '#':
      drawWall(ctx, x, y, seed);
      break;
    case '.':
      drawPlaza(ctx, x, y, seed);
      break;
    case ',':
      drawDeck(ctx, x, y, seed);
      break;
    case '~':
      drawWater(ctx, x, y, time, seed);
      break;
    case 'X':
      drawCrate(ctx, x, y);
      break;
    case '+':
      drawArch(ctx, x, y);
      break;
    case 'D':
      drawDoor(ctx, x, y, time, false);
      break;
    case 'A':
      drawDoor(ctx, x, y, time, !state.leverOn);
      break;
    case 'L':
      drawLeverTile(ctx, x, y, state.leverOn);
      break;
    case 'B':
      drawPlaza(ctx, x, y, seed);
      break;
    default:
      drawPlaza(ctx, x, y, seed);
      break;
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: HandheldState, time: number): void {
  const x = Math.round(state.px) - 4;
  const y = Math.round(state.py) - 9;
  const bob = state.moving ? (Math.floor(state.animT * 8) % 2 === 0 ? 0 : -1) : 0;
  const blink = state.invuln > 0 && Math.floor(time * 12) % 2 === 0;

  if (blink) return;

  // 影
  ctx.fillStyle = 'rgba(13,9,18,0.45)';
  ctx.fillRect(x + 1, state.py, 6, 2);

  const oy = y + bob;

  // 身体
  px(ctx, x + 1, oy + 4, POCKET.d3, 6, 4);
  // 头
  px(ctx, x + 2, oy + 1, POCKET.d5, 4, 3);
  // 帽檐
  px(ctx, x + 1, oy, POCKET.d4, 6, 1);

  if (state.dir === 'down') {
    px(ctx, x + 3, oy + 2, POCKET.ink, 1, 1);
    px(ctx, x + 5, oy + 2, POCKET.ink, 1, 1);
  } else if (state.dir === 'up') {
    px(ctx, x + 1, oy + 1, POCKET.d4, 6, 2);
  } else {
    // 侧面
    px(ctx, x + (state.dir === 'left' ? 1 : 5), oy + 2, POCKET.ink, 1, 1);
  }

  // 提灯
  const lampX = state.dir === 'left' ? x : x + 6;
  const lampY = oy + 4;
  const flicker = 0.7 + 0.3 * Math.sin(time * 9);
  ctx.fillStyle = POCKET.lamp;
  ctx.globalAlpha = flicker;
  ctx.fillRect(lampX, lampY, 2, 2);
  ctx.globalAlpha = 0.14 * flicker;
  ctx.beginPath();
  ctx.arc(lampX + 1, lampY + 1, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawNpc(ctx: CanvasRenderingContext2D, col: number, row: number, time: number, index: number): void {
  const x = col * TILE;
  const y = row * TILE;
  ctx.fillStyle = 'rgba(13,9,18,0.45)';
  ctx.fillRect(x + 1, y + TILE - 2, 6, 2);
  // 身体
  px(ctx, x + 1, y + 3, POCKET.d2, 6, 4);
  // 头
  px(ctx, x + 2, y, POCKET.d5, 4, 3);
  // 头巾（每个人不同）
  const hats = [POCKET.d4, POCKET.lampDim, POCKET.d3];
  px(ctx, x + 1, y - 1, hats[index % hats.length]!, 6, 2);
  px(ctx, x + 3, y + 1, POCKET.ink, 1, 1);
  px(ctx, x + 5, y + 1, POCKET.ink, 1, 1);
  // 呼吸
  if (Math.floor(time * 2 + index) % 2 === 0) {
    px(ctx, x + 3, y + 2, POCKET.ink, 1, 1);
  }
}

function drawCrab(ctx: CanvasRenderingContext2D, x: number, y: number, step: number, time: number): void {
  const bob = Math.floor(step) % 2 === 0 ? 0 : 1;
  const bx = Math.round(x) - 3;
  const by = Math.round(y) - 5 + bob;
  ctx.fillStyle = 'rgba(13,9,18,0.4)';
  ctx.fillRect(bx + 1, by + 5, 5, 1);
  px(ctx, bx + 1, by + 1, POCKET.d2, 5, 3);
  px(ctx, bx, by + 2, POCKET.d1, 1, 2);
  px(ctx, bx + 6, by + 2, POCKET.d1, 1, 2);
  px(ctx, bx + 2, by, POCKET.d4, 1, 1);
  px(ctx, bx + 4, by, POCKET.d4, 1, 1);
  // 眼
  const blink = Math.floor(time * 3 + x) % 5 === 0;
  if (!blink) {
    px(ctx, bx + 2, by + 1, POCKET.lamp, 1, 1);
    px(ctx, bx + 4, by + 1, POCKET.lamp, 1, 1);
  }
}

function drawShard(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  const bob = Math.round(Math.sin(time * 3) * 1.5);
  const sx = Math.round(x) - 2;
  const sy = Math.round(y) - 4 + bob;
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = POCKET.lamp;
  ctx.beginPath();
  ctx.arc(sx + 2, sy + 3, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  px(ctx, sx + 1, sy + 1, POCKET.lamp, 3, 1);
  px(ctx, sx, sy + 2, POCKET.lamp, 5, 1);
  px(ctx, sx + 1, sy + 3, POCKET.lamp, 3, 1);
  px(ctx, sx + 2, sy + 1, POCKET.glow, 1, 1);
}

function drawBeacon(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  const bx = Math.round(x);
  const by = Math.round(y);
  // 灯柱
  px(ctx, bx - 3, by - 1, POCKET.d1, 7, 6);
  px(ctx, bx - 2, by, POCKET.d2, 5, 4);
  // 灯芯
  const pulse = 0.55 + 0.45 * Math.sin(time * 2.6);
  ctx.globalAlpha = 0.22 + pulse * 0.3;
  ctx.fillStyle = POCKET.glow;
  ctx.beginPath();
  ctx.arc(bx, by - 2, 10 + pulse * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  px(ctx, bx - 1, by - 3, POCKET.glow, 3, 3);
}

export function renderHandheld(
  ctx: CanvasRenderingContext2D,
  state: HandheldState,
  time: number,
  dpr: number,
): void {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;

  const area: AreaDef = areaOf(state);
  const camX = Math.max(0, Math.min(MAP_W * TILE - SCREEN_W, Math.round(state.px - SCREEN_W / 2)));
  const camY = Math.max(0, Math.min(MAP_H * TILE - SCREEN_H, Math.round(state.py - SCREEN_H / 2)));

  ctx.fillStyle = POCKET.ink;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // 地图
  const startCol = Math.floor(camX / TILE);
  const startRow = Math.floor(camY / TILE);
  for (let r = startRow; r < startRow + SCREEN_H / TILE + 1; r++) {
    for (let c = startCol; c < startCol + SCREEN_W / TILE + 1; c++) {
      const ch = tileAt(area, c, r);
      const x = c * TILE - camX;
      const y = r * TILE - camY;
      drawTile(ctx, ch, x, y, time, (c * 7 + r * 13) % 97, state);
    }
  }

  // NPC
  NPCS.forEach((npc, i) => {
    if (npc.area !== state.area) return;
    const x = npc.col * TILE - camX;
    const y = npc.row * TILE - camY;
    if (x < -16 || x > SCREEN_W + 16 || y < -16 || y > SCREEN_H + 16) return;
    drawNpc(ctx, x, y, time, i);
    // 头顶小箭头，提示可交谈
    const bob = Math.round(Math.sin(time * 3 + i) * 1);
    px(ctx, x + 3, y - 4 + bob, POCKET.lamp, 2, 2);
  });

  // 碎片
  for (const spot of SHARD_SPOTS) {
    if (spot.area !== state.area) continue;
    const key = `${spot.area}:${spot.col},${spot.row}`;
    if (state.taken.includes(key)) continue;
    drawShard(ctx, spot.col * TILE + TILE / 2 - camX, spot.row * TILE - camY, time);
  }

  // 灯芯
  if (state.area === 'lighthouse') {
    const bx = 8 * TILE + TILE / 2 - camX;
    const by = 4 * TILE - camY;
    if (bx > -20 && bx < SCREEN_W + 20) drawBeacon(ctx, bx, by, time);
  }

  // 灯闸提示
  if (state.area === LEVER_SPOT.area) {
    const lx = LEVER_SPOT.col * TILE - camX;
    const ly = LEVER_SPOT.row * TILE - camY;
    if (lx > -16 && lx < SCREEN_W + 16) {
      const bob = Math.round(Math.sin(time * 3) * 1);
      px(ctx, lx + 3, ly - 4 + bob, state.leverOn ? POCKET.lamp : POCKET.d4, 2, 2);
    }
  }

  // 噬潮蟹
  for (const crab of state.crabs) {
    const x = crab.x - camX;
    const y = crab.y - camY;
    if (x < -16 || x > SCREEN_W + 16 || y < -16 || y > SCREEN_H + 16) continue;
    drawCrab(ctx, x, y, crab.step, time);
  }

  // 玩家
  drawPlayer(ctx, state, time);

  // 状态角标
  drawStatus(ctx, state, time);

  // 受击闪红
  if (state.hurtFlash > 0) {
    ctx.fillStyle = `rgba(255,93,115,${(state.hurtFlash / 0.35) * 0.34})`;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }

  // 场景淡入
  if (state.fade > 0) {
    ctx.fillStyle = `rgba(13,9,18,${Math.min(1, state.fade / 0.35)})`;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }
}

function drawStatus(ctx: CanvasRenderingContext2D, state: HandheldState, time: number): void {
  // 底板
  ctx.fillStyle = 'rgba(13,9,18,0.72)';
  ctx.fillRect(1, 1, 46, 9);

  // 体力
  for (let i = 0; i < state.maxHp; i++) {
    const x = 3 + i * 5;
    const filled = i < state.hp;
    px(ctx, x, 3, filled ? POCKET.d5 : POCKET.d2, 3, 3);
    px(ctx, x + 1, 4, filled ? POCKET.d4 : POCKET.d2, 1, 1);
  }

  // 碎片
  for (let i = 0; i < 3; i++) {
    const x = 22 + i * 7;
    const got = i < state.shards.length;
    const bob = got ? Math.round(Math.sin(time * 3 + i) * 1) : 0;
    if (got) {
      px(ctx, x + 1, 4 + bob, POCKET.lamp, 2, 1);
      px(ctx, x, 5 + bob, POCKET.lamp, 4, 1);
      px(ctx, x + 1, 6 + bob, POCKET.lamp, 2, 1);
    } else {
      px(ctx, x + 1, 4, POCKET.d2, 2, 1);
      px(ctx, x, 5, POCKET.d2, 4, 1);
      px(ctx, x + 1, 6, POCKET.d2, 2, 1);
    }
  }
}

/** 画布内的点阵提示（地点名 / 结局）。 */
export function renderBanner(
  ctx: CanvasRenderingContext2D,
  text: string,
  dpr: number,
  sub?: string,
): void {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = measure(text, 1) + 8;
  const h = sub ? 18 : 13;
  const x = (SCREEN_W - w) / 2;
  const y = 52;
  ctx.fillStyle = 'rgba(13,9,18,0.85)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = POCKET.lampDim;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  drawText(ctx, text, x + 4, y + 3, POCKET.glow, 1);
  if (sub) drawText(ctx, sub, x + 4, y + 12, POCKET.lamp, 1);
}
