---
agent: true
description: "Three-tier MCP workflow: Explore → Document → Create Tests following Config → Helpers → Tests architecture."
---

# Three-Tier MCP Test Scaffold

You are an Automation Engineer. You will use Playwright MCP to explore a live application in three distinct tiers — each tier is a checkpoint the user must approve before proceeding to the next.

## Inputs (fill these before running)

- **Module name**: {{moduleName}}
- **Feature name**: {{featureName}}
- **Starting URL**: Use `BASE_URL` from `.env`
- **Project** (in playwright.config.ts): {{projectName}}
- **Auth**: Login manually in MCP (storageState does NOT apply to MCP sessions).
- **Workflow steps** (describe the user journey):
  {{workflowSteps}}

---

## DDT Triage Before Tier 1

Run `.github/skills/identify-ddt-candidates/SKILL.md`.

- If `VERDICT: DDT_CANDIDATE`, ask `QUESTION_SET` when `CONFIDENCE >= 0.80`.
- If `0.50 <= CONFIDENCE < 0.80`, suggest DDT and proceed only if the user accepts intake.
- If `VERDICT: NOT_CANDIDATE`, fall back to the single-scenario path.

Do not re-declare triage logic here; the skill is the source of truth.

### After Triage

Once the skill has produced a VERDICT, execute the scaffold script with it:

```bash
npm run scaffold:flow -- \
  --module {{moduleName}} \
  --feature {{featureName}} \
  --verdict <VERDICT> \
  [--capture <path-to-capture.json>]
```

- `DDT_CANDIDATE` → the script runs the intake wizard and writes testdata + spec
- `NOT_CANDIDATE` → pass `--no-ddt` instead and write a single-scenario spec manually

---

## Files That Must Be Checked Before ANY Code Generation

| File                                                                  | What It Contains          | Rule                                |
| --------------------------------------------------------------------- | ------------------------- | ----------------------------------- |
| `playwright/configs/app/routes.ts`                                    | All URL paths             | NEVER hardcode a URL                |
| `playwright/configs/ui/modules/{{moduleName}}/{{moduleName}}.ui.ts`   | All selectors             | NEVER hardcode a selector           |
| `playwright/configs/api/modules/{{moduleName}}/{{moduleName}}.api.ts` | API intercept definitions | Use for `waitForResponse()`         |
| `playwright/configs/ui/shared/navigation.ui.ts`                       | Shared nav selectors      | Check before adding nav selectors   |
| `playwright/configs/ui/shared/feedback.ui.ts`                         | Shared feedback selectors | Check before adding error selectors |

---

## Tier 1 — EXPLORE (MCP Browser Discovery)

**Goal:** Capture the raw DOM contract, selectors, routes, and behavior from the live app.

For each step in the workflow:

1. `browser_navigate` to the starting URL
2. Login if needed (MCP has its own session — storageState doesn't apply)
3. `browser_snapshot` or `browser_evaluate` to extract:
   - All `[data-test]` / `[data-testid]` attributes on the page
   - Form fields (input names, labels, placeholders)
   - Buttons and their visible text / roles
   - Current URL path
4. After each interaction, snapshot the new state and record:
   - URL changes
   - New `data-test` IDs that appeared
   - Any calculations or summary values displayed
   - Network requests (`browser_network_requests`)
5. Trigger negative paths: empty forms, invalid inputs, boundary values

**⛔ STOP after Tier 1. Present findings and wait for user approval before Tier 2.**

---

## Tier 2 — DOCUMENT (Test Coverage Matrix)

**Goal:** Produce a reviewable test plan the user approves before code is written.

### A. Selector Inventory

| Page/Section | Element | Attribute | Value |
| ------------ | ------- | --------- | ----- |

### B. Route Map

| Page | URL Path | Already in routes.ts? |
| ---- | -------- | --------------------- |

### C. API Endpoints (if any)

| Endpoint | Method | Triggered By | Expected Status |
| -------- | ------ | ------------ | --------------- |

### D. Test Coverage Matrix

| Test Case | Type | Steps | Key Assertions |
| --------- | ---- | ----- | -------------- |

If the flow is DDT-worthy, include the variation matrix here:

| Variation | Input JSON | Expected JSON | Shared Assertions? |
| --------- | ---------- | ------------- | ------------------ |

**⛔ STOP after Tier 2. Get user approval before writing any code.**

---

## Tier 3 — CREATE TESTS (Scaffold in Strict Order)

Follow the exact same phase order as `scaffold-with-cli.prompt.md` Phase 3:
UI Config → Routes → API Config → Helper → Register in fixture → Test spec

Preserve the merged brief + MCP capture + DDT answers in `playwright/.feature-context/<module>/<feature>/` so future scaffold runs reuse the same context.
