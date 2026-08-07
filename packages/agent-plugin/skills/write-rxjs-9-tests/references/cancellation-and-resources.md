# Testing cancellation and resources in RxJS 9

## Owner abort

Directly test that the owner signal closes observation and reaches the actual
resource:

```ts
it('aborts the resource with its owner', () => {
  const events: string[] = [];
  const source = new Observable<number>((subscriber) => {
    subscriber.addTeardown(() => events.push('teardown'));
  });
  const controller = new AbortController();

  source.subscribe(
    { complete: () => events.push('complete') },
    {
      signal: controller.signal,
    }
  );
  controller.abort('disposed');

  expect(events).toEqual(['teardown']);
});
```

Cancellation does not emit completion.

## Shared platform producer

For a platform source, test two overlapping observers. Abort one and assert the
producer remains. Abort the final observer and assert exactly one teardown.
Subscribe later and assert a fresh activation and fresh teardown.

`observable()` subscription logs make active producer windows visible; a
custom resource spy proves the underlying effect.

## Terminal order and reentrancy

On error/completion, platform Subscriber teardown occurs before terminal
observer callbacks. Record an event list and have the terminal callback inspect
or reenter the source:

```ts
expect(events).toEqual(['resource closed', 'observer complete']);
```

Test `ColdObservable` separately when teardown collection order matters; it
uses a different compatibility Subscriber.

## Late asynchronous work

After abort, settle the fake Promise/callback and assert no notification. If
the resource accepts a signal, assert that signal is aborted; suppression of a
late value alone does not prove resource cancellation.

## Custom source paths

Cover setup throw, `next`, error, completion, owner abort, final-observer
remove, later restart, `addTeardown` after closure, idempotence, and synchronous
registration/removal races.
