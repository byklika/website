import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { scheduleDomIdle } from './scheduleDomIdle';

describe('scheduleDomIdle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('waits for DOMContentLoaded then idle callback', () => {
    const idle = vi.fn((cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
    });
    vi.stubGlobal('requestIdleCallback', idle);

    Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' });

    const fn = vi.fn();
    scheduleDomIdle(fn);

    expect(fn).not.toHaveBeenCalled();

    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(idle).toHaveBeenCalled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('runs on idle immediately when document is already interactive', () => {
    const idle = vi.fn((cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline);
    });
    vi.stubGlobal('requestIdleCallback', idle);

    Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' });

    const fn = vi.fn();
    scheduleDomIdle(fn);

    expect(idle).toHaveBeenCalled();
    expect(fn).toHaveBeenCalledOnce();
  });
});
