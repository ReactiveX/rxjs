# Missing, duplicate, and stale values

## Missing values

Check:

- filter/predicate and distinct comparator;
- subscription began after a hot/shared value;
- `combineLatest`/`withLatestFrom` readiness;
- replacement/ignore policy canceled or dropped the value;
- early `take`/notifier/owner cancellation;
- outer recovery completed the interaction;
- Subject already terminated; and
- platform late observer joined after the value.

Instrument the last upstream point where the value exists and first downstream
point where it does not.

## Duplicate values or effects

Separate duplicate notifications from duplicate producer work. Count producer
activations, retry/repeat runs, framework resubscriptions, and physical package
copies. In RxJS 7 cold sources, two subscriptions normally duplicate work. In
RxJS 9 platform sources, concurrent observers should share one active producer;
`ColdObservable` duplicates per direct subscription.

Do not add `distinctUntilChanged` to hide duplicated side effects upstream.

## Stale values

Look for:

- `mergeMap` overlap when latest-only was required;
- response ordering with uncancelable Promises;
- replay/current state retaining an old object;
- mutable identity suppressing `distinctUntilChanged`;
- stale framework closure; and
- recovery/retry from an old request continuing after owner change.

Reproduce with deliberately inverted completion order. If stale delivery
disappears only when completions are ordered, concurrency/cancellation is the
likely cause.
