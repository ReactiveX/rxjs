[API](../../index.md) / [rxjs](../index.md) / distinctUntilKeyChanged

# Function: distinctUntilKeyChanged()

> Returns an Observable that emits all items emitted by the source Observable that
> are distinct by comparison from the previous item, using a property accessed by
> using the key provided to check if the two items are distinct.

## Description

If a comparator function is provided, then it will be called for each item to
test for whether that value should be emitted or not.

If a comparator function is not provided, an equality check is used by default.

```ts
function distinctUntilKeyChanged<>(key: K, compare: (x: T[K], y: T[K]) => boolean): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/distinctUntilKeyChanged.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/distinctUntilKeyChanged.ts#L5)

Returns an Observable that emits all items emitted by the source Observable that
are distinct by comparison from the previous item, using a property accessed by
using the key provided to check if the two items are distinct.

If a comparator function is provided, then it will be called for each item to
test for whether that value should be emitted or not.

If a comparator function is not provided, an equality check is used by default.

## Parameters

| Parameter | Type                                            |
| --------- | ----------------------------------------------- |
| `key`     | `K`                                             |
| `compare` | (`x`: `T`\[`K`\], `y`: `T`\[`K`\]) => `boolean` |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

## Example

An example comparing the name of persons

```ts
import { of, distinctUntilKeyChanged } from 'rxjs';

of({ age: 4, name: 'Foo' }, { age: 7, name: 'Bar' }, { age: 5, name: 'Foo' }, { age: 6, name: 'Foo' })
  .pipe(distinctUntilKeyChanged('name'))
  .subscribe((x) => console.log(x));

// displays:
// { age: 4, name: 'Foo' }
// { age: 7, name: 'Bar' }
// { age: 5, name: 'Foo' }
```

An example comparing the first letters of the name

```ts
import { of, distinctUntilKeyChanged } from 'rxjs';

of({ age: 4, name: 'Foo1' }, { age: 7, name: 'Bar' }, { age: 5, name: 'Foo2' }, { age: 6, name: 'Foo3' })
  .pipe(distinctUntilKeyChanged('name', (x, y) => x.substring(0, 3) === y.substring(0, 3)))
  .subscribe((x) => console.log(x));

// displays:
// { age: 4, name: 'Foo1' }
// { age: 7, name: 'Bar' }
// { age: 5, name: 'Foo2' }
```

## See

- [distinct](distinct.md)
- [distinctUntilChanged](distinctUntilChanged.md)

## Param

String key for object property lookup on each item.

## Param

Optional comparison function called to test if an item is distinct
from the previous item in the source.
