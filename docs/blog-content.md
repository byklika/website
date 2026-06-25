# Blog content — MDX authoring

Deep reference for adding and editing blog posts. Summary and contracts: [`docs/AI-README.md`](AI-README.md).

---

## Collection loader and folder convention

Posts live in the **`blog`** content collection:

| Item   | Location                                                                                   |
| ------ | ------------------------------------------------------------------------------------------ |
| Loader | `src/content.config.ts` → `glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' })` |
| Files  | `src/content/blog/{category-folder}/{slug}.mdx`                                            |
| Route  | `src/pages/blog/[...slug].astro` — **do not edit `getStaticPaths` manually**               |

**Category folder** is derived from frontmatter `category` via `categoryFolderSlug()` in `src/lib/blog-card.ts`:

- `"Diseño instruccional"` → `diseno-instruccional`
- Accents stripped, lowercase, non-alphanumeric → `-`

**Entry id** = `{category-folder}/{slug}` (matches file path without extension).

**Public URL:** `/blog/{entry.id}/` (trailing slash required).

Example:

```
File:  src/content/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo.mdx
Id:    diseno-instruccional/completaste-el-curso-pero-aprendiste-algo
URL:   /blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo/
```

---

## Frontmatter reference

Schema: `src/content.config.ts`. All fields below are validated at build time.

| Field                | Type             | Required | Default            | Purpose                                                               |
| -------------------- | ---------------- | -------- | ------------------ | --------------------------------------------------------------------- |
| `title`              | string           | yes      | —                  | H1 + SEO title (`{title} — Klika`)                                    |
| `description`        | string           | yes      | —                  | Meta description + JSON-LD; keep answer-shaped for GEO                |
| `lead`               | string           | no       | —                  | Lead paragraph above body (`.blog-article-lead`)                      |
| `pubDate`            | date             | yes      | —                  | Publication date; index sort key                                      |
| `updatedDate`        | date             | no       | —                  | Optional; sitemap `lastmod` when set                                  |
| `draft`              | boolean          | no       | `false`            | `true` → excluded from static routes                                  |
| `tags`               | string[]         | no       | `[]`               | Tag pills; fallback for category display                              |
| `category`           | string           | no       | —                  | Breadcrumb + meta `.cat`; drives folder name when creating file       |
| `readingTimeMinutes` | int              | no       | auto               | Override auto word-count (200 WPM)                                    |
| `heroImage`          | string           | no       | —                  | Explicit image path override (see [`blog-images.md`](blog-images.md)) |
| `cardImageAlt`       | string           | no       | contract default   | Alt for card/banner/related images                                    |
| `heroImagePosition`  | string \| object | no       | —                  | CSS `object-position` crop (see [`blog-images.md`](blog-images.md))   |
| `authorName`         | string           | no       | `Equipo Klika`     | Author block                                                          |
| `authorEmail`        | email            | no       | `hola@byklika.com` | Author mailto                                                         |
| `relatedSlugs`       | string[]         | no       | auto               | Max 2 manual related posts                                            |
| `ctaDescription`     | string           | no       | contract default   | Article CTA body copy                                                 |
| `ctaButtonLabel`     | string           | no       | `Hablemos`         | Article CTA button                                                    |

### Example frontmatter

```yaml
---
title: 'Completaste el curso, pero… ¿aprendiste algo?'
description: 'Completar un curso no garantiza aprendizaje. Reflexionamos sobre diseño instruccional y qué hacer cuando la formación no deja huella.'
pubDate: 2026-06-09T12:00:00-03:00
category: 'Diseño instruccional'
readingTimeMinutes: 5
tags:
  - Aprendizaje significativo
  - Experiencia formativa
cardImageAlt: 'Persona reflexionando en un escritorio · foto editorial · luz natural'
heroImagePosition: center 35%
lead: 'Terminar un curso y aprender son dos cosas distintas.'
ctaDescription: 'En Klika diseñamos desde esas preguntas. Escribinos.'
---
```

Real file: `src/content/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo.mdx`.

---

## Draft vs published

| `draft`                                                | Build behavior                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `true` (or omitted default `false` with explicit true) | **No static HTML** — omitted from `getCollection('blog', ({ data }) => !data.draft)` |
| `false`                                                | Route generated; appears in sitemap; included in blog index after placeholder regen  |

