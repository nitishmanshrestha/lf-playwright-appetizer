#!/usr/bin/env node
// Guards the extension surface of the rule scanner.
//
// This test exists because of a real defect, found first in the Cypress adapter as its mirror image:
// every rule pattern here matched only `.ts`, so a `.spec.js` file bypassed every block-severity
// rule. playwright.config.ts sets no testMatch, so Playwright's default pattern executes
// *.spec.js — the file would run while the harness stayed blind to it. Nothing warned anyone, which
// is worse than the language being unsupported.
//
// If someone narrows a pattern back to one language, or adds a rule with a fresh single-language
// regex, this fails.
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXTENSION_PATTERNS, scanContent } from "../../.claude/hooks/shared-rules.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// One spec body that trips several block rules at once.
const VIOLATING_SPEC = `
import { test, expect } from "@playwright/test";

test.describe("probe", () => {
  test("breaks the rules", async ({ page }) => {
    await page.goto("https://hardcoded.example.com/login");
    await page.locator("[data-testid=username]").fill("admin");
    const password = "s3cret-literal";
    await page.waitForTimeout(3000);
    await page.request.post("/api/orders", { data: { password } });
  });
});
`;

const allowlist = {
  selectors: new Set(["body", "html"]),
  routes: new Set(["/"]),
};

// Every extension Playwright can execute must be scanned identically.
const EXTENSIONS = ["ts", "js", "mts", "mjs", "cts", "cjs"];
const counts = new Map();

for (const ext of EXTENSIONS) {
  const file = `playwright/tests/probe/smoke/probe.spec.${ext}`;
  const violations = scanContent(file, VIOLATING_SPEC, allowlist, repoRoot);
  counts.set(ext, violations.length);
  assert.ok(
    violations.length > 0,
    `.spec.${ext} produced no violations — that extension bypasses every rule`,
  );
}

// Not just "some" findings: the same code must yield the same verdict in every language.
const [baseline, ...rest] = EXTENSIONS.map((e) => counts.get(e));
for (const [index, count] of rest.entries()) {
  assert.equal(
    count,
    baseline,
    `.spec.${EXTENSIONS[index + 1]} found ${count} violations but .spec.ts found ${baseline} — ` +
      `enforcement must not depend on the language`,
  );
}

// The specific rules that were silently skipped for JavaScript before the fix.
const messages = scanContent(
  "playwright/tests/probe/smoke/probe.spec.js",
  VIOLATING_SPEC,
  allowlist,
  repoRoot,
)
  .map((v) => v.message)
  .join(" | ");
// Match the configured messages from harness.config.json, not the hardcoded fallbacks.
for (const expected of [
  "Hard wait",
  "credential",
  "base.fixture",
  "Hardcoded selector",
  "Write request",
]) {
  assert.ok(
    messages.includes(expected),
    `JavaScript spec did not trigger: ${expected} — got: ${messages}`,
  );
}

// The shared constants are the single place extensions are declared. Keep them that way.
for (const [name, pattern] of Object.entries(EXTENSION_PATTERNS)) {
  if (name === "SCRIPT_EXT") continue;
  assert.ok(pattern instanceof RegExp, `${name} should be a RegExp`);
  assert.ok(
    pattern.source.includes("[jt]s"),
    `${name} accepts only one language — it was narrowed back`,
  );
}

// A non-script file under playwright/ must still be ignored.
assert.equal(
  scanContent("playwright/testdata/data.json", VIOLATING_SPEC, allowlist, repoRoot).length,
  0,
  "a .json file should not be scanned as a script",
);

console.log(
  `[rules] extension coverage verified for ${EXTENSIONS.join(", ")} (${baseline} violations each)`,
);
