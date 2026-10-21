import { read, write } from './store.js';
import { bus } from './bus.js';

const KEY = 'progress';

const DEFAULTS = {
  version: 1,
  /** 节奏成绩：{ [trackId]: { bestScore, bestCombo, bestAccuracy, plays, bestReactionMs } } */
  rhythm: {},
  /** 解谜进度：{ current, completed: { [levelId]: { timeMs, motes, stars } }, hintsUsed } */
  puzzle: { current: 'corridor', completed: {}, hintsUsed: {} },
  /** 已访问的展项 */
  visited: {},
};

function normalize(raw) {
  const data = raw && typeof raw === 'object' ? raw : {};
  return {
    version: 1,
    rhythm: data.rhythm && typeof data.rhythm === 'object' ? data.rhythm : {},
    puzzle: {
      current: data.puzzle?.current || DEFAULTS.puzzle.current,
      completed: data.puzzle?.completed && typeof data.puzzle.completed === 'object' ? data.puzzle.completed : {},
      hintsUsed: data.puzzle?.hintsUsed && typeof data.puzzle.hintsUsed === 'object' ? data.puzzle.hintsUsed : {},
    },
    visited: data.visited && typeof data.visited === 'object' ? data.visited : {},
  };
}

let state = normalize(read(KEY, null));

function persist() {
  write(KEY, state);
  bus.emit('progress:change', getProgress());
}

export function getProgress() {
  return JSON.parse(JSON.stringify(state));
}

/* ---------------- 节奏 ---------------- */

export function recordRhythmRun(trackId, run) {
  const prev = state.rhythm[trackId] || { bestScore: 0, bestCombo: 0, bestAccuracy: 0, plays: 0, bestReactionMs: null };
  const next = {
    bestScore: Math.max(prev.bestScore || 0, run.score || 0),
    bestCombo: Math.max(prev.bestCombo || 0, run.maxCombo || 0),
    bestAccuracy: Math.max(prev.bestAccuracy || 0, run.accuracy || 0),
    bestReactionMs:
      prev.bestReactionMs == null
        ? run.reactionMs ?? null
        : Math.min(prev.bestReactionMs, run.reactionMs ?? prev.bestReactionMs),
    plays: (prev.plays || 0) + 1,
  };
  state.rhythm[trackId] = next;
  persist();
  return next;
}

export function getRhythmRecord(trackId) {
  return state.rhythm[trackId] || null;
}

/* ---------------- 解谜 ---------------- */

export function getPuzzleState() {
  return state.puzzle;
}

export function setPuzzleCurrent(levelId) {
  state.puzzle.current = levelId;
  persist();
}

export function completeLevel(levelId, { timeMs, motes, totalMotes }) {
  const prev = state.puzzle.completed[levelId];
  const stars = motes >= totalMotes ? 3 : motes > 0 ? 2 : 1;
  const next = {
    timeMs: prev ? Math.min(prev.timeMs, timeMs) : timeMs,
    motes: Math.max(prev?.motes || 0, motes),
    stars: Math.max(prev?.stars || 0, stars),
  };
  state.puzzle.completed[levelId] = next;
  persist();
  return next;
}

export function useHint(levelId) {
  state.puzzle.hintsUsed[levelId] = (state.puzzle.hintsUsed[levelId] || 0) + 1;
  persist();
  return state.puzzle.hintsUsed[levelId];
}

export function getHintCount(levelId) {
  return state.puzzle.hintsUsed[levelId] || 0;
}

export function isLevelCompleted(levelId) {
  return Boolean(state.puzzle.completed[levelId]);
}

/* ---------------- 通用 ---------------- */

export function markVisited(key) {
  if (state.visited[key]) return;
  state.visited[key] = Date.now();
  persist();
}

export function resetProgress() {
  state = normalize(null);
  persist();
}
