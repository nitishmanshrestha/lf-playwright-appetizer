---
applyTo: "playwright/support/helpers/**/*.ts"
---

# Helper Files Instructions

## Structure

Every helper file follows this structure:

```typescript
import { Page, expect } from "@playwright/test";
import { MODULE_API } from "@configs/api/modules/[name]/[name].api";
import { MODULE_UI } from "@configs/ui/modules/[name]/[name].ui";
import { ROUTES } from "@configs/app/routes";

export class ModuleHelpers {
  constructor(private page: Page) {}

  // ─── Navigation ────────────────────────────────────────────
  async visitList(): Promise<void> { ... }

  // ─── Actions ───────────────────────────────────────────────
  async search(query: string): Promise<void> { ... }

  // ─── Assertions ────────────────────────────────────────────
  async assertLoaded(): Promise<void> { ... }
}
```

## Rules

- Import all selectors from UI config — never hardcode
- Import all routes from ROUTES — never hardcode URLs
- Methods are verb-first: `visit*`, `create*`, `search*`, `assert*`
- No `page.waitForTimeout()` — use `waitForResponse()` or `expect()` assertions
- Register route interceptions BEFORE navigation (waitForResponse pattern)
- Each method does one thing. If it triggers a network request, wait for the response.
- Assertion methods use Playwright's auto-retry assertions (`expect(locator).toBeVisible()`)
- Prefer locator priority: `getByRole()` → `getByLabel()` → `getByText()` → `getByTestId()`.
- For action locators (`click`, `fill`, `check`, `uncheck`, `press`, `selectOption`), enforce at least two strategies by composing locators with `.or()`.
- Use locator filtering to resolve strictness: `.filter({ hasText })`, `.filter({ has })`, `.filter({ hasNotText })`.
- Use `.first()` / `.nth()` only when UI order is a stable product contract.
- If selector fallback is needed, compose locators with `.or()` rather than hardcoded CSS chains.
