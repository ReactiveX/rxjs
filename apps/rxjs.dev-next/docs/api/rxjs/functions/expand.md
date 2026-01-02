[API](../../index.md) / [rxjs](../index.md) / expand

# Function: expand()

> Recursively projects each source value to an Observable which is merged in
> the output Observable.

## Description

<span class="informal">It's similar to [mergeMap](mergeMap.md), but applies the
projection function to every source value as well as every output value.
It's recursive.</span>

![](/images/marble-diagrams/expand.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an Observable, and then merging those resulting Observables and
emitting the results of this merger. _Expand_ will re-emit on the output
Observable every source value. Then, each output value is given to the
`project` function which returns an inner Observable to be merged on the
output Observable. Those output values resulting from the projection are also
given to the `project` function to produce new output values. This is how
_expand_ behaves recursively.

```ts
function expand<>(project: (value: T, index: number) => O, concurrent?: number): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/expand.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/expand.ts#L5)

## Parameters

| Parameter     | Type                                     | Description                                                                                                     |
| ------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `project`     | (`value`: `T`, `index`: `number`) => `O` | A function that, when applied to an item emitted by the source or the output Observable, returns an Observable. |
| `concurrent?` | `number`                                 | Maximum number of input Observables being subscribed to concurrently.                                           |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable that emits the source values
and also result of applying the projection function to each value emitted on
the output Observable and merging the results of the Observables obtained
from this transformation.
