/**
 * 霓虹街廊 · 街机可玩展厅
 * src/core/bitmapFont.js — 原创 5×7 点阵字库
 *
 * 本字库为本项目手写设计（每字形 5 像素宽 × 7 像素高，1 像素字距），
 * 不引用任何现成像素字体文件或商业游戏字表。
 * 仅覆盖 ASCII 大写字母、数字与常用符号；小写字母自动映射为大写，
 * 与 1980 年代街机柜常见做法一致。中文文案一律由 DOM 层排版，
 * 不在画布上渲染，因此站点运行期零外部字体请求。
 *
 * 字形编码：'#' = 点亮，'.' = 熄灭，行以 '/' 分隔（自上而下 7 行）。
 */

const GLYPHS = {
  ' ': '...../...../...../...../...../...../.....',
  '!': '..#../..#../..#../..#../..#../...../..#..',
  '"': '.#.#./.#.#./...../...../...../...../.....',
  '#': '.#.#./.#.#./#####/.#.#./#####/.#.#./.#.#.',
  '$': '..#../.####/#.#../.###./..#.#/####./..#..',
  '%': '##..#/##..#/...#./..#../.#.../#..##/#..##',
  '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#',
  "'": '..#../..#../...../...../...../...../.....',
  '(': '...#./..#../.#.../.#.../.#.../..#../...#.',
  ')': '.#.../..#../...#./...#./...#./..#../.#...',
  '*': '...../#.#.#/.###./#####/.###./#.#.#/.....',
  '+': '...../..#../..#../#####/..#../..#../.....',
  ',': '...../...../...../...../.##../..#../.#...',
  '-': '...../...../...../#####/...../...../.....',
  '.': '...../...../...../...../...../.##../.##..',
  '/': '....#/...#./...#./..#../.#.../.#.../#....',
  '0': '.###./#...#/#..##/#.#.#/##..#/#...#/.###.',
  '1': '..#../.##../..#../..#../..#../..#../.###.',
  '2': '.###./#...#/....#/...#./..#../.#.../#####',
  '3': '#####/...#./..#../...#./....#/#...#/.###.',
  '4': '...#./..##./.#.#./#..#./#####/...#./...#.',
  '5': '#####/#..../####./....#/....#/#...#/.###.',
  '6': '..##./.#.../#..../####./#...#/#...#/.###.',
  '7': '#####/....#/...#./..#../.#.../.#.../.#...',
  '8': '.###./#...#/#...#/.###./#...#/#...#/.###.',
  '9': '.###./#...#/#...#/.####/....#/...#./.##..',
  ':': '...../.##../.##../...../.##../.##../.....',
  ';': '...../.##../.##../...../.##../..#../.#...',
  '<': '...#./..#../.#.../#..../.#.../..#../...#.',
  '=': '...../...../#####/...../#####/...../.....',
  '>': '.#.../..#../...#./....#/...#./..#../.#...',
  '?': '.###./#...#/....#/...#./..#../...../..#..',
  '@': '.###./#...#/....#/#.###/#.#.#/#.###/.###.',
  'A': '.###./#...#/#...#/#####/#...#/#...#/#...#',
  'B': '####./#...#/#...#/####./#...#/#...#/####.',
  'C': '.###./#...#/#..../#..../#..../#...#/.###.',
  'D': '###../#..#./#...#/#...#/#...#/#..#./###..',
  'E': '#####/#..../#..../####./#..../#..../#####',
  'F': '#####/#..../#..../####./#..../#..../#....',
  'G': '.###./#...#/#..../#.###/#...#/#...#/.####',
  'H': '#...#/#...#/#...#/#####/#...#/#...#/#...#',
  'I': '.###./..#../..#../..#../..#../..#../.###.',
  'J': '..###/...#./...#./...#./...#./#..#./.##..',
  'K': '#...#/#..#./#.#../##.../#.#../#..#./#...#',
  'L': '#..../#..../#..../#..../#..../#..../#####',
  'M': '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#',
  'N': '#...#/#...#/##..#/#.#.#/#..##/#...#/#...#',
  'O': '.###./#...#/#...#/#...#/#...#/#...#/.###.',
  'P': '####./#...#/#...#/####./#..../#..../#....',
  'Q': '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#',
  'R': '####./#...#/#...#/####./#.#../#..#./#...#',
  'S': '.####/#..../#..../.###./....#/....#/####.',
  'T': '#####/..#../..#../..#../..#../..#../..#..',
  'U': '#...#/#...#/#...#/#...#/#...#/#...#/.###.',
  'V': '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
  'W': '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#',
  'X': '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  'Y': '#...#/#...#/.#.#./..#../..#../..#../..#..',
  'Z': '#####/....#/...#./..#../.#.../#..../#####',
  '[': '.###./.#.../.#.../.#.../.#.../.#.../.###.',
  ']': '.###./...#./...#./...#./...#./...#./.###.',
  '^': '..#../.#.#./#...#/...../...../...../.....',
  '_': '...../...../...../...../...../...../#####',
  '|': '..#../..#../..#../..#../..#../..#../..#..',
  '~': '...../...../.#..#/#.#.#/#..#./...../.....',
};

export const GLYPH_W = 5;
export const GLYPH_H = 7;

