[API](../../index.md) / [rxjs](../index.md) / timeout

# Function: timeout()

> Errors if Observable does not emit a value in given time span.

## Description

<span class="informal">Timeouts on Observable that doesn't emit values fast enough.</span>

![](/images/marble-diagrams/timeout.png)

Errors if Observable does not emit a value in given time span.

<span class="informal">Timeouts on Observable that doesn't emit values fast enough.</span>

![](/images/marble-diagrams/timeout.png)

## See

[timeoutWith](timeoutWith.md)

## Call Signature

```ts
function timeout<>(
  config: TimeoutConfig<T, O, M> & {
    with: (info: TimeoutInfo<T, M>) => O;
  }
): OperatorFunction<T, T | ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/timeout.ts:142](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeout.ts#L142)

If `with` is provided, this will return an observable that will switch to a different observable if the source
does not push values within the specified time parameters.

<span class="informal">The most flexible option for creating a timeout behavior.</span>

The first thing to know about the configuration is if you do not provide a `with` property to the configuration,
when timeout conditions are met, this operator will emit a [TimeoutError](../classes/TimeoutError.md). Otherwise, it will use the factory
function provided by `with`, and switch your subscription to the result of that. Timeout conditions are provided by
the settings in `first` and `each`.

The `first` property can be either a `Date` for a specific time, a `number` for a time period relative to the
point of subscription, or it can be skipped. This property is to check timeout conditions for the arrival of
the first value from the source _only_. The timings of all subsequent values from the source will be checked
against the time period provided by `each`, if it was provided.

The `each` property can be either a `number` or skipped. If a value for `each` is provided, it represents the amount of
time the resulting observable will wait between the arrival of values from the source before timing out. Note that if
`first` is _not_ provided, the value from `each` will be used to check timeout conditions for the arrival of the first
value and all subsequent values. If `first` _is_ provided, `each` will only be use to check all values after the first.

### Parameters

| Parameter | Type                                                                                                                                                           | Description                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `config`  | [`TimeoutConfig`](../interfaces/TimeoutConfig.md)\<`T`, `O`, `M`\> & \{ `with`: (`info`: [`TimeoutInfo`](../interfaces/TimeoutInfo.md)\<`T`, `M`\>) => `O`; \} | The configuration for the timeout. |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Example

Emit a custom error if there is too much time between values

```ts
import { interval, timeout, throwError } from 'rxjs';

class CustomTimeoutError extends Error {
  constructor() {
    super('It was too slow');
    this.name = 'CustomTimeoutError';
  }
}

const slow$ = interval(900);

slow$
  .pipe(
    timeout({
      each: 1000,
      with: () => throwError(() => new CustomTimeoutError()),
    })
  )
  .subscribe({
    error: console.error,
  });
```

Switch to a faster observable if your source is slow.

```ts
import { interval, timeout } from 'rxjs';

const slow$ = interval(900);
const fast$ = interval(500);

slow$
  .pipe(
    timeout({
      each: 1000,
      with: () => fast$,
    })
  )
  .subscribe(console.log);
