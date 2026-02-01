[API](../../index.md) / [index](../index.md) / mergeMapTo

# ~~Function: mergeMapTo()~~

> Projects each source value to the same Observable which is merged multiple
> times in the output Observable.

## Description

<span class="informal">It's like [mergeMap](mergeMap.md), but maps each value always
to the same inner Observable.</span>

![](mergeMapTo.png)

Maps each source value to the given Observable `innerObservable` regardless
of the source value, and then merges those resulting Observables into one
single Observable, which is the output Observable.

## Example

For each click event, start an interval Observable ticking every 1 second

```ts
import { fromEvent, mergeMapTo, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(mergeMapTo(interval(1000)));

result.subscribe(x => console.log(x));
```

**deprecated**: Will be removed in v9. Use [mergeMap](mergeMap.md) instead: `mergeMap(() => result)`

## See

 - [concatMapTo](concatMapTo.md)
 - [merge](merge.md)
 - [mergeAll](mergeAll.md)
 - [mergeMap](mergeMap.md)
 - [mergeScan](mergeScan.md)
 - [switchMapTo](switchMapTo.md)


source Observable.


concurrently.

## Deprecated

Will be removed in v9. Use [mergeMap](mergeMap.md) instead: `mergeMap(() => result)`

## Parameters

### `innerObservable`

An `ObservableInput` to replace each value from the

### `concurrent`

Maximum number of input Observables being subscribed to

## Returns

`A`

function that returns an Observable that emits items from the given .


## Call Signature

```ts
function mergeMapTo<>(innerObservable: O, concurrent?: number): OperatorFunction<unknown, ObservedValueOf<O>>;
```

Defined in: [internal/operators/mergeMapTo.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/mergeMapTo.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `innerObservable` | `O` |
| `concurrent?` | `number` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`unknown`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

Will be removed in v9. Use [mergeMap](mergeMap.md) instead: `mergeMap(() => result)`

## Call Signature

```ts
function mergeMapTo<>(
   innerObservable: O, 
   resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, 
concurrent?: number): OperatorFunction<T, R>;
```

Defined in: [internal/operators/mergeMapTo.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/mergeMapTo.ts#L14)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `innerObservable` | `O` |
| `resultSelector` | (`outerValue`: `T`, `innerValue`: [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>, `outerIndex`: `number`, `innerIndex`: `number`) => `R` |
| `concurrent?` | `number` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead.
Details: https://rxjs.dev/deprecations/resultSelector
