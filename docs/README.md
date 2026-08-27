# Documentation

**Start with [START-HERE.md](START-HERE.md)** — the complete, self-contained harness guide.
Everything below is supporting detail you reach for only when you need it.

Taxonomy is identical in the Cypress adapter: `guides/` for how-to, `reference/` for lookup,
`architecture/` for design and specs.

## Guides

| Topic                                | Document                                                    |
| ------------------------------------ | ----------------------------------------------------------- |
| Local setup                          | [setup.md](guides/setup.md)                                 |
| Browser discovery before building    | [discovery-process.md](guides/discovery-process.md)          |
| Your first module, end to end        | [first-test-module.md](guides/first-test-module.md)         |
| Writing tests                        | [writing-tests.md](guides/writing-tests.md)                 |
| Debugging a failure                  | [debugging-tests.md](guides/debugging-tests.md)             |
| Recording with codegen               | [recording-tests.md](guides/recording-tests.md)             |
| Selector strategies                  | [selector-strategies.md](guides/selector-strategies.md)     |
| Mocking API requests                 | [api-mocking.md](guides/api-mocking.md)                     |
| Data-driven tests                    | [data-driven-testing.md](guides/data-driven-testing.md)     |
| Sessions and authentication          | [session-and-auth.md](guides/session-and-auth.md)           |
| Traces                               | [trace-recording.md](guides/trace-recording.md)             |
| Video                                | [video-recording.md](guides/video-recording.md)             |
| Parallel execution                   | [parallel-execution.md](guides/parallel-execution.md)       |
| Self-healing selectors               | [self-healing-selectors.md](guides/self-healing-selectors.md) |

## Reference

| Topic                       | Document                                                              |
| --------------------------- | --------------------------------------------------------------------- |
| CLI commands                | [cli-commands.md](reference/cli-commands.md)                          |
| Configuration reference     | [config-reference.md](reference/config-reference.md)                   |
| Playwright API cheatsheet   | [playwright-api-cheatsheet.md](reference/playwright-api-cheatsheet.md) |
| The playwright-cli agent    | [playwright-cli-agents.md](reference/playwright-cli-agents.md)         |
| Workflow utilities          | [workflow-utilities.md](reference/workflow-utilities.md)               |

## Architecture

| Topic                          | Document                                                                |
| ------------------------------ | ----------------------------------------------------------------------- |
| Harness lifecycle contract     | [harness-lifecycle-spec.md](architecture/harness-lifecycle-spec.md)     |
| The three-layer pattern        | [three-layer-pattern.md](architecture/three-layer-pattern.md)           |
| Anatomy of a module            | [module-anatomy.md](architecture/module-anatomy.md)                      |
| Patterns and anti-patterns     | [patterns-and-anti-patterns.md](architecture/patterns-and-anti-patterns.md) |

## Project intake

Project and module context templates: [application-intelligence](application-intelligence/README.md).

Application-specific context is created only after intake. The canonical requirement registry is
`evidence/requirements.json`.

## Decisions

An append-only log of significant technical decisions: [decisions](decisions/README.md).
