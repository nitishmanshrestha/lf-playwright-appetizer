---
applyTo: "playwright/tests/**/*.spec.ts"
---

# Test Files Instructions

Tests are thin orchestration layers. All logic lives in helpers.

## Structure Template

```typescript
import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Module — Smoke", { tag: ["@module"] }, () => {
  test.beforeEach(async ({ moduleHelpers }) => {
    await moduleHelpers.visitList();
  });

  test("loads the page", { tag: ["@smoke"] }, async ({ moduleHelpers }) => {
    await moduleHelpers.assertLoaded();
  });
});
```

## DDT Template

```typescript
import { test } from "../../../fixtures/base.fixture";
import testData from "../../../testdata/mymodule/feature-data.json";

for (const tc of testData) {
  test(`mymodule - ${tc.name}`, { tag: ["@smoke"] }, async ({ page }) => {
    // TODO: replay the captured flow with helpers.
    // Use tc.input for variation-specific input data.
    // Use tc.expected for assertion values.
    void page;
  });
}
```

## Rules

**Imports:**

- `import { test, expect } from "../../../fixtures/base.fixture"`
- NEVER `import { test } from "@playwright/test"` in spec files
- Import UI configs only for inline assertions

**Test Structure:**

- Destructure helpers: `async ({ mymoduleHelpers, page }) => { ... }`
- Tag tests: `{ tag: ["@smoke", "@module"] }`
- One scenario per test — no branching logic

**DDT:**

- Use `for...of` loops with JSON data from `playwright/testdata/`
- Include assertion values in the JSON, not hardcoded in the spec
- If a captured flow is DDT_CANDIDATE, stop and collect the variation count, input JSON, expected JSON, and whether assertions are shared before scaffolding
- Prefer one guided scaffold run over separate manual scripts

## DDT Flow

When a codegen or MCP capture looks repeated, the agent should:

1. Classify the flow with the DDT skill.
2. If DDT-worthy, ask the user for variations and expected assertions.
3. Run the guided scaffold flow in one step.
4. Write the retained intake artifact to `playwright/.feature-context/<module>/<feature>/`.
5. Generate JSON test data plus a spec loop from the collected answers.

Recommended command:

```bash
npm run scaffold:flow -- --module <module> --feature <feature> --capture capture.json
```
