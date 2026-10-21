/**
 * 霓虹街廊 · 街机可玩展厅
 * src/games/lattice.js — 《晶格回廊》LATTICE CORRIDOR
 *
 * 原创机制：格子迷宫追逐。
 *   · 相位穿行（Phase Dash）：向前穿墙两格，消耗相位能量
 *   · 残响（Echo）：原地留下诱饵，吸引巡守 6 秒
 *   · 晶核连拾：连续拾取提升倍率
 * 与任何商业街机作品无素材或逐帧关联，机制参考的是"格子迷宫追逐"这一公共范式。
 *
 * 移动模型：格心锁定（grid-locked）。
 * 角色始终从格心出发、在格心之间匀速插值，只有抵达格心才允许转向，
 * 因此不会卡墙、不会抖动，判定与拾取也完全落在格子上。
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

const DIRS = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

/** 难度参数表 */
const TUNING = [
  { wisps: 2, wardens: 1, charges: 4, regen: 5.0, wispSpeed: 3.4, wardenSpeed: 3.7, time: 70, crystals: 10 },
  { wisps: 3, wardens: 2, charges: 3, regen: 7.0, wispSpeed: 4.0, wardenSpeed: 4.4, time: 60, crystals: 13 },
  { wisps: 4, wardens: 3, charges: 2, regen: 9.5, wispSpeed: 4.6, wardenSpeed: 5.1, time: 52, crystals: 16 },
];

function cellCenter(c, r) {
  return { x: MAZE_X + c * CELL + CELL / 2, y: MAZE_Y + r * CELL + CELL / 2 };
}

