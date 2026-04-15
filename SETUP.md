# SETUP.md

## Project: Klika Website (Astro)

This document defines the initial setup steps for building the Klika website using Astro, Tailwind CSS + DaisyUI, and MDX.

---

## 🧠 Agent Profile

Recommended profile from agency-agents:

- **frontend-developer**
- Secondary (optional): **ui-ux-designer**

---

## 🚀 Initial Project Setup

- [x] Create GitHub repository named `website`
- [x] Initialize Astro project
  ```bash
  npm create astro@latest
  ```
- [x] Choose:
  - Minimal starter
  - TypeScript enabled
- [x] Install dependencies
  ```bash
  pnpm install
  ```

---

## 🎨 Styling (Tailwind CSS + DaisyUI)

- [x] Install Tailwind CSS (Astro integration)
  ```bash
  npx astro add tailwind
  ```
- [x] Install DaisyUI + Tailwind plugins we use
  ```bash
  pnpm add -D daisyui @tailwindcss/typography
  ```
- [x] Configure Tailwind in `tailwind.config.mjs`
  - Add DaisyUI + typography plugins
  - Enable DaisyUI themes (start with `light` + `dark`)

  Example `tailwind.config.mjs`:

  ```js
  /** @type {import('tailwindcss').Config} */
  export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {}
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
    daisyui: {
      themes: ['light', 'dark']
    }
  };
  ```

- [x] Ensure global Tailwind styles are included
  - If `astro add tailwind` created `src/styles/global.css`, ensure it contains:

  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

- [ ] (Recommended) Add DaisyUI theme toggle later
  - DaisyUI reads theme from `data-theme` on `html` (or `body`)
  - Default can be set via `<html data-theme="light">` and toggled to `dark`

---

## ✍️ Content Setup (Blog with MDX)

- [x] Add MDX support
  ```bash
  npx astro add mdx
  ```
- [x] Create content structure:
  ```
  src/content/blog/
  ```
- [x] Define content collection (schema)

---

## 🧱 Project Structure

- [x] Create folders:
  ```
  src/
    components/
    layouts/
    pages/
    content/
    styles/
  ```

---

## 🧩 Core Components

- [x] Create base layout (`BaseLayout.astro`)
- [x] Create Header component
- [x] Create Footer component
- [x] Create CTA component
- [x] Create Callout component (for MDX)

---

## 🏠 Pages (v1)

- [x] Home (`/`)
- [x] Services (`/services`)
- [x] How it works (`/how-it-works`)
- [x] About (`/about`)
- [x] Contact (`/contact`)
- [x] Blog (`/blog`)

---

## 📝 Blog

- [x] Create blog layout
- [x] Create blog index page
- [x] Add first MDX post

---

## 🔍 SEO Basics

- [x] Add dynamic `<title>` and meta tags
- [x] Add Open Graph tags
- [x] Add favicon

---

## 📊 Analytics

- [x] **Google Analytics (GA4)** — page views, events, and conversion goals
  - Create a GA4 property and obtain the Measurement ID (`G-XXXXXXXXXX`)
  - Load gtag in the site (e.g. Astro layout or `@astrojs/partytown` for third-party scripts)
  - Document required env vars (e.g. `PUBLIC_GA_MEASUREMENT_ID`) if IDs stay out of source control

- [x] **Microsoft Clarity** — session recordings and heatmaps
  - Create a Clarity project and copy the project / tracking snippet
  - Add the Clarity script site-wide (same placement pattern as GA; consider Partytown)

- [x] **GrowthBook** — experimentation (A/B tests, feature flags)
  - Create a GrowthBook account and SDK key / client key for the web SDK
  - Install `@growthbook/growthbook` (and React bindings if using React islands)
  - Wire feature flags and experiments in layout or a dedicated provider; track exposures with GA4 where needed for analysis

---

## 📬 Forms

- [x] Add contact form (Vercel Forms or external service)

---

## 🚀 Deployment (GitHub Actions → Vercel)

