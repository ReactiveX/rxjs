# Values, inputs, errors, and concurrency

## Inputs

RxJS 7 `ObservableInput` accepts a broader ecosystem, including several legacy
interop shapes. RxJS 9 follows platform `Observable.from`: Observable, async
iterable, iterable, and Promise-like values. If a library accepts both, adapt
at an explicit version boundary; do not cast arbitrary subscribables through.

## Errors and completion

State whether validation throws synchronously, rejects a Promise, or errors an
Observable. State what completion means to a consumer and whether an empty
completion is valid. Observer callback errors are not source errors.

## Higher-order work

Sequential queueing is the safest public default: `concatMap` in RxJS 7 or
platform `.flatMap()` in RxJS 9. It preserves operations and is easiest to
reason about, though the queue still needs a load policy.

Use `mergeMap`/`[mergeMap]` for an API that explicitly promises parallelism and
define the cap and output ordering. Use `exhaustMap`/`[exhaustMap]` for an
action lock such as preventing duplicate orders. Use
`switchMap`/`.switchMap()` for disposable reads, changing streaming sources,
or starting/stopping reactive processes.

Do not use switching as an implicit write policy. A server can complete an
earlier delete after observation is canceled, while the client discards the
success needed to update its view.
