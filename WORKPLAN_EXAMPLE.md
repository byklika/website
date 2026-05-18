# WORKPLAN_EXAMPLE — Generic workplan template for agents

**Purpose:** Copy the **template block** below when starting a new initiative. Replace all `[PLACEHOLDER]` values. Keep sections **short**; every checkbox should be a **single, verifiable action**. Use **Iteration N** to group work by dependency order (spec → build → integrate → ship), not by calendar week.

**Tone:** The H1 names the initiative. **Board ask** is one short paragraph (intent and hard constraints). **Done when** lists checkable acceptance outcomes. **Out of scope** blocks scope creep. **Feedback for Product team** holds decisions that need a human owner. The body is either **Iteration 1…N** or a single **Checklist (tick as you go)** — see **Canonical section order** below.

**Do not include:** QA plans, test suites, screenshot sign-off gates, or “validate in browser” task lists unless the stakeholder explicitly asks for them.

---

## Canonical section order

Use this order unless a stakeholder defines otherwise:

1. **`# WORKPLAN: …`** — Short title (and optional subtitle / surface).
2. **`---`**
3. **Board ask** — Either `## Board ask` or a bold **Board ask** paragraph directly under the H1; one paragraph.
4. **`---`**
5. **`## Done when`** — `- [ ]` / `- [x]` bullets; measurable outcomes.
6. **`---`**
7. **Body (pick one shape):**
   - **`## Iteration 1` … `## Iteration N`** — Use for multi-phase work (spec → build → integrate).
   - **`## Checklist (tick as you go)`** — Use for a single-track slice (flat task list).
8. **`---`**
9. **`## Out of scope`** — Bullets.
10. **`---`**
11. **`## Feedback for Product team`** — Open questions and decisions.

**Optional:** `## Appendix` (dependencies table, links).

---

## How agents should use this template

- [ ] Save a **new file** (for example `WORKPLAN_<feature>.md` or `<TOPIC>.md`); do not treat `WORKPLAN_EXAMPLE.md` as the live tracker for real work.
- [ ] One **primary owner surface** per iteration where possible (avoid scatter).
- [ ] Prefer **file paths** and **symbol names** in tasks so engineers can execute without guessing.
- [ ] Keep **3–5 iterations** for most slices; split only when parallel tracks are real.

---

# WORKPLAN: `[SHORT_TITLE]` ([optional subtitle / surface])

**Board ask:** [One paragraph: what you ship, for whom, and any hard constraint — for example pathname, flag, pixel-perfect Figma node id, or no new dependencies.]

---

## Done when

- [ ] [Measurable outcome 1 — user-visible or contract-visible.]
- [ ] [Measurable outcome 2.]
- [ ] [Measurable outcome 3 — include no regression to named adjacent behavior if relevant.]

---

## Iteration 1 — Spec / contract (lock before code)

- [ ] [Confirm behavior for edge cases with PM or design.]
- [ ] [Write the data, API, or copy contract — handles, flags, Figma node, and so on.]
- [ ] [List primary files or entry points to touch.]

---

## Iteration 2 — Core implementation

- [ ] [Implement domain logic or UI in `path/to/file.ts`.]
- [ ] [Add or extend a helper in `path/to/lib.ts` if logic is reused.]
- [ ] [Keep scope minimal — no drive-by refactors outside the ask.]

---

## Iteration 3 — Integration / wiring

- [ ] [Wire behavior into parent route, provider, or layout — `path/to/parent.tsx`.]
- [ ] [Follow an existing pattern in the codebase; name it in the task or PR.]
- [ ] [Handle loading and disabled states if there is a user-facing mutation.]

---

## Iteration 4 — Release readiness (optional; skip if not applicable)

- [ ] [Feature flag, environment variable, or remote config — only if the initiative requires it.]
- [ ] [Add a short operator note in code or internal docs if needed.]
- [ ] [State rollback in one line in the PR description — what to flip if you revert.]

---

## Out of scope

- [Adjacent feature or surface explicitly excluded from this slice.]
- [Deferred technical choice.]
- **QA and automated tests** for this slice — omit unless the stakeholder explicitly requests them in the workplan.

---

## Feedback for Product team

- [Open question 1 — owner and deadline if known.]
- [Open question 2 — for example copy, legal, pricing, or experiment audience.]

---

## Appendix — Optional sections (use sparingly)

### Dependencies

| Dependency | Owner | Status |
|------------|-------|--------|
| [System / API / design] | [Name] | [Blocked / Ready] |

### References

- [Figma, ticket, or spec URL]
- [ADR or design doc URL]
