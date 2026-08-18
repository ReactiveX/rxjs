# Subscription ownership and teardown review

## Find terminal boundaries

Every direct `subscribe`, `forEach`, `firstValueFrom`, and `lastValueFrom` is a
terminal boundary. Identify the component, service, request, job, test, or
process that owns it and the event that ends that owner's lifetime.

Flag a direct subscription when no path completes or unsubscribes it. A source
that is currently quiet is not complete. `take(1)` is not a component lifetime
policy if the matching value may never arrive.

## Detect detached subscription trees

```ts
// Bad: inner work has a separate owner, error boundary, and cancellation path.
outer$.subscribe((value) => {
  inner(value).subscribe(render);
});
```

Review whether a higher-order operator should express replacement, queueing,
overlap, or ignoring. A nested subscription can be intentional at an explicit
imperative boundary, but its ownership must then be equally explicit.

## Inspect resources, not just subscriptions

Custom producers must return or register teardown for listeners, timers,
sockets, workers, observers, and child subscriptions. Teardown should be
idempotent and safe after partial setup.

```ts
// Bad: each subscription adds a listener that it cannot later remove.
const changes$ = new Observable<Change>((subscriber) => {
  target.addEventListener('change', (event) => subscriber.next(readChange(event)));
});
```

Prefer the tested public creation function or retain the exact callback and
return its removal.

## Review synchronous behavior and reentrancy

RxJS sources may emit synchronously inside `subscribe`. Look for variables
assigned only after a subscription begins, loops that continue after
`subscriber.closed`, and downstream callbacks that can synchronously cause
new source values.

```ts
// Bad: source$ can emit before subscription is assigned.
let subscription: Subscription;
subscription = source$.subscribe(() => subscription.unsubscribe());
```

Prefer `take(1)` or another tested operator. Custom synchronous producers
should check `subscriber.closed` before expensive work and after each emission
when downstream can terminate them.

## Completion is not disposal

Completion-gated composition can retain resources forever when a source is
long-lived or merely silent. Inspect `concat`, `concatMap`, `forkJoin`,
`lastValueFrom`, `toArray`, `reduce`, `repeat`, and `finalize` assumptions.

`finalize` is a useful symmetric observation point for completion, error, and
explicit unsubscription. It does not create an owner or guarantee the source
will terminate.

## Teardown-order evidence

If behavior depends on whether a resource is released before or after a
downstream terminal/reentrant callback, require a focused test. Do not infer a
global ordering principle from one operator. Custom code should release a
resource as soon as it knows that resource is no longer useful and avoid work
after closure.
