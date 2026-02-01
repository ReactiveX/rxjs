[API](../../index.md) / [index](../index.md) / endWith

# ~~Function: endWith()~~

> Returns an observable that will emit all values from the source, then synchronously emit
> the provided value(s) immediately after the source completes.

## Description

NOTE: Passing a last argument of a Scheduler is _deprecated_, and may result in incorrect
types in TypeScript.

This is useful for knowing when an observable ends. Particularly when paired with an
operator like [takeUntil](takeUntil.md)

![](endWith.png)

## Example

Emit values to know when an interval starts and stops. The interval will
stop when a user clicks anywhere on the document.

```ts
import { interval, map, fromEvent, startWith, takeUntil, endWith } from 'rxjs';

const ticker$ = interval(5000).pipe(
  map(() => 'tick')
);

const documentClicks$ = fromEvent(document, 'click');

ticker$.pipe(
  startWith('interval started'),
  takeUntil(documentClicks$),
  endWith('interval ended by click')
)
.subscribe(x => console.log(x));

// Result (assuming a user clicks after 15 seconds)
// 'interval started'
// 'tick'
// 'tick'
// 'tick'
// 'interval ended by click'
```

## See

 - [startWith](startWith.md)
 - [concat](concat.md)
 - [takeUntil](takeUntil.md)



## Parameters

### `values`

Items you want the modified Observable to emit last.

## Returns

`A`

function that returns an Observable that emits all values from the source, then synchronously emits the provided value(s) immediately after the source completes.


## Call Signature

```ts
function endWith<>(scheduler: SchedulerLike): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/endWith.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/endWith.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `scheduled` and `concatAll`. Details: https://rxjs.dev/deprecations/scheduler-argument

## Call Signature

```ts
function endWith<>(...valuesAndScheduler: [...A[], SchedulerLike]): OperatorFunction<T, T | ValueFromArray<A>>;
```

Defined in: [internal/operators/endWith.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/endWith.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`valuesAndScheduler` | \[`...A[]`, [`SchedulerLike`](../interfaces/SchedulerLike.md)\] |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| [`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `scheduled` and `concatAll`. Details: https://rxjs.dev/deprecations/scheduler-argument

## Call Signature

```ts
function endWith<>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;
```

Defined in: [internal/operators/endWith.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/endWith.ts#L14)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`values` | `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| [`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `scheduled` and `concatAll`. Details: https://rxjs.dev/deprecations/scheduler-argument
