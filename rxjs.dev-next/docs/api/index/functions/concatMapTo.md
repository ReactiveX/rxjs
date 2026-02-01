[API](../../index.md) / [index](../index.md) / concatMapTo

# ~~Function: concatMapTo()~~

> Projects each source value to the same Observable which is merged multiple
> times in a serialized fashion on the output Observable.

## Description

<span class="informal">It's like [concatMap](concatMap.md), but maps each value
always to the same inner Observable.</span>

![](concatMapTo.png)

Maps each source value to the given Observable `innerObservable` regardless
of the source value, and then flattens those resulting Observables into one
single Observable, which is the output Observable. Each new `innerObservable`
instance emitted on the output Observable is concatenated with the previous
`innerObservable` instance.

__Warning:__ if source values arrive endlessly and faster than their
corresponding inner Observables can complete, it will result in memory issues
as inner Observables amass in an unbounded buffer waiting for their turn to
be subscribed to.

Note: `concatMapTo` is equivalent to `mergeMapTo` with concurrency parameter
set to `1`.

## Example

For each click event, tick every second from 0 to 3, with no concurrency

```ts
import { fromEvent, concatMapTo, interval, take } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  concatMapTo(interval(1000).pipe(take(4)))
);
result.subscribe(x => console.log(x));

// Results in the following:
// (results are not concurrent)
// For every click on the "document" it will emit values 0 to 3 spaced
// on a 1000ms interval
// one click = 1000ms-> 0 -1000ms-> 1 -1000ms-> 2 -1000ms-> 3
```

**deprecated**: Will be removed in v9. Use [concatMap](concatMap.md) instead: `concatMap(() => result)`

## See

 - [concat](concat.md)
 - [concatAll](concatAll.md)
 - [concatMap](concatMap.md)
 - [mergeMapTo](mergeMapTo.md)
 - [switchMapTo](switchMapTo.md)


source Observable.

## Deprecated

Will be removed in v9. Use [concatMap](concatMap.md) instead: `concatMap(() => result)`

## Parameters

### `innerObservable`

An `ObservableInput` to replace each value from the

## Returns

`A`

function that returns an Observable of values merged together by joining the passed Observable with itself, one after the other, for each value emitted from the source.


## Call Signature

```ts
function concatMapTo<>(observable: O): OperatorFunction<unknown, ObservedValueOf<O>>;
```

Defined in: [internal/operators/concatMapTo.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/concatMapTo.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `observable` | `O` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`unknown`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

Will be removed in v9. Use [concatMap](concatMap.md) instead: `concatMap(() => result)`

## Call Signature

```ts
function concatMapTo<>(observable: O, resultSelector: undefined): OperatorFunction<unknown, ObservedValueOf<O>>;
```

Defined in: [internal/operators/concatMapTo.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/concatMapTo.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `observable` | `O` |
| `resultSelector` | `undefined` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`unknown`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector

## Call Signature

```ts
function concatMapTo<>(observable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
```

Defined in: [internal/operators/concatMapTo.ts:13](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/concatMapTo.ts#L13)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `observable` | `O` |
| `resultSelector` | (`outerValue`: `T`, `innerValue`: [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>, `outerIndex`: `number`, `innerIndex`: `number`) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector
