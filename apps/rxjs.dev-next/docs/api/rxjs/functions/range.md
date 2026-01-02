[API](../../index.md) / [rxjs](../index.md) / range

# ~~Function: range()~~

> Creates an Observable that emits a sequence of numbers within a specified
> range.

## Description

<span class="informal">Emits a sequence of numbers in a range.</span>

![](/images/marble-diagrams/range.png)

`range` operator emits a range of sequential integers, in order, where you
select the `start` of the range and its `length`. By default, uses no
[SchedulerLike](../interfaces/SchedulerLike.md) and just delivers the notifications synchronously, but may use
an optional [SchedulerLike](../interfaces/SchedulerLike.md) to regulate those deliveries.

```ts
function range(start: number, count: number | undefined, scheduler: SchedulerLike): Observable<number>;
```

Defined in: [rxjs/src/internal/observable/range.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/range.ts#L11)

## Parameters

| Parameter   | Type                                              |
| ----------- | ------------------------------------------------- |
| `start`     | `number`                                          |
| `count`     | `number` \| `undefined`                           |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

## Returns

[`Observable`](../classes/Observable.md)\<`number`\>

## Deprecated

The `scheduler` parameter will be removed in v8. Use `range(start, count).pipe(observeOn(scheduler))` instead. Details: Details: https://rxjs.dev/deprecations/scheduler-argument
