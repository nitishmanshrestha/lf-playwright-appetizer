# Playwright Boilerplate Appetizer — Copilot Instructions

Preferred Model: Claude Sonnet

## Scope

This is the stripped-down version of the Playwright automation boilerplate.
Only two workflows are active here:

1. **CLI/MCP test generation** — scaffold Config → Helpers → Tests from codegen or MCP discovery
2. **DDT evaluation** — identify data-driven candidates and scaffold JSON fixtures + spec loops

All other agents, workflows, and scaffolding are intentionally excluded.

---

## Output Contract (Highest Priority)

- Default to implementation over explanation.
- Return production-ready code.
- Return complete snippets, not pseudocode.
- Show only changed files.
- Do not generate alternative solutions unless requested.

---

## Architecture Policy (Mandatory)

Framework pattern: **Config → Helpers → Tests**

- New work must be helper-first.
- Tests import `test` and `expect` from `playwright/fixtures/base.fixture.ts`.
- Destructure helpers directly from fixtures.
- Reuse before creating.

### Prohibited

- Page-object classes duplicating helper/config responsibilities.
- Action layers.
- Utility wrappers outside `helpers/`.
- Duplicate framework assets.

---

## Non-Negotiable Rules

### Selectors

Priority order:

1. `getByRole()`
2. `getByLabel()`
3. `getByText()`
4. `getByTestId()`

- Prefer locator filtering (`filter({ hasText })`, `filter({ has })`)
- CSS/XPath chains are last resort only
- Use config selectors when available
- Avoid hardcoded literals

### Async / API

- Prefer `api.stub()` and `api.intercept()`
- Never use `page.waitForTimeout()`
- Prefer deterministic assertions

---

## DDT Standards

Use JSON-driven tests with `for...of` loops.

- Data lives in: `playwright/testdata/<module>/*.json`
- Include assertion values in test data
- Avoid hardcoded assertions
- Place tests in existing `smoke/` or `e2e/` folders
- Use template literals for test names: `test(\`test for ${item.name}\`)`

---

## Required Context Review

Before generating or modifying code, review:

- `playwright/configs/app/routes.ts`
- `playwright/configs/ui/modules/**`
- `playwright/configs/ui/shared/**`
- `playwright/configs/api/**`

Do not hardcode URLs, selectors, or API endpoints when configuration exists.

---

## Agent Routing

- Test generation (CLI) → `.github/prompts/cli/scaffold-with-cli.prompt.md`
- Test generation (no MCP) → `.github/prompts/cli/scaffold-no-mcp.prompt.md`
- Test generation (MCP) → `.github/prompts/mcp/scaffold-with-mcp.prompt.md`
- DDT identification → `identify-ddt-candidates` skill
- CLI workflow → `playwright-cli-workflow` skill
- Browser automation → `playwright-cli` agent
