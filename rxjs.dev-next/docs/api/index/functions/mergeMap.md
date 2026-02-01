[API](../../index.md) / [index](../index.md) / mergeMap

# Function: mergeMap()

> Projects each source value to an Observable which is merged in the output
> Observable.

## Description

<span class="informal">Maps each value to an Observable, then flattens all of
these inner Observables using [mergeAll](mergeAll.md).</span>

![](mergeMap.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an Observable, and then merging those resulting Observables and
emitting the results of this merger.

## Example

Map and flatten each letter to an Observable ticking every 1 second

```ts
import { of, mergeMap, interval, map } from 'rxjs';

const letters = of('a', 'b', 'c');
const result = letters.pipe(
  mergeMap(x => interval(1000).pipe(map(i => x + i)))
);

result.subscribe(x => console.log(x));

// Results in the following:
// a0
// b0
// c0
// a1
// b1
// c1
// continues to list a, b, c every second with respective ascending integers
```

## See

 - [concatMap](concatMap.md)
 - [exhaustMap](exhaustMap.md)
 - [merge](merge.md)
 - [mergeAll](mergeAll.md)
 - [mergeMapTo](mergeMapTo.md)
 - [mergeScan](mergeScan.md)
 - [switchMap](switchMap.md)


Observable, returns an Observable.



## Parameters

### `project`

A function that, when applied to an item emitted by the source

### `concurrent`

Maximum number of `ObservableInput`s being subscribed to concurrently.

## Returns

`A`

function that returns an Observable that emits the result of applying the projection function (and the optional deprecated ) to each item emitted by the source Observable and merging the results of the Observables obtained from this transformation.


## Call Signature

```ts
function mergeMap<>(project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/mergeMap.ts:9](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/mergeMap.ts#L9)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `concurrent?` | `number` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

## Call Signature

```ts
function mergeMap<>(
   project: (value: T, index: number) => O, 
   resultSelector: undefined, 
concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/mergeMap.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/mergeMap.ts#L14)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `resultSelector` | `undefined` |
| `concurrent?` | `number` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector

## Call Signature

```ts
function mergeMap<>(
   project: (value: T, index: number) => O, 
   resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, 
concurrent?: number): OperatorFunction<T, R>;
```

Defined in: [internal/operators/mergeMap.ts:20](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/mergeMap.ts#L20)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `resultSelector` | (`outerValue`: `T`, `innerValue`: [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>, `outerIndex`: `number`, `innerIndex`: `number`) => `R` |
| `concurrent?` | `number` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector
