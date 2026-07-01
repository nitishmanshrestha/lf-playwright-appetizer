# Playwright Automation Framework - Copilot Instructions

Preferred Model: Claude 3.5 Sonnet

## Output Contract (Highest Priority)

### Code-First Responses

- Default to implementation over explanation.
- Generate code before rationale.
- Keep explanations under 20% of total response length.
- Do not explain Playwright fundamentals.
- Do not provide educational walkthroughs unless requested.
- Do not restate requirements.

### Code Generation Rules

- Return production-ready code.
- Return complete snippets, not pseudocode.
- Show only changed files.
- Prefer diffs or file-based outputs.
- Do not generate alternative solutions unless requested.
- Choose the framework-compliant implementation and proceed.

### Token Allocation

Target:

- 80–90% code
- 10–20% explanation

When architecture violations exist:

- Fix the issue.
- Briefly explain the violation.
- Continue with implementation.

---

## Architecture Policy (Mandatory)

Framework pattern:

Config → Helpers → Tests

### Requirements

- New work must be helper-first.
- Tests import `test` and `expect` from:
  `playwright/fixtures/base.fixture.ts`
- Destructure helpers directly from fixtures.
- Reuse before creating.

### Prohibited

- Page-object classes duplicating helper/config responsibilities.
- Action layers.
- Utility wrappers outside `helpers/`.
- Duplicate framework assets.

### Asset Creation Priority

Always prefer:

1. Reuse existing config
2. Reuse existing helper
3. Extend existing helper
4. Create new helper
5. Create new test

Never create a new asset when an existing one can be extended.

---

## Non-Negotiable Rules

### Selectors

Priority order:

1. `getByRole()`
2. `getByLabel()`
3. `getByText()`
4. `getByTestId()`

Rules:

- Prefer locator filtering (`filter({ hasText })`, `filter({ has })`)
- CSS/XPath chains are last resort only
- Use config selectors when available
- Avoid hardcoded literals

### Authentication

- Auth uses `storageState` project dependencies
- Never login in `beforeEach`

### Async / API

- Prefer `api.stub()` and `api.intercept()`
- Never use `page.waitForTimeout()`
- Prefer deterministic assertions

---

## DDT Standards

Use JSON-driven tests with `for...of` loops.

### Data

`playwright/testdata/<module>/*.json`

### Rules

- Include assertion values in test data
- Avoid hardcoded assertions
- Place tests in existing `smoke/` or `e2e/` folders
- Use template literals for test names

Example:

`test(\`test for ${item}`)`

Reference:

`/docs/02-guides/data-driven-testing.md`

---

## Required Context Review

Before generating or modifying code, review:

- `playwright/configs/app/routes.ts`
- `playwright/configs/ui/modules/**`
- `playwright/configs/ui/shared/**`
- `playwright/configs/api/**`

Do not hardcode:

- URLs
- Selectors
- API endpoints

when configuration exists.

---

## Feature Context Workflow

When feature context exists:

`playwright/.feature-context/**`

Read in order:

1. `_feature-brief.md`
2. `_workflow.md`
3. `_selectors.md`

Legacy:

`playwright/.context-capture/**`

Normalize all outputs into:

Config → Helpers → Tests

Before creating assets, check for duplicate:

- configs
- helpers
- tests

Prefer consolidation over creation.

---

## Framework Stewardship

Act as a Principal Automation Engineer.

Enforce:

- Config → Helpers → Tests
- DRY implementation
- Deterministic execution
- Reuse-first development
- No flaky patterns
- No duplicate assets
- No hardcoded credentials
- No PII exposure
- No injection risks

---

## Documentation Impact

Framework-level changes require documentation updates.

Use:

`/docs/doc-impact-map.md`

If impacted documentation is not updated, the change is incomplete.

---

## Primary References

- `/.github/FRAMEWORK_RULES.md`
- `/.github/copilot-operating-playbook.md`
- `/docs/framework-standards.md`
- `/docs/workflow.md`

---

## Prompt Routing

When a user asks "how do I get started", "set up a new module", "scaffold my first test", "add a module for my app", or "I want to test my app":
→ Use `.github/prompts/onboard-your-app.prompt.md`

When a user wants to replace saucedemo/example entirely with their own app:
→ Use `.github/prompts/adapt-boilerplate.prompt.md`

---

## Agent Routing

- New module scaffold → `.github/prompts/onboard-your-app.prompt.md`
- Test implementation → `playwright-test-automation`
- Browser automation → `playwright-cli`
- Pre-merge review → `playwright-reviewer`
- CI failures → `playwright-ci-investigator`
- Local debugging → `playwright-bug-hunter`
- Flakiness/performance → `playwright-performance-auditor`
- DDT identification → `identify-ddt-candidates`
- Workflow/docs → `workflow-maintainer`
- QA validation → `pre-merge-qa-gate`
- Documentation → `documentation-writer`
- Pull requests → `pr-creator`
