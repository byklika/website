# Byklika website (Astro)

**Before editing this repo, read [`docs/AI-README.md`](docs/AI-README.md) for the full guide.**

**Task-specific guides** — open the relevant doc before making changes:

- Blog posts / MDX → [`docs/blog-content.md`](docs/blog-content.md)
- Blog images → [`docs/blog-images.md`](docs/blog-images.md)
- SEO / JSON-LD / `llms.txt` → [`docs/seo-geo.md`](docs/seo-geo.md)
- GrowthBook experiments → [`docs/experiments.md`](docs/experiments.md)
- Analytics events → [`docs/analytics.md`](docs/analytics.md)
- Contact sheet / forms → [`docs/contact-forms.md`](docs/contact-forms.md)
- Deploy / Vercel → [`docs/deployment.md`](docs/deployment.md)

[`docs/AI-README.md`](docs/AI-README.md) is the single source of truth. It covers stack, directory layout, contracts, required review checks, and common tasks.

**Contracts:** `src/data/*Contract.ts` files are the source of truth for site copy, SEO constants, and structured data — edit contracts, not hardcoded strings in components.

**Initiatives:** For multi-step work, copy [`docs/workplan-template.md`](docs/workplan-template.md) → [`docs/workplans/<slug>.md`](docs/workplans/README.md) before coding.
