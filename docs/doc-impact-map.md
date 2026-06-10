# Doc Impact Map

Use this map to determine which docs must be updated when framework files change.

Source of truth for enforcement is:

- `.github/doc-impact-map.json`

The CI gate and local checker both read that JSON file directly.

## Rules

- If a changed file matches one of the patterns below, at least one listed doc must also be changed in the same PR.
- If no row matches, docs updates are optional.

## Common Areas Covered

- Framework and app config changes
- UI and API config changes
- Helper and spec changes
- Bootstrap and capture script changes

Run locally with:

```bash
npm run check:doc-impact
```
