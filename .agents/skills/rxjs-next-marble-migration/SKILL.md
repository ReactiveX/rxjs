---
name: rxjs-next-marble-migration
description: Migrate RxJS 7 TestScheduler marble tests to RxJS Next rxTest while preserving the project's test framework, separating ColdObservable compatibility from shared platform Observable behavior, and recording missing APIs or semantic divergences. Use when application, library, or standalone test files contain TestScheduler.run, cold/hot marbles, expectObservable, expectSubscriptions, time, animate, or flush.
---

# RxJS Next marble migration

Migrate behavioral evidence, not just syntax. Preserve the original test
framework and test intent while making the Observable lifecycle explicit.

## Inputs

Derive these from the selected files and project before asking:

- the RxJS 7 test files or individual cases;
- the existing test framework and assertion style;
- the RxJS Next operators available to the project;
- whether the project wants cold compatibility, platform behavior, or both;
- which environments can provide a native global `Observable`.

Do not change test frameworks unless the user separately requests it.

## Workflow

1. **Inventory the selected tests.** Run
   `node scripts/analyze-marble-tests.mjs <paths...>` from this Skill directory,
   or inspect the same features manually. Treat duplicate fingerprints as
   review candidates, not automatic deletion.
2. **State each behavioral claim.** Write one sentence describing what the old
   case proves before editing it.
3. **Classify the case.** Use
   [references/classification-and-reporting.md](references/classification-and-reporting.md).
4. **Create the cold baseline first.** Replace `TestScheduler.run` with
   `rxTest`, keep the existing outer `describe`/`it`/`test` API, and preserve
   marble values, errors, and subscription assertions.
5. **Build a capability map, then convert composition.** For every imported
   operator or creation function, record its exact Next Symbol, unified Next
   Symbol plus argument adapter, ambient-platform construction, or missing
   status. Replace pipeable calls only after checking that mapping and its
   supported overloads. Never infer parity from a similar name alone.
6. **Review lifecycle assumptions.** Read
   [references/execution-models.md](references/execution-models.md). Separate
   producer-per-subscription expectations from platform sharing, ref counting,
   cancellation, and restart behavior.
7. **Add platform coverage.** Use `observable()` for platform marble sources
   and the ambient/global `Observable` for direct construction. Never import
   the platform constructor from a polyfill module.
8. **Handle time and cancellation.** Await asynchronous `flush()` calls. Remove
   scheduler arguments only when the corresponding Next API is documented to
   use a host timing API virtualized by `rxTest`.
9. **Deduplicate by claim.** Consolidate exact or semantic duplicates only
   after confirming that operator surface, lifecycle mode, cancellation, and
   error behavior are identical. Preserve every source case in the report.
10. **Verify and report.** Run the narrowest type and test checks. Fix migration
    mistakes, but record implementation failures, missing APIs, and intentional
    differences instead of changing the library under test.

Read [references/conversion-guide.md](references/conversion-guide.md) for the
mechanical mappings and [references/examples.md](references/examples.md) for
complete before/after examples.

## Required safeguards

- Preserve the project's test framework, assertion library, naming, and local
  helpers unless a change is required by `rxTest`.
- Return or await the `Promise<void>` from `rxTest`.
- Keep cold compatibility tests and platform tests visibly distinct.
- Run native and polyfill platform suites in isolated realms or processes so
  constructor selection and Symbol installation happen before test modules
  evaluate.
- Skip native mode explicitly when the realm did not already provide
  `Observable`; do not call the polyfill path “native.”
- Do not weaken an expectation merely to obtain a passing result.
- Keep unsupported overloads of a unified capability runnable so their
  behavioral gaps remain visible; do not downgrade the entire API to missing.
- Do not make production changes unless the user separately asks to fix the
  behavior exposed by the migrated test.

## Output

Deliver:

1. migrated test files or reviewable patches;
2. a migration report based on
   [assets/migration-report-template.md](assets/migration-report-template.md);
3. verification results separated into migration failures and product
   failures.
