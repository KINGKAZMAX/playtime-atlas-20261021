#!/usr/bin/env node
/**
 * 目录校验器 · verify-catalog
 *
 * 1) 结构校验：必填字段、id 唯一、era 存在、来源非空、许可字段存在
 * 2) 来源校验：把 sourceUrls 中的百科条目标题提交给公开 API，
 *    逐条确认条目可解析（避免交付一批打不开的来源链接）
 *
 * 用法：node scripts/verify-catalog.mjs [--offline]
 *   --offline  只跑结构校验，跳过联网的来源解析检查
 */

import { LOCAL_CATALOG } from '../src/data/catalog.local.js';
import { ERAS } from '../src/data/eras.js';
import { fetchJson } from './lib/net.mjs';

const OFFLINE = process.argv.includes('--offline');
const ERA_IDS = new Set(ERAS.map((e) => e.id));
const ERA_RANGE = Object.fromEntries(ERAS.map((e) => [e.id, [e.from, e.to]]));

const REQUIRED = [
  'id', 'title', 'year', 'era', 'platform', 'creator',
  'summary', 'significance', 'sourceUrls', 'imageLicense',
];

const errors = [];
const warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

// ── 1. 结构校验 ─────────────────────────────────────────────────────────────
const seen = new Set();
for (const item of LOCAL_CATALOG) {
  for (const field of REQUIRED) {
    const v = item[field];
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
      fail(`[${item.id || '无 id'}] 缺少必填字段 ${field}`);
    }
  }
  if (seen.has(item.id)) fail(`重复 id：${item.id}`);
  seen.add(item.id);

  if (item.era && !ERA_IDS.has(item.era)) fail(`[${item.id}] 未知 era：${item.era}`);

  if (item.era && ERA_RANGE[item.era]) {
    const [from, to] = ERA_RANGE[item.era];
    if (item.year < from || item.year > to) {
      warn(`[${item.id}] 年份 ${item.year} 落在 era ${item.era} 区间 ${from}–${to} 之外`);
    }
  }
  if (item.kind && !['game', 'hardware', 'platform'].includes(item.kind)) {
    fail(`[${item.id}] 未知 kind：${item.kind}`);
  }
  if (Array.isArray(item.sourceUrls)) {
    item.sourceUrls.forEach((u) => {
      if (!/^https?:\/\//.test(u)) fail(`[${item.id}] 来源不是 http(s)：${u}`);
    });
  }
  if (Array.isArray(item.sourceTitles) && Array.isArray(item.sourceUrls)) {
    if (item.sourceTitles.length !== item.sourceUrls.length) {
      warn(`[${item.id}] sourceTitles(${item.sourceTitles.length}) 与 sourceUrls(${item.sourceUrls.length}) 数量不一致`);
    }
  }
}

// ── 年代覆盖度 ──────────────────────────────────────────────────────────────
const perEra = Object.fromEntries(ERAS.map((e) => [e.id, 0]));
for (const item of LOCAL_CATALOG) {
  if (perEra[item.era] !== undefined) perEra[item.era] += 1;
}
const EMPTY_ERAS = Object.entries(perEra).filter(([, n]) => n === 0).map(([id]) => id);
if (EMPTY_ERAS.length) fail(`以下年代没有展品：${EMPTY_ERAS.join(', ')}`);
if (ERAS.length < 7) fail(`年代数量 ${ERAS.length} 少于要求的 7 个`);

// ── 2. 来源标题可解析性校验 ────────────────────────────────────────────────
function wikiTitle(url) {
  const m = /^https?:\/\/[a-z-]+\.wikipedia\.org\/wiki\/(.+)$/.exec(url);
  return m ? decodeURIComponent(m[1]) : null;
}

async function checkTitles(titles) {
  // 公开百科 API 对高频请求会限流（429/403），这里采用「每次一个标题 + 固定间隔」
  // 的保守策略，配合退避重试，确保结论可信而不是碰运气。
  const missing = [];
  const canonical = new Map();
  const failed = [];
  const INTERVAL = 1400;

  for (let i = 0; i < titles.length; i += 1) {
    const t = titles[i];
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&titles=${encodeURIComponent(t)}`;
    let data = null;
    let lastError = '';
    for (let attempt = 1; attempt <= 4 && !data; attempt += 1) {
      try {
        data = await fetchJson(url, { retries: 2, retryBaseMs: 2500 });
      } catch (err) {
        lastError = err.message;
      }
    }
    if (!data) {
      failed.push({ slice: [t], error: lastError });
      warn(`来源校验失败：${t}（${lastError}）`);
    } else {
      const pages = data.query?.pages ?? {};
      const page = Object.values(pages)[0];
      if (!page || page.missing !== undefined) {
        missing.push(t);
      } else {
        canonical.set(t, page.title);
      }
    }
    await new Promise((r) => setTimeout(r, INTERVAL));
  }

  return {
    missing,
    canonical,
    failed,
    checked: titles.length - failed.length,
  };
}

// ── 运行 ────────────────────────────────────────────────────────────────────
const wikiUrls = LOCAL_CATALOG.flatMap((i) => i.sourceUrls).filter((u) => wikiTitle(u));
const titles = [...new Set(wikiUrls.map(wikiTitle))];

console.log(`▶ 结构校验：${LOCAL_CATALOG.length} 条展品 / ${ERAS.length} 个年代`);
for (const [id, n] of Object.entries(perEra)) {
  const era = ERAS.find((e) => e.id === id);
  console.log(`   ${era.code.padEnd(10)} ${era.label.padEnd(12)} ${String(n).padStart(3)} 件`);
}

let missingTitles = [];
let failedBatches = [];
let checkedCount = 0;
if (!OFFLINE) {
  console.log(`\n▶ 来源校验：向公开百科 API 查询 ${titles.length} 个条目标题…`);
  const res = await checkTitles(titles);
  missingTitles = res.missing;
  failedBatches = res.failed;
  checkedCount = res.checked;
  if (failedBatches.length === 0) {
    console.log(`   ✓ ${checkedCount} 个条目标题全部可解析`);
  } else {
    console.log(`   ⚠ 已校验 ${checkedCount} / ${titles.length} 个标题，${failedBatches.length} 个批次因网络原因未能校验`);
  }
  if (missingTitles.length) {
    console.log(`   ✗ ${missingTitles.length} 个条目无法解析：`);
    missingTitles.forEach((t) => console.log(`     - ${t}`));
  }
} else {
  console.log('\n▶ 来源校验：--offline 已跳过联网检查');
}

if (warnings.length) {
  console.log(`\n⚠ 警告 ${warnings.length} 条：`);
  warnings.forEach((w) => console.log(`   - ${w}`));
}
if (errors.length) {
  console.log(`\n✗ 结构错误 ${errors.length} 条：`);
  errors.forEach((e) => console.log(`   - ${e}`));
  process.exit(1);
}
if (missingTitles.length) {
  console.log('\n✗ 存在无法解析的来源条目，请修正后重试。');
  process.exit(1);
}
if (failedBatches.length) {
  console.log(`\n✗ 来源校验未完成（${failedBatches.length} 个批次请求失败），不能声称「全部可解析」。请在网络可达时重试。`);
  process.exit(1);
}
console.log(`\n✓ 目录校验通过：${LOCAL_CATALOG.length} 条展品，${ERAS.length} 个年代，${checkedCount} 个来源条目全部可解析。`);
