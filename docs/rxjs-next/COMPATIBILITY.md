# RxJS 7 migration and behavioral-evidence strategy

## Summary

RxJS Next reuses the behavioral knowledge in RxJS 7 tests where the represented
expectations remain meaningful. It does not ship a separate runtime package
that emulates RxJS 7 imports, `Subscription`, pipeable operators, schedulers, or
deprecated aliases.

Useful APIs such as `ColdObservable`, Subjects, and the Symbol-keyed `pipe` may
remain in `rxjs` as intentional RxJS Next capabilities with their own explicit
contracts. Passing former RxJS 7 tests against those APIs proves the represented
behavior only; it is not a source, type, import, or lifecycle compatibility
claim.

Migration guidance and Skills must classify each material difference, identify
the required source change or semantic review, and keep unsupported behavior
visible rather than disguising it in the platform layer.

## Semantic baseline

### Hot and cold terminology

RxJS Next uses “hot” and “cold” only to describe when a producer comes into
existence relative to subscription:

- A producer is **hot** for a subscription when it already exists before that
  subscription.
- A producer is **cold** for a subscription when that subscription creates the
  producer.

These terms do not describe whether values are shared, whether a source is
multicast, whether it replays, or whether it is ref-counted. A lifecycle can
also cross the boundary: the first subscription to a platform Observable
creates its active producer, concurrent subscriptions join that existing
producer, and a later subscription after ref-count closure creates another
one. For that reason, documentation should state producer-creation and sharing
behavior directly instead of assigning the platform Observable one blanket
temperature.

Every instantiated Subject is hot. The Subject itself is the producer and
exists before an observer subscribes. The former exploratory `ColdSubject`
name was therefore removed: its inherited per-subscription plumbing did not
make the Subject producer cold. See D-035 and D-036.

The table describes architectural defaults, not every edge case.

| Concern               | RxJS 7 baseline                                                                        | RxJS Next baseline                                                                                 | Migration implication                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Producer execution    | A normal cold Observable creates independent work during each subscription             | Platform Observable shares one active producer; `ColdObservable` is an explicit separate Next type | Audit repeated subscriptions and choose the intended Next lifecycle explicitly                                           |
| Hot/cold terminology  | A cold source creates its producer during subscription; an instantiated Subject is hot | Producer timing, sharing, replay, and ref counting are documented separately                       | Do not infer sharing from “hot” or “cold” alone                                                                          |
| Subscription return   | `subscribe()` returns a `Subscription`                                                 | Platform `subscribe()` returns `undefined`                                                         | Replace captured subscriptions with `AbortController`/`AbortSignal` ownership                                            |
| Cancellation          | `Subscription.unsubscribe()` and teardown chains                                       | `AbortSignal`, `Subscriber.signal`, and ref-count closure                                          | Review ownership, abort reasons, and final-observer behavior                                                             |
| Void notification     | `Subscriber<void>.next()` may omit its value                                           | Platform `Subscriber.next` always requires one argument; `next(undefined)` is the void form        | Rewrite platform-Subscriber void signals to pass explicit `undefined`; unrelated `Subject<void>` contracts do not change |
| Teardown registration | Producer may return teardown logic; subscriptions aggregate finalizers                 | Producer calls `subscriber.addTeardown()`                                                          | Rewrite custom producers rather than relying on returned teardown functions                                              |
| Teardown order        | RxJS 7 subscription finalizers follow RxJS aggregation semantics                       | The platform specification closes teardown callbacks in reverse insertion order                    | Treat order-sensitive teardown as a semantic migration                                                                   |
| Error reporting       | RxJS configuration and host error reporting rules                                      | Platform exception reporting and Web IDL callback behavior                                         | Audit unhandled, late, and observer-callback errors                                                                      |
| Operators             | Mostly standalone pipeable functions returning Observables                             | Platform string methods plus exact RxJS Symbol extensions                                          | Migrate imports and invocation shape; verify lifecycle-sensitive behavior                                                |
| Pipe                  | `pipe(...)`, `source.pipe(...)`, and `OperatorFunction` types                          | Exact Symbol-keyed `pipe` may remain as a Next API                                                 | Do not assume RxJS 7 pipeable functions or types exist                                                                   |
| Subjects              | Subject family with established RxJS 7 semantics                                       | Intentional Next Subject APIs with directly documented contracts                                   | Verify late-observer, replay, terminal, and cancellation semantics                                                       |
| Scheduling            | Scheduler arguments and scheduler classes affect many APIs                             | Host APIs and `@rxjs/test`; no general public RxJS scheduler abstraction                           | Remove scheduler arguments and review timing-sensitive code                                                              |
| Input conversion      | Broad `ObservableInput` ecosystem and interop protocols                                | Platform `Observable.from` conversion order and categories                                         | Audit custom subscribables and legacy interop                                                                            |
| Testing               | Marble tests assume RxJS scheduling and subscription records                           | `@rxjs/test` separates cold, hot, and platform lifecycle sources                                   | Choose the source model deliberately and rewrite only the harness mechanics needed to preserve the behavioral claim      |

