[API](../../index.md) / [rxjs](../index.md) / every

# Function: every()

> Returns an Observable that emits whether or not every item of the source satisfies the condition specified.

## Description

<span class="informal">If all values pass predicate before the source completes, emits true before completion,
otherwise emit false, then complete.</span>

![](/images/marble-diagrams/every.png)

## Example

A simple example emitting true if all elements are less than 5, false otherwise

```ts
import { of, every } from 'rxjs';

of(1, 2, 3, 4, 5, 6)
  .pipe(every((x) => x < 5))
  .subscribe((x) => console.log(x)); // -> false
```

## Parameters

### `predicate`

A function for determining if an item meets a specified condition.

### `thisArg`

Optional object to use for `this` in the callback.

## Returns

`A`

function that returns an Observable of booleans that determines if all items of the source Observable meet the condition specified.

## Call Signature

```ts
function every<>(predicate: BooleanConstructor): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
```

Defined in: [rxjs/src/internal/operators/every.ts:4](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/every.ts#L4)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `Exclude`\<`T`, [`Falsy`](../type-aliases/Falsy.md)\> _extends_ `never` ? `false` : `boolean`\>

## Call Signature

```ts
function every<>(predicate: (value: T, index: number) => boolean): OperatorFunction<T, boolean>;
```

Defined in: [rxjs/src/internal/operators/every.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/every.ts#L5)

### Parameters

| Parameter   | Type                                           |
| ----------- | ---------------------------------------------- |
| `predicate` | (`value`: `T`, `index`: `number`) => `boolean` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `boolean`\>
