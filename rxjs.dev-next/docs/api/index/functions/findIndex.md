[API](../../index.md) / [index](../index.md) / findIndex

# Function: findIndex()

> Emits only the index of the first value emitted by the source Observable that
> meets some condition.

## Description

<span class="informal">It's like [find](find.md), but emits the index of the
found value, not the value itself.</span>

![](findIndex.png)

`findIndex` searches for the first item in the source Observable that matches
the specified condition embodied by the `predicate`, and returns the
(zero-based) index of the first occurrence in the source. Unlike
[first](first.md), the `predicate` is required in `findIndex`, and does not emit
an error if a valid value is not found.

## Example

Emit the index of first click that happens on a DIV element

```ts
import { fromEvent, findIndex } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(findIndex(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
result.subscribe(x => console.log(x));
```

## See

 - [filter](filter.md)
 - [find](find.md)
 - [first](first.md)
 - [take](take.md)




`predicate` function.

## Parameters

### `predicate`

A function called with each item to test for condition matching.

### `thisArg`

An optional argument to determine the value of `this` in the

## Returns

`A`

function that returns an Observable that emits the index of the first item that matches the condition.


## Call Signature

```ts
function findIndex<>(predicate: BooleanConstructor): OperatorFunction<T, T extends Falsy ? -1 : number>;
```

Defined in: [internal/operators/findIndex.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/findIndex.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` *extends* [`Falsy`](../type-aliases/Falsy.md) ? `-1` : `number`\>

## Call Signature

```ts
function findIndex<>(predicate: BooleanConstructor, thisArg: any): OperatorFunction<T, T extends Falsy ? -1 : number>;
```

Defined in: [internal/operators/findIndex.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/findIndex.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | `BooleanConstructor` |
| `thisArg` | `any` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` *extends* [`Falsy`](../type-aliases/Falsy.md) ? `-1` : `number`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function findIndex<>(predicate: (this: A, value: T, index: number, source: Observable<T>) => boolean, thisArg: A): OperatorFunction<T, number>;
```

Defined in: [internal/operators/findIndex.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/findIndex.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`this`: `A`, `value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |
| `thisArg` | `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `number`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function findIndex<>(predicate: (value: T, index: number, source: Observable<T>) => boolean): OperatorFunction<T, number>;
```

Defined in: [internal/operators/findIndex.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/findIndex.ts#L14)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `predicate` | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `number`\>
