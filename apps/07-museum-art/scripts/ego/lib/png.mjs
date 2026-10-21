/**
 * 极简 PNG 解码器 —— 只为「截图是否平图」服务。
 *
 * 用途：Ego 的 `page.screenshot()` 落盘后，需要在 Node 侧判断这张图是不是
 * 一整片纯色（截图时合成器还没把内容画上去）。批次此前的做法是调 ImageMagick
 * 的 `convert`，但 Ego 的 nodejs 沙箱里跑不了外部命令，所以自带解码器。
 *
 * 只处理浏览器截图会产出的格式：8-bit、非隔行、
 * 颜色类型 0(灰度) / 2(真彩) / 4(灰度+Alpha) / 6(RGBA)。
 * 五种行滤波（None/Sub/Up/Average/Paeth）全部实现。
 */

import { readFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";

/** Paeth 预测器（PNG 规范 9.2.2） */
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * 解码 PNG 为原始像素（RGBA8）。
 * @param {Buffer} buf
 * @returns {{width:number,height:number,rgba:Buffer}}
 */
export function decodePng(buf) {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < sig.length; i++) {
    if (buf[i] !== sig[i]) throw new Error("不是 PNG 文件");
  }

  let off = 8;
  let ihdr = null;
  const idat = [];
  let palette = null;

  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") ihdr = data;
    else if (type === "IDAT") idat.push(data);
    else if (type === "PLTE") palette = data;
    else if (type === "IEND") break;
    off += 12 + len;
  }

  if (!ihdr) throw new Error("PNG 缺少 IHDR");
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const bitDepth = ihdr[8];
  const colorType = ihdr[9];
  const interlace = ihdr[12];

  if (bitDepth !== 8) throw new Error(`暂不支持 bitDepth=${bitDepth}`);
  if (interlace !== 0) throw new Error("暂不支持隔行 PNG");

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`未知 colorType=${colorType}`);
  if (colorType === 3 && !palette) throw new Error("索引色 PNG 缺少 PLTE");

  const raw = inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);

  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const rowStart = y * stride;
    const prevStart = rowStart - stride;
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[pos + x];
      const a = x >= bpp ? out[rowStart + x - bpp] : 0;
      const b = y > 0 ? out[prevStart + x] : 0;
      const c = x >= bpp && y > 0 ? out[prevStart + x - bpp] : 0;
      let v;
      switch (filter) {
        case 0: v = rawByte; break;
        case 1: v = rawByte + a; break;
        case 2: v = rawByte + b; break;
        case 3: v = rawByte + ((a + b) >> 1); break;
        case 4: v = rawByte + paeth(a, b, c); break;
        default: throw new Error(`未知行滤波 ${filter}`);
      }
      out[rowStart + x] = v & 0xff;
    }
    pos += stride;
  }

  /* 统一成 RGBA */
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0, n = width * height; i < n; i++) {
    const s = i * bpp;
    const d = i * 4;
    if (colorType === 0) {
      rgba[d] = rgba[d + 1] = rgba[d + 2] = out[s];
      rgba[d + 3] = 255;
    } else if (colorType === 2) {
      rgba[d] = out[s]; rgba[d + 1] = out[s + 1]; rgba[d + 2] = out[s + 2]; rgba[d + 3] = 255;
    } else if (colorType === 3) {
      const p = out[s] * 3;
      rgba[d] = palette[p]; rgba[d + 1] = palette[p + 1]; rgba[d + 2] = palette[p + 2]; rgba[d + 3] = 255;
    } else if (colorType === 4) {
      rgba[d] = rgba[d + 1] = rgba[d + 2] = out[s];
      rgba[d + 3] = out[s + 1];
    } else {
      rgba[d] = out[s]; rgba[d + 1] = out[s + 1]; rgba[d + 2] = out[s + 2]; rgba[d + 3] = out[s + 3];
    }
  }

  return { width, height, rgba };
}

/**
 * 灰度统计（用于判定「平图」）。
 * 抽样步长自适应，避免大图全量扫描。
 *
 * @param {string} filePath
 * @param {{maxSamples?: number}} [opts]
 */
export async function grayscaleStats(filePath, opts = {}) {
  const maxSamples = opts.maxSamples ?? 6000;
  const buf = await readFile(filePath);
  const { width, height, rgba } = decodePng(buf);
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / maxSamples)));
  let sum = 0;
  let sum2 = 0;
  let n = 0;
  let min = 255;
  let max = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const g = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
      sum += g;
      sum2 += g * g;
      if (g < min) min = g;
      if (g > max) max = g;
      n++;
    }
  }
  const mean = n ? sum / n : 0;
  const stddev = n ? Math.sqrt(Math.max(0, sum2 / n - mean * mean)) : 0;
  return { width, height, mean: round2(mean), stddev: round2(stddev), min: round2(min), max: round2(max), samples: n };
}

const round2 = (v) => Math.round(v * 100) / 100;

/**
 * 判定截图是否为「平图」（内容未被绘制）。
 * 阈值取 0.01 —— 正常页面截图的灰度标准差实测在 0.07 以上，
 * 纯色遮罩/空白画布则接近 0。
 */
export async function isFlat(filePath, threshold = 0.01) {
  try {
    const s = await grayscaleStats(filePath);
    return { flat: s.stddev < threshold, ...s };
  } catch (e) {
    return { flat: false, error: String(e.message || e) };
  }
}
