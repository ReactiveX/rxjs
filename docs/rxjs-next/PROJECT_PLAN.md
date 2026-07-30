# RxJS Next active project plan

## Executive summary

The project will establish a reliable platform Observable foundation before
expanding the operator catalog or compatibility promises. The user temporarily
prioritized the attested Observable WPT harness and fallback-conformance work
ahead of the package and installation decision. Both slices are complete:
the fallback passes the pinned suite while exact implementation identity is
proved in every tested realm. The portable RxJS 7-to-Next marble-test migration
Skill, its independent vetting, and the classified repository port are also
complete. The user has clarified that preservation in a manifest is not enough:
all cases must become executable parity registrations even when their
capabilities are absent. The exhaustive follow-up is complete: 2,201 physical
test declarations expand to 2,338 uniquely identified registrations, including
parameterized and source-skipped evidence. The user has now temporarily
prioritized P0.T3: a durable failure ledger and operator/function work queue for
driving every cold and polyfill parity failure to resolution. Package-boundary
work at P0.2 remains sequenced immediately afterward. A later user-prioritized
runner follow-up also removed expected-failure quarantine from the default
ported command and added live shard progress. The
user-prioritized repository package-manager migration to pnpm 10 is complete
without deciding the P0.2 publication boundary. The root developer command
guide is also concise, task-oriented, and explicit about known failing gates.
Broader Skills/MCP product design remains deferred.

No dates, staffing commitments, or final release version are assigned.

## Status protocol

- `DONE`: completion bar met and evidence recorded.
- `NEXT`: the single active step.
- `PLANNED`: sequenced but not active.
- `BLOCKED`: cannot proceed without a named decision or external change.
- `DEFERRED`: accepted work intentionally not designed or scheduled yet.

Keep exactly one `NEXT` item. When it completes, mark it `DONE`, record
verification in the session log, and move `NEXT` to the earliest unblocked
item.

## Success criteria

- Native Observable is preserved and the fallback is installed only according
  to the approved contract.
- Platform behavior is validated against a pinned specification and selected
  WPT baseline.
- Symbol extension identity, installation, construction, cancellation, typing,
  and packaging conventions are uniform and tested.
- Supported operators are backed by classified RxJS 7 behavioral evidence.
- The compatibility layer has an explicit support matrix and package/type
  boundary.
- Every published entry point builds and passes import/type fixtures in
  supported environments.
- Migration guidance and future AI tools are generated from accepted behavior,
  not prototype assumptions.

## Active queue

### Phase 0 — Foundation and architectural safety rails

| Status    | ID     | Outcome                                                                                                                |
| --------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `DONE`    | P0.1   | Record the charter, current architecture, compatibility policy, decisions, risks, open questions, and AI working rules |
| `DONE`    | P0.T1  | Design and implement the user-prioritized framework-neutral `@rxjs/test` virtual-time package                          |
| `DONE`    | P0.T2a | Create a portable RxJS 7-to-Next marble-test migration Skill                                                           |
| `DONE`    | P0.T2b | Vet the migration Skill independently before using it on the repository                                                |
| `DONE`    | P0.T2c | Port and classify the RxJS 7 marble-test corpus without repairing production behavior                                  |
| `DONE`    | P0.T2d | Materialize every inventoried marble case as an executable parity-test registration                                    |
| `DONE`    | P0.T2e | Exhaustively convert remaining runnable RxJS 7 marble evidence and expand capability mappings                          |
| `DONE`    | P0.T2f | Make the default ported-test gate strict and progress-visible                                                          |
| `NEXT`    | P0.T3  | Resolve the cold and polyfill RxJS 7 parity failures through the durable operator/function work queue                  |
| `DONE`    | P0.DX1 | Migrate repository workspaces, automation, and contributor tooling from Yarn Classic to pnpm 10                        |
| `DONE`    | P0.DX2 | Make the root developer command guide concise, accurate, and task-oriented                                             |
| `PLANNED` | P0.2   | Decide the package map and native-versus-polyfill installation contract                                                |
| `PLANNED` | P0.3   | Restore green builds and coherent public entry points for the selected package map                                     |
| `PLANNED` | P0.4   | Add a native/fallback lifecycle test harness and package-import fixtures                                               |
| `PLANNED` | P0.5   | Pin the first Observable specification and WPT revisions used as the conformance baseline                              |

#### P0.1 completion evidence

- Added the `docs/rxjs-next` document set and root `AGENTS.md`.
- Mapped all current packages and the Symbol extension inventory.
- Verified four unique polyfill tests and one RxJS operator test pass.
- Verified the polyfill package build fails because ambient platform
  declarations are disconnected from the build entry.
- Verified the RxJS package build fails because the root `tshy` export is
  invalid.

#### P0.T1 completion evidence

- Added the framework-neutral `@rxjs/test` package and public `rxTest`
  function; no scheduler instance or manual scheduler mode is exposed.
- Added marble parsing, async virtual-time controls, default and configurable
  assertions, and distinct `cold`, `hot`, and platform `observable` sources.
- Isolated marble grammar in a pure internal parser with direct unit coverage,
  independently of the virtual-time runtime.
- Virtualized the supported host timing and clock APIs with exact restoration,
  same-realm serialization, pending-work diagnostics, and task/time guards.
- Passed 66 focused behavior, parser, and cleanup tests, lint, TypeScript source checks,
  Nx build/test targets, the multi-dialect package build, strict declaration
  coexistence with the Observable polyfill, and built ESM/CommonJS imports.
- Recorded D-012 and the complete contract in `TESTING_DESIGN.md`.

#### P0.T2a completion bar

- A repo-committed Skill teaches developers to migrate RxJS 7 TestScheduler
  marble cases to `rxTest`, ColdObservable, and the platform Observable.
- The Skill preserves the caller's test framework, requires the global
  Observable for platform cases, and separates mechanical changes from
  semantic review.
- The Skill and bundled helpers contain no RxJS-repository paths, branches,
  commits, Git operations, or package-internal assumptions.

#### P0.T2a completion evidence

- Added the repo-committed `rxjs-next-marble-migration` Skill with concise
  workflow guidance, conversion and lifecycle references, examples, and a
  migration-report template.
- Added dependency-free file analysis, duplicate-candidate detection,
  review-flag detection, and a portability checker that accepts ordinary
  filesystem paths without source-control behavior.
- Passed helper tests, the portability scan across all nine Skill files, the
  Skill structural validator, and temporary `.skill` packaging.

#### P0.T2b completion bar

- Skill structure, links, examples, helper scripts, and packaging validate.
- Independent skill evaluation has no unresolved blocking or fix-first finding.
- Consumer-style fixtures cover synchronous, higher-order, timed, cancellation,
  duplicate, missing-operator, sharing-divergence, and obsolete-harness cases.
- No repository marble-test port begins before this bar is met.

#### P0.T2b completion evidence

- Exercised the dependency-free analyzer in a temporary consumer-style project
  across synchronous, higher-order, timed, cancellation, duplicate,
  missing-operator, sharing-divergence, and obsolete scheduler-internal cases.
- Parsed representative migrated `rxTest` cases for framework preservation,
  awaited flush, Symbol invocation, and global Observable construction.
- Corrected the one initial evaluation warning by making the Skill trigger
  sentence explicit.
- Passed the structural validator and independent plugin evaluation at 100/100
  with no failures, warnings, or fix-first recommendations.

#### P0.T2c completion bar

- Every inventoried RxJS 7 marble case has exactly one recorded disposition:
  active, expected failure, missing API, deduplicated, or unsupported/obsolete.
- Shared definitions can run in isolated ColdObservable, polyfill, and
  native-if-present modes without importing the platform constructor.
- Repository notes reconcile source counts, duplicate provenance, known
  failures, missing APIs, and semantic divergences.
- Production Observable, operator, and compatibility implementations are not
  changed to make the port pass.

#### P0.T2c completion evidence

- Read the production `7.x` ref without checking it out and pinned
  `e5351d02e225e275ac0e497c7b66eaa5f0c88791` only in the repository port
  records.
- Reconciled all 2,146 inventoried cases as 333 active, 422 expected failure,
  1,251 missing API, 4 deduplicated, and 136 unsupported/obsolete.
- Added a reproducible generated manifest retaining original provenance,
  converted definitions, classifications, reasons, capability gaps, and exact
  duplicate links.
