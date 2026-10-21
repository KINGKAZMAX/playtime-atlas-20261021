import { DIRS } from '../data/levels.js';

/**
 * 《折光阁》的纯逻辑层：光路演算、关卡状态、撤销栈。
 * 与渲染完全解耦，便于单独测试。
 */

/** 反光板反射表。rot 0 = '/'，rot 1 = '\'。 */
const REFLECT = [
  // '/'：E→N, N→E, W→S, S→W
  { 0: 3, 3: 0, 2: 1, 1: 2 },
  // '\'：E→S, S→E, W→N, N→W
  { 0: 1, 1: 0, 3: 2, 2: 3 },
];

export function reflect(dir, rot) {
  const table = REFLECT[rot === 0 ? 0 : 1];
  return table[dir];
}

export const ROTATABLE = new Set(['mirror', 'splitter', 'dispersion']);

export class PuzzleState {
  constructor(level) {
    this.level = level;
    this.cellMap = new Map();
    for (const el of level.elements) this.cellMap.set(`${el.x},${el.y}`, el);
    this.moteCells = new Map(level.motes.map(([x, y], i) => [`${x},${y}`, i]));
    this.undoStack = [];
    this.reset();
  }

  /* ---------------- 基础访问 ---------------- */

  elementAt(x, y) {
    return this.cellMap.get(`${x},${y}`) || null;
  }

  terrainAt(x, y) {
    const row = this.level.terrain[y];
    if (row == null) return ' ';
    return row[x] ?? ' ';
  }

  isInside(x, y) {
    return x >= 0 && y >= 0 && x < this.level.width && y < this.level.height;
  }

  /** 该格是否可站立。 */
  isWalkable(x, y) {
    if (!this.isInside(x, y)) return false;
    if (this.terrainAt(x, y) !== '.') return false;
    const el = this.elementAt(x, y);
    if (!el) return true;
    if (el.type === 'gate') return !this.isGateOpen(el);
    return true;
  }

  isGateOpen(gate) {
    const plate = this.level.elements.find((e) => e.id === gate.link && e.type === 'plate');
    if (!plate) return true;
    const until = this.plateUntil[plate.id] || 0;
    return until > this.now();
  }

  now() {
    return performance.now();
  }

  /* ---------------- 状态 ---------------- */

  reset() {
    this.rots = {};
    for (const el of this.level.elements) {
      if (ROTATABLE.has(el.type)) this.rots[el.id] = el.rot;
    }
    this.player = { x: this.level.player.x, y: this.level.player.y };
    this.collected = new Set();
    this.plateUntil = {};
    this.undoStack = [];
    this.startedAt = 0;
    this.elapsed = 0;
  }

  snapshot() {
    return {
      rots: { ...this.rots },
      player: { ...this.player },
      collected: Array.from(this.collected),
      plateUntil: { ...this.plateUntil },
    };
  }

  restore(snap) {
    this.rots = { ...snap.rots };
    this.player = { ...snap.player };
    this.collected = new Set(snap.collected);
    this.plateUntil = { ...snap.plateUntil };
  }

  pushUndo() {
    this.undoStack.push(this.snapshot());
    if (this.undoStack.length > 60) this.undoStack.shift();
  }

