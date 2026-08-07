# RxJS 7 review model

## Subscription tree

A terminal `subscribe` creates the parent execution. Operator setup is pulled
upstream; `next`, `error`, and `complete` push downstream. Higher-order,
notifier, combination, retry, repeat, and recovery operators own child
subscriptions. Review every branch recursively for lifetime, terminal state,
teardown, concurrency, reentrancy, retained closures, and tests.

## Concurrency choices

- `switchMap`: replace/cancel previous work.
- `concatMap`: queue and preserve order; ensure the backlog and inner duration
  are bounded.
- `mergeMap`: parallel work; bound concurrency for high-rate or expensive
  inputs.
- `exhaustMap`: ignore triggers while busy; verify ignored triggers are safe.

## Teardown and retention

Manual subscriptions need an owner. Completion-gated operators are not owner
lifecycle boundaries when a source may go quiet. Inspect `share`/`shareReplay`
reset and retention policy, long-lived Subject observers, event handlers,
large callback closures, and conversions that wait forever.

Custom sources must return/register teardown, stop after terminal state, check
closed state during expensive synchronous work, and route setup/callback errors
appropriately. Constructor callbacks are synchronous, not `async`.
