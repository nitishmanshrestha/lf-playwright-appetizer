const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { renderTemplate, scaffoldModule, toUpperModuleName } = require("../lib/generator");

function makeTempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "apetizer-generator-"));
  fs.mkdirSync(path.join(root, "playwright", "configs", "app"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "playwright", "configs", "app", "routes.ts"),
    [
      "export const ROUTES = {",
      "} as const;",
      "",
    ].join("\n"),
    "utf8",
  );
  return root;
}

test("renderTemplate replaces tokens", () => {
  const rendered = renderTemplate("hello {{MODULE}} {{ROUTE}}", {
    MODULE: "sample",
    ROUTE: "/sample",
  });

  assert.equal(rendered, "hello sample /sample");
});

test("toUpperModuleName normalizes module names", () => {
  assert.equal(toUpperModuleName("sales-orders"), "SALES_ORDERS");
});

test("scaffoldModule writes module files and updates routes", () => {
  const rootDir = makeTempRoot();

  try {
    const result = scaffoldModule({
      rootDir,
      moduleName: "widget",
      route: "/widget",
    });

    assert.ok(result.created.length >= 4);
    assert.equal(result.updated.length, 1);

    const routes = fs.readFileSync(
      path.join(rootDir, "playwright", "configs", "app", "routes.ts"),
      "utf8",
    );
    assert.match(routes, /const WIDGET = \{/);
    assert.match(routes, /WIDGET,/);

    const helper = fs.readFileSync(
      path.join(rootDir, "playwright", "support", "helpers", "modules", "widget.helpers.ts"),
      "utf8",
    );
    assert.match(helper, /class WIDGETHelpers/);

    const spec = fs.readFileSync(
      path.join(rootDir, "playwright", "tests", "widget", "smoke", "widget-smoke.spec.ts"),
      "utf8",
    );
    assert.match(spec, /widget scaffold/);
  } finally {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }
});
