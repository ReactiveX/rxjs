# Reviewing custom sources and operators in RxJS 9

## Custom source checklist

- The selected platform or `ColdObservable` lifecycle matches producer
  multiplicity.
- Every resource is registered with `subscriber.addTeardown()`.
- Underlying signal-aware APIs receive `subscriber.signal` or a linked signal.
- Asynchronous continuations check `subscriber.active`.
- `next(undefined)` is used for `Subscriber<void>`.
- Setup error, completion, owner abort, final-observer removal, and restart are
  tested.

## Prefer transformation functions

An application-local domain operator should usually be an ordinary
`(source: Observable<A>) => Observable<B>` function composed with exact
Symbols and `[pipe]`. Flag unnecessary prototype extension and any RxJS 7
`OperatorFunction`/pipeable assumptions.

## Exact public extension checklist

A genuine public fluent operator should:

- export one module-owned `unique symbol` created with `Symbol()`;
- augment `Observable<T>` under that exact key;
- install no string-named method;
- construct through public `this[create](...)`;
- subscribe upstream with `{ signal: subscriber.signal }`;
- forward `error` and `complete` or document their transformation;
- catch user callback and synchronous setup errors as output errors;
- keep ordinary state inside the initializer; and
- avoid internal/private imports.

Flag `Symbol.for` unless the library has an explicit compatible-duplicate
protocol. Flag code that always creates `new Observable` inside an operator
when it claims to preserve a `ColdObservable` receiver.

## Teardown-before-notify review

When custom behavior terminates early, upstream cancellation must occur before
the downstream terminal callback can reenter. Passing the output Subscriber's
signal upstream gives ordinary terminal closure this property. More complex
operators should use dedicated controllers, abort the finished work first, and
then notify.

## Required evidence

Require values, source error, source completion, owner abort, user callback
throw, synchronous setup failure, reentrancy, per-activation state, unrelated
same-description Symbol isolation, and platform/ColdObservable result
lifecycle. Add timing tests for any buffering or concurrency contract.
