# Good and bad RxJS 9 tests

## Select the right source model

```ts
// Good for platform sharing.
const source = observable('--a--|');
expectObservable(source).toBe('--a--|');
expectObservable(source, '-^').toBe('--a--|');
expectSubscriptions(source.subscriptions).toBe('^----!');
```

```ts
// Bad: cold() creates independent producers and cannot prove sharing.
const source = cold('--a--|');
```

## Await the harness

```ts
// Good: failures and realm restoration are observed by the test runner.
await rxTest(({ cold, expectObservable }) => {
  expectObservable(cold('a|')).toBe('a|');
});
```

```ts
// Bad: an unawaited Promise can escape the test lifecycle.
rxTest(({ cold, expectObservable }) => {
  expectObservable(cold('a|')).toBe('a|');
});
```

## Assert producer windows

```ts
// Good when restart is the claim.
expectSubscriptions(source.subscriptions).toBe(['^--!', '-----^----!']);
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

## Use exact public Symbols

```ts
// Good: exercises the packaged extension contract.
import { map } from 'rxjs/map';
expectObservable(source[map](project)).toBe(expected);
```

```ts
// Bad: a local stand-in can pass without proving the real package import or
// Symbol installation.
const result = fakeMap(source, project);
```
