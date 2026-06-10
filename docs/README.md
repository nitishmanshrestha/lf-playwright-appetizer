# Playwright Automation Boilerplate — Documentation

> A production-ready, helper-first Playwright framework any team can fork, adapt, and ship.

## Contents

| Doc                                                                 | Purpose                                                                     |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [Getting Started](getting-started.md)                               | Setup, first test, running locally                                          |
| [Framework Standards](framework-standards.md)                       | Architecture rules, naming conventions, selector strategy                   |
| [API Layer Guide](api-layer-guide.md)                               | API engine, route interception, schema validation                           |
| [Framework Maintenance Guide](framework-maintenance-guide.md)       | Adding modules, updating configs                                            |
| [Support Helpers Guide](support-helpers-guide.md)                   | Helper authoring patterns                                                   |
| [Feature Context Guide](feature-capture-guide.md)                   | Retain MCP or Playwright CLI feature context for AI-assisted test authoring |
| [Workflow](workflow.md)                                             | End-to-end process: MCP exploration → passing tests                         |
| [Bootstrap and Evidence Guide](bootstrap-evidence-guide.md)         | One-command setup responsibilities and evidence artifact locations          |
| [Doc Impact Map](doc-impact-map.md)                                 | Path-to-doc enforcement map for framework changes                           |
| [Playwright CLI Getting Started](playwright-cli-getting-started.md) | CLI setup, required items, and token-efficient workflow in this framework   |
| [Prompts Guide](../.github/prompts/README.md)                       | When and how to use the Copilot prompt files                                |

## Quick Links

- **Run tests:** `npm test`
- **Bootstrap setup:** `npm run bootstrap`
- **Check doc impact:** `npm run check:doc-impact`
- **Smoke only:** `npm run test:smoke`
- **UI mode:** `npm run test:ui`
- **See report:** `npm run report`
- **Create feature context:** Use MCP in VS Code or `npm run context:codegen`
