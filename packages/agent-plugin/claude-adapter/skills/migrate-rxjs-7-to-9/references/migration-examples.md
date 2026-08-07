# Migration examples

These are candidate shapes plus required review, not blind replacements.

## Pipeable mapping

```ts
// RxJS 7
import { filter, map } from 'rxjs/operators';
const labels = values.pipe(filter(isValid), map(toLabel));

// RxJS 9 candidate for platform lifecycle
const labels = values.filter(isValid).map(toLabel);
```

Review receiver lifecycle, callback `thisArg`, user callback errors, and tests.

## Queued projection

```ts
// RxJS 7
const saved = requests.pipe(concatMap(save));

// RxJS 9 candidate for platform lifecycle
const saved = requests.flatMap(save);
```

Review queue growth, completion, source input category, cancellation of the
underlying save, and any removed result selector. Sequential queueing is the
safe default. Use exact `[mergeMap](save, { concurrent: 1 })` when the receiver
is a `ColdObservable` whose result must preserve producer-per-subscription
lifecycle; use higher concurrency only for intentional parallelization.

## Terminal subscription ownership

```ts
// RxJS 7
const subscription = updates.subscribe(render);
destroyed.add(subscription);

// RxJS 9 candidate
const controller = new AbortController();
updates.subscribe(render, { signal: controller.signal });
destroyed.onDispose(() => controller.abort());
```

The real owner API may be a framework signal, request signal, or service
lifecycle; connect directly when possible.

## Promise conversion

```ts
// RxJS 7
const ready = await firstValueFrom(state.pipe(filter(isReady)));

// RxJS 9 candidate
const ready = await state.filter(isReady)[timeout]({ first: 5_000 }).first({ signal: request.signal });
```

Confirm the timeout and owner signal are actual requirements. Distinguish the
platform string `first()` Promise consumer from the `[first]` Observable
operator.

## Custom timer source

```ts
// RxJS 7: producer per subscription, returned teardown.
const ticks = new Observable<number>((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  return () => clearInterval(id);
});

// RxJS 9 candidate when sharing one active producer is intended.
const ticks = new Observable<number>((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  subscriber.addTeardown(() => clearInterval(id));
});
```

Use `ColdObservable` instead when each direct subscription must own a distinct
timer. Test both overlapping observers and later restart.

## Subject state

```ts
// RxJS 7
private readonly stateSubject = new BehaviorSubject(initial);
readonly state = this.stateSubject.asObservable();

// RxJS 9 candidate
private readonly stateSubject = behaviorSubject(initial);
readonly state = this.stateSubject.asObservable();
```

Review synchronous current-value access, per-direct-observer delivery,
terminal behavior, write authority, and whether derived `[scan]` state would
better model transitions.

The same state boundary may be functional and should remain so when already
part of the API:

```ts
function createState(initial: State) {
  const state = behaviorSubject(initial);
  const setState = (value: State) => state.next(value);
  return [setState, state.asObservable()] as const;
}
```

Do not introduce a class merely as migration churn. Choose between prototype
method reuse and per-instance closure composition as a separate design/performance
decision.

## Unsupported arbitrary subscribable

```ts
// RxJS 7 accepted by broad ObservableInput paths in some contexts.
const legacy = {
  subscribe(observer) {
    /* ... */
  },
};

// RxJS 9: write an explicit active-realm adapter after defining lifecycle.
const adapted = new Observable((subscriber) => {
  const handle = subscribeLegacy(legacy, subscriber);
  subscriber.addTeardown(() => handle.dispose());
});
```

Do not use this sketch until setup errors, terminal forwarding, signals, and
producer sharing are specified.
