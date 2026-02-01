[API](../../index.md) / [index](../index.md) / take

# Function: take()

```ts
function take<>(count: number): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/take.ts:48](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/take.ts#L48)

Emits only the first `count` values emitted by the source Observable.

<span class="informal">Takes the first `count` values from the source, then
completes.</span>

![](take.png)

`take` returns an Observable that emits only the first `count` values emitted
by the source Observable. If the source emits fewer than `count` values then
all of its values are emitted. After that, it completes, regardless if the
source completes.

## Example

Take the first 5 seconds of an infinite 1-second interval Observable

```ts
import { interval, take } from 'rxjs';

const intervalCount = interval(1000);
const takeFive = intervalCount.pipe(take(5));
takeFive.subscribe(x => console.log(x));

// Logs:
// 0
// 1
// 2
// 3
// 4
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `count` | `number` | The maximum number of `next` values to emit. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that emits only the first
`count` values emitted by the source Observable, or all of the values from
the source if the source emits fewer than `count` values.

## See

 - [takeLast](takeLast.md)
 - [takeUntil](takeUntil.md)
 - [takeWhile](takeWhile.md)
 - [skip](skip.md)
