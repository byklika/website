# SETUP.md

## Project: Klika Website (Astro)

This document defines the initial setup steps for building the Klika website using Astro, Tailwind, and MDX.

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

## 🎨 Styling (Tailwind)

- [ ] Install Tailwind CSS
  ```bash
  npx astro add tailwind
  ```
- [ ] Install typography plugin
  ```bash
  pnpm add @tailwindcss/typography
  ```
- [ ] Configure Tailwind in `tailwind.config.mjs`

---

## ✍️ Content Setup (Blog with MDX)

- [ ] Add MDX support
  ```bash
  npx astro add mdx
  ```
- [ ] Create content structure:
  ```
  src/content/blog/
  ```
- [ ] Define content collection (schema)

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
