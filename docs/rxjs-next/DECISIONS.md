# RxJS Next decision log

This file records durable project decisions without pretending that the
exploratory implementation has resolved every design detail. Use an ADR when a
decision needs a longer alternatives analysis; link it from this log.

Status meanings:

- **Accepted**: implementation should conform unless the decision is reopened.
- **Proposed**: current preferred direction; explicit approval is still needed.
- **Deferred**: goal acknowledged, design intentionally postponed.
- **Superseded**: retained for history but no longer controlling.

## D-001 — Base RxJS on the web-platform Observable

- **Status:** Accepted
- **Decision:** The active realm's web-platform `Observable` is the foundational
  type for the main RxJS library.
- **Rationale:** RxJS should extend the platform primitive rather than ship a
  competing Observable identity.
- **Consequence:** RxJS 7 subscription assumptions cannot be copied into the
  platform layer when they conflict with platform sharing or cancellation.

## D-002 — Use a polyfill only when the platform primitive is absent

- **Status:** Accepted
- **Decision:** RxJS will provide a fallback implementation, but a conforming
  native `Observable` takes precedence. String-named methods such as
  `Observable.prototype.map` remain part of the platform contract: they come
  from the native implementation when present and from the conforming fallback
  otherwise.
- **Rationale:** Native adoption is the point of the architecture, and replacing
  native behavior would undermine interoperability and conformance.
- **Consequence:** The current unconditional assignment to
  `globalThis.Observable` is prototype debt, not the target contract. RxJS must
  not replace a platform string-named method in order to add library behavior.
- **Unresolved detail:** The detection, installation, and import contract is
  still open.

## D-003 — Address RxJS extensions with Symbols

- **Status:** Accepted
- **Decision:** RxJS methods and factories are patched onto the active
  Observable constructor or prototype under exported Symbol keys. RxJS will
  export a Symbol for an operator even when the platform provides a
  string-named method with the same familiar name. Both forms intentionally
  coexist:

  ```ts
  observable.map(project); // Platform contract
  observable[map](project); // RxJS contract
  ```

  The Symbol-keyed RxJS implementation may delegate to the platform method
  when its contract is sufficient, or provide additional RxJS functionality
  under the separate key.

- **Rationale:** Symbols avoid adding RxJS string names to the platform API,
  give consumers one uniform invocation style across native-overlapping and
  RxJS-only operators, and leave room for richer RxJS contracts without
  replacing native behavior. They also prevent accidental trampling: only code
  holding the exact Symbol can address that property. Symbols with identical
  descriptions remain different keys. This corrects the shared string-key
  weakness of the RxJS 5 `rxjs/add/operator/*` patching model.
- **Consequence:** Symbol identity across bundles, versions, realms, and duplicate
  installs is part of the public API and must be decided before stabilization.
  A `Symbol.for` design would deliberately weaken collision isolation and
  requires explicit justification and namespacing. For every name shared with
  the platform, documentation and tests must state whether the RxJS form
  delegates, extends the accepted inputs or overloads, or otherwise differs.
  Sharing a familiar name does not imply identical contracts.

## D-004 — Keep backward compatibility in an additional library

- **Status:** Accepted
- **Decision:** RxJS 7 compatibility behavior will be supplied through a
  separate library or package boundary rather than by changing the platform
  Observable contract.
- **Rationale:** Some high-value RxJS 7 behavior is incompatible with the
  platform's shared, ref-counted producer lifecycle.
- **Consequence:** Package boundaries and type relationships must make the
  distinction visible to users and tools.

## D-005 — Preserve pipeable operators in compatibility work

- **Status:** Accepted
- **Decision:** The compatibility layer will support operator functions that can
  be composed in the RxJS 7 pipeable style.
- **Rationale:** Pipeable composition is central to the source structure of many
  existing RxJS applications and enables incremental migration.
