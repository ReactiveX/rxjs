[API](../../index.md) / [index](../index.md) / switchMap

# Function: switchMap()

> Projects each source value to an Observable which is merged in the output
> Observable, emitting values only from the most recently projected Observable.

## Description

<span class="informal">Maps each value to an Observable, then flattens all of
these inner Observables using [switchAll](switchAll.md).</span>

![](switchMap.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an (so-called "inner") Observable. Each time it observes one of these
inner Observables, the output Observable begins emitting the items emitted by
that inner Observable. When a new inner Observable is emitted, `switchMap`
stops emitting items from the earlier-emitted inner Observable and begins
emitting items from the new one. It continues to behave like this for
subsequent inner Observables.

## Example

Generate new Observable according to source Observable values

```ts
import { of, switchMap } from 'rxjs';

const switched = of(1, 2, 3).pipe(switchMap(x => of(x, x ** 2, x ** 3)));
switched.subscribe(x => console.log(x));
// outputs
// 1
// 1
// 1
// 2
// 4
// 8
// 3
// 9
// 27
```

Restart an interval Observable on every click event

```ts
import { fromEvent, switchMap, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(switchMap(() => interval(1000)));
result.subscribe(x => console.log(x));
```

## See

 - [concatMap](concatMap.md)
 - [exhaustMap](exhaustMap.md)
 - [mergeMap](mergeMap.md)
 - [switchAll](switchAll.md)
 - [switchMapTo](switchMapTo.md)


Observable, returns an Observable.

## Parameters

### `project`

A function that, when applied to an item emitted by the source

## Returns

`A`

function that returns an Observable that emits the result of applying the projection function (and the optional deprecated ) to each item emitted by the source Observable and taking only the values from the most recently projected inner Observable.


## Call Signature

```ts
function switchMap<>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/switchMap.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/switchMap.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

## Call Signature

```ts
function switchMap<>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/switchMap.ts:12](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/switchMap.ts#L12)

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
function switchMap<>(project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
```

Defined in: [internal/operators/switchMap.ts:17](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/switchMap.ts#L17)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `resultSelector` | (`outerValue`: `T`, `innerValue`: [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>, `outerIndex`: `number`, `innerIndex`: `number`) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector
