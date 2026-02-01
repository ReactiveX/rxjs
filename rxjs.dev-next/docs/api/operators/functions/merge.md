[API](../../index.md) / [operators](../index.md) / merge

# ~~Function: merge()~~

## Call Signature

```ts
function merge<>(...sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/merge.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/merge.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

### Deprecated

Replaced with [mergeWith](../../index/functions/mergeWith.md). Will be removed in v8.

## Call Signature

```ts
function merge<>(...sourcesAndConcurrency: [...ObservableInputTuple<A>[], number]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/merge.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/merge.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndConcurrency` | \[`...ObservableInputTuple<A>[]`, `number`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

### Deprecated

Replaced with [mergeWith](../../index/functions/mergeWith.md). Will be removed in v8.

## Call Signature

```ts
function merge<>(...sourcesAndScheduler: [...ObservableInputTuple<A>[], SchedulerLike]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/merge.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/merge.ts#L14)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndScheduler` | \[`...ObservableInputTuple<A>[]`, [`SchedulerLike`](../../index/interfaces/SchedulerLike.md)\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

### Deprecated

Replaced with [mergeWith](../../index/functions/mergeWith.md). Will be removed in v8.

## Call Signature

```ts
function merge<>(...sourcesAndConcurrencyAndScheduler: [...ObservableInputTuple<A>[], number, SchedulerLike]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/merge.ts:18](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/merge.ts#L18)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndConcurrencyAndScheduler` | \[`...ObservableInputTuple<A>[]`, `number`, [`SchedulerLike`](../../index/interfaces/SchedulerLike.md)\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

### Deprecated

Replaced with [mergeWith](../../index/functions/mergeWith.md). Will be removed in v8.
