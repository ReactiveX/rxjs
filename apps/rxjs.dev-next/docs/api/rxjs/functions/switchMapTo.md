[API](../../index.md) / [rxjs](../index.md) / switchMapTo

# ~~Function: switchMapTo()~~

```ts
function switchMapTo<>(innerObservable: O): OperatorFunction<unknown, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/switchMapTo.ts:43](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/switchMapTo.ts#L43)

Projects each source value to the same Observable which is flattened multiple
times with [switchMap](switchMap.md) in the output Observable.

<span class="informal">It's like [switchMap](switchMap.md), but maps each value
always to the same inner Observable.</span>

![](/images/marble-diagrams/switchMapTo.png)

Maps each source value to the given Observable `innerObservable` regardless
of the source value, and then flattens those resulting Observables into one
single Observable, which is the output Observable. The output Observables
emits values only from the most recently emitted instance of
`innerObservable`.

## Parameters

| Parameter         | Type | Description                                                            |
| ----------------- | ---- | ---------------------------------------------------------------------- |
| `innerObservable` | `O`  | An `ObservableInput` to replace each value from the source Observable. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`unknown`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable that emits items from the
given `innerObservable` every time a value is emitted on the source Observable,
and taking only the values from the most recently projected inner Observable.

## Example

Restart an interval Observable on every click event

```ts
import { fromEvent, switchMapTo, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(switchMapTo(interval(1000)));
result.subscribe((x) => console.log(x));
```

## See

- [concatMapTo](concatMapTo.md)
- [switchAll](switchAll.md)
- [switchMap](switchMap.md)
- [mergeMapTo](mergeMapTo.md)

## Deprecated

Will be removed in v9. Use [switchMap](switchMap.md) instead: `switchMap(() => result)`
