/**
 * 10-era-console — 等距测绘所
 * 等距场景渲染与交互
 *
 * 渲染策略：
 *  - 2:1 等距投影，瓦片按深度 (gx+gy) 递增绘制（画家算法）
 *  - 每种地形预烘焙「顶面 / 左壁 / 右壁」贴图，运行时只做 drawImage，保证流畅
 *  - 水面单独动态绘制（波纹动画）
 *  - 展品为程序化绘制的等距小物件，按深度与地形交错绘制
 *  - 支持昼夜切换、拖拽平移、滚轮缩放、键盘与触屏操作
 */

import {
  generateTerrain,
  gridToScreen,
  terrainBounds,
  TILE_W,
  TILE_H,
  Z_H,
  TERRAIN_TYPES,
} from './terrain.js';
import { placeHotspots } from './hotspots.js';
import { EXHIBIT_BY_ID } from '../data/exhibits.js';

const PALETTE = {
  [TERRAIN_TYPES.WATER]: { top: '#2f6fb8', topHi: '#6fb8f0', wall: '#1d4a80', wallHi: '#2b6099' },
  [TERRAIN_TYPES.SHORE]: { top: '#d9c08a', topHi: '#f0dcab', wall: '#a98d5d', wallHi: '#c7a877' },
  [TERRAIN_TYPES.GRASS]: { top: '#4fb87a', topHi: '#77d69c', wall: '#2f7d52', wallHi: '#3f9a66' },
  [TERRAIN_TYPES.ROCK]: { top: '#6a6480', topHi: '#8e87a8', wall: '#464159', wallHi: '#5b5573' },
  [TERRAIN_TYPES.PRISM]: { top: '#9a6ad0', topHi: '#c79af0', wall: '#6a4399', wallHi: '#8457b8' },
};

const SKY = {
  day: { top: '#7fc6f0', mid: '#bfe4f8', bot: '#ffe9c4', sun: '#fff3c4' },
  night: { top: '#151233', mid: '#2b2352', bot: '#4a2c55', sun: '#c9d8ff' },
};

function makeCanvas(w, h) {
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.ceil(w));
  cv.height = Math.max(1, Math.ceil(h));
  return cv;
}

/** 烘焙某地形的顶面（菱形） */
function bakeTop(color, hi, variant) {
  const cv = makeCanvas(TILE_W, TILE_H);
  const c = cv.getContext('2d');
  c.beginPath();
  c.moveTo(TILE_W / 2, 0);
  c.lineTo(TILE_W, TILE_H / 2);
  c.lineTo(TILE_W / 2, TILE_H);
  c.lineTo(0, TILE_H / 2);
  c.closePath();
  c.fillStyle = color;
  c.fill();

  // 顶部高光边
  c.beginPath();
  c.moveTo(TILE_W / 2, 0);
  c.lineTo(TILE_W, TILE_H / 2);
  c.lineTo(TILE_W / 2, TILE_H);
  c.lineTo(0, TILE_H / 2);
  c.closePath();
  c.strokeStyle = hi;
  c.globalAlpha = 0.5;
  c.lineWidth = 1;
  c.stroke();
  c.globalAlpha = 1;

  // 确定性噪点，避免大面积平涂
  const seed = variant * 7919;
  c.fillStyle = hi;
  c.globalAlpha = 0.16;
  for (let i = 0; i < 5; i++) {
    const s = (seed + i * 104729) % 9973;
    const x = TILE_W / 2 + ((s % 28) - 14) * 0.9;
    const y = TILE_H / 2 + (((s >> 5) % 14) - 7) * 0.5;
    c.fillRect(Math.round(x), Math.round(y), 2, 1);
  }
  c.globalAlpha = 1;
  return cv;
}

