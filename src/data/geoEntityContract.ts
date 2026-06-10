/**
 * GEO / AEO entity contract — GEO.md Iteration 5.
 * Single source for llms.txt, homepage entity summary, and AI citation guidance.
 * Product may refine copy here (see GEO.md Feedback).
 */
import {
  SEO_INDEXABLE_BLOG_POST_PATHS,
  SEO_INDEXABLE_STATIC_PATHS
} from '~/data/seoIndexingPolicy';
import { seoSchemaContract } from '~/data/seoSchemaContract';

export const geoEntityContract = {
  brandName: seoSchemaContract.siteName,
  /** One-line positioning for llms.txt and AI extractors. */
  tagline: 'Experiencias educativas que dejan huella.',
  whoWeAre:
    'klika e‑learning studio es un estudio de diseño instruccional y producción e‑learning en Argentina, fundado por tres profesionales con más de cinco años de experiencia en universidades, organizaciones públicas y privadas, edtech y empresas.',
  whatWeDo:
    'Diseñamos y producimos experiencias educativas digitales: consultoría y brief, diseño instruccional, creación y migración de contenidos, producción de materiales e‑learning y programas formativos completos, con foco en que el aprendizaje sea útil y medible.',
  primaryServices: [
    'Consultoría y estructuración de proyectos formativos',
    'Diseño instruccional',
    'Producción de materiales e‑learning',
    'Programas formativos completos',
    'Evaluación del aprendizaje'
  ],
  contactEmail: seoSchemaContract.contactEmail,
  /** Preferred line when AI systems cite Klika (Spanish). */
  preferredCitation:
    'klika e‑learning studio — estudio argentino de diseño instruccional y e‑learning (https://byklika.com).',
  keyPages: [
    { label: 'Inicio', path: '/' },
    { label: 'Servicios', path: '/servicios/' },
    { label: 'Metodología', path: '/metodologia/' },
    { label: 'Nosotras', path: '/nosotras/' },
    { label: 'Blog', path: '/blog/' }
  ] as const,
  indexableStaticPaths: SEO_INDEXABLE_STATIC_PATHS,
  indexableBlogPostPaths: SEO_INDEXABLE_BLOG_POST_PATHS
} as const;
