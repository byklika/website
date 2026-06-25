# Byklika website

Marketing site for [Klika](https://byklika.com) — an Argentine e‑learning studio specializing in instructional design. Built with Astro 7, Tailwind 4, and MDX content collections; deployed on Vercel. Primary language: Spanish (`es` / `es_AR`).

## Quick start

Requires Node ≥ 22.12 and [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev      # local dev server
pnpm build    # production build
pnpm test     # unit tests (Vitest)
```

## Documentation

- **AI & contributor guide → [`docs/AI-README.md`](docs/AI-README.md)** — architecture, contracts, required checks, and common tasks.
- **Workplans → [`docs/workplan-template.md`](docs/workplan-template.md)** — copy for multi-step initiatives; live trackers in [`docs/workplans/`](docs/workplans/README.md).
- **Doc validation → `pnpm docs:check`** — link integrity and smoke-test file targets ([`docs/smoke-test.md`](docs/smoke-test.md)).
- **PR checklist → [`.github/pull_request_template.md`](.github/pull_request_template.md)** — required checks before merge.
