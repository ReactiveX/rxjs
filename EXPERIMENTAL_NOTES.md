## Differences

**NOTE: THESE DIFFERENCES ARE NOT FINAL** This is just experimental, the goal is to
try to limit differences to what is necessary to reduce the overall size of the library.

TBD

## Fixes that are breaking changes to some

TBD

## Operators TODO
- [ ] audit (g3)
- [ ] auditTime (g3)
- [ ] buffer (g3)
- [ ] bufferCount (g3)
- [ ] bufferTime (g3)
- [ ] bufferToggle
- [ ] bufferWhen (g3)
- [ ] catchError (g3)
- [ ] combineAll
- [ ] combineLatest (g3) (static only)
- [ ] concat (alias: concatWith) (g3)
- [ ] concatAll (g3)
- [ ] concatMap (g3)
- [ ] concatMapTo
- [ ] count (g3)
- [ ] debounce (g3)
- [ ] debounceTime (g3)
- [ ] defaultIfEmpty (g3)
- [ ] delay (g3)
- [ ] delayWhen (g3)
- [ ] dematerialize
- [ ] distinct (g3)
- [ ] distinctUntilChanged (g3)
- [ ] distinctUntilKeyChanged (g3)
- [ ] elementAt (g3)
- [ ] endWith
- [ ] every (g3)
- [ ] exhaust
- [ ] exhaustMap (g3)
- [ ] expand (g3)
- [ ] filter (g3)
- [ ] finalize (g3)
- [ ] find
- [ ] findIndex
- [ ] first (g3)
- [ ] flatMap (g3)
- [ ] groupBy (g3)
- [ ] ignoreElements (g3)
- [ ] isEmpty
- [ ] last (g3)
- [ ] map (g3)
- [ ] mapTo (g3)
- [ ] materialize (g3)
- [ ] max
- [ ] merge (g3) (static only)
- [ ] mergeAll (g3)
- [ ] mergeMap (g3)
- [ ] mergeMapTo (g3)
- [ ] mergeScan
- [ ] min
- [ ] multicast (g3) (multicast and multicastAs)
- [ ] observeOn (g3)
- [ ] onErrorResumeNext (g3) (as onErrorResumeWith)
- [ ] pairwise (g3)
- [ ] partition (g3) (static only)
- [ ] pluck (g3)
- [ ] publish (g3) (publish static and publishAs)
- [ ] publishBehavior (g3) (publishBehavior static and publishBehaviorAs)
- [ ] publishLast (g3) (publishLast static and publishLastAs)
- [ ] publishReplay (g3) (publishReplay static and publishReplayAs)
- [ ] race (static only)
- [ ] reduce (g3)
- [ ] refCount (g3) (only as a method on ConnectableObservable)
- [ ] repeat (g3)
- [ ] repeatWhen (g3)
- [ ] retry (g3)
- [ ] retryWhen (g3)
- [ ] sample (g3)
- [ ] sampleTime (g3)
- [ ] scan (g3)
- [ ] sequenceEqual
- [ ] share (g3)
- [ ] shareReplay (g3)
- [ ] single (g3)
- [ ] skip (g3)
- [ ] skipLast
- [ ] skipUntil (g3)
- [ ] skipWhile (g3)
- [ ] startWith (g3)
- [ ] subscribeOn (g3)
- [ ] switchAll (g3)
- [ ] switchMap (g3)
- [ ] switchMapTo (g3)
- [ ] take (g3)
- [ ] takeLast (g3)
- [ ] takeUntil (g3)
- [ ] takeWhile (g3)
- [ ] tap (g3)
- [ ] throttle (g3)
- [ ] throttleTime (g3)
- [ ] throwIfEmpty
- [ ] timeInterval (g3)
- [ ] timeout (g3)
- [ ] timeoutWith (g3)
- [ ] timestamp
- [ ] toArray (g3)
- [ ] window
- [ ] windowCount (g3)
- [ ] windowTime
- [ ] windowToggle
- [ ] windowWhen
- [ ] withLatestFrom (g3)
- [ ] zip (g3) (static only)
- [ ] zipAll


### Creation Methods

TODO: Still need to research all of these and port tests.

- [ ] ajax
- [ ] bindCallback
- [ ] bindNodeCallback
- [ ] combineLatest
- [ ] concat
- [ ] defer
- [ ] empty (as `EMPTY` and `fromScheduled([], scheduler)`)
- [ ] forkJoin
- [ ] from (via from and fromScheduled)
- [ ] fromEvent
- [ ] fromEventPattern
- [ ] generate
- [ ] iif
- [ ] interval
- [ ] merge
- [ ] never (as `NEVER`)
- [ ] of
- [ ] onErrorResumeNext
- [ ] pairs
- [ ] race
- [ ] range
- [ ] throwError
- [ ] timer
- [ ] using
- [ ] webSocket
- [ ] zip

### Other Things

- [ ] AsyncSubject
- [ ] ConnectableObservable
- [ ] Notification
- [ ] Subscriber
- [ ] identity
- [ ] isObservable
- [ ] noop
- [ ] pipe
- [ ] config

### Error Types

- [ ] ArgumentOutOfRangeError
- [ ] EmptyError
- [ ] ObjectUnsubscribedError
- [ ] UnsubscriptionError
- [ ] TimeoutError

### Schedulers

- [ ] animationFrameScheduler
- [ ] asapScheduler
- [ ] asyncScheduler
- [ ] queueScheduler
- [ ] VirtualTimeScheduler
- [ ] Scheduler (skipped)
- [ ] VirtualAction (skipped)
