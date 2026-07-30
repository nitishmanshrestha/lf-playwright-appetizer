import { test } from "@fixtures/base.fixture";
import { ROUTES } from "@configs/app/routes";

test("smoke @smoke — example: create item", async ({ exampleHelpers, nav }) => {
  await nav.goto(ROUTES.EXAMPLE.ROOT);

  const name = `test-item-${Date.now()}`;
  await exampleHelpers.createItem(name);
  await exampleHelpers.assertItemVisible(name);
});