- Added isolated cold, polyfill, native-if-present, and per-mode audit commands.
  Normal cold and polyfill each register all 2,146 source cases; native
  detection skips explicitly in the current Node realm. Cold audit records 335
  passes and 1,811 failures; polyfill audit records 340 passes and 1,806
  failures.
- Recorded the platform shared/ref-counted lifecycle separately from
  compatibility-cold expectations and required platform cases to construct
  from the ambient Observable.
- Added D-013 and the detailed port notes. No production implementation was
  changed, and P0.2 is restored as the single `NEXT` item.

#### P0.T2d completion bar

- All 2,146 inventoried source cases are registered by the parity harness,
  including missing APIs, scheduler/harness dependencies, deduplicated
  provenance, and obsolete coverage.
- Missing capabilities fail with explicit source-linked capability diagnostics
  rather than being omitted from test collection.
- The raw parity command reports the complete pass/fail/duplicate disposition
  without changing production operators or compatibility behavior.
- Normal and platform modes remain bounded; any required sharding or process
  isolation is part of the harness rather than a reason to omit cases.
- Port notes, verification evidence, and the generated manifest agree on the
  registered total.

#### P0.T2d completion evidence

- Preserved a mechanically generated executable program for every manifest
  entry, including all four deduplicated source locations and all 136
  scheduler/harness-dependent cases.
- Registered all 2,146 cases in cold, polyfill, and native-if-present modes.
  Mode-specific pass baselines execute verified cases normally; every other
  non-duplicate case remains an expected-failure parity gate until its exact
  capability and behavior are available.
- Made missing APIs and unavailable harness facilities fail with explicit
  source ID, original claim, and capability/rewrite reason. The raw cold audit
  reports 1,811 failures and 335 passes; the polyfill audit reports 1,806
  failures and 340 passes.
- Added role-aware import mapping so
  `source.pipe(operator(arg1, arg2))` invokes its exact or unified Next Symbol
  as `source[targetSymbol](...adaptedArgs)`, separately from static factory
  Symbols, ambient-platform constructions, and standalone values.
- Added one machine-readable capability registry and the generated
  `RxJS-7-parity.md` map covering 113 RxJS 7 operators and 34 creation/utility
  functions, including every missing exact surface and marble-case usage
  counts.
- Passed the complete 2,146-registration cold and polyfill gates, native
  auto-detection, manifest validation, parity-document freshness, and
  reproducible generation. No production source was changed by the port. P0.2
  is restored as the single `NEXT` item.

#### P0.T2e completion bar

- Re-audit every unsupported or missing-capability disposition against the
  current RxJS Next source and platform Observable surface.
- Prefer an executable mechanical conversion for every source-linked claim,
  including helper-generated and scheduler-shaped cases, while preserving
  explicit failures for unavailable behavior.
- Run the complete cold and polyfill inventories plus native auto-detection and
  raw audits without changing production operators to satisfy expectations.
- Regenerate the capability map, parity document, dispositions, mode
  baselines, and notes from the pinned read-only RxJS 7 source revision.

#### P0.T2e completion evidence

- Reconciled 2,201 physical declarations into 2,338 unique registrations,
  including 169 parameterized variants and all four source-skipped cases.
- Preserved an executable converted program for every registration. Only 11
  cases remain classified unsupported/obsolete, and each produces an explicit
  source-linked diagnostic rather than disappearing from the suite.
- Expanded the executable capability registry to 51 operator mappings, 18
  factory mappings, and 11 standalone values, including exact, partial, and
  unified mappings for the newly available APIs.
- Added unique case-ID baselines, complete sharded audit merging, ambient
  native-constructor identity checks, and five dedicated platform lifecycle
  cases.
- Passed the complete 2,338-case normal cold and polyfill gates. Raw audits
  recorded 432 cold passes with 1,906 failures and 436 polyfill passes with
  1,902 failures. Native mode skipped explicitly in the current Node realm.
- Regenerated the manifest, parity map, reviewed baselines, and port notes
  without changing production source.

#### P0.T2f completion bar

- Every applicable ported registration uses ordinary test semantics in the
  default cold, polyfill, and native-if-present modes.
- Recorded pass baselines cannot skip, quarantine, or invert a default test
  result.
- The launcher continues through every shard, reports visible progress while
  they run, expands every failed shard's diagnostics, and exits nonzero when
  any test fails.
- No production Observable, operator, or compatibility behavior changes.

#### P0.T2f completion evidence

- Removed the mode-baseline registration branch and all `it.fails` use from the
  ported suite; all applicable manifest cases now register with ordinary
  `it(...)`.
- Added one in-place interactive status line, refreshed on shard completion and
  every ten seconds, showing completed, running, queued, failed, and elapsed
  counts. Non-interactive output emits only a final progress summary.
- Regenerated the manifest so now-visible failure reasons describe failing
  parity evidence without claiming those tests remain quarantined.
- Ran the default `test:ported` command through all 16 cold and all 16 polyfill
  shards. Cold completed in 84 seconds and polyfill in 94 seconds; every shard
  exposed failures, all failed-shard diagnostics were expanded, and the command
  returned exit code 1 as intended.
- Preserved the one proven non-yielding converted program as a registered,
  immediate explicit failure so it cannot freeze its shard. Production source
  was unchanged.

#### P0.T3 completion bar

- `RXJS_7_PORTED_FAILURES.md` retains every cold or polyfill failure by stable
  case ID, even after the case becomes `FIXED`.
- Every tracked case belongs to exactly one operator/function work packet and
  uses only `TODO`, `IN-PROCESS`, `FIXED`, or a `BLOCKED` status with a named
  dependency.
- Each packet is resolved at the correct platform, compatibility, harness, or
  approved-divergence boundary without weakening RxJS 7 behavioral evidence.
- Complete cold and polyfill audits account for all 2,338 cases, every tracked
  row is `FIXED`, and the normal strict ported-test gate passes.
- Completion evidence and the final session log are recorded before restoring
  P0.2 as the single `NEXT` item.

#### P0.DX1 completion evidence

- Pinned pnpm 10.34.5, made `pnpm-workspace.yaml` authoritative, generated a
  pnpm lockfile from the former Yarn lockfile, and removed Yarn tooling and
  lockfile support.
- Kept pnpm's isolated linker, added explicit Chai and Yargs dependencies
  exposed by that layout, and limited the temporary polyfill bridge to one
  documented root public-hoist without changing the published package contract.
- Added a version-bounded dependency-build policy with `strictDepBuilds`,
  converted CI, release, documentation, generated commands, and contributor
  guidance, and retained npm for publication and end-user installation.
- Patched the pinned Husky 4 hook runner to use `pnpm exec`, preserving the
  configured commit hooks under pnpm 10 without a dependency upgrade.
- Passed a clean frozen install and a stable repeat install, five-project Nx
  discovery, 53 polyfill tests, 66 `@rxjs/test` tests plus package fixtures, six
  focused RxJS tests, parity freshness, WPT import verification, and the strict
  attested WPT run with 52/52 URLs, 525/525 upstream subtests, and 52/52
  identity attestations.
- Confirmed the docs app resolves published RxJS 7.8.1 and does not receive the
  local polyfill bridge. The release dry-run reaches the unchanged package
  build/lint baseline. Existing Angular/TypeScript peer warnings, the Node 24
  docs-test ESM failure, the optional RE2 Node 24 build failure, and the known
  RxJS Next package build/lint failures remain out of scope.
- Restored P0.2 as the single `NEXT` item.

#### P0.DX2 completion evidence

- Replaced the root setup list with compact, task-oriented command tables for
  workspace discovery, fast package feedback, documentation, WPT, and release
  preparation.
- Highlighted the common inner-loop commands and named all five pnpm workspace
  projects.
- Distinguished focused green checks from the intentionally failing full RxJS
  parity suite and known P0.3 build/lint baselines.
- Linked specialized docs and verified the listed commands against current
  workspace scripts while keeping P0.2 as the single `NEXT` item.

#### P0.2 completion bar

Record accepted decisions covering:

- the purpose or removal of `@rxjs/observable`;
- the final conceptual and npm package boundaries for fallback, extensions, and
  compatibility;
