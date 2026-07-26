# Examples

## Framework-preserving synchronous case

Before:

```ts
it('accumulates values', () => {
  scheduler.run(({ cold, expectObservable }) => {
    const source = cold('-a-b-c-|', { a: 1, b: 2, c: 3 });
    expectObservable(source.pipe(scan((sum, value) => sum + value, 0))).toBe('-a-b-c-|', { a: 1, b: 3, c: 6 });
  });
});
```

After:

```ts
it('accumulates values', () =>
  rxTest(({ cold, expectObservable }) => {
    const source = cold('-a-b-c-|', { a: 1, b: 2, c: 3 });
    expectObservable(source[scan]((sum, value) => sum + value, 0)).toBe('-a-b-c-|', { a: 1, b: 3, c: 6 });
  }));
```

The outer test API is unchanged.

## Unified operator

Before:

```ts
it('buffers three values', () =>
  scheduler.run(({ cold, expectObservable }) => {
    const source = cold('-a-b-c-d-|');
    expectObservable(source.pipe(bufferCount(3))).toBe('------x---(y|)', {
      x: ['a', 'b', 'c'],
      y: ['d'],
    });
  }));
```

After:

```ts
it('buffers three values', () =>
  rxTest(({ cold, expectObservable }) => {
    const source = cold('-a-b-c-d-|');
    expectObservable(source[buffer]({ maxSize: 3 })).toBe('------x---(y|)', {
      x: ['a', 'b', 'c'],
      y: ['d'],
    });
  }));
```

Record this as `bufferCount → buffer`, not as a missing `bufferCount` Symbol.
Keep `bufferCount(size, startBufferEvery)` cases separately because overlapping
buffers are not represented by this adapter.

## Asynchronous flush

Before:

```ts
test('observes an intermediate state', () => {
  scheduler.run(({ cold, expectObservable, flush }) => {
    const source = cold('---a|');
    expectObservable(source).toBe('---a|');
    flush();
    expect(seen).toBe(true);
  });
});
```

After:

```ts
test('observes an intermediate state', () =>
  rxTest(async ({ cold, expectObservable, flush }) => {
    const source = cold('---a|');
    expectObservable(source).toBe('---a|');
    await flush();
    expect(seen).toBe(true);
  }));
```

## Cold baseline and platform addition

```ts
it('keeps RxJS 7 producer-per-subscription behavior', () =>
  rxTest(({ cold, expectObservable, expectSubscriptions }) => {
    const source = cold('--a--b--|');
    expectObservable(source).toBe('--a--b--|');
    expectObservable(source, '---^').toBe('-----a--b--|');
    expectSubscriptions(source.subscriptions).toBe(['^-------!', '---^-------!']);
  }));

it('shares one active platform producer', () =>
  rxTest(({ observable, expectObservable, expectSubscriptions }) => {
    const source = observable('--a--b--|');
    expectObservable(source).toBe('--a--b--|');
    expectObservable(source, '---^').toBe('-----b--|');
    expectSubscriptions(source.subscriptions).toBe('^-------!');
  }));
```

Run the platform case unchanged in polyfill and native realms.

## Missing operator

When `windowCount` is unavailable, retain the converted claim in the project's
pending representation and report:

```md
| windowCount groups fixed-size windows | compatibility-only | missing-api |
```

Do not substitute a different operator, add a local implementation, or remove
the case.
