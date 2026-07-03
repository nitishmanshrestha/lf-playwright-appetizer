# Adapting the Boilerplate to Your Application

> **Onboarding step 2 of 4** | Prev: [Setup & Environment](docs/01-getting-started/setup.md) | Next: [Discovery Process](docs/01-getting-started/discovery-process.md)

---

## What this guide does

The boilerplate ships with two working sample modules (`saucedemo` and `example`). Those exist purely to prove the framework runs out of the box — they are **not** meant to stay.

This guide walks you through replacing them with your own application in 8 ordered steps. By the end, the framework points at your app, the samples are gone, and you are ready to write real tests.

**Estimated time:** 30–45 minutes

---

## Before you start

Make sure you have:

- [ ] Completed [Setup & Environment](docs/01-getting-started/setup.md) — Node.js, npm, and Playwright installed
- [ ] The URL of your application (e.g. `https://my-app.com` or `http://localhost:3000`)
- [ ] A test user account (username + password) for your app
- [ ] Your app's login page URL (e.g. `/login` or `/auth/sign-in`)

> **No login on your app?** That is fine — skip Steps 7 and the auth-setup project in Step 6. Jump straight to Step 8 when you get there.

---

## What you will end up with

```
Before (boilerplate)                   After (your app)
──────────────────────────────         ──────────────────────────────
playwright/tests/saucedemo/            playwright/tests/<yourmodule>/
playwright/tests/example/             playwright/configs/ui/modules/<yourmodule>/
BASE_URL → saucedemo.com              BASE_URL → your app
saucedemo + example projects          one (or more) real projects
```

---

## Step 1 — Point the framework at your app

**Why:** Every URL in the framework comes from environment variables. Setting them here means you never hardcode a URL anywhere.

Edit `playwright/environments/.env.qa.example` and copy it to `.env`:

```bash
cp playwright/environments/.env.qa.example .env
```

Or if you have not run `npm install` yet, use bootstrap (it installs dependencies too):

```bash
npm run bootstrap
```

Open `.env` and fill in your values:

```dotenv
BASE_URL=https://your-app.com
AUTH_URL=/login
USERNAME=your_test_user
PASSWORD=your_test_password
SESSION_VALIDATE_URL=/api/v1/me
```

> **Security:** `.env` is already in `.gitignore`. Never commit it. Use CI secrets for pipeline runs.

**You are done when:** Running `cat .env` (or opening it in your editor) shows your real app URL.

---

## Step 2 — Remove the sample tests

**Why:** Keeping sample tests will make your test run confusing — they test a demo app, not yours. Remove them now so the only tests that run are ones you write.

Delete these folders and file:

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force playwright/tests/saucedemo
Remove-Item -Recurse -Force playwright/tests/example
Remove-Item -Force playwright/tests/saucedemo.setup.ts

# macOS / Linux
rm -rf playwright/tests/saucedemo
rm -rf playwright/tests/example
rm -f playwright/tests/saucedemo.setup.ts
```

Keep `playwright/tests/global.setup.ts` — you will update it in Step 7.

**You are done when:** Running `ls playwright/tests/` only shows `global.setup.ts` (and any folders you created yourself).

---

## Step 3 — Remove the sample helpers

**Why:** Helpers are reusable action classes. The sample helpers reference a demo app and will cause TypeScript errors once the sample configs are gone.

```bash
# Windows (PowerShell)
Remove-Item -Force playwright/support/helpers/modules/saucedemo.helpers.ts
Remove-Item -Force playwright/support/helpers/modules/example.helpers.ts

# macOS / Linux
rm playwright/support/helpers/modules/saucedemo.helpers.ts
rm playwright/support/helpers/modules/example.helpers.ts
```

**You are done when:** The `playwright/support/helpers/modules/` folder is empty.

---

## Step 4 — Remove the sample configs

**Why:** Config files hold selectors, API endpoints, and routes for a specific application. These all point at the demo app and need to go.

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force playwright/configs/ui/modules/saucedemo
Remove-Item -Recurse -Force playwright/configs/ui/modules/example
Remove-Item -Recurse -Force playwright/configs/api/modules/saucedemo
Remove-Item -Recurse -Force playwright/configs/api/modules/example

# macOS / Linux
rm -rf playwright/configs/ui/modules/saucedemo
rm -rf playwright/configs/ui/modules/example
rm -rf playwright/configs/api/modules/saucedemo
rm -rf playwright/configs/api/modules/example
```

**You are done when:** `playwright/configs/ui/modules/` and `playwright/configs/api/modules/` are empty.

---

## Step 5 — Clean `base.fixture.ts`

**Why:** The fixtures file wires helpers into every test. It currently imports the sample helpers you just deleted — those references will cause compile errors until you remove them.

Open `playwright/fixtures/base.fixture.ts` and delete the following three things:

**1. Delete these imports** (near the top of the file):

```ts
import { ExampleHelpers } from "../support/helpers/modules/example.helpers";
import { SaucedemoHelpers } from "../support/helpers/modules/saucedemo.helpers";
```

**2. Delete these type entries** (inside the `CustomFixtures` type):

