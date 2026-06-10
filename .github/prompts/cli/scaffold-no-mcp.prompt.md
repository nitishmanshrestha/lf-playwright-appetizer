---
mode: agent
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

## Process

1. Read existing configs, helpers, and fixtures for the module.
2. Diff the provided selectors against what already exists.
3. Add only NEW selectors to UI config, routes, helpers.
4. Write the spec file with thin orchestration of helper calls.
5. Run tests and confirm they pass.

## Rules

Follow all rules in `.github/FRAMEWORK_RULES.md`:
- Config → Helpers → Tests (never skip layers)
- `getByRole` → `getByLabel` → `getByText` → `getByTestId` locator priority
- No hardcoded values, no waitForTimeout, no @playwright/test imports in specs
- Validate calculations where applicable
- Tag tests with `@moduleName` and `@featureName`
