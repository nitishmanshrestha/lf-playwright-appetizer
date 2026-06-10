# Framework Rules — Non-Negotiable

These rules are enforced automatically. Violations block merge.

## Architecture

```
NEVER  →  page.waitForTimeout(ms)        Use waitForResponse() or expect() assertions
NEVER  →  hardcoded selectors             Use constants from playwright/configs/ui/**
NEVER  →  hardcoded endpoints/routes      Use constants from playwright/configs/api/** and routes.ts
NEVER  →  page-object classes             Helper-first only (helpers/ directory)
NEVER  →  real credentials in code        Use .env (local) or env vars (CI)
NEVER  →  create new config/helper        Without searching for an existing one first
NEVER  →  import from @playwright/test    In spec files — use base.fixture.ts instead

ALWAYS →  storageState for auth           Via project dependency setup
ALWAYS →  config constants                Check configs before adding any selector
ALWAYS →  one helper method = one owner   Verify name is unique in its class
ALWAYS →  data-testid / data-test attributes  For all selectors
ALWAYS →  TypeScript strict mode          No any types, no ts-ignore
```

## File Naming

| Layer      | File pattern               | Example                    |
| ---------- | -------------------------- | -------------------------- |
| API config | `[name].api.ts`            | `payments.api.ts`          |
| UI config  | `[name].ui.ts`             | `payments.ui.ts`           |
| Helpers    | `[name].helpers.ts`        | `payments.helpers.ts`      |
| Smoke spec | `[name]-smoke.spec.ts`     | `payments-smoke.spec.ts`   |
| E2E spec   | `[name]-e2e.spec.ts`       | `payments-e2e.spec.ts`     |
| Schema     | `[name].schema.ts`         | `payments.schema.ts`       |
| Fixture    | `[name].json`              | `payments.json`            |

## Selector Priority

| Priority | Strategy | When to use |
| -------- | -------- | ----------- |
| 1 | `getByRole()` | Interactive elements with accessible names |
| 2 | `getByLabel()` | Form controls |
| 3 | `getByText()` | Non-interactive assertions |
| 4 | `getByTestId()` | Explicit test contract (`data-testid` / `data-test`) |
| 5 | CSS / XPath | Last resort only |

When strictness fails, narrow with locator filtering (`filter({ hasText })`, `filter({ has })`) before using `.first()` or `.nth()`.
