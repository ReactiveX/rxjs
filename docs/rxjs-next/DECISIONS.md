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
- **Decision:** RxJS will provide a fallback implementation, but any existing
  `Observable` takes precedence without conformance probing. Support is claimed
  only for implementations inside the documented capability boundary.
  String-named methods such as
  `Observable.prototype.map` remain part of the platform contract: they come
  from the native implementation when present and from the conforming fallback
  otherwise.
- **Rationale:** Native adoption is the point of the architecture, and replacing
  native behavior would undermine interoperability and conformance.
- **Consequence:** The current unconditional assignment to
  `globalThis.Observable` is prototype debt, not the target contract. RxJS must
  not replace a platform string-named method in order to add library behavior.
- **Installation detail:** D-041 defines the conditional side-effect,
  detection metadata, and per-realm initialization contract.

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

- **Status:** Superseded
- **Superseded by:** D-039.
- **Decision:** RxJS 7 compatibility behavior will be supplied through a
  separate library or package boundary rather than by changing the platform
  Observable contract.
- **Rationale:** Some high-value RxJS 7 behavior is incompatible with the
  platform's shared, ref-counted producer lifecycle.
- **Consequence:** Package boundaries and type relationships must make the
  distinction visible to users and tools.

## D-005 — Preserve pipeable operators in compatibility work

- **Status:** Superseded
- **Superseded by:** D-039.
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
- **Consequence:** A migration-evidence ledger and explicit
  accepted-divergence category are required. Passing former tests does not
  create a runtime-compatibility promise.

## D-007 — Release the platform-based generation as RxJS 9

- **Status:** Accepted
- **Decision:** Release this platform-based generation as RxJS 9. The first
  planned prerelease is `9.0.0-beta.0`.
- **Rationale:** RxJS 8 identifies an earlier line of work that was paused while
  the web-platform Observable was finalized. Reusing 8 would blur that history
  and imply that RxJS 9 is merely an incremental continuation rather than the
  new platform-based foundation.
- **Consequence:** The former `8.0.0-alpha` package versions are prototype
  history and were replaced by `9.0.0-beta.0` during P6.1. The root README, `rxjs` package
  documentation, and release notes must prominently answer “Where did RxJS 8
  go?” before the beta is published.

## D-008 — Provide migration Skills and defer MCP capabilities

- **Status:** Superseded by D-046
- **Decision:** Ship repository-grounded migration Skills that help users apply
  RxJS Next and migrate from RxJS 7. Broader MCP capabilities remain a
  possible later addition rather than a required runtime product.
- **Rationale:** The semantic migration is substantial and benefits from
  reviewable, executable assistance. D-039 rejects a runtime emulation package,
  making explicit migration guidance and tooling the supported path.
- **Consequence:** Do not design the packaging, permissions, server model, or
  release coupling until the RxJS Next runtime APIs and migration evidence are
  stable enough to encode. The existing marble-migration Skill is evidence for
  the approach, not the final distribution contract.
- **Supersession:** D-044 implemented an exploratory package slice. D-046 now
  defines the final agent-first boundary, one canonical Skill, thin harness
  adapters, and no accepted MCP product.

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
  `cold()` creates an independent producer during each subscription, `hot()`
  creates a subject-timeline producer before subscriptions, and `observable()`
  models the platform lifecycle in which the first subscription creates an
  active producer and concurrent subscriptions share it.
- **Rationale:** RxJS Next operators use host scheduling APIs rather than a
  public scheduler abstraction, so deterministic tests must virtualize the
  host boundary. Separate source helpers prevent producer-per-subscription
  cold test behavior from being confused with the platform lifecycle.
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
- **CI qualification:** D-055 keeps the ordinary nonzero test behavior but
  makes exact reviewed mode baselines a separate blocking CI gate.
- **Decision:** Preserve the RxJS 7 marble corpus in a source-pinned generated
  manifest with one migration classification and one execution disposition
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
  fallback-platform, and native-if-present modes. The RxJS package's
  `test:unit` gate runs every applicable ported registration as an ordinary
  test, including exact
  duplicates and cases with known capability or conversion gaps. Any failure
  remains a process failure; recorded pass baselines are diagnostic evidence
  and cannot quarantine, skip, or invert a result. Unified capability adapters
  execute legacy names against their actual Next target Symbol or
  ambient-platform construction instead of misclassifying them as absent. The
  launcher defaults to one isolated process per mode so Vitest transformation
  and collection run once; `RXJS_NEXT_SHARD_COUNT` and
  `RXJS_NEXT_SHARD_CONCURRENCY` remain explicit diagnostic-isolation
  overrides. When sharding is requested, the launcher must continue through
  all shards and report progress while collecting the full failure output.
  Ported Chai assertions install Loupe's `Symbol.for('chai/inspect')` hook only
  for the synchronous assertion call and remove it in `finally`. This prevents
  Loupe from mistaking the platform Observable `inspect` operator for a custom
  object formatter without changing that operator or assertion outcomes. The
  portable migration Skill contains no repository provenance or harness
  policy; those remain repository-specific.
- **Shared-inner evidence:** When a migrated RxJS 7 case reuses one `cold()`
  inner for multiple flattening subscriptions, cold mode retains the original
  producer-per-subscription expectation. In fallback or native platform mode,
  that same test fixture represents one shared, ref-counted producer:
  overlapping logical inner subscriptions join its current timeline, receive
  only future notifications, and may duplicate those notifications in the
  flattened result; a later subscription after ref-count closure starts a new
  producer timeline. Generator-owned mode-aware notification and producer-log
  expectations record this intentional platform divergence. They must be
  scoped to the exact case and expectation target and must not replace the
  platform fixture with `ColdObservable`.
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

## D-015 — Represent count and delay windows through the unified buffer Symbol

- **Status:** Accepted
- **Decision:** The Symbol-keyed `buffer` operator supports count-based windows
  through `maxSize` plus `startEvery`. Supplying `startEvery` selects count
  windows; omitting it preserves delay-window mode. Delay windows restart their
  selector after each boundary by default. Setting `restartDelay: false` keeps
  one notifier active across boundaries, which is the RxJS 7
  `buffer(closingNotifier)` lifecycle. The RxJS 7
  `bufferCount(bufferSize, startBufferEvery?)` adapter supplies
  `startEvery: startBufferEvery ?? bufferSize` and disables partial-buffer
  emission on source error.
- **Rationale:** Consecutive, overlapping, and gapped count buffers are one
  configuration of the existing unified buffering capability, not a reason to
  add a second string-named or standalone platform-layer operator. The same
  configuration needs an explicit distinction between a selector that creates
  a new closing notifier per boundary and one persistent closing notifier.
- **Consequence:** Count mode starts an initial buffer when producer work
  activates, emits full buffers as they reach `maxSize`, and emits remaining
  non-empty buffers in creation order on normal completion. It retains the
  platform Observable's shared, ref-counted activation and AbortSignal
  cancellation. Persistent delay mode emits the current buffer for every
  notifier value, emits the remainder on normal source completion, and cancels
  source and notifier work when the result terminates or loses its last
  observer. The current evidence establishes positive buffer sizes and start
  intervals only; validation semantics for zero, negative, non-integer, or
  otherwise invalid values remain outside this decision.

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

## D-017 — Keep `Subject.asObservable()` local to the Subject class

- **Status:** Accepted
- **Decision:** The exploratory RxJS `Subject` class exposes
  `subject.asObservable()` as an intentional class-local method. It returns a
  distinct instance of Subject's base Observable that subscribes to the
  Subject with the derived subscriber's `AbortSignal`. No string-named
  `asObservable` property is installed on the platform Observable prototype.
- **Rationale:** RxJS 7 users need a read-only view that hides `next`, `error`,
  and `complete`, while the platform Observable surface must remain free of
  RxJS-specific string methods.
- **Consequence:** Values and terminal notifications pass through unchanged,
  including completion or error observed after the Subject has already
  terminated. Under the platform fallback, concurrent observers of one view
  share a single active forwarding subscription and ref-count it. The method
  does not give the platform Observable RxJS 7
  producer-per-subscription behavior.

## D-018 — Flush selector-based debounce state on source completion

- **Status:** Accepted
- **Decision:** In the function-selector form of the Symbol-keyed `debounce`
  operator, a selector value emits the pending source value. A selector that
  completes without a value leaves the source value pending. Normal source
  completion emits that pending value immediately and then completes, even
  when the selector completed empty or would otherwise never terminate.
- **Rationale:** The selector describes the pending value's silence boundary;
  it does not own the result Observable's terminal lifecycle. Waiting for a
  completed or nonterminating selector after the source completes strands the
  final value and leaves the result open.
- **Consequence:** Each source value cancels the preceding selector. Source
  completion aborts the active selector after flushing its value, while source
  error or result cancellation discards pending state and closes source and
  selector work through `AbortSignal`. Concurrent result observers retain one
  shared, ref-counted activation. This decision does not change the numeric
  delay form or add scheduler overloads.

