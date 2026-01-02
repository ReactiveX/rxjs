[API](../../index.md) / [rxjs](../index.md) / takeWhile

# Function: takeWhile()

> Emits values emitted by the source Observable so long as each value satisfies
> the given `predicate`, and then completes as soon as this `predicate` is not
> satisfied.

## Description

<span class="informal">Takes values from the source only while they pass the
condition given. When the first value does not satisfy, it completes.</span>

![](/images/marble-diagrams/takeWhile.png)

`takeWhile` subscribes and begins mirroring the source Observable. Each value
emitted on the source is given to the `predicate` function which returns a
boolean, representing a condition to be satisfied by the source values. The
output Observable emits the source values until such time as the `predicate`
returns false, at which point `takeWhile` stops mirroring the source
Observable and completes the output Observable.

```ts
function takeWhile<>(predicate: (value: T, index: number) => boolean, inclusive?: boolean): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/takeWhile.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeWhile.ts#L9)

Emits values emitted by the source Observable so long as each value satisfies
the given `predicate`, and then completes as soon as this `predicate` is not
satisfied.

<span class="informal">Takes values from the source only while they pass the
condition given. When the first value does not satisfy, it completes.</span>

![](/images/marble-diagrams/takeWhile.png)

`takeWhile` subscribes and begins mirroring the source Observable. Each value
emitted on the source is given to the `predicate` function which returns a
boolean, representing a condition to be satisfied by the source values. The
output Observable emits the source values until such time as the `predicate`
returns false, at which point `takeWhile` stops mirroring the source
Observable and completes the output Observable.

## Parameters

| Parameter    | Type                                           |
| ------------ | ---------------------------------------------- |
| `predicate`  | (`value`: `T`, `index`: `number`) => `boolean` |
| `inclusive?` | `boolean`                                      |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

## Example

Emit click events only while the clientX property is greater than 200

```ts
import { fromEvent, takeWhile } from 'rxjs';

const clicks = fromEvent<PointerEvent>(document, 'click');
const result = clicks.pipe(takeWhile((ev) => ev.clientX > 200));
result.subscribe((x) => console.log(x));
```

## See

- [take](take.md)
- [takeLast](takeLast.md)
- [takeUntil](takeUntil.md)
- [skip](skip.md)

## Param

A function that evaluates a value emitted by the source
Observable and returns a boolean. Also takes the (zero-based) index as the
second argument.

## Param

When set to `true` the value that caused `predicate` to
return `false` will also be emitted.
