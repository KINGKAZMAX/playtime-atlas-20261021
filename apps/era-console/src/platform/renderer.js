/**
 * 10-era-console — 色块远征 / CHROMA VOYAGE
 * 世界渲染器：天空、视差远景、瓦片层、实体层
 *
 * 内部分辨率固定 320×240（4:3），整体整数倍放大到容器，
 * 配合 image-rendering: pixelated 保持锐利像素。
 */

import { TILE } from './physics.js';
import { bakeTiles, drawGate, bakeAllSprites } from './sprites.js';
import { drawPixelText } from '../ui/pixelFont.js';

export const VIEW_W = 320;
export const VIEW_H = 240;

/** 用确定性正弦叠加生成远山剪影 */
function makeRidge(width, height, baseY, amp, freq, color, seedShift = 0) {
  const cv = document.createElement('canvas');
  cv.width = width;
  cv.height = height;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width; x++) {
    const y =
      baseY +
      Math.sin((x + seedShift) * freq) * amp +
      Math.sin((x + seedShift) * freq * 2.7) * amp * 0.35;
    ctx.lineTo(x, Math.round(y));
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
  return cv;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    canvas.width = VIEW_W;
    canvas.height = VIEW_H;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.sprites = bakeAllSprites();
    this.tiles = new Map();      // themeId -> tiles
    this.ridges = new Map();     // themeId -> [layer canvases]
  }

  _themeAssets(theme) {
    if (!this.tiles.has(theme.name)) {
      this.tiles.set(theme.name, bakeTiles(theme));
    }
    if (!this.ridges.has(theme.name)) {
      const w = 512;
      const layers = [
        makeRidge(w, 120, 74, 16, 0.013, theme.far, 0),
        makeRidge(w, 120, 88, 20, 0.021, theme.mid, 140),
        makeRidge(w, 120, 104, 12, 0.034, theme.near, 320),
      ];
      this.ridges.set(theme.name, layers);
    }
    return {
      tiles: this.tiles.get(theme.name),
      ridges: this.ridges.get(theme.name),
    };
  }

  /**
   * @param {object} level 已构建的关卡
   * @param {object} state  { cameraX, frame, player, enemies, movers, shards, checkpoints, goal, particles, time }
   */
  render(level, state) {
    const ctx = this.ctx;
    const theme = level.theme;
    const { tiles, ridges } = this._themeAssets(theme);
    const camX = Math.round(state.cameraX);

    // ---------- 天空 ----------
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, theme.skyTop);
    sky.addColorStop(0.55, theme.skyMid);
    sky.addColorStop(1, theme.skyBot);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // ---------- 视差远景 ----------
    const speeds = [0.12, 0.26, 0.45];
    ridges.forEach((layer, i) => {
      const off = -((camX * speeds[i]) % layer.width);
      const y = VIEW_H - 150 + i * 6;
      for (let x = off - layer.width; x < VIEW_W + layer.width; x += layer.width) {
        ctx.drawImage(layer, Math.round(x), y);
      }
    });

    // ---------- 瓦片层 ----------
    const startTx = Math.max(0, Math.floor(camX / TILE) - 1);
    const endTx = Math.min(level.width - 1, Math.floor((camX + VIEW_W) / TILE) + 1);
    const liquidFrame = Math.floor(state.frame / 18) % 2;

    for (let ty = 0; ty < level.height; ty++) {
      for (let tx = startTx; tx <= endTx; tx++) {
        const ch = level.grid[ty * level.width + tx];
        if (ch === '.') continue;
        const sx = tx * TILE - camX;
        const sy = ty * TILE;
        if (ch === '#') {
          // 顶部判定：上方为空则为地表
          const above = ty > 0 ? level.grid[(ty - 1) * level.width + tx] : '.';
          ctx.drawImage(above === '.' ? tiles.top : tiles.fill, sx, sy);
        } else if (ch === '=') {
          ctx.drawImage(tiles.oneway, sx, sy);
        } else if (ch === '^') {
          ctx.drawImage(tiles.spike, sx, sy);
        } else if (ch === '~') {
          ctx.drawImage(tiles.liquid[liquidFrame], sx, sy);
        }
      }
    }

    // ---------- 移动平台 ----------
    for (const m of state.movers) {
      ctx.drawImage(tiles.mover, Math.round(m.x - camX), Math.round(m.y));
    }

    // ---------- 检查点 ----------
    for (const cp of state.checkpoints) {
      const img = cp.activated ? this.sprites.anchor.on : this.sprites.anchor.idle;
      const bob = cp.activated ? Math.round(Math.sin(state.frame * 0.08) * 1) : 0;
      ctx.drawImage(img, Math.round(cp.x - camX), Math.round(cp.y + bob));
      if (cp.activated) {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = theme.accent;
        ctx.fillRect(Math.round(cp.x - camX) - 2, Math.round(cp.y + bob) - 3, 12, 2);
        ctx.globalAlpha = 1;
      }
    }

    // ---------- 收集物 ----------
    for (const s of state.shards) {
      if (s.collected) continue;
      const f = Math.floor(state.frame / 8) % 3;
      const img = this.sprites.shard[f];
      const float = Math.round(Math.sin(state.frame * 0.09 + s.tx) * 2);
      const sx = Math.round(s.x - camX);
      const sy = Math.round(s.y + float);
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = theme.accent;
      ctx.fillRect(sx - 2, sy - 1, 12, 10);
      ctx.globalAlpha = 1;
      ctx.drawImage(img, sx, sy);
    }

    // ---------- 目标闸门 ----------
    drawGate(ctx, Math.round(state.goal.x - camX), state.goal.y, state.goal.open, state.frame);

    // ---------- 敌人 ----------
    for (const e of state.enemies) {
      if (e.dead) continue;
      const img = e.type === 'cusp'
        ? this.sprites.cusp[Math.floor(state.frame / 12) % 2]
        : this.sprites.wisp[Math.floor(state.frame / 9) % 2];
      const sx = Math.round(e.x - camX);
      const sy = Math.round(e.y + (e.type === 'wisp' ? Math.sin(state.frame * 0.12 + e.homeX) * 2 : 0));
      ctx.drawImage(img, sx, sy);
    }

    // ---------- 玩家 ----------
    const p = state.player;
    const pimg = this.sprites.hero[p.sprite || 'idle'];
    ctx.drawImage(pimg, Math.round(p.x - camX), Math.round(p.y));

    // ---------- 粒子 ----------
    for (const pt of state.particles) {
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x - camX), Math.round(pt.y), pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    // ---------- 画面暗角 + 扫描线（16bit CRT 质感） ----------
    this._drawVignette();
    this._drawScanlines();
  }

  _drawVignette() {
    const ctx = this.ctx;
    if (!this._vignette) {
      const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.32, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.86);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.34)');
      this._vignette = g;
    }
    ctx.fillStyle = this._vignette;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  _drawScanlines() {
    const ctx = this.ctx;
    if (!this._scan) {
      const cv = document.createElement('canvas');
      cv.width = 1;
      cv.height = 4;
      const c = cv.getContext('2d');
      c.fillStyle = 'rgba(0,0,0,0.16)';
      c.fillRect(0, 0, 1, 1);
      this._scan = ctx.createPattern(cv, 'repeat');
    }
    ctx.fillStyle = this._scan;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  /** 横幅式提示（关卡开场 / 通关） */
  drawBanner(title, subtitle, color) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(16,16,24,0.78)';
    ctx.fillRect(0, VIEW_H / 2 - 26, VIEW_W, 52);
    ctx.fillStyle = color;
    ctx.fillRect(0, VIEW_H / 2 - 26, VIEW_W, 1);
    ctx.fillRect(0, VIEW_H / 2 + 25, VIEW_W, 1);
    drawPixelText(ctx, title, VIEW_W / 2, VIEW_H / 2 - 20, {
      scale: 2, align: 'center', color: '#f4efe4', shadow: '#101018',
    });
    if (subtitle) {
      drawPixelText(ctx, subtitle, VIEW_W / 2, VIEW_H / 2 + 2, {
        scale: 1, align: 'center', color,
      });
    }
  }
}
