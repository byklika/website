# Analytics — GA4 and event bus

Client-side analytics architecture. Overview: [`docs/AI-README.md`](AI-README.md).

---

## Architecture

```
src/scripts/*.ts  ──publish()──►  src/lib/analytics/bus.ts
                                         │
                                         ├── ga4Subscriber.ts → window.gtag
                                         └── (future subscribers)
```

**Bootstrap:** `src/components/SiteAnalytics.astro` (included via `SiteBodyChrome.astro` on every page)

| Integration        | Env var                        | Loads when                                                                       |
| ------------------ | ------------------------------ | -------------------------------------------------------------------------------- |
| Google Analytics 4 | `PUBLIC_GA_MEASUREMENT_ID`     | After `window` `load`, then `requestIdleCallback` (8 s timeout fallback)         |
| Microsoft Clarity  | `PUBLIC_CLARITY_PROJECT_ID`    | First user interaction (`scroll`, `click`, `keydown`, `touchstart`)              |
| GrowthBook         | `PUBLIC_GROWTHBOOK_CLIENT_KEY` | After `window` `load`, then dynamic import + `requestIdleCallback` (8 s timeout) |

---

## SiteAnalytics.astro

- **Deferred boot** (`src/lib/analytics/deferredBoot.ts`): GA4 and GrowthBook load after `load` + idle; Clarity loads on first interaction (skipped during Lighthouse lab runs)
- GA4 uses **`send_page_view: false`** on config — sends one explicit `page_view` after `gtag.js` loads (avoids double count)
- Dev mode: `debug_mode: true` on gtag config
- Calls `initAnalytics()` from bus (attaches GA forwarder; bus events no-op until `window.gtag` exists)
- GrowthBook SDK is code-split; `init()` runs after `load` + idle when client key present

### Duplicate GA measurement IDs

The site injects **one** tag via `PUBLIC_GA_MEASUREMENT_ID`. If Lighthouse or DevTools shows a second `gtag/js` request (e.g. `G-…&cx=c&gtm=…`), it is not from this repo — check GA4 Admin for linked Google tags / GTM containers or remove the extra property from the linked stream.

**Build-time inlining:** `import.meta.env.PUBLIC_*` is replaced at build. Production HTML omits GA unless var is set on Vercel **and** site is redeployed.

---

## Event bus

**Files:** `src/lib/analytics/`

| File               | Role                                          |
| ------------------ | --------------------------------------------- |
| `bus.ts`           | `publish()`, `subscribe()`, `initAnalytics()` |
| `types.ts`         | Typed event names + param shapes              |
| `ga4Subscriber.ts` | Maps bus events → `gtag('event', …)`          |
| `index.ts`         | Re-exports                                    |
| `bus.test.ts`      | Unit tests                                    |

### API

```ts
import { publish } from '~/lib/analytics/bus';

publish({
  name: 'contact_form_submit',
  params: { form_location: 'sheet' }
});
```

- Subscribers run synchronously
- GA forwarder auto-attaches on first `publish` (or via `initAnalytics()`)
- Subscriber errors in dev are logged; other subscribers still run

---

## Event catalog

Defined in `src/lib/analytics/types.ts`:

| Event                 | Params                                             | Emitted from                    |
| --------------------- | -------------------------------------------------- | ------------------------------- |
| `experiment_viewed`   | `experiment_id`, `variation_id`, `debug_mode?`     | `growthbookTrackingCallback.ts` |
| `nav_item_click`      | `experiment_key`, `variant`, `label_shown`, `href` | `header-nav.ts`                 |
| `contact_cta_click`   | `placement`, `sheet_id`                            | `sheet.ts` (on sheet open)      |
| `contact_form_submit` | `form_location`: `'sheet'` \| `'inline'`           | `contactForms.ts` (on success)  |

### Placement values for `contact_cta_click`

Inferred in `sheet.ts`: `header`, `footer`, `cta_block`, `service_card`, `blog_card`, `servicios`, `main`, `other`.

---

## Adding a new event

1. **Add to `AnalyticsEventMap`** in `types.ts`:

```ts
export type AnalyticsEventMap = {
  // …existing
  my_new_event: {
    button_id: string;
    page_path: string;
  };
};
```

2. **Forward in `ga4Subscriber.ts`**:

```ts
case 'my_new_event':
  window.gtag('event', 'my_new_event', event.params);
  break;
```

3. **Emit from client script** (`src/scripts/`):

```ts
import { publish } from '~/lib/analytics/bus';

publish({ name: 'my_new_event', params: { button_id: 'hero-cta', page_path: location.pathname } });
```

4. **Test** in `bus.test.ts` (see patterns below)

Use **snake_case** event names matching GA4 convention.

---

## Testing

**Run:** `pnpm test` → includes `src/lib/analytics/bus.test.ts`

Patterns:

```ts
import { publish, subscribe, resetAnalyticsBusForTests } from './bus';

beforeEach(() => {
  resetAnalyticsBusForTests();
  vi.unstubAllGlobals();
});

it('forwards to gtag when present', () => {
  const gtag = vi.fn();
  vi.stubGlobal('gtag', gtag);

  publish({ name: 'contact_form_submit', params: { form_location: 'inline' } });

  expect(gtag).toHaveBeenCalledWith('event', 'contact_form_submit', {
    form_location: 'inline'
  });
});
```

Test subscribe/unsubscribe and subscriber error isolation.

---

## Privacy / consent

**Status:** No cookie consent banner or CMP integration yet.

- GA4 loads on idle; Clarity loads only after user interaction (no consent gate yet)
- Optional before Clarity load: `window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })` — see [Microsoft ConsentV2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2)
- Anonymous GrowthBook id stored in `gb_anon_id` cookie + localStorage
- If Product adds consent requirements, gate `loadClarity` / `loadGa4` in `deferredBoot.ts`

---

## Related files

| Contract / file                                                               | Role                                 |
| ----------------------------------------------------------------------------- | ------------------------------------ |
| [`src/lib/analytics/types.ts`](../src/lib/analytics/types.ts)                 | Event name + param types             |
| [`src/lib/analytics/bus.ts`](../src/lib/analytics/bus.ts)                     | `publish()` / `subscribe()`          |
| [`src/components/SiteAnalytics.astro`](../src/components/SiteAnalytics.astro) | GA4 / Clarity / GrowthBook bootstrap |

← Back to [`docs/AI-README.md`](AI-README.md) · Experiments: [`experiments.md`](experiments.md)
