/**
 * Contact sidedrawer — design inventory and behavior contract (Iteration 1).
 *
 * Visual reference: `Klika Articulo - standalone.html` line 181 (`#panel` / `.contact-panel`).
 * Use markup/CSS as **visual reference only** — production behavior stays in `sheet.ts`.
 *
 * Standalone structure (in scope for restyle):
 *   `.panel-overlay` — dim + blur backdrop
 *   `.contact-panel` — 480px right drawer, `bg-klika-cream`, scrollable column
 *   `.panel-close` — circular bordered close (top, before title)
 *   `h3` — serif heading
 *   intro `p` — muted lead copy
 *   `.form-group` — label + input/textarea
 *   `.form-submit` — full-width coral pill
 *
 * Out of scope: standalone `openPanel()` / `closePanel()` scripts, Name field, new API routes.
 *
 * Primary touchpoints (Iterations 2–4):
 *   - `src/components/Sheet.astro` — overlay, panel width, close placement
 *   - `src/components/layout/SiteBodyChrome.astro` — title + intro copy wiring
 *   - `src/components/ContactForm.astro` — sheet field/submit styling (`idBase === 'contact-sheet'`)
 *   - `src/styles/global.css` — optional `.contact-sheet-*` rules Tailwind cannot express
 *
 * Unchanged behavior (do not regress):
 *   - Sheet id: `contact-sheet` (`#contact-sheet`)
 *   - Form id: `contact-sheet-form` (`ContactForm` `idBase="contact-sheet"`)
 *   - `data-form-surface="sheet"` on form root
 *   - Open/close: `data-sheet-open`, `data-sheet-close`, `data-sheet-root`, `data-sheet-panel`,
 *     `data-sheet-overlay` — logic in `src/scripts/sheet.ts` (focus trap, Esc, overlay click)
 *   - Submit: `src/scripts/contactForms.ts` → Web3Forms (`PUBLIC_WEB3FORMS_ACCESS_KEY`)
 *   - Payload keys: `access_key`, `email`, `message`, optional `project_stage`, honeypot `botcheck`
 *   - GA4: `contact_cta_click` (sheet.ts), `contact_form_submit` with `form_location: sheet`
 *   - Context: `src/scripts/projectStage.ts` — `project_stage` hidden input + blog read-more message
 *
 * Design token → Tailwind mapping:
 *   --crema (#FAF8F3)      → bg-klika-cream (site cream #F2F5EE is close; panel uses cream)
 *   --oscuro (#1E2A1A)     → text-klika-dark
 *   --verde (#4A6741)      → text-klika-moss / border-klika-moss/20
 *   --gris-suave (#8fa08c) → text-klika-muted
 *   --coral (#F26A3A)      → bg-klika-coral / hover:bg-klika-coralHover / shadow-btnPrimary
 *
 * Panel metrics (standalone): width `min(480px, 100vw)`, padding `2.4rem 2.5rem`,
 * overlay `rgba(30,42,26,.55)` + `backdrop-filter: blur(4px)`.
 * Today: `sm:max-w-[min(92vw,26rem)]` (~416px) — widen in Iteration 2.
 */

/** Target sheet copy from standalone `.contact-panel` (Iterations 3–4). */
export const contactSheetCopy = {
  title: 'Hablemos.',
  intro: 'Contanos en qué estás trabajando. Respondemos en menos de 24 horas hábiles.'
} as const;

/**
 * Standalone vs production field mapping.
 * Name row is omitted in production — never add `name` to DOM or Web3Forms payload.
 */
export const contactSheetFieldContract = {
  production: [
    {
      standaloneLabel: 'Email',
      name: 'email',
      type: 'email',
      required: true,
      productionLabel: 'EMAIL',
      productionPlaceholder: 'tu@correo.com',
      standalonePlaceholder: 'tu@empresa.com'
    },
    {
      standaloneLabel: 'Contanos sobre tu proyecto',
      name: 'message',
      type: 'textarea',
      required: false,
      productionLabel: 'Contanos sobre tu proyecto',
      productionPlaceholder: '¿En qué etapa de tu proyecto estás? ¿Qué necesitás?',
      standalonePlaceholder: '¿Qué necesitás resolver?'
    }
  ],
  omittedFromStandalone: [
    {
      standaloneLabel: 'Tu nombre',
      standalonePlaceholder: '¿Cómo te llamás?',
      reason: 'Board contract — email + message only'
    }
  ],
  hidden: [
    { name: 'access_key', source: 'PUBLIC_WEB3FORMS_ACCESS_KEY' },
    { name: 'project_stage', source: 'projectStage.ts / service-card triggers' },
    { name: 'botcheck', source: 'honeypot — must stay empty' }
  ],
  submit: {
    productionLabel: 'Enviar →',
    standaloneLabel: 'Enviar mensaje →',
    layout: 'standalone: full-width pill; production today: inline partial width'
  }
} as const;

/** Files that open `#contact-sheet` via `data-sheet-open="contact-sheet"`. */
export const contactSheetTriggers = [
  'src/components/Header.astro',
  'src/components/Footer.astro',
  'src/components/CTA.astro',
  'src/components/sections/Services.astro',
  'src/components/cards/ServiceCard.astro',
  'src/components/blog/BlogIndexSection.astro',
  'src/components/blog/BlogArticleCta.astro'
] as const;

/**
 * Regression guardrails (Iteration 5).
 * Payload builder: `~/lib/contactFormPayload.ts` + `contactFormPayload.test.ts`.
 * Blog read-more → sheet: optional `data-contact-source="blog-read-more"` on triggers;
 * `projectStage.ts` prefills message when set (card links use `href` when posts exist).
 */
export const contactSheetRegressionChecks = {
  payloadKeys: ['access_key', 'email', 'message', 'subject', 'project_stage'] as const,
  forbiddenPayloadKeys: ['name'] as const,
  inlineForm: 'src/components/sections/Contact.astro — ContactForm default tone="dark", no idBase'
} as const;
