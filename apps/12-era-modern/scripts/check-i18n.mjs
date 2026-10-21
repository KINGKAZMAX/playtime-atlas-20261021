/**
 * 文案骨架对等性自检。
 *
 * 校验 zh / en 两张表的键集合完全一致，且不存在空文案。
 * 这是 i18n 骨架的守门脚本：改动 `src/core/i18n/*.js` 后必须重跑。
 *
 * 用法：node scripts/check-i18n.mjs
 */
import { zh } from '../src/core/i18n/zh.js';
import { en } from '../src/core/i18n/en.js';

const zhKeys = Object.keys(zh).sort();
const enKeys = Object.keys(en).sort();

const onlyZh = zhKeys.filter((k) => !enKeys.includes(k));
const onlyEn = enKeys.filter((k) => !zhKeys.includes(k));
const empty = [...zhKeys, ...enKeys].filter((k) => {
  const v = k in zh ? zh[k] : en[k];
  return typeof v !== 'string' || v.trim() === '';
});

let failed = 0;

console.log(`zh 键数：${zhKeys.length}`);
console.log(`en 键数：${enKeys.length}`);

if (onlyZh.length) {
  failed += 1;
  console.log(`❌ 缺少英文条目（${onlyZh.length}）：${onlyZh.join(', ')}`);
}
if (onlyEn.length) {
  failed += 1;
  console.log(`❌ 缺少中文条目（${onlyEn.length}）：${onlyEn.join(', ')}`);
}
if (empty.length) {
  failed += 1;
  console.log(`❌ 存在空文案（${empty.length}）：${empty.join(', ')}`);
}

// 占位符对等：同一键在两种语言里使用的 {name} 必须一致
const placeholderMismatch = [];
for (const key of zhKeys) {
  if (!en[key]) continue;
  const ph = (s) => (String(s).match(/\{(\w+)\}/g) || []).sort().join(',');
  if (ph(zh[key]) !== ph(en[key])) {
    placeholderMismatch.push(`${key} (zh: ${ph(zh[key]) || '无'} / en: ${ph(en[key]) || '无'})`);
  }
}
if (placeholderMismatch.length) {
  failed += 1;
  console.log(`❌ 占位符不一致（${placeholderMismatch.length}）：`);
  for (const item of placeholderMismatch) console.log(`   - ${item}`);
}

if (failed) {
  console.log('\n❌ 文案骨架校验未通过');
  process.exit(1);
}

console.log('✅ 文案骨架校验通过：zh / en 键集合一致，无空文案，占位符对齐');
