[API](../../index.md) / [operators](../index.md) / concat

# ~~Function: concat()~~

## Deprecated

Replaced with [concatWith](../../index/functions/concatWith.md). Will be removed in v8.

## Call Signature

```ts
function concat<>(...sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/concat.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/concat.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

### Deprecated

Replaced with [concatWith](../../index/functions/concatWith.md). Will be removed in v8.

## Call Signature

```ts
function concat<>(...sourcesAndScheduler: [...ObservableInputTuple<A>[], SchedulerLike]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/concat.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/concat.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndScheduler` | \[`...ObservableInputTuple<A>[]`, [`SchedulerLike`](../../index/interfaces/SchedulerLike.md)\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

### Deprecated

Replaced with [concatWith](../../index/functions/concatWith.md). Will be removed in v8.
