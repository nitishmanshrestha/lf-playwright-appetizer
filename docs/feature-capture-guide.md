# Feature Context Guide

> Preferred model: retain small, reviewable feature context from MCP or
> Playwright CLI, then use that context to author Config → Helpers → Tests.

---

## Why This Replaces Raw DOM Capture

The framework no longer needs a heavy DOM-capture-first workflow as the primary
path.

Prefer:

- MCP browser exploration when the agent can inspect the live application
- Playwright CLI codegen when you want a quick recorded interaction script
- Small markdown context files that preserve the useful parts of exploration

This keeps the retained context readable, reviewable, and easy for both humans
and AI agents to reuse.

---

## When To Use Feature Context

Use retained feature context when:

- the feature is new and the module does not exist yet
- the workflow has multiple steps or validation states
- the same feature will be implemented or reviewed more than once
- you want a lightweight handoff between exploration and code generation

Do not create a context folder for trivial one-line changes where the behavior
is already obvious from existing helpers or specs.

---

## Preferred Inputs

### Option 1 — MCP exploration (preferred)

Use MCP when the app is reachable from VS Code and you want the agent to inspect
the real UI state directly.

Capture only what matters:

- important selectors
- URL transitions
- validation messages
- menu/modal state changes
- summary values and business calculations

### Option 2 — Playwright CLI codegen

Use `npm run context:codegen` when MCP is unavailable or when a recorded script
is the fastest way to preserve a user journey.

Treat the generated script as reference material only. Convert useful details
into config constants, helper methods, and thin specs.

---

## Recommended Retained Context Structure

Keep feature context under:

```text
playwright/.feature-context/
└── <app>/<module>/<feature>/
    ├── _feature-brief.md
    ├── _workflow.md
    ├── _selectors.md
    ├── _assertions.md
    └── _codegen-script.spec.ts   (optional)
```

### Required files

#### `_feature-brief.md`

Business framing:

- feature purpose
- user role or auth assumptions
- scope included / excluded
- edge cases worth covering

#### `_workflow.md`

The user journey in ordered steps:

1. starting page
2. actions taken
3. expected route/state after each action
4. negative paths to cover

#### `_selectors.md`

Only the selectors that matter for the tests:

- data-test or data-testid values
- route constants needed
- menu, modal, and validation selectors
- notes about strictness or wrapped buttons

#### `_assertions.md`

Expected outcomes:

- visibility expectations
- error text
- state transitions
- calculation formulas

### Optional files

#### `_codegen-script.spec.ts`

Reference script from Playwright codegen. Useful for recalling the path the user
took, but never the final architecture.

---

## How The Agent Should Use This Context

When a feature context folder is provided, the agent should read files in this
order:

1. `_feature-brief.md`
2. `_workflow.md`
3. `_selectors.md`
4. `_assertions.md`
5. `_codegen-script.spec.ts` if present

Then the agent should:

1. compare the context against existing configs, helpers, fixtures, and specs
2. keep only missing or new information
3. generate code in Config → Helpers → Tests order
4. validate the resulting tests

---

## MCP Workflow

Use MCP to discover the feature, then convert the useful findings into the
retained context folder.

Typical output from MCP exploration:

- login page selectors
- inventory or detail routes
- exact validation copy
- button state transitions
- wrapped or intercepted clickable elements

Do not store raw full-page dumps when a short markdown note is enough.

---

## CLI Workflow

```bash
npm run context:codegen
```

Drive the flow in the browser, then extract the useful parts into markdown:

- distilled selectors into `_selectors.md`
- ordered journey into `_workflow.md`
- expected assertions into `_assertions.md`

If the generated script is noisy, keep only the parts needed as reference.

---

## Example

```text
playwright/.feature-context/saucedemo/login-logout/
├── _feature-brief.md
├── _workflow.md
├── _selectors.md
└── _assertions.md
```

Example `_workflow.md`:

```md
1. Land on login page
2. Submit empty form → expect username required error
3. Login as locked_out_user → expect locked out error
4. Login as standard_user → expect /inventory.html
5. Open hamburger menu → click Logout
6. Expect redirect to / and empty login fields
```

---

## Backward Compatibility

If older material exists under `playwright/.context-capture/`, treat it as
legacy feature context.

- reuse `_feature-brief.md` where possible
- extract the useful parts of manifests/state files into markdown summaries
- do not expand the old capture workflow further unless a specific need remains

---

## Recommendation

Prefer this order:

1. MCP exploration
2. markdown feature context retention
3. prompt or agent-driven code generation
4. Playwright CLI codegen only when MCP is unavailable or helpful as reference

This keeps the framework aligned around human-readable retained context rather
than raw capture artifacts.

---

## Feeding Captures To The AI

Paste this in the Copilot chat:

```
Generate helpers + configs + smoke spec for the `<module>` module.

Brief: playwright/.context-capture/<app>/<module>/<feature>/_feature-brief.md
Manifest: playwright/.context-capture/<app>/<module>/<feature>/_capture-manifest.json

Cover: <list iterations / states>
```

The AI will:

1. Read the manifest first for structure.
2. Read each referenced state file for selector / role contracts.
3. Run duplication checks against existing helpers/configs.
4. Generate code following Config → Helpers → Tests architecture and the
   locator priority defined in [framework-standards.md](framework-standards.md).

---

## Production Override

If you must capture from a hard-denylisted host (audit trails, post-incident
investigation):

```bash
ALLOW_PRODUCTION=1 npm run context:capture
```

The override is logged to stdout but not persisted; treat any artifact produced
under this flag as sensitive and review every state file before sharing.

---

## Cleanup

Captures accumulate quickly. Two options:

- Delete the entire `playwright/.context-capture/<app>/<module>/<feature>/`
  directory once tests are merged.
- Keep `_feature-brief.md` only (already allow-listed in the auto-generated
  `.gitignore`) and remove the rest.

---

## Related Docs

- [Framework Standards](framework-standards.md) — locator priority, layering rules
- [Support Helpers Guide](support-helpers-guide.md) — helper authoring patterns
- [API Layer Guide](api-layer-guide.md) — route interception and stubbing
- [Framework Maintenance Guide](framework-maintenance-guide.md) — module scaffolding