- which package owns ambient platform types;
- explicit versus automatic fallback installation;
- behavior when a native constructor or `EventTarget.when` already exists;
- runtime dependency direction;
- root and subpath import side effects;
- supported realm and server-runtime assumptions for initialization.

Update `ARCHITECTURE.md`, `DECISIONS.md`, `OPEN_QUESTIONS.md`, and package-map
diagrams. No implementation is required for this decision step.

#### P0.3 completion bar

- All selected packages build from a clean checkout on a declared Node runtime.
- Root and subpath exports map to existing sources and generated types.
- Runtime dependencies are declared.
- Source tests are excluded from published output unless deliberately shipped.
- Repository metadata points to the correct package paths.
- At least one ESM and one CommonJS import fixture passes for each claimed
  package format.

#### P0.4 completion bar

- One test contract can run against a selected native implementation and the
  fallback.
- It covers first subscribe, concurrent observers, late join, individual abort,
  last-observer abort, restart, completion, error, synchronous reentrancy,
  teardown registration, teardown order, and thrown observer callbacks.
- Package fixtures detect missing initialization, wrong side effects, duplicate
  installation, and type visibility.

#### P0.5 completion bar

- Exact upstream specification and WPT commit identifiers are recorded.
- The relationship between upstream tests and local test modes is documented.
- An update policy and owner are named.
- This step does not require a complete WPT execution pipeline.

### Phase 1 — Platform fallback correctness

| Status    | ID    | Outcome                                                                                                          |
| --------- | ----- | ---------------------------------------------------------------------------------------------------------------- |
| `PLANNED` | P1.1  | Implement the approved native selection and conditional fallback installation                                    |
| `PLANNED` | P1.2  | Bring core subscription, abort, teardown, error-reporting, and `Observable.from` behavior to the pinned baseline |
| `PLANNED` | P1.3  | Bring native platform methods and `EventTarget.when` to the pinned baseline                                      |
| `DONE`    | P1.4a | Build the attested Observable WPT test harness and record its stable current-behavior baseline                   |
| `DONE`    | P1.4b | Make the fallback pass the pinned Observable WPT suite                                                           |

#### P1.4a completion bar

- WPT is pinned to
  `6a009d73f0d315941b90cac13a9523a2a08c631b`, and only its approved
  Observable dependency closure is vendored byte-for-byte with Git-blob
  provenance and an exact generated URL inventory.
- The ignored execution tree instruments window, dedicated-worker, same-origin
  iframe, and Web IDL coverage without modifying imported WPT sources.
- Every expected URL has exactly one unsuppressible passing attestation proving
  the active constructor, `subscribe`, and `EventTarget.prototype.when` are the
  exact RxJS bundle identities, differ from captured native references, and
  report the expected bundle SHA-256.
- Negative controls prove native leakage, restored native identities, a wrong
  bundle ID, a missing worker/iframe attestation, and allowlisted attestation
  results all fail the independent auditor.
- The official runner, exact Chrome for Testing `150.0.7871.126`, and matching
  driver are checksum-locked and cached so a warm second run needs no network.
- The default `test:wpt` command is a strict conformance gate with readable
  terminal failures. The explicitly named baseline diagnostic distinguishes
  harness/report failures from known Observable behavior failures, and three
  consecutive complete runs must agree before granular expectations are
  accepted.
- Importer, provenance, inventory, realm-pattern, and report-auditor unit tests
  pass; CI uploads raw reports, diffs, logs, inventories, and per-realm
  identities.
- No production source, public API, ambient type, export, runtime dependency,
  installation contract, or compatibility behavior changes.

#### P1.4b completion bar

- `test:wpt` passes against the approved WPT and browser revisions.
- Behavior fixes remain within the accepted native-first installation and
  platform-lifecycle architecture.
- Each obsolete failure expectation is deliberately removed as its behavior is
  corrected.

#### P1.4b completion evidence

- Corrected the platform lifecycle without introducing RxJS 7 cold semantics:
  subscriber closure now preserves abort reasons, aborts before LIFO teardown,
  executes late teardowns immediately, retains shared/ref-counted production,
  and reports late or unhandled errors through the platform-shaped global path.
- Added the non-constructible global `Subscriber` surface and required Web IDL
  names, tags, descriptors, argument checks, and detached-realm behavior.
- Corrected `Observable.from` conversion order and Observable identity,
  Promise completion, sync/async iterator acquisition, close reasons, protocol
  errors, pending-result behavior, and microtask timing. The explicit async
  iterator loop documents why `for await...of` cannot preserve these observable
  protocol details.
- Corrected pinned platform behavior in `takeUntil`, `take`, `drop`, `every`,
  `reduce`, `inspect`, and Promise-returning consumers without adding
  string-named RxJS compatibility behavior.
- Added a scoped abort-algorithm bridge because public `abort` event listeners
  run too late to model the DOM-standard cancellation order. Signals without
  registered Observable work continue through the captured native abort
  implementation.
- Fixed generated attestation registration so upstream `setup()` properties
  are established before the identity subtest starts the reporting protocol.
  The vendored WPT sources remain byte-for-byte unchanged.
- Passed the strict `test:wpt` command with 52/52 URLs `OK`, 525/525 upstream subtests
  `PASS`, and 52/52 exact-identity attestations in Chrome for Testing
  `150.0.7871.126`. The passing implementation bundle for that run was
  `778edfac15639cd4531a590cd36450ad273a0a692df2e8a1436564dca3cb89f8`.
- Regenerated the baseline after three further identical complete attested
  runs, deleting all 25 obsolete failure `.ini` files. The package's 49 focused
  tests and pinned-import verification pass.
- Reconfirmed the existing P0.3 blocker: package build and lint still fail
  because the ambient declarations are disconnected from the package and root
  TypeScript configurations. No package-boundary work was folded into this
  conformance slice.

#### P1.4a completion evidence

- Vendored exactly 29 files under `dom/observable/tentative/` and eight
  source-derived support files: 37 upstream files and 716,874 bytes total.
  Provenance records every Git blob and SHA-256; the generated inventory
  contains only 52 `/dom/observable/tentative/` URLs.
- Verified all 52 URLs run exactly once and all 52 exact-identity attestations
  pass against implementation bundle
  `c03cd03b65e0337e0f73f202602529b87db1c2dfb1271bbd2e6857477c258e2a`.
  Evidence includes dedicated-worker, Web IDL, and four combined
  window/same-origin-iframe attestations covering all nine reviewed child
  realms.
- Recorded the initial granular expectation metadata after three identical
  complete runs. That pre-P1.4b baseline was 33 `OK`, 15 `ERROR`, and 4
  `TIMEOUT` top-level results, with 314 `PASS`, 159 `FAIL`, 8 `TIMEOUT`, and 6
  `NOTRUN` reported upstream subtests.
- Passed 45 harness unit tests covering import/provenance/inventory/closure,
  realm review, report completeness and classification, stability, and every
  required attestation negative control. The package's four existing source
  tests also pass.
- Passed `wpt:doctor`, `wpt:verify-import`, `test:wpt:baseline`, and
  two further consecutive narrowed-closure runs with
  `RXJS_WPT_OFFLINE=1`. Chrome for Testing and ChromeDriver were both exactly
  `150.0.7871.126`.
- Added blocking path-filtered strict-conformance CI, a scheduled advisory
  latest-Chrome job, cache keys, fixed concurrency/timeouts, and
  always-uploaded raw reports, concise summaries, logs, inventories, and
  per-realm identity evidence.
- Declared Node 24 tooling support and moved both WPT workflow jobs to Node 24;
  import verification, harness tests, doctor, and browser execution work on
  Node `24.12.0` without bypassing the engine check.
- Made no production source, public API, ambient type, export, runtime
  dependency, installation-contract, or compatibility-behavior change.

Phase exit:

- the fallback passes the agreed local lifecycle/conversion suite;
- native preservation is enforced;
- known differences from the pinned specification are listed;
- no main-library work depends on undocumented fallback behavior.

### Phase 2 — Symbol extension kernel

| Status    | ID   | Outcome                                                                                       |
| --------- | ---- | --------------------------------------------------------------------------------------------- |
| `PLANNED` | P2.1 | Decide Symbol identity, versioning, duplicate-install, realm, and collision policy            |
| `PLANNED` | P2.2 | Implement one typed extension installer for static and instance capabilities                  |
| `PLANNED` | P2.3 | Define constructor preservation, input conversion, cancellation, and error-forwarding helpers |
| `PLANNED` | P2.4 | Convert a small representative operator set to the kernel and validate native/fallback parity |

