# RxJS 7 marble-test port notes

## Scope and source

The repository-specific port reads the production `7.x` ref through the Git
object store. It does not check out, modify, or commit to that ref.

- **Source ref:** `7.x`
- **Pinned source commit:** `e5351d02e225e275ac0e497c7b66eaa5f0c88791`
- **Physical declarations:** 2,201 `it`, `test`, or `specify` declarations
  under `spec/` that use `TestScheduler` or its marble assertion helpers
- **Parameterized registrations:** 169 expanded cases declared by loops or
  shared helpers
- **Complete registrations:** 2,338, including all four pre-existing
  source-skipped cases

The generated manifest at
`packages/rxjs/test/ported/manifest.generated.json` is the authoritative
per-case ledger. Every entry retains a unique case ID, source provenance,
original source, mechanical conversion, classification, disposition,
capability requirements, and review flags. Parameterized declarations expand
to distinct registrations so no behavioral variant is hidden behind one
source location.

## Reconciled dispositions

| Disposition          |     Cases | Meaning                                                                                       |
| -------------------- | --------: | --------------------------------------------------------------------------------------------- |
| Active               |       401 | Converted case currently passes in the reviewed ColdObservable baseline                       |
| Expected failure     |       506 | Converted case is executable but exposes an implementation, lifecycle, or conversion mismatch |
| Missing API          |     1,416 | Converted test runs to a source-linked missing-capability diagnostic                          |
| Deduplicated         |         4 | Exact normalized duplicate; points to one canonical source claim                              |
| Unsupported/obsolete |        11 | Retained runnable diagnostic for an obsolete scheduler-internal dependency                    |
| **Total**            | **2,338** |                                                                                               |

The compatibility classifications are separate from execution dispositions:
871 portable, 209 harness rewrites, 1,247 compatibility-only, and 11
unsupported-or-obsolete. A classification says what the old claim means; a
disposition says what the current port harness does with it.

### Source categories

| Category                | Cases |
| ----------------------- | ----: |
| Operators               | 1,928 |
| Creation observables    |   255 |
| Schedulers              |    81 |
| Deprecation equivalents |    48 |
| Subjects                |     7 |
| Root Observable         |     7 |
| Scheduled               |     4 |
| Root Subject            |     4 |
| Root Notification       |     3 |
| Testing                 |     1 |

## Recorded mode results

The complete reviewed pass sets are stored in `verified-cold-passes.json` and
`verified-polyfill-passes.json`. Baseline schema v2 identifies tests by unique
case ID, not an ambiguous source line.

- Cold audit: 432 passes and 1,906 failures.
- Polyfill audit: 436 passes and 1,902 failures.
- Native: deliberately raw and unverified until a realm with a native global
  `Observable` is available for review.

Passing entries are evidence only for their recorded claims, not a general
compatibility or platform-conformance claim. They do not control the default
runner. Cold, polyfill, and native-if-present modes register every applicable
case as an ordinary test, including the four exact duplicates and all known
gaps, so each registration receives an unmodified pass or failure result.

## Deduplicated claims

Four exact normalized duplicates were consolidated without losing provenance:

| Duplicate                                 | Canonical claim                                   |
| ----------------------------------------- | ------------------------------------------------- |
| `spec/observables/concat-spec.ts:364`     | `spec/observables/concat-spec.ts:310`             |
| `spec/observables/concat-spec.ts:378`     | `spec/observables/concat-spec.ts:324`             |
| `spec/operators/combineLatest-spec.ts:13` | `spec/operators/combineLatest-legacy-spec.ts:197` |
| `spec/operators/tap-spec.ts:260`          | `spec/operators/tap-spec.ts:15`                   |

## Missing capabilities

Missing-API cases remain compiled, executable migration definitions. The
harness does not import nonexistent modules or invent replacements. Counts can
overlap because one case may require several capabilities.

| Capability                   | Affected cases |
| ---------------------------- | -------------: |
| `operator:share`             |            176 |
| `rxjs:asapScheduler`         |            133 |
| `rxjs:scheduled`             |            132 |
| `rxjs:config`                |            128 |
| `operator:map`               |             85 |
| `operator:refCount`          |             74 |
| `operator:tap`               |             72 |
| `rxjs:queueScheduler`        |             71 |
| `operator:multicast`         |             70 |
| `operator:publishReplay`     |             69 |
| `operator:publish`           |             64 |
| `operator:publishBehavior`   |             62 |
| `operator:publishLast`       |             61 |
| `operator:connect`           |             50 |
| `rxjs:AsyncSubject`          |             48 |
| `operator:take`              |             47 |
| `operator:zipAll`            |             46 |
| `rxjs:ConnectableObservable` |             45 |
| `operator:delay`             |             43 |
| `rxjs:forkJoin`              |             39 |

The generated parity map and manifest contain the complete capability list and
every affected case.

## Cases requiring human review

Only 11 cases remain classified unsupported or obsolete:

| Rationale                                                              | Cases |
| ---------------------------------------------------------------------- | ----: |
| Depends on scheduler-bound `phonyMarbelize` parser/notification state  |     8 |
| Protects `TestScheduler` parser or queue internals, not Observable use |     3 |

