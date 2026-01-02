[API](../../index.md) / [rxjs](../index.md) / exhaustMap

# Function: exhaustMap()

```ts
function exhaustMap<>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/exhaustMap.ts:48](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/exhaustMap.ts#L48)

Projects each source value to an Observable which is merged in the output
Observable only if the previous projected Observable has completed.

<span class="informal">Maps each value to an Observable, then flattens all of
these inner Observables using [exhaustAll](exhaustAll.md).</span>

![](/images/marble-diagrams/exhaustMap.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an (so-called "inner") Observable. When it projects a source value to
an Observable, the output Observable begins emitting the items emitted by
that projected Observable. However, `exhaustMap` ignores every new projected
Observable if the previous projected Observable has not yet completed. Once
that one completes, it will accept and flatten the next projected Observable
and repeat this process.

## Parameters

| Parameter | Type                                     | Description                                                                                       |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `project` | (`value`: `T`, `index`: `number`) => `O` | A function that, when applied to an item emitted by the source Observable, returns an Observable. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable containing projected
Observables of each item of the source, ignoring projected Observables that
start before their preceding Observable has completed.

## Example

Run a finite timer for each click, only if there is no currently active timer

```ts
import { fromEvent, exhaustMap, interval, take } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(exhaustMap(() => interval(1000).pipe(take(5))));
result.subscribe((x) => console.log(x));
```

## See

- [concatMap](concatMap.md)
- [exhaustAll](exhaustAll.md)
- [mergeMap](mergeMap.md)
- [switchMap](switchMap.md)
