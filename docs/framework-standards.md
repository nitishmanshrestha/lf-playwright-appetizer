# Framework Standards

> **This is an explanation doc.** It answers _why_ the architecture is designed the way it is.

---

## Why This Architecture Exists

Test automation fails in predictable ways:

- **Selectors break** when UI is refactored — because they were hardcoded in 50 test files
- **Tests become unreadable** — because each spec contains navigation, setup, interaction, and assertion all mixed together
- **Changes cascade** — updating a login flow means touching every test that logs in
- **Duplication explodes** — the same `page.locator('.submit-btn').click()` appears in 30 specs

The Config → Helpers → Tests architecture solves all four:

- Selectors live in one place (Config). Change one constant, every test updates.
- Tests are thin orchestration (Tests). They read like plain English because Helpers own all complexity.
- Shared flows live in helpers (Helpers). Change `visitPayments()` once, 50 tests are fixed.
- Duplication is structurally prevented — configs are the single source of truth.

---

## The 3-Layer Architecture

**Layer 1 — Config** answers "what exists in the app": selector IDs, API endpoint patterns, URL paths. Pure data only. No functions, no logic.

**Layer 2 — Helpers** answers "what can you do": reusable classes with atomic async methods. Every helper imports from Layer 1 only. No hardcoded values. Injected into tests via Playwright fixtures.

**Layer 3 — Tests** answers "what should happen": a sequence of helper calls that describe a user journey. No selectors, no URLs, no logic.

---

## Non-Negotiable Rules

| #   | Rule                                                      | Why it exists                                                                           |
| --- | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | No page objects that duplicate config + helpers           | Dual ownership causes drift. Helpers own all logic with explicit ownership.             |
| 2   | No `page.waitForTimeout(number)`                          | Hard waits are lies. Use `waitForResponse()` or `expect(locator).toBeVisible()`.        |
| 3   | `data-testid` / `data-test` selectors via `getByTestId()` | CSS classes change with refactors. Test IDs are stable contracts.                       |
| 4   | Auth via `storageState` project dependencies              | Session cached once, reused across all tests — no per-test login.                       |
| 4a  | Setup specs must be matched in `playwright.config.ts`     | Auth state only exists if the setup project actually runs a matching `*.setup.ts` file. |
| 5   | Route interception before navigation                      | `waitForResponse()` must be set up before `page.goto()` triggers the request.           |
| 6   | State isolation via Playwright contexts                   | Each test gets a fresh browser context — no contamination between tests.                |
| 7   | All URL paths from `ROUTES` constants                     | Hardcoded paths break silently when routes change. Constants fail at import time.       |

---

## Folder and File Naming

Every module uses the same name across all layers. One name, five files.

```
playwright/configs/api/modules/payments/payments.api.ts
playwright/configs/ui/modules/payments/payments.ui.ts
playwright/support/helpers/modules/payments.helpers.ts
playwright/tests/payments/smoke/payments-smoke.spec.ts
playwright/fixtures/base.fixture.ts  (register PaymentsHelpers here)
```

| Layer      | File pattern           | Example                  |
| ---------- | ---------------------- | ------------------------ |
| API config | `[name].api.ts`        | `payments.api.ts`        |
| UI config  | `[name].ui.ts`         | `payments.ui.ts`         |
| Helpers    | `[name].helpers.ts`    | `payments.helpers.ts`    |
| Smoke spec | `[name]-smoke.spec.ts` | `payments-smoke.spec.ts` |
| E2E spec   | `[name]-e2e.spec.ts`   | `payments-e2e.spec.ts`   |

---

## Selector Strategy

Use locators in this order, from most user-facing to least resilient.