- **Consequence:** The exact `pipe`, `OperatorFunction`, and return-type contract
  remains an open API design question.

## D-006 — Use RxJS 7 tests as behavioral evidence, not an unqualified gate

- **Status:** Accepted
- **Decision:** Former RxJS 7 tests will be retained or rewritten to validate
  new operators where practical. Each test must be classified when platform
  semantics make an unchanged result impossible or misleading.
- **Rationale:** The old suite contains valuable behavioral knowledge, but it
  also encodes the old subscription model and implementation structure.
- **Consequence:** A compatibility ledger and explicit accepted-divergence
  category are required.

## D-007 — Use RxJS 9 as the probable release name

- **Status:** Proposed
- **Decision:** Prefer RxJS 9 over reviving the cancelled RxJS 8 name.
- **Rationale:** Reusing RxJS 8 would blur the distinction between the cancelled
  effort and this platform-based architecture.
- **Consequence:** Current `8.0.0-alpha` package versions are not authoritative.
  Final versioning and pre-release naming remain release decisions.

## D-008 — Provide migration Skills and MCP capabilities

- **Status:** Deferred
- **Decision:** Plan to ship AI-oriented knowledge and tools that help users
  apply RxJS Next and migrate from RxJS 7.
- **Rationale:** The semantic migration is substantial and benefits from
  repository-grounded, executable assistance.
- **Consequence:** Do not design the packaging, permissions, server model, or
  release coupling until the runtime and compatibility APIs are stable enough
  to encode.

## D-009 — Separate the attested WPT harness gate from conformance work

- **Status:** Superseded
- **Superseded by:** D-011 for command and CI semantics. Its pinned import,
  attestation, and reviewed-baseline requirements remain incorporated into
  D-011.
- **Decision:** Test the fallback with the official browser WPT runner against
  WPT commit `6a009d73f0d315941b90cac13a9523a2a08c631b`. The blocking harness
  gate requires complete execution, exact RxJS implementation identity in
  every test realm, and an exact reviewed result baseline. It does not require
  all upstream behavior tests to pass. A separate strict gate represents later
  conformance work.
- **Rationale:** A native-capable browser is required for realistic window,
  worker, iframe, and Web IDL behavior, but its native Observable could make a
  fallback suite pass for the wrong reason. Exact constructor, `subscribe`,
  `EventTarget.prototype.when`, and bundle-hash attestation prevents that false
  signal while allowing test infrastructure to land before behavior fixes.
- **Consequence:** The harness may mask native slots only inside disposable test
  realms and must not add a force-install API or otherwise alter production
  behavior. Every generated WPT URL has one independently audited attestation
  subtest that expectation metadata cannot suppress. Known behavior failures
  may enter the baseline only after three identical complete runs; unexpected
  passes are baseline mismatches as well as unexpected failures. Advancing WPT,
  browser, reviewed realm patterns, or expectations is an explicit update.

## D-010 — Exercise the Observable WPT harness on Node 24

- **Status:** Accepted
- **Decision:** The repository tooling engine declaration includes Node 24,
  and the blocking and advisory Observable WPT workflows run their JavaScript
  tooling on Node 24.
- **Rationale:** Node 24 is an actively used development runtime, and the WPT
  commands must not require an engine-check bypass before their own
  prerequisites or tests can run.
- **Consequence:** WPT import verification, harness unit tests, doctor checks,
  and browser execution must work under Node 24. Existing Node 18 and Node 20
  development declarations remain in place. This decision does not settle the
  final runtime support matrix for published RxJS packages.

## D-011 — Make `test:wpt` the strict conformance command

- **Status:** Accepted
- **Decision:** `pnpm run test:wpt` and the blocking WPT CI job require every
  upstream Observable WPT test and subtest to pass. Any upstream failure,
  error, timeout, or not-run result exits nonzero. The current known-failure
  comparison remains available only as the explicitly named
  `pnpm run test:wpt:baseline` diagnostic.
