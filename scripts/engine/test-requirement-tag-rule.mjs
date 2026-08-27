#!/usr/bin/env node
// Focused coverage for the one-requirement-tag block rule on this adapter.
//
// The Cypress adapter has had this rule and this test since two real PRs shipped tag defects a green
// verify never caught. This adapter declared the same rule `review` at the QA gate with no pattern
// behind it and no ratchet date — an open-ended ramp the spec does not allow, and the reason
// coverage was computable by enforcement in one adapter and not the other. The conformance checker
// reported it as an I6 gap; this is the rule and the test that close it.
//
// Structural and single-file by design. Whether an id is *active* and unique across the repository
// is graded by evidence:build and check:requirements, which see cross-file state a hook cannot.

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scanContent } from "../../.claude/hooks/shared-rules.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const allowlist = {
  selectors: new Set(),
  routes: new Set(),
  endpoints: new Set(),
};
// A smoke path, so the tier assertion is exercised. The spec importing from base.fixture keeps the
// base-fixture rule quiet so each case isolates the tag rule.
const SPEC = "playwright/tests/cart/smoke/cart.spec.ts";
const PREAMBLE = 'import { test } from "../../../fixtures/base.fixture";\n';

const tagProblems = (body) =>
  scanContent(SPEC, PREAMBLE + body, allowlist, root)
    .map((violation) => violation.message)
    .filter((message) => message.startsWith("Test must carry exactly one"));

// A fully compliant test trips nothing.
assert.equal(
  tagProblems(
    'test("[PAY-CART-001] cart totals", { tag: ["@PAY-CART-001", "@smoke", "@P0"] }, async () => {});',
  ).length,
  0,
  "a correctly tagged test must not trip the rule",
);

// Nested options before `tag` stay visible to the balanced-object parser, which is why the parser
// exists: a non-greedy regex stops at the first closing brace and misses the tag field entirely,
// turning valid tests into false positives.
assert.equal(
  tagProblems(
    'test("[PAY-CART-001] cart totals", { annotation: { type: "issue", description: "x" }, tag: ["@PAY-CART-001", "@smoke", "@P0"] }, async () => {});',
  ).length,
  0,
  "a tag field after a nested object must still be found",
);

const cases = [
  [
    'test("cart totals", { tag: ["@PAY-CART-001", "@smoke", "@P0"] }, async () => {});',
    /title must begin with a \[REQUIREMENT-ID\] prefix/,
    "a missing title prefix must be caught",
  ],
  [
    'test("[PAY-CART-001] cart totals", async () => {});',
    /expected exactly one requirement id tag, found 0/,
    "a test with no tags at all must be caught",
  ],
  [
    'test("[PAY-CART-001] cart", { tag: ["@PAY-CART-001", "@smoke", "@regression", "@P0"] }, async () => {});',
    /expected exactly one Type tag/,
    "two Type tags must be caught — this is one of the two defects that reached production",
  ],
  [
    'test("[PAY-CART-001] cart", { tag: ["@PAY-CART-001", "@PAY-CART-002", "@smoke", "@P0"] }, async () => {});',
    /expected exactly one requirement id tag, found 2/,
    "two requirement ids must be caught",
  ],
  [
    'test("[PAY-CART-002] cart", { tag: ["@PAY-CART-001", "@smoke", "@P0"] }, async () => {});',
    /does not match requirement tag/,
    "a title id disagreeing with the tag must be caught",
  ],
  [
    'test("[PAY-CART-001] cart", { tag: ["@PAY-CART-001", "@regression", "@P0"] }, async () => {});',
    /expected exactly one tier tag \(@smoke\)/,
    "a smoke-path spec tagged only @regression must be caught",
  ],
  [
    'test("[PAY-CART-001] cart", { tag: "@PAY-CART-001" }, async () => {});',
    /expected exactly one Type tag/,
    "Playwright allows tag as a bare string, and a single string can never satisfy the contract",
  ],
];
for (const [body, expected, message] of cases) {
  const problems = tagProblems(body);
  assert.equal(problems.length, 1, `${message} (expected one violation)`);
  assert.match(problems[0], expected, message);
}

// Outside the test root the rule must stay silent: a helper is not a spec.
assert.equal(
  scanContent(
    "playwright/support/helpers/cart.helpers.ts",
    'export const noop = () => {};\ntest("untagged", async () => {});',
    allowlist,
    root,
  ).filter((violation) => violation.message.startsWith("Test must carry")).length,
  0,
  "the tag rule applies to specs under the test root, not to helpers",
);

console.log("[tag-rule] one-requirement-tag structural checks verified");
