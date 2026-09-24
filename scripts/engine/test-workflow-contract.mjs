import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const workflow = (name) => fs.readFileSync(path.join(root, ".github", "workflows", name), "utf8");

const main = workflow("playwright.yml");
const rules = workflow("playwright-rules.yml");

for (const [name, content] of [
  ["doc-impact.yml", workflow("doc-impact.yml")],
  ["locator-strategy.yml", workflow("locator-strategy.yml")],
  ["playwright-rules.yml", rules],
  ["playwright.yml", main],
]) {
  assert.ok(
    !/actions\/(?:checkout|setup-node)@v4/.test(content),
    `${name} still uses a Node 20 action runtime`,
  );
  assert.ok(!/node-version:\s*["']?20/.test(content), `${name} still installs Node 20`);
}

assert.ok(
  main.includes("actions/upload-artifact@v6"),
  "playwright.yml must use the Node 24 upload action",
);
assert.ok(
  main.includes("github.event_name == 'pull_request' && startsWith(github.head_ref, 'task/')"),
  "playwright.yml must check a task manifest only for task/<ID> pull requests",
);
assert.ok(
  rules.includes("if: startsWith(github.head_ref, 'task/')"),
  "playwright-rules.yml must check a task manifest only for task/<ID> pull requests",
);

console.log("[workflow-contract] Node 24 action/runtime policy and task-branch checks verified");
