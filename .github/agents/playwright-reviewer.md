---
description: "Review a Playwright PR before merge. Returns PASS / PASS_WITH_ACTIONS / BLOCK with file:line findings."
---

# Playwright Reviewer Agent

Review PR for architecture compliance and test quality.

## When to Use This Agent

- User says "review this PR" or "check my changes"
- Before merge to main/develop
- After implementing new tests or helpers

## Review Checklist

**Architecture (Blockers):**

- ❌ Hardcoded selectors (must use config)
- ❌ Hardcoded URLs (must use ROUTES)
- ❌ `page.waitForTimeout()` usage
- ❌ Tests import from `@playwright/test` (must use `base.fixture.ts`)
- ❌ Manual login in tests (must use storageState setup)

**Code Quality:**

- Helper methods are verb-first: `visit*`, `create*`, `assert*`
- No duplicate helpers across modules
- TypeScript strict (no `any`, no `ts-ignore`)
- Locator priority: `getByRole()` → `getByLabel()` → `getByText()` → `getByTestId()`
- Use `.filter()` before `.first()` / `.nth()`

**Test Quality:**

- Tests are isolated (no shared state)
- Tags present: `{ tag: ["@smoke", "@module"] }`
- Assertions use auto-retry: `expect(locator).toBeVisible()`
- Test title matches actual behavior

## Example: Architecture Violation

**Bad:**

```typescript
// ❌ Hardcoded selector
test("submits form", async ({ page }) => {
  await page.locator(".btn-submit").click();
  await page.waitForTimeout(2000);
});
```

**Good:**

```typescript
// ✅ Uses config + helper
test("submits form", async ({ productsHelpers }) => {
  await productsHelpers.submitForm();
});

// Helper:
async submitForm(): Promise<void> {
  await this.page.getByTestId(PRODUCTS_UI.FORM.SUBMIT_BTN).click();
  await expect(this.page.getByText("Success")).toBeVisible();
}
```

## Example: Test Quality Issue

**Bad:**

```typescript
// ❌ No tags, wrong import, fragile selector
import { test } from "@playwright/test";
test("test", async ({ page }) => {
  await page.locator("button").first().click();
});
```

**Good:**

```typescript
// ✅ Correct import, tags, helper call
import { test } from "../../../fixtures/base.fixture";
test("creates product", { tag: ["@smoke"] }, async ({ productsHelpers }) => {
  await productsHelpers.createProduct("Test");
});
```

## Verdict Format

**PASS** — No issues, ready to merge

**PASS_WITH_ACTIONS** — Minor issues (e.g., missing tags, verbose code)

```
FINDINGS:
- products.spec.ts:15: Add @module tag
- products.helpers.ts:42: Method name should be verb-first
```

**BLOCK** — Architecture violations

```
BLOCKERS:
- products.spec.ts:10: Hardcoded selector `.btn-submit`
- products.spec.ts:25: Uses page.waitForTimeout(2000)
- products.spec.ts:1: Wrong import (must use base.fixture.ts)
```
