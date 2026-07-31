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
playlist-cli if (userType === "admin") { ... }  # Different paths
playlist-cli else { ... }
# Different flows → not DDT
```

## Output Format

Return this structure:

```text
VERDICT: [DDT_CANDIDATE | NOT_CANDIDATE]
PATTERN: [flow name and repeated steps]
DATA_ITEMS: [list of distinct datasets identified]
FIXTURE_FILE: [suggested JSON filename in playwright/testdata/<module>/]
REASON: [one sentence explaining verdict]
NEXT_ACTION: [create JSON fixture → implement for...of loop in smoke/e2e folder]
```

## Example Verdict

```text
VERDICT: DDT_CANDIDATE
PATTERN: Checkout flow with different user info
DATA_ITEMS: ["John Doe", "Jane Smith", "Bob Johnson"]
FIXTURE_FILE: playwright/testdata/saucedemo/checkout-valid-users.json
REASON: Same checkout steps with different firstName/lastName/postalCode; include expectedConfirmationText in data
NEXT_ACTION: Create JSON array with objects including assertion values → implement for...of loop in playwright/tests/saucedemo/smoke/
```

---

## Integration with CLI Workflow Skill

This skill complements `playwright-cli-workflow`:

1. **CLI Discovery** → Use `playwright-cli` to capture the flow
2. **DDT Identification** → Apply this skill to classify
3. **If DDT** → Create JSON test data + `test.each()` spec
4. **If Not DDT** → Single scenario test with helpers

See: [Data-Driven Testing Guide](../../docs/guides/data-driven-testing.md)
