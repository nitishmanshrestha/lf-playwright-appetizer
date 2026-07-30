# Patterns & Anti-Patterns

Dos and don'ts for writing maintainable tests.

## DO: Use Helpers for All Actions

✅ Good:

```typescript
const authHelper = new AuthHelpers(page);
await authHelper.login("user@test.com", "pass123");
```

❌ Bad:

```typescript
await page.getByTestId("email-input").fill("user@test.com");
await page.getByTestId("password-input").fill("pass123");
await page.getByTestId("login-btn").click();
```

## DO: Keep Selectors in Config

✅ Use config constants:

```typescript
export const LOGIN_UI = {
  emailInput: "login-email",
} as const;
```

❌ Never hardcode:

```typescript
await page.getByTestId("login-email").fill("user@test.com");
```

## DO: Use Data Attributes

✅ data-testid is best (intentional, stable)
✅ getByRole is acceptable (semantic)
❌ CSS selectors are fragile
❌ Relative XPath is very fragile

## DO: Make Tests Independent

Tests must be independent. Each test should:

- Set up its own state (or use beforeEach)
- Not depend on other tests
- Run in any order

```typescript
// ✅ Good
test.beforeEach(async ({ authHelpers }) => {
  await authHelpers.visitLogin();
});

test("should login", async ({ authHelpers }) => {
  await authHelpers.login("user@test.com", "pass123");
});
```

## DO: Use Expect Assertions

```typescript
// ✅ Good - retries automatically
await expect(element).toBeVisible();
await expect(page).toHaveURL(/.*dashboard/);

// ❌ Bad - flaky assertions
if (await element.isVisible()) { ... }
```

## DO: Follow Arrange → Act → Assert

```typescript
test("should create item", async ({ itemHelpers }) => {
  // Arrange - setup
  const initialCount = await itemHelpers.getItemCount();

  // Act - do the thing
  await itemHelpers.createItem("Buy Milk");

  // Assert - verify
  const newCount = await itemHelpers.getItemCount();
  expect(newCount).toBe(initialCount + 1);
});
```

---

## DON'T: Chain Tests

Tests must be independent:

```typescript
// ❌ BAD - Test 2 depends on Test 1
test("1. login", async ({ page }) => {
  await page.goto("/login");
  await authHelper.login("user@test.com", "pass");
});

test("2. create item (depends on #1)", async ({ page }) => {
  // This fails if test #1 didn't run or was skipped
  await itemHelper.createItem("Milk");
});
```

## DON'T: Use waitForTimeout()

```typescript
// ❌ Bad - introduces flakiness
await page.waitForTimeout(3000);

// ✅ Good - waits until condition
await expect(element).toBeVisible({ timeout: 10000 });
```

Playwright's `expect()` retries. Fixed waits are flaky and slow.

## DON'T: Put Business Logic in Tests

Logic belongs in helpers. Tests should read like requirements:

```typescript
// ❌ Bad - logic in test
test("checkout", async ({ page }) => {
  const subtotal = 100;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  await expect(page.getByText(total)).toBeVisible();
});

// ✅ Good - logic in helper
test("checkout", async ({ checkoutHelpers }) => {
  await checkoutHelpers.assertTotalCalculation();
});
```

## DON'T: Create Page Object Wrappers

Avoid unnecessarily wrapping methods:

```typescript
// ❌ Bad - just wraps
class LoginPage {
  fillEmail() {
    return this.page.getByTestId("email");
  }
  fillPassword() {
    return this.page.getByTestId("password");
  }
}

// ✅ Good - encapsulates business action
class AuthHelpers {
  async login(email, password) {
    await this.page.getByTestId("email").fill(email);
    await this.page.getByTestId("password").fill(password);
    await this.page.getByTestId("submit").click();
  }
}
```

## DON'T: Import from @playwright/test in Specs

```typescript
// ❌ Bad - imports from @playwright/test
import { test, expect } from "@playwright/test";

// ✅ Good - imports from fixture
import { test, expect } from "../../../fixtures/base.fixture";
```

The fixture provides custom helpers.

## DON'T: Hardcode Sensitive Data

```typescript
// ❌ Bad - hardcoded creds
await authHelper.login("admin@company.com", "SuperSecret123");

// ✅ Good - use .env or environment
await authHelper.login(process.env.TEST_EMAIL, process.env.TEST_PASSWORD);
```

## DON'T: Mix Multiple Features in One Test

One test = one feature:

```typescript
// ❌ Bad - tests two features
test("login and create item", async ({ authHelpers, itemHelpers }) => {
  await authHelpers.login("user@test.com", "pass");
  await itemHelpers.createItem("Milk");
  await itemHelpers.deleteItem("Milk");
});

// ✅ Good - separate concerns
test("should login", async ({ authHelpers }) => {
  await authHelpers.login("user@test.com", "pass");
  await authHelpers.assertLoginSuccess();
});

test("should create item", async ({ itemHelpers }) => {
  // Assume logged in via beforeEach
  await itemHelpers.createItem("Milk");
  await itemHelpers.assertItemCreated("Milk");
});
```
