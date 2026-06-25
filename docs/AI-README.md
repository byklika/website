# Byklika website — AI & contributor guide

Authoritative context for AI agents (Cursor, Claude Code, etc.) and human contributors working on the **Klika** marketing site at [https://byklika.com](https://byklika.com).

**Thin entry points** (always read this doc first):

- Cursor: [`.cursor/rules/byklika-website.md`](../.cursor/rules/byklika-website.md)
- Claude Code: [`.claude/CLAUDE.md`](../.claude/CLAUDE.md)

**Topic guides** (deep dives — linked from here, not duplicated):

| Topic                       | Guide                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| Blog MDX authoring          | [`docs/blog-content.md`](blog-content.md)                                                      |
| Blog image pipeline         | [`docs/blog-images.md`](blog-images.md)                                                        |
| SEO / JSON-LD / `llms.txt`  | [`docs/seo-geo.md`](seo-geo.md)                                                                |
| GrowthBook experiments      | [`docs/experiments.md`](experiments.md)                                                        |
| Analytics events            | [`docs/analytics.md`](analytics.md)                                                            |
| Contact sheet / forms       | [`docs/contact-forms.md`](contact-forms.md)                                                    |
| Deploy / Vercel             | [`docs/deployment.md`](deployment.md)                                                          |
| Validation / smoke tests    | [`docs/smoke-test.md`](smoke-test.md)                                                          |
| **Workplans (initiatives)** | [`docs/workplan-template.md`](workplan-template.md) · [`docs/workplans/`](workplans/README.md) |

---

## Contracts as source of truth (MANDATORY)

**Before changing site copy, SEO constants, nav labels, contact fields, or blog layout contracts, edit the typed data module — not hardcoded strings in components.**

| File                                                                      | Owns                                                                                        | Edit when                                                                |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [`src/data/seoOnPageContract.ts`](../src/data/seoOnPageContract.ts)       | Title suffix (` — Klika`), default meta, `seoPageMeta` per static route, `lang` / OG locale | Page titles, descriptions, default OG image path                         |
| [`src/data/seoSchemaContract.ts`](../src/data/seoSchemaContract.ts)       | JSON-LD entity name, logo, contact email, `sameAs` social URLs                              | Organization schema fields, social profile links                         |
| [`src/data/seoIndexingPolicy.ts`](../src/data/seoIndexingPolicy.ts)       | Canonical origin, trailing-slash policy, indexable static paths, sitemap exclusion rules    | Indexation policy, URL inventory documentation                           |
| [`src/data/geoEntityContract.ts`](../src/data/geoEntityContract.ts)       | Brand positioning, `llms.txt` copy, AI citation line, key pages list                        | GEO / AEO entity text, llms.txt content                                  |
| [`src/data/blogImageContract.ts`](../src/data/blogImageContract.ts)       | Image widths, formats, master/derivative paths, asset mapping                               | Blog image sizes, naming, Product sign-off mapping                       |
| [`src/data/blogArticleContract.ts`](../src/data/blogArticleContract.ts)   | Article section order, CTA defaults, breadcrumb, reading-time WPM, design tokens            | Article layout copy defaults, related-section title                      |
| [`src/data/blogPlaceholders.ts`](../src/data/blogPlaceholders.ts)         | Blog index card dataset (generated from MDX)                                                | Regenerate via `pnpm generate:blog-placeholders` — do not hand-edit rows |
| [`src/data/contactSheetContract.ts`](../src/data/contactSheetContract.ts) | Sheet title/intro, field contract, trigger list, regression keys                            | Contact drawer copy, allowed payload fields                              |
| [`src/data/siteNav.ts`](../src/data/siteNav.ts)                           | Primary header nav items (hash links + `/blog/`)                                            | Nav labels and hrefs                                                     |

**Schema for blog posts** lives in [`src/content.config.ts`](../src/content.config.ts) (Zod frontmatter) — not a `*Contract.ts` file, but equally authoritative for MDX.

---

## Overview

| Aspect              | Detail                                                             |
| ------------------- | ------------------------------------------------------------------ |
| **Site**            | Static marketing site + blog for Klika e‑learning studio           |
| **Stack**           | Astro 7, Tailwind CSS 4, DaisyUI, MDX content collections          |
| **Language**        | Spanish (`es` HTML lang, `es_AR` OG locale) — no second locale yet |
| **Package manager** | pnpm 10 (`packageManager` in `package.json`)                       |
| **Node**            | ≥ 22.12 (`engines` in `package.json`)                              |
| **Deploy**          | Vercel (`vercel.json`, GitHub Actions workflows)                   |
| **Path alias**      | `~/` → `src/` (see `tsconfig.json`)                                |

The site is **fully static** at build time. Blog posts are MDX files under `src/content/blog/`. Draft posts (`draft: true`) are excluded from `getStaticPaths` and produce no HTML.

SEO/GEO agent summary: [`docs/seo-geo.md`](seo-geo.md). Shipped delivery workplans live under [`docs/workplans/`](workplans/README.md) when relevant.

---

## When to Review (Required Checks)

Review is **required** in these situations. Do not open a PR without the applicable checks.

| When (trigger)                         | Where to review                                                 | What to verify                                                                                      |
| -------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Before opening PR**                  | Terminal                                                        | `pnpm typecheck`, `pnpm test`, `pnpm build` all pass; no broken routes                              |
| **After editing blog MDX**             | `src/content.config.ts` schema + post file                      | Frontmatter valid; `draft: false` for publish; slug path matches category folder                    |
| **After adding blog images**           | [`docs/blog-images.md`](blog-images.md), `blogImageContract.ts` | Master in `src/assets/images/blog/`; run `pnpm optimize:blog`; derivatives in `public/images/blog/` |
| **After SEO / meta change**            | `seoOnPageContract.ts`, `BaseLayout.astro` props                | Title uses `formatSeoTitle` pattern; description set; canonical correct                             |
| **After schema / llms.txt change**     | `seoSchemaContract.ts`, `geoEntityContract.ts`, `src/lib/seo/`  | JSON-LD validates; `/llms.txt` reflects entity copy                                                 |
| **After nav / CTA copy**               | `siteNav.ts`, section components                                | Links use trailing slashes where required; hash nav targets exist on homepage                       |
| **After experiment flag change**       | [`docs/experiments.md`](experiments.md), `src/lib/experiments/` | Flag key in constants; tracking callback wired                                                      |
| **After contact form change**          | `contactSheetContract.ts`, `contactFormPayload.ts`              | Payload keys match Web3Forms; no `name` field added                                                 |
| **After regenerating blog index data** | `blogPlaceholders.ts`                                           | File updated via script, not manual edits to generated array                                        |
| **Multi-step initiative**              | [`docs/workplans/<slug>.md`](workplans/README.md)               | Workplan exists; **Done when** ticked; PR links the workplan                                        |

**Summary:** Run the build pipeline before every PR. When you touch contracts, content schema, images, or client scripts, verify the corresponding row above.

---

## Project structure

```
website/
├── .cursor/rules/byklika-website.md   # Cursor always-on pointer → this file
├── .claude/CLAUDE.md                  # Claude Code pointer → this file
├── docs/                              # AI guides (this file + topic guides)
├── examples/                          # Embeddables reference ONLY — do not edit
├── public/                            # Static assets served as-is
│   └── images/                        # Optimized hero + blog derivatives
├── scripts/                           # Build/maintenance shell + Node scripts
├── src/
│   ├── assets/images/                 # Source masters (NOT publicly served)
│   ├── components/
│   │   ├── blog/                      # Article banner, cards, related posts
│   │   ├── cards/                     # FlipCard, MethodCard, ServiceCard
│   │   ├── layout/                    # HeadEssentials, SiteBodyChrome
│   │   ├── sections/                  # Homepage + page sections (Hero, Services, …)
│   │   ├── seo/                       # JsonLd.astro
│   │   └── ui/                        # Button, SectionHeading, Tabs, Tag
│   ├── content/blog/                  # MDX posts: {category}/{slug}.mdx
│   ├── content.config.ts              # Blog collection Zod schema
│   ├── data/                          # *Contract.ts — typed source of truth
│   ├── layouts/
│   │   ├── BaseLayout.astro           # `<head>`, JSON-LD shell, chrome wrapper
│   │   └── BlogPostLayout.astro       # Article page composition
│   ├── lib/                           # Shared TS (blog, SEO, analytics, experiments)
│   ├── pages/                         # File-based routes (see Routing below)
│   ├── scripts/                       # Client-side TS (forms, sheet, analytics)
│   └── styles/global.css              # Tailwind entry + site CSS variables
├── astro.config.mjs
├── tailwind.config.mjs
├── vercel.json
└── package.json
```

---

## Layouts

### `BaseLayout.astro`

Every page wraps content in `BaseLayout` unless noted otherwise.

**Owns:**

- Global CSS import (`~/styles/global.css`)
- `<title>`, meta description, canonical URL
- Open Graph + Twitter cards
- Optional `noindex`
- Site-wide JSON-LD: `Organization` + `WebSite` (via `src/lib/seo/schema.ts`)
- Extra `jsonLd` prop for page-specific schemas (blog articles pass `BlogPosting` + breadcrumb)
- `SiteBodyChrome` (header, footer, contact sheet, analytics scripts)
- Scroll-reveal inline script (`.reveal` elements)

**Key props:**

| Prop            | Default                        | Purpose                                                  |
| --------------- | ------------------------------ | -------------------------------------------------------- |
| `title`         | Site name                      | `<title>` + OG title                                     |
| `description`   | `SEO_SITE_DEFAULT_DESCRIPTION` | Meta + OG description                                    |
| `fullWidthMain` | `false`                        | Skip inner `max-w-5xl` wrapper (homepage, blog articles) |
| `image`         | `/favicon.svg`                 | OG / Twitter image (absolute URL resolved at build)      |
| `ogType`        | `website`                      | `article` for blog posts                                 |
| `jsonLd`        | —                              | Additional structured data nodes                         |

### `BlogPostLayout.astro`

Wraps `BaseLayout` for article detail pages. Composes:

1. `BlogArticleBanner` — hero image or placeholder
2. `BlogArticleHeader` — breadcrumb, meta, title, tags
3. `BlogArticleLead` — optional lead paragraph
4. MDX body slot (`.article-body`)
5. `BlogArticleAuthor`
6. `BlogArticleCta` — contextual CTA (defaults from `blogArticleContract.ts`)
7. `BlogRelatedPosts` — up to 2 related cards

SEO title: `formatArticleSeoTitle(title)` → `{title} — Klika`.

---

## Routing & URLs

Configured in [`astro.config.mjs`](../astro.config.mjs):

- **`site`:** `process.env.PUBLIC_SITE_URL || 'https://byklika.com'`
- **`trailingSlash: 'always'`** — all internal links and canonicals must end with `/`

### Static routes (`src/pages/`)

| Path                       | File                      | Notes                                                    |
| -------------------------- | ------------------------- | -------------------------------------------------------- |
| `/`                        | `index.astro`             | Homepage — Hero, Methodology, Services, AboutUs sections |
| `/servicios/`              | `servicios/index.astro`   | Standalone services page                                 |
| `/metodologia/`            | `metodologia/index.astro` | Standalone methodology page                              |
| `/nosotras/`               | `nosotras/index.astro`    | Standalone about page                                    |
| `/blog/`                   | `blog/index.astro`        | Blog index (page 1)                                      |
| `/blog/page/{n}/`          | `blog/page/[page].astro`  | Pagination when > 10 posts                               |
| `/blog/{category}/{slug}/` | `blog/[...slug].astro`    | Article detail                                           |
| `/llms.txt`                | `llms.txt.ts`             | Plain-text entity summary for AI crawlers                |
| `/robots.txt`              | `robots.txt.ts`           | Dynamic robots + sitemap pointer                         |

### Blog URL shape

- **File path:** `src/content/blog/{category-folder}/{slug}.mdx`
- **Category folder:** slugified from frontmatter `category` via `categoryFolderSlug()` in `src/lib/blog-card.ts` (e.g. `Diseño instruccional` → `diseno-instruccional`)
- **Entry id:** `{category-folder}/{slug}` (matches file path without extension)
- **Public URL:** `/blog/{entry.id}/` via `blogPostHref()`

Example:

```
src/content/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo.mdx
→ id: diseno-instruccional/completaste-el-curso-pero-aprendiste-algo
→ URL:  /blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo/
```

### Pagination

- Page size: **10** (`BLOG_PAGE_SIZE` in `src/lib/blog-pagination.ts`)
- Page 1 canonical: `/blog/`
- Page N: `/blog/page/{n}/`
- Draft posts excluded from collection queries used for static paths

### Navigation vs standalone routes

Header nav (`siteNav.ts`) uses **homepage hash links** (`/#metodologia`, `/#servicios`, `/#nosotras`) for scroll targets. Standalone routes under `/servicios/`, `/metodologia/`, `/nosotras/` exist for direct URLs and SEO; keep meta in `seoPageMeta` aligned with section content.

---

## Styling

| Layer                | Location                                          | Notes                                                            |
| -------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| **Tailwind 4**       | `src/styles/global.css` (`@import 'tailwindcss'`) | Vite plugin in `astro.config.mjs`                                |
| **DaisyUI**          | `tailwind.config.mjs` plugins                     | `data-theme="light"` on `<html>`                                 |
| **Typography**       | `@tailwindcss/typography`                         | Prose classes on article body                                    |
| **Design tokens**    | `tailwind.config.mjs` → `colors.klika.*`          | `klika-moss`, `klika-coral`, `klika-cream`, `klika-dark`, etc.   |
| **Layout utilities** | `global.css`                                      | `.layout-container`, `.section-gutter-x`, `--site-header-height` |
| **Z-index**          | CSS vars + Tailwind `z-*`                         | `raised` < `header` < `sheet` < `popup`                          |

### Component conventions

- **`SectionHeading.astro`** — eyebrow + serif `h2`; use for marketing section titles
- **`Button.astro`** — variants: `primary`, `secondary`, `outlineLight`, `mossOutline`; pill shape
- **`cn()`** from `~/lib/helpers` — conditional class merging
- **Reveal animation** — add class `reveal` to elements; BaseLayout observes intersection

Do not introduce new color hex values in components when a `klika-*` token exists in `tailwind.config.mjs`.

---

## Workplans (initiatives)

**Non-trivial work** starts with a workplan — not ad-hoc edits across the repo.

| Step | Action                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------- |
| 1    | Read this file + relevant topic guide                                                                    |
| 2    | Copy [`workplan-template.md`](workplan-template.md) → [`workplans/<kebab-slug>.md`](workplans/README.md) |
| 3    | Lock contracts and **Done when** before large implementation                                             |
| 4    | Tick iterations in the workplan file; link it from the PR                                                |
| 5    | Update AI-README / topic guides in the same PR if contracts or workflows change                          |

**Skip a workplan** for single-file fixes, contract-only copy edits, or publishing one blog post (use topic guides).

---

## Key principles for modifications

1. **Contracts first** — Site copy, SEO titles, contact fields, and blog defaults live in `src/data/*Contract.ts`. Components consume contracts; they do not define canonical copy.
2. **Minimum diff** — Change only what the task requires. Do not refactor adjacent code or rename unrelated files.
3. **Spanish meta on Spanish pages** — Titles, descriptions, and user-facing copy are Spanish. Do not add English meta tags or alt text without explicit Product approval.
4. **Trailing slashes always** — Internal `href`s and canonical paths end with `/`. Match `trailingSlash: 'always'`.
5. **Do not bypass the image pipeline** — Blog and hero images need optimized derivatives in `public/images/`. Never point production HTML at raw masters in `src/assets/` only.
6. **Draft gate** — `draft: true` posts are excluded from build output. Set `draft: false` only when ready to publish.
7. **No `name` on contact forms** — Payload is email + message (+ optional `project_stage`). See `contactSheetContract.ts` and `contactFormPayload.ts`.
8. **Regenerate generated files** — `blogPlaceholders.ts` is script output; run `pnpm generate:blog-placeholders` after MDX changes that affect the index.
9. **Env vars at build time** — `PUBLIC_*` vars are inlined by Astro at build. Production deploys need vars set on Vercel **before** build.
10. **Do not edit `examples/`** — Embeddables reference material only; Byklika docs live in `docs/`.
11. **Workplan first for initiatives** — Multi-step features use `docs/workplans/<slug>.md` from [`workplan-template.md`](workplan-template.md); do not track live work in the template file.

---

## Common patterns

Short recipes; full steps live in linked topic guides.

| Guide                                        | Use when                                                   |
| -------------------------------------------- | ---------------------------------------------------------- |
| [`blog-content.md`](blog-content.md)         | Adding or editing MDX posts                                |
| [`blog-images.md`](blog-images.md)           | Hero masters, `optimize:blog`, crops                       |
| [`seo-geo.md`](seo-geo.md)                   | Meta, JSON-LD, sitemap, `llms.txt`                         |
| [`experiments.md`](experiments.md)           | GrowthBook flags and A/B tests                             |
| [`analytics.md`](analytics.md)               | GA4 events via the analytics bus                           |
| [`contact-forms.md`](contact-forms.md)       | Sheet, inline form, Web3Forms                              |
| [`deployment.md`](deployment.md)             | Vercel, CI, env vars, previews                             |
| [`workplans/README.md`](workplans/README.md) | Open initiative trackers; copy from `workplan-template.md` |

### Add a marketing section to the homepage

1. Create or extend a component under `src/components/sections/`.
2. Import and place it in `src/pages/index.astro` inside `BaseLayout` (`fullWidthMain`).
3. Use `SectionHeading`, `Button`, and existing card components; match `.layout-container` / `.section-gutter-x` patterns from sibling sections.
4. If the section needs a nav target, add an `id` matching `SEO_HOMEPAGE_HASH_SECTIONS` conventions and update `siteNav.ts` if it should appear in header nav.
5. Run `pnpm build`.

### Add a standalone page under `src/pages/`

1. Create `src/pages/{slug}/index.astro`.
2. Wrap in `BaseLayout`; pass `title` and `description` from `seoPageMeta` (add a new entry in [`seoOnPageContract.ts`](../src/data/seoOnPageContract.ts)).
3. Add path to `SEO_INDEXABLE_STATIC_PATHS` in [`seoIndexingPolicy.ts`](../src/data/seoIndexingPolicy.ts) if indexable — see [`seo-geo.md`](seo-geo.md).
4. Use trailing-slash links throughout.
5. Run `pnpm typecheck && pnpm build`.

### Publish a blog post

See [`docs/blog-content.md`](blog-content.md). Summary:

1. Create `src/content/blog/{category-folder}/{slug}.mdx` with valid frontmatter (`src/content.config.ts`).
2. Add hero master → run `pnpm optimize:blog` (see [`docs/blog-images.md`](blog-images.md)).
3. Set `draft: false`, verify locally with `pnpm dev`.
4. Run `pnpm generate:blog-placeholders` to refresh index cards.
5. Run `pnpm typecheck && pnpm test && pnpm build`.

### Add a related-post CTA override

Set optional frontmatter on the MDX file:

- `ctaDescription` — replaces default body copy in `BlogArticleCta`
- `ctaButtonLabel` — replaces button label (default: `Hablemos` from `blogArticleCtaDefaults`)
- `relatedSlugs` — up to 2 explicit related post ids (otherwise auto-picked by category/tags)

Defaults: `src/data/blogArticleContract.ts` → `blogArticleCtaDefaults`.

### Wire a new analytics event

See [`docs/analytics.md`](analytics.md). Summary:

1. Add event name + params to `AnalyticsEventMap` in `src/lib/analytics/types.ts`.
2. Call `publish({ name, params })` from client script (`src/scripts/`).
3. GA4 forwarder maps automatically via `src/lib/analytics/ga4Subscriber.ts`.
4. Add or extend tests in `src/lib/analytics/bus.test.ts`.

### Change page SEO title or meta description

See [`seo-geo.md`](seo-geo.md). Summary:

1. Edit [`seoOnPageContract.ts`](../src/data/seoOnPageContract.ts) → `seoPageMeta` (static routes) — **not** hardcoded strings in page files.
2. Blog articles: frontmatter `title` + `description` (layout applies `formatArticleSeoTitle`).
3. Schema / entity copy: [`seoSchemaContract.ts`](../src/data/seoSchemaContract.ts), [`geoEntityContract.ts`](../src/data/geoEntityContract.ts).
4. Run `pnpm build`; validate JSON-LD if schema changed.

### Wire a GrowthBook experiment

See [`experiments.md`](experiments.md). Summary:

1. Add flag constant in `src/lib/experiments/constants.ts`.
2. SSR fallback in Astro; client reads `window.growthbook.evalFeature()` after `growthbook:ready`.
3. Exposures auto-track via `growthbookTrackingCallback.ts`.
4. Run `pnpm test:growthbook-flags` to verify dashboard payload.

### Update contact sheet copy or fields

See [`contact-forms.md`](contact-forms.md). Summary:

1. Edit [`contactSheetContract.ts`](../src/data/contactSheetContract.ts) — title, intro, field labels.
2. Payload shape: [`contactFormPayload.ts`](../src/lib/contactFormPayload.ts) + tests — never add `name`.
3. Run `pnpm test && pnpm build`.

### Deploy or verify preview

See [`deployment.md`](deployment.md). Summary:

1. PR → GitHub Actions posts Vercel preview URL.
2. Merge to `main` → production deploy via `.github/workflows/deploy-vercel.yml`.
3. New `PUBLIC_*` vars must be set on Vercel before build + redeploy.

---

## CLI / package scripts

| Script                     | Command                           | Purpose                                         |
| -------------------------- | --------------------------------- | ----------------------------------------------- |
| Dev server                 | `pnpm dev`                        | Astro dev server with HMR                       |
| Production build           | `pnpm build`                      | Static output to `dist/`                        |
| Preview build              | `pnpm preview`                    | Serve `dist/` locally                           |
| Tests                      | `pnpm test`                       | Vitest unit tests                               |
| Watch tests                | `pnpm test:watch`                 | Vitest in watch mode                            |
| Typecheck                  | `pnpm typecheck`                  | `tsc --noEmit` + `astro check`                  |
| Lint                       | `pnpm lint`                       | ESLint                                          |
| Format                     | `pnpm format`                     | Prettier write                                  |
| Format check               | `pnpm format:check`               | Prettier CI check                               |
| Optimize blog images       | `pnpm optimize:blog`              | `scripts/optimize-blog-images.sh`               |
| Optimize hero images       | `pnpm optimize:hero`              | Default hero bundle                             |
| Optimize hero v2           | `pnpm optimize:hero:v2`           | Homepage hero v2 bundle                         |
| Generate blog placeholders | `pnpm generate:blog-placeholders` | Regenerate `blogPlaceholders.ts` from MDX       |
| Docs link check            | `pnpm docs:check`                 | Verify doc links, contracts, smoke-test targets |
| CSS size measure           | `pnpm css:measure`                | Build + measure CSS output                      |
| GrowthBook flag test       | `pnpm test:growthbook-flags`      | Verify flag definitions against API             |
| Vercel CI secrets hint     | `pnpm vercel:ci-secrets-hint`     | Print expected Vercel env var names             |

---

## Environment variables

Copy [`.env.example`](../.env.example) to `.env.local` for local dev. **Never commit secrets.**

| Variable                            | Required                               | Purpose                                          |
| ----------------------------------- | -------------------------------------- | ------------------------------------------------ |
| `PUBLIC_SITE_URL`                   | No (defaults to `https://byklika.com`) | Astro `site` — canonical and OG absolute URLs    |
| `PUBLIC_GA_MEASUREMENT_ID`          | No                                     | Google Analytics 4 (`G-XXXXXXXXXX`)              |
| `PUBLIC_CLARITY_PROJECT_ID`         | No                                     | Microsoft Clarity                                |
| `PUBLIC_GROWTHBOOK_CLIENT_KEY`      | No                                     | GrowthBook feature flags (client + server fetch) |
| `PUBLIC_WEB3FORMS_ACCESS_KEY`       | For contact form                       | Web3Forms — contact sheet + inline form          |
| `PUBLIC_WEB3FORMS_POPUP_ACCESS_KEY` | For email popup                        | Web3Forms — email signup popup                   |
| `VERCEL_OIDC_TOKEN`                 | CI only                                | Created by Vercel CLI for OIDC                   |

Scripts in `SiteAnalytics.astro` load **only when** the matching `PUBLIC_*` var is set at **build time**. Adding a var locally affects dev builds; production requires the var on Vercel + redeploy.

---

## Out of scope for agents

Do **not** do the following without explicit user / Product instruction:

- Force-push to `main` or rewrite published git history
- Edit files under `examples/` (Embeddables reference)
- Commit `.env`, `.env.local`, or real API keys
- Change `seoSchemaContract.sameAs` social URLs without Product ticket
- Add a `name` field to contact forms or Web3Forms payload
- Skip `pnpm build` before claiming a change is merge-ready
- Invent API routes or server endpoints — the site is static (except prerendered `llms.txt` / `robots.txt`)
- Add English locale or `hreflang` without an i18n initiative

---

## Re-sync and drift prevention (team norm)

When architecture or contracts change, update docs **in the same PR** — do not merge code-only changes that leave docs stale.

| Change                                       | Update (required in same PR)                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| New `*Contract.ts`                           | Add row to **Contracts** table in this file                                                      |
| New contributor-facing `package.json` script | Add row to **CLI scripts** table                                                                 |
| New high-touch workflow                      | Add topic guide under `docs/` + link from this file and `.cursor/rules/byklika-website.md`       |
| New multi-step initiative                    | Copy `workplan-template.md` → `docs/workplans/<slug>.md`; add index row in `workplans/README.md` |
| SEO policy change                            | `seoIndexingPolicy.ts` + [`docs/seo-geo.md`](seo-geo.md)                                         |
| Blog schema field                            | `src/content.config.ts` + [`docs/blog-content.md`](blog-content.md)                              |
| Behavior change in an existing workflow      | Matching topic guide + **When to Review** row if new check applies                               |
| Doc / link changes                           | Run `pnpm docs:check`; update [`docs/smoke-test.md`](smoke-test.md) if smoke scenarios change    |

**Drift rules:**

- Every `src/data/*Contract.ts` file must have a row in the **Contracts** table — no orphan contracts.
- Every `package.json` script intended for contributors must appear in the **CLI scripts** table.
- Topic guides link back here; this file links to every topic guide in **Common patterns**.

---

## Appendix — File map (inventory)

Quick lookup: **file → purpose → when to edit**.

| File / area                        | Purpose                                  | When to edit                                    |
| ---------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| `src/data/seoOnPageContract.ts`    | Page titles, descriptions, SEO constants | Meta copy for static routes                     |
| `src/data/seoSchemaContract.ts`    | JSON-LD organization entity              | Schema.org fields, social URLs                  |
| `src/data/seoIndexingPolicy.ts`    | Indexation policy documentation          | Canonical rules, indexable path list            |
| `src/data/geoEntityContract.ts`    | llms.txt + GEO entity copy               | AI citation text, brand positioning             |
| `src/data/blogImageContract.ts`    | Blog image naming and sizes              | Image pipeline contract                         |
| `src/data/blogArticleContract.ts`  | Article layout defaults                  | CTA copy, breadcrumb, WPM                       |
| `src/data/blogPlaceholders.ts`     | Blog index card data (generated)         | Run `pnpm generate:blog-placeholders`           |
| `src/data/contactSheetContract.ts` | Contact drawer copy + fields             | Sheet UI text, payload contract                 |
| `src/data/siteNav.ts`              | Header navigation                        | Nav labels and links                            |
| `src/content.config.ts`            | Blog frontmatter schema                  | New MDX fields                                  |
| `src/content/blog/**/*.mdx`        | Blog posts                               | Article content                                 |
| `src/layouts/BaseLayout.astro`     | Global head + chrome                     | Head/meta behavior (prefer contracts for copy)  |
| `src/layouts/BlogPostLayout.astro` | Article shell                            | Article structure (prefer contracts for copy)   |
| `src/lib/seo/schema.ts`            | JSON-LD builders                         | New schema types                                |
| `src/lib/seo/llms-txt.ts`          | llms.txt body builder                    | llms.txt format (copy from geoEntityContract)   |
| `src/lib/blog-card.ts`             | Card props, href helpers, category slug  | URL/slug logic                                  |
| `src/lib/blog-article.ts`          | Reading time, related posts              | Article resolution logic                        |
| `src/lib/blog-image.ts`            | Responsive image props                   | Image URL / srcset logic                        |
| `src/lib/blog-pagination.ts`       | Blog list pagination                     | Page size or path shape                         |
| `src/lib/contactFormPayload.ts`    | Web3Forms payload builder                | Form field → payload mapping                    |
| `src/lib/analytics/`               | Event bus + GA4 subscriber               | New analytics events                            |
| `src/lib/experiments/`             | GrowthBook flags + tracking              | A/B test wiring                                 |
| `src/components/sections/*.astro`  | Marketing sections                       | Section content and layout                      |
| `src/components/blog/*.astro`      | Blog UI                                  | Blog presentation                               |
| `src/components/ui/*.astro`        | Shared UI primitives                     | Buttons, headings, tabs                         |
| `src/scripts/contactForms.ts`      | Form submit handlers                     | Client form behavior                            |
| `src/scripts/sheet.ts`             | Contact drawer open/close                | Sheet interaction                               |
| `src/scripts/projectStage.ts`      | Hidden project_stage field               | Prefill from CTA context                        |
| `src/pages/index.astro`            | Homepage composition                     | Homepage sections and hero                      |
| `src/pages/blog/[...slug].astro`   | Blog detail route                        | Rarely — logic lives in lib/layout              |
| `src/assets/images/`               | Image masters                            | Add source PNG before optimize scripts          |
| `public/images/`                   | Optimized derivatives                    | Output of optimize scripts — do not hand-edit   |
| `scripts/optimize-*.sh`            | Image optimization                       | New width/format requirements                   |
| `astro.config.mjs`                 | Astro + sitemap + site URL               | Integrations, site origin                       |
| `vercel.json`                      | Vercel build + redirects + headers       | Deploy config                                   |
| `.github/workflows/*.yml`          | CI/CD                                    | Preview and production deploy                   |
| `docs/workplan-template.md`        | Workplan template                        | Copy for new initiatives — do not edit in place |
| `docs/workplans/`                  | Active initiative trackers               | One file per non-trivial effort                 |