## D-019 — Flush numeric debounce state on source completion

- **Status:** Accepted
- **Decision:** In the numeric-delay form of the Symbol-keyed `debounce`, each
  source value replaces the preceding host timer. A timer emits the latest
  pending value once. Normal source completion emits a pending value
  immediately before completing rather than waiting for its timer.
- **Rationale:** The numeric delay governs silence between source values; it
  must not postpone the source's terminal notification or strand the final
  value after the source has completed.
- **Consequence:** Source error and result cancellation discard pending state
  and cancel the host timer through `AbortSignal`. Concurrent result observers
  share one source activation and one timer under the platform lifecycle. This
  decision does not add scheduler arguments, scheduler injection, providers,
  or `SchedulerLike` compatibility.

## D-020 — Give retry delay notifiers one-shot lifecycle ownership

- **Status:** Accepted
- **Decision:** In the function-selector form of the Symbol-keyed `retry`
  operator, each source error invokes the selector with a one-based consecutive
  retry count and activates one notifier. The notifier's first value cancels
  that notifier before starting the next source attempt. Notifier completion
  completes the result, while notifier error or a selector throw errors it.
- **Rationale:** A delay notifier authorizes at most one retry. Leaving it
  active after that authorization lets later notifier values start duplicate
  source attempts and lets a later completion terminate a retry already in
  progress. Deriving the retry count from an infinite remaining-count budget
  also produces `NaN`, defeating selector-controlled backoff.
- **Consequence:** Source and notifier work have distinct cancellation state
  joined to the result subscriber's `AbortSignal`. Result cancellation closes
  whichever phase is active, and concurrent observers retain one shared,
  ref-counted retry run. `resetOnSuccess` resets both the remaining retry budget
  and selector count. This decision does not change numeric delay scheduling or
  add scheduler providers.

## D-021 — Unify audit and throttle with explicit trailing-window restart

- **Status:** Accepted
- **Decision:** The Symbol-keyed `throttle` implementation owns both RxJS 7
  throttle and audit behavior. A duration value closes a window and may emit a
  pending trailing value; duration completion only cleans up the window and
  does not emit. Throttle restarts its duration after a trailing emission by
  default. The audit migration adapter supplies `leading: false`,
  `trailing: true`, and `restartOnTrailing: false`, so the next source value
  starts the next audit window.
- **Rationale:** Audit and throttle share duration selection, cancellation,
  terminal behavior, and leading/trailing state, but differ in who opens the
  window after a trailing emission. Treating audit as ordinary
  leading-false/trailing throttle incorrectly creates an extra window from the
  emitted audit value and changes later values and timing.
- **Consequence:** Source completion is immediate unless an active duration
  owns a pending trailing value. That value may be emitted by a duration value
  before completion. Source, duration, selector, and last-observer termination
  close all active work through `AbortSignal`. The platform fallback retains
  one shared, ref-counted source and duration activation for concurrent
  observers; this decision does not introduce producer-per-subscription
  behavior.

## D-022 — Complete zip when a finished input cannot form another tuple

- **Status:** Accepted
- **Decision:** The standalone `zip(sources)` maintains source-ordered FIFO
  buffers and, when `fillAfterComplete` is not configured, completes as soon
  as any completed input has an empty buffer. The terminal check runs both
  when an input completes and immediately after a tuple drains its buffers.
  With `fillAfterComplete`, a completed empty input contributes the configured
  fill value only while at least one real buffered value remains. An empty
  source list completes immediately.
- **Rationale:** Once a completed input has no buffered value, no future input
  notification can produce another complete tuple. Waiting for every sibling
  to complete strands the result after an empty input and after the shortest
  input's final tuple.
- **Consequence:** An immediately empty Observable or iterable completes the
  result. Draining the last value buffered by a completed input emits that
  final tuple and then completes in the same turn. Result completion aborts
  sibling work through the result subscriber's signal, and synchronous
  termination prevents later source activation. Fill mode drains unequal
  completed buffers without producing an infinite sequence of fill-only
  tuples. Concurrent platform observers share one zip activation and its
  buffers; this decision does not introduce queue scheduling or
  producer-per-observer behavior.

## D-023 — Keep RxJS map and filter overloads on exact Symbol keys

- **Status:** Superseded by D-059
- **Decision:** The RxJS `map` and `filter` contracts are installed only under
  their exported exact Symbol keys. Their RxJS forms preserve the projection
  or predicate index and optional `thisArg`; `filter` also preserves Boolean
  constructor and type-guard overloads. The platform string-named `map` and
  `filter` methods remain present and unchanged.
- **Rationale:** The platform and RxJS contracts overlap in name but not in
  their complete call shapes. Replacing or widening the platform string
  methods would erase that boundary, while `Symbol.for` would weaken collision
  isolation.
- **Consequence:** Applications choose the contract explicitly:
  `observable.map(project)` remains the platform operation and
  `observable[map](project, thisArg)` is the RxJS operation, with the analogous
  distinction for `filter`. Projection and predicate errors terminate the
  shared operator activation. Concurrent observers share one upstream
  activation and one index sequence under the platform lifecycle.
- **Reason superseded:** RxJS Next removes callback `thisArg` parameters rather
  than carrying this RxJS 7 convenience into the new API. Closures and
  `Function.prototype.bind` express the same receiver capture without forcing
  every operator notification through `Function.prototype.call`.

## D-024 — Let finite take cancel synchronous upstream work before its limit

- **Status:** Accepted
- **Decision:** The Symbol-keyed `take` uses a distinct upstream
  `AbortController` joined with the result subscriber's signal. When the count
  is reached, it aborts upstream before forwarding the limiting value and
  completing the result. A nonpositive count completes without activating the
  source.
- **Rationale:** Synchronous and reentrant producers must observe cancellation
  before they can perform work beyond the requested count. Reusing only the
  result signal would leave upstream active until downstream completion
  propagates.
- **Consequence:** The limiting value is still delivered, but upstream work is
  already closed when its downstream observer runs. Concurrent observers share
  one count and one source activation; last-observer cancellation closes that
  activation through the result signal. This is an operator-local cancellation
  boundary, not producer-per-observer platform behavior.

## D-025 — Scope tap and finalize hooks to a shared operator activation

- **Status:** Accepted
- **Decision:** The Symbol-keyed `tap` invokes notification side effects before
  forwarding each notification, calls `subscribe` once per shared activation,
  and calls `unsubscribe` followed by `finalize` when the last observer
  explicitly cancels. Natural completion or error calls `finalize` without the
  explicit-unsubscribe hook. The Symbol-keyed `finalize` invokes its callback
  exactly once per activation after the terminal notification reaches the
  downstream observer, or when the last observer cancels.
- **Rationale:** The platform Observable owns one active producer subscriber,
  not one producer per observer. Treating these hooks as observer-local would
  duplicate source-side effects and violate the accepted shared,
  ref-counted lifecycle.
- **Consequence:** Concurrent observers see the same tapped notification and
  lifecycle-hook run. A later observer after termination starts a new
  activation and therefore a new hook lifecycle. Errors thrown by `tap`
  notification handlers become stream errors; errors thrown by `finalize`
  after termination are host-reported and do not replace the already-delivered
  terminal notification. No string-named `tap` or `finalize` method is added,
  and the platform `finally` method remains unchanged.

## D-026 — Collect higher-order combination inputs before activating them

- **Status:** Accepted
- **Decision:** The Symbol-keyed `zipAll` and `combineLatestAll` collect every
  inner Observable value until their outer source completes, then activate the
  collected inputs through the existing hardened `zip` or exact static
  `combineLatest` contract. Optional legacy projection delegates to the exact
  RxJS `map` Symbol. `zipWith` delegates directly to standalone `zip` with the
  receiver as the first input.
- **Rationale:** Higher-order “all” operators have a two-phase lifecycle: the
  outer source defines the complete input set, and only its successful
  completion starts combination. Reimplementing the combination engines would
  duplicate their source ordering, buffering, completion, and cancellation
  rules.
- **Consequence:** An empty outer source completes without activating inner
  work. Outer errors discard collected inputs. `zipAll` completes when the
  shortest collected input can no longer form a tuple. `combineLatestAll`
  retains RxJS 7's wait-for-all-completions behavior when an input completes
  without a value; in particular, `never + empty` remains active. Concurrent
  observers share collection and inner work, last-observer cancellation closes
  both phases, and restart begins with an empty collection.

## D-027 — Scope distinct and reduction state to one shared activation

- **Status:** Accepted
- **Decision:** Stateful Symbol operators keep one state machine per active
  platform subscriber. `distinct`, `distinctUntilChanged`, and
  `distinctUntilKeyChanged` therefore share remembered keys across concurrent
  observers and reset them on restart. `reduce`, `count`, `every`, `min`, and
  `max` likewise share accumulation, predicate indices, and comparer work.
  `reduce` distinguishes an omitted seed from an explicitly supplied
  `undefined` seed by call arity.
