[API](../../index.md) / [rxjs](../index.md) / last

# Function: last()

> Returns an Observable that emits only the last item emitted by the source Observable.

## Description

It optionally takes a predicate function as a parameter, in which case, rather than emitting
the last item from the source Observable, the resulting Observable will emit the last item
from the source Observable that satisfies the predicate.

![](/images/marble-diagrams/last.png)

It will emit an error notification if the source completes without notification or one that matches
the predicate. It returns the last value or if a predicate is provided last value that matches the
predicate. It returns the given default value if no notification is emitted or matches the predicate.

```ts
function last<>(predicate: (value: T, index: number, source: Observable<T>) => boolean, defaultValue?: D): OperatorFunction<T, T | D>;
```

Defined in: [rxjs/src/internal/operators/last.ts:12](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/last.ts#L12)

Returns an Observable that emits only the last item emitted by the source Observable.
It optionally takes a predicate function as a parameter, in which case, rather than emitting
the last item from the source Observable, the resulting Observable will emit the last item
from the source Observable that satisfies the predicate.

![](/images/marble-diagrams/last.png)

It will emit an error notification if the source completes without notification or one that matches
the predicate. It returns the last value or if a predicate is provided last value that matches the
predicate. It returns the given default value if no notification is emitted or matches the predicate.

## Parameters

| Parameter       | Type                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `predicate`     | (`value`: `T`, `index`: `number`, `source`: [`Observable`](../classes/Observable.md)\<`T`\>) => `boolean` |
| `defaultValue?` | `D`                                                                                                       |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `D`\>

## Example

Last alphabet from the sequence

```ts
import { from, last } from 'rxjs';

const source = from(['x', 'y', 'z']);
const result = source.pipe(last());

result.subscribe((value) => console.log(`Last alphabet: ${value}`));

// Outputs
// Last alphabet: z
```

Default value when the value in the predicate is not matched

```ts
import { from, last } from 'rxjs';

const source = from(['x', 'y', 'z']);
const result = source.pipe(last((char) => char === 'a', 'not found'));

result.subscribe((value) => console.log(`'a' is ${value}.`));

// Outputs
// 'a' is not found.
```

## See

- [skip](skip.md)
- [skipUntil](skipUntil.md)
- [skipLast](skipLast.md)
- [skipWhile](skipWhile.md)
- [first](first.md)

## Throws

Delivers an `EmptyError` to the Observer's `error`
callback if the Observable completes before any `next` notification was sent.

## Param

The condition any source emitted item has to satisfy.

## Param

An optional default value to provide if last `predicate`
isn't met or no values were emitted.