- **Rationale:** A command named `test:wpt` should communicate actual WPT
  success or failure without requiring contributors to know that a passing
  process previously meant only “matches known failures.”
- **Consequence:** The default command prints progress, aggregate statuses,
  every non-passing URL and subtest, and artifact paths for diagnosis. It
  remains attested and fails independently for incomplete execution, native
  leakage, malformed reports, or runner failures. Baseline metadata remains
  useful for deliberate harness analysis but cannot make `test:wpt` pass.
- **Evidence:** On 2026-07-24 the fallback passed all 52 pinned URLs and all
  525 upstream subtests with 52/52 exact-identity attestations in Chrome for
  Testing `150.0.7871.126`. Three further identical complete runs supported
  removing the obsolete failure expectations.

## D-012 — Publish framework-neutral virtual-time testing as `@rxjs/test`

- **Status:** Accepted
- **Decision:** Publish a function-first `rxTest(callback, config)` API from a
  separate `@rxjs/test` package. It hides the scheduler instance, returns
  `Promise<void>`, virtualizes the supported host timing APIs for the full
  async callback lifetime, and restores the realm on every exit path.
  `cold()` retains RxJS 7 producer-per-subscription behavior, `hot()` models a
  subject timeline, and `observable()` models the platform shared/ref-counted
  lifecycle.
- **Rationale:** RxJS Next operators use host scheduling APIs rather than a
  public scheduler abstraction, so deterministic tests must virtualize the
  host boundary. Separate source helpers prevent compatibility-cold behavior
  from being confused with the platform lifecycle.
- **Consequence:** The main RxJS package does not regain scheduler arguments or
  a public `TestScheduler`. Every host scheduling primitive adopted by a
  supported operator must have an `@rxjs/test` adapter, and production
  scheduling code must resolve the host function when scheduling rather than
  capturing it before `rxTest` patches the realm. Same-realm tests are
  serialized while globals are patched. The versioned global-registry Symbol
  used for the cross-copy test lock is deliberately shared and is not an
  Observable extension key.
- **Details:** `docs/rxjs-next/TESTING_DESIGN.md`.

## D-013 — Port RxJS 7 marble evidence through an explicit mode-aware registry

- **Status:** Accepted
- **Decision:** Preserve the RxJS 7 marble corpus in a source-pinned generated
  manifest with one compatibility classification and one execution disposition
  per case. Establish producer-per-subscription behavior against
  `ColdObservable` first. Reuse reviewed portable definitions in isolated
  fallback and native-if-present processes, where every platform case uses the
  ambient `Observable`. Retain missing APIs as pending converted definitions,
  exact duplicates as provenance links, and implementation mismatches as known
  failures rather than changing production behavior.
- **Rationale:** RxJS 7 tests contain valuable behavioral claims, but their
  scheduler, subscription, and cold-source assumptions cannot serve as an
  unqualified platform gate. Constructor selection must also precede Symbol
  extension installation to test the intended realm identity.
- **Consequence:** All source cases are executable registrations in cold,
  fallback-platform, and native-if-present modes. The default ported-test gate
  runs every applicable registration as an ordinary test, including exact
  duplicates and cases with known capability or conversion gaps. Any failure
  remains a process failure; recorded pass baselines are diagnostic evidence
  and cannot quarantine, skip, or invert a result. Unified capability adapters
  execute legacy names against their actual Next target Symbol or
  ambient-platform construction instead of misclassifying them as absent. The
  sharded launcher must continue through all shards and report progress while
  collecting the full failure output. The portable migration Skill contains
  no repository provenance or harness policy; those remain
  repository-specific.
