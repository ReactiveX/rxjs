# Reproduction and timeline

## Reduce without changing the contract

Keep one source, one public consumer, and the smallest operator group that
still fails. Replace external systems with controllable fakes that preserve
synchronous/asynchronous and cancellation behavior.

Do not replace a shared/hot source with a cold `of(...)` reproduction and then
declare the bug gone. Preserve producer lifecycle, late observer timing, and
resource ownership.

## Instrument lifecycle events

Give every producer activation, observer, inner, and resource a stable id.
Record monotonic time and:

- subscribe/activate;
- next/error/complete;
- unsubscribe/abort with reason;
- teardown start/end;
- retry/repeat activation;
- queue/drop/replacement decision; and
- Subject/reentrant input.

Avoid logging entire large values or changing timing with heavy synchronous
serialization.

## Draw the subscription tree

Include projected inners, notifier subscriptions, combination inputs,
recovery sources, retry/repeat runs, sharing connectors, and framework owners.
Mark the node whose cancellation should release each resource.

## Vary one dimension

1. synchronous versus delayed source;
2. one versus overlapping outer value;
3. one versus two observers;
4. completion versus explicit cancellation;
5. inner versus outer error;
6. late observer during active run versus after restart; and
7. production source model versus isolated test model.

The first variation that changes the symptom sharply narrows the fault class.
