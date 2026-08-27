# Self-Healing Selectors & Resilient Tests

How this framework keeps tests passing through UI changes — without a dedicated self-healing tool.

---

## What "self-healing" means here

This framework does not use a third-party self-healing library. Instead, it is designed so that tests survive UI changes through four built-in mechanisms that collectively achieve the same outcome.

---

## Mechanism 1 — Auto-retry via `expect()` assertions

Playwright's `expect()` retries the assertion automatically until it passes or the timeout is reached. Tests that use `expect()` survive timing differences, loading states, and minor rendering delays without any code changes.

**Before (fragile — breaks on slow renders or timing shifts):**

```typescript
// ❌ Fixed wait — flaky and arbitrary
await page.waitForTimeout(3000);
const text = await page.locator('[data-testid="order-total"]').textContent();
expect(text).toBe("$42.00");
```

**After (self-healing — retries until element appears and matches):**

```typescript
// ✅ Auto-retry — survives loading delays up to the configured timeout
await expect(page.getByTestId("order-total")).toHaveText("$42.00");
```

**Why it heals:** If the backend is slower than usual, the element loads at 800ms instead of 200ms. The fixed wait breaks; the `expect()` assertion just waits a little longer and passes.

---

## Mechanism 2 — Locator strategy hierarchy

The framework enforces a selector priority order. Selectors higher in the hierarchy survive more types of UI refactors.

| Priority | Selector type   | Survives class/ID refactor?      | Survives layout refactor? | Survives copy changes?              |
| -------- | --------------- | -------------------------------- | ------------------------- | ----------------------------------- |
| 1        | `getByRole()`   | ✅ Yes                           | ✅ Yes                    | ✅ Yes (targets role, not text)     |
| 2        | `getByLabel()`  | ✅ Yes                           | ✅ Yes                    | ❌ No (label text changes break it) |
| 3        | `getByText()`   | ✅ Yes                           | ✅ Yes                    | ❌ No                               |
| 4        | `getByTestId()` | ✅ Yes (data-testid is explicit) | ✅ Yes                    | ✅ Yes                              |
| ❌       | CSS class       | ❌ No                            | ❌ Sometimes              | ✅ Yes                              |
| ❌       | XPath           | ❌ No                            | ❌ No                     | ✅ Yes                              |

**Before (fragile — breaks when CSS class is renamed or DOM is restructured):**

```typescript
// ❌ CSS selector — breaks on any styling refactor
await page.locator(".btn-primary.submit-action").click();

// ❌ XPath — breaks on any DOM restructure
await page.locator('//div[@class="form"]//button[2]').click();
```

**After (resilient — targets the semantic role, not the implementation):**

```typescript
// ✅ getByRole — works as long as the button exists and has the right accessible name
await page.getByRole("button", { name: "Sign In" }).click();

// ✅ getByTestId — explicit test hook, survives all styling and layout changes
await page.getByTestId("submit-login").click();
```

**Why it heals:** When a developer renames a CSS class or restructures the DOM, `getByRole` and `getByTestId` selectors are unaffected. The test does not need to change.

---

## Mechanism 3 — Single-source selector config

All selectors live in one config file per module. Every test and helper that interacts with the same element reads from the same constant. When the app changes a selector, one edit heals every test.

**Before (scattered selectors — requires hunting through every test file to fix one change):**

```typescript
// ❌ login-smoke.spec.ts
await page.fill('[data-testid="login-email"]', email);

// ❌ login-e2e.spec.ts — duplicate, must also be updated
await page.fill('[data-testid="login-email"]', email);

// ❌ auth-regression.spec.ts — another duplicate
await page.fill('[data-testid="login-email"]', email);
```

**After (single source — one change in config heals all tests):**

```typescript
// ✅ playwright/configs/ui/modules/auth/auth.ui.ts
export const AUTH_UI = {
  emailInput: '[data-testid="login-email"]',  // ← update ONCE here
} as const;

// ✅ auth.helpers.ts uses the constant — no test file needs updating
async login(email: string, password: string) {
  await this.page.fill(AUTH_UI.emailInput, email);
}
```

**Why it heals:** The app changes `data-testid="login-email"` to `data-testid="email-field"`. You update one line in `auth.ui.ts`. All 30 tests that call `authHelper.login()` are fixed automatically — zero test file changes needed.

---

