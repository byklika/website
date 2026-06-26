# Blog images — optimization pipeline

Non-obvious image workflow for blog heroes, cards, related posts, and OG previews. Summary: [`docs/AI-README.md`](AI-README.md). Authoring context: [`docs/blog-content.md`](blog-content.md).

---

## Contract source of truth

**File:** `src/data/blogImageContract.ts`

| Constant                        | Value / purpose                                                                |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `blogImageWidths`               | `400, 480, 640, 720, 960, 1280, 1920, 2560, 3840` — must match optimize script |
| `blogImageDerivativeExts`       | `avif`, `webp`, `jpg`                                                          |
| `blogImageMasterSuffix`         | `-original.png`                                                                |
| `blogImageSizesPresets.card`    | Index grid: `(min-width: 1280px) 33vw, …`                                      |
| `blogImageSizesPresets.banner`  | Article hero: `100vw`                                                          |
| `blogImageSizesPresets.related` | Related grid: `(min-width: 561px) 21rem, min(100vw, 22rem)`                    |
| `blogImageDefaultAlt`           | Fallback alt when `cardImageAlt` omitted                                       |

**Slug-as-id:** Image bundle basename = blog `entry.id` (includes category folder).

Example entry id: `diseno-instruccional/completaste-el-curso-pero-aprendiste-algo`

---

## Folder layout

```
src/assets/images/blog/
  └── {entryId}-original.png          ← master (NOT publicly served)

public/images/blog/
  └── {entryId}-{width}w.{avif,webp,jpg}   ← served derivatives
```

Nested entry ids create nested directories:

```
src/assets/images/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo-original.png
public/images/blog/diseno-instruccional/completaste-el-curso-pero-aprendiste-algo-960w.webp
```

**Public URL base:** `/images/blog/{entryId}` (no trailing slash).

Helpers: `blogImagePublicBase()`, `blogImageMasterPath()` in `blogImageContract.ts`.

---

## When to run `pnpm optimize:blog`

Run after:

- Adding a new `*-original.png` master
- Replacing an existing master with new art
- Changing width list in `blogImageContract.ts` (update script too)

**Command:** `pnpm optimize:blog` → `scripts/optimize-blog-images.sh`

| Usage                                           | Behavior                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| `pnpm optimize:blog`                            | Process **all** `*-original.png` under `src/assets/images/blog/`                     |
| `sh scripts/optimize-blog-images.sh {entry-id}` | Single bundle, e.g. `diseno-instruccional/completaste-el-curso-pero-aprendiste-algo` |

### Prerequisites

- `cwebp` (`brew install webp`)
- `magick` / ImageMagick with AVIF support (`brew install imagemagick`)

### What the script produces

For each width in `WIDTHS`, three files:

```
{entryId}-400w.avif
{entryId}-400w.webp
{entryId}-400w.jpg
… (through 3840w)
```

Quality defaults: AVIF 50, WebP 70, JPEG 76.

---

## Resolution at build time

**File:** `src/lib/blog-image.ts`

| Function                           | Purpose                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `resolveBlogEntryImageSlug(entry)` | Hero slug: `heroImage` frontmatter override, else `entry.id` if derivatives exist |
| `blogImageBundleExists(entryId)`   | Filesystem check for `-960w.webp` in `public/images/blog/`                        |
| `buildBlogPictureProps()`          | AVIF + WebP `<source>` + JPEG fallback `<img>`                                    |
| `blogImageOgUrl(entryId)`          | Social preview: `{base}-1920w.jpg`                                                |

**Rule:** If derivatives are missing, components show **placeholder** — no broken images.

---

## Components and surfaces

| Component                   | `sizes` preset | Surface                     |
| --------------------------- | -------------- | --------------------------- |
| `BlogResponsiveImage.astro` | prop           | Shared `<picture>` wrapper  |
| `BlogArticleBanner.astro`   | `banner`       | Full-bleed article hero     |
| `BlogArticleCard.astro`     | `card`         | Blog index grid             |
| `BlogRelatedCard.astro`     | `related`      | Article footer related grid |

