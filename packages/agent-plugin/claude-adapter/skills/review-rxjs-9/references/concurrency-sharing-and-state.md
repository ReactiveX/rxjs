# Concurrency, sharing, and state review

## Higher-order behavior

- `[switchMap]`: default latest-only; aborts the oldest active inner at its
  concurrency limit.
- `[mergeMap]`: overlaps up to `concurrent` and buffers the rest; default is
  unbounded active concurrency.
- Queueing: `[mergeMap](project, { concurrent: 1 })`.
- `[exhaustMap]`: accepts up to its concurrency limit and ignores additional
  inputs while busy.

Review resource cancellation, pending-buffer bounds, completion waiting, and
whether projected Promise work is actually cancelable.

Recovery inside a higher-order project preserves a long-lived outer
interaction. Recovery outside replaces it after one failure. `[retry]`
reactivates the source; verify idempotency, finite count, delay, cancellation,
and `resetOnSuccess` behavior.

## Platform sharing and replay limitation

A platform Observable already shares its current active producer. Adding
`[share]` simply to prevent duplicate concurrent activation is suspicious.

Late concurrent platform observers join the already active derived Subscriber.
`[shareReplay]` cannot force that platform initializer to run per late observer,
so do not accept a claim that it transparently replays retained values to every
late concurrent platform observer.

`[share]` can coordinate a `ColdObservable` source across direct subscribers.
Review connector, reset after error/completion/zero ref count, synchronous
reentrancy, and retained values.

## Subjects and state

Every Subject is a hot producer. Review:

- public write authority;
- live versus current/replayed/final-value delivery;
- size and age bounds;
- terminal state for late direct observers;
- reentrant feedback and snapshot fanout; and
- native-method crossings that can bypass an advanced direct-subscription
  hook.

`behaviorSubject` and `replaySubject` perform per-direct-observer retained
delivery. `PerSubscriptionSubjectBase` is an advanced hot Subject base, not a
general cold source.

Prefer state transitions expressed through `[scan]` over scattered synchronous
read-modify-write calls. Review `[distinctUntilChanged]` identity assumptions
and retained object graphs.