- **Rationale:** Observer-local sets, indices, or accumulators would duplicate
  source-side work and contradict the platform's shared, ref-counted producer
  lifecycle. Seed arity and Set equality are observable RxJS 7 contracts, not
  implementation details.
- **Consequence:** Empty unseeded reduction completes without emitting, while
  an explicit `undefined` seed emits `undefined`. `min` and `max` reuse
  unseeded reduction so the first value initializes state. `distinct` uses
  JavaScript Set equality, subscribes to its main source before its optional
  flush source, and clears remembered keys on each flush value. Predicate,
  selector, comparer, source, and flush errors terminate the shared activation;
  cancellation closes every active source through `AbortSignal`.

## D-028 — Keep forkJoin as an exact static Symbol contract

- **Status:** Accepted
- **Decision:** RxJS `forkJoin` is installed only under its exported exact
  static Symbol. It accepts RxJS 7 array, object, deprecated rest, empty-input,
  and result-selector forms, converts inputs through the active platform
  constructor, and constructs its result through the static receiver.
- **Rationale:** `forkJoin` is an RxJS combination contract rather than a
  platform string-named constructor method. Its input normalization, last-value
  collection, and early-empty completion rules are observable behavior that
  should not be hidden in a test-only adapter.
- **Consequence:** Every input must emit and complete before the one result is
  delivered. An input that completes without a value completes the result
  immediately, cancels active siblings, and prevents later synchronous input
  activation. Input conversion, source, and selector errors terminate the
  shared activation. Concurrent observers share input work and last-value
  state; restart begins with empty state. No string-named `forkJoin` member or
  global Symbol registry key is introduced.

## D-029 — Treat catchError recovery as one shared activation

- **Status:** Accepted
- **Decision:** The exact Symbol-keyed `catchError` forwards ordinary source
  notifications and, on error, closes the failed source before invoking
  `selector(error, caught)`. A replacement accepts any platform
  `ObservableValue`. Returning the exact `caught` object restarts the original
  source inside the current shared activation, using a synchronous trampoline
  instead of recursive stack growth.
- **Rationale:** Subscribing to `caught` as an ordinary replacement would join
  the already active shared result and fail to reproduce RxJS caught-source
  retry behavior. Recursive resubscription would instead consume the JavaScript
  stack. Both outcomes violate the intended recovery lifecycle.
- **Consequence:** Selector and replacement work run once per shared error, not
  once per downstream observer. Result cancellation owns whichever source or
  replacement phase is active, and a later observer after termination starts a
  fresh recovery activation. Synchronously returning `caught` forever remains
  synchronously non-yielding; source-skipped parity evidence for that case must
  use a deterministic in-subscription cancellation rewrite rather than changing
  production timing or relying on an external virtual-time boundary.

## D-030 — Separate RxJS terminal selection from platform Promise consumers

- **Status:** Accepted
- **Decision:** RxJS `first`, `last`, and `single` are installed only under
  their exported exact Symbol keys. The platform string-named `first()` and
  `last()` Promise consumers remain unchanged. The Symbol forms preserve RxJS
  predicate, index, source, Boolean/type-guard, and explicit-default overloads,
  including the distinction between an omitted default and an explicitly
  supplied `undefined`.
- **Rationale:** The platform consumers and RxJS operators have different
  return types, overloads, error behavior, and cancellation boundaries.
  Replacing or widening the platform string methods would collapse that
  architectural separation.
- **Consequence:** `first` cancels upstream before delivering its first match;
  `last` emits its stored final match only after successful completion; and
  `single` errors as soon as a second match is observed. Missing results use
  the public RxJS-compatible `EmptyError`, `NotFoundError`, or `SequenceError`
  values as appropriate. Predicate and selection state is shared by concurrent
  platform observers and resets on restart. The error values and Symbol
  modules are public package exports without adding string-named RxJS methods
  to the platform prototype.

## D-031 — Keep notifier gates and synchronous query utilities on exact Symbol keys

- **Status:** Accepted
- **Decision:** RxJS `takeUntil`, `skipUntil`, `pluck`, `find`, `findIndex`,
  `throwIfEmpty`, `isEmpty`, `startWith`, and `pairwise` are exact instance
  Symbol contracts. `partition` is an exact static Symbol contract. The
  platform string-named `find()` Promise consumer remains unchanged. Notifier
  gates activate their notifier before the source. `takeUntil` completes on
  the notifier's first value; `skipUntil` opens on that value and closes the
  notifier activation. Notifier completion without a value does not terminate
  or open either gate.
- **Rationale:** These portable RxJS 7 contracts do not require
  producer-per-observer behavior, but their overloads, subscription order,
  sentinels, source identity, early cancellation, and state ownership are
  observable behavior. Exact Symbols preserve the platform surface while one
  activation-scoped state machine preserves the platform lifecycle.
- **Consequence:** `find`, `findIndex`, and `isEmpty` cancel synchronous
  upstream work before delivering an early result. `throwIfEmpty` creates its
  default or custom error only after empty successful completion. `pluck`
  traverses exact property keys and returns `undefined` after a nullish path
  segment. The two `partition` branches keep independent predicate and index
  state over the platform-converted input. `startWith` emits its prefix before
  source activation, while `pairwise` retains one previous value per active
  run. Concurrent observers share each operator's activation state, and a
  restart begins with fresh state. No RxJS string method or global-registry
  Symbol is introduced. The legacy trailing-scheduler form of `startWith`
  remains in the explicit scheduler-last migration-evidence queue.

## D-032 — Keep count windows and recursive generation synchronous and activation-scoped

- **Status:** Accepted
- **Decision:** `windowCount` and `expand` are exact instance Symbol contracts,
  and `generate` is an exact static Symbol contract. `windowCount` publishes
  its initial window before source activation, supports tumbling, overlapping,
  and gapped cadence, completes live windows on source completion, errors them
  before forwarding a source error, and silently releases still-live windows
  when the outer result is cancelled. `generate` supports synchronous
  positional and options-object state generation through the static receiver.
  `expand` emits each source or projected value before recursively projecting
  it, processes queued work in arrival order under its concurrency limit,
  converts projections through `Observable.from`, and drains iteratively so
  synchronous recursion does not grow the JavaScript stack.
- **Rationale:** Window ownership and recursive queueing are activation-level
  lifecycle contracts. Keeping scheduler behavior out of these platform-layer
  Symbols preserves the host and signal architecture while representing the
  portable RxJS 7 behavior directly.
- **Consequence:** Concurrent platform observers share one set of live windows
  or one recursive generation run, and restart begins with fresh state.
  Last-observer cancellation closes source and projected work through
  `AbortSignal` and discards queued recursive work. The parity adapter
  translates RxJS 7 numeric `expand` concurrency to `{ concurrent }`. Legacy
  scheduler fields and trailing scheduler arguments are handled by D-033
  instead of being treated as ordinary values or silently accepted by these
  Symbol contracts.

## D-033 — Resolve legacy scheduler evidence at the migration-test boundary

- **Status:** Accepted
- **Decision:** Do not restore RxJS 7 scheduler classes, providers, parser
  internals, or general scheduler arguments in the platform package to satisfy
  ported tests. Host-timed public Symbols use platform timers, animation
  frames, or narrow timestamp providers. Ported cases whose durable claim
  depends on legacy scheduling use explicit `@rxjs/test` timing rewrites in
  the checked-in migrated source or test-local migration sentinels.
- **Rationale:** RxJS 7 schedulers combine public API, execution policy, and
  producer-per-subscription Observable assumptions that do not belong in the
  platform lifecycle layer. The virtual host environment can preserve notification timing,
  subscription windows, cancellation, ordering, and error evidence without
  presenting test machinery as a supported runtime abstraction.
- **Consequence:** Passing scheduler-related ported cases is evidence for the
  represented behavior, not a promise that an RxJS 7 scheduler object or class
  is accepted by the corresponding platform Symbol. `observeOn` and
  `subscribeOn` expose host-delay contracts, legacy overloads remain explicitly
  deferred in the capability map, and production scheduling continues to use
  `AbortSignal` cancellation and the platform `Subscriber` lifecycle.

## D-034 — Resolve host scheduling APIs directly from `globalThis`

- **Status:** Accepted
- **Decision:** RxJS Next platform-layer code calls supported host scheduling
  and cancellation APIs through `globalThis` when it schedules or cancels work.
  It does not capture those functions during module evaluation and does not
  route them through RxJS-owned provider or delegate objects.
- **Rationale:** `@rxjs/test` virtualizes the realm's host boundary so RxJS work
  and application work share one deterministic event loop. A separate RxJS
  provider seam would virtualize only library-owned calls, duplicate the realm
  patching contract, and expose obsolete scheduler implementation details.
