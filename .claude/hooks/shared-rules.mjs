/**
 * Shared Playwright rule scanner used by both pre-validate and post-validate hooks.
 * Add new rules here — they apply to both the pre-write block and the post-write warning.
 *
 * Mirrors the Cypress boilerplate's hook contract so the two frameworks behave
 * identically for anyone moving between projects; only the patterns differ.
 *
 * Deliberately NOT enforced here: locator preference order (getByRole → getByLabel →
 * getByText → getByTestId) and "narrow with filter() before first()/nth()". Both need
 * real AST analysis to check without false positives — they stay in FRAMEWORK_RULES.md
 * and `npm run check:locator-strategy`.
 */

import fs from "node:fs";
import path from "node:path";

const TARGET_FILE_RE = /playwright[\\/].*\.ts$/i;
const SPEC_RE = /\.spec\.ts$/i;
const CODE_RE = /\.(spec|helpers|fixture|setup)\.ts$/i;

export function toPosix(p) {
  return p.replaceAll("\\", "/");
}

export function loadAllowlist(allowlistPath) {
  try {
    const raw = JSON.parse(fs.readFileSync(allowlistPath, "utf8"));
    return {
      selectors: new Set((raw.selectors || []).map((s) => String(s).trim())),
      routes: new Set((raw.routes || []).map((s) => String(s).trim())),
    };
  } catch {
    return { selectors: new Set(["body", "html"]), routes: new Set(["/"]) };
  }
}

export function isAllowedLiteral(value, allowSet, ignoreCase = false) {
  const literal = String(value || "").trim();
  if (!literal) return false;
  if (allowSet.has(literal)) return true;
  if (!ignoreCase) return false;
  const lower = literal.toLowerCase();
  for (const allowed of allowSet) {
    if (String(allowed).toLowerCase() === lower) return true;
  }
  return false;
}

export function lineNumberForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

export function scanForRegex(violations, filePath, text, regex, messageBuilder) {
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lineNumber = lineNumberForIndex(text, match.index);
    const message =
      typeof messageBuilder === "function" ? messageBuilder(match) : messageBuilder;
    if (!message) continue;
    violations.push({ filePath, lineNumber, message });
  }
}

export function scanContent(filePath, content, allowlist, repoRoot) {
  const violations = [];
  const normalized = toPosix(path.relative(repoRoot, filePath));

  if (!TARGET_FILE_RE.test(normalized)) return violations;

  // Rule 1: No hard waits.
  scanForRegex(
    violations, normalized, content,
    /\bwaitForTimeout\(\s*\d+\s*\)/g,
    "Hard wait detected. Replace with waitForResponse(...) or an expect() assertion.",
  );

  // Rule 2: No page-object imports — this framework is helper-first.
  scanForRegex(
    violations, normalized, content,
    /from\s+['"][^'"]*(page-obj|pageobject|page-object|\/pages\/)[^'"]*['"]/gi,
    "Page-object import detected. Helper-first architecture forbids page-object dependencies.",
  );

  // Rule 3: Specs must import test/expect from base.fixture, never @playwright/test
  // directly — the fixture is what injects every helper.
  if (SPEC_RE.test(normalized)) {
    scanForRegex(
      violations, normalized, content,
      /import\s+[^;]*\bfrom\s+['"]@playwright\/test['"]/g,
      "Spec imports from '@playwright/test'. Import test/expect from fixtures/base.fixture instead.",
    );
  }

  // Rule 4: No hardcoded selectors in spec/helper files.
  if (CODE_RE.test(normalized)) {
    scanForRegex(
      violations, normalized, content,
      /\.locator\(\s*['"]([^'"]+)['"]\s*\)/g,
      (m) => {
        const selector = String(m[1] || "").trim();
        if (isAllowedLiteral(selector, allowlist.selectors, true)) return null;
        return `Hardcoded selector in .locator('${selector}'). Use constants from playwright/configs/ui/**, or add it to playwright-hook-allowlist.json if it is a structural tag.`;
      },
    );
  }

  // Rule 5: No hardcoded routes in goto() (except allowlisted root).
  if (CODE_RE.test(normalized)) {
    scanForRegex(
      violations, normalized, content,
      /\.goto\(\s*['"]([^'"]+)['"]\s*\)/g,
      (m) => {
        const route = String(m[1] || "").trim();
        const isLiteral = route.startsWith("/") || /^https?:\/\//i.test(route);
        if (!isLiteral || isAllowedLiteral(route, allowlist.routes)) return null;
        return `Hardcoded route '${route}' in .goto(...). Use route constants from playwright/configs/app/routes.ts.`;
      },
    );
  }

  // Rule 6: No credentials in source. Trust boundary — never relaxed.
  scanForRegex(
    violations, normalized, content,
    /\b(password|passwd|secret|api[_-]?key|auth[_-]?token|access[_-]?token)\s*[:=]\s*["'`]([^"'`$][^"'`]{3,})["'`]/gi,
    (m) => `Hardcoded credential assigned to '${m[1]}'. Read it from process.env instead; keep the value in .env (gitignored) or a CI secret.`,
  );

  // Rule 7: Smoke tests must be read-only.
  if (/playwright[\\/]tests[\\/].*[\\/]smoke[\\/].*\.spec\.ts$/i.test(normalized)) {
    scanForRegex(
      violations, normalized, content,
      /\b(?:request|api)\.(post|put|patch|delete)\s*\(/gi,
      "Write request in smoke suite. Smoke tests must remain read-only.",
    );
    scanForRegex(
      violations, normalized, content,
      /\bmethod\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/gi,
      "Write HTTP method in smoke suite. Smoke tests must remain read-only.",
    );
  }

  return violations;
}
