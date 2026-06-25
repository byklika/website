/// <reference types="astro/client" />

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    /** Initialized GrowthBook client (`GrowthBook` instance after `init()`). */
    growthbook?: import('@growthbook/growthbook').GrowthBook;
  }
}

export {};
