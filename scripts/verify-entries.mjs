/**
 * 线上验收 · 逐条 entry 实测（Ego 浏览器）
 * ------------------------------------------------------------------
 * 监督指令 §二 的机械执行：works.json 的每条 entry 路径都取一次**线上实测
 * HTTP 状态码**，与 works.json 声明的 entryExists / online 逐条对齐。
 *
 *  - 读取 works.json（唯一事实源），对每条有 entry 的条目取状态码；
 *  - 附带一组对照路径（CONTROLS），用于记录随本轮范围调整而消失的深链；
 *  - 输出 JSON 证据到 online-evidence/ego/verify-entries-<tag>.json；
 *  - 以表格打印：状态码 + 声明值 + 是否一致。
 *
 * 用法（必须用 file URL 导入，import.meta.url 才可靠；Ego 不继承 shell 环境变量，
 * 因此 TAG 是脚本内的常量，换轮次时直接改这一行）：
 *   ego-browser nodejs -e "await import('file://$PWD/scripts/verify-entries.mjs')"
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'online-evidence', 'ego');
const BASE = 'https://kingkazmax.github.io/playtime-atlas-20261021';
const TAG = 'baseline-4f6c0f1';

await fs.mkdir(OUT, { recursive: true });

const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'works.json'), 'utf8'));

/**
 * 对照路径：本轮范围调整后**不再发布**的深链，以及站点根的设计系统资源。
 * 它们应当变成 404 —— 这正是「已从发布面撤回」的客观证据。
 */
const CONTROLS = [
  'works/16-design-system/index.html',
  'works/17-architecture-research/index.html',
  'works/18-architecture-models/index.html',
  'assets/ds/tokens.css',
];

const task = await taskSpace('playtime-atlas-online-qa');
const probe = await task.newPage();
await probe.goto(`${BASE}/`);

const out = {
  ranAt: new Date().toISOString(),
  taskSpaceId: task.spaceId,
  base: BASE,
  tag: TAG,
  entries: [],
  controls: [],
};

async function measure(rel) {
  const url = `${BASE}/${rel}`;
  const r = await probe
    .fetch(url, { timeout: 20000 })
    .catch((e) => ({ status: 0, error: String((e && e.message) || e) }));
  return {
    path: rel,
    url,
    status: typeof r.status === 'number' ? r.status : 0,
    bytes: r.body ? r.body.length : undefined,
    error: r.error || null,
  };
}

for (const w of manifest.works) {
  if (!w.entry) continue;
  const m = await measure(w.entry);
  m.id = w.id;
  m.status_declared = w.status ?? null;
  m.qaState_declared = w.qaState ?? null;
  m.entryExists_declared = w.entryExists ?? null;
  m.online_declared = w.online ?? null;
  // 对齐判定：声明的 online（HTTP 码）与实测一致
  m.aligned =
    w.online === null || w.online === undefined
      ? m.status === 404
      : w.online === m.status;
  // ready 必须对应 200
  m.readyConsistent = w.status !== 'ready' || m.status === 200;
  out.entries.push(m);
}

for (const rel of CONTROLS) {
  const m = await measure(rel);
  m.expected = 'absent(404)';
  m.aligned = m.status === 404;
  out.controls.push(m);
}

await probe.close();
await fs.writeFile(
  path.join(OUT, `verify-entries-${TAG}.json`),
  JSON.stringify(out, null, 2) + '\n'
);
await task.finish({ keep: [] });

console.log(`=== entry 实测（${TAG}） ${out.ranAt} ===`);
for (const e of out.entries) {
  const mark = e.aligned && e.readyConsistent ? '✓' : '✗';
  console.log(
    `${mark} ${String(e.status).padStart(3)} ${e.id.padEnd(22)} entry=${e.path}  声明[status=${e.status_declared} qa=${e.qaState_declared} entryExists=${e.entryExists_declared} online=${e.online_declared}]`
  );
}
console.log('--- 对照（本轮应消失，期望 404）---');
for (const c of out.controls) {
  console.log(`${c.aligned ? '✓' : '✗'} ${String(c.status).padStart(3)} ${c.path}`);
}
const bad = out.entries.filter((e) => !e.aligned || !e.readyConsistent);
console.log(`合计 ${out.entries.length} 条；不一致 ${bad.length} 条`);
if (bad.length) {
  for (const b of bad) console.log(`  ! ${b.id} 实测=${b.status} 声明=${b.online_declared}`);
  process.exitCode = 1;
}
