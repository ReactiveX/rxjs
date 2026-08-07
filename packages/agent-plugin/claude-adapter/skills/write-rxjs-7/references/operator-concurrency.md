# RxJS 7 operator concurrency

Use this reference whenever an outer value starts inner work.

## Decide from the second input

Ask: “What must happen if another input arrives before the current inner work
finishes?”

| Required behavior                 | Operator     | Primary risk                            |
| --------------------------------- | ------------ | --------------------------------------- |
| Replace/cancel the previous inner | `switchMap`  | Cancels work that may matter            |
| Queue every inner in order        | `concatMap`  | Unbounded queue or non-completing inner |
| Run inners concurrently           | `mergeMap`   | Resource saturation and reordering      |
| Ignore new inputs while busy      | `exhaustMap` | Drops required state changes            |

## Replace stale reads

Good when a newer query supersedes an older result:

```ts
const results$ = query$.pipe(
  debounceTime(150),
  distinctUntilChanged(),
  switchMap((query) => api.search(query))
);
```

Bad when every write must complete:

```ts
// A new save cancels the previous subscription.
const saved$ = changes$.pipe(switchMap((change) => api.save(change)));
```

## Queue ordered work

```ts
const saved$ = changes$.pipe(concatMap((change) => api.save(change)));
```

This preserves order only while every inner eventually completes. If the
source can outrun the sink, specify a product-level queue bound or rejection
policy; `concatMap` does not make an infinite backlog safe.

## Bound parallel work

```ts
const uploaded$ = files$.pipe(mergeMap((file) => upload(file), 4));
```

Unbounded `mergeMap` is appropriate only when the input cardinality and inner
cost are trivially bounded. Completion waits for the outer source and all
required active inners.

## Ignore duplicate triggers

```ts
const submissions$ = submitClicks$.pipe(exhaustMap(() => submitForm()));
```

Use this only when ignored clicks are truly duplicates. Do not use it for a
stream of required state changes.

## Scope recovery to the operation

Good: one failed search does not kill future queries.

```ts
const results$ = query$.pipe(switchMap((query) => api.search(query).pipe(catchError((error) => of({ query, error, results: [] })))));
```

Different semantics: the first failure replaces and completes the entire
outer pipeline.

```ts
const results$ = query$.pipe(
  switchMap((query) => api.search(query)),
  catchError(() => of({ results: [] }))
);
```

## ObservableInput caveats

Higher-order callbacks may return Observable, Promise, Iterable,
AsyncIterable, ArrayLike, or other supported RxJS 7 inputs.

```ts
const saved$ = changes$.pipe(
  concatMap(async (change) => {
    const payload = await buildPayload(change);
    return api.save(payload);
  })
);
```

The Promise itself is not canceled when the RxJS inner subscription ends.
Use a custom abortable Observable boundary when cancellation of underlying
work is required.
