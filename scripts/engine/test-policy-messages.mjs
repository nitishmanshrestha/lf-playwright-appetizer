import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractToolChange, scanContent } from "../../.claude/hooks/shared-rules.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

assert.deepEqual(
  extractToolChange(
    {
      toolName: "Write",
      toolArgs: {
        path: "playwright/support/demo.ts",
        text: "const ok = true;",
      },
    },
    root,
  ),
  { filePath: "playwright/support/demo.ts", content: "const ok = true;" },
);

const violations = scanContent(
  "playwright/tests/cart/smoke/cart.spec.ts",
  "const password = 'secret-value'; await page.waitForTimeout(1);",
  { selectors: new Set(), routes: new Set() },
  root,
);

assert.deepEqual(
  violations.map(({ message }) => message),
  [
    "Hard wait detected. Use a response wait or state-based assertion.",
    "Hardcoded credential. Read it from the environment instead.",
  ],
);

assert.deepEqual(
  scanContent(
    "playwright/support/pages/login.page.ts",
    "export class LoginPage {}",
    { selectors: new Set(), routes: new Set() },
    root,
  ).map(({ message }) => message),
  ["Page-object or action-layer dependency. Use the helper-first architecture."],
);

const focused = scanContent(
  "playwright/tests/cart/smoke/cart.spec.ts",
  'test.only("[REQ-1] cart", { tag: ["@REQ-1", "@smoke", "@P0"] }, async () => {});',
  { selectors: new Set(), routes: new Set(), endpoints: new Set() },
  root,
);
assert.deepEqual(
  focused.map(({ message }) => message),
  [
    "Focused test or unrecorded quarantine. Remove .only; a skip/fixme needs // @quarantine ISSUE-123: reason directly above it. (.only is never permitted.)",
  ],
);

assert.equal(
  scanContent(
    "playwright/tests/cart/smoke/cart.spec.ts",
    "// @quarantine QA-123: payment sandbox is unavailable\n" +
      'test.fixme("[REQ-1] cart", { tag: ["@REQ-1", "@smoke", "@P0"] }, async () => {});',
    { selectors: new Set(), routes: new Set(), endpoints: new Set() },
    root,
  ).length,
  0,
  "a recorded quarantine must stay scannable without being blocked",
);
