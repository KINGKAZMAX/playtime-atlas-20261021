/** 探测 06：Ego 运行时能否用 node:zlib 解 PNG（用于「平图」检测） */
export async function run(cfg) {
  const out = {};
  try {
    const zlib = await import("node:zlib");
    const fs = await import("node:fs/promises");
    out.zlib = typeof zlib.inflateSync === "function";
    out.fs = typeof fs.readFile === "function";

    const task = await taskSpace(cfg.spaceName || "07-museum-art ego-qa");
    const page = await task.newPage();
    await page.goto(`${cfg.base}/index.html`, { waitUntil: "commit", timeout: 30000 });
    await page.waitForLoadState("load", { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const p = `${cfg.outDir}/probe06.png`;
    await page.screenshot({ path: p });
    const buf = await fs.readFile(p);
    out.pngBytes = buf.length;
    out.pngSig = [...buf.slice(0, 8)];

    /* 最小 PNG 解析：读 IHDR，取 IDAT，解压后按 filter 还原像素 */
    let off = 8;
    const chunks = {};
    const idat = [];
    while (off < buf.length) {
      const len = buf.readUInt32BE(off);
      const type = buf.toString("ascii", off + 4, off + 8);
      const data = buf.slice(off + 8, off + 8 + len);
      if (type === "IDAT") idat.push(data);
      else chunks[type] = data;
      off += 12 + len;
    }
    const ihdr = chunks.IHDR;
    out.width = ihdr.readUInt32BE(0);
    out.height = ihdr.readUInt32BE(4);
    out.bitDepth = ihdr[8];
    out.colorType = ihdr[9];
    const raw = zlib.inflateSync(Buffer.concat(idat));
    out.rawBytes = raw.length;

    /* 灰度采样：只统计每 N 行每 N 列的像素，够判平图 */
    const w = out.width;
    const h = out.height;
    const bpp = out.colorType === 6 ? 4 : out.colorType === 2 ? 3 : 1;
    const stride = w * bpp;
    let sum = 0;
    let sum2 = 0;
    let n = 0;
    const stepY = Math.max(1, Math.floor(h / 60));
    const stepX = Math.max(1, Math.floor(w / 60));
    for (let y = 0; y < h; y += stepY) {
      const rowStart = y * (stride + 1);
      const filter = raw[rowStart];
      if (filter !== 0) { out.note = "filter=" + filter + "（当前仅支持 filter 0）"; break; }
      for (let x = 0; x < w; x += stepX) {
        const p0 = rowStart + 1 + x * bpp;
        const g = bpp >= 3 ? 0.299 * raw[p0] + 0.587 * raw[p0 + 1] + 0.114 * raw[p0 + 2] : raw[p0];
        sum += g;
        sum2 += g * g;
        n++;
      }
    }
    const mean = sum / n;
    out.stddev = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
    out.samples = n;
  } catch (e) {
    out.error = String(e.message || e);
  }
  console.log("PROBE6 " + JSON.stringify(out, null, 2));
  return { reportPath: "(probe)", probe: out };
}
