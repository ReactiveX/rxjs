# RxJS 7 testing strategy

## Marble tests

Create a fresh `TestScheduler` and use `run`. Align diagrams vertically, use
value maps with domain names, and include `expectSubscriptions` whenever
cancellation, sharing, ref counting, retry, repeat, or higher-order inner
lifetimes are part of the claim. Prefer several focused scenarios over one
dense diagram.

## Other styles

Subject-based tests are often clearer for services, components, and stateful
collaborators: push inputs, collect visible output, and close the owned
subscription. Use fake timers or async tests when Promise, DOM, animation
frame, or framework behavior is not represented honestly by TestScheduler.

For custom sources/operators cover success, source error, callback error,
completion, explicit unsubscribe, teardown, reentrancy, and child
subscriptions. A value-only test is insufficient when the implementation owns
resources.
