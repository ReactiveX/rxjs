# Reviewing custom sources and operators in RxJS 7

## Prefer public composition

A domain operator composed from public RxJS operators inherits tested
notification and teardown behavior. Treat a low-level `new Observable`
operator as extra review surface, and flag imports from `rxjs/internal` as an
unsupported compatibility dependency.

## Custom source checklist

- Constructor callback is synchronous, not `async`.
- Every started resource has returned or registered teardown.
- Setup exceptions become errors.
- `subscriber.closed` stops expensive synchronous or late asynchronous work.
- `next`, `error`, and `complete` follow the one-terminal protocol.
- Teardown is idempotent under completion, error, and explicit unsubscribe.
- Synchronous registration/unregistration races are covered.

## Custom operator checklist

- Output is an Observable and the operator does not subscribe at definition
  time.
- Source `error` and `complete` are forwarded or intentionally transformed.
- User callback exceptions call `subscriber.error`.
- Returning the source subscription links downstream unsubscription upstream.
- Mutable state is per subscription unless sharing is explicitly documented.
- Early termination works for synchronous sources without assignment-order
  bugs.
- Concurrency, buffering, ordering, and delayed terminal behavior are stated.
- Generic types preserve useful inference.

```ts
// Bad: a thrown projector becomes an unhandled observer-callback error rather
// than the custom operator's output error.
return (source) => new Observable((subscriber) => source.subscribe((value) => subscriber.next(project(value))));
```

Require explicit callback error handling and source error/completion
forwarding, or replace the implementation with public `map`/`filter`
composition.

## Lifecycle-sensitive review

Test values, source error, source completion, explicit unsubscribe, user
callback throw, synchronous source, downstream reentrancy, and per-
subscription state. Add teardown spies when resource release is the contract;
marble values alone do not prove it.
