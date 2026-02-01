[API](../../index.md) / [index](../index.md) / startWith

# Function: startWith()

> Returns an observable that, at the moment of subscription, will synchronously emit all
> values provided to this operator, then subscribe to the source and mirror all of its emissions
> to subscribers.

## Description

This is a useful way to know when subscription has occurred on an existing observable.

<span class="informal">First emits its arguments in order, and then any
emissions from the source.</span>

![](startWith.png)

## Examples

Emit a value when a timer starts.

```ts
import { timer, map, startWith } from 'rxjs';

timer(1000)
  .pipe(
    map(() => 'timer emit'),
    startWith('timer start')
  )
  .subscribe(x => console.log(x));

// results:
// 'timer start'
// 'timer emit'
```



## See

 - [endWith](endWith.md)
 - [finalize](finalize.md)
 - [concat](concat.md)

## Parameters

### `values`

Items you want the modified Observable to emit first.


## Returns

`A`

function that returns an Observable that synchronously emits provided values before subscribing to the source Observable.


## Call Signature

```ts
function startWith<>(value: null): OperatorFunction<T, T | null>;
```

Defined in: [internal/operators/startWith.ts:11](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/startWith.ts#L11)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `null` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `null`\>

## Call Signature

```ts
function startWith<>(value: undefined): OperatorFunction<T, T | undefined>;
```

Defined in: [internal/operators/startWith.ts:12](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/startWith.ts#L12)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `undefined` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `undefined`\>

## Call Signature

```ts
function startWith<>(...valuesAndScheduler: [...A[], SchedulerLike]): OperatorFunction<T, T | ValueFromArray<A>>;
```

Defined in: [internal/operators/startWith.ts:15](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/startWith.ts#L15)

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
function startWith<>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;
```

Defined in: [internal/operators/startWith.ts:18](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/startWith.ts#L18)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`values` | `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| [`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>
