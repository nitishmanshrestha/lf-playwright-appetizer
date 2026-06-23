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
- **Auth**: Login manually in MCP (storageState does NOT apply to MCP sessions). Use existing setup credentials.
- **Workflow steps** (describe the user journey):
  {{workflowSteps}}

---

## Files That Must Be Checked Before ANY Code Generation

These files are non-negotiable checkpoints. Read them at the start of Tier 3 and respect their contents throughout.

### Config Files (Source of Truth)

| File                                                                  | What It Contains                               | Rule                                                        |
| --------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `playwright/configs/app/routes.ts`                                    | All URL paths for every module                 | NEVER hardcode a URL — use `ROUTES.MODULE.PATH`             |
| `playwright/configs/ui/modules/{{moduleName}}/{{moduleName}}.ui.ts`   | All `data-test` selectors for this module      | NEVER hardcode a selector — use `MODULE_UI.SECTION.ELEMENT` |
| `playwright/configs/api/modules/{{moduleName}}/{{moduleName}}.api.ts` | API endpoint intercept definitions             | Use for `waitForResponse()` patterns                        |
| `playwright/configs/ui/shared/navigation.ui.ts`                       | Shared nav selectors (hamburger menu, sidebar) | Check here before adding nav selectors to module config     |
| `playwright/configs/ui/shared/feedback.ui.ts`                         | Shared feedback selectors (toasts, errors)     | Check here before adding error selectors to module config   |

### Helper Files (Behavior Owners)

| File                                                           | What It Owns                                    | Rule                                     |
| -------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- |
| `playwright/support/helpers/modules/{{moduleName}}.helpers.ts` | All reusable actions for this module            | One helper = one owner. Don't duplicate. |
| `playwright/support/helpers/common/api.helpers.ts`             | API interception, stubbing, response waiting    | Check before adding API wait logic       |
| `playwright/support/helpers/common/navigation.helpers.ts`      | Generic navigation utilities                    | Check before adding `goto` wrappers      |
| `playwright/support/helpers/common/ui.helpers.ts`              | Generic UI assertions (toasts, modals, loading) | Check before adding generic assertions   |

### Fixture & Test Files

| File                                       | What It Contains                           | Rule                                   |
| ------------------------------------------ | ------------------------------------------ | -------------------------------------- |
| `playwright/fixtures/base.fixture.ts`      | All helper registrations + custom fixtures | New helpers MUST be registered here    |
| `playwright/tests/{{moduleName}}.setup.ts` | Auth setup for this module (if exists)     | Understand what auth state is cached   |
| `playwright/tests/{{moduleName}}/`         | Existing specs for this module             | Don't duplicate existing test coverage |

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
4. After each interaction (`browser_click` / `browser_type` / `browser_fill_form`):
   - Snapshot the new state
   - Record URL changes
   - Record new `data-test` IDs that appeared
   - Record any calculations or summary values displayed
   - Record network requests (`browser_network_requests`)
5. Trigger negative paths:
   - Submit empty forms → capture validation error selectors
   - Invalid inputs → capture error message selectors
   - Boundary values → capture overflow/truncation behavior
6. Record all findings before stopping

**Token optimization:**

- Use `browser_evaluate` with targeted queries over full `browser_snapshot` when possible
- Extract only `data-test` attributes, roles, labels — not full DOM trees
- One evaluate per page state, not per element

**⛔ STOP after Tier 1. Present findings and wait for user approval before Tier 2.**

---

## Tier 2 — DOCUMENT (Test Coverage Matrix)

**Goal:** Produce a reviewable test plan the user approves before code is written.

Using findings from Tier 1, generate:

### A. Selector Inventory

| Page/Section | Element        | Attribute | Value       |
| ------------ | -------------- | --------- | ----------- |
| Login        | Username input | data-test | `user-name` |

### B. Route Map

| Page      | URL Path          | Already in routes.ts? |
| --------- | ----------------- | --------------------- |
| Inventory | `/inventory.html` | ✅ Yes / ❌ No        |

### C. API Endpoints (if any)

| Endpoint | Method | Triggered By | Expected Status |
| -------- | ------ | ------------ | --------------- |

### D. Test Coverage Matrix

| Test Case        | Type | Steps           | Key Assertions             |
| ---------------- | ---- | --------------- | -------------------------- |
| Happy path       | @e2e | Step 1 → Step 2 | URL, element visible, text |
| Validation error | @e2e | Empty submit    | Error message visible      |

### E. Business Logic / Calculations

| Calculation | Formula | Example |
| ----------- | ------- | ------- |

### F. State Transitions

| Element     | Before        | After    |
| ----------- | ------------- | -------- |
| Button text | "Add to cart" | "Remove" |

**⛔ STOP after Tier 2. Present the coverage matrix and wait for user approval before Tier 3.**

---

## Tier 3 — CREATE TESTS (Code Generation)

**Goal:** Generate framework-compliant code in strict order.

### Pre-flight: Read Adherence Files

Before writing a single line of code, read ALL files listed in the "Files That Must Be Checked" section above. Compare your Tier 1 discoveries against what already exists:

- Selectors already in `{{moduleName}}.ui.ts` → **DO NOT re-add**
- Routes already in `routes.ts` → **DO NOT re-add**
- Helper methods already in `{{moduleName}}.helpers.ts` → **DO NOT re-create**
- Shared helpers already in `common/*.helpers.ts` → **USE THEM, don't duplicate**

