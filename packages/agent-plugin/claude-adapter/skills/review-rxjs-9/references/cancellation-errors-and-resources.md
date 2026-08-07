# Cancellation, errors, and resources review

## Find the cancellation owner

Platform `subscribe()` returns `undefined`. Every terminal subscription needs
an AbortSignal owned by a component, request, service, job, test, or process.
Flag captured return values, `.unsubscribe()`, or local controllers that no
owner ever aborts.

Follow joined signals into higher-order work and underlying APIs. Canceling
observation of a Promise does not cancel its resource unless that resource
accepts and receives a signal.

## Review producer cleanup

Platform producer initializers register cleanup with
`subscriber.addTeardown()`; returned cleanup functions are RxJS 7 style and
are ignored by the platform contract.

For every listener, timer, socket, worker, observer, controller, and child
resource, confirm:

- teardown is registered before a synchronous terminal/reentrant path can
  bypass it;
- cleanup is idempotent and safe after partial setup;
- late asynchronous continuations check `subscriber.active`; and
- setup exceptions reach `subscriber.error`.

## Review terminal order

On platform `error` or `complete`, the Subscriber closes, aborts its signal,
and runs teardown before terminal observer callbacks. This ordering prevents a
reentrant terminal callback from observing still-active upstream resources.
Platform teardown callbacks close in reverse registration order.

`ColdObservable` owns a distinct compatibility Subscriber. Require a focused
test rather than applying platform teardown-collection order to it.

## Separate error categories

- Producer setup failures are source errors.
- Operator user callback failures should become output errors.
- Observer callback failures go to host error reporting and are not
  recoverable source errors.
- Late errors after closure are host-reporting concerns.

Flag custom code that lets a projector throw from an observer callback without
calling the output Subscriber's `error`.

## Bound Promise consumers

String `first()`, `last()`, `toArray()`, and similar platform consumers return
Promises. Require a source that can settle, an owner signal, and where needed a
`[timeout]`, predicate, or finite bound. Distinguish them from exact `[first]`
and `[last]` Symbols, which return Observables.
