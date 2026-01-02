[API](../../index.md) / [rxjs](../index.md) / single

# Function: single()

> Returns an observable that asserts that only one value is
> emitted from the observable that matches the predicate. If no
> predicate is provided, then it will assert that the observable
> only emits one value.

## Description

If the source Observable did not emit `next` before completion, it
will emit an [EmptyError](../classes/EmptyError.md) to the Observer's `error` callback.

In the event that two values are found that match the predicate,
or when there are two values emitted and no predicate, it will
emit a [SequenceError](../classes/SequenceError.md) to the Observer's `error` callback.

In the event that no values match the predicate, if one is provided,
it will emit a [NotFoundError](../classes/NotFoundError.md) to the Observer's `error` callback.

## Example

Expect only `name` beginning with `'B'`

```ts
import { of, single } from 'rxjs';

const source1 = of({ name: 'Ben' }, { name: 'Tracy' }, { name: 'Laney' }, { name: 'Lily' });

source1.pipe(single((x) => x.name.startsWith('B'))).subscribe((x) => console.log(x));
// Emits 'Ben'

const source2 = of({ name: 'Ben' }, { name: 'Tracy' }, { name: 'Bradley' }, { name: 'Lincoln' });

source2.pipe(single((x) => x.name.startsWith('B'))).subscribe({ error: (err) => console.error(err) });
// Error emitted: SequenceError('Too many values match')

const source3 = of({ name: 'Laney' }, { name: 'Tracy' }, { name: 'Lily' }, { name: 'Lincoln' });

source3.pipe(single((x) => x.name.startsWith('B'))).subscribe({ error: (err) => console.error(err) });
// Error emitted: NotFoundError('No values match')
```

## See

- [first](first.md)
- [find](find.md)
- [findIndex](findIndex.md)
- [elementAt](elementAt.md)

## Throws

Delivers a `NotFoundError` to the Observer's `error`
callback if the Observable completes before any `next` notification was sent.

## Throws

Delivers a `SequenceError` if more than one value is
emitted that matches the provided predicate. If no predicate is provided, it
will deliver a `SequenceError` if more than one value comes from the source.

## Throws

Delivers an `EmptyError` if no values were `next`ed prior
to completion.

Observable.

## Parameters

### `predicate`

A predicate function to evaluate items emitted by the source

## Returns

`A`

function that returns an Observable that emits the single item emitted by the source Observable that matches the predicate.

## Call Signature

```ts
function single<>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/single.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/single.ts#L8)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

## Call Signature

```ts
function single<>(predicate?: (value: T, index: number, source: Observable<T>) => boolean): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/single.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/single.ts#L9)

### Parameters

| Parameter    | Type                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| `predicate?` | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>
