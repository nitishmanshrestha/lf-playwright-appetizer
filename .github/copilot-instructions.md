<!-- GENERATED FROM harness.config.json — DO NOT EDIT. Change harness.config.json, then run npm run harness:sync. npm run harness:check fails on drift. -->

# GitHub Copilot Instructions — playwright-automation-boilerplate

Architecture: **Config → Helpers → Tests**. Read `CLAUDE.md` for the full framework contract and
`docs/application-intelligence/<module>/module-context.md` for what the application does.

## Non-negotiable rules

- **no-hard-wait** (Hook + CI) — never page.waitForTimeout(<number>); use waitForResponse() or a deterministic expect() assertion. A fixed delay hides the real readiness condition and flakes in CI.
- **no-hardcoded-selector** (Hook + CI) — never a selector literal in a spec or helper; use constants from playwright/configs/ui/**. A UI change should have one owner, not scattered copies.
- **no-hardcoded-route** (Hook + CI) — never a route or endpoint literal when config exists; use constants from playwright/configs/app/routes.ts or configs/api/**. Routes and API contracts need one maintained registry.
- **no-page-object** (Hook + CI) — never page-object classes, action layers, or wrappers outside helpers/; use helper-first code in playwright/support/helpers/**. A second UI abstraction duplicates config and helper ownership.
- **no-credential-literal** (Hook + CI) — never a password, secret, API key, or token assigned a literal string; use environment variables loaded from a gitignored .env or CI secret. A committed credential is a breach, not a style issue.
- **storage-state-auth** (Hook + CI) — never login in beforeEach(); use a storageState setup-project dependency. Authentication should be isolated and cached, not repeated in every test.
- **base-fixture-import** (Hook + CI) — never a spec importing test directly from @playwright/test; use test and expect from playwright/fixtures/base.fixture.ts. The fixture is the single injection point for helpers.
- **smoke-read-only** (Hook + CI) — never POST, PUT, PATCH, or DELETE in a smoke spec; use read-only assertions; put mutations in e2e coverage. Smoke coverage must be safe against shared and production-like environments.
- **focused-or-quarantined-test** (Hook + CI) — never test.only()/test.describe.only(), or skip/fixme without a recorded quarantine; use run focused tests only from the CLI; put // @quarantine ISSUE-123: reason directly above a deliberate skip or fixme. A focused test can hide suite failures, while an unrecorded skip hides risk with no owner.
- **locator-priority** (QA gate) — never skip semantic locators without a reason; use getByRole(), getByLabel(), getByText(), then getByTestId(). Semantic locators are more stable and accessible.
- **narrow-before-index** (QA gate) — never use first() or nth() where a filter can identify the element; use filter({ hasText }) or filter({ has }). Index-based locators silently target the wrong element when the UI changes.
- **search-before-create** (QA gate) — never a new config, helper, or spec without searching first; use search literal selectors, routes, and endpoints by value. Duplicate owners cause the same app change to need multiple fixes.
- **one-requirement-tag** (Hook + CI) — never a test with no requirement tag, more than one, or an unknown id; use exactly one known requirement id in the title and as a tag, plus Type, Priority, and tier tags. The title survives every reporter and the tag supports filtering; together they make coverage computable.

Edit and Write tool calls are checked by the generated repository hooks. CI rescans repository
changes as the final backstop; shell commands are not represented as Edit or Write tool calls.

## Agents

- `project-bootstrapper` (GATHER) — Start a new project or module from no existing automation context
- `playwright-test-automation` (BUILD) — Build a requirement-backed helper-first Playwright module
- `playwright-bug-hunter` (DIAGNOSE) — Trace and repair a failing test
- `pre-merge-qa-gate` (EVALUATE) — Evaluate supplied diff and verification evidence and return the final QA verdict
- `playwright-cli` (DISCOVER) — Use CLI-first browser discovery or codegen
- `pr-creator` (SHIP) — Opening a pull request with a generated description
- `workflow-maintainer` (MAINTAIN) — Simplify workflow scripts, agents, skills, or docs

Read/search only by design: the gate cannot edit files or execute shell commands, so the builder never grades its own output.

## Where things live

| Layer | Path |
|---|---|
| Config | `playwright/configs` |
| Helpers | `playwright/support/helpers` |
| Tests | `playwright/tests/**/*.spec.ts` |
