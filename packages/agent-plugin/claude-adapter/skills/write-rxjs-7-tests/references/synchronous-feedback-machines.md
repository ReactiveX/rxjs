# Testing synchronous feedback machines in RxJS 7

Use an ordinary synchronous test when the contract is call-stack order rather
than virtual time. Record entry and exit separately so the assertion proves
actual reentrancy:

```ts
it('documents synchronous feedback and completion order', () => {
  const input = new Subject<number>();
  const events: string[] = [];

  input.pipe(map((value) => value + 1)).subscribe({
    next(value) {
      events.push(`enter:${value}`);

      if (value < 2) {
        input.next(value);
      } else {
        input.complete();
      }

      events.push(`exit:${value}`);
    },
    complete: () => events.push('complete'),
  });

  input.next(0); // Prime after subscription.

  expect(events).toEqual(['enter:1', 'enter:2', 'complete', 'exit:2', 'exit:1']);
});
```

For a production feedback machine, also test:

- priming before subscription does nothing, while one post-subscription prime
  starts exactly one cycle;
- the state visible from a reentrant callback is already internally valid;
- a side effect that indirectly feeds the Subject cannot create an accidental
  second tail write;
- sequential cycles finish in order and replacement cycles cancel only when
  that policy is intended;
- `Subject.complete()` closes cleanly after accepted work;
- `Subject.error(error)` reaches the error path and tears down active work; and
- owner unsubscription stops the machine without being mistaken for Subject
  completion.

Keep per-cycle `toArray()` inside the finite inner Observable. Add a regression
case that would hang or emit nothing if collection were moved outside the
Subject-rooted pipeline.
