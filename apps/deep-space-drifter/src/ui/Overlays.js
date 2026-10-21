import * as THREE from 'three';
import {
  SCAN_TARGETS, SCAN_KIND_LABEL, REGIONS,
  STAR, PLANETS, MOONS, BELT, STATION, DERELICT,
} from '../world/Config.js';

const $ = (id) => document.getElementById(id);

/** Jump destinations available from the star chart. */
export const JUMP_TARGETS = [
  {
    id: 'velan-orbit',
    name: '维岚轨道',
    subtitle: '气态巨行星 · 灯塔站',
    region: 'velan-orbit',
    position: new THREE.Vector3(620, 545, 640),
    info: '维岚与灯塔站所在的轨道带。补给点，也是这段航程的起点。',
  },
  {
    id: 'debris-gallery',
    name: '碎屑回廊',
    subtitle: '岩屑密集区 · 三处异常',
    region: 'debris-gallery',
    position: BELT.center.clone().add(new THREE.Vector3(40, 330, 250)),
    info: '岩屑带的中心环。三处未登记异常体信号都记录在这个区域。',
  },
  {
    id: 'frostgap-system',
    name: '霜隙环系',
    subtitle: '冰巨星 · 环带',
    region: 'frostgap-system',
    position: PLANETS[1].position.clone().add(new THREE.Vector3(120, 160, 1320)),
    info: '冰巨星霜隙与它的冰晶环系，卫星莫恩位于外侧轨道。',
  },
  {
    id: 'irda',
    name: '伊尔达',
    subtitle: 'G2V 主序星',
    region: 'irda',
    position: STAR.position.clone().add(new THREE.Vector3(0, 120, STAR.radius * 3.4)),
    info: '这片空隙里唯一的光源。靠近时辐射水平急升，注意船体温度。',
  },
  {
    id: 'kalso-array',
    name: '卡尔索阵列',
    subtitle: '废弃中继站',
    region: 'debris-gallery',
    position: DERELICT.position.clone().add(new THREE.Vector3(0, 150, 190)),
    info: '一座被遗弃的中继阵列，正好落在碎屑回廊的几何中心。',
  },
];