- **Consequence:** The exploratory `animationFrameProvider` export is removed.
  Timer, interval, animation-frame, idle-callback, and any future supported
  host scheduling integrations must use late `globalThis.*` resolution and
  receive a matching `@rxjs/test` adapter. Narrow timestamp-provider overloads
  remain valid because they select clocks rather than schedule work. References
  captured by application code before `rxTest` patches the realm remain outside
  the supported virtual-host boundary.

## D-035 — Define hot and cold only by producer-creation timing

- **Status:** Accepted
- **Decision:** “Hot” and “cold” describe when a producer exists relative to a
  subscription. A producer is hot for a subscription when it already exists
  before that subscription. A producer is cold for a subscription when the
  subscription creates it. Sharing, multicasting, replay, ref counting, and
  observer count are separate properties and must be described separately.
- **Rationale:** Treating “hot” as a synonym for shared or “cold” as a synonym
  for producer-per-observer obscures the actual producer lifecycle. The
  platform Observable demonstrates why: its first subscription creates an
  active producer, concurrent subscriptions join that existing producer, and a
  later subscription after ref-count closure creates another producer.
- **Consequence:** Documentation must not label the platform Observable “cold
  until subscribed” as though it has one permanent temperature. Every
  instantiated Subject is hot because the Subject producer exists before
  subscription. The exploratory `ColdSubject` name is therefore incorrect; it
  describes inheritance from `ColdObservable` and a per-observer subscription
  hook, not a cold Subject. D-036 resolves that name while preserving the hook
  required by the current `BehaviorSubject` and `ReplaySubject` prototypes.

## D-036 — Name the advanced Subject base by its subscription hook

- **Status:** Accepted
- **Decision:** Rename the exploratory `ColdSubject` class and public subpath
  to `PerSubscriptionSubjectBase`. Make the class abstract, give it a protected
  constructor, and expose a protected `_subscribe` hook that runs for each
  direct subscription routed through `ColdObservable.subscribe()`.
  `BehaviorSubject` and `ReplaySubject` subclass this base for current-value
  and buffered replay. Do not retain a `ColdSubject` alias or export.
- **Rationale:** Every instantiated Subject is hot under D-035, so
  `ColdSubject` is an oxymoron. The replacement name states all three important
  constraints: setup is per subscription, the value is a Subject, and the
  class is a base for advanced implementations rather than a general-purpose
  Subject.
- **Consequence:** The base's default `_subscribe` implementation owns retained
  terminal delivery and live fanout. Subclasses normally delegate to it; a
  subclass that uses the lower-level `addSubscriber` helper owns replay
  ordering, terminal handling, cancellation checks, and teardown correctness.
  The hook applies to direct JavaScript subscriptions only. Native Observable
  methods may use the platform's internal subscription algorithm and bypass
  the overridden `subscribe()` method, so this base is not a transparent native
  subscription interception mechanism. Removing the old public subpath is an
  intentional exploratory API rename.

## D-037 — Share only the versioned Observable creation protocol

- **Status:** Accepted
- **Decision:** Public RxJS operator and factory Symbols remain exact
  module-owned keys. The internal construction protocol is the deliberate
  exception: every compatible RxJS copy uses
  `Symbol.for('rxjs.kernel.create.v1')`. Installation on the active Observable
  constructor and prototype is idempotent. An existing callable implementation
  is retained; an occupied non-callable slot is a hard initialization error.
  The protocol property is non-enumerable, writable, and configurable.
- **ColdObservable contract:** `ColdObservable` is a real subclass of the
  active platform Observable. Its `[create]` implementation constructs a plain
  `ColdObservable`, so RxJS Symbol operators preserve producer-per-subscription
  compatibility. Every current string-named platform method is overridden to
  delegate through a fresh base Observable view. Observable-returning native
  methods therefore return platform Observables, and native Promise consumers
  activate the cold source through the same platform view.
- **Rationale:** An operator Symbol from one compatible RxJS installation must
  be able to discover the construction policy of a `ColdObservable` created by
  another installation. Globalizing every operator Symbol would unnecessarily
  surrender their collision isolation. A single namespaced and ABI-versioned
  protocol key provides the required interoperation without making the public
  extension catalog shared global territory.
- **Consequence:** `cold.map(project)` crosses to the platform lifecycle, while
  `cold[map](project)` remains on the cold direct-subscription lifecycle. Behavior-
  and replay-subject prototypes derived from `ColdObservable` inherit this
  rule; their Symbol-operator results are plain ColdObservables rather than
  Subject subclasses. Concurrent observers of one native-method result share
  that result's platform activation. A future incompatible creation protocol
  requires a new registry key, and construction-protocol subclasses that need
  to work with older operators must retain the older protocol slot. New platform
  methods must be audited and overridden before they are considered supported
  on `ColdObservable`. A Symbol operator cannot bypass `[create]` by delegating
  directly to a native method when that would change the receiver's
  construction policy.

## D-038 — Expose four explicit Observable-to-async-iterator strategies

- **Status:** Accepted
- **Decision:** Export exact instance Symbols named `iterateEachValue`,
  `iterateBufferedValues`, `iterateLatestValue`, and `iterateNextValue`.
  Invoking one on an Observable returns a fresh, lazy, one-shot async
  generator. The contracts are based on `rxjs-for-await` revision
  `94f9cf9cb015ac3700dfd1850eb81d36962eb70f`:
  `iterateEachValue` is lossless FIFO iteration,
  `iterateBufferedValues` is lossless microtask-coalesced batch iteration,
  `iterateLatestValue` keeps only the latest unread value, and
  `iterateNextValue` keeps only the first value received while the consumer has
  an outstanding request.
- **Lifecycle:** Generator state is iterator-local, but source activation
  follows the receiver's direct-subscription contract. Concurrent generators
  over a platform Observable join its current shared, ref-counted producer and
  receive only notifications emitted after each joins. Closing the final
  generator closes that producer; later iteration starts a new run.
  `ColdObservable` instead starts one independent producer run per generator.
  Generator cleanup aborts its source observer, and accepted queued, buffered,
  or latest values drain before completion or error is observed.
- **Rationale:** A push Observable cannot become a pull-then-push
  `AsyncIterable` without choosing how to handle values produced while the
  consumer is busy. Four named Symbols make the lossless memory tradeoffs and
  lossy selection policies explicit rather than hiding one policy behind a
  generic conversion name.
- **Consequence:** The exploratory standalone `eachValueFrom` and
  `bufferedValuesFrom` exports and package subpaths are removed without aliases.
  These public Symbols remain module-owned exact keys and do not use the global
  Symbol registry. Because they return async generators rather than derived
  Observables, they do not invoke the shared `[create]` construction protocol.
  Their direct installation does not resolve the still-open common installer
  or duplicate-package policy. D-040 and D-041 separately settle the package
  map and native-versus-polyfill acquisition contract. D-048 later selected a
  common installer, and D-051 supersedes that mechanism with direct assignment.

## D-039 — Prefer migration assistance over an RxJS 7 runtime compatibility product

- **Status:** Accepted
- **Decision:** RxJS Next will not publish a separate runtime package that
  emulates the RxJS 7 `Observable`, `Subscription`, pipeable-operator import
  surface, scheduler system, or deprecated aliases. Migration is supported by
  explicit RxJS Next APIs, documentation, behavioral evidence, and the Skills
  direction in D-008.
- **Intentional Next APIs:** `ColdObservable`, `PerSubscriptionSubjectBase`,
  the Subject family, and the exact Symbol-keyed `pipe` may remain in `rxjs`
  when their own contracts justify them. Their producer, sharing,
  cancellation, typing, and composition behavior is documented directly; their
  presence is not a blanket RxJS 7 compatibility promise.
- **Rationale:** A second runtime surface would duplicate the old architecture,
  blur the platform lifecycle, expand without a credible completion boundary,
  and delay migration to the actual RxJS Next contracts.
- **Consequence:** D-004 and D-005 are superseded. RxJS 7 tests and mappings
  remain migration evidence, including classifications that describe why a
  case requires producer-per-subscription or legacy harness behavior. Those
  classifications do not imply a compatibility package, facade, or support
  matrix.

## D-040 — Publish three packages with one-way platform acquisition

- **Status:** Accepted
- **Decision:** The target npm map contains three products:
  `@rxjs/observable-polyfill`, `rxjs`, and `@rxjs/test`.
  `@rxjs/observable` is removed rather than archived, renamed, or reused.
