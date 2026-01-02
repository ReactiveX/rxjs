[API](../../index.md) / [rxjs](../index.md) / toArray

# Function: toArray()

```ts
function toArray<>(): OperatorFunction<T, T[]>;
```

Defined in: [rxjs/src/internal/operators/toArray.ts:37](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/toArray.ts#L37)

Collects all source emissions and emits them as an array when the source completes.

<span class="informal">Get all values inside an array when the source completes</span>

![](/images/marble-diagrams/toArray.png)

`toArray` will wait until the source Observable completes before emitting
the array containing all emissions. When the source Observable errors no
array will be emitted.

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`[]\>

A function that returns an Observable that emits an array of items
emitted by the source Observable when source completes.

## Example

```ts
import { interval, take, toArray } from 'rxjs';

const source = interval(1000);
const example = source.pipe(take(10), toArray());

example.subscribe((value) => console.log(value));

// output: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
```
