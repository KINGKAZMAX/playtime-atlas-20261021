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
    app: '06-museum-main',
    file: 'scripts/sync-exhibits.mjs',
    upstream: '06-museum-core',
    find: "path.join(SIBLINGS, '05-museum-research'",
    replace: "path.join(SIBLINGS, '05-museum-catalog'",
    replaceAll: true,
    reason:
      '部署副本把上游 05-museum-research 重命名为 apps/05-museum-catalog（与 works.json 的 id 对齐），' +
      '而 06 的 prebuild（scripts/sync-exhibits.mjs）按上游目录名去父目录找兄弟任务，' +
      '找不到源 → 策展目录 139 条不生成 public/data/catalog.json，主站运行时 fetch 落空。' +
      '【状态】仅部署布局差异，上游 06-museum-core 本身无缺陷。',
    detected: '2026-10-21 部署构建：docs/works/06-museum-main/data/ 内缺少 catalog.json（同步日志显示策展目录回落为本地初版）。',
    upstreamFix:
      '无需上游修改。若上游希望目录名可配置，可让 sync-exhibits.mjs 通过环境变量或 manifest 字段读取兄弟任务目录名，' +
      '而不是硬编码上游目录名。',
  },
  {
    app: '07-museum-art',
    file: 'index.html',
    upstream: '07-museum-art',
    find: '<meta name="theme-color" content="#100F0E"/>',
    replace:
      '<meta name="theme-color" content="#100F0E"/>\n' +
      '<!-- 部署补丁：声明站点图标，避免浏览器自动请求 /favicon.ico 得 404 -->\n' +
      '<link rel="icon" href="./assets/icons/joystick.svg" type="image/svg+xml"/>',
    reason:
      '上游 07 的页面未声明 favicon，浏览器会自行请求 /favicon.ico 并得到 404。' +
      '13-qa-curation 把它记为 minor（「可上线，但有可标注的小瑕疵」），' +
      '但《HANDOFF-14.md》§四 第 2 项要求「网络面板零 404（含 /favicon.ico）」。' +
      '此处用 07 自己产出的既有图标（assets/icons/joystick.svg）声明，路径相对，兼容 Pages 子路径。',
    detected: '2026-10-21 线上复验（verify-online.mjs）：07-museum-art 出现 HTTP≥400 → 404 /favicon.ico。',
    upstreamFix: '在 07-museum-art/index.html 的 <head> 内加一行 <link rel="icon" href="./assets/icons/<图标>.svg">（用相对路径以兼容子路径）。',
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
    const out = p.replaceAll ? src.split(p.find).join(p.replace) : src.replace(p.find, p.replace);
    fs.writeFileSync(file, out);
    applied.push(p);
  }
  return applied;
}
