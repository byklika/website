import { growthbookTrackingCallback } from './growthbookTrackingCallback';
import { GB_ANON_ID_COOKIE } from './constants';

function getAnonymousId(): string {
  const idKey = GB_ANON_ID_COOKIE;
  const maxAge = 60 * 60 * 24 * 400;
  const baseAttrs = `path=/;max-age=${maxAge};SameSite=Lax`;
  const secureAttrs =
    typeof location !== 'undefined' && location.protocol === 'https:' ? ';Secure' : '';

  try {
    const prefix = `${idKey}=`;
    const parts = document.cookie.split('; ');
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.startsWith(prefix)) {
        const fromCookie = decodeURIComponent(p.slice(prefix.length));
        try {
          localStorage.setItem(idKey, fromCookie);
        } catch {
          /* ignore */
        }
        return fromCookie;
      }
    }

    const existing = localStorage.getItem(idKey);
    if (existing) {
      document.cookie = `${idKey}=${encodeURIComponent(existing)};${baseAttrs}${secureAttrs}`;
      return existing;
    }

    const created =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `anon-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(idKey, created);
    document.cookie = `${idKey}=${encodeURIComponent(created)};${baseAttrs}${secureAttrs}`;
    return created;
  } catch {
    return 'anon-fallback';
  }
}

/** Load SDK + init when `PUBLIC_GROWTHBOOK_CLIENT_KEY` is set at build time. */
export async function bootGrowthBook(): Promise<void> {
  const clientKey = import.meta.env.PUBLIC_GROWTHBOOK_CLIENT_KEY?.trim();
  if (!clientKey) return;

  const { GrowthBook } = await import('@growthbook/growthbook');

  const gb = new GrowthBook({
    apiHost: 'https://cdn.growthbook.io',
    clientKey,
    enableDevMode: import.meta.env.DEV,
    trackingCallback: growthbookTrackingCallback
  });

  const anonId = getAnonymousId();
  // Experiments default to hashAttribute `id`; without it, hashValue is empty and
  // the SDK never fires trackingCallback (no GA `experiment_viewed`).
  gb.setAttributes({
    id: anonId,
    anonId
  });

  try {
    await gb.init();
    window.growthbook = gb;
    window.dispatchEvent(new CustomEvent('growthbook:ready'));
  } catch (err) {
    if (import.meta.env.DEV) console.error('[GrowthBook]', err);
  }
}
