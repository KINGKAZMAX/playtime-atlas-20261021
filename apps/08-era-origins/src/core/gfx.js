/**
 * 画面基础库 —— 调色板、HiDPI 画布、发光绘制。
 *
 * 视觉方向（原创）：深靛底 + 青/琥珀双色磷光 + 玫瑰警示色。
 * 刻意避开「纯黑底绿字」的单色 CRT 套路，也避开像素点阵风，
 * 走「示波器辉光 + 仪器面板」的路子。
 */

export const PALETTE = {
  void: '#04060d',
  deep: '#080d1c',
  panel: '#0d1430',
  panel2: '#111a3c',
  line: '#1c2a54',
  line2: '#2a3c70',
  cyan: '#5ce1e6',
  cyanDim: '#2b7d86',
  amber: '#ffb45c',
  amberDim: '#a8713a',
  rose: '#ff5d8f',
  roseDim: '#a83a5c',
  bone: '#e9eff8',
  slate: '#8595b4',
  dim: '#3f4c72',
};

/**
 * 创建一块 HiDPI 画布，返回逻辑坐标系下的 2D 上下文。
 * 逻辑尺寸固定（960x540），CSS 负责缩放，缩放由 ctx.setTransform 处理。
 */
export function createSurface(canvas, logicalW = 960, logicalH = 540) {
  const ctx = canvas.getContext('2d', { alpha: false });
  const surface = { canvas, ctx, logicalW, logicalH, dpr: 1 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    surface.dpr = dpr;
    ctx.setTransform(w / logicalW, 0, 0, h / logicalH, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  window.addEventListener('resize', resize, { passive: true });
  surface.resize = resize;
  surface.dispose = () => {
    ro.disconnect();
    window.removeEventListener('resize', resize);
  };
  return surface;
}

/** 圆角矩形路径。 */
export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** 带外发光的实心圆。 */
export function glowDot(ctx, x, y, r, color, alpha = 1, glow = 3) {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (glow > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = r * glow;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 发光线条。 */
export function glowLine(ctx, x1, y1, x2, y2, color, width = 2, alpha = 1, blur = 8) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  if (blur > 0) {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
  }
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/** 背景：深靛渐变 + 细网格 + 暗角。 */
export function drawBackdrop(ctx, w, h, accent = PALETTE.cyan, opts = {}) {
  const { grid = 48, vignette = true } = opts;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, PALETTE.deep);
  g.addColorStop(0.55, PALETTE.void);
  g.addColorStop(1, '#02040a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = 0.055;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += grid) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = 0; y <= h; y += grid) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();
  ctx.restore();

  if (vignette) {
    const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.32, w / 2, h / 2, h * 0.95);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
}

/** 扫描线纹理（极轻，避免干扰读数）。 */
export function drawScanlines(ctx, w, h, alpha = 0.055) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#000';
  for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
  ctx.restore();
}

/** 文本：等宽字体 + 字距。 */
export function label(ctx, text, x, y, opts = {}) {
  const {
    size = 14,
    color = PALETTE.slate,
    align = 'left',
    baseline = 'middle',
    weight = 500,
    track = 1.6,
    alpha = 1,
    mono = true,
  } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = baseline;
  ctx.font = `${weight} ${size}px ${mono ? 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' : 'system-ui, -apple-system, "Segoe UI", sans-serif'}`;
  const chars = [...text];
  let total = 0;
  for (const ch of chars) total += ctx.measureText(ch).width + track;
  total -= track;
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  for (const ch of chars) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + track;
  }
  ctx.restore();
  return total;
}

/** 宽度测量（与 label 对齐）。 */
export function measure(ctx, text, size = 14, track = 1.6, weight = 500) {
  ctx.save();
  ctx.font = `${weight} ${size}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
  let total = 0;
  for (const ch of [...text]) total += ctx.measureText(ch).width + track;
  ctx.restore();
  return Math.max(0, total - track);
}

/** 把 #rrggbb 颜色压暗，用于渐变端点。 */
export function dimFor(color, factor = 0.42) {
  if (typeof color !== 'string' || !color.startsWith('#')) return color;
  const hex = color.slice(1);
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `rgb(${cl(r)}, ${cl(g)}, ${cl(b)})`;
}

/** 面板边框：细线 + 四角刻度，仪器面板质感。 */
export function instrumentFrame(ctx, x, y, w, h, color = PALETTE.line2, notch = 10) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  ctx.beginPath();
  const corners = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.moveTo(cx + dx * notch, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * notch);
  }
  ctx.stroke();
  ctx.restore();
}
