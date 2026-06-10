export const FRAMEWORK_EVIDENCE = {
  ROOT_DIR: "playwright/evidence",
  TESTS: {
    PLAYWRIGHT_OUTPUT_DIR: "playwright/evidence/tests/output",
    HTML_REPORT_DIR: "playwright/evidence/tests/html-report",
    JSON_REPORT_FILE: "playwright/evidence/tests/results.json",
    JUNIT_REPORT_FILE: "playwright/evidence/tests/junit.xml",
  },
  BOOTSTRAP: {
    LOG_DIR: "playwright/evidence/bootstrap",
    LATEST_FILE: "playwright/evidence/bootstrap/latest.json",
  },
} as const;
