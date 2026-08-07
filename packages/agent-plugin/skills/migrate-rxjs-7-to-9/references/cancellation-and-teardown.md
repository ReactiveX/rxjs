# Cancellation and teardown migration

## Terminal consumers

RxJS 7:

```ts
const subscription = source.subscribe(render);
owner.add(subscription);
```

RxJS 9:

```ts
const controller = new AbortController();
source.subscribe(render, { signal: controller.signal });
owner.onDispose(() => controller.abort('owner disposed'));
```

Platform `subscribe()` returns `undefined`. Replace ownership architecture, not
just `.unsubscribe()` spelling. Join existing request/component signals when
they already define lifetime.

## Custom producers

RxJS 7 returns teardown from the Observable constructor:

```ts
new Observable((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  return () => clearInterval(id);
});
```

RxJS 9 registers it:

```ts
new Observable((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  subscriber.addTeardown(() => clearInterval(id));
});
```

Choose platform or `ColdObservable` separately. The constructor change alone
does not preserve producer multiplicity.

## Underlying resource cancellation

Pass `subscriber.signal` to fetch, streams, locks, or other signal-aware APIs.
For APIs requiring a distinct controller, register its abort and preserve a
meaningful reason. Canceling observation of a Promise does not cancel its
underlying operation automatically.

Check `subscriber.active` after asynchronous gaps. Do not convert expected
cancellation into a late error notification after closure.

## Terminal and teardown order

Platform error/completion closes the Subscriber, aborts its signal, and runs
registered teardown before terminal observer callbacks. Platform teardowns run
in reverse registration order. `ColdObservable` uses a separate compatibility
Subscriber; test order-sensitive code against the chosen lifecycle.

Characterize RxJS 7 code whose behavior depends on teardown occurring before
or after downstream reentrancy. Do not assume a value-only test preserves it.

## `takeUntil` is not always owner migration

The mechanical `[takeUntil]` mapping can preserve a notifier-shaped pipeline,
but RxJS 9 terminal subscription ownership is still an AbortSignal concern.
Review whether the notifier represents domain data or merely emulates a
component disposal mechanism that should become the subscription signal.
