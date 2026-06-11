/**
 * Blog article detail — design inventory and data contract (ARTICLE.md Iteration 1).
 *
 * Source of truth for in-scope markup: `Klika Articulo - standalone.html`
 * (`<div class="article-banner">` through end of `<div class="related-grid">`).
 *
 * Out of scope (do not port): `<nav class="topnav">`, `<footer class="kfooter">`,
 * contact panel / overlay (`.contact-panel`, `.panel-overlay`), standalone scripts,
 * decorative `.deco` blobs inside `<main class="article">`.
 *
 * Section order (semantic regions):
 *   1. `article-banner` — full-bleed hero (image or placeholder)
 *   2. `<main class="article">` column (~720px):
 *      a. breadcrumb — Blog → /blog/, current = category
 *      b. article-meta — category · date · reading time
 *      c. h1.article-title
 *      d. article-tags — tag pills
 *      e. blog-article-lead — lead paragraph (coral border)
 *      f. article-body — MDX/Markdown slot
 *      g. hr.divider
 *      h. author — avatar + name + mailto
 *      i. section.cta-banner — contextual CTA
 *      j. h3.related-head + div.related-grid (2 related-card links)
 *
 * Primary touchpoints (Iterations 2–5):
 *   - `src/layouts/BlogPostLayout.astro` — article shell inside BaseLayout
 *   - `src/pages/blog/[slug].astro` — resolve props, related posts, reading time
 *   - `src/content.config.ts` — extended blog collection schema
 *   - `src/components/blog/BlogArticleBanner.astro` — hero / placeholder
 *   - `src/components/blog/BlogArticleLead.astro` — lead paragraph
 *   - `src/components/blog/BlogArticleHeader.astro` — breadcrumb, meta, title, tags
 *   - `src/components/blog/BlogArticleAuthor.astro` — author block
 *   - `src/components/blog/BlogRelatedPosts.astro` — “Seguí leyendo” grid
 *   - `src/lib/blog-article.ts` — reading time, category, related-post resolution
 *   - `src/data/blogImageContract.ts` — image bundle id, asset mapping (BLOG_IMAGES.md)
 *
 * Design token → Tailwind mapping:
 *   --oscuro (#1E2A1A)      → text-klika-dark
 *   --ink (#3A4A36)         → text-klika-ink
 *   --texto (#3A4A36)       → text-klika-ink
 *   --verde (#4A6741)       → text-klika-moss / bg-klika-moss
 *   --crema-verde (#F2F5EE)  → bg-klika-cream
 *   --crema (#F2F5EE)       → bg-klika-cream
 *   --coral (#F26A3A)       → text-klika-coral / bg-klika-coral
 *   --gris-suave (#8A9A85)  → text-klika-muted / text-klika-muted2
 *   --divisor               → border-klika-moss/10
 *   Card elevation          → shadow-card / hover:shadow-cardHover
 *
 * Standalone reference copy (Klika Articulo sample):
 *   title: Por qué tu curso online no engancha (y cómo resolverlo)
 *   category: Diseño instruccional
 *   related: Objetivos de aprendizaje… · El proyecto integrador…
 */

/** Default article CTA copy — override per post via MDX `ctaDescription` / `ctaButtonLabel`. */
export const blogArticleCtaDefaults = {
  title: '¿Querés diseñar una formación que deje huella?',
  description: 'En Klika diseñamos desde esas preguntas. Contanos sobre tu proyecto.',
  buttonLabel: 'Hablemos'
} as const;

/** Standalone `h3.related-head` label. */
export const blogRelatedSectionTitle = 'Seguí leyendo' as const;

/** Default author block when frontmatter omits overrides. */
export const blogAuthorDefaults = {
  authorName: 'Equipo Klika',
  authorEmail: 'hola@byklika.com',
  avatarInitial: 'K'
} as const;

/** Breadcrumb root segment label + href. */
export const blogBreadcrumbRoot = {
  label: 'Blog',
  href: '/blog/'
} as const;

/** Fallback category when `category` and `tags` are both empty. */
export const blogCategoryFallback = 'Blog' as const;

/** Words-per-minute for auto reading-time when `readingTimeMinutes` is unset. */
export const blogReadingTimeWpm = 200;

/**
 * Placeholder related entries from standalone (until real posts or `relatedSlugs` exist).
 * Maps to compact `related-card` cells — not full index cards.
 */
export type BlogRelatedPlaceholder = {
  slug: string;
  category: string;
  title: string;
};

export const blogRelatedPlaceholders: BlogRelatedPlaceholder[] = [
  {
    slug: 'objetivos-de-aprendizaje-como-escribir-los-que-importan',
    category: 'Diseño instruccional',
    title: 'Objetivos de aprendizaje: cómo escribir los que de verdad importan'
  },
  {
    slug: 'el-proyecto-integrador-por-que-cerramos-sin-examen',
    category: 'Experiencia formativa',
    title: 'El proyecto integrador: por qué cerramos sin examen'
  }
];

/** Banner placeholder mono caption (standalone `.banner-ph`). */
export const blogHeroPlaceholderCaption = 'Foto editorial · 85mm · luz natural';

/** Standalone `.article-banner` block height (px). Bottom border sits inside this box (`border-box`). */
export const blogArticleBannerHeightPx = 220;

/** Cream panel overlap (px) — content `margin-top` = banner height − this; inner padding = this. */
export const blogArticleContentOverlapPx = 48;
