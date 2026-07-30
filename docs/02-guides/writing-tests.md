# Writing Tests

How to author Playwright tests using the three-layer pattern: Config → Helpers → Tests.

---

## Direct Authoring (Three-Layer Pattern)

For adding tests to modules you already understand.

1. Check `playwright/configs/ui/modules/` for existing selectors — add any missing ones
2. Add or extend a helper in `playwright/support/helpers/modules/`
3. Write the spec in `playwright/tests/<module>/smoke/` or `e2e/`

---

## Step 1: Update Config

File: `playwright/configs/ui/modules/mymodule/mymodule.ui.ts`

```typescript
export const MYMODULE_UI = {
  // Group by page section
  LOGIN: {
    EMAIL_INPUT: "login-email",
    PASSWORD_INPUT: "login-password",
    SUBMIT_BTN: "login-submit",
  },
  DASHBOARD: {
    HEADING: "dashboard-heading",
    MENU: "dashboard-menu",
  },
} as const;
```

**Rules:**

- Use `data-testid` values exactly as they appear in the HTML
- Group related selectors with comments
- Use `as const` for type inference
- No logic — pure data only

---

## Step 2: Write Helper

File: `playwright/support/helpers/modules/mymodule.helpers.ts`

```typescript
import { Page, expect } from "@playwright/test";
import { MYMODULE_UI } from "@configs/ui/modules/mymodule/mymodule.ui";
import { ROUTES } from "@configs/app/routes";

export class MymoduleHelpers {
  constructor(private page: Page) {}

  // ─── Navigation ────────────────────────────────
  async visitLogin(): Promise<void> {
    await this.page.goto(ROUTES.MYMODULE.LOGIN);
    await expect(
      this.page.getByTestId(MYMODULE_UI.LOGIN.HEADING),
    ).toBeVisible();
  }

  // ─── Actions ───────────────────────────────────
  async login(email: string, password: string): Promise<void> {
    await this.page.getByTestId(MYMODULE_UI.LOGIN.EMAIL_INPUT).fill(email);
    await this.page
      .getByTestId(MYMODULE_UI.LOGIN.PASSWORD_INPUT)
      .fill(password);
    await this.page.getByTestId(MYMODULE_UI.LOGIN.SUBMIT_BTN).click();
  }

  // ─── Assertions ────────────────────────────────
  async expectLoginSuccess(): Promise<void> {
    await expect(this.page).toHaveURL(ROUTES.MYMODULE.DASHBOARD);
    await expect(
      this.page.getByTestId(MYMODULE_UI.DASHBOARD.HEADING),
    ).toBeVisible();
  }

  async expectLoginError(message: string): Promise<void> {
    const errorElement = this.page.getByRole("alert");
    await expect(errorElement).toContainText(message);
  }
}
```

**Rules:**

- Import selectors from config
- Import routes from `@configs/app/routes`
- One action per method
- Method names: `visit*`, `fill*`, `assert*`, `expect*`
- No hardcoded values

---

## Step 3: Register in Fixture

File: `playwright/fixtures/base.fixture.ts`

```typescript
import { MymoduleHelpers } from "../support/helpers/modules/mymodule.helpers";

type CustomFixtures = {
  // ... existing helpers
  mymoduleHelpers: MymoduleHelpers;
};

export const test = base.extend<CustomFixtures>({
  // ... existing helpers
  mymoduleHelpers: async ({ page }, use) => {
    await use(new MymoduleHelpers(page));
  },
});
```

---

## Step 4: Write Tests

File: `playwright/tests/mymodule/smoke/login-smoke.spec.ts`

```typescript
import { test } from "../../../fixtures/base.fixture";

test.describe("Mymodule — Login", { tag: ["@mymodule"] }, () => {
  test.beforeEach(async ({ mymoduleHelpers }) => {
    await mymoduleHelpers.visitLogin();
  });

  test(
    "should login with valid credentials",
    { tag: ["@smoke"] },
    async ({ mymoduleHelpers }) => {
      // Arrange (setup done in beforeEach)

      // Act
      await mymoduleHelpers.login("user@example.com", "password123");

      // Assert
      await mymoduleHelpers.expectLoginSuccess();
    },
  );

  test(
    "should show error with invalid password",
    { tag: ["@smoke"] },
    async ({ mymoduleHelpers }) => {
      // Act
      await mymoduleHelpers.login("user@example.com", "wrongpassword");

      // Assert
      await mymoduleHelpers.expectLoginError("Invalid credentials");
    },
  );
});
```

**Rules:**

- Use `beforeEach` for common setup
- Destructure helpers from fixture
- Tag tests with `@module` and `@smoke`
- Follow Arrange → Act → Assert pattern
- One scenario per test
- Never import from `@playwright/test` (use `base.fixture.ts`)

---

## Running Tests

```bash
# All tests
npm test

# Smoke tests only
npm run test:smoke

# Specific module
npx playwright test --grep @mymodule

# Specific test
npx playwright test -g "should login"

# Headed browser
npm run test:headed

# Debug mode
npm run test:debug
```

---

## Pattern: Arrange → Act → Assert

```typescript
test("should create and delete item", async ({ mymoduleHelpers }) => {
  // Arrange — setup preconditions
  await mymoduleHelpers.visitList();
  const itemCount = await mymoduleHelpers.getItemCount();

  // Act — do the thing
  await mymoduleHelpers.createItem("Buy Milk");

  // Assert — verify the result
  const newCount = await mymoduleHelpers.getItemCount();
  expect(newCount).toBe(itemCount + 1);
  await mymoduleHelpers.assertItemVisible("Buy Milk");
});
```
