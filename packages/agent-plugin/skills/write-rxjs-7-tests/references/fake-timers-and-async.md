# Fake timers and async boundaries in RxJS 7 tests

## Know which clock is controlled

RxJS `TestScheduler.run` controls compatible scheduler-based RxJS work. A
framework fake-timer system controls patched host timers according to that
framework. Neither automatically controls every Promise/microtask, DOM event,
animation frame, network response, or third-party scheduler.

Use one timing authority per focused test where possible. If two are required,
document the order of advancing timers and flushing microtasks.

## Avoid sleeping tests

```ts
// Bad: slow and timing-sensitive.
await new Promise((resolve) => setTimeout(resolve, 100));
expect(result).toBe('ready');
```

Inject/control the dependency, use fake timers, or await the observable
contract with a timeout that fails deterministically.

## Promise-backed sources

Test fulfillment, rejection, and unsubscription-before-settlement. Remember
that unsubscription can suppress delivery without canceling the Promise's
underlying work. If the resource is cancelable, assert that its explicit
cancellation API was invoked.

## DOM and framework lifecycles

Create the smallest real or fake event target, mount owner, or request boundary
needed. Assert listener removal or subscription teardown at unmount/disposal,
not just final rendered values.

## Prevent hung tests

Bound `firstValueFrom`/`lastValueFrom` inputs, close Subjects, restore timers in
`finally`/framework cleanup, and fail on unexpected error paths. A test that
waits forever usually reveals an unstated completion contract.
