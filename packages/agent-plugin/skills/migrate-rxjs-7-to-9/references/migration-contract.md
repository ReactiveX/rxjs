# Migration contract

The contract makes behavior and evidence reviewable before source changes.
Schema validity and migration readiness are independent.

## Repository evidence

Record:

- exact RxJS source version;
- package manager, TypeScript, framework, and test-runner versions;
- green baseline build, type, lint, and behavioral commands;
- known baseline failures that are unrelated to migration; and
- source commit or digest that the inventory describes.

## Migration units

Use one unit per affected pipeline or tightly coupled public behavior. Each
unit should contain:

- stable id and repository-relative source span;
- source lifecycle and observable behavior claims;
- evidence classification and exact characterization tests;
- chosen target lifecycle;
- cancellation, error, completion, ordering, sharing, and timing decisions;
- mechanical diagnostics and candidate status;
- intentional divergences;
- reviewer approval or unresolved blocker; and
- post-migration verification evidence.

Do not create one unit per file when unrelated pipelines in the file have
different lifecycles. Do not split a shared producer and its consumers into
units that cannot be reviewed coherently.

## Lifecycle values

An ordinary RxJS 7 Observable unit begins at
`producer-per-direct-subscription`. This default does not need special approval
when it preserves the characterized RxJS 7 behavior. A `platform-shared`
selection records either intentional RxJS 7 sharing evidence or a repository-
wide single-subscriber proof.

- `platform-shared`: first observer starts active work, concurrent observers
  join, final observer cancellation tears it down, later observation restarts.
- `producer-per-direct-subscription`: each direct `subscribe()` creates and
  owns independent work through `ColdObservable` or another accepted boundary.
- `subject-hot`: producer exists before observers; record live/current/replay,
  retention, and terminal behavior.
- `not-applicable`: the unit has no producer lifecycle decision.
- `unsupported`: evidence shows no accepted RxJS 9 target.
- `unresolved`: owner intent or behavioral evidence is insufficient.

`unsupported` and `unresolved` are stop states. Do not convert them to a target
merely to make the manifest look complete.

## Evidence classifications

- `portable`: the behavioral claim remains meaningful across the target
  lifecycle with an accepted harness.
- `harness-rewrite`: behavior is retained but test mechanics must change.
- `compatibility-only`: the source contract belongs to RxJS 7 and needs an
  explicit target decision.
- `intentional-divergence`: RxJS 9 deliberately differs; document the new
  behavior and caller impact.
- `unsupported-or-obsolete`: no supported target exists or the old surface
  should be removed.

Classification is not a confidence score. A portable operator can still sit
inside a pipeline whose producer lifecycle changes.

## Validation boundary

Call `validate_migration_contract` to check structure and version alignment.
Then inspect readiness diagnostics. A schema-valid manifest may still contain
unresolved lifecycles, missing evidence, stale source spans, or unapproved
divergences.

## MCP authority

The MCP receives explicit source text and repository-relative names. It cannot
read, write, enumerate, or execute repository files. The host agent may apply
reviewed preview output only through its normal editing authority.

An entire request is refused before processing if malformed, duplicated,
absolute/escaping, larger than 25 files, larger than 512 KiB for one file, or
larger than 2 MiB total. There is no partial output for a refused batch.
