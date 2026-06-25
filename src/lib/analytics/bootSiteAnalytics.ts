import { initAnalytics } from './bus';
import { bootDeferredAnalytics } from './deferredBoot';

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
}
