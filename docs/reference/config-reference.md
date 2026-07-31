# Configuration Reference

All configuration options for the framework.

## Project Structure

```
playwright/
├── configs/                    ← Constants (selectors, routes, API)
│   ├── app/routes.ts          ← URL paths & routes
│   ├── api/modules/           ← API interception patterns
│   └── ui/modules/            ← UI selectors (data-testid, etc)
├── support/helpers/           ← Async helper classes
├── fixtures/                  ← Test fixtures & test data
│   └── base.fixture.ts        ← Extended test setup
├── tests/                     ← Spec files
│   └── [module]/[type]/*.spec.ts
└── playwright.config.ts       ← Playwright configuration
```

## Playwright Config (playwright.config.ts)

Key settings:

```typescript
use: {
  baseURL: process.env.BASE_URL,
  testIdAttribute: process.env.TEST_ID_ATTRIBUTE || 'data-testid',
  trace: 'on-first-retry',           // Enable tracing
  screenshot: 'only-on-failure',     // Capture on failure
}
```

## Project Scoping

The blank harness contains one generic Chromium project and no tests. Add browser projects,
authentication setup, and dependencies only after project intake records the real application
contract. Follow [START-HERE.md](../START-HERE.md).

## Environment Variables

| Variable                           | Purpose               | Example                       |
| ---------------------------------- | --------------------- | ----------------------------- |
| `BASE_URL`                         | Application URL       | Project-specific              |
| `TEST_ID_ATTRIBUTE`                | Test-id attribute     | `data-testid`                 |
| `PW_RETRIES`                       | Explicit retry count  | `0`                           |
| `ENV`                              | Environment name      | `qa`, `staging`, `production` |
| `DEBUG`                            | Enable debug logging  | `pw:api`                      |
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | Skip Playwright setup | `0` or `1`                    |
| `CI`                               | CI environment flag   | `true`                        |

## Storage State Files

Located in `playwright/fixtures/`:

- `*.auth-state.json` — Saved authentication state (cookies + storage)
- `.gitignore` — These should NEVER be committed

```bash
# Generate auth state after adding an approved setup project
npx playwright test --project=setup
```

## Test Tags

Use tags to organize tests:

```typescript
test('@smoke', async ({ page }) => { ... })
test('@regression', async ({ page }) => { ... })
test('@slow', async ({ page }) => { ... })
```

Then run by tag:

```bash
npx playwright test --grep @smoke
```
