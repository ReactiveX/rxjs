# Symptom experiments

## A value vanishes

Bracket each likely boundary with `.inspect()` or exact `[tap]` while preserving
the lifecycle: predicate, distinct comparison, combination readiness,
higher-order selection, cancellation, recovery, and public consumer. The first
stage that loses the identified value defines the next experiment.

For stale output, deliberately invert completion order. If the symptom follows
the inversion, inspect unintended merge parallelism, uncancelable work after
switching, late platform observers, mutable identity, and stale framework
closures.

## Effects happen twice

Count notifications separately from producer activations. Compare:

1. one versus two overlapping observers on the same platform instance;
2. two separately constructed platform instances;
3. direct `ColdObservable` subscriptions;
4. retry/repeat; and
5. framework remount/recreation.

Do not add a distinct operator downstream to hide duplicate upstream effects.

## The interaction dies after one error

Log outer values, inner error, recovery output, and outer completion. Recovery
outside the higher-order boundary often replaces and completes the whole
interaction. Move it inward only when each operation is independently
recoverable.

## The UI is quiet but work continues

Record observer abort, inner abort, and the underlying resource cancellation.
If only observation ends, cancellation was not wired to the resource.

## A late observer misses state

Subscribe once during an active platform run and once after restart. If the
requirement is current retained state, choose an explicit state/Subject API;
do not debug “join from now” as a broken platform Observable.
