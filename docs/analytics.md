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

| Integration        | Env var                        | Loads when                                                |
| ------------------ | ------------------------------ | --------------------------------------------------------- |
| Google Analytics 4 | `PUBLIC_GA_MEASUREMENT_ID`     | Var set at build                                          |
| Microsoft Clarity  | `PUBLIC_CLARITY_PROJECT_ID`    | Var set at build                                          |
| GrowthBook         | `PUBLIC_GROWTHBOOK_CLIENT_KEY` | Var set at build (see [`experiments.md`](experiments.md)) |

---

## SiteAnalytics.astro

- Inlines gtag bootstrap with **`send_page_view: false`** — sends one explicit `page_view` event (avoids double count)
- Dev mode: `debug_mode: true` on gtag config
- Calls `initAnalytics()` from bus (attaches GA forwarder)
- GrowthBook block deferred when client key present

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

- GA4 and Clarity load when env vars are set (no consent gate)
- Anonymous GrowthBook id stored in `gb_anon_id` cookie + localStorage
- If Product adds consent requirements, gate script injection in `SiteAnalytics.astro`

---

## Related files

| Contract / file                                                               | Role                                 |
| ----------------------------------------------------------------------------- | ------------------------------------ |
| [`src/lib/analytics/types.ts`](../src/lib/analytics/types.ts)                 | Event name + param types             |
| [`src/lib/analytics/bus.ts`](../src/lib/analytics/bus.ts)                     | `publish()` / `subscribe()`          |
| [`src/components/SiteAnalytics.astro`](../src/components/SiteAnalytics.astro) | GA4 / Clarity / GrowthBook bootstrap |

← Back to [`docs/AI-README.md`](AI-README.md) · Experiments: [`experiments.md`](experiments.md)
