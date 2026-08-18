# RxJS 7 fundamentals and lifecycle

Use this reference to establish the execution model before choosing operators.

## Observable and subscription model

- An `Observable` is a lazy recipe for connecting a producer to a consumer.
  Creating it does not start work; subscribing does.
- In RxJS 7, each direct subscription normally runs the source setup again.
  Sharing is introduced deliberately with multicasting operators or an
  externally hot producer.
- `subscribe` runs setup synchronously. A source may emit, error, complete, or
  trigger reentrant work before `subscribe` returns.
- A `Subscriber` accepts zero or more `next` notifications and then at most one
  `error` or `complete`. Terminal notification closes that path.
- The returned `Subscription` owns teardown. Explicit unsubscribe, error, and
  completion all finalize registered resources.

```ts
const ticks$ = new Observable<number>((subscriber) => {
  const id = setInterval(() => subscriber.next(Date.now()), 1_000);
  return () => clearInterval(id);
});

const subscription = ticks$.subscribe({
  next: renderTick,
  error: reportFailure,
});

// The lifecycle owner decides when the resource ends.
subscription.unsubscribe();
```

## Subscription tree

Read a pipeline in two directions:

1. A terminal consumer subscribes to the last operator result.
2. Setup travels upstream through operator subscribers to the original source.
3. Operators accepting `ObservableInput` create child subscriptions.
4. Notifications travel downstream from sources and active children.
5. Teardown closes the owned parent/child paths.

This is why nested `subscribe` is usually the wrong composition tool: it
creates a second ownership tree that the outer pipeline cannot cancel, wait
for, or route errors through.

## Hot and cold describe ownership

Do not treat “hot” and “cold” as complete types or value judgments.

- A cold source creates work for each subscription: `defer`, most HTTP
  wrappers, `of`, and a normal `new Observable` source.
- A hot source represents work or events that exist independently: a DOM
  event target, socket, or Subject.
- A shared cold source starts cold work once for the active shared group and
  then multicasts it. Reset/ref-count behavior determines when it becomes cold
  again.

Ask who starts the producer, who joins it, what late subscribers see, and when
it stops. Those answers are more useful than the label alone.

## Error semantics

An error notification is terminal. An `error` callback handles the
notification; it does not resume the source.

```ts
source$.subscribe({
  next: consume,
  error: reportFailure,
  complete: reportDone,
});
```

Wrapping `subscribe` in `try/catch` is not a reliable Observable error handler.
Without an error callback, RxJS reports an unhandled error on another call
stack.

## Synchronous and reentrant sources

Downstream code can unsubscribe or feed a Subject synchronously while a source
is still producing. Custom synchronous sources must check `subscriber.closed`
before expensive work and after a notification when more work follows.

```ts
const values$ = new Observable<number>((subscriber) => {
  for (const value of values) {
    if (subscriber.closed) return;
    subscriber.next(expensiveProjection(value));
  }
  subscriber.complete();
});
```

Teardown is a correctness contract, not optional hygiene. Test it wherever a
pipeline owns machine resources or child work.
