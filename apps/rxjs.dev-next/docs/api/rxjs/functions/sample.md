[API](../../index.md) / [rxjs](../index.md) / sample

# Function: sample()

```ts
function sample<>(notifier: ObservableInput<any>): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/sample.ts:45](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/sample.ts#L45)

Emits the most recently emitted value from the source Observable whenever
another Observable, the `notifier`, emits.

<span class="informal">It's like [sampleTime](sampleTime.md), but samples whenever
the `notifier` `ObservableInput` emits something.</span>

![](/images/marble-diagrams/sample.png)

Whenever the `notifier` `ObservableInput` emits a value, `sample`
looks at the source Observable and emits whichever value it has most recently
emitted since the previous sampling, unless the source has not emitted
anything since the previous sampling. The `notifier` is subscribed to as soon
as the output Observable is subscribed.

## Parameters

| Parameter  | Type                                                             | Description                                                      |
| ---------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| `notifier` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | The `ObservableInput` to use for sampling the source Observable. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that emits the results of
sampling the values emitted by the source Observable whenever the notifier
Observable emits value or completes.

## Example

On every click, sample the most recent `seconds` timer

```ts
import { fromEvent, interval, sample } from 'rxjs';

const seconds = interval(1000);
const clicks = fromEvent(document, 'click');
const result = seconds.pipe(sample(clicks));

result.subscribe((x) => console.log(x));
```

## See

- [audit](audit.md)
- [debounce](debounce.md)
- [sampleTime](sampleTime.md)
- [throttle](throttle.md)
