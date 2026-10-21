import { t } from '../i18n/index.js';

const $ = (id) => document.getElementById(id);

export class HUD {
  constructor() {
    this.root = $('hud');
    this.el = {
      regionName: $('regionName'),
      regionCoords: $('regionCoords'),
      missionTitle: $('missionTitle'),
      missionDesc: $('missionDesc'),
      missionHint: $('missionHint'),
      missionBar: $('missionBar'),
      missionStep: $('missionStep'),
      throttleBar: $('throttleBar'),
      throttleValue: $('throttleValue'),
      fuelBar: $('fuelBar'),
      fuelValue: $('fuelValue'),
      hullBar: $('hullBar'),
      hullValue: $('hullValue'),
      scanBar: $('scanBar'),
      scanValue: $('scanValue'),
      speedValue: $('speedValue'),
      speedBar: $('speedBar'),
      boostValue: $('boostValue'),
      dockDist: $('dockDist'),
      nearest: $('nearest'),
      discoveryCount: $('discoveryCount'),
      headingValue: $('headingValue'),
      camMode: $('camMode'),
      prompt: $('prompt'),
      promptKey: $('promptKey'),
      promptText: $('promptText'),
      scanPanel: $('scanPanel'),
      scanProgress: $('scanProgress'),
      scanTarget: $('scanTarget'),
      warning: $('warning'),
      markers: $('markers'),
      toast: $('toast'),
      vignette: $('vignette'),
      flash: $('flash'),
      pointerHint: $('pointerHint'),
    };
    this._markerMap = new Map();
    this._warningText = '';
  }

  show() { this.root.classList.remove('hidden'); }
  hide() { this.root.classList.add('hidden'); }

  setRegion(name, coords) {
    this.el.regionName.textContent = name;
    this.el.regionCoords.textContent = coords;
  }

  setMission(title, desc, progress, step, total, hint = '') {
    this.el.missionTitle.textContent = title;
    this.el.missionDesc.textContent = desc;
    this.el.missionBar.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    this.el.missionStep.textContent = `${step}/${total}`;
    this.el.missionHint.textContent = hint;
  }

  setFlight({ speedMs, throttle, boosting, fuel, hull, maxSpeed }) {
    this.el.speedValue.textContent = Math.round(speedMs).toLocaleString('en-US');
    this.el.speedBar.style.width = `${Math.min(100, (speedMs / maxSpeed) * 100)}%`;

    this.el.throttleBar.style.width = `${Math.max(0, Math.min(1, throttle)) * 100}%`;
    this.el.throttleValue.textContent = `${Math.round(throttle * 100)}%`;

    this.el.fuelBar.style.width = `${Math.max(0, Math.min(100, fuel))}%`;
    this.el.fuelValue.textContent = `${Math.round(fuel)}`;
    this.el.fuelValue.style.color = fuel < 25 ? 'var(--play-ember)' : '';

    this.el.hullBar.style.width = `${Math.max(0, Math.min(100, hull))}%`;
    this.el.hullValue.textContent = `${Math.round(hull)}`;
    this.el.hullValue.style.color = hull < 35 ? 'var(--play-ember)' : '';

    this.el.boostValue.textContent = boosting ? t('hud.boost.on') : t('hud.boost.idle');
    this.el.boostValue.classList.toggle('on', Boolean(boosting));
  }

  setSystems({ scan, dockDist, nearest, discoveries, total, heading, camMode }) {
    this.el.scanBar.style.width = `${Math.max(0, Math.min(1, scan)) * 100}%`;
    this.el.scanValue.textContent = scan > 0 ? `${Math.round(scan * 100)}%` : '—';
    this.el.dockDist.textContent = dockDist != null ? `${(dockDist / 10).toFixed(1)} km` : '—';
    this.el.nearest.textContent = nearest || '—';
    this.el.discoveryCount.textContent = `${discoveries} / ${total}`;
    this.el.headingValue.textContent = `${String(Math.round(heading)).padStart(3, '0')}°`;
    this.el.camMode.textContent = camMode === 'chase' ? t('hud.cam.chase') : t('hud.cam.cockpit');
  }

  setPrompt(key, text) {
    if (!text) {
      this.el.prompt.classList.add('hidden');
      return;
    }
    this.el.prompt.classList.remove('hidden');
    this.el.promptKey.textContent = key;
    this.el.promptText.textContent = text;
  }

  setScan(active, progress, targetName) {
    if (!active) {
      this.el.scanPanel.classList.add('hidden');
      return;
    }
    this.el.scanPanel.classList.remove('hidden');
    this.el.scanProgress.style.width = `${Math.max(0, Math.min(1, progress)) * 100}%`;
    this.el.scanTarget.textContent = targetName || '—';
  }

  setWarning(text) {
    if (text === this._warningText) return;
    this._warningText = text;
    if (!text) {
      this.el.warning.classList.add('hidden');
    } else {
      this.el.warning.classList.remove('hidden');
      this.el.warning.textContent = text;
    }
  }

  setDanger(level) {
    this.el.vignette.classList.toggle('on', level > 0.02);
    this.el.vignette.style.opacity = String(Math.min(1, level));
  }

  flash(strength = 0.5, duration = 0.3) {
    const el = this.el.flash;
    el.style.transition = 'none';
    el.style.opacity = String(strength);
    requestAnimationFrame(() => {
      el.style.transition = `opacity ${duration}s ease-out`;
      el.style.opacity = '0';
    });
  }

  setPointerHint(show) {
    this.el.pointerHint.classList.toggle('hidden', !show);
  }

  /* ---------------- Target markers ---------------- */

  syncMarkers(list) {
    const seen = new Set();
    for (const m of list) {
      seen.add(m.id);
      let node = this._markerMap.get(m.id);
      if (!node) {
        node = document.createElement('div');
        node.className = 'marker';
        node.innerHTML = '<div class="diamond"></div><div class="label"></div><div class="dist"></div>';
        this.el.markers.appendChild(node);
        this._markerMap.set(m.id, node);
      }
      node.className = `marker ${m.cls || ''}`;
      node.style.left = `${m.x}px`;
      node.style.top = `${m.y}px`;
      node.style.display = m.visible ? '' : 'none';
      const label = node.querySelector('.label');
      const dist = node.querySelector('.dist');
      if (label.textContent !== m.label) label.textContent = m.label;
      const dtxt = m.dist != null ? `${(m.dist / 10).toFixed(1)} km` : '';
      if (dist.textContent !== dtxt) dist.textContent = dtxt;
    }
    for (const [id, node] of this._markerMap) {
      if (!seen.has(id)) {
        node.remove();
        this._markerMap.delete(id);
      }
    }
  }

  /* ---------------- Toasts ---------------- */

  toast(text, kind = '') {
    const item = document.createElement('div');
    item.className = `toast-item ${kind}`;
    item.textContent = text;
    this.el.toast.appendChild(item);
    setTimeout(() => item.remove(), 3600);
  }
}
