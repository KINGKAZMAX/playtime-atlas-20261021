/**
 * 展厅装饰动画 —— 序厅示波器示样 + 两件展品的动态预览。
 *
 * 全部为 Canvas 程序化绘制，与展品本体共用同一套视觉语言。
 * 尊重 prefers-reduced-motion：开启后改为静态图样，不启动动画循环。
 */

import { PALETTE, createSurface, glowDot, roundRect } from '../core/gfx.js';
import { Loop, clamp, rand } from '../core/loop.js';

const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------------
 * 序厅：示波器示样
 * ------------------------------------------------------------- */
export function mountOscilloscope(canvas) {
  const W = 640;
  const H = 480;
  const surface = createSurface(canvas, W, H);
  const ctx = surface.ctx;

  const trail = [];
  let t = 0;

  function draw(dt) {
    t += dt;
    // 3:2 李萨如曲线，缓慢漂移 —— 模拟模拟信号在示波器上的形态
    const cx = W / 2;
    const cy = H / 2;
    const A = W * 0.33;
    const B = H * 0.31;
    const phase = t * 0.16;

    ctx.fillStyle = 'rgba(4,6,13,0.32)';
    ctx.fillRect(0, 0, W, H);

    // 刻度网格
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = PALETTE.cyan;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 12; i += 1) {
      const x = (i / 12) * W;
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (let i = 0; i <= 9; i += 1) {
      const y = (i / 9) * H;
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();
    ctx.restore();

    // 扫描光束当前位置
    const u = t * 0.9;
    const px = cx + Math.sin(3 * u + phase) * A;
    const py = cy + Math.sin(2 * u) * B;

    trail.push({ x: px, y: py, life: 1 });
    if (trail.length > 110) trail.shift();

    // 磷光余迹
    for (let i = 0; i < trail.length; i += 1) {
      const p = trail[i];
      const k = i / trail.length;
      glowDot(ctx, p.x, p.y, 1.1 + k * 2.1, PALETTE.cyan, k * k * 0.75, 2.4);
    }

    // 辉点本体
    glowDot(ctx, px, py, 3.4, '#ffffff', 0.95, 4);
    glowDot(ctx, px, py, 8, PALETTE.cyan, 0.32, 5);

    // 读数
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = PALETTE.dim;
    ctx.font = '11px ui-monospace, Menlo, monospace';
    ctx.fillText('X 0.24 MS/DIV', 14, H - 16);
    ctx.fillText('Y 0.5 V/DIV', 14, H - 32);
    ctx.restore();
  }

  if (reduceMotion) {
    // 静态图样：绘制一条固定相位的曲线
    const cx = W / 2;
    const cy = H / 2;
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = PALETTE.cyan;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 12; i += 1) {
      const x = (i / 12) * W;
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, H);
    }
    for (let i = 0; i <= 9; i += 1) {
      const y = (i / 9) * H;
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
    }
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = PALETTE.cyan;
    ctx.lineWidth = 2;
    ctx.shadowColor = PALETTE.cyan;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    for (let i = 0; i <= 240; i += 1) {
      const u = (i / 240) * Math.PI * 2 * 2;
      const x = cx + Math.sin(3 * u) * W * 0.33;
      const y = cy + Math.sin(2 * u) * H * 0.31;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
    return { stop() {} };
  }

  const loop = new Loop((dt) => {}, (alpha, dt) => draw(dt), 1 / 60, 4);
  loop.start();
  return loop;
}

/* ---------------------------------------------------------------
 * 展品 08-A 预览：一颗拖着余辉的光点
 * ------------------------------------------------------------- */
