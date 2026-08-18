# Lifecycle decisions

The most important migration question is not “which operator replaces this?”
It is “who creates and shares the producer after migration?” Start from the
RxJS 7 contract: an ordinary RxJS 7 Observable maps one-to-one to
`ColdObservable` unless evidence justifies a platform promotion.

## Platform shared active producer

Promote to a platform Observable when concurrent observers should share one
active producer:

- first observer starts work;
- later concurrent observers join from their subscription time;
- one observer leaving does not stop work while another remains;
- the final observer leaving closes work; and
- a later observer starts a new run.

Characterize two overlapping observers, a late join, partial cancellation,
final cancellation, and restart. Do not call this permanently hot or cold;
state each property.

Two strong promotion candidates are:

- RxJS 7 code already using `share`, `shareReplay`, `publish`, `multicast`,
  `refCount`, `connect`, or `connectable`, after its connector, replay, reset,
  and ref-count behavior is shown to fit the platform lifecycle; and
- a repository-wide proof that the unit can have only one subscriber at a
  time. With one observer there is no concurrent sharing difference, but the
  proof must include framework/template subscriptions, helpers, retries,
  exported values, and indirect consumers—not only `.subscribe()` calls in
  one file.

## Producer per direct subscription

Use `ColdObservable` by default for migrated ordinary RxJS 7 sources. This
preserves one producer run per direct `subscribe()` without first requiring a
whole-repository topology proof. Verify duplicated effects, one controller or
resource per subscriber, independent errors, and teardown where those claims
matter.

Exact Symbol results preserve the cold construction policy at runtime. Native
string methods on a cold value cross back to platform lifecycle. Public types
do not encode this runtime distinction, so the contract and tests must.

## Subject-hot producer

Every instantiated Subject is hot: the producer exists before observers.
Choose the exact Subject API by live fanout, current value, replay history, or
final-value-on-completion behavior. Record retained size/age, write authority,
terminal state, and late direct observers.

`PerSubscriptionSubjectBase` performs observer-local setup but remains a hot
Subject. Do not use it as a general substitute for a cold source.

## Decision questions

1. Does a second concurrent observer duplicate the underlying effect today?
2. Is duplication required, tolerated, or a bug?
3. Does a late observer receive past/current values or only future values?
4. Who cancels work, and what happens when only one observer leaves?
5. May work restart after all observers leave or after terminal state?
6. Is observer-specific mutable state stored inside the producer?
7. Do retries/repeats create independent producer runs?
8. Does a framework or public API expose lifecycle assumptions to callers?

If platform promotion cannot be proved, retain the cold default. Use
`unresolved` only when the RxJS 7 behavior itself, a Subject contract, or an
intentional divergence cannot be established safely.

## Common wrong migrations

- Replacing every RxJS 7 Observable with platform Observable silently shares
  work that was producer-per-subscription.
- Removing an existing RxJS 7 sharing boundary merely because the source is
  now `ColdObservable` can duplicate work callers intentionally shared.
- Adding `[shareReplay]` to a platform Observable assumes per-late-observer
  replay that the shared platform initializer cannot provide.
- Calling a Subject “cold” because it has per-subscriber setup confuses
  observer delivery with producer creation.
