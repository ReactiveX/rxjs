# RxJS 7 review workflow

## Establish the contract

Confirm the package is actually RxJS 7.8.x and identify framework lifecycle,
test runner, public API constraints, and whether the change is maintenance or
preparation for a later migration. Do not import RxJS 9 rules into this review.

For each affected pipeline, write a compact model:

- source and producer;
- values and ordering;
- subscription owner;
- concurrency and buffering;
- error and completion meaning;
- explicit-unsubscribe path;
- sharing, replay, and retained state; and
- tests that demonstrate those claims.

## Trace in both directions

Subscription setup travels upstream from a terminal consumer. Notifications
travel downstream. A higher-order operator, notifier, combination, retry,
repeat, or recovery branch adds child subscriptions to the tree. Inspect every
branch rather than following only the visually dominant source.

Ask what happens under:

1. ordinary values;
2. source error;
3. source completion;
4. explicit owner unsubscription;
5. synchronous emission during setup;
6. downstream reentrancy; and
7. a slow or never-completing child.

## Classify findings precisely

- **Confirmed bug:** the code violates a stated requirement in a reachable
  scenario.
- **Risk:** the code depends on an unstated assumption and the scenario is
  plausible, but evidence is incomplete.
- **Design tradeoff:** behavior is intentional but carries a cost the owner
  should see.
- **Readability:** behavior appears correct, but policy is needlessly hard to
  verify or change.

Do not inflate style into correctness. Do not call `switchMap`, Subjects, or
`shareReplay` inherently bad; show the specific cancellation, authority,
retention, or reset mismatch.

## Finding format

An actionable finding contains:

1. file and narrow line span;
2. scenario that triggers the issue;
3. actual behavior and user/resource impact;
4. requirement or evidence it contradicts;
5. smallest behavior-preserving correction; and
6. test that should prevent regression.

Example:

> `save-controller.ts:42` — A second save arrives before the first completes.
> `switchMap` unsubscribes the first write, so the server may commit it while
> the client drops its result and error. Queue saves with `concatMap` (or state
> explicitly that replacement is safe) and add a test with overlapping save
> windows.

Avoid vague findings such as “nested subscription is an anti-pattern.” Explain
the detached lifetime, error, ordering, or stale-result behavior it creates in
this code.