Representative pilot set:

- one native-overlapping synchronous operator such as `map` or `filter`, with
  both the platform string form and RxJS Symbol form tested;
- one RxJS-only synchronous operator such as `scan`;
- one higher-order operator such as `switchMap`;
- one time-based operator such as `timeout`;
- one static factory such as `timer`;
- `pipe` or its approved replacement.

Phase exit:

- the pilot operators share one implementation pattern;
- direct subpath imports are deterministic;
- duplicate installation and type augmentation are tested;
- no string-named RxJS property is added to the platform API;
- the native-overlap pilot proves that the string-named platform method remains
  untouched and the corresponding Symbol-keyed RxJS form coexists with it;
- any additional behavior in the RxJS form is documented and tested.

### Phase 3 — Operator restoration and parity

| Status    | ID   | Outcome                                                                         |
| --------- | ---- | ------------------------------------------------------------------------------- |
| `PLANNED` | P3.1 | Inventory the former RxJS 7 public operator and creation API by migration value |
| `PLANNED` | P3.2 | Create and maintain the compatibility ledger                                    |
| `PLANNED` | P3.3 | Restore operators in small families using the extension kernel                  |
| `PLANNED` | P3.4 | Classify, retain, or rewrite former RxJS 7 tests for each restored family       |

Do not use “all former tests pass” as an unqualified milestone. The gate is that
every supported API has portable or rewritten evidence and every divergence is
explicit.

### Phase 4 — RxJS 7 compatibility product

| Status    | ID   | Outcome                                                                               |
| --------- | ---- | ------------------------------------------------------------------------------------- |
| `PLANNED` | P4.1 | Decide the compatibility type, package, conversion, and cancellation contracts        |
| `PLANNED` | P4.2 | Stabilize cold-per-subscription and subscription-facade primitives                    |
| `PLANNED` | P4.3 | Implement the approved pipeable operator experience                                   |
| `PLANNED` | P4.4 | Add supported subjects, compatibility schedulers, and interop by prioritized category |
| `PLANNED` | P4.5 | Publish the compatibility support matrix and representative application fixtures      |

Phase exit:

- compatibility is opt-in and visible in imports and types;
- conversions state whether they change sharing or cancellation;
- every support claim maps to tests;
- unsupported categories are documented.

### Phase 5 — Migration experience and AI enablement

| Status     | ID   | Outcome                                                                         |
| ---------- | ---- | ------------------------------------------------------------------------------- |
| `PLANNED`  | P5.1 | Write migration guidance from the compatibility ledger and accepted divergences |
| `PLANNED`  | P5.2 | Validate mechanical and semantic migration steps on representative applications |
| `DEFERRED` | P5.3 | Design the broader RxJS usage/migration Skill portfolio and distribution        |
| `DEFERRED` | P5.4 | Design MCP capabilities, permissions, packaging, and versioning                 |

AI tools must consume versioned project knowledge and produce reviewable
changes. They must not infer migration safety solely from matching operator
names.

### Phase 6 — Release readiness

| Status    | ID   | Outcome                                                                               |
| --------- | ---- | ------------------------------------------------------------------------------------- |
| `PLANNED` | P6.1 | Finalize version naming, supported environments, support policy, and release channels |
| `PLANNED` | P6.2 | Complete package, type, bundle, performance, and conformance gates                    |
| `PLANNED` | P6.3 | Publish API, compatibility, migration, and contributor documentation                  |
| `PLANNED` | P6.4 | Run pre-release adoption, resolve blockers, and approve the major release             |

## Dependencies

```mermaid
flowchart LR
    WptHarness["P1.4a attested WPT harness"] --> Boundary["P0.2 package and install decisions"]
    Boundary --> Build["P0.3 buildable packages"]
    Build --> Harness["P0.4 lifecycle and import harness"]
    Harness --> Fallback["Phase 1 fallback correctness"]
    Fallback --> WptStrict["P1.4b strict WPT conformance (done)"]
    Boundary --> Kernel["Phase 2 extension kernel"]
    Harness --> Kernel
    Kernel --> Operators["Phase 3 operator restoration"]
    Boundary --> Compat["Phase 4 compatibility"]
    Operators --> Compat
    Compat --> Migration["Phase 5 migration and AI enablement"]
    Operators --> Migration
    Fallback --> Release["Phase 6 release"]
    Migration --> Release
```

The first standards revision can be pinned while build work proceeds, but
conformance implementation depends on a runnable harness.

## Risk register

| Risk                                                | Impact                                         | Likelihood | Current response                                                                                  |
| --------------------------------------------------- | ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| Package boundaries remain implicit                  | Rework across every import, type, and test     | High       | P0.2 is restored as the single `NEXT` item                                                        |
| Upstream proposal changes                           | Fallback and native behavior drift             | High       | Pin revisions before conformance claims                                                           |
| Prototype code becomes accidental policy            | Semantics are preserved without review         | High       | Documents distinguish current fact from accepted direction                                        |
| Symbol identity fails with duplicate installs       | Extensions are present under inaccessible keys | High       | P2.1 plus package fixtures                                                                        |
| RxJS 7 suite pressures platform behavior backward   | Native and fallback layers diverge             | High       | Mandatory test classification and separate compatibility layer                                    |
| Compatibility scope becomes unbounded               | Release cannot converge                        | Medium     | Support matrix and prioritized API categories                                                     |
| Global patching fails in hardened realms            | Library cannot initialize                      | Medium     | Decide supported environments and fallback access patterns                                        |
| Tooling is designed before APIs stabilize           | Skills encode obsolete migrations              | Medium     | The portable marble Skill is vetted; broader Skill/MCP distribution remains deferred              |
| Current CI/release infrastructure assumes RxJS 7    | Published artifacts fail despite source tests  | High       | Package-import fixtures and release gates precede expansion                                       |
| WPT runs accidentally exercise native Observable    | False confidence in fallback behavior          | High       | P1.4a exact-identity attestation and an independent, unsuppressible report audit                  |
| WPT/browser setup is too large or network-dependent | Slow or skipped local and CI validation        | Medium     | Vendor only the approved closure and checksum-cache the sparse runner and exact browser artifacts |

## Out of scope until activated

- final documentation-site architecture;
- a complete operator priority list;
- final compatibility support percentages;
- Skills/MCP schemas and permissions;
- release dates.

## Session log

### 2026-07-24 — Documentation foundation

- Analyzed branch history, packages, source modules, manifests, tests, and the
  current Observable specification/WPT locations.
- Created the project charter, architecture, compatibility policy, decision
  log, open-question register, active plan, and repository AI guidance.
- Verified the narrow source-test and build baseline recorded under P0.1.
- Set P0.2, package and installation contract decisions, as the only `NEXT`
  step.

### 2026-07-24 — Symbol patching rationale

- Documented why exact Symbol keys make import-time prototype patching safe
  from accidental name collisions.
- Recorded the contrast with RxJS 5 `rxjs/add/operator/*` string-key patching.
- Clarified that `Symbol.for` trades away some collision isolation and requires
  an explicit namespacing decision.

### 2026-07-24 — Dual platform and RxJS operator surface

- Accepted that RxJS exports Symbols for operators such as `map` and `filter`
  even when the platform provides same-familiar-name string methods.
- Recorded `observable.map(project)` as the platform contract and
  `observable[map](project)` as the RxJS contract.
- Allowed the RxJS form to delegate or provide additional functionality while
  requiring the platform method to remain untouched and all differences to be
  documented and tested.

### 2026-07-24 — User-prioritized attested Observable WPT harness

- Recorded the explicit priority change from P0.2 to the test-infrastructure
  slice P1.4a while preserving one `NEXT` item.
- Split harness construction and its current-failure baseline from P1.4b,
  which will later make the fallback pass the strict conformance gate.
- Accepted WPT commit
  `6a009d73f0d315941b90cac13a9523a2a08c631b`, per-realm exact
  implementation attestation, unsuppressible report auditing, and cached pinned
  browser/runner operation.
- Completed P1.4a with the exact 37-file Observable/support closure, 52-URL
  attested inventory, stable granular failure baseline, negative controls, CI
  evidence, and warm offline proof.
