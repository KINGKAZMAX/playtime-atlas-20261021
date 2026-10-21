/**
 * 霓虹街廊 · 街机可玩展厅
 * src/games/lattice.js — 《晶格回廊》LATTICE CORRIDOR
 *
 * 原创机制：格子迷宫追逐。
 *   · 相位穿行（Phase Dash）：向前穿墙两格，消耗相位能量
 *   · 残响（Echo）：原地留下诱饵，吸引巡守 6 秒
 *   · 晶核连拾：连续拾取提升倍率
 * 与任何商业街机作品无素材或逐帧关联，机制参考的是"格子迷宫追逐"这一公共范式。
 */

import { PAL, withAlpha, DIFFICULTY } from '../core/palette.js';
import { drawText, drawNeonText } from '../core/bitmapFont.js';
import { drawSprite, SPRITES } from '../core/sprites.js';
import { createRng } from '../core/rng.js';
import { loadScores, saveScore } from '../core/storage.js';

const CELL = 16;
const COLS = 29;
const ROWS = 15;
const MAZE_X = 8;
const MAZE_Y = 22;
const W = 480;
const H = 270;
const HIT_HALF = 3;

const DIRS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** 难度参数表 */
const TUNING = [
  { wisps: 2, wardens: 1, charges: 4, regen: 5.0, wispSpeed: 58, wardenSpeed: 62, time: 70, crystals: 10 },
  { wisps: 3, wardens: 2, charges: 3, regen: 7.0, wispSpeed: 68, wardenSpeed: 76, time: 60, crystals: 13 },
  { wisps: 4, wardens: 3, charges: 2, regen: 9.5, wispSpeed: 78, wardenSpeed: 88, time: 52, crystals: 16 },
];

