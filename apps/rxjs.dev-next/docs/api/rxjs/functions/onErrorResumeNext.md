[API](../../index.md) / [rxjs](../index.md) / onErrorResumeNext

# Function: onErrorResumeNext()

> When any of the provided Observable emits a complete or an error notification, it immediately subscribes to the next one
> that was passed.

## Description

<span class="informal">Execute series of Observables no matter what, even if it means swallowing errors.</span>

![](/images/marble-diagrams/onErrorResumeNext.png)

`onErrorResumeNext` will subscribe to each observable source it is provided, in order.
If the source it's subscribed to emits an error or completes, it will move to the next source
without error.

If `onErrorResumeNext` is provided no arguments, or a single, empty array, it will return [EMPTY](../variables/EMPTY.md).

`onErrorResumeNext` is basically [concatWith](concatWith.md), only it will continue, even if one of its
sources emits an error.

Note that there is no way to handle any errors thrown by sources via the result of
`onErrorResumeNext`. If you want to handle errors thrown in any given source, you can
always use the [catchError](catchError.md) operator on them before passing them into `onErrorResumeNext`.

```ts
function onErrorResumeNext<>(...sources: [...ObservableInputTuple<A>[]]): Observable<A[number]>;
```

Defined in: [rxjs/src/internal/observable/onErrorResumeNext.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/onErrorResumeNext.ts#L7)

When any of the provided Observable emits a complete or an error notification, it immediately subscribes to the next one
that was passed.

<span class="informal">Execute series of Observables no matter what, even if it means swallowing errors.</span>

![](/images/marble-diagrams/onErrorResumeNext.png)

`onErrorResumeNext` will subscribe to each observable source it is provided, in order.
If the source it's subscribed to emits an error or completes, it will move to the next source
without error.

If `onErrorResumeNext` is provided no arguments, or a single, empty array, it will return [EMPTY](../variables/EMPTY.md).

`onErrorResumeNext` is basically [concatWith](concatWith.md), only it will continue, even if one of its
sources emits an error.

Note that there is no way to handle any errors thrown by sources via the result of
`onErrorResumeNext`. If you want to handle errors thrown in any given source, you can
always use the [catchError](catchError.md) operator on them before passing them into `onErrorResumeNext`.

## Parameters

| Parameter    | Type                               |
| ------------ | ---------------------------------- |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

## Returns

[`Observable`](../classes/Observable.md)\<`A`\[`number`\]\>

## Example

Subscribe to the next Observable after map fails

```ts
import { onErrorResumeNext, of, map } from 'rxjs';

onErrorResumeNext(
  of(1, 2, 3, 0).pipe(
    map((x) => {
      if (x === 0) {
        throw Error();
      }
      return 10 / x;
    })
  ),
  of(1, 2, 3)
).subscribe({
  next: (value) => console.log(value),
  error: (err) => console.log(err), // Will never be called.
  complete: () => console.log('done'),
});

// Logs:
// 10
// 5
// 3.3333333333333335
// 1
// 2
// 3
// 'done'
```

## See

- [concat](concat.md)
- [catchError](catchError.md)

## Param

`ObservableInput`s passed either directly or as an array.
