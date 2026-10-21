/* ============================================================
   作品总廊 · MASTER GALLERY — 交互层
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  manifest: { meta: {}, sections: [], works: [] },
  works: [],
  q: '',
  section: 'all',
  status: 'all',
  sort: 'index',
  report: { works: [], totals: {}, builtAt: null },
  active: null,
  lastFocus: null,
};

const STATUS_LABEL = {
  built: '已上线',
  'built-no-entry': '已构建',
  fallback: '构建回退',
  unavailable: '不可用',
  pending: '待集成',
  skipped: '未构建',
};

/**
 * 展示状态 = 构建结果 × 验收状态。
 * 构建通过但 13 复验未完成的，标「已构建·待复验」，不冒充「已上线」。
 */
function pillState(work) {
  const st = statusOf(work);
  if (st === 'unavailable' || st === 'skipped') return { key: st, label: STATUS_LABEL[st] || st, cls: 'pending' };
  if (st === 'fallback') return { key: st, label: '构建回退', cls: 'fallback' };
  if (st === 'built-no-entry') return { key: st, label: '入口缺失', cls: 'pending' };
  if (work.qaState === 'pending-reverify' || work.status === 'pending') {
    return { key: 'reverify', label: '已构建·待复验', cls: 'fallback' };
  }
  return { key: 'built', label: '已上线', cls: 'online' };
}

/* ------------------------------------------------------------ bootstrap */

function readJSON(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  const raw = (el.textContent || '').trim();
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[hall] 解析', id, '失败', e);
    return fallback;
  }
}

async function loadData() {
  let manifest = readJSON('works-data', null);
  if (!manifest || !manifest.works) {
    try {
      const res = await fetch('data/works.json', { cache: 'no-cache' });
      if (res.ok) manifest = await res.json();
    } catch (e) {
      console.warn('[hall] fetch data/works.json 失败', e);
    }
  }
  if (!manifest) manifest = { meta: {}, sections: [], works: [] };
  state.manifest = manifest;
  state.works = manifest.works || [];

  const report = readJSON('build-report', null);
  if (report && report.works) state.report = report;
  else {
    try {
      const res = await fetch('data/build-report.json', { cache: 'no-cache' });
      if (res.ok) state.report = await res.json();
    } catch (e) { /* 报告缺失不阻塞目录 */ }
  }
}

/* -------------------------------------------------------------- helpers */

function statusOf(work) {
  if (work.buildState) return work.buildState;
  return work.status === 'ready' ? 'built' : 'pending';
}

function isOnline(work) {
  return work.online === true || statusOf(work) === 'built' || statusOf(work) === 'fallback';
}

