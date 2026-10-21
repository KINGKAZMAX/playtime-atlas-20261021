/**
 * Make the ego window usable for capture.
 *
 * A minimized ego window fails every screenshot with
 * "Cannot capture a screenshot while the window is minimized." — and the
 * failure is silent in the sense that the script keeps going and produces
 * an empty report. CDP's `Browser.getWindowForTarget` still reports the
 * window as "maximized" in that state, so the state has to be re-asserted
 * rather than read.
 *
 * `setWindowBounds({windowState:'normal'})` plus `Page.bringToFront`
 * restores it. Both are best-effort: a headless or bridge-less runtime
 * simply has nothing to restore, and the caller still gets a screenshot.
 */

export async function ensureWindowVisible(page) {
  let original = null;
  try {
    const w = await page.cdp('Browser.getWindowForTarget');
    const id = w?.windowId ?? w?.result?.windowId;
    const bounds = w?.bounds ?? w?.result?.bounds;
    original = bounds?.windowState || null;
    if (id != null) {
      await page.cdp('Browser.setWindowBounds', { windowId: id, bounds: { windowState: 'normal' } });
    }
  } catch { /* no window to restore */ }
  try {
    await page.cdp('Page.bringToFront');
  } catch { /* best effort */ }
  return original;
}

/** Put the window back the way the user had it. */
export async function restoreWindowState(page, state) {
  if (!state) return;
  try {
    const w = await page.cdp('Browser.getWindowForTarget');
    const id = w?.windowId ?? w?.result?.windowId;
    if (id != null) {
      await page.cdp('Browser.setWindowBounds', { windowId: id, bounds: { windowState: state } });
    }
  } catch { /* best effort */ }
}

/**
 * Take a screenshot, and if the window turns out to be minimized, restore it
 * and try exactly once more before giving up.
 */
export async function shootWithRecovery(page, options) {
  try {
    return await page.screenshot(options);
  } catch (err) {
    if (!/minimized/i.test(String(err?.message || err))) throw err;
    await ensureWindowVisible(page);
    return page.screenshot(options);
  }
}
