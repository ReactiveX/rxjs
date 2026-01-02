[API](../../index.md) / [rxjs](../index.md) / takeLast

# Function: takeLast()

```ts
function takeLast<>(count: number): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/takeLast.ts:44](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeLast.ts#L44)

Waits for the source to complete, then emits the last N values from the source,
as specified by the `count` argument.

![](/images/marble-diagrams/takeLast.png)

`takeLast` results in an observable that will hold values up to `count` values in memory,
until the source completes. It then pushes all values in memory to the consumer, in the
order they were received from the source, then notifies the consumer that it is
complete.

If for some reason the source completes before the `count` supplied to `takeLast` is reached,
all values received until that point are emitted, and then completion is notified.

**Warning**: Using `takeLast` with an observable that never completes will result
in an observable that never emits a value.

## Parameters

| Parameter | Type     | Description                                                                                                   |
| --------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| `count`   | `number` | The maximum number of values to emit from the end of the sequence of values emitted by the source Observable. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that emits at most the last
`count` values emitted by the source Observable.

## Example

Take the last 3 values of an Observable with many values

```ts
import { range, takeLast } from 'rxjs';

const many = range(1, 100);
const lastThree = many.pipe(takeLast(3));
lastThree.subscribe((x) => console.log(x));
```

## See

- [take](take.md)
- [takeUntil](takeUntil.md)
- [takeWhile](takeWhile.md)
- [skip](skip.md)
