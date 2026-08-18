# Concurrency, sharing, and state review

## Higher-order behavior

- Platform `.flatMap()` queues sequentially. Treat it as the safe default.
- `[mergeMap]` is for intentional parallelization; it overlaps up to
  `concurrent` and buffers the rest.
- `[exhaustMap]` locks an action while accepted work is active, such as an
  ecommerce order button.
- Platform `.switchMap()` deliberately replaces stale read-only work, changes
  streaming sources, or starts/stops reactive processes. The exact extension
  adds a newest-N concurrency option.

Flag `.switchMap()` or `[switchMap]` around state-changing work. A server-side
delete can complete after its observation is canceled; if the success response
updates the client view, dropping it leaves client and server out of sync.

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

Recognize a subject-primed feedback machine when a downstream handler writes
back to the Subject and a later `subject.next()` provides the initial seed.
Verify that subscription happens before priming, exactly one path owns the
feedback write, each cycle has a reachable boundary, and Subject `complete`,
Subject `error`, and owner abort have intentionally different meanings. Treat
every side-effecting call between receiving a value and writing the next input
as a possible indirect reentry path.

If the loop collects cycle results, ensure `.toArray()` belongs to each finite
inner cycle. Calling it on the Subject-rooted machine waits for that input to
complete and cannot produce the next feedback value. Review `.switchMap()` or
`[switchMap]()` as deliberate replacement/cancellation policy; prefer platform
`.flatMap()` when every cycle must finish.

A private Subject may live in a class or a closure-backed factory returning a
readonly `[command, observable]` tuple. Both can enforce the same write
authority. Review whether callers need object identity/shared prototype
methods or compact functional composition; report per-instance closure cost
only when profiling shows it matters.

`behaviorSubject` and `replaySubject` perform per-direct-observer retained
delivery. `PerSubscriptionSubjectBase` is an advanced hot Subject base, not a
general cold source.

Prefer state transitions expressed through `[scan]` over scattered synchronous
read-modify-write calls. Review `[distinctUntilChanged]` identity assumptions
and retained object graphs.
