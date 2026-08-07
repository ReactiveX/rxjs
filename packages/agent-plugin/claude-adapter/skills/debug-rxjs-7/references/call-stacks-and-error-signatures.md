# Call stacks and error signatures

## Read an RxJS 7 stack by phase

Find the first user-owned frame, then classify the surrounding RxJS frames:

- `Observable.subscribe`, `_trySubscribe`, or source initialization: the
  subscription/producer setup path;
- `Subscriber._next`, `OperatorSubscriber`, or an operator callback: a
  synchronous notification moving downstream;
- scheduler, timer, event, or Promise frames: a new asynchronous turn whose
  stack may not contain the subscribing call;
- `reportUnhandledError` or `timeoutProvider`: an error crossed the observer
  boundary without a handler, or an observer handler itself threw, and RxJS is
  reporting it on another task;
- `Subscription.unsubscribe` or teardown frames: resource cleanup, possibly
  far from the original owner.

Do not depend on private frame names in a fix. Use source maps in production
and preserve the original error or `cause` when adding context. When an async
stack loses its origin, temporarily capture a setup stack or correlation id at
subscription and attach that id to later events.

## Common RxJS 7 errors

- `EmptyError: no elements in sequence` — `first`, `last`, `single`,
  `firstValueFrom`, or `lastValueFrom` required a value but the source
  completed empty. Ask why completion won the race and whether emptiness is
  valid.
- `SequenceError` — `single` observed more than one value, or more than one
  predicate match. Inspect duplicate producer runs and predicate scope.
- `NotFoundError` — `single(predicate)` saw values but none matched.
- `ArgumentOutOfRangeError` — an index/count contract was invalid or an
  expected position never arrived, commonly `elementAt`.
- `TimeoutError` — the configured timing bound elapsed. Check the chosen
  scheduler, time unit, first/each policy, and whether the event loop was
  blocked.
- `ObjectUnsubscribedError: object unsubscribed` — a Subject-like object itself
  was unsubscribed and later used. This is different from completing it or
  unsubscribing one observer.
- `UnsubscriptionError` — one or more teardowns threw. Inspect its `errors`
  array and fix each resource teardown; the outer message is only an aggregate.
- “You provided ... where a stream was expected” — a projection, factory, or
  combination input returned `undefined` or another invalid `ObservableInput`.
  Inspect the callback return on every branch.
- “Maximum call stack size exceeded” — suspect synchronous Subject feedback,
  recursive retry/repeat, or another unbounded reentrant loop before assuming
  a large legitimate data set.

An error thrown by an observer's `next`, `error`, or `complete` callback is not
an upstream source error. An earlier `catchError` cannot recover it. Add an
explicit observer error handler for source errors and debug observer-handler
failures at the host-reported boundary.
