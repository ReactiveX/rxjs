[API](../../index.md) / [operators](../index.md) / combineLatest

# ~~Function: combineLatest()~~

## Deprecated

Replaced with [combineLatestWith](../../index/functions/combineLatestWith.md). Will be removed in v8.

## Call Signature

```ts
function combineLatest<>(sources: [...ObservableInputTuple<A>[]], project: (...values: [T, ...A[]]) => R): OperatorFunction<T, R>;
```

Defined in: [internal/operators/combineLatest.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineLatest.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `sources` | \[`...ObservableInputTuple<A>[]`\] |
| `project` | (...`values`: \[`T`, `...A[]`\]) => `R` |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

Replaced with [combineLatestWith](../../index/functions/combineLatestWith.md). Will be removed in v8.

## Call Signature

```ts
function combineLatest<>(sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, [T, ...A[]]>;
```

Defined in: [internal/operators/combineLatest.ts:15](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineLatest.ts#L15)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, \[`T`, `...A[]`\]\>

### Deprecated

Replaced with [combineLatestWith](../../index/functions/combineLatestWith.md). Will be removed in v8.

## Call Signature

```ts
function combineLatest<>(...sourcesAndProject: [...ObservableInputTuple<A>[], (...values: [T, ...A[]]) => R]): OperatorFunction<T, R>;
```

Defined in: [internal/operators/combineLatest.ts:18](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineLatest.ts#L18)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sourcesAndProject` | \[`...ObservableInputTuple<A>[]`, (...`values`: \[`T`, `...A[]`\]) => `R`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

Replaced with [combineLatestWith](../../index/functions/combineLatestWith.md). Will be removed in v8.

## Call Signature

```ts
function combineLatest<>(...sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, [T, ...A[]]>;
```

Defined in: [internal/operators/combineLatest.ts:22](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineLatest.ts#L22)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, \[`T`, `...A[]`\]\>

### Deprecated

Replaced with [combineLatestWith](../../index/functions/combineLatestWith.md). Will be removed in v8.
