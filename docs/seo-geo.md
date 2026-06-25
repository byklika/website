# SEO & GEO — agent summary

Agent-oriented reference for on-page SEO, structured data, sitemap, and AI discoverability.

Overview: [`docs/AI-README.md`](AI-README.md).

---

## Canonical and indexing policy

**Source of truth:** `src/data/seoIndexingPolicy.ts`

| Constant                     | Value                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| `SEO_DEFAULT_SITE_ORIGIN`    | `https://byklika.com`                                       |
| `SEO_TRAILING_SLASH_POLICY`  | `'always'`                                                  |
| `SEO_INDEXABLE_STATIC_PATHS` | `/`, `/servicios/`, `/metodologia/`, `/nosotras/`, `/blog/` |

**Astro config** (`astro.config.mjs`):

```js
site: process.env.PUBLIC_SITE_URL || 'https://byklika.com',
trailingSlash: 'always',
```

### Exclusions (sitemap / indexation)

- `draft: true` blog posts — no static HTML
- Hash-only URLs (`/#metodologia`) — nav targets, not sitemap entries
- Preview hosts — set `PUBLIC_SITE_URL` per deploy target
- No API routes today (except prerendered `llms.txt`, `robots.txt`)

### Blog pagination

- Page 1 canonical: `/blog/`
- Page N: `/blog/page/{n}/` (only when `lastPage > 1`)
- Logic: `src/lib/blog-pagination.ts` (`BLOG_PAGE_SIZE = 10`)

---

## On-page meta

**Contract:** `src/data/seoOnPageContract.ts`

| Export                            | Purpose                                              |
| --------------------------------- | ---------------------------------------------------- |
| `SEO_TITLE_SUFFIX`                | ` — Klika`                                           |
| `formatSeoTitle(pageTopic)`       | Static pages                                         |
| `formatArticleSeoTitle(title)`    | Blog articles                                        |
| `seoPageMeta`                     | Locked title + description per static route          |
| `SEO_HTML_LANG` / `SEO_OG_LOCALE` | `es` / `es_AR`                                       |
| `SEO_DEFAULT_OG_IMAGE`            | `/favicon.svg` until Product supplies 1200×630 asset |
| `SEO_SITE_DEFAULT_DESCRIPTION`    | Fallback when page omits description                 |

### Wiring in layouts

**`BaseLayout.astro`** emits:

- `<title>`, `<meta name="description">`
- `<link rel="canonical">` from current pathname + `Astro.site`
- Open Graph + Twitter cards
- Optional `noindex`

**Static pages** pass meta from `seoPageMeta`:

```astro
import {seoPageMeta} from '~/data/seoOnPageContract';

<BaseLayout title={seoPageMeta.servicios.title} description={seoPageMeta.servicios.description} />
```

**Blog articles** — `BlogPostLayout.astro` uses `formatArticleSeoTitle(title)` and post `description`.

### Editing homepage SEO title

Change `seoPageMeta.home` in `seoOnPageContract.ts` — **not** hardcoded strings in `index.astro`.

---

## JSON-LD structured data

### Contracts and builders

| File                              | Role                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/data/seoSchemaContract.ts`   | Entity name, logo, email, `sameAs`, `inLanguage`                                                       |
| `src/lib/seo/schema.ts`           | `buildOrganizationSchema`, `buildWebSiteSchema`, `buildBlogPostingSchema`, `buildBlogBreadcrumbSchema` |
| `src/components/seo/JsonLd.astro` | Renders `<script type="application/ld+json">`                                                          |

### Schemas by layout

| Layout / page                       | JSON-LD types                     |
| ----------------------------------- | --------------------------------- |
| **All pages** (`BaseLayout`)        | `Organization`, `WebSite`         |
| **Blog article** (`BlogPostLayout`) | + `BlogPosting`, `BreadcrumbList` |

Extra nodes: pass `jsonLd` prop to `BaseLayout`.

### `sameAs` social URLs

`seoSchemaContract.sameAs` is **empty until Product confirms** profile URLs. Do not invent LinkedIn/Instagram links.

---

## GEO entity and llms.txt

**Contract:** `src/data/geoEntityContract.ts`

Contains: brand name, tagline, who/what copy, primary services, key pages, indexable paths, preferred citation line.

### `/llms.txt` route

| Item      | Detail                                                        |
| --------- | ------------------------------------------------------------- |
| File      | `src/pages/llms.txt.ts`                                       |
| Builder   | `src/lib/seo/llms-txt.ts` → `buildLlmsTxt(origin)`            |
| Content   | Generated from `geoEntityContract` — edit contract, not route |
| Prerender | `prerender = true`                                            |

Machine-readable summary for AI crawlers: who Klika is, services, key URLs, citation guidance.

### Visible entity copy on site

| Surface                  | Source                                                                |
| ------------------------ | --------------------------------------------------------------------- |
| **`/llms.txt`**          | `geoEntityContract.ts` via `buildLlmsTxt()`                           |
| **Homepage `#nosotras`** | `AboutUs.astro` — human-readable positioning (props in `index.astro`) |

