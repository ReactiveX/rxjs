---
name: migrate-rxjs-7-to-9
description: Migrate an application, library, or test suite from RxJS 7 to RxJS 9 with explicit lifecycle decisions, characterization tests, bounded MCP previews, and safe stops. Use only for an RxJS 7-to-9 migration or migration planning.
---

# Migrate RxJS 7 to RxJS 9

Treat this as a behavioral migration, not an import rewrite.

1. Confirm the installed RxJS version and repository test/build commands. RxJS
   7 guidance is pinned to `7.8.2`; the target is `9.0.0-beta.1`.
2. Establish a green RxJS 7 baseline. Add characterization tests before edits
   when cancellation, teardown, timing, multicasting, repeated subscription,
   Subjects, custom inputs, or scheduler behavior is weakly covered.
3. Inventory each affected pipeline and classify it as
   `platform-shared`, `producer-per-direct-subscription`, `subject-hot`,
   `not-applicable`, `unsupported`, or `unresolved`.
4. Record the reviewed migration contract. Never choose a lifecycle silently.
5. Call `migration_capabilities`, then `analyze_migration` with explicit source
   text and repository-relative paths. Resolve refusals before previewing.
6. Call `preview_migration` in batches within its limits. Review candidate
   source and diagnostics; apply accepted changes with normal host editing
   tools. The MCP never edits files.
7. Repair types, tests, framework integration, cancellation, and teardown in
   small reviewable batches. Re-previewing accepted output must be idempotent.
8. Run the baseline-equivalent target tests plus build, type, lint, and focused
   behavior checks. Record intentional divergences and unresolved blockers.

Stop rather than guessing when coverage is missing, a lifecycle is unresolved,
an input relies on legacy subscribable interop, a scheduler contract has no
target, or a diagnostic refuses the file.

Read the [migration contract](references/migration-contract.md) before making
changes and [generated migration capabilities](references/migration-capabilities.md)
when checking the mechanically proved subset.
