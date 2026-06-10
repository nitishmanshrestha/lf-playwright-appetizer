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
  baseURL: process.env.APP_URL || 'https://example.com',
  trace: 'on-first-retry',           // Enable tracing
  screenshot: 'only-on-failure',     // Capture on failure
  video: 'retain-on-failure',        // Keep video if failed
},

webServer: {
  command: 'npm run dev',            // Start dev server
  port: 3000,
  reuseExistingServer: true,
}
```

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `APP_URL` | Application URL | `https://staging.example.com` |
| `ENV` | Environment name | `qa`, `staging`, `production` |
| `DEBUG` | Enable debug logging | `pw:api` |
| `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` | Skip Playwright setup | `0` or `1` |
| `CI` | CI environment flag | `true` |

## Storage State Files

Located in `playwright/fixtures/`:

- `*.auth-state.json` — Saved authentication state (cookies + storage)
- `.gitignore` — These should NEVER be committed

```bash
# Generate auth state
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
