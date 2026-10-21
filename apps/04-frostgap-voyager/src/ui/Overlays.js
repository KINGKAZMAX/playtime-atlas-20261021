import * as THREE from 'three';
import {
  SCAN_TARGETS, SCAN_KIND_LABEL, SCAN_KIND_LABEL_EN, REGIONS,
  STAR, PLANETS, MOONS, BELT, STATION, DERELICT,
} from '../world/Config.js';
import { t, loc, getLang, onLangChange } from '../i18n/index.js';

const $ = (id) => document.getElementById(id);

/** Jump destinations available from the star chart. */
export const JUMP_TARGETS = [
  {
    id: 'velan-orbit',
    name: '维岚轨道',
    nameEn: 'Velan Orbit',
    subtitle: '气态巨行星 · 灯塔站',
    subtitleEn: 'Gas giant · Beacon Station',
    region: 'velan-orbit',
    position: new THREE.Vector3(620, 545, 640),
    info: '维岚与灯塔站所在的轨道带。补给点，也是这段航程的起点。',
    infoEn: 'The orbital band of Velan and Beacon Station — the resupply point and the start of this course.',
  },
  {
    id: 'debris-gallery',
    name: '碎屑回廊',
    nameEn: 'Debris Gallery',
    subtitle: '岩屑密集区 · 三处异常',
    subtitleEn: 'Dense rock · three anomalies',
    region: 'debris-gallery',
    position: BELT.center.clone().add(new THREE.Vector3(40, 330, 250)),
    info: '岩屑带的中心环。三处未登记异常体信号都记录在这个区域。',
    infoEn: 'The central ring of the rock belt. Signals from all three unlogged anomalies are recorded here.',
  },
  {
    id: 'frostgap-system',
    name: '霜隙环系',
    nameEn: 'Frostgap System',
    subtitle: '冰巨星 · 环带',
    subtitleEn: 'Ice giant · ring system',
    region: 'frostgap-system',
    position: PLANETS[1].position.clone().add(new THREE.Vector3(120, 160, 1320)),
    info: '冰巨星霜隙与它的冰晶环系，卫星莫恩位于外侧轨道。',
    infoEn: 'Ice giant Frostgap and its crystalline rings; moon Morn rides the outer orbit.',
  },
  {
    id: 'irda',
    name: '伊尔达',
    nameEn: 'Irda',
    subtitle: 'G2V 主序星',
    subtitleEn: 'G2V main-sequence star',
    region: 'irda',
    position: STAR.position.clone().add(new THREE.Vector3(0, 120, STAR.radius * 3.4)),
    info: '这片空隙里唯一的光源。靠近时辐射水平急升，注意船体温度。',
    infoEn: 'The only light source in this gap. Radiation climbs fast on approach — watch hull temperature.',
  },
  {
    id: 'kalso-array',
    name: '卡尔索阵列',
    nameEn: 'Kalso Array',
    subtitle: '废弃中继站',
    subtitleEn: 'Abandoned relay',
    region: 'debris-gallery',
    position: DERELICT.position.clone().add(new THREE.Vector3(0, 150, 190)),
    info: '一座被遗弃的中继阵列，正好落在碎屑回廊的几何中心。',
    infoEn: 'An abandoned relay array sitting exactly at the geometric centre of the Debris Gallery.',
  },
];

const HELP_ROWS = [
  ['help.key.mouse', 'help.row.mouse'],
  ['help.key.drag', 'help.row.drag'],
  ['W / S', 'help.row.ws'],
  ['A / D', 'help.row.ad'],
  ['Space / Ctrl', 'help.row.lift'],
  ['Q / E', 'help.row.roll'],
  ['help.key.arrow', 'help.row.arrow'],
  ['Shift', 'help.row.shift'],
  ['X / B', 'help.row.brake'],
  ['F', 'help.row.f'],
  ['R', 'help.row.r'],
  ['M', 'help.row.m'],
  ['Tab', 'help.row.tab'],
  ['V', 'help.row.v'],
  ['H', 'help.row.h'],
  ['Esc', 'help.row.esc'],
  ['Backspace', 'help.row.backspace'],
];

