# Workflow Utilities

This page explains the small scripts in the `scripts/` folder in plain language.

The goal is simple: keep the repo easy to set up, easy to check, and easy to maintain.

## What These Scripts Are For

| Script                              | What it does                                                                                                                | Keep it? |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| `scripts/bootstrap.js`              | Sets up a fresh clone by installing dependencies, installing Playwright browsers, and checking the local environment files. | Yes      |
| `scripts/check-doc-impact.js`       | Checks whether framework changes also need docs updates.                                                                    | Yes      |
| `scripts/check-locator-strategy.js` | Checks helper code for locator patterns that should use a safer fallback.                                                   | Yes      |

## What To Use In Real Life

Use `npm run bootstrap` when:

- you are setting up the repo for the first time
- dependencies or Playwright browsers are missing
- you want the standard local setup path

Use `npm run check:doc-impact` when:

- you change framework code and want to make sure the docs were updated too
- you are preparing a merge and want a fast policy check

Use `npm run check:locator-strategy` when:

- you add or edit helper methods
- you want a quick guard against fragile locator usage

For most new work, prefer the newer agent and CLI flow:

- use `playwright-cli` for browser discovery
- use the retained feature context folders under `playwright/.feature-context/...`
- use the `playwright-cli` agent for token-efficient browser work

## How The AI Layer Treats These Scripts

The AI layer does not run these scripts automatically.

Instead, it follows the repo instructions and uses these scripts when they are clearly the right tool:

- setup tasks use `bootstrap.js`
- policy checks use `check-doc-impact.js` and `check-locator-strategy.js`
- feature discovery uses `playwright-cli` and the retained feature context folders

That is why the scripts should stay separate from the agent and skill files:

- scripts are executable tools
- agents and skills are decision guides
- docs explain when to use each one

## Practical Rule

If a script is not used by humans or CI, and the AI can already do the same job through the agent workflow, it is a good candidate for removal.

For this repo, the three utility scripts above are the ones to keep.
