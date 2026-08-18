# Concurrency, errors, and completion review

## Translate operator choice into behavior

Treat sequential `concatMap` as the safety baseline. Require an explicit
reason to introduce parallelism, action suppression, or cancellation.

| Operator     | When a new outer value arrives | Review failure mode                                   |
| ------------ | ------------------------------ | ----------------------------------------------------- |
| `switchMap`  | unsubscribe previous inner     | required work canceled or result deliberately ignored |
| `concatMap`  | queue until previous completes | unbounded backlog or blocked queue                    |
| `mergeMap`   | overlap, optionally bounded    | excessive active work or retained buffer              |
| `exhaustMap` | ignore while inner active      | lost user intent or state transition                  |

Flag `switchMap` around state-changing work. A delete may finish on the server
after its observation is canceled; if the client uses each success to update
its view, losing an earlier response leaves client and server state out of
sync. Use `mergeMap` for intentional parallelization, `exhaustMap` to lock an
action such as “Place order” until it completes, and `switchMap` for streaming
source changes, disposable read-only results, or reactive process control.

Review the inner resource, not only its Observable. Unsubscribing from a
Promise-backed source may suppress delivery without canceling the underlying
operation.

## Review recovery scope

An inner `catchError` lets the outer interaction continue. An outer
`catchError` replaces the entire composed stream after one failure.

```ts
// Bad when later refreshes must remain active.
const values$ = refresh$.pipe(
  switchMap(load),
  catchError(() => EMPTY)
);
```

Ask whether failure should be a value, an error, a retry, or a fatal terminal
event. `tap({ error })` observes a failure; it does not recover it.

## Review retry as repeated side effects

`retry` resubscribes. Verify idempotency, a finite count, delay/backoff,
cancellation during delay, and whether partial successful values reset the
budget. Flag unbounded retry on permanent synchronous failure and retries of
non-idempotent writes without a duplication strategy.

## Review joins and Promise conversion

- `forkJoin` needs every input to complete and may emit nothing if an input
  completes without a value.
- `combineLatest` needs an initial value from each required input.
- `withLatestFrom` is driven only by the primary source.
- `firstValueFrom` can remain pending on a silent non-completing source.
- `lastValueFrom` can remain pending on any non-completing source.

Require filters, `take`, timeouts, cancellation ownership, or intrinsically
finite sources when they are needed to make settlement deterministic.

## Check error delivery

Every terminal subscription needs an intentional error boundary. Custom
operators must catch errors thrown by user callbacks and send them through the
output error channel. Errors thrown from observer callbacks are a different
host-reporting concern and should not be described as source errors.
