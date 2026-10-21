/* ============================================================
   回响电玩馆 · PLAYTIME ATLAS — 极简作品画廊
   数据：embedded works-data → data/works.json（两种形状都兼容）
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  meta: {},
  sections: [],
  works: [],
  q: '',
  section: 'all',
  lastFocus: null,
  locked: false,
};

/* 封面占位图：图片缺失或加载失败时使用，避免空洞 */
const PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">' +
      '<rect width="1200" height="800" fill="#efeae1"/>' +
      '<g fill="none" stroke="#cabfab" stroke-width="2">' +
        '<rect x="430" y="290" width="340" height="220" rx="10"/>' +
        '<path d="M430 290l170 116 170-116"/>' +
      '</g></svg>'
  );

/* 依次尝试的封面字段（兼容后续加入的真实截图封面） */
const COVER_FIELDS = [
  'cover', 'coverUrl', 'cover_url', 'coverSrc', 'coverImage',
  'thumbnail', 'thumb', 'image', 'screenshot', 'poster', 'hero', 'banner', 'ogImage',
];

/* ------------------------------------------------------------- 工具 */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function readJSON(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const raw = (el.textContent || '').trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[hall] 解析 ' + id + ' 失败', e);
    return fallback;
  }
}

function coverOf(work) {
  for (const field of COVER_FIELDS) {
    const v = work[field];
    if (!v) continue;
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'object') {
      const s = v.src || v.url || v.path || v.href;
      if (typeof s === 'string' && s.trim()) return s.trim();
    }
  }
  return '';
}

/* 线上状态：构建产物里 online 为显式布尔；缺失时保持可进入 */
function isOnline(work) {
  if (typeof work.online === 'boolean') return work.online;
  return true;
}

function isPlayable(work) {
  return work.playable !== false;
}

function workById(id) {
  return state.works.find((w) => w.id === id) || null;
}

function coverButtonOf(id) {
  return $$('.work-media').find((el) => el.dataset.id === id) || null;
}

/* ------------------------------------------------------------- 数据 */

function normalizeManifest(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) return { meta: {}, sections: [], works: raw };
  if (Array.isArray(raw.works)) {
    return { meta: raw.meta || {}, sections: raw.sections || [], works: raw.works };
  }
  return null;
}

function deriveSections(works) {
  const map = new Map();
  for (const w of works) {
    if (!w || !w.section || map.has(w.section)) continue;
    map.set(w.section, { id: w.section, label: w.section });
  }
  return Array.from(map.values());
}

async function loadData() {
  let manifest = normalizeManifest(readJSON('works-data', null));

  if (!manifest) {
    try {
      const res = await fetch('data/works.json', { cache: 'no-cache' });
      if (res.ok) manifest = normalizeManifest(await res.json());
    } catch (e) {
      console.warn('[hall] 读取 data/works.json 失败', e);
    }
  }

  if (!manifest) manifest = { meta: {}, sections: [], works: [] };

  state.meta = manifest.meta || {};
  state.works = Array.isArray(manifest.works) ? manifest.works.filter(Boolean) : [];
  state.sections = (Array.isArray(manifest.sections) ? manifest.sections : []).filter(
    (s) => s && s.id && s.publish !== false
  );
  if (!state.sections.length) state.sections = deriveSections(state.works);
}

/* ------------------------------------------------------------- 分类 */

function categories() {
  const counts = new Map();
  for (const w of state.works) counts.set(w.section, (counts.get(w.section) || 0) + 1);

  const list = [{ id: 'all', label: '全部' }];
  for (const s of state.sections) {
    if (!counts.get(s.id)) continue;
    list.push({ id: s.id, label: s.label || s.id });
  }
  return list;
}

function renderCats() {
  const box = $('#cats');
  if (!box) return;
  box.innerHTML = '';

  for (const cat of categories()) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat';
    btn.textContent = cat.label;
    btn.setAttribute('aria-pressed', String(state.section === cat.id));
    btn.addEventListener('click', () => {
      if (state.section === cat.id) return;
      state.section = cat.id;
      renderCats();
      render();
    });
    box.appendChild(btn);
  }
}

/* ------------------------------------------------------------- 筛选 */