Always set `draft: false` only when the post is ready to publish (copy, images, frontmatter complete).

---

## Body fields: lead, category, tags, related, CTA

| Concern                             | Where it renders          | Notes                                                                  |
| ----------------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| `lead`                              | `BlogArticleLead.astro`   | Optional; coral-bordered intro above MDX body                          |
| `category`                          | Breadcrumb, meta row      | Fallback: first tag, then `"Blog"`                                     |
| `tags`                              | Tag pills under title     | Also used for auto related-post scoring                                |
| `relatedSlugs`                      | `BlogRelatedPosts` footer | Accepts `post-slug`, `category/post-slug`, or full entry id            |
| `ctaDescription` / `ctaButtonLabel` | `BlogArticleCta`          | Defaults: `src/data/blogArticleContract.ts` → `blogArticleCtaDefaults` |

**Related posts resolution** (`src/lib/blog-article.ts`):

1. Explicit `relatedSlugs` (order preserved, max 2)
2. Auto-pick: same category (+2 score), shared tags (+1 each), newest first

---

## MDX body conventions

### Heading hierarchy

- One `h1` comes from layout (`BlogArticleHeader`) — **do not add `#` in MDX**
- Use `##` for major sections, `###` for subsections
- Prose styled via Tailwind typography on `.article-body`

### Internal links

Use trailing slashes and full blog path:

```markdown
[Otro artículo](/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo/)
```

### Allowed components

Import Astro components explicitly in MDX:

```mdx
import Callout from '~/components/Callout.astro';

<Callout variant="info" title="Nota">
  Texto del callout.
</Callout>
```

| Component       | Variants / notes                                        |
| --------------- | ------------------------------------------------------- |
| `Callout.astro` | `info`, `warning`, `error`, `success`; optional `title` |

No global MDX component registry — **import each component** at the top of the file. Do not use arbitrary JSX or client-side scripts in MDX.

### Language

All body copy is **Spanish**. Match tone of existing posts (professional, direct, second-person plural where appropriate).

---

## URL slug ↔ file path rules

| Rule             | Detail                                                       |
| ---------------- | ------------------------------------------------------------ |
| Slug = filename  | `{slug}.mdx` basename becomes URL segment (not `title`)      |
| Category folder  | Must match `categoryFolderSlug(category)` from frontmatter   |
| No manual routes | `[...slug].astro` maps all non-draft entries automatically   |
| `relatedSlugs`   | Can omit category prefix if slug is unique across collection |

**Creating a new post in "diseño instruccional":**

1. Compute folder: `diseno-instruccional`
2. Pick slug: e.g. `mi-nuevo-articulo`
3. Create: `src/content/blog/diseno-instruccional/mi-nuevo-articulo.mdx`
4. Resulting URL: `/blog/diseno-instruccional/mi-nuevo-articulo/`

---

## End-to-end workflow

```
1. Create MDX file under src/content/blog/{category}/{slug}.mdx
2. Fill frontmatter (draft: true while drafting)
3. Write body (## headings, optional Callout imports)
4. Add hero master PNG → see docs/blog-images.md
5. Run pnpm optimize:blog
6. Set heroImagePosition if crop needs adjustment
7. Set draft: false
8. Run pnpm generate:blog-placeholders  (refreshes blog index cards)
9. pnpm dev → verify article + index card
10. pnpm typecheck && pnpm test && pnpm build
11. Open PR
```

### After publish checklist

- [ ] Article loads at expected URL with trailing slash
- [ ] Hero image or placeholder renders (not broken `<img>`)
- [ ] Meta title pattern: `{title} — Klika`
- [ ] Related posts section shows up to 2 cards
- [ ] Blog index lists the post (newest first by `pubDate`)

---

## Related files

| Contract / file                                                         | Role                     |
| ----------------------------------------------------------------------- | ------------------------ |
| [`src/content.config.ts`](../src/content.config.ts)                     | Frontmatter schema       |
| [`src/data/blogArticleContract.ts`](../src/data/blogArticleContract.ts) | CTA defaults, breadcrumb |
| [`src/data/blogPlaceholders.ts`](../src/data/blogPlaceholders.ts)       | Generated index cards    |

← Back to [`docs/AI-README.md`](AI-README.md)
