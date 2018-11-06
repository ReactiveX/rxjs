## Differences

- `of` has no scheduler argument
- `from` has no scheduler argument
- `Observable` instances are now `typeof` `"function"`.
- `lift` is no longer on `Observable`
- `materialize`: `Notification` is no longer a class. `hasValue` and `hasError` are no longer properties, instead users would check `'error' in notification` if they were worried about falsiness mismatches.
- All `Scheduler`-related functionality is moved to another package
- `timestamp` - no longer accepts a `Scheduler`, instead, zones-based testing will be required to test
timestamp.
- `forEach`
  - `nextHandler` is always called on a microtask now.
  - optional subscription argument to allow users to cancel/abort/unsubscribe a
    forEach'ed observable. When `unsubscribe` is called, the resulting promise will
    reject with an `Error` that has the `name` `"AbortError"`, this is to somewhat
    align it with the behavior of `fetch` and `AbortSignal`.
- `next` (Name to be bikeshedded)... this is a equivalent to Rx5's `of(...values, asapScheduler)`.
  given this is one of the primary
- `concatWith` is basically the old `concat` *operator*, just with a better name.
- `endWith` has no scheduler argument
- `startWith` has no scheduler argument
- `partition` is now a static method
- `Observable` no longer passes `instanceof` checks
- `Observable(init)` works just like `new Observable(init)`, replacing `Observable.create`
- `Subject()` works just like `new Subject()`
- `Subject` does not pass `instanceof` checks
- `Subject(observer, observable)` replaces `Subject.create`
- `map` no longer supports `thisArg`
- `map` no longer sync throws if passed a non-function
- `filter` no longer supports `thisArg`.
- `combineAll` no longer accepts the selector or the scheduler
- `exhaustMap` now supports concurrency argument
- `delay` no longer delays the emission of "complete" inconsistently (#4149)
- `debounce` now passes `index` to `durationSelector`.
- `throttle` now passes `index` to `durationSelector`.
- `range` no longer supports scheduling... if you want to schedule that, use `fromScheduled` and a generator. (possibly we'll implement a scheduled range?)
- `merge` no longer supports scheduling... use `fromScheduled(sources).pipe(mergeAll())`.
- `throwError` no longer supports scheduling... use `throwError(err).pipe(observeOn(scheduler))`
## Fixes that are breaking changes to some

- Resolved the [issue](https://github.com/ReactiveX/rxjs/issues/3990) where `buffer` was omitting the last buffer when the source completed [here](https://github.com/ReactiveX/rxjs/commit/61b1767ec58450325ee16a5d21eadb3789acc069)



## Operators TODO
- [x] audit (g3)
- [x] auditTime (g3)
- [x] buffer (g3)
- [x] bufferCount (g3)
- [x] bufferTime (g3)
- [x] bufferToggle
- [ ] bufferWhen (g3)
- [x] catchError (g3)
- [x] combineAll
- [x] combineLatest (g3) (static only)
- [x] concat (alias: concatWith) (g3)
- [x] concatAll (g3)
- [x] concatMap (g3)
- [x] concatMapTo
- [x] count (g3)
- [x] debounce (g3)
- [x] debounceTime (g3)
- [x] defaultIfEmpty (g3)
- [x] delay (g3)
- [x] delayWhen (g3)
- [x] dematerialize
- [x] distinct (g3)
- [x] distinctUntilChanged (g3)
- [x] distinctUntilKeyChanged (g3)
- [x] elementAt (g3)
- [x] endWith
- [x] every (g3)
- [x] exhaust
- [x] exhaustMap (g3)
- [x] expand (g3)
- [x] filter (g3)
- [x] finalize (g3)
- [x] find
- [x] findIndex
- [x] first (g3)
- [x] flatMap (g3)
- [x] groupBy (g3)
- [x] ignoreElements (g3)
- [x] isEmpty
- [x] last (g3)
- [x] map (g3)
- [x] mapTo (g3)
- [x] materialize (g3)
- [x] max
- [x] merge (g3) (static only)
- [x] mergeAll (g3)
- [x] mergeMap (g3)
- [x] mergeMapTo (g3)
- [x] mergeScan
- [x] min
- [x] multicast (g3) (multicast and multicastAs)
- [x] observeOn (g3)
- [x] onErrorResumeNext (g3) (as onErrorResumeWith)
- [x] pairwise (g3)
- [x] partition (g3) (static only)
- [x] pluck (g3)
- [x] publish (g3) (publish static and publishAs)
- [x] publishBehavior (g3) (publishBehavior static and publishBehaviorAs)
- [ ] publishLast (g3)
- [x] publishReplay (g3) (publishReplay static and publishReplayAs)
- [x] race (static only)
- [x] reduce (g3)
- [x] refCount (g3) (only as a method on ConnectableObservable)
- [x] repeat (g3)
- [x] repeatWhen (g3)
- [x] retry (g3)
- [x] retryWhen (g3)
- [x] sample (g3)
- [ ] sampleTime (g3)
- [x] scan (g3)
- [x] sequenceEqual
- [x] share (g3)
- [x] shareReplay (g3)
- [x] single (g3)
- [x] skip (g3)
- [x] skipLast
- [x] skipUntil (g3)
- [x] skipWhile (g3)
- [x] startWith (g3)
- [x] subscribeOn (g3)
- [x] switchAll (g3)
- [x] switchMap (g3)
- [x] switchMapTo (g3)
- [x] take (g3)
- [x] takeLast (g3)
- [x] takeUntil (g3)
- [x] takeWhile (g3)
- [x] tap (g3)
- [x] throttle (g3)
- [x] throttleTime (g3)
- [x] throwIfEmpty
- [x] timeInterval (g3)
- [x] timeout (g3)
- [x] timeoutWith (g3)
- [x] timestamp
- [x] toArray (g3)
- [x] window
- [x] windowCount (g3)
- [x] windowTime
- [x] windowToggle
- [ ] windowWhen
- [x] withLatestFrom (g3)
- [x] zip (g3) (static only)
- [x] zipAll


### Creation Methods

TODO: Still need to research all of these and port tests.

- [ ] ajax
- [x] combineLatest
- [x] concat
- [x] defer
- [x] empty (as `EMPTY` and `fromScheduled([], scheduler)`)
- [x] forkJoin
- [x] from (via from and fromScheduled)
- [x] fromEvent
- [x] fromEventPattern
- [ ] generate
- [x] iif
- [x] interval
- [x] merge
- [x] never (as `NEVER`)
- [x] of
- [x] onErrorResumeNext
- [x] pairs
- [x] race
- [x] range
- [x] throwError
- [x] timer
- [x] using
- [ ] webSocket
- [x] zip

### Other Things

- [x] Notification
- [x] identity
- [x] noop


### Schedulers

- [x] animationFrameScheduler
- [x] asapScheduler
- [x] asyncScheduler
- [x] queueScheduler
