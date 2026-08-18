# Higher-order, errors, and completion

## Translate policy into events

- platform `.flatMap()` is the sequential default: new work waits for the
  active inner to complete;
- `[mergeMap]` intentionally overlaps work; label every inner and inspect its
  concurrency bound;
- `[exhaustMap]` drops input while an inner is active;
- platform `.switchMap()` or `[switchMap]` replaces the observed inner.

Log outer input, projection, inner activation, every notification, abort, and
the underlying resource cancellation. A state-changing delete can finish on
the server after switching stopped observation, leaving the client view stale.
Use sequential behavior when every result matters, merge for intentional
parallelism, exhaust for “ignore while busy,” and switch for replaceable reads,
new streaming sources, or starting/stopping reactive processes.

## Recovery scope

Probe both sides of platform `.catch()` or RxJS `[catchError]`. Recovery inside
a projection can preserve the outer interaction; recovery outside replaces the
whole chain. An empty completing fallback can look like a randomly dead UI.

Count producer activations around retry/repeat. Separate platform active-run
sharing from `ColdObservable` producer-per-subscription behavior. Look for
synchronous permanent-failure loops, repeated non-idempotent effects,
cancellation during delay, and restarts that retain stale state.

## Completion dependencies

For a stream that never finishes, identify every queued inner, combined input,
`forkJoin` member, `[toArray]`/`[reduce]` collection, platform Promise consumer,
window/group, Subject, and notifier that must terminate. A quiet Subject or
never-ending inner is still active.

Separate source, operator callback, observer callback, teardown, abort, and
post-closure errors. Observer callback errors are host-reported and cannot be
recovered upstream.
