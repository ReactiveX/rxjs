# Good and bad RxJS 7 tests

## Values plus lifetime

```ts
// Good when cancellation is the behavior.
expectObservable(result, '^---!').toBe('--a-');
expectSubscriptions(source.subscriptions).toBe('^---!');
```

```ts
// Bad: values alone cannot show whether the source leaked after observation.
expectObservable(result, '^---!').toBe('--a-');
```

## Focused diagrams

```ts
// Good: one scenario, named values, aligned timelines.
const source = '  -a-b-|';
const expected = '-x-y-|';
expectObservable(cold(source, values).pipe(map(toOutput))).toBe(expected, outputs);
```

```ts
// Bad: dense single-character values and unrelated policies make failure hard
// to diagnose.
expectObservable(complex).toBe('ab-(cde)-#', { a: hugeA, b: hugeB, c: hugeC });
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
const input = cold('-a-b-|');
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
