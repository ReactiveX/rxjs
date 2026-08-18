# Authoring custom operators in RxJS 7

Prefer composing existing operators. A custom operator is justified when it
encapsulates a reusable domain policy, must integrate a producer that existing
creation functions cannot express, or must enforce notification/lifecycle
behavior unavailable through ordinary composition.

## Start with composition

An operator is a function from an Observable to an Observable. Keep the public
type explicit and preserve inference:

```ts
import { Observable, filter, map, pipe } from 'rxjs';
import type { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';

export function validReadings(): MonoTypeOperatorFunction<Reading> {
  return filter((reading) => Number.isFinite(reading.value));
}

export function toDisplayReading(): OperatorFunction<Reading, DisplayReading> {
  return pipe(
    validReadings(),
    map((reading) => ({
      label: reading.sensorName,
      value: `${reading.value.toFixed(1)} ${reading.unit}`,
    }))
  );
}
```

This reuses RxJS's notification, error, and teardown behavior and is usually
the most maintainable custom operator.

Avoid exposing an operator-shaped wrapper that subscribes internally:

```ts
// Bad: returns a Subscription, breaks composition, and moves ownership into a
// helper whose caller cannot combine it safely.
function logValues<T>(source: Observable<T>) {
  return source.subscribe((value) => console.log(value));
}
```

Use `tap` composition instead:

```ts
function logValues<T>(): MonoTypeOperatorFunction<T> {
  return tap((value) => console.log(value));
}
```

## Use `new Observable` only for behavior composition cannot express

Public custom operators should use public APIs. Do not import `operate`,
`OperatorSubscriber`, or files under `rxjs/internal`; they are not compatibility
contracts.

```ts
export function mapDefined<T, R>(project: (value: T, index: number) => R | undefined): OperatorFunction<T, R> {
  return (source) =>
    new Observable<R>((subscriber) => {
      let index = 0;

      const sourceSubscription = source.subscribe({
        next(value) {
          if (subscriber.closed) return;

          let projected: R | undefined;
          try {
            projected = project(value, index++);
          } catch (error) {
            subscriber.error(error);
            return;
          }

          if (projected !== undefined) {
            subscriber.next(projected);
          }
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        },
      });

      return sourceSubscription;
    });
}
```

The explicit `try`/`catch` matters. A user callback that throws is an error in
the operator's output contract; do not let it become an unhandled observer
error. Returning the source subscription links upstream teardown to downstream
unsubscription.

## Operator authoring checklist

- Forward source `error` and `complete` unless the operator intentionally
  transforms them.
- Catch errors thrown by user callbacks and send them to `subscriber.error`.
- Stop work when `subscriber.closed` is true.
- Return or add every upstream subscription and resource teardown.
- Define ordering, concurrency, buffering, and cancellation rather than
  allowing timing to decide them accidentally.
- Keep state per subscription unless sharing is explicitly the operator's API.
- Do not mutate source values unless mutation is explicitly documented.
- Preserve useful generic inference and distinguish
  `MonoTypeOperatorFunction<T>` from `OperatorFunction<T, R>`.
- Document whether the operator is synchronous, whether it delays terminal
  notifications, and how it behaves under reentrancy.

## Early termination is easy to get wrong

Do not hand-roll `take`, `first`, timeout, or cancellation behavior simply to
save an operator call. Synchronous sources can notify before the local variable
receiving `source.subscribe(...)` has been assigned. Reuse the built-in
operator or build the behavior around a correctly linked Subscriber and cover
the ordering with tests.

## Required tests

For an operator built with `new Observable`, test at least:

1. ordinary `next` transformation;
2. source error forwarding;
3. source completion forwarding;
4. explicit downstream unsubscription releases upstream work;
5. user callback throws become output errors;
6. synchronous sources and reentrant downstream handlers;
7. per-subscription state isolation; and
8. any concurrency, buffering, or delayed-terminal policy.

Use marble tests when notification timing is the contract and direct tests
with a teardown spy when resource release is the contract. Hand detailed test
implementation to `write-rxjs-7-tests`.