- Restored P0.2 as the single `NEXT` item. Strict WPT conformance remains the
  separate planned P1.4b effort.

### 2026-07-24 — Node 24 WPT tooling support

- Expanded the repository development engine declaration to accept Node 24
  while retaining Node 18 and Node 20.
- Moved the blocking and advisory Observable WPT workflows to Node 24.
- Verified the WPT import, unit, doctor, and browser-baseline paths on Node
  `24.12.0` without an engine-check override.
- Kept P0.2 as the single `NEXT` item; final published-package runtime support
  remains an open release decision.

### 2026-07-24 — Strict default WPT command and terminal diagnostics

- Made the strict `test:wpt` command and the blocking CI job require all upstream WPT results
  to pass; the current implementation therefore exits nonzero.
- Retained the known-failure comparison only as the explicitly named
  `test:wpt:baseline` harness diagnostic.
- Added progress messages, aggregate status and identity counts, every
  non-passing URL and subtest, and direct artifact paths to terminal output.
- Kept P0.2 as the single `NEXT` item; implementation conformance remains the
  separate planned P1.4b effort.

### 2026-07-24 — Pinned Observable WPT conformance

- Temporarily moved `NEXT` from P0.2 to P1.4b at the user's direction, fixed
  only the Observable and `EventTarget.prototype.when` fallback, completed
  P1.4b, and restored P0.2 as the single `NEXT` item.
- Audited the harness before changing behavior: all 52 disposable realms used
  the exact bundled fallback constructor, `subscribe`, and `when` identities;
  no native implementation or later overwrite explained the failures.
- Corrected Subscriber lifecycle, abort/teardown ordering, error reporting,
  detached realms, Web IDL shape, platform input conversion, iterator
  protocols, Promise consumers, and the small set of platform operators
  exposed by the pinned suite.
- Kept the async-iterator conversion as an explicit pull loop and documented
  why `for await...of` cannot express the required acquisition, close-reason,
  timing, and pending-result semantics.
- Corrected generated attestation timing after discovering that an early
  completed identity subtest caused upstream `setup()` options to be ignored.
  No vendored WPT source was edited.
- Passed the pinned strict suite with 52/52 URLs, 525/525 upstream subtests, and
  52/52 exact-identity attestations, then recorded three additional identical
  runs and removed every obsolete failure expectation.
- Passed all 49 package tests and pinned-import verification. Reconfirmed,
  without expanding scope, the documented P0.3 package build/lint configuration
  failure.

### 2026-07-24 — Framework-neutral RxJS testing package

- User-prioritized and completed P0.T1 without changing the active Observable
  acquisition contract still queued at P0.2.
- Added the `@rxjs/test` package with `rxTest`, async virtual-time controls,
  marble assertions, and separate `cold`, `hot`, and platform `observable`
  source models.
- Virtualized timers, animation and idle callbacks, Node immediates and timer
  handles, `AbortSignal.timeout`, clocks, queued microtasks, and `reportError`;
  every patch is restored after success or failure.
- Added the accepted testing design and D-012, plus architecture,
  compatibility, and open-question updates.
- Passed 66 focused tests, lint, TypeScript checks, Nx build/test targets, the
  multi-dialect package build, strict declaration coexistence with the
  Observable polyfill, and built ESM/CommonJS imports. P0.2 remains the single
  `NEXT` item.

### 2026-07-24 — Standalone marble parser follow-up

- Renamed the internal parser boundary to `marble-parser.ts` and kept it free
  of virtual-clock, host, Observable, and assertion dependencies.
- Added 33 direct unit cases for alignment whitespace, duration conversion,
  message diagrams, synchronous groups, hot carets, subscription diagrams,
  time diagrams, animation/idle timing plans, Unicode markers, and invalid
  grammar.
- Locked the alignment example to the source column of `^` and documented the
  difference between source-only spacing and ignored in-string padding.
- Kept the parser internal so this implementation improvement does not create
  an unreviewed public subpath; P0.2 remains the single `NEXT` item.

### 2026-07-25 — RxJS 7 marble-test migration Skill and classified port

- Temporarily moved `NEXT` from P0.2 through the user-ordered Skill creation,
  independent vetting, and repository port steps, advancing only after each
  completion bar passed.
- Added the portable `rxjs-next-marble-migration` Skill with framework-neutral
  conversion guidance, lifecycle classifications, examples, reporting, and
  dependency-free analysis and portability helpers.
- Passed helper fixtures, portability checks, structural validation, temporary
  packaging, and independent plugin evaluation at 100/100 with no blocking or
  fix-first findings.
- Read the production `7.x` ref without checking it out, pinned
  `e5351d02e225e275ac0e497c7b66eaa5f0c88791`, and reconciled all 2,146
  inventoried marble cases into one generated disposition ledger.
- Added isolated cold, polyfill, native-if-present, and raw-audit modes. The
  normal cold and polyfill gates pass; the current Node native mode skips
  explicitly; cold and polyfill audits expose their complete mode-specific
  implementation, capability, conversion, and lifecycle mismatches without
  repairing production behavior.
- Recorded D-013, testing and compatibility updates, and complete port notes.
  Restored P0.2 as the single `NEXT` item.

### 2026-07-25 — Complete executable parity registration and API map

- Reopened the user-prioritized marble port after clarifying that manifest-only
  preservation was insufficient for missing capabilities.
- Materialized all 2,146 source cases as cold test registrations and retained
  executable converted programs for every disposition.
- Corrected the import-role mapper so pipeable operators resolve to exact
  or explicitly unified instance Symbols while creation functions resolve
  independently to static Symbols or ambient-platform constructions.
- Added explicit missing-capability and unavailable-harness failures, plus
  Vitest argument pass-through for focused audits.
- Generated `RxJS-7-parity.md` from the pinned RxJS 7 public indexes and the
  shared machine-readable registry: 113 pipeable operators and 34
  creation/utility functions with current mappings, case counts, partial
  analogues, and missing status.
- Passed all 2,146 normal cold and polyfill source registrations, with four
  exact duplicates skipped in each normal mode. The raw cold audit reports
  1,811 failures and 335 passes; the polyfill audit reports 1,806 failures and
  340 passes. Native mode skips honestly in the current Node realm.
- Added executable unified mappings, including
  `bufferCount(size) → source[buffer]({ maxSize: size })`, and retained
  unsupported overloads as failing parity evidence.
- Restored P0.2 as the single `NEXT` item without changing production source.

### 2026-07-25 — Exhaustive parameterized marble conversion

- Re-audited the pinned source with an AST-based declaration and helper
  expander. The earlier 2,146-case inventory omitted parameterized variants and
  source-skipped evidence; the authoritative inventory is now 2,338
  registrations from 2,201 physical declarations.
- Expanded all loop- and helper-declared variants, including 117 `share`
  configurations, 48 multicasting deprecation equivalents, and four buffer
  cases. All four source-skipped tests remain executable parity evidence.
- Reduced unsupported/obsolete classification from 136 to 11 without guessing
  behavior. The remaining cases protect scheduler-private parser/queue state
  or depend on `phonyMarbelize`.
- Expanded executable API mappings, corrected overload guards, introduced
  unique case-ID baselines and strict sharded audit merging, and protected
  native constructor identity before extension loading.
- Passed both 2,338-registration normal gates and complete cold/polyfill raw
  audits. No production source was changed to satisfy an old expectation.
- Marked P0.T2e complete and restored P0.2 as the single `NEXT` item.

### 2026-07-25 — Ported-test console follow-up

- Replaced per-case success output from normal ported-test commands with a
  concise per-mode summary and an unmistakable final `PASS` or `FAIL`.
- Kept reviewed parity passes and quarantined known gaps separately visible so
  a green harness result does not imply full RxJS 7 behavioral parity.
- Preserved expanded diagnostics for failed shards and direct Vitest reporter
  output when explicit Vitest arguments are supplied.
- Kept P0.2 as the single `NEXT` item.

### 2026-07-25 — Strict ported-test execution and live progress

- Temporarily reprioritized the user-requested P0.T2f runner follow-up and
  restored P0.2 as the single `NEXT` item after completing it.
- Removed expected-failure quarantine from every applicable ported
  registration; recorded baselines remain evidence only.
- Regenerated harness diagnostics to remove stale quarantine wording without
  changing any disposition or converted program.
