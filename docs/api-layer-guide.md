# API Layer Guide

## How the API Layer Works

```
API Config (.api.ts)          → Pure data: method, endpoint, alias, expectedStatus
  ↓
api.engine.ts                 → Pure functions: registerRoute, waitForAPI, matchesEndpoint
  ↓
api.helpers.ts                → ApiHelpers class wrapping the engine for test convenience
  ↓
[module].helpers.ts           → Module helpers use waitForResponse() internally
  ↓
spec.ts                       → Tests call module helpers only. Never call API engine directly.
```

## The Critical Rule: Wait Before Navigate

Response waiting must be set up BEFORE the navigation or action that triggers the request.

```typescript
// Correct — waitForResponse set up before navigation
const responsePromise = page.waitForResponse("**/api/payments**");
await page.goto("/payments");
await responsePromise;

// Wrong — navigation triggers the request before we start listening
await page.goto("/payments");
const response = await page.waitForResponse("**/api/payments**"); // may miss it
```

## API Config Shape

```typescript
import { createModuleConfig } from "@core/api";

export const PAYMENTS_CONFIG = createModuleConfig({
  basePath: "/api/v1",
  prefix: "payments",
  resources: {
    payments: ["LIST", "DETAILS", "CREATE"],
  },
  custom: {
    PAYMENTS_SEARCH: {
      alias: "paymentsSearch",
      method: "POST",
      endpoint: "/api/v1/payments/search",
    },
  },
});
```

## Stubbing Responses

Use `page.route()` via the API helpers to stub responses for edge case testing:

```typescript
// In a helper or test
await page.route("**/api/payments**", (route) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ items: [], total: 0 }),
  }),
);

// Or via ApiHelpers
await api.stub(PAYMENTS_CONFIG.PAYMENTS_LIST, {
  status: 200,
  body: { items: [], total: 0 },
});
```

## Response Waiting Patterns

```typescript
// Wait for a single response
const response = await page.waitForResponse(
  (resp) => resp.url().includes("/api/payments") && resp.request().method() === "GET",
);
expect(response.status()).toBe(200);

// Wait for multiple concurrent responses
const [listResp, countResp] = await Promise.all([
  page.waitForResponse("**/api/payments?*"),
  page.waitForResponse("**/api/payments/count"),
]);
```

## Common Mistakes

| Mistake                                   | What happens                    | Fix                                        |
| ----------------------------------------- | ------------------------------- | ------------------------------------------ |
| `goto()` before `waitForResponse()` setup | Response missed, test times out | Set up the promise before navigation       |
| `page.waitForTimeout(2000)`               | Flaky on slow CI                | Use `waitForResponse()` or `expect()`      |
| Glob pattern too broad (`**`)             | Matches unintended requests     | Use specific patterns: `**/api/payments**` |
| Calling API engine directly in specs      | Ownership leak                  | Move to module helper                      |

---

## HAR Network Replay (Framework Superpower)

Playwright can record real API responses to a HAR file once, then replay them
in every future test run — no running server, no mocking boilerplate.

```
RECORD  →  Real network fires, responses saved to .har file
REPLAY  →  Requests served from .har file, network never fires (default)
UPDATE  →  UPDATE_HAR=1 re-records fresh responses into existing .har file
```

### Why this matters

- **Deterministic** — tests run against identical responses every time
- **Offline-safe** — tests run without a backend (CI, local, air-gapped)
- **Zero mock boilerplate** — no `page.route()` boilerplate for common flows
- **Real response fidelity** — HAR contains actual server responses, not invented fixtures
- **Healthcare-ready** — capture complex, nested API payloads once; replay them forever

### Usage

HAR paths are registered in `playwright/configs/app/har-paths.ts`:

```typescript
import { HAR } from "@configs/app/har-paths";

// In a module helper — BEFORE navigation:
async visitListWithHAR(): Promise<void> {
  await this.har.replayOrRecord(HAR.PAYMENTS.LIST, "**/api/payments**");
  await this.page.goto(ROUTES.PAYMENTS.ROOT);
}
```

In a spec — destructure `har` from the fixture like any other helper:

```typescript
test("loads with real response data", async ({ paymentsHelpers }) => {
  await paymentsHelpers.visitListWithHAR(); // HAR is set up inside the helper
  await paymentsHelpers.assertLoaded();
});
```

### Refresh HAR when APIs change

```bash
UPDATE_HAR=1 npx playwright test --grep @payments
```

Playwright records fresh responses and overwrites the HAR file. Commit the
updated HAR. Tests immediately reflect the new API shape.

### HAR file storage

```
playwright/fixtures/har/
└── <module>/
    ├── list.har
    ├── detail.har
    └── empty-state.har
```

HAR files are gitignored by default (they can contain response payloads). Add an
explicit `!playwright/fixtures/har/<module>/<file>.har` allow-list entry in
`.gitignore` for files that are safe to commit (seeded test data only).

### Combining HAR with MCP or codegen exploration

When exploring a feature with MCP or `npm run context:codegen`, save the useful
network responses as HAR files under `playwright/fixtures/har/<module>/`.

Keep the retained feature context and HAR files aligned:

- Markdown context stays under `playwright/.feature-context/<app>/<module>/<feature>/`
- HAR fixtures live under `playwright/fixtures/har/<module>/`

Register committed HAR files in `har-paths.ts` so helpers and tests can use the
same captured API contracts immediately.
