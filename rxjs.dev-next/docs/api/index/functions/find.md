[API](../../index.md) / [index](../index.md) / find

# Function: find()

> Emits only the first value emitted by the source Observable that meets some
> condition.

## Description

<span class="informal">Finds the first value that passes some test and emits
that.</span>

![](find.png)

`find` searches for the first item in the source Observable that matches the
specified condition embodied by the `predicate`, and returns the first
occurrence in the source. Unlike [first](first.md), the `predicate` is required
in `find`, and does not emit an error if a valid value is not found
(emits `undefined` instead).

## Example

Find and emit the first click that happens on a DIV element

```ts
import { fromEvent, find } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(find(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
result.subscribe(x => console.log(x));
```

## See

 - [filter](filter.md)
 - [first](first.md)
 - [findIndex](findIndex.md)
 - [take](take.md)




`predicate` function.

## Parameters

### `predicate`

A function called with each item to test for condition matching.

### `thisArg`

An optional argument to determine the value of `this` in the

## Returns

`A`

function that returns an Observable that emits the first item that matches the condition.


## Call Signature

```ts
function find<>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
```

Defined in: [internal/operators/find.ts:7](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/find.ts#L7)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function find<>(predicate: (this: A, value: T, index: number, source: Observable<T>) => value is S, thisArg: A): OperatorFunction<T, S | undefined>;
```

Defined in: [internal/operators/find.ts:9](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/find.ts#L9)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`this`: `A`, `value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `value is S` |
| `thisArg` | `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S` \| `undefined`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function find<>(predicate: (value: T, index: number, source: Observable<T>) => value is S): OperatorFunction<T, S | undefined>;
```

Defined in: [internal/operators/find.ts:13](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/find.ts#L13)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `value is S` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S` \| `undefined`\>

## Call Signature

```ts
function find<>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): OperatorFunction<T, T | undefined>;
```

Defined in: [internal/operators/find.ts:17](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/find.ts#L17)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`this`: `A`, `value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |
| `thisArg` | `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `undefined`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function find<>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, T | undefined>;
```

Defined in: [internal/operators/find.ts:21](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/find.ts#L21)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `undefined`\>
