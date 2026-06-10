/**
 * JSON-LD entity contract — GEO.md Iteration 3.
 * `sameAs`: Product supplies social profile URLs (see GEO.md Feedback).
 */
export const seoSchemaContract = {
  siteName: 'klika e‑learning studio',
  contactEmail: 'hola@byklika.com',
  logoPath: '/favicon.svg',
  inLanguage: 'es-AR',
  /** Empty until Product confirms LinkedIn / Instagram / other profile URLs. */
  sameAs: [] as string[]
} as const;
