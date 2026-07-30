import { test, expect } from "@fixtures/base.fixture";
import { ROUTES } from "@configs/app/routes";

// Register {{MODULE_UPPER}}Helpers in base.fixture.ts before running.
test("smoke @smoke — {{MODULE}} scaffold", async ({ nav }) => {
  await nav.goto(ROUTES.{{MODULE_UPPER}}.ROOT);
  // TODO: replace with {{MODULE}}Helpers actions once registered in base.fixture.ts
});
