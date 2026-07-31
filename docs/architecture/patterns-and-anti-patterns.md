# Patterns & Anti-Patterns

Dos and donts for writing maintainable tests.

## DO: Use Helpers for All Actions

✅ Good:

```
const authHelper = new AuthHelper(page);
await authHelper.login("user@test.com", "pass123");
```

❌ Bad:

```
await page.fill("[data-testid="email"]", "user@test.com");
await page.fill("[data-testid="password"]", "pass123");
await page.click("button:has-text("Sign In")");
```

## DO: Keep Selectors in Config

✅ Use config constants:

```
export const LOGIN_UI = {
  emailInput: "[data-testid="login-email"]",
} as const;
```

## DO: Use Data Attributes

✅ data-testid is best (intentional, stable)
✅ aria-label is acceptable (semantic)
❌ CSS selectors are fragile
❌ Relative XPath is very fragile

## DON'T: Chain Tests

Tests must be independent. Each test should:

- Set up its own state
- Not depend on other tests
- Run in any order

## DON'T: Use waitForTimeout()

❌ Bad: `await page.waitForTimeout(3000);`
✅ Good: `await expect(element).toBeVisible({ timeout: 10000 });`

Playwright expect() retries. Fixed waits are flaky.

## DON'T: Put Business Logic in Tests

Logic belongs in helpers. Tests should be readable as requirements.

## Pattern: Arrange → Act → Assert

```
test("should create item", async ({ page }) => {
  // Arrange - setup
  await page.goto("/items");

  // Act - do the thing
  const itemHelper = new ItemHelper(page);
  await itemHelper.create("Buy Milk");

  // Assert - verify
  await expect(page.locator("[role="list"]")).toContainText("Buy Milk");
});
```

See Three-Layer Architecture for the why behind the pattern.
