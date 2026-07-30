---
description: "Identify Data-Driven Testing (DDT) candidates during CLI discovery. Returns DDT_CANDIDATE / NOT_CANDIDATE with pattern analysis."
---

# Identify DDT Candidates Skill

Use this skill during CLI-driven discovery to determine if a test is a good DDT candidate.

## What is a DDT Candidate?

A test is a good DDT candidate when:

- It follows the **same flow** multiple times with **different input data**
- It has **similar or identical assertions** for each data variation
- There are **3+ valid scenarios** to test
- The test doesn't require different setup/teardown per scenario

## Quick Identification Checklist

When you capture a flow via `playwright-cli`, ask:

```text
□ Does the test repeat the same steps?
□ Are only the data inputs different?
□ Can I group the inputs into a dataset?
□ Are there 3+ variations to test?
□ Do all variations share the same assertion pattern?

If YES to all → DDT_CANDIDATE
If NO to any → NOT_CANDIDATE
```

## CLI Patterns to Look For

### ✅ DDT CANDIDATE

```bash
# Checkout test with different users
playwright-cli fill "firstName" "John"       # First dataset
playwright-cli fill "firstName" "Jane"       # Second dataset
playwright-cli fill "firstName" "Bob"        # Third dataset
# Same next steps for all three → DDT
```

### ❌ NOT CANDIDATE

```bash
# Complex conditional branches per scenario
# Different flows → not DDT
```

## Output Format

```text
VERDICT: [DDT_CANDIDATE | NOT_CANDIDATE]
CONFIDENCE: [0.0-1.0]
PATTERN: [flow name and repeated steps]
DATA_ITEMS: [list of distinct datasets identified]
FIXTURE_FILE: [suggested JSON filename in playwright/testdata/<module>/]
REASON: [one sentence explaining verdict]
NEXT_ACTION: [npm run scaffold:flow -- --module <m> --feature <f> --verdict <VERDICT>]
QUESTION_SET: [variation count, shared assertions, input JSON, expected JSON, unique setup differences]
```

## Confidence Thresholds

- `CONFIDENCE >= 0.80`: intake is mandatory when `VERDICT` is `DDT_CANDIDATE`.
- `0.50 <= CONFIDENCE < 0.80`: suggest DDT, but proceed with single-scenario if the user declines intake.
- `CONFIDENCE < 0.50`: treat as single-scenario unless the user explicitly overrides.

## Example Verdict

```text
VERDICT: DDT_CANDIDATE
PATTERN: Checkout flow with different user info
DATA_ITEMS: ["John Doe", "Jane Smith", "Bob Johnson"]
FIXTURE_FILE: playwright/testdata/checkout/checkout-valid-users.json
REASON: Same checkout steps with different firstName/lastName/postalCode; include expectedConfirmationText in data
NEXT_ACTION: npm run scaffold:flow -- --module checkout --feature checkout-valid-users --verdict DDT_CANDIDATE [--capture <capture.json>]
```

## Integration with CLI Workflow Skill

1. **CLI Discovery** → Use `playwright-cli` to capture the flow
2. **DDT Identification** → Apply this skill to classify
3. **If DDT_CANDIDATE** → Ask `QUESTION_SET` when `CONFIDENCE >= 0.80`; if `0.50 <= CONFIDENCE < 0.80`, suggest DDT and proceed only if the user accepts intake
4. **Then** → Create JSON test data + `for...of` spec
5. **If NOT_CANDIDATE** → Single scenario test with helpers
