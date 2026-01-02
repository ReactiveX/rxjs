[API](../../index.md) / [rxjs](../index.md) / Scheduler

# ~~Class: Scheduler~~

> An execution context and a data structure to order tasks and schedule their
> execution. Provides a notion of (potentially virtual) time, through the
> `now()` getter method.

## Description

Each unit of work in a Scheduler is called an `Action`.

```ts
class Scheduler {
  now(): number;
  schedule(work, delay?, state?): Subscription;
}
```

**deprecated**: Scheduler is an internal implementation detail of RxJS, and
should not be used directly. Rather, create your own class and implement
[SchedulerLike](../interfaces/SchedulerLike.md). Will be made internal in v8.

Defined in: [rxjs/src/internal/Scheduler.ts:24](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Scheduler.ts#L24)

## Deprecated

Scheduler is an internal implementation detail of RxJS, and
should not be used directly. Rather, create your own class and implement
[SchedulerLike](../interfaces/SchedulerLike.md). Will be made internal in v8.

## Implements

- [`SchedulerLike`](../interfaces/SchedulerLike.md)

## Constructors

### Constructor

```ts
new Scheduler(schedulerActionCtor: typeof Action, now: () => number): Scheduler;
```

Defined in: [rxjs/src/internal/Scheduler.ts:27](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Scheduler.ts#L27)

#### Parameters

| Parameter             | Type              | Default value   |
| --------------------- | ----------------- | --------------- |
| `schedulerActionCtor` | _typeof_ `Action` | `undefined`     |
| `now`                 | () => `number`    | `Scheduler.now` |

#### Returns

`Scheduler`

## Properties

| Property                     | Type           | Default value               | Description                                                                                                                                                 |
| ---------------------------- | -------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="now"></a> ~~`now`~~   | () => `number` | `undefined`                 | A getter method that returns a number representing the current time (at the time this function was called) according to the scheduler's own internal clock. |
| <a id="now-1"></a> ~~`now`~~ | () => `number` | `dateTimestampProvider.now` | -                                                                                                                                                           |

## Methods

### ~~schedule()~~

```ts
schedule<>(
   work: (this: SchedulerAction<T>, state?: T) => void,
   delay: number,
   state?: T): Subscription;
```

Defined in: [rxjs/src/internal/Scheduler.ts:57](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Scheduler.ts#L57)

Schedules a function, `work`, for execution. May happen at some point in
the future, according to the `delay` parameter, if specified. May be passed
some context object, `state`, which will be passed to the `work` function.

The given arguments will be processed an stored as an Action object in a
queue of actions.

#### Parameters

| Parameter | Type                                                                                            | Default value | Description                                                                                                  |
| --------- | ----------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| `work`    | (`this`: [`SchedulerAction`](../interfaces/SchedulerAction.md)\<`T`\>, `state?`: `T`) => `void` | `undefined`   | A function representing a task, or some unit of work to be executed by the Scheduler.                        |
| `delay`   | `number`                                                                                        | `0`           | Time to wait before executing the work, where the time unit is implicit and defined by the Scheduler itself. |
| `state?`  | `T`                                                                                             | `undefined`   | Some contextual data that the `work` function uses when called by the Scheduler.                             |

#### Returns

[`Subscription`](Subscription.md)

A subscription in order to be able to unsubscribe the scheduled work.

#### Implementation of

[`SchedulerLike`](../interfaces/SchedulerLike.md).[`schedule`](../interfaces/SchedulerLike.md#schedule)
