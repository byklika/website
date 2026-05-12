import type { TrackingCallback } from '@growthbook/growthbook';

/** Forwards GrowthBook exposure events to GA4 when gtag is available. */
export const growthbookTrackingCallback: TrackingCallback = (experiment, result) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'experiment_viewed', {
      experiment_id: experiment.key,
      variation_id: result.key
    });
  }
};
