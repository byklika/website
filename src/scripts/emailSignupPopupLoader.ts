import {
  EMAIL_SIGNUP_POPUP_DEFAULTS,
  EMAIL_SIGNUP_POPUP_PARTIAL_PATH,
  getDocumentScrollRatio,
  hasSeenEmailSignupPopup
} from '~/data/emailSignupPopupContract';
import { scheduleDomIdle } from '~/lib/scheduleDomIdle';

let loadPromise: Promise<boolean> | null = null;

function parsePopupOverlay(html: string): HTMLElement | null {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const overlay = doc.querySelector<HTMLElement>('[data-email-signup-popup-overlay]');
  if (!overlay) return null;
  return document.importNode(overlay, true) as HTMLElement;
}

async function ensureEmailSignupPopupLoaded(): Promise<boolean> {
  if (document.querySelector('[data-email-signup-popup-overlay]')) {
    return true;
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        const response = await fetch(EMAIL_SIGNUP_POPUP_PARTIAL_PATH, {
          credentials: 'same-origin'
        });
        if (!response.ok) return false;

        const overlay = parsePopupOverlay(await response.text());
        if (!overlay) return false;

        document.body.appendChild(overlay);
        return true;
      } catch {
        loadPromise = null;
        return false;
      }
    })();
  }

  const loaded = await loadPromise;
  if (!loaded) loadPromise = null;
  return loaded;
}

function scheduleEmailSignupPopup() {
  const { storageKey, openAfterMs, openAtScrollRatio, prefetchAfterMs, prefetchAtScrollRatio } =
    EMAIL_SIGNUP_POPUP_DEFAULTS;

  if (hasSeenEmailSignupPopup(storageKey)) return;

  let opened = false;
  let prefetched = false;

  const prefetch = () => {
    if (prefetched) return;
    prefetched = true;
    void ensureEmailSignupPopupLoaded();
  };

  const cleanup = () => {
    window.clearTimeout(openTimeoutId);
    window.clearTimeout(prefetchTimeoutId);
    window.removeEventListener('scroll', onScroll);
  };

  const openPopup = async () => {
    if (opened) return;
    opened = true;
    cleanup();

    const loaded = await ensureEmailSignupPopupLoaded();
    if (!loaded) return;

    const { initEmailSignupPopup } = await import('./emailSignupPopup');
    initEmailSignupPopup({ openImmediately: true });
  };

  const onScroll = () => {
    const ratio = getDocumentScrollRatio();
    if (ratio >= prefetchAtScrollRatio) prefetch();
    if (ratio >= openAtScrollRatio) void openPopup();
  };

  const openTimeoutId = window.setTimeout(() => void openPopup(), openAfterMs);
  const prefetchTimeoutId = window.setTimeout(prefetch, prefetchAfterMs);

  window.addEventListener('scroll', onScroll, { passive: true });
  requestAnimationFrame(onScroll);
}

scheduleDomIdle(scheduleEmailSignupPopup);

export { ensureEmailSignupPopupLoaded, scheduleEmailSignupPopup };
