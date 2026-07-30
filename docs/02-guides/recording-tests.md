# Test Generation with Codegen

Generate Playwright test code automatically as you interact with the browser.

---

## How It Works

Every action you perform with `playwright-cli` generates corresponding Playwright TypeScript code.
This code appears in the output and can be copied directly into your test files.

---

## Example Workflow

```bash
# Start a session
playwright-cli open https://example.com/login

# Take a snapshot to see elements
playwright-cli snapshot
# Output shows: e1 [textbox "Email"], e2 [textbox "Password"], e3 [button "Sign In"]

# Fill form fields - generates code automatically
playwright-cli fill e1 "user@example.com"
# Ran Playwright code:
# await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');

playwright-cli fill e2 "password123"
# Ran Playwright code:
# await page.getByRole('textbox', { name: 'Password' }).fill('password123');

playwright-cli click e3
# Ran Playwright code:
# await page.getByRole('button', { name: 'Sign In' }).click();
```

---

## Building a Test File

Collect the generated code into a Playwright test:

```typescript
import { test, expect } from "@fixtures/base.fixture";

test("login flow", async ({ page, mymoduleHelpers }) => {
  await mymoduleHelpers.visitLogin();
  await mymoduleHelpers.login("user@example.com", "password123");

  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

## Best Practices

### 1. Use Semantic Locators

The generated code uses role-based locators when possible, which are more resilient:

```typescript
// Generated (good - semantic)
await page.getByRole("button", { name: "Submit" }).click();

// Avoid (fragile - CSS selectors)
await page.locator("#submit-btn").click();
```

### 2. Explore Before Recording

Take snapshots to understand the page structure before recording actions:

```bash
playwright-cli open https://example.com
playwright-cli snapshot
# Review the element structure
playwright-cli click e5
```

### 3. Add Assertions Manually

Generated code captures actions but not assertions. Add expectations in your test using recommended matchers:

- `toBeVisible()` — element is rendered and visible
- `toHaveText(text)` — element text content matches
- `toHaveValue(value)` — input/select value matches
- `toHaveURL(url)` — page URL matches

```typescript
// Generated action
await page.getByRole("button", { name: "Submit" }).click();

// Manual assertions:
await expect(page.getByRole("alert", { name: "Success" })).toBeVisible();
await expect(page.getByTestId("main-header")).toHaveText("Welcome, user");
await expect(page.getByRole("textbox", { name: "Email" })).toHaveValue(
  "user@example.com",
);
```

---

## Extracting into Framework Layers

Once you have generated code, refactor it into Config → Helpers → Tests:

### Raw Codegen

```typescript
await page.goto("https://example.com/login");
await page.getByRole("textbox", { name: "Email" }).fill("user@example.com");
await page.getByRole("textbox", { name: "Password" }).fill("password123");
await page.getByRole("button", { name: "Sign In" }).click();
```

### Step 1: Extract Selectors to Config

```typescript
// mymodule.ui.ts
export const MYMODULE_UI = {
  EMAIL_INPUT: "login-email",
  PASSWORD_INPUT: "login-password",
  SUBMIT_BTN: "login-submit",
} as const;
```

### Step 2: Extract to Route

```typescript
// routes.ts
const MYMODULE = {
  LOGIN: "/login",
} as const;
```

### Step 3: Encapsulate in Helper

```typescript
// mymodule.helpers.ts
import { Page } from "@playwright/test";

export class MymoduleHelpers {
  constructor(private page: Page) {}

  async login(email: string, password: string) {
    await this.page.getByTestId(MYMODULE_UI.EMAIL_INPUT).fill(email);
    await this.page.getByTestId(MYMODULE_UI.PASSWORD_INPUT).fill(password);
    await this.page.getByTestId(MYMODULE_UI.SUBMIT_BTN).click();
  }
}
```

### Step 4: Register the Helper in the Fixture

```typescript
// base.fixture.ts
type CustomFixtures = {
  mymoduleHelpers: MymoduleHelpers;
};

export const test = base.extend<CustomFixtures>({
  mymoduleHelpers: async ({ page }, use) => {
    await use(new MymoduleHelpers(page));
  },
});
```

### Step 5: Write Clean Test

```typescript
test("should login", async ({ mymoduleHelpers, page }) => {
  await mymoduleHelpers.login("user@example.com", "password123");
  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

## Quickstart: Scaffold from Codegen

```bash
# 1. Run codegen and record your flow
npm run context:codegen https://example.com

# 2. Let the agent classify the flow and ask for DDT details if it repeats

# 3. Run the guided scaffold flow once
npm run scaffold:flow -- --module mymodule --feature login --capture capture.json

# 4. If the flow is not DDT, convert the generated code into a single scenario helper + spec manually

# 5. Run the tests
npm test --grep @mymodule
```

For the simplest path, start with one module and one smoke test before introducing DDT scaffolding.
