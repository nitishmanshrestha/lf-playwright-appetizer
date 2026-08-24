/**
 * L2 — Playwright rule patterns. The engine (L1) owns the scan mechanism; this file owns
 * what "a violation" looks like in Playwright, and nothing else.
 *
 * Rule order is preserved from the pre-split scanner because it is the order violations
 * are reported.
 *
 * Deliberately NOT enforced here: locator preference order (getByRole → getByLabel →
 * getByText → getByTestId) and "narrow with filter() before first()/nth()". Both need real
 * AST analysis to check without false positives, and a regex here would produce false
 * positives that teach people to ignore the hook. They live in the "Locator contract"
 * section of harness/qa-automation-foundations.md, which is injected into the BUILD and
 * EVALUATE agents, and the independent gate scores them. `npm run check:locator-strategy`
 * covers a narrower, adjacent check: action locators with no `.or()` fallback.
 */

import { SCRIPT_EXT, isAllowedLiteral } from "./rule-engine.mjs";

const SPEC_RE = new RegExp(String.raw`\.spec\.${SCRIPT_EXT}$`, "i");
const CODE_RE = new RegExp(String.raw`\.(spec|helpers|fixture|setup)\.${SCRIPT_EXT}$`, "i");
const PAGE_OBJECT_RE = new RegExp(String.raw`\.(?:page|actions)\.${SCRIPT_EXT}$`, "i");
const SMOKE_SPEC_RE = new RegExp(
  String.raw`playwright[\\/]tests[\\/].*[\\/]smoke[\\/].*\.spec\.${SCRIPT_EXT}$`,
  "i",
);
const TARGET_FILE_RE = new RegExp(String.raw`playwright[\\/].*\.${SCRIPT_EXT}$`, "i");
const HELPERS_ROOT_RE = /^playwright\/support\/helpers\//i;

export const EXTENSION_PATTERNS = {
  SCRIPT_EXT,
  TARGET_FILE_RE,
  SPEC_RE,
  CODE_RE,
  PAGE_OBJECT_RE,
  SMOKE_SPEC_RE,
};

// Claude/Copilot: Write|Edit. Cursor's StrReplace is deliberately absent — see the note in
// makeExtractToolChange. Widening this set is a behaviour change, so it is P1b, not a
// drive-by fix during an extract-at-parity phase.
export const WRITE_TOOLS = ["Write", "Edit"];

export const targetFileRe = TARGET_FILE_RE;

export const rules = [
  {
    concern: "no-hard-wait",
    fallback: "Hard wait detected. Replace with waitForResponse(...) or an expect() assertion.",
    pattern: /\bwaitForTimeout\(\s*\d+\s*\)/g,
  },
  {
    concern: "no-page-object",
    fallback: "Page-object or action-layer wrapper detected. Use the helper-first architecture.",
    appliesTo: (p) => !HELPERS_ROOT_RE.test(p),
    check: ({ filePath, content, push }) => {
      if (
        /(^|\/)(pages?|page-objects?|pageobjects?|actions?)(\/|$)/i.test(filePath) ||
        PAGE_OBJECT_RE.test(filePath) ||
        /\bclass\s+\w*(?:Page|Actions)\b/.test(content)
      ) {
        push(1);
      }
    },
  },
  {
    concern: "no-page-object",
    fallback:
      "Page-object import detected. Helper-first architecture forbids page-object dependencies.",
    pattern: /from\s+['"][^'"]*(page-obj|pageobject|page-object|\/pages\/)[^'"]*['"]/gi,
  },
  {
    // The fixture is the single injection point for helpers, so a spec that imports test
    // directly from @playwright/test silently loses every one of them.
    concern: "base-fixture-import",
    fallback:
      "Spec imports from '@playwright/test'. Import test/expect from fixtures/base.fixture instead.",
    appliesTo: (p) => SPEC_RE.test(p),
    pattern: /import\s+[^;]*\bfrom\s+['"]@playwright\/test['"]/g,
  },
  {
    concern: "no-hardcoded-selector",
    fallback: null,
    appliesTo: (p) => CODE_RE.test(p),
    pattern: /\.locator\(\s*['"]([^'"]+)['"]\s*\)/g,
    messageBuilder: (m, { message, allowlist }) => {
      const selector = String(m[1] || "").trim();
      if (isAllowedLiteral(selector, allowlist.selectors, true)) return null;
      return (
        message ||
        `Hardcoded selector in .locator('${selector}'). Use constants from playwright/configs/ui/**, or add it to playwright-hook-allowlist.json if it is a structural tag.`
      );
    },
  },
  {
    concern: "no-hardcoded-route",
    fallback: null,
    appliesTo: (p) => CODE_RE.test(p),
    pattern: /\.goto\(\s*['"]([^'"]+)['"]\s*\)/g,
    messageBuilder: (m, { message, allowlist }) => {
      const route = String(m[1] || "").trim();
      const isLiteral = route.startsWith("/") || /^https?:\/\//i.test(route);
      if (!isLiteral || isAllowedLiteral(route, allowlist.routes)) return null;
      return (
        message ||
        `Hardcoded route '${route}' in .goto(...). Use route constants from playwright/configs/app/routes.ts.`
      );
    },
  },
  {
    // Trust boundary — never relaxed. Values starting with $ are skipped so
    // environment-variable interpolation passes.
    concern: "no-credential-literal",
    fallback: null,
    pattern:
      /\b(password|passwd|secret|api[_-]?key|auth[_-]?token|access[_-]?token)\s*[:=]\s*["'`]([^"'`$][^"'`]{3,})["'`]/gi,
    messageBuilder: (m, { message }) =>
      message ||
      `Hardcoded credential assigned to '${m[1]}'. Read it from process.env instead; keep the value in .env (gitignored) or a CI secret.`,
  },
  {
    // Config declares this `block` with "Hook + CI" enforcement, so it needs a pattern — a rule
    // that is declared blocking and never fires is worse than an absent rule, because the
    // generated instruction tables advertise protection that does not exist.
    concern: "storage-state-auth",
    fallback:
      "Authentication inside before-hook detected. Use a storageState setup-project dependency so the session is cached once, not replayed per test.",
    appliesTo: (p) => SPEC_RE.test(p),
    pattern:
      /(?:test\.)?before(?:Each|All)\s*\([\s\S]{0,400}?(?:log[iI]n|signIn|sign_in|authenticate)\s*\(/g,
  },
  {
    concern: "storage-state-auth",
    fallback:
      "Credential entry inside before-hook detected. Use a storageState setup-project dependency instead of logging in per test.",
    appliesTo: (p) => SPEC_RE.test(p),
    // The password token usually precedes the fill — `getByLabel("Password").fill(pw)` — so look
    // for either order rather than assuming the value is the literal.
    pattern:
      /(?:test\.)?before(?:Each|All)\s*\([\s\S]{0,400}?(?:(?:password|passwd)[\s\S]{0,80}?\.fill\(|\.fill\(\s*[^)]{0,80}?(?:password|passwd))/gi,
  },
  {
    concern: "smoke-read-only",
    fallback: "Write request in smoke suite. Smoke tests must remain read-only.",
    appliesTo: (p) => SMOKE_SPEC_RE.test(p),
    pattern: /\b(?:request|api)\.(post|put|patch|delete)\s*\(/gi,
  },
  {
    concern: "smoke-read-only",
    fallback: "Write HTTP method in smoke suite. Smoke tests must remain read-only.",
    appliesTo: (p) => SMOKE_SPEC_RE.test(p),
    pattern: /\bmethod\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/gi,
  },
];
