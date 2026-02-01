[API](../../index.md) / [index](../index.md) / debounce

# Function: debounce()

```ts
function debounce<>(durationSelector: (value: T) => ObservableInput<any>): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/debounce.ts:66](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/debounce.ts#L66)

Emits a notification from the source Observable only after a particular time span
determined by another Observable has passed without another source emission.

<span class="informal">It's like [debounceTime](debounceTime.md), but the time span of
emission silence is determined by a second Observable.</span>

![](debounce.svg)

`debounce` delays notifications emitted by the source Observable, but drops previous
pending delayed emissions if a new notification arrives on the source Observable.
This operator keeps track of the most recent notification from the source
Observable, and spawns a duration Observable by calling the
`durationSelector` function. The notification is emitted only when the duration
Observable emits a next notification, and if no other notification was emitted on
the source Observable since the duration Observable was spawned. If a new
notification appears before the duration Observable emits, the previous notification will
not be emitted and a new duration is scheduled from `durationSelector` is scheduled.
If the completing event happens during the scheduled duration the last cached notification
is emitted before the completion event is forwarded to the output observable.
If the error event happens during the scheduled duration or after it only the error event is
forwarded to the output observable. The cache notification is not emitted in this case.

Like [debounceTime](debounceTime.md), this is a rate-limiting operator, and also a
delay-like operator since output emissions do not necessarily occur at the
same time as they did on the source Observable.

## Example

Emit the most recent click after a burst of clicks

```ts
import { fromEvent, scan, debounce, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const result = clicks.pipe(
  scan(i => ++i, 1),
  debounce(i => interval(200 * i))
);
result.subscribe(x => console.log(x));
```

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `durationSelector` | (`value`: `T`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | A function that receives a value from the source Observable, for computing the timeout duration for each source value, returned as an Observable or a Promise. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that delays the emissions of
the source Observable by the specified duration Observable returned by
`durationSelector`, and may drop some values if they occur too frequently.

## See

 - [audit](audit.md)
 - [auditTime](auditTime.md)
 - [debounceTime](debounceTime.md)
 - [delay](delay.md)
 - [sample](sample.md)
 - [sampleTime](sampleTime.md)
 - [throttle](throttle.md)
 - [throttleTime](throttleTime.md)