## Runtime policy

### Platform Observable and Symbol extensions

The main RxJS platform layer:

- operates on the selected native or fallback platform Observable;
- requires an explicit `next` argument for every platform `Subscriber`, so
  `Subscriber<void>` uses `next(undefined)`; the fallback throws `TypeError`
  for an omitted argument before checking whether the subscriber is closed;
- preserves shared, ref-counted active producer work;
- uses signal-based cancellation;
- installs RxJS-specific capabilities by direct assignment under exact,
  module-owned Symbols;
- preserves native string-named methods as the platform-owned API;
- provides corresponding RxJS Symbols for operator uniformity even when a
  platform method has the same familiar name;
- allows a Symbol-keyed RxJS operator to delegate to its platform counterpart
  or provide additional documented and tested RxJS functionality;
- does not expose a legacy `Subscription` as though it were the native return
  value of `subscribe()`.

The exact Symbol identity is the collision boundary. RxJS does not ship a
transactional public-extension installer or promise custom descriptors,
repeat-install arbitration, rollback, or support for hardened and
non-extensible Observable targets. Those mechanics are unrelated to platform
Observable conformance and are not migration compatibility guarantees.

### Intentional RxJS Next APIs

RxJS Next may publish producer-per-subscription values, Subjects, composition
helpers, and other APIs when they are useful on their own terms. They must:

- be identifiable in imports and types;
- document producer creation, sharing, cancellation, and terminal behavior;
- avoid monkey-patching the platform Observable with string-named legacy APIs;
- state when a result crosses between a direct-subscription contract and the
  shared platform lifecycle;
- keep unsupported RxJS 7 behavior visible in migration guidance.

They do not provide an RxJS 7 `Subscription` facade, pipeable-operator import
surface, scheduler system, deprecated aliases, or compatibility package.

D-050 stabilizes `ColdObservable`, `PerSubscriptionSubjectBase`, the Subject
family, and the Symbol-keyed `pipe` as this intentional Next surface.