function isPlayable(work) {
  return !!(work.playable && isOnline(work));
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtBytes(n) {
  if (!n && n !== 0) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

function workById(id) {
  return state.works.find((w) => w.id === id);
}

/* ------------------------------------------------------------- filters */

function sectionCounts() {
  const map = new Map();
  for (const w of state.works) map.set(w.section, (map.get(w.section) || 0) + 1);
  return map;
}

function statusCounts() {
  const map = new Map();
  for (const w of state.works) {
    const s = pillState(w).key;
    map.set(s, (map.get(s) || 0) + 1);
  }
  return map;
}

function renderFilters() {
  const secBox = $('#filter-sections');
  const stBox = $('#filter-status');
  const counts = sectionCounts();
  const scounts = statusCounts();

  const sections = state.manifest.sections || [];
  secBox.innerHTML = '';
  const allChip = document.createElement('button');
  allChip.className = 'chip';
  allChip.type = 'button';
  allChip.setAttribute('aria-pressed', String(state.section === 'all'));
  allChip.innerHTML = `全部分区 <span class="n">${state.works.length}</span>`;
  allChip.onclick = () => { state.section = 'all'; renderFilters(); renderGrid(); };
  secBox.appendChild(allChip);

  for (const s of sections) {
    const n = counts.get(s.id) || 0;
    if (!n) continue;
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.setAttribute('aria-pressed', String(state.section === s.id));
    b.innerHTML = `${esc(s.label)} <span class="n">${n}</span>`;
    b.title = s.desc || '';
    b.onclick = () => { state.section = s.id; renderFilters(); renderGrid(); };
    secBox.appendChild(b);
  }

  const order = ['built', 'reverify', 'fallback', 'built-no-entry', 'unavailable'];
  const CHIP_LABEL = {
    built: '已上线',
    reverify: '已构建·待复验',
    fallback: '构建回退',
    'built-no-entry': '入口缺失',
    unavailable: '不可用',
  };
  stBox.innerHTML = '';
  const allSt = document.createElement('button');
  allSt.className = 'chip';
  allSt.type = 'button';
  allSt.setAttribute('aria-pressed', String(state.status === 'all'));
  allSt.innerHTML = `全部状态 <span class="n">${state.works.length}</span>`;
  allSt.onclick = () => { state.status = 'all'; renderFilters(); renderGrid(); };
  stBox.appendChild(allSt);

  for (const key of order) {
    const n = scounts.get(key) || 0;
    if (!n) continue;
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.setAttribute('aria-pressed', String(state.status === key));
    b.innerHTML = `${CHIP_LABEL[key] || STATUS_LABEL[key] || key} <span class="n">${n}</span>`;
    b.onclick = () => { state.status = key; renderFilters(); renderGrid(); };
    stBox.appendChild(b);
  }
}

function filteredWorks() {
  const q = state.q.trim().toLowerCase();
  let list = state.works.filter((w) => {
    if (state.section !== 'all' && w.section !== state.section) return false;
    if (state.status !== 'all' && statusOf(w) !== state.status) return false;
    if (!q) return true;
    const hay = [w.title, w.subtitle, w.description, w.kind, w.era, w.id, ...(w.tags || [])]
      .join(' ').toLowerCase();
    return hay.includes(q);
  });
  const rank = { built: 0, reverify: 1, fallback: 2, 'built-no-entry': 3, unavailable: 4 };
  list = list.slice();
  if (state.sort === 'era') list.sort((a, b) => String(a.era).localeCompare(String(b.era)));
  else if (state.sort === 'title') list.sort((a, b) => String(a.title).localeCompare(String(b.title), 'zh'));
  else if (state.sort === 'status') list.sort((a, b) => (rank[pillState(a).key] ?? 9) - (rank[pillState(b).key] ?? 9));
  return list;
}

/* ---------------------------------------------------------------- grid */

function cardHTML(work, index) {
  const st = statusOf(work);
  const online = isOnline(work);
  const playable = isPlayable(work);
  const pill = pillState(work);
  const no = String(state.works.indexOf(work) + 1).padStart(2, '0');
  const tags = (work.tags || []).slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  const eraTag = work.era ? `<span class="tag era">${esc(work.era)}</span>` : '';

  let actions = '';
  if (playable) {
    actions += `<button class="btn btn-primary btn-sm" data-act="play" data-id="${esc(work.id)}">进入体验</button>`;
    actions += `<button class="btn btn-sm" data-act="detail" data-id="${esc(work.id)}">详情</button>`;
  } else if (online) {
    actions += `<button class="btn btn-sm" data-act="open" data-id="${esc(work.id)}">打开作品</button>`;
    actions += `<button class="btn btn-ghost btn-sm" data-act="detail" data-id="${esc(work.id)}">详情</button>`;
  } else {
    actions += `<button class="btn btn-sm" data-act="detail" data-id="${esc(work.id)}">查看状态</button>`;
  }

  const note = work.qaNote && work.qaState === 'pending-reverify' && online
    ? `<p class="card-note">◷ ${esc(work.qaNote)}</p>`
    : !online && work.statusNote
      ? `<p class="card-note">${esc(work.statusNote)}</p>`
      : '';

  return `
  <article class="card" role="listitem" data-id="${esc(work.id)}" tabindex="0">
    <div class="card-cover">
      <img src="${esc(work.cover || '')}" alt="${esc(work.title)} 封面" loading="lazy" width="800" height="500" />
      <span class="card-no">NO.${no}</span>
      <span class="pill ${pill.cls}">${esc(pill.label)}</span>
    </div>
    <div class="card-body">
      <span class="card-sub">${esc(work.subtitle || work.id)}</span>
      <h3 class="card-title">${esc(work.title)}</h3>
      <p class="card-desc">${esc(work.description || '')}</p>
      ${note}
      <div class="card-meta">${eraTag}${tags}</div>
      <div class="card-actions">${actions}</div>
    </div>
  </article>`;
}

function renderGrid() {
  const grid = $('#grid');
  const list = filteredWorks();
  grid.innerHTML = list.map(cardHTML).join('');
  $('#empty').hidden = list.length > 0;
  $('#catalog-count').textContent = list.length === state.works.length
    ? `共 ${state.works.length} 件作品，全部显示`
    : `命中 ${list.length} / ${state.works.length} 件`;
}

/* ---------------------------------------------------------------- stats */

function renderStats() {
  const total = state.works.length;
  const online = state.works.filter((w) => isOnline(w) && w.qaState !== 'pending-reverify' && w.status !== 'pending').length;
  const reverify = state.works.filter((w) => isOnline(w) && (w.qaState === 'pending-reverify' || w.status === 'pending')).length;
  const playable = state.works.filter(isPlayable).length;
  const eras = new Set(state.works.map((w) => w.era).filter(Boolean)).size;
  const set = (k, v) => {
    const el = $(`[data-stat="${k}"]`);
    if (el) el.textContent = v;
  };
  set('total', total);
  set('online', online);
  set('reverify', reverify);
  set('playable', playable);
  set('eras', eras);
  const built = state.report.builtAt ? new Date(state.report.builtAt) : null;
  set('builtAt', built ? built.toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '—');
}

/* ----------------------------------------------------------- build board */

function renderBoard() {
  const body = $('#board-body');
  const rows = state.report.works || [];
  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="6" class="note">构建报告尚未生成（data/build-report.json 缺失）。</td></tr>`;
    return;
  }
  body.innerHTML = rows.map((r) => {
    const st = r.buildState || 'pending';
    const label = STATUS_LABEL[st] || st;
    const notes = (r.notes || []).length ? esc(r.notes.join('；')) : '—';
    return `<tr>
      <td><b>${esc(r.title || r.id)}</b><br><span class="note mono">${esc(r.id)}</span></td>
      <td class="mono">${esc(r.type)}</td>
      <td><span class="bstate ${esc(st)}">${esc(label)}</span></td>
      <td class="mono">${esc(r.qaState === 'verified' ? '已复验' : r.qaState === 'pending-reverify' ? '待复验' : '—')}</td>
      <td class="mono">${fmtBytes(r.bytes)}</td>
      <td class="mono">${r.durationMs ? (r.durationMs / 1000).toFixed(1) + 's' : '—'}</td>
      <td class="note">${notes}</td>
    </tr>`;
  }).join('');
}

/* ---------------------------------------------------------------- drawer */

function openDrawer(id) {
  const work = workById(id);
  if (!work) return;
  state.active = work;
  state.lastFocus = document.activeElement;

  const st = statusOf(work);
  const online = isOnline(work);
  const playable = isPlayable(work);
  const pill = pillState(work);
  const controls = (work.controls || []).map((c) => `<li>${esc(c)}</li>`).join('');
  const tags = (work.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  const sources = (work.sources || []).map((s) => {
    const title = s.url
      ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`
      : esc(s.title);
    return `<li><span>${title}${s.note ? ` — <span class="note">${esc(s.note)}</span>` : ''}</span></li>`;
  }).join('');
  const artifacts = (work.artifacts || [])
    .map((a) => `<li><a href="${esc(a.path)}" download>${esc(a.label)}</a></li>`)
    .join('');
  const lic = work.license || {};

  const statusBlock = online
    ? `<div class="d-status"><b>${esc(pill.label)}</b> · 线上入口已就绪。${
        work.qaState === 'pending-reverify'
          ? `${esc(work.qaNote || '')} —— <b>可访问但尚未通过 13 的新一轮全量复验</b>，请以验收报告为准。`
          : (work.qaNote ? esc(work.qaNote) : '')
      }${work.buildNotes?.length ? esc(work.buildNotes.join('；')) : ''}</div>`
    : `<div class="d-status"><b>${esc(pill.label)}</b> · ${esc(work.statusNote || work.qaNote || '尚未就绪')} 本条暂不提供可点击的游玩入口。</div>`;

  const actions = [];
  if (playable) {
    actions.push(`<button class="btn btn-primary" data-act="play" data-id="${esc(work.id)}">进入体验</button>`);
  }
  if (online) {
    actions.push(`<a class="btn" href="${esc(work.entry)}" target="_blank" rel="noopener noreferrer">独立窗口打开</a>`);
  }
  actions.push(`<button class="btn btn-ghost" data-act="copy" data-id="${esc(work.id)}">复制线上地址</button>`);

  $('#drawer-body').innerHTML = `
    <div class="d-head">
      <span class="d-kicker">${esc(work.kind || work.section)}</span>
      <h2 class="d-title" id="drawer-title">${esc(work.title)}</h2>
      <span class="d-sub">${esc(work.subtitle || work.id)}</span>
    </div>
    <div class="d-cover"><img src="${esc(work.cover || '')}" alt="${esc(work.title)} 封面" width="800" height="500" /></div>
    <p class="d-desc">${esc(work.description || '')}</p>
    ${statusBlock}
    <div class="d-block">
      <h4>作品信息</h4>
      <dl class="d-grid">
        <div><dt>所属分区</dt><dd>${esc(sectionLabel(work.section))}</dd></div>
        <div><dt>时代 / 年份</dt><dd>${esc(work.era || '—')}</dd></div>
        <div><dt>入口路径</dt><dd class="mono">${esc(work.entry || '—')}</dd></div>
        <div><dt>构建体积</dt><dd>${fmtBytes(work.bytes)}</dd></div>
        <div><dt>代码许可</dt><dd>${esc(lic.code || '—')}</dd></div>
        <div><dt>素材说明</dt><dd>${esc(lic.assets || '—')}</dd></div>
      </dl>
    </div>
    ${controls ? `<div class="d-block"><h4>操作说明</h4><ul>${controls}</ul></div>` : ''}
    ${artifacts ? `<div class="d-block"><h4>可下载产物</h4><ul>${artifacts}</ul></div>` : ''}
    ${work.differences ? `<div class="d-block"><h4>与参考作品的差异</h4><ul><li>${esc(work.differences)}</li></ul></div>` : ''}
    ${work.notes ? `<div class="d-block"><h4>部署备注</h4><ul><li>${esc(work.notes)}</li></ul></div>` : ''}
    ${sources ? `<div class="d-block"><h4>来源与出处</h4><ul>${sources}</ul></div>` : ''}
    ${tags ? `<div class="d-block"><h4>标签</h4><div class="card-meta" style="padding-top:0">${tags}</div></div>` : ''}
    <div class="d-actions">${actions.join('')}</div>`;

  const backdrop = $('#drawer-backdrop');
  const drawer = $('#drawer');
  backdrop.hidden = false;
  drawer.hidden = false;
  document.body.style.overflow = 'hidden';
  drawer.focus();
}

