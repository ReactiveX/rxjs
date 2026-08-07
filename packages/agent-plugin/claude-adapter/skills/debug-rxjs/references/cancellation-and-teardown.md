# Cancellation and teardown debugging

## Identify the owner

RxJS 7 owner: Subscription tree and `unsubscribe`. RxJS 9 owner: AbortSignal;
platform `subscribe()` returns `undefined`. Trace from the owner to every inner
and actual resource.

## Detect partial cancellation

Common cases:

- observer detached but fetch/Promise continues;
- outer canceled but manually nested subscription survives;
- notifier completes without triggering intended cancellation;
- framework effect cleans current observer but old unstable pipeline remains;
- one RxJS 9 platform observer leaves and shared producer correctly remains
  for another; or
- custom operator fails to link upstream to downstream signal/subscription.

Instrument the underlying resource cancel/abort call. Missing later values do
not prove resource release.

## Teardown order

Record events around resource release and downstream terminal/reentrant
callbacks. RxJS 9 platform Subscriber closes resources before terminal
callbacks and uses reverse teardown registration order. `ColdObservable` and
RxJS 7 aggregation have distinct contracts; test the selected path.

## Late work

Settle callbacks and Promises after cancellation. Check active/closed state and
whether a late error is correctly ignored, reported to host, or incorrectly
delivered. Heavy work after closure is a performance and correctness clue even
when observers see nothing.

## Leak experiment

Repeatedly start/stop the owner, then compare active listener/timer/request/
subscriber counts and heap after quiescence. Use a resource spy before a heap
snapshot when possible; it produces a faster, more deterministic regression
test.
