[API](../../index.md) / [index](../index.md) / exhaustMap

# Function: exhaustMap()

> Projects each source value to an Observable which is merged in the output
> Observable only if the previous projected Observable has completed.

## Description

<span class="informal">Maps each value to an Observable, then flattens all of
these inner Observables using [exhaustAll](exhaustAll.md).</span>

![](exhaustMap.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an (so-called "inner") Observable. When it projects a source value to
an Observable, the output Observable begins emitting the items emitted by
that projected Observable. However, `exhaustMap` ignores every new projected
Observable if the previous projected Observable has not yet completed. Once
that one completes, it will accept and flatten the next projected Observable
and repeat this process.

## Example

Run a finite timer for each click, only if there is no currently active timer

```ts
import { fromEvent, exhaustMap, interval, take } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  exhaustMap(() => interval(1000).pipe(take(5)))
);
result.subscribe(x => console.log(x));
```

## See

 - [concatMap](concatMap.md)
 - [exhaust](../variables/exhaust.md)
 - [mergeMap](mergeMap.md)
 - [switchMap](switchMap.md)


Observable, returns an Observable.

## Parameters

### `project`

A function that, when applied to an item emitted by the source

## Returns

`A`

function that returns an Observable containing projected Observables of each item of the source, ignoring projected Observables that start before their preceding Observable has completed.


## Call Signature

```ts
function exhaustMap<>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/exhaustMap.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/exhaustMap.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

## Call Signature

```ts
function exhaustMap<>(project: (value: T, index: number) => O, resultSelector: undefined): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/exhaustMap.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/exhaustMap.ts#L14)

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
function exhaustMap<>(project: (value: T, index: number) => ObservableInput<I>, resultSelector: (outerValue: T, innerValue: I, outerIndex: number, innerIndex: number) => R): OperatorFunction<T, R>;
```

Defined in: [internal/operators/exhaustMap.ts:19](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/exhaustMap.ts#L19)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`I`\> |
| `resultSelector` | (`outerValue`: `T`, `innerValue`: `I`, `outerIndex`: `number`, `innerIndex`: `number`) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector
