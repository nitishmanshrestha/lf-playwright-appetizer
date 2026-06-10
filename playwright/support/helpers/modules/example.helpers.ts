/**
 * @fileoverview Example module helpers.
 * All helpers import selectors from UI config and API definitions from API config.
 * Helpers are verb-first: visitList, search, create, assertLoaded, etc.
 *
 * Architecture equivalent of Cypress.Commands.add() for the example module.
 * locator-strategy: legacy-file
 */

import { Page, expect, Response } from "@playwright/test";
import { EXAMPLE_CONFIG } from "@configs/api/modules/example/example.api";
import { EXAMPLE_UI } from "@configs/ui/modules/example/example.ui";
import { ROUTES } from "@configs/app/routes";
import { waitForAPI } from "@core/api";

export class ExampleHelpers {
  constructor(private page: Page) {}

  // ─── Navigation ──────────────────────────────────────────────────────────

  async visitList(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes("/api/v1/examples") && resp.request().method() === "GET",
      { timeout: 15_000 },
    );
    await this.page.goto(ROUTES.EXAMPLE.ROOT);
    await responsePromise;
  }

  // ─── Search / Filter ─────────────────────────────────────────────────────

  async search(query: string): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/v1/examples/search") && resp.request().method() === "POST",
      { timeout: 15_000 },
    );
    await this.page.getByTestId(EXAMPLE_UI.LIST.SEARCH_INPUT).clear();
    await this.page.getByTestId(EXAMPLE_UI.LIST.SEARCH_INPUT).fill(query);
    await this.page.getByTestId(EXAMPLE_UI.LIST.SEARCH_BTN).click();
    return responsePromise;
  }

  async clearSearch(): Promise<void> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes("/api/v1/examples") && resp.request().method() === "GET",
      { timeout: 15_000 },
    );
    await this.page.getByTestId(EXAMPLE_UI.LIST.CLEAR_BTN).click();
    await responsePromise;
  }

  // ─── Create / Edit ───────────────────────────────────────────────────────

  async create(fields: { name: string; status?: string }): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (resp) => resp.url().includes("/api/v1/examples") && resp.request().method() === "POST",
      { timeout: 15_000 },
    );
    await this.page.getByTestId(EXAMPLE_UI.FORM.NAME_INPUT).fill(fields.name);
    if (fields.status) {
      await this.page.getByTestId(EXAMPLE_UI.FORM.STATUS_SELECT).selectOption(fields.status);
    }
    await this.page.getByTestId(EXAMPLE_UI.FORM.SUBMIT_BTN).click();
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    return response;
  }

  // ─── Assertions ──────────────────────────────────────────────────────────

  async assertListLoaded(): Promise<void> {
    await expect(this.page.getByTestId(EXAMPLE_UI.LIST.TABLE)).toBeVisible();
    await expect(this.page.getByTestId(EXAMPLE_UI.LIST.LOADING_SPINNER)).not.toBeVisible();
  }

  async assertEmptyState(): Promise<void> {
    await expect(this.page.getByTestId(EXAMPLE_UI.LIST.EMPTY_STATE)).toBeVisible();
  }

  async assertTableHasRows(minCount: number = 1): Promise<void> {
    const rows = this.page.getByTestId(EXAMPLE_UI.LIST.TABLE_ROW);
    await expect(rows).toHaveCount(minCount, { timeout: 10_000 });
  }
}