| Intentional API              | Public form                                        | Own contract                                                                                   |
| ---------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ColdObservable`             | Root and `rxjs/cold-observable` class              | One producer and compatibility Subscriber per direct `subscribe()` call                        |
| `Subject`                    | Root and `rxjs/subject` class                      | Hot live fanout plus a non-mutating `asObservable()` platform view                             |
| `AsyncSubject`               | Root and `rxjs/async-subject` class                | Hot final-value-on-completion fanout with retained terminal behavior                           |
| Behavior subject             | Root and `rxjs/behavior-subject` lowercase factory | Hot current-value delivery for every direct observer                                           |
| Replay subject               | Root and `rxjs/replay-subject` lowercase factory   | Hot size/host-time-bounded replay followed by live fanout                                      |
| `PerSubscriptionSubjectBase` | Root and explicit advanced-base subpath            | Protected per-direct-observer setup hook for specialized hot Subject implementations           |
| Exact Symbol-keyed `pipe`    | `rxjs/pipe` static and instance Symbol             | Typed one-to-seven-step composition; no `.pipe`, pipeable imports, or `OperatorFunction` claim |

`PerSubscriptionSubjectBase` is hot: its Subject producer exists as soon as the
instance is constructed. Its distinction from `Subject` is that it inherits
`ColdObservable.subscribe()`, which creates a separate `ColdSubscriber` and
runs a protected `_subscribe` hook for every direct JavaScript subscription.
The platform-based `Subject` can instead receive one active platform
`Subscriber` representing multiple concurrent observers. The advanced base
also has separate input/output types, while `Subject` provides `asObservable()`
and keeps Symbol-keyed operator results on the immutable platform Observable
base.

That distinction is unnecessary for ordinary Subject fanout, so
`PerSubscriptionSubjectBase` is abstract and has a protected constructor.
`BehaviorSubject` and `ReplaySubject` use its per-observer hook to deliver
current or buffered state to each late observer. Its default hook handles
terminal state and live fanout; subclasses that bypass it to control replay
ordering own those lifecycle responsibilities.

The direct-subscription/platform boundary is explicit. `ColdObservable` is an
`instanceof Observable` subclass and its direct `subscribe()` creates a new
producer run. RxJS Symbol operators use the shared versioned `[create]`
protocol and return plain ColdObservables. String-named native methods delegate
through a fresh base Observable view and return platform Observables; native
Promise consumers use the same view. The platform result then owns its normal
shared, ref-counted activation.

Public Symbol declarations return `Observable<T>` at the type boundary even
when the runtime creation protocol returns a `ColdObservable`. TypeScript does
not model the lifecycle-selected result constructor as a higher-kinded type.
Migration review must therefore use the receiver and D-037 construction
contract—not the widened `Observable<T>` annotation—to determine producer
multiplicity.

The construction protocol governs results, not input normalization. Inputs to
flattening, combination, notifier, and recovery operators cross through the
active realm's platform `Observable.from`, even when the result receiver is a
compatible subclass or `ColdObservable`. This preserves the platform input
contract and keeps arbitrary subscribables or foreign-realm values from
becoming accidental compatibility behavior.

For a `PerSubscriptionSubjectBase`, the platform view reaches `_subscribe`
once when that activation starts. Concurrent observers of the same native
result share it; a later observer after ref-count closure starts another view
activation and reaches the hook again. A borrowed or newly introduced native
method is not automatically intercepted and must be added to the explicit
bridge before it is supported.

The current `Subject` class provides `subject.asObservable()` as an intentional
Subject-local capability. It returns a distinct base Observable
without `next`, `error`, or `complete`, mirrors the Subject's terminal state
for late observers, and forwards cancellation with `AbortSignal`. It does not
patch a string-named method onto the platform Observable prototype. When the
base is the platform fallback, concurrent observers of one view share and
ref-count a single forwarding subscription. The Subject producer already
exists before those observers subscribe; obtaining a view does not change that
fact.

### Async iteration boundary

The platform layer exposes four exact Symbol-keyed ways to iterate an
Observable with `for await...of`:

- `iterateEachValue` preserves every notification in an iterator-local FIFO
  queue.
- `iterateBufferedValues` preserves every notification in
  microtask-coalesced iterator-local batches.
- `iterateLatestValue` retains only the latest unread notification.
- `iterateNextValue` accepts only the first notification received while the
  iterator has outstanding demand.

Every Symbol invocation returns a fresh, lazy, one-shot async generator. Method
invocation alone does not subscribe; advancing the generator does. Generator
cleanup maps loop exit to an `AbortController`, and source errors are thrown
through iteration after already accepted queue, batch, or latest-value state
has drained.

The conversion state and producer lifecycle are deliberately separate.
Multiple generators over one platform Observable have independent queues or
slots, but their source observers join the Observable's current shared,
ref-counted producer. A late generator misses earlier notifications in that
producer run. One generator leaving does not close source work while another
observer remains; a generator started after the ref count reaches zero creates
a new run.

The same Symbols invoked on `ColdObservable` reach its direct
producer-per-subscription override. Each generator therefore owns an
independent producer run as well as independent conversion state. This can
change duplicated side effects and which synchronous notifications are
available, but it does not change the four iteration policies themselves. In
particular, `iterateNextValue` drops synchronous notifications emitted before
its first demand slot in either lifecycle.

The removed standalone `eachValueFrom` and `bufferedValuesFrom` helpers have no
legacy aliases. Migration uses the explicit Symbol imports and method
calls so the selected buffering or dropping policy remains visible.

## Composition migration requirement

The required user outcome is that an RxJS 7 pipeline can be migrated without
rewriting each operator into ad hoc nested calls. Migration tooling should
support:

- operator functions that accept a source and return a derived source;
- type inference across a sequence of operators;
- both standalone `pipe(...)` composition and a deliberate source-bound
  composition form;
- cancellation propagation across the full pipeline;
- explicit selection when the pipeline moves between shared platform and
  producer-per-subscription Next semantics.

The exact Symbol-addressed `[pipe]` is an intentional Next API. It does not
promise RxJS 7 `OperatorFunction` types, standalone pipeable imports, or the
string-named `.pipe`. Skills may transform an old pipeline to imported Symbols
and `[pipe]` or to direct Symbol composition, then flag lifecycle-sensitive
segments for review.

## Testing and migration-evidence boundary

`@rxjs/test` preserves the documented RxJS 7 run-mode marble capabilities
without reviving the public scheduler class or manual mode. Its `cold()` helper
creates an independent producer during each subscription. The separate
`observable()` helper proves the platform lifecycle in which the first
subscription creates a producer and concurrent subscriptions share it.
`hot()` creates its subject-like absolute-timeline producer before observers
subscribe.

The fixture construction protocol keeps those meanings from leaking through
operator chains. A cold fixture extends `ColdObservable`, whose `[create]`
returns an ordinary `ColdObservable`. A hot fixture extends the active
`globalThis.Observable`, and its `[create]` returns an ordinary instance of
that platform constructor rather than another hot fixture. `observable()`
constructs directly from the active global constructor.

Cold compatibility does not replace `globalThis.Observable`. Tests that need
an explicit cold constructor or static factory import and name
`ColdObservable`; platform tests use the ambient `Observable`. Importing
`@rxjs/test` conditionally initializes the fallback through that public cold
entry only when the realm has no Observable, while preserving an existing
native constructor.

All three source types use AbortSignal cancellation and share one virtual host
event loop. This allows tests to mix Observable operators with application
`setTimeout`, `setInterval`, animation-frame, idle-callback, and supported Node
timing calls without passing scheduler instances into production APIs.

An unchanged RxJS 7 marble test is still not automatically portable: tests
whose outcome depends on producer multiplicity must choose `cold()` or
`observable()` deliberately and receive the corresponding migration-evidence
classification.

RxJS 7 accepted a wider `ObservableInput` ecosystem than the platform
`Observable.from` contract. A migrated test that owns a lowercase-`subscribe`
or legacy interop helper retains that input and is classified as
`compatibility-only`. It remains executable failure evidence where the current
surface rejects the input. Replacing it with an ambient `Observable` is not a
valid harness rewrite because doing so removes the input-conversion claim under
test.

This distinction also applies when a flattening test returns the same inner
fixture more than once. In cold mode, each return creates the
independent timeline asserted by RxJS 7. In platform mode, overlapping returns
join one shared, ref-counted producer, so join time can change both the emitted
notification sequence and the producer subscription log. A return after the
shared producer closes starts a new timeline. Ported evidence for this case
must keep the cold expectation intact and use an exact, checked-in platform
expectation; it must not recover the cold result by substituting a
cold fixture into platform execution.

## Operator parity policy

An operator does not have behavioral parity merely because it has the same
name. It must be
evaluated across:

- accepted inputs and overloads;
- emitted values and ordering;
- completion and error behavior;
- synchronous reentrancy;
- cancellation and upstream teardown;
- multiple observers during one active producer run;
- resubscription after ref-count closure;
- type inference;
- native and fallback execution;
- producer-per-subscription execution when the selected Next type claims it.

Selector-based `debounce` preserves the RxJS 7 terminal claim without changing
the platform sharing model: selector completion without a value keeps the
latest source value pending, and normal source completion flushes that value
before completing. Source errors and result cancellation discard pending state
and abort active selector work.

Numeric `debounce`, used by the current `debounceTime(milliseconds)` mapping,
resets a single host timer for each source value and flushes the pending value
immediately on normal source completion. Source error or result cancellation
discards the pending value and cancels the timer through `AbortSignal`.
Concurrent platform observers share one timer and source activation. This
mapping does not represent the RxJS 7 scheduler overload.

The exact `delay(due)` Symbol shifts values through host timeouts, holds normal
completion behind pending values, and forwards source errors immediately. Its
migration mapping does not restore the RxJS 7 scheduler argument. The exact
`sampleTime(period)` Symbol samples through a host interval with the same
scheduler boundary. `timestamp` and `timeInterval` retain their
timestamp-provider overloads because those providers are clocks rather than
work schedulers. The default clock is `Date.now()`. `animationFrames` retains
its optional timestamp provider and RxJS 7 `{ timestamp, elapsed }` result
shape while scheduling and cancelling through the host animation-frame APIs
virtualized by `@rxjs/test`.

The unified `timeout` Symbol accepts `first`, `each`, `with`, and `meta`.
Legacy numeric and `Date` timeout overloads and `timeoutWith` map into that
configuration without restoring a scheduler argument. Expiry aborts the source
before subscribing to the fallback. The default path exposes a `TimeoutError`
whose `info` retains the RxJS 7 timeout context.

The exact `bufferTime(span, creationInterval, maxBufferSize)` Symbol preserves
sequential, overlapping, size-triggered, completion, error, and cancellation
behavior through host timers. Its migration mapping drops only the legacy
scheduler argument; it does not reintroduce a scheduler overload.

The exact `windowTime(span, creationInterval, maxWindowSize)` Symbol uses the
same host-time boundary and exposes read-only platform windows. Completion and
error terminate active windows; cancellation does not. Its migration
mapping drops only the legacy scheduler argument.

The exact `observeOn(delay)` and `subscribeOn(delay)` Symbols represent host
delay behavior, not SchedulerLike overloads. Ported scheduler evidence maps
only the private `rxTest` scheduler sentinel to these delays; arbitrary
scheduler objects remain unsupported. Cancellation removes queued
notifications or a queued source activation through `AbortSignal`.

Every platform-layer host scheduling call resolves the corresponding
`globalThis` function when work is scheduled or cancelled. There are no
RxJS-owned timer, interval, animation-frame, or idle-callback providers in this
layer. Consequently, the `@rxjs/test` virtual host applies equally to RxJS
work and application code that resolves those realm APIs during the test.

Selector-based `retry` invokes its delay selector with one-based consecutive
retry counts, including when the retry budget is infinite. A notifier value
cancels that notifier before the next source attempt starts; notifier
completion completes the result, while notifier error or selector failure
errors it. Source attempts, delay notifiers, and concurrent result observers
retain the platform's shared, ref-counted `AbortSignal` lifecycle.

The exact `takeUntil` and `skipUntil` Symbols activate their notifier before
the source and keep one gate per shared platform activation. `takeUntil`
completes on the first notifier value; `skipUntil` opens on that value and
closes notifier work. Notifier completion without a value leaves either source
contract unchanged. `find`, `findIndex`, `isEmpty`, and `throwIfEmpty` likewise
keep one query state machine per activation. Early results cancel synchronous
upstream work before delivery. The RxJS `find` Symbol does not alter the
platform string-named `find()` Promise consumer.

`pluck`, `startWith`, `pairwise`, and static `partition` preserve their
portable RxJS 7 value and state contracts without introducing
producer-per-observer work. Each partition branch owns independent predicate
and index state over the platform-converted input. `windowCount` emits hot
read-only windows: source completion completes live windows, source error
errors them, and outer cancellation releases them without a terminal
notification. Synchronous static `generate` and recursive `expand` are also
activation-scoped. `expand` uses FIFO concurrency and iterative draining;
last-observer cancellation closes active source and projected work and
discards queued recursion.

Standalone `zip(sources)` preserves the portable RxJS 7 shortest-input
terminal rule when `fillAfterComplete` is not configured. It completes for an
empty Observable or iterable, and emits a final tuple before completing when
that tuple drains the last buffered value from a completed input. Terminal
completion and errors cancel sibling inputs through the result signal.
Concurrent platform observers share the same input activations and FIFO
buffers; producer-per-subscription zip behavior remains cold-mode evidence
rather than a platform claim.
The non-RxJS `fillAfterComplete` option is a separate Next capability: it pads
completed inputs only while another real buffered value remains, then
completes after all inputs and buffers finish. An empty source list completes
immediately.

For operators that overlap with platform methods, both the string-named
platform form and Symbol-keyed RxJS form are required. Parity work must record
whether the RxJS form delegates, which additional functionality it supplies,
and which behavior or types intentionally differ. It must also prove that
installing the Symbol does not alter the platform method.

The P2.4 `map` pilot is the first recorded overlap. `observable[map](project)`
owns an RxJS projection index, constructs through the RxJS `[create]` protocol,
and participates in the platform layer's shared activation lifecycle. D-059
removes the inherited RxJS 7 callback-receiver argument from this and every
other RxJS Next callback API; migration uses a closure or
`Function.prototype.bind`. The Symbol form does not delegate to
`observable.map(project)`, and installing it leaves that platform-owned string
method unchanged. Focused and native/fallback kernel tests cover both the
additional Symbol behavior and non-interference.

## RxJS 7 test migration protocol

Every migrated test should have one classification:

| Classification          | Meaning                                                                                                          | Gate                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Portable                | The RxJS 7 expectation is still valid for the platform operator                                                  | Must pass in native and fallback modes                                    |
| Harness rewrite         | Behavior remains required, but old marble/subscription machinery cannot express the platform lifecycle correctly | Rewritten test must preserve the original behavioral claim                |
| Compatibility-only      | Historical manifest label: the test requires RxJS 7 cold, subscription, subject, scheduler, or import behavior   | Preserve as cold/test evidence; it does not imply a compatibility product |
| Intentional divergence  | Platform semantics require a different result                                                                    | New expectation and migration consequence require maintainer approval     |
| Unsupported or obsolete | The feature will not be provided or the test only protects removed internals                                     | Removal requires rationale and user-impact review                         |

Tests must not be weakened solely to make a new implementation pass. A harness
rewrite should state the old claim in plain language and show how the new test
still proves it.

The first structured evidence ledger now exists at
`packages/rxjs/test/ported/manifest.generated.json`. It accounts for every
inventoried RxJS 7 marble case with both a migration classification and one
execution disposition: active, expected failure, missing API, deduplicated, or
unsupported/obsolete. Missing APIs remain converted pending definitions;
implementation mismatches remain known failures. All 2,338 expanded cases are
executable cold registrations, including parameterized and source-skipped
evidence; missing capabilities fail explicitly rather than disappearing from
collection. Every applicable registration uses ordinary test semantics, so
known gaps are not skipped, quarantined, or inverted through expected-failure
handling. Platform cases use the ambient Observable and do not redefine the
platform layer to recover RxJS 7 producer-per-subscription semantics. See
`RXJS_7_MARBLE_TEST_PORT_NOTES.md` and `RxJS-7-parity.md`.

The executable cases are ordinary checked-in Vitest source under `cold/` and
`platform/`, not generator-owned output. A static `migration-report.json`
retains file-to-case identity for JSON audits. `@rxjs/migrate` is the reusable
deterministic authoring engine; its framework adapter is optional, and its
output becomes source owned by the destination project. The engine does not
classify lifecycle intent or establish migration completion.

## Agent-first migration contract

The canonical migration Skill is the primary product surface. It requires an
RxJS 7 build-and-test baseline, characterization evidence for affected
behavior, and a reviewed contract manifest before writes. Every affected
pipeline receives an explicit lifecycle target; `unsupported` and `unresolved`
items stop automation and remain visible for maintainer review.

The deterministic `@rxjs/migrate` engine performs only bounded, reviewable
rewrites selected by that workflow. Completion requires both mechanical
fixture evidence and an explicitly qualified agent-outcome lane. P0.M5
qualifies Codex/ChatGPT only: four representative runs passed, with three
approved migrations completed and one required unsupported/weak-coverage safe
stop. Claude Code and Cursor have P0.M4 Skill installation and discovery
evidence, not measured migration-outcome parity. There is no accepted
migration MCP surface. See D-046, D-047, and
`packages/migrate/docs/MIGRATION_TOOLING_DESIGN.md`.

Its default versioned registry currently claims only the ten mappings backed
by checked-in source/target type evidence and exact mechanical fixtures:
`filter`, `map`, `takeUntil`, `bufferCount`, `concatMap`, `concatAll`,
`switchAll`, `debounceTime`, `audit`, and `auditTime`. The engine refuses
unproved overloads, incompatible registries, ambiguous TestScheduler lifecycle
selection, and transformations whose legacy imports cannot be removed safely.

The generated `compatibility-only` label remains stable provenance metadata.
Under D-039 it means that the claim cannot be made for the shared platform
surface; it does not name a package or promised facade.

## Migration-evidence ledger

The generated ledger at
[`packages/rxjs/docs/MIGRATION_EVIDENCE_LEDGER.md`](../../packages/rxjs/docs/MIGRATION_EVIDENCE_LEDGER.md)
joins the versioned capability registry to the source-pinned executable
manifest. Its complete
case IDs and source files are retained in
`packages/rxjs/test/ported/migration-evidence-ledger.generated.json`.
Regeneration validates that every registry operator, factory, and value appears
exactly once and rejects incomplete or duplicate rows. P4.2 closes every
prioritized row with direct executable evidence, canonical alias evidence, or
explicit pinned non-marble/focused Next evidence. It also rejects uncovered
rows, deferred type status, inconsistent mode totals, or a linked failing case
whose classification is not `compatibility-only` or
`intentional-divergence`.

| Field               | Required content                                                                      |
| ------------------- | ------------------------------------------------------------------------------------- |
| RxJS 7 API          | Name and former import path                                                           |
| RxJS 7 evidence     | Test files or documentation defining behavior                                         |
| RxJS Next surface   | Platform method, Symbol extension, intentional Next API, or unsupported               |
| Sharing model       | Shared active platform producer, producer per direct subscription, or not applicable  |
| Cancellation model  | Signal, test-local adapter, unsupported, or not applicable                            |
| Test classification | Portable, harness rewrite, compatibility-only, intentional divergence, or unsupported |
| Type status         | Preserved, changed, or compatibility-only                                             |
| Migration action    | Mechanical change, semantic review, adapter, or redesign                              |
| Decision            | Link to accepted decision or open question                                            |

The marble-test manifest populates the executable behavioral-evidence portion
of this ledger without making API support promises. The reviewed case-ID
baselines account for cold and fallback passes and failures per row. Alias rows
link the canonical executable surface; `ColdObservable`, `firstValueFrom`, and
`lastValueFrom` name their pinned non-marble or focused Next evidence instead
of pretending to have a marble registration. The capability registry supplies
the public mapping and adapter, while deterministic policy records the import,
sharing, cancellation, final type status, migration action, and controlling
decision.

The generated
[unsupported RxJS 7 surface catalog](../../packages/rxjs/docs/UNSUPPORTED_RXJS_7_SURFACES.md)
closes P4.3 with a machine-readable source at
`packages/rxjs/test/ported/unsupported-surface-catalog.json`. It classifies
imports, public types, scheduler values and overloads, interop protocols, and
deprecated aliases as replace, manual-review, or unsupported groups. Its gate
is pinned to the same RxJS 7 revision as the executable manifest, requires the
five accepted categories and their critical surfaces, and derives the set of
scheduler-bearing capabilities from the registry so new scheduler exposure
cannot silently escape review. The catalog is migration guidance only: it does
not add an emulation package, compatibility alias, scheduler system, or legacy
interop protocol.

The executable capability registry distinguishes an absent API from a unified
Next surface. RxJS 7 `bufferCount(size, startBufferEvery?)` is exercised
through
`source[buffer]({ maxSize: size, startEvery: startBufferEvery ?? size, emitRemainingOnError: false })`.
This mapping represents consecutive, overlapping, and gapped count windows,
completion partials, and the RxJS 7 rule that an error discards partial
buffers. Static and creation functions may similarly map to a static Symbol or
an explicit ambient-`Observable` construction. These adapters make behavioral
gaps testable and do not by themselves promise full type or lifecycle parity.
The current `bufferCount` evidence covers positive buffer sizes and start
intervals; validation behavior for nonpositive or otherwise invalid values is
not established by this mapping. RxJS 7 `bufferWhen(closingSelector)` is
exercised through
`source[buffer]({ delay: closingSelector, emitEmpty: true, emitRemainingOnError: false })`.
The selector is evaluated before source activation, a synchronous selector
failure errors the result without activating source work, and a source error
discards the active partial buffer.

RxJS 7 `buffer(closingNotifier)` is exercised through
`source[buffer]({ delay: () => closingNotifier, emitEmpty: true, emitRemainingOnError: false, restartDelay: false })`.
The notifier remains active across boundary values instead of being
resubscribed, each notifier value emits the current buffer, normal source
completion emits the remainder, and source or notifier errors discard the
active partial buffer. Result termination and last-observer cancellation close
both the source and notifier through the shared platform lifecycle.

The RxJS 7 `Subject.asObservable()` cases map to the current Subject-local
method. Because RxJS 7 TestScheduler hot observables were Subjects while
`@rxjs/test` hot fixtures are intentionally only subject-like, the port runtime
adds the legacy method as an own property on each migrated hot fixture. That
test-only adapter returns the same non-mutating base-Observable view and never
modifies `Observable.prototype`.

RxJS 7 `withLatestFrom(...others, project?)` is exercised through
`source[withLatestFrom]([others], project?)`. Latest-only inputs activate before
the primary source so synchronous and same-frame values are available to the
first primary emission. Only primary values cause output, and primary
completion or error terminates the result and cancels every latest-only input.
The optional projection is part of the Symbol contract. Concurrent observers
still share the platform Observable's single ref-counted producer run.

RxJS 7 `sequenceEqual(other, comparator?)` maps directly to the corresponding
Symbol extension. The optional comparator runs once for each paired value,
with a false result concluding inequality and a thrown error terminating the
result and cancelling both inputs. Concurrent observers share that comparison
work through the platform Observable lifecycle.

RxJS 7 `audit(durationSelector)` maps to the unified `throttle` Symbol with
`{ leading: false, trailing: true, restartOnTrailing: false }`. Ordinary
RxJS 7 `throttle` arguments map directly. A duration value closes the current
window; duration completion only reopens the gate and does not emit a trailing
value. Throttle starts a new duration after a trailing emission, whereas audit
waits for the next source value. Source completion is immediate unless an
active duration owns a pending trailing value, in which case that duration may
emit the final value before completion. Selector, duration, and source errors
cancel the other active work through the result signal. Concurrent platform
observers still share one source activation and one active duration.

RxJS 7 `takeUntil`, `skipUntil`, `pluck`, `find`, `findIndex`,
`throwIfEmpty`, `isEmpty`, `startWith`, `pairwise`, and `windowCount` map
directly to exact instance Symbols. `partition` and `generate` map to exact
static Symbols. Numeric legacy `expand(project, concurrent)` maps to
`source[expand](project, { concurrent })`. Trailing or embedded scheduler forms
for `startWith`, `generate`, and `expand` are not public platform-layer
contracts. Their ported notification, subscription, and error claims execute
through explicit `@rxjs/test` scheduling rewrites. This resolves the behavioral
evidence without silently accepting scheduler arguments or restoring RxJS 7
scheduler classes in production.

Generator-owned rewrites bound independently observed notifier and window
lifecycles without changing the RxJS 7 notification or subscription claims.
The nonterminal `windowCount` cancellation cases abort nested observations
before the original outer cancellation frame, preserving silent disposal.
When recursive platform work reuses an already active inner fixture, the
polyfill expectation records the resulting shared/ref-counted join instead of
substituting a cold fixture.

## Suggested validation ladder

For each supported operator or creation API:

1. **API/type test:** the public import and intended composition type-check.
2. **Single-observer behavior:** value, completion, error, and reentrancy cases
   pass.
3. **Shared lifecycle:** concurrent observers, late joins, individual abort,
   last-observer abort, and restart are correct.
4. **Native/fallback parity:** the same platform-layer cases pass against both.
5. **RxJS 7 evidence:** portable or rewritten former tests pass.
6. **Direct-subscription evidence:** cold or Subject-specific cases pass when
   the intentional Next API claims that behavior.
7. **Packaging fixture:** the API works through the published entry point, not
   only a source import.

The P0.4 lifecycle gate implements steps 2 through 4 for the base constructor
with one self-contained contract executed unchanged against the packaged
fallback and a browser-native Observable. Package fixtures additionally cover
missing initialization, preservation of existing side effects, shared identity
through ESM import and Node `require(esm)`, duplicate-package isolation, and
ambient declaration visibility.

## Accepted migration fixtures

The P4.4 fixtures in `packages/migrate/test/contracts` turn the intentional API
and lifecycle boundaries into executable migration outcomes:

- a `ColdObservable` plus exact Symbol pipeline preserves one producer per
  direct subscription and cancels through `AbortSignal`;
- a platform Observable plus `share` retains one active producer until the
  final observer cancels and restarts on the next activation;
- lowercase behavior and replay factories preserve hot Subject ownership with
  observer-local current/replayed state;
- unresolved scheduler, legacy interop, arbitrary-subscribable, and legacy
  multicasting input stops safely without an invented target.

Every migrated fixture compiles against current public declarations and links
completed migration-ledger rows. The safe-stop fixture instead links the
unsupported-surface catalog. Runtime assertions cover producer multiplicity,
final-observer teardown, restart, retained Subject state, and a negative
cold/platform lifecycle swap. These fixtures are representative contract gates,
not a claim that arbitrary applications can be migrated mechanically.

## Migration themes

Migration guidance and future automation should distinguish mechanical edits
from semantic audits.

### Often mechanical

- package and subpath import changes;
- importing an extension Symbol;
- changing string-named or pipeable access to the approved composition form;
- replacing teardown returns with an approved helper inside new producer code;
- adding an `AbortController` for explicit cancellation.

### Requires semantic review

- code that expects a producer per subscription;
- pipelines that depend on `share`, `shareReplay`, `publish`, or ref-count timing;
- code that captures the `Subscription` returned by `subscribe()`;
- subject state and late-subscriber behavior;
- scheduler-dependent ordering or virtual time;
- teardown order and error aggregation;
- unhandled or late errors;
- repeated subscriptions used as retries, refreshes, or cache invalidation;
- custom Observable subclasses and interop protocols.

The canonical Skill and deterministic engine derive their advice and mappings
from the migration-evidence ledger and accepted decisions rather than from
general RxJS knowledge alone.

## Migration exit criteria

A release-ready migration story requires:

- a published migration status for each prioritized RxJS 7 API category;
- an explicit mapping to a Next import/type surface or an unsupported status;
- a populated migration-evidence ledger for every mapped public API;
- a reviewed migration contract manifest with an explicit lifecycle target for
  every affected pipeline;
- passing behavioral tests tied back to RxJS 7 evidence;
- migration guidance for every intentional divergence;
- representative mechanical fixtures and agent evaluations that pass build,
  behavior, idempotence, containment, and the outcome gates claimed for their
  recorded harness and model configuration;
- no language that implies an RxJS 7 runtime package, facade, or blanket
  compatibility guarantee.
