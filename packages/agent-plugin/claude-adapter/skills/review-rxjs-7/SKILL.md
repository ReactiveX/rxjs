---
name: review-rxjs-7
description: Review RxJS 7 code for subscription ownership, higher-order concurrency, teardown, reentrancy, Subjects, multicasting, scheduler use, leaks, promise conversion, performance, and test coverage. Use only for RxJS 7 code or a 7.8.x maintenance review.
---

# Review RxJS 7

Pin runtime guidance to RxJS `7.8.2`. Trace each terminal subscription upstream
through its operator chain and recursively inspect child subscriptions created
by higher-order operators, notifiers, combinations, retries, and other
`ObservableInput` boundaries.

Check first for:

- unowned or nested subscriptions;
- `switchMap` canceling required writes, unbounded `mergeMap`, unbounded
  `concatMap` queues, or `exhaustMap` dropping required state;
- long-lived sources without deterministic teardown;
- reentrant Subject feedback and synchronous producers that ignore
  `subscriber.closed`;
- `share`/`shareReplay` retention, reset, and ref-count policy;
- `firstValueFrom`/`lastValueFrom` without emission/completion bounds;
- custom Observables or operators missing error, completion, child ownership,
  or cleanup paths;
- tests that assert values but not cancellation or subscription windows where
  lifecycle is the behavior.

Do not apply RxJS 9 platform-sharing or AbortSignal rules to RxJS 7 review.
Read the [RxJS 7 review model](references/rxjs-7-review-model.md).