export class Overlays {
  constructor(bus, save) {
    this.bus = bus;
    this.save = save;
    this.selected = JUMP_TARGETS[0];
    this.active = null;
    this.returnTo = null;

    this.el = {
      loading: $('loading'),
      loadBar: $('loadBar'),
      loadText: $('loadText'),
      mainMenu: $('mainMenu'),
      pauseMenu: $('pauseMenu'),
      starMap: $('starMap'),
      helpPanel: $('helpPanel'),
      journalPanel: $('journalPanel'),
      scanResult: $('scanResult'),
      starmapList: $('starmapList'),
      starmapCanvas: $('starmapCanvas'),
      starmapInfo: $('starmapInfo'),
      helpGrid: $('helpGrid'),
      journalBody: $('journalBody'),
      scanResultKind: $('scanResultKind'),
      scanResultName: $('scanResultName'),
      scanResultSummary: $('scanResultSummary'),
      scanResultStats: $('scanResultStats'),
    };

    this._buildHelp();
    this._buildStarMapList();
    this._wire();

    /* -------------------------------------------------------------- *
     *  Focus management (DESIGN-SPEC §8.5.2 / §11.2)
     *  Overlays are aria-modal dialogs, so the focus must live inside them
     *  while they are open, and must be handed back when they close.
     * -------------------------------------------------------------- */
    this._panels = {
      help: this.el.helpPanel,
      pause: this.el.pauseMenu,
      starmap: this.el.starMap,
      journal: this.el.journalPanel,
      scan: this.el.scanResult,
      menu: this.el.mainMenu,
    };
    this._prevFocus = null;
    this._onKeyDownCapture = this._handleKeyDownCapture.bind(this);
    document.addEventListener('keydown', this._onKeyDownCapture, true);

    onLangChange(() => {
      this._buildHelp();
      this._buildStarMapList();
      if (this.active === 'journal') this.renderJournal();
      if (this.active === 'starmap') this.drawStarMap();
    });
  }

  /* -------------------------------------------------------------- *
   *  Focus helpers
   * -------------------------------------------------------------- */

  _focusables(root) {
    if (!root) return [];
    const sel = 'a[href], button:not([disabled]), input:not([disabled]), '
      + 'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return [...root.querySelectorAll(sel)].filter((el) => el.offsetParent !== null);
  }

  _captureFocus() {
    const el = document.activeElement;
    this._prevFocus = el && el !== document.body ? el : null;
  }

  _restoreFocus() {
    const el = this._prevFocus;
    this._prevFocus = null;
    if (el && document.contains(el) && el.offsetParent !== null && typeof el.focus === 'function') {
      el.focus({ preventScroll: true });
      return;
    }
    const canvas = document.getElementById('scene');
    if (canvas && typeof canvas.focus === 'function') canvas.focus({ preventScroll: true });
  }

