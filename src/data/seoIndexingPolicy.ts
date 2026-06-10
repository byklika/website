/**
 * SEO + GEO indexing policy — GEO.md Iteration 1 (locked before sitemap/robots code).
 *
 * Canonical origin: `astro.config.mjs` `site` (`PUBLIC_SITE_URL` at build, else below).
 * Trailing slashes: `always` (see `trailingSlash` in Astro config + internal href helpers).
 */

/** Default production origin when `PUBLIC_SITE_URL` is unset at build. */
export const SEO_DEFAULT_SITE_ORIGIN = 'https://byklika.com';

/** Locked trailing-slash policy for sitemap `loc`, canonical, and internal links. */
export const SEO_TRAILING_SLASH_POLICY = 'always' as const;

/**
 * Indexable standalone routes (static `src/pages/`).
 * Hash-only homepage sections (`/#metodologia`, etc.) are navigation targets, not sitemap URLs.
 */
export const SEO_INDEXABLE_STATIC_PATHS = [
  '/',
  '/servicios/',
  '/metodologia/',
  '/nosotras/',
  '/blog/'
] as const;

/**
 * Homepage section IDs reached via `/#…` nav — content also exists on `/` or standalone routes above.
 * Do not add hash URLs to the sitemap.
 */
export const SEO_HOMEPAGE_HASH_SECTIONS = [
  'inicio',
  'metodologia',
  'servicios',
  'nosotras'
] as const;

/**
 * Exclusion rules for sitemap generation and indexation (Iteration 2+).
 * - `draft: true` blog posts: omitted from `getStaticPaths` today — no static HTML.
 * - Preview/staging hosts: set `PUBLIC_SITE_URL` per deploy; production builds use `https://byklika.com`.
 * - No `src/pages/api/` routes today.
 */
export const SEO_SITEMAP_EXCLUDE = {
  draftBlogPosts: true,
  hashFragmentUrls: true,
  nonProductionHosts: 'Use PUBLIC_SITE_URL only on the intended deploy target',
  analyticsAndBuildAssets: true,
  apiRoutes: true
} as const;

/** Blog list pagination: canonical page 1 is `/blog/`; emit `/blog/page/n/` only when `lastPage > 1`. */
export const SEO_BLOG_PAGINATION_NOTE =
  'See `paginateBlogPosts` / `blogListPath` in `src/lib/blog-pagination.ts` (BLOG_PAGE_SIZE = 10).';

/**
 * Indexable blog article paths at Iteration 1 audit (non-draft `src/content/blog/**`).
 * Sitemap generation uses `@astrojs/sitemap` (all built routes) + `src/lib/seo/sitemap-lastmod.mjs` for `lastmod`.
 */
export const SEO_INDEXABLE_BLOG_POST_PATHS = [
  '/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo/',
  '/blog/evaluacion-del-aprendizaje/como-saber-si-tu-formacion-realmente-funciono/',
  '/blog/ia-en-educacion/la-friccion-existe-parte-1/'
] as const;

/** Full URL inventory count at Iteration 1 lock (static + blog posts; no pagination yet). */
export const SEO_INDEXABLE_URL_COUNT =
  SEO_INDEXABLE_STATIC_PATHS.length + SEO_INDEXABLE_BLOG_POST_PATHS.length;