- **Package ownership:**
  - `@rxjs/observable-polyfill` is independently publishable, has no dependency
    on `rxjs`, supplies the conditional platform fallback, and owns the base
    ambient TypeScript declarations for `Observable`, `Subscriber`,
    `ObservableValue`, and `EventTarget.when`.
  - `rxjs` declares a runtime dependency on
    `@rxjs/observable-polyfill`. Its declarations augment the base platform
    types only for the exact Symbols imported by each entry point.
  - `@rxjs/test` uses the public `ColdObservable` for its explicit cold fixture.
    Per D-043, that entry conditionally installs the fallback only when the
    realm has no Observable and preserves an already selected constructor.
- **Entry points:** The `rxjs` root conditionally initializes the platform and
  exports intentional non-operator core classes and values, including cold,
  Subject, connectable, notification, and public-error primitives. It does not
  install operator or factory Symbols. Each public Symbol subpath conditionally
  initializes the platform and installs only its own capability and required
  internal kernel dependencies.
- **Rationale:** Keeping acquisition independently usable lets applications
  request only the platform fallback, while making it a declared `rxjs`
  dependency makes every direct public entry deterministic. A core-only root
  avoids turning one import into installation of the complete extension
  catalog.
- **Consequence:** P0.3 physically removes `packages/observable` and its
  preparation bridge, declares the dependency, and supplies root/subpath
  exports, type wiring, and package fixtures. Bundler metadata and
  duplicate-install policy remain later work.

## D-041 — Initialize and identify the Observable fallback per realm

- **Status:** Accepted
- **Decision:** `import '@rxjs/observable-polyfill'` is the standalone
  side-effect initializer. Every public `rxjs` entry point evaluates that same
  conditional initializer before accessing `Observable`.
- **Selection:** If `globalThis.Observable` exists, preserve it without
  conformance probing, warnings, or replacement, and do not install a separate
  `Subscriber` beside it. If it is absent, install the paired RxJS fallback
  `Observable` and `Subscriber`. If `globalThis.EventTarget` exists, install
  `EventTarget.prototype.when` only when that property is absent; never replace
  an existing method.
- **Detection contract:** Export `observablePolyfillInfo`, backed by
  `Symbol.for('rxjs.observable.polyfill.info.v1')`, and
  `getObservablePolyfillInfo(constructor = globalThis.Observable)`. An
  RxJS-installed constructor owns a non-enumerable, non-writable,
  non-configurable property at that key whose frozen value is
  `{ packageName, version }`. The helper returns that metadata object or
  `undefined` for an unmarked native or foreign implementation. Metadata object
  identity distinguishes installation instances without UUID or crypto
  requirements. Initialization checks only during module evaluation; ordinary
  operators do not poll the marker.
- **Realms and servers:** Each window, iframe, worker, or server isolate
  initializes independently. Imports do not traverse child realms or patch
  foreign constructors, and transparent cross-realm Observable operation is
  not supported. Server installation is isolate-global and idempotent, not
  per-request.
- **Support boundary:** The initial claim was capability-based for browser
  windows, worker realms, and maintained Node releases with the required web
  primitives. D-053 now accepts an exact release matrix including Deno and Bun.
  Edge runtimes, hardened globals, and non-extensible constructors or
  prototypes remain unclaimed until explicitly tested.
- **Consequence:** The first existing constructor wins, including an earlier
  RxJS fallback version; the helper reports its marker when present. P0.3
  implements a preflighted transactional installation and fixtures clear,
  non-partial failure on unsupported frozen targets. P0.4 completes the shared
  native/fallback lifecycle contract and historically proved that mixed
  ESM/CommonJS builds preserved the first fallback installation's constructor, subscriber,
  side-effect, abort-bridge, and marker identities. This does not settle P2.1's
  broader extension-Symbol policy across versions and independently bundled
  copies.

## D-042 — Permit argument-free notification for `Subscriber<void>`

- **Status:** Superseded by D-045
- **Decision:** `Subscriber<void>.next()` is a valid TypeScript call. The RxJS
  fallback emits `undefined` for that call. Non-void subscribers retain a
  required value through the same ordinary `next(value: T)` signature, so
  `Subscriber<number>.next()` remains a type error. The fallback runtime does
  not throw solely because `next` was called without an argument; JavaScript
  has no runtime generic with which to distinguish a void subscriber.
- **Rationale:** Void producers should express a signal with `next()` instead
  of rewriting call sites to the noisier `next(undefined)`. The public type
  boundary should model that intent directly, and the cold/test subscriber
  implementations must preserve it.
- **Consequence:** The pinned WPT revision requires Web IDL argument-presence
  checks for `Subscriber.next(any)` and therefore reports three strict
  failures: Web IDL, window constructor, and worker constructor coverage.
  D-041 still preserves a native constructor, whose own runtime may enforce
  that Web IDL rule even though the ambient generic signature permits the call.
  D-011 remains strict and continues to expose the fallback failures. P0.5
  must record how explicit product-policy divergences relate to the chosen
  specification and WPT baseline; vendored upstream tests are not modified.

## D-043 — Keep rxTest source construction explicit and use stock Vitest reporting

- **Status:** Accepted
- **Decision:** `rxTest.cold()` returns a named test fixture extending
  `ColdObservable`; its inherited `[create]` returns an ordinary
  `ColdObservable`. `rxTest.hot()` returns an absolute-time broadcast fixture
  extending the active `globalThis.Observable`; its explicit `[create]` returns
  an ordinary instance of that active constructor. `rxTest.observable()`
  constructs directly from the active global constructor and keeps its shared,
  ref-counted lifecycle. Cold compatibility never replaces
  `globalThis.Observable`.
- **Test reporting:** The RxJS 7 corpus is materialized as formatted Vitest
  `.spec.ts` files that call `rxTest` and public Symbols directly. These are
  checked-in, destination-owned sources rather than regenerated artifacts. Normal runs
  use Vitest's built-in default reporter unchanged. Complete audits use its
  built-in JSON reporter, with manifest identity recovered from a static
  migration report rather than machine IDs in test titles.
- **Rationale:** Fixture-only subclass behavior must not leak into operator
  results. Real test modules give failures repository paths and line numbers
  that editors can open, while stock reporters avoid a bespoke output protocol
  contributors must learn or maintain.
- **Consequence:** Importing `@rxjs/test` imports the public cold entry and
  therefore conditionally initializes the fallback in an empty realm while
  preserving a native constructor. Cold migrated tests name
  `ColdObservable` explicitly for cold construction and static factories.
  Hot-derived operator results cross into the platform lifecycle, so the
  Phase 3 reviewed cold audit records 2,299/2,338 passes; the fallback-platform
  audit records 2,316/2,338. All remaining failures are explicit intentional
  lifecycle divergences or compatibility-only arbitrary-subscribable inputs.
  The removed dynamic launcher, shard renderer, fake
  source locations, and case-ID test-title prefixes are not compatibility
  surfaces.

## D-044 — Publish one-time migration tooling and make its output project-owned

- **Status:** Superseded in part by D-046
- **Decision:** Publish `@rxjs/migrate` as a development-only package containing
  a framework-neutral RxJS 7 semantic transform, caller-supplied capability
  maps, a dry-run-first CLI, reusable Skill assets, and bounded read-only MCP
  tools. Test-framework syntax is handled by adapters; Mocha/Chai-to-Vitest is
  the first supported pair, while preserving the existing framework remains
  the default. Transformed files become ordinary source owned by the destination
  project and are never maintained by a runtime generator.
- **Rationale:** Users need reviewable changes that preserve real filenames,
  direct `rxTest` usage, and normal runner behavior. Keeping framework syntax
  separate from RxJS semantics permits Jest, Node test runner, or other targets
  without encoding them into the marble model. The same semantic pipeline can
  migrate production `pipe(...)` expressions even when no test framework or
  `TestScheduler` is present.
- **Consequence:** The CLI writes only with explicit `--write` and records
  source repository, exact SHA, and path. MCP tools accept source content and
  return source content plus diagnostics; they do not receive filesystem
  authority. The repository dogfoods the package into checked-in `cold/` and
  `platform/` Vitest specs, and keeps only its native/polyfill execution matrix
  as repository-specific harness behavior. Broader framework adapters and the
  eventual Skill/plugin portfolio can evolve without changing this package's
  runtime-independent boundary.
- **Supersession:** D-046 retains the deterministic package, dry-run-first CLI,
  framework boundary, and project-owned output. It replaces the assumption
  that a bundled test-migration Skill and source-content MCP together form the
  migration product. The complete product is agent-first, has one canonical
  packaged Skill, and has no accepted MCP release surface.

## D-045 — Require the pinned Observable WPT suite to pass completely

- **Status:** Accepted
- **Decision:** The written Observable reference is WICG/observable commit
  `d74bace7cf80200a01c81cfe20961e29ac7fa3d8`, specifically `spec.bs`. The
  executable conformance gate is the selected Observable closure from
  web-platform-tests/wpt commit
  `6a009d73f0d315941b90cac13a9523a2a08c631b`. `pnpm run test:wpt` must pass all
  52 generated URLs, all 525 upstream subtests, and all 52 exact RxJS
  implementation attestations, with zero failures, errors, timeouts, skips,
  not-run results, or accepted-failure metadata. Upstream tests remain
  byte-for-byte unchanged.
