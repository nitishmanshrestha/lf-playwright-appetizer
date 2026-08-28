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

import {
  SCRIPT_EXT,
  escapeRegex,
  extractBalancedObject,
  isAllowedLiteral,
  lineNumberForIndex,
  readProjectPaths,
} from "./rule-engine.mjs";
import { codeSuffixesFor, scanRootsFor } from "../../harness/patterns.mjs";

// Roots come from the composed config, so a project can declare its own tree. See
// readProjectPaths for why this derivation is safe and what asserts it.
const project = readProjectPaths(import.meta.url);
const { testRoot, commandRoot, pattern } = project;
const ROOT = escapeRegex(testRoot);
const COMMAND_ROOT = escapeRegex(commandRoot.replaceAll("\\", "/"));

// This adapter's name for each pattern-level file kind (L3). A kind this framework has no
// convention for is simply absent from the map and drops out — which is how a pattern can name
// `steps` or `page` without every adapter having to invent a suffix for it.
const KIND_SUFFIX = {
  spec: "spec",
  helpers: "helpers",
  fixture: "fixture",
  setup: "setup",
  page: "page",
  steps: "steps",
  data: "data",
};

// Which files the implementation rules scan is an architecture question, not a framework one. A POM
// project keeps its selectors in page objects, so `page` must count as code there or the selector
// rule is declared and never fires where it matters.
const codeSuffixes = codeSuffixesFor(pattern, KIND_SUFFIX);

// Scope covers the test root plus any architecture-specific roots the project declared, such as a
// BDD project's step definitions sitting outside testRoot.
const SCAN_ROOTS = scanRootsFor(pattern, project)
  .map((root) => escapeRegex(root))
  .join("|");

const SPEC_RE = new RegExp(String.raw`\.spec\.${SCRIPT_EXT}$`, "i");
const CODE_RE = new RegExp(String.raw`\.(${codeSuffixes.join("|")})\.${SCRIPT_EXT}$`, "i");
const PAGE_OBJECT_RE = new RegExp(String.raw`\.(?:page|actions)\.${SCRIPT_EXT}$`, "i");
const SMOKE_SPEC_RE = new RegExp(
  String.raw`${ROOT}[\\/]tests[\\/].*[\\/]smoke[\\/].*\.spec\.${SCRIPT_EXT}$`,
  "i",
);
const TARGET_FILE_RE = new RegExp(String.raw`(?:${SCAN_ROOTS})[\\/].*\.${SCRIPT_EXT}$`, "i");
const HELPERS_ROOT_RE = new RegExp(String.raw`^${COMMAND_ROOT}/`, "i");
const TESTS_SPEC_RE = new RegExp(String.raw`${ROOT}[\\/]tests[\\/].*\.spec\.${SCRIPT_EXT}$`, "i");

// Requirement id shape, e.g. PAY-CHECKOUT-001 or REQ-1: uppercase segments joined by hyphens.
const REQUIREMENT_ID = /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+$/;
const TYPE_TAGS = new Set(["smoke", "regression"]);
const PRIORITY_TAGS = new Set(["P0", "P1", "P2"]);
const TIERS = ["smoke", "e2e", "ddt"];

export const EXTENSION_PATTERNS = {
  SCRIPT_EXT,
  TARGET_FILE_RE,
  SPEC_RE,
  CODE_RE,
  PAGE_OBJECT_RE,
  SMOKE_SPEC_RE,
};

export const targetFileRe = TARGET_FILE_RE;

