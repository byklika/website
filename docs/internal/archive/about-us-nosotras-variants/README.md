# About Us — Nosotras section variants (archived)

**Status:** Removed from the public homepage (not built or served). Kept for a possible future revamp.

**Archived:** 2026-05-18  
**Live section:** `src/components/sections/AboutUs.astro` (`#nosotras`, class `about-us-component`)

## Variants

| Version | CSS root class | Section id | File |
|--------|----------------|------------|------|
| v2 | `about-us-nosotras-v2-component` | `#nosotras-v2` | `AboutUsNosotrasV2.astro` |
| v3 | `about-us-nosotras-v3-component` | `#nosotras-v3` | `AboutUsNosotrosV3.astro` |
| v4 | `about-us-nosotras-v4-component` | `#nosotras-v4` | `AboutUsNosotrosV4.astro` |

### Design notes

- **v2:** Thesis-style ingredient grid; left gradient + coral bar; portrait tiles ~4:5 (`/about-us/*` responsive sets).
- **v3:** Image cards with bottom gradient; hover scale on image; description line-clamp.
- **v4:** Mobile card grid + desktop numbered story rows; teasers + “Leer más”; radial background on large screens.

All variants share the same props as `AboutUs`: `eyebrow`, `title`, `items` (`Item[]` from `AboutUs.astro`).

## Assets

Optimized images remain in `public/about-us/` (not removed with this archive).

## Restore to homepage

1. Copy the desired `.astro` file(s) back to `src/components/sections/`.
2. In `src/pages/index.astro`, import and render below `<AboutUs />` with `items={nosotrasAboutItems}` (same copy as today).
3. Fix imports if paths changed (`~/lib/helpers`, `SectionHeading`, `AboutUs.astro` types).

Example (v2):

```astro
import AboutUsNosotrasV2 from '~/components/sections/AboutUsNosotrasV2.astro';

<AboutUsNosotrasV2
  class="homepage-section homepage-section-about-v2"
  eyebrow="Nosotras"
  title="¿Por qué Klika?"
  items={nosotrasAboutItems}
/>
```
