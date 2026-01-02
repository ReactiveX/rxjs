[API](../../index.md) / [rxjs](../index.md) / mergeWith

# Function: mergeWith()

```ts
function mergeWith<>(...otherSources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

Defined in: [rxjs/src/internal/operators/mergeWith.ts:46](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/mergeWith.ts#L46)

Merge the values from all observables to a single observable result.

Creates an observable, that when subscribed to, subscribes to the source
observable, and all other sources provided as arguments. All values from
every source are emitted from the resulting subscription.

When all sources complete, the resulting observable will complete.

When any source errors, the resulting observable will error.

## Parameters

| Parameter         | Type                               | Description                                     |
| ----------------- | ---------------------------------- | ----------------------------------------------- |
| ...`otherSources` | \[`...ObservableInputTuple<A>[]`\] | the sources to combine the current source with. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

A function that returns an Observable that merges the values from
all given Observables.

## Example

Joining all outputs from multiple user input event streams

```ts
import { fromEvent, map, mergeWith } from 'rxjs';

const clicks$ = fromEvent(document, 'click').pipe(map(() => 'click'));
const mousemoves$ = fromEvent(document, 'mousemove').pipe(map(() => 'mousemove'));
const dblclicks$ = fromEvent(document, 'dblclick').pipe(map(() => 'dblclick'));

mousemoves$.pipe(mergeWith(clicks$, dblclicks$)).subscribe((x) => console.log(x));

// result (assuming user interactions)
// 'mousemove'
// 'mousemove'
// 'mousemove'
// 'click'
// 'click'
// 'dblclick'
```

## See

[merge](merge.md)
