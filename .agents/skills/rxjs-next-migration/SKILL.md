---
name: rxjs-next-migration
description: Migrate an RxJS 7 application, library, or test suite to RxJS Next through an agent-led workflow that establishes a green behavioral baseline, makes Observable lifecycle choices explicit, uses @rxjs/migrate only for bounded fixture-proved rewrites, repairs without weakening evidence, and records a versioned migration contract. Use for repository assessment, migration planning or execution, lifecycle review, TestScheduler conversion, or migration closeout.
---

# RxJS 7 to RxJS Next migration

Treat this as reviewed project work, not a codemod run. The objective is an
intentional RxJS Next contract backed by the project's own build and behavior
evidence. A transformed file, a clean diff, or one passing test is not proof
that the migration is complete.

Work through all eight stages in order. Re-enter an earlier stage whenever new
evidence changes scope, coverage, or lifecycle intent. Keep the developer
involved at every explicit pause.

## Non-negotiable rules

- Read and obey repository-local instructions before acting. Protect existing
  work and stay within the authorized repository and paths.
- Establish the RxJS 7 baseline before changing dependencies or source.
- Never infer platform sharing versus producer-per-direct-subscription behavior
  from syntax, filenames, operator names, or a currently passing output.
- Use the installed engine's versioned registry and schemas as authority. Do
  not reconstruct capability mappings from this Skill or from memory.
- Run the deterministic engine without writes first. A refusal is a successful
  safety outcome, not permission to improvise a mechanical rewrite.
- Preserve the project's test framework by default. Select a framework adapter
  only when the developer asked for that separate conversion.
- Do not weaken, skip, delete, or replace a behavioral expectation merely to
  make the migrated suite green.
- Do not add RxJS 7 compatibility shims, string-named platform methods, local
  substitute operators, or runtime generators unless the developer separately
  authorizes that product work.
- Keep changes in small coherent batches. Review and verify each batch before
  widening the scope.
- Do not call a migration complete while a required command is unknown,
  unapproved, skipped, or red without an explicitly accepted blocker.

## Working record

Create or locate a checked-in migration contract manifest and a concise
human-readable report. Use the schema exported by the installed
`@rxjs/migrate`; schema validity and migration readiness are separate checks.
Use [assets/migration-report.md](assets/migration-report.md) for the report.

For every migration unit, preserve source locations and record:

- its current RxJS 7 behavioral claim;
- the target lifecycle selected by the developer;
- its evidence classification and supporting tests;
- approval state, diagnostics, and any intentional divergence; and
- verification or a named blocker.

## Stage 1: Establish authority and scope

1. Locate repository instructions, package and workspace metadata, lockfiles,
   CI configuration, RxJS versions, build/test commands, and current working
   tree state.
2. Identify the repository root, migration boundary, permitted writes,
   package manager, network policy, and candidate verification commands.
3. Record the installed `@rxjs/migrate` version and canonical Skill digest.
   If the installed Skill does not match its package, stop and synchronize it
   before trusting these instructions.
4. State the proposed read, write, dependency, and command scope before broad
   changes.

Pause for the developer if the target repository or allowed scope is unclear,
existing changes overlap the migration, or destructive, networked, external,
or broader actions require new authority.

Exit only when the scope, allowed writes, package manager, and candidate gates
are recorded.

## Stage 2: Assess usage, lifecycle risk, and coverage

Inventory installed RxJS versions and import forms, then locate Observable
construction, custom producers, Subjects, subscription ownership, repeated
subscriptions, retry/refresh/cache paths, schedulers and timing, test helpers,
interop inputs, cancellation, teardown, and error handling. Include direct and
transitive operator usage.

For each lifecycle-sensitive path, link exact source evidence and mark it as:

- covered by an existing baseline;
- requiring a characterization test;
- explicitly unsupported; or
- an uncovered risk the developer accepts.

Produce a risk and coverage report before proposing rewrites. Read
[references/assessment-and-contract.md](references/assessment-and-contract.md)
for the inventory and characterization protocol.

Exit only when every in-scope lifecycle-sensitive use has one recorded
coverage disposition. Missing coverage is not evidence that behavior is safe.

## Stage 3: Establish the green RxJS 7 baseline

Run the agreed build, type, lint, unit, integration, and behavior checks against
the unchanged RxJS 7 project. Record exact commands, environment facts, exit
codes, and concise results.

Add focused characterization tests where Stage 2 found material gaps. Protect
observable values, completion/error behavior, producer multiplicity,
cancellation, abort reasons, teardown ordering, timing, and externally visible
subscription effects as applicable. Every characterization test must pass on
RxJS 7 before migration begins.

