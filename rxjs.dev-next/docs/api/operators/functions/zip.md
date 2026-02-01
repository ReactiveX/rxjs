[API](../../index.md) / [operators](../index.md) / zip

# ~~Function: zip()~~

## Deprecated

Replaced with [zipWith](../../index/functions/zipWith.md). Will be removed in v8.

## Call Signature

```ts
function zip<>(otherInputs: [...ObservableInputTuple<A>[]]): OperatorFunction<T, [T, ...rest: A[]]>;
```

Defined in: [internal/operators/zip.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/zip.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `otherInputs` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, \[`T`, `...rest: A[]`\]\>

### Deprecated

Replaced with [zipWith](../../index/functions/zipWith.md). Will be removed in v8.

## Call Signature

```ts
function zip<>(otherInputsAndProject: [...ObservableInputTuple<A>[]], project: (...values: [T, ...rest: A[]]) => R): OperatorFunction<T, R>;
```

Defined in: [internal/operators/zip.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/zip.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `otherInputsAndProject` | \[`...ObservableInputTuple<A>[]`\] |
| `project` | (...`values`: \[`T`, `...rest: A[]`\]) => `R` |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

Replaced with [zipWith](../../index/functions/zipWith.md). Will be removed in v8.

## Call Signature

```ts
function zip<>(...otherInputs: [...ObservableInputTuple<A>[]]): OperatorFunction<T, [T, ...rest: A[]]>;
```

Defined in: [internal/operators/zip.ts:13](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/zip.ts#L13)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`otherInputs` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, \[`T`, `...rest: A[]`\]\>

### Deprecated

Replaced with [zipWith](../../index/functions/zipWith.md). Will be removed in v8.

## Call Signature

```ts
function zip<>(...otherInputsAndProject: [...ObservableInputTuple<A>[], (...values: [T, ...rest: A[]]) => R]): OperatorFunction<T, R>;
```

Defined in: [internal/operators/zip.ts:15](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/zip.ts#L15)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`otherInputsAndProject` | \[`...ObservableInputTuple<A>[]`, (...`values`: \[`T`, `...rest: A[]`\]) => `R`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

Replaced with [zipWith](../../index/functions/zipWith.md). Will be removed in v8.