## Mechanism 4 — Dual-locator fallback (getBy + page.locator)

Playwright Codegen generates `getBy*` selectors by default. These are semantically ideal — but they sometimes fail to match reliably when:

- The accessible name is dynamic or localised (e.g. `"Sign in"` vs `"Log in"` depending on a feature flag)
- Multiple elements share the same role and name, making the locator ambiguous
- A third-party component renders without proper ARIA attributes, so `getByRole` finds nothing

The fallback pattern solves this by trying the semantic locator first and dropping to a `page.locator()` (CSS or `data-testid`) only when the primary match count is zero. **This logic always lives in helpers — never in test files.**

### Basic if-else in a helper method

```typescript
// playwright/support/helpers/modules/auth.helpers.ts
async clickSubmit(): Promise<void> {
  const semantic = this.page.getByRole('button', { name: 'Sign In' });

  if (await semantic.count() > 0) {
    await semantic.click();                            // ✅ semantic selector worked
  } else {
    await this.page.locator(AUTH_UI.submitButton).click(); // fallback to config constant
  }
}
```

### Reusable utility extracted into `ui.helpers.ts`

When the same fallback pattern appears across multiple helpers, extract it:

```typescript
// playwright/support/helpers/common/ui.helpers.ts
export class UiHelpers {
  constructor(private page: Page) {}

  /**
   * Click an element using a semantic getBy locator.
   * Falls back to a CSS / data-testid selector if the semantic locator matches nothing.
   */
  async clickWithFallback(semantic: Locator, fallbackSelector: string): Promise<void> {
    if ((await semantic.count()) > 0) {
      await semantic.click();
    } else {
      await this.page.locator(fallbackSelector).click();
    }
  }

  /**
   * Resolve whichever locator matches — for fill, check, or assertion use.
   */
  async resolveLocator(semantic: Locator, fallbackSelector: string): Promise<Locator> {
    return (await semantic.count()) > 0 ? semantic : this.page.locator(fallbackSelector);
  }
}
```

Usage inside a feature helper:

```typescript
// playwright/support/helpers/modules/auth.helpers.ts
export class AuthHelper {
  constructor(
    private page: Page,
    private ui: UiHelpers,
  ) {}

  async login(email: string, password: string): Promise<void> {
    // Email field — codegen gives getByLabel, fallback to data-testid
    const emailField = await this.ui.resolveLocator(
      this.page.getByLabel("Email address"),
      AUTH_UI.emailInput,
    );
    await emailField.fill(email);

    // Password field
    const passwordField = await this.ui.resolveLocator(
      this.page.getByLabel("Password"),
      AUTH_UI.passwordInput,
    );
    await passwordField.fill(password);

    // Submit — try semantic role, fall back to data-testid
    await this.ui.clickWithFallback(
      this.page.getByRole("button", { name: "Sign In" }),
      AUTH_UI.submitButton,
    );
  }
}
```

### Selector resolution precedence

```
getBy* (codegen-generated semantic locator)
          ↓  count() > 0?
    Yes → use it                  ← preferred: accessible, survives refactors
    No  → page.locator(config)   ← fallback: explicit data-testid from config file
```

**Why this heals:** When a third-party component gets updated with proper ARIA roles, `getByRole` starts matching and the fallback path stops being used — automatically, without any code change. When a data-testid is renamed, only the config constant needs updating (Mechanism 3 applies). Either way, the helper method needs no change.

**Rule:** The fallback selector must always come from the config file (`AUTH_UI`, `CHECKOUT_UI`, etc.) — never hardcoded as a string literal in the helper.

---

## Mechanism 4 — Dual-locator fallback (getBy + page.locator)

Playwright Codegen generates `getBy*` selectors by default. These are semantically ideal — but they sometimes fail to match reliably when:

- The accessible name is dynamic or localised (e.g. `"Sign in"` vs `"Log in"` depending on a feature flag)
- Multiple elements share the same role and name, making the locator ambiguous
- A third-party component renders without proper ARIA attributes, so `getByRole` finds nothing

The fallback pattern solves this by trying the semantic locator first and dropping to a `page.locator()` (CSS or `data-testid`) only when the primary match count is zero. **This logic always lives in helpers — never in test files.**

### Basic if-else in a helper method

