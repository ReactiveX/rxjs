[API](../../index.md) / [index](../index.md) / reduce

# Function: reduce()

> Applies an accumulator function over the source Observable, and returns the
> accumulated result when the source completes, given an optional seed value.

## Description

<span class="informal">Combines together all values emitted on the source,
using an accumulator function that knows how to join a new source value into
the accumulation from the past.</span>

![](reduce.png)

Like
[Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),
`reduce` applies an `accumulator` function against an accumulation and each
value of the source Observable (from the past) to reduce it to a single
value, emitted on the output Observable. Note that `reduce` will only emit
one value, only when the source Observable completes. It is equivalent to
applying operator [scan](scan.md) followed by operator [last](last.md).

Returns an Observable that applies a specified `accumulator` function to each
item emitted by the source Observable. If a `seed` value is specified, then
that value will be used as the initial value for the accumulator. If no seed
value is specified, the first item of the source is used as the seed.

## Example

Count the number of click events that happened in 5 seconds

```ts
import { fromEvent, takeUntil, interval, map, reduce } from 'rxjs';

const clicksInFiveSeconds = fromEvent(document, 'click')
  .pipe(takeUntil(interval(5000)));

const ones = clicksInFiveSeconds.pipe(map(() => 1));
const seed = 0;
const count = ones.pipe(reduce((acc, one) => acc + one, seed));

count.subscribe(x => console.log(x));
```

## See

 - [count](count.md)
 - [expand](expand.md)
 - [mergeScan](mergeScan.md)
 - [scan](scan.md)





## Parameters

### `accumulator`

The accumulator function called on each source value.

### `seed`

The initial accumulation value.

## Returns

`A`

function that returns an Observable that emits a single value that is the result of accumulating the values emitted by the source Observable.


## Call Signature

```ts
function reduce<>(accumulator: (acc: V | A, value: V, index: number) => A): OperatorFunction<V, V | A>;
```

Defined in: [internal/operators/reduce.ts:5](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/reduce.ts#L5)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `accumulator` | (`acc`: `V` \| `A`, `value`: `V`, `index`: `number`) => `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`V`, `V` \| `A`\>

## Call Signature

```ts
function reduce<>(accumulator: (acc: A, value: V, index: number) => A, seed: A): OperatorFunction<V, A>;
```

Defined in: [internal/operators/reduce.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/reduce.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `accumulator` | (`acc`: `A`, `value`: `V`, `index`: `number`) => `A` |
| `seed` | `A` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`V`, `A`\>

## Call Signature

```ts
function reduce<>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>;
```

Defined in: [internal/operators/reduce.ts:7](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/reduce.ts#L7)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `accumulator` | (`acc`: `A` \| `S`, `value`: `V`, `index`: `number`) => `A` |
| `seed` | `S` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`V`, `A`\>
