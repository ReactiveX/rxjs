[API](../../index.md) / [index](../index.md) / range

# Function: range()

> Creates an Observable that emits a sequence of numbers within a specified
> range.

## Description

<span class="informal">Emits a sequence of numbers in a range.</span>

![](range.png)

`range` operator emits a range of sequential integers, in order, where you
select the `start` of the range and its `length`. By default, uses no
[SchedulerLike](../interfaces/SchedulerLike.md) and just delivers the notifications synchronously, but may use
an optional [SchedulerLike](../interfaces/SchedulerLike.md) to regulate those deliveries.

## Example

Produce a range of numbers

```ts
import { range } from 'rxjs';

const numbers = range(1, 3);

numbers.subscribe({
  next: value => console.log(value),
  complete: () => console.log('Complete!')
});

// Logs:
// 1
// 2
// 3
// 'Complete!'
```

## See

 - [timer](timer.md)
 - [interval](interval.md)






of the notifications.

## Parameters

### `start`

The value of the first integer in the sequence.

### `count`

The number of sequential integers to generate.

### `scheduler`

A [SchedulerLike](../interfaces/SchedulerLike.md) to use for scheduling the emissions

## Returns

`An`

Observable of numbers that emits a finite range of sequential integers.


## Call Signature

```ts
function range(start: number, count?: number): Observable<number>;
```

Defined in: [internal/observable/range.ts:5](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/range.ts#L5)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `start` | `number` |
| `count?` | `number` |

### Returns

[`Observable`](../classes/Observable.md)\<`number`\>

## Call Signature

```ts
function range(
   start: number, 
   count: number | undefined, 
scheduler: SchedulerLike): Observable<number>;
```

Defined in: [internal/observable/range.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/range.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `start` | `number` |
| `count` | `number` \| `undefined` |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`Observable`](../classes/Observable.md)\<`number`\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `range(start, count).pipe(observeOn(scheduler))` instead. Details: Details: https://rxjs.dev/deprecations/scheduler-argument
