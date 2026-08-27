---
description: "Adapt the boilerplate to a real application: collect app details, strip sample modules, configure the real app project, and scaffold the first module. Use when a team is starting fresh with this boilerplate and wants to replace saucedemo/example with their own app."
---

# Adapt Boilerplate to Your Application

You are a Principal Automation Engineer helping a team adapt this Playwright boilerplate to their own application.

Work through the four phases below in strict order. **Stop and ask the user before each phase that requires their inputs.** Do not skip phases or generate code before the inputs are confirmed.

---

## Phase 1 — Collect App Details

Ask the user for the following before doing anything else. Populate these values — they are used in every subsequent step.

| Input             | Description                                                       | Default if skipped      |
| ----------------- | ----------------------------------------------------------------- | ----------------------- |
| `appBaseUrl`      | The base URL of the app under test                                | `http://localhost:3000` |
| `hasAuth`         | Does the app require login? (yes/no)                              | yes                     |
| `authUrl`         | Login page path (e.g. `/login`)                                   | `/login`                |
| `usernameLabel`   | Accessible label or placeholder of the username input             | `Username`              |
| `passwordLabel`   | Accessible label or placeholder of the password input             | `Password`              |
| `submitLabel`     | Accessible name of the submit/login button                        | `Login`                 |
| `testIdAttribute` | The HTML attribute used as test ID (`data-testid` or `data-test`) | `data-testid`           |
| `firstModuleName` | Name of the first feature/module to test (snake_case)             | required                |
| `projectName`     | Playwright project name for the real app                          | `chromium`              |

Present a summary of the collected values and ask: **"Are these correct? Shall I proceed?"** Wait for confirmation.

---

## Phase 2 — Strip Sample Assets

Remove the sample modules in this exact order. Do not regenerate them.

### 2a. Delete sample test files

```
playwright/tests/saucedemo/          → delete entire folder
playwright/tests/example/            → delete entire folder
playwright/tests/saucedemo.setup.ts  → delete
```

Keep `playwright/tests/global.setup.ts` — it is adapted in Phase 3.

### 2b. Delete sample helpers

```
playwright/support/helpers/modules/saucedemo.helpers.ts  → delete
playwright/support/helpers/modules/example.helpers.ts    → delete
```

### 2c. Delete sample configs

```
playwright/configs/ui/modules/saucedemo/    → delete entire folder
playwright/configs/ui/modules/example/      → delete entire folder
playwright/configs/api/modules/saucedemo/   → delete entire folder
playwright/configs/api/modules/example/     → delete entire folder
```

### 2d. Clean `playwright/fixtures/base.fixture.ts`

Remove only the lines that reference sample helpers. Do not touch common helpers (`api`, `har`, `nav`, `ui`, `evidence`).

**Remove these imports:**

```ts
import { ExampleHelpers } from "../support/helpers/modules/example.helpers";
import { SaucedemoHelpers } from "../support/helpers/modules/saucedemo.helpers";
```

**Remove from `CustomFixtures` type:**

```ts
exampleHelpers: ExampleHelpers;
saucedemoHelpers: SaucedemoHelpers;
```

**Remove from `test.extend()`:**

```ts
exampleHelpers: async ({ page }, use) => {
  await use(new ExampleHelpers(page));
},
saucedemoHelpers: async ({ page }, use) => {
  await use(new SaucedemoHelpers(page));
},
```

---

## Phase 3 — Configure the Real App

### 3a. Update `.env`

Write or update the `.env` file in the project root with the collected values:

```
BASE_URL=<appBaseUrl>
AUTH_URL=<authUrl>
USERNAME=<leave placeholder — user fills real value>
PASSWORD=<leave placeholder — user fills real value>
SESSION_VALIDATE_URL=/api/v1/me
```

> Never write real credentials into the file. Use placeholders and instruct the user to fill them in.

### 3b. Revamp `playwright.config.ts`

Replace the `projects` array. Use `<projectName>` and `<appBaseUrl>` from Phase 1.

If `hasAuth` is **yes**:

```ts
projects: [
  {
    name: "auth-setup",
    testMatch: /.*\.setup\.ts$/,
    use: {
      baseURL: process.env.BASE_URL || "<appBaseUrl>",
      testIdAttribute: "<testIdAttribute>",
    },
  },
  {
    name: "<projectName>",
    use: {
      ...devices["Desktop Chrome"],
      baseURL: process.env.BASE_URL || "<appBaseUrl>",
      testIdAttribute: "<testIdAttribute>",
      storageState: "playwright/.auth/user.json",
    },
    dependencies: ["auth-setup"],
  },
],
```

