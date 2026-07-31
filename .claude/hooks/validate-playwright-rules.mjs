#!/usr/bin/env node
/**
 * Dual-mode Playwright rule validator.
 *
 * Claude Code hook mode (default — reads stdin):
 *   Receives a PostToolUse JSON event and checks the file just written/edited.
 *
 * CI mode (--base-ref <ref>):
 *   Diffs HEAD against origin/<ref>, reads every changed Playwright file from disk,
 *   and exits non-zero when violations are found.
 *
 *   Usage: node validate-playwright-rules.mjs --base-ref main
 *
 * Scan-all mode (--all):
 *   Checks every tracked .ts file under playwright/. Use locally or on a repo
 *   with no git history to diff against.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractToolChange, toPosix, loadAllowlist, scanContent } from "./shared-rules.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const allowlistPath = path.resolve(__dirname, "playwright-hook-allowlist.json");

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

function report(violations, label, failCode) {
  if (violations.length === 0) {
    console.log(`[${label}] All Playwright rule checks passed.`);
    process.exit(0);
  }
  console.error("");
  console.error(`❌ [${label}] Playwright rule violations detected:`);
  for (const v of violations) {
    console.error(`  ${toPosix(v.filePath)}:${v.lineNumber} -> ${v.message}`);
  }
  console.error("");
  process.exit(failCode);
}

const baseRefIndex = process.argv.indexOf("--base-ref");
const allowlist = loadAllowlist(allowlistPath);

if (process.argv.includes("--all")) {
  // ── Scan-all mode ────────────────────────────────────────────────────────
  const violations = walk(path.join(repoRoot, "playwright")).flatMap((file) =>
    scanContent(file, fs.readFileSync(file, "utf8"), allowlist, repoRoot),
  );
  report(violations, "SCAN", 1);
} else if (baseRefIndex !== -1) {
  // ── CI mode ──────────────────────────────────────────────────────────────
  const baseRef = process.argv[baseRefIndex + 1];
  if (!baseRef) {
    console.error("Usage: node validate-playwright-rules.mjs --base-ref <ref>");
    process.exit(1);
  }

  let changedFiles;
  try {
    const diffOutput = execSync(`git diff --name-only --diff-filter=ACM origin/${baseRef}...HEAD`, {
      cwd: repoRoot,
      encoding: "utf8",
    });
    changedFiles = diffOutput.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    console.error(`[CI] git diff failed: ${err.message}`);
    process.exit(1);
  }

  if (changedFiles.length === 0) {
    console.log("[CI] No changed files — nothing to check.");
    process.exit(0);
  }

  const allViolations = [];
  for (const relFile of changedFiles) {
    const absPath = path.resolve(repoRoot, relFile);
    let content;
    try {
      content = fs.readFileSync(absPath, "utf8");
    } catch {
      continue; // file deleted between diff and read — skip
    }
    allViolations.push(...scanContent(absPath, content, allowlist, repoRoot));
  }
  report(allViolations, "CI", 1);
} else {
  // ── Claude Code hook mode (stdin) ─────────────────────────────────────────
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;

  let toolData;
  try {
    toolData = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const { filePath, content } = extractToolChange(toolData, repoRoot, { readCurrent: true });
  if (!filePath || !content) process.exit(0);

  const violations = scanContent(filePath, content, allowlist, repoRoot);
  if (violations.length === 0) process.exit(0);

  console.error("");
  console.error("❌ [POST-CHECK] Playwright rule violations detected in written file.");
  for (const v of violations) {
    console.error(`  ${toPosix(v.filePath)}:${v.lineNumber} -> ${v.message}`);
  }
  console.error("");
  console.error("Correct these violations before committing.");

  process.exit(2);
}
