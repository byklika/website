/// <reference types="astro/client" />

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    /** Set by homepage inline guard when popup was already dismissed. */
    __SKIP_EMAIL_SIGNUP_POPUP__?: boolean;
  }
}

export {};