  undo() {
    const snap = this.undoStack.pop();
    if (!snap) return false;
    this.restore(snap);
    return true;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  /* ---------------- 操作 ---------------- */

  canRotate(id) {
    const el = this.level.elements.find((e) => e.id === id);
    if (!el || !ROTATABLE.has(el.type)) return false;
    const p = this.player;
    if (p.x === el.x && p.y === el.y) return true;
    return Math.abs(p.x - el.x) + Math.abs(p.y - el.y) === 1;
  }

  /** 旋转元件。dir 为 0 时为 +1（顺时针），为 1 时为 -1。 */
  rotate(id, dir = 0) {
    const el = this.level.elements.find((e) => e.id === id);
    if (!el || !ROTATABLE.has(el.type)) return false;
    if (!this.canRotate(id)) return false;
    this.pushUndo();
    if (el.type === 'mirror') {
      this.rots[id] = this.rots[id] === 0 ? 1 : 0;
    } else {
      this.rots[id] = (this.rots[id] + (dir === 0 ? 1 : 3)) % 4;
    }
    return true;
  }

  /** 移动玩家。dx/dy 为格点方向。 */
  move(dx, dy) {
    const nx = this.player.x + dx;
    const ny = this.player.y + dy;
    if (!this.isWalkable(nx, ny)) return false;
    this.pushUndo();
    this.player.x = nx;
    this.player.y = ny;

    // 拾取光点
    const key = `${nx},${ny}`;
    if (this.moteCells.has(key)) this.collected.add(key);

    // 触发余辉压板
    const el = this.elementAt(nx, ny);
    if (el && el.type === 'plate') {
      this.plateUntil[el.id] = this.now() + (el.duration || 12000);
    }
    return true;
  }

  /* ---------------- 光路演算 ---------------- */

  /**
   * 计算当前光路。
   * @returns {{segs: Array, lit: Set, mismatch: Set, paths: Map}}
   */
  computeLight() {
    const level = this.level;
    const segs = [];
    const lit = new Set();
    const mismatch = new Set();
    const paths = new Map();

    const queue = level.elements
      .filter((el) => el.type === 'emitter')
      .map((el) => ({ x: el.x, y: el.y, dir: el.dir, color: el.color || 'W', visited: new Set(), from: el.id }));

    let guard = 0;
    while (queue.length && guard < 400) {
      guard += 1;
      const beam = queue.shift();
      let { x, y, dir, color } = beam;
      let hops = 0;

      while (hops < 240) {
        hops += 1;
        const d = DIRS[dir];
        const nx = x + d.x;
        const ny = y + d.y;

        if (!this.isInside(nx, ny)) {
          segs.push({ x1: x, y1: y, x2: nx, y2: ny, color, dir, edge: true });
          break;
        }

        const key = `${nx},${ny},${dir},${color}`;
        if (beam.visited.has(key)) break;
        beam.visited.add(key);

        segs.push({ x1: x, y1: y, x2: nx, y2: ny, color, dir });

        x = nx;
        y = ny;

        const terrain = this.terrainAt(x, y);
        if (terrain === '#') break; // 立柱挡光

        const el = this.elementAt(x, y);
        if (!el) continue;

        if (el.type === 'gate') {
          if (!this.isGateOpen(el)) break;
          continue;
        }
        if (el.type === 'receiver') {
          if (el.color === color) {
            lit.add(el.id);
            if (!paths.has(el.id)) paths.set(el.id, []);
            paths.get(el.id).push({ x, y, color });
          } else {
            mismatch.add(el.id);
          }
          break;
        }
        if (el.type === 'mirror') {
          dir = reflect(dir, this.rots[el.id] ?? el.rot);
          continue;
        }
        if (el.type === 'splitter') {
          const branchDir = this.rots[el.id] ?? el.rot;
          if (branchDir !== dir) {
            queue.push({ x, y, dir: branchDir, color, visited: new Set(beam.visited), from: beam.from });
          }
          continue;
        }
        if (el.type === 'dispersion') {
          const branchDir = this.rots[el.id] ?? el.rot;
          const branchColor = color === 'W' ? 'C' : color;
          const straightColor = color === 'W' ? 'M' : color;
          color = straightColor;
          if (branchDir !== dir) {
            queue.push({ x, y, dir: branchDir, color: branchColor, visited: new Set(beam.visited), from: beam.from });
          }
          continue;
        }
        // emitter / plate / platform / mote：光可穿过
      }
    }

    return { segs, lit, mismatch, paths };
  }

  receivers() {
    return this.level.elements.filter((el) => el.type === 'receiver');
  }

  /** 全部接收环点亮即通关。 */
  isComplete(light = this.computeLight()) {
    const rs = this.receivers();
    if (!rs.length) return false;
    return rs.every((r) => light.lit.has(r.id));
  }

  /** 找出第一个与推荐解法不一致的可旋转元件。 */
  findHint() {
    for (const el of this.level.elements) {
      if (!ROTATABLE.has(el.type)) continue;
      if (el.solution == null) continue;
      if ((this.rots[el.id] ?? el.rot) !== el.solution) return el;
    }
    return null;
  }

  /** 浮台在时刻 t 所在的格点（往返运动）。 */
  platformCell(el, t) {
    const path = el.path || [[el.x, el.y]];
    if (path.length === 1) return { x: path[0][0], y: path[0][1] };
    const period = el.period || 6000;
    const cycle = (t % period) / period; // 0..1
    const half = 1 / (path.length - 1 + 1); // 简化：两段路径各占一半
    const phase = cycle < 0.5 ? cycle / 0.5 : (1 - cycle) / 0.5;
    const idx = phase * (path.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(path.length - 1, i0 + 1);
    const f = idx - i0;
    return {
      x: path[i0][0] + (path[i1][0] - path[i0][0]) * f,
      y: path[i0][1] + (path[i1][1] - path[i0][1]) * f,
    };
  }
}
