[API](../../index.md) / [index](../index.md) / switchMapTo

# ~~Function: switchMapTo()~~

> Projects each source value to the same Observable which is flattened multiple
> times with [switchMap](switchMap.md) in the output Observable.

## Description

<span class="informal">It's like [switchMap](switchMap.md), but maps each value
always to the same inner Observable.</span>

![](switchMapTo.png)

Maps each source value to the given Observable `innerObservable` regardless
of the source value, and then flattens those resulting Observables into one
single Observable, which is the output Observable. The output Observables
emits values only from the most recently emitted instance of
`innerObservable`.

## Example

Restart an interval Observable on every click event

```ts
import { fromEvent, switchMapTo, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(switchMapTo(interval(1000)));
result.subscribe(x => console.log(x));
```

**deprecated**: Will be removed in v9. Use [switchMap](switchMap.md) instead: `switchMap(() => result)`

## See

 - [concatMapTo](concatMapTo.md)
 - [switchAll](switchAll.md)
 - [switchMap](switchMap.md)
 - [mergeMapTo](mergeMapTo.md)


source Observable.

## Deprecated

Will be removed in v9. Use [switchMap](switchMap.md) instead: `switchMap(() => result)`

## Parameters

### `innerObservable`

An `ObservableInput` to replace each value from the

## Returns

`A function that returns an Observable that emits items from the
given`

(and optionally transformed through the deprecated
) every time a value is emitted on the source Observable,
and taking only the values from the most recently projected inner
Observable.


## Call Signature

```ts
function switchMapTo<>(observable: O): OperatorFunction<unknown, ObservedValueOf<O>>;
```

Defined in: [internal/operators/switchMapTo.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/switchMapTo.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `observable` | `O` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`unknown`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

Will be removed in v9. Use [switchMap](switchMap.md) instead: `switchMap(() => result)`

## Call Signature

```ts
function switchMapTo<>(observable: O, resultSelector: undefined): OperatorFunction<unknown, ObservedValueOf<O>>;
```

Defined in: [internal/operators/switchMapTo.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/switchMapTo.ts#L8)

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
function switchMapTo<>(observable: O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
```

Defined in: [internal/operators/switchMapTo.ts:13](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/switchMapTo.ts#L13)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `observable` | `O` |
| `resultSelector` | (`outerValue`: `T`, `innerValue`: [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>, `outerIndex`: `number`, `innerIndex`: `number`) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector
