/**
 * 通用格式化工具
 */

/** 年份显示：整数年 */
export function formatYear(year) {
  return Number.isFinite(year) ? String(year) : '年份不详';
}

/** 平台归一：把「街机 / PlayStation」这类写成列表的字段拆开 */
export function splitPlatforms(platform) {
  if (!platform) return [];
  return String(platform)
    .split(/[\/／、,，·|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 展品主标题（中文名优先，回落到原标题） */
export function displayTitle(exhibit) {
  return exhibit.titleZh || exhibit.title || '未命名展品';
}

/** 展品副标题 */
export function displaySubtitle(exhibit) {
  return exhibit.titleZh && exhibit.title ? exhibit.title : '';
}

/** 类别中文名 */
export const KIND_LABEL = {
  game: '游戏作品',
  hardware: '硬件设备',
  platform: '平台与服务',
};

export function kindLabel(kind) {
  return KIND_LABEL[kind] || '展品';
}

/** 把 id 转为可用于 DOM 的选择器片段 */
export function slugify(id) {
  return String(id).replace(/[^a-zA-Z0-9_-]/g, '-');
}

/** HTML 转义（所有外部数据渲染前必须经过） */
export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 简易高亮：返回带 <mark> 的安全 HTML */
export function highlight(text, query) {
  const safe = escapeHtml(text);
  const q = String(query || '').trim();
  if (!q) return safe;
  const escaped = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(escaped, 'gi'), (m) => `<mark>${m}</mark>`);
}
