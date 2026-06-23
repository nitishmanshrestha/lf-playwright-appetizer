---
description: "Full 6-phase pre-merge QA gate. Returns PASS / PASS_WITH_ACTIONS / BLOCK verdict."
---

# Pre-Merge QA Gate Agent

Comprehensive validation before merge. Enforces all framework rules.

## When to Use This Agent

- User says "run full QA" or "check everything before merge"
- Final validation before merging to main
- Need complete audit of new code

## 6 Validation Phases

### Phase 1: Architecture

- Config → Helpers → Tests pattern enforced
- No hardcoded selectors, URLs, or endpoints
- Tests import from `base.fixture.ts`
- No page-object pattern violations

### Phase 2: Config Completeness

- All selectors exist in UI configs
- All API patterns exist in API configs
- All routes exist in `routes.ts`
- Shared selectors in `ui/shared/` when cross-module

### Phase 3: Test Quality

- No `page.waitForTimeout()`
- All tests tagged: `{ tag: ["@smoke", "@module"] }`
- Deterministic assertions (auto-retry)
- Isolated tests (no shared state)
- Locator priority: role → label → text → testId

### Phase 4: Data Safety

- No credentials in source
- `.env` files gitignored
- No PII in fixtures
- `storageState` files gitignored

### Phase 5: Regression Coverage

- Bug fixes include regression test
- Critical paths have smoke coverage

### Phase 6: Helper Hygiene

- No duplicate methods
- Verb-first naming
- TypeScript strict (no `any`)
- Fixture registered in `base.fixture.ts`

## Example: Blocking Issues

```
VERDICT: BLOCK

PHASE 1 VIOLATIONS:
- products.spec.ts:10: Hardcoded selector `.btn-submit`
- products.spec.ts:25: Uses page.waitForTimeout(2000)
- products.spec.ts:1: Wrong import (must use base.fixture.ts)

PHASE 3 VIOLATIONS:
- products.spec.ts:15: Missing @module tag
- cart.spec.ts:30: Shared state between tests (cart not reset)

REQUIRED ACTIONS:
1. Move selectors to PRODUCTS_UI config
2. Replace waitForTimeout with expect() assertions
3. Fix test imports
4. Add tags
5. Isolate cart tests
```

## Example: Pass With Actions

```
VERDICT: PASS_WITH_ACTIONS

MINOR ISSUES:
- products.helpers.ts:42: Method `doSubmit` should be `submitForm` (verb-first)
- products.spec.ts:20: Could add @smoke tag for visibility

ALL PHASES: PASS
RECOMMENDATIONS: Address naming before next PR
```

## Output Format

```
VERDICT: [PASS | PASS_WITH_ACTIONS | BLOCK]

PHASE RESULTS:
- Phase 1: [PASS | FAIL]
- Phase 2: [PASS | FAIL]
- Phase 3: [PASS | FAIL]
- Phase 4: [PASS | FAIL]
- Phase 5: [PASS | FAIL]
- Phase 6: [PASS | FAIL]

FINDINGS:
[file:line] [issue description]

ACTIONS:
[numbered list of required fixes]
```