// Framework idiom, exported for engine scripts that need to find test titles without knowing
// which framework they are in. Group 2 is the [REQUIREMENT-ID] prefix.
// Playwright's test call is `test(...)`, where Cypress uses `it`/`specify` -- the reason this
// belongs to the adapter and not to the engine.
export const testTitleRe = /\btest(?:\.\w+)?\s*\(\s*(['"`])\s*\[([^\]]+)\][\s\S]*?\1/g;

export const rules = [
  {
    ruleId: "no-hard-wait",
    fallback: "Hard wait detected. Replace with waitForResponse(...) or an expect() assertion.",
    pattern: /\bwaitForTimeout\(\s*\d+\s*\)/g,
  },
  {
    ruleId: "no-page-object",
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
    ruleId: "no-page-object",
    fallback:
      "Page-object import detected. Helper-first architecture forbids page-object dependencies.",
    pattern: /from\s+['"][^'"]*(page-obj|pageobject|page-object|\/pages\/)[^'"]*['"]/gi,
  },
  {
    // The fixture is the single injection point for helpers, so a spec that imports test
    // directly from @playwright/test silently loses every one of them.
    ruleId: "base-fixture-import",
    fallback:
      "Spec imports from '@playwright/test'. Import test/expect from fixtures/base.fixture instead.",
    appliesTo: (p) => SPEC_RE.test(p),
    pattern: /import\s+[^;]*\bfrom\s+['"]@playwright\/test['"]/g,
  },
  {
    ruleId: "no-hardcoded-selector",
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
    ruleId: "no-hardcoded-route",
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
    ruleId: "no-credential-literal",
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
    ruleId: "storage-state-auth",
    fallback:
      "Authentication inside before-hook detected. Use a storageState setup-project dependency so the session is cached once, not replayed per test.",
    appliesTo: (p) => SPEC_RE.test(p),
    pattern:
      /(?:test\.)?before(?:Each|All)\s*\([\s\S]{0,400}?(?:log[iI]n|signIn|sign_in|authenticate)\s*\(/g,
  },
  {
    ruleId: "storage-state-auth",
    fallback:
      "Credential entry inside before-hook detected. Use a storageState setup-project dependency instead of logging in per test.",
    appliesTo: (p) => SPEC_RE.test(p),
    // The password token usually precedes the fill — `getByLabel("Password").fill(pw)` — so look
    // for either order rather than assuming the value is the literal.
    pattern:
      /(?:test\.)?before(?:Each|All)\s*\([\s\S]{0,400}?(?:(?:password|passwd)[\s\S]{0,80}?\.fill\(|\.fill\(\s*[^)]{0,80}?(?:password|passwd))/gi,
  },
  {
    ruleId: "focused-or-quarantined-test",
    fallback:
      "Focused test or unrecorded quarantine. Remove .only; a skip/fixme needs // @quarantine ISSUE-123: reason directly above it.",
    appliesTo: (p) => TESTS_SPEC_RE.test(p),
    check: ({ content, message, push }) => {
      const selectionRe = /\btest(?:\.describe)?\.(only|skip|fixme)\s*\(/g;
      let match;
      while ((match = selectionRe.exec(content)) !== null) {
        const lineNumber = lineNumberForIndex(content, match.index);
        if (match[1] === "only") {
          push(lineNumber, `${message} (.only is never permitted.)`);
          continue;
        }
        const lineStart = content.lastIndexOf("\n", match.index - 1) + 1;
        const before = content.slice(0, lineStart).replace(/\r?\n$/, "");
        const previousLine = before.slice(before.lastIndexOf("\n") + 1);
        if (!/^\s*\/\/\s*@quarantine\s+[A-Z][A-Z0-9]*-\d+\s*:\s*\S.*\s*$/.test(previousLine)) {
          push(
            lineNumber,
            `${message} (add the quarantine record directly above this skip/fixme.)`,
          );
        }
      }
    },
  },
  {
    // Exactly one requirement tag per test, plus one Type and one Priority tag, with the title
    // requirement id matching the requirement tag. Structural and single-file: whether the id is
    // *active* and unique across the repository is graded by evidence:build and check:requirements,
    // which see cross-file state a write-time hook cannot.
    //
    // This adapter used to declare the rule `review` at the QA gate with no pattern behind it and no
    // ratchet date — an open-ended ramp, which the spec does not allow, and the reason coverage was
    // computable by enforcement in Cypress and not here. Implemented rather than excused because
    // this boilerplate ships zero specs: enforcing costs nothing today and gets expensive later.
    ruleId: "one-requirement-tag",
    fallback: "Test must carry exactly one known requirement id in its title and tags.",
    appliesTo: (p) => TESTS_SPEC_RE.test(p),
    check: ({ filePath, content, message, push }) => {
      const testCallRe = /\btest(?:\.\w+)?\s*\(\s*(['"`])([\s\S]*?)\1/g;
      let match;
      while ((match = testCallRe.exec(content)) !== null) {
        const lineNumber = lineNumberForIndex(content, match.index);
        const title = String(match[2] || "");
        let cursor = testCallRe.lastIndex;
        while (/\s/.test(content[cursor] || "")) cursor += 1;
        if (content[cursor] === ",") cursor += 1;
        while (/\s/.test(content[cursor] || "")) cursor += 1;
        const options = extractBalancedObject(content, cursor);

        // Playwright's own option is `tag`, and it takes a string or an array. A single string is
        // valid syntax and always insufficient here, so both forms are parsed rather than only the
        // one the convention uses.
        const arrayMatch = options.match(/\btag\s*:\s*\[([^\]]*)\]/);
        const singleMatch = options.match(/\btag\s*:\s*(['"`])([^'"`]+)\1/);
        const tags = arrayMatch
          ? [...arrayMatch[1].matchAll(/['"`]([^'"`]+)['"`]/g)].map((m) => m[1].trim())
          : singleMatch
            ? [singleMatch[2].trim()]
            : [];

        const bare = (tag) => tag.replace(/^@/, "");
        const titleId = title.match(/^\s*\[([^\]]+)\]/)?.[1]?.trim() ?? null;
        const typeTags = tags.filter((t) => TYPE_TAGS.has(bare(t).toLowerCase()));
        const priorityTags = tags.filter((t) => PRIORITY_TAGS.has(bare(t).toUpperCase()));
        const requirementTags = tags.filter(
          (t) =>
            !TYPE_TAGS.has(bare(t).toLowerCase()) &&
            !PRIORITY_TAGS.has(bare(t).toUpperCase()) &&
            REQUIREMENT_ID.test(bare(t)),
        );
        const pathTier = TIERS.find((tier) => filePath.split("/").includes(tier));
        const tierTags = pathTier ? tags.filter((t) => bare(t).toLowerCase() === pathTier) : [];

        const problems = [];
        if (!titleId || !REQUIREMENT_ID.test(titleId)) {
          problems.push("title must begin with a [REQUIREMENT-ID] prefix");
        }
        if (requirementTags.length !== 1) {
          problems.push(`expected exactly one requirement id tag, found ${requirementTags.length}`);
        }
        if (typeTags.length !== 1) {
          problems.push(
            `expected exactly one Type tag (@smoke or @regression), found ${typeTags.length}`,
          );
        }
        if (priorityTags.length !== 1) {
          problems.push(
            `expected exactly one Priority tag (@P0/@P1/@P2), found ${priorityTags.length}`,
          );
        }
        if (pathTier && tierTags.length !== 1) {
          problems.push(
            `expected exactly one tier tag (@${pathTier}) for the ${pathTier} path, found ${tierTags.length}`,
          );
        }
        if (titleId && requirementTags.length === 1 && bare(requirementTags[0]) !== titleId) {
          problems.push(
            `title id [${titleId}] does not match requirement tag ${requirementTags[0]}`,
          );
        }
        if (problems.length > 0) {
          push(lineNumber, `${message} (${problems.join("; ")})`);
        }
      }
    },
  },
  {
    ruleId: "smoke-read-only",
    fallback: "Write request in smoke suite. Smoke tests must remain read-only.",
    appliesTo: (p) => SMOKE_SPEC_RE.test(p),
    pattern: /\b(?:request|api)\.(post|put|patch|delete)\s*\(/gi,
  },
  {
    ruleId: "smoke-read-only",
    fallback: "Write HTTP method in smoke suite. Smoke tests must remain read-only.",
    appliesTo: (p) => SMOKE_SPEC_RE.test(p),
    pattern: /\bmethod\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/gi,
  },
];
