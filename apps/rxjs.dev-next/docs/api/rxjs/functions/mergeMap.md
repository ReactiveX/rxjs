[API](../../index.md) / [rxjs](../index.md) / mergeMap

# Function: mergeMap()

```ts
function mergeMap<>(project: (value: T, index: number) => O, concurrent: number): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/mergeMap.ts:58](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/mergeMap.ts#L58)

Projects each source value to an Observable which is merged in the output
Observable.

<span class="informal">Maps each value to an Observable, then flattens all of
these inner Observables using [mergeAll](mergeAll.md).</span>

![](/images/marble-diagrams/mergeMap.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an Observable, and then merging those resulting Observables and
emitting the results of this merger.

## Parameters

| Parameter    | Type                                     | Default value | Description                                                                                       |
| ------------ | ---------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------- |
| `project`    | (`value`: `T`, `index`: `number`) => `O` | `undefined`   | A function that, when applied to an item emitted by the source Observable, returns an Observable. |
| `concurrent` | `number`                                 | `Infinity`    | Maximum number of `ObservableInput`s being subscribed to concurrently.                            |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable that emits the result of
applying the projection function to each item emitted by the source Observable
and merging the results of the Observables obtained from this transformation.

## Example

Map and flatten each letter to an Observable ticking every 1 second

```ts
import { of, mergeMap, interval, map } from 'rxjs';

const letters = of('a', 'b', 'c');
const result = letters.pipe(mergeMap((x) => interval(1000).pipe(map((i) => x + i))));

result.subscribe((x) => console.log(x));

// Results in the following:
// a0
// b0
// c0
// a1
// b1
// c1
// continues to list a, b, c every second with respective ascending integers
```

## See

- [concatMap](concatMap.md)
- [exhaustMap](exhaustMap.md)
- [merge](merge.md)
- [mergeAll](mergeAll.md)
- [mergeMapTo](mergeMapTo.md)
- [mergeScan](mergeScan.md)
- [switchMap](switchMap.md)
