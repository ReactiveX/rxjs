# Operators

RxJS is mostly useful for its *operators*, even though the Observable is the foundation. Operators are the essential pieces that allow complex asynchronous code to be easily composed in a declarative manner.

## What are operators?

Operators are **functions**. There are two kinds of operators:

**Pipeable Operators** are the kind that can be piped to Observables using the syntax `observableInstance.pipe(operator())`. These include `map(...)`, `filter(...)`, and `mergeMap(...)`. When called, they do not *change* the existing Observable instance. Instead, they return a *new* Observable, whose subscription logic is based on the first Observable.

<span class="informal">A Pipeable Operator is a function that creates a new Observable based on the current Observable. This is a pure operation: the previous Observable stays unmodified.</span>

An Pipeable Operator is essentially a pure function which takes one Observable as input and generates another Observable as output. Subscribing to the output Observable will also subscribe to the input Observable.

**Creation Operators** are the other kind of operator that can be called as standalone functions to create a new Observable. For example: `of(1, 2, 3)`. These will be discussed in more detail in the next section.

In the following example, we create a custom pipeable operator function that multiplies each value received from the input Observable by 10. We test this by creating a new Observable using the creation operator function `from` which can create an Observable from an array of values.

```ts
import { from, Observable } from 'rxjs';

const multiplyByTen = () => (source) => {
  return new Observable((subscriber) => {
    source.subscribe({
      next(value) { subscriber.next(10 * value); },
      error(err) { subscriber.error(err); },
      complete() { subscriber.complete() },
    });
  });
};

const input = from([1, 2, 3, 4]);
const output = input.pipe(multiplyByTen());
output.subscribe(x => console.log(x));

// Logs:
// 10
// 20
// 30
// 40
```

Notice that a subscribe to `output` will cause the `input` Observable to be subscribed. We call this an "operator subscription chain".

You can also create custom operators by wrapping calls to existing operators. We can reimplement our `multiplyByTen` operator by wrapping the `map` operator which will project our multiplication function over values emitted by the source Observable.

```ts
import { map } from 'rxjs/operators';

const multiplyByTen = () => map((value) => 10 * value);
```

## Creation Operators

**What are creation operators?** Besides pipeable operators, creation operators are functions that can be used to create an Observable with some common predefined behavior or by joining other Observables.

A typical example of a creation operator would be the `interval` function. It takes a number (not an Observable) as input argument, and produces an Observable as output:

```ts
import { interval } from 'rxjs';

const observable = interval(1000 /* number of milliseconds */);
```

