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

The ledger is intentionally not populated during the documentation foundation
phase; doing so responsibly requires choosing the package and compatibility
contracts first.

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