export function createLattice(shell) {
  let grid = [];
  let crystals = [];
  let gate = { cx: 0, cy: 0 };
  let enemies = [];
  let echoes = [];
  let particles = [];
  let floats = [];

  const st = {
    phase: 'title',       // title | play | dead | clear | over
    level: 1,
    score: 0,
    lives: 3,
    combo: 0,
    comboTimer: 0,
    time: 0,
    timeLimit: 60,
    charges: 3,
    chargeTimer: 0,
    dashT: 0,
    dashDir: null,
    invuln: 0,
    flash: 0,
    banner: null,
    bannerT: 0,
    seed: 'lattice-1',
    difficulty: 1,
    started: false,
  };

  const player = {
    x: MAZE_X + CELL / 2,
    y: MAZE_Y + CELL / 2,
    dir: 'left',
    desired: null,
    speed: 82,
  };

  /* --------------------------- 地图生成 --------------------------- */

  function generateMaze(seed) {
    const rng = createRng(seed);
    const g = [];
    for (let r = 0; r < ROWS; r += 1) g.push(new Array(COLS).fill(1));

    const stack = [[1, 1]];
    g[1][1] = 0;
    while (stack.length) {
      const [c, r] = stack[stack.length - 1];
      const options = rng.shuffle([[2, 0], [-2, 0], [0, 2], [0, -2]]);
      let moved = false;
      for (const [dc, dr] of options) {
        const nc = c + dc;
        const nr = r + dr;
        if (nc > 0 && nc < COLS - 1 && nr > 0 && nr < ROWS - 1 && g[nr][nc] === 1) {
          g[r + dr / 2][c + dc / 2] = 0;
          g[nr][nc] = 0;
          stack.push([nc, nr]);
          moved = true;
          break;
        }
      }
      if (!moved) stack.pop();
    }

    // 编织（braiding）：拆掉少量墙形成环路，避免全是死胡同
    const loops = Math.floor(COLS * ROWS * 0.045);
    for (let i = 0; i < loops; i += 1) {
      const r = rng.int(1, ROWS - 2);
      const c = rng.int(1, COLS - 2);
      if (g[r][c] === 0) continue;
      const horiz = rng.chance(0.5);
      const n = horiz ? [c, r - 1] : [c - 1, r];
      if (n[0] >= 0 && n[0] < COLS && n[1] >= 0 && n[1] < ROWS && g[n[1]][n[0]] === 0) {
        g[r][c] = 0;
      }
    }
    return g;
  }

  function floorCells() {
    const list = [];
    for (let r = 1; r < ROWS - 1; r += 1) {
      for (let c = 1; c < COLS - 1; c += 1) {
        if (grid[r][c] === 0) list.push([c, r]);
      }
    }
    return list;
  }

  function isWall(cx, cy) {
    if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return true;
    return grid[cy][cx] === 1;
  }

  function buildLevel(level) {
    const t = TUNING[st.difficulty];
    st.seed = `lattice-${level}-${st.difficulty}`;
    grid = generateMaze(st.seed);
    const cells = floorCells();

    // 归途门：距离起点最远的可通行格
    const rng = createRng(`${st.seed}-gate`);
    let best = null;
    let bestD = -1;
    for (const [c, r] of cells) {
      const d = Math.abs(c - 1) + Math.abs(r - 1);
      if (d > bestD) {
        bestD = d;
        best = [c, r];
      }
    }
    gate = { cx: best[0], cy: best[1], unlocked: false, pulse: 0 };

    // 晶核
    crystals = [];
    const pool = cells.filter(([c, r]) => !(c === best[0] && r === best[1]) && !(c === 1 && r === 1));
    const count = Math.min(t.crystals + (level - 1) * 2, pool.length - 4);
    const chosen = rng.shuffle(pool).slice(0, count);
    for (const [c, r] of chosen) {
      crystals.push({ cx: c, cy: r, alive: true, t: rng.float(0, 6.28) });
    }

    // 敌人
    enemies = [];
    const spawnPool = cells.filter(([c, r]) => {
      const d = Math.abs(c - 1) + Math.abs(r - 1);
      return d > 8;
    });
    const shuffled = rng.shuffle(spawnPool);
    let si = 0;
    for (let i = 0; i < t.wisps; i += 1) {
      const [c, r] = shuffled[si % shuffled.length];
      si += 1;
      enemies.push(makeEnemy('wisp', c, r));
    }
    for (let i = 0; i < t.wardens; i += 1) {
      const [c, r] = shuffled[si % shuffled.length];
      si += 1;
      enemies.push(makeEnemy('warden', c, r));
    }

    echoes = [];
    particles = [];
    floats = [];
    player.x = MAZE_X + CELL / 2;
    player.y = MAZE_Y + CELL / 2;
    player.dir = 'left';
    player.desired = null;
    st.timeLimit = t.time + (level - 1) * 5;
    st.time = st.timeLimit;
    st.charges = t.charges;
    st.chargeTimer = 0;
    st.dashT = 0;
    st.dashDir = null;
    st.invuln = 1.2;
    st.combo = 0;
    st.comboTimer = 0;
  }

  function makeEnemy(kind, cx, cy) {
    return {
      kind,
      x: MAZE_X + cx * CELL + CELL / 2,
      y: MAZE_Y + cy * CELL + CELL / 2,
      dir: 'left',
      desired: null,
      speed: kind === 'wisp' ? TUNING[st.difficulty].wispSpeed : TUNING[st.difficulty].wardenSpeed,
      t: Math.random() * 6.28,
      roam: null,
    };
  }

  /* --------------------------- 移动与碰撞 --------------------------- */

  function freeAt(px, py) {
    const pts = [
      [px - HIT_HALF, py - HIT_HALF],
      [px + HIT_HALF, py - HIT_HALF],
      [px - HIT_HALF, py + HIT_HALF],
      [px + HIT_HALF, py + HIT_HALF],
    ];
    for (const [x, y] of pts) {
      const c = Math.floor((x - MAZE_X) / CELL);
      const r = Math.floor((y - MAZE_Y) / CELL);
      if (isWall(c, r)) return false;
    }
    return true;
  }

  function cellOf(px, py) {
    return {
      c: Math.floor((px - MAZE_X) / CELL),
      r: Math.floor((py - MAZE_Y) / CELL),
    };
  }

  /** 网格转向辅助：在格心附近允许转向 */
  function turnAssist(entity, grid) {
    const cx = (entity.x - MAZE_X - CELL / 2) / CELL;
    const cy = (entity.y - MAZE_Y - CELL / 2) / CELL;
    const rx = Math.round(cx);
    const ry = Math.round(cy);
    const nearX = Math.abs(cx - rx) < 0.24;
    const nearY = Math.abs(cy - ry) < 0.24;
    if (!nearX || !nearY) return;
    entity.x = MAZE_X + rx * CELL + CELL / 2;
    entity.y = MAZE_Y + ry * CELL + CELL / 2;
    if (!entity.desired) return;
    const [dx, dy] = DIRS[entity.desired];
    if (!isWall(rx + dx, ry + dy)) {
      entity.dir = entity.desired;
      entity.desired = null;
    } else if (entity.dir === entity.desired) {
      entity.desired = null;
    }
  }

  function moveEntity(entity, dt, speed) {
    const [dx, dy] = DIRS[entity.dir];
    const nx = entity.x + dx * speed * dt;
    const ny = entity.y + dy * speed * dt;
    if (freeAt(nx, entity.y)) entity.x = nx;
    else entity.desired = entity.desired || null;
    if (freeAt(entity.x, ny)) entity.y = ny;
  }

  /* --------------------------- 敌人 AI --------------------------- */

  /** 从某格到目标的 BFS 距离场（用于巡守追踪） */
  function distanceField(tx, ty) {
    const dist = new Int32Array(COLS * ROWS).fill(-1);
    const qx = new Int32Array(COLS * ROWS);
    const qy = new Int32Array(COLS * ROWS);
    let head = 0;
    let tail = 0;
    dist[ty * COLS + tx] = 0;
    qx[tail] = tx;
    qy[tail] = ty;
    tail += 1;
    while (head < tail) {
      const cx = qx[head];
      const cy = qy[head];
      head += 1;
      const d = dist[cy * COLS + cx] + 1;
      const nbrs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dx, dy] of nbrs) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        if (isWall(nx, ny)) continue;
        const idx = ny * COLS + nx;
        if (dist[idx] !== -1) continue;
        dist[idx] = d;
        qx[tail] = nx;
        qy[tail] = ny;
        tail += 1;
      }
    }
    return dist;
  }

  function stepDownhill(entity, field) {
    const { c, r } = cellOf(entity.x, entity.y);
    const here = field[r * COLS + c];
    if (here < 0) return false;
    let bestD = here;
    let bestDir = null;
    for (const [key, [dx, dy]] of Object.entries(DIRS)) {
      const nx = c + dx;
      const ny = r + dy;
      if (isWall(nx, ny)) continue;
      const d = field[ny * COLS + nx];
      if (d >= 0 && d < bestD) {
        bestD = d;
        bestDir = key;
      }
    }
    if (bestDir) {
      entity.dir = bestDir;
      entity.desired = null;
      return true;
    }
    return false;
  }

  function updateEnemies(dt) {
    // 巡守目标：优先残响，其次玩家
    const echo = echoes.length ? echoes[echoes.length - 1] : null;
    let field = null;
    let targetX = player.x;
    let targetY = player.y;

    const wardens = enemies.filter((e) => e.kind === 'warden');
    if (wardens.length) {
      const tc = cellOf(echo ? echo.x : player.x, echo ? echo.y : player.y);
      field = distanceField(
        Math.max(1, Math.min(COLS - 2, tc.c)),
        Math.max(1, Math.min(ROWS - 2, tc.r)),
      );
      targetX = echo ? echo.x : player.x;
      targetY = echo ? echo.y : player.y;
    }

    for (const e of enemies) {
      e.t += dt;
      if (e.kind === 'warden') {
        const c = cellOf(e.x, e.y);
        if (c.c !== e.lastC || c.r !== e.lastR) {
          e.lastC = c.c;
          e.lastR = c.r;
          if (field) stepDownhill(e, field);
        } else if (!e.desired && Math.random() < 0.004) {
          e.desired = Object.keys(DIRS)[Math.floor(Math.random() * 4)];
        }
      } else {
        // 游丝：残响存在时靠近残响，否则随机巡逻
        if (echo && Math.random() < 0.02) {
          e.desired = dirToward(e, echo.x, echo.y);
        } else if (!e.desired || Math.random() < 0.012) {
          e.desired = Object.keys(DIRS)[Math.floor(Math.random() * 4)];
        }
      }
      turnAssist(e, grid);
      moveEntity(e, dt, e.speed);
    }
    void targetX;
    void targetY;
  }

  function dirToward(entity, tx, ty) {
    const from = cellOf(entity.x, entity.y);
    const to = cellOf(tx, ty);
    const dc = to.c - from.c;
    const dr = to.r - from.r;
    if (Math.abs(dc) > Math.abs(dr)) return dc > 0 ? 'right' : 'left';
    if (dr !== 0) return dr > 0 ? 'down' : 'up';
    return null;
  }

  /* --------------------------- 玩家动作 --------------------------- */

  function tryDash() {
    if (st.charges <= 0 || st.dashT > 0) {
      if (st.charges <= 0) shell.audio.sfx.deny();
      return;
    }
    st.charges -= 1;
    st.dashT = 0.22;
    st.dashDir = player.dir;
    shell.audio.sfx.dash();
    for (let i = 0; i < 10; i += 1) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: player.x, y: player.y,
        vx: Math.cos(a) * 26, vy: Math.sin(a) * 26,
        life: 0.34, max: 0.34, color: PAL.cyan, size: 1,
      });
    }
  }

  function tryEcho() {
    if (echoes.length >= 2) {
      shell.audio.sfx.deny();
      return;
    }
    echoes.push({ x: player.x, y: player.y, life: 6, max: 6, t: 0 });
    shell.audio.sfx.echo();
  }

  /* --------------------------- 生命周期 --------------------------- */

  function startGame() {
    st.level = 1;
    st.score = 0;
    st.lives = 3;
    st.started = true;
    buildLevel(1);
    st.phase = 'play';
    showBanner(`LEVEL ${st.level}`, 1.6);
    shell.audio.music.play('lattice');
  }

  function showBanner(text, dur = 1.4) {
    st.banner = text;
    st.bannerT = dur;
  }

  function loseLife(reason) {
    st.lives -= 1;
    st.flash = 1;
    shell.audio.sfx.lock();
    floats.push({ x: player.x, y: player.y, text: reason, life: 1.2, color: PAL.crimson });
    if (st.lives <= 0) {
      gameOver();
    } else {
      st.invuln = 2.2;
      st.combo = 0;
      const t = TUNING[st.difficulty];
      player.x = MAZE_X + CELL / 2;
      player.y = MAZE_Y + CELL / 2;
      player.dir = 'left';
      player.desired = null;
      st.time = st.timeLimit;
      // 敌人退回出生点附近
      for (const e of enemies) {
        e.x = MAZE_X + ((Math.floor(e.x - MAZE_X) / CELL) | 0) * CELL + CELL / 2;
      }
      showBanner(`RETRY  ${st.lives} LEFT`, 1.2);
      void t;
    }
  }

  function gameOver() {
    st.phase = 'over';
    shell.audio.sfx.over();
    shell.audio.music.stop();
    const list = saveScore('lattice', st.score);
    shell.gameOver({
      gameId: 'lattice',
      title: '晶格回廊',
      score: st.score,
      detail: `抵达第 ${st.level} 层`,
      scores: list,
    });
  }

  function nextLevel() {
    st.level += 1;
    const bonus = 500 * st.level + Math.floor(st.time) * 10;
    st.score += bonus;
    floats.push({ x: gate.cx * CELL + MAZE_X, y: gate.cy * CELL + MAZE_Y, text: `+${bonus}`, life: 1.6, color: PAL.core });
    buildLevel(st.level);
    showBanner(`LEVEL ${st.level}`, 1.6);
    shell.audio.sfx.seal();
  }

  /* --------------------------- 更新 --------------------------- */

  function update(dt, input) {
    st.flash = Math.max(0, st.flash - dt * 2);
    st.bannerT = Math.max(0, st.bannerT - dt);

    if (st.phase !== 'play') {
      updateParticles(dt);
      return;
    }

    // 输入：方向
    for (const key of ['up', 'down', 'left', 'right']) {
      if (input.consume(key)) player.desired = key;
    }
    if (input.consume('action')) tryDash();
    if (input.consume('skill')) tryEcho();

    // 相位能量回复
    const t = TUNING[st.difficulty];
    if (st.charges < t.charges) {
      st.chargeTimer += dt;
      if (st.chargeTimer >= t.regen) {
        st.chargeTimer = 0;
        st.charges += 1;
        shell.audio.sfx.step();
      }
    } else {
      st.chargeTimer = 0;
    }

    // 计时
    st.time -= dt;
    if (st.time <= 0) {
      st.time = 0;
      loseLife('TIME OUT');
    }

    // 连击
    if (st.comboTimer > 0) {
      st.comboTimer -= dt;
      if (st.comboTimer <= 0) st.combo = 0;
    }

    if (st.invuln > 0) st.invuln -= dt;

    // 移动
    turnAssist(player, grid);
    if (st.dashT > 0) {
      st.dashT -= dt;
      const [dx, dy] = DIRS[st.dashDir];
      player.x += dx * 210 * dt;
      player.y += dy * 210 * dt;
      // 限制在地图内
      player.x = Math.max(MAZE_X + HIT_HALF, Math.min(MAZE_X + COLS * CELL - HIT_HALF, player.x));
      player.y = Math.max(MAZE_Y + HIT_HALF, Math.min(MAZE_Y + ROWS * CELL - HIT_HALF, player.y));
      if (Math.random() < 0.6) {
        particles.push({
          x: player.x, y: player.y, vx: 0, vy: 0,
          life: 0.3, max: 0.3, color: PAL.cyanSoft, size: 2,
        });
      }
    } else {
      moveEntity(player, dt, player.speed);
    }

    // 晶核拾取
    const pc = cellOf(player.x, player.y);
    for (const cr of crystals) {
      if (!cr.alive) continue;
      if (cr.cx === pc.c && cr.cy === pc.r) {
        cr.alive = false;
        st.combo += 1;
        st.comboTimer = 2.0;
        const mult = Math.min(5, st.combo);
        const gain = 100 * mult;
        st.score += gain;
        shell.audio.sfx.pick();
        floats.push({ x: player.x, y: player.y - 8, text: `${gain}`, life: 0.8, color: mult > 1 ? PAL.core : PAL.crystal });
        for (let i = 0; i < 6; i += 1) {
          const a = Math.random() * Math.PI * 2;
          particles.push({
            x: player.x, y: player.y, vx: Math.cos(a) * 34, vy: Math.sin(a) * 34,
            life: 0.36, max: 0.36, color: PAL.crystal, size: 1,
          });
        }
      }
    }

    // 归途门
    const remaining = crystals.filter((c) => c.alive).length;
    if (remaining === 0 && !gate.unlocked) {
      gate.unlocked = true;
      showBanner('GATE OPEN', 1.6);
      shell.audio.sfx.seal();
    }
    gate.pulse += dt;
    if (gate.unlocked && pc.c === gate.cx && pc.r === gate.cy) {
      nextLevel();
    }

    // 敌人碰撞
    if (st.invuln <= 0) {
      for (const e of enemies) {
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        if (dx * dx + dy * dy < 100) {
          loseLife(e.kind === 'warden' ? 'CAUGHT BY WARDEN' : 'TOUCHED BY WISP');
          break;
        }
      }
    }

    // 残响
    for (let i = echoes.length - 1; i >= 0; i -= 1) {
      const ec = echoes[i];
      ec.life -= dt;
      ec.t += dt;
      if (ec.life <= 0) echoes.splice(i, 1);
    }

    updateEnemies(dt);
    updateParticles(dt);
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 40 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floats.length - 1; i >= 0; i -= 1) {
      const f = floats[i];
      f.life -= dt;
      f.y -= 16 * dt;
      if (f.life <= 0) floats.splice(i, 1);
    }
  }

  /* --------------------------- 绘制 --------------------------- */

  function drawMaze(ctx) {
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const x = MAZE_X + c * CELL;
        const y = MAZE_Y + r * CELL;
        if (grid[r][c] === 0) {
          ctx.fillStyle = '#080320';
          ctx.fillRect(x, y, CELL, CELL);
          continue;
        }
        ctx.fillStyle = '#1a0f42';
        ctx.fillRect(x, y, CELL, CELL);
        // 面板纹
        ctx.fillStyle = withAlpha(PAL.violet, 0.16);
        ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
        // 亮边
        if (r > 0 && grid[r - 1][c] === 0) {
          ctx.fillStyle = withAlpha(PAL.cyan, 0.6);
          ctx.fillRect(x, y, CELL, 1);
        }
        if (r < ROWS - 1 && grid[r + 1][c] === 0) {
          ctx.fillStyle = withAlpha(PAL.magenta, 0.38);
          ctx.fillRect(x, y + CELL - 1, CELL, 1);
        }
        if (c > 0 && grid[r][c - 1] === 0) {
          ctx.fillStyle = withAlpha(PAL.violet, 0.3);
          ctx.fillRect(x, y, 1, CELL);
        }
        if (c < COLS - 1 && grid[r][c + 1] === 0) {
          ctx.fillStyle = withAlpha(PAL.violet, 0.3);
          ctx.fillRect(x + CELL - 1, y, 1, CELL);
        }
      }
    }
    // 外框
    ctx.strokeStyle = withAlpha(PAL.cyan, 0.35);
    ctx.lineWidth = 1;
    ctx.strokeRect(MAZE_X - 0.5, MAZE_Y - 0.5, COLS * CELL + 1, ROWS * CELL + 1);
  }

  function drawCrystals(ctx) {
    for (const cr of crystals) {
      if (!cr.alive) continue;
      const x = MAZE_X + cr.cx * CELL + CELL / 2 - 3;
      const y = MAZE_Y + cr.cy * CELL + CELL / 2 - 3;
      const pulse = 0.6 + 0.4 * Math.sin(cr.t * 4);
      ctx.fillStyle = withAlpha(PAL.crystal, 0.16 * pulse);
      ctx.fillRect(x - 3, y - 3, 12, 12);
      drawSprite(ctx, SPRITES.crystal, x, y, 1);
    }
  }

  function drawGate(ctx) {
    const x = MAZE_X + gate.cx * CELL + CELL / 2 - 4;
    const y = MAZE_Y + gate.cy * CELL + CELL / 2 - 4;
    if (gate.unlocked) {
      const p = 0.5 + 0.5 * Math.sin(gate.pulse * 5);
      ctx.fillStyle = withAlpha(PAL.lime, 0.2 * p);
      ctx.fillRect(x - 5, y - 5, 18, 18);
      drawSprite(ctx, SPRITES.gate, x, y, 1, {
        o: '#0a2a12', g: PAL.lime, b: PAL.lime, c: PAL.lime, C: PAL.lime, w: PAL.lime,
      });
    } else {
      ctx.globalAlpha = 0.35;
      drawSprite(ctx, SPRITES.gate, x, y, 1, {
        o: '#1a1030', g: '#4a5a7a', b: '#4a5a7a', c: '#4a5a7a', C: '#4a5a7a', w: '#4a5a7a',
      });
      ctx.globalAlpha = 1;
    }
  }

  function drawEnemies(ctx) {
    for (const e of enemies) {
      const x = Math.round(e.x - 4);
      const y = Math.round(e.y - 4);
      const wob = Math.sin(e.t * 6) * 0.6;
      if (e.kind === 'wisp') {
        ctx.fillStyle = withAlpha(PAL.wisp, 0.22);
        ctx.fillRect(x - 3, y - 3 + wob, 12, 12);
        drawSprite(ctx, SPRITES.wisp, x + 1, y + 1 + wob, 1, {
          o: '#2a0f3a', w: PAL.wisp, g: PAL.cyanSoft,
        });
      } else {
        ctx.fillStyle = withAlpha(PAL.warden, 0.24);
        ctx.fillRect(x - 3, y - 3 + wob, 14, 14);
        drawSprite(ctx, SPRITES.warden, x, y + wob, 1, {
          o: '#2a0a18', r: PAL.warden, g: PAL.core,
        });
      }
    }
  }

  function drawEchoes(ctx) {
    for (const ec of echoes) {
      const p = ec.life / ec.max;
      const r = 5 + (1 - p) * 4;
      ctx.strokeStyle = withAlpha(PAL.echo, 0.8 * p);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ec.x, ec.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = withAlpha(PAL.echo, 0.35 * p);
      ctx.fillRect(ec.x - 2, ec.y - 2, 4, 4);
    }
  }

  function drawPlayer(ctx) {
    if (st.invuln > 0 && Math.floor(st.invuln * 12) % 2 === 0) return;
    const x = Math.round(player.x - 4);
    const y = Math.round(player.y - 4);
    ctx.fillStyle = withAlpha(PAL.cyan, 0.25);
    ctx.fillRect(x - 3, y - 3, 14, 14);
    drawSprite(ctx, SPRITES.lumen, x, y, 1, {
      o: '#120a2e', b: PAL.magenta, g: PAL.cyan,
    });
  }

  function drawParticles(ctx) {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawFloats(ctx) {
    for (const f of floats) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      drawText(ctx, f.text, f.x, f.y, { color: f.color, scale: 1, align: 'center', shadow: true });
    }
    ctx.globalAlpha = 1;
  }

  function drawHud(ctx) {
    ctx.fillStyle = 'rgba(6,3,20,0.85)';
    ctx.fillRect(0, 0, W, MAZE_Y - 2);
    ctx.fillStyle = withAlpha(PAL.magenta, 0.5);
    ctx.fillRect(0, MAZE_Y - 3, W, 1);

    const diff = DIFFICULTY[st.difficulty];
    drawText(ctx, `SCORE ${String(st.score).padStart(6, '0')}`, 6, 2, { color: PAL.core, scale: 1 });
    drawText(ctx, `LEVEL ${String(st.level).padStart(2, '0')}`, 6, 12, { color: PAL.text, scale: 1 });
    drawText(ctx, `TIME ${String(Math.max(0, Math.ceil(st.time))).padStart(3, '0')}`, 110, 2, {
      color: st.time < 10 ? PAL.crimson : PAL.text,
      scale: 1,
    });
    drawText(ctx, diff.en, 110, 12, { color: diff.accent, scale: 1 });

    // 相位能量
    const t = TUNING[st.difficulty];
    const barX = 190;
    drawText(ctx, 'PHASE', barX, 2, { color: PAL.textDim, scale: 1 });
    for (let i = 0; i < t.charges; i += 1) {
      const filled = i < st.charges;
      ctx.fillStyle = filled ? PAL.cyan : 'rgba(38,230,255,0.16)';
      ctx.fillRect(barX + 30 + i * 8, 3, 6, 6);
    }
    if (st.charges < t.charges) {
      const p = st.chargeTimer / t.regen;
      ctx.fillStyle = withAlpha(PAL.cyanSoft, 0.5);
      ctx.fillRect(barX + 30, 8, Math.max(1, (t.charges * 8 - 2) * p), 1);
    }
    drawText(ctx, `ECHO ${echoes.length}/2`, barX, 12, { color: PAL.echo, scale: 1 });

    // 生命
    const lifeX = W - 8;
    for (let i = 0; i < 3; i += 1) {
      const on = i < st.lives;
      ctx.fillStyle = on ? PAL.magenta : 'rgba(255,46,136,0.18)';
      ctx.fillRect(lifeX - 8 - i * 10, 4, 7, 7);
      ctx.fillStyle = on ? PAL.cyan : 'rgba(38,230,255,0.18)';
      ctx.fillRect(lifeX - 7 - i * 10, 5, 5, 5);
    }
    drawText(ctx, 'SHIPS', lifeX, 12, { color: PAL.textDim, scale: 1, align: 'right' });

    // 连击
    if (st.combo > 1) {
      drawText(ctx, `x${Math.min(5, st.combo)}`, W - 8, 2, { color: PAL.core, scale: 1, align: 'right' });
    }
  }

  function drawFooter(ctx) {
    ctx.fillStyle = 'rgba(6,3,20,0.8)';
    ctx.fillRect(0, H - 8, W, 8);
    const remaining = crystals.filter((c) => c.alive).length;
    const tip = gate.unlocked ? 'GATE OPEN - REACH THE GATE' : `CRYSTALS LEFT ${remaining}`;
    drawText(ctx, tip, 6, H - 7, { color: gate.unlocked ? PAL.lime : PAL.textDim, scale: 1 });
    drawText(ctx, 'SPACE DASH   E ECHO', W - 6, H - 7, { color: PAL.textFaint, scale: 1, align: 'right' });
  }

  function render(ctx) {
    ctx.fillStyle = PAL.voidDeep;
    ctx.fillRect(0, 0, W, H);

    drawMaze(ctx);
    drawGate(ctx);
    drawCrystals(ctx);
    drawEchoes(ctx);
    drawEnemies(ctx);
    drawPlayer(ctx);
    drawParticles(ctx);
    drawFloats(ctx);
    drawHud(ctx);
    drawFooter(ctx);

    // 标题 / 横幅
    if (st.bannerT > 0) {
      const a = Math.min(1, st.bannerT * 1.6);
      ctx.globalAlpha = a;
      const by = 120;
      ctx.fillStyle = 'rgba(6,3,20,0.72)';
      ctx.fillRect(0, by - 6, W, 26);
      ctx.fillStyle = withAlpha(PAL.cyan, 0.6);
      ctx.fillRect(0, by - 6, W, 1);
      ctx.fillRect(0, by + 19, W, 1);
      drawNeonText(ctx, st.banner, W / 2, by, { color: PAL.text, glow: PAL.magenta, scale: 2, align: 'center' });
      ctx.globalAlpha = 1;
    }

    if (st.flash > 0) {
      ctx.fillStyle = withAlpha(PAL.crimson, st.flash * 0.4);
      ctx.fillRect(0, 0, W, H);
    }
  }

  /* --------------------------- 对外接口 --------------------------- */

  return {
    id: 'lattice',
    title: '晶格回廊',
    update,
    render,
    /** 由 main.js 在开始/重开时调用 */
    begin() {
      startGame();
    },
    restart() {
      startGame();
    },
    onPause() {
      shell.audio.music.stop();
    },
    onResume() {
      shell.audio.music.play('lattice');
    },
    /** 触屏方向 */
    touchDir(dir) {
      player.desired = dir;
    },
    /** 触屏动作按钮 */
    touchAction(name) {
      if (name === 'dash') tryDash();
      else if (name === 'echo') tryEcho();
    },
    isOver() {
      return st.phase === 'over';
    },
    scores: () => loadScores('lattice'),
  };
}
