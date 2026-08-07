# Debugging playbook

1. Reduce to one source, one consumer, and the smallest operator group that
   reproduces the issue.
2. Label every producer and subscription with creation, notification,
   cancellation, and teardown timestamps.
3. Draw child subscriptions for projected inputs, notifiers, combinations,
   recovery, retry, and repeat.
4. Test synchronous and delayed variants; many reentrancy bugs disappear when
   only delayed sources are used.
5. Vary a second observer and a later restart. This separates per-subscription,
   shared-active, Subject, and replay behavior.
6. Move error recovery one level at a time and assert which stream terminates.
7. Add the regression test at the public boundary before fixing the code.

For RxJS 7, inspect Subscription ownership and schedulers. For RxJS 9, inspect
AbortSignals, exact Symbols, native/fallback selection, and the platform active
producer. Do not mix those diagnostic models.
