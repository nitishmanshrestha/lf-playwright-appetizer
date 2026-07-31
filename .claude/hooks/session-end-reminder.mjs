#!/usr/bin/env node
import { execSync } from "node:child_process";

function runGit(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

const changed = runGit("git diff --name-only HEAD");
const untracked = runGit("git ls-files --others --exclude-standard");
const allChanged = [changed, untracked].filter(Boolean).join("\n");

const hasPlaywrightChanges = /playwright\//i.test(allChanged);

if (!hasPlaywrightChanges) process.exit(0);

console.log("");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  Session ended with Playwright file changes.");
console.log("");
console.log("  Before opening a PR, run:");
console.log("  → pre-merge-qa-gate agent   full QA verdict");
console.log("");
console.log("  Pre-merge checklist:");
console.log("  [ ] No hardcoded selectors or endpoints");
console.log("  [ ] No page.waitForTimeout(number)");
console.log("  [ ] storageState setup used instead of per-test login");
console.log("  [ ] Spec imports test/expect from base.fixture.ts");
console.log("  [ ] No POST/PUT/PATCH/DELETE in smoke tests");
console.log("  [ ] Regression test added for any bug fix");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("");

process.exit(0);
