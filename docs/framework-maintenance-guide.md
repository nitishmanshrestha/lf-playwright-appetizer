# Framework Maintenance Guide

## How to Add a New Module

A module is one feature area of your application. Each module gets exactly six artifacts.

### Step 1 — Create the API Config

Create `playwright/configs/api/modules/[name]/[name].api.ts`:

```typescript
import { createModuleConfig } from "@core/api";

export const PAYMENTS_CONFIG = createModuleConfig({
  basePath: "/api/v1",
  prefix: "payments",
  resources: {
    payments: ["LIST", "DETAILS", "CREATE", "UPDATE", "DELETE"],
  },
});
```

### Step 2 — Create the UI Config

Create `playwright/configs/ui/modules/[name]/[name].ui.ts`:

```typescript
export const PAYMENTS_UI = {
  LIST: {
    TABLE: "payments-table",
    SEARCH_INPUT: "payments-search-input",
    EMPTY_STATE: "payments-empty-state",
  },
  FORM: {
    AMOUNT_INPUT: "payments-form-amount",
    SUBMIT_BTN: "payments-form-submit",
  },
} as const;
```

### Step 3 — Add Routes

Add to `playwright/configs/app/routes.ts`:

```typescript
const PAYMENTS = {
  ROOT: "/payments",
  DETAIL: (id: string) => `/payments/${id}`,
} as const;
```

### Step 4 — Create Helpers

Create `playwright/support/helpers/modules/[name].helpers.ts`:

```typescript
import { Page, expect, Response } from "@playwright/test";
import { PAYMENTS_CONFIG } from "@configs/api/modules/payments/payments.api";
import { PAYMENTS_UI } from "@configs/ui/modules/payments/payments.ui";
import { ROUTES } from "@configs/app/routes";

export class PaymentsHelpers {
  constructor(private page: Page) {}

  async visitList(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes("/api/v1/payments") && resp.request().method() === "GET",
    );
    await this.page.goto(ROUTES.PAYMENTS.ROOT);
    await responsePromise;
  }

  async assertLoaded(): Promise<void> {
    await expect(this.page.getByTestId(PAYMENTS_UI.LIST.TABLE)).toBeVisible();
  }
}
```

If the module needs cached auth or another prerequisite state, add a `.setup.ts` spec and a matching `testMatch` entry in `playwright.config.ts` so the setup project actually runs before dependent tests.

### Step 5 — Register the Fixture

In `playwright/fixtures/base.fixture.ts`:

```typescript
import { PaymentsHelpers } from "../support/helpers/modules/payments.helpers";

// Add to CustomFixtures type:
paymentsHelpers: PaymentsHelpers;

// Add to test.extend:
paymentsHelpers: async ({ page }, use) => {
  await use(new PaymentsHelpers(page));
},
```

### Step 6 — Write the Smoke Spec

Create `playwright/tests/[name]/smoke/[name]-smoke.spec.ts`:

```typescript
import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Payments — Smoke", { tag: ["@payments", "@smoke"] }, () => {
  test.beforeEach(async ({ paymentsHelpers }) => {
    await paymentsHelpers.visitList();
  });

  test("loads the payments list", { tag: ["@smoke"] }, async ({ paymentsHelpers }) => {
    await paymentsHelpers.assertLoaded();
  });
});
```
