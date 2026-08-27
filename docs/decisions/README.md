# Architecture Decision Records

This folder contains Architecture Decision Records (ADRs) — an append-only log of significant
technical decisions made in this framework.

## The log

No ADRs recorded yet.

The two decisions that most shape this adapter are currently documented elsewhere rather than as
ADRs, and are worth promoting here when someone next revisits them:

- **Helper-first over page objects.** Rationale lives in the `no-page-object` rule's `why` field in
  `harness.config.json` and in [START-HERE.md](../START-HERE.md) section 12.
- **`storageState` setup project over per-test login.** Rationale lives in the `storage-state-auth`
  rule's `why` field.

The Cypress adapter records the equivalent command-first decision as ADR 0001 and the write-time hook
decision as ADR 0002.

## Format

Each ADR is a numbered Markdown file: `NNNN-short-title.md`

```text
# NNNN — Decision Title

## Status
Accepted | Superseded by NNNN | Deprecated

## Context
What situation or constraint forced a decision?

## Decision
What was decided?

## Consequences
What becomes easier? What becomes harder?
```

## Rules

- Never modify an existing ADR — write a new one that supersedes it
- Number sequentially: `0001`, `0002`, ...
- One decision per file — keep scope narrow
- Update `Status` to `Superseded by NNNN` if a later ADR replaces this one
