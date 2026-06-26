import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  EMAIL_SIGNUP_POPUP_DEFAULTS,
  getDocumentScrollRatio,
  hasSeenEmailSignupPopup,
  markEmailSignupPopupSeen,
  readEmailSignupPopupConfig
} from './emailSignupPopupContract';

describe('emailSignupPopupContract', () => {
  const storageKey = EMAIL_SIGNUP_POPUP_DEFAULTS.storageKey;

  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem(key: string) {
        return store[key] ?? null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('tracks seen state in localStorage', () => {
    expect(hasSeenEmailSignupPopup(storageKey)).toBe(false);
    markEmailSignupPopupSeen(storageKey);
    expect(hasSeenEmailSignupPopup(storageKey)).toBe(true);
  });

  it('reads overlay data attributes with defaults', () => {
    const overlay = document.createElement('div');
    overlay.dataset.storageKey = 'custom_key';
    overlay.dataset.openAfterMs = '12000';
    overlay.dataset.openAtScrollRatio = '0.75';
    overlay.dataset.autoCloseMs = '3000';

    expect(readEmailSignupPopupConfig(overlay)).toEqual({
      storageKey: 'custom_key',
      openAfterMs: 12_000,
      openAtScrollRatio: 0.75,
      autoCloseMs: 3_000
    });
  });

  it('computes scroll ratio from document geometry', () => {
    vi.stubGlobal('scrollY', 500);
    vi.stubGlobal('innerHeight', 800);
    Object.defineProperty(document.documentElement, 'scrollTop', {
      configurable: true,
      value: 500
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      configurable: true,
      value: 800
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2_000
    });

    expect(getDocumentScrollRatio()).toBeCloseTo(0.65);
  });
});
