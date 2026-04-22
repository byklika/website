/// <reference types="astro/client" />

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    /** GrowthBook CDN bundle + initialized client (typed loosely; SDK not bundled). */
    growthbook?: unknown;
  }
}

export {};
