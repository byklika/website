/**
 * Blog index — placeholder dataset and design contracts (Iteration 1).
 *
 * `blogPlaceholders` is generated from MDX frontmatter — run `pnpm generate:blog-placeholders`.
 * Entries are ordered by `pubDate` descending.
 *
 * Source of truth for in-scope markup: `Klika Blog - standalone.html` line 180
 * (`<main class="page">` only):
 *   - `<header class="blog-head">` — H1 + lead
 *   - `<section class="grid">` — `<article class="card">` cells
 *   - `<section class="cta-banner">` — bottom CTA
 *
 * Primary touchpoints:
 *   - `src/pages/blog/index.astro`
 *   - `src/components/blog/BlogArticleCard.astro`
 *   - `src/components/blog/BlogIndexSection.astro`
 *   - `scripts/generate-blog-placeholders.mjs` — regenerates this file
 */

/** Placeholder article shape — mirrors standalone card fields until real posts ship. */
export type BlogPlaceholderEntry = {
  /** URL segment when a post exists; placeholders have no live detail pages yet. */
  slug: string;
  /** Standalone `data-tema` / `.cat` */
  category: string;
  /** Standalone `.card-title` */
  title: string;
  /** Card excerpt — same field as MDX frontmatter `lead`. */
  lead: string;
  /** Standalone `.card-tag` values */
  tags: string[];
  /** Standalone `.date` — stored as Date for locale formatting in components */
  pubDate: Date;
  /** Standalone `.ph-text` caption on image placeholder */
  imageAlt?: string;
  /**
   * Responsive image bundle id (basename only, no extension) when placeholders
   * should show real photos before MDX posts exist — same shape as `entry.id`.
   */
  heroImageSlug?: string;
};

/** Blog index intro copy from `<header class="blog-head">`. */
export const blogIndexIntro = {
  title: 'Blog',
  lead: 'Ideas, recursos y reflexiones sobre e-learning y diseño instruccional.'
} as const;

/** CTA banner copy from `<section class="cta-banner">`. */
export const blogIndexCta = {
  title: '¿Querés recibir las novedades primero?',
  description: 'Escribinos y te avisamos cuando publiquemos nuevos artículos.',
  /** Design uses "Contactanos"; align with site-wide label in Iteration 3 if Product decides. */
  buttonLabel: 'Contactanos'
} as const;

/**
 * Blog index cards — generated from MDX under src/content/blog/, pubDate DESC.
 * Regenerate: `pnpm generate:blog-placeholders`
 */
export const blogPlaceholders: BlogPlaceholderEntry[] = [
  {
    slug: 'completaste-el-curso-pero-aprendiste-algo',
    category: 'Diseño instruccional',
    title: 'Completaste el curso, pero… ¿aprendiste algo?',
    lead: 'Terminar un curso y aprender son dos cosas distintas. La diferencia no siempre está en el contenido.',
    tags: ['Aprendizaje significativo', 'Experiencia formativa', 'Diseño de cursos'],
    pubDate: new Date(2026, 5, 9),
    heroImageSlug: 'diseno-instruccional/completaste-el-curso-pero-aprendiste-algo',
    imageAlt: 'Persona reflexionando en un escritorio · foto editorial · luz natural'
  },
  {
    slug: 'como-saber-si-tu-formacion-realmente-funciono',
    category: 'Evaluación del aprendizaje',
    title: '¿Cómo saber si tu formación realmente funcionó?',
    lead: 'El porcentaje de finalización no cuenta toda la historia. La evidencia del aprendizaje vive en otro lado.',
    tags: ['Evaluación', 'Diseño Instruccional', 'Impacto formativo'],
    pubDate: new Date(2026, 5, 9),
    heroImageSlug: 'evaluacion-del-aprendizaje/como-saber-si-tu-formacion-realmente-funciono',
    imageAlt: 'Cuaderno con mapas conceptuales y planificación · foto editorial · luz natural'
  },
  {
    slug: 'la-friccion-existe-parte-1',
    category: 'IA en educación',
    title: 'IA en educación: la fricción existe y convivir con ella es parte del trabajo | Parte 1',
    lead: 'Hay un momento que muchos ya conocen: el participante que descubre que una parte del contenido del curso fue generado con IA y siente que lo engañaron. Anticipar ese momento y trabajarlo es parte del diseño.',
    tags: ['Inteligencia artificial', 'Diseño instruccional', 'Contrato didáctico'],
    pubDate: new Date(2026, 5, 9),
    heroImageSlug: 'ia-en-educacion/la-friccion-existe-parte-1',
    imageAlt: 'Persona trabajando en una laptop · foto editorial · luz natural'
  }
];
