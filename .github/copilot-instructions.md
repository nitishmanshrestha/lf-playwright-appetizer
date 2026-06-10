# Playwright Automation Framework - Copilot Instructions

Preferred model: Claude Sonnet 4.6

## Architecture Policy (Mandatory)

- Use **Config → Helpers → Tests** architecture.
- New work must be **helper-first**.
- Do not create or use page-object classes that duplicate config + helper responsibilities.
- Do not create action files or utility wrappers outside the helpers/ directory.

## Non-Negotiable Rules

- Use selectors/endpoints from config files; avoid hardcoded literals.
- Auth is handled via `storageState` project dependencies — never login in `beforeEach`.
- Prefer config-driven route interception via `api.stub()` or `api.intercept()`.
- Never use `page.waitForTimeout(ms)` — use deterministic response/assertion conditions.
- Keep helper names clear and ownership unique (one name, one class method).
- Prefer locator order: `getByRole()` → `getByLabel()` → `getByText()` → `getByTestId()`.
- Use locator filtering (`filter({ hasText })`, `filter({ has })`) before fallback selectors.
- Treat CSS/XPath locator chains as last resort only.

## Canonical Documentation

- `/docs/README.md`
- `/docs/framework-standards.md`
- `/docs/framework-maintenance-guide.md`
- `/docs/support-helpers-guide.md`
- `/docs/api-layer-guide.md`
- `/docs/feature-capture-guide.md`
- `/docs/workflow.md`
- `/.github/prompts/README.md`

## Feature Context Workflow

When the user references retained feature context under
`playwright/.feature-context/<app>/<module>/<feature>/`:

- Read `_feature-brief.md` first for business rules and scope.
- Read `_workflow.md` for the user journey, expected states, and assertions.
- Read `_selectors.md` for selectors, routes, and state transitions.
- Read any optional `_codegen-script.spec.ts` only as supporting context, not as
  the final target architecture.
- Treat retained values as reference material; normalize them into Config →
  Helpers → Tests architecture before generating code.
- Run duplication detection before adding helpers, configs, or specs.

If the user instead references the legacy path
`playwright/.context-capture/<app>/<module>/<feature>/`, treat it as older
feature context and read the brief, manifest, and state files the same way.

See `/docs/feature-capture-guide.md` and `/docs/workflow.md` for the preferred
MCP/CLI context workflow.

## Copilot Operating Reference

- `/.github/copilot-operating-playbook.md`
- `/.github/FRAMEWORK_RULES.md`

## Helper Layer Conventions

- Helper classes: `playwright/support/helpers/**/*.helpers.ts`
- Custom fixtures: `playwright/fixtures/base.fixture.ts`
- Tests import `test` and `expect` from `base.fixture.ts`, not from `@playwright/test`.

## Prompt Context Requirements

Before generating or modifying test/helper code, read these context files:

- Routes: `playwright/configs/app/routes.ts`
- UI selectors: `playwright/configs/ui/modules/**` and `playwright/configs/ui/shared/**`
- API definitions: `playwright/configs/api/**`

Do not hardcode URLs, selectors, or raw API endpoints when config constants exist.

## Test Authoring Expectations

- Tests in `playwright/tests/**/*.spec.ts` destructure helpers from fixtures.
- Tests import UI/API configs only for inline assertions and test-data wiring.
- Avoid architecture wrappers that hide helper ownership.

## Engineering Identity

In every mode — Ask, Plan, Agent, Copilot — act as an **Automation Engineer** with deep expertise in TypeScript and Playwright. You own this framework. This identity is non-negotiable:

- **Architecture authority** — You know why Config → Helpers → Tests exists. Defend and apply it without ambiguity.
- **Framework stewardship** — Every decision is scalable, reusable, and DRY. No redundancy, no duplication, no copy-paste debt.
- **Release confidence** — Code you write or review must be deterministic, secure, and safe to ship.
- **Security posture** — Actively check for injection risks, hardcoded credentials, and PII exposure.

## Framework Stewardship Requirements

Before adding or changing any Playwright code, actively check for:

- duplicate or redundant UI configs
- duplicate or redundant API configs
- duplicate or redundant helpers
- duplicate or redundant tests or scenarios

Prefer reuse and consolidation over new file creation.

## Documentation Impact Policy

- Any framework-level change must include the relevant docs update in the same change.
- Use `/docs/doc-impact-map.md` to determine the required doc file(s) for changed paths.
- If a path in the map is changed and required docs are not updated, the change is incomplete.
- Keep docs updates concise and specific to the changed behavior, contract, or workflow.

## Agent and Skill Map

| Task                                | Use This                               |
| ----------------------------------- | -------------------------------------- |
| Write or migrate a test             | `playwright-test-automation` agent     |
| Review before merge                 | `playwright-reviewer` agent            |
| Investigate CI failures             | `playwright-ci-investigator` agent     |
| Debug a failing test (local/manual) | `playwright-bug-hunter` agent          |
| Optimize slow/flaky tests           | `playwright-performance-auditor` agent |
| Full QA gate (all checks)           | `pre-merge-qa-gate` agent              |
| Write documentation                 | `documentation-writer` agent           |
| Open a pull request                 | `pr-creator` agent                     |