### Pre-flight: Duplication Check

Run the `detect-duplication` skill. Only proceed with `NEW_FILE_JUSTIFIED` or `EXTEND_EXISTING` verdicts.

### Step 1 — UI Config

File: `playwright/configs/ui/modules/{{moduleName}}/{{moduleName}}.ui.ts`

- Add ONLY new `data-test` IDs not already present
- Group by page section (LOGIN, INVENTORY, CART, etc.)
- Use `as const` assertion
- Values = raw `data-test` attribute strings
- Dynamic selectors as functions: `ITEM: (slug: string) => \`item-${slug}\``

### Step 2 — Routes

File: `playwright/configs/app/routes.ts`

- Add ONLY new URL paths not already present
- Check existing routes first — the module may already be fully defined
- Use template literal functions for parameterized routes

### Step 3 — API Config (if endpoints discovered)

File: `playwright/configs/api/modules/{{moduleName}}/{{moduleName}}.api.ts`

- Use `createModuleConfig()` factory from `@core/api`
- Define resources and custom endpoints

### Step 4 — Helpers

File: `playwright/support/helpers/modules/{{moduleName}}.helpers.ts`

- Add ONLY new methods not already present
- Method naming: `visit[Page]()`, `assert[State]()`, `[verb][Noun]()`
- Import from `@configs/...` and `@playwright/test`
- Locator priority: `getByRole()` → `getByLabel()` → `getByText()` → `getByTestId()`
- Use `filter({ hasText })` / `filter({ has })` before `.first()` / `.nth()`
- NO `page.waitForTimeout()` — use `expect()` or `waitForResponse()`
- Set up `waitForResponse()` BEFORE `page.goto()` or click that triggers the request

### Step 5 — Fixture Registration

File: `playwright/fixtures/base.fixture.ts`

- Import the helper class (if new)
- Add to `CustomFixtures` type
- Add to `test.extend()` block

### Step 6 — Spec File

File: `playwright/tests/{{moduleName}}/e2e/{{moduleName}}-{{featureName}}.spec.ts`

- Import `test`, `expect` from `base.fixture.ts` (NEVER from `@playwright/test`)
- Import UI config for inline assertion values
- Import ROUTES only if needed for URL assertions
- Destructure helpers from fixtures
- Tag `test.describe()` with `@{{moduleName}}`
- Tag individual tests with `@smoke` or `@e2e`
- Each test = 2–5 helper calls maximum (thin orchestration)
- Validate after each significant interaction

### Step 7 — DDT Candidate Detection (auto)

- After Tier 1 discoveries are documented and before creating specs, run the `identify-ddt-candidates` skill on each candidate flow.
- If `DDT_CANDIDATE`:
  - Create `playwright/testdata/{{moduleName}}/{{featureName}}-data.json` with dataset objects that include assertion keys.
  - Create a parameterized spec `playwright/tests/{{moduleName}}/smoke/{{featureName}}-ddt.spec.ts` using a `for...of` loop.
  - Register the generated spec under appropriate tags (`@smoke`/`@e2e`) depending on the coverage matrix.
- If `NOT_CANDIDATE`, create the single-scenario spec normally.
- Allow user to opt out of DDT scaffolding during Tier 2 approval (ask `Enable DDT scaffolding? [Y/n]`).

Example command (agent):

```
node scripts/scaffold-runner.js --module {{moduleName}} --feature {{featureName}} --capture ./capture.json
```

Automated post-capture hook (optional):

```
npm run capture:post -- --module {{moduleName}} --feature {{featureName}} --capture ./capture.json
```

---

## Tier 4 — RUN AND VERIFY

```bash
npx playwright test playwright/tests/{{moduleName}}/e2e/{{moduleName}}-{{featureName}}.spec.ts --project={{projectName}} --reporter=list
```

If tests fail, diagnose and fix. Do NOT add `waitForTimeout` as a band-aid.

---

## Non-Negotiable Rules

```
NEVER  hardcode selectors          → use constants from [module].ui.ts
NEVER  hardcode URLs               → use constants from routes.ts
NEVER  page.waitForTimeout(ms)     → use waitForResponse() or expect()
NEVER  import from @playwright/test in spec files → use base.fixture.ts
NEVER  login in beforeEach         → use storageState project dependency
NEVER  create duplicate helpers    → check existing files first
NEVER  put logic in config files   → pure data only (as const)
NEVER  skip Tier 2 documentation   → user must approve coverage before code

ALWAYS read adherence files before writing code
ALWAYS use storageState for auth (project dependency in playwright.config.ts)
ALWAYS set up waitForResponse() BEFORE the action that triggers it
ALWAYS run duplication detection before creating files
ALWAYS tag tests (@moduleName + @smoke/@e2e)
ALWAYS validate calculations where applicable
```

---

## Output Contract

| Tier         | Deliverable                                            | Gate                |
| ------------ | ------------------------------------------------------ | ------------------- |
| 1 — Explore  | Raw findings: selectors, routes, states, network calls | User says "proceed" |
| 2 — Document | Coverage matrix, selector inventory, state transitions | User says "proceed" |
| 3 — Create   | Config + Helper + Fixture + Spec (in strict order)     | Tests pass          |
