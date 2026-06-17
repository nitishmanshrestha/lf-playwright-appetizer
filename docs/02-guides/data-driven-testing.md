# Data-Driven Testing (DDT) Guide

Use DDT when a test needs to run with **multiple input datasets** to validate behavior across scenarios.

---

## When to Use DDT

### ✅ Good DDT Candidates

- **Login tests** with multiple user types (valid, invalid, locked, etc.)
- **Form validation** with edge cases (empty, invalid format, boundary values)
- **Checkout/Payment** with different user data (names, addresses, postal codes)
- **Search/Filter** with multiple query terms and expected results
- **Sorting** with different sort orders and expectations
- **Data ranges** (min/max dates, price filters, pagination)

### ❌ When NOT to Use DDT

- Tests that need different setup/teardown per scenario
- Tests with complex conditional logic
- Tests that check completely different features
- One-off tests without data variation

---

## Quick Start: Checkout Example

### 1. Create JSON Test Data with Assertions

File: `playwright/testdata/saucedemo/checkout-valid-users.json`

```json
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "postalCode": "10001",
    "expectedConfirmationText": "Thank you for your order"
  },
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "postalCode": "90210",
    "expectedConfirmationText": "Thank you for your order"
  }
]
```

**Key:** Include assertion values (like `expectedConfirmationText`) in the test data to avoid hardcoding in tests.

### 2. Parameterize with Explicit Iteration

File: `playwright/tests/saucedemo/ddt/saucedemo-ddt.spec.ts`

**Pattern A: Explicit forEach (Recommended for Custom Fixtures)**

```typescript
import { test } from "../../../fixtures/base.fixture";
import testData from "../../../fixtures/saucedemo-testdata.json";

test.describe("Saucedemo — DDT Checkout", () => {
  testData.checkoutUsers.forEach((user) => {
    test(`checkout with user: ${user.firstName} ${user.lastName}`, async ({ saucedemoHelpers }) => {
      await saucedemoHelpers.visitInventory();
      await saucedemoHelpers.addToCart("sauce-labs-backpack");
      await saucedemoHelpers.proceedToCheckout();
      await saucedemoHelpers.fillCheckoutInfo({
        firstName: user.firstName,
        lastName: user.lastName,
        postalCode: user.postalCode,
      });
      await saucedemoHelpers.finishOrder();
      await saucedemoHelpers.assertOrderConfirmed();
    });
  });
});
```

This runs **once per dataset** with each test title: `checkout with user: John Doe`, `checkout with user: Jane Smith`, etc.

**Pattern B: Playwright's test.each() (Native Approach)**

If you prefer Playwright's native `test.each()`, use it with the base `@playwright/test` export:

```typescript
import { test } from "@playwright/test";
import testData from "../../../fixtures/saucedemo-testdata.json";

test.describe("Saucedemo — DDT Checkout", () => {
  test.each(testData.checkoutUsers)(
    `checkout with user: $firstName $lastName`,
    async ({ page }, user) => {
      // Note: Custom fixtures (saucedemoHelpers) not available here
      // Use page directly or implement helper wrapper fixture
    },
  );
});
```

**When to use each pattern:**

- **Pattern A (forEach):** Use when you need custom helpers, cleaner integration with existing tests
- **Pattern B (test.each):** Use for simpler tests that only need base Playwright fixtures (page, browser, etc.)

---

## Architecture Rules for DDT

### ✅ DO

- Store test data in `playwright/testdata/<module>/*.json`
- Include assertion values in test data (avoid hardcoding)
- Keep helpers **data-agnostic** (they don't know about test data)
- Use `for...of` loops for parameterization
- Place tests in existing `smoke/` or `e2e/` folders (not separate DDT folder)
- Group related datasets (happy path, validation errors, edge cases)
- Use template literals for descriptive test names: `` `test for ${data.item}` ``

### ❌ DON'T

- Hardcode test data in spec files
- Hardcode assertion values in spec files
- Create test data inside helpers
- Use different helpers per dataset
- Skip validation assertions
- Mix multiple features in one DDT test
- Create separate `/ddt` folders (use `/smoke` or `/e2e`)

---

## Identifying DDT in CLI Discovery

When using `playwright-cli` to discover a test, look for:

- **Repeated steps** with different input values
- **Similar assertions** for different scenarios
- **One core flow** with multiple data variations

Example flow:

```bash
playwright-cli open https://www.saucedemo.com
playwright-cli fill "firstName" "John"     # First dataset
playwright-cli fill "firstName" "Jane"     # Second dataset
playwright-cli fill "firstName" "Bob"      # Third dataset
```

→ **Good DDT candidate.** Capture all datasets and create JSON test data.

---

## Running Parameterized Tests

```bash
# Run all smoke tests (including parameterized)
npx playwright test --grep @smoke

# Run checkout tests only
npx playwright test --grep "@checkout"

# Run specific test data scenario
npx playwright test -g "completes checkout for John Doe"

# Run with verbose output to see each parameterized run
npx playwright test --verbose --grep @checkout
```

---

## File Organization

```
playwright/
├── testdata/                                    ← Test data folder
│   └── saucedemo/
│       ├── checkout-valid-users.json
│       └── checkout-invalid-users.json
│
├── fixtures/
│   ├── base.fixture.ts
│   └── example.json
│
└── tests/
    └── saucedemo/
        ├── smoke/
        │   ├── saucedemo-smoke.spec.ts
        │   └── saucedemo-checkout-ddt.spec.ts  ← Parameterized tests
        └── e2e/
            └── saucedemo-e2e.spec.ts
```

---

## Advanced: Validation Error Testing

Test multiple validation errors with a single DDT test:

```json
{
  "invalidCheckoutUsers": [
    {
      "firstName": "",
      "lastName": "User",
      "postalCode": "12345",
      "expectedError": "First Name is required"
    },
    {
      "firstName": "Test",
      "lastName": "",
      "postalCode": "12345",
      "expectedError": "Last Name is required"
    }
  ]
}
```

Test:

```typescript
test.each(testData.invalidCheckoutUsers)(
  "rejects checkout with invalid data: $expectedError",
  async ({ page, saucedemoHelpers }, userData) => {
    await saucedemoHelpers.proceedToCheckout();
    await saucedemoHelpers.fillCheckoutInfo(userData);
    await saucedemoHelpers.finishOrder();

    const errorMessage = await page.locator('[data-test="error"]').textContent();
    expect(errorMessage).toContain(userData.expectedError);
  },
);
```

---

## Next Steps

1. Identify a test with repeated data patterns
2. Extract test data to `playwright/fixtures/module-testdata.json`
3. Refactor test to use `test.each()`
4. Tag with `@ddt`
5. Run and validate all scenarios pass