Keep homepage copy and `geoEntityContract` aligned when updating brand narrative. There is no separate GEO summary component — edit the contract for machine-readable text and `#nosotras` / `index.astro` for on-page copy.

---

## Sitemap and robots.txt

### Sitemap

**Integration:** `@astrojs/sitemap` in `astro.config.mjs`

- Emits `sitemap-index.xml` → `sitemap-0.xml`
- Filters hash URLs
- **`lastmod` for blog posts:** `src/lib/seo/sitemap-lastmod.mjs` reads MDX `updatedDate` ?? `pubDate`

### robots.txt

**File:** `src/pages/robots.txt.ts`

```
User-agent: *
Allow: /

Sitemap: {origin}/sitemap-index.xml
```

Origin from `Astro.site` at build time.

---

## `PUBLIC_SITE_URL` behavior

| Context        | Effect                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------- |
| Unset at build | Defaults to `https://byklika.com`                                                           |
| Preview deploy | Set to preview URL if canonicals should match preview (usually production URL only on prod) |
| Production     | `https://byklika.com` in Vercel env for production builds                                   |

Canonicals, OG URLs, sitemap `loc`, and `llms.txt` links all derive from `site` origin.

---

## Post-deploy manual steps (Product)

Short checklist — Product sign-off items also belong in an initiative workplan under [`docs/workplans/`](workplans/README.md) when delivery spans multiple PRs.

1. **Google Rich Results Test** — validate Organization + BlogPosting on sample URLs
2. **Google Search Console** — submit `https://byklika.com/sitemap-index.xml`
3. **Spot-check** `/robots.txt`, `/llms.txt`, canonical tags on `/`, `/blog/`, one article
4. **OG debugger** (optional) — confirm title/description/image on share previews

No Search Console access required in code.

---

## Common tasks

| Task                            | Edit                                                           |
| ------------------------------- | -------------------------------------------------------------- |
| Change page title/description   | `seoOnPageContract.ts` → `seoPageMeta`                         |
| Change default site description | `SEO_SITE_DEFAULT_DESCRIPTION`                                 |
| Update AI citation line         | `geoEntityContract.preferredCitation`                          |
| Add indexable static route      | New page + add to `SEO_INDEXABLE_STATIC_PATHS` + `seoPageMeta` |
| Add JSON-LD for new page type   | Extend `schema.ts`; pass `jsonLd` to `BaseLayout`              |
| Update llms.txt content         | `geoEntityContract.ts`                                         |

---

## Related files

| Contract / file                                                     | Role                                |
| ------------------------------------------------------------------- | ----------------------------------- |
| [`src/data/seoOnPageContract.ts`](../src/data/seoOnPageContract.ts) | Titles, descriptions, `seoPageMeta` |
| [`src/data/seoSchemaContract.ts`](../src/data/seoSchemaContract.ts) | JSON-LD entity fields               |
| [`src/data/seoIndexingPolicy.ts`](../src/data/seoIndexingPolicy.ts) | Indexation policy                   |
| [`src/data/geoEntityContract.ts`](../src/data/geoEntityContract.ts) | llms.txt + GEO entity copy          |
| [`src/lib/seo/schema.ts`](../src/lib/seo/schema.ts)                 | JSON-LD builders                    |

← Back to [`docs/AI-README.md`](AI-README.md)
