/**
 * 霓虹街廊 · 街机可玩展厅
 * src/core/sprites.js — 原创像素造型表
 *
 * 所有造型为本项目手绘（字符点阵），不含任何商业游戏角色、商标或
 * 从 ROM 中提取的像素素材。配色以单字符键映射，随画布调色板渲染。
 */

export const SPRITES = {
  /** 拾光者：晶格回廊的玩家角色，8×8 */
  lumen: [
    '..oooo..',
    '.obggbo.',
    '.obggbo.',
    '..obbo..',
    '.obbbbo.',
    '.obbbbo.',
    '..oooo..',
    '.o.oo.o.',
  ],

  /** 游丝：巡逻型敌人，6×6 */
  wisp: [
    '..ww..',
    '.wggw.',
    'wggggw',
    'wggggw',
    '.wggw.',
    '..ww..',
  ],

  /** 巡守：追踪型敌人，8×8 */
  warden: [
    '.o....o.',
    'orrgggro',
    'orrgggro',
    'orrrrrro',
    '.orgggro.',
    '..rrrr..',
    '.r.rr.r.',
    '..o..o..',
  ],

  /** 晶核：可拾取物，6×6 */
  crystal: [
    '..cc..',
    '.cCCc.',
    'cCCCCc',
    'cCCCCc',
    '.cCCc.',
    '..cc..',
  ],

  /** 归途门：出口，8×8 */
  gate: [
    '..gggg..',
    '.g....g.',
    'g..gg..g',
    'g.g..g.g',
    'g.g..g.g',
    'g..gg..g',
    '.g....g.',
    '..gggg..',
  ],

  /** 穿云：陨星纵队的玩家机体，12×10 */
  skiff: [
    '....ww......',
    '...wwww.....',
    '...wggw.....',
    '..wwggww....',
    '.wwcggcww...',
    'wwcccccccww.',
    'wwcccccccww.',
    '.wwwwwwww...',
    '..w......w..',
    '.ww......ww.',
  ],
};

/** 造型 → 颜色表 */
export const SPRITE_PALETTE = {
  o: '#120a2e',
  b: '#ff2e88',
  g: '#26e6ff',
  w: '#8b6bff',
  c: '#7dfcff',
  C: '#e6ffff',
};

/**
 * 把点阵造型画到画布上。
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[][]} sprite 点阵（每行一个字符串）
 * @param {number} x 左上角
 * @param {number} y 左上角
 * @param {number} scale 每像素边长
 * @param {Record<string,string>} [palette] 覆盖默认配色
 */
export function drawSprite(ctx, sprite, x, y, scale = 1, palette = SPRITE_PALETTE) {
  for (let ry = 0; ry < sprite.length; ry += 1) {
    const row = sprite[ry];
    for (let rx = 0; rx < row.length; rx += 1) {
      const ch = row[rx];
      if (ch === '.' || ch === ' ') continue;
      ctx.fillStyle = palette[ch] || '#ffffff';
      ctx.fillRect(x + rx * scale, y + ry * scale, scale, scale);
    }
  }
}

/** 造型尺寸 */
export function spriteSize(sprite) {
  return {
    w: sprite[0].length,
    h: sprite.length,
  };
}
