[API](../../index.md) / [rxjs](../index.md) / VirtualTimeScheduler

# Class: VirtualTimeScheduler

Defined in: [rxjs/src/internal/scheduler/VirtualTimeScheduler.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/scheduler/VirtualTimeScheduler.ts#L7)

## Extends

- `AsyncScheduler`

## Extended by

- [`TestScheduler`](../../testing/classes/TestScheduler.md)

## Constructors

### Constructor

```ts
new VirtualTimeScheduler(schedulerActionCtor: typeof AsyncAction, maxFrames: number): VirtualTimeScheduler;
```

Defined in: [rxjs/src/internal/scheduler/VirtualTimeScheduler.ts:32](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/scheduler/VirtualTimeScheduler.ts#L32)

This creates an instance of a `VirtualTimeScheduler`. Experts only. The signature of
this constructor is likely to change in the long run.

#### Parameters

| Parameter             | Type                   | Default value | Description                                                                                    |
| --------------------- | ---------------------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `schedulerActionCtor` | _typeof_ `AsyncAction` | `...`         | The type of Action to initialize when initializing actions during scheduling.                  |
| `maxFrames`           | `number`               | `Infinity`    | The maximum number of frames to process before stopping. Used to prevent endless flush cycles. |

#### Returns

`VirtualTimeScheduler`

#### Overrides

```ts
AsyncScheduler.constructor;
```

## Properties

| Property                                           | Type                     | Default value               | Description                                                                                                                                                                                                                                                                                                       | Inherited from           |
| -------------------------------------------------- | ------------------------ | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| <a id="actions"></a> `actions`                     | `AsyncAction`\<`any`\>[] | `[]`                        | -                                                                                                                                                                                                                                                                                                                 | `AsyncScheduler.actions` |
| <a id="frame"></a> `frame`                         | `number`                 | `0`                         | The current frame for the state of the virtual scheduler instance. The difference between two "frames" is synonymous with the passage of "virtual time units". So if you record `scheduler.frame` to be `1`, then later, observe `scheduler.frame` to be at `11`, that means `10` virtual time units have passed. | -                        |
| <a id="index"></a> ~~`index`~~                     | `number`                 | `-1`                        | Used internally to examine the current virtual action index being processed. **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8.                                                                                                                                     | -                        |
| <a id="maxframes"></a> `maxFrames`                 | `number`                 | `Infinity`                  | The maximum number of frames to process before stopping. Used to prevent endless flush cycles.                                                                                                                                                                                                                    | -                        |
| <a id="now"></a> `now`                             | () => `number`           | `undefined`                 | A getter method that returns a number representing the current time (at the time this function was called) according to the scheduler's own internal clock.                                                                                                                                                       | `AsyncScheduler.now`     |
| <a id="frametimefactor"></a> ~~`frameTimeFactor`~~ | `number`                 | `10`                        | **Deprecated** Not used in VirtualTimeScheduler directly. Will be removed in v8.                                                                                                                                                                                                                                  | -                        |
| <a id="now-1"></a> `now`                           | () => `number`           | `dateTimestampProvider.now` | -                                                                                                                                                                                                                                                                                                                 | `AsyncScheduler.now`     |

## Methods

### flush()

```ts
flush(): void;
```

Defined in: [rxjs/src/internal/scheduler/VirtualTimeScheduler.ts:40](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/scheduler/VirtualTimeScheduler.ts#L40)

Prompt the Scheduler to execute all of its queued actions, therefore
clearing its queue.

#### Returns

`void`

#### Overrides

```ts
AsyncScheduler.flush;
```

### schedule()

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

#### Inherited from

```ts
AsyncScheduler.schedule;
```
