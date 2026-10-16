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
- **no-sql-literal** (Hook + CI) — never a SQL literal in a spec or helper; use a frozen entry from playwright/configs/db/** passed to the db fixture. A query is the datastore contract. One schema change should mean one config edit, not a grep across specs.
- **focused-or-quarantined-test** (Hook + CI) — never test.only()/test.describe.only(), or skip/fixme without a recorded quarantine; use run focused tests only from the CLI; put // @quarantine ISSUE-123: reason directly above a deliberate skip or fixme. A focused test can hide suite failures, while an unrecorded skip hides risk with no owner.
- **locator-priority** (QA gate) — never skip semantic locators without a reason; use getByRole(), getByLabel(), getByText(), then getByTestId(). Semantic locators are more stable and accessible.
- **narrow-before-index** (QA gate) — never use first() or nth() where a filter can identify the element; use filter({ hasText }) or filter({ has }). Index-based locators silently target the wrong element when the UI changes.
- **search-before-create** (QA gate) — never a new config, helper, or spec without searching first; use search literal selectors, routes, and endpoints by value. Duplicate owners cause the same app change to need multiple fixes.
- **one-requirement-tag** (Hook + CI) — never a test with no requirement tag, more than one, or an unknown id; use exactly one known requirement id in the title and as a tag, plus Type, Priority, and tier tags. The title survives every reporter and the tag supports filtering; together they make coverage computable.

## GSD workflow — required for every task

Work state lives in `.planning/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, phases). Keep one bounded outcome per phase, and keep that phase's stage documents under `.planning/phases/<phase>/`.

Run the delivery pipeline in order, one stage at a time: **PRD -> TEST PLAN -> TEST CASES -> IMPLEMENTATION -> EXECUTION -> DEBUGGING -> EVIDENCE -> VALIDATION -> RELEASE**. Scale each stage to the task — a small change gets a short section — but never skip a stage or a gate.

1. **PRD** (`.planning/phases/<phase>/PRD.md`) — Collect the product requirements from every declared source and reconcile them into one PRD. Record conflicts and gaps between sources instead of resolving them silently. Sources: tickets, confluence, figma, documentation, api. **Gate:** stop for human approval, recorded with `approve --artifact prd`, before the next stage.
2. **Test plan** (`.planning/phases/<phase>/TEST-PLAN.md`) — From the approved PRD, plan the testing in sections by format. For each section say what it covers, which lane owns it, what is out of scope, and the environment and data it needs. Plan sections: backend, frontend, functional, integration, regression, smoke. **Gate:** stop for human approval, recorded with `approve --artifact plan`, before the next stage.
3. **Test cases** (`.planning/phases/<phase>/TEST-CASES.md`) — From the approved plan, write detailed cases that cover each flow end to end. Read the specs and the code, and check existing automation first: mark every case new, extended, or already covered, and never duplicate coverage. Inputs: specs, codebase, existing automation coverage. **Gate:** stop for human approval, recorded with `approve --artifact test-cases`, before the next stage.
4. **Implementation** — Implement only approved cases, following the framework's architecture and rules. Reuse existing commands, helpers, and fixtures before adding new ones. Standards: framework standard, well structured, reusable, maintainable, readable.
5. **Execution** — Run the focused tests first, then the impacted regression checks, using the project's own commands.
6. **Debugging** — Diagnose each failure from its evidence and fix the root cause, not the symptom.
7. **Evidence** — Record the runs as evidence and link every case to its requirement. Without recorded evidence the work is not complete.
8. **Validation** — Reconcile the results against the approved PRD, plan, and cases, and list every gap. An independent reviewer judges this stage, not the author. **Gate:** stop for human approval, recorded with `approve --artifact verification`, before the next stage.
9. **Release** — Prepare release material only. A human decides, performs, or authorises the release: an agent never publishes, merges, or deploys.

Never infer approval from an agent response or from green tests. Changing an approved upstream document (PRD, plan, or cases) invalidates the downstream work and its approvals; re-check it.

Classify each task before planning. Apply every obligation for mixed tasks; if the classification changes scope or risk, stop and clarify rather than dropping a workflow:

- **feature:** acceptance criteria; source context; dependency-aware plan; focused tests; regression impact; verification evidence.
- **defect:** reproduction evidence; source context; regression test; root-cause fix; verification evidence.
- **refactor:** behavior baseline; bounded scope; dependency-aware plan; regression tests; verification evidence.
- **test:** requirement mapping; scenario and test plan; test implementation; focused execution; coverage evidence.
- **docs-config:** scope and owner; source-of-truth mapping; schema or link validation; verification evidence.
- **research:** bounded question; source-backed context; findings and uncertainty; no implementation without a follow-up plan.

Repair a repeated failure at most 2 times without new evidence, then stop and report the blocker. Completion requires recorded verification evidence. Never auto-publish, merge, or perform external side effects.

## PRD sources for this project

- none declared

Collect the PRD from these. Not declared: tickets, confluence, figma, documentation, api — ask the owner whether they exist rather than guessing where they are.

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
