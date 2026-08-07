# Cancellation and resource ownership in RxJS 9

`subscribe()` returns `undefined`. The owner supplies an AbortSignal:

```ts
const controller = new AbortController();

updates.subscribe(renderUpdate, { signal: controller.signal });

// Component, request, job, or test teardown:
controller.abort('owner disposed');
```

Do not capture a nonexistent Subscription or call `.unsubscribe()`.

## Register producer teardown

The Observable initializer does not return a cleanup function. Register every
resource with `subscriber.addTeardown()`:

```ts
function resizeEntries(element: Element): Observable<ResizeObserverEntry> {
  return new Observable((subscriber) => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!subscriber.active) return;
        subscriber.next(entry);
      }
    });

    observer.observe(element);
    subscriber.addTeardown(() => observer.disconnect());
  });
}
```

Avoid RxJS 7 constructor style:

```ts
// Bad: a returned cleanup function is not the platform producer contract.
return new Observable((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  return () => clearInterval(id);
});
```

## Forward the Subscriber signal

When the underlying API accepts a signal, connect ownership directly:

```ts
function response(url: string): Observable<Response> {
  return new Observable((subscriber) => {
    fetch(url, { signal: subscriber.signal }).then(
      (value) => {
        if (subscriber.active) {
          subscriber.next(value);
          subscriber.complete();
        }
      },
      (error) => {
        if (subscriber.active) subscriber.error(error);
      }
    );
  });
}
```

If another controller is required, abort it from a registered teardown and
preserve a meaningful reason.

## Teardown happens before terminal callbacks

On `error` or `complete`, the Subscriber closes, aborts its signal, and runs
its registered cleanup before terminal observer callbacks. This prevents
reentrant terminal handlers from observing resources that should already be
released.

The platform teardown collection closes in reverse registration order.
`ColdObservable` uses a distinct compatibility Subscriber and must be reviewed
on its own contract. If release order is observable, test the selected source
lifecycle rather than relying on a general slogan.

`addTeardown()` invoked after the Subscriber is inactive runs immediately.
Cleanup must be idempotent and safe after partial initialization.

## Stop work after closure

Check `subscriber.active` before expensive work and after asynchronous gaps.
Do not emit a late error simply because an underlying Promise rejects after
cancellation; decide whether it is an expected canceled operation or a host-
reporting defect.

For early-terminating custom logic, abort upstream before sending the terminal
notification. Built-in operators such as `[take]`, `[first]`, and `[timeout]`
already encode this sequencing and should be preferred.

## Use existing adapters

- `EventTarget.when()` owns ordinary EventTarget listener removal.
- `fromEventPattern` supports non-EventTarget add/remove callback APIs and
  protects removal during synchronous registration edge cases.
- Static `[interval]` and `[timer]` factories register timer cleanup.
- Flattening operators link inner work to their Subscriber signals.

Write a custom source when these do not match, then test completion, error,
owner abort, final-observer removal, synchronous setup failure, and reentrancy.