- Added an in-place shard-completion and heartbeat status so a slow or stalled
  shard remains visible without scrolling the terminal.
- Verified the default cold and polyfill run completed every shard, expanded
  the failures, and returned nonzero without changing production behavior.

### 2026-07-25 — In-place ported-test progress

- Replaced newline-per-update progress with one interactive status line that is
  cleared and redrawn on shard completion and heartbeat refresh.
- Bounded redirected and CI output to one final progress summary.
- Verified an interactive cold run completed all 16 shards in 87 seconds while
  rewriting one progress row, then expanded every failure and returned exit
  code 1 as intended.
- Kept P0.2 as the single `NEXT` item.

### 2026-07-29 — pnpm 10 repository migration

- Temporarily prioritized and completed P0.DX1, replacing Yarn Classic with
  pnpm 10.34.5 across workspace metadata, the lockfile, local scripts, CI,
  release preparation, docs tooling, generated commands, and contributor
  instructions.
- Preserved pnpm's isolated linker and recorded a narrow root-only polyfill
  public-hoist as a temporary workspace bridge that does not decide P0.2.
- Made dependency build scripts reviewable through version-bounded
  `allowBuilds` and `strictDepBuilds`; explicitly denied the message-only
  Core-JS and ES5-Ext scripts.
- Declared the Chai test dependency and the release helper's Yargs dependency
  that the former flat layout had hidden.
- Patched Husky 4's obsolete `pnpx --no-install` hook runner to use
  `pnpm exec`, then exercised the configured commit hooks successfully.
- Passed clean and repeated frozen installs, project discovery, focused package
  and RxJS tests, parity freshness, import verification, and the complete
  cached strict WPT suite. Exercised docs and release paths and retained their
  documented unrelated Node 24 and package-build failures.
- Restored P0.2 as the single `NEXT` item.

### 2026-07-29 — Root developer command guide

- Temporarily prioritized and completed P0.DX2.
- Organized the root README around setup, fast feedback, docs, WPT, and
  maintainer workflows, with concise why/when guidance.
- Highlighted common commands, linked the detailed workflow guides, and called
  out intentionally failing or blocked gates.
- Verified command and project names against the pnpm workspace and restored
  P0.2 as the single `NEXT` item.

### 2026-07-29 — RxJS 7 ported-test failure tracker

- At the user's direction, temporarily moved `NEXT` from P0.2 to P0.T3 and
  created `RXJS_7_PORTED_FAILURES.md` as the durable operator/function
  remediation queue.
- Ran complete 2,338-case cold and polyfill audits. Cold recorded 432 passes
  and 1,906 failures; polyfill recorded 436 passes and 1,902 failures. Their
  union contains 1,921 failing case IDs across 140 owner groups: 1,887 fail in
  both modes, 19 only in cold, and 15 only in polyfill.
- The first cold attempt hit a Vitest cache-directory race and was rejected
  because one shard report was absent. The clean rerun merged all 16 cold
  shards, and the polyfill audit merged all 16 shards on its first attempt.
- Added a reproducible tracker generator and stable case-ID status ledger.
  Regeneration preserves resolved rows as `FIXED`, retains active or blocked
  assignments, and rejects incomplete reports, unknown cases, invalid statuses,
  unnamed blockers, duplicate rows, or missing work packets.
- Ran the normal strict ported gate through all 16 shards in both modes. It
  returned exit code 1 as expected, with both modes failing and no omitted
  shard. The generator's check mode validates all 1,921 rows and 140 packets.
- P0.T3 remains the single `NEXT` item. The first recommended unblocked packet
  is RX7-NEVER: add an explicit observation boundary to the migrated test
  without changing `NEVER` runtime semantics.

### 2026-07-29 — P0.T3 existing-surface remediation wave 1

- Integrated separate reviewed fixes for the `NEVER` observation boundary,
  `raceWith` winner selection and cancellation, unsubscription-only
  observation marbles, overlapping and gapped `bufferCount` windows, seedless
  `scan`, and the `elementAt` default-value overload.
- The shared observation-boundary repair also completed the assigned
  `defaultIfEmpty` cases and repaired affected evidence across 37 owner groups.
  The complete audits now mark 89 original failures `FIXED`.
- Complete 16-shard audits recorded 523 cold passes with 1,815 failures and 525
  polyfill passes with 1,813 failures. The normal strict gate then completed
  all 16 shards in both modes and remained red, as expected, on unresolved
  mapped behavior and intentionally out-of-scope missing APIs.
- Recorded D-015 for count-window configuration on the unified `buffer` Symbol.
  Missing compatibility APIs such as `ArgumentOutOfRangeError` and `finalize`
  remain `TODO`; they were not introduced to make neighboring cases pass.
- The next existing-functionality packet is RX7-IGNORE-ELEMENTS, beginning with
  its never-observation harness boundary before moving to other small mapped
  edge cases. Missing non-scheduler APIs remain a later phase, and all
  scheduler-specific behavior remains deferred until the absolute end of
  P0.T3.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 2

- Integrated separate reviewed fixes for the `ignoreElements` never-observation
  boundary, nonpositive `skipLast` identity behavior, and nonpositive
  `takeLast` empty behavior. The `takeLast` ambient declaration now exposes
  only the existing exported Symbol rather than a string-named method.
- Complete 16-shard audits recorded 529 cold passes with 1,809 failures and 531
  polyfill passes with 1,807 failures, adding six cases that pass in both
  modes. The normal strict gate again completed every cold and polyfill shard
  and remained red on the unresolved queue.
- The synthetic `ignoreElements` stop closes both its observation and expected
  source-subscription log. It does not alter production semantics or make the
  shared, ref-counted polyfill cold.
- No missing API or scheduler behavior was introduced. The next wave continues
  with small current mappings and their overload/error gaps; scheduler-specific
  cases remain deferred until the absolute end of P0.T3.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 3

- Integrated separate reviewed fixes for two `switchAll` never-observation
  boundaries, `bufferWhen` source-error and synchronous-selector behavior, and
  the shared `@rxjs/test` same-frame unsubscription contract.
- `expectObservable` windows are now half-open: observation aborts run before
  ordinary work on the exact `!` frame. This repaired the two assigned
  `skipWhile` cases without changing production and also fixed two equivalent
  `takeWhile` cases.
- Complete 16-shard audits recorded 537 cold passes with 1,801 failures and 539
  polyfill passes with 1,799 failures, adding eight cases that pass in both
  modes. The normal strict gate completed all shards in both modes and remained
  red on the unresolved queue.
- All 16 `bufferWhen` cases now pass in both modes. Source errors discard the
  active partial buffer, and a synchronously throwing closing selector errors
  the result before source activation.
- No missing API or scheduler behavior was introduced. Scheduler-specific
  cases remain deferred until the absolute end of P0.T3, and P0.T3 remains the
  single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 4

- Integrated separate reviewed fixes for three `mergeAll` never-observation
  boundaries, the RxJS 7 `race([sources])` operator overload, and `takeWhile`
  completion, source-error, and inclusive behavior.
- The `takeWhile` production repair forwards the source terminal lifecycle.
  Its RxJS 7 boolean `inclusive` overload is normalized only at the
  compatibility boundary to RxJS Next's `{ includeLast: true }` configuration.
- Complete 16-shard audits recorded 548 cold passes with 1,790 failures and 550
  polyfill passes with 1,788 failures, adding 11 cases that pass in both modes
  and bringing the original fixed cohort to 114.
- The normal strict gate completed all 16 shards in both modes and remained red
  on the unresolved queue. The shared, ref-counted polyfill was not made cold,
  and mode-only lifecycle differences remain visible in the tracker.
- No missing API or scheduler behavior was introduced. The next recommended
  existing-functionality packet is RX7-SKIP-LAST; scheduler-specific cases
  remain deferred until the absolute end of P0.T3, and P0.T3 remains the single
  project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 5

- Integrated separate reviewed fixes for the `skipLast` and `takeLast`
  never-observation boundaries, the static RxJS 7 `race([sources])` overload,
  and `sequenceEqual` length-mismatch completion.
- `sequenceEqual` now decides false as soon as a completed shorter input makes
  equality impossible and completes the derived subscriber so its AbortSignal
  closes both inputs. The RxJS 7 comparator overload and never-observation
  evidence remain separate unresolved work.
- Complete 16-shard audits recorded 557 cold passes with 1,781 failures and 559
  polyfill passes with 1,779 failures, adding nine cases that pass in both modes
  and bringing the original fixed cohort to 123.
- The normal strict gate completed all 16 shards in both modes and remained red
  on the unresolved queue. The shared, ref-counted polyfill was not made cold,
  and its mode-only lifecycle differences remain explicit evidence.
- No missing API or scheduler behavior was introduced. The next recommended
  existing-functionality packet is RX7-SWITCH-MAP-TO; scheduler-specific cases
  remain deferred until the absolute end of P0.T3, and P0.T3 remains the single
  project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 6

- Integrated separate reviewed fixes for three `switchMapTo`
  never-observation boundaries, `repeat` count semantics, and the RxJS 7
  `retry` reset-on-success default.
- `repeat` now treats `count` as the exact total source-activation count and
  completes without source activation for nonpositive counts. Its focused
  shared-polyfill coverage verifies that concurrent observers still share each
  repeated upstream activation.
- RxJS Next retains its intentional `retry` default of
  `resetOnSuccess: true`; the RxJS 7 compatibility adapter supplies the legacy
  `false` default without changing production semantics.
- Complete 16-shard audits recorded 575 cold passes with 1,763 failures and 577
  polyfill passes with 1,761 failures, adding 18 cases that pass in both modes
  and bringing the original fixed cohort to 141. Three count-root spillovers in
  delay-config cases passed without implementing scheduler behavior.
- The normal strict gate completed all 16 shards in both modes and remained red
  on the unresolved queue. No missing API or scheduler behavior was introduced.
  RX7-TO-ARRAY is the next recommended packet; its polyfill-only
  multiple-subscription evidence must preserve the shared, ref-counted
  lifecycle rather than making the polyfill cold.
- Scheduler-specific work remains deferred until the absolute end of P0.T3,
  and P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 7

- Integrated separate reviewed fixes for `toArray` lifecycle evidence,
  `onErrorResumeNext` sequencing and never boundaries, and same-frame hot
  observation ordering required by mapped concat/merge flattening cases.
- Mode-aware migrated evidence now retains RxJS 7's two cold upstream
  subscriptions while expecting one shared upstream subscription from the
  ref-counted platform polyfill. The rewrite is restricted to intentional
  subscription multiplicity and cannot alter values, errors, completion, or
  cancellation evidence.
- `onErrorResumeNext` now sequences the instance receiver before configured
  sources, advances on both completion and error, swallows exhausted errors,
  preserves constructor behavior, and cancels through the derived
  subscriber's AbortSignal.
- `@rxjs/test` now orders same-frame work as observation boundary, observation
  start, then ordinary source work. This observes hot frame-zero values without
  weakening the half-open `!` contract.
- Complete 16-shard audits recorded 606 cold passes with 1,732 failures and 608
  polyfill passes with 1,730 failures, adding 31 passes in each mode and
  bringing the original fixed cohort to 172. The shared fixes also repaired
  related concat/merge flattening, throttle-error, and TestScheduler evidence.
- The normal strict gate completed all 16 shards in both modes and remained red
  on the unresolved queue. No missing API or RxJS scheduler/provider behavior
  was introduced. Although RX7-DEBOUNCE-TIME is the generated recommendation,
  time/scheduler-related packets remain deferred until the absolute end; the
  next wave continues with non-time-based mapped behavior.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 8

- Integrated separate reviewed commits for 24 finite observation boundaries,
  `exhaustMap` active-inner lifecycle, and source-led `withLatestFrom`
  semantics.
- The boundary commit closed only observations and source subscriptions still
  active at the original diagram horizon. It completed the mapped `concat`,
  `race`, and `concatMapTo` packets without changing production behavior.
- `exhaustMap` now counts an accepted inner before activation, ignores later
  outer values until that inner completes, delays result completion while an
  inner remains active, and propagates the result subscriber's AbortSignal to
  inner work. The root fix completed `exhaustAll` and repaired nine finite
  `exhaustMap` cases as spillover.
- `withLatestFrom` now activates latest-only inputs before the primary source,
  emits only on primary values after every latest-only input has a value, and
  terminates with the primary source. The optional projection is represented
  by the Symbol contract and executable port adapter.
- Focused lifecycle evidence confirms that concurrent polyfill observers share
  one ref-counted producer activation for both `exhaustMap` and
  `withLatestFrom`; no cold-per-subscription behavior was introduced into the
  platform layer.
- Complete 16-shard audits recorded 662 cold passes with 1,676 failures and 663
  polyfill passes with 1,675 failures, adding 56 and 55 passes respectively,
  with no regressions and 228 cases fixed from the original cohort. The
  one-pass mode delta is historical: the `withLatestFrom` throw case already
  passed in polyfill mode before this wave.
- The normal strict gate completed all 16 shards in both modes and remained red
  on the unresolved queue. No missing API or scheduler/provider behavior was
  introduced. The next wave continues non-time mapped behavior and finite
  observation evidence; scheduler-specific work remains deferred until the
  absolute end.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 9

- Integrated separate reviewed commits for 22 remaining non-time composition
  observation boundaries, the instance `concat` receiver lifecycle, and the
  `sequenceEqual` comparator overload.
- The harness-only commit added finite horizons for mapped `merge`,
  `mergeWith`, `concatAll`, `concatMap`, `exhaustMap`, and `switchMap` cases.
  It closed only source and inner subscriptions still active at the original
  marble horizon.
- Instance `concat` had prepended its receiver before delegating to instance
  `merge`, which prepended the same receiver again. Removing that duplicate
  activation completed the non-scheduler `endWith` cohort and repaired
  additional `concatWith` and legacy concat evidence. Focused lifecycle tests
  prove serial ordering, no append after error, one receiver activation, and
  ref-counted cancellation after the last polyfill observer leaves.
- `sequenceEqual` now accepts the existing RxJS 7 comparator overload, calls it
  once per paired value, concludes on false, propagates comparator errors, and
  cancels both inputs through the result AbortSignal. Concurrent observers
  share one comparison run.
- Complete 16-shard audits recorded 721 cold passes with 1,617 failures and 722
  polyfill passes with 1,616 failures, adding 59 passes in each mode with no
  regressions and bringing the original fixed cohort to 287.
- The normal strict gate completed all 16 shards in both modes and remained red
  on the unresolved queue. The excluded `endWith` scheduler cases remain
  untouched. No missing API or scheduler/provider behavior was introduced; the
  next wave continues with current subjects and other non-time mapped
  behavior.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 10

- Integrated separate reviewed commits for the RxJS 7 `buffer` notifier
  lifecycle, class-local `Subject.asObservable()` views, and the remaining
  mapped `mergeMap`/`mergeMapTo` evidence.
- The `buffer` compatibility adapter retains one closing-notifier subscription
  across boundaries, emits empty buffers where RxJS 7 does, discards partial
  buffers on errors, and closes both source and notifier through the shared
  platform lifecycle.
- `Subject.asObservable()` returns a distinct non-mutating base-Observable view
  without adding a string-named method to `Observable.prototype`. Migrated hot
  fixtures receive the equivalent method only as a test-owned property.
- Reused RxJS 7 cold inners remain shared, ref-counted producers in polyfill
  mode. Mode-aware merge-mapping evidence records the resulting joined
  emissions, subscription intervals, and restarts after zero-subscriber gaps;
  no cold-per-subscription fallback was introduced.
- Complete 16-shard audits recorded 737 cold passes with 1,601 failures and 754
  polyfill passes with 1,584 failures. That adds 16 cold and 32 polyfill passes
  with no regressions and brings the original fixed cohort to 319 cases.
- The normal strict gate completed all 16 shards in both modes and remained red
  on the unresolved queue. No missing API or scheduler/provider behavior was
  introduced. Time- and scheduler-related packets remain deferred until the
  absolute end of P0.T3.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 11

- Integrated separate reviewed commits for finite `concatWith`, legacy concat,
  and `retry` observation boundaries; selector and numeric `debounce`
  lifecycles; retry delay-notifier ownership; and the unified `audit`/`throttle`
  implementation.
- A proposed rewrite of legacy `concat(e2, testScheduler)` was rejected because
  removing the scheduler argument would weaken the original behavioral claim.
  That case and the explicit concat/endWith scheduler overloads remain
  untouched in the scheduler-last queue.
