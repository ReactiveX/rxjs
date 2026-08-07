# Lifecycle decisions

The most important migration question is not “which operator replaces this?”
It is “who creates and shares the producer after migration?”

## Platform shared active producer

Choose a platform Observable when concurrent observers should share one active
producer:

- first observer starts work;
- later concurrent observers join from their subscription time;
- one observer leaving does not stop work while another remains;
- the final observer leaving closes work; and
- a later observer starts a new run.

Characterize two overlapping observers, a late join, partial cancellation,
final cancellation, and restart. Do not call this permanently hot or cold;
state each property.

## Producer per direct subscription

Choose `ColdObservable` when every direct `subscribe()` must create independent
work. Verify duplicated effects, one controller/resource per subscriber,
independent errors, and teardown.

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

If tests and owner intent cannot answer, mark the unit `unresolved` and stop.

## Common wrong migrations

- Replacing every RxJS 7 Observable with platform Observable silently shares
  work that was producer-per-subscription.
- Replacing every source with `ColdObservable` duplicates work that callers
  intended to share.
- Adding `[shareReplay]` to a platform Observable assumes per-late-observer
  replay that the shared platform initializer cannot provide.
- Calling a Subject “cold” because it has per-subscriber setup confuses
  observer delivery with producer creation.
