# Testing synchronous feedback machines in RxJS 9

Use an ordinary synchronous test when the contract is call-stack order rather
than virtual time. Record entry and exit separately so the assertion proves
actual reentrancy:

```ts
it('documents synchronous feedback and completion order', () => {
  const input = new Subject<number>();
  const owner = new AbortController();
  const events: string[] = [];

  input
    .asObservable()
    .map((value) => value + 1)
    .subscribe(
      {
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
      },
      { signal: owner.signal }
    );

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
- sequential cycles finish in order and replacement cycles abort only when
  that policy is intended;
- `Subject.complete()` closes cleanly after accepted work;
- `Subject.error(error)` reaches the error path and cancels active work; and
- owner abort stops this observation and upstream work without being mistaken
  for Subject completion.

Keep platform `.toArray()` on the finite inner Observable and flatten its
Promise result. Add a regression case that would wait forever if collection
were moved to the Subject-rooted machine.
