[API](../../index.md) / [index](../index.md) / flatMap

# ~~Variable: flatMap()~~

```ts
const flatMap: {
<T, O>  (project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
<T, O>  (project: (value: T, index: number) => O, resultSelector: undefined, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
<T, R, O>  (project: (value: T, index: number) => O, resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, concurrent?: number): OperatorFunction<T, R>;
} = mergeMap;
```

Defined in: [internal/operators/flatMap.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/flatMap.ts#L6)

## Call Signature

```ts
<T, O>(project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `O` *extends* [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `concurrent?` | `number` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

## Call Signature

```ts
<T, O>(
   project: (value: T, index: number) => O, 
   resultSelector: undefined, 
concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `O` *extends* [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `resultSelector` | `undefined` |
| `concurrent?` | `number` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector

## Call Signature

```ts
<T, R, O>(
   project: (value: T, index: number) => O, 
   resultSelector: (outerValue: T, innerValue: ObservedValueOf<O>, outerIndex: number, innerIndex: number) => R, 
concurrent?: number): OperatorFunction<T, R>;
```

### Type Parameters

| Type Parameter |
| ------ |
| `T` |
| `R` |
| `O` *extends* [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> |

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `O` |
| `resultSelector` | (`outerValue`: `T`, `innerValue`: [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>, `outerIndex`: `number`, `innerIndex`: `number`) => `R` |
| `concurrent?` | `number` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

The `resultSelector` parameter will be removed in v8. Use an inner `map` instead. Details: https://rxjs.dev/deprecations/resultSelector

## Deprecated

Renamed to [mergeMap](../functions/mergeMap.md). Will be removed in v8.
