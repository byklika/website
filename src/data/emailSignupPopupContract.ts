/** Shared popup timing + storage — used by loader and controller. */
export const EMAIL_SIGNUP_POPUP_PARTIAL_PATH = '/partials/email-signup-popup/';

export const EMAIL_SIGNUP_POPUP_DEFAULTS = {
  storageKey: 'email_signup_popup_seen_v1',
  openAfterMs: 50_000,
  openAtScrollRatio: 0.6,
  autoCloseMs: 2_500,
  /** Prefetch markup + controller slightly before open triggers. */
  prefetchAfterMs: 45_000,
  prefetchAtScrollRatio: 0.5
} as const;

export function hasSeenEmailSignupPopup(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) === '1';
  } catch {
    return false;
  }
}

export function markEmailSignupPopupSeen(storageKey: string): void {
  try {
    localStorage.setItem(storageKey, '1');
  } catch {
    // ignore
  }
}

export function readEmailSignupPopupConfig(overlay: HTMLElement) {
  const storageKey = overlay.dataset.storageKey ?? EMAIL_SIGNUP_POPUP_DEFAULTS.storageKey;
  const openAfterMs = Number(
    overlay.dataset.openAfterMs ?? EMAIL_SIGNUP_POPUP_DEFAULTS.openAfterMs
  );
  const openAtScrollRatio = Number(
    overlay.dataset.openAtScrollRatio ?? EMAIL_SIGNUP_POPUP_DEFAULTS.openAtScrollRatio
  );
  const autoCloseMs = Number(
    overlay.dataset.autoCloseMs ?? EMAIL_SIGNUP_POPUP_DEFAULTS.autoCloseMs
  );
  return {
    storageKey,
    openAfterMs: Number.isFinite(openAfterMs)
      ? openAfterMs
      : EMAIL_SIGNUP_POPUP_DEFAULTS.openAfterMs,
    openAtScrollRatio: Number.isFinite(openAtScrollRatio)
      ? openAtScrollRatio
      : EMAIL_SIGNUP_POPUP_DEFAULTS.openAtScrollRatio,
    autoCloseMs: Number.isFinite(autoCloseMs)
      ? autoCloseMs
      : EMAIL_SIGNUP_POPUP_DEFAULTS.autoCloseMs
  };
}

export function getDocumentScrollRatio(): number {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const viewport = window.innerHeight || doc.clientHeight || 0;
  const scrollHeight = doc.scrollHeight || 0;
  return scrollHeight > 0 ? (scrollTop + viewport) / scrollHeight : 0;
}
