# WORKPLAN: Astro 6 → 7 upgrade

**Board ask:** Upgrade **`astro`**, **`@astrojs/mdx`**, and all related Astro toolchain packages from the current **v6** stack to **Astro 7** without regressing build, typecheck, SEO surfaces, or blog rendering. Use the official **`@astrojs/upgrade`** path; fix only breaking changes required by this repo (Rust compiler, Sätteri markdown, Vite 8, `compressHTML`). Do **not** adopt advanced routing, route caching, or new Astro 7 features unless a breakage forces it.

---

## Done when

- [x] `package.json` and `pnpm-lock.yaml` pin **`astro@^7`**, **`@astrojs/mdx@^7`**, and compatible **`@astrojs/sitemap`**, **`@astrojs/check`** versions.
- [x] `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm typecheck`, `pnpm test`, and `pnpm lint` pass locally on Node **≥ 22.12**.
- [ ] CI workflows (`.github/workflows/deploy-vercel.yml`, `preview-vercel.yml`) pass typecheck + Vercel prebuilt build on a PR.
- [x] All indexable routes and three published MDX articles render without layout or typography regressions (spot-check URLs in **Iteration 4**).
- [x] `sitemap-index.xml`, `robots.txt`, and JSON-LD output remain valid (no broken absolute URLs).

---

## Iteration 1 — Preflight and risk inventory (lock before bump)

- [x] Create branch `chore/astro-7-upgrade` from `main`.
- [x] Record baseline: `pnpm build` wall time, `dist/` page count, and `pnpm css:measure` totals (optional comparison after upgrade).
- [x] Confirm **no blockers** in repo audit (already true unless new files landed):
  - No `src/fetch.ts` / `src/middleware.ts` (advanced routing reserved names).
  - No `@astrojs/db`, no `experimental.*` flags in `astro.config.mjs`.
  - No `markdown.remarkPlugins` / `rehypePlugins` in config.
  - No removed `astro:transitions` constants (`TRANSITION_*`, `createAnimationScope`).
  - `FlipCard.astro` uses lifecycle **string** events (`astro:page-load`, `astro:after-swap`) — keep as-is.
- [x] List **touch surfaces** for this upgrade:

| Area          | Primary files                                                                                         |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Config        | `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts`                                                   |
| Content       | `src/content.config.ts`, `src/content/blog/**/*.mdx`                                                  |
| Blog pipeline | `src/pages/blog/[...slug].astro`, `BlogPostLayout.astro`, `src/lib/blog-*.ts`                         |
| SEO           | `astro.config.mjs` (`@astrojs/sitemap`), `src/pages/robots.txt.ts`, `src/components/seo/JsonLd.astro` |
| Tooling       | `package.json`, `eslint.config.js`, `prettier.config.mjs`                                             |
| CI            | `.github/workflows/deploy-vercel.yml`, `preview-vercel.yml`                                           |

