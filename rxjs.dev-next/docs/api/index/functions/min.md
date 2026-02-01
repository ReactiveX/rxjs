[API](../../index.md) / [index](../index.md) / min

# Function: min()

```ts
function min<>(comparer?: (x: T, y: T) => number): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/min.ts:52](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/min.ts#L52)

The `min` operator operates on an Observable that emits numbers (or items that
can be compared with a provided function), and when source Observable completes
it emits a single item: the item with the smallest value.

![](min.png)

## Examples

Get the minimal value of a series of numbers

```ts
import { of, min } from 'rxjs';

of(5, 4, 7, 2, 8)
  .pipe(min())
  .subscribe(x => console.log(x));

// Outputs
// 2
```

Use a comparer function to get the minimal item

```ts
import { of, min } from 'rxjs';

of(
  { age: 7, name: 'Foo' },
  { age: 5, name: 'Bar' },
  { age: 9, name: 'Beer' }
).pipe(
  min((a, b) => a.age < b.age ? -1 : 1)
)
.subscribe(x => console.log(x.name));

// Outputs
// 'Bar'
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `comparer?` | (`x`: `T`, `y`: `T`) => `number` | Optional comparer function that it will use instead of its default to compare the value of two items. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that emits item with the
smallest value.

## See

[max](max.md)
