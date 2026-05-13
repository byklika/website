import type { AnalyticsEvent, AnalyticsSubscriber } from './types';
import { forwardAnalyticsToGtag } from './ga4Subscriber';

const subscribers = new Set<AnalyticsSubscriber>();

let gaForwarderAttached = false;

/** Clears subscribers and GA forwarder state (unit tests only). */
export function resetAnalyticsBusForTests(): void {
  subscribers.clear();
  gaForwarderAttached = false;
}

function ensureGaForwarder(): void {
  if (gaForwarderAttached) return;
  gaForwarderAttached = true;
  subscribers.add(forwardAnalyticsToGtag);
}

/** Register a listener (e.g. GA4, Clarity, logging). Returns unsubscribe. */
export function subscribe(subscriber: AnalyticsSubscriber): () => void {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}

/** Emit an analytics event; all subscribers run synchronously. */
export function publish(event: AnalyticsEvent): void {
  ensureGaForwarder();
  for (const fn of subscribers) {
    try {
      fn(event);
    } catch (err) {
      if (import.meta.env.DEV) console.error('[analytics]', event.name, err);
    }
  }
}

/**
 * Optional: register the GA4 forwarder before the first `publish` (e.g. right after the
 * inline `gtag` bootstrap). `publish` also attaches it on first use.
 */
export function initAnalytics(): void {
  ensureGaForwarder();
}
