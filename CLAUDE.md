# Playwright Boilerplate Apetizer — Claude Code

> Stripped-down Playwright framework with one focus: generate production-ready tests fast via CLI/MCP, and evaluate DDT candidates automatically.

---

## Scope

Two workflows are active:

1. **CLI/MCP test generation** — explore the app, capture selectors and flows, scaffold Config → Helpers → Tests
2. **DDT evaluation** — classify captured flows as data-driven candidates, generate JSON fixtures and spec loops

---

## Discovery Workflow

Never write tests without first exploring the application.

```
☐ 1. Run: npm run context:codegen
☐ 2. Explore all pages in the app
☐ 3. Record key user flows
☐ 4. Copy generated code / selector notes
☐ 5. Run: npm run scaffold:flow -- --module <m> --feature <f> --capture capture.json
☐ 6. Review generated files and fill in helper logic
☐ 7. Run tests: npm test
```

---

## Architecture

```
Config → Helpers → Tests
```

| Layer   | Location                        | Rule                                 |
| ------- | ------------------------------- | ------------------------------------ |
| Config  | `playwright/configs/**`         | Pure data — `as const`, no logic     |
| Helpers | `playwright/support/helpers/**` | Async classes — one owner per module |
| Tests   | `playwright/tests/**/*.spec.ts` | Thin orchestration only              |

---

## Non-Negotiable Rules

```
NEVER  →  page.waitForTimeout(ms)
NEVER  →  hardcoded selectors            Use playwright/configs/ui/**
NEVER  →  hardcoded endpoints/routes     Use playwright/configs/api/** and routes.ts
NEVER  →  page-object classes            Helper-first only
NEVER  →  real credentials in code       Use .env
NEVER  →  import from @playwright/test   In spec files — use base.fixture.ts

ALWAYS →  storageState for auth          Via project dependency
ALWAYS →  config constants               Before adding any selector
ALWAYS →  one helper = one owner         Verify uniqueness
```

---

## Generation Commands

| Command                                                                      | What it does                                 |
| ---------------------------------------------------------------------------- | -------------------------------------------- |
| `npm run context:codegen`                                                    | Open Playwright Codegen for manual recording |
| `npm run scaffold:flow -- --module <m> --feature <f> --capture capture.json` | Generate guided DDT scaffold from capture    |
| `npm run capture:post -- --module <m> --feature <f>`                         | Run post-capture MCP hook                    |
| `npm run check:ddt-fixtures`                                                 | Validate JSON fixture structure              |

---

## MCP Workflow

```bash
# 1. Start MCP from VS Code: MCP: List Servers → playwright
# 2. Login manually in the MCP browser session
# 3. Use the MCP agent to explore and scaffold tests
# 4. Review Tier 1 (selectors/routes), approve, then Tier 2 (test plan), approve, then Tier 3 (code)
```

See `.github/prompts/mcp/scaffold-with-mcp.prompt.md`

---

## Key Files

| What you need      | Where it lives                                           |
| ------------------ | -------------------------------------------------------- |
| Selector constants | `playwright/configs/ui/modules/<module>/<module>.ui.ts`  |
| Routes             | `playwright/configs/app/routes.ts`                       |
| Helpers            | `playwright/support/helpers/modules/<module>.helpers.ts` |
| Base fixture       | `playwright/fixtures/base.fixture.ts`                    |
| Test data          | `playwright/testdata/<module>/`                          |
| MCP context        | `playwright/.feature-context/`                           |
