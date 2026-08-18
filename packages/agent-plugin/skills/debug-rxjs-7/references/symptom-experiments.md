# Symptom experiments

## A value vanishes

Put one `tap` immediately before and after each likely boundary: predicate,
`distinctUntilChanged`, combination readiness, higher-order operator,
`takeUntil`, recovery, sharing, and public consumer. The first boundary that
loses the identified value defines the next experiment.

For stale output, deliberately invert request completion order. If the symptom
appears only out of order, inspect `mergeMap` overlap, uncancelable work after
`switchMap`, replayed state, mutable identity, and stale framework closures.

## Effects happen twice

Count notifications separately from producer activations. Subscribe once, then
twice; disable retry/repeat; remove the framework remount; and inspect
`share`/`shareReplay` reset. Do not add `distinctUntilChanged` downstream to
hide duplicated upstream effects.

## The interaction dies after one error

Log outer values, inner error, recovery output, and outer completion. An outer
`catchError` with `EMPTY` or another completing fallback often ends the whole
interaction. Move recovery inside only when each inner operation is
independently recoverable.

## The UI is quiet but work continues

Record inner unsubscribe and the resource's actual abort/cancel. If only the
former occurs, RxJS stopped observing the result but did not stop the work.

## Mount/unmount leaks

Spy on add/remove listener, timer creation/clear, request abort, source
activation, and subscription finalization. Run several cycles, wait for
quiescence, and compare counts. Then add a lifecycle regression before changing
the production ownership graph.
