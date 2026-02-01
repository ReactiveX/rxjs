[API](../../index.md) / [index](../index.md) / combineAll

# ~~Variable: combineAll()~~

```ts
const combineAll: {
<T>  (): OperatorFunction<ObservableInput<T>, T[]>;
<T>  (): OperatorFunction<any, T[]>;
<T, R>  (project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
<R>  (project: (...values: any[]) => R): OperatorFunction<any, R>;
} = combineLatestAll;
```

Defined in: [internal/operators/combineAll.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineAll.ts#L6)

## Call Signature

```ts
<T>(): OperatorFunction<ObservableInput<T>, T[]>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<[`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\>, `T`[]\>

## Call Signature

```ts
<T>(): OperatorFunction<any, T[]>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`any`, `T`[]\>

## Call Signature

```ts
<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `R` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (...`values`: `T`[]) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<[`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\>, `R`\>

## Call Signature

```ts
<R>(project: (...values: any[]) => R): OperatorFunction<any, R>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `R` |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (...`values`: `any`[]) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`any`, `R`\>

## Deprecated

Renamed to [combineLatestAll](../functions/combineLatestAll.md). Will be removed in v8.
