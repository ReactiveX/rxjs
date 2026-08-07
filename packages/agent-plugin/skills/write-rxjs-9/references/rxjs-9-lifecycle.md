# RxJS 9 lifecycle and composition

## Platform Observable

The selected constructor is native when present and the conforming fallback
otherwise. One Observable can have a shared active producer: the first observer
starts it, concurrent observers join from their subscription time, the last
observer leaving closes it, and later observation can start another run.

Subscribe with an observer or callback plus `{ signal }`. Cancellation is an
AbortSignal relationship; do not expect a returned RxJS 7 Subscription.
Producer cleanup is registered through `subscriber.addTeardown()`.

## Exact Symbols

Import each RxJS capability from its public subpath and invoke its exact Symbol.
A same-named platform string method remains a different contract. The Symbol
form may add RxJS behavior but must not replace the platform method.

Observable-returning Symbols construct through the receiver's versioned
creation protocol. Inputs cross the active realm's platform
`Observable.from`; result construction does not widen that input contract.

## Intentional APIs

`ColdObservable` creates producer work for each direct subscription. Subjects
are hot producer values. Behavior/replay factories use observer-local current
or buffered delivery, but do not make their producer cold. Native string
methods on a cold value cross back to platform lifecycle; exact Symbol results
preserve the intentional creation policy.
