---
applyTo: "playwright/tests/**/*.spec.ts"
---

# Test Files Instructions

## Rules

- Import `test` and `expect` from `../../fixtures/base.fixture` (relative path to base fixture).
- NEVER import from `@playwright/test` directly in spec files.
- Destructure helpers from the test function argument: `async ({ exampleHelpers, page }) => { ... }`
- Tests are thin orchestration — no raw selectors, no direct page.route() calls.
- Do not build direct locator chains in specs; call helper methods that own locator composition.
- Tag tests appropriately: `{ tag: ["@smoke", "@module-name"] }`
- No `page.waitForTimeout()` — ever.
- Auth is handled automatically via storageState (project dependency).

## Structure

```typescript
import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Module — Smoke", { tag: ["@module-name"] }, () => {
  test.beforeEach(async ({ moduleHelpers }) => {
    await moduleHelpers.visitList();
  });

  test("loads the page", { tag: ["@smoke"] }, async ({ moduleHelpers }) => {
    await moduleHelpers.assertLoaded();
  });
});
```

## What NOT to Put in a Test

- Raw CSS selectors or locator strings
- Direct page.route() or page.waitForResponse() calls (use helpers)
- page.waitForTimeout(number)
- Login/auth logic (handled by setup project)
- Complex if/else logic (split into separate tests)
