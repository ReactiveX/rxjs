[API](../../index.md) / [operators](../index.md) / onErrorResumeNext

# ~~Variable: onErrorResumeNext()~~

```ts
const onErrorResumeNext: {
<T, A>  (sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
<T, A>  (...sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
} = onErrorResumeNextWith;
```

Defined in: [internal/operators/onErrorResumeNextWith.ts:99](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/onErrorResumeNextWith.ts#L99)

## Call Signature

```ts
<T, A>(sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `A` *extends* readonly `unknown`[] |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

## Call Signature

```ts
<T, A>(...sources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `A` *extends* readonly `unknown`[] |

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`sources` | \[`...ObservableInputTuple<A>[]`\] |

### Returns

[`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

## Deprecated

Renamed. Use [onErrorResumeNextWith](../../index/functions/onErrorResumeNextWith.md) instead. Will be removed in v8.
