# Deployment — Vercel

Build, preview, and production deploy pipeline. Overview: [`docs/AI-README.md`](AI-README.md).

---

## Platform

| Item      | Value                              |
| --------- | ---------------------------------- |
| Host      | Vercel                             |
| Framework | Astro (detected via `vercel.json`) |
| Output    | `dist/`                            |
| Config    | [`vercel.json`](../vercel.json)    |

### vercel.json highlights

```json
{
  "buildCommand": "pnpm run build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": "dist",
  "ignoreCommand": "bash ./scripts/vercel-ignore-git-production-on-main.sh"
}
```

- **www → apex redirect:** `www.byklika.com` → `https://byklika.com/:path*` (308)
- **Security headers:** `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`

---

## CI/CD workflows

### Production — `.github/workflows/deploy-vercel.yml`

| Trigger | `push` to `main`, `workflow_dispatch` |
| Steps | checkout → pnpm install → **typecheck** → Vercel CLI pull (production) → `vercel build --prod` → `vercel deploy --prebuilt --prod` |

**Production deploys are owned by GitHub Actions**, not Vercel Git auto-deploy on `main`.

### Preview — `.github/workflows/preview-vercel.yml`

| Trigger | Pull requests (opened, sync, reopened) |
| Skips | Fork PRs (no secrets) |
| Steps | Same as prod through typecheck → Vercel preview build → deploy → **comment preview URL on PR** |

Concurrency groups cancel in-progress deploys per PR/ref.

---

## Ignored build step (avoid double production deploy)

**Script:** `scripts/vercel-ignore-git-production-on-main.sh`

Referenced as `ignoreCommand` in `vercel.json`.

| Condition                                             | Exit code | Effect                      |
| ----------------------------------------------------- | --------- | --------------------------- |
| Vercel Git integration + `production` + branch `main` | **0**     | Skip Vercel-initiated build |
| Everything else                                       | **1**     | Run build                   |

Prevents double-shipping when both Vercel Git integration and GitHub Actions target production.

Preview PR builds on Vercel Git (if enabled) still run unless disabled in dashboard.

---

## Required GitHub secrets

| Secret              | Purpose                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel CLI auth ([account tokens](https://vercel.com/account/tokens)) |
| `VERCEL_ORG_ID`     | Team/org id                                                           |
| `VERCEL_PROJECT_ID` | Project id                                                            |

### Getting org/project ids

```bash
vercel link          # from repo root
pnpm vercel:ci-secrets-hint
```

Prints `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from `.vercel/project.json`.

---

## Environment variables on Vercel

Set in **Vercel → Project → Settings → Environment Variables**.

| Variable                            | Environments                    | Notes                         |
| ----------------------------------- | ------------------------------- | ----------------------------- |
| `PUBLIC_SITE_URL`                   | Production                      | Usually `https://byklika.com` |
| `PUBLIC_GA_MEASUREMENT_ID`          | Production (+ Preview optional) | Inlined at build              |
| `PUBLIC_CLARITY_PROJECT_ID`         | Production                      | Inlined at build              |
| `PUBLIC_GROWTHBOOK_CLIENT_KEY`      | Production (+ Preview)          | Experiments                   |
| `PUBLIC_WEB3FORMS_ACCESS_KEY`       | Production                      | Contact forms                 |
| `PUBLIC_WEB3FORMS_POPUP_ACCESS_KEY` | Production                      | Email popup                   |

**Critical:** Astro inlines `PUBLIC_*` at **build** time. Changing a var requires **redeploy**.

Preview deploys pull env via:

```bash
vercel pull --yes --environment=preview --git-branch="$BRANCH"
```

Production:

```bash
vercel pull --yes --environment=production
```

---

## `PUBLIC_SITE_URL` and canonicals

| Build context | Recommended value                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Production    | `https://byklika.com`                                                                                                     |
| Preview       | Often unset (uses default) or preview URL — canonicals in preview HTML may point at production origin depending on config |

Affects:

- `astro.config.mjs` `site`
- `<link rel="canonical">` in `BaseLayout`
- Sitemap absolute URLs
- `/llms.txt` links

See [`docs/seo-geo.md`](seo-geo.md).

---

## Local commands

| Command          | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Local dev server                         |
| `pnpm build`     | Production build to `dist/`              |
| `pnpm preview`   | Serve `dist/` locally                    |
| `pnpm typecheck` | Required before deploy (also runs in CI) |

CI runs typecheck but **not** full `pnpm test` today — run tests locally before merge.

---

## Branch / PR expectations

| Action                         | Result                                     |
| ------------------------------ | ------------------------------------------ |
| Open PR against `main`         | Preview workflow deploys; bot comments URL |
| Merge to `main`                | Production workflow deploys                |
| Push to feature branch (no PR) | No automatic preview from Actions          |

### Duplicate previews

If Vercel GitHub app **also** builds every PR, you may get two previews. Disable PR builds on one side:

- Vercel dashboard → Git → Ignored Build Step (already skips prod on main), or
- Remove/disable preview workflow

Documented in workflow comments.

---

## Pre-merge checklist

- [ ] `pnpm typecheck && pnpm test && pnpm build` pass locally
- [ ] Env vars documented if new `PUBLIC_*` added
- [ ] Preview URL smoke-tested for changed routes
- [ ] Blog images optimized if new masters added
- [ ] Docs updated if contracts/behavior changed

---

## Related files

| File                                                                              | Role                               |
| --------------------------------------------------------------------------------- | ---------------------------------- |
| [`vercel.json`](../vercel.json)                                                   | Build settings, redirects, headers |
| [`.github/workflows/deploy-vercel.yml`](../.github/workflows/deploy-vercel.yml)   | Production pipeline                |
| [`.github/workflows/preview-vercel.yml`](../.github/workflows/preview-vercel.yml) | PR previews                        |
| [`.github/pull_request_template.md`](../.github/pull_request_template.md)         | PR checklist                       |

← Back to [`docs/AI-README.md`](AI-README.md) · SEO env: [`seo-geo.md`](seo-geo.md)
