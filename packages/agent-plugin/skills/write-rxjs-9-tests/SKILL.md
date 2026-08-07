---
name: write-rxjs-9-tests
description: Write or improve RxJS 9 tests with @rxjs/test, explicit cold/hot/platform source models, exact Symbol APIs, active-producer and subscription-window assertions, AbortSignal/resource teardown checks, virtual host timers and clocks, synchronous reentrancy cases, and native/fallback parity. Use only for RxJS 9 behavior; do not restore RxJS 7 TestScheduler or scheduler arguments.
---

# Write RxJS 9 tests

Use `await rxTest(...)` and select the production lifecycle explicitly:

```ts
await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
  const source = observable('--a--b--|');

  expectObservable(source).toBe('--a--b--|');
  expectObservable(source, '---^').toBe('-----b--|');
  expectSubscriptions(source.subscriptions).toBe('^-------!');
});
```

Use this workflow:

1. Choose `cold`, `hot`, or `observable` from the real producer lifecycle.
2. Import and exercise exact public Symbols and package paths.
3. Assert values/terminals and producer/observer windows when lifecycle matters.
4. Test owner abort, one-of-many observer abort, final-observer teardown, and
   later restart for platform sources.
5. Use virtual host time for timers, clocks, animation, idle callbacks,
   microtasks, and `AbortSignal.timeout` rather than reintroducing schedulers.
6. Test synchronous setup, user callback errors, teardown-before-terminal
   reentrancy, and receiver lifecycle for custom sources/operators.
7. Run a focused contract against fallback and supported native Observable
   when making a platform claim; do not call a passing unit test WPT proof.

## Load references by test concern

- Use [source models and lifecycle](references/source-models-and-lifecycle.md)
  to choose `cold`, `hot`, or `observable` and assert producer windows.
- Use [marbles and assertions](references/marbles-and-assertions.md) for timing,
  values, errors, subscriptions, equality, and exact messages.
- Use [virtual host time](references/virtual-host-time.md) for timers, clocks,
  animation, idle work, microtasks, and safety bounds.
- Use [cancellation and resources](references/cancellation-and-resources.md) for
  owner signals, final-observer teardown, terminal order, and restarts.
- Use [custom operators and platform parity](references/custom-operators-and-platform-parity.md)
  for exact Symbols, `[create]`, reentrancy, and native/fallback contracts.
- Use [good and bad tests](references/good-and-bad-tests.md) during review.

Hand production code to `write-rxjs-9` and diagnosis to `debug-rxjs`.
