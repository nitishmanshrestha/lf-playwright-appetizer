/**
 * @fileoverview Example JSON schema for API response validation.
 * Used with Playwright's expect() for contract testing.
 */

export const EXAMPLE_SCHEMAS = {
  LIST: {
    type: "object",
    required: ["items", "total"],
    properties: {
      items: { type: "array" },
      total: { type: "number" },
    },
  },
  DETAIL: {
    type: "object",
    required: ["id", "name", "status"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      status: { type: "string" },
    },
  },
} as const;
