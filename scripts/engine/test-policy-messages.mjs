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
