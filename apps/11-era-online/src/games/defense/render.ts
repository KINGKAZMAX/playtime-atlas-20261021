/**
 * defense/render.ts — 《灯塔协议》Canvas 2D 渲染层。
 *
 * 所有图形都是程序化绘制的几何与渐变，不使用任何位图素材。
 * 渲染层只读状态，不修改状态。
 */

import { SHELL, mix, withAlpha } from '../../core/palette';
import { drawText, measure } from '../../core/pixelFont';
import {
  ASH_PATH,
  BEACON,
  CANVAS_H,
  CANVAS_W,
  CELL,
  ENEMIES,
  GRID,
  GRID_COLS,
  GRID_ROWS,
  LANE_COLOR,
  MAIN_PATH,
  RIFT,
  TOWERS,
} from './config';
import { pathPos } from './sim';
import type { DefenseState, Enemy, Tower } from './types';

/**
 * 渐变缓存：createLinearGradient / createRadialGradient 每帧新建会带来不必要的开销，
 * 这里按 ctx 缓存固定形状的渐变（背景、灯塔塔身、裂隙光晕）。
 */
const gradCache = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasGradient>>();

function cachedGrad(
  ctx: CanvasRenderingContext2D,
  key: string,
  make: () => CanvasGradient,
): CanvasGradient {
  let map = gradCache.get(ctx);
  if (!map) {
    map = new Map();
    gradCache.set(ctx, map);
  }
  const hit = map.get(key);
  if (hit) return hit;
  const g = make();
  map.set(key, g);
  return g;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function drawLane(
  ctx: CanvasRenderingContext2D,
  path: Array<{ x: number; y: number }>,
  color: string,
  dim: string,
  chevron: number,
): void {
  // 航道底板
  ctx.strokeStyle = dim;
  ctx.lineWidth = CELL * 0.72;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  path.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  ctx.strokeStyle = withAlpha(color, 0.16);
  ctx.lineWidth = CELL * 0.72 - 8;
  ctx.stroke();

  // 流向箭头
  ctx.fillStyle = withAlpha(color, 0.2);
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    if ((i + chevron) % 3 !== 0) continue;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(-3, -4);
    ctx.lineTo(-3, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawBeacon(ctx: CanvasRenderingContext2D, state: DefenseState, time: number): void {
  const cx = (BEACON.col + 0.5) * CELL;
  const cy = (BEACON.row + 0.5) * CELL;
  const ratio = Math.max(0, state.beaconHp / state.beaconMax);
  const hurt = ratio < 0.35;

  // 旋转光束
  const sweep = (time * 0.9) % (Math.PI * 2);
  ctx.save();
  ctx.translate(cx, cy - 6);
  ctx.rotate(sweep);
  const grad = ctx.createLinearGradient(0, 0, 120, 0);
  grad.addColorStop(0, withAlpha(LANE_COLOR.beacon, hurt ? 0.3 : 0.2));
  grad.addColorStop(1, withAlpha(LANE_COLOR.beacon, 0));
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(120, -26);
  ctx.lineTo(120, 26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 塔身
  const bodyGrad = cachedGrad(ctx, 'beacon-body', () => {
    const g = ctx.createLinearGradient(cx - 12, cy - 18, cx + 12, cy + 18);
    g.addColorStop(0, '#7d4a26');
    g.addColorStop(1, '#3d2413');
    return g;
  });
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy + 16);
  ctx.lineTo(cx - 6, cy - 12);
  ctx.lineTo(cx + 6, cy - 12);
  ctx.lineTo(cx + 9, cy + 16);
  ctx.closePath();
  ctx.fill();
  if (hurt) {
    // 受损时叠加红色告警色
    ctx.fillStyle = 'rgba(107,43,58,0.72)';
    ctx.fill();
  }

  // 灯室
  ctx.fillStyle = hurt ? '#ff8fa3' : '#ffe0a8';
  roundRect(ctx, cx - 7, cy - 18, 14, 8, 2);
  ctx.fill();
  ctx.strokeStyle = withAlpha('#ff8a3d', 0.7);
  ctx.lineWidth = 1;
  ctx.stroke();

  // 灯芒
  const pulse = 0.5 + 0.5 * Math.sin(time * 3);
  ctx.fillStyle = withAlpha(hurt ? '#ff5d73' : '#ffd166', 0.16 + pulse * 0.2);
  ctx.beginPath();
  ctx.arc(cx, cy - 14, 12 + pulse * 4, 0, Math.PI * 2);
  ctx.fill();

  // 耐久环
  ctx.strokeStyle = withAlpha(hurt ? '#ff5d73' : '#7cf29a', 0.85);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 17, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
  ctx.stroke();
  ctx.strokeStyle = withAlpha(SHELL.line, 0.9);
  ctx.beginPath();
  ctx.arc(cx, cy, 17, 0, Math.PI * 2);
  ctx.stroke();
}

function drawRift(ctx: CanvasRenderingContext2D, state: DefenseState, time: number): void {
  const cx = (RIFT.col + 0.5) * CELL;
  const cy = (RIFT.row + 0.5) * CELL;
  const flash = state.riftFlash / 0.5;

  // 裂隙到灯塔的突袭链路
  const bx = (BEACON.col + 0.5) * CELL;
  const by = (BEACON.row + 0.5) * CELL;
  ctx.save();
  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = withAlpha('#ff5d73', 0.25 + flash * 0.6);
  ctx.lineWidth = 1.6 + flash * 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + CELL * 0.4);
  ctx.lineTo(bx, by - CELL * 0.5);
  ctx.stroke();
  ctx.restore();

  const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
  const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, 20 + pulse * 6);
  g.addColorStop(0, withAlpha('#ff8fa3', 0.75 + flash * 0.25));
  g.addColorStop(0.5, withAlpha('#ff5d73', 0.3));
  g.addColorStop(1, withAlpha('#ff5d73', 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, 20 + pulse * 6, 0, Math.PI * 2);
  ctx.fill();

  // 裂缝
  ctx.strokeStyle = '#ffd0d8';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(cx - 9, cy - 8);
  ctx.lineTo(cx - 2, cy - 1);
  ctx.lineTo(cx - 5, cy + 3);
  ctx.lineTo(cx + 3, cy + 9);
  ctx.moveTo(cx - 2, cy - 1);
  ctx.lineTo(cx + 8, cy - 6);
  ctx.stroke();
}

function drawTower(ctx: CanvasRenderingContext2D, tower: Tower, time: number): void {
  const def = TOWERS[tower.kind];
  const cx = (tower.col + 0.5) * CELL;
  const cy = (tower.row + 0.5) * CELL;
  const pulse = tower.pulse > 0 ? tower.pulse / 0.18 : 0;

  // 底座
  ctx.fillStyle = SHELL.panelHi;
  ctx.strokeStyle = withAlpha(def.color, 0.45);
  ctx.lineWidth = 1;
  roundRect(ctx, cx - 13, cy - 13, 26, 26, 5);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, cy);

  switch (tower.kind) {
    case 'pulse': {
      ctx.rotate(time * 0.9 + tower.id);
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const px = Math.cos(a) * 8;
        const py = Math.sin(a) * 8;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'cryo': {
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + time * 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
        ctx.lineTo(Math.cos(a) * 9, Math.sin(a) * 9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
        ctx.lineTo(Math.cos(a + 1.1) * 8, Math.sin(a + 1.1) * 8);
        ctx.stroke();
      }
      break;
    }
    case 'rail': {
      ctx.rotate(tower.aim);
      ctx.fillStyle = def.color;
      roundRect(ctx, 0, -3, 14, 6, 2);
      ctx.fill();
      ctx.fillStyle = withAlpha(def.accent, 0.5 + pulse * 0.5);
      ctx.beginPath();
      ctx.arc(14, 0, 2.4 + pulse * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(-tower.aim);
      break;
    }
    case 'reso': {
      ctx.rotate(-time * 0.7);
      ctx.strokeStyle = def.color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    }
  }

  // 核心
  ctx.fillStyle = def.accent;
  ctx.globalAlpha = 0.65 + pulse * 0.35;
  ctx.beginPath();
  ctx.arc(0, 0, 3.4 + pulse * 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // 等级角标
  for (let i = 0; i < tower.level; i++) {
    ctx.fillStyle = def.color;
    ctx.fillRect(cx - 7 + i * 5, cy + 10, 3.5, 3.5);
  }
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number): void {
  const def = ENEMIES[e.kind];
  const p = pathPos(e.lane, e.t);
  const dying = e.dying > 0;
  const alpha = dying ? e.dying / 0.28 : 1;
  const r = def.radius;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(p.x, p.y);

  if (e.flash > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = alpha * (e.flash / 0.12);
  } else {
    ctx.fillStyle = def.color;
  }

  // 减速冰霜环
  if (e.slowT > 0 && !dying) {
    ctx.strokeStyle = withAlpha('#7cf29a', 0.75);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, r + 3.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  switch (def.shape) {
    case 'blob': {
      const wob = 1 + Math.sin(time * 7 + e.id) * 0.1;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * wob, r / wob, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = withAlpha('#000000', 0.35);
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'dart': {
      const ang = Math.atan2(
        pathPos(e.lane, e.t + 0.2).y - p.y,
        pathPos(e.lane, e.t + 0.2).x - p.x,
      );
      ctx.rotate(ang);
      ctx.beginPath();
      ctx.moveTo(r + 2, 0);
      ctx.lineTo(-r, -r * 0.78);
      ctx.lineTo(-r * 0.4, 0);
      ctx.lineTo(-r, r * 0.78);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'block': {
      roundRect(ctx, -r, -r, r * 2, r * 2, 3);
      ctx.fill();
      ctx.strokeStyle = withAlpha('#e7ecf7', 0.4);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = withAlpha('#0d1224', 0.45);
      ctx.fillRect(-r * 0.7, -r * 0.25, r * 1.4, 3);
      break;
    }
    case 'flame': {
      const flick = 1 + Math.sin(time * 12 + e.id * 2) * 0.16;
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.25 * flick);
      ctx.quadraticCurveTo(r * 0.85, -r * 0.1, r * 0.6, r * 0.75);
      ctx.quadraticCurveTo(0, r * 1.05, -r * 0.6, r * 0.75);
      ctx.quadraticCurveTo(-r * 0.85, -r * 0.1, 0, -r * 1.25 * flick);
      ctx.fill();
      break;
    }
    case 'boss': {
      ctx.rotate(time * 0.8);
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const rr = i % 2 === 0 ? r : r * 0.55;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = withAlpha('#ffd166', 0.8);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      break;
    }
  }
  ctx.restore();

  // 血条
  if (!dying && e.hp < e.maxHp) {
    const w = r * 2.2;
    const ratio = Math.max(0, e.hp / e.maxHp);
    const x = p.x - w / 2;
    const y = p.y - r - 8;
    ctx.fillStyle = withAlpha('#0d1224', 0.85);
    ctx.fillRect(x - 1, y - 1, w + 2, 4.5);
    ctx.fillStyle = ratio > 0.5 ? '#7cf29a' : ratio > 0.25 ? '#ffd166' : '#ff5d73';
    ctx.fillRect(x, y, w * ratio, 2.5);
  }
}

export function renderDefense(
  ctx: CanvasRenderingContext2D,
  state: DefenseState,
  time: number,
  dpr: number,
): void {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // 背景
  const bg = cachedGrad(ctx, 'bg', () => {
    const g = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
    g.addColorStop(0, '#0a0f1e');
    g.addColorStop(0.55, '#0d1426');
    g.addColorStop(1, '#080c17');
    return g;
  });
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // 网格底纹
  ctx.strokeStyle = withAlpha(SHELL.lineSoft, 0.5);
  ctx.lineWidth = 1;
  for (let c = 0; c <= GRID_COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * CELL + 0.5, 0);
    ctx.lineTo(c * CELL + 0.5, CANVAS_H);
    ctx.stroke();
  }
  for (let r = 0; r <= GRID_ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * CELL + 0.5);
    ctx.lineTo(CANVAS_W, r * CELL + 0.5);
    ctx.stroke();
  }

  // 可建造格的虚线角标
  ctx.strokeStyle = withAlpha(SHELL.line, 0.55);
  ctx.lineWidth = 1;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (GRID[r]![c] !== 'build') continue;
      const x = c * CELL + 9;
      const y = r * CELL + 9;
      const s = 4;
      ctx.beginPath();
      ctx.moveTo(x, y + s);
      ctx.lineTo(x, y);
      ctx.lineTo(x + s, y);
      ctx.moveTo(x + CELL - 18 - s, y + CELL - 18);
      ctx.lineTo(x + CELL - 18, y + CELL - 18);
      ctx.lineTo(x + CELL - 18, y + CELL - 18 - s);
      ctx.stroke();
    }
  }

  // 岩块
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (GRID[r]![c] !== 'rock') continue;
      const cx = (c + 0.5) * CELL;
      const cy = (r + 0.5) * CELL;
      ctx.fillStyle = LANE_COLOR.rock;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 7);
      ctx.lineTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 2, cy - 11);
      ctx.lineTo(cx + 11, cy - 3);
      ctx.lineTo(cx + 9, cy + 9);
      ctx.lineTo(cx - 3, cy + 11);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = withAlpha('#4a5678', 0.8);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // 航道
  drawLane(ctx, MAIN_PATH, LANE_COLOR.main, LANE_COLOR.mainDim, 0);
  drawLane(ctx, ASH_PATH, LANE_COLOR.ash, LANE_COLOR.ashDim, 1);

  drawRift(ctx, state, time);
  drawBeacon(ctx, state, time);

  // 光束特效
  for (const b of state.beams) {
    const a = Math.max(0, b.life / 0.24);
    ctx.strokeStyle = withAlpha(b.color, a * 0.9);
    ctx.lineWidth = b.width * a + 0.5;
    ctx.beginPath();
    ctx.moveTo(b.x0, b.y0);
    ctx.lineTo(b.x1, b.y1);
    ctx.stroke();
    ctx.strokeStyle = withAlpha('#ffffff', a * 0.5);
    ctx.lineWidth = Math.max(0.5, b.width * a * 0.35);
    ctx.stroke();
  }

  // 塔的射程圈（悬停 / 选中时）
  const focus = state.selectedTower !== null
    ? state.towers.find((t) => t.id === state.selectedTower)
    : undefined;
  if (focus) {
    const def = TOWERS[focus.kind];
    const lvl = def.levels[focus.level - 1]!;
    const cx = (focus.col + 0.5) * CELL;
    const cy = (focus.row + 0.5) * CELL;
    ctx.strokeStyle = withAlpha(def.color, 0.4);
    ctx.fillStyle = withAlpha(def.color, 0.07);
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(cx, cy, lvl.range * CELL, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 建造预览
  if (state.buildKind) {
    const def = TOWERS[state.buildKind];
    const c = state.cursor;
    const ok =
      GRID[c.row]?.[c.col] === 'build' && !state.towers.some((t) => t.col === c.col && t.row === c.row);
    const cx = (c.col + 0.5) * CELL;
    const cy = (c.row + 0.5) * CELL;
    const lvl = def.levels[0]!;
    ctx.strokeStyle = withAlpha(ok ? def.color : '#ff5d73', 0.55);
    ctx.fillStyle = withAlpha(ok ? def.color : '#ff5d73', 0.08);
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, lvl.range * CELL, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = withAlpha(ok ? def.color : '#ff5d73', 0.2);
    roundRect(ctx, c.col * CELL + 3, c.row * CELL + 3, CELL - 6, CELL - 6, 5);
    ctx.fill();
  }

  // 塔
  for (const t of state.towers) drawTower(ctx, t, time);

  // 敌人
  for (const e of state.enemies) drawEnemy(ctx, e, time);

  // 粒子
  for (const s of state.sparks) {
    const a = Math.max(0, s.life / s.maxLife);
    ctx.fillStyle = withAlpha(s.color, a);
    ctx.fillRect(s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
  }

  // 光标（键盘模式）
  if (state.buildKind) {
    const c = state.cursor;
    ctx.strokeStyle = withAlpha(SHELL.dawn, 0.9);
    ctx.lineWidth = 2;
    roundRect(ctx, c.col * CELL + 2, c.row * CELL + 2, CELL - 4, CELL - 4, 4);
    ctx.stroke();
  }

  // 横幅
  if (state.bannerT > 0) {
    const a = Math.min(1, state.bannerT / 0.5);
    const w = measure(state.banner, 2) + 28;
    ctx.fillStyle = withAlpha('#080b16', 0.82 * a);
    roundRect(ctx, CANVAS_W / 2 - w / 2, 10, w, 26, 6);
    ctx.fill();
    ctx.strokeStyle = withAlpha(SHELL.dawn, 0.5 * a);
    ctx.lineWidth = 1;
    ctx.stroke();
    drawText(ctx, state.banner, CANVAS_W / 2 - w / 2 + 14, 18, mix('#ffffff', SHELL.text, a), 2);
  }

  // 准备阶段倒计时（画布角标）
  if (!state.inWave && !state.over) {
    const label = `下一波 ${Math.max(0, state.prepTimer).toFixed(0)}s`;
    ctx.fillStyle = withAlpha('#080b16', 0.75);
    roundRect(ctx, CANVAS_W - 118, CANVAS_H - 32, 108, 22, 5);
    ctx.fill();
    drawText(ctx, label, CANVAS_W - 108, CANVAS_H - 26, SHELL.dataSoft, 2);
  }
}