```

## Call Signature

```ts
function timeout<>(config: Omit<TimeoutConfig<T, any, M>, 'with'>): OperatorFunction<T, T>;
```

Defined in: [rxjs/src/internal/operators/timeout.ts:236](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeout.ts#L236)

Returns an observable that will error or switch to a different observable if the source does not push values
within the specified time parameters.

<span class="informal">The most flexible option for creating a timeout behavior.</span>

The first thing to know about the configuration is if you do not provide a `with` property to the configuration,
when timeout conditions are met, this operator will emit a [TimeoutError](../classes/TimeoutError.md). Otherwise, it will use the factory
function provided by `with`, and switch your subscription to the result of that. Timeout conditions are provided by
the settings in `first` and `each`.

The `first` property can be either a `Date` for a specific time, a `number` for a time period relative to the
point of subscription, or it can be skipped. This property is to check timeout conditions for the arrival of
the first value from the source _only_. The timings of all subsequent values from the source will be checked
against the time period provided by `each`, if it was provided.

The `each` property can be either a `number` or skipped. If a value for `each` is provided, it represents the amount of
time the resulting observable will wait between the arrival of values from the source before timing out. Note that if
`first` is _not_ provided, the value from `each` will be used to check timeout conditions for the arrival of the first
value and all subsequent values. If `first` _is_ provided, `each` will only be use to check all values after the first.

### Handling TimeoutErrors

If no `with` property was provided, subscriptions to the resulting observable may emit an error of [TimeoutError](../classes/TimeoutError.md).
The timeout error provides useful information you can examine when you're handling the error. The most common way to handle
the error would be with [catchError](catchError.md), although you could use [tap](tap.md) or just the error handler in your `subscribe` call
directly, if your error handling is only a side effect (such as notifying the user, or logging).

In this case, you would check the error for `instanceof TimeoutError` to validate that the error was indeed from `timeout`, and
not from some other source. If it's not from `timeout`, you should probably rethrow it if you're in a `catchError`.

### Parameters

| Parameter | Type                                                                                     |
| --------- | ---------------------------------------------------------------------------------------- |
| `config`  | `Omit`\<[`TimeoutConfig`](../interfaces/TimeoutConfig.md)\<`T`, `any`, `M`\>, `"with"`\> |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`\>

### Example

Emit a [TimeoutError](../classes/TimeoutError.md) if the first value, and _only_ the first value, does not arrive within 5 seconds

```ts
import { interval, timeout } from 'rxjs';

// A random interval that lasts between 0 and 10 seconds per tick
const source$ = interval(Math.round(Math.random() * 10_000));

source$.pipe(timeout({ first: 5_000 })).subscribe({
  next: console.log,
  error: console.error,
});
```

Emit a [TimeoutError](../classes/TimeoutError.md) if the source waits longer than 5 seconds between any two values or the first value
and subscription.

```ts
import { timer, timeout, expand } from 'rxjs';

const getRandomTime = () => Math.round(Math.random() * 10_000);

// An observable that waits a random amount of time between each delivered value
const source$ = timer(getRandomTime()).pipe(expand(() => timer(getRandomTime())));

source$.pipe(timeout({ each: 5_000 })).subscribe({
  next: console.log,
  error: console.error,
});
```

Emit a [TimeoutError](../classes/TimeoutError.md) if the source does not emit before 7 seconds, _or_ if the source waits longer than
5 seconds between any two values after the first.

```ts
import { timer, timeout, expand } from 'rxjs';

const getRandomTime = () => Math.round(Math.random() * 10_000);

// An observable that waits a random amount of time between each delivered value
const source$ = timer(getRandomTime()).pipe(expand(() => timer(getRandomTime())));

source$.pipe(timeout({ first: 7_000, each: 5_000 })).subscribe({
  next: console.log,
  error: console.error,
});
```

## Call Signature

```ts
function timeout<>(first: Date, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/timeout.ts:250](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeout.ts#L250)

Returns an observable that will error if the source does not push its first value before the specified time passed as a `Date`.
This is functionally the same as `timeout({ first: someDate })`.

<span class="informal">Errors if the first value doesn't show up before the given date and time</span>

![](/images/marble-diagrams/timeout.png)

### Parameters

| Parameter    | Type                                              | Description                                                                                                           |
| ------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `first`      | `Date`                                            | The date to at which the resulting observable will timeout if the source observable does not emit at least one value. |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | The scheduler to use. Defaults to [asyncScheduler](../variables/asyncScheduler.md).                                   |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

## Call Signature

```ts
function timeout<>(each: number, scheduler?: SchedulerLike): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/timeout.ts:264](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeout.ts#L264)

Returns an observable that will error if the source does not push a value within the specified time in milliseconds.
This is functionally the same as `timeout({ each: milliseconds })`.

<span class="informal">Errors if it waits too long between any value</span>

![](/images/marble-diagrams/timeout.png)

### Parameters

| Parameter    | Type                                              | Description                                                                                              |
| ------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `each`       | `number`                                          | The time allowed between each pushed value from the source before the resulting observable will timeout. |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md) | The scheduler to use. Defaults to [asyncScheduler](../variables/asyncScheduler.md).                      |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>
