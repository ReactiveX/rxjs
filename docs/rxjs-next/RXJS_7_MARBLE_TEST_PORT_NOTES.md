# RxJS 7 marble-test port notes

## Scope and source

The repository-specific port reads the production `7.x` ref through the Git
object store. It does not check out, modify, or commit to that ref.

- **Source ref:** `7.x`
- **Pinned source commit:** `e5351d02e225e275ac0e497c7b66eaa5f0c88791`
- **Inventory:** 2,146 non-skipped `it`, `test`, or `specify` cases under
  `spec/` that use `TestScheduler` or its marble assertion helpers
- **Excluded source skips:** four pre-existing `it.skip` cases in
  `Observable`, `groupBy`, `repeatWhen`, and `take`

The generated manifest at
`packages/rxjs/test/ported/manifest.generated.json` is the authoritative
per-case ledger. Every entry retains its source ref, commit, path, line, suite,
title, original source, classification, disposition, reason, imports, review
flags, and a converted program when a mechanical conversion is possible.

## Reconciled dispositions

| Disposition          |     Cases | Meaning                                                                                       |
| -------------------- | --------: | --------------------------------------------------------------------------------------------- |
| Active               |       333 | Converted case currently passes in the ColdObservable baseline                                |
| Expected failure     |       422 | Converted case is executable but exposes an implementation, lifecycle, or conversion mismatch |
| Missing API          |     1,251 | Converted test is registered but its required mapped capabilities do not yet exist            |
| Deduplicated         |         4 | Exact normalized duplicate; points to one canonical source claim                              |
| Unsupported/obsolete |       136 | Scheduler-internal, dynamically declared, or dependent on non-portable harness state          |
| **Total**            | **2,146** |                                                                                               |

The compatibility classifications are separate from execution dispositions:
757 portable, 47 harness rewrites, 1,252 compatibility-only, and 90
unsupported-or-obsolete. A classification says what the old claim means; a
disposition says what the current port harness does with it.

### Source categories

| Category                | Cases |
| ----------------------- | ----: |
| Operators               | 1,826 |
| Creation observables    |   254 |
| Schedulers              |    36 |
| Subjects                |     7 |
| Deprecation equivalents |     6 |
| Root Observable         |     6 |
| Scheduled               |     4 |
| Root Subject            |     4 |
| Root Notification       |     3 |

## Verified mode baselines

The complete source-linked pass sets are stored in
`verified-cold-passes.json` and `verified-polyfill-passes.json`. The cold audit
currently passes 335 locations; two are retained as deduplicated provenance, so
333 canonical cases have the `active` disposition. The polyfill audit passes
340 locations. Passing entries are evidence only for their recorded claims,
not a general compatibility or platform-conformance claim.

Normal mode runs execute verified locations ordinarily, quarantine known
failures, and skip the four exact duplicates. Audits ignore both the quarantine
and duplicate skip so the raw totals remain independently measurable.

## Deduplicated claims

Four exact normalized duplicates were consolidated without losing provenance:

| Duplicate                                 | Canonical claim                                   |
| ----------------------------------------- | ------------------------------------------------- |
| `spec/observables/concat-spec.ts:364`     | `spec/observables/concat-spec.ts:310`             |
| `spec/observables/concat-spec.ts:378`     | `spec/observables/concat-spec.ts:324`             |
| `spec/operators/combineLatest-spec.ts:13` | `spec/operators/combineLatest-legacy-spec.ts:197` |
| `spec/operators/tap-spec.ts:260`          | `spec/operators/tap-spec.ts:15`                   |

## Missing capabilities

Missing-API cases remain compiled migration definitions in the manifest. The
harness does not import nonexistent modules or guess replacements. Counts can
overlap because one case may require several capabilities.

| Capability                      | Affected cases |
| ------------------------------- | -------------: |
| `rxjs:pipe`                     |             90 |
| `operator:map`                  |             78 |
| `rxjs:queueScheduler`           |             71 |
| `operator:zipAll`               |             46 |
| `rxjs:ConnectableObservable`    |             45 |
| `operator:tap`                  |             41 |
| `operator:take`                 |             40 |
| `rxjs:forkJoin`                 |             39 |
| `rxjs:TimeoutError`             |             34 |
| `operator:delay`                |             32 |
| `operator:zipWith`              |             32 |
| `rxjs:EMPTY`                    |             31 |
| `operator:combineLatestAll`     |             31 |
| `operator:refCount`             |             25 |
| `operator:single`               |             25 |
| `operator:skip`                 |             24 |
| `operator:count`                |             23 |
| `operator:groupBy`              |             23 |
| `operator:distinct`             |             22 |
| `operator:distinctUntilChanged` |             22 |
| `operator:every`                |             22 |

The manifest contains the complete capability list and every affected case.

## Unsupported or obsolete cases

