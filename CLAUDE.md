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
NEVER  →  page.waitForTimeout(<number>)                                      waitForResponse() or a deterministic expect() assertion
NEVER  →  a selector literal in a spec or helper                             constants from playwright/configs/ui/**
NEVER  →  a route or endpoint literal when config exists                     constants from playwright/configs/app/routes.ts or configs/api/**
NEVER  →  page-object classes, action layers, or wrappers outside helpers/   helper-first code in playwright/support/helpers/**
NEVER  →  a password, secret, API key, or token assigned a literal string    environment variables loaded from a gitignored .env or CI secret
NEVER  →  login in beforeEach()                                              a storageState setup-project dependency
NEVER  →  a spec importing test directly from @playwright/test               test and expect from playwright/fixtures/base.fixture.ts
NEVER  →  POST, PUT, PATCH, or DELETE in a smoke spec                        read-only assertions; put mutations in e2e coverage
NEVER  →  skip semantic locators without a reason                            getByRole(), getByLabel(), getByText(), then getByTestId()
NEVER  →  use first() or nth() where a filter can identify the element       filter({ hasText }) or filter({ has })
NEVER  →  a new config, helper, or spec without searching first              search literal selectors, routes, and endpoints by value
NEVER  →  a test with no requirement tag, more than one, or an unknown id    exactly one known requirement id in the title and as a tag, plus Type, Priority, and tier tags
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
| `locator-priority` | Semantic locators are more stable and accessible. | QA gate |
| `narrow-before-index` | Index-based locators silently target the wrong element when the UI changes. | QA gate |
| `search-before-create` | Duplicate owners cause the same app change to need multiple fixes. | QA gate |
| `one-requirement-tag` | The title survives every reporter and the tag supports filtering; together they make coverage computable. | Hook + CI |

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
