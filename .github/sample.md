## Output Contract

- Default to implementation over explanation.
- Generate code first, explanation second.
- Keep explanations under 20% of total response length.
- For code modifications:
  - Show only changed files.
  - Do not restate requirements.
  - Do not explain obvious code.
- When asked to implement:
  - Return production-ready code.
  - Return complete snippets, not pseudocode.
- When architecture violations exist:
  - Fix the violation and briefly state why.
- Prefer diffs, patches, or file-by-file outputs.
- Avoid educational Playwright explanations unless explicitly requested.