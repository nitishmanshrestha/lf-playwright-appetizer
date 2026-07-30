---
applyTo: "playwright/configs/**/*.ts"
---

# Config Files Instructions

Config files are pure data — no logic, no side effects. All selectors, routes, and API patterns live here.

## UI Config: Real Example

```typescript
// playwright/configs/ui/modules/saucedemo/saucedemo.ui.ts
export const SAUCEDEMO_UI = {
  LOGIN: {
    USERNAME_INPUT: "username",
    PASSWORD_INPUT: "password",
    LOGIN_BTN: "login-button",
    ERROR_MSG: "error",
  },
  INVENTORY: {
    CONTAINER: "inventory-container",
    ITEM: "inventory-item",
    ITEM_NAME: "inventory-item-name",
    ITEM_PRICE: "inventory-item-price",
    SORT_DROPDOWN: "product-sort-container",
  },
  PRODUCT_ITEM: {
    ADD_TO_CART_BTN: (name: string) => `add-to-cart-${name}`,
    REMOVE_BTN: (name: string) => `remove-${name}`,
  },
  CART: {
    CONTAINER: "cart-contents-container",
    CHECKOUT_BTN: "checkout",
  },
} as const;
```

## Routes Config: Real Example

```typescript
// playwright/configs/app/routes.ts
const MYMODULE = {
  ROOT: "/",
  LIST: "/items",
  DETAIL: (id: string) => `/items/${id}`,
} as const;

export const ROUTES = { MYMODULE } as const;
```

## API Config: Real Example

```typescript
// playwright/configs/api/modules/example/example.api.ts
import { createModuleConfig } from "@core/api";

export const EXAMPLE_CONFIG = createModuleConfig({
  basePath: "/api/v1",
  prefix: "example",
  resources: {
    examples: ["LIST", "DETAILS", "CREATE", "UPDATE", "DELETE"],
  },
  custom: {
    EXAMPLE_SEARCH: {
      alias: "exampleSearchExamples",
      method: "POST",
      endpoint: "/api/v1/examples/search",
    },
  },
});
```

## Rules

- Export a single `as const` object per file
- No functions, no imports, no side effects
- Selector values must match `data-testid` or `data-test` attributes in the app exactly
- Routes must match real app URL paths exactly
- API endpoint patterns use glob syntax: `**/api/path**`
