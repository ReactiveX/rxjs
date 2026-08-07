# RxJS 9 fundamentals and lifecycle

RxJS 9 extends the selected web-platform `Observable`: a conforming native
constructor when present, otherwise the conditional fallback. It does not
replace a conforming native implementation.

## Platform Observable shares one active producer

For one platform Observable instance:

- the first observer starts an active producer;
- concurrent observers join that producer from their own subscription time;
- removing one observer leaves the producer active while another remains;
- removing the final observer closes the producer; and
- a later observer can start a new producer run.

Say those facts directly. “Hot” or “cold” alone does not describe producer
creation, sharing, replay, or ref counting.

```ts
const clock = new Observable<number>((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  subscriber.addTeardown(() => clearInterval(id));
});

const left = new AbortController();
const right = new AbortController();

clock.subscribe(renderLeftClock, { signal: left.signal });
clock.subscribe(renderRightClock, { signal: right.signal });
```

These concurrent observers share one interval. The second misses earlier
ticks; the clock is not replaying.

## `ColdObservable` is an intentional different lifecycle

Use `ColdObservable` only when each direct JavaScript call to `subscribe()`
must create an independent producer and compatibility Subscriber:

```ts
import { ColdObservable } from 'rxjs';

const request = new ColdObservable<Response>((subscriber) => {
  const controller = new AbortController();
  subscriber.addTeardown(() => controller.abort(subscriber.signal.reason));

  fetch('/profile', { signal: controller.signal }).then(
    (response) => {
      if (subscriber.active) {
        subscriber.next(response);
        subscriber.complete();
      }
    },
    (error) => subscriber.error(error)
  );
});
```

Symbol-keyed results preserve the receiver's construction policy through the
public `[create]` protocol. Native string methods on a `ColdObservable` cross
back to a platform Observable and therefore to platform lifecycle. Types still
say `Observable<T>` at the public boundary, so review runtime lifecycle from
the receiver rather than assuming the type encodes it.

## Prefer platform methods; use exact Symbols deliberately

Use the platform string method when it has the behavior you need:

```ts
const labels = readings.filter((reading) => reading.valid).map((reading) => reading.label);
```

This is the smallest browser-oriented form: a conforming native Observable
already owns those methods, so no RxJS operator extension module is needed.
The conditional fallback supplies the platform surface where native Observable
is absent. That currently matters most in Node, where application bundle size
is usually a lesser concern but the semantic preference still keeps code ready
for native Observable support.

Every RxJS extension owns an exact Symbol exported from a public subpath. Use
one when the platform has no equivalent, when the RxJS behavior intentionally
differs, or when a `ColdObservable` result must preserve its construction
policy:

```ts
import { distinctUntilChanged } from 'rxjs/distinct-until-changed';
import { map } from 'rxjs/map';

const stableLabels = readings.map((reading) => reading.label)[distinctUntilChanged]();
const coldLabels = coldReadings[map]((reading) => reading.label);
```

Importing an extension module installs that exact Symbol on the active
Observable prototype. An unrelated `Symbol('map')` does not address it. Do not
add RxJS string methods to the platform prototype. Also do not mechanically
replace a Symbol call with a same-named string call: compare contracts first.

The root `rxjs` import provides the intentional classes, subject factories,
notifications, and errors. It does not make every Symbol operator available;
import only the exact subpaths actually needed.

## Input normalization is the platform boundary

`Observable.from` accepts an Observable, async iterable, iterable, or
Promise-like value. It does not preserve RxJS 7's broad arbitrary-subscribable
interop. Flattening, combination, notifier, and recovery inputs cross this
same boundary even when the result receiver is a `ColdObservable`.

```ts
const response = Observable.from(fetch('/profile'));
const lines = Observable.from(readLines()); // AsyncIterable<string>
```

Do not cast a legacy `{ subscribe() {} }` object into `ObservableValue`. Adapt
it with a real Observable whose cancellation and teardown are explicit.

## Terminal behavior and callback errors

`Subscriber.error` and `Subscriber.complete` close before invoking terminal
observer callbacks. Closing aborts `subscriber.signal` and releases registered
producer resources. A thrown producer initializer becomes an Observable
error. Errors thrown by observer callbacks go to the host error-reporting path;
they are not source errors that an upstream recovery operator can catch.

Always pass a value to a platform `Subscriber<void>`:

```ts
subscriber.next(undefined);
```

Calling `subscriber.next()` without an argument is invalid even when the
subscriber has already closed.
