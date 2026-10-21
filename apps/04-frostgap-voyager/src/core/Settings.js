const SETTINGS_KEY = 'deep-space-drifter.settings.v1';

/**
 * Quality presets. Every heavy visual system reads its budget from here so that
 * the low tier stays playable on integrated GPUs.
 */
export const QUALITY_PRESETS = {
  low: {
    label: '低',
    pixelRatio: 1.0,
    bloom: false,
    shadows: false,
    stars: 4500,
    asteroids: 420,
    nebulaTexture: 384,
    planetTexture: 512,
    atmosphereSegments: 48,
    ringSegments: 96,
    anisotropy: 1,
    dust: false,
    nebulaShell: false,
    mfdHz: 8,
  },
  medium: {
    label: '中',
    pixelRatio: 1.25,
    bloom: true,
    shadows: false,
    stars: 9000,
    asteroids: 900,
    nebulaTexture: 640,
    planetTexture: 768,
    atmosphereSegments: 72,
    ringSegments: 192,
    anisotropy: 4,
    dust: true,
    nebulaShell: false,
    mfdHz: 15,
  },
  high: {
    label: '高',
    pixelRatio: 2.0,
    bloom: true,
    shadows: true,
    stars: 15000,
    asteroids: 1500,
    nebulaTexture: 1024,
    planetTexture: 1024,
    atmosphereSegments: 96,
    ringSegments: 320,
    anisotropy: 8,
    dust: true,
    nebulaShell: true,
    mfdHz: 24,
  },
};

const DEFAULTS = {
  quality: 'medium',
  masterVolume: 0.7,
  muted: false,
  sensitivity: 1.0,
  invertY: false,
  fov: 72,
  flightAssist: true,
  showHud: true,
  cameraMode: 'cockpit',
};

export class Settings {
  constructor() {
    this.data = { ...DEFAULTS };
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        for (const key of Object.keys(DEFAULTS)) {
          if (parsed[key] !== undefined && typeof parsed[key] === typeof DEFAULTS[key]) {
            this.data[key] = parsed[key];
          }
        }
      }
    } catch (err) {
      console.warn('[Settings] failed to load, using defaults', err);
    }
    if (!QUALITY_PRESETS[this.data.quality]) this.data.quality = DEFAULTS.quality;
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.warn('[Settings] failed to persist', err);
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    if (this.data[key] === value) return false;
    this.data[key] = value;
    this.save();
    return true;
  }

  reset() {
    this.data = { ...DEFAULTS };
    this.save();
  }

  get quality() {
    return QUALITY_PRESETS[this.data.quality] || QUALITY_PRESETS.medium;
  }
}
