# Adapting the Boilerplate to Your Application

> Work through this checklist in order — each step depends on the one before it.

The boilerplate ships with two working sample modules (`saucedemo` and `example`) to prove the framework runs out of the box. Before you write a single test for your own app, those samples must be removed and the config must point at your environment.

---

## What You Will End Up With

```
Before (boilerplate)                   After (your app)
──────────────────────────────         ──────────────────────────────
playwright/tests/saucedemo/            playwright/tests/<yourmodule>/
playwright/tests/example/             playwright/configs/ui/modules/<yourmodule>/
BASE_URL → saucedemo.com              BASE_URL → your app
saucedemo + example projects          one (or more) real projects
```

---

## Step 1 — Set your environment and credentials

Edit `playwright/environments/.env.qa.example` with your values, then copy it to `.env`:

```bash
cp playwright/environments/.env.qa.example .env
```

Or run bootstrap (installs dependencies too):

```bash
npm run bootstrap
```

The variables you must set:

```
BASE_URL=https://your-app.com
AUTH_URL=/login
USERNAME=your_test_user
PASSWORD=your_test_password
SESSION_VALIDATE_URL=/api/v1/me
```

> Credentials **must never be committed**. `.env` is already in `.gitignore`. Use CI secrets for pipeline runs.

---

## Step 2 — Delete sample test files

```
playwright/tests/saucedemo/          → delete entire folder
playwright/tests/example/            → delete entire folder
playwright/tests/saucedemo.setup.ts  → delete
```

Keep `playwright/tests/global.setup.ts` — it is the template for your own auth setup.

---

## Step 3 — Delete sample helpers

```
playwright/support/helpers/modules/saucedemo.helpers.ts  → delete
playwright/support/helpers/modules/example.helpers.ts    → delete
```

---

## Step 4 — Delete sample configs

```
playwright/configs/ui/modules/saucedemo/    → delete entire folder
playwright/configs/ui/modules/example/      → delete entire folder
playwright/configs/api/modules/saucedemo/   → delete entire folder
playwright/configs/api/modules/example/     → delete entire folder
```

---

## Step 5 — Clean `playwright/fixtures/base.fixture.ts`

Remove the lines that reference the sample helpers:

**Imports to delete:**
```ts
import { ExampleHelpers } from "../support/helpers/modules/example.helpers";
import { SaucedemoHelpers } from "../support/helpers/modules/saucedemo.helpers";
```

**Type entries to delete from `CustomFixtures`:**
```ts
exampleHelpers: ExampleHelpers;
saucedemoHelpers: SaucedemoHelpers;
```

**Fixture registrations to delete from `test.extend()`:**
```ts
exampleHelpers: async ({ page }, use) => {
  await use(new ExampleHelpers(page));
},
saucedemoHelpers: async ({ page }, use) => {
  await use(new SaucedemoHelpers(page));
},
```

---

## Step 6 — Revamp `playwright.config.ts`

Replace the sample `projects` block with your app's projects. Minimal real-app config:

```ts
projects: [
  {
    name: "auth-setup",
    testMatch: /.*\.setup\.ts$/,
    use: {
      baseURL: process.env.BASE_URL || "http://localhost:3000",
    },
  },
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      storageState: "playwright/.auth/user.json",
    },
    dependencies: ["auth-setup"],
  },
],
```

Remove the `saucedemo` and `saucedemo-setup` project blocks entirely.

---

## Step 7 — Adapt `playwright/tests/global.setup.ts`

Replace the Saucedemo login logic with your app's login flow using the credentials from `.env`:

```ts
await page.goto(process.env.AUTH_URL ?? "/login");
await page.getByLabel("Username").fill(process.env.USERNAME ?? "");
await page.getByLabel("Password").fill(process.env.PASSWORD ?? "");
await page.getByRole("button", { name: "Login" }).click();
// adjust selectors to match your app's login page
await page.context().storageState({ path: "playwright/.auth/user.json" });
```

---

## Step 8 — Create your first module

Follow Config → Helpers → Tests in strict order:

| Order | File to create | Notes |
|-------|---------------|-------|
| 1 | `playwright/configs/ui/modules/<module>/<module>.ui.ts` | `data-testid` / `data-test` selectors, `as const` |
| 2 | `playwright/configs/app/routes.ts` | Add your URL paths |
| 3 | `playwright/configs/api/modules/<module>/<module>.api.ts` | Only if you need API interception |
| 4 | `playwright/support/helpers/modules/<module>.helpers.ts` | Reusable async actions |
| 5 | `playwright/fixtures/base.fixture.ts` | Register the new helper |
| 6 | `playwright/tests/<module>/smoke/<module>-smoke.spec.ts` | Import `test`/`expect` from `base.fixture.ts` |

---

## Checklist

- [ ] `.env` updated — `BASE_URL`, `USERNAME`, `PASSWORD` set to real values
- [ ] `playwright/tests/saucedemo/` deleted
- [ ] `playwright/tests/example/` deleted
- [ ] `playwright/tests/saucedemo.setup.ts` deleted
- [ ] `playwright/support/helpers/modules/saucedemo.helpers.ts` deleted
- [ ] `playwright/support/helpers/modules/example.helpers.ts` deleted
- [ ] `playwright/configs/ui/modules/saucedemo/` deleted
- [ ] `playwright/configs/ui/modules/example/` deleted
- [ ] `playwright/configs/api/modules/saucedemo/` deleted
- [ ] `playwright/configs/api/modules/example/` deleted
- [ ] `base.fixture.ts` cleaned — sample imports/types/fixtures removed
- [ ] `playwright.config.ts` updated — real app project(s) configured
- [ ] `global.setup.ts` updated — real login flow
- [ ] First module created
- [ ] `npm test` runs green

---

## If You Have No Auth

If your app has no login, skip Steps 7 and the `auth-setup` project. Set `storageState` to nothing and remove the `dependencies` array from your project block in `playwright.config.ts`.

---

## Next

- [docs/01-getting-started/first-test-module.md](docs/01-getting-started/first-test-module.md) — Write your first real test
- [docs/02-guides/writing-tests.md](docs/02-guides/writing-tests.md) — Full authoring guide
- [docs/05-architecture/three-layer-pattern.md](docs/05-architecture/three-layer-pattern.md) — Understand Config → Helpers → Tests
