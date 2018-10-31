# Operators

RxJS is mostly useful for its *operators*, even though the Observable is the foundation. Operators are the essential pieces that allow complex asynchronous code to be easily composed in a declarative manner.

## What are operators?

Operators are **methods** on the Observable type, such as `.map(...)`, `.filter(...)`, `.merge(...)`, etc. When called, they do not *change* the existing Observable instance. Instead, they return a *new* Observable, whose subscription logic is based on the first Observable.

<span class="informal">An Operator is a function which creates a new Observable based on the current Observable. This is a pure operation: the previous Observable stays unmodified.</span>

An Operator is essentially a pure function which takes one Observable as input and generates another Observable as output. Subscribing to the output Observable will also subscribe to the input Observable. In the following example, we create a custom operator function that multiplies each value received from the input Observable by 10:

```js
function multiplyByTen(input) {
  var output = Rx.Observable.create(function subscribe(observer) {
    input.subscribe({
      next: (v) => observer.next(10 * v),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
  return output;
}

var input = Rx.from([1, 2, 3, 4]);
var output = multiplyByTen(input);
output.subscribe(x => console.log(x));
```

Which outputs:

```none
10
20
30
40
```

Notice that a subscribe to `output` will cause `input` Observable to be subscribed. We call this an "operator subscription chain".

## Instance operators versus static operators

**What is an instance operator?** Typically when referring to operators, we assume *instance* operators, which are methods on Observable instances. For instance, if the operator `multiplyByTen` would be an official instance operator, it would look roughly like this:

```js
Rx.Observable.prototype.multiplyByTen = function multiplyByTen() {
  var input = this;
  return Rx.Observable.create(function subscribe(observer) {
    input.subscribe({
      next: (v) => observer.next(10 * v),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
}
```

<span class="informal">Instance operators are functions that use the `this` keyword to infer what is the input Observable.</span>

Notice how the `input` Observable is not a function argument anymore, it is assumed to be the `this` object. This is how we would use such instance operator:

```js
var observable = Rx.from([1, 2, 3, 4]).multiplyByTen();

observable.subscribe(x => console.log(x));
```

**What is a static operator?** Besides instance operators, static operators are functions attached to the Observable class directly. A static operator uses no `this` keyword internally, but instead relies entirely on its arguments.

<span class="informal">Static operators are pure functions attached to the Observable class, and usually are used to create Observables from scratch.</span>

The most common type of static operators are the so-called *Creation Operators*. Instead of transforming an input Observable to an output Observable, they simply take a non-Observable argument, like a number, and *create* a new Observable.

A typical example of a static creation operator would be the `interval` function. It takes a number (not an Observable) as input argument, and produces an Observable as output:

```js
var observable = Rx.interval(1000 /* number of milliseconds */);
```