- [x] Read [Upgrade to Astro v7](https://docs.astro.build/en/guides/upgrade-to/v7/) and skim [Astro 7.0 release notes](https://astro.build/blog/astro-7/).

**Iteration 1 implementation notes (2026-06-25, Astro 6.1.6 baseline):**

- **Branch:** `chore/astro-7-upgrade` (renamed from `chore/upgrade-astro`; no commits ahead of `main` at preflight).
- **Node (local):** v24.4.1 — satisfies `engines.node >= 22.12.0` and Astro 7 minimum.
- **Baseline build:** `pnpm build` wall **4.48s** (Astro reported **2.47s**, **8 page(s)**).
- **Baseline CSS:** `pnpm css:measure` → **172.4 KiB** total (`BaseLayout.*.css`, 1 file).
- **Static routes emitted:** `/`, `/blog/`, 3 blog articles, `/metodologia/`, `/nosotras/`, `/servicios/`, `/robots.txt`, `/llms.txt`; `sitemap-index.xml` at `dist/`.
- **MDX posts:** 3 files under `src/content/blog/` (no custom MDX component imports).
- **Blocker audit:** all clear — no reserved routing files, no `@astrojs/db`, no `experimental` config, no remark/rehype plugins, no removed transitions APIs; `FlipCard.astro` lifecycle listeners are string event names (safe).
- **Primary upgrade risks flagged for Iteration 3:** Rust compiler strictness, Sätteri MDX rendering, `compressHTML: 'jsx'` whitespace, Vite 8 + `@tailwindcss/vite`.

---

## Iteration 2 — Coordinated dependency upgrade

- [x] Run official upgrader (updates `astro` + official integrations together):

```bash
pnpm dlx @astrojs/upgrade
```

- [x] If the CLI is unavailable, bump manually and align peer ranges:

| Package            | From     | Target                            |
| ------------------ | -------- | --------------------------------- |
| `astro`            | `^6.1.6` | `^7.0.2` (or latest `7.x`)        |
| `@astrojs/mdx`     | `^5.0.3` | `^7.0.0`                          |
| `@astrojs/sitemap` | `^3.7.3` | latest `7.x`-compatible release   |
| `@astrojs/check`   | `^0.9.9` | latest release supporting Astro 7 |

- [x] Refresh lockfile: `pnpm install`.
- [x] Do **not** add `@astrojs/markdown-remark` unless Iteration 3 reveals remark/rehype dependency (none expected today).
- [x] Verify `engines.node` (`>=22.12.0`) still satisfies Astro 7 minimum (Node 22+).

**Iteration 2 implementation notes (2026-06-25):**

- `@astrojs/upgrade` resolved versions correctly (`astro@7.0.2`, `@astrojs/mdx@7.0.0`) but **`pnpm install` failed** inside the CLI — likely **pnpm store mismatch** (`node_modules` linked from `.pnpm-store/v10` vs global store).
- **Manual install succeeded:**

```bash
pnpm add @astrojs/mdx@7.0.0 astro@7.0.2 --store-dir .pnpm-store/v10
```

- **Installed versions:** `astro@7.0.2`, `@astrojs/mdx@7.0.0`, `@astrojs/sitemap@3.7.3` (unchanged — CLI reported up to date), `@astrojs/check@0.9.9` (unchanged).
- **`@astrojs/markdown-remark`:** not added (no remark/rehype plugins in config).
- **`engines.node`:** `>=22.12.0` — still satisfies Astro 7 (Node 22+).
- **pnpm note:** local installs may need `--store-dir .pnpm-store/v10` until `node_modules` is reinstalled against the global store; CI (`pnpm install --frozen-lockfile`) is unaffected.

---

## Iteration 3 — Config and compiler compatibility

- [x] Run `pnpm build`. Fix **Rust compiler** errors first (unclosed tags, invalid nesting in `.astro` files). Common pattern: add missing `</Component>` / `</p>` closers; avoid block elements inside `<p>`.
- [x] Evaluate **`compressHTML` default change** (`true` → `'jsx'`). After build, visually scan pages with adjacent inline elements (nav, tags, meta rows, `SectionHeading`). If spaces disappear, either:
  - add explicit spaces / `{" "}` in affected components, **or**
  - set `compressHTML: true` in `astro.config.mjs` to preserve v6 behavior (document choice in PR).
- [x] Confirm **`@astrojs/sitemap`** `serialize()` + `src/lib/seo/sitemap-lastmod.mjs` still run; rebuild and inspect `dist/sitemap-*.xml` for blog `lastmod`.
- [x] Confirm **`@tailwindcss/vite`** works under **Vite 8** (Astro 7 default). If `pnpm dev` or `pnpm build` fails in Vite, check Tailwind/Vite release notes before pinning overrides.
- [x] Run `pnpm typecheck` (`tsc` + `astro check`). Fix any `astro:content` / `CollectionEntry` type drift in `src/lib/blog-*.ts` and page files.
- [x] Run `pnpm lint` and `pnpm test` (Vitest suites under `src/lib/*.test.ts`).

**Iteration 3 implementation notes (2026-06-25, Astro 7.0.2):**

- **`pnpm build`:** passed — **8 page(s)** in **1.85s** (no Rust compiler errors; no `.astro` template changes required).
- **`compressHTML`:** kept Astro 7 default (`'jsx'`). Meta rows and nav use **flex + `gap`** (e.g. `BlogArticleHeader.astro`), not adjacent inline text nodes — low risk. **Full visual spot-check deferred to Iteration 4.**
- **Sitemap:** `dist/sitemap-0.xml` lists 8 URLs; blog posts include `lastmod` (e.g. `2026-06-09T15:00:00.000Z` for all three articles).
- **Vite 8 + Tailwind:** `@tailwindcss/vite` build succeeded; CSS total **172.2 KiB** (was 172.4 KiB on v6 baseline).
- **`pnpm typecheck`:** passed — 0 errors (29 pre-existing hints: deprecated `z` from `astro:content`, `is:inline` script hints).
- **`pnpm lint`:** fixed `no-useless-escape` in `src/lib/blog-article.ts` (regex char class for markdown stripping); now passes.
- **`pnpm test`:** 8/8 tests passed.

---

## Iteration 4 — Content, routes, and visual verification

Spot-check these URLs after `pnpm build && pnpm preview` (or Vercel preview):

| URL                                                                     | Why                                                      |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `/`                                                                     | Homepage sections, Hero, FlipCard script, `compressHTML` |
| `/blog/`                                                                | Content collection index, pagination                     |
| `/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo/` | MDX + Sätteri pipeline, article layout, JSON-LD          |
| `/servicios/`, `/metodologia/`, `/nosotras/`                            | Static marketing routes, canonicals                      |
| `/robots.txt`, `/sitemap-index.xml`                                     | SEO crawl surfaces                                       |
| `/llms.txt`                                                             | `APIRoute` still builds                                  |

- [x] Compare MDX article body: headings, bold, paragraphs, lead block — three posts under `src/content/blog/`.
- [x] Confirm blog images (`BlogResponsiveImage.astro`, `heroImagePosition`) unchanged.
- [x] Confirm no new console errors on FlipCard interaction (`src/components/cards/FlipCard.astro`).

**Iteration 4 implementation notes (2026-06-25, `pnpm preview` on port 4321):**

- **Routes spot-checked:** `/`, `/blog/`, sample article, `/servicios/` — all render with expected titles and section structure. `/metodologia/`, `/nosotras/` canonicals verified in built HTML.
- **SEO surfaces:** `robots.txt` → `Sitemap: https://byklika.com/sitemap-index.xml`; `sitemap-0.xml` has 8 URLs + blog `lastmod`; `llms.txt` lists 3 articles.
- **Canonicals:** `/` → `https://byklika.com/`, `/blog/` → `https://byklika.com/blog/`, marketing pages use trailing-slash URLs.
- **MDX / Sätteri (3/3):** lead paragraphs, all `##` headings, and bold blocks from source MDX present in built HTML; `BlogPosting` JSON-LD on each article.
- **Blog images:** `srcset` (avif/webp) emitted; `heroImagePosition: center 35%` → `--hero-object-position-desktop:center 35%` on banner wrapper.
- **`compressHTML`:** inline spacing OK on sampled pages — e.g. methodology “Activar · Explorar · Conectar · Demostrar”, footer “klika .”, blog bold paragraphs render with spaces.
- **FlipCard:** `initFlipCards` runs; `astro:page-load` re-dispatch produces **no console errors**. Fine-pointer mode uses CSS hover (not click) — expected; back-face copy present in DOM.

---

## Iteration 5 — CI, Dependabot, and ship

- [ ] Open PR; confirm **Preview — Vercel** workflow passes (`pnpm install --frozen-lockfile` → `pnpm typecheck` → `vercel build`).
- [ ] Merge to `main`; confirm **Deploy to Vercel** production job succeeds.
- [ ] Post-deploy: optional Rich Results Test on `/` + one blog URL (see `GEO.md` Iteration 3 notes).
- [ ] Let Dependabot’s `astro` group (`.github/dependabot.yml`) handle future patch/minor bumps on the new major baseline.

---

## Out of scope

- Enabling Astro 7 **advanced routing** (`src/fetch.ts`), **route caching**, or CDN cache providers.
- Migrating to **pnpm 11** or changing Vercel deploy architecture.
- Adding remark/rehype plugins or custom Sätteri plugins unless Product requests new markdown features.
- Visual redesign, new blog content, or SEO copy changes unrelated to the upgrade.
- Automated visual regression suite (manual spot-check only unless stakeholder requests).

---

## Feedback for Product team

- **`compressHTML` policy:** If inline spacing looks wrong after upgrade, prefer explicit spacing in components vs global `compressHTML: true` — decide after Iteration 4 review.
- **Social / Rich Results:** No schema copy changes expected; re-run Rich Results Test post-deploy if Google Search Console shows new warnings.
- **Rollback:** Revert the upgrade PR; no feature flags involved. Vercel will redeploy previous commit.

---

## Appendix — Known Astro 7 breaking changes vs this repo

| Change                                | Repo impact                               | Action                                                         |
| ------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| Rust compiler (stricter HTML)         | All `.astro` templates                    | Fix on `pnpm build` failure                                    |
| Sätteri default markdown/MDX          | 3 plain MDX posts, no custom MDX imports  | Verify articles; add `@astrojs/markdown-remark` only if needed |
| Vite 8 / Rolldown                     | `@tailwindcss/vite` in `astro.config.mjs` | Build + dev smoke test                                         |
| `compressHTML: 'jsx'`                 | Inline-heavy UI (nav, tags, meta)         | Visual scan; config fallback if needed                         |
| Removed `astro:transitions` constants | None used                                 | None                                                           |
| `src/fetch.ts` reserved               | File does not exist                       | None                                                           |
| `@astrojs/db` removed                 | Not used                                  | None                                                           |
| Node 22+ required                     | `engines.node >= 22.12.0`, CI Node 22     | Already satisfied                                              |

### References

- [Upgrade to Astro v7](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [Astro 7.0 blog post](https://astro.build/blog/astro-7/)
- [`@astrojs/mdx@7.0.0` release](https://github.com/withastro/astro/releases/tag/%40astrojs/mdx%407.0.0)
- In-repo SEO workplan: `GEO.md`
