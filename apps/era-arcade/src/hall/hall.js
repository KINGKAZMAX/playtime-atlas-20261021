/**
 * 霓虹街廊 · 街机可玩展厅
 * src/hall/hall.js — 展厅场景（横向霓虹街廊）
 *
 * 结构：
 *   远景  夜空 + 城市剪影（视差 0.25）
 *   中景  街廊背墙 + 灯带 + 霓虹招牌（视差 0.6）
 *   近景  街机柜 + 玩家 + 地面反射（视差 1.0）
 *
 * 交互：← → / A D 走动，走到终端前按空格 / Enter 进入；
 *      也可直接点击（触屏）终端或使用 DOM 展品目录。
 */

import { PAL, withAlpha } from '../core/palette.js';
import { drawText, makeNeonSprite } from '../core/bitmapFont.js';
import { drawSprite } from '../core/sprites.js';
import { createRng } from '../core/rng.js';
import { EXHIBITS, HALL_NAME } from './exhibits.js';

const W = 480;
const H = 270;
const FLOOR_Y = 202;          // 地面基线
const WORLD_W = 780;          // 世界宽度（可横向走动）
const PLAYER_SPEED = 78;      // 像素/秒
const NEAR_RADIUS = 30;       // 进入终端的判定半径

export function createHall(shell) {
  const rng = createRng('neon-corridor-decor');
  const skyline = buildSkyline(rng);
  const decor = buildDecor(rng);

  const state = {
    playerX: 60,
    facing: 1,
    walkPhase: 0,
    moving: false,
    camera: 0,
    time: 0,
    nearId: null,
    promptPulse: 0,
    enterFlash: 0,
  };

  /** 缓存的背景渐变（每帧重建渐变会产生不必要的开销） */
  let bgGradient = null;

  function buildSkyline(r) {
    const towers = [];
    let x = -20;
    while (x < WORLD_W + 80) {
      const w = r.int(12, 30);
      const h = r.int(24, 78);
      const lit = [];
      for (let i = 0; i < r.int(3, 10); i += 1) {
        lit.push({ dx: r.int(2, Math.max(2, w - 4)), dy: r.int(3, Math.max(4, h - 4)), c: r.chance(0.7) ? PAL.amber : PAL.cyanSoft });
      }
      towers.push({ x, w, h, lit });
      x += w + r.int(2, 12);
    }
    return towers;
  }

  function buildDecor(r) {
    // 非交互街机柜，填充走廊密度
    const list = [];
    let x = 170;
    while (x < WORLD_W - 40) {
      list.push({ x, kind: r.int(0, 2), hue: r.pick([PAL.cyan, PAL.magenta, PAL.violet, PAL.lime]) });
      x += r.int(46, 78);
    }
    return list;
  }

  /**
   * 把不随时间变化的远景（城市剪影）与霓虹招牌预渲染到离屏画布。
   * 每帧只做两次 drawImage，避免上千次 fillRect。
   */
  const SKY_TOP = 62;
  const SKY_H = 82;
  const skySprite = (() => {
    const c = document.createElement('canvas');
    c.width = WORLD_W + 120;
    c.height = SKY_H;
    const g = c.getContext('2d');
    for (const t of skyline) {
      const tx = t.x + 20;
      const ty = SKY_TOP + SKY_H - 22 - t.h;
      g.fillStyle = '#0a0522';
      g.fillRect(tx, ty, t.w, t.h + 24);
      g.fillStyle = withAlpha(PAL.violet, 0.22);
      g.fillRect(tx, ty, t.w, 1);
      for (const l of t.lit) {
        g.fillStyle = withAlpha(l.c, 0.5);
        g.fillRect(tx + l.dx, ty + l.dy, 1, 2);
      }
    }
    return c;
  })();

  const signSprite = makeNeonSprite(HALL_NAME.en, {
    color: PAL.magenta,
    glow: PAL.cyan,
    scale: 2,
    spacing: 1,
    glowLayers: 2,
  });

  function nearestExhibit() {
    let best = null;
    let bestD = Infinity;
    for (const ex of EXHIBITS) {
      const d = Math.abs(ex.x - state.playerX);
      if (d < NEAR_RADIUS && d < bestD) {
        best = ex;
        bestD = d;
      }
    }
    return best;
  }

  function enter(exhibit) {
    state.enterFlash = 1;
    shell.audio.sfx.confirm();
    if (exhibit.kind === 'game') {
      shell.goTo(exhibit.id);
    } else if (exhibit.kind === 'info') {
      shell.openChronicle();
    } else if (exhibit.kind === 'scores') {
      shell.openLedger();
    }
  }

  function update(dt, input) {
    state.time += dt;
    state.enterFlash = Math.max(0, state.enterFlash - dt * 2.2);
    state.promptPulse += dt;

    const ax = input.axisX();
    state.moving = ax !== 0;
    if (ax !== 0) {
      state.facing = ax;
      state.playerX += ax * PLAYER_SPEED * dt;
      state.playerX = Math.max(16, Math.min(WORLD_W - 16, state.playerX));
      state.walkPhase += dt * 9;
    } else {
      state.walkPhase += dt * 1.6;
    }

    const targetCam = Math.max(0, Math.min(WORLD_W - W, state.playerX - W / 2));
    state.camera += (targetCam - state.camera) * Math.min(1, dt * 6);

    const near = nearestExhibit();
    state.nearId = near ? near.id : null;

    if (near && input.consume('action')) {
      enter(near);
    }

    // 触控：直接在屏幕上点终端即可进入（由 main.js 转发到 shell.hitTest）
  }

  /* --------------------------- 绘制 --------------------------- */

  function drawBackground(ctx) {
    if (!bgGradient) {
      bgGradient = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
      bgGradient.addColorStop(0, PAL.voidDeep);
      bgGradient.addColorStop(0.55, PAL.voidMid);
      bgGradient.addColorStop(1, PAL.voidLite);
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // 星点
    for (let i = 0; i < 46; i += 1) {
      const sx = (i * 97 + 13) % W;
      const sy = (i * 41 + 7) % 120;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(state.time * 1.6 + i));
      ctx.fillStyle = withAlpha(PAL.cyanSoft, 0.16 + tw * 0.34);
      ctx.fillRect(sx, sy, 1, 1);
    }

    // 月盘
    const mx = 392 - state.camera * 0.06;
    ctx.fillStyle = withAlpha(PAL.amberSoft, 0.16);
    ctx.beginPath();
    ctx.arc(mx, 46, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = withAlpha('#fff4d8', 0.42);
    ctx.beginPath();
    ctx.arc(mx, 46, 15, 0, Math.PI * 2);
    ctx.fill();

    // 城市剪影（预渲染，单次 drawImage）
    const off = -state.camera * 0.25;
    ctx.drawImage(skySprite, Math.round(-20 + off), SKY_TOP);
  }

  function drawBackWall(ctx) {
    const off = -state.camera * 0.6;
    const wallTop = 78;
    const wallBottom = FLOOR_Y - 46;

    ctx.fillStyle = PAL.wall;
    ctx.fillRect(0, wallTop, W, wallBottom - wallTop);

    // 墙板分隔线
    ctx.fillStyle = PAL.wallEdge;
    for (let x = ((off % 64) + 64) % 64 - 64; x < W; x += 64) {
      ctx.fillRect(Math.round(x), wallTop, 1, wallBottom - wallTop);
    }
    ctx.fillStyle = withAlpha(PAL.violet, 0.35);
    ctx.fillRect(0, wallTop, W, 1);
    ctx.fillStyle = withAlpha(PAL.magenta, 0.25);
    ctx.fillRect(0, wallBottom - 1, W, 1);

    // 顶部灯带（呼吸）
    const pulse = 0.35 + 0.25 * Math.sin(state.time * 1.1);
    ctx.fillStyle = withAlpha(PAL.cyan, pulse);
    ctx.fillRect(0, wallTop - 3, W, 2);
    ctx.fillStyle = withAlpha(PAL.magenta, pulse * 0.7);
    ctx.fillRect(0, wallTop - 6, W, 1);

    // 霓虹招牌（预渲染）
    const signX = 300 + off * 0.35;
    if (signX > -220 && signX < W + 20) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(
        signSprite.canvas,
        Math.round(signX - signSprite.padX),
        Math.round(wallTop + 16 - signSprite.padY),
      );
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  function drawFloor(ctx) {
    const off = -state.camera;
    ctx.fillStyle = '#080320';
    ctx.fillRect(0, FLOOR_Y, W, H - FLOOR_Y);

    // 透视地砖
    ctx.fillStyle = withAlpha(PAL.violet, 0.22);
    for (let i = -6; i < 18; i += 1) {
      const x = Math.round(i * 44 + off % 44);
      ctx.fillRect(x, FLOOR_Y, 1, 14);
    }
    ctx.fillStyle = withAlpha(PAL.violet, 0.14);
    ctx.fillRect(0, FLOOR_Y + 14, W, 1);
    ctx.fillStyle = withAlpha(PAL.violet, 0.09);
    ctx.fillRect(0, FLOOR_Y + 30, W, 1);

    // 地面前缘霓虹反射
    const rf = 0.22 + 0.08 * Math.sin(state.time * 1.7);
    ctx.fillStyle = withAlpha(PAL.magenta, rf);
    ctx.fillRect(0, FLOOR_Y, W, 1);
  }

  /** 通用街机柜外形（交互终端与装饰柜共用） */
  function drawCabinet(ctx, x, baseY, accent, opts = {}) {
    const { interactive = false, near = false, label = '', screen = 0 } = opts;
    const w = 40;
    const h = 58;
    const top = baseY - h;

    // 机身
    ctx.fillStyle = '#140a33';
    ctx.fillRect(x - w / 2, top, w, h);
    ctx.fillStyle = '#1d1145';
    ctx.fillRect(x - w / 2 + 2, top + 2, w - 4, h - 4);
    ctx.fillStyle = withAlpha(accent, interactive ? 0.85 : 0.4);
    ctx.fillRect(x - w / 2, top, w, 2);          // 灯箱顶沿
    ctx.fillRect(x - w / 2, top + 16, 2, 14);    // 侧边灯条

    // 屏幕
    const sx = x - w / 2 + 5;
    const sy = top + 6;
    const sw = w - 10;
    const sh = 16;
    ctx.fillStyle = '#050218';
    ctx.fillRect(sx - 1, sy - 1, sw + 2, sh + 2);

    // 屏幕内容：不同展品显示不同演示
    const glow = near ? 0.55 + 0.35 * Math.sin(state.promptPulse * 6) : 0.3;
    ctx.fillStyle = withAlpha(accent, 0.12 + glow * 0.2);
    ctx.fillRect(sx, sy, sw, sh);

    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();
    if (screen === 0) {
      // 晶格演示：闪烁晶核与游丝
      for (let i = 0; i < 5; i += 1) {
        const cxp = sx + 3 + ((i * 7 + Math.floor(state.time * 3)) % (sw - 6));
        const cyp = sy + 4 + ((i * 5) % (sh - 8));
        ctx.fillStyle = withAlpha(PAL.crystal, 0.85);
        ctx.fillRect(cxp, cyp, 2, 2);
      }
      ctx.fillStyle = withAlpha(PAL.wisp, 0.8);
      const wx = sx + 3 + ((Math.floor(state.time * 5) * 3) % (sw - 6));
      ctx.fillRect(wx, sy + 7, 2, 2);
    } else if (screen === 1) {
      // 陨星编队演示
      for (let i = 0; i < 6; i += 1) {
        const cxp = sx + 4 + i * 5;
        const cyp = sy + 3 + ((Math.floor(state.time * 2) + i) % 3);
        ctx.fillStyle = withAlpha(i % 2 ? PAL.meteorB : PAL.meteorA, 0.85);
        ctx.fillRect(cxp, cyp, 3, 3);
      }
      ctx.fillStyle = withAlpha(PAL.ship, 0.9);
      ctx.fillRect(sx + sw / 2 - 1, sy + sh - 5, 2, 4);
    } else if (screen === 2) {
      // 时间轴演示
      ctx.fillStyle = withAlpha(PAL.amber, 0.7);
      ctx.fillRect(sx + 2, sy + 8, sw - 4, 1);
      for (let i = 0; i < 4; i += 1) {
        ctx.fillStyle = withAlpha(PAL.amberSoft, 0.9);
        ctx.fillRect(sx + 3 + i * 6, sy + 6, 1, 5);
      }
    } else {
      // 荣誉榜演示
      for (let i = 0; i < 4; i += 1) {
        const len = 4 + ((i * 3 + Math.floor(state.time * 2)) % 8);
        ctx.fillStyle = withAlpha(PAL.violet, 0.85);
        ctx.fillRect(sx + 3, sy + 3 + i * 3, len, 1);
      }
    }
    ctx.restore();

    // 控制面板 + 摇杆
    ctx.fillStyle = '#2a1a5e';
    ctx.fillRect(x - w / 2 + 3, top + 26, w - 6, 6);
    ctx.fillStyle = accent;
    ctx.fillRect(x - 6, top + 24, 2, 4);
    ctx.fillStyle = '#ff4d5e';
    ctx.fillRect(x + 4, top + 24, 2, 3);
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(x + 7, top + 24, 2, 3);

    // 投币口
    ctx.fillStyle = withAlpha(PAL.amber, 0.85);
    ctx.fillRect(x + w / 2 - 5, top + 38, 4, 2);

    // 底部灯
    ctx.fillStyle = withAlpha(accent, near ? 0.9 : 0.35);
    ctx.fillRect(x - w / 2, baseY - 2, w, 2);
  }

  function drawReflection(ctx, x, accent) {
    // 地面倒影：逐行做垂直的模糊色块
    for (let i = 0; i < 12; i += 1) {
      const a = 0.16 * (1 - i / 12);
      ctx.fillStyle = withAlpha(accent, a);
      ctx.fillRect(x - 18 + i * 0.6, FLOOR_Y + 2 + i * 2, 36 - i * 1.2, 2);
    }
  }

  function drawPlayer(ctx) {
    const px = Math.round(state.playerX - state.camera);
    const py = FLOOR_Y - 18;

    // 地面投影
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(px - 5, FLOOR_Y, 10, 2);

    const step = state.moving ? Math.floor(state.walkPhase) % 2 : 0;
    const bob = state.moving ? (step === 0 ? 0 : 1) : 0;

    const body = [
      '..oooo..',
      '.obggbo.',
      '.obggbo.',
      '..obbo..',
      '.obbbbo.',
      '.obbbbo.',
      step === 0 ? '..oooo..' : '.o.ooo.o',
      step === 0 ? '..o..o..' : '..o...o.',
    ];

    ctx.save();
    if (state.facing < 0) {
      ctx.translate(px, py + bob);
      ctx.scale(-1, 1);
      drawSprite(ctx, body, -4, 0, 1);
    } else {
      drawSprite(ctx, body, px - 4, py + bob, 1);
    }
    ctx.restore();

    // 头部辉光
    ctx.fillStyle = withAlpha(PAL.cyan, 0.18 + 0.08 * Math.sin(state.time * 4));
    ctx.fillRect(px - 6, py - 3 + bob, 12, 6);
  }

  function drawPrompt(ctx) {
    const ex = EXHIBITS.find((e) => e.id === state.nearId);
    if (!ex) return;
    const px = Math.round(state.playerX - state.camera);
    const y = FLOOR_Y - 42;
    const pulse = 0.55 + 0.45 * Math.sin(state.promptPulse * 5);

    // 提示牌
    const label = ex.en;
    const w = label.length * 6 * 1 + 24;
    const bx = Math.max(4, Math.min(W - w - 4, px - w / 2));
    ctx.fillStyle = 'rgba(6,3,20,0.86)';
    ctx.fillRect(bx, y, w, 15);
    ctx.fillStyle = withAlpha(ex.accent, 0.85);
    ctx.fillRect(bx, y, w, 1);
    ctx.fillRect(bx, y + 14, w, 1);
    drawText(ctx, label, bx + w / 2, y + 4, { color: ex.accent, scale: 1, align: 'center' });

    // "PRESS SPACE"
    const blink = Math.sin(state.promptPulse * 6) > -0.3 ? 1 : 0.25;
    ctx.globalAlpha = blink;
    drawText(ctx, 'PRESS SPACE', px, y - 12, { color: PAL.text, scale: 1, align: 'center', shadow: true });
    ctx.globalAlpha = 1;
  }

  function render(ctx) {
    drawBackground(ctx);
    drawBackWall(ctx);
    drawFloor(ctx);

    // 装饰柜
    for (const d of decor) {
      const x = Math.round(d.x - state.camera);
      if (x < -40 || x > W + 40) continue;
      drawReflection(ctx, x, d.hue);
      drawCabinet(ctx, x, FLOOR_Y, d.hue, { interactive: false });
    }

    // 交互终端
    for (const ex of EXHIBITS) {
      const x = Math.round(ex.x - state.camera);
      if (x < -40 || x > W + 40) continue;
      const near = ex.id === state.nearId;
      const screenIndex = EXHIBITS.indexOf(ex);
      drawReflection(ctx, x, ex.accent);
      drawCabinet(ctx, x, FLOOR_Y, ex.accent, { interactive: true, near, screen: screenIndex });
      // 终端编号
      drawText(ctx, `0${screenIndex + 1}`, x, FLOOR_Y + 20, {
        color: withAlpha(ex.accent, 0.75),
        scale: 1,
        align: 'center',
      });
    }

    drawPlayer(ctx);
    drawPrompt(ctx);

    // 顶部标题条
    ctx.fillStyle = 'rgba(6,3,20,0.72)';
    ctx.fillRect(0, 0, W, 13);
    ctx.fillStyle = withAlpha(PAL.magenta, 0.7);
    ctx.fillRect(0, 12, W, 1);
    drawText(ctx, HALL_NAME.en, 6, 3, { color: PAL.text, scale: 1 });
    drawText(ctx, '1980S ARCADE HALL', W - 6, 3, { color: withAlpha(PAL.cyan, 0.85), scale: 1, align: 'right' });

    // 底部提示条
    ctx.fillStyle = 'rgba(6,3,20,0.66)';
    ctx.fillRect(0, H - 13, W, 13);
    drawText(ctx, 'ARROWS MOVE   SPACE ENTER   P PAUSE   M MUTE', 6, H - 10, {
      color: PAL.textDim,
      scale: 1,
    });

    // 进入闪白
    if (state.enterFlash > 0) {
      ctx.fillStyle = withAlpha('#ffffff', state.enterFlash * 0.55);
      ctx.fillRect(0, 0, W, H);
    }
  }

  /** 供 main.js 做触屏点选：返回该屏幕坐标处的展品 id（若有） */
  function hitTest(canvasX, canvasY) {
    const worldX = canvasX + state.camera;
    for (const ex of EXHIBITS) {
      const dx = Math.abs(worldX - ex.x);
      const dy = canvasY - (FLOOR_Y - 58);
      if (dx < 22 && dy >= -4 && dy < 64) return ex.id;
    }
    return null;
  }

  /** 供 DOM 目录直接跳转 */
  function focusExhibit(id) {
    const ex = EXHIBITS.find((e) => e.id === id);
    if (!ex) return;
    state.playerX = ex.x;
    state.camera = Math.max(0, Math.min(WORLD_W - W, ex.x - W / 2));
  }

  return {
    id: 'hall',
    update,
    render,
    hitTest,
    focusExhibit,
    /** 展厅没有暂停/生命等游戏态，暂停时仅冻结移动 */
    onPause() {},
    onResume() {},
    onRestart() {},
  };
}
