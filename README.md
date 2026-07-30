# Playwright Boilerplate Appetizer

> Stripped-down Playwright framework focused on CLI/MCP scaffold generation and DDT evaluation.

---

## What This Is

Appetizer keeps the parts of the Playwright boilerplate that help you move fast:

- Scaffold a new module from templates
- Turn captured flows into DDT-ready test scaffolding
- Run the included example Playwright tests
- Keep selectors, helpers, routes, and test data separated

If you want the full boilerplate experience, use the main framework. If you want the generator and DDT workflow only, this repo is the smaller, focused version.

---

## What’s Included

- CLI generator in [bin/generator.js](bin/generator.js)
- Generator logic in [lib/generator.js](lib/generator.js)
- Module templates in [templates/module/](templates/module/)
- Playwright configs under [playwright/configs/](playwright/configs/)
- Reusable helpers under [playwright/support/helpers/](playwright/support/helpers/)
- Base fixture support in [playwright/fixtures/](playwright/fixtures/)
- Example module under [playwright/configs/ui/modules/example/](playwright/configs/ui/modules/example/), [playwright/support/helpers/modules/example.helpers.ts](playwright/support/helpers/modules/example.helpers.ts), and [playwright/tests/example/](playwright/tests/example/)
- DDT scaffold generation in [scripts/generate-ddt-scaffold.js](scripts/generate-ddt-scaffold.js)
- Optional auth setup in [playwright/tests/global.setup.ts](playwright/tests/global.setup.ts)

---

## Why Use It

This repo is designed for two workflows:

1. **CLI/MCP test generation**
   - Explore the app
   - Capture selectors and flows
   - Scaffold Config → Helpers → Tests

2. **DDT evaluation**
   - Detect when a flow looks data-driven
   - Generate JSON fixtures
   - Create a spec loop from the captured data

---

## Quick Start

### 1. Install dependencies

```bash
npm install
npx playwright install
```

### 2. Create your environment file

Unix / macOS:

```bash
cp .env.example .env
```

Windows Command Prompt:

```cmd
copy .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 3. Set your app values

Update `.env` with the values for your app:

- `BASE_URL`
- `AUTH_URL`
- `USERNAME`
- `PASSWORD`
- `RUN_GLOBAL_AUTH`
- `PW_TRACE`
- `UPDATE_HAR`

### 4. Run the example tests

```bash
npm test
```

Or run smoke tests only:

```bash
npm run test:smoke
```

---

## Common Commands

| Command                                                                                 | What it does                                       |
| --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `npm run bootstrap`                                                                     | Install dependencies and browsers                  |
| `npm run context:codegen`                                                               | Open Playwright Codegen for manual recording       |
| `npm run generate -- --module account --route /account`                                 | Scaffold a new module from templates               |
| `npm run scaffold:flow -- --module account --feature checkout --capture ./capture.json` | Generate guided DDT test data and a spec loop      |
| `npm run capture:post -- --module account --feature checkout --capture ./capture.json`  | Run the post-capture hook for MCP-driven discovery |
| `npm run check:ddt-fixtures`                                                            | Validate generated JSON fixture structure          |
| `npm test`                                                                              | Run all Playwright tests                           |
| `npm run test:smoke`                                                                    | Run smoke tests only                               |
| `npm run test:ui`                                                                       | Open Playwright UI mode                            |
| `npm run test:debug`                                                                    | Run in debug mode                                  |
| `npm run test:headed`                                                                   | Run headed                                         |
| `npm run report`                                                                        | Open the HTML report                               |
| `npm run test:unit`                                                                     | Run generator unit tests                           |

---

## Module Scaffolding Output

When you run the generator, it creates or updates the framework pieces for a module:

- `playwright/configs/ui/modules/<module>/<module>.ui.ts`
- `playwright/support/helpers/modules/<module>.helpers.ts`
- `playwright/tests/<module>/smoke/<module>-smoke.spec.ts`
- `playwright/testdata/<module>/<module>.json`
- `playwright/configs/app/routes.ts`

Example:

```bash
node bin/generator.js scaffold --module account --route /account
```

You can also target a different root:

```bash
node bin/generator.js scaffold --module account --route /account --root ./sandbox
```

And force overwrite if needed:

```bash
node bin/generator.js scaffold --module account --route /account --force
```

---

## DDT Flow

The DDT generator looks at a capture and decides whether the flow looks data-driven.

If it is a good candidate, it will:

- create test data under `playwright/testdata/<module>/`
- create a spec loop under `playwright/tests/<module>/smoke/`
- leave TODOs for helper logic and assertions

Example:

```bash
npm run scaffold:flow -- --module checkout --feature add-item --capture ./capture.json
```

If you already have a capture from the MCP flow, you can follow it with:

```bash
npm run capture:post -- --module checkout --feature add-item --capture ./capture.json
```

---

## Project Layout

Clickable folders:

- [playwright/configs/](playwright/configs/)
- [playwright/fixtures/](playwright/fixtures/)
- [playwright/support/](playwright/support/)
- [playwright/testdata/](playwright/testdata/)
- [playwright/tests/](playwright/tests/)
- [bin/](bin/)
- [scripts/](scripts/)
- [templates/](templates/)
- [docs/](docs/)
- [.github/](.github/)

---

## Auth Setup

Auth is available, but optional.

- `playwright/tests/global.setup.ts` handles storageState generation
- `RUN_GLOBAL_AUTH=true` enables the global auth flow
- `USERNAME`, `PASSWORD`, and `AUTH_URL` are read from `.env`

If you are not using auth yet, leave that setup disabled.

---

## Notes

- Keep selectors in config files, not in test files
- Keep business logic in helpers, not in specs
- Use the example module as the reference pattern
- Use `@fixtures/base.fixture` in tests instead of importing directly from `@playwright/test`

---

## Reference Files

- [QUICKSTART.md](QUICKSTART.md)
- [CLAUDE.md](CLAUDE.md)
- [playwright.config.ts](playwright.config.ts)
- [bin/generator.js](bin/generator.js)
- [scripts/generate-ddt-scaffold.js](scripts/generate-ddt-scaffold.js)
- [scripts/capture/post-capture.js](scripts/capture/post-capture.js)
