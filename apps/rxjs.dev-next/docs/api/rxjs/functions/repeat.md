[API](../../index.md) / [rxjs](../index.md) / repeat

# Function: repeat()

```ts
function repeat<>(countOrConfig?: number | RepeatConfig): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/repeat.ts:114](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/repeat.ts#L114)

Returns an Observable that will resubscribe to the source stream when the source stream completes.

<span class="informal">Repeats all values emitted on the source. It's like [retry](retry.md), but for non error cases.</span>

![](/images/marble-diagrams/repeat.png)

Repeat will output values from a source until the source completes, then it will resubscribe to the
source a specified number of times, with a specified delay. Repeat can be particularly useful in
combination with closing operators like [take](take.md), [takeUntil](takeUntil.md), [first](first.md), or [takeWhile](takeWhile.md),
as it can be used to restart a source again from scratch.

Repeat is very similar to [retry](retry.md), where [retry](retry.md) will resubscribe to the source in the error case, but
`repeat` will resubscribe if the source completes.

Note that `repeat` will _not_ catch errors. Use [retry](retry.md) for that.

- `repeat(0)` returns an empty observable
- `repeat()` will repeat forever
- `repeat({ delay: 200 })` will repeat forever, with a delay of 200ms between repetitions.
- `repeat({ count: 2, delay: 400 })` will repeat twice, with a delay of 400ms between repetitions.
- `repeat({ delay: (count) => timer(count * 1000) })` will repeat forever, but will have a delay that grows by one second for each repetition.

## Parameters

| Parameter        | Type                                                        | Description                                                                                                                                                                  |
| ---------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `countOrConfig?` | `number` \| [`RepeatConfig`](../interfaces/RepeatConfig.md) | Either the number of times the source Observable items are repeated (a count of 0 will yield an empty Observable) or a [RepeatConfig](../interfaces/RepeatConfig.md) object. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

## Example

Repeat a message stream

```ts
import { of, repeat } from 'rxjs';

const source = of('Repeat message');
const result = source.pipe(repeat(3));

result.subscribe((x) => console.log(x));

// Results
// 'Repeat message'
// 'Repeat message'
// 'Repeat message'
```

Repeat 3 values, 2 times

```ts
import { interval, take, repeat } from 'rxjs';

const source = interval(1000);
const result = source.pipe(take(3), repeat(2));

result.subscribe((x) => console.log(x));

// Results every second
// 0
// 1
// 2
// 0
// 1
// 2
```

Defining two complex repeats with delays on the same source.
Note that the second repeat cannot be called until the first
repeat as exhausted it's count.

```ts
import { defer, of, repeat } from 'rxjs';

const source = defer(() => {
  return of(`Hello, it is ${new Date()}`);
});

source.pipe(
  // Repeat 3 times with a delay of 1 second between repetitions
  repeat({
    count: 3,
    delay: 1000,
  }),

  // *Then* repeat forever, but with an exponential step-back
  // maxing out at 1 minute.
  repeat({
    delay: (count) => timer(Math.min(60000, 2 ^ (count * 1000))),
  })
);
```

## See

- [repeatWhen](repeatWhen.md)
- [retry](retry.md)
