[API](../../index.md) / [index](../index.md) / groupBy

# Function: groupBy()

## Call Signature

```ts
function groupBy<>(key: (value: T) => K, options: BasicGroupByOptions<K, T>): OperatorFunction<T, GroupedObservable<K, T>>;
```

Defined in: [internal/operators/groupBy.ts:20](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/groupBy.ts#L20)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | (`value`: `T`) => `K` |
| `options` | [`BasicGroupByOptions`](../interfaces/BasicGroupByOptions.md)\<`K`, `T`\> |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `T`\>\>

## Call Signature

```ts
function groupBy<>(key: (value: T) => K, options: GroupByOptionsWithElement<K, E, T>): OperatorFunction<T, GroupedObservable<K, E>>;
```

Defined in: [internal/operators/groupBy.ts:22](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/groupBy.ts#L22)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | (`value`: `T`) => `K` |
| `options` | [`GroupByOptionsWithElement`](../interfaces/GroupByOptionsWithElement.md)\<`K`, `E`, `T`\> |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `E`\>\>

## Call Signature

```ts
function groupBy<>(key: (value: T) => value is K): OperatorFunction<T, 
  | GroupedObservable<true, K>
| GroupedObservable<false, Exclude<T, K>>>;
```

Defined in: [internal/operators/groupBy.ts:27](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/groupBy.ts#L27)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | (`value`: `T`) => `value is K` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, 
  \| [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`true`, `K`\>
  \| [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`false`, `Exclude`\<`T`, `K`\>\>\>

## Call Signature

```ts
function groupBy<>(key: (value: T) => K): OperatorFunction<T, GroupedObservable<K, T>>;
```

Defined in: [internal/operators/groupBy.ts:31](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/groupBy.ts#L31)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | (`value`: `T`) => `K` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `T`\>\>

## Call Signature

```ts
function groupBy<>(
   key: (value: T) => K, 
   element: void, 
duration: (grouped: GroupedObservable<K, T>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, T>>;
```

Defined in: [internal/operators/groupBy.ts:36](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/groupBy.ts#L36)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | (`value`: `T`) => `K` |
| `element` | `void` |
| `duration` | (`grouped`: [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `T`\>) => [`Observable`](../classes/Observable.md)\<`any`\> |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `T`\>\>

### Deprecated

use the options parameter instead.

## Call Signature

```ts
function groupBy<>(
   key: (value: T) => K, 
   element?: (value: T) => R, 
duration?: (grouped: GroupedObservable<K, R>) => Observable<any>): OperatorFunction<T, GroupedObservable<K, R>>;
```

Defined in: [internal/operators/groupBy.ts:45](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/groupBy.ts#L45)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | (`value`: `T`) => `K` |
| `element?` | (`value`: `T`) => `R` |
| `duration?` | (`grouped`: [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `R`\>) => [`Observable`](../classes/Observable.md)\<`any`\> |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `R`\>\>

### Deprecated

use the options parameter instead.

## Call Signature

```ts
function groupBy<>(
   key: (value: T) => K, 
   element?: (value: T) => R, 
   duration?: (grouped: GroupedObservable<K, R>) => Observable<any>, 
connector?: () => Subject<R>): OperatorFunction<T, GroupedObservable<K, R>>;
```

Defined in: [internal/operators/groupBy.ts:133](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/groupBy.ts#L133)

Groups the items emitted by an Observable according to a specified criterion,
and emits these grouped items as `GroupedObservables`, one
[GroupedObservable](../interfaces/GroupedObservable.md) per group.

![](groupBy.png)

When the Observable emits an item, a key is computed for this item with the key function.

If a [GroupedObservable](../interfaces/GroupedObservable.md) for this key exists, this [GroupedObservable](../interfaces/GroupedObservable.md) emits. Otherwise, a new
[GroupedObservable](../interfaces/GroupedObservable.md) for this key is created and emits.

A [GroupedObservable](../interfaces/GroupedObservable.md) represents values belonging to the same group represented by a common key. The common
key is available as the `key` field of a [GroupedObservable](../interfaces/GroupedObservable.md) instance.

The elements emitted by [GroupedObservable](../interfaces/GroupedObservable.md)s are by default the items emitted by the Observable, or elements
returned by the element function.

## Examples

Group objects by `id` and return as array

```ts
import { of, groupBy, mergeMap, reduce } from 'rxjs';

of(
  { id: 1, name: 'JavaScript' },
  { id: 2, name: 'Parcel' },
  { id: 2, name: 'webpack' },
  { id: 1, name: 'TypeScript' },
  { id: 3, name: 'TSLint' }
).pipe(
  groupBy(p => p.id),
  mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [])))
)
.subscribe(p => console.log(p));

// displays:
// [{ id: 1, name: 'JavaScript' }, { id: 1, name: 'TypeScript'}]
// [{ id: 2, name: 'Parcel' }, { id: 2, name: 'webpack'}]
// [{ id: 3, name: 'TSLint' }]
```

Pivot data on the `id` field

```ts
import { of, groupBy, mergeMap, reduce, map } from 'rxjs';

of(
  { id: 1, name: 'JavaScript' },
  { id: 2, name: 'Parcel' },
  { id: 2, name: 'webpack' },
  { id: 1, name: 'TypeScript' },
  { id: 3, name: 'TSLint' }
).pipe(
  groupBy(p => p.id, { element: p => p.name }),
  mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], [`${ group$.key }`]))),
  map(arr => ({ id: parseInt(arr[0], 10), values: arr.slice(1) }))
)
.subscribe(p => console.log(p));

// displays:
// { id: 1, values: [ 'JavaScript', 'TypeScript' ] }
// { id: 2, values: [ 'Parcel', 'webpack' ] }
// { id: 3, values: [ 'TSLint' ] }
```

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | (`value`: `T`) => `K` | A function that extracts the key for each item. |
| `element?` | (`value`: `T`) => `R` | A function that extracts the return element for each item. |
| `duration?` | (`grouped`: [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `R`\>) => [`Observable`](../classes/Observable.md)\<`any`\> | A function that returns an Observable to determine how long each group should exist. |
| `connector?` | () => [`Subject`](../classes/Subject.md)\<`R`\> | Factory function to create an intermediate Subject through which grouped elements are emitted. |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`GroupedObservable`](../interfaces/GroupedObservable.md)\<`K`, `R`\>\>

A function that returns an Observable that emits GroupedObservables,
each of which corresponds to a unique key value and each of which emits
those items from the source Observable that share that key value.

### Deprecated

Use the options parameter instead.
