/**
 * 部署补丁层 —— 只作用于**部署副本**（apps/），不修改任何上游任务目录。
 *
 * 每条补丁必须写明：上游任务、文件、问题现象与修复内容。
 * 上游修好后删除对应补丁即可，补丁会随下次 sync 自动失效。
 */

import fs from 'node:fs';
import path from 'node:path';

export const PATCHES = [
  {
    app: '04-frostgap-voyager',
    file: 'src/gfx/Procedural.js',
    upstream: '04-spaceflight',
    find: '  const img = ctx.createImageData(width, 4);\n  const noise2 = makeNoise2D(seed);',
    replace:
      '  const img = ctx.createImageData(width, 4);\n' +
      '  const data = img.data; // 部署补丁：原实现缺少此声明，运行时抛 ReferenceError: data is not defined\n' +
      '  const noise2 = makeNoise2D(seed);',
    reason:
      'makeRingTexture() 使用 data[idx] 写入像素但未声明 data，构建后压缩包把它留成自由变量，' +
      '启动即抛 ReferenceError: data is not defined（行星环系构建阶段中断）。' +
      '【状态】上游 04-spaceflight 已于 2026-10-21 自行修复；本补丁保留为回归保护，' +
      '仅在部署副本再次出现同一缺陷时自动生效。',
    detected: '2026-10-21 线上实机验收：深空漫游「塑造维岚」步骤失败，浏览器控制台 ReferenceError。',
    upstreamFix: '在 04-spaceflight/src/gfx/Procedural.js 的 makeRingTexture() 中补一行 const data = img.data;',
  },
  {
    app: '03-interaction',
    file: 'package.json',
    upstream: '03-interaction',
    json: true,
    mutate: (pkg) => {
      if (pkg.scripts && pkg.scripts.build === 'npm run fonts && vite build') {
        pkg.scripts.build = 'vite build';
        return 'build 脚本去掉 `npm run fonts` 前置步骤';
      }
      return null;
    },
    reason:
      '字体子集构建脚本需要 `scripts/fetch-sources.sh` 下载的 Noto Serif SC 原始字型，' +
      '该字型不在仓库内（体积大且不适合入库），导致构建在字体步骤即失败。' +
      '上游已把生成好的子集字体提交在 public/fonts/ 内，部署无需重新生成。',
    detected: '2026-10-21 部署构建：npm run fonts 报「缺少 Noto Serif SC 原始字型」。',
    upstreamFix:
      '让字体子集与原始字型解耦：要么把原始字型纳入构建前置下载步骤（CI 缓存），' +
      '要么提供 `npm run build:offline` 跳过重新生成、直接使用已提交的子集。',
  },
];

/**
 * 把补丁应用到部署副本。
 * @param {string} appName  部署副本目录名（如 deep-space-drifter）
 * @param {string} appDir   部署副本绝对路径
 * @returns {Array} 已应用的补丁
 */
export function applyPatches(appName, appDir) {
  const applied = [];
  for (const p of PATCHES) {
    if (p.app !== appName) continue;
    const file = path.join(appDir, p.file);
    if (!fs.existsSync(file)) continue;

    if (p.json) {
      const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
      const note = p.mutate(pkg);
      if (note) {
        fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
        applied.push({ ...p, note });
      }
      continue;
    }

    const src = fs.readFileSync(file, 'utf8');
    if (!src.includes(p.find)) continue;
    fs.writeFileSync(file, src.replace(p.find, p.replace));
    applied.push(p);
  }
  return applied;
}