Pause if a starting gate fails. Diagnose it and ask the developer whether to
fix it first, narrow scope, or record it as an accepted pre-existing failure.
Never silently reclassify it as a migration regression or ignore it.

Exit only with a green baseline or explicit approval for each named
pre-existing failure, plus green characterization tests.

## Stage 4: Classify and approve the target contract

Divide the scope into stable migration units. For each unit, record one target
lifecycle using the values accepted by the installed manifest schema and one
evidence classification. Use repository evidence and
[references/assessment-and-contract.md](references/assessment-and-contract.md)
to explain the choice.

The engine may identify risk but cannot choose lifecycle intent. `unresolved`
is a stop state. Pause for the developer when either platform-shared behavior
or producer-per-direct-subscription behavior is plausible, or when Subject
semantics, cancellation, scheduler ordering, error behavior, interop, or a
public behavior change is not proved.

Intentional divergences require a concrete old claim, proposed Next claim,
user impact, evidence, and developer approval. Validate the manifest
structurally, then run the installed readiness assessment. Do not proceed with
a batch containing unresolved intent or required pending approval.

Exit only when the developer has approved every ambiguous choice and
intentional divergence needed for the next batch.

## Stage 5: Plan and dry-run bounded engine changes

Inspect the installed capability registry and select only entries whose
version, source form, arity, preconditions, and executable evidence match the
approved unit. Do not infer support from a familiar name. Follow
[references/engine-and-batches.md](references/engine-and-batches.md).
When the batch contains RxJS 7 marble tests, also read
[references/test-migration.md](references/test-migration.md).

Run `rxjs-migrate` without `--write` using explicit provenance and, when
required, the approved `cold` or `platform` mode. Preserve the current test
framework unless a supported adapter was separately selected. Capture the
versioned JSON report, changed paths, structured diagnostics, and exit code.

Pause when a diagnostic requires review or refuses a transform, when output
would escape authorized paths, when source does not match the capability
evidence, or when batch size or semantic reach exceeds the reviewed scope.
Never conceal unsupported segments inside a partially transformed pipeline.

Exit only after diagnostics and changed-file scope are reviewed and the
developer has approved any newly broadened batch.

## Stage 6: Apply one small migration batch

Apply only the reviewed dry-run plan. Require an explicit write destination
inside the authorized project and preserve source provenance. Do not overwrite
existing output without specific approval. Review the resulting diff before
additional edits.

Format through the project's normal tools. Ensure ordinary project-owned
source and direct test declarations remain; do not leave dynamic generators,
hidden case registries, or compatibility assertion layers in the result.

Immediately check parsing, the narrowest useful type boundary, and engine
idempotence. Re-running the same transform must produce no new source change
and stable diagnostics. If it does not, restore the affected batch to the
reviewed starting point and report an engine defect.

Exit only when the batch parses, type-checks at its narrow boundary, is
idempotent, and every diagnostic is resolved, carried forward, or escalated.

## Stage 7: Build, test, diagnose, and repair

Run focused characterization and migrated tests first, then the agreed project
gates. Classify every failure as a migration defect, RxJS Next product gap,
intentional divergence, environment/baseline issue, or still-unknown result.
Use [references/verification-and-closeout.md](references/verification-and-closeout.md)
for the repair rules.

Repair migration defects in a small batch and repeat the relevant gates. For a
product gap, preserve the failing evidence and report it; do not disguise it
with a local replacement. For an intentional divergence, change an expectation
only after the manifest records approved new behavior and user impact.

Pause before any repair that changes public behavior, weakens evidence,
expands writes, changes dependencies beyond the reviewed plan, needs external
access, or introduces a compatibility layer.

Exit only when agreed gates pass or each remaining red result has a named,
evidenced, explicitly accepted blocker.

## Stage 8: Close out and hand off

Update the contract manifest and report with exact source and target versions,
engine version, capability-registry version, canonical Skill digest, baseline,
units, diagnostics, divergences, final commands/results, and blockers. Validate
the manifest with the installed schema and assess readiness separately.

Review [references/review-checklist.md](references/review-checklist.md). Report:

1. what behavior and lifecycle contract changed;
2. what source and tests changed;
3. the exact gates run and their results;
4. migration defects repaired versus product gaps retained;
5. approved divergences and environment limitations; and
6. remaining blockers, owners, evidence, and acceptance.

Claim completion only when readiness is `ready`, or
`ready-with-accepted-blockers` when the developer intentionally chose that
outcome. Otherwise hand off the migration as incomplete with the next concrete
decision or action.
