[API](../../index.md) / [rxjs](../index.md) / combineLatestAll

# Function: combineLatestAll()

> Flattens an Observable-of-Observables by applying [combineLatest](combineLatest.%0A%0A#) when the Observable-of-Observables completes.

`combineLatestAll` takes an Observable of Observables, and collects all Observables from it. Once the outer Observable completes,
it subscribes to all collected Observables and combines their values using the [combineLatest](combineLatest.md) strategy, such that:

- Every time an inner Observable emits, the output Observable emits
- When the returned observable emits, it emits all of the latest values by:
  - If a `project` function is provided, it is called with each recent value from each inner Observable in whatever order they
    arrived, and the result of the `project` function is what is emitted by the output Observable.
  - If there is no `project` function, an array of all the most recent values is emitted by the output Observable.

```ts
function combineLatestAll<>(project: (...values: any[]) => R): OperatorFunction<any, R>;
```

Defined in: [rxjs/src/internal/operators/combineLatestAll.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/combineLatestAll.ts#L8)

Flattens an Observable-of-Observables by applying [combineLatest](combineLatest.md) when the Observable-of-Observables completes.

`combineLatestAll` takes an Observable of Observables, and collects all Observables from it. Once the outer Observable completes,
it subscribes to all collected Observables and combines their values using the [combineLatest](combineLatest.md) strategy, such that:

- Every time an inner Observable emits, the output Observable emits
- When the returned observable emits, it emits all of the latest values by:
  - If a `project` function is provided, it is called with each recent value from each inner Observable in whatever order they
    arrived, and the result of the `project` function is what is emitted by the output Observable.
  - If there is no `project` function, an array of all the most recent values is emitted by the output Observable.

## Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `project` | (...`values`: `any`[]) => `R` |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`any`, `R`\>

## Example

Map two click events to a finite interval Observable, then apply `combineLatestAll`

```ts
import { fromEvent, map, interval, take, combineLatestAll } from 'rxjs';

const clicks = fromEvent(document, 'click');
const higherOrder = clicks.pipe(
  map(() => interval(Math.random() * 2000).pipe(take(3))),
  take(2)
);
const result = higherOrder.pipe(combineLatestAll());

result.subscribe((x) => console.log(x));
```

## See

- [combineLatest](combineLatest.md)
- [combineLatestWith](combineLatestWith.md)
- [mergeAll](mergeAll.md)

## Param

optional function to map the most recent values from each inner Observable into a new result.
Takes each of the most recent values from each collected inner Observable as arguments, in order.
