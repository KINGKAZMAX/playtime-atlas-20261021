// NOTE: the key keeps its original `deep-space-drifter.` prefix on purpose.
// The automated QA harness (13-qa-curation/qa-harness/lib/probes.mjs) reads and
// writes this exact literal, so renaming it would break its D4 check. It is a
// technical contract, not a user-facing name — see SOURCE-AND-DIFFERENCES.md §3.7.
const SAVE_KEY = 'deep-space-drifter.save.v1';
const SAVE_VERSION = 1;

/**
 * Persistent player profile: discoveries, mission progress, credits and
 * the location the ship was last parked at. Everything lives in localStorage.
 */
export class SaveGame {
  constructor() {
    this.data = this._blank();
    this.load();
  }

  _blank() {
    return {
      version: SAVE_VERSION,
      createdAt: Date.now(),
      discoveries: {},          // id -> { name, at, kind }
      missions: {},             // id -> true
      credits: 0,
      docked: false,
      dockedCount: 0,
      totalDistance: 0,        // metres travelled
      jumps: 0,
      scans: 0,
      lastPosition: null,      // { x, y, z, qx, qy, qz, qw }
      tutorialSeen: false,
      playtime: 0,
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === SAVE_VERSION) {
          this.data = { ...this._blank(), ...parsed };
        }
      }
    } catch (err) {
      console.warn('[SaveGame] load failed, starting fresh', err);
    }
    return this.data;
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.warn('[SaveGame] save failed', err);
    }
  }

  hasDiscovered(id) {
    return Boolean(this.data.discoveries[id]);
  }

  discover(id, name, kind = 'body') {
    if (this.hasDiscovered(id)) return false;
    this.data.discoveries[id] = { name, kind, at: Date.now() };
    this.data.scans += 1;
    this.data.credits += 120;
    this.save();
    return true;
  }

  completeMission(id) {
    if (this.data.missions[id]) return false;
    this.data.missions[id] = true;
    this.data.credits += 250;
    this.save();
    return true;
  }

  isMissionComplete(id) {
    return Boolean(this.data.missions[id]);
  }

  get discoveryCount() {
    return Object.keys(this.data.discoveries).length;
  }

  addCredits(n) {
    this.data.credits = Math.max(0, this.data.credits + n);
    this.save();
  }

  reset() {
    this.data = this._blank();
    this.save();
  }
}
