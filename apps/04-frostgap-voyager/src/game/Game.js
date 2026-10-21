import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { Settings, QUALITY_PRESETS } from '../core/Settings.js';
import { SaveGame } from '../core/SaveGame.js';
import { EventBus } from '../core/Events.js';
import { Input } from '../input/Input.js';
import { AudioEngine } from '../audio/AudioEngine.js';
import { Universe } from '../world/Universe.js';
import { FlightModel } from '../ship/FlightModel.js';
import { buildCockpit, buildExteriorShip } from '../ship/Cockpit.js';
import { HUD } from '../ui/HUD.js';
import { Overlays } from '../ui/Overlays.js';
import { MFD } from '../ui/MFD.js';
import { Gauge } from '../ui/Gauge.js';
import { MissionTracker } from './Missions.js';
import { yieldToBrowser } from '../core/Util.js';
import { createWarpOverlay } from '../gfx/Shaders.js';
import {
  METERS_PER_UNIT, SHIP, SCAN_TARGETS, SCAN_KIND_LABEL, REGIONS,
  STAR, PLANETS, MOONS, ANOMALIES, BELT, STATION, DERELICT, SPAWN,
} from '../world/Config.js';
import { t, loc, getLang } from '../i18n/index.js';

const FIXED_DT = 1 / 120;

/** Short latin tags used by the radar repeaters. */
const RADAR_TAGS = {
  irda: 'IRDA',
  velan: 'VELN',
  frostgap: 'FRST',
  korai: 'KORA',
  morn: 'MORN',
  beacon: 'BEAC',
  'kalso-array': 'KALS',
};
const MAX_STEPS = 8;

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _q1 = new THREE.Quaternion();

export class Game {
  constructor() {
    this.canvas = document.getElementById('scene');
    this.settings = new Settings();
    this.save = new SaveGame();
    this.bus = new EventBus();
    this.audio = new AudioEngine();
    this.input = new Input(document.body);
    this.hud = new HUD();
    this.overlays = new Overlays(this.bus, this.save);

    this.state = 'loading';        // loading | menu | playing | paused
    this.quality = this.settings.quality;
    /**
     * Timestamp of a pause that was opened by the pointer lock being lost.
     * Chrome reserves Esc while the pointer is locked, so one Esc gesture can
     * arrive twice (lock loss + keydown). This marker keeps the gesture
     * idempotent — see _togglePause().
     */
    this._lockLossPauseAt = 0;

    this.ship = new FlightModel(this.settings);
    this.missions = new MissionTracker(this.save, this.bus);

    this.accumulator = 0;
    this.lastTime = performance.now();
    this.elapsed = 0;

    this.scan = { active: false, target: null, progress: 0, duration: 2.6, pingTimer: 0 };
    this.warp = null;
    this.docked = true;
    this.dockAnim = 0;
    this.shake = 0;
    this.warning = '';
    this.proximityTimer = 0;
    this.scanCandidate = null;
    this.nearestName = '—';
    this.nearestDistance = Infinity;
    this.hazard = 0;
    this.cameraMode = this.settings.get('cameraMode');
    this.chasePosition = new THREE.Vector3();
    this.chaseLook = new THREE.Vector3();
    this.camOffset = new THREE.Vector3();
    this.discoveredAnomaly = false;

    this._bindEvents();
  }

  /* ================================================================ *
   *  Boot
   * ================================================================ */

  async init() {
    this._initRenderer();
    this._initScene();
    await this._buildWorld();
    this._initPost();

    this.overlays.hideLoading();
    this.overlays.open('menu');
    this.state = 'menu';
    this._syncShellChrome();

    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    window.addEventListener('resize', () => this._onResize());
    this._onResize();
  }

  _initRenderer() {
    const params = new URLSearchParams(window.location.search);
    const forcedQuality = params.get('quality');
    if (forcedQuality && QUALITY_PRESETS[forcedQuality]) {
      this.settings.set('quality', forcedQuality);
      this.quality = this.settings.quality;
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: this.quality.pixelRatio <= 1.25,
      powerPreference: 'high-performance',
      stencil: false,
    });

    // Detect software rasterisers (SwiftShader / llvmpipe). Those cannot
    // sustain full-screen shader work, so we drop to the leanest tier.
    // `?gpu=force` keeps the requested tier (useful for capture on a real GPU).
    this.forceGpu = params.get('gpu') === 'force';
    this.renderTier = 'gpu';
    this.gpuName = 'unknown';
    try {
      const gl = this.renderer.getContext();
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      this.gpuName = dbg
        ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
        : String(gl.getParameter(gl.RENDERER));
      if (/swiftshader|llvmpipe|software|mesa offscreen/i.test(this.gpuName)) {
        this.renderTier = 'software';
      }
    } catch (err) {
      console.warn('[Game] renderer probe failed', err);
    }

