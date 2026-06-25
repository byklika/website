# Contact forms — sheet, inline, popup

Contact UI and Web3Forms submission pipeline. Overview: [`docs/AI-README.md`](AI-README.md).

---

## Surfaces

| Surface                                | Component                       | Form id / surface                            | Env key                             |
| -------------------------------------- | ------------------------------- | -------------------------------------------- | ----------------------------------- |
| **Contact sheet** (drawer)             | `Sheet.astro` + `ContactForm`   | `contact-sheet-form`, `form_location: sheet` | `PUBLIC_WEB3FORMS_ACCESS_KEY`       |
| **Inline form** (homepage `#contacto`) | `Contact.astro` + `ContactForm` | default id, `form_location: inline`          | `PUBLIC_WEB3FORMS_ACCESS_KEY`       |
| **Email signup popup**                 | `EmailSignupPopup.astro`        | separate form attrs                          | `PUBLIC_WEB3FORMS_POPUP_ACCESS_KEY` |

---

## Contract source of truth

**File:** `src/data/contactSheetContract.ts`

| Export                         | Purpose                                          |
| ------------------------------ | ------------------------------------------------ |
| `contactSheetCopy`             | Sheet title + intro                              |
| `contactSheetFieldContract`    | Field labels, placeholders, omitted `name` field |
| `contactSheetTriggers`         | Components that open `#contact-sheet`            |
| `contactSheetRegressionChecks` | Payload keys, forbidden keys                     |

### Production fields (locked)

| Field   | Name                                                 | Required |
| ------- | ---------------------------------------------------- | -------- |
| Email   | `email`                                              | yes      |
| Message | `message`                                            | no       |
| Hidden  | `access_key`, `project_stage`, `botcheck` (honeypot) | —        |

**Never add `name`** to DOM or payload — board contract is email + message only.

---

## Sheet UI

### Components

| File                                         | Role                                               |
| -------------------------------------------- | -------------------------------------------------- |
| `src/components/Sheet.astro`                 | Overlay + panel shell (`variant="contact"`)        |
| `src/components/layout/SiteBodyChrome.astro` | Wires sheet + `ContactForm idBase="contact-sheet"` |
| `src/components/ContactForm.astro`           | Shared form markup (inline + sheet tones)          |

### Stable DOM contract (do not regress)

| Attribute / id | Value                                                                           |
| -------------- | ------------------------------------------------------------------------------- |
| Sheet root id  | `contact-sheet`                                                                 |
| Form id        | `contact-sheet-form`                                                            |
| Open triggers  | `data-sheet-open="contact-sheet"`                                               |
| Sheet hooks    | `data-sheet-root`, `data-sheet-panel`, `data-sheet-overlay`, `data-sheet-close` |
| Form marker    | `data-form-surface="sheet"` on form wrapper                                     |

### Behavior (`src/scripts/sheet.ts`)

- Focus trap while open
- Close: Esc, overlay click, close button
- **`contact_cta_click`** analytics on open (placement inferred from trigger DOM)
- Background `inert` + `aria-hidden` on page content

---

## Form submission pipeline

```
ContactForm.astro
    ↓ submit (preventDefault)
contactForms.ts
    ↓ buildContactFormPayload()
contactFormPayload.ts
    ↓ POST JSON
web3formsSubmit.ts → https://api.web3forms.com/submit
    ↓ success
analytics bus → contact_form_submit
```

### Payload builder

**File:** `src/lib/contactFormPayload.ts`

```ts
{
  access_key: string,
  email: string,
  message: string,
  subject: 'Contact form — byklika.com',
  project_stage?: string  // when non-empty
}
```

### Tests

**File:** `src/lib/contactFormPayload.test.ts`

- Asserts required keys present
- Asserts `name` and `botcheck` **not** in payload
- `project_stage` included only when non-empty

Run: `pnpm test`

---

## Project stage prefill

**File:** `src/scripts/projectStage.ts`

Hidden input `project_stage` on contact forms. Prefilled when user opens sheet from contextual CTAs (e.g. service cards, blog read-more via `data-contact-source`).

Service-specific triggers listed in `contactSheetTriggers` in contract.

---

## Email signup popup

**Separate path** from main contact form:

| Item      | Detail                                                     |
| --------- | ---------------------------------------------------------- |
| Component | `EmailSignupPopup.astro` (homepage)                        |
| Script    | `src/scripts/emailSignupPopup.ts`                          |
| Env       | `PUBLIC_WEB3FORMS_POPUP_ACCESS_KEY`                        |
| Subject   | `'Email signup popup — byklika.com'`                       |
| Behavior  | Timed / scroll-triggered overlay; localStorage "seen" flag |

Uses same `submitToWeb3Forms()` helper but **different access key** — configure separately in Web3Forms dashboard with domain restriction.

---

## Environment variables

| Variable                            | Purpose                     |
| ----------------------------------- | --------------------------- |
| `PUBLIC_WEB3FORMS_ACCESS_KEY`       | Contact sheet + inline form |
| `PUBLIC_WEB3FORMS_POPUP_ACCESS_KEY` | Email popup                 |

- Copy from [`.env.example`](../.env.example) to `.env.local`
- **Never commit** real keys
- Restrict by domain in Web3Forms dashboard
- Must be set on Vercel for production forms to work

When key missing, `ContactForm.astro` shows configuration alert and disables submit.

---

## Analytics events

| Event                 | When                      |
| --------------------- | ------------------------- |
| `contact_cta_click`   | User opens contact sheet  |
| `contact_form_submit` | Web3Forms returns success |

See [`docs/analytics.md`](analytics.md).

---

## Common tasks

| Task                     | Edit                                                                       |
| ------------------------ | -------------------------------------------------------------------------- |
| Change sheet title/intro | `contactSheetCopy` in contract                                             |
| Change field labels      | `contactSheetFieldContract.production`                                     |
| Add sheet trigger        | Add `data-sheet-open="contact-sheet"` + list in `contactSheetTriggers`     |
| Change payload shape     | `contactFormPayload.ts` + contract + tests — **coordinate with Web3Forms** |

---

## Regression checklist

Before merging contact changes:

- [ ] `pnpm test` — payload tests pass
- [ ] Sheet opens/closes; focus trap works
- [ ] Submit succeeds with valid key in `.env.local`
- [ ] No `name` field in HTML or network payload
- [ ] GA events fire (dev: `debug_mode` in GA config)

## Related files

| Contract / file                                                           | Role                       |
| ------------------------------------------------------------------------- | -------------------------- |
| [`src/data/contactSheetContract.ts`](../src/data/contactSheetContract.ts) | Sheet copy, field contract |
| [`src/lib/contactFormPayload.ts`](../src/lib/contactFormPayload.ts)       | Payload builder            |
| [`src/lib/web3formsSubmit.ts`](../src/lib/web3formsSubmit.ts)             | HTTP submit helper         |

← Back to [`docs/AI-README.md`](AI-README.md)
