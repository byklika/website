# WORKPLAN: SEO + GEO — sitemap, crawlability, and AI discoverability

**Board ask:** Ship **`sitemap.xml`** and **`robots.txt`**, then harden **technical SEO** and **GEO/AEO** signals so search engines and AI answer engines can crawl, index, and cite Klika accurately. Use **`https://byklika.com`** (or `PUBLIC_SITE_URL` / `astro.config.mjs` `site`) as the canonical origin. Include all **indexable static routes** and **published blog posts**; exclude drafts and non-public surfaces. Prefer **official Astro patterns** (`@astrojs/sitemap`, JSON-LD in layout/components) over bespoke crawlers. Do **not** block on Search Console access in code — document submission steps for Product.

---

## Done when

- [x] Production serves **`/sitemap.xml`** (and **`/sitemap-index.xml`** only if needed) listing every canonical, indexable URL with correct absolute `loc` values.
- [x] Production serves **`/robots.txt`** that allows public crawling, blocks nothing critical, and declares `Sitemap: https://byklika.com/sitemap.xml`.
- [x] Every indexable page has a **self-referencing canonical**, unique **title** + **meta description**, and consistent **Open Graph / Twitter** tags via `BaseLayout`.
- [ ] Site-wide and article-level **JSON-LD** (`Organization`, `WebSite`, `Article`, `BreadcrumbList` where applicable) validate in Google Rich Results Test without errors.
- [x] A **GEO baseline** exists: **`/llms.txt`** (or equivalent machine-readable site summary) plus entity-clear copy blocks on key pages so AI systems can identify _who Klika is_, _what they do_, and _where to cite_.

---

## Iteration 1 — URL inventory and indexing policy (lock before code)

- [x] Audit routable pages under `src/pages/`: `/`, `/servicios/`, `/metodologia/`, `/nosotras/`, `/blog/`, `/blog/page/[page]/` (when `lastPage > 1`), `/blog/[...slug]/` for each non-draft entry in `src/content/blog/`.
- [x] Confirm **canonical URL shape** (trailing slash policy): align sitemap `loc`, `<link rel="canonical">`, and internal links — today blog pagination uses trailing slashes in `src/lib/blog-pagination.ts`; pick one policy and apply consistently.
- [x] Lock **exclude list** for sitemap and indexation: `draft: true` posts (already omitted from `getStaticPaths`), dev/preview hosts, analytics-only assets, API routes if any are added later.
- [x] Document **homepage vs standalone routes**: nav uses `/#metodologia` etc., but `/metodologia/` and `/servicios/` are separate URLs — include standalone routes in sitemap; do not add hash-only URLs as sitemap entries.
- [x] Verify `astro.config.mjs` `site` and optional `PUBLIC_SITE_URL` produce correct absolute URLs in build output.

---

## Iteration 2 — Sitemap and robots.txt

- [x] Add **`@astrojs/sitemap`** to `astro.config.mjs` (or implement `src/pages/sitemap.xml.ts` if integration is blocked — prefer the official integration).
- [x] Configure sitemap to emit **only indexable URLs**; set `lastmod` from blog `pubDate` / `updatedDate` where the integration supports custom entries for content collection routes.
- [x] If blog pagination exceeds one page, include `/blog/page/2/` etc.; omit page 1 duplicate if `/blog/` is the canonical first page.
- [x] Add **`public/robots.txt`** (or `src/pages/robots.txt.ts` for dynamic sitemap URL) with:
  - `User-agent: *` + `Allow: /`
  - `Sitemap: https://byklika.com/sitemap.xml` (use `site` origin, not hardcoded env in static file unless generated at build)
- [x] After deploy, Product submits sitemap URL in **Google Search Console** (document URL in PR or internal note — no code dependency).

**Iteration 2 implementation notes:**

