# Framework Features

Capabilities and advanced features of this testing framework.

## Feature Guides

- **[Session & Authentication](./session-and-auth.md)** — Managing browser sessions, cookies, storage state, login persistence
- **[Video Recording](./video-recording.md)** — Recording videos of test execution
- **[Trace Recording](./trace-recording.md)** — Detailed trace inspection with Playwright Inspector
- **[Parallel Execution](./parallel-execution.md)** — Running tests in parallel for speed
- **[Self-Healing Selectors](./self-healing-selectors.md)** — How the framework keeps tests passing through UI changes (auto-retry, locator hierarchy, single-source config)

## When to Use These

- **Session & Auth** — Whenever you need persistent login state across tests
- **Video Recording** — For debugging, CI reports, or documentation
- **Trace Recording** — When a test fails and you need deep inspection
- **Parallel Execution** — To optimize CI/CD performance on large test suites
- **Self-Healing Selectors** — When you want to understand why tests survive (or don't survive) UI changes

## Related Documentation

See **[Configuration Reference](../04-reference/config-reference.md)** for enabling these features.