function closeDrawer() {
  $('#drawer-backdrop').hidden = true;
  $('#drawer').hidden = true;
  document.body.style.overflow = '';
  state.active = null;
  if (state.lastFocus && state.lastFocus.focus) state.lastFocus.focus();
}

function sectionLabel(id) {
  const s = (state.manifest.sections || []).find((x) => x.id === id);
  return s ? s.label : id;
}

/* ----------------------------------------------------------------- stage */

function openStage(id) {
  const work = workById(id);
  if (!work || !isOnline(work)) return;
  const stage = $('#stage');
  const frame = $('#stage-frame');
  $('#stage-name').textContent = work.title;
  $('#stage-sub').textContent = work.subtitle || work.id;
  frame.src = work.entry;
  const sel = $('#stage-select');
  sel.innerHTML = state.works.filter(isOnline)
    .map((w) => `<option value="${esc(w.id)}"${w.id === id ? ' selected' : ''}>${esc(w.title)}</option>`)
    .join('');
  stage.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#stage-back').focus();
}

function closeStage() {
  const stage = $('#stage');
  stage.hidden = true;
  $('#stage-frame').src = 'about:blank';
  document.body.style.overflow = '';
}

function stageOpenExternal() {
  const work = state.works.find((w) => w.id === $('#stage-select').value);
  if (work) window.open(work.entry, '_blank', 'noopener');
}