- `@astrojs/sitemap` emits `sitemap-index.xml` → `sitemap-0.xml` (8 URLs at audit). `robots.txt` declares `Sitemap: {origin}/sitemap-index.xml` via `src/pages/robots.txt.ts` (build-time `site` / `PUBLIC_SITE_URL`).
- Blog `lastmod`: `src/lib/seo/sitemap-lastmod.mjs` + `serialize()` in `astro.config.mjs` (`updatedDate` ?? `pubDate`).
- **Search Console (Product):** after production deploy, submit `https://byklika.com/sitemap-index.xml` in [Google Search Console](https://search.google.com/search-console) → Sitemaps.

---

## Iteration 3 — Structured data (SEO + GEO shared layer)

- [x] Create `src/components/seo/JsonLd.astro` (or `src/lib/seo/schema.ts` + inline script) to render `<script type="application/ld+json">` blocks.
- [x] **Site-wide** (in `BaseLayout.astro` or `SiteBodyChrome`): `Organization` + `WebSite` with name `klika e‑learning studio`, url `https://byklika.com`, logo, contact (`hola@byklika.com`), `sameAs` array (Product to supply social URLs in **Feedback**).
- [x] **Blog articles** (`BlogPostLayout.astro`): `Article` (or `BlogPosting`) with `headline`, `description`, `datePublished`, `dateModified`, `author`, `image` (use existing `blogImageOgUrl` / hero when present), `publisher` → Organization.
- [x] **Blog articles**: `BreadcrumbList` matching visible breadcrumb in `BlogArticleHeader.astro` (`Blog` → category → title).
- [ ] **Optional P2:** `FAQPage` JSON-LD only where a page has a real FAQ section (homepage or service page) — do not invent FAQs in code without Product copy.

**Iteration 3 implementation notes:**

- `src/data/seoSchemaContract.ts` — site name, email, logo path, `inLanguage`, empty `sameAs[]` until Product supplies URLs.
- `src/lib/seo/schema.ts` — `buildOrganizationSchema`, `buildWebSiteSchema`, `buildBlogPostingSchema`, `buildBlogBreadcrumbSchema`; `resolveSiteOrigin()` uses `Astro.site` / `PUBLIC_SITE_URL` (not hardcoded origin).
- `src/components/seo/JsonLd.astro` — single `<script type="application/ld+json">` per page (array when multiple nodes).
- `BaseLayout.astro` — always emits Organization + WebSite; merges optional `jsonLd` prop from child layouts.
- `BlogPostLayout.astro` — adds BlogPosting + BreadcrumbList per article (hero OG image via `blogImageOgUrl` when present).
- **Build verification (2026-06-09):** homepage → Organization + WebSite; sample article → + BlogPosting + BreadcrumbList with absolute `url` / `image` on `https://byklika.com`.
- **Post-deploy (Product):** run [Google Rich Results Test](https://search.google.com/test/rich-results) on `/` and one blog URL; add `sameAs` in `seoSchemaContract.ts` when social URLs are confirmed.

---

## Iteration 4 — On-page SEO hardening

- [x] Audit **title + meta description** on every indexable route passed through `BaseLayout`; fix language/consistency gaps (e.g. `/blog/page/[page].astro` English description vs Spanish `/blog/` index).
- [x] Ensure each page has **one clear H1** and unique title tag pattern: `{Page topic} — Klika` (articles already use `{title} — Klika`).
- [x] Replace default **`og:image`** fallback (`/favicon.svg`) on marketing pages with a dedicated social share image when Product provides asset; until then document the gap in **Feedback**.
- [x] Add default `<meta name="robots" content="index, follow">` only if needed; rely on `noindex` prop for exceptions — drafts must not generate static routes.
- [x] Add **`hreflang`** only if a second locale ships; for now confirm `<html lang="es">` and `og:locale` `es_AR` in `BaseLayout` are correct for Argentina Spanish positioning.

**Iteration 4 implementation notes:**

- `src/data/seoOnPageContract.ts` — locked title/description per indexable static route; `formatSeoTitle`, `formatArticleSeoTitle`, `formatBlogPaginationTitle`; `SEO_DEFAULT_OG_IMAGE` (`/favicon.svg` until Product asset).
- All static pages import `seoPageMeta`; homepage title aligned to `klika e‑learning studio — Klika`.
- `blog/page/[page].astro` — Spanish description (same lead as `/blog/`); unique title `Blog — página N — Klika` when pagination emits.
- `BlogListSection.astro` — Spanish H1 lead, pagination labels, `es-AR` dates.
- **H1 audit:** one H1 per indexable route (Hero on `/`, section headers on marketing pages, `BlogIndexSection` / `BlogArticleHeader` on blog).
- **Robots:** no explicit `index, follow` meta (default crawlable); `noindex` prop on `BaseLayout` for future exceptions only.
- **Locale:** `SEO_HTML_LANG` = `es`, `SEO_OG_LOCALE` = `es_AR`; no `hreflang` until second locale.
- **OG image gap:** non-article pages still use `SEO_DEFAULT_OG_IMAGE` — Product to supply 1200×630 asset (Feedback).

---

## Iteration 5 — GEO / AEO discoverability (beyond classic SEO)

- [x] Publish **`public/llms.txt`** (or `/llms.txt` route) summarizing: brand name, one-line positioning, primary services, canonical domain, key URLs (`/`, `/servicios/`, `/metodologia/`, `/nosotras/`, `/blog/`), contact email, and preferred citation line for AI systems.
- [x] Add a concise **“Who we are / What we do”** entity block on the homepage (or reuse `#nosotras` copy) using plain language and proper nouns — AI citation favors extractable definitions over marketing fluff alone.
- [x] Ensure blog posts expose **`description`** frontmatter (used as meta + schema); Product to keep first paragraph answer-shaped where possible (GEO: direct response to a likely user question).
- [ ] **Optional fast-follow (agentic):** declare contact-sheet intent for AI agents — e.g. WebMCP declarative attributes on the global contact form per W3C draft (`data-mcp-action`, `data-mcp-description`) when Product prioritizes agent task completion; track separately from citation-focused GEO.
- [x] Document a **manual recheck list** for Product (not dev QA): 5–10 Spanish prompts (e.g. “estudio e-learning Argentina”, “diseño instruccional freelance”) across ChatGPT / Perplexity / Gemini — baseline citation check after launch.

**Iteration 5 implementation notes:**

- `src/data/geoEntityContract.ts` — brand, tagline, who/what copy, services, citation line, key URLs (single source for GEO surfaces).
- `src/lib/seo/llms-txt.ts` + `src/pages/llms.txt.ts` — prerendered `/llms.txt` at build origin (`site` / `PUBLIC_SITE_URL`).
- `src/components/seo/GeoEntitySummary.astro` — visible “Quiénes somos” / “Qué hacemos” block in homepage `#nosotras` (`AboutUs.astro`).
- `src/content.config.ts` — blog `description` required in schema (all published posts already provide it).
- **WebMCP:** not implemented — tracked in Feedback; citation-focused GEO only in this slice.

### Product citation recheck (manual, post-launch)

Run each prompt in **ChatGPT**, **Perplexity**, and **Gemini** after production deploy. Record whether Klika / byklika.com is cited, linked, or absent.

1. ¿Qué es klika e‑learning studio?
2. estudio e‑learning Argentina diseño instruccional
3. diseño instruccional freelance Argentina
4. quién hace cursos e‑learning en Argentina
5. estudio de diseño instruccional Buenos Aires
6. cómo evaluar si una formación online funcionó
7. diseño instruccional para empresas Argentina
8. productora de contenidos e‑learning en español
9. klika byklika estudio educativo
10. experiencias educativas que dejan huella e‑learning

**Pass criteria (baseline):** brand name + `https://byklika.com` appear in at least 2 of 3 engines for prompts 1–5; blog topics may cite articles when relevant.

---

## Out of scope

- Link building, digital PR, paid search, and Search Console performance reporting automation.
- Core Web Vitals remediation (see performance workstreams separately).
- Full WebMCP `/mcp-actions.json` endpoint and cross-agent completion testing unless promoted from **Feedback**.
- Content rewrites for every page (only structural GEO hooks + llms.txt in this slice).
- **QA and automated tests** for this slice.

---

## Feedback for Product team

- [ ] **Owner:** Confirm production domain — `https://byklika.com` vs staging/preview URL rules for `PUBLIC_SITE_URL`.
- [ ] **Owner:** Supply **`sameAs`** social/profile URLs for Organization schema (LinkedIn, etc.).
- [ ] **Owner:** Provide a **1200×630 OG image** for default sharing (non-article pages).
- [ ] **Owner:** Approve **`llms.txt`** copy and preferred AI citation sentence (Spanish) — draft lives in `src/data/geoEntityContract.ts`.
- [ ] **Owner:** Google Search Console property access — who submits `sitemap.xml` post-deploy?
- [ ] **Owner:** Priority of **WebMCP / agent task completion** vs **citation-focused GEO** for contact form (Iteration 5 optional item).

---

## Appendix — Current baseline

| Signal                    | Status today                                                         | Target                                                                       |
| ------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `astro.config.mjs` `site` | `https://byklika.com`                                                | Keep; align all absolute URLs                                                |
| Canonical + OG + Twitter  | `BaseLayout.astro` + `seoOnPageContract.ts`                          | Per-route titles/descriptions; default OG image pending Product asset        |
| `robots.txt`              | `src/pages/robots.txt.ts` → `/robots.txt`                            | Points to `sitemap-index.xml` on `site` origin                               |
| `sitemap.xml`             | `@astrojs/sitemap` → `sitemap-index.xml` + `sitemap-0.xml`           | Blog posts get `lastmod` via `sitemap-lastmod.mjs`                           |
| JSON-LD                   | `JsonLd.astro` + `src/lib/seo/schema.ts`                             | Organization, WebSite on all pages; BlogPosting + BreadcrumbList on articles |
| `llms.txt`                | `src/pages/llms.txt.ts` → `/llms.txt`                                | Machine-readable summary from `geoEntityContract.ts`                         |
| GEO entity block          | `GeoEntitySummary` in `#nosotras`                                    | Plain-language who/what definitions on homepage                              |
| Blog SEO                  | Per-post title, required `description`, OG hero + BlogPosting schema | Product: keep first paragraph answer-shaped                                  |

### Iteration 1 — Locked decisions (2026-06-09)

| Decision               | Locked value                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Canonical origin       | `https://byklika.com` (override per deploy: `PUBLIC_SITE_URL` in `astro.config.mjs`)                                                                   |
| Trailing slashes       | **`always`** — `trailingSlash: 'always'` in Astro config; `blogPostHref`, `blogListPath`, breadcrumbs use trailing slashes                             |
| Code contract          | `src/data/seoIndexingPolicy.ts`                                                                                                                        |
| Build output (static)  | **8 pages** at audit: home + 4 marketing + blog index + 3 articles                                                                                     |
| Blog pagination        | **Not emitted** while `published posts ≤ BLOG_PAGE_SIZE` (10); only `/blog/page/2/`+ when `lastPage > 1`                                               |
| Sitemap exclude        | Draft posts, `/#…` hash URLs, `/_astro/*` and analytics assets, preview hosts (wrong `PUBLIC_SITE_URL`), future API routes                             |
| Nav vs sitemap         | Header nav uses `/#metodologia` etc. for homepage scroll; **sitemap includes** `/metodologia/`, `/servicios/`, `/nosotras/` as separate canonical URLs |
| Canonical verification | Build emits `https://byklika.com/…/` on sample pages; `PUBLIC_SITE_URL=https://staging.example.com` rewrites origin at build time                      |

**Indexable blog posts (non-draft, 2026-06-09):**

- `/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo/`
- `/blog/evaluacion-del-aprendizaje/como-saber-si-tu-formacion-realmente-funciono/`
- `/blog/ia-en-educacion/la-friccion-existe-parte-1/`

### Indexable URL checklist (verify at build)

| URL pattern                | Source                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `/`                        | `src/pages/index.astro`                                                                     |
| `/servicios/`              | `src/pages/servicios/index.astro`                                                           |
| `/metodologia/`            | `src/pages/metodologia/index.astro`                                                         |
| `/nosotras/`               | `src/pages/nosotras/index.astro`                                                            |
| `/blog/`                   | `src/pages/blog/index.astro`                                                                |
| `/blog/page/n/`            | `src/pages/blog/page/[page].astro` (only when `lastPage > 1`; page 1 canonical is `/blog/`) |
| `/blog/{category}/{slug}/` | `src/pages/blog/[...slug].astro` + content collection                                       |

### References

- Astro sitemap integration: `@astrojs/sitemap`
- Existing layout: `src/layouts/BaseLayout.astro`, `src/layouts/BlogPostLayout.astro`
- Site origin: `astro.config.mjs`, `.env.example` (`PUBLIC_SITE_URL`)
- SEO skill patterns: meta robots, canonical, sitemap best practices
- GEO/AEO: entity clarity, FAQ/schema alignment, `llms.txt` — complementary to SEO, not a substitute
