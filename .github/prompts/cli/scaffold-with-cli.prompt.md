---
agent: playwright-cli
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
- **DDT enabled** (default true): {{ddtEnabled}}

---

## Phase 0 — DDT Triage

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
- Group by page section

### 3b. Routes

File: `playwright/configs/app/routes.ts`

- Add new path only if missing
- Use nested `as const` objects

### 3c. API Config (if API calls present)

File: `playwright/configs/api/modules/{{moduleName}}/{{moduleName}}.api.ts`

- Use `createModuleConfig()` from `@core/api`

### 3d. Helper

File: `playwright/support/helpers/modules/{{moduleName}}.helpers.ts`

- Add methods for new actions only
- Group: Navigation → Actions → Assertions

### 3e. Register in fixture

File: `playwright/fixtures/base.fixture.ts`

- Add new helper to `CustomFixtures` type
- Register via `base.extend()`

### 3f. Test

File: `playwright/tests/{{moduleName}}/smoke/{{featureName}}-smoke.spec.ts`

- Import from `../../fixtures/base.fixture`
- Use DDT `for...of` loop if `{{ddtEnabled}}` is true and flow repeats with data
- Tag: `@smoke` + `@{{moduleName}}`

### 3g. Preserve the context pack

Write the merged brief + capture + DDT answers to the retained context folder so later edits can reuse it without asking the engineer again.

Suggested files:

- `_brief.md`
- `_workflow.md`
- `_selectors.md`
- `_assertions.md`
- `_ddt-context.json`
