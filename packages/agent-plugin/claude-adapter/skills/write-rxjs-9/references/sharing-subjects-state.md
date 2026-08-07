# Sharing, Subjects, and state in RxJS 9

Start from the source's actual lifecycle. A platform Observable already shares
one active producer among concurrent observers. `share` is not required merely
to prevent duplicate concurrent platform work.

## Platform sharing does not imply replay

A late concurrent observer joins the current platform producer from that
observer's subscription time. It does not receive values already sent during
the active run.

There is a subtle consequence: applying `[shareReplay]` to a platform
Observable cannot make the derived platform initializer run once per late
concurrent observer. Those observers join the derived Observable's already
active platform Subscriber, so replay through the connector is activation-
scoped rather than a transparent per-observer replay retrofit.

If every direct observer must receive current or retained state, choose an API
whose contract explicitly performs per-direct-subscription delivery, such as
`behaviorSubject` or `replaySubject`, or expose an ordinary state read beside
the change stream.

## Sharing a producer-per-subscription source

`share` is meaningful when a `ColdObservable` producer should be connected
once across direct subscribers with an explicit reset policy:

```ts
import { ColdObservable, replaySubject } from 'rxjs';
import { share } from 'rxjs/share';

const coldProfile = new ColdObservable<Profile>((subscriber) => {
  loadProfile(subscriber);
});

const profile = coldProfile[share]({
  connector: () => replaySubject<Profile>({ size: 1 }),
  resetOnError: true,
  resetOnComplete: false,
  resetOnRefCountZero: true,
});
```

The `[create]` protocol preserves the `ColdObservable` result lifecycle, while
the `share` operator's closure coordinates its connector and source
connection. Verify synchronous reentrancy, late subscribers, and resets with
tests when these details matter.

## Make reset and retention policy explicit

`[share]` independently controls reset after error, completion, and zero ref
count. Each rule may be a boolean or, where supported, a notifier factory.
`[shareReplay]` is shorthand with a specific policy: reset after error, retain
after completion, and optionally reset at zero ref count.

Use `[share]` when those decisions need to be visible. Do not add
`[shareReplay](1)` as an unexplained cache. Replay retains object graphs; bound
both size and age when the retained lifetime matters.

## Subjects are hot producers

An instantiated Subject exists before its observers subscribe. Subject type
does not make it cold.

- `Subject<T>` provides live fanout and `asObservable()`.
- `behaviorSubject(initial)` delivers a current value to every direct
  subscriber.
- `replaySubject({ size, maxAge })` delivers a bounded retained history to
  every direct subscriber before live fanout.
- `AsyncSubject<T>` delivers its final value on completion.
- `PerSubscriptionSubjectBase` is an advanced base for observer-local setup;
  it is still a hot Subject producer.

Keep mutation private:

```ts
class SelectionModel {
  readonly #changes = new Subject<Selection>();
  readonly changes = this.#changes.asObservable();

  select(value: Selection): void {
    this.#changes.next(value);
  }
}
```

Do not expose a Subject when consumers should only observe. A public Subject
lets arbitrary callers inject, error, or complete shared state.

## State decisions

- Derive state with `[scan]` when events define transitions.
- Use `behaviorSubject` only when synchronous current-value delivery to every
  direct observer is the contract.
- Use `replaySubject` when bounded history is the contract, not as a vague
  memoization device.
- Keep immutable state identities or provide an explicit comparator for
  `[distinctUntilChanged]`.
- Decide whether terminal state is retained for late observers.

Native methods may use platform internal subscription and can bypass the
advanced direct-subscription hook. Preserve exact Symbol/direct-subscription
boundaries in state APIs and test any intentional crossing.
