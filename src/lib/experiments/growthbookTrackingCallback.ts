import type { TrackingCallback } from '@growthbook/growthbook';
import { publish } from '~/lib/analytics/bus';

/** Forwards GrowthBook exposure events through the analytics bus (GA4 subscriber handles `gtag`). */
export const growthbookTrackingCallback: TrackingCallback = (experiment, result) => {
  publish({
    name: 'experiment_viewed',
    params: {
      experiment_id: experiment.key,
      variation_id: result.key,
      ...(import.meta.env.DEV ? { debug_mode: true as const } : {})
    }
  });
};
