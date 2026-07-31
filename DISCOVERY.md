# Browser Discovery

Discovery confirms implementation details; it does not invent requirements.

1. Complete project intake through `project-bootstrapper`.
2. Select one approved module and active requirement.
3. Run `npx playwright codegen "$BASE_URL"` or invoke `playwright-cli`.
4. Record verified routes, roles/labels/test ids, network dependencies, and state transitions in
   the module context.
5. Add missing stable selectors to the application-testability backlog.
6. Hand the approved requirement id and verified discovery evidence to
   `playwright-test-automation`.

Never copy generated code directly into a spec. Extract config and helper ownership first.

See [`docs/START-HERE.md`](docs/START-HERE.md).
