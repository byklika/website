import type { AnalyticsEvent } from './types';

/** Maps typed bus events to `gtag('event', …)` (no-op when GA is not loaded). */
export function forwardAnalyticsToGtag(event: AnalyticsEvent): void {
  if (typeof window.gtag !== 'function') return;

  switch (event.name) {
    case 'experiment_viewed':
      window.gtag('event', 'experiment_viewed', event.params);
      break;
    case 'nav_item_click':
      window.gtag('event', 'nav_item_click', event.params);
      break;
    case 'contact_cta_click':
      window.gtag('event', 'contact_cta_click', event.params);
      break;
    case 'contact_form_submit':
      window.gtag('event', 'contact_form_submit', event.params);
      break;
  }
}
