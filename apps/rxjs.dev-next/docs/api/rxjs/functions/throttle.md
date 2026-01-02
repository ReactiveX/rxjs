[API](../../index.md) / [rxjs](../index.md) / throttle

# Function: throttle()

```ts
function throttle<>(durationSelector: (value: T) => ObservableInput<any>, config?: ThrottleConfig): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/throttle.ts:81](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/throttle.ts#L81)

Emits a value from the source Observable, then ignores subsequent source
values for a duration determined by another Observable, then repeats this
process.

<span class="informal">It's like [throttleTime](throttleTime.md), but the silencing
duration is determined by a second Observable.</span>

<div><img class="only-light" src="/images/marble-diagrams/throttle-light.svg" alt="Marble diagram" />
<img class="only-dark" src="/images/marble-diagrams/throttle-dark.svg" alt="Marble diagram" /></div>

`throttle` emits the source Observable values on the output Observable
when its internal timer is disabled, and ignores source values when the timer
is enabled. Initially, the timer is disabled. As soon as the first source
value arrives, it is forwarded to the output Observable, and then the timer
is enabled by calling the `durationSelector` function with the source value,
which returns the "duration" Observable. When the duration Observable emits a
value, the timer is disabled, and this process repeats for the
next source value.

## Parameters

| Parameter          | Type                                                                               | Description                                                                                                                                                |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `durationSelector` | (`value`: `T`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that receives a value from the source Observable, for computing the silencing duration for each source value, returned as an `ObservableInput`. |
| `config?`          | [`ThrottleConfig`](../interfaces/ThrottleConfig.md)                                | A configuration object to define `leading` and `trailing` behavior. Defaults to `{ leading: true, trailing: false }`.                                      |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that performs the throttle
operation to limit the rate of emissions from the source.

## Example

Emit clicks at a rate of at most one click per second

```ts
import { fromEvent, throttle, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(throttle(() => interval(1000)));

result.subscribe((x) => console.log(x));
```

## See

- [audit](audit.md)
- [debounce](debounce.md)
- [delayWhen](delayWhen.md)
- [sample](sample.md)
- [throttleTime](throttleTime.md)