```ts
exampleHelpers: ExampleHelpers;
saucedemoHelpers: SaucedemoHelpers;
```

**3. Delete these fixture registrations** (inside `test.extend({})`):

```ts
exampleHelpers: async ({ page }, use) => {
  await use(new ExampleHelpers(page));
},
saucedemoHelpers: async ({ page }, use) => {
  await use(new SaucedemoHelpers(page));
},
```

**You are done when:** Running `npx tsc --noEmit` produces zero TypeScript errors.

---

## Step 6 — Update `playwright.config.ts`

**Why:** The config file currently defines `saucedemo` and `saucedemo-setup` as test projects. These need to be replaced with your app's project(s).

Open `playwright.config.ts` and replace the `projects` block with this minimal real-app template:

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

> **No login on your app?** Use this simpler version instead:
>
> ```ts
> projects: [
>   {
>     name: "chromium",
>     use: { ...devices["Desktop Chrome"] },
>   },
> ],
> ```

**You are done when:** `playwright.config.ts` contains no references to `saucedemo`.

---

## Step 7 — Update `global.setup.ts` with your login flow

**Why:** This file runs once before all tests and saves the browser session (cookies, local storage) so tests never have to log in individually.

Open `playwright/tests/global.setup.ts` and replace the Saucedemo login logic with your app's real login flow:

```ts
await page.goto(process.env.AUTH_URL ?? "/login");

// Replace these selectors with the ones from your app's login page
await page.getByLabel("Username").fill(process.env.USERNAME ?? "");
await page.getByLabel("Password").fill(process.env.PASSWORD ?? "");
await page.getByRole("button", { name: "Login" }).click();

// Wait for login to succeed — adjust this to match your app's post-login state
await page.waitForURL("**/dashboard");

// Save the authenticated session
await page.context().storageState({ path: "playwright/.auth/user.json" });
```

> **Tip:** Not sure what selectors your login page uses? Run `npx playwright codegen <your-login-url>` and click through the login — the Inspector shows you the exact selectors to copy. This is covered in detail in the next step: [Discovery Process](docs/01-getting-started/discovery-process.md).

**You are done when:** Running `npx playwright test --project=auth-setup` completes without errors and creates `playwright/.auth/user.json`.

---

## Step 8 — Create your first module

**Why:** Now the framework is clean and points at your app. It is time to add real code. Modules follow a strict order — Config first, then Helpers, then Tests.

| Order | Create this file                                          | What goes in it                                                       |
| ----- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| 1     | `playwright/configs/ui/modules/<module>/<module>.ui.ts`   | Selector constants (`data-testid` / `data-test`), exported `as const` |
| 2     | `playwright/configs/app/routes.ts`                        | Add your URL paths alongside the existing ones                        |
| 3     | `playwright/configs/api/modules/<module>/<module>.api.ts` | API intercept definitions — only needed if you mock API calls         |
| 4     | `playwright/support/helpers/modules/<module>.helpers.ts`  | Reusable async action class                                           |
| 5     | `playwright/fixtures/base.fixture.ts`                     | Import and register your new helper                                   |
| 6     | `playwright/tests/<module>/smoke/<module>-smoke.spec.ts`  | Import `test`/`expect` from `base.fixture.ts`, call helpers           |

Replace `<module>` with a short name for the feature you are testing (e.g. `auth`, `dashboard`, `checkout`).

See [Your First Test Module](docs/01-getting-started/first-test-module.md) for a complete walk-through of each file.

**You are done when:** `npm test` runs at least one test from your new module and it passes.

---

## Full checklist

Run through this before moving to Discovery:

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
- [ ] `base.fixture.ts` cleaned — sample imports, types, and fixture registrations removed
- [ ] `playwright.config.ts` updated — real app project(s) configured, no `saucedemo` references
- [ ] `global.setup.ts` updated — real login flow (or removed if no auth)
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] First module created
- [ ] `npm test` runs green

---

## Troubleshooting

### `Cannot find module '...saucedemo.helpers'`

You deleted the helper files but missed the import in `base.fixture.ts`. Go back to Step 5.

### `npx tsc --noEmit` shows errors after cleanup

Most likely a stray import or type reference in `base.fixture.ts`. Search the file for `saucedemo` and `example` and remove any remaining references.

### Login setup fails

Double-check your `.env` values. Run `npx playwright codegen <your-login-url>` to record the exact login steps, then copy the selectors into `global.setup.ts`.

### `playwright/.auth/user.json` does not exist

The auth-setup project has not run yet. Run `npx playwright test --project=auth-setup` once manually to create it.

---

## What's next

You have a clean, working framework pointed at your real app.

- **[Discovery Process](docs/01-getting-started/discovery-process.md)** — Learn how to explore your app and find the right selectors before writing tests _(onboarding step 3)_
- **[Your First Test Module](docs/01-getting-started/first-test-module.md)** — Walk through creating Config, Helpers, and Tests for a real feature _(onboarding step 4)_
- **[Writing Tests Guide](docs/02-guides/writing-tests.md)** — Full authoring guide once you know the basics
- **[Three-Layer Architecture](docs/05-architecture/three-layer-pattern.md)** — Understand why Config → Helpers → Tests is non-negotiable