  /**
   * Keep Tab inside the open dialog. The browser's own traversal would
   * otherwise walk out of the panel into the page behind it, which breaks
   * aria-modal semantics.
   */
  _handleKeyDownCapture(e) {
    if (e.key !== 'Tab' || !this.active) return;
    const panel = this._panels[this.active];
    if (!panel) return;
    const list = this._focusables(panel);
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement;
    if (!panel.contains(active)) {
      e.preventDefault();
      const target = e.shiftKey ? last : first;
      target.focus({ preventScroll: true });
      return;
    }
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  /* -------------------------------------------------------------- *
   *  Construction
   * -------------------------------------------------------------- */

  _buildHelp() {
    this.el.helpGrid.innerHTML = HELP_ROWS
      .map(([k, d]) => `<div class="help-row"><span class="k">${t(k)}</span><span class="d">${t(d)}</span></div>`)
      .join('');
  }

  _buildStarMapList() {
    this.el.starmapList.innerHTML = JUMP_TARGETS
      .map((t, i) => `
        <button class="starmap-item${i === 0 ? ' active' : ''}" data-target="${t.id}">
          <div class="name">${loc(t, 'name')}</div>
          <div class="meta">${loc(t, 'subtitle')}</div>
        </button>`)
      .join('');

    this.el.starmapList.querySelectorAll('.starmap-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.target;
        this.selected = JUMP_TARGETS.find((x) => x.id === id) || JUMP_TARGETS[0];
        this.el.starmapList.querySelectorAll('.starmap-item').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
        this._updateStarMapInfo();
        this.bus.emit('ui:click');
      });
    });

    this._updateStarMapInfo();
  }

  _updateStarMapInfo() {
    const region = REGIONS.find((r) => r.id === this.selected.region);
    const target = this.selected;
    this.el.starmapInfo.innerHTML = `
      <b>${loc(target, 'name')}</b>
      ${loc(target, 'info')}
      <div style="margin-top:10px;font-family:var(--ds-font-mono);font-size:12.5px;color:var(--ds-ink-faint)">
        ${t('starmap.region')}: ${region ? loc(region, 'name') : '—'}<br>
        ${t('starmap.coords')}: X ${Math.round(target.position.x)} · Y ${Math.round(target.position.y)} · Z ${Math.round(target.position.z)}
      </div>`;
  }

  _wire() {
    const on = (id, fn) => {
      const el = $(id);
      if (el) el.addEventListener('click', () => { this.bus.emit('ui:click'); fn(); });
    };

    on('btnStart', () => this.bus.emit('ui:start'));
    on('btnHelpMenu', () => this.open('help', 'menu'));
    on('btnSettings', () => this.open('pause', 'menu'));
    on('btnJournalMenu', () => { this.renderJournal(); this.open('journal', 'menu'); });

    on('btnResume', () => this.bus.emit('ui:resume'));
    on('btnHelp', () => this.open('help', 'pause'));
    on('btnReset', () => this.bus.emit('ui:reset'));
    on('btnQuit', () => this.bus.emit('ui:quit'));

    on('btnJump', () => {
      const target = this.selected;
      this.close();
      this.bus.emit('ui:jump', target);
    });
    on('btnCloseStarMap', () => this.close());
    on('btnCloseHelp', () => this.close());
    on('btnCloseJournal', () => this.close());
    on('btnCloseScan', () => this.close());
  }

  /* -------------------------------------------------------------- *
   *  Visibility
   * -------------------------------------------------------------- */

  open(name, returnTo = null) {
    if (!this.active) this._captureFocus();
    this._hideAll();
    this.active = name;
    this.returnTo = returnTo;
    // 模态面板打开时收起浮层提示条，避免它压在面板标题与内容上。
    document.body.classList.add('ds-overlay-open');
    const el = this._panels[name];
    if (el) {
      el.classList.remove('hidden');
      // .ds-lightbox 的可见态：data-open 同时负责 opacity/visibility 与面板 transform 复位
      el.setAttribute('data-open', 'true');
      // .ds-in 的入场：16 的组件要求 .is-visible 才显示，先复位再下一帧点亮
      const animated = el.querySelector('.ds-in');
      if (animated) {
        animated.classList.remove('is-visible');
        requestAnimationFrame(() => animated.classList.add('is-visible'));
      }
      const first = this._focusables(el)[0];
      if (first) {
        try {
          first.focus({ preventScroll: true });
        } catch {
          first.focus();
        }
      }
    }
    if (name === 'starmap') this.drawStarMap();
    if (name === 'journal') this.renderJournal();
    this.bus.emit('ui:overlay', { name, open: true });
  }

  close() {
    const was = this.active;
    this._hideAll();
    this.active = null;
    document.body.classList.remove('ds-overlay-open');
    if (was) this.bus.emit('ui:overlay', { name: null, open: false });
    if (this.returnTo) {
      const back = this.returnTo;
      this.returnTo = null;
      this.open(back);
      return;
    }
    this._restoreFocus();
  }

  _hideAll() {
    for (const el of [
      this.el.mainMenu, this.el.pauseMenu, this.el.starMap,
      this.el.helpPanel, this.el.journalPanel, this.el.scanResult,
    ]) {
      el.classList.add('hidden');
      el.removeAttribute('data-open');
      const animated = el.querySelector('.ds-in');
      if (animated) animated.classList.remove('is-visible');
    }
  }

  hideLoading() {
    this.el.loading.classList.add('hidden');
  }

  setLoading(text, pct) {
    this.el.loadText.textContent = text;
    this.el.loadBar.style.width = `${Math.round(pct * 100)}%`;
  }

  /* -------------------------------------------------------------- *
   *  Star chart rendering
   * -------------------------------------------------------------- */

  drawStarMap(shipPosition = null) {
    const canvas = this.el.starmapCanvas;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#08070a';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(233,169,61,0.10)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const p = (i / 8) * W;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(W, p); ctx.stroke();
    }

    // World → canvas mapping (top-down XZ view)
    const pts = [
      STAR.position,
      PLANETS[0].position,
      PLANETS[1].position,
      BELT.center,
      STATION.position,
      DERELICT.position,
      ...JUMP_TARGETS.map((t) => t.position),
    ];
    if (shipPosition) pts.push(shipPosition);
    const box = new THREE.Box3().setFromPoints(pts);
    box.expandByScalar(600);
    const cx = (box.min.x + box.max.x) / 2;
    const cz = (box.min.z + box.max.z) / 2;
    const span = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
    const scale = (Math.min(W, H) - 50) / span;

    const toCanvas = (v) => ({
      x: W / 2 + (v.x - cx) * scale,
      y: H / 2 + (v.z - cz) * scale,
    });

    // Star
    const sp = toCanvas(STAR.position);
    const sg = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 26);
    sg.addColorStop(0, 'rgba(255,232,190,0.95)');
    sg.addColorStop(0.35, 'rgba(255,170,80,0.35)');
    sg.addColorStop(1, 'rgba(255,140,40,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F3E7D2';
    ctx.font = '10px Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t('marker.star'), sp.x, sp.y + 34);

    const drawBody = (pos, r, color, label) => {
      const p = toCanvas(pos);
      const rr = Math.max(3, Math.min(20, r * scale));
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(p.x, p.y, rr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,235,200,0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(243,231,210,0.85)';
      ctx.font = '10px Menlo, monospace';
      ctx.fillText(label, p.x, p.y - rr - 6);
      return p;
    };

    drawBody(PLANETS[0].position, 800, '#9a6236', loc(PLANETS[0], 'name'));
    const np = drawBody(PLANETS[1].position, 520, '#6f9cbc', loc(PLANETS[1], 'name'));

    // Nyx / Frostgap ring ellipse
    ctx.strokeStyle = 'rgba(255,240,215,0.45)';
    ctx.beginPath();
    ctx.ellipse(np.x, np.y, 1180 * scale, 1180 * scale * 0.32, 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Debris gallery annulus
    const bc = toCanvas(BELT.center);
    ctx.strokeStyle = 'rgba(216,180,138,0.45)';
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.ellipse(bc.x, bc.y, BELT.majorRadius * scale, BELT.majorRadius * scale * 0.55, 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Jump targets
    for (const t of JUMP_TARGETS) {
      const p = toCanvas(t.position);
      const active = t.id === this.selected.id;
      ctx.strokeStyle = active ? '#E9A93D' : 'rgba(233,169,61,0.5)';
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 7); ctx.lineTo(p.x + 7, p.y); ctx.lineTo(p.x, p.y + 7); ctx.lineTo(p.x - 7, p.y);
      ctx.closePath();
      ctx.stroke();
      if (active) {
        ctx.fillStyle = 'rgba(233,169,61,0.18)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Ship
    if (shipPosition) {
      const p = toCanvas(shipPosition);
      ctx.fillStyle = '#F3E7D2';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 8); ctx.lineTo(p.x + 5, p.y + 6); ctx.lineTo(p.x, p.y + 3); ctx.lineTo(p.x - 5, p.y + 6);
      ctx.closePath(); ctx.fill();
    }
  }

  /* -------------------------------------------------------------- *
   *  Journal & scan result
   * -------------------------------------------------------------- */

  renderJournal() {
    const discovered = this.save.data.discoveries;
    const kindLabel = (kind) => (getLang() === 'en' ? SCAN_KIND_LABEL_EN[kind] : SCAN_KIND_LABEL[kind]) || kind;
    const entries = SCAN_TARGETS.map((x) => {
      const found = discovered[x.id];
      const when = found ? new Date(found.at).toLocaleString(getLang() === 'en' ? 'en-GB' : 'zh-CN') : t('journal.needScan');
      return `
        <div class="journal-entry${found ? '' : ' locked'}">
          <div class="jt">${found ? loc(x, 'name') : t('journal.unlogged')}</div>
          <div class="jk">${kindLabel(x.kind)} · ${when}</div>
          <div class="jd">${found ? loc(x, 'summary') : t('journal.needScanDesc')}</div>
        </div>`;
    }).join('');
    const stats = `
      <div class="journal-entry">
        <div class="jt">${t('journal.summary')}</div>
        <div class="jk">VOYAGE SUMMARY</div>
        <div class="jd">${t('journal.stat', {
          logged: this.save.discoveryCount,
          total: SCAN_TARGETS.length,
          missions: Object.keys(this.save.data.missions).length,
          jumps: this.save.data.jumps,
          docks: this.save.data.dockedCount,
          distance: (this.save.data.totalDistance / 1000).toFixed(1),
          credits: this.save.data.credits,
        })}</div>
      </div>`;
    this.el.journalBody.innerHTML = stats + entries;
  }

  showScanResult(target, extra = {}) {
    const kindLabel = (getLang() === 'en' ? SCAN_KIND_LABEL_EN[target.kind] : SCAN_KIND_LABEL[target.kind]) || target.kind;
    this.el.scanResultKind.textContent = kindLabel;
    this.el.scanResultName.textContent = loc(target, 'name');
    this.el.scanResultSummary.textContent = loc(target, 'summary') || '';
    const rows = [
      [t('scan.stat.radius'), `${(target.radius / 10).toFixed(1)} km`],
      [t('scan.stat.distance'), extra.distance != null ? `${(extra.distance / 10).toFixed(1)} km` : '—'],
      [t('scan.stat.kind'), kindLabel],
      [t('scan.stat.time'), new Date().toLocaleTimeString(getLang() === 'en' ? 'en-GB' : 'zh-CN')],
    ];
    this.el.scanResultStats.innerHTML = rows
      .map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`)
      .join('');
    this.open('scan');
  }
}
