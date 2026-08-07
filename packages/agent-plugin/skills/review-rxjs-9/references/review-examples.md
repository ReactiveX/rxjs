# RxJS 9 review examples

## Capturing a nonexistent Subscription

```ts
// Before
const subscription = updates.subscribe(render);
subscription.unsubscribe();

// Candidate
const controller = new AbortController();
updates.subscribe(render, { signal: controller.signal });
controller.abort();
```

Finding: platform `subscribe()` returns `undefined`, so disposal throws and
the observer remains attached. Tie the controller to the real owner rather
than aborting immediately as this isolated candidate does.

## Accidental shared producer

```ts
// Before: documented as one request per caller.
const profile = new Observable<Response>((subscriber) => startRequest(subscriber));
```

Finding: concurrent observers share one active producer. Use
`ColdObservable` if one request per direct subscription is the requirement, or
correct the documentation and observer-specific state if sharing is intended.

## Returned teardown

```ts
// Before
const clock = new Observable<number>((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  return () => clearInterval(id);
});
```

Finding: the platform initializer ignores the returned function. Register
`subscriber.addTeardown(() => clearInterval(id))` and test final-observer
removal plus later restart.

## Wrong composition contract

```ts
// Before
const result = source.pipe(map(project), switchMap(load));

// Candidate
const result = source.map(project).switchMap(load);
```

Finding: the source uses RxJS 7 pipeable syntax. Platform `.map()` and
`.switchMap()` fit this platform-lifecycle candidate without importing
extension modules. Review lifecycle and input semantics; syntax replacement
alone is not proof of equivalence. Use exact Symbols instead when the contract
differs or a `ColdObservable` result must retain its lifecycle.

## Cancellation drops a required write result

```ts
// Before: each success removes the deleted item from the client view.
const deleted = requests.switchMap((request) => api.delete(request.id));

// Candidate when every delete must be observed in order.
const deleted = requests.flatMap((request) => api.delete(request.id));
```

Finding: the server can complete an earlier deletion after `switchMap` aborts
its observation, so the client never applies that success and becomes stale.
Use sequential `.flatMap()` as the default. Reserve `[mergeMap]` for explicit
parallelization, `[exhaustMap]` for locking actions such as placing an order,
and `.switchMap()` for disposable reads, streaming source changes, or reactive
process control.

## Unbounded overlap

```ts
// Before
const result = requests[mergeMap](callService);

// Candidate when four active calls is the requirement
const result = requests[mergeMap](callService, { concurrent: 4 });
```

Finding: default active concurrency is unbounded. The candidate still buffers
all excess input, so require a backlog policy when the source can outrun the
service indefinitely.

## Custom operator loses receiver lifecycle

```ts
// Before
Observable.prototype[custom] = function () {
  return new Observable((subscriber) => this.subscribe(subscriber));
};

// Candidate shape
Observable.prototype[custom] = function () {
  return this[create]((subscriber) => this.subscribe(subscriber, { signal: subscriber.signal }));
};
```

Finding: `new Observable` forces a platform result for a `ColdObservable`
receiver and source cancellation is not linked. Use public `[create]`, link the
signal, and add receiver-lifecycle tests. Full code must also catch setup and
user callback errors where present.

## False replay claim

```ts
const current = platformSource[shareReplay](1);
```

Finding: a late concurrent platform observer joins the derived Observable's
active Subscriber and does not rerun its connector initializer. Use an
intentional current/replay state API if per-late-observer retained delivery is
required.
