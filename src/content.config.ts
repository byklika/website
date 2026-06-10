import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  /** Posts live in `src/content/blog/{category-folder}/{slug}.mdx` — see `categoryFolderSlug()`. */
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    /** Meta description + JSON-LD; keep answer-shaped for GEO (see GEO.md Iteration 5). */
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    /** Breadcrumb “here” label + meta `.cat` — fallback: first tag or `"Blog"`. */
    category: z.string().optional(),
    /** Meta “N min de lectura” — fallback: compute from body word count at build time. */
    readingTimeMinutes: z.number().int().positive().optional(),
    /** Explicit hero override; when omitted, bundle id defaults to `entry.id` if master exists (see blogImageContract). */
    heroImage: z.string().optional(),
    /** Card/banner alt override; fallback: `blogImageDefaultAlt` in blogImageContract. */
    cardImageAlt: z.string().optional(),
    /**
     * Article banner crop — CSS `object-position`. Shorthand string sets desktop only
     * (mobile defaults to `center`). Object form: `{ mobile?, desktop? }`.
     * Example: `center 35%` or `{ desktop: 'center 30%' }`.
     */
    heroImagePosition: z
      .union([
        z.string(),
        z.object({
          mobile: z.string().optional(),
          desktop: z.string().optional()
        })
      ])
      .optional(),
    authorName: z.string().default('Equipo Klika'),
    authorEmail: z.string().email().default('hola@byklika.com'),
    /** Manual related posts (max 2) — fallback: auto-pick by category/tags. */
    relatedSlugs: z.array(z.string()).max(2).optional()
  })
});

export const collections = { blog };
