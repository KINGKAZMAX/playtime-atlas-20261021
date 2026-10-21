/**
 * 10-era-console — 等距测绘所
 * 展品热点定义（数据层，纯数据，可在 Node 中校验）
 *
 * 位置以"期望网格坐标"给出，运行时会被吸附到附近合适且未被占用的地块上，
 * 保证热点始终落在可站立的地面上。
 */

export const HOTSPOTS = [
  {
    id: 'arcade-cabinet',
    kind: 'cabinet',
    label: '街机柜 · 第一台',
    exhibit: 'snes-1990',
    want: [9, 8],
    hint: '家用机与街机基板同源',
  },
  {
    id: 'cartridge-shelf',
    kind: 'shelf',
    label: '晶盒陈列架',
    exhibit: 'mega-drive',
    want: [12, 9],
    hint: '容量换算与卡带时代',
  },
  {
    id: 'disc-tower',
    kind: 'tower',
    label: '光盘塔',
    exhibit: 'playstation-cd',
    want: [15, 8],
    hint: '光轨、读取与容量',
  },
  {
    id: 'polygon-desk',
    kind: 'polygon',
    label: '多边形工位',
    exhibit: 'zbuffer',
    want: [18, 9],
    hint: '深度缓冲如何排前后',
  },
  {
    id: 'scanline-desk',
    kind: 'scope',
    label: '扫描线示波台',
    exhibit: 'mode7',
    want: [21, 8],
    hint: '逐行仿射变换',
  },
  {
    id: 'visor-stand',
    kind: 'visor',
    label: '双筒目镜台',
    exhibit: 'virtual-boy',
    want: [10, 12],
    hint: '用视差伪造纵深',
  },
  {
    id: 'handheld-case',
    kind: 'case',
    label: '掌机展柜',
    exhibit: 'gbc',
    want: [13, 12],
    hint: '彩色屏与向下兼容',
  },
  {
    id: 'pc-desk',
    kind: 'pc',
    label: 'PC 工程台',
    exhibit: 'marty',
    want: [16, 12],
    hint: '把桌面机搬进客厅',
  },
  {
    id: 'ruler',
    kind: 'ruler',
    label: '测绘标尺',
    exhibit: 'framerate',
    want: [20, 12],
    hint: '每秒多少帧',
  },
];

/**
 * 把热点吸附到地形上合适的位置。
 * @param {object} terrain generateTerrain() 的结果
 * @param {Set<string>} occupied 已占用网格键
 * @returns {Array} 放置好的热点（含 tx/ty/height）
 */
export function placeHotspots(terrain, occupied = new Set()) {
  const used = new Set(occupied);
  const placed = [];

  for (const spot of HOTSPOTS) {
    const [wx, wy] = spot.want;
    let best = null;
    let bestScore = Infinity;

    for (let r = 0; r <= 5 && !best; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const gx = wx + dx;
          const gy = wy + dy;
          if (gx < 1 || gy < 1 || gx >= terrain.w - 1 || gy >= terrain.h - 1) continue;
          const key = `${gx},${gy}`;
          if (used.has(key)) continue;
          const level = terrain.heights[gy * terrain.w + gx];
          if (level < 2) continue;            // 只放在草地及以上
          const score = Math.abs(dx) + Math.abs(dy);
          if (score < bestScore) {
            bestScore = score;
            best = { gx, gy, level };
          }
        }
      }
      if (best) break;
    }

    if (!best) {
      // 兜底：直接使用期望坐标（极端地形下仍保证热点数量）
      best = {
        gx: Math.min(terrain.w - 2, Math.max(1, wx)),
        gy: Math.min(terrain.h - 2, Math.max(1, wy)),
        level: terrain.heights[Math.min(terrain.h - 1, wy) * terrain.w + Math.min(terrain.w - 1, wx)],
      };
    }

    used.add(`${best.gx},${best.gy}`);
    placed.push({ ...spot, tx: best.gx, ty: best.gy, height: best.level });
  }

  return placed;
}
