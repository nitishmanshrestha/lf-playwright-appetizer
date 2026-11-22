# Playwright Harness Instructions

This repository is an empty, application-agnostic QA harness. Do not invent an application,
requirement, selector, route, credential, or expected result.

## Source precedence

1. `harness.config.json` — harness roles, tools, limits, and rules.
2. `harness/qa-automation-foundations.md` — shared test-quality and grading contract.
3. `evidence/requirements.json` — approved requirements.
4. `docs/application-intelligence/**` — verified project and module behavior.
5. `playwright/configs/**` — selectors, routes, APIs, and evidence paths.
6. `playwright/support/helpers/**` — reusable implementation.
7. `playwright/fixtures/base.fixture.ts` — helper injection.
8. `playwright/tests/**` — thin executable orchestration.

When sources disagree, stop and report the conflict. Tests do not redefine business behavior.

## Lifecycle

Use `project-bootstrapper` before `playwright-test-automation` for every new project or module.

```text
GATHER → SPECIFY → DISCOVER → BUILD → GUARD → EVALUATE → EXECUTE → DIAGNOSE → MEASURE
```

- GATHER creates verified project/module context and draft requirements.
- The owner approves requirements and promotes them to `active`.
- DISCOVER validates selectors and browser behavior without defining business intent.
- BUILD accepts exactly one active requirement id.
- EVALUATE is read-only and supplies the merge verdict.
- Repairs are bounded by `loops.gateRepairLimit`.

The complete procedure is [`docs/START-HERE.md`](docs/START-HERE.md).

## Architecture

```text
playwright/configs/** → playwright/support/helpers/** → base.fixture.ts → playwright/tests/**
```

- Config owns selectors, routes, endpoints, and immutable constants.
- Helpers own navigation, waits, interactions, reusable assertions, and cleanup.
- Fixtures inject helpers without hiding state.
- Tests contain one behavior and read as orchestration.
- Every test title begins `[REQUIREMENT-ID]` and carries matching requirement, Type, Priority, and
  tier tags.

## Non-negotiable rules

<!-- HARNESS:RULES:START -->
<!-- Generated from harness.config.json — run `npm run harness:sync`. Do not edit by hand. -->

```text
NEVER  →  page.waitForTimeout(<number>)                                                   waitForResponse() or a deterministic expect() assertion
NEVER  →  a selector literal in a spec or helper                                          constants from playwright/configs/ui/**
NEVER  →  a route or endpoint literal when config exists                                  constants from playwright/configs/app/routes.ts or configs/api/**
NEVER  →  page-object classes, action layers, or wrappers outside helpers/                helper-first code in playwright/support/helpers/**
NEVER  →  a password, secret, API key, or token assigned a literal string                 environment variables loaded from a gitignored .env or CI secret
NEVER  →  login in beforeEach()                                                           a storageState setup-project dependency
NEVER  →  a spec importing test directly from @playwright/test                            test and expect from playwright/fixtures/base.fixture.ts
NEVER  →  POST, PUT, PATCH, or DELETE in a smoke spec                                     read-only assertions; put mutations in e2e coverage
NEVER  →  a SQL literal in a spec or helper                                               a frozen entry from playwright/configs/db/** passed to the db fixture
NEVER  →  test.only()/test.describe.only(), or skip/fixme without a recorded quarantine   run focused tests only from the CLI; put // @quarantine ISSUE-123: reason directly above a deliberate skip or fixme
NEVER  →  skip semantic locators without a reason                                         getByRole(), getByLabel(), getByText(), then getByTestId()
NEVER  →  use first() or nth() where a filter can identify the element                    filter({ hasText }) or filter({ has })
NEVER  →  a new config, helper, or spec without searching first                           search literal selectors, routes, and endpoints by value
NEVER  →  a test with no requirement tag, more than one, or an unknown id                 exactly one known requirement id in the title and as a tag, plus Type, Priority, and tier tags
```

| Rule | Why it exists | Enforcement |
|---|---|---|
| `no-hard-wait` | A fixed delay hides the real readiness condition and flakes in CI. | Hook + CI |
| `no-hardcoded-selector` | A UI change should have one owner, not scattered copies. | Hook + CI |
| `no-hardcoded-route` | Routes and API contracts need one maintained registry. | Hook + CI |
| `no-page-object` | A second UI abstraction duplicates config and helper ownership. | Hook + CI |
| `no-credential-literal` | A committed credential is a breach, not a style issue. | Hook + CI |
| `storage-state-auth` | Authentication should be isolated and cached, not repeated in every test. | Hook + CI |
| `base-fixture-import` | The fixture is the single injection point for helpers. | Hook + CI |
| `smoke-read-only` | Smoke coverage must be safe against shared and production-like environments. | Hook + CI |
| `no-sql-literal` | A query is the datastore contract. One schema change should mean one config edit, not a grep across specs. | Hook + CI |
| `focused-or-quarantined-test` | A focused test can hide suite failures, while an unrecorded skip hides risk with no owner. | Hook + CI |
| `locator-priority` | Semantic locators are more stable and accessible. | QA gate |
| `narrow-before-index` | Index-based locators silently target the wrong element when the UI changes. | QA gate |
| `search-before-create` | Duplicate owners cause the same app change to need multiple fixes. | QA gate |
| `one-requirement-tag` | The title survives every reporter and the tag supports filtering; together they make coverage computable. | Hook + CI |

