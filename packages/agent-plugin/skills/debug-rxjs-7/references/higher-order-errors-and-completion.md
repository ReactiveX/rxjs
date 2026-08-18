# Higher-order, errors, and completion

## Translate policy into events

- `concatMap` queues new work until the active inner completes.
- `mergeMap` intentionally overlaps work; label every inner and inspect
  interleaving and the concurrency bound.
- `exhaustMap` drops inputs while an inner is active.
- `switchMap` unsubscribes the previous inner when a new input arrives.

Log outer input, projection, inner subscription, every notification, explicit
inner unsubscribe, and the underlying abort/cancel call. A state-changing
delete can complete on the server after `switchMap` stopped observing it,
leaving the client view stale. Prefer `concatMap` when every result matters,
`mergeMap` for deliberate parallelism, `exhaustMap` for “ignore while busy,”
and `switchMap` for replaceable reads or streaming processes.

## Recovery scope

Probe both sides of `catchError`. Recovery inside a higher-order projection
usually keeps the outer interaction alive; recovery outside replaces the whole
chain. A fallback such as `EMPTY` emits nothing and completes, which can look
like a randomly dead UI.

Count producer activations around `retry` and `repeat`. Look for synchronous
permanent-failure loops, repeated non-idempotent side effects, cancellation
during delay, and retry budgets that reset after a successful value.

## Completion dependencies

For a stream that never finishes, identify every completion prerequisite:
queued inners, `concat` inputs, `forkJoin` members, `toArray`, `reduce`,
`lastValueFrom`, windows/groups, Subjects, and notifiers. A quiet Subject is
still active.

Separate source errors, projector/custom-operator errors, observer callback
errors, teardown errors, and errors after closure. Those boundaries have
different recovery behavior and should not be collapsed into one “stream
failed” diagnosis.
