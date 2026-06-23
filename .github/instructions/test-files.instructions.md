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

## Real Example: Saucedemo Smoke Test

```typescript
import { test, expect } from "../../../fixtures/base.fixture";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";

test.describe("Saucedemo — Smoke Tests", {}, () => {
  test.beforeEach(async ({ saucedemoHelpers }) => {
    await saucedemoHelpers.visitInventory();
  });

  test(
    "loads the inventory page with products",
    { tag: ["@smoke"] },
    async ({ page }) => {
      await expect(page.getByTestId(SAUCEDEMO_UI.INVENTORY.CONTAINER)).toBeVisible();
      await expect(page.getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM)).toHaveCount(6);
    }
  );

  test(
    "adds item to cart and updates badge",
    { tag: ["@smoke", "@cart"] },
    async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.addToCart("sauce-labs-backpack");
      await saucedemoHelpers.assertCartBadge("1");
    }
  );

  test(
    "sorts inventory by price",
    { tag: ["@smoke"] },
    async ({ page, saucedemoHelpers }) => {
      await saucedemoHelpers.sortInventoryBy("lohi");
      const prices = await page
        .getByTestId(SAUCEDEMO_UI.INVENTORY.ITEM_PRICE)
        .allTextContents();
      const priceNumbers = prices.map((p) => parseFloat(p.replace("$", "")));
      expect(priceNumbers).toEqual([...priceNumbers].sort((a, b) => a - b));
    }
  );
});
```

## Rules

**Imports:**
- `import { test, expect } from "../../../fixtures/base.fixture"`
- NEVER `import { test } from "@playwright/test"` in spec files
- Import UI configs only for inline assertions: `expect(page.getByTestId(MODULE_UI.ITEM))`

**Test Structure:**
- Destructure helpers: `async ({ saucedemoHelpers, page }) => { ... }`
- Tag tests: `{ tag: ["@smoke", "@module"] }`
- One scenario per test — no branching logic

**What Belongs in Tests:**
- Helper method calls
- Direct assertions on known selectors (from UI config)
- Test data setup

**What Does NOT Belong:**
- Locator chains: `page.locator(".class").first()` (use helpers)
- API interception: `page.waitForResponse()` (use helpers)
- `page.waitForTimeout()` (never)
- Login flows (handled by setup projects)

## Anti-Patterns

❌ **Building locators in tests:**
```typescript
test("example", async ({ page }) => {
  await page.locator(".btn-submit").click(); // BAD
});
```

✅ **Calling helpers:**
```typescript
test("example", async ({ moduleHelpers }) => {
  await moduleHelpers.submitForm(); // GOOD
});
```

❌ **Hardcoded waits:**
```typescript
await page.waitForTimeout(2000); // BAD
```

✅ **Assertion-driven waits:**
```typescript
await expect(page.getByText("Success")).toBeVisible(); // GOOD
```

❌ **Wrong import:**
```typescript
import { test } from "@playwright/test"; // BAD - fixtures not loaded
```

✅ **Correct import:**
```typescript
import { test, expect } from "../../../fixtures/base.fixture"; // GOOD
```