### OG vs card vs banner

| Use                | Asset                                     | Notes                                                   |
| ------------------ | ----------------------------------------- | ------------------------------------------------------- |
| **Banner**         | Responsive srcset, `sizes: banner`        | Full viewport width; `loading="eager"` on LCP hero      |
| **Card / related** | Same bundle, `sizes: card` or `related`   | Smaller displayed size → browser picks lower width      |
| **OG / Twitter**   | Fixed `-1920w.jpg` via `blogImageOgUrl()` | Passed to `BaseLayout` `image` prop in `BlogPostLayout` |

All surfaces share the **same entry id bundle** — one master, many derivatives.

---

## `heroImagePosition` / crop anchors

**Frontmatter** (see `content.config.ts`):

```yaml
# Shorthand — desktop only; mobile defaults to center
heroImagePosition: center 35%

# Explicit mobile + desktop
heroImagePosition:
  mobile: center 40%
  desktop: center 25%
```

**Resolver:** `src/lib/blog-hero-position.ts` → `resolveHeroImagePosition()`

- Shorthand string → `{ mobile: 'center', desktop: value }`
- Values sanitized against `^[\w\s%.-]+$` — invalid values ignored
- Applied as CSS `object-position` on banner image (via CSS variables in `BlogArticleBanner`)

Adjust when subject is cropped awkwardly on mobile vs desktop.

---

## Placeholders and index sync

| Item                              | Detail                                              |
| --------------------------------- | --------------------------------------------------- |
| `pnpm generate:blog-placeholders` | Regenerates `src/data/blogPlaceholders.ts` from MDX |
| Skips                             | `draft: true` posts                                 |
| Sets `heroImageSlug`              | When derivatives exist for entry id                 |
| **Do not hand-edit**              | `blogPlaceholders` array — always regenerate        |

Run placeholder regen after publishing posts or adding images so the blog index shows correct cards.

---

## Product asset mapping

`blogImageAssetMapping` in `blogImageContract.ts` tracks proposed/confirmed PNG → post mappings. Do not move/rename root art until row is `confirmed`.

---

## Required check (MANDATORY)

> **Never reference only a master path in production HTML without optimized derivatives.**

| ❌ Wrong                                                | ✅ Correct                                          |
| ------------------------------------------------------- | --------------------------------------------------- |
| `<img src="/src/assets/...">`                           | Run `pnpm optimize:blog`; use `BlogResponsiveImage` |
| Frontmatter `heroImage` pointing at missing derivatives | Ensure `blogImageBundleExists()` returns true       |
| Commit master without running script                    | CI/build may pass but users see placeholders        |

Verify locally:

1. Master exists: `src/assets/images/blog/{entryId}-original.png`
2. Derivatives exist: `public/images/blog/{entryId}-960w.webp` (and siblings)
3. Article banner shows photo, not mono placeholder caption

---

## Optional frontmatter override

`heroImage` — explicit public path when bundle id differs from `entry.id`:

```yaml
heroImage: /images/blog/custom-bundle-id
```

Parsed by `parseBlogImageSlugFromPath()`; still requires derivatives under that id.

---

## Related files

| File                                          | Role                          |
| --------------------------------------------- | ----------------------------- |
| `scripts/optimize-blog-images.sh`             | Derivative generation         |
| `scripts/generate-blog-placeholders.mjs`      | Index card image slugs        |
| `src/components/blog/BlogArticleBanner.astro` | Hero + position CSS           |
| `src/layouts/BlogPostLayout.astro`            | Passes OG image to BaseLayout |

## Related files

| Contract / file                                                     | Role                         |
| ------------------------------------------------------------------- | ---------------------------- |
| [`src/data/blogImageContract.ts`](../src/data/blogImageContract.ts) | Widths, paths, asset mapping |
| [`src/lib/blog-image.ts`](../src/lib/blog-image.ts)                 | Srcset / OG URL helpers      |
| [`src/lib/blog-hero-position.ts`](../src/lib/blog-hero-position.ts) | Crop anchor resolver         |

← Back to [`docs/AI-README.md`](AI-README.md)
