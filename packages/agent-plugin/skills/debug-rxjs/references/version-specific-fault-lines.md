# Version-specific fault lines

## RxJS 7

Check:

- cold producer-per-subscription assumptions;
- Subscription parent/child ownership and manual nested subscribes;
- pipeable operator imports and scheduler arguments;
- `share`/`shareReplay` reset and retention;
- broad `ObservableInput`/subscribable interop;
- `firstValueFrom`/`lastValueFrom` settlement; and
- returned/registered teardown from custom sources.

Do not apply RxJS 9 active-producer sharing or platform Subscribe return rules.

## RxJS 9

Check:

- selected native/fallback platform constructor;
- platform active producer versus `ColdObservable` direct production;
- exact imported Symbol identity and string-method distinction;
- `[create]` receiver lifecycle preservation;
- AbortSignal ownership and `subscriber.addTeardown`;
- platform ObservableValue input categories;
- platform late-observer behavior and Subject direct-subscription hooks; and
- host timers/microtasks rather than general scheduler APIs.

## Cross-version symptoms

The same visible symptom can have different causes. Duplicate HTTP work might
be two RxJS 7 cold subscriptions, two RxJS 9 `ColdObservable` subscriptions,
two separate platform Observable instances, or a retry. Missing late values
might be a hot Subject, platform late join, reset share, or early cancellation.
Confirm the actual version and constructor before choosing a hypothesis.
