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
| Active               |     2,119 | Converted case currently passes in the reviewed cold baseline                                 |
| Expected failure     |       215 | Converted case is executable but exposes an implementation, lifecycle, or conversion mismatch |
| Missing API          |         0 | No inventoried case is currently blocked on an unmapped public API                            |
| Deduplicated         |         4 | Exact normalized duplicate; points to one canonical source claim                              |
| Unsupported/obsolete |         0 | No registration is currently reduced to an obsolete-harness diagnostic                        |
| **Total**            | **2,338** |                                                                                               |

The compatibility classifications are separate from execution dispositions:
1,885 portable, 418 harness rewrites, 20 intentional divergences, and 15
compatibility-only cases. A classification says what the old claim means; a
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

- Cold audit: 2,299 passes and 39 failures.
- Polyfill audit: 2,316 passes and 22 failures.
- Native: deliberately raw and unverified until a realm with a native global
  `Observable` is available for review.

Passing entries are evidence only for their recorded claims, not a general
compatibility or platform-conformance claim. They do not control the default
runner. Cold, polyfill, and native-if-present modes register every applicable
case as an ordinary test, including the four exact duplicates and all known
gaps, so each registration receives an unmodified pass or failure result.

The Phase 3 audit accounts for every remaining failure. Cold mode retains 24
`intentional-divergence` lifecycle claims and 15 `compatibility-only`
arbitrary-subscribable claims. Polyfill mode retains seven of those lifecycle
divergences and the same 15 compatibility-only claims. Neither mode has a
failing `portable` or `harness-rewrite` claim, a skipped registration, or a
pending registration.

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

No registration is currently classified as unsupported or obsolete. All
2,338 cases have executable conversions. Expected failures remain ordinary
tests and retain their source-linked provenance for product review.

## Execution modes and lifecycle differences

Each mode starts in a separate Vitest process so the active constructor is
selected before RxJS Symbol extensions load. A one-time migration produced 147
ordinary `.spec.ts` files per mode, with 2,338 direct `rxTest` cases and no
runtime registration script. Those files are now checked-in source owned by
this repository; there is no test-file generator in the contributor workflow.

- **Cold:** installs the fallback as the platform base without replacing the
  global with `ColdObservable`. `cold()` and explicit cold factories use
  `ColdObservable`; derived results from `hot()` use the platform constructor.
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
pnpm --filter rxjs run test:unit
pnpm --filter rxjs run test:unit:cold
pnpm --filter rxjs run test:unit:polyfill
pnpm --filter rxjs run test:unit:native
pnpm --filter rxjs run test:unit:audit
pnpm --filter rxjs run test:unit:audit:polyfill
pnpm --filter rxjs run test:unit:report
pnpm --filter rxjs run test:unit:parity:generate
pnpm --filter rxjs run test:unit:parity:check
```

`test:unit` runs the focused source specs followed by the normal cold and
polyfill modes. `test:unit:native` auto-detects the global constructor. The
parity commands are intentionally nonzero while failures remain. Normal runs
use Vitest's built-in default reporter unchanged, so failures point to the real
checked-in file and line. A focused run can use Vitest's normal filtering:

```sh
pnpm --filter rxjs run test:unit:audit test/ported/cold/operators/merge-map.spec.ts -t "behavior name"
```

To refresh a reviewed baseline, first produce a complete JSON audit and then
record it:

```sh
pnpm --filter rxjs run test:unit:audit --reporter=json --outputFile=/tmp/cold-audit.json
pnpm --filter rxjs run test:unit:audit:record cold /tmp/cold-audit.json
```

The recorder rejects partial, skipped, duplicate, or stale coverage. It maps
Vitest results to case IDs through the static migration report and declaration
order, so human test names contain no machine-only prefixes.

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

- The default `test:unit` command registered all 2,338 applicable cases with
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

## Real-file reporter verification on 2026-07-31

- Replaced the dynamic registration launcher with 147 formatted Vitest files
  per mode. Each test imports and calls `rxTest` directly; the repository owns
  the files after the one-time migration.
- Removed the custom shard/progress renderer. The normal commands now use
  Vitest's public built-in default reporter unchanged, including real clickable
  repository paths and line numbers.
- Cold tests name `ColdObservable` explicitly instead of replacing
  `globalThis.Observable`. Hot fixtures derive ordinary instances of the active
  platform constructor; `observable()` continues to use that constructor
  directly.
- Complete built-in JSON audits recorded 2,296/2,338 cold passes and
  2,316/2,338 polyfill passes. Audit identity comes from the static migration
  report rather than machine IDs embedded in test titles.
- Native mode skipped explicitly in Node `24.12.0`, where no native global
  Observable was present.

## Skill boundary

Reusable migration tooling is published from `packages/migrate` as
`@rxjs/migrate`. P0.M1 established a framework-neutral semantic transform,
caller-supplied capability-map boundary, dry-run-first CLI, bundled Skill,
Mocha/Chai-to-Vitest adapter, and source-content-only read-only MCP prototype.
D-046 accepts only the deterministic engine, one canonical Skill, and thin
harness adapters as the release product; P0.M3 removes the MCP prototype.
Other test frameworks can preserve their syntax or provide another adapter.

Repository-specific revision discovery, dispositions, native/polyfill mode
launching, and reviewed baselines remain outside the package. The static
`migration-report.json` preserves source-to-owned-file identity without making
the migration tool part of normal test execution.
