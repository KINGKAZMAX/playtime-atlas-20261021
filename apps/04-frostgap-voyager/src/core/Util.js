/**
 * Yield control to the browser without relying on timers.
 *
 * `setTimeout` is clamped to once per second (or worse) in background tabs,
 * which turns a two-second asset build into a minute-long stall. Messages
 * posted through a MessageChannel are delivered as ordinary tasks and are
 * never throttled, so the compositor still gets a chance to paint between
 * chunks of work.
 */
export function yieldToBrowser() {
  return new Promise((resolve) => {
    if (typeof MessageChannel === 'undefined') {
      setTimeout(resolve, 0);
      return;
    }
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}
