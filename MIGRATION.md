# Migrating from RxJS 4 to 5

RxJS 5 is a ground-up rewrite of RxJS that actually began development when RxJS was in 2.0. This new version of RxJS had
three basic goals:

1. Better performance
2. Better debugging
3. Compliance with the [ES7 Observable Spec](https://github.com/zenparsing/es-observable)

Meeting the above goals meant breaking changes to the RxJS API, and a complete rewrite means that we had opportunity
to change/fix/correct things we've wanted to correct about RxJS in general.

## Key Component Classes Are Recomposed

They are similar to other language implementations of ReactiveX (e.g. RxJava).

|RxJS 4|RxJS 5| remarks |
|---|---|---|
|`Observer`|`Subscriber` implements `Observer`| `Observer` is an interface now |
|`IDisposable`|`Subscription`|`Subscription` is a class, not an interface.|


## Observer Interface Changes (also Subjects)

Due to wanting to comply with the ES7 Observable Spec (goal 3 above), the Observer interface (as implemented by
Observers and Subjects alike) has changed.

- `observer.onNext(value)` -> `observer.next(value)`
- `observer.onError(err)` -> `observer.error(err)`
- `observer.onCompleted()` -> `observer.complete()`

So what was once `subject.onNext("hi")` is now `subject.next("hi")`.

## Subscription `dispose` is now `unsubscribe`

To meet the Observable spec (goal 3) `dispose` had to be renamed to `unsubscribe`.

<!-- skip-example -->
```js
var subscription = myObservable.subscribe(doSomething);
// RxJS 4: subscription.dispose();
subscription.unsubscribe();
```

## Subscription: All Subscriptions Are "Composite"

In RxJS 4, there was the idea of a `CompositeSubscription`. Now all Subscriptions are "composite".
Subscription objects have an `add` and `remove` method on them useful for adding and removing subscriptions
enabling "composite" subscription behavior.

## Operators Renamed or Removed

|RxJS 4|RxJS 5|
|---|---|
|`amb`|`race`|
|`bufferWithCount`|`bufferCount`|
|`bufferWithTime`|`bufferTime`|
|`flatMap` or `selectMany`|`mergeMap` or `flatMap`(alias)|
|`flatMapFirst`|`exhaustMap`|
|`flatMapLatest`|`switchMap`|
|`flatMapWithMaxConcurrent`|`mergeMap` or `flatMap`(alias)|
|`fromCallback`|`bindCallback`|
|`fromNodeCallback`|`bindNodeCallback`|
|`publishValue`|`publishBehavior`|
|`replay`|`publishReplay`|
|`return` or `just`|`of`|
|`select`|`map`|
|`selectConcat`|`concatMap`|
|`switchFirst`|`exhaust`|
|`tap`|`do`|
|`windowWithTime`|`windowTime`|
|`windowWithCount`|`windowCount`|
|`where`|`filter`|
|`and`|Not yet implemented|
|`asObservable`|Not yet implemented|
|`average`|Not yet implemented|
|`controlled`|Not yet implemented|
|`delaySubscription`|Not yet implemented|
|`doWhile`|Not yet implemented|
|`extend`|Not yet implemented|
|`groupByUntil`|Not yet implemented|
|`groupJoin`|Not yet implemented|
|`includes`|Not yet implemented|
|`indexOf`|Not yet implemented|
|`join`|Not yet implemented|
|`jortSort`|Not yet implemented|
|`jortSortUntil`|Not yet implemented|
|`lastIndexOf`|Not yet implemented|
|`manySelect`|Not yet implemented|
|`maxBy`|Not yet implemented|
|`minBy`|Not yet implemented|
|`ofObjectChanges`|Not yet implemented|
|`pausable`|Not yet implemented|
|`pausableBuffered`|Not yet implemented|
|`shareReplay`|Not yet implemented|
|`shareValue`|Not yet implemented|
|`selectConcatObserver` or `concatMapObserver`|Not yet implemented|
|`selectManyObserver` or `flatMapObserver`|Not yet implemented|
|`singleInstance`|Not yet implemented|
|`skipLast`|Not yet implemented|
|`skipLastWithTime`|Not yet implemented|
|`skipUntilWithTime`|Not yet implemented|
|`slice`|Not yet implemented|
|`some`|Not yet implemented|
|`sum`|Not yet implemented|
|`takeLastBuffer`|Not yet implemented|
|`takeLastBufferWithTime`|Not yet implemented|
|`takeLastWithTime`|Not yet implemented|
|`takeUntilWithTime`|Not yet implemented|
|`tapOnNext`|`do`|
|`tapOnError`|`do`|
|`tapOnCompleted`|`do`|
|`timestamp`|Not yet implemented|
|`toMap`|Not yet implemented|
|`toSet`|Not yet implemented|
|`transduce`|Not yet implemented|
|`windowWithTimeOrCount`|Not yet implemented|

## Operator Splits

To reduce polymorphism and get better performance out of operators, some operators have been split into more than one operator:

<table>
  <thead>
    <tr>
      <th></th>
      <th>RxJS 4</th>
      <th>RxJS 5</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2"><code>map</code></td>
      <td><code>map(project: function, thisArg?: any)</code></td>
      <td><code>map(project: function, thisArg?: any)</code></td>
    </tr>
    <tr>
      <td><code>map(value: any)</code></td>
      <td><code>mapTo(value: any)</code></td>
    </tr>
    <tr>
      <td rowspan="2"><code>flatMap</code></td>
      <td><code>flatMap(project: function, resultSelector?: function)</code></td>
      <td><code>flatMap(project: function, resultSelector?: function)</code></td>
    </tr>
    <tr>
      <td><code>flatMap(value: Observable, resultSelector?: function)</code></td>
      <td><code>flatMapTo(value: Observable, resultSelector?: function)</code></td>
    </tr>
    <tr>
      <td rowspan="2"><code>switchMap</code> (aka <code>flatMapLatest</code>)</td>
      <td><code>flatMapLatest(project: function, resultSelector?: function)</code></td>
      <td><code>switchMap(project: function, resultSelector?: function)</code></td>
    </tr>
    <tr>
      <td><code>flatMapLatest(value: Observable, resultSelector?: function)</code></td>
      <td><code>switchMapTo(value: Observable, resultSelector?: function)</code></td>
    </tr>
    <tr>
      <td rowspan="2"><code>concatMap</code></td>
      <td><code>concatMap(project: function, resultSelector?: function)</code></td>
      <td><code>concatMap(project: function, resultSelector?: function)</code></td>
    </tr>
    <tr>
      <td><code>concatMap(value: Observable, resultSelector?: function)</code></td>
      <td><code>concatMapTo(value: Observable, resultSelector?: function)</code></td>
    </tr>
    <tr>
      <td rowspan="3"><code>buffer</code></td>
      <td><code>buffer(closings: Observable)</code></td>
      <td><code>buffer(closings: Observable)</code></td>
    </tr>
    <tr>
      <td><code>buffer(closingNotifierFactory: function)</code></td>
      <td><code>bufferWhen(closingNotifierFactory: function)</code></td>
    </tr>
    <tr>
      <td><code>buffer(openings: Observable, closingSelector?: function)</code></td>
      <td><code>bufferToggle(openings: Observable, closingSelector?: function)</code></td>
    </tr>
    <tr>
      <td rowspan="3"><code>window</code></td>
      <td><code>window(closings: Observable)</code></td>
      <td><code>window(closings: Observable)</code></td>
    </tr>
    <tr>
      <td><code>window(closingNotifierFactory: function)</code></td>
      <td><code>windowWhen(closingNotifierFactory: function)</code></td>
    </tr>
    <tr>
      <td><code>window(openings: Observable, closingSelector?: function)</code></td>
      <td><code>windowToggle(openings: Observable, closingSelector?: function)</code></td>
    </tr>
    <tr>
      <td rowspan="2"><code>debounce</code></td>
      <td><code>debounce(durationSelector: Observable)</code></td>
      <td><code>debounce(durationSelector: Observable)</code></td>
    </tr>
    <tr>
      <td><code>debounce(delay: number, scheduler?: Scheduler)</code></td>
      <td><code>debounceTime(delay: number, scheduler?: Scheduler)</code></td>
    </tr>
    <tr>
      <td><code>throttle</code></td>
      <td><code>throttle(delay: number, scheduler?: Scheduler)</code></td>
      <td><code>throttleTime(delay: number, scheduler?: Scheduler)</code></td>
    </tr>
    <tr>
      <td rowspan="2"><code>delay</code></td>
      <td><code>delay(dueTime: number|Date, scheduler?: Scheduler)</code></td>
      <td><code>delay(dueTime: number|Date, scheduler?: Scheduler)</code></td>
    </tr>
    <tr>
      <td><code>delay(subscriptionDelay?: Observable<any>, delayDurationSelector: function)</code></td>
      <td><code>delayWhen(delayDurationSelector: function, subscriptionDelay?: Observable<any>)</code></td>
    </tr>
    <tr>
      <td rowspan="2"><code>timeout</code></td>
      <td><code>timeout(dueTime: number | Date, other?: Error, scheduler?: Scheduler)</code></td>
      <td><code>timeout(due: number | Date, errorToSend?: any, scheduler?: Scheduler)</code></td>
    </tr>
    <tr>
      <td><code>timeout(dueTime: number | Date, other?: Observable | Promise, scheduler?: Scheduler)</code></td>
      <td><code>timeoutWith(due: number | Date, withObservable: ObservableInput, scheduler: Scheduler)</code></td>
    </tr>
  </tbody>
</table>


## Operator Interface Changes


<table>
  <thead>
    <tr>
      <th></th>
      <th>RxJS 4</th>
      <th>RxJS 5</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>distinctUntilChanged</code></td>
      <td><code>distinctUntilChanged(keySelector: function, comparer: function)</code></td>
      <td><code>distinctUntilChanged<T, K>(compare?: (x: K, y: K) => boolean, keySelector?: (x: T) => K): Observable<T></code></td>
    </tr>
  </tbody>
</table>


## Default Scheduling Changed

RxJS v4 defaulted to a scheduler called `Rx.Scheduler.asap` which schedules on the micro task queue. RxJS v5 however defaults to having no scheduler at all; v4 called this `Rx.Scheduler.immediate`. This was done to increase performance for the most common use cases.


## Schedulers Renamed

The names of the Schedulers in RxJS 4 were based off of the Rx.NET implementation. Consequently, some of the names
didn't make sense in a JavaScript context (for example: `currentThread` when there's only one thread anyhow).

|RxJS 4|RxJS 5||
|------|------|---|
|`Rx.Scheduler.default`|`Rx.Scheduler.asap`|schedules on the micro task queue|
|`Rx.Scheduler.currentThread`|`Rx.Scheduler.queue`|schedules on a queue in the current event frame (trampoline scheduler)|
|`Rx.Scheduler.immediate`|`undefined`|by not passing a scheduler to operators that request it, it defaults to recursive execution|


## Unimplemented Operators/Features

If there is a feature that used to exist in RxJS 4, but no longer does in RxJS 5, please be sure to file an issue (and preferably a PR).
In your issue, please describe the use case you have for the operator so we can better understand your need and prioritize it, and/or find
and alternative way to compose the desired behavior.
