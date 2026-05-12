/** Payload shapes keyed by GA4 event name (or internal name before mapping). */
export type AnalyticsEventMap = {
  experiment_viewed: {
    experiment_id: string;
    variation_id: string;
    debug_mode?: boolean;
  };
  nav_item_click: {
    experiment_key: string;
    variant: string;
    label_shown: string;
    href: string;
  };
  contact_cta_click: {
    placement: string;
    sheet_id: string;
  };
  contact_form_submit: {
    form_location: string;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type AnalyticsEvent = {
  [K in AnalyticsEventName]: { name: K; params: AnalyticsEventMap[K] };
}[AnalyticsEventName];

export type AnalyticsSubscriber = (event: AnalyticsEvent) => void;
