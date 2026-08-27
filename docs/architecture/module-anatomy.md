# Module Anatomy

Complete file structure of a single test module.

## File Layout

```
playwright/
├── configs/
│   ├── ui/modules/
│   │   └── auth/
│   │       └── auth.ui.ts           ← Selectors
│   └── api/modules/
│       └── auth/
│           └── auth.api.ts          ← API intercepts
│
├── support/helpers/modules/
│   └── auth/
│       └── auth.helpers.ts          ← Business logic
│
└── tests/
    └── auth/
        ├── smoke/
        │   ├── login-success.spec.ts
        │   └── login-invalid.spec.ts
        └── e2e/
            ├── login-2fa.spec.ts
            └── login-persistence.spec.ts
```

## Config File: `auth.ui.ts`

```typescript
// playwright/configs/ui/modules/auth/auth.ui.ts

export const AUTH_UI = {
  // Form inputs
  emailInput: '[data-testid="login-email"]',
  passwordInput: '[data-testid="login-password"]',

  // Buttons
  submitButton: 'button:has-text("Sign In")',
  forgotPasswordLink: 'a:has-text("Forgot password?")',

  // Messages
  errorMessage: '[role="alert"]',
  successMessage: '[role="status"]',

  // Headings
  loginHeading: 'h1:has-text("Sign In")',
  dashboardHeading: 'h1:has-text("Dashboard")',
} as const;
```

**Rules:**

- Use `data-testid` when available
- Use semantic selectors (`getByRole`, `getByLabel`)
- Avoid CSS selectors when possible
- Every selector is a constant
- Group related selectors with comments

## Helper File: `auth.helpers.ts`

```typescript
// playwright/support/helpers/modules/auth/auth.helpers.ts

import { Page, expect } from "@playwright/test";
import { AUTH_UI } from "../../../configs/ui/modules/auth/auth.ui";
import { ROUTES } from "../../../configs/app/routes";

export class AuthHelper {
  constructor(private page: Page) {}

  // User actions
  async login(email: string, password: string) {
    await this.page.goto(ROUTES.login);
    await this.page.fill(AUTH_UI.emailInput, email);
    await this.page.fill(AUTH_UI.passwordInput, password);
    await this.page.click(AUTH_UI.submitButton);
  }

  async forgotPassword(email: string) {
    await this.page.goto(ROUTES.login);
    await this.page.click(AUTH_UI.forgotPasswordLink);
    await this.page.fill(AUTH_UI.emailInput, email);
    // ... continue
  }

  // Verifications
  async expectLoginSuccess() {
    await expect(this.page.locator(AUTH_UI.dashboardHeading)).toBeVisible();
    await expect(this.page).toHaveURL(ROUTES.dashboard);
  }

  async expectLoginError(expectedMessage: string) {
    const errorElement = this.page.locator(AUTH_UI.errorMessage);
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedMessage);
  }

  async expectOnLoginPage() {
    await expect(this.page.locator(AUTH_UI.loginHeading)).toBeVisible();
  }
}
```

**Rules:**

- One file per feature module
- Class per helper (e.g., `AuthHelper`)
- Methods return `void` or `boolean` (not Locators)
- Async/await for all interactions
- Clear method names (`login`, `expectSuccess`)
- Encapsulate related actions (multi-step flows)

## Test File: `login-success.spec.ts`

```typescript
// playwright/tests/auth/smoke/login-success.spec.ts

import { test, expect } from "../../../fixtures/base.fixture";
import { AuthHelper } from "../../../support/helpers/modules/auth/auth.helpers";

test.describe("Authentication", () => {
  test("@smoke should login with valid credentials", async ({ page }) => {
    const authHelper = new AuthHelper(page);

    // Act
    await authHelper.login("user@example.com", "password123");

    // Assert
    await authHelper.expectLoginSuccess();
  });

  test("@smoke should show error with invalid password", async ({ page }) => {
    const authHelper = new AuthHelper(page);

    // Act
    await authHelper.login("user@example.com", "wrongpassword");

    // Assert
    await authHelper.expectLoginError("Invalid credentials");
  });
});
```

**Rules:**

- One test per file (or grouped in describe)
- Use `@tag` for categorization
- Clear test names (what should happen?)
- Arrange → Act → Assert (AAA pattern)
- Use helpers for all interactions
- Minimal setup code

## Naming Conventions

| Item                  | Pattern               | Example                               |
| --------------------- | --------------------- | ------------------------------------- |
| **Selector constant** | `UPPER_SNAKE_CASE`    | `AUTH_UI.emailInput`                  |
| **Helper class**      | `PascalCase + Helper` | `AuthHelper`                          |
| **Helper method**     | `camelCase`           | `login()`, `expectSuccess()`          |
| **Test name**         | `should + behavior`   | `should login with valid credentials` |
| **Folder**            | `kebab-case`          | `auth`, `user-profile`                |
| **File**              | `kebab-case.type.ts`  | `auth.ui.ts`, `auth.helpers.ts`       |

## Dependencies

```
Test
  ↓
Helper (imports Config)
  ↓
Config (no imports)
```

**Rule:** Only tests import helpers. Helpers import config. Config imports nothing.

## API Testing Module

For API mocking, follow similar structure:

```typescript
// playwright/configs/api/modules/auth/auth.api.ts
export const AUTH_API = {
  loginEndpoint: "/api/auth/login",
  logoutEndpoint: "/api/auth/logout",
} as const;

// playwright/support/helpers/modules/auth/auth-api.helpers.ts
export class AuthAPIHelper {
  constructor(private page: Page) {}

  async mockLoginSuccess() {
    await this.page.route(AUTH_API.loginEndpoint, async (route) => {
      await route.abort();
      // Mock response
    });
  }
}
```

See [API Mocking Guide](../guides/api-mocking.md) for details.

## Complete Example Structure

```
auth/
├── Config files
│   ├── playwright/configs/ui/modules/auth/auth.ui.ts
│   └── playwright/configs/api/modules/auth/auth.api.ts
│
├── Helper files
│   └── playwright/support/helpers/modules/auth/auth.helpers.ts
│
└── Test files
    ├── playwright/tests/auth/smoke/
    │   ├── login-success.spec.ts
    │   ├── login-invalid.spec.ts
    │   └── login-empty-fields.spec.ts
    │
    └── playwright/tests/auth/e2e/
        ├── login-2fa.spec.ts
        ├── login-persistence.spec.ts
        └── login-logout.spec.ts
```

Each module is self-contained: config, helpers, and tests all work together without touching other modules.

## Checklist for a New Module

- [ ] Create `configs/ui/modules/[module]/[module].ui.ts` with selectors
- [ ] Create `configs/api/modules/[module]/[module].api.ts` if needed
- [ ] Create `support/helpers/modules/[module]/[module].helpers.ts`
- [ ] Register helper in `fixtures/base.fixture.ts`
- [ ] Create test files in `tests/[module]/smoke/` and `tests/[module]/e2e/`
- [ ] Run tests: `npm test tests/[module]/`
- [ ] Verify selectors work
- [ ] Add to [DISCOVERY.md](../../DISCOVERY.md) for team reference

See [Your First Test Module](../guides/first-test-module.md) for a complete walkthrough.
