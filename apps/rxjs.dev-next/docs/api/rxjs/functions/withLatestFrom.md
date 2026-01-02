[API](../../index.md) / [rxjs](../index.md) / withLatestFrom

# Function: withLatestFrom()

> Combines the source Observable with other Observables to create an Observable
> whose values are calculated from the latest values of each, only when the
> source emits.

## Description

<span class="informal">Whenever the source Observable emits a value, it
computes a formula using that value plus the latest values from other input
Observables, then emits the output of that formula.</span>

![](/images/marble-diagrams/withLatestFrom.png)

`withLatestFrom` combines each value from the source Observable (the
instance) with the latest values from the other input Observables only when
the source emits a value, optionally using a `project` function to determine
the value to be emitted on the output Observable. All input Observables must
emit at least one value before the output Observable will emit a value.

```ts
function withLatestFrom<>(...inputs: [...ObservableInputTuple<O>[], (...value: [T, ...O[]]) => R]): OperatorFunction<T, R>;
```

Defined in: [rxjs/src/internal/operators/withLatestFrom.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/withLatestFrom.ts#L9)

Combines the source Observable with other Observables to create an Observable
whose values are calculated from the latest values of each, only when the
source emits.

<span class="informal">Whenever the source Observable emits a value, it
computes a formula using that value plus the latest values from other input
Observables, then emits the output of that formula.</span>

![](/images/marble-diagrams/withLatestFrom.png)

`withLatestFrom` combines each value from the source Observable (the
instance) with the latest values from the other input Observables only when
the source emits a value, optionally using a `project` function to determine
the value to be emitted on the output Observable. All input Observables must
emit at least one value before the output Observable will emit a value.

## Parameters

| Parameter   | Type                                                                       |
| ----------- | -------------------------------------------------------------------------- |
| ...`inputs` | \[`...ObservableInputTuple<O>[]`, (...`value`: \[`T`, `...O[]`\]) => `R`\] |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

## Example

On every click event, emit an array with the latest timer event plus the click event

```ts
import { fromEvent, interval, withLatestFrom } from 'rxjs';

const clicks = fromEvent(document, 'click');
const timer = interval(1000);
const result = clicks.pipe(withLatestFrom(timer));
result.subscribe((x) => console.log(x));
```

## See

[combineLatest](combineLatest.md)

## Param

An input Observable to combine with the source Observable. More
than one input Observables may be given as argument. If the last parameter is
a function, it will be used as a projection function for combining values
together. When the function is called, it receives all values in order of the
Observables passed, where the first parameter is a value from the source
Observable. (e.g.
`a.pipe(withLatestFrom(b, c), map(([a1, b1, c1]) => a1 + b1 + c1))`). If this
is not passed, arrays will be emitted on the output Observable.
