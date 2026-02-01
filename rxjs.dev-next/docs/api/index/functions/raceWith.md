[API](../../index.md) / [index](../index.md) / raceWith

# Function: raceWith()

```ts
function raceWith<>(...otherSources: [...ObservableInputTuple<A>[]]): OperatorFunction<T, T | A[number]>;
```

Defined in: [internal/operators/raceWith.ts:32](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/raceWith.ts#L32)

Creates an Observable that mirrors the first source Observable to emit a next,
error or complete notification from the combination of the Observable to which
the operator is applied and supplied Observables.

## Example

```ts
import { interval, map, raceWith } from 'rxjs';

const obs1 = interval(7000).pipe(map(() => 'slow one'));
const obs2 = interval(3000).pipe(map(() => 'fast one'));
const obs3 = interval(5000).pipe(map(() => 'medium one'));

obs1
  .pipe(raceWith(obs2, obs3))
  .subscribe(winner => console.log(winner));

// Outputs
// a series of 'fast one'
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| ...`otherSources` | \[`...ObservableInputTuple<A>[]`\] | Sources used to race for which Observable emits first. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `A`\[`number`\]\>

A function that returns an Observable that mirrors the output of the
first Observable to emit an item.
