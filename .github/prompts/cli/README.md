# Playwright CLI Prompts Guide

Use this guide for prompt flows that do not require MCP exploration.

## Primary Prompts

- [scaffold-with-cli.prompt.md](scaffold-with-cli.prompt.md)
- [scaffold-no-mcp.prompt.md](scaffold-no-mcp.prompt.md)

## When to Use

- MCP is unavailable or blocked by environment constraints
- You already have selectors and workflow notes
- You prefer codegen-first discovery via Playwright CLI
- You need fast updates to known modules

## Context Inputs

Preferred retained context folder:

```text
playwright/.feature-context/<app>/<module>/<feature>/
```

Recommended files:

- `_feature-brief.md`
- `_workflow.md`
- `_selectors.md`
- `_assertions.md`
- `_codegen-script.spec.ts` (optional)

## Commands

- `npm run context:codegen`
- `npx playwright test path/to/spec.ts --project=<project>`

## Required Items

Before running a CLI prompt, ensure:

1. `playwright/.feature-context/<app>/<module>/<feature>/` exists
2. `_workflow.md` and `_selectors.md` are present
3. Target module files are identified (`routes.ts`, UI config, helper, spec)
4. Project name in `playwright.config.ts` is known

## Iterative Loop

1. Start with `scaffold-with-cli.prompt.md`
2. Validate generated code with target spec
3. If selectors or state transitions are unclear, enrich context files
4. If still ambiguous, escalate to MCP prompt flow

## Enforcement

CLI-based prompts must still obey the same framework rules:

- Config → Helpers → Tests architecture
- No hardcoded selectors/routes when constants exist
- No `page.waitForTimeout()`
- Specs import from `base.fixture.ts`

## Related

- [Prompts Index](../README.md)
- [../../../docs/04-reference/workflow-utilities.md](../../../docs/04-reference/workflow-utilities.md)
- [../../../docs/workflow.md](../../../docs/workflow.md)
