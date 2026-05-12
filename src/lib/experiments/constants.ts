/** GrowthBook feature key — do not rename (Product / SDK contract). */
export const NAV_NOSOTRAS_FLAG_KEY = 'nav-nosotras-label-v1';

/**
 * Stable anonymous id for GrowthBook bucketing (must match `anonId` in `SiteAnalytics.astro`).
 * Cookie is readable by JS (not httpOnly) so the client SDK can read/write the same id as `localStorage`.
 */
export const GB_ANON_ID_COOKIE = 'gb_anon_id';
