# Migration closeout checklist

## Authority and provenance

- Repository instructions, scope, allowed writes, package manager, and network
  policy were recorded before broad changes.
- Existing work was protected and every changed file is within the authorized
  migration boundary.
- Source repository/revision, RxJS versions, engine version, registry version,
  and canonical Skill digest are exact and reproducible.
- The installed Skill content matches the installed `@rxjs/migrate` package.

## Baseline and coverage

- Agreed build, type, lint, test, and behavior gates were run on unchanged
  RxJS 7 source.
- Every baseline failure is either fixed or explicitly recorded as pre-existing
  with developer acceptance.
- Each lifecycle-sensitive path is linked to existing coverage,
  characterization, explicit unsupported status, or an accepted uncovered
  risk.
- Characterization tests passed against RxJS 7 before dependency/source
  migration.

## Target contract

- Every unit has stable source locations, a behavioral claim, one target
  lifecycle, an evidence classification, and supporting evidence.
- No required unit remains unresolved or pending approval.
- Platform sharing and producer-per-direct-subscription behavior were selected
  intentionally rather than inferred from syntax.
- Subjects, repeated subscriptions, cancellation, teardown, timing, errors,
  and input conversion were reviewed where applicable.
- Every intentional divergence records old and new claims, user impact,
  evidence, approver, timestamp, and rationale.

## Mechanical batches

- Capability decisions came from the installed versioned registry; no copied
  operator list or name-only match was used.
- Each engine operation ran dry first with exact provenance and an explicit
  lifecycle mode when required.
- The dry-run scope, diagnostics, and changed paths were reviewed before write.
- Refused or unsupported source remains visible and was not smuggled through a
  partial transform.
- Writes stayed within the approved destination and did not overwrite local
  content without explicit approval.
- Output preserves ordinary project-owned source, direct tests, assertions,
  and the selected framework.
- Every applied transform is parseable, type-checkable at its narrow boundary,
  and idempotent with stable diagnostics.

## Verification and handoff

- Focused characterization/migrated tests and all agreed project gates were
  run with exact commands, environments, exit codes, and results.
- Failures are classified as migration defects, product gaps, intentional
  divergences, baseline/environment issues, or unresolved—not relabeled for a
  green report.
- No test was weakened, skipped, deleted, or replaced without explicit
  developer approval and a recorded contract change.
- Schema validation and readiness assessment were both run; one is not being
  used as a substitute for the other.
- All diagnostics are resolved, carried with an owner, or represented by an
  explicitly accepted blocker.
- The final report states measured outcomes and limitations without claiming
  general automatic migration.
