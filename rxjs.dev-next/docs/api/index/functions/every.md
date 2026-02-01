[API](../../index.md) / [index](../index.md) / every

# Function: every()

> Returns an Observable that emits whether or not every item of the source satisfies the condition specified.

## Description

<span class="informal">If all values pass predicate before the source completes, emits true before completion,
otherwise emit false, then complete.</span>

![](every.png)

## Example

A simple example emitting true if all elements are less than 5, false otherwise

```ts
import { of, every } from 'rxjs';

of(1, 2, 3, 4, 5, 6)
  .pipe(every(x => x < 5))
  .subscribe(x => console.log(x)); // -> false
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

Defined in: [internal/operators/every.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/every.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `Exclude`\<`T`, [`Falsy`](../type-aliases/Falsy.md)\> *extends* `never` ? `false` : `boolean`\>

## Call Signature

```ts
function every<>(predicate: BooleanConstructor, thisArg: any): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
```

Defined in: [internal/operators/every.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/every.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `BooleanConstructor` |
| `thisArg` | `any` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `Exclude`\<`T`, [`Falsy`](../type-aliases/Falsy.md)\> *extends* `never` ? `false` : `boolean`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function every<>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): OperatorFunction<T, boolean>;
```

Defined in: [internal/operators/every.ts:13](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/every.ts#L13)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`this`: `A`, `value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |
| `thisArg` | `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `boolean`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function every<>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, boolean>;
```

Defined in: [internal/operators/every.ts:17](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/every.ts#L17)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `boolean`\>
