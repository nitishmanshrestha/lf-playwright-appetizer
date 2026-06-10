---
mode: agent
description: "Scaffold tests from Playwright CLI codegen + workflow notes using Config → Helpers → Tests architecture."
---

# Scaffold Test Suite via Playwright CLI Context

You are an Automation Engineer. Use Playwright CLI codegen output and workflow notes to generate framework-compliant tests without MCP browser exploration.

## Inputs

- **Module name**: {{moduleName}}
- **Feature name**: {{featureName}}
- **Project** (in playwright.config.ts): {{projectName}}
- **Context folder** (preferred): `playwright/.feature-context/<app>/<module>/<feature>/`
- **Codegen script path** (optional): {{codegenScriptPath}}
- **Workflow steps**:
  {{workflowSteps}}

---

## Phase 1 — Context Intake

Read available retained context in this order:

1. `_feature-brief.md`
2. `_workflow.md`
3. `_selectors.md`
4. `_assertions.md`
5. `_codegen-script.spec.ts` (optional)

If no context folder is available, use user-provided selectors + workflow only.

---

## Phase 2 — Diff Against Existing Framework Files

Before creating anything, read and diff:

1. `playwright/configs/ui/modules/{{moduleName}}/{{moduleName}}.ui.ts`
2. `playwright/configs/app/routes.ts`
3. `playwright/configs/api/modules/{{moduleName}}/{{moduleName}}.api.ts`
4. `playwright/support/helpers/modules/{{moduleName}}.helpers.ts`
5. `playwright/support/helpers/common/*.helpers.ts`
6. `playwright/fixtures/base.fixture.ts`
7. `playwright/tests/{{moduleName}}/**/*.spec.ts`

Only add missing selectors, routes, methods, and scenarios.

---

## Phase 3 — Scaffold in Strict Order

### 3a. UI Config

File: `playwright/configs/ui/modules/{{moduleName}}/{{moduleName}}.ui.ts`

- Add only new selector constants
- Use `as const`
- Group by section (LOGIN, LIST, DETAIL, FORM, etc.)

### 3b. Routes

File: `playwright/configs/app/routes.ts`

- Add only missing paths under module key
- Parameterized paths as functions

### 3c. API Config (if needed)

File: `playwright/configs/api/modules/{{moduleName}}/{{moduleName}}.api.ts`

- Use `createModuleConfig()` patterns

### 3d. Helper Methods

File: `playwright/support/helpers/modules/{{moduleName}}.helpers.ts`

- Convert repeated page actions into reusable helper methods
- Prefer locator order: `getByRole()` → `getByLabel()` → `getByText()` → `getByTestId()`
- No `page.waitForTimeout()`

### 3e. Fixture Registration

File: `playwright/fixtures/base.fixture.ts`

- Register helper if new

### 3f. Spec File

File: `playwright/tests/{{moduleName}}/e2e/{{moduleName}}-{{featureName}}.spec.ts`

- Import `test` and `expect` from `base.fixture.ts`
- Thin orchestration only: 2-5 helper calls per test
- Tag with `@{{moduleName}}` and scenario tags (`@smoke`/`@e2e`)

---

## Phase 4 — Run and Verify

```bash
npx playwright test playwright/tests/{{moduleName}}/e2e/{{moduleName}}-{{featureName}}.spec.ts --project={{projectName}} --reporter=list
```

Fix failing assertions with deterministic waits and proper selectors.

---

## Rules (Non-Negotiable)

- NEVER hardcode selectors in specs
- NEVER hardcode routes when route constants exist
- NEVER import from `@playwright/test` in spec files
- NEVER use `page.waitForTimeout()`
- ALWAYS check for existing reusable helpers first
- ALWAYS run duplication detection before creating new files
- ALWAYS preserve Config → Helpers → Tests architecture

---

## Codegen Usage Notes

- Treat codegen output as a reference, not final architecture
- Extract reusable selectors and steps into config + helpers
- Remove recorder noise (temporary waits, brittle selectors)
- Keep the final spec concise and deterministic