If `hasAuth` is **no**:

```ts
projects: [
  {
    name: "<projectName>",
    use: {
      ...devices["Desktop Chrome"],
      baseURL: process.env.BASE_URL || "<appBaseUrl>",
      testIdAttribute: "<testIdAttribute>",
    },
  },
],
```

Remove all saucedemo/saucedemo-setup/example project blocks.

### 3c. Update `playwright/tests/global.setup.ts`

If `hasAuth` is **yes**, replace the login logic with the app's login flow using the collected selector labels:

```ts
import { test as setup } from "@playwright/test";
import * as path from "path";

const AUTH_FILE = path.join(__dirname, "../.auth/user.json");

setup("authenticate", async ({ page }) => {
  if (!process.env.RUN_GLOBAL_AUTH) return;

  await page.goto(process.env.AUTH_URL ?? "<authUrl>");
  await page.getByLabel("<usernameLabel>").fill(process.env.USERNAME ?? "");
  await page.getByLabel("<passwordLabel>").fill(process.env.PASSWORD ?? "");
  await page.getByRole("button", { name: "<submitLabel>" }).click();

  // Wait for post-login state before saving storage
  await page.waitForURL((url) => !url.pathname.includes("<authUrl>"));

  await page.context().storageState({ path: AUTH_FILE });
});
```

If `hasAuth` is **no**, delete `global.setup.ts`.

---

## Phase 4 — Scaffold the First Module

Use `<firstModuleName>` from Phase 1. Create files in this exact order.

### 4a. UI config

File: `playwright/configs/ui/modules/<firstModuleName>/<firstModuleName>.ui.ts`

```ts
export const <FIRSTMODULE>_UI = {
  // Add data-testid / data-test selectors here after app discovery
  // Example:
  // SUBMIT_BUTTON: "submit-btn",
} as const;
```

### 4b. Route

Add to `playwright/configs/app/routes.ts`:

```ts
<FIRSTMODULE>: {
  INDEX: "/<firstModuleName>",
},
```

### 4c. Helper

File: `playwright/support/helpers/modules/<firstModuleName>.helpers.ts`

```ts
import { Page } from "@playwright/test";
import { ROUTES } from "@configs/app/routes";

export class <FirstModuleName>Helpers {
  constructor(private page: Page) {}

  async visitIndex() {
    await this.page.goto(ROUTES.<FIRSTMODULE>.INDEX);
  }
}
```

### 4d. Register in fixtures

In `playwright/fixtures/base.fixture.ts`:

Add import:

```ts
import { <FirstModuleName>Helpers } from "../support/helpers/modules/<firstModuleName>.helpers";
```

Add to `CustomFixtures` type:

```ts
<firstModuleName>Helpers: <FirstModuleName>Helpers;
```

Add to `test.extend()`:

```ts
<firstModuleName>Helpers: async ({ page }, use) => {
  await use(new <FirstModuleName>Helpers(page));
},
```

### 4e. Smoke spec

File: `playwright/tests/<firstModuleName>/smoke/<firstModuleName>-smoke.spec.ts`

```ts
import { test, expect } from "../../fixtures/base.fixture";

test.describe("<firstModuleName> @<firstModuleName>", () => {
  test("should load the index page @smoke", async ({ <firstModuleName>Helpers, page }) => {
    await <firstModuleName>Helpers.visitIndex();
    await expect(page).toHaveURL(/<firstModuleName>/);
  });
});
```

---

## Phase 5 — Verify

Run the adapted suite:

```bash
npm test
npm run report
```

If tests fail, diagnose using:

```bash
npm run test:debug
```

Do **not** add `page.waitForTimeout()` as a band-aid for timing issues.

---

## Non-Negotiable Rules (Always Enforced)

```
NEVER  write real credentials into files — use .env placeholders
NEVER  hardcode selectors — use constants from [module].ui.ts
NEVER  hardcode URLs — use constants from routes.ts
NEVER  import test/expect from @playwright/test in spec files — use base.fixture.ts
NEVER  login in beforeEach — use storageState project dependency
NEVER  page.waitForTimeout() — use waitForResponse() or expect()
NEVER  skip Phase 2 (strip samples) before Phase 3 (configure real app)

ALWAYS config → helpers → tests (in that order)
ALWAYS one helper class per module
ALWAYS register new helpers in base.fixture.ts
```
