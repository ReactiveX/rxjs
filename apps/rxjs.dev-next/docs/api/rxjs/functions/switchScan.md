[API](../../index.md) / [rxjs](../index.md) / switchScan

# Function: switchScan()

```ts
function switchScan<>(accumulator: (acc: R, value: T, index: number) => O, seed: R): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/switchScan.ts:24](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/switchScan.ts#L24)

Applies an accumulator function over the source Observable where the
accumulator function itself returns an Observable, emitting values
only from the most recently returned Observable.

<span class="informal">It's like [mergeScan](mergeScan.md), but only the most recent
Observable returned by the accumulator is merged into the outer Observable.</span>

## Parameters

| Parameter     | Type                                                 | Description                                           |
| ------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| `accumulator` | (`acc`: `R`, `value`: `T`, `index`: `number`) => `O` | The accumulator function called on each source value. |
| `seed`        | `R`                                                  | The initial accumulation value.                       |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an observable of the accumulated values.

## See

- [scan](scan.md)
- [mergeScan](mergeScan.md)
- [switchMap](switchMap.md)
