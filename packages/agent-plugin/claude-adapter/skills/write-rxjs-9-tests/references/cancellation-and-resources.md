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

## Owner abort with subscription marbles

`expectObservable` accepts subscription marbles. Its `!` is the owner-abort
frame, and `expectSubscriptions` proves when that abort closes the platform
producer:

```ts
await rxTest(({ observable, expectObservable, expectSubscriptions }) => {
  const sourceMarbles = '       -a-b-c-d-|';
  const ownerWindow = '         ^----!';
  const expected = '            -a-b-';
  const producerWindow = '      ^----!';
  const source = observable(sourceMarbles);

  expectObservable(source, ownerWindow).toBe(expected);
  expectSubscriptions(source.subscriptions).toBe(producerWindow);
});
```

The unsubscription frame is exclusive, so `c` at that frame is not delivered.
No completion is expected because owner cancellation is not a completion
notification. For overlapping observers, use two observation windows and
assert that aborting the first does not end the producer while the second is
still attached; the final observer's `!` closes it.

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

When a feature exposes a readonly `[command, observable]` factory tuple, test
it through those two capabilities just as a class is tested through its public
method and Observable view. Create two instances to prove their private
Subjects and lifetimes do not cross.
