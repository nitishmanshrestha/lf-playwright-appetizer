#!/usr/bin/env node
// Every rule declared `severity: "block"` must actually fire on a violating sample.
//
// This exists because `storage-state-auth` was declared blocking with `enforcement: "Hook + CI"`,
// appeared in the generated rule tables in CLAUDE.md and copilot-instructions.md as blocking, and had
// no pattern behind it at all. A spec with login() in beforeEach() passed the validator clean. A rule
// that is declared and never fires is worse than an absent rule: the instruction tables advertise
// protection that does not exist, and both the AI and the reviewer trust them.
//
// SAMPLES must cover every block rule. Adding a block rule to the config without adding a sample
// fails this test — that is the point. It cannot be satisfied by declaring the rule alone.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanContent } from "../../.claude/hooks/shared-rules.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "harness.config.json"), "utf8"));
const allowlist = { selectors: new Set(), routes: new Set() };

const SPEC = "playwright/tests/cart/smoke/cart.spec.ts";
const HELPER = "playwright/support/helpers/cart.helpers.ts";

// One violating sample per block rule: [file, content]
const SAMPLES = {
  "no-hard-wait": [SPEC, "await page.waitForTimeout(500);"],
  "no-hardcoded-selector": [SPEC, 'await page.locator(".btn-primary").click();'],
  "no-hardcoded-route": [SPEC, 'await page.goto("/checkout");'],
  "no-page-object": ["playwright/support/cart.page.ts", "export class CartPage {}"],
  "no-credential-literal": [HELPER, 'const password = "hunter2secret";'],
  "storage-state-auth": [SPEC, "test.beforeEach(async ({ page }) => { await login(page, u); });"],
  "base-fixture-import": [SPEC, 'import { test } from "@playwright/test";'],
  "smoke-read-only": [SPEC, 'await request.post("/api/orders", {});'],
  // Untagged test: no [REQUIREMENT-ID] title prefix and no tag option at all.
  "one-requirement-tag": [SPEC, 'test("cart totals", async () => {});'],
};

const blockRules = config.rules.filter((r) => r.severity === "block").map((r) => r.id);

// 1. Coverage: the sample table must name every block rule, and nothing else.
const missing = blockRules.filter((id) => !SAMPLES[id]);
const stale = Object.keys(SAMPLES).filter((id) => !blockRules.includes(id));
assert.deepEqual(
  missing,
  [],
  `block rule(s) with no violating sample — add one to SAMPLES: ${missing.join(", ")}`,
);
assert.deepEqual(
  stale,
  [],
  `SAMPLES names rule(s) that are no longer block severity: ${stale.join(", ")}`,
);

// 2. Enforcement: each sample must produce at least one violation.
const unenforced = [];
for (const id of blockRules) {
  const [file, content] = SAMPLES[id];
  const violations = scanContent(file, content, allowlist, root);
  if (violations.length === 0) unenforced.push(id);
}
assert.deepEqual(
  unenforced,
  [],
  `declared "block" but the hook engine never fires: ${unenforced.join(", ")}. ` +
    `Either add a pattern to .claude/hooks/shared-rules.mjs, or change the rule to ` +
    `severity "review" so the QA gate grades it and the tables stop claiming a hard block.`,
);

// 3. A clean file must produce nothing — a scanner that flags everything enforces nothing.
assert.equal(
  scanContent(
    SPEC,
    // Carries the full tag contract, not just the title prefix. It did not before
    // one-requirement-tag became a block rule here, which made this "compliant" sample
    // non-compliant — worth stating, because the reference example is also documentation.
    'import { test, expect } from "../../../fixtures/base.fixture";\n' +
      'test("[REQ-1] shows cart", { tag: ["@REQ-1", "@smoke", "@P0"] }, async ({ page, nav }) => {\n' +
      "  await nav.goto(ROUTES.CART);\n" +
      "  await expect(page.getByRole('heading', { name: 'Cart' })).toBeVisible();\n" +
      "});\n",
    allowlist,
    root,
  ).length,
  0,
  "a compliant spec must produce zero violations",
);

console.log(
  `[block-rules] ${blockRules.length} block rule(s), all enforced; compliant spec stays clean`,
);
