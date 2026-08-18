# Lifecycle and cancellation contracts

Document these questions for every returned Observable:

- What starts the producer?
- Do direct consumers create independent work or share one active producer?
- Do late concurrent consumers receive retained values or only future values?
- What stops work, and does a later consumer restart it?
- Does error/completion become retained terminal state?
- Which object owns cancellation?

RxJS 7 starts with producer-per-subscription behavior and returns a
`Subscription`. Sharing, replay, and ref counting are explicit operator policy.

RxJS 9 platform Observables share one active producer per instance and
`subscribe()` returns `undefined`; cancellation is supplied through an
`AbortSignal`. Use `ColdObservable` only for an intentional independent
producer per direct subscription. A platform string method on a
`ColdObservable` crosses the result back to platform lifecycle; an exact RxJS
Symbol can preserve construction through `[create]`.

Avoid accepting an optional signal while also hiding an unbounded internal
subscription. The owner contract must reach the actual timer, request, socket,
worker, or child observation, not merely suppress late values.
