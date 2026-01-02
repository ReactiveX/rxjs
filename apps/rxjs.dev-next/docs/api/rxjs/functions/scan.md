[API](../../index.md) / [rxjs](../index.md) / scan

# Function: scan()

> Useful for encapsulating and managing state.

## Description

Applies an accumulator (or "reducer function")
to each value from the source after an initial state is established -- either via
a `seed` value (second argument), or from the first value from the source.

<span class="informal">It's like [reduce](reduce.md), but emits the current
accumulation state after each update</span>

![](/images/marble-diagrams/scan.png)

This operator maintains an internal state and emits it after processing each value as follows:

1. First value arrives

- If a `seed` value was supplied (as the second argument to `scan`), let `state = seed` and `value = firstValue`.
- If NO `seed` value was supplied (no second argument), let `state = firstValue` and go to 3.

2. Let `state = accumulator(state, value)`.

- If an error is thrown by `accumulator`, notify the consumer of an error. The process ends.

3. Emit `state`.
4. Next value arrives, let `value = nextValue`, go to 2.

```ts
function scan<>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>;
```

Defined in: [rxjs/src/internal/operators/scan.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/scan.ts#L7)

Useful for encapsulating and managing state. Applies an accumulator (or "reducer function")
to each value from the source after an initial state is established -- either via
a `seed` value (second argument), or from the first value from the source.

<span class="informal">It's like [reduce](reduce.md), but emits the current
accumulation state after each update</span>

![](/images/marble-diagrams/scan.png)

This operator maintains an internal state and emits it after processing each value as follows:

1. First value arrives

- If a `seed` value was supplied (as the second argument to `scan`), let `state = seed` and `value = firstValue`.
- If NO `seed` value was supplied (no second argument), let `state = firstValue` and go to 3.

2. Let `state = accumulator(state, value)`.

- If an error is thrown by `accumulator`, notify the consumer of an error. The process ends.

3. Emit `state`.
4. Next value arrives, let `value = nextValue`, go to 2.

## Parameters

| Parameter     | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| `accumulator` | (`acc`: `A` \| `S`, `value`: `V`, `index`: `number`) => `A` |
| `seed`        | `S`                                                         |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`V`, `A`\>

## Example

An average of previous numbers. This example shows how
not providing a `seed` can prime the stream with the
first value from the source.

```ts
import { of, scan, map } from 'rxjs';

const numbers$ = of(1, 2, 3);

numbers$
  .pipe(
    // Get the sum of the numbers coming in.
    scan((total, n) => total + n),
    // Get the average by dividing the sum by the total number
    // received so far (which is 1 more than the zero-based index).
    map((sum, index) => sum / (index + 1))
  )
  .subscribe(console.log);
```

The Fibonacci sequence. This example shows how you can use
a seed to prime accumulation process. Also... you know... Fibonacci.
So important to like, computers and stuff that its whiteboarded
in job interviews. Now you can show them the Rx version! (Please don't, haha)

```ts
import { interval, scan, map, startWith } from 'rxjs';

const firstTwoFibs = [0, 1];
// An endless stream of Fibonacci numbers.
const fibonacci$ = interval(1000).pipe(
  // Scan to get the fibonacci numbers (after 0, 1)
  scan(([a, b]) => [b, a + b], firstTwoFibs),
  // Get the second number in the tuple, it's the one you calculated
  map(([, n]) => n),
  // Start with our first two digits :)
  startWith(...firstTwoFibs)
);

fibonacci$.subscribe(console.log);
```

## See

- [expand](expand.md)
- [mergeScan](mergeScan.md)
- [reduce](reduce.md)
- [switchScan](switchScan.md)

## Param

A "reducer function". This will be called for each value after an initial state is
acquired.

## Param

The initial state. If this is not provided, the first value from the source will
be used as the initial state, and emitted without going through the accumulator. All subsequent values
will be processed by the accumulator function. If this is provided, all values will go through
the accumulator function.
