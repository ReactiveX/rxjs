# Errors, retry, and completion in RxJS 7

Treat `next`, `error`, and `complete` as three distinct protocol signals.
`error` and `complete` are terminal; a subscription receives at most one of
them. Unsubscription is also terminal for the subscription, but it is not a
notification sent to the observer.

## Put recovery at the boundary that can recover

Recover inside a higher-order operator when one failed request should not kill
the long-lived interaction:

```ts
const results$ = searchTerms$.pipe(
  switchMap((term) =>
    api.search(term).pipe(
      map((items) => ({ kind: 'loaded' as const, items })),
      catchError((error) => of({ kind: 'failed' as const, error: toDisplayError(error) }))
    )
  )
);
```

Avoid recovering outside unless ending the whole interaction is intentional:

```ts
// Bad for a persistent search box: the first failed request replaces the
// entire search stream with one fallback value, then completes it.
const results$ = searchTerms$.pipe(
  switchMap((term) => api.search(term)),
  catchError(() => of([]))
);
```

Do not turn every error into a value. Preserve the error channel when callers
need to distinguish failure from an ordinary result.

## Retry means resubscribe

`retry` does not continue the failed execution. It creates a new subscription
to its source. Check what resubscription repeats: reading a file can be safe;
charging a card usually is not unless the operation has an idempotency key.

```ts
const config$ = defer(() => http.get<Config>('/config')).pipe(retry({ count: 2, delay: (_error, retryIndex) => timer(retryIndex * 250) }));
```

Avoid unbounded retry and hidden immediate retry loops:

```ts
// Bad: a permanent synchronous failure can spin forever and callers never
// learn that the operation failed.
const config$ = defer(readConfig).pipe(retry());
```

For writes, state the idempotency and duplication policy next to the retry.
Use `retryWhen` only when its notification-stream semantics are actually
needed; prefer the bounded `retry` configuration for ordinary backoff.

## Completion is part of combination semantics

- `concat` and `concatMap` wait for completion before advancing.
- `forkJoin` emits only after every input completes, and only if every input
  produced a value.
- `lastValueFrom` cannot settle until the source completes.
- `repeat` resubscribes after completion, just as `retry` resubscribes after an
  error.
- A long-lived source inside `forkJoin` or `lastValueFrom` can make the result
  wait forever.

Bound a long-lived source explicitly:

```ts
const initialState = await firstValueFrom(state$.pipe(filter(isReadyState), timeout({ first: 5_000 })));
```

Avoid ambiguous conversions:

```ts
// Bad: if state$ never emits or completes, this Promise never settles and can
// retain the surrounding async function state.
const state = await firstValueFrom(state$);
```

Use `firstValueFrom` when the first qualifying value is the contract. Use
`lastValueFrom` only when completion and the final value are meaningful. Add a
filter, `take`, timeout, cancellation boundary, or another explicit bound when
the source is not intrinsically finite.

## Never hide failures in side effects

Every terminal subscription needs an error policy owned by that boundary.
Prefer keeping error handling in the composed stream so the result remains
testable. If a terminal boundary logs or reports an error, make that policy
explicit:

```ts
const subscription = job$.subscribe({
  next: renderJob,
  error: reportFatalJobError,
});
```

`tap` observes notifications; it does not recover from them. `finalize` runs
for completion, error, and explicit unsubscription, so use it for symmetric
cleanup or instrumentation rather than as an error handler.
