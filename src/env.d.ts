/// <reference types="astro/client" />

import type { GrowthBook } from '@growthbook/growthbook';

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
		growthbook?: GrowthBook;
	}
}

export {};
