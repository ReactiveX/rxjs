# Migration contract

## Required evidence

- Exact source RxJS version, package manager, TypeScript version, framework,
  test runners, and green baseline commands.
- One unit per affected pipeline with repository-relative source spans,
  behavioral claims, evidence classification, target lifecycle, and approval.
- Diagnostics, intentional divergences, post-migration verification, and
  accepted or unresolved blockers.

Schema validity and readiness are separate. Use
`validate_migration_contract`; a valid manifest can still be incomplete.

## Lifecycle decisions

- `platform-shared`: first observer starts active work, concurrent observers
  join, last observer cancellation tears it down, later observation restarts.
- `producer-per-direct-subscription`: use an intentional RxJS 9 cold boundary.
- `subject-hot`: producer exists before observers; record replay/current and
  terminal rules.
- `not-applicable`: no Observable producer lifecycle is involved.
- `unsupported`: no accepted target exists; stop and record impact.
- `unresolved`: owner intent or evidence is missing; stop and ask.

## MCP boundary

The MCP accepts source text, never repository paths to read. Its maximum batch
is 25 files, 512 KiB per file, and 2 MiB total. Malformed or oversized batches
are refused before any partial result. An agent may apply reviewed preview
output only with its normal editing authority.