export function createLattice(shell) {
  let grid = [];
  let crystals = [];
  let gate = { c: 1, r: 1, unlocked: false, pulse: 0 };
  let enemies = [];
  let echoes = [];
  let particles = [];
  let floats = [];

  const st = {
    phase: 'play',       // play | over
    level: 1,
    score: 0,
    lives: 3,
    combo: 0,
    comboTimer: 0,
    time: 60,
    timeLimit: 60,
    charges: 3,
    chargeTimer: 0,
    invuln: 0,
    flash: 0,
    banner: null,
    bannerT: 0,
    difficulty: Math.max(0, Math.min(2, Number(shell.settings.difficulty) || 0)),
  };

  /** 玩家：格心锁定的移动体 */
  const player = {
    c: 1,
    r: 1,
    dir: 'left',
    desired: null,
    t: 0,
    next: null,
    dash: null,
    speed: 5.3,          // 格/秒
  };

  /* --------------------------- 移动原语 --------------------------- */

  function isWall(c, r) {
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return true;
    return grid[r][c] === 1;
  }

  function moverPos(e) {
    const a = cellCenter(e.c, e.r);
    if (!e.next) return a;
    const b = cellCenter(e.next.c, e.next.r);
    return { x: a.x + (b.x - a.x) * e.t, y: a.y + (b.y - a.y) * e.t };
  }

  /**
   * 推进一个格心锁定移动体。
   * chooseDir(e) 返回期望方向（由调用方决定），若不可通行则沿当前方向继续。
   */
  function stepMover(e, dt, speed, chooseDir) {
    // 站定在格心（尚未起步）或刚刚抵达格心：决定下一格
    if (!e.next || e.t >= 1) {
      if (e.next) {
        e.c = e.next.c;
        e.r = e.next.r;
        e.t = 0;
      }
      e.next = null;

      const wanted = chooseDir ? chooseDir(e) : null;
      if (wanted) {
        const d = DIRS[wanted];
        const nc = e.c + d[0];
        const nr = e.r + d[1];
        if (!isWall(nc, nr)) {
          e.dir = wanted;
          e.next = { c: nc, r: nr };
        }
      }
      if (!e.next) {
        // 期望方向被墙挡住时，沿当前方向继续（转向意图保留到下一格）
        const d = DIRS[e.dir];
        const nc = e.c + d[0];
        const nr = e.r + d[1];
        if (!isWall(nc, nr)) e.next = { c: nc, r: nr };
      }
    }
    if (e.next) {
      e.t += dt * speed;
      if (e.t >= 1) e.t = 1;
    }
  }

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
    gate = { c: best[0], r: best[1], unlocked: false, pulse: 0 };

    // 晶核
    crystals = [];
    const pool = cells.filter(([c, r]) => !(c === best[0] && r === best[1]) && !(c === 1 && r === 1));
    const count = Math.min(t.crystals + (level - 1) * 2, Math.max(0, pool.length - 4));
    const chosen = rng.shuffle(pool).slice(0, count);
    for (const [c, r] of chosen) {
      crystals.push({ c, r, alive: true, t: rng.float(0, 6.28) });
    }

    // 敌人
    enemies = [];
    const spawnPool = cells.filter(([c, r]) => Math.abs(c - 1) + Math.abs(r - 1) > 8);
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
    player.c = 1;
    player.r = 1;
    player.dir = 'left';
    player.desired = null;
    player.t = 0;
    player.next = null;
    player.dash = null;
    st.timeLimit = t.time + (level - 1) * 5;
    st.time = st.timeLimit;
    st.charges = t.charges;
    st.chargeTimer = 0;
    st.invuln = 1.2;
    st.combo = 0;
    st.comboTimer = 0;
  }

  function makeEnemy(kind, c, r) {
    const t = TUNING[st.difficulty];
    return {
      kind,
      c,
      r,
      dir: 'left',
      desired: null,
      t: 0,
      next: null,
      speed: kind === 'wisp' ? t.wispSpeed : t.wardenSpeed,
      wobble: Math.random() * 6.28,
    };
  }

  /* --------------------------- 敌人 AI --------------------------- */

  /** 从目标格出发的 BFS 距离场（巡守沿梯度下行） */
  function distanceField(tc, tr) {
    const dist = new Int32Array(COLS * ROWS).fill(-1);
    const q = new Int32Array(COLS * ROWS);
    let head = 0;
    let tail = 0;
    dist[tr * COLS + tc] = 0;
    q[tail] = tc;
    tail += 1;
    while (head < tail) {
      const c = q[head] % COLS;
      const r = (q[head] / COLS) | 0;
      head += 1;
      const d = dist[r * COLS + c] + 1;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dx;
        const nr = r + dy;
        if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
        if (isWall(nc, nr)) continue;
        const idx = nr * COLS + nc;
        if (dist[idx] !== -1) continue;
        dist[idx] = d;
        q[tail] = idx;
        tail += 1;
      }
    }
    return dist;
  }

  function updateEnemies(dt, field) {
    for (const e of enemies) {
      e.wobble += dt * 5;
      const choose = e.kind === 'warden'
        ? (en) => {
          if (!field) return null;
          const here = field[en.r * COLS + en.c];
          if (here < 0) return null;
          let bestDir = null;
          let bestD = here;
          for (const [key, [dx, dy]] of Object.entries(DIRS)) {
            const nc = en.c + dx;
            const nr = en.r + dy;
            if (isWall(nc, nr)) continue;
            const d = field[nr * COLS + nc];
            if (d >= 0 && d < bestD) {
              bestD = d;
              bestDir = key;
            }
          }
          return bestDir;
        }
        : (en) => {
          // 游丝：随机巡逻，偶发朝残响靠拢
          if (echoes.length && Math.random() < 0.06 && field) {
            const here = field[en.r * COLS + en.c];
            if (here > 0) {
              let bestDir = null;
              let bestD = here;
              for (const [key, [dx, dy]] of Object.entries(DIRS)) {
                const nc = en.c + dx;
                const nr = en.r + dy;
                if (isWall(nc, nr)) continue;
                const d = field[nr * COLS + nc];
                if (d >= 0 && d < bestD) {
                  bestD = d;
                  bestDir = key;
                }
              }
              if (bestDir) return bestDir;
            }
          }
          const keys = Object.keys(DIRS).filter((key) => {
            const d = DIRS[key];
            return !isWall(en.c + d[0], en.r + d[1]);
          });
          if (!keys.length) return null;
          return keys[Math.floor(Math.random() * keys.length)];
        };
      stepMover(e, dt, e.speed, choose);
    }
  }

  /* --------------------------- 玩家动作 --------------------------- */

  function tryDash() {
    if (st.charges <= 0 || player.dash) {
      if (st.charges <= 0) shell.audio.sfx.deny();
      return;
    }
    st.charges -= 1;
    const d = DIRS[player.dir];
    const from = moverPos(player);
    const tc = Math.max(0, Math.min(COLS - 1, player.c + d[0] * 2));
    const tr = Math.max(0, Math.min(ROWS - 1, player.r + d[1] * 2));
    const to = cellCenter(tc, tr);
    player.dash = { from, to, t: 0, dur: 0.22, c: tc, r: tr };
    player.t = 0;
    player.next = null;
    shell.audio.sfx.dash();
    for (let i = 0; i < 10; i += 1) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: from.x, y: from.y,
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
    const p = moverPos(player);
    echoes.push({ x: p.x, y: p.y, life: 6, max: 6, t: 0 });
    shell.audio.sfx.echo();
  }

  function playerPos() {
    if (player.dash) {
      const k = Math.min(1, player.dash.t / player.dash.dur);
      return {
        x: player.dash.from.x + (player.dash.to.x - player.dash.from.x) * k,
        y: player.dash.from.y + (player.dash.to.y - player.dash.from.y) * k,
      };
    }
    return moverPos(player);
  }

  /* --------------------------- 生命周期 --------------------------- */

  function startGame() {
    st.level = 1;
    st.score = 0;
    st.lives = 3;
    st.difficulty = Math.max(0, Math.min(2, Number(shell.settings.difficulty) || 0));
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
    const p = playerPos();
    floats.push({ x: p.x, y: p.y, text: reason, life: 1.2, color: PAL.crimson });
    if (st.lives <= 0) {
      gameOver();
      return;
    }
    st.invuln = 2.2;
    st.combo = 0;
    player.c = 1;
    player.r = 1;
    player.dir = 'left';
    player.desired = null;
    player.t = 0;
    player.next = null;
    player.dash = null;
    st.time = st.timeLimit;
    showBanner(`RETRY  ${st.lives} LEFT`, 1.2);
  }

  function gameOver() {
    st.phase = 'over';
    shell.audio.sfx.over();
    shell.audio.music.stop();
    const list = saveScore('lattice', st.score);
    shell.gameOver({
      gameId: 'lattice',
      title: '晶格回廊',
      titleEn: 'LATTICE CORRIDOR',
      score: st.score,
      detail: `抵达第 ${st.level} 层`,
      detailEn: `Reached corridor ${st.level}`,
      scores: list,
    });
  }

  function nextLevel() {
    st.level += 1;
    const bonus = 500 * st.level + Math.floor(st.time) * 10;
    st.score += bonus;
    const g = cellCenter(gate.c, gate.r);
    floats.push({ x: g.x, y: g.y, text: `+${bonus}`, life: 1.6, color: PAL.core });
    buildLevel(st.level);
    showBanner(`LEVEL ${st.level}`, 1.6);
    shell.audio.sfx.seal();
  }

  /* --------------------------- 更新 --------------------------- */

  function update(dt, input) {
    // 难度以设置面板为准，每帧同步，保证在设置中切换后立即生效
    st.difficulty = Math.max(0, Math.min(2, Number(shell.settings.difficulty) || 0));

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
      if (st.phase !== 'play') return;
    }

    // 连击
    if (st.comboTimer > 0) {
      st.comboTimer -= dt;
      if (st.comboTimer <= 0) st.combo = 0;
    }

    if (st.invuln > 0) st.invuln -= dt;

    // 移动
    if (player.dash) {
      player.dash.t += dt;
      if (player.dash.t >= player.dash.dur) {
        player.c = player.dash.c;
        player.r = player.dash.r;
        player.dash = null;
        player.t = 0;
        player.next = null;
      }
      if (Math.random() < 0.6) {
        const p = playerPos();
        particles.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.3, max: 0.3, color: PAL.cyanSoft, size: 2 });
      }
    } else {
      stepMover(player, dt, player.speed, (en) => {
        if (!en.desired) return null;
        if (en.desired === en.dir) {
          en.desired = null;
          return null;
        }
        return en.desired;
      });
      // 转向被墙挡住时保留意图，等下一格再试
      if (player.desired && player.desired === player.dir) player.desired = null;
    }

    // 晶核拾取（当前格，或已过半的下一格）
    const cellsToCheck = [[player.c, player.r]];
    if (player.next && player.t >= 0.5) cellsToCheck.push([player.next.c, player.next.r]);
    const p = playerPos();
    for (const cr of crystals) {
      if (!cr.alive) continue;
      if (!cellsToCheck.some(([c, r]) => c === cr.c && r === cr.r)) continue;
      cr.alive = false;
      st.combo += 1;
      st.comboTimer = 2.0;
      const mult = Math.min(5, st.combo);
      const gain = 100 * mult;
      st.score += gain;
      shell.audio.sfx.pick();
      floats.push({ x: p.x, y: p.y - 8, text: `${gain}`, life: 0.8, color: mult > 1 ? PAL.core : PAL.crystal });
      for (let i = 0; i < 6; i += 1) {
        const a = Math.random() * Math.PI * 2;
        particles.push({
          x: p.x, y: p.y, vx: Math.cos(a) * 34, vy: Math.sin(a) * 34,
          life: 0.36, max: 0.36, color: PAL.crystal, size: 1,
        });
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
    if (gate.unlocked && player.c === gate.c && player.r === gate.r) {
      nextLevel();
    }

    // 敌人
    const echo = echoes.length ? echoes[echoes.length - 1] : null;
    const target = echo || { x: p.x, y: p.y };
    const tc = Math.max(1, Math.min(COLS - 2, Math.floor((target.x - MAZE_X) / CELL)));
    const tr = Math.max(1, Math.min(ROWS - 2, Math.floor((target.y - MAZE_Y) / CELL)));
    const field = distanceField(tc, tr);
    updateEnemies(dt, field);

    // 敌人碰撞（演示模式下不结算伤害，用于展厅循环演示）
    if (st.invuln <= 0 && !shell.settings.demo) {
      for (const e of enemies) {
        const ep = moverPos(e);
        const dx = ep.x - p.x;
        const dy = ep.y - p.y;
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
        ctx.fillStyle = withAlpha(PAL.violet, 0.16);
        ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
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
    ctx.strokeStyle = withAlpha(PAL.cyan, 0.35);
    ctx.lineWidth = 1;
    ctx.strokeRect(MAZE_X - 0.5, MAZE_Y - 0.5, COLS * CELL + 1, ROWS * CELL + 1);
  }

  function drawCrystals(ctx) {
    for (const cr of crystals) {
      if (!cr.alive) continue;
      const x = MAZE_X + cr.c * CELL + CELL / 2 - 3;
      const y = MAZE_Y + cr.r * CELL + CELL / 2 - 3;
      const pulse = 0.6 + 0.4 * Math.sin(cr.t * 4);
      ctx.fillStyle = withAlpha(PAL.crystal, 0.16 * pulse);
      ctx.fillRect(x - 3, y - 3, 12, 12);
      drawSprite(ctx, SPRITES.crystal, x, y, 1);
    }
  }

  function drawGate(ctx) {
    const x = MAZE_X + gate.c * CELL + CELL / 2 - 4;
    const y = MAZE_Y + gate.r * CELL + CELL / 2 - 4;
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
      const ep = moverPos(e);
      const x = Math.round(ep.x - 4);
      const y = Math.round(ep.y - 4);
      const wob = Math.sin(e.wobble) * 0.6;
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
    const p = playerPos();
    const x = Math.round(p.x - 4);
    const y = Math.round(p.y - 4);
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
    titleEn: 'LATTICE CORRIDOR',
    update,
    render,
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
    /** 供自动化验收读取内部状态（tests/logic.test.mjs） */
    snapshot() {
      const p = playerPos();
      return {
        phase: st.phase,
        level: st.level,
        score: st.score,
        lives: st.lives,
        charges: st.charges,
        difficulty: st.difficulty,
        crystalsLeft: crystals.filter((c) => c.alive).length,
        totalCrystals: crystals.length,
        crystals: crystals.map((c) => ({ c: c.c, r: c.r, alive: c.alive })),
        gate: { c: gate.c, r: gate.r, unlocked: gate.unlocked },
        gateOpen: gate.unlocked,
        echoes: echoes.length,
        enemies: enemies.length,
        player: {
          x: p.x,
          y: p.y,
          c: player.c,
          r: player.r,
          dir: player.dir,
          next: player.next ? { c: player.next.c, r: player.next.r } : null,
        },
        grid: grid.map((row) => row.slice()),
      };
    },
    scores: () => loadScores('lattice'),
  };
}
