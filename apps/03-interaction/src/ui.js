/**
 * 界面渲染层
 * ------------------------------------------------------------------
 * 纯渲染函数：接收车间状态 → 更新 DOM。不持有业务状态。
 * 所有视图都从 workshop 状态派生，因此派单 / 撤单 / 故障等副作用
 * 在日志、订单簿、机台矩阵、遥测台四处同步可见。
 */

import {
  CLOTHS, DYES, PRIORITY_LABEL, LOOM_STATE, LOOM_STATE_LABEL,
  orderStateLabel, sortQueue, TELEMETRY_POINTS,
} from './workshop.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const fmt = (n, d = 1) => (Number.isFinite(n) ? n.toFixed(d) : '—');

function clockTime(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ────────────── 页眉读数 ────────────── */

export function renderHeadline(state) {
  const running = state.looms.filter((l) => l.state === LOOM_STATE.RUN).length;
  const queued = state.orders.filter((o) => o.state === 'queued').length;
  const faults = state.looms.filter((l) => l.state === LOOM_STATE.FAULT).length;

  const last = state.telemetry[state.telemetry.length - 1];
  const breakRate = last ? last.breakRate : 0;

  $('#stat-running').textContent = String(running);
  $('#stat-queued').textContent = String(queued);
  $('#stat-output').textContent = `${state.output} 匹`;

  const br = $('#stat-breakrate');
  br.textContent = `${breakRate}`;
  br.classList.toggle('is-warn', breakRate > 0 && breakRate <= 2);
  br.classList.toggle('is-err', breakRate > 2);

  const faultNote = $('#stat-running');
  faultNote.classList.toggle('is-err', faults > 0);
}

/* ────────────── 订单簿 ────────────── */

export function renderOrders(state, handlers) {
  const list = $('#order-list');
  const empty = $('#orders-empty');
  const queue = sortQueue(state.orders);
  const active = state.orders.filter((o) => o.state !== 'queued' && o.state !== 'cancelled');
  const finished = state.orders.filter((o) => o.state === 'done');

  // 订单簿计数 = 排队 + 在制 + 完工
  $('#orders-count').textContent = String(state.orders.length);

  const rows = [];

  if (queue.length) {
    rows.push(`<li class="order-card__section" style="display:none"></li>`);
    queue.forEach((o, idx) => {
      rows.push(`
        <li class="order-card ${idx === 0 ? 'is-top' : ''}" data-order="${o.id}">
          <div class="order-card__top">
            <span class="order-card__id">${o.id}</span>
            <span class="order-card__name">${escapeHtml(o.cloth)} · ${escapeHtml(o.dye)}</span>
            <span class="order-card__prio" data-p="${o.priority}">${PRIORITY_LABEL[o.priority]}</span>
          </div>
          <div class="order-card__meta">
            <span>幅宽 <b>${o.width}</b>cm</span>
            <span>经密 <b>${o.density}</b></span>
            <span><b>${o.picks}</b> 匹</span>
          </div>
          <div class="order-card__state">${orderStateLabel(o.state)}</div>
          <div class="order-card__acts">
            <button type="button" class="btn btn--tiny" data-act="assign" data-order="${o.id}">派单…</button>
            <button type="button" class="btn btn--tiny" data-act="raise" data-order="${o.id}" ${o.priority === 1 ? 'disabled' : ''}>提优先</button>
            <button type="button" class="btn btn--tiny" data-act="lower" data-order="${o.id}" ${o.priority === 3 ? 'disabled' : ''}>降优先</button>
            <button type="button" class="btn btn--tiny" data-act="cancel" data-order="${o.id}">撤单</button>
          </div>
        </li>`);
    });
  }

  if (active.length) {
    for (const o of active) {
      const loom = state.looms.find((l) => l.id === o.loomId);
      rows.push(`
        <li class="order-card is-running" data-order="${o.id}">
          <div class="order-card__top">
            <span class="order-card__id">${o.id}</span>
            <span class="order-card__name">${escapeHtml(o.cloth)} · ${escapeHtml(o.dye)}</span>
            <span class="order-card__prio" data-p="${o.priority}">${PRIORITY_LABEL[o.priority]}</span>
          </div>
          <div class="order-card__meta">
            <span>${escapeHtml(loom ? loom.id : '—')}</span>
            <span>幅宽 <b>${o.width}</b>cm</span>
            <span>经密 <b>${o.density}</b></span>
            <span><b>${o.picks}</b> 匹</span>
          </div>
          <div class="order-card__state is-run">${orderStateLabel(o.state)} · ${fmt(o.progress, 0)}%</div>
        </li>`);
    }
  }

  if (finished.length) {
    for (const o of finished.slice(-6).reverse()) {
      rows.push(`
        <li class="order-card is-done" data-order="${o.id}">
          <div class="order-card__top">
            <span class="order-card__id">${o.id}</span>
            <span class="order-card__name">${escapeHtml(o.cloth)} · ${escapeHtml(o.dye)}</span>
          </div>
          <div class="order-card__meta"><span>${o.picks} 匹 · ${o.width}cm</span></div>
          <div class="order-card__state">已完工</div>
        </li>`);
    }
  }

  list.innerHTML = rows.join('');
  empty.hidden = rows.length > 0;
  $('#btn-clear-orders').disabled = queue.length === 0;
}

/* ────────────── 机台矩阵 ────────────── */

export function renderLooms(state, handlers) {
  const grid = $('#loom-grid');
  grid.innerHTML = state.looms.map((loom, idx) => {
    const order = state.orders.find((o) => o.id === loom.orderId);
    const orderText = order
      ? `<b>${order.id}</b> ${escapeHtml(order.cloth)}·${escapeHtml(order.dye)}`
      : (loom.state === LOOM_STATE.IDLE ? '等待派工' : (loom.state === LOOM_STATE.FAULT ? '断经待复位' : '—'));
    const spark = (loom.spark ?? []).map((v) => `<i style="height:${Math.max(6, v)}%"></i>`).join('');
    const selected = state.selectedLoomId === loom.id;
    const badge = loom.state === LOOM_STATE.FAULT
      ? '<span class="loom__badge">断经</span>'
      : (loom.state === LOOM_STATE.WARP ? '<span class="loom__badge" style="background:var(--gold)">换经</span>' : '');

    return `
      <button type="button" class="loom ${selected ? 'is-selected' : ''}" role="listitem"
              data-state="${loom.state}" data-loom="${loom.id}" data-idx="${idx}"
              aria-label="${loom.id} ${loom.name}，状态 ${LOOM_STATE_LABEL[loom.state]}">
        ${badge}
        <div class="loom__head">
          <span class="loom__id">${loom.id}</span>
          <span class="loom__state">${LOOM_STATE_LABEL[loom.state]}</span>
        </div>
        <div class="loom__order">${orderText}</div>
        <div class="loom__bar"><div class="loom__barfill" style="width:${loom.progress.toFixed(1)}%"></div></div>
        <div class="loom__stats">
          <span>梭速 <b>${loom.pickSpeed}</b></span>
          <span>张力 <b>${fmt(loom.tension, 0)}</b></span>
          <span>断经 <b>${loom.breaks}</b></span>
        </div>
        <div class="loom__spark" aria-hidden="true">${spark}</div>
      </button>`;
  }).join('');
}

/* ────────────── 遥测台 ────────────── */

export function renderTelemetry(state) {
  const running = state.looms.filter((l) => l.state === LOOM_STATE.RUN);
  const last = state.telemetry[state.telemetry.length - 1] ?? { density: 0, speed: 0, tension: 0, running: 0, breakRate: 0, energy: 0 };
  const faults = state.looms.filter((l) => l.state === LOOM_STATE.FAULT).length;
  const totalEnergy = state.looms.reduce((s, l) => s + l.energy, 0);
  const avgDensity = running.length
    ? running.reduce((s, l) => s + (state.orders.find((o) => o.id === l.orderId)?.density ?? 0), 0) / running.length
    : 0;

  const readouts = [
    { k: '平均经密', v: fmt(avgDensity, 0), u: '根/cm', cls: '' },
    { k: '平均梭速', v: fmt(last.speed, 0), u: '梭/分', cls: '' },
    { k: '平均张力', v: fmt(last.tension, 0), u: 'N', cls: last.tension > 74 ? 'is-warn' : '' },
    { k: '断经次数', v: String(last.breakRate), u: '次', cls: last.breakRate > 2 ? 'is-err' : (last.breakRate ? 'is-warn' : '') },
    { k: '在织台数', v: String(running.length), u: '台', cls: '' },
    { k: '累计能耗', v: fmt(totalEnergy, 2), u: 'kWh', cls: '' },
    { k: '故障机台', v: String(faults), u: '台', cls: faults ? 'is-err' : '' },
    { k: '本班产量', v: String(state.output), u: '匹', cls: '' },
  ];

  $('#readouts').innerHTML = readouts.map((r) => `
    <div class="readout ${r.cls}">
      <div class="readout__k">${r.k}</div>
      <div class="readout__v">${r.v}<small>${r.u}</small></div>
    </div>`).join('');

  renderChart(state);
  renderLoadBars(state);
}

function renderChart(state) {
  const svg = $('#telemetry-chart');
  const scale = state.chartScale;
  const series = state.telemetry.slice(-TELEMETRY_POINTS);
  const W = 320, H = 140, PAD_L = 26, PAD_R = 6, PAD_T = 8, PAD_B = 16;

  if (!series.length) {
    svg.innerHTML = `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" class="chart-label">等待采样…</text>`;
    return;
  }

  const values = series.map((d) => (scale === 'density' ? d.density : d.speed));
  const maxRaw = Math.max(...values, 1);
  const minRaw = Math.min(...values, 0);
  const span = Math.max(maxRaw - minRaw, scale === 'density' ? 8 : 6);
  const lo = minRaw - span * 0.12;
  const hi = maxRaw + span * 0.16;

  const x = (i) => PAD_L + (i / Math.max(1, series.length - 1)) * (W - PAD_L - PAD_R);
  const y = (v) => PAD_T + (1 - (v - lo) / (hi - lo)) * (H - PAD_T - PAD_B);

  const pts = series.map((d, i) => [x(i), y(values[i])]);
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - PAD_B} L${pts[0][0].toFixed(1)},${H - PAD_B} Z`;

  const gridLines = [0, 0.5, 1].map((f) => {
    const gy = PAD_T + f * (H - PAD_T - PAD_B);
    return `<line x1="${PAD_L}" y1="${gy.toFixed(1)}" x2="${W - PAD_R}" y2="${gy.toFixed(1)}"/>`;
  }).join('');

  const yTicks = [hi, (hi + lo) / 2, lo].map((v, i) => {
    const gy = PAD_T + (i / 2) * (H - PAD_T - PAD_B);
    return `<text x="2" y="${(gy + 3).toFixed(1)}" class="chart-label">${v.toFixed(0)}</text>`;
  }).join('');

  const lastPt = pts[pts.length - 1];

  svg.innerHTML = `
    <defs>
      <linearGradient id="loomdeck-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c04a24" stop-opacity=".55"/>
        <stop offset="100%" stop-color="#c04a24" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g class="chart-grid">${gridLines}</g>
    ${yTicks}
    <line class="chart-axis" x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${H - PAD_B}"/>
    <path class="chart-area" d="${area}"/>
    <path class="chart-line" d="${line}"/>
    <circle class="chart-dot" cx="${lastPt[0].toFixed(1)}" cy="${lastPt[1].toFixed(1)}" r="2.6"/>`;

  $('#chart-title').textContent = scale === 'density' ? '车间平均经密' : '车间平均梭速';
  $('#chart-unit').textContent = scale === 'density' ? '根/cm' : '梭/分';
}

function renderLoadBars(state) {
  const rows = state.looms.map((loom) => {
    const order = state.orders.find((o) => o.id === loom.orderId);
    const load = loom.state === LOOM_STATE.RUN ? loom.progress : (loom.state === LOOM_STATE.WARP ? 4 : 0);
    const color = loom.state === LOOM_STATE.RUN ? 'var(--indigo-mid)'
      : loom.state === LOOM_STATE.FAULT ? 'var(--err)'
      : loom.state === LOOM_STATE.WARP ? 'var(--gold)' : 'var(--ink-mute)';
    return `
      <div class="bar-row">
        <span class="bar-row__id">${loom.id}</span>
        <div class="bar-row__track"><div class="bar-row__fill" style="width:${load.toFixed(1)}%;background:${color}"></div></div>
        <span class="bar-row__v">${order ? escapeHtml(order.cloth) : '—'}</span>
      </div>`;
  }).join('');
  $('#load-bars').innerHTML = rows;
}

/* ────────────── 日志带 ────────────── */

export function renderLog(state, { append = false } = {}) {
  const list = $('#log-list');
  const filtered = state.log.filter((e) => {
    if (state.logLevel === 'all') return true;
    if (state.logLevel === 'warn') return e.level === 'warn' || e.level === 'error';
    return e.level === 'error';
  });

  if (!append) {
    list.innerHTML = filtered.map((e) => logRowHtml(e)).join('');
  } else if (filtered.length) {
    const last = filtered[filtered.length - 1];
    list.insertAdjacentHTML('beforeend', logRowHtml(last));
    while (list.children.length > 220) list.removeChild(list.firstChild);
  }

  if (!state.logPaused) {
    list.parentElement.scrollTop = list.parentElement.scrollHeight;
  }
}

function logRowHtml(e) {
  const src = e.source === '主管' ? '主管' : e.source;
  return `<li class="log-row" data-level="${e.level}">
    <span class="log-row__t">${clockTime(e.at)}</span>
    <span class="log-row__src">${escapeHtml(src)}</span>
    <span class="log-row__msg">${escapeHtml(e.message)}</span>
  </li>`;
}

/* ────────────── 抽屉 ────────────── */

export function renderDrawer(state) {
  const drawer = $('#drawer');
  const loom = state.looms.find((l) => l.id === state.selectedLoomId);
  if (!loom) { drawer.hidden = true; return; }

  drawer.hidden = false;
  $('#drawer-title').textContent = `${loom.id} · ${loom.name}`;

  const order = state.orders.find((o) => o.id === loom.orderId);
  const spark = (loom.spark ?? []);
  const maxV = Math.max(100, ...spark);

  const sparkPath = spark.length > 1
    ? spark.map((v, i) => {
        const px = (i / (spark.length - 1)) * 300 + 4;
        const py = 58 - (v / maxV) * 52;
        return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
      }).join(' ')
    : '';

  const events = loom.history.slice().reverse();

  $('#drawer-body').innerHTML = `
    <div class="dsec">
      <div class="dsec__h">机台状态</div>
      <dl class="dl">
        <dt>状态</dt><dd>${LOOM_STATE_LABEL[loom.state]}</dd>
        <dt>当前订单</dt><dd>${order ? escapeHtml(order.id) : '—'}</dd>
        <dt>进度</dt><dd>${fmt(loom.progress, 1)}%</dd>
        <dt>梭速</dt><dd>${loom.pickSpeed} 梭/分</dd>
        <dt>张力</dt><dd>${fmt(loom.tension, 1)} N</dd>
        <dt>目标张力</dt><dd>${loom.tensionTarget} N</dd>
        <dt>本班能耗</dt><dd>${fmt(loom.energy, 3)} kWh</dd>
        <dt>断经次数</dt><dd>${loom.breaks}</dd>
      </dl>
    </div>

    ${order ? `
    <div class="dsec">
      <div class="dsec__h">在制订单</div>
      <dl class="dl">
        <dt>布种</dt><dd>${escapeHtml(order.cloth)}</dd>
        <dt>配色</dt><dd>${escapeHtml(order.dye)}</dd>
        <dt>幅宽</dt><dd>${order.width} cm</dd>
        <dt>经密</dt><dd>${order.density} 根/cm</dd>
        <dt>匹数</dt><dd>${order.picks}</dd>
        <dt>优先级</dt><dd>${PRIORITY_LABEL[order.priority]}</dd>
        <dt>状态</dt><dd>${orderStateLabel(order.state)}</dd>
      </dl>
    </div>` : ''}

    <div class="dsec">
      <div class="dsec__h">进度曲线</div>
      <svg class="dspark" viewBox="0 0 308 62" preserveAspectRatio="none" role="img" aria-label="该机进度曲线">
        <line x1="0" y1="58" x2="308" y2="58"/>
        <line x1="0" y1="30" x2="308" y2="30"/>
        ${sparkPath ? `<path d="${sparkPath}"/>` : ''}
      </svg>
    </div>

    <div class="dsec">
      <div class="dsec__h">机台操作</div>
      <div class="order-card__acts">
        <button type="button" class="btn btn--tiny" data-drawer-act="reset" ${loom.state !== LOOM_STATE.FAULT ? 'disabled' : ''}>复位故障</button>
        <button type="button" class="btn btn--tiny" data-drawer-act="power" ${loom.state === LOOM_STATE.FAULT ? 'disabled' : ''}>
          ${loom.state === LOOM_STATE.STOP ? '开机' : '停机'}
        </button>
        <button type="button" class="btn btn--tiny" data-drawer-act="revoke" ${loom.orderId ? '' : 'disabled'}>撤销订单</button>
      </div>
    </div>

    <div class="dsec">
      <div class="dsec__h">事件历史</div>
      ${events.length ? events.map((e) => `
        <div class="devent">
          <span class="devent__t">${clockTime(e.at)}</span>
          <span class="devent__m">${escapeHtml(e.message)}</span>
        </div>`).join('') : '<p class="empty-note">本班暂无事件记录。</p>'}
    </div>`;
}

/* ────────────── Toast ────────────── */

export function toast(message, kind = '') {
  const stack = $('#toast-stack');
  const el = document.createElement('div');
  el.className = `toast ${kind ? `is-${kind}` : ''}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 320);
  }, 2600);
}

export { $, $$, escapeHtml, clockTime };
