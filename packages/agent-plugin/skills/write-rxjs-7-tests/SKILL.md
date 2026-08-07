---
name: write-rxjs-7-tests
description: Write clear RxJS 7 tests using TestScheduler.run, readable marbles, subject-based unit tests, fake timers, subscription assertions, and teardown checks. Use only for RxJS 7 tests or 7.8.x maintenance.
---

# Write RxJS 7 Tests

Choose the smallest test style that proves visible behavior.

- Use `TestScheduler.run` marbles for custom operators/sources, ordering,
  virtual time, higher-order concurrency, retries, time operators, and
  subscription windows.
- Use Subject-driven tests when imperative stimuli make service or stateful
  behavior clearer.
- Use framework fake timers or ordinary async tests for behavior the RxJS test
  scheduler does not virtualize reliably.
- Align marble diagrams, use domain value maps, and assert subscriptions when
  cancellation, ref counting, sharing, or leaks are the point.
- Cover `next`, `error`, completion, explicit unsubscribe, and teardown as
  separate scenarios when that improves diagnosis.
- Keep hot/cold honest: cold work is created per subscription; a hot producer
  already exists.

Do not use RxJS 9 `@rxjs/test` semantics in an RxJS 7 maintenance test. Read
the [RxJS 7 testing strategy](references/testing-strategy.md).
