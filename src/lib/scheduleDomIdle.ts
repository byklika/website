import { runWhenIdle } from './analytics/deferredBoot';

/** Run after `DOMContentLoaded` (if needed) and `requestIdleCallback` so work stays off the first paint path. */
export function scheduleDomIdle(fn: () => void): void {
  const start = () => runWhenIdle(fn);
  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
}
