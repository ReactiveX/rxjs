[API](../../index.md) / [rxjs](../index.md) / timeoutWith

# ~~Function: timeoutWith()~~

> When the passed timespan elapses before the source emits any given value, it will unsubscribe from the source,
> and switch the subscription to another observable.

## Description

<span class="informal">Used to switch to a different observable if your source is being slow.</span>

Useful in cases where:

- You want to switch to a different source that may be faster.
- You want to notify a user that the data stream is slow.
- You want to emit a custom error rather than the [TimeoutError](../classes/TimeoutError.md) emitted
  by the default usage of [timeout](timeout.md).

If the first parameter is passed as Date and the time of the Date arrives before the first value arrives from the source,
it will unsubscribe from the source and switch the subscription to another observable.

<span class="informal">Use Date object to switch to a different observable if the first value doesn't arrive by a specific time.</span>

Can be used to set a timeout only for the first value, however it's recommended to use the [timeout](timeout.md) operator with
the `first` configuration to get the same effect.

**deprecated**: Replaced with [timeout](timeout.md). Instead of `timeoutWith(100, a$, scheduler)`, use [timeout](timeout.md) with the configuration
object: `timeout({ each: 100, with: () => a$, scheduler })`. Instead of `timeoutWith(someDate, a$, scheduler)`, use [timeout](timeout.md)
with the configuration object: `timeout({ first: someDate, with: () => a$, scheduler })`. Will be removed in v8.

When the passed timespan elapses before the source emits any given value, it will unsubscribe from the source,
and switch the subscription to another observable.

<span class="informal">Used to switch to a different observable if your source is being slow.</span>

Useful in cases where:

- You want to switch to a different source that may be faster.
- You want to notify a user that the data stream is slow.
- You want to emit a custom error rather than the [TimeoutError](../classes/TimeoutError.md) emitted
  by the default usage of [timeout](timeout.md).

If the first parameter is passed as Date and the time of the Date arrives before the first value arrives from the source,
it will unsubscribe from the source and switch the subscription to another observable.

<span class="informal">Use Date object to switch to a different observable if the first value doesn't arrive by a specific time.</span>

Can be used to set a timeout only for the first value, however it's recommended to use the [timeout](timeout.md) operator with
the `first` configuration to get the same effect.

## Example

Fallback to a faster observable

```ts
import { interval, timeoutWith } from 'rxjs';

const slow$ = interval(1000);
const faster$ = interval(500);

slow$.pipe(timeoutWith(900, faster$)).subscribe(console.log);
```

Emit your own custom timeout error

```ts
import { interval, timeoutWith, throwError } from 'rxjs';

class CustomTimeoutError extends Error {
  constructor() {
    super('It was too slow');
    this.name = 'CustomTimeoutError';
  }
}

const slow$ = interval(1000);

slow$
  .pipe(
    timeoutWith(
      900,
      throwError(() => new CustomTimeoutError())
    )
  )
  .subscribe({
    error: (err) => console.error(err.message),
  });
```

## See

[timeout](timeout.md)

## Param

When passed a number, used as the time (in milliseconds) allowed between each value from the source before timeout
is triggered. When passed a Date, used as the exact time at which the timeout will be triggered if the first value does not arrive.

## Param

The observable to switch to when timeout occurs.

## Param

The scheduler to use with time-related operations within this operator. Defaults to [asyncScheduler](../variables/asyncScheduler.md)

## Deprecated

Replaced with [timeout](timeout.md). Instead of `timeoutWith(100, a$, scheduler)`, use [timeout](timeout.md) with the configuration
object: `timeout({ each: 100, with: () => a$, scheduler })`. Instead of `timeoutWith(someDate, a$, scheduler)`, use [timeout](timeout.md)
with the configuration object: `timeout({ first: someDate, with: () => a$, scheduler })`. Will be removed in v8.

## Call Signature

```ts
function timeoutWith<>(dueBy: Date, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;
```

Defined in: [rxjs/src/internal/operators/timeoutWith.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeoutWith.ts#L8)

### Parameters

| Parameter    | Type                                                           |
| ------------ | -------------------------------------------------------------- |
| `dueBy`      | `Date`                                                         |
| `switchTo`   | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`R`\> |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md)              |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `R`\>

### Deprecated

Replaced with [timeout](timeout.md). Instead of `timeoutWith(someDate, a$, scheduler)`, use the configuration object
`timeout({ first: someDate, with: () => a$, scheduler })`. Will be removed in v8.

## Call Signature

```ts
function timeoutWith<>(waitFor: number, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;
```

Defined in: [rxjs/src/internal/operators/timeoutWith.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/timeoutWith.ts#L11)

### Parameters

| Parameter    | Type                                                           |
| ------------ | -------------------------------------------------------------- |
| `waitFor`    | `number`                                                       |
| `switchTo`   | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`R`\> |
| `scheduler?` | [`SchedulerLike`](../interfaces/SchedulerLike.md)              |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `R`\>

### Deprecated

Replaced with [timeout](timeout.md). Instead of `timeoutWith(100, a$, scheduler)`, use the configuration object
`timeout({ each: 100, with: () => a$, scheduler })`. Will be removed in v8.
