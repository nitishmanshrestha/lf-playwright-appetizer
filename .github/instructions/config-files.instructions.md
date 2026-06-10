---
applyTo: "playwright/configs/**/*.ts"
---

# Config Files Instructions

## Rules

- Config files contain PURE DATA only — no functions, no logic, no side effects.
- Use `as const` for type narrowing and immutability.
- Use `Object.freeze()` only for runtime protection when needed.
- Group selectors by view/component: LIST, FORM, DETAIL, etc.
- Use UPPER_SNAKE_CASE for constant keys.
- Dynamic selectors are functions returning a string: `ROW_BY_ID: (id: string) => \`row-${id}\``
- Keep test-id values kebab-case and semantic (example: `payment-submit-btn`, `user-menu-toggle`).
- Shared selectors used by multiple modules belong in `playwright/configs/ui/shared/**`.
- Avoid raw CSS/XPath literals in config unless there is no user-facing locator contract.

## UI Config Shape

```typescript
export const MODULE_UI = {
  LIST: {
    CONTAINER: "module-list",
    TABLE: "module-table",
  },
  FORM: {
    SUBMIT_BTN: "module-form-submit",
  },
} as const;
```

## API Config Shape

```typescript
import { createModuleConfig } from "@core/api";

export const MODULE_CONFIG = createModuleConfig({
  basePath: "/api/v1",
  prefix: "module",
  resources: {
    items: ["LIST", "DETAILS", "CREATE", "UPDATE", "DELETE"],
  },
});
```

## Routes Shape

```typescript
const MODULE = {
  ROOT: "/module",
  DETAIL: (id: string) => `/module/${id}`,
} as const;
```
