# Playwright Boilerplate — Documentation Hub

Complete guide to setting up, writing, and maintaining automated tests with this framework.

---

## 🤖 For Coding Agents (Claude Code, GitHub Copilot, etc.)

**Get started in 2 minutes:**

```bash
npm install -g @playwright/cli@latest
playwright-cli open https://example.com
playwright-cli snapshot
playwright-cli click e15
```

**Your resources:**

- **Browser automation:** [playwright-cli Complete Guide](./04-reference/playwright-cli-agents.md) — 100+ commands, workflows, best practices
- **Repo custom agent:** `.github/agents/playwright-cli.md` — token-efficient CLI-first Playwright routing for this workspace
- **Test execution:** [npm Scripts](./04-reference/cli-commands.md) — how to run & debug tests
- **Selectors:** [Selector Strategies](./02-guides/selector-strategies.md) — getByRole, data-testid, best practices
- **Methods:** [API Cheatsheet](./04-reference/playwright-api-cheatsheet.md) — common Playwright methods
- **Architecture:** [Three-Layer Pattern](./05-architecture/three-layer-pattern.md) — Config → Helpers → Tests

---

## 🚀 New to This Project? (Humans)

Start here → **[Getting Started](./01-getting-started/)**

- [Setup & Environment](./01-getting-started/setup.md)
- [Discovery Process](./01-getting-started/discovery-process.md)
- [Your First Test Module](./01-getting-started/first-test-module.md)

---

## 📚 Documentation By Use Case

### I want to...

#### Write Tests

👉 [Writing Tests Guide](./02-guides/writing-tests.md) — spec-driven testing patterns

#### Record & Generate Tests

👉 [Recording Tests](./02-guides/recording-tests.md) — Playwright Codegen workflow

#### Find the Right Selector

👉 [Selector Strategies](./02-guides/selector-strategies.md) — data-testid, getByRole, and best practices

#### Mock API Requests

👉 [API Mocking](./02-guides/api-mocking.md) — request interception patterns

#### Debug a Failing Test

👉 [Debugging Tests](./02-guides/debugging-tests.md) — trace recording, video capture, live debugging

#### Manage Session & Auth State

👉 [Session & Authentication](./03-features/session-and-auth.md) — storage state, cookies, persistent profiles

#### Capture Video/Traces

👉 [Video Recording](./03-features/video-recording.md) — video capture setup  
👉 [Trace Recording](./03-features/trace-recording.md) — detailed trace inspection

#### Run Tests in Parallel

👉 [Performance & Parallel Execution](./03-features/parallel-execution.md)

---

## 🎓 Deep Dives

- [Three-Layer Architecture](./05-architecture/three-layer-pattern.md) — Why Config → Helpers → Tests?
- [Module Anatomy](./05-architecture/module-anatomy.md) — Structure of a complete test module
- [Patterns & Anti-Patterns](./05-architecture/patterns-and-anti-patterns.md) — Do's and don'ts

---

## 📖 Quick Reference

- [Playwright API Cheatsheet](./04-reference/playwright-api-cheatsheet.md)
- [Configuration Reference](./04-reference/config-reference.md)
- [CLI Commands](./04-reference/cli-commands.md) — **For agents: start here**

---

Last updated: 2026-06-11
