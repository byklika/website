import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bootDeferredAnalytics,
  loadGa4,
  loadClarity,
  onFirstInteraction,
  runWhenIdle
} from './deferredBoot';

describe('deferredBoot', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    delete window.dataLayer;
    delete window.gtag;
    delete (window as Window & { clarity?: unknown }).clarity;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('runWhenIdle falls back to setTimeout when requestIdleCallback is missing', () => {
    const fn = vi.fn();
    runWhenIdle(fn);
    expect(fn).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('runWhenIdle uses requestIdleCallback when available', () => {
    const idle = vi.fn((cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
    });
    vi.stubGlobal('requestIdleCallback', idle);

    const fn = vi.fn();
    runWhenIdle(fn, 3500);

    expect(idle).toHaveBeenCalledWith(fn, { timeout: 3500 });
    expect(fn).toHaveBeenCalledOnce();
  });

  it('onFirstInteraction runs once on the first matching event', () => {
    const fn = vi.fn();
    onFirstInteraction(fn);

    window.dispatchEvent(new Event('scroll', { bubbles: true }));
    window.dispatchEvent(new Event('click', { bubbles: true }));

    expect(fn).toHaveBeenCalledOnce();
  });

  it('loadGa4 appends gtag.js and configures on load', () => {
    loadGa4('G-TEST', { send_page_view: false });

    const script = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    expect(script).toBeTruthy();
    expect(typeof window.gtag).toBe('function');

    script?.dispatchEvent(new Event('load'));
    expect(window.dataLayer?.length).toBeGreaterThan(0);
  });

  it('loadClarity injects the Clarity tag script', () => {
    const anchor = document.createElement('script');
    document.body.appendChild(anchor);

    loadClarity('abc123');

    const script = document.querySelector('script[src*="clarity.ms/tag/abc123"]');
    expect(script).toBeTruthy();
    expect(typeof window.clarity).toBe('function');
  });

  it('bootDeferredAnalytics defers GA until idle callback runs', () => {
    const idle = vi.fn((cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
    });
    vi.stubGlobal('requestIdleCallback', idle);

    bootDeferredAnalytics({
      gaMeasurementId: 'G-TEST',
      gaConfig: { send_page_view: false }
    });

    expect(document.querySelector('script[src*="googletagmanager.com/gtag/js"]')).toBeTruthy();
    expect(idle).toHaveBeenCalled();
  });

  it('bootDeferredAnalytics defers Clarity until first interaction', () => {
    bootDeferredAnalytics({ clarityProjectId: 'clarity-id' });

    expect(document.querySelector('script[src*="clarity.ms"]')).toBeNull();

    window.dispatchEvent(new Event('scroll', { bubbles: true }));

    expect(document.querySelector('script[src*="clarity.ms/tag/clarity-id"]')).toBeTruthy();
  });
});
