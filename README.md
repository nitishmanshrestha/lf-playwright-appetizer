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
| `one-requirement-tag` | The title survives every reporter and the tag supports filtering; together they make coverage computable. | QA gate |

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
