# Operators

## What are operators?

## Categories of operators

### Creation Operators

- `ajax`
- [`bindCallback`](../class/es6/Observable.js~Observable.html#static-method-bindCallback)
- [`bindNodeCallback`](../class/es6/Observable.js~Observable.html#static-method-bindNodeCallback)
- `create`
- [`defer`](../class/es6/Observable.js~Observable.html#static-method-defer)
- [`empty`](../class/es6/Observable.js~Observable.html#static-method-empty)
- [`from`](../class/es6/Observable.js~Observable.html#static-method-from)
- [`fromArray`](../class/es6/Observable.js~Observable.html#static-method-fromArray)
- [`fromEvent`](../class/es6/Observable.js~Observable.html#static-method-fromEvent)
- [`fromEventPattern`](../class/es6/Observable.js~Observable.html#static-method-fromEventPattern)
- [`fromPromise`](../class/es6/Observable.js~Observable.html#static-method-fromPromise)
- [`interval`](../class/es6/Observable.js~Observable.html#static-method-interval)
- [`never`](../class/es6/Observable.js~Observable.html#static-method-never)
- [`of`](../class/es6/Observable.js~Observable.html#static-method-of)
- `repeat`
- [`range`](../class/es6/Observable.js~Observable.html#static-method-range)
- [`throw`](../class/es6/Observable.js~Observable.html#static-method-throw)
- [`timer`](../class/es6/Observable.js~Observable.html#static-method-timer)

### Transformation Operators

- [`buffer`](../class/es6/Observable.js~Observable.html#instance-method-buffer)
- [`bufferCount`](../class/es6/Observable.js~Observable.html#instance-method-bufferCount)
- [`bufferTime`](../class/es6/Observable.js~Observable.html#instance-method-bufferTime)
- [`bufferToggle`](../class/es6/Observable.js~Observable.html#instance-method-bufferToggle)
- [`bufferWhen`](../class/es6/Observable.js~Observable.html#instance-method-bufferWhen)
- [`concatMap`](../class/es6/Observable.js~Observable.html#instance-method-concatMap)
- [`concatMapTo`](../class/es6/Observable.js~Observable.html#instance-method-concatMapTo)
- [`exhaustMap`](../class/es6/Observable.js~Observable.html#instance-method-exhaustMap)
- [`expand`](../class/es6/Observable.js~Observable.html#instance-method-expand)
- [`groupBy`](../class/es6/Observable.js~Observable.html#instance-method-groupBy)
- [`map`](../class/es6/Observable.js~Observable.html#instance-method-map)
- [`mapTo`](../class/es6/Observable.js~Observable.html#instance-method-mapTo)
- [`mergeMap`](../class/es6/Observable.js~Observable.html#instance-method-mergeMap)
- [`mergeMapTo`](../class/es6/Observable.js~Observable.html#instance-method-mergeMapTo)
- [`mergeScan`](../class/es6/Observable.js~Observable.html#instance-method-mergeScan)
- [`pairwise`](../class/es6/Observable.js~Observable.html#instance-method-pairwise)
- [`partition`](../class/es6/Observable.js~Observable.html#instance-method-partition)
- [`pluck`](../class/es6/Observable.js~Observable.html#instance-method-pluck)
- [`scan`](../class/es6/Observable.js~Observable.html#instance-method-scan)
- [`switchMap`](../class/es6/Observable.js~Observable.html#instance-method-switchMap)
- [`switchMapTo`](../class/es6/Observable.js~Observable.html#instance-method-switchMapTo)
- [`window`](../class/es6/Observable.js~Observable.html#instance-method-window)
- [`windowCount`](../class/es6/Observable.js~Observable.html#instance-method-windowCount)
- [`windowTime`](../class/es6/Observable.js~Observable.html#instance-method-windowTime)
- [`windowToggle`](../class/es6/Observable.js~Observable.html#instance-method-windowToggle)
- [`windowWhen`](../class/es6/Observable.js~Observable.html#instance-method-windowWhen)

### Filtering Operators

- [`debounce`](../class/es6/Observable.js~Observable.html#instance-method-debounce)
- [`debounceTime`](../class/es6/Observable.js~Observable.html#instance-method-debounceTime)
- [`distinct`](../class/es6/Observable.js~Observable.html#instance-method-distinct)
- [`distinctKey`](../class/es6/Observable.js~Observable.html#instance-method-distinctKey)
- [`distinctUntilChanged`](../class/es6/Observable.js~Observable.html#instance-method-distinctUntilChanged)
- [`distinctUntilKeyChanged`](../class/es6/Observable.js~Observable.html#instance-method-distinctUntilKeyChanged)
- [`elementAt`](../class/es6/Observable.js~Observable.html#instance-method-elementAt)
- [`filter`](../class/es6/Observable.js~Observable.html#instance-method-filter)
- [`first`](../class/es6/Observable.js~Observable.html#instance-method-first)
- [`ignoreElements`](../class/es6/Observable.js~Observable.html#instance-method-ignoreElements)
- [`inspect`](../class/es6/Observable.js~Observable.html#instance-method-inspect)
- [`inspectTime`](../class/es6/Observable.js~Observable.html#instance-method-inspectTime)
- [`last`](../class/es6/Observable.js~Observable.html#instance-method-last)
- [`sample`](../class/es6/Observable.js~Observable.html#instance-method-sample)
- [`sampleTime`](../class/es6/Observable.js~Observable.html#instance-method-sampleTime)
- [`single`](../class/es6/Observable.js~Observable.html#instance-method-single)
- [`skip`](../class/es6/Observable.js~Observable.html#instance-method-skip)
- [`skipUntil`](../class/es6/Observable.js~Observable.html#instance-method-skipUntil)
- [`skipWhile`](../class/es6/Observable.js~Observable.html#instance-method-skipWhile)
- [`take`](../class/es6/Observable.js~Observable.html#instance-method-take)
- [`takeLast`](../class/es6/Observable.js~Observable.html#instance-method-takeLast)
- [`takeUntil`](../class/es6/Observable.js~Observable.html#instance-method-takeUntil)
- [`takeWhile`](../class/es6/Observable.js~Observable.html#instance-method-takeWhile)
- [`throttle`](../class/es6/Observable.js~Observable.html#instance-method-throttle)
- [`throttleTime`](../class/es6/Observable.js~Observable.html#instance-method-throttleTime)

### Combination Operators

- [`combineAll`](../class/es6/Observable.js~Observable.html#instance-method-combineAll)
- [`combineLatest`](../class/es6/Observable.js~Observable.html#instance-method-combineLatest)
- [`concat`](../class/es6/Observable.js~Observable.html#instance-method-concat)
- [`concatAll`](../class/es6/Observable.js~Observable.html#instance-method-concatAll)
- [`exhaust`](../class/es6/Observable.js~Observable.html#instance-method-exhaust)
- [`forkJoin`](../class/es6/Observable.js~Observable.html#static-method-forkJoin)
- [`merge`](../class/es6/Observable.js~Observable.html#instance-method-merge)
- [`mergeAll`](../class/es6/Observable.js~Observable.html#instance-method-mergeAll)
- [`race`](../class/es6/Observable.js~Observable.html#instance-method-race)
- [`startWith`](../class/es6/Observable.js~Observable.html#instance-method-startWith)
- `switch`
- [`withLatestFrom`](../class/es6/Observable.js~Observable.html#instance-method-withLatestFrom)
- [`zip`](../class/es6/Observable.js~Observable.html#static-method-zip)
- [`zipAll`](../class/es6/Observable.js~Observable.html#instance-method-zipAll)

### Multicasting Operators

- [`cache`](../class/es6/Observable.js~Observable.html#instance-method-cache)
- [`multicast`](../class/es6/Observable.js~Observable.html#instance-method-multicast)
- [`publish`](../class/es6/Observable.js~Observable.html#instance-method-publish)
- [`publishBehavior`](../class/es6/Observable.js~Observable.html#instance-method-publishBehavior)
- [`publishLast`](../class/es6/Observable.js~Observable.html#instance-method-publishLast)
- [`publishReplay`](../class/es6/Observable.js~Observable.html#instance-method-publishReplay)
- [`share`](../class/es6/Observable.js~Observable.html#instance-method-share)

### Error Handling Operators

- `catch`
- [`retry`](../class/es6/Observable.js~Observable.html#instance-method-retry)
- [`retryWhen`](../class/es6/Observable.js~Observable.html#instance-method-retryWhen)

### Utility Operators

- `do`
- [`delay`](../class/es6/Observable.js~Observable.html#instance-method-delay)
- [`delayWhen`](../class/es6/Observable.js~Observable.html#instance-method-delayWhen)
- [`dematerialize`](../class/es6/Observable.js~Observable.html#instance-method-dematerialize)
- `finally`
- `let`
- [`materialize`](../class/es6/Observable.js~Observable.html#instance-method-materialize)
- [`observeOn`](../class/es6/Observable.js~Observable.html#instance-method-observeOn)
- [`subscribeOn`](../class/es6/Observable.js~Observable.html#instance-method-subscribeOn)
- [`timeInterval`](../class/es6/Observable.js~Observable.html#instance-method-timeInterval)
- [`timeout`](../class/es6/Observable.js~Observable.html#instance-method-timeout)
- [`timeoutWith`](../class/es6/Observable.js~Observable.html#instance-method-timeoutWith)
- [`toArray`](../class/es6/Observable.js~Observable.html#instance-method-toArray)
- [`toPromise`](../class/es6/Observable.js~Observable.html#instance-method-toPromise)

### Conditional and Boolean Operators

- [`defaultIfEmpty`](../class/es6/Observable.js~Observable.html#instance-method-defaultIfEmpty)
- [`every`](../class/es6/Observable.js~Observable.html#instance-method-every)
- [`find`](../class/es6/Observable.js~Observable.html#instance-method-find)
- [`findIndex`](../class/es6/Observable.js~Observable.html#instance-method-findIndex)
- [`isEmpty`](../class/es6/Observable.js~Observable.html#instance-method-isEmpty)

### Mathematical and Aggregate Operators

- [`count`](../class/es6/Observable.js~Observable.html#instance-method-count)
- [`max`](../class/es6/Observable.js~Observable.html#instance-method-max)
- [`min`](../class/es6/Observable.js~Observable.html#instance-method-min)
- [`reduce`](../class/es6/Observable.js~Observable.html#instance-method-reduce)