/** 烘焙左侧壁（西南向），高度 4 级 */
function bakeLeftWall(color, hi) {
  const H = Z_H * 4;
  const cv = makeCanvas(TILE_W / 2, TILE_H / 2 + H);
  const c = cv.getContext('2d');
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(TILE_W / 2, TILE_H / 2);
  c.lineTo(TILE_W / 2, TILE_H / 2 + H);
  c.lineTo(0, H);
  c.closePath();
  c.fillStyle = color;
  c.fill();
  c.fillStyle = hi;
  c.globalAlpha = 0.35;
  c.fillRect(0, 0, 1.5, H);
  c.globalAlpha = 1;
  return cv;
}

/** 烘焙右侧壁（东南向） */
function bakeRightWall(color, hi) {
  const H = Z_H * 4;
  const cv = makeCanvas(TILE_W / 2, TILE_H / 2 + H);
  const c = cv.getContext('2d');
  c.beginPath();
  c.moveTo(0, TILE_H / 2);
  c.lineTo(TILE_W / 2, 0);
  c.lineTo(TILE_W / 2, H);
  c.lineTo(0, TILE_H / 2 + H);
  c.closePath();
  c.fillStyle = color;
  c.fill();
  c.fillStyle = hi;
  c.globalAlpha = 0.22;
  c.fillRect(TILE_W / 2 - 1.5, 0, 1.5, H);
  c.globalAlpha = 1;
  return cv;
}

export class IsoScene {
  /**
   * @param {object} deps { canvas, audio, onSelect(hotspot), onHover(hotspot) }
   */
  constructor(deps) {
    this.canvas = deps.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.audio = deps.audio || null;
    this.onSelect = deps.onSelect || (() => {});
    this.onHover = deps.onHover || (() => {});

    this.terrain = generateTerrain(20261021, 30, 22);
    this.hotspots = placeHotspots(this.terrain);
    this.bounds = terrainBounds(this.terrain);

    this.camera = { x: 0, y: 0, zoom: 1 };
    this.target = { x: 0, y: 0, zoom: 1 };
    this.selected = null;
    this.hovered = null;
    this.night = false;
    this.time = 0;
    this.running = false;
    this.rafId = 0;
    this._dragging = false;
    this._dragStart = null;
    this._lastPointer = null;
    this._pointerMoved = false;

    this.tiles = this._bakeTiles();

    this._loop = this._loop.bind(this);
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }

  _bakeTiles() {
    const out = {};
    for (const [type, colors] of Object.entries(PALETTE)) {
      out[type] = {
        top: [bakeTop(colors.top, colors.topHi, 0), bakeTop(colors.top, colors.topHi, 1)],
        left: bakeLeftWall(colors.wall, colors.wallHi),
        right: bakeRightWall(colors.wall, colors.wallHi),
      };
    }
    return out;
  }

  /* ---------------------------------------------------------------- *
   * 生命周期
   * ---------------------------------------------------------------- */

