# Good and bad RxJS 7 tests

## Values plus lifetime

```ts
// Good when cancellation is the behavior.
const ownerWindow = '        ^---!';
const expectedMarbles = '    --a-';
const sourceSubscriptions = '^---!';

expectObservable(result, ownerWindow).toBe(expectedMarbles);
expectSubscriptions(source.subscriptions).toBe(sourceSubscriptions);
```

```ts
// Bad: values alone cannot show whether the source leaked after observation.
const ownerWindow = '     ^---!';
const expectedMarbles = ' --a-';
expectObservable(result, ownerWindow).toBe(expectedMarbles);
```

## Focused diagrams

```ts
// Good: one scenario, named values, aligned timelines.
const sourceMarbles = '    -a-b-|';
const expectedMarbles = '  -x-y-|';
const source = cold(sourceMarbles, values);
expectObservable(source.pipe(map(toOutput))).toBe(expectedMarbles, outputs);
```

```ts
// Bad: dense single-character values and unrelated policies make failure hard
// to diagnose.
const denseExpected = 'ab-(cde)-#';
expectObservable(complex).toBe(denseExpected, { a: hugeA, b: hugeB, c: hugeC });
```

## Production source model

```ts
// Good: Subject-driven test for a hot service boundary.
const input = new Subject<Event>();
const result = service.connect(input);
```

```ts
// Bad: replacing the hot boundary with cold() solely for concise marbles can
// hide late-subscriber and shared-state behavior.
const inputMarbles = '-a-b-|';
const input = cold(inputMarbles);
```

## Resource proof

```ts
// Good: assert the listener/resource is released.
subscription.unsubscribe();
expect(removeListener).toHaveBeenCalledWith(handler);
```

```ts
// Bad: stopping value collection does not prove cleanup.
subscription.unsubscribe();
expect(values).toEqual([1, 2]);
```
