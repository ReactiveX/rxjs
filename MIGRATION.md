# Migrating from RxJS 4 to 5

RxJS 5 is a ground-up rewrite of RxJS that actually began development when RxJS was in 2.0. This new version of RxJS had
three basic goals:

1. Better performance
2. Better debuggability
3. Compliance with the [ES7 Observable Spec](https://github.com/zenparsing/es-observable)

Meeting the above goals meant breaking changes to the RxJS API, and a complete rewrite means that we had opportunity
to change/fix/correct things we've wanted to correct about RxJS in general.

## Observer Interface Changes (also Subjects)

Due to wanting to comply with the ES7 Observable Spec (goal 3 above), the Observer interface (as implemented by
Observers and Subjects alike) has changed.

- `observer.onNext(value)` -> `observer.next(value)`
- `observer.onError(err)` -> `observer.error(err)`
- `observer.onCompleted()` -> `observer.completed()`

So what was once `subject.onNext("hi")` is now `subject.next("hi")`.

## Subscription `dispose` is now `unsubscribe`

To meet the Observable spec (goal 3) `dispose` had to be renamed to `unsubscribe`.

```js
var subscription = myObservable.subscribe(doSomething);
// RxJS 4: subscription.dispose();
subscription.unsubscribe();
```


## Subscription: All Subscriptions Are "Composite"

In RxJS 4, there was the idea of a `CompositeSubscription`. Now all Subscriptions are "composite".
Subscription objects have an `add` and `remove` method on them useful for adding and removing subscriptions
enabling "composite" subscription behavior.



## Operators Renamed

|RxJS 4|RxJS 5|
|---|---|
|`flatMap`|`mergeMap` or `flatMap`(alias)|
|`flatMapLatest`|`switchMap`|
|`bufferWithTime`|`bufferTime`|
|`bufferWithCount`|`bufferCount`|
|`windowWithTime`|`windowTime`|
|`windowWithCount`|`windowCount`|
|`switchFirst`|`exhaustFirst`|
|`switchFirstMap`|`exhaustFirstMap`|

## Operator Splits

To reduce polymorphism and get better performance out of operators, some operators have been split into more than one operator:

||RxJS 4|RxJS 5|
|---|---|---|
|`map`|`map(project: function, thisArg?: any)`|`map(project: function, thisArg?: any)`|
||`map(value: any)`|`mapTo(value: any)`|
|`flatMap`|`flatMap(project: function, resultSelector?: function)`|`flatMapTo(project: function, resultSelector?: function)`|
||`flatMap(value: Observable, resultSelector?: function)`|`flatMapTo(value: Observable, resultSelector?: function)`|
|`switchMap` (aka `flatMapLatest`)|`flatMapLatest(project: function, resultSelector?: function)`|`switchMapTo(project: function, resultSelector?: function)`|
||`flatMapLatest(value: Observable, resultSelector?: function)`|`switchMapTo(value: Observable, resultSelector?: function)`|
|`concatMap`|`concatMap(project: function, resultSelector?: function)`|`concatMapTo(project: function, resultSelector?: function)`|
||`concatMap(value: Observable, resultSelector?: function)`|`concatMapTo(value: Observable, resultSelector?: function)`|
|`buffer`|`buffer(closings: Observable)`|`buffer(closings: Observable)`|
||`buffer(closingNotifierFactory: function)`|`bufferWhen(closingNotifierFactory: function)`|
||`buffer(openings: Observable, closingSelector?: function)`|`bufferToggle(openings: Observable, closingSelector?: function)`|
|`window`|`window(closings: Observable)`|`window(closings: Observable)`|
||`window(closingNotifierFactory: function)`|`windowWhen(closingNotifierFactory: function)`|
||`window(openings: Observable, closingSelector?: function)`|`windowToggle(openings: Observable, closingSelector?: function)`|
|`debounce`|`debounce(durationSelector: Observable)`|`debounce(durationSelector: Observable)`|
||`debounce(delay: number, scheduler?: Scheduler)`|`debounceTime(delay: number, scheduler?: Scheduler)`|
|`throttle`|`throttle(durationSelector: Observable)`|`throttle(durationSelector: Observable)`|
||`throttle(delay: number, scheduler?: Scheduler)`|`throttleTime(delay: number, scheduler?: Scheduler)`|


## Schedulers Renamed

The names of the Schedulers in RxJS 4 were based off of the Rx.NET implentation. Consequently, some of the names
didn't make sense in a JavaScript context (for example: `currentThread` when there's only one thread anyhow).

|RxJS 4|RxJS 5||
|------|------|---|
|`Rx.Scheduler.default`|`Rx.Scheduler.asap`|schedules on the micro task queue|
|`Rx.Scheduler.currentThread`|`Rx.Scheduler.queue`|schedules on a queue in the current event frame (trampoline scheduler)|
|`Rx.Scheduler.immediate`|`undefined`|by not passing a scheduler to operators that request it, it defaults to recursive execution|


## Unimplemented Operators/Features

If there is a feature that used to exist in RxJS 4, but no longer does in RxJS 5, please be sure to file an issue (and preferrably a PR).
In your issue, please describe the use case you have for the operator so we can better understand your need and prioritize it, and/or find
and alternative way to compose the desired behavior.