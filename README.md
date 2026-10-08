# Playwright Automation Boilerplate

A clean, application-agnostic Playwright harness using:

```text
Verified context → Approved requirement → Config → Helpers → Tests → Gate → Run → Metrics
```

The repository intentionally ships with zero application requirements and zero tests. AI agents
derive project-specific automation from source evidence; they do not adapt a hidden demo project.

## Start

```bash
npm ci
npm run harness:check
npm run harness:test
npm run check:rules
npm run lint
npm test
npm run evidence:build
```

An empty clone is healthy: Playwright passes with zero tests and metrics report the bootstrap state.

Continue with [From No Project to Test Metrics](docs/START-HERE.md).

## Architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| Harness | `harness.config.json`, `harness/**` | Roles, policy, permissions, quality contract |
| Application intelligence | `docs/application-intelligence/**` | Verified project and module behavior |
| Requirements | `evidence/requirements.json` | Canonical approved scenario registry |
| Config | `playwright/configs/**` | Selectors, routes, APIs, and evidence paths |
| Helpers | `playwright/support/helpers/**` | Reusable behavior and assertions |
| Fixtures | `playwright/fixtures/base.fixture.ts` | Helper injection |
| Tests | `playwright/tests/**` | Thin orchestration |
| Evidence | `evidence/**` | Normalized runs, coverage, and metrics |

## Agent lifecycle

| Role | Agent | Purpose |
| --- | --- | --- |
| GATHER | `project-bootstrapper` | Derive verified project context and requirements |
| DISCOVER | `playwright-cli` | Inspect a verified application surface |
| BUILD | `playwright-test-automation` | Implement one active requirement |
| EVALUATE | `pre-merge-qa-gate` | Independently grade and approve/block |
| DIAGNOSE | `playwright-bug-hunter` | Trace failures to root cause |
| MAINTAIN | `workflow-maintainer` | Keep workflow assets aligned |

Claude and Copilot configurations are generated projections. Edit neutral sources, then run:

```bash
npm run harness:sync
npm run harness:check
```

## Rules

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

<!-- HARNESS:RULES:END -->

## Execution and evidence

```bash
npm run test:smoke
npm run test:e2e
npm run evidence:build
```

Playwright produces HTML, JSON, and JUnit. The evidence script produces a runner-neutral summary,
requirement coverage, and five outcome metrics. Missing upstream evidence is reported as
unavailable, never as a misleading zero.

Paid reporting, browser, or device services are optional.
