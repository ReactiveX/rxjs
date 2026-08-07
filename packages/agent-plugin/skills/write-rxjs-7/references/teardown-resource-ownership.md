# Teardown and resource ownership in RxJS 7

Every resource needs one owner and one idempotent release path. A subscription
tree is the usual ownership structure: unsubscribing the parent releases its
children, and terminal notifications close the relevant subscriptions.

## Return cleanup from custom sources

```ts
function observeResize(element: Element): Observable<DOMRectReadOnly> {
  return new Observable((subscriber) => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (subscriber.closed) return;
        subscriber.next(entry.contentRect);
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  });
}
```

Avoid starting resources without returning their release:

```ts
// Bad: unsubscription cannot remove the listener.
const clicks$ = new Observable<MouseEvent>((subscriber) => {
  document.addEventListener('click', (event) => subscriber.next(event));
});
```

Prefer `fromEvent`, `interval`, `using`, and other existing creation functions
when they already model the resource correctly.

## Attach child resources to the subscription

Returning a Subscription attaches it to the outer subscription:

```ts
function monitor(id: string): Observable<Status> {
  return new Observable((subscriber) => {
    const statusSubscription = statusFor(id).subscribe(subscriber);
    return statusSubscription;
  });
}
```

For multiple resources, use the subscriber's teardown collection:

```ts
return new Observable<Message>((subscriber) => {
  const socket = openSocket();
  const heartbeat = interval(30_000).subscribe(() => socket.ping());

  subscriber.add(heartbeat);
  subscriber.add(() => socket.close());

  socket.onmessage = (message) => subscriber.next(message);
});
```

Cleanup functions must tolerate being called after partial setup and must not
throw merely because another path already released the resource.

## Respect synchronous sources and reentrancy

An Observable may emit and complete inside the call to `subscribe`. Install
cleanup before starting work when the API permits it, check `subscriber.closed`
before expensive work or emission, and do not assume assignment after
`subscribe(...)` runs before the first notification.

```ts
// Bad: a synchronous source can call next before sourceSubscription is
// initialized.
let sourceSubscription: Subscription;
sourceSubscription = source$.subscribe(() => sourceSubscription.unsubscribe());
```

Use an existing operator such as `take(1)` for early termination. It already
handles synchronous sources and subscription wiring:

```ts
const firstMatch$ = source$.pipe(filter(matches), take(1));
```

## Release resources as soon as their usefulness ends

Do not continue expensive work after the downstream subscriber has closed.
For a custom producer that knows a resource is no longer useful, release it
before calling user code that could reenter the system, then make the returned
teardown idempotent:

```ts
return new Observable<Result>((subscriber) => {
  let released = false;
  const release = () => {
    if (!released) {
      released = true;
      resource.close();
    }
  };

  resource.onResult = (result) => {
    release();
    if (!subscriber.closed) {
      subscriber.next(result);
      subscriber.complete();
    }
  };

  return release;
});
```

This is an authoring rule for the resource you own. Do not infer that every
RxJS 7 terminal-notification path globally performs upstream teardown before
downstream handlers run; write and test custom code against the actual order it
requires.

## Lifecycle integration

A terminal `subscribe` belongs at a boundary: a component, request handler,
service, job, or test. Tie it to that boundary's destruction mechanism.
`takeUntil` is useful when the notifier itself has a clear owner; a loose
`destroy$` convention does not by itself prove correct ownership.

Use `finalize` for behavior that must run on completion, error, and explicit
unsubscription:

```ts
const request$ = api.load().pipe(
  tap(() => metrics.started()),
  finalize(() => metrics.finished())
);
```

If cleanup order matters, write a focused test for completion, error, explicit
unsubscribe, and synchronous reentrancy.
