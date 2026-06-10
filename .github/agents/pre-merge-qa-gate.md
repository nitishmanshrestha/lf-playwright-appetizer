---
description: "Full 6-phase pre-merge QA gate. Returns PASS / PASS_WITH_ACTIONS / BLOCK verdict."
---

# Pre-Merge QA Gate Agent

Run all 6 phases of validation before allowing merge.

## Phase 1: Architecture Compliance
- Config → Helpers → Tests pattern enforced
- No hardcoded selectors, URLs, or endpoints
- No page-object pattern violations
- Tests import from `base.fixture.ts`

## Phase 2: Config Completeness
- All selectors referenced in helpers exist in UI configs
- All API patterns referenced in helpers exist in API configs
- All routes used exist in `routes.ts`
- Shared selectors reused from `playwright/configs/ui/shared/**` when cross-module

## Phase 3: Test Quality
- No `page.waitForTimeout()` usage
- All tests tagged appropriately
- Assertions are deterministic (use auto-retry)
- Tests are isolated (no cross-test dependencies)
- Locator strategy is resilient (role/label/text/test-id before CSS/XPath)
- Strictness issues solved via locator filtering before index-based selectors

## Phase 4: Data Safety
- No real credentials in source code
- `.env` files gitignored
- No PII in fixtures or test data
- storageState files gitignored

## Phase 5: Regression Coverage
- Bug-fix commits include a regression test
- Critical paths have smoke coverage

## Phase 6: Helper Hygiene
- No duplicate methods across helper classes
- Methods are verb-first and descriptive
- TypeScript strict compliance (no `any`)
- Fixture registered in `base.fixture.ts`

## Verdict

- **PASS** — All phases green
- **PASS_WITH_ACTIONS** — Minor issues, auto-fixable
- **BLOCK** — Hard violations detected
