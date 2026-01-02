[API](../../index.md) / [rxjs](../index.md) / delayWhen

# ~~Function: delayWhen()~~

> Delays the emission of items from the source Observable by a given time span
> determined by the emissions of another Observable.

## Description

<span class="informal">It's like [delay](delay.md), but the time span of the
delay duration is determined by a second Observable.</span>

![](/images/marble-diagrams/delayWhen.png)

`delayWhen` operator shifts each emitted value from the source Observable by
a time span determined by another Observable. When the source emits a value,
the `delayDurationSelector` function is called with the value emitted from
the source Observable as the first argument to the `delayDurationSelector`.
The `delayDurationSelector` function should return an [ObservableInput](../type-aliases/ObservableInput.md),
that is internally converted to an Observable that is called the "duration"
Observable.

The source value is emitted on the output Observable only when the "duration"
Observable emits ([next](https://rxjs.dev/guide/glossary-and-semantics#next)s) any value.
Upon that, the "duration" Observable gets unsubscribed.

Before RxJS V7, the [completion](https://rxjs.dev/guide/glossary-and-semantics#complete)
of the "duration" Observable would have been triggering the emission of the
source value to the output Observable, but with RxJS V7, this is not the case
anymore.

Only next notifications (from the "duration" Observable) trigger values from
the source Observable to be passed to the output Observable. If the "duration"
Observable only emits the complete notification (without next), the value
emitted by the source Observable will never get to the output Observable - it
will be swallowed. If the "duration" Observable errors, the error will be
propagated to the output Observable.

Optionally, `delayWhen` takes a second argument, `subscriptionDelay`, which
is an Observable. When `subscriptionDelay` emits its first value or
completes, the source Observable is subscribed to and starts behaving like
described in the previous paragraph. If `subscriptionDelay` is not provided,
`delayWhen` will subscribe to the source Observable as soon as the output
Observable is subscribed.

Delays the emission of items from the source Observable by a given time span
determined by the emissions of another Observable.

<span class="informal">It's like [delay](delay.md), but the time span of the
delay duration is determined by a second Observable.</span>

![](/images/marble-diagrams/delayWhen.png)

`delayWhen` operator shifts each emitted value from the source Observable by
a time span determined by another Observable. When the source emits a value,
the `delayDurationSelector` function is called with the value emitted from
the source Observable as the first argument to the `delayDurationSelector`.
The `delayDurationSelector` function should return an [ObservableInput](../type-aliases/ObservableInput.md),
that is internally converted to an Observable that is called the "duration"
Observable.

The source value is emitted on the output Observable only when the "duration"
Observable emits ([next](https://rxjs.dev/guide/glossary-and-semantics#next)s) any value.
Upon that, the "duration" Observable gets unsubscribed.

Before RxJS V7, the [completion](https://rxjs.dev/guide/glossary-and-semantics#complete)
of the "duration" Observable would have been triggering the emission of the
source value to the output Observable, but with RxJS V7, this is not the case
anymore.

Only next notifications (from the "duration" Observable) trigger values from
the source Observable to be passed to the output Observable. If the "duration"
Observable only emits the complete notification (without next), the value
emitted by the source Observable will never get to the output Observable - it
will be swallowed. If the "duration" Observable errors, the error will be
propagated to the output Observable.

Optionally, `delayWhen` takes a second argument, `subscriptionDelay`, which
is an Observable. When `subscriptionDelay` emits its first value or
completes, the source Observable is subscribed to and starts behaving like
described in the previous paragraph. If `subscriptionDelay` is not provided,
`delayWhen` will subscribe to the source Observable as soon as the output
Observable is subscribed.

## Example

Delay each click by a random amount of time, between 0 and 5 seconds

```ts
import { fromEvent, delayWhen, interval } from 'rxjs';

const clicks = fromEvent(document, 'click');
const delayedClicks = clicks.pipe(delayWhen(() => interval(Math.random() * 5000)));
delayedClicks.subscribe((x) => console.log(x));
```

## See

- [delay](delay.md)
- [throttle](throttle.md)
- [throttleTime](throttleTime.md)
- [debounce](debounce.md)
- [debounceTime](debounceTime.md)
- [sample](sample.md)
- [sampleTime](sampleTime.md)
- [audit](audit.md)
- [auditTime](auditTime.md)

## Param

A function that returns an `ObservableInput` for
each `value` emitted by the source Observable, which is then used to delay the
emission of that `value` on the output Observable until the `ObservableInput`
returned from this function emits a next value. When called, beside `value`,
this function receives a zero-based `index` of the emission order.

## Param

An Observable that triggers the subscription to the
source Observable once it emits any value.

## Call Signature

```ts
function delayWhen<>(
  delayDurationSelector: (value: T, index: number) => ObservableInput<any>,
  subscriptionDelay: Observable<any>
): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/delayWhen.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/delayWhen.ts#L11)

### Parameters

| Parameter               | Type                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `delayDurationSelector` | (`value`: `T`, `index`: `number`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> |
| `subscriptionDelay`     | [`Observable`](../classes/Observable.md)\<`any`\>                                                     |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

### Deprecated

The `subscriptionDelay` parameter will be removed in v8.

## Call Signature

```ts
function delayWhen<>(delayDurationSelector: (value: T, index: number) => ObservableInput<any>): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/delayWhen.ts:15](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/delayWhen.ts#L15)

### Parameters

| Parameter               | Type                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `delayDurationSelector` | (`value`: `T`, `index`: `number`) => [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

### Deprecated

The `subscriptionDelay` parameter will be removed in v8.
