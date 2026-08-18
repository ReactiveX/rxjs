# RxJS 7 operator concurrency

Use this reference whenever an outer value starts inner work.

## Decide from the second input

Start with `concatMap`: sequential work is the safest default and usually the
easiest behavior to reason about. Move away from it only when the product
requirement answers: “What must happen if another input arrives before the
current inner work finishes?”

| Required behavior                 | Operator     | Primary risk                            |
| --------------------------------- | ------------ | --------------------------------------- |
| Queue every inner in order        | `concatMap`  | Unbounded queue or non-completing inner |
| Run inners concurrently           | `mergeMap`   | Resource saturation and reordering      |
| Ignore new inputs while busy      | `exhaustMap` | Drops required state changes            |
| Replace/cancel the previous inner | `switchMap`  | Cancels work that may matter            |

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

For example, if an endpoint deletes a record and its success response drives a
view update, `switchMap` can unsubscribe from an earlier deletion response.
The server may delete both records while the client applies only the newest
success, leaving the view out of sync.

## Queue ordered work

```ts
const saved$ = changes$.pipe(concatMap((change) => api.save(change)));
```

This preserves order only while every inner eventually completes. If the
source can outrun the sink, specify a product-level queue bound or rejection
policy; `concatMap` does not make an infinite backlog safe.

## Use `mergeMap` for intentional parallelization

```ts
const uploaded$ = files$.pipe(mergeMap((file) => upload(file), 4));
```

Unbounded `mergeMap` is appropriate only when the input cardinality and inner
cost are trivially bounded. Completion waits for the outer source and all
required active inners.

## Use `exhaustMap` as an action lock

```ts
const submissions$ = submitClicks$.pipe(exhaustMap(() => submitForm()));
```

An ecommerce “Place order” button is the canonical shape: ignore further
clicks until the current order attempt settles. Use this only when ignored
actions are truly duplicates. Do not use it for required state changes.

## Use `switchMap` for deliberate switching

`switchMap` is ideal when a newer source makes the old observation irrelevant:

- switching between long-lived streaming sources;
- discarding in-flight read-only results such as stale searches; and
- starting and stopping reactive processes.

It is tricky precisely because unsubscription can discard the result or error
of work that the underlying system still performs. Do not use it for writes by
default.

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
