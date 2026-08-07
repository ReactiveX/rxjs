# Debugging examples

## Search stops after one failure

Symptom: later queries do nothing.

Experiment: log outer query emissions, inner failure, recovery output, and
outer completion. If `catchError` is outside the higher-order operator, the
fallback likely completes the entire interaction. Move recovery inside only if
each request is independently recoverable.

## Save sometimes disappears

Symptom: a quick second save loses the first result/error.

Experiment: invert request completion order and record cancellation. If
`switchMap` cancels the first observation, queue by default with `concatMap`
(RxJS 7) or platform `.flatMap()` (RxJS 9). Use `mergeMap` only for intentional
parallelization. For delete-then-update-view flows, verify whether the server
completed a deletion whose success the client discarded; that produces a
client/server mismatch rather than merely a missing notification.

## Values correct, server still overloaded

Symptom: UI shows only latest result but network panel shows every request.

Experiment: inspect underlying request AbortSignals. Replacement is detaching
old observers while Promise/request work continues. Wire cancellation to the
resource or use an API that accepts a signal.

## Late component lacks current state

Symptom: second component renders empty until the next event.

Experiment: identify source type and subscription time. A platform Observable
late observer joins from now; an RxJS 9 `[shareReplay]` wrapper cannot force an
already active platform initializer to replay per observer. Choose an
intentional current-state API if the requirement is retained state.

## Leak after repeated mount/unmount

Symptom: listener and heap count grow each cycle.

Experiment: spy on add/remove, subscription/abort, and producer activation.
Find whether the owner never disposes, one child is detached, or replay retains
the owner graph. Add a cycle regression test before changing sharing policy.