    if (this.renderTier === 'software' && !this.forceGpu) {
      console.warn(`[Game] software rasteriser detected (${this.gpuName}) — forcing low quality`);
      this.settings.set('quality', 'low');
      this.quality = this.settings.quality;
      this.renderer.setPixelRatio(0.75);
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality.pixelRatio));
    }

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.94;
    this.renderer.setClearColor(0x02050a, 1);
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.settings.get('fov'),
      window.innerWidth / window.innerHeight,
      0.06,
      90000
    );
    this.scene.add(this.camera);

    this.universe = new Universe(this.scene, this.quality);
    this.warpOverlay = createWarpOverlay();
    this.warpIntensity = 0;
  }

  async _buildWorld() {
    // Paint the loading screen first, then build the system in one task so
    // that a throttled background tab cannot stretch the load indefinitely.
    this.overlays.setLoading(t('load.generating'), 0.02);
    await yieldToBrowser();

    const t0 = performance.now();
    await this.universe.build((label, pct) => this.overlays.setLoading(label, pct));
    console.info(`[Game] world built in ${(performance.now() - t0).toFixed(0)}ms`);

    // MFD texture
    this.mfd = new MFD(512, 384);
    this.mfdTexture = new THREE.CanvasTexture(this.mfd.canvas);
    this.mfdTexture.colorSpace = THREE.SRGBColorSpace;
    this.mfdTexture.minFilter = THREE.LinearFilter;

    // Round CRT repeater
    this.gauge = new Gauge(256);
    this.gaugeTexture = new THREE.CanvasTexture(this.gauge.canvas);
    this.gaugeTexture.colorSpace = THREE.SRGBColorSpace;
    this.gaugeTexture.minFilter = THREE.LinearFilter;

    // Cockpit (child of the camera so it stays glued to the pilot's head)
    this.cockpit = buildCockpit({
      mfdTexture: this.mfdTexture,
      gaugeTexture: this.gaugeTexture,
      quality: this.quality,
    });
    this.camera.add(this.cockpit.group);

    // Exterior ship
    this.exterior = buildExteriorShip({ quality: this.quality });
    this.scene.add(this.exterior.group);
    this.exterior.group.visible = false;

    // Place the ship at the dock and face it outward.
    this._attachToDock();
    this._updateCamera(0);
  }

  _initPost() {
    const size = new THREE.Vector2(window.innerWidth, window.innerHeight);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(size, 0.42, 0.55, 0.85);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    const pr = this.renderTier === 'software'
      ? 0.75
      : Math.min(window.devicePixelRatio, this.quality.pixelRatio);
    this.composer.setPixelRatio(pr);
    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.useComposer = this.quality.bloom && this.renderTier !== 'software';
  }

  /* ================================================================ *
   *  Events
   * ================================================================ */

  _bindEvents() {
    this.bus.on('ui:start', () => this.startGame());
    this.bus.on('ui:resume', () => this.resume());
    this.bus.on('ui:reset', () => this.resetShip());
    this.bus.on('ui:quit', () => this.toMenu());
    this.bus.on('ui:jump', (target) => this.startWarp(target));
    this.bus.on('ui:click', () => this.audio.uiClick());

    this.bus.on('ui:overlay', ({ open }) => {
      if (open) {
        this.input.releaseLock();
      } else if (this.state === 'playing') {
        this.input.requestLock();
      }
    });

    this.input.onKeyAction = (code) => this._onKeyAction(code);

    // While flying, Tab moves the focus onto the cockpit view and keeps it
    // there. Every overlay is closed at that point, so the browser would send
    // the focus to its own chrome — and dropping the pointer lock as a side
    // effect would cost the pilot their mouse steering. In the menus the
    // browser keeps full control and Tab walks the buttons normally.
    this.input.captureTab = () => this.state === 'playing' && !this.overlays.active;

    // Chrome consumes Esc as a reserved gesture while the pointer is locked,
    // so the keydown never reaches the game. Reacting to the lock loss is
    // what makes "Esc -> pause" reliable in every browser.
    this.input.onPointerLockLost = () => {
      if (this.state !== 'playing' || this.overlays.active) return;
      // A Tab press moves the focus ring; when the focus leaves the page the
      // browser drops the pointer lock as a side effect. That is keyboard
      // navigation, not "the pilot wants the menu" — do not pause for it.
      if (this.input.tabPressedRecently()) return;
      // Chrome reserves Esc while the pointer is locked: it releases the lock
      // and may still deliver the keydown. If the keydown did arrive, the
      // key handler owns the pause — pausing here as well would make the
      // single Esc gesture toggle the menu open and straight back closed.
      if (performance.now() - this.input.lastEscapeAt() < 400) return;
      this._lockLossPauseAt = performance.now();
      this.pause();
    };

    // Pause when the tab or window loses focus mid-flight.
    this._onVisibility = () => {
      if (document.hidden && this.state === 'playing' && !this.overlays.active) {
        this.pause();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibility);

    // Clicking the viewport re-acquires pointer lock when it was released.
    this.canvas.addEventListener('click', () => {
      if (this.state === 'playing' && !this.overlays.active && !this.input.pointerLocked) {
        this.input.requestLock();
      }
    });
  }

  _onKeyAction(code) {
    if (this.state === 'menu') {
      // In the menu the game itself is not running, but panels opened from the
      // menu (settings / help / journal) are still overlays — Esc has to close
      // them, otherwise a keyboard user is stuck inside the panel.
      const panelOpen = this.overlays.active && this.overlays.active !== 'menu';
      if (code === 'Escape') {
        if (panelOpen) this.resume();
        return;
      }
      if ((code === 'Enter' || code === 'Space') && !panelOpen) this.startGame();
      return;
    }

    switch (code) {
      case 'Escape':
        this._togglePause();
        break;
      case 'KeyM':
        // NOTE: 'Tab' is deliberately NOT bound to the star map. Tab belongs to
        // the browser: it has to walk the focus ring (keyboard accessibility),
        // and hijacking it for a game action breaks that. The star map is on
        // 'M' alone.
        if (this.state === 'playing') this.overlays.open('starmap');
        break;
      case 'KeyH':
        if (this.state === 'playing') this.overlays.open('help');
        break;
      case 'KeyV':
        if (this.state === 'playing') this._toggleCameraMode();
        break;
      case 'KeyF':
        if (this.state === 'playing') this._tryScan();
        break;
      case 'KeyR':
        if (this.state === 'playing') this._tryDock();
        break;
      case 'Backspace':
        if (this.state === 'playing') this.resetShip();
        break;
      default:
        break;
    }
  }

  /* ================================================================ *
   *  State transitions
   * ================================================================ */

  startGame() {
    // Pointer lock has to be requested synchronously inside the click gesture.
    this.input.requestLock();
    this._blurFocus();

    this.audio.init().then(() => {
      this.audio.setVolume(this.settings.get('masterVolume'));
      this.audio.setMuted(this.settings.get('muted'));
    });

    this.state = 'playing';
    this.overlays.close();
    this._syncShellChrome();
    this.hud.show();
    this._showTutorialHints();
    this.hud.toast(t('toast.lockHint'), 'good');
  }

  _showTutorialHints() {
    if (this.save.data.tutorialSeen) return;
    this.save.data.tutorialSeen = true;
    this.save.save();
    const hints = [
      t('tutorial.0'), t('tutorial.1'), t('tutorial.2'),
      t('tutorial.3'), t('tutorial.4'), t('tutorial.5'),
    ];
    hints.forEach((h, i) => setTimeout(() => this.hud.toast(h), 400 + i * 700));
  }

  _togglePause() {
    if (this.overlays.active) {
      // One Esc gesture, one state change. When Chrome released the pointer
      // lock first, the pause menu was already opened from that lock loss;
      // the Esc keydown that follows belongs to the same gesture and must
      // not close the menu again.
      if (this._lockLossPauseAt && performance.now() - this._lockLossPauseAt < 600) {
        this._lockLossPauseAt = 0;
        return;
      }
      const was = this.overlays.active;
      this.overlays.close();
      if (was === 'pause' || was === 'menu') this.resume();
      else if (this.state === 'playing') this.state = 'playing';
      return;
    }
    this.pause();
  }

  /**
   * 外壳页头 / 页脚只在「主菜单态」出现（MIGRATION-NOTES §3 .ds-topbar / .ds-footer）。
   * 飞行中舱内 HUD 已占满四角，页头页脚会与之争位 —— 用状态类在结构层避开，
   * 而不是用 z-index 相互掩盖。
   */
  _syncShellChrome() {
    document.body.classList.toggle('ds-menu-shell', this.state === 'menu');
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this._syncShellChrome();
    this.input.releaseLock();
    this._blurFocus();
    this._syncSettingsUI();
    this.overlays.open('pause');
    this.audio.setEngineLoad(0, 0);
    this.audio.setThruster(0);
  }

  resume() {
    if (this.state === 'menu') {
      this.overlays.open('menu');
      return;
    }
    this.state = 'playing';
    this._syncShellChrome();
    // Order matters: drop the focus from the overlay control first, then
    // close the overlay — closing hands the focus back (to the cockpit view
    // while flying), and blurring afterwards would wipe that again.
    this._blurFocus();
    this.overlays.close();
    this.input.requestLock();
    this.audio.resume();
  }

  /** Drop focus from whatever overlay control was last clicked. */
  _blurFocus() {
    const el = document.activeElement;
    if (el && el !== document.body && typeof el.blur === 'function') {
      el.blur();
    }
  }

  toMenu() {
    this.overlays.close();
    this.hud.hide();
    this.state = 'menu';
    this._syncShellChrome();
    this.input.releaseLock();
    this.overlays.open('menu');
    this.audio.setEngineLoad(0, 0);
  }

  resetShip() {
    this.ship.reset();
    this.docked = true;
    this._attachToDock();
    this.scan.active = false;
    this.scan.progress = 0;
    this.warp = null;
    this.warning = '';
    this.hud.toast(t('toast.reset'), 'warn');
    this.audio.uiClick();
    // Hand the cockpit back to the pilot even if the reset was triggered
    // from the pause menu.
    if (this.overlays.active) {
      this.overlays.close();
      if (this.state === 'paused') {
        this.state = 'playing';
        this._blurFocus();
        this.input.requestLock();
      }
    }
  }

  _toggleCameraMode() {
    this.cameraMode = this.cameraMode === 'cockpit' ? 'chase' : 'cockpit';
    this.settings.set('cameraMode', this.cameraMode);
    this.cockpit.group.visible = this.cameraMode === 'cockpit';
    this.exterior.group.visible = this.cameraMode === 'chase';
    this.hud.toast(this.cameraMode === 'cockpit' ? t('toast.camCockpit') : t('toast.camChase'), 'good');
  }

  /* ================================================================ *
   *  Docking
   * ================================================================ */

  _attachToDock() {
    const port = this.universe.station.portPosition;
    this.ship.position.copy(port).add(new THREE.Vector3(0, 5.5, 0));
    this.ship.velocity.set(0, 0, 0);
    // Face outward from the station with the planet limb in view.
    const fwd = new THREE.Vector3(0.52, -0.2, -0.83).normalize();
    this.ship.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), fwd);
    this.ship._syncBasis();
    this.docked = true;
    this.save.data.docked = true;
  }

  _dockDistance() {
    return this.ship.position.distanceTo(this.universe.station.portPosition);
  }

  _tryDock() {
    if (this.docked) {
      // Undock
      this.docked = false;
      this.save.data.docked = false;
      this.ship.position.copy(this.universe.station.portPosition).add(new THREE.Vector3(0, 16, 0));
      this.ship.velocity.set(0, 0, 0);
      this.hud.toast(t('toast.undock'), 'good');
      this.audio.uiClick();
      return;
    }

    const dist = this._dockDistance();
    const speed = this.ship.speed;
    if (dist > STATION.dockRadius * 3.4) {
      this.hud.toast(t('toast.dockTooFar'), 'bad');
      this.audio.alert();
      return;
    }
    if (speed > 3.2) {
      this.hud.toast(t('toast.dockTooFast', { speed: Math.round(speed * METERS_PER_UNIT) }), 'warn');
      this.audio.alert();
      return;
    }
    this.docked = true;
    this.save.data.docked = true;
    this.save.data.dockedCount += 1;
    this.ship.position.copy(this.universe.station.portPosition).add(new THREE.Vector3(0, 5.5, 0));
    this.ship.velocity.set(0, 0, 0);
    this.ship.fuel = SHIP.fuelCapacity;
    this.ship.hull = Math.min(SHIP.hullMax, this.ship.hull + 18);
    this.dockAnim = 1;
    this.hud.toast(t('toast.dockDone'), 'good');
    this.audio.dockSuccess();
    this.save.save();
  }

  /* ================================================================ *
   *  Scanning
   * ================================================================ */

  _findScanCandidate() {
    let best = null;
    let bestScore = -Infinity;
    const fwd = this.ship.forward;

    for (const target of SCAN_TARGETS) {
      if (target.id === 'aurelion' && this.docked) continue;
      _v1.copy(target.position).sub(this.ship.position);
      const dist = _v1.length();
      if (dist > target.scanRange) continue;
      const dot = _v1.normalize().dot(fwd);
      if (dot < 0.72) continue;                    // must be roughly ahead
      const score = dot * 2.2 - dist / (target.scanRange * 4);
      if (score > bestScore) {
        bestScore = score;
        best = { ...target, distance: dist };
      }
    }
    return best;
  }

  _tryScan() {
    if (this.scan.active) return;
    const candidate = this.scanCandidate;
    if (!candidate) {
      this.hud.toast(t('toast.noScanTarget'), 'warn');
      this.audio.alert();
      return;
    }
    this.scan.active = true;
    this.scan.target = candidate;
    this.scan.progress = 0;
    this.scan.pingTimer = 0;
    this.hud.toast(t('toast.scanStart', { name: loc(candidate, 'name') }), 'good');
  }

  _updateScan(dt) {
    if (!this.scan.active) return;
    const target = this.scan.target;
    // Keep the target valid while the scan runs.
    const dist = this.ship.position.distanceTo(target.position);
    if (dist > target.scanRange * 1.25) {
      this.scan.active = false;
      this.hud.toast(t('toast.scanLost'), 'bad');
      return;
    }
    this.scan.progress += dt / this.scan.duration;
    this.scan.pingTimer -= dt;
    if (this.scan.pingTimer <= 0) {
      this.scan.pingTimer = 0.45;
      this.audio.scanPing(Math.floor(this.scan.progress * 5));
    }
    if (this.scan.progress >= 1) {
      this.scan.active = false;
      this.scan.progress = 0;
      this._completeScan(target);
    }
  }

  _completeScan(target) {
    const isNew = this.save.discover(target.id, target.name, target.kind);
    this.audio.scanComplete();
    if (isNew) {
      this.hud.toast(t('toast.newRecord', { name: loc(target, 'name') }), 'good');
      if (target.kind === 'anomaly') this.discoveredAnomaly = true;
    } else {
      this.hud.toast(t('toast.archived', { name: loc(target, 'name') }), 'good');
    }
    this.overlays.showScanResult(target, { distance: this.ship.position.distanceTo(target.position) });
  }

  /* ================================================================ *
   *  Warp
   * ================================================================ */

  startWarp(target) {
    if (this.warp) return;
    this.warp = {
      target,
      from: this.ship.position.clone(),
      to: target.position.clone(),
      control: new THREE.Vector3(),
      t: 0,
      charge: 0.95,
      travel: 1.5,
      jumped: false,
    };
    // Bow the flight path so the jump reads as a real transit.
    const mid = this.warp.from.clone().add(this.warp.to).multiplyScalar(0.5);
    const dir = _v1.copy(this.warp.to).sub(this.warp.from).normalize();
    const perp = _v2.crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
    if (perp.lengthSq() < 0.001) perp.set(1, 0, 0);
    mid.addScaledVector(perp, this.warp.from.distanceTo(this.warp.to) * 0.16);
    this.warp.control.copy(mid);

    this.ship.velocity.set(0, 0, 0);
    this.audio.warpCharge(this.warp.charge + this.warp.travel);
    this.hud.toast(t('toast.routeLocked', { name: loc(target, 'name') }), 'good');
  }

  _updateWarp(dt) {
    const w = this.warp;
    if (!w) return;
    w.t += dt;

    const total = w.charge + w.travel;
    if (w.t < w.charge) {
      const k = w.t / w.charge;
      this.warpIntensity = Math.pow(k, 1.6) * 0.85;
      this.ship.position.copy(w.from);
    } else {
      if (!w.jumped) {
        w.jumped = true;
        this.audio.warpJump();
        this.hud.flash(0.35, 0.5);
      }
      const u = Math.min(1, (w.t - w.charge) / w.travel);
      const e = u * u * (3 - 2 * u);
      // Quadratic Bézier
      const a = _v1.copy(w.from).multiplyScalar((1 - e) * (1 - e));
      const b = _v2.copy(w.control).multiplyScalar(2 * (1 - e) * e);
      const c = _v3.copy(w.to).multiplyScalar(e * e);
      this.ship.position.copy(a).add(b).add(c);
      this.warpIntensity = 0.85 + Math.sin(u * Math.PI) * 0.9;
      // Face the travel direction while jumping.
      const dir = _v1.copy(w.to).sub(w.from).normalize();
      const look = _v2.copy(this.ship.position).addScaledVector(dir, 40);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), dir);
      this.ship.quaternion.slerp(q, Math.min(1, dt * 3));
      this.ship._syncBasis();
    }

    if (w.t >= total) {
      this.ship.position.copy(w.to);
      this.ship.velocity.set(0, 0, 0);
      this.warp = null;
      this.warpIntensity = 0;
      this.save.data.jumps += 1;
      this.save.save();
      this.hud.toast(t('toast.warpDone', { name: loc(w.target, 'name') }), 'good');
    }
  }

  /* ================================================================ *
   *  Collisions & proximity
   * ================================================================ */

  _resolveCollisions(dt) {
    const p = this.ship.position;
    let burning = false;
    let hazard = 0;
    let warning = '';

    // --- Planets & moons ---
    const bodies = [
      ...PLANETS.map((d) => ({ def: d, atmo: d.atmosphere || 1.02 })),
      ...MOONS.map((d) => ({ def: d, atmo: 1.0 })),
    ];
    for (const { def, atmo } of bodies) {
      const r = def.radius;
      _v1.copy(p).sub(def.position);
      const dist = _v1.length();
      const atmoR = r * atmo;

      if (dist < atmoR && atmo > 1.0) {
        burning = true;
        const depth = 1 - (dist - r) / (atmoR - r);
        hazard = Math.max(hazard, 0.25 + depth * 0.75);
        if (depth > 0.35) warning = t('warn.atmosphere', { name: loc(def, 'name') });
      }
      if (dist < r + 1.5) {
        const normal = _v1.normalize();
        this.ship.applyCollision(normal, r + 1.5 - dist, 22, 0.15);
        this.shake = Math.min(1, this.shake + 0.9);
        this.audio.impact(1);
        warning = t('warn.impact', { name: loc(def, 'name') });
        this.hud.flash(0.25, 0.35);
      }
      // Proximity warning
      if (dist < r * 1.14 && dist > r + 1.5) {
        warning = t('warn.approach', { name: loc(def, 'name') });
        hazard = Math.max(hazard, 0.3);
        this.proximityTimer -= dt;
        if (this.proximityTimer <= 0) {
          this.proximityTimer = 0.9;
          this.audio.proximity();
        }
      }
    }

    // --- Station ---
    const st = this.universe.station;
    _v1.copy(p).sub(STATION.position);
    const stDist = _v1.length();
    if (stDist < 14) {
      const normal = _v1.normalize();
      this.ship.applyCollision(normal, 14 - stDist, 16, 0.2);
      this.shake = Math.min(1, this.shake + 0.8);
      this.audio.impact(0.9);
      warning = t('warn.stationStructure');
    }
    // Habitat ring (thin torus approximation)
    const localX = p.x - STATION.position.x;
    const localY = p.y - STATION.position.y;
    const localZ = p.z - STATION.position.z;
    const ringR = Math.sqrt(localX * localX + localZ * localZ);
    if (Math.abs(ringR - STATION.ringRadius) < 4.5 && Math.abs(localY) < 4.5) {
      _v1.set(localX, 0, localZ).normalize();
      this.ship.applyCollision(_v1, 4.5 - Math.abs(ringR - STATION.ringRadius), 10, 0.25);
      this.shake = Math.min(1, this.shake + 0.6);
      this.audio.impact(0.7);
      warning = t('warn.stationRing');
    }

    // --- Derelict ---
    _v1.copy(p).sub(DERELICT.position);
    if (_v1.length() < DERELICT.radius * 0.9) {
      const normal = _v1.normalize();
      this.ship.applyCollision(normal, DERELICT.radius * 0.9 - _v1.length(), 12, 0.25);
      this.shake = Math.min(1, this.shake + 0.7);
      this.audio.impact(0.8);
      warning = t('warn.kalsoArray');
    }

    // --- Anomalies ---
    for (const a of Object.values(this.universe.anomalies || {})) {
      _v1.copy(p).sub(a.def.position);
      const d = _v1.length();
      if (d < a.colliderRadius + 1.5) {
        const normal = _v1.normalize();
        this.ship.applyCollision(normal, a.colliderRadius + 1.5 - d, 9, 0.3);
        this.shake = Math.min(1, this.shake + 0.5);
        this.audio.impact(0.6);
        warning = t('warn.unknownStructure');
      }
    }

    // --- Asteroids ---
    if (p.distanceTo(BELT.center) < BELT.majorRadius + BELT.tubeRadius + 60) {
      const instances = this.universe.asteroidInstances;
      for (let i = 0; i < instances.length; i++) {
        const a = instances[i];
        const dx = p.x - a.position.x;
        if (dx > 40 || dx < -40) continue;
        const dy = p.y - a.position.y;
        if (dy > 40 || dy < -40) continue;
        const dz = p.z - a.position.z;
        if (dz > 40 || dz < -40) continue;
        const rr = a.radius + 1.6;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < rr * rr) {
          const d = Math.sqrt(d2) || 0.0001;
          const normal = _v1.set(dx / d, dy / d, dz / d);
          this.ship.applyCollision(normal, rr - d, 8, 0.3);
          this.shake = Math.min(1, this.shake + 0.45);
          this.audio.impact(0.5);
          warning = t('warn.asteroid');
          break;
        }
      }
    }

    this.ship.burning = burning;
    this.hazard = hazard;
    this.warning = warning;
  }

  _checkDestruction() {
    if (this.ship.hull > 0) return;
    this.ship.hull = 45;
    this.ship.fuel = Math.max(this.ship.fuel, 30);
    this.save.addCredits(-150);
    this.docked = true;
    this._attachToDock();
    this.hud.flash(0.7, 0.9);
    this.hud.toast(t('toast.hullLost'), 'bad');
    this.audio.impact(1.4);
  }

  /* ================================================================ *
   *  Fixed-step simulation
   * ================================================================ */

  _gatherCommands() {
    const i = this.input;
    return {
      forward: i.isDown('KeyW'),
      back: i.isDown('KeyS'),
      left: i.isDown('KeyA'),
      right: i.isDown('KeyD'),
      up: i.isDown('Space'),
      down: i.isDown('ControlLeft') || i.isDown('ControlRight') || i.isDown('KeyC'),
      rollLeft: i.isDown('KeyQ'),
      rollRight: i.isDown('KeyE'),
      boost: i.isDown('ShiftLeft') || i.isDown('ShiftRight'),
      brake: i.isDown('KeyX') || i.isDown('KeyB'),
      keyPitchUp: i.isDown('ArrowUp'),
      keyPitchDown: i.isDown('ArrowDown'),
      keyYawLeft: i.isDown('ArrowLeft'),
      keyYawRight: i.isDown('ArrowRight'),
    };
  }

  _fixedStep(dt) {
    const cmd = this._gatherCommands();

    if (this.warp) {
      this._updateWarp(dt);
    } else if (this.docked) {
      // Docked: no thrust, ship stays pinned to the collar.
      this.ship.velocity.multiplyScalar(Math.exp(-6 * dt));
      this.ship.position.copy(this.universe.station.portPosition).add(new THREE.Vector3(0, 5.5, 0));
    } else {
      this.ship.step(dt, cmd);
      this._resolveCollisions(dt);
    }

    this._updateScan(dt);

    // Distances & nearest object
    this.distToStation = this.ship.position.distanceTo(STATION.position);
    this.distToPort = this._dockDistance();
    this._updateNearest();

    // Missions
    if (!this.warp) {
      this.missions.evaluate({
        ship: this.ship,
        save: this.save,
        distToStation: this.distToStation,
        distToPort: this.distToPort,
        speedMs: this.ship.speed * METERS_PER_UNIT,
        scanProgress: this.scan.active ? this.scan.progress : 0,
        anomalyDiscovered: this.discoveredAnomaly ||
          Object.keys(this.save.data.discoveries).some((k) => k.startsWith('anomaly')),
        docked: this.docked && this.save.data.dockedCount > 0,
        jumps: this.save.data.jumps,
      });
    }

    this.save.data.totalDistance += this.ship.speed * dt * METERS_PER_UNIT;
  }

  _updateNearest() {
    let best = '—';
    let bestDist = Infinity;
    for (const t of SCAN_TARGETS) {
      const d = this.ship.position.distanceTo(t.position);
      if (d < bestDist) {
        bestDist = d;
        best = loc(t, 'name');
      }
    }
    this.nearestName = best;
    this.nearestDistance = bestDist;
  }

  /* ================================================================ *
   *  Camera
   * ================================================================ */

  _updateCamera(dt) {
    const ship = this.ship;
    const targetFov = this.settings.get('fov') + this.warpIntensity * 14;
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, dt * 4);
    this.camera.updateProjectionMatrix();

    if (this.cameraMode === 'cockpit') {
      this.camOffset.copy(SHIP.eyeOffset);
      // Subtle head movement driven by angular rates
      const sway = _v1.copy(ship.angularVelocity).multiplyScalar(0.012);
      this.camOffset.x += sway.y;
      this.camOffset.y += sway.x * 0.6;

      this.camera.position.copy(this.camOffset).applyQuaternion(ship.quaternion).add(ship.position);
      this.camera.quaternion.copy(ship.quaternion);
    } else {
      const back = _v1.copy(ship.forward).multiplyScalar(-17);
      const up = _v2.copy(ship.up).multiplyScalar(5.2);
      const desired = _v3.copy(ship.position).add(back).add(up);
      const k = 1 - Math.exp(-8 * dt);
      this.chasePosition.lerp(desired, k);
      this.camera.position.copy(this.chasePosition);
      this.camera.quaternion.copy(ship.quaternion);
      // Look slightly ahead of the ship so it sits low in frame.
      const look = _v1.copy(ship.position).addScaledVector(ship.forward, 6);
      this.chaseLook.lerp(look, k);
      this.camera.lookAt(this.chaseLook);
    }

    // Impact shake
    if (this.shake > 0.001) {
      const s = this.shake * 0.06;
      this.camera.position.x += (Math.random() - 0.5) * s;
      this.camera.position.y += (Math.random() - 0.5) * s;
      this.camera.position.z += (Math.random() - 0.5) * s;
      this.shake *= Math.exp(-4 * dt);
    }
  }

  /* ================================================================ *
   *  Frame
   * ================================================================ */

  loop(now) {
    requestAnimationFrame(this.loop);
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (!isFinite(dt) || dt < 0) dt = 0;
    dt = Math.min(dt, 0.25);

    if (this.state === 'playing' && !this.overlays.active) {
      this.elapsed += dt;
      const mouse = this.input.consumeMouseDelta();
      if (!this.docked && !this.warp) {
        this.ship.applyMouseDelta(mouse.dx, mouse.dy);
      } else {
        this.input.consumeMouseDelta();
      }

      this.accumulator += dt;
      let steps = 0;
      while (this.accumulator >= FIXED_DT && steps < MAX_STEPS) {
        this._fixedStep(FIXED_DT);
        this.accumulator -= FIXED_DT;
        steps += 1;
      }
      if (steps >= MAX_STEPS) this.accumulator = 0;

      this._checkDestruction();
      this._updateHUD(dt);
    } else {
      this.input.consumeMouseDelta();
    }

    this._updateCamera(dt);
    this.universe.update(dt, this.camera.position);
    this._updateVisuals(dt);
    this._render();
    this.input.endFrame();
  }

  _updateVisuals(dt) {
    // Cockpit hologram
    const holo = this.cockpit.hologram.userData.uniforms;
    holo.uTime.value = this.elapsed;
    holo.uMode.value = this.scanCandidate ? 1 : 0;
    holo.uOpacity.value = 0.30 + Math.min(0.5, this.ship.speed * 0.03);

    // Round CRT repeater
    this.gauge.update(dt, this._gaugeState(), Math.min(12, this.quality.mfdHz));
    this.gaugeTexture.needsUpdate = true;

    // Exterior ship (chase view)
    if (this.cameraMode === 'chase') {
      this.exterior.group.position.copy(this.ship.position);
      this.exterior.group.quaternion.copy(this.ship.quaternion);
      const load = Math.min(1, Math.abs(this.ship.throttle) + (this.ship.boosting ? 1 : 0));
      for (const plume of this.exterior.plumes) {
        plume.userData.uniforms.uTime.value = this.elapsed;
        plume.userData.uniforms.uPower.value = 0.25 + load * 0.9;
        plume.scale.set(1, 0.4 + load * 1.4, 1);
      }
    }

    // Warp overlay
    this.warpIntensity = Math.max(0, this.warpIntensity - dt * 1.6);
    this.warpOverlay.uniforms.uIntensity.value = this.warpIntensity;
    this.warpOverlay.uniforms.uTime.value = this.elapsed;

    // Cockpit interior lighting reacts to the drive state
    if (this.cockpit.cabinLight) {
      const boostGlow = this.ship.boosting ? 0.35 : 0;
      const hotGlow = this.ship.burning ? 0.3 : 0;
      this.cockpit.cabinLight.intensity = 0.45 + boostGlow + hotGlow;
      this.cockpit.cabinLight.color.setHex(this.ship.burning ? 0xffb877 : 0x9fd8ff);
    }

    // Audio parameters
    const throttle = Math.max(0, this.ship.throttle);
    this.audio.setEngineLoad(throttle, this.ship.speed);
    this.audio.setThruster(this.ship.boosting ? 1 : throttle * 0.35);
    this.audio.setWind(Math.min(1, this.ship.speed / 18));
    this.audio.setAtmosphere(this.ship.burning ? 1 : 0);
  }

  _render() {
    if (this.useComposer && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    // Screen-space warp streaks on top of everything
    if (this.warpIntensity > 0.001) {
      this.renderer.autoClear = false;
      this.renderer.clearDepth();
      this.renderer.render(this.warpOverlay.scene, this.warpOverlay.camera);
      this.renderer.autoClear = true;
    }
  }

  /* ================================================================ *
   *  HUD refresh
   * ================================================================ */

  _updateHUD(dt) {
    const ship = this.ship;
    const speedMs = ship.speed * METERS_PER_UNIT;

    // Region
    const regionInfo = this.universe.regionAt(ship.position);
    const p = ship.position;
    this.hud.setRegion(
      regionInfo.region ? loc(regionInfo.region, 'name') : t('hud.unknown'),
      `X ${Math.round(p.x)} · Y ${Math.round(p.y)} · Z ${Math.round(p.z)}`
    );

    // Mission
    const mission = this.missions.current;
    this.hud.setMission(
      loc(mission, 'title'),
      loc(mission, 'desc'),
      mission.progress({
        ship,
        save: this.save,
        distToStation: this.distToStation,
        distToPort: this.distToPort,
        speedMs,
        scanProgress: this.scan.active ? this.scan.progress : 0,
        anomalyDiscovered: this.discoveredAnomaly,
        docked: this.docked && this.save.data.dockedCount > 0,
      }) || 0,
      this.missions.index,
      this.missions.total,
      loc(mission, 'hint') || ''
    );

    // Flight data
    this.hud.setFlight({
      speedMs,
      throttle: Math.abs(ship.throttle),
      boosting: ship.boosting,
      fuel: ship.fuel,
      hull: ship.hull,
      maxSpeed: SHIP.maxSpeed * METERS_PER_UNIT,
    });

    const heading = Math.atan2(ship.forward.x, -ship.forward.z);
    this.hud.setSystems({
      scan: this.scan.active ? this.scan.progress : 0,
      dockDist: this.distToPort,
      nearest: this.nearestName,
      discoveries: this.save.discoveryCount,
      total: SCAN_TARGETS.length,
      heading: (heading * 180 / Math.PI + 360) % 360,
      camMode: this.cameraMode,
    });

    // Scan candidate
    this.scanCandidate = this.scan.active ? this.scan.target : this._findScanCandidate();

    // Scan panel
    this.hud.setScan(this.scan.active, this.scan.progress, this.scan.target ? loc(this.scan.target, 'name') : '');

    // Warnings
    let warning = this.warning;
    if (!warning && ship.fuel < 15) warning = t('warn.lowFuel');
    if (!warning && ship.heat > 0.55) warning = t('warn.overheat');
    if (!warning && this.warp) warning = t('warn.warpCharging');
    this.hud.setWarning(warning);
    this.hud.setDanger(this.hazard * 0.8 + (ship.hull < 30 ? 0.25 : 0));

    // Contextual prompt
    this._updatePrompt();

    // Markers
    this._updateMarkers();

    // MFD
    this.mfd.update(dt, this._mfdState(), this.quality.mfdHz);
    this.mfdTexture.needsUpdate = true;

    // Pointer hint
    this.hud.setPointerHint(!this.input.pointerLocked && !this.overlays.active);
  }

  _updatePrompt() {
    if (this.scan.active) {
      this.hud.setPrompt('F', t('toast.scanRunning'));
      return;
    }
    if (this.warp) {
      this.hud.setPrompt('', t('prompt.warp'));
      return;
    }
    if (this.docked) {
      this.hud.setPrompt('R', t('prompt.undock'));
      return;
    }
    if (this.distToPort < STATION.dockRadius * 3.4) {
      if (this.ship.speed > 3.2) {
        this.hud.setPrompt('X', t('prompt.slowDown', {
          limit: Math.round(300 / METERS_PER_UNIT * METERS_PER_UNIT),
          speed: Math.round(this.ship.speed * METERS_PER_UNIT),
        }));
      } else {
        this.hud.setPrompt('R', t('prompt.dock'));
      }
      return;
    }
    if (this.scanCandidate) {
      this.hud.setPrompt('F', t('toast.scanTarget', { name: loc(this.scanCandidate, 'name') }));
      return;
    }
    this.hud.setPrompt('', '');
  }

  _updateMarkers() {
    const list = [];
    const cam = this.camera;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const project = (worldPos, id, label, dist, cls) => {
      _v1.copy(worldPos).project(cam);
      const behind = _v1.z > 1 || _v1.z < -1;
      const x = (_v1.x * 0.5 + 0.5) * w;
      const y = (-_v1.y * 0.5 + 0.5) * h;
      list.push({
        id,
        label,
        dist,
        cls,
        x,
        y,
        visible: !behind && x > -40 && x < w + 40 && y > -40 && y < h + 40,
      });
    };

    if (this.scanCandidate) {
      project(this.scanCandidate.position, 'scan', loc(this.scanCandidate, 'name'),
        this.ship.position.distanceTo(this.scanCandidate.position), 'scan');
    }
    if (this.distToPort < 900) {
      project(this.universe.station.portPosition, 'dock', t('hud.berth'),
        this.distToPort, 'dock');
    }
    project(STAR.position, 'star', t('marker.star'), this.ship.position.distanceTo(STAR.position), 'off');
    for (const d of PLANETS) {
      project(d.position, `p-${d.id}`, loc(d, 'name'), this.ship.position.distanceTo(d.position), 'off');
    }
    this.hud.syncMarkers(list);
  }

  _gaugeState() {
    const ship = this.ship;
    const e = new THREE.Euler().setFromQuaternion(ship.quaternion, 'YXZ');
    const heading = Math.atan2(ship.forward.x, -ship.forward.z);
    // Vertical speed from the ship-relative vertical velocity component.
    const verticalSpeed = ship.velocity.dot(ship.up);
    // Lateral slip: sideways velocity relative to the nose.
    const slip = ship.velocity.dot(ship.right) / Math.max(0.4, ship.speed);
    // "Altitude" is the distance to the nearest large body's surface.
    let altitude = 0;
    for (const d of PLANETS) {
      const gap = ship.position.distanceTo(d.position) - d.radius;
      if (gap < 4000 && (altitude === 0 || gap < altitude)) altitude = gap;
    }
    return {
      heading: (heading * 180 / Math.PI + 360) % 360,
      slip: Math.max(-1, Math.min(1, slip)),
      verticalSpeed,
      altitudeKm: Math.max(0, altitude) / 10,
      pitch: e.x,
      roll: e.z,
    };
  }

  _mfdState() {
    const ship = this.ship;
    const e = new THREE.Euler().setFromQuaternion(ship.quaternion, 'YXZ');
    const heading = Math.atan2(ship.forward.x, -ship.forward.z);

    // Radar contacts in ship-local XZ frame
    const contacts = [];
    const add = (pos, label, color, range) => {
      _v1.copy(pos).sub(ship.position);
      const dist = _v1.length();
      if (dist > range) return;
      _v2.copy(_v1).applyQuaternion(_q1.copy(ship.quaternion).invert());
      contacts.push({
        x: _v2.x / range,
        y: _v2.z / range,
        label,
        color,
      });
    };
    add(STAR.position, 'IRDA', '#ffd08a', 900);
    for (const d of PLANETS) add(d.position, RADAR_TAGS[d.id] || '????', '#E9A93D', 1400);
    for (const d of MOONS) add(d.position, RADAR_TAGS[d.id] || '????', '#B9A6E6', 700);
    add(STATION.position, 'BEACON', '#6FCF97', 900);
    for (const a of ANOMALIES) add(a.position, '????', '#E2573C', 700);

    return {
      pitch: e.x,
      roll: e.z,
      heading: heading,
      speedMs: ship.speed * METERS_PER_UNIT,
      fuel: ship.fuel,
      hull: ship.hull,
      shield: 1 - this.hazard,
      region: loc(this.universe.regionAt(ship.position).region || {}, 'name') || '—',
      targetName: this.scanCandidate ? loc(this.scanCandidate, 'name') : (this.docked ? t('hud.berth') : ''),
      targetRange: this.scanCandidate ? this.ship.position.distanceTo(this.scanCandidate.position) : null,
      scanProgress: this.scan.active ? this.scan.progress : 0,
      contacts,
      warning: this.warning || (ship.fuel < 15 ? t('mfd.lowFuel') : ''),
      warp: this.warp ? 1 : 0,
    };
  }

  /* ================================================================ *
   *  Settings UI
   * ================================================================ */

  _syncSettingsUI() {
    const s = this.settings;
    const q = document.getElementById('setQuality');
    const vol = document.getElementById('setVolume');
    const sens = document.getElementById('setSens');
    const fov = document.getElementById('setFov');
    const inv = document.getElementById('setInvertY');
    const assist = document.getElementById('setAssist');
    const mute = document.getElementById('setMute');
    if (!q) return;

    q.value = s.get('quality');
    vol.value = String(Math.round(s.get('masterVolume') * 100));
    document.getElementById('setVolumeOut').value = vol.value;
    sens.value = String(Math.round(s.get('sensitivity') * 100));
    document.getElementById('setSensOut').value = s.get('sensitivity').toFixed(2);
    fov.value = String(s.get('fov'));
    document.getElementById('setFovOut').value = fov.value;
    inv.checked = s.get('invertY');
    assist.checked = s.get('flightAssist');
    mute.checked = s.get('muted');

    q.onchange = () => this._applyQuality(q.value);
    vol.oninput = () => {
      s.set('masterVolume', vol.value / 100);
      this.audio.setVolume(vol.value / 100);
      document.getElementById('setVolumeOut').value = vol.value;
    };
    sens.oninput = () => {
      s.set('sensitivity', sens.value / 100);
      document.getElementById('setSensOut').value = (sens.value / 100).toFixed(2);
    };
    fov.oninput = () => {
      s.set('fov', Number(fov.value));
      document.getElementById('setFovOut').value = fov.value;
    };
    inv.onchange = () => s.set('invertY', inv.checked);
    assist.onchange = () => s.set('flightAssist', assist.checked);
    mute.onchange = () => {
      s.set('muted', mute.checked);
      this.audio.setMuted(mute.checked);
    };
  }

  async _applyQuality(level) {
    if (!QUALITY_PRESETS[level]) return;
    this.settings.set('quality', level);
    this.quality = this.settings.quality;

    this.renderer.setPixelRatio(this.renderTier === 'software'
      ? 0.75
      : Math.min(window.devicePixelRatio, this.quality.pixelRatio));
    if (this.composer) {
      this.composer.setPixelRatio(this.renderTier === 'software'
        ? 0.75
        : Math.min(window.devicePixelRatio, this.quality.pixelRatio));
    }
    this.useComposer = this.quality.bloom && this.renderTier !== 'software';

    this.overlays.setLoading(t('load.rebuilding'), 0.2);
    this.overlays.el.loading.classList.remove('hidden');
    await yieldToBrowser();

    // Rebuild the world with the new budgets.
    this.scene.remove(this.universe.root);
    this.universe.root.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const m of mats) {
          if (m.map) m.map.dispose();
          m.dispose();
        }
      }
    });
    this.universe = new Universe(this.scene, this.quality);
    await this.universe.build((label, pct) => this.overlays.setLoading(label, pct));

    // Rebuild the exterior ship so its textures match the new tier.
    this.scene.remove(this.exterior.group);
    this.exterior = buildExteriorShip({ quality: this.quality });
    this.exterior.group.visible = this.cameraMode === 'chase';
    this.scene.add(this.exterior.group);

    this.overlays.el.loading.classList.add('hidden');
    this.overlays.open('pause');
    this.hud.toast(t('toast.quality'), 'good');
  }

  /* ================================================================ *
   *  Misc
   * ================================================================ */

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    if (this.composer) this.composer.setSize(w, h);
  }
}
