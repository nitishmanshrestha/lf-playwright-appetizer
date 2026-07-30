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
│   └── auth.helpers.ts              ← Business logic
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
  emailInput: "login-email",
  passwordInput: "login-password",

  // Buttons
  submitButton: "login-submit",
  forgotPasswordLink: "forgot-password-link",

  // Messages
  errorMessage: "login-error",
  successMessage: "login-success",

  // Headings
  loginHeading: "login-heading",
  dashboardHeading: "dashboard-heading",
} as const;
```

**Rules:**

- Use `data-testid` values exactly as they appear in the HTML
- Group related selectors with comments
- Every selector is a constant
- Use `as const` for type safety

## Helper File: `auth.helpers.ts`

```typescript
// playwright/support/helpers/modules/auth.helpers.ts

import { Page, expect } from "@playwright/test";
import { AUTH_UI } from "@configs/ui/modules/auth/auth.ui";
import { ROUTES } from "@configs/app/routes";

export class AuthHelpers {
  constructor(private page: Page) {}

  // ─── Navigation ───────────────────────────────
  async visitLogin(): Promise<void> {
    await this.page.goto(ROUTES.AUTH.LOGIN);
    await expect(this.page.getByTestId(AUTH_UI.loginHeading)).toBeVisible();
  }

  // ─── Actions ───────────────────────────────────
  async login(email: string, password: string): Promise<void> {
    await this.page.getByTestId(AUTH_UI.emailInput).fill(email);
    await this.page.getByTestId(AUTH_UI.passwordInput).fill(password);
    await this.page.getByTestId(AUTH_UI.submitButton).click();
  }

  async forgotPassword(email: string): Promise<void> {
    await this.page.getByTestId(AUTH_UI.forgotPasswordLink).click();
    await this.page.getByTestId(AUTH_UI.emailInput).fill(email);
    // ... continue
  }

  // ─── Assertions ───────────────────────────────
  async assertLoginSuccess(): Promise<void> {
    await expect(this.page.getByTestId(AUTH_UI.dashboardHeading)).toBeVisible();
    await expect(this.page).toHaveURL(ROUTES.AUTH.DASHBOARD);
  }

  async assertLoginError(expectedMessage: string): Promise<void> {
    const errorElement = this.page.getByTestId(AUTH_UI.errorMessage);
    await expect(errorElement).toBeVisible();
    await expect(errorElement).toContainText(expectedMessage);
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.page.getByTestId(AUTH_UI.loginHeading)).toBeVisible();
  }
}
```

**Rules:**

- One file per module (e.g., `auth.helpers.ts`)
- Class per module (e.g., `AuthHelpers`)
- Methods are async
- Clear method names (`login`, `assertSuccess`)
- Group methods by category: Navigation → Actions → Assertions

## Test File: `login-success.spec.ts`

```typescript
// playwright/tests/auth/smoke/login-success.spec.ts

import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Authentication", { tag: ["@auth"] }, () => {
  test.beforeEach(async ({ authHelpers }) => {
    await authHelpers.visitLogin();
  });

  test(
    "should login with valid credentials",
    { tag: ["@smoke"] },
    async ({ authHelpers }) => {
      // Act
      await authHelpers.login("user@example.com", "password123");

      // Assert
      await authHelpers.assertLoginSuccess();
    },
  );

  test(
    "should show error with invalid password",
    { tag: ["@smoke"] },
    async ({ authHelpers }) => {
      // Act
      await authHelpers.login("user@example.com", "wrongpassword");

      // Assert
      await authHelpers.assertLoginError("Invalid credentials");
    },
  );
});
```

**Rules:**

- One scenario per test (or grouped in describe)
- Use `@tag` for categorization
- Clear test names (what should happen?)
- Arrange → Act → Assert pattern
- Import from `base.fixture.ts`, NOT `@playwright/test`
