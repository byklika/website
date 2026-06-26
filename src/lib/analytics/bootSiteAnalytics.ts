import { initAnalytics } from './bus';
import { bootDeferredAnalytics, runAfterWindowLoad, runWhenIdle } from './deferredBoot';

/** Match GA4 — keep GrowthBook out of the LCP / load window. */
const GROWTHBOOK_IDLE_TIMEOUT_MS = 8000;

function bootDeferredGrowthBook(): void {
  if (!import.meta.env.PUBLIC_GROWTHBOOK_CLIENT_KEY?.trim()) return;

  runAfterWindowLoad(() =>
    runWhenIdle(() => {
      void import('~/lib/experiments/bootGrowthBook').then((m) => m.bootGrowthBook());
    }, GROWTHBOOK_IDLE_TIMEOUT_MS)
  );
}

/** Read analytics config from `SiteAnalytics.astro` data attributes and boot deferred loaders. */
export function bootSiteAnalytics(): void {
  const root = document.querySelector<HTMLElement>('.site-analytics-component');
  if (!root) return;

  const gaMeasurementId = root.dataset.gaMeasurementId?.trim() || undefined;
  const clarityProjectId = root.dataset.clarityProjectId?.trim() || undefined;
  const gaConfigRaw = root.dataset.gaConfig;
  const gaConfig = gaConfigRaw ? JSON.parse(gaConfigRaw) : undefined;

  initAnalytics();
  bootDeferredAnalytics({ gaMeasurementId, clarityProjectId, gaConfig });
  bootDeferredGrowthBook();
}
