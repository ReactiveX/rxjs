---
name: write-rxjs-7-tests
description: Write or improve RxJS 7.8.x tests with TestScheduler.run marbles, subscription-window assertions, Subject-driven unit tests, resource teardown spies, synchronous reentrancy and feedback-machine cases, fake timers, and bounded async tests. Use only for RxJS 7 behavior or maintenance; do not use @rxjs/test or RxJS 9 platform source semantics.
---

# Write RxJS 7 tests

Choose the smallest test style that proves the behavior, not the most compact
diagram.

```ts
const scheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

scheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
  const sourceMarbles = '       -a-b-c-|';
  const expectedMarbles = '     -a-b-c-|';
  const sourceSubscriptions = ' ^------!';
  const source = cold(sourceMarbles);

  expectObservable(source).toBe(expectedMarbles);
  expectSubscriptions(source.subscriptions).toBe(sourceSubscriptions);
});
```

Declare every marble string together at the top of the test and use ignored
leading spaces to align the timeline characters vertically in a fixed-width
editor.

Use this workflow:

1. State values, timing, error/completion, subscription lifetime, and resource
   behavior the test must prove.
2. Use `TestScheduler.run` when virtual notification time or subscription
   windows are the contract.
3. Use direct/Subject tests when imperative state, reentrancy, observer errors,
   or resource ownership is clearer without marbles.
4. Use framework fake timers or bounded real async only for host behavior the
   RxJS TestScheduler does not represent honestly.
5. Cover source error, completion, explicit unsubscribe, user callback throw,
   and teardown separately for custom sources/operators.
6. Keep cold and hot source semantics honest. Add
   `expectSubscriptions` whenever cancellation, sharing, retry, or leaks are
   under test.

## Load references by test shape

- Use [strategy and style selection](references/strategy-and-style-selection.md)
  to choose marbles, direct tests, fake timers, or async.
- Use [marbles and subscription windows](references/marbles-and-subscriptions.md)
  for syntax, alignment, value maps, errors, higher-order streams, and
  cancellation.
- Use [concurrency, sharing, and errors](references/concurrency-sharing-and-errors.md)
  for flattening, retry/recovery, Subjects, and multicasting.
- Use [resources and custom operators](references/resources-and-custom-operators.md)
  for teardown, callback errors, synchronous sources, and reentrancy.
- Use [synchronous feedback machines](references/synchronous-feedback-machines.md)
  for nested notification order, subscribe-before-prime behavior, side-effect
  reentry, and Subject terminal controls.
- Use [fake timers and async boundaries](references/fake-timers-and-async.md)
  for Promise, DOM, animation, and framework timing.
- Use [good and bad tests](references/good-and-bad-tests.md) during test review.

Hand production changes to `write-rxjs-7` and behavior diagnosis to
`debug-rxjs-7`.