  mount() {
    this.running = true;
    this._onResize();
    this._centerOnYard();
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this._loop);
  }

  unmount() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    window.removeEventListener('resize', this._onResize);
    this._detachPointer();
  }

  _onResize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(320, Math.round(rect.width));
    const h = Math.max(240, Math.round(rect.height));
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.cssWidth = w;
    this.cssHeight = h;
    this.dpr = dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _loop(now) {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this._loop);
    const dt = Math.min(64, now - this.lastTime);
    this.lastTime = now;
    this.time += dt / 1000;
    this._updateCamera();
    this.render();
  }

  /* ---------------------------------------------------------------- *
   * 相机
   * ---------------------------------------------------------------- */

  _centerOnYard() {
    let sx = 0;
    let sy = 0;
    for (const h of this.hotspots) {
      const p = gridToScreen(h.tx, h.ty, h.height);
      sx += p.x;
      sy += p.y;
    }
    sx /= this.hotspots.length;
    sy /= this.hotspots.length;
    this.target.x = -sx;
    this.target.y = -sy + 40;
    this.target.zoom = 1;
    this.camera = { ...this.target };
  }

  _updateCamera() {
    const k = 0.16;
    this.camera.x += (this.target.x - this.camera.x) * k;
    this.camera.y += (this.target.y - this.camera.y) * k;
    this.camera.zoom += (this.target.zoom - this.camera.zoom) * k;
  }

  _clampTarget() {
    const z = this.target.zoom;
    const w = this.bounds.width * z;
    const h = this.bounds.height * z;
    const viewW = this.cssWidth;
    const viewH = this.cssHeight;
    // 相机目标表示"世界原点在屏幕上的位置"
    const minX = viewW - this.bounds.maxX * z - 40;
    const maxX = -this.bounds.minX * z + 40;
    const minY = viewH - this.bounds.maxY * z - 20;
    const maxY = -this.bounds.minY * z + 20;
    this.target.x = Math.min(Math.max(this.target.x, Math.min(minX, maxX)), Math.max(minX, maxX));
    this.target.y = Math.min(Math.max(this.target.y, Math.min(minY, maxY)), Math.max(minY, maxY));
    if (w < viewW) this.target.x = (viewW - w) / 2 - this.bounds.minX * z;
    if (h < viewH) this.target.y = (viewH - h) / 2 - this.bounds.minY * z;
  }

  panBy(dx, dy) {
    this.target.x += dx;
    this.target.y += dy;
    this._clampTarget();
  }

  zoomBy(delta, anchor) {
    const prev = this.target.zoom;
    const next = Math.min(2.4, Math.max(0.55, prev * (delta > 0 ? 0.88 : 1.14)));
    if (Math.abs(next - prev) < 0.001) return;
    if (anchor) {
      const wx = (anchor.x - this.target.x) / prev;
      const wy = (anchor.y - this.target.y) / prev;
      this.target.zoom = next;
      this.target.x = anchor.x - wx * next;
      this.target.y = anchor.y - wy * next;
    } else {
      this.target.zoom = next;
    }
    this._clampTarget();
  }

  focusHotspot(id) {
    const h = this.hotspots.find((x) => x.id === id);
    if (!h) return;
    const p = gridToScreen(h.tx, h.ty, h.height);
    this.target.x = this.cssWidth / 2 - p.x * this.target.zoom;
    this.target.y = this.cssHeight / 2 - (p.y - 18) * this.target.zoom;
    this._clampTarget();
  }

  /* ---------------------------------------------------------------- *
   * 交互
   * ---------------------------------------------------------------- */

  attach() {
    this._attachPointer();
  }

  _attachPointer() {
    if (this._pointerAttached) return;
    this._pointerAttached = true;
    this.canvas.addEventListener('pointerdown', this._onPointerDown = (e) => {
      this.canvas.setPointerCapture?.(e.pointerId);
      this._dragging = true;
      this._pointerMoved = false;
      this._lastPointer = { x: e.clientX, y: e.clientY };
      this._dragStart = { x: e.clientX, y: e.clientY };
      this._downPos = { x: e.offsetX, y: e.offsetY };
    });
    this.canvas.addEventListener('pointermove', this._onPointerMove = (e) => {
      if (this._dragging && this._lastPointer) {
        const dx = e.clientX - this._lastPointer.x;
        const dy = e.clientY - this._lastPointer.y;
        if (Math.abs(e.clientX - this._dragStart.x) + Math.abs(e.clientY - this._dragStart.y) > 6) {
          this._pointerMoved = true;
        }
        this.panBy(-dx / this.target.zoom, -dy / this.target.zoom);
        this._lastPointer = { x: e.clientX, y: e.clientY };
      } else {
        const hit = this._hitTest(e.offsetX, e.offsetY);
        const changed = (hit && hit.id) !== (this.hovered && this.hovered.id);
        this.hovered = hit;
        this.canvas.style.cursor = hit ? 'pointer' : 'grab';
        if (changed) this.onHover(hit);
      }
    });
    const end = (e) => {
      if (!this._dragging) return;
      this._dragging = false;
      if (!this._pointerMoved) {
        const hit = this._hitTest(e.offsetX, e.offsetY);
        if (hit) this.selectHotspot(hit.id);
      }
      this._lastPointer = null;
    };
    this.canvas.addEventListener('pointerup', end);
    this.canvas.addEventListener('pointercancel', () => { this._dragging = false; this._lastPointer = null; });
    this.canvas.addEventListener('wheel', this._onWheel = (e) => {
      e.preventDefault();
      this.zoomBy(e.deltaY > 0 ? 1 : -1, { x: e.offsetX, y: e.offsetY });
    }, { passive: false });
    this.canvas.addEventListener('pointerleave', () => {
      if (this.hovered) {
        this.hovered = null;
        this.onHover(null);
      }
    });
  }

  _detachPointer() {
    this._pointerAttached = false;
  }

  selectHotspot(id) {
    const h = this.hotspots.find((x) => x.id === id);
    if (!h) return;
    this.selected = id;
    this.audio?.sfx('open');
    this.focusHotspot(id);
    this.onSelect(h);
  }

  /** 屏幕坐标 → 热点（用其包围盒做拾取） */
  _hitTest(sx, sy) {
    const z = this.camera.zoom;
    const wx = (sx - this.camera.x) / z;
    const wy = (sy - this.camera.y) / z;
    for (const h of this.hotspots) {
      const p = gridToScreen(h.tx, h.ty, h.height);
      const w = 30;
      const hh = 42;
      if (wx >= p.x - w / 2 && wx <= p.x + w / 2 && wy >= p.y - hh && wy <= p.y + 4) {
        return h;
      }
    }
    return null;
  }

  setNight(on) {
    this.night = on;
  }

  toggleNight() {
    this.setNight(!this.night);
    return this.night;
  }

  /* ---------------------------------------------------------------- *
   * 渲染
   * ---------------------------------------------------------------- */

  render() {
    const ctx = this.ctx;
    const W = this.cssWidth;
    const H = this.cssHeight;
    const z = this.camera.zoom;

    // ---- 天空 ----
    const sky = SKY[this.night ? 'night' : 'day'];
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, sky.top);
    g.addColorStop(0.58, sky.mid);
    g.addColorStop(1, sky.bot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // ---- 星星（夜间）----
    if (this.night) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 70; i++) {
        const sx = ((i * 97.13) % 100) / 100 * W;
        const sy = ((i * 53.71) % 62) / 100 * H;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(this.time * 1.4 + i));
        ctx.globalAlpha = tw * 0.85;
        ctx.fillRect(sx, sy, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;
    }

    // ---- 日/月 ----
    const sunX = W * 0.78;
    const sunY = H * 0.18;
    const sunG = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 90);
    sunG.addColorStop(0, sky.sun);
    sunG.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sunG;
    ctx.fillRect(sunX - 90, sunY - 90, 180, 180);

    // ---- 远景云带 ----
    ctx.fillStyle = this.night ? 'rgba(120,110,190,0.18)' : 'rgba(255,255,255,0.42)';
    for (let i = 0; i < 6; i++) {
      const cw = 120 + i * 34;
      const cx = ((this.time * (5 + i * 1.6) + i * 240) % (W + 400)) - 200;
      const cy = 26 + i * 22;
      ctx.beginPath();
      ctx.ellipse(cx, cy, cw / 2, 12 + i, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 世界变换 ----
    ctx.save();
    ctx.translate(this.camera.x, this.camera.y);
    ctx.scale(z, z);

    const t = this.terrain;
    const camLeft = (-this.camera.x) / z - TILE_W;
    const camRight = (this.cssWidth - this.camera.x) / z + TILE_W;
    const camTop = (-this.camera.y) / z - TILE_H * 2;
    const camBottom = (this.cssHeight - this.camera.y) / z + TILE_H * 2;

    // ---- 地形（按深度排序）----
    for (let d = 0; d < t.w + t.h; d++) {
      for (let gx = 0; gx < t.w; gx++) {
        const gy = d - gx;
        if (gy < 0 || gy >= t.h) continue;
        const p = gridToScreen(gx, gy, 0);
        if (p.x < camLeft - TILE_W || p.x > camRight + TILE_W) continue;
        if (p.y < camTop - TILE_H * 4 || p.y > camBottom + TILE_H * 4) continue;

        const level = t.heights[gy * t.w + gx];
        const type = level;
        const sprite = this.tiles[type];
        const variant = (gx * 7 + gy * 13) % 2;
        const h = level * Z_H;

        // 顶面
        ctx.drawImage(sprite.top[variant], p.x, p.y - h);

        // 左壁（当西南邻居更低）
        const leftLevel = gx > 0 ? t.heights[gy * t.w + (gx - 1)] : 0;
        const dropL = level - leftLevel;
        if (dropL > 0) {
          const wallH = Math.min(dropL, 4) * Z_H;
          ctx.drawImage(
            sprite.left,
            0, 0, TILE_W / 2, wallH,
            p.x, p.y - h + TILE_H / 2, TILE_W / 2, wallH
          );
        }
        // 右壁（当东南邻居更低）
        const rightLevel = gy < t.h - 1 ? t.heights[(gy + 1) * t.w + gx] : 0;
        const dropR = level - rightLevel;
        if (dropR > 0) {
          const wallH = Math.min(dropR, 4) * Z_H;
          ctx.drawImage(
            sprite.right,
            0, 0, TILE_W / 2, wallH,
            p.x + TILE_W / 2, p.y - h, TILE_W / 2, wallH
          );
        }

        // 水面动画
        if (type === TERRAIN_TYPES.WATER) {
          const phase = this.time * 1.6 + (gx + gy) * 0.7;
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.fillStyle = PALETTE[TERRAIN_TYPES.WATER].topHi;
          for (let k = 0; k < 3; k++) {
            const a = phase + k * 2.1 + gx * 0.9;
            const ox = Math.sin(a) * 6;
            const oy = Math.cos(a * 1.3) * 2;
            ctx.fillRect(p.x + TILE_W / 2 - 4 + ox, p.y - h + TILE_H / 2 + oy, 8, 1);
          }
          ctx.restore();
        }
      }
    }

    // ---- 展品（与地形同深度顺序）----
    const sorted = [...this.hotspots].sort((a, b) => (a.tx + a.ty) - (b.tx + b.ty));
    for (const spot of sorted) {
      const p = gridToScreen(spot.tx, spot.ty, spot.height);
      if (p.x < camLeft - 60 || p.x > camRight + 60) continue;
      this._drawHotspot(ctx, spot, p);
    }

    ctx.restore();

    // ---- 前景氛围 ----
    const vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.78);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, this.night ? 'rgba(4,4,16,0.55)' : 'rgba(16,16,24,0.28)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  _drawHotspot(ctx, spot, p) {
    const isSel = this.selected === spot.id;
    const isHov = this.hovered && this.hovered.id === spot.id;

    // 地面投影
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#101018';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 1, 13, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 物件
    this._drawObject(ctx, spot.kind, p.x, p.y);

    // 悬浮标记
    const bob = Math.sin(this.time * 2.4 + spot.tx) * 3;
    const my = p.y - 50 + bob;
    const accent = isSel ? '#ffd166' : isHov ? '#5ee0b8' : '#b48aff';

    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(p.x, my, 9 + Math.sin(this.time * 3 + spot.ty) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(p.x, my - 7);
    ctx.lineTo(p.x + 6, my);
    ctx.lineTo(p.x, my + 7);
    ctx.lineTo(p.x - 6, my);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#101018';
    ctx.beginPath();
    ctx.moveTo(p.x, my - 3.5);
    ctx.lineTo(p.x + 3, my);
    ctx.lineTo(p.x, my + 3.5);
    ctx.lineTo(p.x - 3, my);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 标签
    if (isSel || isHov) {
      ctx.save();
      ctx.font = '600 12px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = spot.label;
      const w = ctx.measureText(label).width + 14;
      const ly = my - 20;
      ctx.fillStyle = 'rgba(16,16,24,0.88)';
      ctx.beginPath();
      ctx.roundRect(p.x - w / 2, ly - 10, w, 20, 5);
      ctx.fill();
      ctx.fillStyle = accent;
      ctx.fillText(label, p.x, ly + 1);
      ctx.restore();
    }
  }

  /** 程序化绘制展品物件（原创图形，非任何商业模型的还原） */
  _drawObject(ctx, kind, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineJoin = 'round';

    const box = (bx, by, bw, bh, depth, top, left, right) => {
      // 等距立方体
      ctx.fillStyle = left;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + depth / 2, by + depth / 2);
      ctx.lineTo(bx + depth / 2, by + depth / 2 + bh);
      ctx.lineTo(bx, by + bh);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = right;
      ctx.beginPath();
      ctx.moveTo(bx + depth / 2, by + depth / 2);
      ctx.lineTo(bx + depth, by);
      ctx.lineTo(bx + depth, by + bh);
      ctx.lineTo(bx + depth / 2, by + depth / 2 + bh);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = top;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + depth / 2, by - depth / 2);
      ctx.lineTo(bx + depth, by);
      ctx.lineTo(bx + depth / 2, by + depth / 2);
      ctx.closePath();
      ctx.fill();
    };

    switch (kind) {
      case 'cabinet': {
        // 街机柜：机身 + 倾斜屏幕 + 摇杆
        box(-11, -34, 22, 34, 12, '#3d3560', '#241f3d', '#2f2850');
        ctx.fillStyle = '#6aa9ff';
        ctx.beginPath();
        ctx.moveTo(-8, -30);
        ctx.lineTo(4, -26);
        ctx.lineTo(4, -16);
        ctx.lineTo(-8, -20);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(-6, -10, 5, 2);
        ctx.fillStyle = '#ff7a6b';
        ctx.beginPath();
        ctx.arc(2, -6, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'shelf': {
        // 卡带架：三层隔板 + 彩色卡带
        box(-14, -30, 28, 30, 10, '#4a3f72', '#2e2850', '#3a3260');
        const colors = ['#5ee0b8', '#ff7a6b', '#ffd166', '#6aa9ff', '#b48aff'];
        for (let r = 0; r < 3; r++) {
          const yy = -25 + r * 9;
          ctx.fillStyle = '#1b1730';
          ctx.fillRect(-11, yy, 22, 7);
          for (let i = 0; i < 4; i++) {
            ctx.fillStyle = colors[(r * 4 + i) % colors.length];
            ctx.fillRect(-10 + i * 5, yy + 1, 4, 5);
          }
        }
        break;
      }
      case 'tower': {
        // 光盘塔：层叠光盘
        for (let i = 0; i < 5; i++) {
          const yy = -6 - i * 5;
          ctx.fillStyle = i % 2 ? '#2b2a44' : '#3a3858';
          ctx.beginPath();
          ctx.ellipse(0, yy, 11, 5.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = ['#6aa9ff', '#5ee0b8', '#ffd166', '#ff7a6b', '#b48aff'][i];
          ctx.beginPath();
          ctx.ellipse(0, yy - 1, 5, 2.4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#241f3d';
        ctx.fillRect(-9, -2, 18, 3);
        break;
      }
      case 'polygon': {
        // 多边形工位：显示器 + 线框立方体
        box(-13, -26, 26, 20, 12, '#45406e', '#2a2745', '#343055');
        ctx.fillStyle = '#12121f';
        ctx.beginPath();
        ctx.moveTo(-10, -23);
        ctx.lineTo(10, -17);
        ctx.lineTo(10, -6);
        ctx.lineTo(-10, -12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#5ee0b8';
        ctx.lineWidth = 1;
        const c = [0, -16];
        ctx.strokeRect(c[0] - 5, c[1] - 4, 10, 8);
        ctx.beginPath();
        ctx.moveTo(c[0] - 5, c[1] - 4);
        ctx.lineTo(c[0], c[1] - 7);
        ctx.lineTo(c[0] + 5, c[1] - 4);
        ctx.lineTo(c[0], c[1] - 1);
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 'scope': {
        // 示波台：屏幕 + 扫描线
        box(-12, -24, 24, 18, 12, '#45406e', '#2a2745', '#343055');
        ctx.fillStyle = '#0e1626';
        ctx.beginPath();
        ctx.moveTo(-9, -21);
        ctx.lineTo(9, -15);
        ctx.lineTo(9, -7);
        ctx.lineTo(-9, -13);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const t = i / 5;
          ctx.beginPath();
          ctx.moveTo(-9 + t * 18, -21 + t * 6);
          ctx.lineTo(-9 + t * 18, -13 + t * 6);
          ctx.stroke();
        }
        break;
      }
      case 'visor': {
        // 双筒目镜台
        ctx.fillStyle = '#3a3358';
        ctx.fillRect(-9, -12, 18, 12);
        ctx.fillStyle = '#241f3d';
        ctx.fillRect(-12, -1, 24, 2);
        ctx.fillStyle = '#151225';
        ctx.beginPath();
        ctx.moveTo(-11, -26);
        ctx.lineTo(11, -26);
        ctx.lineTo(8, -12);
        ctx.lineTo(-8, -12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ff5d6c';
        ctx.fillRect(-8, -22, 6, 4);
        ctx.fillRect(2, -22, 6, 4);
        break;
      }
      case 'case': {
        // 掌机展柜
        box(-10, -28, 20, 26, 10, '#4a3f72', '#2e2850', '#3a3260');
        ctx.fillStyle = 'rgba(150,220,255,0.35)';
        ctx.beginPath();
        ctx.moveTo(-8, -26);
        ctx.lineTo(8, -20);
        ctx.lineTo(8, -6);
        ctx.lineTo(-8, -12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ff7a6b';
        ctx.fillRect(-5, -22, 10, 7);
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(-3, -20, 6, 3);
        break;
      }
      case 'pc': {
        // PC 工程台：塔式机箱 + 显示器
        box(-16, -22, 14, 22, 8, '#6b6450', '#413d31', '#524c3d');
        ctx.fillStyle = '#2a2745';
        ctx.fillRect(-14, -18, 3, 12);
        ctx.fillStyle = '#5ee0b8';
        ctx.fillRect(-14, -18, 3, 2);
        box(0, -26, 20, 16, 10, '#6b6450', '#413d31', '#524c3d');
        ctx.fillStyle = '#12121f';
        ctx.beginPath();
        ctx.moveTo(2, -23);
        ctx.lineTo(18, -18);
        ctx.lineTo(18, -13);
        ctx.lineTo(2, -18);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'ruler': {
        // 测绘标尺
        ctx.fillStyle = '#f4efe4';
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(8, -51);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, -5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#101018';
        ctx.lineWidth = 1;
        for (let i = 0; i < 11; i++) {
          const yy = -50 + i * 4.6;
          ctx.beginPath();
          ctx.moveTo(0.5, yy);
          ctx.lineTo(i % 2 ? 4 : 7, yy + 1.5);
          ctx.stroke();
        }
        ctx.fillStyle = '#ff7a6b';
        ctx.beginPath();
        ctx.moveTo(0, -56);
        ctx.lineTo(8, -51);
        ctx.lineTo(8, -47);
        ctx.lineTo(0, -52);
        ctx.closePath();
        ctx.fill();
        break;
      }
      default:
        box(-8, -20, 16, 20, 8, '#4a3f72', '#2e2850', '#3a3260');
        break;
    }
    ctx.restore();
  }

  /** 供外部读取：展品对应的展品条目 */
  exhibitFor(spot) {
    return EXHIBIT_BY_ID[spot.exhibit] || null;
  }
}
