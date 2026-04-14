# HTML_ANALYSIS_GUIDE.md

## Purpose
Use the provided HTML homepage sketch as a **reference artifact** to extract design tokens, layout, and components, and rebuild it properly in Astro.

This guide is optimized for **Cursor IDE + agency-agents profiles**.

---

## 🧠 Agent Configuration (IMPORTANT)

Use profiles from:
https://github.com/msitarzewski/agency-agents

### Primary Agent
- frontend-developer

### Secondary Agents (invoke when needed)
- ui-ux-designer → for spacing, hierarchy, visual consistency
- product-designer → for CTA clarity and structure

---

## 🧑‍💻 Cursor Workflow (How to Execute)

### 1. Open the HTML file in Cursor
### 2. Use Agent Mode with:

Prompt example:
"Analyze this HTML and extract:
- color palette
- typography scale
- layout sections
- reusable components

Do NOT rewrite code yet. Output structured findings."

---

## 🎯 Objectives

- [ ] Extract design tokens (colors, typography, spacing)
- [ ] Identify layout sections
- [ ] Identify reusable components
- [ ] Normalize into a design system
- [ ] Rebuild using Astro components

---

## 🎨 Step 1: Extract Design Tokens (Cursor Prompt)

Use:

"From this HTML:
- list all colors (hex/rgb)
- group into primary, secondary, neutral, accent
- extract typography (font sizes, weights, headings)
- identify spacing patterns

Return structured JSON."

Then:

- [ ] Add tokens to `tailwind.config.mjs`

---

## 🧱 Step 2: Identify Layout

Prompt:

"Break this HTML into semantic sections:
(hero, features, how-it-works, CTA, footer)

Return:
- section name
- purpose
- key elements"

- [ ] Map sections to Astro components

---

## 🧩 Step 3: Component Extraction

Prompt:

"Find repeating UI patterns:
- buttons
- cards
- nav
- sections

For each:
- define props
- define structure"

- [ ] Create components in `src/components/`

---

## 🔄 Step 4: Normalize

Prompt:

"Refactor this HTML:
- remove inline styles
- replace with Tailwind classes
- ensure consistent spacing and typography"

- [ ] Ensure no inline CSS remains

---

## ⚙️ Step 5: Astro Implementation

- [ ] Create:
  - `BaseLayout.astro`
  - `Header.astro`
  - `Footer.astro`

Prompt:

"Rebuild this section as an Astro component using Tailwind.
Do NOT copy raw HTML. Use clean structure and reusable classes."

---

## 🚫 Anti-Patterns (Enforce in Cursor)

Prompt:

"Check this code for:
- inline styles
- duplicated patterns
- inconsistent spacing
- hardcoded values

Suggest fixes."

- [ ] No inline styles
- [ ] No hardcoded colors
- [ ] No one-off components

---

## ✅ Done Criteria

- [ ] Components are reusable
- [ ] Tailwind tokens are defined
- [ ] Layout matches original intent
- [ ] Code is clean and minimal
- [ ] Ready for scaling

---

## 🧠 Core Principle

> The HTML is NOT the implementation.
> It is input for abstraction.

Cursor + agents should:
- analyze → extract → systematize → rebuild
