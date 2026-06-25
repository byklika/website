# Experiments — GrowthBook

Feature flags and A/B tests via GrowthBook. Overview: [`docs/AI-README.md`](AI-README.md).

---

## Environment setup

| Variable                       | Required        | Purpose                                                                |
| ------------------------------ | --------------- | ---------------------------------------------------------------------- |
| `PUBLIC_GROWTHBOOK_CLIENT_KEY` | For experiments | Browser SDK key (safe in HTML); also used to fetch feature definitions |

Set in `.env.local` for dev; **must be set on Vercel for production builds** that should run experiments.

When unset:

- GrowthBook script block omitted from `SiteAnalytics.astro`
- Nav label experiment falls back to SSR default from `siteNav.ts`

See [`.env.example`](../.env.example).

---

## File layout

```
src/lib/experiments/
├── constants.ts                    # Flag key constants
├── nav-nosotras-label.ts           # Label normalization + fallback
└── growthbookTrackingCallback.ts   # Exposure → analytics bus

src/components/SiteAnalytics.astro  # GrowthBook init + window.growthbook
src/components/Header.astro         # SSR fallback label + experiment config JSON
src/scripts/header-nav.ts           # Client: evalFeature, apply label, track clicks
```

---

## Published flag: Nosotras nav label

**Constant:** `NAV_NOSOTRAS_FLAG_KEY = 'nav-nosotras-label-v2'` in `src/lib/experiments/constants.ts`

| Item           | Detail                                                                |
| -------------- | --------------------------------------------------------------------- |
| Feature type   | String — visible nav label text                                       |
| Variation keys | `"0"` = control, `"1"` … = treatments                                 |
| Hash attribute | `id` (anonymous id from cookie/localStorage)                          |
| Fallback       | `getNavNosotrasLabelFallback()` → `siteNav.ts` label for `/#nosotras` |

### Pattern: read flag → render variant → track

**1. SSR fallback** (`Header.astro`):

- Renders default label from `siteNav.ts` on `[data-nav-nosotras-label="true"]` links
- Embeds config JSON in `#header-nav-experiment`:

```json
{ "flagKey": "nav-nosotras-label-v2", "fallback": "Nosotras", "growthbookEnabled": true }
```

**2. Client init** (`SiteAnalytics.astro`):

- Creates `GrowthBook` with `trackingCallback: growthbookTrackingCallback`
- Sets `window.growthbook`; dispatches `growthbook:ready`
- Anonymous id: cookie `gb_anon_id` + `localStorage` sync

**3. Apply variant** (`header-nav.ts`):

```ts
const fr = gb.evalFeature(cfg.flagKey);
const label = normalizeNavNosotrasLabel(fr.value, cfg.fallback);
applyNosotrasLabel(label);
```

**4. Track exposure** (`growthbookTrackingCallback.ts`):

```ts
publish({
  name: 'experiment_viewed',
  params: { experiment_id: experiment.key, variation_id: result.key }
});
```

**5. Track click** (`header-nav.ts`):

```ts
publish({
  name: 'nav_item_click',
  params: { experiment_key, variant, label_shown, href: '/#nosotras' }
});
```

---

## Anonymous ID

**Cookie:** `GB_ANON_ID_COOKIE = 'gb_anon_id'` (`constants.ts`)

Must match between `SiteAnalytics.astro` (GrowthBook attributes) and any server-side bucketing. Cookie is **not httpOnly** so JS can read/write.

Without `id` attribute, GrowthBook never fires `trackingCallback` — no GA `experiment_viewed` events.

---

## Smoke test: `pnpm test:growthbook-flags`

**Script:** `scripts/test-growthbook-flags.mjs`

Run when:

- Adding or changing flag keys
- Debugging "flag not appearing in production"
- Verifying SDK connection after GrowthBook dashboard changes

```bash
PUBLIC_GROWTHBOOK_CLIENT_KEY=your_key pnpm test:growthbook-flags
```

Prints:

- All feature keys + default values + rule counts
- Experiment rules with `variations` arrays
- Exits non-zero on missing key, HTTP error, or encrypted-only payload

Loads `.env.local` / `.env` automatically.

---

## Adding a new experiment (template)

1. Create flag in GrowthBook dashboard; wire to SDK connection
2. Add constant in `src/lib/experiments/constants.ts` — **only document keys that exist in code**
3. SSR: render safe default in Astro component
4. Client: read `window.growthbook.evalFeature(FLAG_KEY)` after `growthbook:ready`
5. Wire `growthbookTrackingCallback` (automatic for exposures)
6. Add typed analytics event if needed (`src/lib/analytics/types.ts`)
7. Run `pnpm test:growthbook-flags` to confirm payload

Do **not** document unpublished flag keys without a code reference.

---

## Debugging checklist

| Symptom                      | Check                                                         |
| ---------------------------- | ------------------------------------------------------------- |
| Label never changes          | `PUBLIC_GROWTHBOOK_CLIENT_KEY` set at **build** time?         |
| No `experiment_viewed` in GA | `gb.setAttributes({ id: anonId })` present?                   |
| Flag missing in smoke test   | Wrong SDK connection, unpublished flag, or encryption enabled |
| Flash of wrong label         | Expected — SSR shows fallback until `growthbook:ready`        |

---

## Related files

| Contract / file                                                                             | Role                    |
| ------------------------------------------------------------------------------------------- | ----------------------- |
| [`src/lib/experiments/constants.ts`](../src/lib/experiments/constants.ts)                   | Flag key constants      |
| [`src/lib/experiments/nav-nosotras-label.ts`](../src/lib/experiments/nav-nosotras-label.ts) | Nav label helpers       |
| [`src/data/siteNav.ts`](../src/data/siteNav.ts)                                             | SSR fallback nav labels |

← Back to [`docs/AI-README.md`](AI-README.md) · Analytics: [`analytics.md`](analytics.md)
