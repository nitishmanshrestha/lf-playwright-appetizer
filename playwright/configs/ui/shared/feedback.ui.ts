/**
 * @fileoverview Shared feedback and overlay selectors.
 */

export const FEEDBACK_UI = {
  TOAST: {
    TEST_IDS: ["toast", "snackbar"],
    ROLE: "alert",
  },
  LOADING: {
    TEST_ID_PATTERN: /loading|spinner/i,
    TIMEOUT_MS: 10_000,
  },
  MODAL: {
    CONTAINER_TEST_IDS: ["modal", "dialog"],
    CONTAINER_ROLE: "dialog",
    CLOSE_BUTTON_TEST_IDS: ["modal-close", "dialog-close"],
    CLOSE_BUTTON_NAME_PATTERN: /close|dismiss/i,
  },
} as const;