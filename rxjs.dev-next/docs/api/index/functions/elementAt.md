[API](../../index.md) / [index](../index.md) / elementAt

# Function: elementAt()

```ts
function elementAt<>(index: number, defaultValue?: D): OperatorFunction<T, T | D>;
```

Defined in: [internal/operators/elementAt.ts:57](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/elementAt.ts#L57)

Emits the single value at the specified `index` in a sequence of emissions
from the source Observable.

<span class="informal">Emits only the i-th value, then completes.</span>

![](elementAt.png)

`elementAt` returns an Observable that emits the item at the specified
`index` in the source Observable, or a default value if that `index` is out
of range and the `default` argument is provided. If the `default` argument is
not given and the `index` is out of range, the output Observable will emit an
`ArgumentOutOfRangeError` error.

## Example

Emit only the third click event

```ts
import { fromEvent, elementAt } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(elementAt(2));
result.subscribe(x => console.log(x));

// Results in:
// click 1 = nothing
// click 2 = nothing
// click 3 = MouseEvent object logged to console
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `index` | `number` | Is the number `i` for the i-th source emission that has happened since the subscription, starting from the number `0`. |
| `defaultValue?` | `D` | The default value returned for missing indices. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `D`\>

A function that returns an Observable that emits a single item, if
it is found. Otherwise, it will emit the default value if given. If not, it
emits an error.

## See

 - [first](first.md)
 - [last](last.md)
 - [skip](skip.md)
 - [single](single.md)
 - [take](take.md)

## Throws

When using `elementAt(i)`, it delivers an
`ArgumentOutOfRangeError` to the Observer's `error` callback if `i < 0` or the
Observable has completed before emitting the i-th `next` notification.