const HELP_ROWS = [
  ['鼠标移动', '俯仰 / 偏航（锁定指针后直接操控）'],
  ['鼠标拖拽', '未锁定指针时的转向备用方式'],
  ['W / S', '向前 / 向后推进'],
  ['A / D', '向左 / 向右平移'],
  ['Space / Ctrl', '上升 / 下降'],
  ['Q / E', '向左 / 向右滚转'],
  ['方向键', '俯仰 / 偏航（纯键盘操控）'],
  ['Shift', '后燃器推进（消耗燃料）'],
  ['X 或 B', '刹停（反推抵消速度）'],
  ['F', '扫描天体并归档'],
  ['R', '与灯塔站对接 / 脱离'],
  ['M 或 Tab', '打开星图并跃迁'],
  ['V', '座舱 / 追尾视角切换'],
  ['H', '打开本说明'],
  ['Esc', '暂停 / 解除鼠标锁定'],
  ['Backspace', '重置飞船姿态与位置'],
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
  }

  /* -------------------------------------------------------------- *
   *  Construction
   * -------------------------------------------------------------- */

  _buildHelp() {
    this.el.helpGrid.innerHTML = HELP_ROWS
      .map(([k, d]) => `<div class="help-row"><span class="k">${k}</span><span class="d">${d}</span></div>`)
      .join('');
  }

  _buildStarMapList() {
    this.el.starmapList.innerHTML = JUMP_TARGETS
      .map((t, i) => `
        <button class="starmap-item${i === 0 ? ' active' : ''}" data-target="${t.id}">
          <div class="name">${t.name}</div>
          <div class="meta">${t.subtitle}</div>
        </button>`)
      .join('');

    this.el.starmapList.querySelectorAll('.starmap-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.target;
        this.selected = JUMP_TARGETS.find((t) => t.id === id) || JUMP_TARGETS[0];
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
    const t = this.selected;
    const region = REGIONS.find((r) => r.id === t.region);
    this.el.starmapInfo.innerHTML = `
      <b>${t.name}</b>
      ${t.info}
      <div style="margin-top:10px;font-family:var(--mono);font-size:11px;color:var(--gold-dim)">
        所属区域：${region ? region.name : '—'}<br>
        坐标：X ${Math.round(t.position.x)} · Y ${Math.round(t.position.y)} · Z ${Math.round(t.position.z)}
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
    this._hideAll();
    this.active = name;
    this.returnTo = returnTo;
    const map = {
      help: this.el.helpPanel,
      pause: this.el.pauseMenu,
      starmap: this.el.starMap,
      journal: this.el.journalPanel,
      scan: this.el.scanResult,
      menu: this.el.mainMenu,
    };
    const el = map[name];
    if (el) el.classList.remove('hidden');
    if (name === 'starmap') this.drawStarMap();
    if (name === 'journal') this.renderJournal();
    this.bus.emit('ui:overlay', { name, open: true });
  }

  close() {
    const was = this.active;
    this._hideAll();
    this.active = null;
    if (was) this.bus.emit('ui:overlay', { name: null, open: false });
    if (this.returnTo) {
      const back = this.returnTo;
      this.returnTo = null;
      this.open(back);
    }
  }

  _hideAll() {
    for (const el of [
      this.el.mainMenu, this.el.pauseMenu, this.el.starMap,
      this.el.helpPanel, this.el.journalPanel, this.el.scanResult,
    ]) {
      el.classList.add('hidden');
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
    ctx.fillText('伊尔达', sp.x, sp.y + 34);

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

    drawBody(PLANETS[0].position, 800, '#9a6236', '维岚');
    const np = drawBody(PLANETS[1].position, 520, '#6f9cbc', '霜隙');

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
    const entries = SCAN_TARGETS.map((t) => {
      const found = discovered[t.id];
      return `
        <div class="journal-entry${found ? '' : ' locked'}">
          <div class="jt">${found ? t.name : '未登记目标'}</div>
          <div class="jk">${SCAN_KIND_LABEL[t.kind] || t.kind} · ${found ? new Date(found.at).toLocaleString('zh-CN') : '需要扫描'}</div>
          <div class="jd">${found ? t.summary : '靠近并使用扫描仪（F）以取得该目标的详细数据。'}</div>
        </div>`;
    }).join('');
    const stats = `
      <div class="journal-entry">
        <div class="jt">航程小结</div>
        <div class="jk">VOYAGE SUMMARY</div>
        <div class="jd">
          已登记 ${this.save.discoveryCount} / ${SCAN_TARGETS.length} 个目标 ·
          完成 ${Object.keys(this.save.data.missions).length} 项任务 ·
          跃迁 ${this.save.data.jumps} 次 · 对接 ${this.save.data.dockedCount} 次 ·
          累计航行 ${(this.save.data.totalDistance / 1000).toFixed(1)} km · 信用点 ${this.save.data.credits}
        </div>
      </div>`;
    this.el.journalBody.innerHTML = stats + entries;
  }

  showScanResult(target, extra = {}) {
    this.el.scanResultKind.textContent = SCAN_KIND_LABEL[target.kind] || target.kind;
    this.el.scanResultName.textContent = target.name;
    this.el.scanResultSummary.textContent = target.summary || '';
    const rows = [
      ['半径', `${(target.radius / 10).toFixed(1)} km`],
      ['距船', extra.distance != null ? `${(extra.distance / 10).toFixed(1)} km` : '—'],
      ['类型', SCAN_KIND_LABEL[target.kind] || target.kind],
      ['扫描时间', new Date().toLocaleTimeString('zh-CN')],
    ];
    this.el.scanResultStats.innerHTML = rows
      .map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`)
      .join('');
    this.open('scan');
  }
}
