/**
 * @fileoverview Application route registry.
 * All navigable URL paths are defined here. Helpers import from this file — never hardcode URLs.
 *
 * Pattern:
 *   const MODULE = { ROOT: '/path', DETAIL: (id: string) => `/path/${id}` } as const;
 *   export const ROUTES = { MODULE } as const;
 */

const DASHBOARD = {
  ROOT: "/dashboard",
} as const;

const EXAMPLE = {
  ROOT: "/example",
  DETAIL: (id: string) => `/example/${id}`,
  CREATE: "/example/new",
} as const;

// ─── Saucedemo (https://www.saucedemo.com) ───────────────────────────────────
const SAUCEDEMO = {
  LOGIN: "/",
  INVENTORY: "/inventory.html",
  CART: "/cart.html",
  CHECKOUT_STEP_ONE: "/checkout-step-one.html",
  CHECKOUT_STEP_TWO: "/checkout-step-two.html",
  CHECKOUT_COMPLETE: "/checkout-complete.html",
  PRODUCT_DETAIL: (id: string) => `/inventory-item.html?id=${id}`,
} as const;

export const ROUTES = {
  DASHBOARD,
  EXAMPLE,
  SAUCEDEMO,
} as const;
