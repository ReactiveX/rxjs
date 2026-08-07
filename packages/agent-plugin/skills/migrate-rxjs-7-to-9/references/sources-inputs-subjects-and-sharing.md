# Sources, inputs, Subjects, and sharing

## Creation functions and factories

RxJS 9 creation capabilities may be static exact Symbols, platform
`Observable.from`, constants, ordinary exports, or custom construction. Verify
the public subpath and signature; do not infer target syntax from the RxJS 7
name.

Select platform Observable when concurrent observers share an active producer.
Select `ColdObservable` when every direct subscription starts independent work.

## ObservableValue input boundary

RxJS 9 accepts:

- an active-realm Observable;
- async iterable;
- iterable; or
- Promise-like value.

It does not transparently accept arbitrary lowercase `subscribe()` objects,
legacy `Symbol.observable`/`@@observable` protocols, or every foreign-realm
value. Inventory inputs to flattening, combination, notifiers, recovery, and
creation separately from result lifecycle.

For an unsupported input, write an explicit active-realm adapter only after
defining cancellation, setup errors, terminal delivery, and teardown. Do not
cast to silence the type checker.

## Subject migrations

- `Subject` and `AsyncSubject` remain classes with intentional RxJS 9
  contracts.
- `behaviorSubject(initial)` and `replaySubject({ size, maxAge })` are lowercase
  factories.
- `Subject.asObservable()` returns a non-mutating platform view.
- `PerSubscriptionSubjectBase` is advanced hot Subject infrastructure for
  observer-local setup.

Review current/replay behavior, late direct observers, terminal retention,
write authority, synchronous reads, and reentrant feedback. Do not mechanically
rename `BehaviorSubject` or `ReplaySubject` without tests for those contracts.

## Sharing and replay

A platform Observable already shares its active producer. Adding `[share]`
solely to avoid duplicate concurrent work may be redundant or misleading.

A late concurrent platform observer joins the already active derived
Subscriber. `[shareReplay]` cannot force the derived platform initializer to
run once for that observer, so it does not transparently reproduce every RxJS
7 late-subscriber cache pattern.

`[share]` applied to a `ColdObservable` can coordinate its direct subscribers
through a connector. Review reset on error, completion, and zero ref count;
retention size/age; synchronous reentrancy; and source disconnect.

When every direct observer needs current or retained state, use an intentional
state/Subject API or expose a normal state read beside changes. Preserve the
actual public requirement, not the old operator spelling.
