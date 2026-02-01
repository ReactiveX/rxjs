[API](../../index.md) / [index](../index.md) / combineLatestAll

# Function: combineLatestAll()

> Flattens an Observable-of-Observables by applying [combineLatest](combineLatest.md) when the Observable-of-Observables completes.

## Description

`combineLatestAll` takes an Observable of Observables, and collects all Observables from it. Once the outer Observable completes,
it subscribes to all collected Observables and combines their values using the [combineLatest](combineLatest.md) strategy, such that:

* Every time an inner Observable emits, the output Observable emits
* When the returned observable emits, it emits all of the latest values by:
   * If a `project` function is provided, it is called with each recent value from each inner Observable in whatever order they
     arrived, and the result of the `project` function is what is emitted by the output Observable.
   * If there is no `project` function, an array of all the most recent values is emitted by the output Observable.

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

result.subscribe(x => console.log(x));
```

## See

 - [combineLatest](combineLatest.md)
 - [combineLatestWith](combineLatestWith.md)
 - [mergeAll](mergeAll.md)


Takes each of the most recent values from each collected inner Observable as arguments, in order.

## Parameters

### `project`

optional function to map the most recent values from each inner Observable into a new result.

## Returns

`A`

function that returns an Observable that flattens Observables emitted by the source Observable.


## Call Signature

```ts
function combineLatestAll<>(): OperatorFunction<ObservableInput<T>, T[]>;
```

Defined in: [internal/operators/combineLatestAll.ts:5](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineLatestAll.ts#L5)

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<[`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\>, `T`[]\>

## Call Signature

```ts
function combineLatestAll<>(): OperatorFunction<any, T[]>;
```

Defined in: [internal/operators/combineLatestAll.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineLatestAll.ts#L6)

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`any`, `T`[]\>

## Call Signature

```ts
function combineLatestAll<>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>;
```

Defined in: [internal/operators/combineLatestAll.ts:7](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineLatestAll.ts#L7)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (...`values`: `T`[]) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<[`ObservableInput`](../type-aliases/ObservableInput.md)\<`T`\>, `R`\>

## Call Signature

```ts
function combineLatestAll<>(project: (...values: any[]) => R): OperatorFunction<any, R>;
```

Defined in: [internal/operators/combineLatestAll.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/combineLatestAll.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `project` | (...`values`: `any`[]) => `R` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`any`, `R`\>
