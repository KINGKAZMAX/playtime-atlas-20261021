/**
 * Fully procedural audio — no sample files are shipped or fetched.
 * Everything is synthesised with oscillators and generated noise buffers.
 *
 * The AudioContext is created lazily and only resumed from a real user
 * gesture, which is what browsers require.
 */
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ready = false;
    this.muted = false;
    this.masterVolume = 0.7;
    this._nodes = {};
    this._noiseBuffer = null;
    this._lastBeep = 0;
  }

  /** Must be called from inside a user-gesture handler. */
  async init() {
    if (this.ready) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return true;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      console.warn('[Audio] WebAudio unavailable');
      return false;
    }
    try {
      this.ctx = new AC();
      if (this.ctx.state === 'suspended') await this.ctx.resume();
    } catch (err) {
      console.warn('[Audio] failed to create context', err);
      return false;
    }

    this._build();
    this.ready = true;
    this._applyVolume();
    return true;
  }

  _build() {
    const ctx = this.ctx;

    // Master chain: master gain -> soft compressor -> destination
    const master = ctx.createGain();
    master.gain.value = this.masterVolume;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 22;
    comp.ratio.value = 8;
    comp.attack.value = 0.004;
    comp.release.value = 0.22;

    master.connect(comp);
    comp.connect(ctx.destination);
    this._nodes.master = master;

    // ---- Engine drone --------------------------------------------
    const engineGain = ctx.createGain();
    engineGain.gain.value = 0.0;
    const engineFilter = ctx.createBiquadFilter();
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 320;
    engineFilter.Q.value = 3.2;
    engineGain.connect(engineFilter);
    engineFilter.connect(master);

    const oscA = ctx.createOscillator();
    oscA.type = 'sawtooth';
    oscA.frequency.value = 46;
    const oscAGain = ctx.createGain();
    oscAGain.gain.value = 0.55;
    oscA.connect(oscAGain).connect(engineGain);
    oscA.start();

    const oscB = ctx.createOscillator();
    oscB.type = 'square';
    oscB.frequency.value = 69;
    const oscBGain = ctx.createGain();
    oscBGain.gain.value = 0.20;
    oscB.connect(oscBGain).connect(engineGain);
    oscB.start();

    const oscC = ctx.createOscillator();
    oscC.type = 'sine';
    oscC.frequency.value = 23;
    const oscCGain = ctx.createGain();
    oscCGain.gain.value = 0.7;
    oscC.connect(oscCGain).connect(engineGain);
    oscC.start();

    // Gentle warble so the drone never sounds static
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 5.4;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 4.5;
    lfo.connect(lfoGain).connect(oscA.frequency);
    lfo.start();

    this._nodes.engineGain = engineGain;
    this._nodes.engineFilter = engineFilter;
    this._nodes.oscA = oscA;
    this._nodes.oscB = oscB;

    // ---- Noise sources -------------------------------------------
    this._noiseBuffer = this._makeNoise(2.0);

    // Thruster (afterburner) noise
    const thrSrc = ctx.createBufferSource();
    thrSrc.buffer = this._noiseBuffer;
    thrSrc.loop = true;
    const thrFilter = ctx.createBiquadFilter();
    thrFilter.type = 'bandpass';
    thrFilter.frequency.value = 900;
    thrFilter.Q.value = 0.9;
    const thrGain = ctx.createGain();
    thrGain.gain.value = 0;
    thrSrc.connect(thrFilter).connect(thrGain).connect(master);
    thrSrc.start();
    this._nodes.thrGain = thrGain;
    this._nodes.thrFilter = thrFilter;

    // Ambient hull wind (rises with speed)
    const windSrc = ctx.createBufferSource();
    windSrc.buffer = this._noiseBuffer;
    windSrc.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 480;
    const windGain = ctx.createGain();
    windGain.gain.value = 0;
    windSrc.connect(windFilter).connect(windGain).connect(master);
    windSrc.start();
    this._nodes.windGain = windGain;
    this._nodes.windFilter = windFilter;

    // Atmosphere roar (only when inside a gas envelope)
    const atmSrc = ctx.createBufferSource();
    atmSrc.buffer = this._noiseBuffer;
    atmSrc.loop = true;
    const atmFilter = ctx.createBiquadFilter();
    atmFilter.type = 'bandpass';
    atmFilter.frequency.value = 260;
    atmFilter.Q.value = 0.55;
    const atmGain = ctx.createGain();
    atmGain.gain.value = 0;
    atmSrc.connect(atmFilter).connect(atmGain).connect(master);
    atmSrc.start();
    this._nodes.atmGain = atmGain;

    // Cockpit ambience hum
    const cabSrc = ctx.createBufferSource();
    cabSrc.buffer = this._noiseBuffer;
    cabSrc.loop = true;
    const cabFilter = ctx.createBiquadFilter();
    cabFilter.type = 'lowpass';
    cabFilter.frequency.value = 190;
    const cabGain = ctx.createGain();
    cabGain.gain.value = 0.05;
    cabSrc.connect(cabFilter).connect(cabGain).connect(master);
    cabSrc.start();
  }

  _makeNoise(seconds) {
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      // Slightly brown-tinted noise reads warmer than pure white.
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    return buf;
  }

  /* -------------------------------------------------------------- *
   *  Continuous parameters
   * -------------------------------------------------------------- */

  setEngineLoad(throttle, speed) {
    if (!this.ready) return;
    const t = Math.max(0, Math.min(1, throttle));
    const s = Math.max(0, Math.min(1, speed / 12));
    const now = this.ctx.currentTime;
    const eg = this._nodes.engineGain.gain;
    eg.setTargetAtTime(0.035 + t * 0.085 + s * 0.03, now, 0.18);
    this._nodes.engineFilter.frequency.setTargetAtTime(280 + t * 620 + s * 240, now, 0.22);
    this._nodes.oscA.frequency.setTargetAtTime(46 + t * 26 + s * 12, now, 0.3);
    this._nodes.oscB.frequency.setTargetAtTime(69 + t * 40, now, 0.3);
  }

  setThruster(level) {
    if (!this.ready) return;
    const now = this.ctx.currentTime;
    this._nodes.thrGain.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * 0.16, now, 0.12);
    this._nodes.thrFilter.frequency.setTargetAtTime(700 + level * 1400, now, 0.2);
  }

  setWind(level) {
    if (!this.ready) return;
    const now = this.ctx.currentTime;
    this._nodes.windGain.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * 0.055, now, 0.3);
    this._nodes.windFilter.frequency.setTargetAtTime(320 + level * 1400, now, 0.3);
  }

  setAtmosphere(level) {
    if (!this.ready) return;
    const now = this.ctx.currentTime;
    this._nodes.atmGain.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * 0.13, now, 0.25);
  }

  /* -------------------------------------------------------------- *
   *  One-shots
   * -------------------------------------------------------------- */

  _env(node, peak, attack, decay, when = 0) {
    const t = this.ctx.currentTime + when;
    node.gain.cancelScheduledValues(t);
    node.gain.setValueAtTime(0.0001, t);
    node.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    node.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  }

  tone(freq, { type = 'sine', peak = 0.15, attack = 0.008, decay = 0.18, when = 0, slideTo = null } = {}) {
    if (!this.ready) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    const t = ctx.currentTime + when;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t + attack + decay);
    osc.connect(g).connect(this._nodes.master);
    this._env(g, peak, attack, decay, when);
    osc.start(t);
    osc.stop(t + attack + decay + 0.05);
  }

  noiseBurst({ peak = 0.2, attack = 0.005, decay = 0.3, freq = 400, type = 'lowpass', q = 1, sweepTo = null } = {}) {
    if (!this.ready) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    filter.frequency.setValueAtTime(freq, t);
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(Math.max(40, sweepTo), t + attack + decay);
    src.connect(filter).connect(g).connect(this._nodes.master);
    this._env(g, peak, attack, decay);
    src.start(t);
    src.stop(t + attack + decay + 0.05);
  }

  /* Named game sounds ------------------------------------------------ */

  uiClick() {
    this.tone(880, { type: 'square', peak: 0.05, attack: 0.002, decay: 0.05 });
  }

  uiHover() {
    this.tone(1320, { type: 'sine', peak: 0.025, attack: 0.002, decay: 0.04 });
  }

  scanPing(step = 0) {
    this.tone(520 + step * 90, { type: 'square', peak: 0.07, attack: 0.004, decay: 0.11 });
  }

  scanComplete() {
    this.tone(660, { type: 'sine', peak: 0.12, attack: 0.01, decay: 0.35 });
    this.tone(990, { type: 'sine', peak: 0.1, attack: 0.01, decay: 0.45, when: 0.12 });
    this.tone(1320, { type: 'sine', peak: 0.08, attack: 0.01, decay: 0.6, when: 0.24 });
  }

  warpCharge(duration = 1.2) {
    if (!this.ready) return;
    this.tone(90, { type: 'sawtooth', peak: 0.12, attack: 0.4, decay: duration, slideTo: 900 });
    this.noiseBurst({ peak: 0.1, attack: 0.5, decay: duration, freq: 200, type: 'bandpass', q: 2, sweepTo: 5000 });
  }

  warpJump() {
    this.noiseBurst({ peak: 0.26, attack: 0.03, decay: 0.9, freq: 6000, type: 'lowpass', sweepTo: 120 });
    this.tone(1200, { type: 'triangle', peak: 0.16, attack: 0.02, decay: 1.1, slideTo: 120 });
  }

  dockSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.tone(f, { type: 'sine', peak: 0.14, attack: 0.01, decay: 0.6, when: i * 0.13 });
    });
  }

  alert() {
    this.tone(740, { type: 'square', peak: 0.09, attack: 0.005, decay: 0.14 });
    this.tone(560, { type: 'square', peak: 0.09, attack: 0.005, decay: 0.16, when: 0.16 });
  }

  impact(strength = 1) {
    this.noiseBurst({
      peak: 0.16 * Math.min(1.4, strength),
      attack: 0.004,
      decay: 0.42,
      freq: 900,
      type: 'lowpass',
      sweepTo: 90,
    });
    this.tone(70, { type: 'sine', peak: 0.18 * strength, attack: 0.005, decay: 0.5, slideTo: 34 });
  }

  proximity() {
    const now = performance.now();
    if (now - this._lastBeep < 420) return;
    this._lastBeep = now;
    this.tone(1040, { type: 'triangle', peak: 0.05, attack: 0.003, decay: 0.09 });
  }

  missionComplete() {
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      this.tone(f, { type: 'triangle', peak: 0.13, attack: 0.012, decay: 0.7, when: i * 0.11 });
    });
  }

  /* -------------------------------------------------------------- *
   *  Global mix
   * -------------------------------------------------------------- */

  setMuted(muted) {
    this.muted = muted;
    this._applyVolume();
  }

  setVolume(v) {
    this.masterVolume = Math.max(0, Math.min(1, v));
    this._applyVolume();
  }

  _applyVolume() {
    if (!this.ready) return;
    const target = this.muted ? 0 : this.masterVolume;
    this._nodes.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
  }

  suspend() {
    if (this.ready && this.ctx.state === 'running') this.ctx.suspend();
  }

  resume() {
    if (this.ready && this.ctx.state === 'suspended') this.ctx.resume();
  }
}
