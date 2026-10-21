/**
 * Motion helpers.
 *
 * The page must stay correct in environments where the animation timeline
 * does not advance (backgrounded tabs, throttled renderers, headless
 * screenshot pipelines). A heartbeat tracks whether frames are still being
 * produced so callers can fall back to an immediate, non-animated result.
 */

let lastBeat = performance.now();
let beatCount = 0;

function loop(): void {
  lastBeat = performance.now();
  beatCount += 1;
  requestAnimationFrame(loop);
}

export function startHeartbeat(): void {
  requestAnimationFrame(loop);
}

/** True when the rendering timeline is still advancing. */
export function timelineLive(): boolean {
  return performance.now() - lastBeat < 400;
}

/** Frames observed since load — handy for diagnostics. */
export function frames(): number {
  return beatCount;
}

/** Motion mode resolved before first paint by the inline head script. */
export function motionMode(): 'on' | 'off' {
  return document.documentElement.dataset.motion === 'off' ? 'off' : 'on';
}

/**
 * Run an entrance animation, but only when the timeline can actually play it.
 * Otherwise the element is left in its final state straight away.
 */
export function animateIn(
  el: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): void {
  if (motionMode() === 'off' || !timelineLive()) {
    const style = (el as HTMLElement).style;
    const last = keyframes[keyframes.length - 1] as Keyframe;
    if ('opacity' in last) style.opacity = String(last.opacity);
    if ('transform' in last) style.transform = String(last.transform);
    return;
  }
  el.animate(keyframes, { fill: 'both', easing: 'cubic-bezier(0.22, 1, 0.36, 1)', ...options });
}