export function mountRallyPreview(canvas) {
  const W = 480;
  const H = 270;
  const surface = createSurface(canvas, W, H);
  const ctx = surface.ctx;

  const ball = { x: 90, y: 90, vx: 118, vy: 96 };
  const left = { y: 135 };
  const right = { y: 135 };
  const trail = [];
  let t = 0;

  function draw(dt) {
    t += dt;
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(0, 0, W, H);

    // 场边
    ctx.save();
    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    ctx.strokeRect(20.5, 18.5, W - 41, H - 37);
    ctx.setLineDash([5, 7]);
    ctx.strokeStyle = PALETTE.cyanDim;
    ctx.beginPath();
    ctx.moveTo(W / 2, 18);
    ctx.lineTo(W / 2, H - 18);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // AI 追球
    right.y += clamp(ball.y - right.y, -1, 1) * 1.9;

    // 反弹
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.y < 26 || ball.y > H - 26) ball.vy *= -1;
    if (ball.x < 34) {
      ball.vx = Math.abs(ball.vx);
      ball.y = left.y;
    }
    if (ball.x > W - 34) {
      ball.vx = -Math.abs(ball.vx);
      ball.y = right.y;
    }
    ball.x = clamp(ball.x, 30, W - 30);
    ball.y = clamp(ball.y, 26, H - 26);

    trail.push({ x: ball.x, y: ball.y });
    if (trail.length > 16) trail.shift();

    for (let i = 0; i < trail.length; i += 1) {
      const k = i / trail.length;
      glowDot(ctx, trail[i].x, trail[i].y, 1 + k * 3.4, PALETTE.cyan, k * k * 0.6, 2.4);
    }

    // 辉板
    const blades = [
      { x: 34, y: left.y, c: PALETTE.cyan },
      { x: W - 34, y: right.y, c: PALETTE.rose },
    ];
    for (const b of blades) {
      ctx.save();
      ctx.shadowColor = b.c;
      ctx.shadowBlur = 14;
      ctx.fillStyle = b.c;
      roundRect(ctx, b.x - 3, b.y - 22, 6, 44, 3);
      ctx.fill();
      ctx.restore();
    }

    glowDot(ctx, ball.x, ball.y, 5.4, '#ffffff', 1, 3.4);
  }

  if (reduceMotion) {
    draw(0);
    return { stop() {} };
  }
  const loop = new Loop((dt) => {}, (alpha, dt) => draw(dt), 1 / 60, 4);
  loop.start();
  return loop;
}

/* ---------------------------------------------------------------
 * 展品 08-B 预览：绕核飞行并留下光迹
 * ------------------------------------------------------------- */
export function mountGravityPreview(canvas) {
  const W = 480;
  const H = 270;
  const surface = createSurface(canvas, W, H);
  const ctx = surface.ctx;

  const cx = W / 2;
  const cy = H / 2;
  const coreR = 15;
  const craft = [
    { a: 0.4, r: 96, va: 0.42, c: PALETTE.cyan, trail: [] },
    { a: 3.5, r: 112, va: -0.34, c: PALETTE.rose, trail: [] },
  ];
  let t = 0;

  function draw(dt) {
    t += dt;
    ctx.fillStyle = PALETTE.void;
    ctx.fillRect(0, 0, W, H);

    // 轨道参考
    ctx.save();
    ctx.strokeStyle = PALETTE.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, 96, 0, Math.PI * 2);
    ctx.moveTo(cx + 112, cy);
    ctx.arc(cx, cy, 112, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 核心
    const pulse = 1 + Math.sin(t * 2.2) * 0.07;
    const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, 34 * pulse);
    g.addColorStop(0, '#fff6e4');
    g.addColorStop(0.4, PALETTE.amber);
    g.addColorStop(1, 'rgba(255,180,92,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, 34 * pulse, 0, Math.PI * 2);
    ctx.fill();

    for (const c of craft) {
      c.a += c.va * dt;
      const x = cx + Math.cos(c.a) * c.r;
      const y = cy + Math.sin(c.a) * c.r;
      c.trail.push({ x, y });
      if (c.trail.length > 46) c.trail.shift();

      for (let i = 1; i < c.trail.length; i += 1) {
        const k = i / c.trail.length;
        ctx.save();
        ctx.globalAlpha = 0.05 + k * k * 0.5;
        ctx.strokeStyle = c.c;
        ctx.lineWidth = 0.6 + k * 2.6;
        ctx.shadowColor = c.c;
        ctx.shadowBlur = 7 * k;
        ctx.beginPath();
        ctx.moveTo(c.trail[i - 1].x, c.trail[i - 1].y);
        ctx.lineTo(c.trail[i].x, c.trail[i].y);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(c.a + Math.PI / 2);
      ctx.shadowColor = c.c;
      ctx.shadowBlur = 10;
      ctx.fillStyle = c.c;
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-5, 4.4);
      ctx.lineTo(-2.6, 0);
      ctx.lineTo(-5, -4.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  if (reduceMotion) {
    draw(0);
    return { stop() {} };
  }
  const loop = new Loop((dt) => {}, (alpha, dt) => draw(dt), 1 / 60, 4);
  loop.start();
  return loop;
}

export { reduceMotion };
