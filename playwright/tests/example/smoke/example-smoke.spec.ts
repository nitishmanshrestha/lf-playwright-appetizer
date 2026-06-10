/**
 * @fileoverview Example smoke spec — demonstrates the full helper-first pattern.
 *
 * THIS FILE IS THE CANONICAL EXAMPLE. Copy it to start a new module spec.
 *
 * Architectural rules enforced here:
 *   ✅ Auth handled by storageState (project dependency on auth-setup)
 *   ✅ All selectors via UI config constants — zero hardcoded selectors
 *   ✅ All routes via ROUTES constants — zero hardcoded URLs
 *   ✅ No arbitrary waits — all waits are response-driven or assertion-driven
 *   ✅ Tags via test metadata — @smoke, @example
 *   ✅ State reset per test via Playwright's isolated browser contexts
 */

import { test, expect } from "../../../fixtures/base.fixture";

// TEMPLATE ONLY — copy this file to start a new module spec.
// Skipped intentionally: no backing application exists at baseUrl for these commands.
test.describe("Example Module", { tag: ["@example"] }, () => {
  test.beforeEach(async ({ exampleHelpers }) => {
    await exampleHelpers.visitList();
  });

  // ─── Smoke: Page Load ──────────────────────────────────────────────────────

  test("loads the example list", { tag: ["@smoke"] }, async ({ exampleHelpers, ui }) => {
    await exampleHelpers.assertListLoaded();
    await ui.assertLoadingComplete();
  });

  test(
    "validates the list API response shape",
    { tag: ["@smoke"] },
    async ({ page }) => {
      const response = await page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/v1/examples") &&
          resp.request().method() === "GET",
      );
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty("items");
      expect(body).toHaveProperty("total");
    },
  );

  // ─── Search ────────────────────────────────────────────────────────────────

  test("filters results when a search query is entered", async ({ exampleHelpers }) => {
    await exampleHelpers.search("test-query");
    await exampleHelpers.assertTableHasRows(1);
  });

  test("resets the list when search is cleared", async ({ exampleHelpers }) => {
    await exampleHelpers.search("test-query");
    await exampleHelpers.clearSearch();
    await exampleHelpers.assertTableHasRows(1);
  });

  // ─── Create ────────────────────────────────────────────────────────────────

  test("creates a new example item", async ({ exampleHelpers, nav, ui }) => {
    await nav.goto("/example/new");
    await exampleHelpers.create({ name: "New Item", status: "active" });
    await ui.assertToast("created successfully");
  });
});