Another example of a creation operator is `of`, which is similar to of but does not do any flattening and emits each argument in whole as a separate next notification. See the list of [all static creation operators here](#creation-operators).

However, static operators may be of different nature than simply creation. Some *Combination Operators* may be static, such as `merge`, `combineLatest`, `concat`, etc. These make sense as static operators because they take *multiple* Observables as input, not just one, for instance:

```js
var observable1 = Rx.interval(1000);
var observable2 = Rx.interval(400);

var merged = Rx.merge(observable1, observable2);
```

## Marble diagrams

To explain how operators work, textual descriptions are often not enough. Many operators are related to time, they may for instance delay, sample, throttle, or debounce value emissions in different ways. Diagrams are often a better tool for that. *Marble Diagrams* are visual representations of how operators work, and include the input Observable(s), the operator and its parameters, and the output Observable.

<span class="informal">In a marble diagram, time flows to the right, and the diagram describes how values ("marbles") are emitted on the Observable execution.</span>

Below you can see the anatomy of a marble diagram.

<img src="generated/images/diagrams/operators/marble-diagram-anatomy.svg">

Throughout this documentation site, we extensively use marble diagrams to explain how operators work. They may be really useful in other contexts too, like on a whiteboard or even in our unit tests (as ASCII diagrams).

## Choose an operator

<div class="decision-tree-widget"></div>

## Categories of operators

There are operators for different purposes, and they may be categorized as: creation, transformation, filtering, combination, multicasting, error handling, utility, etc. In the following list you will find all the operators organized in categories.

### Creation Operators

- [`ajax`](api/ajax/ajax)
- [`bindCallback`](api/index/function/bindCallback)
- [`bindNodeCallback`](api/index/function/bindNodeCallback)
- [`defer`](api/index/function/defer)
- [`empty`](api/index/function/empty)
- [`from`](api/index/function/from)
- [`fromEvent`](api/index/function/fromEvent)
- [`fromEventPattern`](api/index/function/fromEventPattern)
- [`generate`](api/index/function/generate)
- [`interval`](api/index/function/interval)
- [`never`](api/index/function/never)
- [`of`](api/index/function/of)
- [`range`](api/index/function/range)
- [`repeat`](api/operators/repeat)
- [`repeatWhen`](api/operators/repeatWhen)
- [`timer`](api/index/function/timer)

### Transformation Operators

- [`buffer`](api/operators/buffer)
- [`bufferCount`](api/operators/bufferCount)
- [`bufferTime`](api/operators/bufferTime)
- [`bufferToggle`](api/operators/bufferToggle)
- [`bufferWhen`](api/operators/bufferWhen)
- [`concatMap`](api/operators/concatMap)
- [`concatMapTo`](api/operators/concatMapTo)
- [`exhaustMap`](api/operators/exhaustMap)
- [`expand`](api/operators/expand)
- [`flatMap`](api/operators/flatMap)
- [`groupBy`](api/operators/groupBy)
- [`map`](api/operators/map)
- [`mapTo`](api/operators/mapTo)
- [`mergeMap`](api/operators/mergeMap)
- [`mergeMapTo`](api/operators/mergeMapTo)
- [`mergeScan`](api/operators/mergeScan)
- [`pairwise`](api/operators/pairwise)
- [`partition`](api/operators/partition)
- [`pluck`](api/operators/pluck)
- [`scan`](api/operators/scan)
- [`switchAll`](api/operators/switchAll)
- [`switchMap`](api/operators/switchMap)
- [`switchMapTo`](api/operators/switchMapTo)
- [`window`](api/operators/window)
- [`windowCount`](api/operators/windowCount)
- [`windowTime`](api/operators/windowTime)
- [`windowToggle`](api/operators/windowToggle)
- [`windowWhen`](api/operators/windowWhen)

### Filtering Operators

- [`audit`](api/operators/audit)
- [`auditTime`](api/operators/auditTime)
- [`debounce`](api/operators/debounce)
- [`debounceTime`](api/operators/debounceTime)
- [`distinct`](api/operators/distinct)
- [`distinctUntilChanged`](api/operators/distinctUntilChanged)
- [`distinctUntilKeyChanged`](api/operators/distinctUntilKeyChanged)
- [`elementAt`](api/operators/elementAt)
- [`filter`](api/operators/filter)
- [`first`](api/operators/first)
- [`ignoreElements`](api/operators/ignoreElements)
- [`last`](api/operators/last)
- [`sample`](api/operators/sample)
- [`sampleTime`](api/operators/sampleTime)
- [`single`](api/operators/single)
- [`skip`](api/operators/skip)
- [`skipLast`](api/operators/skipLast)
- [`skipUntil`](api/operators/skipUntil)
- [`skipWhile`](api/operators/skipWhile)
- [`take`](api/operators/take)
- [`takeLast`](api/operators/takeLast)
- [`takeUntil`](api/operators/takeUntil)
- [`takeWhile`](api/operators/takeWhile)
- [`throttle`](api/operators/throttle)
- [`throttleTime`](api/operators/throttleTime)

### Combination Operators

- [`combineAll`](api/operators/combineAll)
- [`combineLatest`](api/operators/combineLatest)
- [`concat`](api/operators/concat)
- [`concatAll`](api/operators/concatAll)
- [`exhaust`](api/operators/exhaust)
- [`forkJoin`](api/index/function/forkJoin)
- [`merge`](api/operators/merge)
- [`mergeAll`](api/operators/mergeAll)
- [`race`](api/operators/race)
- [`startWith`](api/operators/startWith)
- [`withLatestFrom`](api/operators/withLatestFrom)
- [`zip`](api/operators/zip)
- [`zipAll`](api/operators/zipAll)

### Multicasting Operators

- [`multicast`](api/operators/multicast)
- [`publish`](api/operators/publish)
- [`publishBehavior`](api/operators/publishBehavior)
- [`publishLast`](api/operators/publishLast)
- [`publishReplay`](api/operators/publishReplay)
- [`share`](api/operators/share)

### Error Handling Operators

- [`catchError`](api/operators/catchError)
- [`onErrorResumeNext`](api/operators/onErrorResumeNext)
- [`retry`](api/operators/retry)
- [`retryWhen`](api/operators/retryWhen)
- [`throwIfEmpty`](api/operators/throwIfEmpty)

### Utility Operators

- [`delay`](api/operators/delay)
- [`delayWhen`](api/operators/delayWhen)
- [`dematerialize`](api/operators/dematerialize)
- [`endWith`](api/operators/endWith)
- `finally`
- `let`
- [`materialize`](api/operators/materialize)
- [`observeOn`](api/operators/observeOn)
- [`shareReplay`](api/operators/shareReplay)
- [`subscribeOn`](api/operators/subscribeOn)
- [`tap`](api/operators/tap)
- [`timeInterval`](api/operators/timeInterval)
- [`timestamp`](api/operators/timestamp)
- [`timeout`](api/operators/timeout)
- [`timeoutWith`](api/operators/timeoutWith)
- [`toArray`](api/operators/toArray)

### Conditional and Boolean Operators

- [`defaultIfEmpty`](api/operators/defaultIfEmpty)
- [`every`](api/operators/every)
- [`finalize`](api/operators/finalize)
- [`find`](api/operators/find)
- [`findIndex`](api/operators/findIndex)
- [`isEmpty`](api/operators/isEmpty)
- [`refCount`](api/operators/refCount)

### Mathematical and Aggregate Operators

- [`count`](api/operators/count)
- [`max`](api/operators/max)
- [`min`](api/operators/min)
- [`reduce`](api/operators/reduce)
- [`refCount`](api/operators/refCount)
