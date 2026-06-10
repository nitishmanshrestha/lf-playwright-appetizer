# Playwright Automation Boilerplate — Claude Code

> A production-ready, helper-first Playwright framework any team can fork, adapt, and ship.
> AI-powered from day one with Claude Code and GitHub Copilot built in.

---

## Who is this for?

Any engineering team that:
- Is starting a new web app and needs a maintainable test automation foundation
- Is migrating from page-object patterns or scattered test files
- Wants AI assistance (Claude Code + GitHub Copilot) wired into the framework from the start

This boilerplate is application-agnostic. Swap out the example modules for your app.

---

## What is this?

A three-layer Playwright framework with a single, non-negotiable architecture:

| Layer          | Location                           | Rule                                              |
| -------------- | ---------------------------------- | ------------------------------------------------- |
| **Config**     | `playwright/configs/**`            | Selectors, endpoints, routes — all `as const`     |
| **Helpers**    | `playwright/support/helpers/**`    | Async helper classes — one owner per module       |
| **Tests**      | `playwright/tests/**/*.spec.ts`    | Thin orchestration of helper calls only           |

---

## Non-Negotiable Rules

```
NEVER  →  page.waitForTimeout(number)    Use waitForResponse() or expect() assertions
NEVER  →  hardcoded selectors            Use constants from playwright/configs/ui/**
NEVER  →  hardcoded endpoints/routes     Use constants from playwright/configs/api/** and routes.ts
NEVER  →  page-object wrappers           Helper-first only
NEVER  →  real credentials in code       Use .env (local) or env vars (CI)
NEVER  →  import from @playwright/test   In spec files — use base.fixture.ts

ALWAYS →  storageState for auth          Via project dependency setup
ALWAYS →  config constants               Check configs before adding any selector
ALWAYS →  one helper = one owner         Verify class/method is unique
ALWAYS →  data-testid / data-test attrs      For all new selectors
ALWAYS →  locator order                  getByRole → getByLabel → getByText → getByTestId
ALWAYS →  narrow with filters            Use filter({ hasText/has }) before first()/nth()
```

---

## Where does everything live?

```
playwright/
├── configs/                              ← All pure data — never logic here
│   ├── app/
│   │   └── routes.ts                     ← Central URL/path registry
│   ├── api/
│   │   └── modules/[module]/
│   │       └── [module].api.ts           ← API intercept definitions
│   └── ui/
│       ├── modules/[module]/
│       │   └── [module].ui.ts            ← Selector constants (data-testid / data-test)
│       └── shared/
│           └── navigation.ui.ts          ← Shared navigation selectors
│
├── support/
│   ├── helpers/                          ← All helper classes live here
│   │   ├── common/                       ← Framework-wide shared helpers
│   │   │   ├── api.helpers.ts            ← API interception & waiting
│   │   │   ├── navigation.helpers.ts     ← Navigation utilities
│   │   │   └── ui.helpers.ts             ← Generic UI assertions
│   │   └── modules/                      ← Feature-specific helpers
│   │       └── [module].helpers.ts
│   └── core/api/                         ← Framework engine — do not modify
│       ├── api.engine.ts
│       ├── api-config.factory.ts
│       ├── status-codes.ts
│       └── index.ts
│
├── fixtures/                             ← Playwright custom fixtures + test data
│   ├── base.fixture.ts                   ← Extended test with all helpers
│   └── [name].json                       ← Static test data
│
├── schemas/                              ← JSON schema definitions
│   └── [name].schema.ts
│
└── tests/                                ← Specs — thin helper orchestration only
    ├── global.setup.ts                   ← Main app auth setup
    ├── saucedemo.setup.ts                ← Saucedemo auth setup
    └── [module]/
        ├── smoke/
        │   └── [module]-smoke.spec.ts
        └── e2e/
            └── [module]-e2e.spec.ts
```

---

## npm scripts

| What                      | Command                                          |
| ------------------------- | ------------------------------------------------ |
| All tests                 | `npm test`                                       |
| Smoke tests only          | `npm run test:smoke`                             |
| UI interactive mode       | `npm run test:ui`                                |
| Debug mode                | `npm run test:debug`                             |
| Headed browser            | `npm run test:headed`                            |
| Against specific env      | `ENV=qa npx playwright test`                     |
| By tag                    | `npx playwright test --grep @tagname`            |
| HTML report               | `npm run report`                                 |
