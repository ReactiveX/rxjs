# RxJS 7 compatibility strategy

## Summary

RxJS Next has two different compatibility responsibilities:

1. **Operator continuity on the platform Observable.** Reuse the behavioral
   knowledge in the RxJS 7 operator tests where the expectations remain valid
   under the platform lifecycle.
2. **Explicit RxJS 7 emulation.** Provide a separate compatibility layer for
   important behavior and source structure that cannot be preserved by the
   shared platform Observable itself.

The project must not describe these as one blanket promise. “Within reason”
means that every material difference is classified, tested, and documented
rather than silently ignored or hidden in the platform layer.

## Semantic baseline

The table describes architectural defaults, not every edge case.

| Concern               | RxJS 7 baseline                                                                      | Platform Observable baseline                                                            | Compatibility implication                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Producer execution    | A normal cold Observable starts independent work per subscription                    | One active producer subscription is shared by current observers and ref-counted         | Independent execution needs an explicit cold compatibility abstraction                                                |
| Hot values            | Explicit through `Subject`, multicasting, or sharing operators                       | Sharing is intrinsic while the platform subscriber is active                            | Some RxJS 7 sharing operators may be unnecessary, different, or compatibility-only                                    |
| Subscription return   | `subscribe()` returns a `Subscription`                                               | `subscribe()` returns `undefined`                                                       | Legacy unsubscription needs an adapter or facade                                                                      |
| Cancellation          | `Subscription.unsubscribe()` and teardown chains                                     | `AbortSignal`, `Subscriber.signal`, and ref-count closure                               | Boundary adapters must map both directions and preserve abort reasons where possible                                  |
| Teardown registration | Producer may return teardown logic; subscriptions aggregate finalizers               | Producer calls `subscriber.addTeardown()`                                               | Creation APIs and tests need a deliberate translation                                                                 |
| Teardown order        | RxJS 7 subscription finalizers generally follow its existing aggregation semantics   | The current platform specification closes teardown callbacks in reverse insertion order | Exact order cannot be claimed compatible without an adapter and tests                                                 |
| Error reporting       | RxJS configuration and host error reporting rules                                    | Platform exception reporting and Web IDL callback behavior                              | Unhandled-error and late-error cases need a compatibility policy                                                      |
| Operators             | Mostly standalone pipeable functions returning Observables                           | A small set of native string-named methods plus RxJS Symbol extensions                  | Portable operator behavior belongs in the main library; source-shape compatibility belongs in the compatibility layer |
| Pipe                  | `pipe(...)`, `source.pipe(...)`, and `OperatorFunction` types                        | No RxJS 7 pipe contract; branch prototypes a Symbol-keyed `pipe`                        | Exact facade and typing remain open                                                                                   |
| Subjects              | `Subject`, `BehaviorSubject`, `ReplaySubject`, and others with established semantics | No equivalent family in the core platform proposal                                      | Supported subject types need explicit compatibility contracts                                                         |
| Scheduling            | Scheduler arguments and scheduler classes affect many APIs                           | No RxJS scheduler abstraction in the platform Observable                                | Scheduler behavior must be retained selectively, redesigned, or marked unsupported                                    |
| Input conversion      | RxJS accepts a broad `ObservableInput` ecosystem and interop protocols               | Platform `Observable.from` follows its own conversion order and supported categories    | Compatibility conversion must not alter the platform static method                                                    |
| Testing               | Marble tests assume RxJS scheduling and subscription records                         | Platform sharing changes subscription timing and multiplicity                           | The test harness and expectations may need rewriting                                                                  |

## Layering policy

### Platform layer

The main RxJS platform layer:

- operates on the selected native or fallback platform Observable;
- preserves shared, ref-counted active producer work;
- uses signal-based cancellation;
- installs RxJS-specific capabilities through Symbols;
- preserves native string-named methods as the platform-owned API;
- provides corresponding RxJS Symbols for operator uniformity even when a
  platform method has the same familiar name;
- allows a Symbol-keyed RxJS operator to delegate to its platform counterpart
  or provide additional documented and tested RxJS functionality;
