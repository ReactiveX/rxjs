[API](../../index.md) / [rxjs](../index.md) / switchMap

# Function: switchMap()

```ts
function switchMap<>(project: (value: T, index: number) => O): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/switchMap.ts:66](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/switchMap.ts#L66)

Projects each source value to an Observable which is merged in the output
Observable, emitting values only from the most recently projected Observable.

<span class="informal">Maps each value to an Observable, then flattens all of
these inner Observables using [switchAll](switchAll.md).</span>

![](/images/marble-diagrams/switchMap.png)

Returns an Observable that emits items based on applying a function that you
supply to each item emitted by the source Observable, where that function
returns an (so-called "inner") Observable. Each time it observes one of these
inner Observables, the output Observable begins emitting the items emitted by
that inner Observable. When a new inner Observable is emitted, `switchMap`
stops emitting items from the earlier-emitted inner Observable and begins
emitting items from the new one. It continues to behave like this for
subsequent inner Observables.

## Parameters

| Parameter | Type                                     | Description                                                                                       |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `project` | (`value`: `T`, `index`: `number`) => `O` | A function that, when applied to an item emitted by the source Observable, returns an Observable. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable that emits the result of
applying the projection function to each item emitted by the source Observable
and taking only the values from the most recently projected inner Observable.

## Example

Generate new Observable according to source Observable values

```ts
import { of, switchMap } from 'rxjs';

const switched = of(1, 2, 3).pipe(switchMap((x) => of(x, x ** 2, x ** 3)));
switched.subscribe((x) => console.log(x));
// outputs
// 1
// 1
// 1
// 2
// 4
// 8
// 3
// 9
// 27
```

Restart an interval Observable on every click event

```ts
import { fromEvent, switchMap, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(switchMap(() => interval(1000)));
result.subscribe((x) => console.log(x));
```

## See

- [concatMap](concatMap.md)
- [exhaustMap](exhaustMap.md)
- [mergeMap](mergeMap.md)
- [switchAll](switchAll.md)
- [switchMapTo](switchMapTo.md)