/* ------------------------------------------------------------- events */

function bind() {
  $('#q').addEventListener('input', (e) => {
    state.q = e.target.value;
    renderGrid();
  });

  $('#sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderGrid();
  });

  $('#btn-reset').addEventListener('click', () => {
    state.q = ''; state.section = 'all'; state.status = 'all'; state.sort = 'index';
    $('#q').value = ''; $('#sort').value = 'index';
    renderFilters(); renderGrid();
  });

  $('#btn-random').addEventListener('click', () => {
    const pool = state.works.filter(isOnline);
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    openDrawer(pick.id);
  });

  $('#drawer-close').addEventListener('click', closeDrawer);
  $('#drawer-backdrop').addEventListener('click', closeDrawer);
  $('#stage-back').addEventListener('click', closeStage);
  $('#stage-open').addEventListener('click', stageOpenExternal);
  $('#stage-select').addEventListener('change', (e) => openStage(e.target.value));

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (btn) {
      const act = btn.dataset.act;
      const id = btn.dataset.id;
      if (act === 'play') { closeDrawer(); openStage(id); }
      else if (act === 'open') { window.open(workById(id)?.entry, '_blank', 'noopener'); }
      else if (act === 'detail') { openDrawer(id); }
      else if (act === 'copy') {
        const url = new URL(workById(id)?.entry || '', location.href).href;
        navigator.clipboard?.writeText(url).then(
          () => { btn.textContent = '已复制 ✓'; setTimeout(() => { btn.textContent = '复制线上地址'; }, 1600); },
          () => { btn.textContent = '复制失败'; }
        );
      }
      return;
    }
    const card = e.target.closest('.card');
    if (card && !e.target.closest('button')) openDrawer(card.dataset.id);
  });

  document.addEventListener('keydown', (e) => {
    const stageOpen = !$('#stage').hidden;
    const drawerOpen = !$('#drawer').hidden;
    if (e.key === 'Escape') {
      if (stageOpen) { closeStage(); e.preventDefault(); }
      else if (drawerOpen) { closeDrawer(); e.preventDefault(); }
      return;
    }
    if (stageOpen || drawerOpen) return;
    if (e.key === '/' && document.activeElement !== $('#q')) {
      e.preventDefault();
      $('#q').focus();
    }
  });

  $('#q').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $('#q').value = ''; state.q = ''; renderGrid(); $('#q').blur(); }
  });
}

