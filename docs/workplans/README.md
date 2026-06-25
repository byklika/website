# Workplans

Track **non-trivial initiatives** on this repo. Each active effort gets its own markdown file in this folder.

## When to create a workplan

| Create a workplan                               | Skip (use topic guides only)            |
| ----------------------------------------------- | --------------------------------------- |
| Multi-step or multi-file features               | Single-file bug fix                     |
| New contracts, routes, or pipelines             | Copy change via existing `*Contract.ts` |
| Cross-cutting SEO, blog, analytics, deploy work | Publishing one blog post                |
| Work spanning 3+ iterations or PRs              | Typo, dependency bump                   |

## How to start

1. Copy [`../workplan-template.md`](../workplan-template.md).
2. Save as **`docs/workplans/<kebab-slug>.md`** (e.g. `docs/workplans/email-capture-v2.md`).
3. Add a row to the **index** below.
4. Link the workplan in your PR description.
5. Tick checkboxes in the workplan as you go — **do not** use the template file as a live tracker.

## Index

| Workplan        | Status | Summary                                   |
| --------------- | ------ | ----------------------------------------- |
| _(none active)_ | —      | Add a row when you open a new initiative. |

**Status values:** `Planned` · `In progress` · `Shipped` · `Superseded`

## Completed / archived

Move shipped workplans to `docs/workplans/archive/` (optional) or leave in place with status `Shipped` and all **Done when** boxes checked.

← Back to [`docs/AI-README.md`](../AI-README.md)
