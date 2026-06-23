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
const SAUCEDEMO = {
  LOGIN: "/",
  INVENTORY: "/inventory.html",
  CART: "/cart.html",
  CHECKOUT_STEP_ONE: "/checkout-step-one.html",
  PRODUCT_DETAIL: (id: string) => `/inventory-item.html?id=${id}`,
} as const;

export const ROUTES = { SAUCEDEMO } as const;
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

// Generated keys:
// EXAMPLE_CONFIG.EXAMPLES_LIST     → GET /api/v1/examples?*
// EXAMPLE_CONFIG.EXAMPLES_CREATE   → POST /api/v1/examples
// EXAMPLE_CONFIG.EXAMPLE_SEARCH    → POST /api/v1/examples/search
```

## Rules

**Data Only:**

- No functions except dynamic selector builders
- No imports except factory functions
- No side effects or mutations

**Naming Conventions:**

- Config objects: `UPPER_SNAKE_CASE`
- Selector values: `kebab-case` (test IDs match app attributes)
- Group by view: `LOGIN`, `INVENTORY`, `FORM`, `DETAIL`

**Type Safety:**

- Always use `as const` for configs
- Use `Object.freeze()` only if runtime immutability is required

**Dynamic Selectors:**

```typescript
// Function returning string for parameterized selectors
PRODUCT_ITEM: {
  ADD_BTN: (name: string) => `add-to-cart-${name}`,
  ROW: (id: number) => `product-row-${id}`,
}
```

**Shared Selectors:**

- Module-specific: `playwright/configs/ui/modules/[module]/`
- Cross-module: `playwright/configs/ui/shared/navigation.ui.ts`

## Anti-Patterns

❌ **Logic in config:**

```typescript
export const MODULE_UI = {
  getButton: () => page.locator(".btn"), // BAD
};
```

✅ **Data only:**

```typescript
export const MODULE_UI = {
  SUBMIT_BTN: "submit-button", // GOOD
} as const;
```

❌ **Lowercase keys:**

```typescript
const module_ui = { submitBtn: "btn" }; // BAD
```

✅ **UPPER_SNAKE_CASE:**

```typescript
export const MODULE_UI = { SUBMIT_BTN: "btn" } as const; // GOOD
```
