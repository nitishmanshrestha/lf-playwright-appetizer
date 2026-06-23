---
applyTo: "playwright/support/helpers/**/*.ts"
---

# Helper Files Instructions

Helpers are reusable methods that orchestrate page interactions. All selectors and routes come from config files.

## Structure Template

```typescript
import { Page, expect } from "@playwright/test";
import { MODULE_UI } from "@configs/ui/modules/[name]/[name].ui";
import { ROUTES } from "@configs/app/routes";

export class ModuleHelpers {
  constructor(private page: Page) {}

  // ─── Navigation ────────────────────────────────────────────
  async visitList(): Promise<void> { ... }

  // ─── Actions ───────────────────────────────────────────────
  async create(data: object): Promise<void> { ... }

  // ─── Assertions ────────────────────────────────────────────
  async assertLoaded(): Promise<void> { ... }
}
```

## Real Example: Navigation + Locator Composition

```typescript
import { Locator, Page, expect } from "@playwright/test";
import { SAUCEDEMO_UI } from "@configs/ui/modules/saucedemo/saucedemo.ui";
import { ROUTES } from "@configs/app/routes";

export class SaucedemoHelpers {
  constructor(private page: Page) {}

  // Reusable locator fallback pattern
  private byTestIdOrRole(testId: string, role: "button" | "link", name: string | RegExp): Locator {
    return this.page.getByTestId(testId).or(this.page.getByRole(role, { name }));
  }

  async visitInventory(): Promise<void> {
    await this.page.goto(ROUTES.SAUCEDEMO.INVENTORY);
    await expect(this.page.getByTestId(SAUCEDEMO_UI.INVENTORY.CONTAINER)).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.getByTestId(SAUCEDEMO_UI.LOGIN.USERNAME_INPUT).fill(username);
    await this.page.getByTestId(SAUCEDEMO_UI.LOGIN.PASSWORD_INPUT).fill(password);
    await this.byTestIdOrRole(SAUCEDEMO_UI.LOGIN.LOGIN_BTN, "button", /login/i).first().click();
  }

  async assertLoginSucceeded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html$/);
    await expect(this.page.getByTestId(SAUCEDEMO_UI.INVENTORY.CONTAINER)).toBeVisible();
  }
}
```

## Rules

**Imports & Constants:**

- Import selectors from `@configs/ui/modules/[name]/[name].ui`
- Import routes from `@configs/app/routes`
- Never hardcode selectors or URLs in methods

**Method Naming:**

- Verb-first: `visit*`, `create*`, `search*`, `assert*`, `fill*`
- One action per method
- Descriptive names that reveal intent

**Locator Strategy:**

- Priority: `getByRole()` → `getByLabel()` → `getByText()` → `getByTestId()`
- Use `.or()` for fallback: `getByTestId(id).or(getByRole(role))`
- Filter before index: `.filter({ hasText })` before `.first()`
- Use `.first()` / `.nth()` only when order is guaranteed

**Timing & Assertions:**

- No `page.waitForTimeout()` — use `expect()` auto-retry
- Wait for URL changes: `await expect(page).toHaveURL(pattern)`
- Wait for visibility: `await expect(locator).toBeVisible()`

**API Interception (if needed):**

```typescript
async createItem(data: object): Promise<void> {
  const responsePromise = this.page.waitForResponse(
    (res) => res.url().includes("/api/items") && res.status() === 201
  );
  await this.page.getByRole("button", { name: /create/i }).click();
  await responsePromise;
}
```

## Anti-Patterns

❌ **Hardcoded selectors:**

```typescript
await page.locator(".btn-primary").click(); // BAD
```

✅ **Config constants:**

```typescript
await page.getByTestId(MODULE_UI.SUBMIT_BTN).click(); // GOOD
```

❌ **Hardcoded URLs:**

```typescript
await page.goto("/inventory.html"); // BAD
```

✅ **Route constants:**

```typescript
await page.goto(ROUTES.SAUCEDEMO.INVENTORY); // GOOD
```

❌ **Arbitrary waits:**

```typescript
await page.waitForTimeout(3000); // BAD
```

✅ **Deterministic waits:**

```typescript
await expect(page.getByText("Success")).toBeVisible(); // GOOD
```
