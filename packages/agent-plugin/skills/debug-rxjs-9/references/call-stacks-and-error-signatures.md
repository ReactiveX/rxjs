# Call stacks and error signatures

## Read a stack by boundary

Find the first user-owned frame and classify the current phase:

- platform constructor/source initializer: producer activation;
- mapper, predicate, inspector, RxJS Symbol callback, or observer callback:
  synchronous notification handling;
- `AbortController.abort`, signal listener, `addTeardown`, or cleanup callback:
  cancellation and resource release;
- timer, Promise, event, microtask, or host `reportError` frame: a later task
  whose stack may no longer show the subscribing call.

Do not write fixes against private native or fallback frame names. Capture a
temporary activation id or setup stack when an async boundary loses its origin,
and preserve the original error or `cause` when adding context.

An observer callback error is host-reported; it is not a source notification
that an upstream `.catch()` or `[catchError]` can recover. A source initializer
throw or operator callback throw is converted into the stream's error path.

## Common platform and RxJS 9 errors

- `TypeError: Observable constructor requires a callback` — construction did
  not provide an initializer function.
- “... is not observable” — `Observable.from` or an operator received a value
  outside the platform `ObservableValue` set, often `undefined` from one
  projection branch or an unsupported/cross-realm observable-like object.
- `Illegal constructor` — code tried to construct the platform `Subscriber`
  directly; only an Observable initializer receives one.
- `Subscriber.addTeardown requires a callback`, `Subscriber.next requires a
value`, or `Subscriber.error requires an error` — a custom source violated
  the platform Subscriber contract.
- “source[symbol] is not a function” — the extension module was not imported,
  the wrong package copy's exact Symbol was used, or code created a
  same-description Symbol. Check module identity; do not replace it with
  `Symbol.for()`.
- “Cannot read properties of undefined (reading 'unsubscribe')” after
  `subscribe` — RxJS 7 ownership code expected a returned Subscription.
  Platform `subscribe()` returns `undefined`; pass an AbortSignal and retain
  its controller.
- “Cannot install the RxJS create protocol ... already occupied” — the shared
  construction key contains a non-function, usually from an incompatible or
  corrupt installation. Inspect physical package copies and initialization
  order.
- “Cannot initialize @rxjs/observable-polyfill ... not writable or
  configurable” — the realm already exposes a protected conflicting property;
  diagnose the realm instead of forcing replacement.
- platform `first()` or `last()` rejects with `RangeError` on an empty source;
  platform `reduce()` without initial state rejects with `TypeError`. RxJS
  Symbol `[first]`/`[last]` use `EmptyError` instead.
- `TimeoutError` — inspect `info.seen`, `lastValue`, `meta`, time units, and
  event-loop blocking.
- `SequenceError`, `NotFoundError`, and `ArgumentOutOfRangeError` — inspect the
  cardinality, predicate, or index contract before adding a fallback.
- “Scheduler-backed ... is not supported by this Symbol contract” — the chosen
  RxJS 9 API intentionally has a host-time contract. Remove the RxJS 7
  scheduler argument or choose a supported testing/host-time seam.

“Maximum call stack size exceeded” usually points to synchronous feedback,
recursive retry, or another unbounded reentrant path.
