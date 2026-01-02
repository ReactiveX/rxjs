[API](../../index.md) / [rxjs](../index.md) / zipAll

# Function: zipAll()

## Call Signature

```ts
function zipAll<>(): OperatorFunction<ObservableInput<T>, T[]>;
```

Defined in: [rxjs/src/internal/operators/zipAll.ts:13](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/zipAll.ts#L13)

Collects all observable inner sources from the source, once the source completes,
it will subscribe to all inner sources, combining their values by index and emitting
them.

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<[`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\>, `T`[]\>

### See

- [zipWith](zipWith.md)
- [zip](zip.md)

## Call Signature

```ts
function zipAll<>(): OperatorFunction<any, T[]>;
```

Defined in: [rxjs/src/internal/operators/zipAll.ts:14](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/zipAll.ts#L14)

Collects all observable inner sources from the source, once the source completes,
it will subscribe to all inner sources, combining their values by index and emitting
them.

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`any`, `T`[]\>

### See

- [zipWith](zipWith.md)
- [zip](zip.md)

## Call Signature

```ts
function zipAll<>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
```

Defined in: [rxjs/src/internal/operators/zipAll.ts:15](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/zipAll.ts#L15)

Collects all observable inner sources from the source, once the source completes,
it will subscribe to all inner sources, combining their values by index and emitting
them.

### Parameters

| Parameter | Type                        |
| --------- | --------------------------- |
| `project` | (...`values`: `T`[]) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<[`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\>, `R`\>

### See

- [zipWith](zipWith.md)
- [zip](zip.md)

## Call Signature

```ts
function zipAll<>(project: (...values: any[]) => R): OperatorFunction<any, R>;
```

Defined in: [rxjs/src/internal/operators/zipAll.ts:16](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/zipAll.ts#L16)

Collects all observable inner sources from the source, once the source completes,
it will subscribe to all inner sources, combining their values by index and emitting
them.

### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `project` | (...`values`: `any`[]) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`any`, `R`\>

### See

- [zipWith](zipWith.md)
- [zip](zip.md)
