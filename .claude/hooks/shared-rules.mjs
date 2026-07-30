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

export function extractToolChange(toolData, repoRoot, { readCurrent = false } = {}) {
  const toolName = toolData?.tool_name || toolData?.toolName || "";
  let toolInput = toolData?.tool_input || toolData?.toolArgs || {};
  if (typeof toolInput === "string") {
    try {
      toolInput = JSON.parse(toolInput);
    } catch {
      return { filePath: "", content: "" };
    }
  }

  const filePath = toolInput.file_path || toolInput.filePath || toolInput.path || "";
  if (!filePath || !["Write", "Edit"].includes(toolName)) return { filePath: "", content: "" };

  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(repoRoot, filePath);
  if (readCurrent && fs.existsSync(absolutePath)) {
    return { filePath, content: fs.readFileSync(absolutePath, "utf8") };
  }

  if (toolName === "Write") {
    return { filePath, content: toolInput.content || toolInput.text || "" };
  }

  const replacement =
    toolInput.new_string ||
    toolInput.newString ||
    toolInput.new_str ||
    toolInput.replacement ||
    toolInput.content ||
    "";
  const original = toolInput.old_string || toolInput.oldString || toolInput.old_str || "";
  if (replacement && original && fs.existsSync(absolutePath)) {
    const current = fs.readFileSync(absolutePath, "utf8");
    if (current.includes(original)) {
      return { filePath, content: current.replace(original, replacement) };
    }
  }
  return { filePath, content: replacement };
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

export function loadRuleMessages(repoRoot) {
  try {
    return Object.fromEntries(
      JSON.parse(fs.readFileSync(path.join(repoRoot, "harness.config.json"), "utf8")).rules.map(
        (rule) => [rule.id, rule.message],
      ),
    );
  } catch {
    return {};
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
    const message = typeof messageBuilder === "function" ? messageBuilder(match) : messageBuilder;
    if (!message) continue;
    violations.push({ filePath, lineNumber, message });
  }
}

export function scanContent(filePath, content, allowlist, repoRoot) {
  const violations = [];
  const messages = loadRuleMessages(repoRoot);
  const message = (id, fallback) => messages[id] || fallback;
  // The tool may hand us a repo-relative path. Node would resolve that against cwd, which is
  // not necessarily the repo root — from a foreign cwd that yields a mangled path, and the
  // file-type regex below can miss it, silently skipping every rule. Anchor to repoRoot.
  const absolute = path.isAbsolute(filePath) ? filePath : path.resolve(repoRoot, filePath);
  const normalized = toPosix(path.relative(repoRoot, absolute));

  if (!TARGET_FILE_RE.test(normalized)) return violations;

  // Rule 1: No hard waits.
  scanForRegex(
    violations,
    normalized,
    content,
    /\bwaitForTimeout\(\s*\d+\s*\)/g,
    message(
      "no-hard-wait",
      "Hard wait detected. Replace with waitForResponse(...) or an expect() assertion.",
    ),
  );

  // Rule 2: No page-object or action-layer wrappers outside helpers.
  if (
    !/^playwright\/support\/helpers\//i.test(normalized) &&
    (/(^|\/)(pages?|page-objects?|pageobjects?|actions?)(\/|$)/i.test(normalized) ||
      /\.(?:page|actions)\.ts$/i.test(normalized) ||
      /\bclass\s+\w*(?:Page|Actions)\b/.test(content))
  ) {
    violations.push({
      filePath: normalized,
      lineNumber: 1,
      message: message(
        "no-page-object",
        "Page-object or action-layer wrapper detected. Use the helper-first architecture.",
      ),
    });
  }
  scanForRegex(
    violations,
    normalized,
    content,
    /from\s+['"][^'"]*(page-obj|pageobject|page-object|\/pages\/)[^'"]*['"]/gi,
    message(
      "no-page-object",
      "Page-object import detected. Helper-first architecture forbids page-object dependencies.",
    ),
  );

  // Rule 3: Specs must import test/expect from base.fixture, never @playwright/test
  // directly — the fixture is what injects every helper.
  if (SPEC_RE.test(normalized)) {
    scanForRegex(
      violations,
      normalized,
      content,
      /import\s+[^;]*\bfrom\s+['"]@playwright\/test['"]/g,
      message(
        "base-fixture-import",
        "Spec imports from '@playwright/test'. Import test/expect from fixtures/base.fixture instead.",
      ),
    );
  }

  // Rule 4: No hardcoded selectors in spec/helper files.
  if (CODE_RE.test(normalized)) {
    scanForRegex(violations, normalized, content, /\.locator\(\s*['"]([^'"]+)['"]\s*\)/g, (m) => {
      const selector = String(m[1] || "").trim();
      if (isAllowedLiteral(selector, allowlist.selectors, true)) return null;
      return message(
        "no-hardcoded-selector",
        `Hardcoded selector in .locator('${selector}'). Use constants from playwright/configs/ui/**, or add it to playwright-hook-allowlist.json if it is a structural tag.`,
      );
    });
  }

  // Rule 5: No hardcoded routes in goto() (except allowlisted root).
  if (CODE_RE.test(normalized)) {
    scanForRegex(violations, normalized, content, /\.goto\(\s*['"]([^'"]+)['"]\s*\)/g, (m) => {
      const route = String(m[1] || "").trim();
      const isLiteral = route.startsWith("/") || /^https?:\/\//i.test(route);
      if (!isLiteral || isAllowedLiteral(route, allowlist.routes)) return null;
      return message(
        "no-hardcoded-route",
        `Hardcoded route '${route}' in .goto(...). Use route constants from playwright/configs/app/routes.ts.`,
      );
    });
  }

  // Rule 6: No credentials in source. Trust boundary — never relaxed.
  scanForRegex(
    violations,
    normalized,
    content,
    /\b(password|passwd|secret|api[_-]?key|auth[_-]?token|access[_-]?token)\s*[:=]\s*["'`]([^"'`$][^"'`]{3,})["'`]/gi,
    (m) =>
      message(
        "no-credential-literal",
        `Hardcoded credential assigned to '${m[1]}'. Read it from process.env instead; keep the value in .env (gitignored) or a CI secret.`,
      ),
  );

  // Rule 7: Smoke tests must be read-only.
  if (/playwright[\\/]tests[\\/].*[\\/]smoke[\\/].*\.spec\.ts$/i.test(normalized)) {
    scanForRegex(
      violations,
      normalized,
      content,
      /\b(?:request|api)\.(post|put|patch|delete)\s*\(/gi,
      message(
        "smoke-read-only",
        "Write request in smoke suite. Smoke tests must remain read-only.",
      ),
    );
    scanForRegex(
      violations,
      normalized,
      content,
      /\bmethod\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/gi,
      message(
        "smoke-read-only",
        "Write HTTP method in smoke suite. Smoke tests must remain read-only.",
      ),
    );
  }

  return violations;
}
