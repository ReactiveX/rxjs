[API](../../index.md) / [rxjs](../index.md) / map

# Function: map()

```ts
function map<>(project: (value: T, index: number) => R): OperatorFunction<T, R>;
```

Defined in: [rxjs/src/internal/operators/map.ts:39](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/map.ts#L39)

Applies a given `project` function to each value emitted by the source
Observable, and emits the resulting values as an Observable.

<span class="informal">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),
it passes each source value through a transformation function to get
corresponding output values.</span>

![](/images/marble-diagrams/map.png)

Similar to the well known `Array.prototype.map` function, this operator
applies a projection to each value and emits that projection in the output
Observable.

## Parameters

| Parameter | Type                                     | Description                                                                                                                                                                                                   |
| --------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project` | (`value`: `T`, `index`: `number`) => `R` | The function to apply to each `value` emitted by the source Observable. The `index` parameter is the number `i` for the i-th emission that has happened since the subscription, starting from the number `0`. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

A function that returns an Observable that emits the values from the
source Observable transformed by the given `project` function.

## Example

Map every click to the `clientX` position of that click

```ts
import { fromEvent, map } from 'rxjs';

const clicks = fromEvent<PointerEvent>(document, 'click');
const positions = clicks.pipe(map((ev) => ev.clientX));

positions.subscribe((x) => console.log(x));
```

## See

[mapTo](mapTo.md)
