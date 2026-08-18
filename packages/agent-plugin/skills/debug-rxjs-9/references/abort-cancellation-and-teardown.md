# AbortSignal, cancellation, and teardown

## Follow the owner signal

Platform `subscribe()` returns `undefined`. The consumer owns an
`AbortController` and passes `{ signal }`; a source or custom operator owns
resources through the initializer's `subscriber.signal` and
`subscriber.addTeardown`.

Draw every controller/signal composition, outer and inner subscription, and
actual resource. Mark which controller should abort each fetch, listener,
timer, stream reader, socket, or custom handle. Record abort reason and the
resource's cancellation call. Observer silence does not prove resource release.

Common partial-cancellation causes:

- the owner did not retain or abort its controller;
- a custom operator subscribed upstream without forwarding the downstream
  signal;
- a projected inner has an independent controller that survives;
- a Promise ignores cancellation after the observer detaches;
- a framework effect recreated the pipeline and cleaned only the newest one;
  or
- one platform observer left while another correctly kept the shared producer
  active.

## Teardown and late work

The platform subscriber closes and runs registered teardown before delivering
terminal callbacks, and the fallback runs platform teardowns in reverse
registration order. `ColdObservable` has its own compatibility implementation;
test the selected source path rather than assuming identical order.

Abort the owner, then deliberately settle callbacks and Promises. Confirm that
late values are suppressed, late errors are handled as intended, and expensive
work does not continue unnecessarily. Check `subscriber.active` before
avoidable work in a custom source.

For leaks, repeat activation/abort cycles and compare live listener, timer,
request, and producer counts after quiescence. Prefer a resource spy before a
heap trace; it yields a smaller deterministic regression.