- **Evidence:** The exhaustive manifest expands 2,201 physical declarations
  into 2,338 unique registrations: 401 active, 506 expected failures, 1,416
  missing API, 4 deduplicated, and 11 unsupported/obsolete. The complete cold
  audit records 432 passes and 1,906 failures; the polyfill audit records 436
  passes and 1,902 failures. Both reviewed baselines use unique case IDs. The
  generated parity map covers 113 operators and 34 creation/utility functions.
  See
  `docs/rxjs-next/RXJS_7_MARBLE_TEST_PORT_NOTES.md` and
  `docs/rxjs-next/RxJS-7-parity.md`.

## D-014 — Use pnpm 10 for repository tooling

- **Status:** Accepted
- **Decision:** Use pnpm 10.34.5 as the sole repository package manager for
  local development, workspaces, CI, documentation tooling, and release
  preparation. `pnpm-workspace.yaml` is the authoritative workspace definition,
  and installs use pnpm's default isolated linker. Dependency build scripts are
  governed by a version-bounded `allowBuilds` policy with `strictDepBuilds`
  enabled.
- **Rationale:** pnpm 10 supports the repository's Node 18, 20, and 24 tooling
  range, provides native workspace execution, avoids the former Jasmine/Mocha
  type hoisting collision, and exposes undeclared dependencies hidden by a flat
  Yarn Classic layout. pnpm 11 is not suitable while Node 18 and Node 20 remain
  supported.
- **Consequence:** CI and contributors use the committed `pnpm-lock.yaml` with
  pnpm 10.34.5. Workspace and release scripts must declare dependencies they
  import directly. New dependency install scripts fail until reviewed and
  added to the build policy. The pinned Husky 4 hook runner is patched to use
  `pnpm exec` because its legacy `pnpx --no-install` command is incompatible
  with pnpm 10. npm remains the publication registry client and remains
  appropriate in end-user installation examples.
- **Temporary bridge:** The workspace publicly hoists only
  `@rxjs/observable-polyfill` so current RxJS Next source can resolve its
  undeclared development-time edge. This is not a published dependency or
  installation decision and does not resolve P0.2.

## D-015 — Represent count windows through the unified buffer Symbol

- **Status:** Accepted
- **Decision:** The Symbol-keyed `buffer` operator supports count-based windows
  through `maxSize` plus `startEvery`. Supplying `startEvery` selects count
  windows; omitting it preserves the existing delay-window mode. The RxJS 7
  `bufferCount(bufferSize, startBufferEvery?)` adapter supplies
  `startEvery: startBufferEvery ?? bufferSize` and disables partial-buffer
  emission on source error.
- **Rationale:** Consecutive, overlapping, and gapped count buffers are one
  configuration of the existing unified buffering capability, not a reason to
  add a second string-named or standalone platform-layer operator.
- **Consequence:** Count mode starts an initial buffer when producer work
  activates, emits full buffers as they reach `maxSize`, and emits remaining
  non-empty buffers in creation order on normal completion. It retains the
  platform Observable's shared, ref-counted activation and AbortSignal
  cancellation. The current evidence establishes positive buffer sizes and
  start intervals only; validation semantics for zero, negative, non-integer,
  or otherwise invalid values remain outside this decision.

## D-016 — Give `withLatestFrom` source-led terminal semantics

- **Status:** Accepted
- **Decision:** The Symbol-keyed `withLatestFrom` subscribes to latest-only
  inputs before the primary source, emits only when the primary source emits
  after every latest-only input has produced a value, and completes or errors
  with the primary source. It accepts an optional projection over the primary
  and latest values.
- **Rationale:** The general `combine` primitive waits for every input to
  complete and treats its receiver as one configured input. Delegating
  `withLatestFrom` through that primitive duplicated the primary subscription,
  produced an extra tuple value, and prevented a finite primary source from
  completing when a latest-only input never completed.
- **Consequence:** Latest-only completion does not complete the result, but a
  latest-only error still errors it. Primary termination aborts all
  latest-only inputs through the result subscriber's signal. The derived
  Observable retains platform sharing and ref counting; the operator does not
  recreate RxJS 7 producer-per-subscription behavior.
