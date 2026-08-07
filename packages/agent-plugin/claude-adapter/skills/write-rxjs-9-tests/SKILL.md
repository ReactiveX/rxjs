---
name: write-rxjs-9-tests
description: Write RxJS 9 tests with @rxjs/test, explicit cold/hot/platform sources, virtualized host timing, AbortSignal cancellation, native/fallback parity, and exact Symbol APIs. Use for tests targeting RxJS 9.
---

# Write RxJS 9 Tests

Use `rxTest(async ({ cold, hot, observable, expectObservable, ... }) => {})` and
await the test.

- `cold()` creates producer work for each direct subscription.
- `hot()` represents a producer that exists before observers subscribe.
- `observable()` follows the platform shared/ref-counted active producer
  lifecycle.
- Test the lifecycle that production code actually chooses; do not substitute
  `cold()` merely to recover an RxJS 7 expectation.
- Exercise exact imported Symbols and public package paths.
- Assert AbortSignal cancellation, final-observer teardown, restart,
  completion, error, and synchronous reentrancy when relevant.
- Use the same focused contract against native and fallback Observable when a
  platform-layer claim is being made.
- Host timers are virtualized through the realm. Do not restore scheduler
  arguments or a `TestScheduler` runtime surface.

Read [testing patterns](references/testing-patterns.md).