```typescript
// playwright/support/helpers/modules/auth.helpers.ts
async clickSubmit(): Promise<void> {
  const semantic = this.page.getByRole('button', { name: 'Sign In' });

  if (await semantic.count() > 0) {
    await semantic.click();                             // ✅ semantic selector worked
  } else {
    await this.page.locator(AUTH_UI.submitButton).click(); // fallback to config constant
  }
}
```

### Reusable utility extracted into `ui.helpers.ts`

When the same fallback pattern appears across multiple helpers, extract it:

```typescript
// playwright/support/helpers/common/ui.helpers.ts
export class UiHelpers {
  constructor(private page: Page) {}

  /**
   * Click an element using a semantic getBy locator.
   * Falls back to a CSS / data-testid selector if the semantic locator matches nothing.
   */
  async clickWithFallback(semantic: Locator, fallbackSelector: string): Promise<void> {
    if ((await semantic.count()) > 0) {
      await semantic.click();
    } else {
      await this.page.locator(fallbackSelector).click();
    }
  }

  /**
   * Resolve whichever locator matches — for fill, check, or assertion use.
   */
  async resolveLocator(semantic: Locator, fallbackSelector: string): Promise<Locator> {
    return (await semantic.count()) > 0 ? semantic : this.page.locator(fallbackSelector);
  }
}
```

Usage inside a feature helper:

```typescript
// playwright/support/helpers/modules/auth.helpers.ts
export class AuthHelper {
  constructor(
    private page: Page,
    private ui: UiHelpers,
  ) {}

  async login(email: string, password: string): Promise<void> {
    // Email field — codegen gives getByLabel, fallback to data-testid
    const emailField = await this.ui.resolveLocator(
      this.page.getByLabel("Email address"),
      AUTH_UI.emailInput,
    );
    await emailField.fill(email);

    // Password field
    const passwordField = await this.ui.resolveLocator(
      this.page.getByLabel("Password"),
      AUTH_UI.passwordInput,
    );
    await passwordField.fill(password);

    // Submit — try semantic role, fall back to data-testid
    await this.ui.clickWithFallback(
      this.page.getByRole("button", { name: "Sign In" }),
      AUTH_UI.submitButton,
    );
  }
}
```

### Selector resolution precedence

```
getBy* (codegen-generated semantic locator)
          ↓  count() > 0?
    Yes → use it                  ← preferred: accessible, survives refactors
    No  → page.locator(config)   ← fallback: explicit data-testid from config file
```

**Why this heals:** When a third-party component gets updated with proper ARIA roles, `getByRole` starts matching and the fallback path stops being used — automatically, without any code change. When a data-testid is renamed, only the config constant needs updating (Mechanism 3 applies). Either way, the helper method needs no change.

**Rule:** The fallback selector must always come from the config file (`AUTH_UI`, `CHECKOUT_UI`, etc.) — never hardcoded as a string literal in the helper.

---

## All mechanisms working together

```
Scenario: login page ships a UI refactor — getByRole starts working, data-testid renamed
                    ↓
Mechanism 4: helper tries getByRole first → count() > 0 → uses semantic locator
                    ↓
Mechanism 3: data-testid in AUTH_UI.emailInput updated once → all fallback paths healed
                    ↓
Mechanism 2: getByRole survives the refactor without any code change
                    ↓
Mechanism 1: expect() retries until element is visible after navigation
                    ↓
All 30 tests pass — zero test file changes, one config line updated
```

---

## What this does NOT cover

- **Elements with no accessible role and no data-testid**: the dual-locator fallback has nothing to fall back to; ask the dev team to add a `data-testid` attribute
- **Application logic changes** where the expected behaviour itself changes: assertions must be updated to reflect the new behaviour regardless of selector strategy
- **Third-party self-healing tools** (Healenium, Applitools): these go further by automatically discovering updated selectors at runtime using AI/image matching; this framework does not include them — the mechanisms here are code-level, not runtime-level

---

## Demo recording

> A team session recording walking through these mechanisms with live examples will be linked here once recorded. Check back or ask your QA lead for the latest internal walkthrough.

---

## Related

- [Selector Strategies](../guides/selector-strategies.md) — full selector priority guide
- [Three-Layer Architecture](../architecture/three-layer-pattern.md) — why single-source config is non-negotiable
- [Patterns & Anti-Patterns](../architecture/patterns-and-anti-patterns.md) — `waitForTimeout` and other patterns to avoid
