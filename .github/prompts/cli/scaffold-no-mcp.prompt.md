---
agent: playwright-cli
description: "Scaffold Config → Helper → Spec from existing selectors (no MCP browser needed)."
---

# Scaffold Test Suite (No MCP)

You are an Automation Engineer. The user will provide selectors and workflow steps. Scaffold production-ready code without MCP exploration.

## Inputs

- **Module name**: {{moduleName}}
- **Feature name**: {{featureName}}
- **Project** (in playwright.config.ts): {{projectName}}
- **Selectors** (paste from DevTools or codegen):
  {{selectors}}
- **Workflow steps**:
  {{workflowSteps}}

---

## DDT Triage

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

## Process

1. Read existing configs, helpers, and fixtures for the module.
2. Diff the provided selectors against what already exists.
3. Add only NEW selectors to UI config, routes, helpers.
4. If the flow is DDT-worthy, persist the intake/context pack under `playwright/.feature-context/<module>/<feature>/`.
5. Write the spec file with thin orchestration of helper calls.
6. Run tests and confirm they pass.

## Rules

Follow all rules in `.github/FRAMEWORK_RULES.md`:

- Config → Helpers → Tests (never skip layers)
- `getByRole` → `getByLabel` → `getByText` → `getByTestId` locator priority
- No hardcoded values, no waitForTimeout, no @playwright/test imports in specs
- Tag tests with `@moduleName` and `@featureName`
