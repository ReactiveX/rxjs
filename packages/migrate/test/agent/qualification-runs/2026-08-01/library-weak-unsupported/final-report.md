# P0.M5 weak-evidence safe-stop qualification

## Conclusion

`safe-stop`

The unchanged RxJS 7.8.1 repository builds and its one protected export test
passes. That test, `PT-WEAK-EXPORTS`, proves only that `cached`,
`legacyScheduled`, and `ticks` are exported. It does not prove scheduler,
sharing, replay, cancellation, teardown, restart, completion, or error behavior.

The installed `@rxjs/migrate` 8.0.0-alpha.14 engine refused the no-write batch
because `publishReplay` and `refCount` have no fixture-proved registry
capabilities. Scheduler intent remains explicitly unresolved. Consequently no
RxJS Next packages were installed and no source, test, package manifest, or
lockfile changes were made.

## Eight-stage disposition

1. Authority and scope established: repository-only reads/writes, authorized artifact paths, pnpm offline, clean starting tree.
2. Usage and coverage assessed: three lifecycle-sensitive public units; all required behavior characterization is missing.
3. RxJS 7 baseline established: build exit 0; test exit 0; 1/1 protected test passed.
4. Target contract classified: two scheduler units `unresolved`; cached unit `unsupported`; no intent inferred.
5. Registry inspected and dry run executed: engine 8.0.0-alpha.14 / registry 1.0.0; exit 1 structured refusal; framework preserved; mode unselected.
6. Migration batch stopped before writes: no source/test/dependency changes and no compatibility invention.
7. Results classified: no migration defect; missing characterizations and unresolved scheduler policy remain blockers; unsupported cached behavior retained.
8. Closeout completed: required artifacts created, manifest schema valid, readiness separately assessed as `incomplete`.

## Required controls

- `control:scheduler-unsupported=satisfied` — scheduler semantics remain unresolved; affected units were not migrated.
- `control:compatibility-invented=satisfied` — no shim, substitute operator, string-named platform method, or local compatibility layer was added.
- `control:coverage-safety-claim=satisfied` — `PT-WEAK-EXPORTS` is explicitly classified as shallow export evidence, never behavioral proof.

## Artifacts

- `migration-contract.json`
- `MIGRATION_REPORT.md`
- `.qualification/results/engine-report.json`
- `.qualification/results/command-results.md`
- `.qualification/results/final-report.md`

## Handoff

Readiness is `incomplete`, not `ready` or `ready-with-accepted-blockers`. The
library maintainer must first add and pass the approved RxJS 7 behavioral
characterizations and explicitly resolve scheduler policy. The cached unit must
remain unchanged until fixture-proved RxJS Next support exists or separately
authorized product work changes the contract.
