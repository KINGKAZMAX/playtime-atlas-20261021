/**
 * 10-era-console — 色块远征 / CHROMA VOYAGE
 * 瓦片 AABB 碰撞核心（纯函数，无 DOM 依赖，可在 Node 中单测）
 *
 * 设计要点（原创实现，机制对标经典横版平台跳跃，非任何商业作品的代码或数据）：
 *  - 分轴求解：先 X 后 Y，避免"卡墙/蹭顶"抖动
 *  - 单向平台（=）：只在下落且上一帧脚底不低于平台面时承接
 *  - 限速防穿透：下落速度上限小于瓦片高度，保证单帧最多检测一行
 */

export const TILE = 16;

/** 字符 → 语义 */
export const TILE_SOLID = '#';      // 实心
export const TILE_ONEWAY = '=';     // 单向平台
export const TILE_SPIKE = '^';      // 尖刺（危险，不实心）
export const TILE_LIQUID = '~';     // 色浆（危险，不实心）
export const TILE_EMPTY = '.';

/** 该瓦片是否阻挡水平 / 垂直移动 */
export function isSolidChar(ch) {
  return ch === TILE_SOLID;
}

/** 该瓦片是否是危险物 */
export function isHazardChar(ch) {
  return ch === TILE_SPIKE || ch === TILE_LIQUID;
}

/** 读取瓦片字符；越界视为空（左右越界 = 空，下方越界 = 空，上方越界 = 空） */
export function tileChar(level, tx, ty) {
  if (ty < 0 || ty >= level.height) return TILE_EMPTY;
  if (tx < 0 || tx >= level.width) return TILE_EMPTY;
  return level.grid[ty * level.width + tx];
}

export function isSolid(level, tx, ty) {
  return isSolidChar(tileChar(level, tx, ty));
}

/** 向下探测落脚点：返回可站立的 y（像素），无则返回 null */
export function probeGround(body, level, epsilon = 1) {
  const footY = body.y + body.h;
  const tx0 = Math.floor(body.x / TILE);
  const tx1 = Math.floor((body.x + body.w - 1) / TILE);
  const ty = Math.floor((footY + epsilon) / TILE);
  for (let tx = tx0; tx <= tx1; tx++) {
    const ch = tileChar(level, tx, ty);
    if (isSolidChar(ch)) return ty * TILE;
  }
  return null;
}

/**
 * 位移 + 碰撞解算。
 * body: { x, y, w, h, vx, vy }
 * 返回 { left, right, top, bottom } 命中标记
 */
export function moveAndCollide(body, level) {
  const res = { left: false, right: false, top: false, bottom: false };

  // ---------- X 轴 ----------
  body.x += body.vx;
  if (body.vx > 0) {
    const right = Math.floor((body.x + body.w - 1) / TILE);
    const top = Math.floor(body.y / TILE);
    const bottom = Math.floor((body.y + body.h - 1) / TILE);
    for (let ty = top; ty <= bottom; ty++) {
      if (isSolid(level, right, ty)) {
        body.x = right * TILE - body.w;
        body.vx = 0;
        res.right = true;
        break;
      }
    }
  } else if (body.vx < 0) {
    const left = Math.floor(body.x / TILE);
    const top = Math.floor(body.y / TILE);
    const bottom = Math.floor((body.y + body.h - 1) / TILE);
    for (let ty = top; ty <= bottom; ty++) {
      if (isSolid(level, left, ty)) {
        body.x = (left + 1) * TILE;
        body.vx = 0;
        res.left = true;
        break;
      }
    }
  }

  // ---------- Y 轴 ----------
  const prevBottom = body.y + body.h;

  if (body.vy > 0) {
    body.y += body.vy;
    const newBottom = body.y + body.h;
    // 本帧扫过的行区间（脚底从 prevBottom 下降到 newBottom）
    const rowStart = Math.floor(prevBottom / TILE);
    const rowEnd = Math.floor(newBottom / TILE);
    const left = Math.floor(body.x / TILE);
    const right = Math.floor((body.x + body.w - 1) / TILE);
    outer: for (let r = rowStart; r <= rowEnd; r++) {
      for (let tx = left; tx <= right; tx++) {
        const ch = tileChar(level, tx, r);
        const solid = isSolidChar(ch);
        // 单向平台：只有在本帧开始时脚底还在平台面之上，才承接
        const oneway = ch === TILE_ONEWAY && prevBottom <= r * TILE;
        if (solid || oneway) {
          body.y = r * TILE - body.h;
          body.vy = 0;
          res.bottom = true;
          break outer;
        }
      }
    }
  } else if (body.vy < 0) {
    body.y += body.vy;
    const topRow = Math.floor(body.y / TILE);
    const left = Math.floor(body.x / TILE);
    const right = Math.floor((body.x + body.w - 1) / TILE);
    for (let tx = left; tx <= right; tx++) {
      if (isSolid(level, tx, topRow)) {
        body.y = (topRow + 1) * TILE;
        body.vy = 0;
        res.top = true;
        break;
      }
    }
  }

  return res;
}

/** AABB 相交检测 */
export function overlaps(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/** 采样 body 覆盖的所有瓦片，找出危险瓦片 */
export function touchesHazard(body, level) {
  const x0 = Math.floor(body.x / TILE);
  const x1 = Math.floor((body.x + body.w - 1) / TILE);
  const y0 = Math.floor(body.y / TILE);
  const y1 = Math.floor((body.y + body.h - 1) / TILE);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (isHazardChar(tileChar(level, tx, ty))) return true;
    }
  }
  return false;
}
