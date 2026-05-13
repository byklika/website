import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  initAnalytics,
  publish,
  resetAnalyticsBusForTests,
  subscribe
} from './bus';
import type { AnalyticsEvent } from './types';

function mockGtag() {
  const gtag = vi.fn();
  vi.stubGlobal('gtag', gtag);
  return gtag;
}

describe('analytics bus', () => {
  beforeEach(() => {
    resetAnalyticsBusForTests();
    vi.unstubAllGlobals();
  });

  it('notifies subscribers when publish is called', () => {
    mockGtag();
    const received: AnalyticsEvent[] = [];
    subscribe((e) => received.push(e));

    publish({
      name: 'contact_form_submit',
      params: { form_location: 'sheet' }
    });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({
      name: 'contact_form_submit',
      params: { form_location: 'sheet' }
    });
  });

  it('unsubscribe stops further notifications', () => {
    mockGtag();
    const spy = vi.fn();
    const off = subscribe(spy);

    publish({
      name: 'nav_item_click',
      params: {
        experiment_key: 'k',
        variant: '0',
        label_shown: 'L',
        href: '/nosotras'
      }
    });
    expect(spy).toHaveBeenCalledTimes(1);

    spy.mockClear();
    off();

    publish({
      name: 'nav_item_click',
      params: {
        experiment_key: 'k',
        variant: '1',
        label_shown: 'L',
        href: '/nosotras'
      }
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('continues to other subscribers when one throws', () => {
    mockGtag();
    const spy = vi.fn();
    subscribe(() => {
      throw new Error('boom');
    });
    subscribe(spy);

    publish({
      name: 'contact_cta_click',
      params: { placement: 'header', sheet_id: 'contact-sheet' }
    });

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('forwards to gtag when present', () => {
    const gtag = mockGtag();

    publish({
      name: 'experiment_viewed',
      params: { experiment_id: 'exp-a', variation_id: '1' }
    });

    expect(gtag).toHaveBeenCalledWith('event', 'experiment_viewed', {
      experiment_id: 'exp-a',
      variation_id: '1'
    });
  });

  it('initAnalytics attaches GA forwarder before first publish', () => {
    const gtag = mockGtag();
    initAnalytics();

    publish({
      name: 'contact_form_submit',
      params: { form_location: 'inline' }
    });

    expect(gtag).toHaveBeenCalledWith('event', 'contact_form_submit', {
      form_location: 'inline'
    });
  });
});
