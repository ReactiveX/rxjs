[API](../../index.md) / [index](../index.md) / partition

# ~~Function: partition()~~

> Splits the source Observable into two, one with values that satisfy a
> predicate, and another with values that don't satisfy the predicate.

## Description

<span class="informal">It's like [filter](filter.md), but returns two Observables:
one like the output of [filter](filter.md), and the other with values that did not
pass the condition.</span>

![](partition.png)

`partition` outputs an array with two Observables that partition the values
from the source Observable through the given `predicate` function. The first
Observable in that array emits source values for which the predicate argument
returns true. The second Observable emits source values for which the
predicate returns false. The first behaves like [filter](filter.md) and the second
behaves like [filter](filter.md) with the predicate negated.

## Example

Partition a set of numbers into odds and evens observables

```ts
import { of, partition } from 'rxjs';

const observableValues = of(1, 2, 3, 4, 5, 6);
const [evens$, odds$] = partition(observableValues, value => value % 2 === 0);

odds$.subscribe(x => console.log('odds', x));
evens$.subscribe(x => console.log('evens', x));

// Logs:
// odds 1
// odds 3
// odds 5
// evens 2
// evens 4
// evens 6
```

## See

[filter](filter.md)


two Observable elements.


Observable. If it returns `true`, the value is emitted on the first Observable
in the returned array, if `false` the value is emitted on the second Observable
in the array. The `index` parameter is the number `i` for the i-th source
emission that has happened since the subscription, starting from the number `0`.


`predicate` function.

## Parameters

### `source`

The source `ObservableInput` that will be split into a tuple of

### `predicate`

A function that evaluates each value emitted by the source

### `thisArg`

An optional argument to determine the value of `this` in the

## Returns

`An array with two Observables`

one with values that passed the
predicate, and another with values that did not pass the predicate.


## Call Signature

```ts
function partition<>(
   source: ObservableInput<T>, 
   predicate: (this: A, value: T, index: number) => value is U, 
   thisArg: A): [Observable<U>, Observable<Exclude<T, U>>];
```

Defined in: [internal/observable/partition.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/partition.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\> |
| `predicate` | (`this`: `A`, `value`: `T`, `index`: `number`) => `value is U` |
| `thisArg` | `A` |

### Returns

\[[`Observable`](../classes/Observable.md)\<`U`\>, [`Observable`](../classes/Observable.md)\<`Exclude`\<`T`, `U`\>\>\]

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function partition<>(source: ObservableInput<T>, predicate: (value: T, index: number) => value is U): [Observable<U>, Observable<Exclude<T, U>>];
```

Defined in: [internal/observable/partition.ts:13](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/partition.ts#L13)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\> |
| `predicate` | (`value`: `T`, `index`: `number`) => `value is U` |

### Returns

\[[`Observable`](../classes/Observable.md)\<`U`\>, [`Observable`](../classes/Observable.md)\<`Exclude`\<`T`, `U`\>\>\]

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function partition<>(
   source: ObservableInput<T>, 
   predicate: (this: A, value: T, index: number) => boolean, 
   thisArg: A): [Observable<T>, Observable<T>];
```

Defined in: [internal/observable/partition.ts:19](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/partition.ts#L19)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\> |
| `predicate` | (`this`: `A`, `value`: `T`, `index`: `number`) => `boolean` |
| `thisArg` | `A` |

### Returns

\[[`Observable`](../classes/Observable.md)\<`T`\>, [`Observable`](../classes/Observable.md)\<`T`\>\]

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function partition<>(source: ObservableInput<T>, predicate: (value: T, index: number) => boolean): [Observable<T>, Observable<T>];
```

Defined in: [internal/observable/partition.ts:24](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/partition.ts#L24)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\> |
| `predicate` | (`value`: `T`, `index`: `number`) => `boolean` |

### Returns

\[[`Observable`](../classes/Observable.md)\<`T`\>, [`Observable`](../classes/Observable.md)\<`T`\>\]

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
