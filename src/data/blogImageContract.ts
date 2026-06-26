/**
 * Blog images — asset inventory and naming contract (BLOG_IMAGES.md Iteration 1).
 *
 * Slug-as-id: image bundle basename = blog `entry.id` or placeholder `slug`
 * (persistent route id, not display title). Includes category folder when posts
 * live under `src/content/blog/{category}/{article}.mdx`, e.g.
 * `onboarding-que-funciona`.
 *
 * Folder layout (mirror homepage hero pipeline):
 *   - Masters (not served): `src/assets/images/blog/{entryId}-original.png`
 *     (nested id → nested path: `.../blog/diseno-instruccional/foo-original.png`)
 *   - Derivatives (served):   `public/images/blog/{entryId}-{width}w.{avif,webp,jpg}`
 *   - Public URL base:        `/images/blog/{entryId}`
 *
 * Image resolution (Iteration 3+):
 *   - Default: derive bundle from `entry.id` when `{entryId}-original.png` exists.
 *   - Override: optional frontmatter `heroImage` (explicit `/images/blog/...` path).
 *   - Alt text: optional `cardImageAlt`; fallback {@link blogImageDefaultAlt}.
 *
 * Primary touchpoints (Iterations 2–5):
 *   - `src/assets/images/blog/` — source masters
 *   - `public/images/blog/` — optimized derivatives
 *   - `scripts/optimize-hero-images.sh` or `scripts/optimize-blog-images.sh`
 *   - `src/lib/blog-image.ts` — responsive `<picture>` props (Iteration 3)
 *   - `src/components/blog/BlogResponsiveImage.astro` (Iteration 4)
 *   - `BlogArticleCard.astro`, `BlogArticleBanner.astro`, `BlogRelatedCard.astro`
 *   - `src/lib/blog-card.ts`, `src/pages/blog/[...slug].astro`, `src/content/blog/` MDX posts
 *   - `src/data/blogPlaceholders.ts` — optional `heroImageSlug` on placeholders
 *
 * Root sources moved in Iteration 2 — regenerate with `pnpm optimize:blog`.
 */

import { blogHeroPlaceholderCaption } from '~/data/blogArticleContract';

/** Default alt when `cardImageAlt` / `imageAlt` omitted. */
export const blogImageDefaultAlt = blogHeroPlaceholderCaption;

/** Card-friendly widths — keep in sync with `scripts/optimize-blog-images.sh` (Iteration 2). */
export const blogImageWidths = [400, 480, 640, 720, 960, 1280, 1920, 2560, 3840] as const;

export type BlogImageWidth = (typeof blogImageWidths)[number];

/** `sizes` presets for responsive downloads (Iteration 3). */
export const blogImageSizesPresets = {
  /** Blog index grid — cap slot width so mobile/tablet do not over-fetch 960w AVIF */
  card: '(min-width: 921px) min(33vw, 22rem), (min-width: 561px) min(50vw, 22rem), min(100vw, 22rem)',
  /** Full-bleed article banner */
  banner: '100vw',
  /** Related posts — 2 → 1 columns */
  related: '(min-width: 768px) 50vw, 100vw'
} as const;

export type BlogImageSizesPreset = keyof typeof blogImageSizesPresets;

/** Master filename suffix under `src/assets/images/blog/`. */
export const blogImageMasterSuffix = '-original.png';

/** Derivative filename pattern: `{entryId}-{width}w.{ext}` under `public/images/blog/`. */
export const blogImageDerivativeExts = ['avif', 'webp', 'jpg'] as const;

export type BlogImageSourceMapping = {
  /** Root PNG awaiting move (Iteration 2). */
  sourceFile: string;
  /** Target `entry.id` / bundle basename (category folder included when applicable). */
  entryId: string;
  /** Intended surfaces once wired. */
  use: ('article-banner' | 'index-card' | 'related-card' | 'og')[];
  /** Product sign-off before move/rename. */
  status: 'proposed' | 'confirmed';
  notes: string;
};

/**
 * Proposed image → post mapping for Product sign-off.
 * Do not move/rename root PNGs until flagship row is `confirmed`.
 */
export const blogImageAssetMapping: BlogImageSourceMapping[] = [
  {
    sourceFile: 'art 1_sin marca de agua.png',
    entryId: 'diseno-instruccional/completaste-el-curso-pero-aprendiste-algo',
    use: ['article-banner', 'index-card', 'related-card', 'og'],
    status: 'confirmed',
    notes: 'Reflective learner at desk — “Completaste el curso, pero… ¿aprendiste algo?”.'
  },
  {
    sourceFile: 'art 2_sin marca de agua.png',
    entryId: 'evaluacion-del-aprendizaje/como-saber-si-tu-formacion-realmente-funciono',
    use: ['article-banner', 'index-card', 'related-card', 'og'],
    status: 'confirmed',
    notes: 'Notebook / planning — “¿Cómo saber si tu formación realmente funcionó?”.'
  },
  {
    sourceFile: 'art 3_sin marca de agua.png',
    entryId: 'ia-en-educacion/la-friccion-existe-parte-1',
    use: ['article-banner', 'index-card', 'related-card', 'og'],
    status: 'confirmed',
    notes: 'Focused work at laptop — “IA en educación: la fricción existe… | Parte 1”.'
  }
];

/** Relative master path from repo root for a given entry id. */
export function blogImageMasterPath(entryId: string): string {
  return `src/assets/images/blog/${entryId}${blogImageMasterSuffix}`;
}

/** Public URL path prefix for derivatives (no trailing slash). */
export function blogImagePublicBase(entryId: string): string {
  return `/images/blog/${entryId.replace(/^\/+|\/+$/g, '')}`;
}
