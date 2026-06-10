/**
 * On-page SEO contract — GEO.md Iteration 4.
 * Title pattern: `{Page topic} — Klika` (articles: `{post title} — Klika` in BlogPostLayout).
 */
import { blogIndexIntro } from '~/data/blogPlaceholders';

export const SEO_TITLE_SUFFIX = ' — Klika';

/** Fallback og:image until Product supplies a 1200×630 default asset (see GEO.md Feedback). */
export const SEO_DEFAULT_OG_IMAGE = '/favicon.svg';

/** Single locale today — no hreflang until a second locale ships. */
export const SEO_HTML_LANG = 'es';
export const SEO_OG_LOCALE = 'es_AR';

/**
 * Default meta description when a page omits `description` on BaseLayout.
 * Indexable routes should pass an explicit description from `seoPageMeta` below.
 */
export const SEO_SITE_DEFAULT_DESCRIPTION =
  'e‑learning studio — experiencias educativas que dejan huella.';

export function formatSeoTitle(pageTopic: string): string {
  return `${pageTopic}${SEO_TITLE_SUFFIX}`;
}

export function formatArticleSeoTitle(articleTitle: string): string {
  return formatSeoTitle(articleTitle);
}

export function formatBlogPaginationTitle(page: number): string {
  return formatSeoTitle(`Blog — página ${page}`);
}

/** Locked title + description for each indexable static route. */
export const seoPageMeta = {
  home: {
    title: formatSeoTitle('klika e‑learning studio'),
    description:
      'Experiencias educativas que dejan huella. Diseñamos para que educadores y aprendices sientan que valió la pena.'
  },
  blog: {
    title: formatSeoTitle('Blog'),
    description: blogIndexIntro.lead
  },
  servicios: {
    title: formatSeoTitle('Servicios'),
    description:
      'Diseño instruccional, desarrollo e-learning y acompañamiento para equipos educativos.'
  },
  metodologia: {
    title: formatSeoTitle('Metodología'),
    description:
      'Un recorrido claro: diagnóstico, diseño, producción y cierre con entregables listos para usar.'
  },
  nosotras: {
    title: formatSeoTitle('Nosotras'),
    description:
      'Equipo de diseño instruccional y producción e-learning con foco en experiencias memorables.'
  }
} as const;
