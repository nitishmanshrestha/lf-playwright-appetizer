#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const HELPERS_DIR = path.join(ROOT, "playwright", "support", "helpers");
const ACTION_CALL_PATTERN = /\.(click|fill|press|check|uncheck|selectOption)\(/;
const LOCATOR_ROOT_PATTERN = /(?:this\.page|page)\.(getByRole|getByLabel|getByText|getByTestId)\(/;
const RESILIENT_WRAPPER_PATTERN = /\bby[A-Za-z0-9]*Or[A-Za-z0-9]*\(/;

function getAllTsFiles(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosix(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function lineNumberForIndex(source, index) {
  return source.slice(0, index).split("\n").length;
}

function hasAllowSingleCommentNear(source, index) {
  const start = Math.max(0, index - 300);
  const nearby = source.slice(start, index);
  return nearby.includes("locator-strategy: allow-single");
}

function hasAllowSingleCommentInWindow(lines, lineIndex) {
  const start = Math.max(0, lineIndex - 4);
  const nearby = lines.slice(start, lineIndex + 1).join("\n");
  return nearby.includes("locator-strategy: allow-single");
}

function findViolations(filePath) {
  const source = fs.readFileSync(filePath, "utf8");

  if (source.includes("locator-strategy: legacy-file")) {
    return [];
  }

  const lines = source.split("\n");
  const violations = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (!ACTION_CALL_PATTERN.test(lines[i])) {
      continue;
    }

    const start = Math.max(0, i - 5);
    const windowText = lines.slice(start, i + 1).join(" ");

    if (!LOCATOR_ROOT_PATTERN.test(windowText)) {
      continue;
    }

    if (windowText.includes(".or(")) {
      continue;
    }

    if (RESILIENT_WRAPPER_PATTERN.test(windowText)) {
      continue;
    }

    if (hasAllowSingleCommentInWindow(lines, i)) {
      continue;
    }

    const absoluteLine = i + 1;
    const sourceIndex = source.indexOf(lines[i]);
    if (sourceIndex >= 0 && hasAllowSingleCommentNear(source, sourceIndex)) {
      continue;
    }

    violations.push({
      file: toPosix(filePath),
      line: absoluteLine,
      snippet: lines[i].trim().slice(0, 140),
    });
  }

  return violations;
}

function main() {
  if (!fs.existsSync(HELPERS_DIR)) {
    console.log("[locator-strategy] Helpers directory not found. Skipping.");
    return;
  }

  const helperFiles = getAllTsFiles(HELPERS_DIR);
  const violations = helperFiles.flatMap((file) => findViolations(file));

  if (violations.length === 0) {
    console.log("[locator-strategy] Passed.");
    return;
  }

  console.error("[locator-strategy] Found action locators without fallback strategy (.or):\n");

  for (const violation of violations) {
    console.error(`- ${violation.file}:${violation.line}`);
    console.error(`  ${violation.snippet}`);
  }

  console.error(
    "\n[locator-strategy] Fix: add a second locator strategy using .or(...) for action chains.",
  );
  console.error(
    "[locator-strategy] Exception: add comment 'locator-strategy: allow-single' above intentional single-strategy calls.",
  );
  process.exit(1);
}

main();