| Rationale                                                                    | Cases |
| ---------------------------------------------------------------------------- | ----: |
| Protects `TestScheduler` internals rather than Observable behavior           |    55 |
| Declared inside a loop or helper and needs expansion with runtime parameters |    32 |
| Depends on scheduler-bound `expectObservableArray` state                     |    14 |
| Depends on scheduler-bound `getTimerSelector` state                          |    14 |
| Depends on scheduler-bound `phonyMarbelize` state                            |     7 |
| Depends on the non-portable `NO_SUBS` test helper                            |     6 |
| Depends on the non-portable `lowerCaseO` test helper                         |     4 |
| Depends on the non-portable `asInteropObservable` test helper                |     4 |

These cases were not silently deleted. They remain source-linked records for
later human review.

## Execution modes and lifecycle differences

Each mode starts in a separate process so the active constructor is selected
before RxJS Symbol extensions load.

- **Cold:** installs the fallback, then activates `ColdObservable`. This is the
  producer-per-subscription compatibility baseline.
- **Polyfill:** activates the RxJS platform fallback and its shared,
  ref-counted producer lifecycle.
- **Native:** preserves the ambient `globalThis.Observable`. The mode skips
  explicitly when the current realm has no native constructor.

Platform cases use the ambient `Observable` type and constructor; they never
import the fallback constructor. Three dedicated lifecycle cases verify one
shared activation, restart after the last observer leaves, and direct
construction through the global constructor.

All 2,146 cases are registered in cold, polyfill, and native-if-present modes.
Mode-specific verified-pass baselines run normally; every other non-duplicate
registration uses expected-failure quarantine. Missing APIs fail with a
source-linked capability diagnostic, and removed scheduler/harness machinery
fails with a source-linked harness diagnostic. Separate cold and polyfill
audits remove the quarantine and expose every result directly.

The capability registry maps RxJS 7 names to exact or unified Next surfaces.
For example, `bufferCount(size)` executes as
`source[buffer]({ maxSize: size })`; cases using overlapping
`startBufferEvery` windows remain runnable failures. Root functions can map to
a static Symbol or an ambient-platform construction such as
`of(...values) → Observable.from(values)`. Unsupported overloads are not
silently treated as supported.

## Commands

From the repository root:

```sh
yarn workspace rxjs test:ported
yarn workspace rxjs test:ported:cold
yarn workspace rxjs test:ported:polyfill
yarn workspace rxjs test:ported:native
yarn workspace rxjs test:ported:audit
yarn workspace rxjs test:ported:audit:polyfill
yarn workspace rxjs test:ported:report
yarn workspace rxjs test:ported:parity:generate
yarn workspace rxjs test:ported:parity:check
```

`test:ported` runs the normal cold and polyfill modes. `test:ported:native`
auto-detects the global constructor. Both audit commands are intentionally
nonzero while expected failures remain. Vitest arguments pass through, so a
focused parity audit can use, for example:

```sh
yarn workspace rxjs test:ported:audit -- --testNamePattern mergeMap
```

To refresh a reviewed mode baseline from a complete JSON audit:

```sh
yarn workspace rxjs test:ported:audit -- --reporter=json --outputFile=/tmp/cold-audit.json
yarn workspace rxjs test:ported:audit:record cold /tmp/cold-audit.json
```

The generated API-level status map is
[`RxJS-7-parity.md`](RxJS-7-parity.md). It records 113 RxJS 7 pipeable
operators and 34 creation/utility functions, their current Symbol/static/
standalone mapping, affected marble-case counts, and every missing surface.

## Verification on 2026-07-25

- The generated manifest reproduced byte-for-byte with SHA-256
  `3d3b80539792bf84ea2b0538d17a8a9d253d70ef69ed9d02efd9e3e493acb31c`.
- The normal cold run registered all 2,146 source cases: 2,142 passed and four
  exact duplicates skipped.
- The normal polyfill run registered all 2,146 source cases with the same
  2,142/4 result, plus three passing dedicated platform-lifecycle cases.
- Native auto-detection skipped four registrations in Node `24.12.0`, where no
  native global Observable was present.
- The cold audit produced 335 passes and 1,811 expected failures; the polyfill
  audit produced 340 passes and 1,806 expected failures.
- The package TypeScript check emitted no diagnostic for
  `packages/rxjs/test/ported`; it remains nonzero on the previously documented
  production-source extension and type errors.
- The package ESLint configuration still points RxJS files at
  `packages/observable/tsconfig.json`, so a direct lint of the new test files is
  blocked by the existing P0.3 configuration defect rather than code
  diagnostics.

## Skill boundary

The reusable migration guidance lives in
`.agents/skills/rxjs-next-marble-migration`. It knows about RxJS 7 marble
semantics, `rxTest`, cold compatibility, and the global platform Observable,
but contains no repository paths, branches, commit identifiers, package
internals, or source-control commands.

The source inventory, pinned revision, dispositions, capability registry,
isolated mode launcher, and generated manifest are deliberately
repository-specific and remain outside the Skill. Broader Skill/plugin/MCP
distribution is still a separate product decision.
