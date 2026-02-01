[API](../../index.md) / [index](../index.md) / onErrorResumeNextWith

# Function: onErrorResumeNextWith()

> When any of the provided Observable emits an complete or error notification, it immediately subscribes to the next one
> that was passed.

## Description

<span class="informal">Execute series of Observables, subscribes to next one on error or complete.</span>

![](onErrorResumeNext.png)

`onErrorResumeNext` is an operator that accepts a series of Observables, provided either directly as
arguments or as an array. If no single Observable is provided, returned Observable will simply behave the same
as the source.

`onErrorResumeNext` returns an Observable that starts by subscribing and re-emitting values from the source Observable.
When its stream of values ends - no matter if Observable completed or emitted an error - `onErrorResumeNext`
will subscribe to the first Observable that was passed as an argument to the method. It will start re-emitting
its values as well and - again - when that stream ends, `onErrorResumeNext` will proceed to subscribing yet another
Observable in provided series, no matter if previous Observable completed or ended with an error. This will
be happening until there is no more Observables left in the series, at which point returned Observable will
complete - even if the last subscribed stream ended with an error.

`onErrorResumeNext` can be therefore thought of as version of [concat](concat.md) operator, which is more permissive
when it comes to the errors emitted by its input Observables. While `concat` subscribes to the next Observable
in series only if previous one successfully completed, `onErrorResumeNext` subscribes even if it ended with
an error.

Note that you do not get any access to errors emitted by the Observables. In particular do not
expect these errors to appear in error callback passed to [Observable#subscribe](../classes/Observable.md#subscribe). If you want to take
specific actions based on what error was emitted by an Observable, you should try out [catchError](catchError.md) instead.

## Example

Subscribe to the next Observable after map fails

```ts
import { of, onErrorResumeNext, map } from 'rxjs';

of(1, 2, 3, 0)
  .pipe(
    map(x => {
      if (x === 0) {
        throw Error();
      }

      return 10 / x;
    }),
    onErrorResumeNext(of(1, 2, 3))
  )
  .subscribe({
    next: val => console.log(val),
    error: err => console.log(err),          // Will never be called.
    complete: () => console.log('that\'s it!')
  });

// Logs:
// 10
// 5
// 3.3333333333333335
// 1
// 2
// 3
// 'that's it!'
```

## See

 - [concat](concat.md)
 - [catchError](catchError.md)



## Parameters

### `sources`

`ObservableInput`s passed either directly or as an array.

## Returns

`A function that returns an Observable that emits values from source
Observable, but`

if it errors - subscribes to the next passed Observable
and so on, until it completes or runs out of Observables.


## Call Signature

```ts
function onErrorResumeNextWith<>(sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/onErrorResumeNextWith.ts:5](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/onErrorResumeNextWith.ts#L5)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

## Call Signature

```ts
function onErrorResumeNextWith<>(...sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/onErrorResumeNextWith.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/onErrorResumeNextWith.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>