/** 预解析成位掩码数组，避免每帧重复解析字符串 */
const MASKS = (() => {
  const out = new Map();
  for (const [ch, art] of Object.entries(GLYPHS)) {
    const rows = art.split('/').map((r) => {
      let m = 0;
      for (let i = 0; i < GLYPH_W; i += 1) {
        if (r[i] === '#') m |= 1 << (GLYPH_W - 1 - i);
      }
      return m;
    });
    out.set(ch, rows);
  }
  return out;
})();

function glyphFor(ch) {
  const upper = ch.toUpperCase();
  return MASKS.get(upper) || MASKS.get('?');
}

/** 单行文本宽度（像素） */
export function textWidth(text, scale = 1, spacing = 1) {
  const n = text.length;
  if (n === 0) return 0;
  return (n * (GLYPH_W + spacing) - spacing) * scale;
}

/**
 * 画布文字绘制。
 * opts: { color, scale, spacing, align:'left'|'center'|'right', shadow, shadowColor, alpha }
 */
export function drawText(ctx, text, x, y, opts = {}) {
  const {
    color = '#ffffff',
    scale = 1,
    spacing = 1,
    align = 'left',
    shadow = false,
    shadowColor = 'rgba(0,0,0,0.65)',
    alpha = 1,
  } = opts;

  const str = String(text);
  const w = textWidth(str, scale, spacing);
  let ox = x;
  if (align === 'center') ox = Math.round(x - w / 2);
  else if (align === 'right') ox = Math.round(x - w);
  const oy = Math.round(y);

  const paint = (dx, dy, fill) => {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fill;
    let cx = ox + dx;
    for (let i = 0; i < str.length; i += 1) {
      const rows = glyphFor(str[i]);
      let ry = 0;
      while (ry < GLYPH_H) {
        const m = rows[ry];
        if (!m) {
          ry += 1;
          continue;
        }
        // 同一行内按横向连续段合并像素，减少 fillRect 次数
        let rx = 0;
        while (rx < GLYPH_W) {
          if (!(m & (1 << (GLYPH_W - 1 - rx)))) {
            rx += 1;
            continue;
          }
          let run = 1;
          while (rx + run < GLYPH_W && m & (1 << (GLYPH_W - 1 - (rx + run)))) run += 1;
          ctx.fillRect(cx + rx * scale, dy + oy + ry * scale, run * scale, scale);
          rx += run;
        }
        ry += 1;
      }
      cx += (GLYPH_W + spacing) * scale;
    }
    ctx.globalAlpha = 1;
  };

  if (shadow) paint(scale, scale, shadowColor);
  paint(0, 0, color);
  return w;
}

/**
 * 带霓虹外发光的大标题。
 * 通过多次半透明偏移绘制模拟辉光，成本低且不依赖任何滤镜资源。
 * 刻意不使用 ctx.shadowBlur：Canvas2D 的模糊滤镜在每帧大字号下开销极高。
 */
export function drawNeonText(ctx, text, x, y, opts = {}) {
  const {
    color = '#ff2e88',
    glow = '#26e6ff',
    scale = 2,
    spacing = 1,
    align = 'left',
    glowLayers = 3,
  } = opts;

  const w = textWidth(text, scale, spacing);
  const ox = align === 'center' ? Math.round(x - w / 2) : align === 'right' ? Math.round(x - w) : Math.round(x);
  const oy = Math.round(y);

  ctx.save();
  for (let i = glowLayers; i >= 1; i -= 1) {
    ctx.globalAlpha = 0.13;
    drawText(ctx, text, ox - i, oy, { color: glow, scale, spacing, align: 'left' });
    drawText(ctx, text, ox + i, oy, { color: glow, scale, spacing, align: 'left' });
    drawText(ctx, text, ox, oy - i, { color: glow, scale, spacing, align: 'left' });
    drawText(ctx, text, ox, oy + i, { color: glow, scale, spacing, align: 'left' });
  }
  ctx.globalAlpha = 1;
  drawText(ctx, text, ox, oy, { color, scale, spacing, align: 'left' });
  ctx.restore();
  return w;
}

/**
 * 把霓虹标题预渲染成离屏画布。
 * 静态招牌每帧重复绘制 13 遍文字会产生上千次 fillRect，
 * 预渲染一次后每帧仅需一次 drawImage。
 */
export function makeNeonSprite(text, opts = {}) {
  const {
    color = '#ff2e88',
    glow = '#26e6ff',
    scale = 2,
    spacing = 1,
    glowLayers = 3,
  } = opts;

  const pad = scale * 4;
  const w = Math.ceil(textWidth(text, scale, spacing) + pad * 2);
  const h = Math.ceil(GLYPH_H * scale + pad * 2);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');

  for (let i = glowLayers; i >= 1; i -= 1) {
    g.globalAlpha = 0.13;
    drawText(g, text, pad - i, pad, { color: glow, scale, spacing });
    drawText(g, text, pad + i, pad, { color: glow, scale, spacing });
    drawText(g, text, pad, pad - i, { color: glow, scale, spacing });
    drawText(g, text, pad, pad + i, { color: glow, scale, spacing });
  }
  g.globalAlpha = 1;
  drawText(g, text, pad, pad, { color, scale, spacing });

  return { canvas, padX: pad, padY: pad };
}

