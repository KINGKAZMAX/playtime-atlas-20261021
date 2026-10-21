/**
 * heroCanvas.ts — 展厅头部的程序化装饰画面。
 *
 * 画面内容：暮色海平线上的点阵灯塔（呼应展项 A 的灯塔），
 * 灯塔光束扫过时，空中浮起代表"连接"的节点与连线。
 * 全部为程序化绘制，不使用任何位图素材。
 */

import { POCKET, SHELL, withAlpha } from '../core/palette';

const W = 240;
const H = 116;

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  seed: number;
}

export function createHeroCanvas(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => undefined;

  const dpr = Math.min(2.5, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.aspectRatio = `${W} / ${H}`;

  const nodes: Node[] = [];
  for (let i = 0; i < 26; i++) {
    nodes.push({
      x: Math.random() * W,
      y: 8 + Math.random() * (H - 46),
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 3,
      r: 0.6 + Math.random() * 1.2,
      seed: Math.random() * 100,
    });
  }

  const lx = 46;
  const ly = H - 30;

  const draw = (t: number): void => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // 天空渐变
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0a0f20');
    sky.addColorStop(0.6, '#16203c');
    sky.addColorStop(1, '#0b1122');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // 远景星点
    for (let i = 0; i < 40; i++) {
      const sx = (i * 61.7) % W;
      const sy = (i * 37.3) % 52;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + i));
      ctx.fillStyle = withAlpha('#a5ecff', 0.18 + tw * 0.35);
      ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
    }

    // 节点与连线
    const sweep = (t * 0.55) % (Math.PI * 2);
    for (const n of nodes) {
      n.x += n.vx * 0.016;
      n.y += n.vy * 0.016;
      if (n.x < -6) n.x = W + 6;
      if (n.x > W + 6) n.x = -6;
      if (n.y < 4) n.y = H - 44;
      if (n.y > H - 44) n.y = 4;

      // 与灯塔光束的夹角决定亮度
      const ang = Math.atan2(n.y - ly, n.x - lx);
      let diff = Math.abs(((ang - sweep + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      const lit = Math.max(0, 1 - diff / 0.8);

      ctx.fillStyle = withAlpha(lit > 0.25 ? SHELL.dawn : SHELL.data, 0.25 + lit * 0.7);
      ctx.fillRect(n.x - n.r / 2, n.y - n.r / 2, n.r, n.r);
    }
    // 近邻连线
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i]!;
        const b = nodes[j]!;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 30) {
          ctx.strokeStyle = withAlpha(SHELL.data, (1 - d / 30) * 0.22);
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // 海面
    const sea = ctx.createLinearGradient(0, H - 30, 0, H);
    sea.addColorStop(0, '#16243f');
    sea.addColorStop(1, '#070b16');
    ctx.fillStyle = sea;
    ctx.fillRect(0, H - 30, W, 30);
    for (let i = 0; i < 9; i++) {
      const wy = H - 29 + i * 3.2;
      const off = Math.sin(t * 1.1 + i * 0.7) * 10;
      ctx.fillStyle = withAlpha(SHELL.data, 0.05 + i * 0.008);
      ctx.fillRect((off + 40) % (W + 40) - 20, wy, 26 + i * 5, 1);
    }

    // 光束
    ctx.save();
    ctx.translate(lx, ly - 26);
    ctx.rotate(sweep);
    const beam = ctx.createLinearGradient(0, 0, 190, 0);
    beam.addColorStop(0, withAlpha(SHELL.dawn, 0.34));
    beam.addColorStop(1, withAlpha(SHELL.dawn, 0));
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(190, -34);
    ctx.lineTo(190, 34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 灯塔
    ctx.fillStyle = '#101828';
    ctx.beginPath();
    ctx.moveTo(lx - 6, ly);
    ctx.lineTo(lx - 4, ly - 24);
    ctx.lineTo(lx + 4, ly - 24);
    ctx.lineTo(lx + 6, ly);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = withAlpha(SHELL.dawn, 0.9);
    ctx.fillRect(lx - 5, ly - 30, 10, 6);
    ctx.fillStyle = withAlpha(SHELL.dawn, 0.22);
    ctx.beginPath();
    ctx.arc(lx, ly - 27, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = withAlpha(SHELL.dawnSoft, 0.85);
    ctx.fillRect(lx - 1, ly - 29, 2, 4);
  };

  let raf = 0;
  let last = performance.now();
  let visible = true;

  const tick = (now: number): void => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    draw(now / 1000);
    void dt;
  };
  raf = requestAnimationFrame(tick);

  // 滚出视口时停止绘制，避免整页持续占用 CPU / 影响截图稳定性
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) visible = e.isIntersecting;
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
  };
}

export const HERO_PALETTE = { ...SHELL, ...POCKET };
