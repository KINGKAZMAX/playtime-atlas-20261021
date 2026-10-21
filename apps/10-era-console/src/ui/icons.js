/**
 * 10-era-console — 程序化图标（运行时绘制，零外部图片）
 *
 * 每个图标都是抽象的示意图形，刻意避免还原任何具体商业机型的外观造型，
 * 只保留"类别特征"（卡带槽 / 光盘 / 线框多边形 / 芯片引脚 …）。
 */

const PALETTES = {
  mint: ['#5ee0b8', '#2f9d82', '#101018', '#f4efe4'],
  violet: ['#b48aff', '#7c5bc4', '#101018', '#f4efe4'],
  sun: ['#ffd166', '#d09a30', '#101018', '#f4efe4'],
  coral: ['#ff7a6b', '#c04a42', '#101018', '#f4efe4'],
  sky: ['#6aa9ff', '#3f6fc4', '#101018', '#f4efe4'],
};

/**
 * 绘制图标到 2D 上下文。
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} kind
 * @param {number} w
 * @param {number} h
 */
export function drawIcon(ctx, kind, w, h, tone = 'mint') {
  const [c1, c2, ink, paper] = PALETTES[tone] || PALETTES.mint;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(0, 0);

  const px = Math.max(1, Math.round(Math.min(w, h) / 14));
  const grid = (fn, cols, rows) => {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const c = fn(x, y);
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x * px, y * px, px, px);
      }
    }
  };

  switch (kind) {
    case 'console': {
      // 主机 + 手柄：抽象方盒与摇杆
      grid((x, y) => {
        if (y >= 2 && y <= 8 && x >= 1 && x <= 8) return x === 1 || x === 8 || y === 2 ? c1 : c2;
        if (y === 9 && x >= 2 && x <= 7) return ink;
        if (y === 10 && x >= 3 && x <= 6) return c2;
        if (y === 4 && x === 3) return ink;
        if (y === 5 && x === 3) return paper;
        if (y >= 5 && y <= 8 && x >= 10 && x <= 12) return y === 5 ? c1 : c2;
        if (y === 6 && x === 11) return ink;
        return null;
      }, 14, 12);
      break;
    }
    case 'handheld': {
      grid((x, y) => {
        if (y >= 1 && y <= 9 && x >= 3 && x <= 9) return x === 3 || x === 9 || y === 1 ? c1 : c2;
        if (y >= 3 && y <= 6 && x >= 4 && x <= 8) return ink;
        if (y === 4 && x >= 5 && x <= 7) return c1;
        if (y === 8 && x >= 5 && x <= 7) return paper;
        if (y >= 10 && y <= 11 && x >= 2 && x <= 4) return c2;
        if (y >= 10 && y <= 11 && x >= 8 && x <= 10) return c2;
        return null;
      }, 14, 12);
      break;
    }
    case 'disc': {
      // 光盘：同心环 + 中心孔
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.44;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = c2;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
      ctx.fillStyle = c1;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = c2;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.11, 0, Math.PI * 2);
      ctx.fillStyle = ink;
      ctx.fill();
      // 高光
      ctx.beginPath();
      ctx.arc(cx - r * 0.34, cy - r * 0.34, r * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();
      break;
    }
    case 'poly': {
      // 线框多面体
      const cx = w / 2;
      const cy = h / 2;
      const s = Math.min(w, h) * 0.38;
      const p = [
        [cx, cy - s], [cx + s, cy], [cx, cy + s], [cx - s, cy],
      ];
      const mid = [
        [cx, cy - s * 0.34], [cx + s * 0.5, cy], [cx, cy + s * 0.34], [cx - s * 0.5, cy],
      ];
      ctx.strokeStyle = c1;
      ctx.lineWidth = Math.max(1, px * 0.6);
      ctx.beginPath();
      p.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      mid.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = c2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(p[i][0], p[i][1]);
        ctx.lineTo(mid[(i + 1) % 4][0], mid[(i + 1) % 4][1]);
        ctx.stroke();
      }
      break;
    }
    case 'chip': {
      // 芯片：引脚 + 核心
      grid((x, y) => {
        const inCore = x >= 3 && x <= 10 && y >= 3 && y <= 10;
        const pinRow = (y === 1 || y === 12) && x >= 4 && x <= 9;
        const pinCol = (x === 1 || x === 12) && y >= 4 && y <= 9;
        if (inCore) return x === 3 || y === 3 ? c1 : c2;
        if (pinRow || pinCol) return ink;
        return null;
      }, 14, 14);
      break;
    }
    case 'ruler': {
      grid((x, y) => {
        if (y >= 1 && y <= 12 && x >= 4 && x <= 9) return c2;
        if (x === 4 && y % 3 === 1) return ink;
        if (x === 5 && y % 3 === 2) return ink;
        if (x === 6 && y % 3 === 0) return c1;
        if (y === 0 && x >= 4 && x <= 6) return c1;
        return null;
      }, 14, 14);
      break;
    }
    case 'cartridge': {
      grid((x, y) => {
        if (y >= 2 && y <= 11 && x >= 2 && x <= 11) {
          if (y === 2) return c1;
          if (x === 2 || x === 11) return c2;
          if (y === 9 || y === 10) return ink;
          if (y >= 4 && y <= 7 && x >= 4 && x <= 9) return y === 4 ? paper : ink;
          return c2;
        }
        if (y === 0 && x >= 4 && x <= 9) return ink;
        return null;
      }, 14, 13);
      break;
    }
    case 'visor': {
      grid((x, y) => {
        if (y >= 3 && y <= 8 && x >= 1 && x <= 12) return x <= 5 ? c2 : c2;
        if (y === 4 && (x === 3 || x === 4 || x === 9 || x === 10)) return c1;
        if (y === 5 && (x === 3 || x === 4 || x === 9 || x === 10)) return c1;
        if (y >= 9 && y <= 11 && x >= 5 && x <= 8) return ink;
        if (y === 2 && x >= 4 && x <= 9) return ink;
        return null;
      }, 14, 12);
      break;
    }
    case 'monitor': {
      grid((x, y) => {
        if (y >= 1 && y <= 8 && x >= 1 && x <= 12) {
          if (x === 1 || x === 12 || y === 1) return c1;
          if (y >= 3 && y <= 6 && x >= 3 && x <= 10) return ink;
          return c2;
        }
        if (y === 9 && x >= 5 && x <= 8) return c2;
        if (y === 10 && x >= 3 && x <= 10) return c1;
        return null;
      }, 14, 11);
      break;
    }
    default: {
      grid((x, y) => (x + y) % 2 === 0 ? c1 : c2, 14, 14);
      break;
    }
  }
  ctx.restore();
}

/** 生成一个可直接插入 DOM 的图标 canvas */
export function iconCanvas(kind, w, h, tone = 'mint') {
  const cv = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = w * dpr;
  cv.height = h * dpr;
  cv.style.width = `${w}px`;
  cv.style.height = `${h}px`;
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  drawIcon(ctx, kind, w, h, tone);
  return cv;
}

/** 依类别挑选色调 */
export function toneForCategory(cat) {
  return { hardware: 'mint', medium: 'sky', technique: 'violet', culture: 'sun' }[cat] || 'mint';
}
