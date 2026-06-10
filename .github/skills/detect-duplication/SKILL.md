---
description: "Run before creating any new Playwright config, helper, or spec. Returns REUSE_EXISTING / EXTEND_EXISTING / NEW_FILE_JUSTIFIED verdict."
---

# Detect Duplication Skill

Before creating any new file, search for existing implementations that could be reused or extended.

## Search Order

1. **UI Configs** — `playwright/configs/ui/modules/**/*.ui.ts` and `playwright/configs/ui/shared/**`
2. **API Configs** — `playwright/configs/api/modules/**/*.api.ts`
3. **Helper Classes** — `playwright/support/helpers/**/*.helpers.ts`
4. **Specs** — `playwright/tests/**/*.spec.ts`

## Verdict Criteria

### REUSE_EXISTING
An existing file already provides the exact functionality needed.
→ Use it directly. Do not create a new file.

### EXTEND_EXISTING
An existing file covers 70%+ of the need. Add to it.
→ Add methods to the existing helper class or entries to the existing config.

### NEW_FILE_JUSTIFIED
Nothing similar exists. Creating a new file is correct.
→ Proceed with creation following naming conventions.

## Output Format

```
VERDICT: [REUSE_EXISTING | EXTEND_EXISTING | NEW_FILE_JUSTIFIED]
EXISTING_FILE: [path, if applicable]
REASON: [one sentence]
ACTION: [what to do]
```
