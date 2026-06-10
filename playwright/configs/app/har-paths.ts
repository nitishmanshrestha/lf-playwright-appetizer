/**
 * HAR file paths used across the test suite.
 *
 * Store one HAR file per screen/state combination.
 * Path values are relative to `playwright/fixtures/har/`.
 *
 * Refresh when APIs change:
 *   UPDATE_HAR=1 npx playwright test --grep @[module]
 */
export const HAR = {
  EXAMPLE: {
    LIST: "example/list.har",
    DETAIL: "example/detail.har",
    EMPTY_STATE: "example/empty-state.har",
  },
  // Add module entries here as you add modules.
  // Follow the pattern: MODULE: { VIEW: "module/view.har" }
} as const;