- **Runtime and types:** `Subscriber.next` requires one argument. Calling it
  without an argument throws `TypeError` before notification delivery or the
  closed-state check. `Subscriber<void>.next(undefined)` remains valid and
  delivers `undefined`; `Subscriber<void>.next()` is a type error. D-042 is
  superseded.
- **Rationale:** The WICG repository explains the written behavior, while WPT
  supplies the executable, realm-aware acceptance tests. Recording both exact
  revisions makes failures diagnosable and results reproducible without
  creating two separate success gates. A complete pinned WPT pass is a simpler
  and stronger contract than maintaining RxJS-specific exceptions.
- **Ownership and updates:** RxJS maintainers own both pins. Updating WPT
  requires an explicit reviewed change to one exact commit, review of every
  changed Observable test, dependency, URL, and realm pattern, import and
  provenance verification, and the same complete strict result before the new
  revision becomes the target. The matching written-spec reference must be
  reviewed and updated when applicable. Scheduled newer-Chrome runs are
  advisory and never change either pin or weaken the all-pass gate.

## D-046 — Make migration agent-first with one canonical Skill and no MCP product

- **Status:** Accepted
- **Decision:** The primary RxJS 7-to-Next migration product is one portable
  Agent Skill that assesses the repository, establishes or strengthens a
  passing RxJS 7 behavioral baseline, records explicit target contracts,
  invokes bounded deterministic transforms, and iterates through build and test
  repair with the developer. `@rxjs/migrate` is the versioned deterministic
  engine used by that Skill; it cannot select ambiguous lifecycle semantics or
  claim that its output completes a migration.
- **Canonical source:** `packages/migrate/skill` is the only authored Skill
  source and shares the `@rxjs/migrate` package version. Codex, Claude, and
  Cursor receive validated copies or links plus thin discovery, invocation,
  permission, and update adapters. Harness-specific material must not fork the
  workflow or capability claims.
- **MCP:** The P0.M1 source-content MCP prototype is not part of the accepted
  release architecture. Its operations mirror the local library and CLI and
  do not justify a separate protocol, dependency, permission, or validation
  surface. P0.M3 removed it completely. Reintroducing MCP requires a new accepted decision
  identifying a necessary capability that the CLI, library, Skill resources,
  and host agent tools cannot provide adequately.
- **Evidence:** Deterministic engine behavior is proved with golden or
  invariant output, diagnostics, compilation, idempotence, path containment,
  CLI/API equivalence, and behavioral fixtures. Agent output is not graded by
  exact patch text; it is graded by the RxJS 7 baseline, target-contract
  manifest, required warnings and escalations, compile/build/test outcomes,
  intentional divergences, and refusal to weaken evidence.
- **Rationale:** Platform sharing versus producer-per-direct-subscription
  behavior is an application decision that syntax alone cannot recover. A
  local coding agent can combine repository evidence, developer intent, the
  deterministic engine, and project commands without an MCP intermediary. One
  versioned Skill prevents Codex, Claude, and Cursor instructions from drifting
  away from the engine they orchestrate.
- **Consequence:** P0.M3 hardens and bounds the engine, P0.M4 implements the
  canonical Skill and harness adapters, and P0.M5 qualifies the workflow on
  representative repositories. A transformed file, green narrow test, or
  operator-name match is never sufficient proof that a project is migrated.
- **Details:** `packages/migrate/docs/MIGRATION_TOOLING_DESIGN.md`.

## D-047 — Bound P0 live migration qualification to Codex/ChatGPT

- **Status:** Accepted
- **Decision:** P0.M5 runs each representative migration repository once
  through Codex/ChatGPT. Claude Code and Cursor remain supported Skill
  installation targets from P0.M4, but P0 does not spend additional live-model
  runs to claim their outcome parity.
- **Rationale:** The four-repository Codex lane exercises every declared
  behavior category, decision point, positive oracle, refusal control, and
  semantic outcome gate while keeping live evaluation time and cost bounded.
  Cross-harness repetition would increase cost without producing a statistical
  reliability estimate from the small sample.
- **Consequence:** Release-facing evidence must say “Codex/ChatGPT-qualified,”
  not “cross-harness-qualified.” Claude Code and Cursor may use the canonical
  Skill naturally, but their live migration outcomes remain unmeasured until a
  later explicit qualification effort.

## D-048 — Isolate public extension Symbols and install them transactionally

- **Status:** Accepted in part; the installation mechanism is superseded by
  D-051. The public identity, shared-protocol, realm, and bundling decisions
  remain accepted.
- **Public identity:** Every public operator and factory exports an exact,
  module-owned `Symbol('name')`. Its identity is stable only through that
  loaded module export. Independently evaluated duplicate package copies and
  different package versions deliberately produce different public Symbols,
  even when their descriptions match. RxJS 9's ESM-only distribution makes
  `import` and the Node `require(esm)` bridge resolve the same module instance
  and therefore the same Symbols. Each independently evaluated copy installs
  and invokes its own exact slot, so version-skewed capabilities
  can coexist without overwriting one another. Public Symbols are not
  persistent identities and are not stable across major versions or package
  instances.
- **Shared protocols:** The versioned construction ABI from D-037 and the
  read-only fallback metadata from D-041 remain the only accepted RxJS
  `Symbol.for` uses. An existing callable construction-protocol slot is
  sufficient evidence of participation in that ABI; a stronger package marker
  would reject compatible custom implementations without improving the
  protocol contract. The unreviewed public `Symbol.for('buffer')` exception is
  removed.
- **Installation (superseded):** Public capabilities use one internal typed
  installer. It preflights all static and instance targets before mutation, defines
  non-enumerable, writable, configurable properties, accepts an already
  installed identical value, rejects a different value at the exact Symbol,
  and rolls back if a later definition fails. Missing capacity and exact-key
  conflicts produce named diagnostics rather than silent replacement or a
  partial install.
- **Realms:** A capability module installs only into the active Observable of
  the realm in which that module evaluates. RxJS does not traverse foreign
  realms. A worker, iframe, window, or isolate obtains its own installation by
  evaluating the entry point in that realm, consistent with D-041.
- **Bundling:** Every public `rxjs` entry point has an acquisition side effect,
  and Symbol subpaths additionally install their exact capability. The package
  therefore declares itself side-effectful. Direct subpaths, rather than a
  side-effect-free package claim, provide capability-level granularity.
  Package fixtures must prove that bundling retains an otherwise unused
  extension import and that the root remains operator-free.
- **Rationale:** Exact public Symbols preserve collision isolation. Sharing
  them through the global registry would allow unrelated code that knows a
  string key to replace RxJS behavior and would turn version skew into
  load-order replacement. A transactional installer makes deliberate
  exact-key conflicts and unsupported targets diagnosable without weakening
  the identity boundary.
- **Supersession:** D-051 replaces only the transactional installer and custom
  descriptor policy. Exact module-owned public Symbols, realm-local
  installation, side-effectful subpaths, and the two approved shared protocol
  keys remain unchanged.

## D-049 — Separate derived construction from platform input conversion

- **Status:** Accepted
- **Derived construction:** Observable-returning RxJS Symbols create their
  result through the receiver's D-037 `[create]` protocol. An instance receiver
  with the inherited protocol preserves a same-realm subclass whose
  constructor accepts the platform initializer shape. A receiver may override
  `[create]` to select another intentional result contract, as
  `ColdObservable` does. Static Symbols follow the callable static receiver's
  protocol. Constructors with incompatible signatures are unsupported rather
  than silently replaced with the base constructor.
- **Input conversion:** Operator inputs cross the active realm's platform
  boundary through `Observable.from`; conversion does not consult or preserve
  the derived-result receiver. This keeps the accepted platform input order,
  categories, identity, and error behavior separate from RxJS result
  construction. Cross-realm and arbitrary-subscribable conversion remain
  outside the accepted platform contract.
- **Borrowing:** A borrowed Symbol implementation is supported only when its
  receiver supplies the Observable behavior the implementation uses and a
  callable compatible `[create]` protocol. RxJS does not promise generic
  borrowing onto unrelated objects or transparent foreign-realm behavior.
- **Cancellation and errors:** Semantically ordinary upstream subscriptions
  are owned by the derived subscriber's `AbortSignal`. Operators that need an
  earlier local boundary join an operator-owned controller with that signal.
  Synchronous user callbacks, host setup, and input conversion are caught and
  forwarded through `subscriber.error`; errors thrown by downstream observers
  remain the platform's host-reporting responsibility. Root-core and
  Subject-like connections, async-generator adapters, lifecycles intentionally
  retained beyond the outer result, and terminal/finalization paths keep raw
  subscriptions when destination-signal ownership would change behavior.
