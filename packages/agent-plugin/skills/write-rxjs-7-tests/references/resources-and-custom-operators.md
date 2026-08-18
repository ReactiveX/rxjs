# Testing resources and custom operators in RxJS 7

## Teardown spy

```ts
it('releases its resource on explicit unsubscribe', () => {
  let releases = 0;
  const source = new Observable<number>((subscriber) => {
    subscriber.next(1);
    return () => releases++;
  });

  const subscription = source.subscribe();
  expect(releases).toBe(0);

  subscription.unsubscribe();
  expect(releases).toBe(1);
  subscription.unsubscribe();
  expect(releases).toBe(1);
});
```

Add separate completion and error cases when release order or path differs.

## Custom operator minimum matrix

Test:

1. ordinary next transformation;
2. source error forwarding;
3. source completion forwarding;
4. explicit downstream unsubscribe releases upstream;
5. user callback throw becomes output error;
6. synchronous source and early termination;
7. downstream reentrancy;
8. per-subscription state isolation; and
9. documented concurrency/buffering/terminal delay.

```ts
it('routes a projector throw through the output error channel', () => {
  const error = new Error('project failed');
  const errors: unknown[] = [];

  of(1)
    .pipe(
      customMap(() => {
        throw error;
      })
    )
    .subscribe({
      error: (value) => errors.push(value),
    });

  expect(errors).toEqual([error]);
});
```

Ensure the test itself would fail if the exception were reported as an
unhandled observer callback error.

## Synchronous closure

Use a loop source with a `subscriber.closed` guard and an early terminal
operator. Assert that avoidable work stops immediately. This catches
implementations that deliver the right values while continuing side effects.

## Reentrancy

Have a downstream handler synchronously trigger the source or subscribe again.
Record event order and resource state. Do not add an async delay solely to make
the test pass; that hides the ordering contract.
