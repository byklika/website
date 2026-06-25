# Documentation validation — smoke tests

Proves the agent doc set works for real tasks (see [`docs/workplans/README.md`](workplans/README.md) for initiative tracking).

## Automated checks

```bash
pnpm docs:check
```

Verifies:

- Entry points, topic guides, and `*Contract.ts` files exist
- Relative markdown links in `docs/` resolve to real files
- Seven agent smoke scenarios have guides + target files (see below)

CI runs `docs:check` on pull requests (non-blocking).

---

## Agent smoke prompts (manual)

Run each prompt in a **fresh** Cursor or Claude Code session with only the repo + rules loaded.

**Pass criteria:** Agent opens or cites the expected files without inventing APIs.

| #   | Prompt                                      | Expected first open / cite                                                                                                |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Add a new blog post in diseño instruccional | [`blog-content.md`](blog-content.md), [`content.config.ts`](../src/content.config.ts)                                     |
| 2   | Change the homepage SEO title               | [`seoOnPageContract.ts`](../src/data/seoOnPageContract.ts) — not hardcoded in `index.astro`                               |
| 3   | Add hero image for a new article            | [`blog-images.md`](blog-images.md), `pnpm optimize:blog`                                                                  |
| 4   | Add JSON-LD for a new page type             | [`seo-geo.md`](seo-geo.md), [`schema.ts`](../src/lib/seo/schema.ts), [`JsonLd.astro`](../src/components/seo/JsonLd.astro) |
| 5   | Change Nosotras nav label via experiment    | [`experiments.md`](experiments.md), [`nav-nosotras-label.ts`](../src/lib/experiments/nav-nosotras-label.ts)               |
| 6   | Track a button click in GA4                 | [`analytics.md`](analytics.md), analytics bus                                                                             |
| 7   | Update contact sheet copy                   | [`contactSheetContract.ts`](../src/data/contactSheetContract.ts)                                                          |

**Exit criteria:** ≥ 6/7 manual agent prompts pass. Automated `docs:check` validates file targets for all 7.

---

## Human contributor test (manual)

A non-author follows [`README.md`](../README.md) and publishes a **draft** blog post end-to-end in under 30 minutes.

Checklist:

1. [ ] Clone repo, `pnpm install`, `pnpm dev`
2. [ ] Read [`blog-content.md`](blog-content.md) + [`blog-images.md`](blog-images.md)
3. [ ] Create `src/content/blog/{category}/{slug}.mdx` with `draft: true`
4. [ ] Add hero master → `pnpm optimize:blog`
5. [ ] Set `draft: false`, run `pnpm generate:blog-placeholders`
6. [ ] Verify article URL and index card locally
7. [ ] Run `pnpm typecheck && pnpm test && pnpm build`

Record date and contributor when completed.

---

← Back to [`docs/AI-README.md`](AI-README.md)
