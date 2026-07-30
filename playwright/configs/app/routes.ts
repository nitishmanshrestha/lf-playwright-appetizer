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

export const ROUTES = {
  DASHBOARD,
  EXAMPLE,
} as const;
