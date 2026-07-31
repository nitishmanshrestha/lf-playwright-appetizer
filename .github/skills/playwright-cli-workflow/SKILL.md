---
description: "Use when tasks involve playwright-cli, coding agents, token-efficient browser automation, codegen-first Playwright flows, retained feature context, or no-MCP scaffolding."
---

# Playwright CLI Workflow Skill

Use this skill for repository-specific `playwright-cli` work.

This skill keeps CLI tasks small, repeatable, and aligned with the framework's Config → Helpers → Tests architecture.

## Use This Skill When

- The task mentions `playwright-cli`, coding agents, CLI browser automation, or token-efficient browser control.
- MCP is unavailable, unnecessary, or too heavy for the job.
- The user has codegen output, selector notes, or retained feature context.
- The task is local debugging, context capture, or CLI-guided scaffolding.

## Do Not Use This Skill When

- A failing spec needs formal failure classification and minimal-fix triage. Use `playwright-bug-hunter`.
- The task is merge review. Use `pre-merge-qa-gate`.
- The UI is mostly unknown and discovery is the main task. Prefer the MCP workflow.

## Required Inputs

Gather only what applies:

1. Project name from `playwright.config.ts`
2. Retained context folder: `playwright/.feature-context/<app>/<module>/<feature>/`
3. Codegen output or selector notes
4. Target files:
   - `playwright/configs/app/routes.ts`
   - `playwright/configs/ui/modules/**`
   - `playwright/configs/api/modules/**`
   - `playwright/support/helpers/**`
   - `playwright/tests/**`

5. **DDT Identification** — Does this test repeat the same flow with different data?
   - If YES → See [Data-Driven Testing Guide](../../docs/02-guides/data-driven-testing.md)
   - If NO → Proceed with single-scenario test

## Routing Matrix

### Path A — Codegen + Workflow Notes

Use `.github/prompts/cli/scaffold-with-cli.prompt.md` when:

- `_workflow.md` exists
- `_selectors.md` exists
- codegen output exists or equivalent retained notes exist

### Path B — Selectors + Steps Only

Use `.github/prompts/cli/scaffold-no-mcp.prompt.md` when:

- the user already knows the target flow
- selector notes are available
- no live browser discovery is needed

### Path C — Debugging Through CLI

Use `playwright-cli` directly when:

- the goal is to inspect state, capture evidence, or reproduce a user flow
- a browser session can answer the question faster than reading code

Start with:

```bash
playwright-cli open <url>
playwright-cli snapshot
```

### Path D — Escalate to MCP

Recommend MCP when:

- the UI structure is unknown
- the user needs exploratory multi-page discovery
- selector/state capture is incomplete and ambiguous

## Token-Efficient Playbook

- Prefer `snapshot` refs for repeated interactions.
- Prefer role selectors before CSS selectors.
- Save and reload state instead of replaying login.
- Avoid broad screenshots, traces, or video unless they resolve a specific uncertainty.
- Read retained context before opening a browser when context already exists.

## Repository Rules to Preserve

- Config → Helpers → Tests is mandatory.
- Reuse existing helpers/configs before creating new ones.
- No `page.waitForTimeout()`.
- No hardcoded selectors/routes/endpoints when config constants exist.
- Specs import from `playwright/fixtures/base.fixture.ts`.
- **DDT Pattern:** Use `for...of` loops with JSON data in `playwright/testdata/` for repeated flows with different inputs.

## Output Contract

Return concise guidance in this format:

```text
PATH: [A | B | C | D]
WHY: [one sentence]
CONTEXT USED: [files or retained context]
COMMANDS OR FILES: [next concrete actions]
VALIDATION: [narrowest check]
```