/* -------------------------------------------------- generative backdrop */

function initField() {
  const cv = $('#field');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w = 0, h = 0, dpr = 1, dots = [], t = 0, raf = 0;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = Math.floor(w * dpr); cv.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.round((w * h) / 26000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: 0.7 + Math.random() * 1.5,
      hue: Math.random() < 0.22 ? '79,214,232' : Math.random() < 0.5 ? '255,106,43' : '243,237,225',
    }));
  };

  const draw = () => {
    t += 0.006;
    ctx.clearRect(0, 0, w, h);

    // 回响环：从若干锚点发出的扩散圆
    const anchors = dots.filter((_, i) => i % 23 === 0);
    ctx.lineWidth = 1;
    anchors.forEach((a, i) => {
      const phase = (t * 0.5 + i * 0.37) % 1;
      const rad = phase * Math.max(w, h) * 0.55;
      ctx.strokeStyle = `rgba(79,214,232,${(0.10 * (1 - phase)).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, rad, 0, Math.PI * 2);
      ctx.stroke();
    });

    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < -20) d.x = w + 20;
      if (d.x > w + 20) d.x = -20;
      if (d.y < -20) d.y = h + 20;
      if (d.y > h + 20) d.y = -20;
      ctx.fillStyle = `rgba(${d.hue},0.30)`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  if (reduce) { draw(); cancelAnimationFrame(raf); } else { raf = requestAnimationFrame(draw); }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduce) raf = requestAnimationFrame(draw);
  });
}

/* ----------------------------------------------------------------- boot */

async function main() {
  await loadData();
  renderStats();
  renderFilters();
  renderGrid();
  renderBoard();
  bind();
  initField();

  const foot = $('#foot-meta');
  if (foot) {
    const m = state.manifest.meta || {};
    const built = state.report.builtAt ? new Date(state.report.builtAt).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—';
    foot.innerHTML = [
      `REPO ${esc(m.repo || '—')}`,
      `BATCH ${esc(m.batch || '—')}`,
      `BUILD ${esc(built)}`,
      `NODE ${esc(state.report.node || '—')}`,
    ].join('<br>');
  }
}

main();
