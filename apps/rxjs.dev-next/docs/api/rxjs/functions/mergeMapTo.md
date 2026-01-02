[API](../../index.md) / [rxjs](../index.md) / mergeMapTo

# ~~Function: mergeMapTo()~~

```ts
function mergeMapTo<>(innerObservable: O, concurrent?: number): OperatorFunction<unknown, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/mergeMapTo.ts:45](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/mergeMapTo.ts#L45)

Projects each source value to the same Observable which is merged multiple
times in the output Observable.

<span class="informal">It's like [mergeMap](mergeMap.md), but maps each value always
to the same inner Observable.</span>

![](/images/marble-diagrams/mergeMapTo.png)

Maps each source value to the given Observable `innerObservable` regardless
of the source value, and then merges those resulting Observables into one
single Observable, which is the output Observable.

## Parameters

| Parameter         | Type     | Description                                                            |
| ----------------- | -------- | ---------------------------------------------------------------------- |
| `innerObservable` | `O`      | An `ObservableInput` to replace each value from the source Observable. |
| `concurrent?`     | `number` | Maximum number of input Observables being subscribed to concurrently.  |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`unknown`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable that emits items from the
given `innerObservable`.

## Example

For each click event, start an interval Observable ticking every 1 second

```ts
import { fromEvent, mergeMapTo, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(mergeMapTo(interval(1000)));

result.subscribe((x) => console.log(x));
```

## See

- [concatMapTo](concatMapTo.md)
- [merge](merge.md)
- [mergeAll](mergeAll.md)
- [mergeMap](mergeMap.md)
- [mergeScan](mergeScan.md)
- [switchMapTo](switchMapTo.md)

## Deprecated

Will be removed in v9. Use [mergeMap](mergeMap.md) instead: `mergeMap(() => result)`