- Selector debounce now retains values across empty selector completion and
  flushes on source completion. Numeric debounce resets one host timer, flushes
  on source completion, and cancels that timer through the result lifecycle.
- Retry delay selectors now receive one-based counts even with an infinite
  budget. A notifier's first value cancels it before the next source attempt;
  notifier completion, error, and selector failure terminate through their
  documented paths.
- `audit` and `throttle` share one Symbol implementation while retaining their
  distinct trailing-window restart behavior. Focused tests preserve one
  ref-counted source and duration activation for concurrent polyfill observers;
  no mode-specific value rewrite or cold fallback was introduced.
- Complete 16-shard audits recorded 820 cold passes with 1,518 failures and 837
  polyfill passes with 1,501 failures. That adds 83 passes in each mode with no
  regressions, including 14 `auditTime`/`throttleTime` spillovers, and brings the
  original fixed cohort to 402 cases.
- The normal strict gate completed both modes and remained red on the unresolved
  queue. No missing API, scheduler argument, scheduler injection, provider, or
  scheduler-class behavior was introduced. Remaining scheduler-specific concat
  and endWith cases stay deferred.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — Ported marble-test performance correction

- Paused further P0.T3 packet delegation to profile why the virtual-time marble
  suite was taking real minutes. No real-timer leak was found: numeric-timer
  cases execute through virtual scheduling and its bounded task guard.
- One failed `instanceOf(Subject)` assertion took about 44.3 seconds because
  Chai/Loupe treated the platform Observable `inspect` operator as a custom
  formatter, invoked it recursively, and eventually overflowed the stack.
  Ported Chai assertions now install a temporary, non-enumerable display hook
  only during synchronous formatting and remove it in `finally`. The same
  assertion now fails with its genuine diagnostic in about 5 milliseconds,
  while the Observable `inspect` operator remains unchanged and usable.
- The runner now defaults to one process per mode instead of repeating Vitest
  transformation and collection across 16 processes. Explicit shard-count and
  concurrency overrides remain available for diagnostic isolation.
- On the current 2,338-case manifest, complete JSON audits take about 2.7
  seconds cold and 2.5 seconds polyfill. The full strict cold-plus-polyfill
  command, including approximately 5.7 MB of expected failure diagnostics,
  completes in about 6 seconds.
- One-process and explicit 16-shard audits produced identical case titles and
  statuses: 820 cold passes with 1,518 failures and 837 polyfill passes with
  1,501 failures. The speedup does not quarantine failures or change the
  polyfill's shared, ref-counted behavior.
- P0.T3 remains the single project-level `NEXT` item, but further parity work
  remains paused pending user direction.

### 2026-07-29 — P0.T3 existing-surface remediation wave 12

- Resumed the active P0.T3 goal after the performance correction and integrated
  the remaining mapped numeric `auditTime` lifecycle plus finite
  `auditTime`/`throttleTime` never-source observation boundaries.
- `auditTime` now uses the unified throttle implementation without restarting a
  numeric duration from a trailing emission. Focused fake-timer evidence proves
  that concurrent polyfill observers retain one shared source activation and
  timer until the final observer aborts.
- Rejected proposed rewrites for the remaining `concatMap`, `exhaustMap`, and
  `switchMap` map-and-flatten cases. Their projected inners require the missing
  RxJS Symbol `map`; substituting the platform string `map` would violate the
  API boundary and hide a missing capability. All three remain `TODO`.
- Complete one-process audits recorded 826 cold passes with 1,512 failures and
  843 polyfill passes with 1,495 failures. That adds six passes in each mode
  with no regressions and brings the original fixed cohort to 408 cases.
- The normal strict gate completed both modes and remained red on the unresolved
  queue. No missing API, scheduler argument, scheduler injection, provider, or
  scheduler-class behavior was introduced.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface remediation wave 13

- Integrated separate reviewed commits for ordinary standalone `zip`
  completion and cancellation, per-case static-zip capability liveness, five
  finite observation horizons, and explicit projection-overload
  classification.
- Ordinary `zip(sources)` now completes when any completed input's queue is
  exhausted, completes for zero inputs, and stops activating later synchronous
  inputs after termination. The exploratory `fillAfterComplete` path remains
  separate. D-022 records the lifecycle contract.
- Focused source evidence proves concurrent polyfill observers share one zip
  state and one activation per input: one observer leaving retains the work,
  while the final observer abort cancels every input.
- Removed a false per-case dependency on an unused suite-level
  `queueScheduler` alias without adding scheduler support. Exactly 20
  non-projection static-zip cases are now `FIXED`; the missing operator
  Symbols, scheduler case, and result-selector overloads remain untouched.
- Two identity-shaped projection cases now happen to produce the expected
  tuples, but remain explicitly `compatibility-only`/`missing-api` and `TODO`
  because the projection overload is not represented. Their output coincidence
  is not counted as API support.
- Complete one-process audits recorded 848 cold passes with 1,490 failures and
  865 polyfill passes with 1,473 failures. That adds 22 passes in each mode
  with no regressions and brings the original fixed cohort to 428 cases.
- All 91 focused source tests passed. The normal strict gate completed both
  modes and remained red on the unresolved queue. No missing operator,
  projection overload, scheduler argument, scheduler injection, provider, or
  scheduler-class behavior was introduced.
- P0.T3 remains the single project-level `NEXT` item.

### 2026-07-29 — P0.T3 existing-surface final audit and zip hardening

- Replaced the first standalone-zip completion patch with reviewed commit
  `9ab5aa5cb`, after reverting it in `f16352d9b`. The replacement retains the
  shortest-input completion and sibling-cancellation behavior while also
  draining the exploratory `fillAfterComplete` path without an all-complete
  infinite loop. Ten focused zip tests cover zero inputs, synchronous empty
  inputs, final-buffer draining, input errors, shared ref-counted observers,
  last-observer cancellation, and finite fill completion.
- Commit `ab482214b` corrected the first finite zip observation boundary from
  frame 15 to frame 18 so it preserves the full original source-diagram
  horizon. The expected notifications were not changed.
- Commit `98277dbc9` corrected instance `combineLatest` so the lower-level
  combine primitive, rather than both layers, owns the receiver subscription.
  Four focused tests preserve exact tuple arity, single receiver activation,
  cancellation, static forms, and one shared ref-counted activation for
  concurrent polyfill observers.
- Complete one-process audits recorded 865 cold passes with 1,473 failures and
  865 polyfill passes with 1,473 failures. The 17 new cold passes are legacy
  projection cases that now terminate without invoking their selector; they do
  not represent the missing projection overload and remain `TODO`. Manifest
  generation now classifies all 31 such legacy projection cases as
  compatibility-only `missing-api`, preserving the same 428-case fixed cohort
  with zero `IN-PROCESS` or `BLOCKED` rows. The strict cold-plus-polyfill gate
  completed and remained red only on the unresolved queue; all 101 focused
  source tests and the parity freshness check passed.
- A fresh audit found 136 remaining `TODO` cases whose programs mention
  `rxTestScheduler` or `testScheduler`; 110 currently fail first on the
  undefined name. None are missed safe helper-receiver rewrites: 105 exercise
  real scheduler arguments or injection, 14 exercise scheduler parser, queue,
  export, or other internals, and 17 fail first on an unrelated missing API.
  A global scheduler alias was rejected because it would turn those explicit
  scheduler claims into misleading harness behavior.
- The final existing-capability audit found no remaining non-scheduler case
  backed by a current implementation or executable mapping. Remaining
  unresolved rows require missing non-scheduler APIs, unsupported legacy
  overloads, compatibility decisions, or the scheduler-last phase. The next
  implementation phase is missing non-scheduler operators and functions;
  scheduler arguments, providers, classes, and internals remain the absolute
  final P0.T3 phase. The scheduler-last boundary also retains the current
  `animationFrames` case and 20 `timeout` configuration cases: their callbacks
  do not all pass an explicit scheduler, but the claims are inherently about
  frame or timeout scheduling.
- The package build and lint commands still hit the documented exploratory
  package baselines: `tshy` rejects source-path exports and ESLint points the
  RxJS package at the Observable package's TypeScript project. Neither command
  reached a change-specific diagnostic.
- P0.T3 remains the single project-level `NEXT` item.