- does not expose a legacy `Subscription` as though it were the native return
  value of `subscribe()`.

### Compatibility layer

The additional compatibility layer may:

- create a producer per subscription;
- return or expose an RxJS 7-like unsubscription facade;
- provide pipeable operator functions and familiar types;
- supply supported subject and scheduler behavior;
- preserve selected import paths through explicit compatibility entry points;
- translate to and from platform Observables.

It must:

- be opt-in and identifiable in imports and types;
- document when a conversion changes sharing or cancellation;
- avoid monkey-patching the platform Observable with string-named legacy APIs;
- define which direction conversions are lossless;
- keep unsupported behavior visible.

The current `ColdObservable`, `ColdSubject`, behavior-subject factory, and
replay-subject factory are implementation experiments for this boundary. Their
presence in `packages/rxjs` is not a final package decision.

The current `Subject` class provides `subject.asObservable()` as a
Subject-local compatibility capability. It returns a distinct base Observable
without `next`, `error`, or `complete`, mirrors the Subject's terminal state
for late observers, and forwards cancellation with `AbortSignal`. It does not
patch a string-named method onto the platform Observable prototype. When the
base is the platform fallback, concurrent observers of one view share and
ref-count a single forwarding subscription; obtaining a view does not make
platform behavior cold.

## Pipeable compatibility requirement

The required user outcome is that an RxJS 7 pipeline can be migrated without
rewriting each operator into ad hoc nested calls. A compatibility design should
support:

- operator functions that accept a source and return a derived source;
- type inference across a sequence of operators;
- both standalone `pipe(...)` composition and a deliberate source-bound
  composition form;
- cancellation propagation across the full pipeline;
- explicit conversion when the pipeline moves between shared platform and cold
  compatibility semantics.

The exact API is open. In particular, this document does not decide whether the
source-bound form is the RxJS 7 string-named `.pipe`, the branch's
Symbol-addressed `[pipe]`, a compatibility wrapper method, or more than one
form.

## Testing compatibility boundary

`@rxjs/test` preserves the documented RxJS 7 run-mode marble capabilities
without reviving the public scheduler class or manual mode. Its `cold()` helper
is explicitly producer-per-subscription compatibility behavior. The separate
`observable()` helper proves the platform shared/ref-counted lifecycle, and
`hot()` supplies a subject-like absolute timeline.

All three source types use AbortSignal cancellation and share one virtual host
event loop. This allows tests to mix Observable operators with application
`setTimeout`, `setInterval`, animation-frame, idle-callback, and supported Node
timing calls without passing scheduler instances into production APIs.

An unchanged RxJS 7 marble test is still not automatically portable: tests
whose outcome depends on producer multiplicity must choose `cold()` or
`observable()` deliberately and receive the corresponding compatibility-ledger
classification.

This distinction also applies when a flattening test returns the same inner
fixture more than once. In cold compatibility mode, each return creates the
independent timeline asserted by RxJS 7. In platform mode, overlapping returns
join one shared, ref-counted producer, so join time can change both the emitted
notification sequence and the producer subscription log. A return after the
shared producer closes starts a new timeline. Ported evidence for this case
must keep the cold expectation intact and use an exact, generator-owned
platform expectation; it must not recover the cold result by substituting a
cold fixture into platform execution.

## Operator parity policy

An operator is not “compatible” merely because it has the same name. It must be
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
- cold compatibility execution when claimed.

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

The exact `sampleTime(period)` Symbol samples through a host interval; its
compatibility mapping does not restore the RxJS 7 scheduler argument.
`timestamp` and `timeInterval` retain their timestamp-provider overloads
because those providers are clocks rather than work schedulers. The default
clock is `Date.now()`. `animationFrames` retains its optional timestamp
provider and RxJS 7 `{ timestamp, elapsed }` result shape while scheduling and
cancelling through the host animation-frame APIs virtualized by `@rxjs/test`.

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
buffers; producer-per-subscription zip behavior remains compatibility-only.
The non-RxJS `fillAfterComplete` option is a separate Next capability: it pads
completed inputs only while another real buffered value remains, then
completes after all inputs and buffers finish. An empty source list completes
immediately.

