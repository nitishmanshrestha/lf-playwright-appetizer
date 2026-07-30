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

## Real Example

```typescript
import { Locator, Page, expect } from "@playwright/test";
import { MYMODULE_UI } from "@configs/ui/modules/mymodule/mymodule.ui";
import { ROUTES } from "@configs/app/routes";

export class MyModuleHelpers {
  constructor(private page: Page) {}

  private byTestIdOrRole(testId: string, role: "button" | "link", name: string | RegExp): Locator {
    return this.page.getByTestId(testId).or(this.page.getByRole(role, { name }));
  }

  async visitList(): Promise<void> {
    await this.page.goto(ROUTES.MYMODULE.LIST);
    await expect(this.page.getByTestId(MYMODULE_UI.LIST.CONTAINER)).toBeVisible();
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page.getByTestId(MYMODULE_UI.LIST.CONTAINER)).toBeVisible();
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

**Locator Strategy:**
- Priority: `getByRole()` → `getByLabel()` → `getByText()` → `getByTestId()`
- Use `.or()` for fallback: `getByTestId(id).or(getByRole(role))`
- Never use CSS or XPath unless last resort

**Async/Waiting:**
- Use `waitForResponse()` after actions that trigger API calls
- Never use `waitForTimeout()`