They have not been deleted or reduced to metadata. Each retains its converted
program and is registered in every mode, where it produces an explicit
source-linked diagnostic. One mechanically converted
`createHotObservable()` case is guarded as a known non-terminating conversion
instead of being allowed to hang the entire suite.

## Execution modes and lifecycle differences

Each mode starts in a separate process so the active constructor is selected
before RxJS Symbol extensions load. The launcher shards the 2,338 registrations
across isolated workers and merges audits only after proving unique, complete
case-ID coverage.

- **Cold:** installs the fallback, then activates `ColdObservable`. This is the
  producer-per-subscription compatibility baseline.
- **Polyfill:** activates the RxJS platform fallback and its shared,
  ref-counted producer lifecycle.
- **Native:** preserves the ambient `globalThis.Observable`. It skips
  explicitly when the current realm has no native constructor and reports an
  acquisition blocker if extension loading replaces that constructor.

Platform cases use the ambient `Observable` type and constructor; they never
import the fallback constructor. Five dedicated lifecycle cases verify shared
activation, individual cancellation, ref-count teardown and restart, and
direct construction through the global constructor.

The capability registry maps RxJS 7 names to exact, partial, unified, or
platform-only Next surfaces. Pipeable code is invoked as
`source[targetSymbol](...adaptedArgs)`. Examples include:

- `bufferCount(size) → source[buffer]({ maxSize: size })`;
- `firstValueFrom(source) → source.first()`;
- `lastValueFrom(source) → source.last()`;
- `endWith(...values) → source[concat]([values])`;
- `onErrorResumeNext(...sources) → source[onErrorResumeNext]([sources])`.

Unsupported overloads remain explicit parity failures. Same-name platform
string methods are documented as analogues but do not falsely satisfy the
required RxJS Symbol surface.

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
auto-detects the global constructor. All of these commands are intentionally
nonzero while parity failures remain. The older audit command names remain as
single-mode aliases for producing complete JSON evidence. Vitest arguments
pass through, so a focused run can use:

Default commands suppress thousands of successful internal case IDs.
Interactive terminals show one in-place progress line, refreshed when a shard
finishes and every ten seconds, with completed, running, queued, failed, and
elapsed counts. Redirected and CI output receives only one final progress
summary. Once all shards have run, every failed shard's diagnostics are
expanded and the process finishes with an explicit uppercase `PASS` or `FAIL`.
Set
`RXJS_NEXT_PROGRESS_INTERVAL_MS` to a positive millisecond value to adjust the
heartbeat interval. Passing explicit Vitest arguments opts into direct
reporter output when individual case detail is useful.

```sh
yarn workspace rxjs test:ported:audit -- --testNamePattern mergeMap
```

To refresh a reviewed baseline, first produce a complete JSON audit and then
record it:

```sh
yarn workspace rxjs test:ported:audit -- --reporter=json --outputFile=/tmp/cold-audit.json
yarn workspace rxjs test:ported:audit:record cold /tmp/cold-audit.json
```

The recorder rejects partial, skipped, duplicate, or stale case-ID coverage.

## Verification on 2026-07-25

- Manifest generation produced 2,338 syntactically valid executable programs
  with unique case IDs, including 169 parameterized registrations and all four
  source-skipped cases.
- The former normal cold and polyfill gates each completed all 2,338
  registrations through their then-current reviewed pass/quarantine
  dispositions.
- Complete sharded JSON audits merged exactly 2,338 results per mode: cold
  recorded 432 passes and 1,906 failures; polyfill recorded 436 passes and
  1,902 failures.
- Native auto-detection skipped explicitly in Node `24.12.0`, where no native
  global Observable was present.
- The five dedicated platform-lifecycle tests pass in polyfill mode.
- Skill helper fixtures and the nine-file portability scan pass.
- The package TypeScript check emits no diagnostic for
  `packages/rxjs/test/ported`; the overall check remains nonzero on documented
  production-source extension and type errors.
- No production implementation was changed by the exhaustive port.

## Strict-runner verification on 2026-07-25

- The default `test:ported` command registered all 2,338 applicable cases with
  ordinary test semantics in each mode; recorded baselines did not participate
  in registration.
- Regenerated failure reasons use “failing parity evidence” rather than stale
  quarantine language; classifications, dispositions, and converted programs
  are unchanged.
- All 16 cold shards completed in 84 seconds and all 16 polyfill shards
  completed in 94 seconds. Every shard exposed at least one failure, all failed
  shard diagnostics were expanded, and the command returned exit code 1.
- The in-place status continued refreshing while the slowest shard ran after
  the other 15 had completed, demonstrating that the launcher remained active
  without adding repeated progress lines.
- No production Observable, operator, or compatibility implementation changed.

## Skill boundary

The reusable migration guidance lives in
`.agents/skills/rxjs-next-marble-migration`. It understands RxJS 7 marble
semantics, `rxTest`, cold compatibility, Symbol-based operator calls, and the
global platform Observable, but contains no repository paths, branches, commit
identifiers, package internals, or source-control commands.

Repository revision discovery, provenance, capability loading, dispositions,
mode launchers, and baselines remain outside the Skill. Broader
Skill/plugin/MCP distribution is still a separate product decision.
