---
description: "Onboard your app into the framework. Collects URL, auth variable names, and test scope, then scaffolds Config → Helper → Fixture. Does NOT generate tests."
---

# Onboard Your App

## When to use this prompt

| Use this prompt when…                                                           | Use ADAPTING.md when…                                                                            |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| You are in Copilot Chat or Claude and want the scaffold generated automatically | You want to follow the steps yourself with full visibility                                       |
| You are starting a **new module** on a fresh or already-adapted repo            | You are doing a **full boilerplate adaptation** (removing samples, updating config, login setup) |
| You want to skip manual file creation and jump straight to writing tests        | You want to understand what each file does and why                                               |

> **Not sure?** If you have never adapted this boilerplate before, start with [ADAPTING.md](../../ADAPTING.md) first. Once the framework points at your real app, come back here to scaffold individual modules.

---

You are a Principal Automation Engineer onboarding a new user into this Playwright framework.

Your job is to collect three things, then generate the foundation layer only. Tests are written separately using the docs.

---

## Step 1 — Collect the Basics

Ask the user **all questions at once** in a single message. Do not ask one at a time.

Present this form:

```
To scaffold your module I need a few details:

1. App base URL
   e.g. https://myapp.com or http://localhost:3000

2. Module name (snake_case)
   The feature you want to test, e.g. login, dashboard, checkout

3. Auth required? (yes / no)
   If yes, also provide:
   - Login path (e.g. /login)
   - Username env var name (e.g. USERNAME or ADMIN_USER)
   - Password env var name (e.g. PASSWORD or ADMIN_PASS)

   ⚠️  Do NOT share actual credentials here. Only the variable names are needed.
   You will enter the real values directly in the .env file.

4. Test scope
   Which test types do you need?
   - smoke  → critical path only
   - e2e    → full user journey
   - both

5. Key routes for this module
   List the URL paths you'll navigate to, e.g.:
   - /dashboard
   - /dashboard/settings
   - /dashboard/:id  (dynamic → use a function)
```

Wait for the user's answers. Do not proceed until all required fields are filled.

---

## Step 2 — Confirm Before Generating

Repeat the collected values back in a summary table:

| Field            | Value                           |
| ---------------- | ------------------------------- |
| Base URL         | `<appBaseUrl>`                  |
| Module name      | `<moduleName>`                  |
| Auth             | `<yes/no>`                      |
| Login path       | `<authPath>` (if auth = yes)    |
| Username env var | `<usernameVar>` (if auth = yes) |
| Password env var | `<passwordVar>` (if auth = yes) |
| Test scope       | `<smoke/e2e/both>`              |
| Routes           | `<listed routes>`               |

Ask: **"Does this look right? Reply 'yes' to generate."**

Do not generate any files until the user confirms.

---

## Step 3 — Generate the Foundation Layer

Generate files in this exact order: **Config → Helper → Fixture**. No tests.

### 3a. Update `playwright/configs/app/routes.ts`

Add the new module's routes to the existing `ROUTES` export. Preserve all existing entries.

```ts
// Add this block above the export statement
const <MODULE_NAME_UPPER> = {
  ROOT: "/<moduleName>",
  // Add each route the user listed. Use functions for dynamic segments:
  // DETAIL: (id: string) => `/<moduleName>/${id}`,
} as const;

// Update the export:
export const ROUTES = {
  // ...existing entries
  <MODULE_NAME_UPPER>,
} as const;
```

### 3b. Create `playwright/configs/ui/modules/<moduleName>/<moduleName>.ui.ts`

Generate a UI config skeleton from the routes. Use placeholder keys — the user fills in real test IDs after running the app.

```ts
/**
 * UI selector constants for <moduleName>.
 * Values are data-testid / data-test attribute values — never CSS or XPath.
 * Run `npx playwright codegen <appBaseUrl>/<moduleName>` to discover real values.
 */
export const <MODULE_NAME_UPPER>_UI = {
  <FIRST_ROUTE_UPPER>: {
    // TODO: replace with real data-testid values from codegen
    CONTAINER: "<moduleName>-container",
    HEADING:   "<moduleName>-heading",
  },
  // Add one section per route the user listed
} as const;
```

> Tell the user: "Run `npx playwright codegen <appBaseUrl>` to discover the real `data-testid` values and replace the TODOs."

### 3c. Create `playwright/support/helpers/modules/<moduleName>.helpers.ts`

Generate a helper class with typed methods. Do not implement logic — leave `// TODO` comments so the user fills them in after codegen.

```ts
import { Page, expect } from "@playwright/test";
import { <MODULE_NAME_UPPER>_UI } from "@configs/ui/modules/<moduleName>/<moduleName>.ui";
import { ROUTES } from "@configs/app/routes";

export class <ModuleName>Helpers {
  constructor(private page: Page) {}

  // ─── Navigation ────────────────────────────────────────────────────────────

  async visit(): Promise<void> {
    await this.page.goto(ROUTES.<MODULE_NAME_UPPER>.ROOT);
    // TODO: assert a stable element is visible before returning
    // await expect(this.page.getByTestId(<MODULE_NAME_UPPER>_UI.<FIRST_ROUTE_UPPER>.CONTAINER)).toBeVisible();
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async assertLoaded(): Promise<void> {
    // TODO: assert the page has loaded successfully
    // await expect(this.page.getByTestId(<MODULE_NAME_UPPER>_UI.<FIRST_ROUTE_UPPER>.CONTAINER)).toBeVisible();
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  // TODO: add action methods once you have real selectors from codegen
}
```

### 3d. Register the helper in `playwright/fixtures/base.fixture.ts`

Add the import, type declaration, and fixture entry. Preserve all existing content.

```ts
// 1. Add import (with existing module imports)
import { <ModuleName>Helpers } from "../support/helpers/modules/<moduleName>.helpers";

// 2. Add to CustomFixtures type
type CustomFixtures = {
  // ...existing
  <moduleName>Helpers: <ModuleName>Helpers;
};

// 3. Add to test.extend()
<moduleName>Helpers: async ({ page }, use) => {
  await use(new <ModuleName>Helpers(page));
},
```

### 3e. Update `.env` (if auth = yes)

Append only the placeholder lines — leave values empty. Tell the user explicitly:

```
# <moduleName> auth
BASE_URL=<appBaseUrl>
<usernameVar>=
<passwordVar>=
```

> **Tell the user:** Open `.env` and fill in the values yourself — do not paste credentials into this chat. The AI never receives or stores credentials.

---

## Step 4 — Hand Off to Test Writing

After generating the foundation, output this message exactly:

```
Foundation scaffolded. Next steps:

1. Fill in real selectors
   npx playwright codegen <appBaseUrl>
   Replace TODO placeholders in:
   - playwright/configs/ui/modules/<moduleName>/<moduleName>.ui.ts
   - playwright/support/helpers/modules/<moduleName>.helpers.ts

2. Fill in credentials
   Edit .env — never commit real values

3. Write your tests
   Read: docs/02-guides/writing-tests.md
   Tests live in: playwright/tests/<moduleName>/<smoke|e2e>/

4. Run
   npx playwright test --grep @<moduleName>
```

Do not generate test files. The user writes them using the guides.

---

## Rules

- Never write real credentials into any file
- Never hardcode URLs in helpers — always use `ROUTES`
- Never hardcode selectors in helpers — always use `<MODULE_NAME_UPPER>_UI`
- Never import from `@playwright/test` in spec files — use `base.fixture.ts`
- Never create a second helper for the same module — extend the existing one
- Locator priority: `getByRole` → `getByLabel` → `getByText` → `getByTestId`