| Priority | Strategy                          | Example                                      | When to use                                          |
| -------- | --------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| 1        | `getByRole()`                     | `page.getByRole('button', { name: 'Save' })` | Interactive elements users click/type into           |
| 2        | `getByLabel()`                    | `page.getByLabel('Email')`                   | Form controls with labels                            |
| 3        | `getByPlaceholder()`              | `page.getByPlaceholder('name@example.com')`  | Inputs without labels                                |
| 4        | `getByText()`                     | `page.getByText('Welcome, John')`            | Non-interactive text containers                      |
| 5        | `getByAltText()` / `getByTitle()` | `page.getByAltText('Company logo')`          | Images/title-driven elements                         |
| 6        | `getByTestId()`                   | `page.getByTestId('submit-btn')`             | Explicit test contract (`data-testid` / `data-test`) |
| 7        | CSS / XPath                       | `page.locator('.btn-primary')`               | Last resort only                                     |

### Locator Decision Flow

1. Is it interactive (button, link, checkbox, textbox)? Use `getByRole()` with name.
2. Is it a form field with label? Use `getByLabel()`.
3. Is it non-interactive content? Use `getByText()`.
4. Need a stable explicit contract? Use `getByTestId()`.
5. If none work, improve app markup or add test IDs before using CSS/XPath.

### Narrowing and Filtering

Prefer composing locators over brittle DOM chains.

```typescript
const row = page
  .getByRole("listitem")
  .filter({ hasText: "Product 2" })
  .filter({ has: page.getByRole("button", { name: "Add to cart" }) });

await row.getByRole("button", { name: "Add to cart" }).click();
```

### Strictness

Playwright locators are strict. Actions fail when more than one element matches.

- Prefer unique locators first.
- Use `.first()` / `.nth()` only when the UI contract guarantees order.
- If strictness fails, narrow with `.filter({ hasText })` or `.filter({ has })`.

---

## Tagging Strategy

Tags control which tests run in which CI pipeline.

```typescript
test.describe("Payments", { tag: ["@payments"] }, () => {
  test("loads the list", { tag: ["@smoke"] }, async ({ paymentsHelpers }) => {
    /* ... */
  });
  test("validates pagination", { tag: ["@e2e"] }, async ({ paymentsHelpers }) => {
    /* ... */
  });
});
```

| Tag         | Meaning             | When it runs             |
| ----------- | ------------------- | ------------------------ |
| `@smoke`    | Critical path, fast | Every commit, every PR   |
| `@e2e`      | Full flow, slower   | Nightly, pre-release     |
| `@[module]` | Module-specific     | When that module changes |

Run a subset: `npx playwright test --grep @smoke`

---

## Why No Traditional Page Objects?

Helpers serve the same purpose with explicit ownership. Config stores selectors (data). Helpers store interactions (behavior). The separation is enforced by the directory structure.

---

## TypeScript Path Aliases

All TypeScript files use short aliases instead of relative `../../..` paths.
These are configured in `tsconfig.json` and resolved by Playwright's test runner.

| Alias         | Resolves to                    | Use for                               |
| ------------- | ------------------------------ | ------------------------------------- |
| `@configs/*`  | `playwright/configs/*`         | UI selectors, API configs, routes     |
| `@support/*`  | `playwright/support/*`         | Helpers and core engine               |
| `@helpers/*`  | `playwright/support/helpers/*` | Shortcut to helper classes            |
| `@core/*`     | `playwright/support/core/*`    | API engine internals                  |
| `@fixtures/*` | `playwright/fixtures/*`        | Fixtures and test data files          |
| `@schemas/*`  | `playwright/schemas/*`         | JSON schema definitions               |
| `@tests/*`    | `playwright/tests/*`           | Spec files (rarely needed in imports) |

```typescript
// Always use aliases — never relative paths in helper/config files
import { PAYMENTS_UI } from "@configs/ui/modules/payments/payments.ui";
import { ROUTES } from "@configs/app/routes";
import { waitForAPI } from "@core/api";
```

---

## Why No `page.waitForTimeout(number)`?

```typescript
// This passes locally and fails in CI at random
await page.getByTestId("submit-btn").click();
await page.waitForTimeout(2000);
await expect(page.getByTestId("table")).toBeVisible();

// This passes everywhere, always
const responsePromise = page.waitForResponse("**/api/payments");
await page.getByTestId("submit-btn").click();
await responsePromise;
await expect(page.getByTestId("table")).toBeVisible();
```