- **Implementation pattern:** Operators and factories invoke the receiver's
  `[create]` protocol directly; a one-line construction wrapper adds no useful
  boundary. Internal helpers retain active-realm input conversion, while one
  positional source-subscription helper owns bound default forwarding, guarded
  notification overrides, setup-error routing, and optional local-signal
  joining. This pattern does not add a scheduler, legacy Subscription facade,
  compatibility input, or string-named method.
- **Rationale:** Result identity and input normalization solve different
  problems. Conflating them would either lose intentional construction such as
  `ColdObservable` or let a custom receiver redefine the platform conversion
  boundary. The explicit split gives operators one reviewable lifecycle and
  error pattern.

## D-050 — Stabilize intentional cold, Subject, and Symbol composition APIs

- **Status:** Accepted
- **Public surface:** `rxjs` intentionally exports `ColdObservable`,
  `Subject`, `AsyncSubject`, `behaviorSubject`, `replaySubject`, and the
  advanced abstract `PerSubscriptionSubjectBase`. The exact `pipe` Symbol is
  imported from `rxjs/pipe`; the root remains operator-free. These names and
  subpaths are RxJS Next contracts rather than compatibility aliases.
- **Lifecycle:** Direct `ColdObservable.subscribe()` creates one producer and
  compatibility Subscriber per call. `Subject`, `AsyncSubject`, and the
  behavior/replay factories are hot producers with their documented fanout,
  current/final-value, replay, terminal, and late-observer behavior.
  `PerSubscriptionSubjectBase` describes observer-local setup and does not make
  a Subject producer cold. All cancellation uses `AbortSignal`.
- **Composition:** Instance `[pipe]` begins with its receiver. Static `[pipe]`
  normalizes its source through the active platform `Observable.from` boundary.
  Both forms return the final transformation result and support typed chains of
  one through seven transformations. They do not install `.pipe`, publish
  RxJS 7 pipeable functions, or restore `OperatorFunction`.
- **Types:** Public declarations identify every import and preserve transform
  inference. Symbol extension declarations intentionally expose
  Observable-returning results as `Observable<T>` even when the runtime
  D-037 construction protocol selects `ColdObservable`; the TypeScript surface
  does not encode producer lifecycle as a higher-kinded result type. Focused
  runtime evidence remains authoritative for that construction distinction.
- **Removed names:** There is no `ColdSubject`, `BehaviorSubject`, or
  `ReplaySubject` compatibility alias. Lowercase behavior/replay factories and
  the explicit advanced base are the accepted Next surface.
- **Rationale:** These APIs have useful contracts independent of RxJS 7 and now
  have stable imports, declarations, lifecycle documentation, focused behavior
  tests, and package fixtures. Stabilizing their own contracts completes the
  D-039 boundary without implying a scheduler, Subscription, pipeable-operator,
  deprecated-alias, or compatibility runtime.

## D-051 — Install exact public Symbol capabilities directly

- **Status:** Accepted
- **Decision:** Each public operator or factory module assigns its
  implementation directly to `Observable` or `Observable.prototype` under the
  exact Symbol exported by that same module. Public capability installation
  does not use a common runtime installer, preflight targets, check exact-key
  occupancy, provide repeat-install idempotence, customize property
  descriptors, or roll back paired static/instance assignments.
- **Identity:** D-048's exact module-owned Symbol policy remains controlling.
  Another library, duplicate package copy, or package version receives a
  different property key even when it uses the same Symbol description. RxJS
  9 `import` and Node `require(esm)` share one module instance and exact key.
  Ordinary module caching prevents repeated evaluation of one module instance. These properties remove the accidental
  conflict and duplicate-install scenarios that motivated the superseded
  installer checks.
- **Descriptors:** Direct assignment uses JavaScript's ordinary new-property
  descriptor: writable, enumerable, and configurable. Symbol keys remain
  absent from string-key enumeration such as `Object.keys`, `for...in`, and
  JSON serialization. RxJS makes no contract about copying an Observable
  constructor or prototype with `Object.assign` or object spread.
- **Unsupported targets:** Hardened globals, proxies with mutating traps, and
  non-extensible Observable constructors or prototypes remain outside the
  supported runtime claim under D-041. Installation may throw the native
  JavaScript error, and a paired static/instance capability is not promised to
  install transactionally on such a target.
- **Rationale:** The common installer adds shipped bytes, module-initialization
  branches, temporary allocations, descriptor reads, extensibility checks,
  rollback bookkeeping, and diagnostics for conflicts that exact module-owned
  Symbols prevent in supported execution. None of that behavior is required by
  the Observable specification or WPT because RxJS extension Symbols are a
  library surface. Direct assignment keeps the acquisition side effect visible
  and makes its cost proportional to the capability being installed.
- **Consequence:** P4.I1 removed `installObservableExtension`, migrated all 97
  exact public capabilities back to direct assignment, deleted installer-only
  tests, and revised package audits to enforce exact Symbol ownership and
  string-method non-interference rather than transactional installation.
  Package side-effect metadata and bundler-retention fixtures remain required.
  The representative `rxjs/map` bundle decreased by 1,279 minified bytes
  (8.1%), 340 gzip bytes (7.4%), and 307 Brotli bytes (7.4%); the root-only
  control remained byte-identical.

## D-052 — Keep package documentation with its package and exclude rxjs.dev

- **Status:** Accepted
- **Decision:** User-facing documentation for a package lives inside that
  package container. Repository-wide charter, architecture, decisions,
  compatibility policy, open questions, and active-plan records remain under
  `docs/rxjs-next`. The root README is the repository entry point and may be
  completely refreshed. `apps/rxjs.dev` is outside this project plan's edit,
  build, test, publication, and deployment scope.
- **Rationale:** Package-local documentation keeps public contracts beside the
  code and publication boundary they describe. Excluding rxjs.dev preserves a
  separate colleague-owned documentation workstream and prevents this release
  effort from creating merge conflicts or publishing an incomplete site.
- **Consequence:** P5 and P6 write RxJS guidance under `packages/rxjs`,
  migration-tooling guidance under `packages/migrate`, and testing guidance
  under `packages/test`. Generated migration references move with their owning
  package and retain freshness gates. Package manifests publish those local
  documents, and the documentation checker rejects missing links, links that
  escape a package container, or coupling to the separate site workstream.
  Website integration is a later explicit coordination step, not a
  release-readiness shortcut or implicit task.

## D-053 — Ship one ESM implementation across the supported release matrix

- **Status:** Accepted
- **Release identity and channels:** All four release packages version together,
  beginning at `9.0.0-beta.0`. RxJS 9 prereleases publish under npm's `next`
  tag while RxJS 7 remains `latest`. RxJS 9 becomes `latest` only when the
  stable major is approved; RxJS 7 remains maintained after that transition.
- **Node:** Node `22.13.0` and later releases on the Node 22 line and maintained
  Node 24 releases are blocking. Node 26 is exercised as an advisory,
  non-blocking forward-compatibility lane during beta.
- **Distribution:** Published JavaScript is ESM-only. Browser, Webpack,
  `import`, and Node `require(esm)` resolution select the same `dist/esm`
  implementation and declarations. RxJS does not publish CommonJS, browser,
  Webpack, Deno, or Bun code copies. The Node bridge is supported only on the
  declared Node range and does not promise legacy CommonJS resolution or a
  CommonJS artifact.
- **Browsers:** The latest stable Chrome and Firefox, current desktop Safari,
  and current Mobile Safari on an iOS simulator are blocking package/lifecycle
  targets. A current WebKit build supplies an additional cross-engine signal;
  it is not mislabeled as branded Safari. The pinned Chrome WPT lane remains
  the reproducible platform-conformance authority, with latest-browser lanes
  detecting drift.
- **Other runtimes and bundlers:** Current stable Deno and Bun releases are
  blocking consumers of the unchanged npm ESM package. Webpack 5 is a blocking
  ESM bundler consumer. Support adds tests only: it must not add runtime
  branches, shims, dependencies, export conditions, or target-specific output.
  Any discovered need for shipped compatibility code reopens this decision.
- **Unclaimed environments:** Other edge runtimes, hardened globals,
  non-extensible constructors/prototypes, and transparent cross-realm use
  remain outside the initial claim.
- **RxJS 7 maintenance:** During RxJS 9 beta, RxJS 7 continues to receive
  security fixes and high-severity correctness or ecosystem-compatibility
  fixes. It remains a maintained line after RxJS 9 stable; no sunset date is
  implied by this release.
- **Rationale:** A platform-based major should advance the standardized ESM
  ecosystem without multiplying equivalent artifacts. Node's supported
  `require(esm)` bridge provides a bounded transition for current Node users.
  Deno, Bun, browsers, and Webpack already consume ESM, so their support should
  cost verification time rather than shipped bytes or application-bundle size.
