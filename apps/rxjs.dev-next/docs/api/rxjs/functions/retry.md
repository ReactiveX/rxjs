[API](../../index.md) / [rxjs](../index.md) / retry

# Function: retry()

> Returns an Observable that mirrors the source Observable with the exception of an `error`.

## Description

If the source Observable calls `error`, this method will resubscribe to the source Observable for a maximum of
`count` resubscriptions rather than propagating the `error` call.

![](/images/marble-diagrams/retry.png)

The number of retries is determined by the `count` parameter. It can be set either by passing a number to
`retry` function or by setting `count` property when `retry` is configured using [RetryConfig](../interfaces/RetryConfig.md). If
`count` is omitted, `retry` will try to resubscribe on errors infinite number of times.

Any and all items emitted by the source Observable will be emitted by the resulting Observable, even those
emitted during failed subscriptions. For example, if an Observable fails at first but emits `[1, 2]` then
succeeds the second time and emits: `[1, 2, 3, 4, 5, complete]` then the complete stream of emissions and
notifications would be: `[1, 2, 1, 2, 3, 4, 5, complete]`.

## Example

```ts
import { interval, mergeMap, throwError, of, retry } from 'rxjs';

const source = interval(1000);
const result = source.pipe(
  mergeMap((val) => (val > 5 ? throwError(() => 'Error!') : of(val))),
  retry(2) // retry 2 times on error
);

result.subscribe({
  next: (value) => console.log(value),
  error: (err) => console.log(`${err}: Retried 2 times then quit!`),
});

// Output:
// 0..1..2..3..4..5..
// 0..1..2..3..4..5..
// 0..1..2..3..4..5..
// 'Error!: Retried 2 times then quit!'
```

## See

[retryWhen](retryWhen.md)

[RetryConfig](../interfaces/RetryConfig.md) object.

## Parameters

### `configOrCount`

Either number of retry attempts before failing or a

## Returns

`A function that returns an Observable that will resubscribe to the
source stream when the source stream errors, at most`

times.

## Call Signature

```ts
function retry<>(count?: number): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/retry.ts:32](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/retry.ts#L32)

### Parameters

| Parameter | Type     |
| --------- | -------- |
| `count?`  | `number` |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

## Call Signature

```ts
function retry<>(config: RetryConfig): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/retry.ts:33](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/retry.ts#L33)

### Parameters

| Parameter | Type                                          |
| --------- | --------------------------------------------- |
| `config`  | [`RetryConfig`](../interfaces/RetryConfig.md) |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>
