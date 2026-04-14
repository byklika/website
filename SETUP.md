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
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
      extend: {},
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    daisyui: {
      themes: ["light", "dark"],
    },
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

- [ ] Create folders:
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

- [ ] Create base layout (`BaseLayout.astro`)
- [ ] Create Header component
- [ ] Create Footer component
- [ ] Create CTA component
- [ ] Create Callout component (for MDX)

---

## 🏠 Pages (v1)

- [ ] Home (`/`)
- [ ] Services (`/services`)
- [ ] How it works (`/how-it-works`)
- [ ] About (`/about`)
- [ ] Contact (`/contact`)
- [ ] Blog (`/blog`)

---

## 📝 Blog

- [ ] Create blog layout
- [ ] Create blog index page
- [ ] Add first MDX post

---

## 🔍 SEO Basics

- [ ] Add dynamic `<title>` and meta tags
- [ ] Add Open Graph tags
- [ ] Add favicon

---

## 📊 Analytics

- [ ] Add Plausible or Google Analytics

---

## 📬 Forms

- [ ] Add contact form (Vercel Forms or external service)

---

## 🚀 Deployment

- [ ] Connect repo to Vercel
- [ ] Enable automatic deployments
- [ ] Add custom domain

---

## 🔐 Quality & DX

- [ ] Add ESLint
- [ ] Add Prettier
- [ ] Configure TypeScript strict mode

---

## 🧠 Notes

- Keep everything static-first
- Avoid adding a database
- Prefer reusable components over custom styling per page
- Keep homepage focused on conversion

---

## ✅ Done Criteria

- Site builds and deploys successfully
- Homepage complete
- At least 1 blog post published
- Contact form working
