/**
 * Validate the shipped GLB and refresh the model index.
 *
 * The model lives in `public/models/` so that a plain `vite build` copies it
 * into the build output — a project-root `models/` directory would be invisible
 * to Vite and would be lost by anyone who builds or ships this project on its
 * own. This script therefore has exactly one source of truth and never
 * duplicates the file:
 *
 *   public/models/abyss-salvager-ac-vii.glb      ← the model
 *   public/models/assets.manifest.json           ← the index (generated)
 *
 * The runtime export (`npm run capture`) writes straight to the canonical
 * path, so the shipped artifact always matches the last verified build.
 *
 *   node scripts/sync-model.mjs
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

const PUBLIC_DIR = path.join(ROOT, 'public', 'models');

/** Canonical shipped file name. */
const CANONICAL = 'abyss-salvager-ac-vii.glb';

async function sha256(file) {
  const buf = await readFile(file);
  return createHash('sha256').update(buf).digest('hex');
}

async function main() {
  const canonicalPath = path.join(PUBLIC_DIR, CANONICAL);
  if (!existsSync(canonicalPath)) {
    console.error(
      `[sync-model] 缺少随包模型：public/models/${CANONICAL}\n` +
        '[sync-model] 请先运行 "npm run capture" 生成并验收导出产物，再执行构建。'
    );
    process.exit(1);
  }

  await mkdir(PUBLIC_DIR, { recursive: true });

  const size = (await stat(canonicalPath)).size;
  const hash = await sha256(canonicalPath);

  // Read the GLB header so the index states verified facts, not claims.
  const head = await readFile(canonicalPath);
  const magic = head.toString('utf8', 0, 4);
  const version = head.readUInt32LE(4);
  const declared = head.readUInt32LE(8);
  if (magic !== 'glTF' || version !== 2 || declared !== size) {
    console.error(
      `[sync-model] GLB 头非法：magic="${magic}" version=${version} declared=${declared} actual=${size}`
    );
    process.exit(1);
  }

  const manifest = {
    id: 'abyss-carapace-salvager-models',
    title: '渊甲拾遗者 · 随包模型 / ABYSS-CARAPACE SALVAGER — shipped model',
    version: '1.0.0',
    generated: '2026-10-21',
    license: {
      artwork: '本批原创（程序化几何 + 程序化贴图，运行时由 GLTFExporter 导出）',
      thirdParty: '无',
    },
    work: {
      id: '02-abyss-salvager',
      titleCn: '渊甲拾遗者',
      titleLatin: 'ABYSS-CARAPACE SALVAGER',
      model: 'AC-VII',
      lengthMetres: 760,
      diameterMetres: 41.7,
      segments: 18,
    },
    models: [
      {
        role: 'canonical',
        file: `./${CANONICAL}`,
        publicPath: `public/models/${CANONICAL}`,
        buildPath: `models/${CANONICAL}`,
        bytes: size,
        sha256: hash,
        glb: { magic, version, declaredLength: declared },
        description: '《渊甲拾遗者》默认参数（18 驱动体节）导出的完整模型。',
      },
    ],
    notes: [
      '本文件由浏览器端 GLTFExporter 实时导出；npm run capture 会把它直接写到 public/models/，构建时再由 scripts/sync-model.mjs 校验并刷新本索引。',
      'public/ 目录会被 Vite 原样复制进构建产物，因此 dist/models/ 与线上 works/02-abyss-salvager/models/ 下的路径完全一致。',
      '所有几何与贴图均为本项目程序化生成，未使用任何第三方模型、贴图或商业素材。',
    ],
  };

  await writeFile(
    path.join(PUBLIC_DIR, 'assets.manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );

  console.log(
    `[sync-model] public/models/${CANONICAL}  ${(size / 1048576).toFixed(2)} MB  ` +
      `(magic=${magic} v${version} declared=${declared})\n` +
      '[sync-model] public/models/assets.manifest.json  written'
  );
}

main().catch((e) => {
  console.error('[sync-model] failed:', e.message);
  process.exit(1);
});