See the list of [all static creation operators here](#creation-operators).

Some *Join Operators* such as `merge`, `combineLatest`, `concat`, etc. take *multiple* Observables as input, not just one, for instance:

```ts
import { interval, merge } from 'rxjs';

const observable1 = interval(1000);
const observable2 = interval(400);

const merged = merge(observable1, observable2);
```

Join operators emit the values of multiple source Observables according to their logic.

## Marble diagrams

To explain how operators work, textual descriptions are often not enough. Many operators are related to time, they may for instance delay, sample, throttle, or debounce value emissions in different ways. Diagrams are often a better tool for that. *Marble Diagrams* are visual representations of how operators work, and include the input Observable(s), the operator and its parameters, and the output Observable.

<span class="informal">In a marble diagram, time flows to the right, and the diagram describes how values ("marbles") are emitted on the Observable execution.</span>

Below you can see the anatomy of a marble diagram.

<img src="assets/images/guide/marble-diagram-anatomy.svg">

Throughout this documentation site, we extensively use marble diagrams to explain how operators work. They may be really useful in other contexts too, like on a whiteboard or even in our unit tests (as ASCII diagrams).

## Categories of operators

There are operators for different purposes, and they may be categorized as: creation, transformation, filtering, joining, multicasting, error handling, utility, etc. In the following list you will find all the operators organized in categories.

For a complete overview, see the [references page](/api).

### Creation Operators

- [`ajax`](/api/ajax/ajax)
- [`bindCallback`](/api/index/function/bindCallback)
- [`bindNodeCallback`](/api/index/function/bindNodeCallback)
- [`defer`](/api/index/function/defer)
- [`empty`](/api/index/function/empty)
- [`from`](/api/index/function/from)
- [`fromEvent`](/api/index/function/fromEvent)
- [`fromEventPattern`](/api/index/function/fromEventPattern)
- [`generate`](/api/index/function/generate)
- [`interval`](/api/index/function/interval)
- [`of`](/api/index/function/of)
- [`range`](/api/index/function/range)
- [`throwError`](/api/index/function/throwError)
- [`timer`](/api/index/function/timer)
- [`iif`](/api/index/function/iif)

### Join Creation Operators
These are Observable creation operators that also have join functionality -- emitting values of multiple source Observables.

- [`combineLatest`](/api/index/function/combineLatest)
- [`concat`](/api/index/function/concat)
- [`forkJoin`](/api/index/function/forkJoin)
- [`merge`](/api/index/function/merge)
- [`race`](/api/index/function/race)
- [`zip`](/api/index/function/zip)

### Transformation Operators

- [`buffer`](/api/operators/buffer)
- [`bufferCount`](/api/operators/bufferCount)
- [`bufferTime`](/api/operators/bufferTime)
- [`bufferToggle`](/api/operators/bufferToggle)
- [`bufferWhen`](/api/operators/bufferWhen)
- [`concatMap`](/api/operators/concatMap)
- [`concatMapTo`](/api/operators/concatMapTo)
- [`exhaust`](/api/operators/exhaust)
- [`exhaustMap`](/api/operators/exhaustMap)
- [`expand`](/api/operators/expand)
- [`groupBy`](/api/operators/groupBy)
- [`map`](/api/operators/map)
- [`mapTo`](/api/operators/mapTo)
- [`mergeMap`](/api/operators/mergeMap)
- [`mergeMapTo`](/api/operators/mergeMapTo)
- [`mergeScan`](/api/operators/mergeScan)
- [`pairwise`](/api/operators/pairwise)
- [`partition`](/api/operators/partition)
- [`pluck`](/api/operators/pluck)
- [`scan`](/api/operators/scan)
- [`switchMap`](/api/operators/switchMap)
- [`switchMapTo`](/api/operators/switchMapTo)
- [`window`](/api/operators/window)
- [`windowCount`](/api/operators/windowCount)
- [`windowTime`](/api/operators/windowTime)
- [`windowToggle`](/api/operators/windowToggle)
- [`windowWhen`](/api/operators/windowWhen)

### Filtering Operators

- [`audit`](/api/operators/audit)
- [`auditTime`](/api/operators/auditTime)
- [`debounce`](/api/operators/debounce)
- [`debounceTime`](/api/operators/debounceTime)
- [`distinct`](/api/operators/distinct)
- [`distinctKey`](../class/es6/Observable.js~Observable.html#instance-method-distinctKey)
- [`distinctUntilChanged`](/api/operators/distinctUntilChanged)
- [`distinctUntilKeyChanged`](/api/operators/distinctUntilKeyChanged)
- [`elementAt`](/api/operators/elementAt)
- [`filter`](/api/operators/filter)
- [`first`](/api/operators/first)
- [`ignoreElements`](/api/operators/ignoreElements)
- [`last`](/api/operators/last)
- [`sample`](/api/operators/sample)
- [`sampleTime`](/api/operators/sampleTime)
- [`single`](/api/operators/single)
- [`skip`](/api/operators/skip)
- [`skipLast`](/api/operators/skipLast)
- [`skipUntil`](/api/operators/skipUntil)
- [`skipWhile`](/api/operators/skipWhile)
- [`take`](/api/operators/take)
- [`takeLast`](/api/operators/takeLast)
- [`takeUntil`](/api/operators/takeUntil)
- [`takeWhile`](/api/operators/takeWhile)
- [`throttle`](/api/operators/throttle)
- [`throttleTime`](/api/operators/throttleTime)

### Join Operators
Also see the [Join Creation Operators](#join-creation-operators) section above.

- [`combineAll`](/api/operators/combineAll)
- [`concatAll`](/api/operators/concatAll)
- [`exhaust`](/api/operators/exhaust)
- [`mergeAll`](/api/operators/mergeAll)
- [`startWith`](/api/operators/startWith)
- [`withLatestFrom`](/api/operators/withLatestFrom)

### Multicasting Operators

- [`multicast`](/api/operators/multicast)
- [`publish`](/api/operators/publish)
- [`publishBehavior`](/api/operators/publishBehavior)
- [`publishLast`](/api/operators/publishLast)
- [`publishReplay`](/api/operators/publishReplay)
- [`share`](/api/operators/share)

### Error Handling Operators

- [`catchError`](/api/operators/catchError)
- [`retry`](/api/operators/retry)
- [`retryWhen`](/api/operators/retryWhen)

### Utility Operators

- [`tap`](/api/operators/tap)
- [`delay`](/api/operators/delay)
- [`delayWhen`](/api/operators/delayWhen)
- [`dematerialize`](/api/operators/dematerialize)
- [`materialize`](/api/operators/materialize)
- [`observeOn`](/api/operators/observeOn)
- [`subscribeOn`](/api/operators/subscribeOn)
- [`timeInterval`](/api/operators/timeInterval)
- [`timestamp`](/api/operators/timestamp)
- [`timeout`](/api/operators/timeout)
- [`timeoutWith`](/api/operators/timeoutWith)
- [`toArray`](/api/operators/toArray)

### Conditional and Boolean Operators

- [`defaultIfEmpty`](/api/operators/defaultIfEmpty)
- [`every`](/api/operators/every)
- [`find`](/api/operators/find)
- [`findIndex`](/api/operators/findIndex)
- [`isEmpty`](/api/operators/isEmpty)

### Mathematical and Aggregate Operators

- [`count`](/api/operators/count)
- [`max`](/api/operators/max)
- [`min`](/api/operators/min)
- [`reduce`](/api/operators/reduce)