- **Consequence:** P6.1 removes duplicate dialect builds and the legacy
  `main`/CommonJS surface, makes Node `>=22.13.0` explicit, updates the mixed
  dialect contract to shared ESM identity, and requires P6.2 to prove every
  blocking environment plus the advisory Node 26 lane. Package-local support
  and migration guidance must describe the boundary before prerelease approval.

## D-054 — Approve the synchronized RxJS 9 beta.0 train for the `next` channel

- **Status:** Accepted
- **Approval:** `rxjs@9.0.0-beta.0`, `@rxjs/observable-polyfill`, `@rxjs/test`,
  and `@rxjs/migrate` at the same version are approved to begin public beta
  under npm's `next` tag after the configured blocking CI matrix is green.
  This repository decision does not itself publish npm packages or create a
  GitHub release.
- **Adoption evidence:** The exact packed artifacts install into an isolated
  offline consumer and pass ESM, Node `require(esm)`, public TypeScript,
  `@rxjs/test`, and browser-bundle contracts on Node 22.13, 24.12, and advisory
  26.5. Tarball contents and sizes pass checked-in budgets, all four package
  trains and focused suites pass, pinned WPT is fully conforming, and the
  representative migration program retains three completions plus one correct
  safe stop.
- **Known evidence boundary:** The reviewed 39 cold and 22 fallback RxJS 7
  divergences remain explicit migration evidence rather than release blockers.
  Branded desktop and Mobile Safari remain blocking clean-runner jobs and are
  not replaced by Playwright WebKit or waived through a local security-setting
  change.
- **Stable release:** This decision approves the first major prerelease, not
  stable `9.0.0` or promotion to npm `latest`. Stable promotion requires public
  beta feedback and a later explicit decision. RxJS 7 remains `latest` and
  maintained throughout the beta.
- **Rationale:** The project now has executable package, environment,
  conformance, performance, documentation, migration, and isolated-consumer
  evidence with no unresolved local release blocker. Beginning beta is the
  correct way to gather ecosystem evidence that cannot be manufactured inside
  the repository while keeping the stable channel protected.
- **Details:** `packages/rxjs/docs/PRERELEASE_APPROVAL.md`.

## D-055 — Require exact migration-evidence baselines and complete `master` CI

- **Status:** Accepted
- **Decision:** Pull-request and `master` CI execute all 2,338 source-pinned
  registrations in cold and polyfill modes. A CI-specific verifier requires
  exact equality with the reviewed 2,299/39 cold and 2,316/22 polyfill
  pass/failure case-ID sets. Incomplete collection, a new failure, or an
  unexpected pass is blocking until the evidence and classification are
  reviewed together. The ordinary `test:unit` command remains unchanged and
  nonzero while reviewed divergences remain ordinary failing tests.
- **Cadence:** Fast package, evidence, workflow, and TypeScript-latest gates run
  for pull requests and pushes to `master`. Pinned WPT and the full
  release-readiness environment matrix remain path-aware on pull requests but
  run unconditionally on every `master` push. Node 26 and scheduled
  latest-Chrome drift remain explicitly advisory; all accepted Node 22.13/24,
  browser, Safari, Webpack, Deno, Bun, package, and conformance lanes remain
  blocking.
- **Rationale:** The completed RxJS 9 work had durable local evidence that was
  not uniformly represented in CI. Exact baseline comparison preserves the
  visibility required by D-013 without either making intentional RxJS 7
  divergences release blockers or allowing the reviewed evidence set to drift
  silently. Unconditional `master` coverage ensures the releasable branch is
  always qualified even when a pull-request path filter was incomplete.
- **Consequence:** CI owns the complete mode audits, bundle-analysis and
  SafariDriver unit tests, generated migration-evidence freshness, active
  workflow parsing, and the accepted release matrix. Release coherence rejects
  removal of those commands or their `master` triggers. This decision changes
  no runtime API, export, type, distribution artifact, or `apps/rxjs.dev`
  boundary.

## D-056 — Publish truthful status signals and automate supply-chain review

- **Status:** Accepted
- **Decision:** The root README reports `master` CI, release readiness, pinned
  Observable WPT, npm `latest` and `next`, downloads, and license through
  source-linked badges. The security-assurance document presents OpenSSF
  Scorecard as a contextual repository-hygiene signal rather than a headline
  release claim. It distinguishes the
  planned `9.0.0-beta.0` from the older prerelease currently on npm `next` and
  does not instruct users to install RxJS 9 from that tag before publication.
- **Security automation:** A weekly and `master`-push Scorecard workflow
  publishes authenticated results and SARIF. Pull requests receive dependency
  review that rejects newly introduced moderate-or-higher vulnerabilities in
  runtime and development scopes. External actions are pinned to full commit
  SHAs; analysis permissions are read-only except for the narrow OIDC and code
  scanning writes required to publish results.
- **Rationale:** Badges are useful only when their claims are current and
  inspectable. The existing release and conformance workflows already provide
  authoritative health signals; Scorecard and dependency review add bounded
  supply-chain evidence without inventing coverage, package-size, or stable
  RxJS 9 claims that the repository cannot yet support.
- **Consequence:** The Scorecard badge remains empty until the first successful
  default-branch publication. Making dependency review a required status check
  is a repository-rules administration step after its first run. This decision
  changes no runtime API, export, type, package artifact, or `apps/rxjs.dev`
  boundary.

## D-057 — Use a single-maintainer, reproducible, manually authorized staged release

- **Status:** Superseded by D-058
- **Decision:** The repository briefly implemented generated release PRs,
  two-build qualification, stage-only npm OIDC, private npm staging, typed
  digest authorization, and automated finalization.
- **Reason superseded:** The mechanism optimized for maximum assurance without
  meeting the maintainer's primary usability requirement. More importantly,
  npm cannot configure trusted publishing or staged publishing for a package
  that does not already exist. Three first-release packages do not yet have
  public registry records, so the proposed four-package private staging flow
  could not perform the initial beta release it was designed for. Dry runs did
  not expose that registry prerequisite.
- **Consequence:** The GitHub App was deleted before publication. No package was
  staged or published by this design. Its App, OIDC, staging, qualification,
  doctor, and finalizer implementation is removed rather than retained as an
  inactive alternate release path.

## D-058 — Publish betas with one local interactive command

- **Status:** Accepted
- **Decision:** Ben Lesh remains the sole required author, reviewer, merger,
  release operator, and security responder. All four packages keep one exact
  synchronized version. From a clean local `master` checkout that exactly
  matches its remote, Ben runs `pnpm release:beta <9.0.0-beta.N>`.
- **Publication boundary:** The command validates versions and repository
  state, runs release and package gates, packs all four packages, prints their
  SHA-512 integrities, and runs `npm publish --dry-run`. It then requires the
  exact version as confirmation and calls interactive `npm publish` under
  `next`, allowing npm to request OTP/WebAuthn for each package. Supporting
  packages publish first and `rxjs` publishes last.
- **Credentials:** CI has no npm publishing credential. The command refuses CI,
  non-interactive terminals, and `NPM_TOKEN` or `NODE_AUTH_TOKEN` environment
  credentials. Package publishing access requires two-factor authentication
  and disallows automation tokens after the three new scoped packages have
  been initialized.
- **Recovery and verification:** A rerun skips an already-published package only
  when npm's registry integrity matches the freshly packed tarball. Any byte
  mismatch stops. Success requires all four `next` tags to resolve to the exact
  version while `rxjs@latest` remains on RxJS 7.
- **Tradeoff:** The process trusts the maintainer's local machine and npm
  authentication and does not provide private staging or automatic npm
  provenance. That explicit, understandable boundary is accepted over a more
  complicated workflow whose incremental protection does not justify its
  operational and bootstrap costs for the current sole-maintainer release.
- **Scope:** Stable `9.0.0`, promotion to `latest`, and future reconsideration
  of registry-supported trusted publishing remain separate decisions.

## D-059 — Remove callback `thisArg` parameters from RxJS Next

- **Status:** Accepted
- **Decision:** RxJS Next callback APIs do not accept a separate `thisArg`.
  Remove the parameter and receiver-aware overloads from Symbol-keyed `every`,
  `filter`, `find`, `findIndex`, `map`, and static `partition`. Invoke their
  predicates and projectors directly.
- **Rationale:** A closure or `Function.prototype.bind` expresses an intentional
  receiver at the call site. Retaining `thisArg` forces RxJS to dispatch every
  value through `.call`, adding API and hot-path implementation cost for a
  redundant convenience inherited from RxJS 7.
- **Consequence:** Migration must rewrite a second callback-receiver argument
  to a closure or bound function. The callback value/index/source arguments,
  type-guard and Boolean-constructor overloads, cancellation, result
  construction, and platform string-named methods are unchanged. Historical
  RxJS 7 evidence retains its source identity, while active migrated specs use
  closures or bound functions instead of asserting the removed overload.
