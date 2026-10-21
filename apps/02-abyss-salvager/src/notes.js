/**
 * 说明页脚本。
 *
 * 声明文案与构件双语名都从**唯一真源**取，避免与检视台/导出元数据不一致：
 *   · 声明           → src/model/disclaimer.js
 *   · 构件双语对照   → src/model/harvester.js → ANNOTATIONS
 */

import { DISCLAIMER } from './model/disclaimer.js';
import { ANNOTATIONS } from './model/parts.js';
import { applyBaseToDocument } from './paths.js';

applyBaseToDocument();

document.getElementById('notice-body').textContent = DISCLAIMER.bodyZh;
document.getElementById('notice-body-en').textContent = DISCLAIMER.bodyEn;

const tbody = document.querySelector('#part-table tbody');
ANNOTATIONS.forEach((def, i) => {
  const tr = document.createElement('tr');
  const num = document.createElement('td');
  num.textContent = String(i + 1).padStart(2, '0');
  const cn = document.createElement('td');
  cn.lang = 'zh-CN';
  cn.textContent = def.cn;
  const en = document.createElement('td');
  en.lang = 'en';
  en.textContent = def.en;
  const key = document.createElement('td');
  key.textContent = def.group;
  tr.append(num, cn, en, key);
  tbody.appendChild(tr);
});
