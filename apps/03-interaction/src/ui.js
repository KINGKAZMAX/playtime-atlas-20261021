/**
 * 界面渲染层
 * ------------------------------------------------------------------
 * 纯渲染函数：接收车间状态 → 更新 DOM。不持有业务状态。
 * 所有视图都从 workshop 状态派生，因此派单 / 撤单 / 故障等副作用
 * 在日志、订单簿、机台矩阵、遥测台四处同步可见。
 */

import {
  PRIORITY_LABEL, LOOM_STATE, LOOM_STATE_LABEL, SHIFT, SHIFT_LABEL, TEMPO,
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

/* ────────────── 当班控制 ────────────── */

/** 状态芯片、暂停按钮文案、班次节奏高亮。 */
export function renderShift(state) {
  const chip = $('#shift-chip');
  if (chip) {
    chip.dataset.shift = state.shift;
    $('#shift-chip-text').textContent = SHIFT_LABEL[state.shift] ?? state.shift;
    chip.title = state.shift === SHIFT.RUNNING
      ? '当班在产：机台正在织造，遥测持续采样'
      : (state.shift === SHIFT.PAUSED ? '当班暂停：织造与遥测已冻结' : '待开工：点击「开工并派工」开始投产');
  }

  const pause = $('#btn-shift-pause');
  if (pause) {
    const paused = state.shift === SHIFT.PAUSED;
    pause.textContent = paused ? '继续当班' : '暂停当班';
    pause.setAttribute('aria-pressed', String(paused));
  }

  const dispatch = $('#btn-dispatch');
  if (dispatch) {
    dispatch.textContent = state.shift === SHIFT.IDLE ? '开工并派工' : '开始派工';
    dispatch.title = state.shift === SHIFT.IDLE
      ? '开工并把待排订单派到空闲机台'
      : '把待排订单派到空闲机台';
  }

  const auto = $('#btn-auto-dispatch');
  if (auto) {
    auto.setAttribute('aria-pressed', String(Boolean(state.autoDispatch)));
    auto.textContent = `自动续派 · ${state.autoDispatch ? '开' : '关'}`;
  }

  $$('#tempo-group .seg__btn').forEach((b) => {
    const on = b.dataset.tempo === state.tempo;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
    if (on) b.title = TEMPO[state.tempo]?.note ?? '';
  });
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

/**
 * 订单列表采用**稳定 DOM**：每张订单卡片只建一次，之后只改变化的字段。
 * 若整表每 900ms 重建一次，鼠标按下与抬起之间节点会被换掉，点击会丢失。
 */
const orderNodes = new Map();

function orderSignature(o, section) {
  if (section === 'queued') {
    return `q|${o.id}|${o.cloth}|${o.dye}|${o.width}|${o.density}|${o.picks}|${o.priority}|${o.hold ? 1 : 0}`;
  }
  if (section === 'active') {
    return `a|${o.id}|${o.cloth}|${o.dye}|${o.width}|${o.density}|${o.picks}|${o.priority}|${o.loomId}|${o.state}`;
  }
  return `d|${o.id}|${o.cloth}|${o.dye}|${o.width}|${o.picks}`;
}

function orderCardHtml(o, section) {
  if (section === 'queued') {
    return `
          <div class="order-card__top">
            <span class="order-card__id">${o.id}</span>
            <span class="order-card__name">${escapeHtml(o.cloth)} · ${escapeHtml(o.dye)}</span>
            <span class="order-card__prio" data-p="${o.priority}">${PRIORITY_LABEL[o.priority]}</span>
            ${o.hold ? '<span class="order-card__hold">已挂起</span>' : ''}
          </div>
          <div class="order-card__meta">
            <span>幅宽 <b>${o.width}</b>cm</span>
            <span>经密 <b>${o.density}</b></span>
            <span><b>${o.picks}</b> 匹</span>
          </div>
          <div class="order-card__state">${orderStateLabel(o.state)}</div>
          <div class="order-card__acts">
            <button type="button" class="btn btn--tiny ds-btn ds-btn--sm" data-act="assign" data-order="${o.id}">派单…</button>
            <button type="button" class="btn btn--tiny ds-btn ds-btn--sm" data-act="raise" data-order="${o.id}" ${o.priority === 1 ? 'disabled' : ''}>提优先</button>
            <button type="button" class="btn btn--tiny ds-btn ds-btn--sm" data-act="lower" data-order="${o.id}" ${o.priority === 3 ? 'disabled' : ''}>降优先</button>
            <button type="button" class="btn btn--tiny ds-btn ds-btn--sm" data-act="cancel" data-order="${o.id}">撤单</button>
          </div>`;
  }

  if (section === 'active') {
    return `
          <div class="order-card__top">
            <span class="order-card__id">${o.id}</span>
            <span class="order-card__name">${escapeHtml(o.cloth)} · ${escapeHtml(o.dye)}</span>
            <span class="order-card__prio" data-p="${o.priority}">${PRIORITY_LABEL[o.priority]}</span>
          </div>
          <div class="order-card__meta">
            <span>${escapeHtml(o.loomId ?? '—')}</span>
            <span>幅宽 <b>${o.width}</b>cm</span>
            <span>经密 <b>${o.density}</b></span>
            <span><b>${o.picks}</b> 匹</span>
          </div>
          <div class="order-card__state is-run" data-f="progress">${orderStateLabel(o.state)} · ${fmt(o.progress, 0)}%</div>`;
  }

  return `
          <div class="order-card__top">
            <span class="order-card__id">${o.id}</span>
            <span class="order-card__name">${escapeHtml(o.cloth)} · ${escapeHtml(o.dye)}</span>
          </div>
          <div class="order-card__meta"><span>${o.picks} 匹 · ${o.width}cm</span></div>
          <div class="order-card__state">已完工</div>`;
}

export function renderOrders(state, handlers) {
  const list = $('#order-list');
  const empty = $('#orders-empty');
  const queue = sortQueue(state.orders);
  const active = state.orders.filter((o) => o.state !== 'queued' && o.state !== 'cancelled');
  const finished = state.orders.filter((o) => o.state === 'done');

  // 订单簿计数 = 排队 + 在制 + 完工
  $('#orders-count').textContent = String(state.orders.length);

  // 期望顺序：排队 → 在制 → 完工（最近 6 张）
  const plan = [
    ...queue.map((o) => [o, 'queued']),
    ...active.map((o) => [o, 'active']),
    ...finished.slice(-6).reverse().map((o) => [o, 'done']),
  ];
  const wanted = new Set(plan.map(([o]) => o.id));

  // 清掉已经不在列表里的节点
  for (const [id, node] of orderNodes) {
    if (!wanted.has(id)) { node.remove(); orderNodes.delete(id); }
  }

  plan.forEach(([o, section], idx) => {
    let node = orderNodes.get(o.id);
    const sig = orderSignature(o, section);
    if (!node) {
      node = document.createElement('li');
      node.dataset.order = o.id;
      orderNodes.set(o.id, node);
    }
    if (node.dataset.sig !== sig) {
      node.innerHTML = orderCardHtml(o, section);
      node.dataset.sig = sig;
      node.className = `order-card${section === 'active' ? ' is-running' : ''}${section === 'done' ? ' is-done' : ''}`;
    } else if (section === 'active') {
      // 只更新进度文本，节点与按钮保持不动
      const p = node.querySelector('[data-f="progress"]');
      if (p) p.textContent = `${orderStateLabel(o.state)} · ${fmt(o.progress, 0)}%`;
    }
    // 保证 DOM 顺序与期望一致（insertBefore 会移动已有节点，不会重建）
    if (list.children[idx] !== node) list.insertBefore(node, list.children[idx] || null);
  });

  // 队首高亮单独处理，避免因为排序变化而重建卡片
  plan.forEach(([o, section], idx) => {
    const node = orderNodes.get(o.id);
    if (node) node.classList.toggle('is-top', section === 'queued' && idx === 0);
  });

  empty.hidden = plan.length > 0;
  $('#btn-clear-orders').disabled = queue.length === 0;
}

/* ────────────── 机台矩阵 ────────────── */

/**
 * 机台卡片同样使用稳定 DOM：12 张卡片只建一次，之后原地更新状态、进度与读数。
 * 整表重建会让「点开详情抽屉」这类操作在点击瞬间丢失目标节点。
 */
const loomNodes = new Map();

function loomCardHtml(loom) {
  return `
        <span class="loom__badge" hidden></span>
        <div class="loom__head">
          <span class="loom__id">${loom.id}</span>
          <span class="loom__state"></span>
        </div>
        <div class="loom__order"></div>
        <div class="loom__bar"><div class="loom__barfill"></div></div>
        <div class="loom__stats">
          <span>梭速 <b data-f="pickSpeed"></b></span>
          <span>张力 <b data-f="tension"></b></span>
          <span>断经 <b data-f="breaks"></b></span>
        </div>
        <div class="loom__spark" aria-hidden="true"></div>`;
}

export function renderLooms(state, handlers) {
  const grid = $('#loom-grid');

  state.looms.forEach((loom, idx) => {
    let card = loomNodes.get(loom.id);
    if (!card) {
      card = document.createElement('button');
      card.type = 'button';
      card.className = 'loom';
      card.setAttribute('role', 'listitem');
      card.dataset.loom = loom.id;
      card.dataset.idx = String(idx);
      card.innerHTML = loomCardHtml(loom);
      loomNodes.set(loom.id, card);
    }
    if (grid.children[idx] !== card) grid.insertBefore(card, grid.children[idx] || null);

    const order = state.orders.find((o) => o.id === loom.orderId);
    const orderText = order
      ? `<b>${order.id}</b> ${escapeHtml(order.cloth)}·${escapeHtml(order.dye)}`
      : (loom.state === LOOM_STATE.IDLE ? '等待派工' : (loom.state === LOOM_STATE.FAULT ? '断经待复位' : '—'));

    card.dataset.state = loom.state;
    card.classList.toggle('is-selected', state.selectedLoomId === loom.id);
    card.setAttribute('aria-label', `${loom.id} ${loom.name}，状态 ${LOOM_STATE_LABEL[loom.state]}`);

    const badge = card.querySelector('.loom__badge');
    const badgeText = loom.state === LOOM_STATE.FAULT ? '断经'
      : (loom.state === LOOM_STATE.WARP ? '换经' : '');
    if (badgeText) {
      badge.hidden = false;
      badge.textContent = badgeText;
      badge.style.background = loom.state === LOOM_STATE.FAULT ? '' : 'var(--ds-warning)';
    } else {
      badge.hidden = true;
    }

    card.querySelector('.loom__state').textContent = LOOM_STATE_LABEL[loom.state];
    card.querySelector('.loom__order').innerHTML = orderText;
    card.querySelector('.loom__barfill').style.width = `${loom.progress.toFixed(1)}%`;
    card.querySelector('[data-f="pickSpeed"]').textContent = String(loom.pickSpeed);
    card.querySelector('[data-f="tension"]').textContent = fmt(loom.tension, 0);
    card.querySelector('[data-f="breaks"]').textContent = String(loom.breaks);

    const spark = card.querySelector('.loom__spark');
    const sparkSig = (loom.spark ?? []).join(',');
    if (spark.dataset.sig !== sparkSig) {
      spark.innerHTML = (loom.spark ?? []).map((v) => `<i style="height:${Math.max(6, v)}%"></i>`).join('');
      spark.dataset.sig = sparkSig;
    }
  });
}

/* ────────────── 遥测台 ────────────── */

/** 读数与负载条也保持稳定 DOM，读数原地更新、进度条过渡才能生效。 */
const readoutKeys = ['density', 'speed', 'tension', 'breaks', 'running', 'energy', 'faults', 'output'];
const readoutNodes = new Map();

function readoutHtml(k) {
  return `<div class="readout__k">${k}</div><div class="readout__v"><span data-f="v"></span><small data-f="u"></small></div>`;
}

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

  const box = $('#readouts');
  readouts.forEach((r, i) => {
    let node = readoutNodes.get(i);
    if (!node) {
      node = document.createElement('div');
      node.className = 'readout';
      node.innerHTML = readoutHtml(r.k);
      readoutNodes.set(i, node);
    }
    if (box.children[i] !== node) box.insertBefore(node, box.children[i] || null);
    node.className = `readout ${r.cls}`;
    const v = node.querySelector('[data-f="v"]');
    const u = node.querySelector('[data-f="u"]');
    if (v && v.textContent !== r.v) v.textContent = r.v;
    if (u && u.textContent !== r.u) u.textContent = r.u;
  });

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
        <stop offset="0%" style="stop-color: var(--ds-accent)" stop-opacity=".55"/>
        <stop offset="100%" style="stop-color: var(--ds-accent)" stop-opacity="0"/>
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

const barNodes = new Map();

function renderLoadBars(state) {
  const box = $('#load-bars');
  state.looms.forEach((loom, idx) => {
    let row = barNodes.get(loom.id);
    if (!row) {
      row = document.createElement('div');
      row.className = 'bar-row';
      row.innerHTML = `
        <span class="bar-row__id">${loom.id}</span>
        <div class="bar-row__track"><div class="bar-row__fill"></div></div>
        <span class="bar-row__v"></span>`;
      barNodes.set(loom.id, row);
    }
    if (box.children[idx] !== row) box.insertBefore(row, box.children[idx] || null);

    const order = state.orders.find((o) => o.id === loom.orderId);
    const load = loom.state === LOOM_STATE.RUN ? loom.progress : (loom.state === LOOM_STATE.WARP ? 4 : 0);
    const color = loom.state === LOOM_STATE.RUN ? 'var(--ds-ink-soft)'
      : loom.state === LOOM_STATE.FAULT ? 'var(--ds-danger)'
      : loom.state === LOOM_STATE.WARP ? 'var(--ds-warning)' : 'var(--ds-ink-faint)';
    const fill = row.querySelector('.bar-row__fill');
    const v = row.querySelector('.bar-row__v');
    if (fill) {
      fill.style.width = `${load.toFixed(1)}%`;
      fill.style.background = color;
    }
    if (v) v.textContent = order ? order.cloth : '—';
  });
}

/* ────────────── 日志带 ────────────── */

/**
 * 增量渲染日志。
 * 只有在「有新条目」「筛选级别变了」「被清空」时才动 DOM —— 否则整表重建会
 * 反复重放淡入动画，导致日志每 900ms 闪一次、行几乎看不见。
 */
let logRenderState = { level: null, lastId: null };

export function renderLog(state, { force = false } = {}) {
  const list = $('#log-list');
  const levelChanged = logRenderState.level !== state.logLevel;
  const filtered = state.log.filter((e) => {
    if (state.logLevel === 'all') return true;
    if (state.logLevel === 'warn') return e.level === 'warn' || e.level === 'error';
    return e.level === 'error';
  });

  const newestId = filtered.length ? filtered[filtered.length - 1].id : null;
  const hasNew = newestId !== logRenderState.lastId;

  if (force || levelChanged || !filtered.length) {
    list.innerHTML = filtered.map((e) => logRowHtml(e)).join('');
  } else if (hasNew) {
    // 只追加尚未渲染的新条目
    const known = new Set(list.children.length ? [...list.children].map((c) => c.dataset.id) : []);
    for (const e of filtered) {
      if (known.has(String(e.id))) continue;
      list.insertAdjacentHTML('beforeend', logRowHtml(e));
      known.add(String(e.id));
    }
    while (list.children.length > 220) list.removeChild(list.firstChild);
  }

  logRenderState = { level: state.logLevel, lastId: newestId };

  if (!state.logPaused) {
    list.parentElement.scrollTop = list.parentElement.scrollHeight;
  }
}

function logRowHtml(e) {
  const src = e.source === '主管' ? '主管' : e.source;
  return `<li class="log-row" data-level="${e.level}" data-id="${e.id}">
    <span class="log-row__t">${clockTime(e.at)}</span>
    <span class="log-row__src">${escapeHtml(src)}</span>
    <span class="log-row__msg">${escapeHtml(e.message)}</span>
  </li>`;
}

/* ────────────── 抽屉 ────────────── */

/**
 * 抽屉同样保持稳定 DOM：结构只在「换机台 / 订单上下机」时重建，
 * 其余读数原地更新 —— 避免每 900ms 换掉「复位故障」按钮导致点击丢失。
 */
let drawerKey = null;

function drawerSkeleton() {
  return `
    <div class="dsec">
      <div class="dsec__h">机台状态</div>
      <dl class="dl">
        <dt>状态</dt><dd data-f="state"></dd>
        <dt>当前订单</dt><dd data-f="orderId"></dd>
        <dt>进度</dt><dd data-f="progress"></dd>
        <dt>梭速</dt><dd data-f="pickSpeed"></dd>
        <dt>张力</dt><dd data-f="tension"></dd>
        <dt>目标张力</dt><dd data-f="tensionTarget"></dd>
        <dt>本班能耗</dt><dd data-f="energy"></dd>
        <dt>断经次数</dt><dd data-f="breaks"></dd>
      </dl>
    </div>

    <div class="dsec" data-sec="order" hidden>
      <div class="dsec__h">在制订单</div>
      <dl class="dl">
        <dt>布种</dt><dd data-f="cloth"></dd>
        <dt>配色</dt><dd data-f="dye"></dd>
        <dt>幅宽</dt><dd data-f="width"></dd>
        <dt>经密</dt><dd data-f="density"></dd>
        <dt>匹数</dt><dd data-f="picks"></dd>
        <dt>优先级</dt><dd data-f="priority"></dd>
        <dt>状态</dt><dd data-f="orderState"></dd>
      </dl>
    </div>

    <div class="dsec">
      <div class="dsec__h">进度曲线</div>
      <svg class="dspark" viewBox="0 0 308 62" preserveAspectRatio="none" role="img" aria-label="该机进度曲线">
        <line x1="0" y1="58" x2="308" y2="58"/>
        <line x1="0" y1="30" x2="308" y2="30"/>
        <path data-f="sparkPath"/>
      </svg>
    </div>

    <div class="dsec">
      <div class="dsec__h">机台操作</div>
      <div class="order-card__acts">
        <button type="button" class="btn btn--tiny ds-btn ds-btn--sm" data-drawer-act="reset">复位故障</button>
        <button type="button" class="btn btn--tiny ds-btn ds-btn--sm" data-drawer-act="power">停机</button>
        <button type="button" class="btn btn--tiny ds-btn ds-btn--sm" data-drawer-act="revoke">撤销订单</button>
      </div>
    </div>

    <div class="dsec">
      <div class="dsec__h">事件历史</div>
      <div data-f="history"></div>
    </div>`;
}

export function renderDrawer(state) {
  const drawer = $('#drawer');
  const loom = state.looms.find((l) => l.id === state.selectedLoomId);
  if (!loom) {
    drawer.hidden = true;
    drawerKey = null;
    return;
  }

  drawer.hidden = false;
  $('#drawer-title').textContent = `${loom.id} · ${loom.name}`;

  const order = state.orders.find((o) => o.id === loom.orderId);
  const key = `${loom.id}|${order?.id ?? ''}`;
  const body = $('#drawer-body');

  if (key !== drawerKey) {
    body.innerHTML = drawerSkeleton();
    drawerKey = key;
  }

  const set = (field, value) => {
    const el = body.querySelector(`[data-f="${field}"]`);
    if (el) el.textContent = value;
  };

  set('state', LOOM_STATE_LABEL[loom.state]);
  set('orderId', order ? order.id : '—');
  set('progress', `${fmt(loom.progress, 1)}%`);
  set('pickSpeed', `${loom.pickSpeed} 梭/分`);
  set('tension', `${fmt(loom.tension, 1)} N`);
  set('tensionTarget', `${loom.tensionTarget} N`);
  set('energy', `${fmt(loom.energy, 3)} kWh`);
  set('breaks', String(loom.breaks));

  const orderSec = body.querySelector('[data-sec="order"]');
  if (orderSec) orderSec.hidden = !order;
  if (order) {
    set('cloth', order.cloth);
    set('dye', order.dye);
    set('width', `${order.width} cm`);
    set('density', `${order.density} 根/cm`);
    set('picks', String(order.picks));
    set('priority', PRIORITY_LABEL[order.priority]);
    set('orderState', orderStateLabel(order.state));
  }

  // 进度曲线
  const spark = loom.spark ?? [];
  const maxV = Math.max(100, ...spark);
  const sparkPath = spark.length > 1
    ? spark.map((v, i) => {
        const px = (i / (spark.length - 1)) * 300 + 4;
        const py = 58 - (v / maxV) * 52;
        return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
      }).join(' ')
    : '';
  const pathEl = body.querySelector('[data-f="sparkPath"]');
  if (pathEl) pathEl.setAttribute('d', sparkPath);

  // 机台操作
  const resetBtn = body.querySelector('[data-drawer-act="reset"]');
  const powerBtn = body.querySelector('[data-drawer-act="power"]');
  const revokeBtn = body.querySelector('[data-drawer-act="revoke"]');
  if (resetBtn) resetBtn.disabled = loom.state !== LOOM_STATE.FAULT;
  if (powerBtn) {
    powerBtn.disabled = loom.state === LOOM_STATE.FAULT;
    powerBtn.textContent = loom.state === LOOM_STATE.STOP ? '开机' : '停机';
  }
  if (revokeBtn) revokeBtn.disabled = !loom.orderId;

  // 事件历史（仅在条数变化时重建）
  const historyEl = body.querySelector('[data-f="history"]');
  if (historyEl) {
    const events = loom.history.slice().reverse();
    if (historyEl.dataset.n !== String(events.length)) {
      historyEl.dataset.n = String(events.length);
      historyEl.innerHTML = events.length
        ? events.map((e) => `
        <div class="devent">
          <span class="devent__t">${clockTime(e.at)}</span>
          <span class="devent__m">${escapeHtml(e.message)}</span>
        </div>`).join('')
        : '<p class="empty-note">本班暂无事件记录。</p>';
    }
  }
}

/* ────────────── Toast ────────────── */

/**
 * @param {string} message 文案
 * @param {string} kind    '' | 'ok' | 'err'
 * @param {object} [action] 可选操作按钮 { label, onClick }
 */
export function toast(message, kind = '', action = null) {
  const stack = $('#toast-stack');
  const el = document.createElement('div');
  el.className = `toast ${kind ? `is-${kind}` : ''}`;

  const text = document.createElement('span');
  text.className = 'toast__msg';
  text.textContent = message;
  el.appendChild(text);

  const dismiss = () => {
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 320);
  };

  if (action?.label) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast__act';
    btn.textContent = action.label;
    btn.addEventListener('click', () => {
      action.onClick?.();
      dismiss();
    });
    el.appendChild(btn);
  }

  stack.appendChild(el);
  setTimeout(dismiss, action?.label ? 6000 : 2600);
}

export { $, $$, escapeHtml, clockTime };
