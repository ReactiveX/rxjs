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
  `cold()` creates an independent producer during each subscription, `hot()`
  creates a subject-timeline producer before subscriptions, and `observable()`
  models the platform lifecycle in which the first subscription creates an
  active producer and concurrent subscriptions share it.
- **Rationale:** RxJS Next operators use host scheduling APIs rather than a
  public scheduler abstraction, so deterministic tests must virtualize the
  host boundary. Separate source helpers prevent producer-per-subscription
  compatibility behavior from being confused with the platform lifecycle.
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
  `subject.asObservable()` as a class-local compatibility method. It returns a
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
  default. The audit compatibility adapter supplies `leading: false`,
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

- **Status:** Accepted
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
  boundary, not producer-per-observer compatibility behavior.

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
  remains in the explicit scheduler-last compatibility queue.

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

## D-033 — Resolve legacy scheduler evidence at the compatibility-test boundary

- **Status:** Accepted
- **Decision:** Do not restore RxJS 7 scheduler classes, providers, parser
  internals, or general scheduler arguments in the platform package to satisfy
  ported tests. Host-timed public Symbols use platform timers, animation
  frames, or narrow timestamp providers. Ported cases whose durable claim
  depends on legacy scheduling use explicit generator-owned `@rxjs/test`
  timing rewrites or test-local compatibility sentinels.
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
  `cold[map](project)` remains on the cold compatibility lifecycle. Behavior-
  and replay-subject prototypes derived from `ColdObservable` inherit this
  rule; their Symbol-operator results are plain ColdObservables rather than
  Subject subclasses. Concurrent observers of one native-method result share
  that result's platform activation. A future incompatible creation protocol
  requires a new registry key, and compatibility subclasses that need to work
  with older operators must retain the older protocol slot. New platform
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
  Their direct installation does not resolve the still-open common installer,
  duplicate-package, package-map, or native-versus-polyfill decisions.