For operators that overlap with platform methods, both the string-named
platform form and Symbol-keyed RxJS form are required. Parity work must record
whether the RxJS form delegates, which additional functionality it supplies,
and which behavior or types intentionally differ. It must also prove that
installing the Symbol does not alter the platform method.

## RxJS 7 test migration protocol

Every migrated test should have one classification:

| Classification          | Meaning                                                                                                          | Gate                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Portable                | The RxJS 7 expectation is still valid for the platform operator                                                  | Must pass in native and fallback modes                                |
| Harness rewrite         | Behavior remains required, but old marble/subscription machinery cannot express the platform lifecycle correctly | Rewritten test must preserve the original behavioral claim            |
| Compatibility-only      | The test requires RxJS 7 cold, subscription, subject, scheduler, or import behavior                              | Must pass only against the declared compatibility surface             |
| Intentional divergence  | Platform semantics require a different result                                                                    | New expectation and migration consequence require maintainer approval |
| Unsupported or obsolete | The feature will not be provided or the test only protects removed internals                                     | Removal requires rationale and user-impact review                     |

Tests must not be weakened solely to make a new implementation pass. A harness
rewrite should state the old claim in plain language and show how the new test
still proves it.

The first structured evidence ledger now exists at
`packages/rxjs/test/ported/manifest.generated.json`. It accounts for every
inventoried RxJS 7 marble case with both a compatibility classification and one
execution disposition: active, expected failure, missing API, deduplicated, or
unsupported/obsolete. Missing APIs remain converted pending definitions;
implementation mismatches remain known failures. All 2,338 expanded cases are
executable cold registrations, including parameterized and source-skipped
evidence; missing capabilities fail explicitly rather than disappearing from
collection. Every applicable registration uses ordinary test semantics, so
known gaps are not skipped, quarantined, or inverted through expected-failure
handling. Platform cases use the ambient Observable and do not redefine the
platform layer to recover RxJS 7 cold semantics. See
`RXJS_7_MARBLE_TEST_PORT_NOTES.md` and `RxJS-7-parity.md`.

## Compatibility ledger

Maintain a ledger as operator and API work begins. It can start as a Markdown
table and move to structured data when automation needs it.

| Field               | Required content                                                                      |
| ------------------- | ------------------------------------------------------------------------------------- |
| RxJS 7 API          | Name and former import path                                                           |
| RxJS 7 evidence     | Test files or documentation defining behavior                                         |
| RxJS Next surface   | Platform method, Symbol extension, compatibility API, or unsupported                  |
| Sharing model       | Shared platform, cold compatibility, or not applicable                                |
| Cancellation model  | Signal, subscription facade, both, or not applicable                                  |
| Test classification | Portable, harness rewrite, compatibility-only, intentional divergence, or unsupported |
| Type status         | Preserved, changed, deferred, or unsupported                                          |
| Migration action    | Mechanical change, semantic review, adapter, or redesign                              |
| Decision            | Link to accepted decision or open question                                            |

The marble-test manifest populates the behavioral-evidence portion of this
ledger without making API support promises. The full public compatibility
ledger still requires the package and compatibility contracts to be chosen.

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
for `startWith`, `generate`, and `expand` remain unresolved scheduler
compatibility evidence; they are neither silently discarded nor recorded as an
approved divergence.

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
6. **Compatibility behavior:** compatibility-only cases pass when that surface
   is claimed.
7. **Packaging fixture:** the API works through the published entry point, not
   only a source import.

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

Future Skills and MCP capabilities should derive their advice from the
compatibility ledger and accepted decisions rather than from general RxJS
knowledge alone.

## Compatibility exit criteria

A compatibility release claim requires:

- a published support matrix by API category;
- an explicit package and type boundary;
- a populated compatibility ledger for every supported public API;
- passing compatibility tests tied back to RxJS 7 evidence;
- migration guidance for every intentional divergence;
- representative application fixtures;
- no unresolved question that changes the meaning of “compatible” for a
  supported category.
