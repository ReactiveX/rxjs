[API](../../index.md) / [rxjs](../index.md) / takeWhile

# Function: takeWhile()

> Emits values emitted by the source Observable so long as each value satisfies
> the given `predicate`, and then completes as soon as this `predicate` is not
> satisfied.

## Description

<span class="informal">Takes values from the source only while they pass the
condition given. When the first value does not satisfy, it completes.</span>

![](/images/marble-diagrams/takeWhile.png)

`takeWhile` subscribes and begins mirroring the source Observable. Each value
emitted on the source is given to the `predicate` function which returns a
boolean, representing a condition to be satisfied by the source values. The
output Observable emits the source values until such time as the `predicate`
returns false, at which point `takeWhile` stops mirroring the source
Observable and completes the output Observable.

## Example

Emit click events only while the clientX property is greater than 200

```ts
import { fromEvent, takeWhile } from 'rxjs';

const clicks = fromEvent<PointerEvent>(document, 'click');
const result = clicks.pipe(takeWhile((ev) => ev.clientX > 200));
result.subscribe((x) => console.log(x));
```

## See

- [take](take.md)
- [takeLast](takeLast.md)
- [takeUntil](takeUntil.md)
- [skip](skip.md)

Observable and returns a boolean. Also takes the (zero-based) index as the
second argument.

return `false` will also be emitted.

## Parameters

### `predicate`

A function that evaluates a value emitted by the source

### `inclusive`

When set to `true` the value that caused `predicate` to

## Returns

`A`

function that returns an Observable that emits values from the source Observable so long as each value satisfies the condition defined by the , then completes.

## Call Signature

```ts
function takeWhile<>(predicate: BooleanConstructor, inclusive: true): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/takeWhile.ts:4](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeWhile.ts#L4)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |
| `inclusive` | `true`               |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

## Call Signature

```ts
function takeWhile<>(predicate: BooleanConstructor, inclusive: false): OperatorFunction<T, TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/takeWhile.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeWhile.ts#L5)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |
| `inclusive` | `false`              |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function takeWhile<>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/takeWhile.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeWhile.ts#L6)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function takeWhile<>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
```

Defined in: [rxjs/src/internal/operators/takeWhile.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeWhile.ts#L7)

### Parameters

| Parameter   | Type                                              |
| ----------- | ------------------------------------------------- |
| `predicate` | (`value`: `T`, `index`: `number`) => `value is S` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S`\>

## Call Signature

```ts
function takeWhile<>(predicate: (value: T, index: number) => value is S, inclusive: false): OperatorFunction<T, S>;
```

Defined in: [rxjs/src/internal/operators/takeWhile.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeWhile.ts#L8)

### Parameters

| Parameter   | Type                                              |
| ----------- | ------------------------------------------------- |
| `predicate` | (`value`: `T`, `index`: `number`) => `value is S` |
| `inclusive` | `false`                                           |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S`\>

## Call Signature

```ts
function takeWhile<>(predicate: (value: T, index: number) => boolean, inclusive?: boolean): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/takeWhile.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeWhile.ts#L9)

### Parameters

| Parameter    | Type                                           |
| ------------ | ---------------------------------------------- |
| `predicate`  | (`value`: `T`, `index`: `number`) => `boolean` |
| `inclusive?` | `boolean`                                      |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>