## GSD workflow — required for every task

Work state lives in `.planning/` (PROJECT.md, REQUIREMENTS.md, ROADMAP.md, STATE.md, phases). Keep one bounded outcome per phase, and keep that phase's stage documents under `.planning/phases/<phase>/`.

Run the test-development pipeline in order, one stage at a time: **REQUIREMENTS AND SCOPE -> SCENARIOS -> TEST PLAN -> TEST CASES -> IMPLEMENTATION -> EXECUTION -> DEBUGGING -> EVIDENCE -> VALIDATION -> RELEASE**. Scale each stage to the task — a small change gets a short section — but never skip a stage or a gate.

1. **Requirements and scope** (`.planning/phases/<phase>/PRD.md`) — Collect the product requirements from every declared source and reconcile them into one PRD that fixes the scope. Record conflicts and gaps between sources instead of resolving them silently. Sources: tickets, confluence, figma, documentation, api. **Gate G0:** stop for human approval before the next stage. The human records it in an interactive terminal with `node scripts/gates.mjs approve --phase-dir <phase> G0 <artifact>...`; GSD checks it at `discuss:post`.
2. **Scenarios** (`.planning/phases/<phase>/SCENARIOS.md`) — From the approved scope, list the happy, negative, and edge scenarios. Each one cites its acceptance criterion and the source that shows the behavior. **Gate G1:** stop for human approval before the next stage. The human records it in an interactive terminal with `node scripts/gates.mjs approve --phase-dir <phase> G1 <artifact>...`; GSD checks it at `plan:pre`.
3. **Test plan** (`.planning/phases/<phase>/TEST-PLAN.md`) — From the approved scenarios, plan the testing in sections by format. For each section say what it covers, which lane owns it, what is out of scope, and the environment and data it needs. Plan sections: backend, frontend, functional, integration, regression, smoke. **Gate G2:** stop for human approval before the next stage. The human records it in an interactive terminal with `node scripts/gates.mjs approve --phase-dir <phase> G2 <artifact>...`; GSD checks it at `plan:post`.
4. **Test cases** (`.planning/phases/<phase>/TEST-CASES.md`) — From the approved plan, write detailed cases that cover each flow end to end. Read the specs and the code, and check existing automation first: mark every case new, extended, or already covered, and never duplicate coverage. Inputs: specs, codebase, existing automation coverage. **Gate G3:** stop for human approval before the next stage. The human records it in an interactive terminal with `node scripts/gates.mjs approve --phase-dir <phase> G3 <artifact>...`; GSD checks it at `plan:post`.
5. **Implementation** — Implement only approved cases, following the framework's architecture and rules. Reuse existing commands, helpers, and fixtures before adding new ones. A human approves the exact diff, every changed file, before any test runs against it. Standards: framework standard, well structured, reusable, maintainable, readable. **Gate G4:** stop for human approval before the next stage. The human records it in an interactive terminal with `node scripts/gates.mjs approve --phase-dir <phase> G4 <artifact>...`; GSD checks it at `execute:wave:post`.
6. **Execution** — With G4 holding, run the focused tests first, then the impacted regression checks, using the project's own commands.
7. **Debugging** — Diagnose each failure from its evidence and fix the root cause, not the symptom. A fix changes the approved diff, so G4 is approved again before the rerun.
8. **Evidence** — Record the runs as evidence and link every case to its requirement. A human approves the evidence; without it the work is not complete. **Gate G5:** stop for human approval before the next stage. The human records it in an interactive terminal with `node scripts/gates.mjs approve --phase-dir <phase> G5 <artifact>...`; GSD checks it at `ship:pre`.
9. **Validation** — Reconcile the results against the approved scope, scenarios, plan, and cases, and list every gap. An independent reviewer judges this stage, not the author.
10. **Release** — With G5 holding, prepare release material only. A human decides, performs, or authorises the release: an agent never publishes, merges, or deploys.

GSD Core 1.14.0 runs this pipeline (`/gsd-discuss-phase` → `/gsd-plan-phase` → `/gsd-execute-phase` → `/gsd-verify-work` → `/gsd-ship`), and its `qa-harness` capability blocks the loop at each gate. `node scripts/gates.mjs status --phase-dir <phase>` shows every gate and the next command.

Never infer approval from an agent response or from green tests. Changing an approved artifact reopens its gate and every gate after it; re-check it.

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

<!-- HARNESS:RULES:END -->

## Empty state

Zero tests is valid before project intake. `npm test -- --list` and `npm test` must pass, and
`npm run evidence:build` must produce bootstrap metrics with explicit unavailable reasons.

## Verification

```bash
npm run verify
```

Runs `harness:check` → `harness:test` → `harness:format:check` → `check:rules` → `tsc --noEmit` →
`npm test` (with `lint` via `pretest`) → `evidence:build`. Run them individually to isolate a failure.

Do not claim execution, coverage, or a metric without the corresponding command or source
evidence. Optional paid services cannot be required for the baseline workflow — CI is a backstop for
human-authored code, not the enforcement point. The write-time hooks are, and they cost nothing.
