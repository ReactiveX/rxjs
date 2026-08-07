# Good and bad RxJS 9 tests

## Select the right source model

```ts
// Good: platform active-producer sharing is the behavior under test.
const sourceMarbles = '         --a--|';
const firstWindow = '           ^-----!';
const secondWindow = '          -^----!';
const expectedForBoth = '       --a--|';
const sharedProducer = '        ^----!';
const source = observable(sourceMarbles);

expectObservable(source, firstWindow).toBe(expectedForBoth);
expectObservable(source, secondWindow).toBe(expectedForBoth);
expectSubscriptions(source.subscriptions).toBe(sharedProducer);
```

```ts
// Also good: producer-per-subscription behavior is the contract under test.
const sourceMarbles = '         --a--|';
const firstWindow = '           ^------!';
const secondWindow = '          -^------!';
const firstExpected = '         --a--|';
const secondExpected = '        ---a--|';
const producerWindows = ['      ^----!', ' -^----!'];
const source = cold(sourceMarbles);

expectObservable(source, firstWindow).toBe(firstExpected);
expectObservable(source, secondWindow).toBe(secondExpected);
expectSubscriptions(source.subscriptions).toBe(producerWindows);
```

`cold()` is not bad, and `observable()` is not universally better. The bad
test is one whose helper models a different lifecycle than production. Keep
the diagram strings in a fixed-width column so source, observer windows,
expected notifications, and producer windows can be scanned vertically.

## Await the harness

```ts
// Good: failures and realm restoration are observed by the test runner.
await rxTest(({ cold, expectObservable }) => {
  const sourceMarbles = '   a|';
  const expectedMarbles = ' a|';
  const source = cold(sourceMarbles);
  expectObservable(source).toBe(expectedMarbles);
});
```

```ts
// Bad: an unawaited Promise can escape the test lifecycle.
rxTest(({ cold, expectObservable }) => {
  const sourceMarbles = '   a|';
  const expectedMarbles = ' a|';
  const source = cold(sourceMarbles);
  expectObservable(source).toBe(expectedMarbles);
});
```

## Assert producer windows

```ts
// Good when restart is the claim.
const producerWindows = ['^--!', '-----^----!'];
expectSubscriptions(source.subscriptions).toBe(producerWindows);
```

```ts
// Bad: two delivered values do not show whether one producer restarted or two
// independent producers existed.
expect(values).toEqual(['a', 'a']);
```

## Test the resource

```ts
// Good: proves owner abort reaches underlying work.
controller.abort();
expect(resourceSignal.aborted).toBe(true);
expect(teardowns).toBe(1);
```

```ts
// Bad: no further values only proves observation stopped.
controller.abort();
expect(values).toEqual(beforeAbort);
```

## Test the production invocation contract

```ts
// Good when production uses the platform method.
expectObservable(source.map(project)).toBe(expected);
```

```ts
// Bad: a local stand-in proves neither the platform method nor a packaged
// exact-Symbol extension.
const result = fakeMap(source, project);
```

When production requires an exact Symbol, import that public subpath and call
the exact key. Add both platform and Symbol cases only when the code claims to
support both contracts; do not duplicate tests by reflex.

## Test the domain contract, not RxJS's operator

Application tests should not re-prove that `flatMap`, `mergeMap`, `exhaustMap`,
or `switchMap` implements its documented contract. Drive the public API and
assert the behavior the application owns:

- issue two rapid delete commands whose responses settle at controlled times;
  assert every successful deletion is reflected in the view state;
- click “Place order” twice while the first request is active; assert the
  application starts one order, then accepts a later click after settlement;
- start two searches with the older response delayed; assert stale data never
  renders and, when promised, the underlying request is aborted; and
- for an API that promises parallel processing, assert its application-level
  concurrency limit and output-order contract.

Use subscription marbles or resource spies only when they provide evidence for
that public contract. For a custom operator, test the operator's documented
values, terminal behavior, cancellation, and receiver lifecycle—not generic
RxJS flattening behavior it merely delegates to.
