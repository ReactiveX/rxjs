[API](../../index.md) / [rxjs](../index.md) / last

# Function: last()

> Returns an Observable that emits only the last item emitted by the source Observable.
> It optionally takes a predicate function as a parameter, in which case, rather than emitting
> the last item from the source Observable, the resulting Observable will emit the last item
> from the source Observable that satisfies the predicate.

## Description

![](/images/marble-diagrams/last.png)

It will emit an error notification if the source completes without notification or one that matches
the predicate. It returns the last value or if a predicate is provided last value that matches the
predicate. It returns the given default value if no notification is emitted or matches the predicate.

## Example

Last alphabet from the sequence

```ts
import { from, last } from 'rxjs';

const source = from(['x', 'y', 'z']);
const result = source.pipe(last());

result.subscribe((value) => console.log(`Last alphabet: ${value}`));

// Outputs
// Last alphabet: z
```

Default value when the value in the predicate is not matched

```ts
import { from, last } from 'rxjs';

const source = from(['x', 'y', 'z']);
const result = source.pipe(last((char) => char === 'a', 'not found'));

result.subscribe((value) => console.log(`'a' is ${value}.`));

// Outputs
// 'a' is not found.
```

## See

- [skip](skip.md)
- [skipUntil](skipUntil.md)
- [skipLast](skipLast.md)
- [skipWhile](skipWhile.md)
- [first](first.md)

## Throws

Delivers an `EmptyError` to the Observer's `error`
callback if the Observable completes before any `next` notification was sent.

isn't met or no values were emitted.

## Parameters

### `predicate`

The condition any source emitted item has to satisfy.

### `defaultValue`

An optional default value to provide if last `predicate`

## Returns

`A function that returns an Observable that emits only the last item
satisfying the given condition from the source, or an error notification
with an`

object if no such items are emitted.

## Call Signature

```ts
function last<>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/last.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/last.ts#L5)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function last<>(predicate: BooleanConstructor, defaultValue: D): OperatorFunction<T, D | TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/last.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/last.ts#L6)

### Parameters

| Parameter      | Type                 |
| -------------- | -------------------- |
| `predicate`    | `BooleanConstructor` |
| `defaultValue` | `D`                  |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `D` \| [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function last<>(predicate?: null, defaultValue?: D): OperatorFunction<T, T | D>;
```

Defined in: [rxjs/src/internal/operators/last.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/last.ts#L7)

### Parameters

| Parameter       | Type   |
| --------------- | ------ |
| `predicate?`    | `null` |
| `defaultValue?` | `D`    |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `D`\>

## Call Signature

```ts
function last<>(predicate: (value: T, index: number, source: Observable<T>) => value is S, defaultValue?: S): OperatorFunction<T, S>;
```

Defined in: [rxjs/src/internal/operators/last.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/last.ts#L8)

### Parameters

| Parameter       | Type                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `predicate`     | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `value is S` |
| `defaultValue?` | `S`                                                                                                          |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S`\>

## Call Signature

```ts
function last<>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;
```

Defined in: [rxjs/src/internal/operators/last.ts:12](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/last.ts#L12)

### Parameters

| Parameter       | Type                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `predicate`     | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |
| `defaultValue?` | `D`                                                                                                       |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `D`\>
