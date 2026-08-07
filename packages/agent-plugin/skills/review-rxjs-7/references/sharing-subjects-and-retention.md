# Sharing, Subjects, and retention review

## Require a sharing contract

For every `share`, `shareReplay`, `publish*`, `multicast`, or manual Subject
bridge, identify:

- whether one producer should be shared;
- start and stop conditions;
- late-subscriber behavior;
- replay size and time bound;
- reset after error, completion, and zero ref count; and
- retained object graph and lifetime.

```ts
// Bad review target: the comment "cache it" does not define lifecycle.
const profile$ = loadProfile().pipe(shareReplay(1));
```

Recommend explicit `share` configuration when independent reset decisions are
part of the API. Do not mechanically replace every `shareReplay`; first state
the desired behavior.

## Inspect Subject write authority

A public Subject permits every consumer to call `next`, `error`, or
`complete`. Flag it when the type is meant to expose reads only. Prefer a
private Subject plus `asObservable()` and named methods that validate writes.

That boundary may be a class or a function returning a readonly
`[command, observable]` tuple. Review authority and lifetime rather than
requiring one style. A class shares prototype methods; a factory creates
closures per instance. Treat the latter as a performance finding only with
measured instance churn or allocation evidence.

Review reentrant feedback:

```ts
subject.subscribe((value) => {
  if (needsMore(value)) subject.next(nextValue(value));
});
```

Determine ordering, termination, stack growth, and whether other observers see
intermediate state. A scheduled boundary can change ordering but is not a
substitute for an explicit state machine.

Recognize a subject-primed feedback machine when a downstream handler writes
back to the Subject and a later `subject.next()` provides the initial seed.
Verify that subscription happens before priming, exactly one path owns the
feedback write, each cycle has a reachable boundary, and `complete`, `error`,
and owner unsubscription have intentional meanings. Treat every side-effecting
call between receiving a value and writing the next input as a possible
indirect reentry path.

If the loop collects cycle results, ensure `toArray()` belongs to each finite
inner cycle. A `toArray()` after the Subject-rooted chain cannot emit the value
needed for feedback until that input Subject completes. Review `switchMap` as
replacement/cancellation policy; prefer `concatMap` when every cycle must
finish.

## Match the Subject to the contract

- `BehaviorSubject` requires an initial value and exposes a synchronous
  current value.
- `ReplaySubject` retains a configurable history.
- `AsyncSubject` emits a final value only on completion.
- Plain `Subject` provides live fanout without retained values.

Flag `BehaviorSubject.value` read-modify-write scattered across callers when
events and `scan` would make transitions deterministic.

## Review retention and identity

Replay buffers and callbacks can retain large object graphs. Inspect singleton
services, never-reset shared streams, unbounded `ReplaySubject`, group/window
operators, and queued higher-order values.

`distinctUntilChanged` uses identity by default. Mutating and re-emitting one
object can hide state changes; continually allocating equivalent values can
cause redundant work. Require an immutable or explicit comparison policy when
identity is not the domain rule.
