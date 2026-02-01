[API](../../index.md) / [index](../index.md) / map

# Function: map()

> Applies a given `project` function to each value emitted by the source
> Observable, and emits the resulting values as an Observable.

## Description

<span class="informal">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),
it passes each source value through a transformation function to get
corresponding output values.</span>

![](map.png)

Similar to the well known `Array.prototype.map` function, this operator
applies a projection to each value and emits that projection in the output
Observable.

## Example

Map every click to the `clientX` position of that click

```ts
import { fromEvent, map } from 'rxjs';

const clicks = fromEvent<PointerEvent>(document, 'click');
const positions = clicks.pipe(map(ev => ev.clientX));

positions.subscribe(x => console.log(x));
```

## See

 - [mapTo](mapTo.md)
 - [pluck](pluck.md)


Observable. The `index` parameter is the number `i` for the i-th emission
that has happened since the subscription, starting from the number `0`.


`project` function.

## Parameters

### `project`

The function to apply to each `value` emitted by the source

### `thisArg`

An optional argument to define what `this` is in the

## Returns

`A function that returns an Observable that emits the values from the
source Observable transformed by the given`

function.


## Call Signature

```ts
function map<>(project: (value: T, index: number) => R): OperatorFunction<T, R>;
```

Defined in: [internal/operators/map.ts:5](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/map.ts#L5)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`value`: `T`, `index`: `number`) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

## Call Signature

```ts
function map<>(project: (this: A, value: T, index: number) => R, thisArg: A): OperatorFunction<T, R>;
```

Defined in: [internal/operators/map.ts:7](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/map.ts#L7)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (`this`: `A`, `value`: `T`, `index`: `number`) => `R` |
| `thisArg` | `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