Production deploys are triggered from **GitHub Actions**, not Vercel’s default “connect Git and build on every push” flow. The repo still uses Vercel as the host; CI runs the build (or delegates via the Vercel CLI) and publishes with a deploy token.

- [x] Add Vercel project config in repo (`vercel.json`, `packageManager` for pnpm; build → `dist`)
- [ ] **Vercel project** — Create a project for this app ([Vercel dashboard](https://vercel.com/new) or `vercel link` from a machine with the CLI). You need the **Team / Org** and **Project** identifiers for CI secrets (see `.vercel/project.json` after linking, or **Project Settings → General**).
- [x] **GitHub Actions — production** — `.github/workflows/deploy-vercel.yml`: `push` to `main` + `workflow_dispatch`; `vercel pull` (production) → `vercel build` → `vercel deploy --prebuilt --prod`.
- [x] **GitHub Actions — preview** — `.github/workflows/preview-vercel.yml`: `pull_request` (same-repo only; fork PRs skipped); `vercel pull` (preview, branch-scoped) → `vercel build` → `vercel deploy --prebuilt` (no `--prod`). If the Vercel GitHub integration **also** builds every PR, disable one side or accept duplicate preview deploys.
- [x] **CI secrets helper (local)** — After `vercel link`, run `pnpm vercel:ci-secrets-hint` to print `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` for GitHub (reads `.vercel/project.json`; that folder stays gitignored).
- [ ] **GitHub repository secrets** — In the repo **Settings → Secrets and variables → Actions**, add at minimum:
  - `VERCEL_TOKEN` — [Create](https://vercel.com/account/tokens) a Vercel access token with deploy scope for this team/project.
  - `VERCEL_ORG_ID` — Team ID (`team_…` or user scope as shown in Vercel / `.vercel/project.json`).
  - `VERCEL_PROJECT_ID` — Project ID (`prj_…`).
- [x] **Avoid double production deploys from Vercel Git** — `vercel.json` → `ignoreCommand` runs `scripts/vercel-ignore-git-production-on-main.sh`: Vercel-initiated **Production** builds for **`main` are skipped** (exit `0`), so GitHub Actions owns prod. **Preview** builds from Vercel Git still run (`exit 1`) unless you turn them off in Vercel or rely only on the preview workflow.
- [x] **WWW → apex redirect** — `vercel.json` redirects `www.byklika.com` → `https://byklika.com/:path*` (applies once **both** hosts are assigned in Vercel).
- [ ] **Add custom domain** — **Vercel → Project → Settings → Domains**: add `byklika.com` and `www.byklika.com`. In your DNS provider, add the **exact** records Vercel shows (A/ALIAS/CNAME vary by apex vs `www`). Wait for SSL “Valid configuration”, then verify both URLs load.
- [ ] **Set environment variables on Vercel** — **Project → Settings → Environment Variables**: mirror `.env.example` for **Production** and **Preview** (`PUBLIC_*`, optional `PUBLIC_SITE_URL`). CLI deploys from GitHub Actions use the same project env as dashboard deploys; after changing vars, trigger a new deploy so CI’s `vercel pull` sees them.
- [x] **HTTP security headers (edge)** — `vercel.json` → `headers`: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` on all routes (HSTS is usually handled by Vercel for custom domains).

**Suggested go-live order (manual items above):** (1) Create/link the **Vercel project** → (2) run **`pnpm vercel:ci-secrets-hint`** → (3) add the three **GitHub Actions secrets** → (4) push **`main`** and confirm the production workflow is green → (5) add **domains** + DNS at your registrar → (6) set **environment variables** on the Vercel project for Production and Preview → (7) trigger another deploy if needed, then check the four boxes.

---

## 🔐 Quality & DX

- [x] Add ESLint
- [x] Add Prettier
- [x] Configure TypeScript strict mode

---

## 🧠 Notes

- Keep everything static-first
- Avoid adding a database
- Prefer reusable components over custom styling per page
- Keep homepage focused on conversion

---

## ✅ Done Criteria

- Site builds in GitHub Actions and deploys to Vercel successfully
- Homepage complete
- At least 1 blog post published
- Contact form working
