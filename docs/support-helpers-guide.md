# Support Helpers Guide

## Quick Reference

| Helper type        | Naming pattern    | Example                   |
| ------------------ | ----------------- | ------------------------- |
| Navigate to a page | `visit[View]()`   | `visitList()`             |
| Search or filter   | `search(query)`   | `search("test")`          |
| Create a record    | `create(fields)`  | `create({ name: "New" })` |
| Assert page loaded | `assertLoaded()`  | `assertLoaded()`          |
| Assert a state     | `assert[State]()` | `assertEmptyState()`      |

All helper methods are **verb-first**, camelCase, defined as class methods.

## Locator Patterns In Helpers

Helper methods should compose resilient locators in this order:

1. `getByRole()` for interactive UI
2. `getByLabel()` for forms
3. `getByText()` for non-interactive assertions
4. `getByTestId()` for explicit app contracts

Use filtering to narrow ambiguous matches:

```typescript
const card = this.page.getByRole("listitem").filter({ hasText: "Product 2" });

await card.getByRole("button", { name: "Add to cart" }).click();
```

For product-specific actions, prefer the exact `data-test` locator first and only fall back to a broader role selector when the exact contract is missing; a union locator can become strict-mode ambiguous when several buttons match the fallback.

Use `.first()` or `.nth()` only when UI order is contractually stable.

### Pseudo Self-Healing Rule (Required for Actions)

For action chains (`click`, `fill`, `check`, `uncheck`, `press`, `selectOption`),
compose at least two locator strategies using `.or()` so minor UI shifts do not
break tests immediately.

```typescript
await this.page
  .getByTestId("login-button")
  .or(this.page.getByRole("button", { name: /login/i }))
  .first()
  .click();
```

The framework enforces this with:

- `npm run check:locator-strategy`
- `.github/workflows/locator-strategy.yml`

## Helper Class Structure

```typescript
import { Page, expect, Response } from "@playwright/test";
import { MODULE_CONFIG } from "@configs/api/modules/[name]/[name].api";
import { MODULE_UI } from "@configs/ui/modules/[name]/[name].ui";
import { ROUTES } from "@configs/app/routes";

export class ModuleHelpers {
  constructor(private page: Page) {}

  // ─── Navigation ────────────────────────────────────────────────
  async visitList(): Promise<void> { ... }

  // ─── Actions ───────────────────────────────────────────────────
  async search(query: string): Promise<void> { ... }
  async create(fields: { name: string }): Promise<Response> { ... }

  // ─── Assertions ────────────────────────────────────────────────
  async assertLoaded(): Promise<void> { ... }
  async assertEmptyState(): Promise<void> { ... }
}
```

## Fixture Registration

After creating a helper class, register it in `playwright/fixtures/base.fixture.ts`:

```typescript
import { ModuleHelpers } from "../support/helpers/modules/module.helpers";

type CustomFixtures = {
  // ... existing fixtures
  moduleHelpers: ModuleHelpers;
};

export const test = base.extend<CustomFixtures>({
  // ... existing fixtures
  moduleHelpers: async ({ page }, use) => {
    await use(new ModuleHelpers(page));
  },
});
```

Tests then destructure the helper from the test argument:

```typescript
test("loads the page", async ({ moduleHelpers }) => {
  await moduleHelpers.visitList();
  await moduleHelpers.assertLoaded();
});
```

## Ownership Rule

One helper class owns one module. Before adding a method, verify:

1. It doesn't exist in another module's helpers
2. If shared across modules, it belongs in `helpers/common/`

| Helper scope             | File location                             |
| ------------------------ | ----------------------------------------- |
| Used by one module only  | `helpers/modules/[name].helpers.ts`       |
| Used by multiple modules | `helpers/common/ui.helpers.ts` or similar |
| API engine wrappers      | `helpers/common/api.helpers.ts`           |
| Navigation utilities     | `helpers/common/navigation.helpers.ts`    |

## What NOT to Put in a Helper

| Anti-pattern                              | Why                                     | Fix                                         |
| ----------------------------------------- | --------------------------------------- | ------------------------------------------- |
| `page.waitForTimeout(3000)`               | Flaky                                   | Use `waitForResponse()` or `expect()`       |
| Hardcoded URL strings                     | Breaks when routes change               | Import from ROUTES                          |
| Raw CSS selectors                         | Breaks when styles refactor             | Use `getByTestId()` via config              |
| Strictness bypass via `.nth()` by default | Clicks wrong element after UI changes   | Narrow with `filter({ hasText/has })` first |
| `if/else` logic                           | Helpers are actions, not decision trees | Split into separate methods                 |
| Test assertions in action methods         | Mixes concerns                          | Move to `assert*` method                    |
