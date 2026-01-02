[API](../../index.md) / [testing](../index.md) / TestScheduler

# Class: TestScheduler

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:38](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L38)

## Extends

- [`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md)

## Constructors

### Constructor

```ts
new TestScheduler(assertDeepEqual: (actual: any, expected: any) => boolean | void): TestScheduler;
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:71](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L71)

#### Parameters

| Parameter         | Type                                                        | Description                                               |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| `assertDeepEqual` | (`actual`: `any`, `expected`: `any`) => `boolean` \| `void` | A function to set up your assertion for your test harness |

#### Returns

`TestScheduler`

#### Overrides

[`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`constructor`](../../rxjs/classes/VirtualTimeScheduler.md#constructor)

## Properties

| Property                                           | Type                                                        | Default value               | Description                                                                                                                                                                                                                                                                                                       | Overrides                                                                                                                                            | Inherited from                                                                                                                           |
| -------------------------------------------------- | ----------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| <a id="actions"></a> `actions`                     | `AsyncAction`\<`any`\>[]                                    | `[]`                        | -                                                                                                                                                                                                                                                                                                                 | -                                                                                                                                                    | [`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`actions`](../../rxjs/classes/VirtualTimeScheduler.md#actions)     |
| <a id="assertdeepequal"></a> `assertDeepEqual`     | (`actual`: `any`, `expected`: `any`) => `boolean` \| `void` | `undefined`                 | A function to set up your assertion for your test harness                                                                                                                                                                                                                                                         | -                                                                                                                                                    | -                                                                                                                                        |
| <a id="coldobservables"></a> ~~`coldObservables`~~ | `ColdObservable`\<`any`\>[]                                 | `[]`                        | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8.                                                                                                                                                                                                                  | -                                                                                                                                                    | -                                                                                                                                        |
| <a id="frame"></a> `frame`                         | `number`                                                    | `0`                         | The current frame for the state of the virtual scheduler instance. The difference between two "frames" is synonymous with the passage of "virtual time units". So if you record `scheduler.frame` to be `1`, then later, observe `scheduler.frame` to be at `11`, that means `10` virtual time units have passed. | -                                                                                                                                                    | [`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`frame`](../../rxjs/classes/VirtualTimeScheduler.md#frame)         |
| <a id="hotobservables"></a> ~~`hotObservables`~~   | `HotObservable`\<`any`\>[]                                  | `[]`                        | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8.                                                                                                                                                                                                                  | -                                                                                                                                                    | -                                                                                                                                        |
| <a id="index"></a> ~~`index`~~                     | `number`                                                    | `-1`                        | Used internally to examine the current virtual action index being processed. **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8.                                                                                                                                     | -                                                                                                                                                    | [`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`index`](../../rxjs/classes/VirtualTimeScheduler.md#index)         |
| <a id="maxframes"></a> `maxFrames`                 | `number`                                                    | `Infinity`                  | The maximum number of frames to process before stopping. Used to prevent endless flush cycles.                                                                                                                                                                                                                    | -                                                                                                                                                    | [`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`maxFrames`](../../rxjs/classes/VirtualTimeScheduler.md#maxframes) |
| <a id="now"></a> `now`                             | () => `number`                                              | `undefined`                 | A getter method that returns a number representing the current time (at the time this function was called) according to the scheduler's own internal clock.                                                                                                                                                       | -                                                                                                                                                    | [`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`now`](../../rxjs/classes/VirtualTimeScheduler.md#now)             |
| <a id="frametimefactor"></a> `frameTimeFactor`     | `number`                                                    | `10`                        | The number of virtual time units each character in a marble diagram represents. If the test scheduler is being used in "run mode", via the `run` method, this is temporarily set to `1` for the duration of the `run` block, then set back to whatever value it was.                                              | [`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`frameTimeFactor`](../../rxjs/classes/VirtualTimeScheduler.md#frametimefactor) | -                                                                                                                                        |
| <a id="now-1"></a> `now`                           | () => `number`                                              | `dateTimestampProvider.now` | -                                                                                                                                                                                                                                                                                                                 | -                                                                                                                                                    | [`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`now`](../../rxjs/classes/VirtualTimeScheduler.md#now-1)           |

## Methods

### createColdObservable()

```ts
createColdObservable<>(
   marbles: string,
   values?: {
[marble: string]: T;
},
error?: any): ColdObservable<T>;
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:88](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L88)

#### Parameters

| Parameter | Type                               | Description                                                                              |
| --------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `marbles` | `string`                           | A diagram in the marble DSL. Letters map to keys in `values` if provided.                |
| `values?` | \{ \[`marble`: `string`\]: `T`; \} | Values to use for the letters in `marbles`. If omitted, the letters themselves are used. |
| `error?`  | `any`                              | The error to use for the `#` marble (if present).                                        |

#### Returns

`ColdObservable`\<`T`\>

### createHotObservable()

```ts
createHotObservable<>(
   marbles: string,
   values?: {
[marble: string]: T;
},
error?: any): HotObservable<T>;
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:106](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L106)

#### Parameters

| Parameter | Type                               | Description                                                                              |
| --------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `marbles` | `string`                           | A diagram in the marble DSL. Letters map to keys in `values` if provided.                |
| `values?` | \{ \[`marble`: `string`\]: `T`; \} | Values to use for the letters in `marbles`. If omitted, the letters themselves are used. |
| `error?`  | `any`                              | The error to use for the `#` marble (if present).                                        |

#### Returns

`HotObservable`\<`T`\>

### createTime()

```ts
createTime(marbles: string): number;
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:75](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L75)

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `marbles` | `string` |

#### Returns

`number`

### expectObservable()

```ts
expectObservable<>(observable: Observable<T>, subscriptionMarbles: string | null): {
  toEqual: (other: Observable<T>) => void;
  toBe: void;
};
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:132](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L132)

#### Parameters

| Parameter             | Type                                                    | Default value |
| --------------------- | ------------------------------------------------------- | ------------- |
| `observable`          | [`Observable`](../../rxjs/classes/Observable.md)\<`T`\> | `undefined`   |
| `subscriptionMarbles` | `string` \| `null`                                      | `null`        |

#### Returns

```ts
{
  toEqual: (other: Observable<T>) => void;
  toBe: void;
}
```

| Name        | Type                                                                         |
| ----------- | ---------------------------------------------------------------------------- |
| `toEqual()` | (`other`: [`Observable`](../../rxjs/classes/Observable.md)\<`T`\>) => `void` |
| `toBe()`    | ( `marbles`: `string`, `values?`: `any`, `errorValue?`: `any`) => `void`     |

### expectSubscriptions()

```ts
expectSubscriptions(actualSubscriptionLogs: SubscriptionLog[]): {
  toBe: subscriptionLogsToBeFn;
};
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:194](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L194)

#### Parameters

| Parameter                | Type                |
| ------------------------ | ------------------- |
| `actualSubscriptionLogs` | `SubscriptionLog`[] |

#### Returns

```ts
{
  toBe: subscriptionLogsToBeFn;
}
```

| Name   | Type                     |
| ------ | ------------------------ |
| `toBe` | `subscriptionLogsToBeFn` |

### flush()

```ts
flush(): void;
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:209](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L209)

Prompt the Scheduler to execute all of its queued actions, therefore
clearing its queue.

#### Returns

`void`

#### Overrides

[`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`flush`](../../rxjs/classes/VirtualTimeScheduler.md#flush)

### run()

```ts
run<>(callback: (helpers: RunHelpers) => T): T;
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:650](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L650)

The `run` method performs the test in 'run mode' - in which schedulers
used within the test automatically delegate to the `TestScheduler`. That
is, in 'run mode' there is no need to explicitly pass a `TestScheduler`
instance to observable creators or operators.

#### Parameters

| Parameter  | Type                                                            |
| ---------- | --------------------------------------------------------------- |
| `callback` | (`helpers`: [`RunHelpers`](../interfaces/RunHelpers.md)) => `T` |

#### Returns

`T`

#### See

[Marble testing](/guide/testing/marble-testing)

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

| Parameter | Type                                                                                                    | Default value | Description                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| `work`    | (`this`: [`SchedulerAction`](../../rxjs/interfaces/SchedulerAction.md)\<`T`\>, `state?`: `T`) => `void` | `undefined`   | A function representing a task, or some unit of work to be executed by the Scheduler.                        |
| `delay`   | `number`                                                                                                | `0`           | Time to wait before executing the work, where the time unit is implicit and defined by the Scheduler itself. |
| `state?`  | `T`                                                                                                     | `undefined`   | Some contextual data that the `work` function uses when called by the Scheduler.                             |

#### Returns

[`Subscription`](../../rxjs/classes/Subscription.md)

A subscription in order to be able to unsubscribe the scheduled work.

#### Inherited from

[`VirtualTimeScheduler`](../../rxjs/classes/VirtualTimeScheduler.md).[`schedule`](../../rxjs/classes/VirtualTimeScheduler.md#schedule)

### parseMarbles()

```ts
static parseMarbles(
   marbles: string,
   values?: any,
   errorValue?: any,
   materializeInnerObservables?: boolean,
   runMode?: boolean): TestMessage[];
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:323](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L323)

#### Parameters

| Parameter                      | Type      | Default value |
| ------------------------------ | --------- | ------------- |
| `marbles`                      | `string`  | `undefined`   |
| `values?`                      | `any`     | `undefined`   |
| `errorValue?`                  | `any`     | `undefined`   |
| `materializeInnerObservables?` | `boolean` | `false`       |
| `runMode?`                     | `boolean` | `false`       |

#### Returns

`TestMessage`[]

### parseMarblesAsSubscriptions()

```ts
static parseMarblesAsSubscriptions(marbles: string | null, runMode: boolean): SubscriptionLog;
```

Defined in: [rxjs/src/internal/testing/TestScheduler.ts:226](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/testing/TestScheduler.ts#L226)

#### Parameters

| Parameter | Type               | Default value |
| --------- | ------------------ | ------------- |
| `marbles` | `string` \| `null` | `undefined`   |
| `runMode` | `boolean`          | `false`       |

#### Returns

`SubscriptionLog`
