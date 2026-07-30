# MCP Prompts Guide

Use this guide for prompt flows that depend on Playwright MCP browser exploration.

## Primary Prompt

- [scaffold-with-mcp.prompt.md](scaffold-with-mcp.prompt.md)

## When to Use

- You need live app discovery before writing tests
- Selector contracts are unknown
- You want a gated Explore → Document → Create workflow
- You need review checkpoints before code generation

## Preconditions

1. MCP server `playwright` is running in VS Code.
2. You can reach the target app from the MCP browser.
3. You can provide module/feature/project inputs.

## Output Model

1. Tier 1 findings (selectors, routes, state transitions)
2. Tier 2 coverage matrix for approval
3. Tier 3 framework-compliant code changes
4. Tier 4 test execution verification

## Recommended Safe Default

After a capture artifact is produced, the agent writes the fixture and spec directly, following the
Config → Helpers → Tests layering. Respect `--no-ddt` when the user opts out, and do not change the
MCP server itself.

## Enforcement

The prompt must still follow framework rules from:

- [../../../docs/framework-standards.md](../../../docs/framework-standards.md)
- [../../copilot-instructions.md](../../copilot-instructions.md)

## Related

- [Prompts Index](../README.md)
- [../../../docs/workflow.md](../../../docs/workflow.md)
- [../../../.vscode/mcp.json](../../../.vscode/mcp.json)
