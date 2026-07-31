---
name: rxjs-next-test-migration
description: Migrate RxJS 7 TestScheduler marble specs to ordinary RxJS Next rxTest specs with explicit cold or platform lifecycle semantics, source provenance, and optional test-framework adapters.
---

# RxJS Next test migration

Use `@rxjs/migrate` to produce a reviewable one-time patch. Keep migration
semantics separate from the test-framework adapter.

1. Record the source repository, exact SHA, and path for every input.
2. Choose `cold` for producer-per-subscription evidence or `platform` for the
   shared, ref-counted platform lifecycle. Do not infer this choice from the
   output directory.
3. Supply the project's reviewed capability map. A matching operator name is
   not proof of a matching RxJS Next contract.
4. Run the CLI without `--write` first. Review every missing capability,
   scheduler, multiple-observer, and unsupported assertion diagnostic.
5. Add `--write --out-dir <dir>` only after reviewing the dry run. Generated
   files are ordinary local `.spec.ts` files, not a runtime-generated suite.
6. Run the narrowest type and test checks in the target project.

For Mocha/Chai sources that are intentionally moving to Vitest, select
`--framework mocha-chai-vitest`. Unsupported assertion forms are preserved and
reported; convert them manually rather than adding a compatibility assertion
layer.

Read [references/review-checklist.md](references/review-checklist.md) before
accepting output. Use [assets/migration-report.md](assets/migration-report.md)
to record semantic decisions and remaining product gaps.
