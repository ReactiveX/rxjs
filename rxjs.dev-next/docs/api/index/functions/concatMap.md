[API](../../index.md) / [index](../index.md) / concatMap

# Function: concatMap()

> Projects each source value to an Observable which is merged in the output
> Observable, in a serialized fashion waiting for each one to complete before
> merging the next.

## Description

<span class="informal">Maps each value to an Observable, then flattens all of
these inner Observables using [concatAll](concatAll.md).</span>

![](concatMap.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an (so-called "inner") Observable. Each new inner Observable is
concatenated with the previous inner Observable.

__Warning:__ if source values arrive endlessly and faster than their
corresponding inner Observables can complete, it will result in memory issues
as inner Observables amass in an unbounded buffer waiting for their turn to
be subscribed to.

Note: `concatMap` is equivalent to `mergeMap` with concurrency parameter set
to `1`.

## Example

For each click event, tick every second from 0 to 3, with no concurrency

```ts
import { fromEvent, concatMap, interval, take } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  concatMap(ev => interval(1000).pipe(take(4)))
);
result.subscribe(x => console.log(x));

// Results in the following:
// (results are not concurrent)
// For every click on the "document" it will emit values 0 to 3 spaced
// on a 1000ms interval
// one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3
```

## See

 - [concat](concat.md)
 - [concatAll](concatAll.md)
 - [concatMapTo](concatMapTo.md)
 - [exhaustMap](exhaustMap.md)
 - [mergeMap](mergeMap.md)
 - [switchMap](switchMap.md)


Observable, returns an Observable.

## Parameters

### `project`

A function that, when applied to an item emitted by the source

## Returns

`A`

function that returns an Observable that emits the result of applying the projection function (and the optional deprecated ) to each item emitted by the source Observable and taking values from each projected inner Observable sequentially.


## Call Signature

```ts
function concatMap<>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/concatMap.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/concatMap.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

## Call Signature

```ts
function concatMap<>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/concatMap.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/concatMap.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `resultSelector` | `undefined` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector

## Call Signature

```ts
function concatMap<>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
```

Defined in: [internal/operators/concatMap.ts:15](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/concatMap.ts#L15)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `resultSelector` | (`outerValue`: `T`, `innerValue`: [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>, `outerIndex`: `number`, `innerIndex`: `number`) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector
