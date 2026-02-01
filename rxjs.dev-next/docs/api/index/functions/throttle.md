[API](../../index.md) / [index](../index.md) / throttle

# Function: throttle()

```ts
function throttle<>(durationSelector: (value: T) => ObservableInput<any>, config?: ThrottleConfig): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/throttle.ts:84](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/throttle.ts#L84)

Emits a value from the source Observable, then ignores subsequent source
values for a duration determined by another Observable, then repeats this
process.

<span class="informal">It's like [throttleTime](throttleTime.md), but the silencing
duration is determined by a second Observable.</span>

![](throttle.svg)

`throttle` emits the source Observable values on the output Observable
when its internal timer is disabled, and ignores source values when the timer
is enabled. Initially, the timer is disabled. As soon as the first source
value arrives, it is forwarded to the output Observable, and then the timer
is enabled by calling the `durationSelector` function with the source value,
which returns the "duration" Observable. When the duration Observable emits a
value, the timer is disabled, and this process repeats for the
next source value.

## Example

Emit clicks at a rate of at most one click per second

```ts
import { fromEvent, throttle, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(throttle(() => interval(1000)));

result.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `durationSelector` | (`value`: `T`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that receives a value from the source Observable, for computing the silencing duration for each source value, returned as an `ObservableInput`. |
| `config?` | [`ThrottleConfig`](../interfaces/ThrottleConfig.md) | A configuration object to define `leading` and `trailing` behavior. Defaults to `{ leading: true, trailing: false }`. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that performs the throttle
operation to limit the rate of emissions from the source.

## See

 - [audit](audit.md)
 - [debounce](debounce.md)
 - [delayWhen](delayWhen.md)
 - [sample](sample.md)
 - [throttleTime](throttleTime.md)