function filteredWorks() {
  const q = state.q.trim().toLowerCase();
  return state.works.filter((w) => {
    if (state.section !== 'all' && w.section !== state.section) return false;
    if (!q) return true;
    const hay = [
      w.title, w.subtitle, w.kind, w.era, w.id, w.description,
      (w.tags || []).join(' '),
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  });
}

/* ------------------------------------------------------------- 画廊 */

function cardHTML(work, index) {
  const wide = index % 3 === 0;                       /* 1 宽 + 2 列的编辑式节奏 */
  const online = isOnline(work);
  const playable = isPlayable(work);
  const title = work.title || work.id || '未命名作品';
  const cover = coverOf(work) || PLACEHOLDER;
  const kind = work.kind || '';
  const era = work.era && String(work.era).length <= 14 ? String(work.era) : '';

  /* 首屏第一张封面是 LCP 候选：立即加载并提权，其余保持懒加载 */
  const first = index === 0;
  const img =
    '<img class="work-img" src="' + esc(cover) + '" alt="' + esc(title) + ' 封面" ' +
    (first ? 'loading="eager" fetchpriority="high" ' : 'loading="lazy" ') +
    'decoding="async" width="1200" height="800" />';

  const media = online
    ? '<button class="work-media" type="button" data-act="play" data-id="' + esc(work.id) + '" ' +
      'aria-label="' + (playable ? '进入《' : '查看《') + esc(title) + '》' + (playable ? '体验' : '预览') + '">' +
      img + '<span class="work-veil" aria-hidden="true"></span>' +
      '<span class="work-cta" aria-hidden="true">' + (playable ? '体验' : '查看') + '</span></button>'
    : '<div class="work-media is-static">' + img + '</div>';

  return (
    '<article class="work' + (wide ? ' is-wide' : '') + '" role="listitem" data-id="' + esc(work.id) + '">' +
      media +
      '<div class="work-info">' +
        '<h2 class="work-title"><button class="work-title-btn" type="button" data-act="detail" data-id="' +
          esc(work.id) + '">' + esc(title) + '</button></h2>' +
        '<p class="work-kind">' + esc(kind) +
          (era ? '<span class="work-era">' + esc(era) + '</span>' : '') + '</p>' +
      '</div>' +
    '</article>'
  );
}

function render() {
  const box = $('#works');
  if (!box) return;

  const list = filteredWorks();
  box.innerHTML = list.map(cardHTML).join('');

  $$('.work-img', box).forEach((img) => {
    img.addEventListener('error', () => {
      if (img.getAttribute('src') !== PLACEHOLDER) img.setAttribute('src', PLACEHOLDER);
    });
  });

  const empty = $('#empty');
  if (empty) empty.hidden = list.length > 0;

  const status = $('#results-status');
  if (status) {
    status.textContent = list.length
      ? '共 ' + list.length + ' 件作品' + (list.length === state.works.length ? '' : '，已筛选')
      : '没有匹配的作品';
  }
}

/* --------------------------------------------------------- 滚动与焦点 */

function lockScroll() {
  if (state.locked) return;
  const sw = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.paddingRight = sw > 0 ? sw + 'px' : '';
  document.body.style.overflow = 'hidden';
  state.locked = true;
}

function unlockScroll() {
  if (!state.locked) return;
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  state.locked = false;
}

function focusables(root) {
  return $$(
    'a[href], button:not([disabled]), input:not([disabled]), select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
    root
  ).filter((el) => el.tagName === 'IFRAME' || el.offsetParent !== null || el === document.activeElement);
}

function trapTab(root, e) {
  const items = focusables(root);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;

  if (e.shiftKey && (active === first || !root.contains(active))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

function restoreFocus(el) {
  if (el && typeof el.focus === 'function' && document.contains(el)) el.focus();
}

/* ------------------------------------------------------------- 详情 */

function openDetail(id) {
  const work = workById(id);
  if (!work) return;

  state.lastFocus = document.activeElement;

  const title = work.title || work.id || '未命名作品';
  const online = isOnline(work);
  const playable = isPlayable(work);
  const cover = coverOf(work) || PLACEHOLDER;
  const controls = (work.controls || []).filter(Boolean);
  const kind = work.kind || work.subtitle || '';

  const body = $('#detail-body');
  body.innerHTML =
    '<div class="detail-media"><img src="' + esc(cover) + '" alt="' + esc(title) + ' 封面" ' +
      'loading="lazy" decoding="async" width="1200" height="800" /></div>' +
    '<p class="detail-kicker">' + esc(kind) + '</p>' +
    '<h2 class="detail-title" id="detail-title">' + esc(title) + '</h2>' +
    (work.subtitle ? '<p class="detail-sub">' + esc(work.subtitle) + '</p>' : '') +
    (work.description ? '<p class="detail-desc">' + esc(work.description) + '</p>' : '') +
    (controls.length
      ? '<ul class="detail-controls">' + controls.map((c) => '<li>' + esc(c) + '</li>').join('') + '</ul>'
      : '') +
    (online ? '' : '<p class="detail-note">这件作品暂时还没有可打开的体验入口。</p>') +
    '<div class="detail-actions">' +
      (online
        ? '<button class="btn btn-solid" type="button" data-act="play" data-id="' + esc(work.id) + '">' +
            (playable ? '进入体验' : '打开预览') + '</button>' +
          '<a class="btn" href="' + esc(work.entry || '#') + '" target="_blank" rel="noopener noreferrer">独立窗口打开</a>'
        : '') +
    '</div>';

  const img = body.querySelector('img');
  if (img) {
    img.addEventListener('error', () => {
      if (img.getAttribute('src') !== PLACEHOLDER) img.setAttribute('src', PLACEHOLDER);
    });
  }

  $('#overlay').hidden = false;
  $('#detail').hidden = false;
  lockScroll();
  $('#detail-close').focus();
}

function closeDetail(restore) {
  $('#overlay').hidden = true;
  $('#detail').hidden = true;
  if (!stageOpen()) unlockScroll();
  if (restore !== false) restoreFocus(state.lastFocus);
}

/* ------------------------------------------------------------- 体验台 */

function stageOpen() {
  const el = $('#stage');
  return !!el && !el.hidden;
}

function openStage(id, trigger) {
  const work = workById(id);
  if (!work || !isOnline(work) || !work.entry) return;

  state.lastFocus = trigger || document.activeElement;

  const title = work.title || work.id || '未命名作品';
  $('#stage-name').textContent = title;
  $('#stage-sub').textContent = work.kind || work.subtitle || '';
  $('#stage-frame').src = work.entry;

  $('#stage').hidden = false;
  lockScroll();
  $('#stage-back').focus();
}

function closeStage(restore) {
  const stage = $('#stage');
  if (stage.hidden) return;
  stage.hidden = true;
  $('#stage-frame').src = 'about:blank';
  if (!detailOpen()) unlockScroll();
  if (restore !== false) restoreFocus(state.lastFocus);
}

function detailOpen() {
  const el = $('#detail');
  return !!el && !el.hidden;
}

/*
 * 焦点进入 iframe 之后，键盘事件不再冒泡到父文档，Escape 会失效。
 * 这里把 iframe 内的 Escape 转交给父文档；若作品自己处理了 Escape
 * （例如打开暂停菜单并 preventDefault），则尊重作品的行为，不关闭体验台。
 */
function bindFrameKeys() {
  const frame = $('#stage-frame');
  if (!frame) return;

  frame.addEventListener('load', () => {
    let doc = null;
    try {
      doc = frame.contentDocument;
    } catch (e) {
      return; /* 跨域作品无法注入监听，退回父文档的 Escape 处理 */
    }
    if (!doc) return;
    doc.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      e.preventDefault();
      closeStage();
    });
  });
}

/* ------------------------------------------------------------- 事件 */

function bind() {
  const q = $('#q');
  if (q) {
    q.addEventListener('input', (e) => {
      state.q = e.target.value;
      render();
    });
    q.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        q.value = '';
        state.q = '';
        render();
        q.blur();
      }
    });
  }

  const clear = $('#clear-filters');
  if (clear) {
    clear.addEventListener('click', () => {
      state.q = '';
      state.section = 'all';
      if (q) q.value = '';
      renderCats();
      render();
      if (q) q.focus();
    });
  }

  $('#detail-close').addEventListener('click', () => closeDetail());
  $('#overlay').addEventListener('click', () => closeDetail());
  $('#stage-back').addEventListener('click', () => closeStage());
  bindFrameKeys();
  $('#stage-open').addEventListener('click', () => {
    const frame = $('#stage-frame');
    const src = frame.getAttribute('src') || '';
    if (src && src !== 'about:blank') window.open(src, '_blank', 'noopener');
  });

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-act]');
    if (!trigger) return;

    const act = trigger.dataset.act;
    const id = trigger.dataset.id;

    if (act === 'play') {
      const fromDetail = !!trigger.closest('#detail');
      if (fromDetail) closeDetail(false);
      openStage(id, fromDetail ? coverButtonOf(id) : trigger);
    } else if (act === 'detail') {
      openDetail(id);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (stageOpen()) {
        e.preventDefault();
        closeStage();
      } else if (detailOpen()) {
        e.preventDefault();
        closeDetail();
      }
      return;
    }

    if (e.key === 'Tab') {
      if (stageOpen()) trapTab($('#stage'), e);
      else if (detailOpen()) trapTab($('#detail'), e);
      return;
    }

    if (stageOpen() || detailOpen()) return;

    if (e.key === '/' && document.activeElement !== q) {
      e.preventDefault();
      if (q) q.focus();
    }
  });
}

/* ------------------------------------------------------------- 启动 */

async function main() {
  await loadData();
  renderCats();
  render();
  bind();
}

main();
