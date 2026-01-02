[API](../../index.md) / [rxjs](../index.md) / takeUntil

# Function: takeUntil()

```ts
function takeUntil<>(notifier: ObservableInput<any>): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/takeUntil.ts:43](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/takeUntil.ts#L43)

Emits the values emitted by the source Observable until a `notifier`
Observable emits a value.

<span class="informal">Lets values pass until a second Observable,
`notifier`, emits a value. Then, it completes.</span>

![](/images/marble-diagrams/takeUntil.png)

`takeUntil` subscribes and begins mirroring the source Observable. It also
monitors a second Observable, `notifier` that you provide. If the `notifier`
emits a value, the output Observable stops mirroring the source Observable
and completes. If the `notifier` doesn't emit any value and completes
then `takeUntil` will pass all values.

## Parameters

| Parameter  | Type                                                             | Description                                                                                                                                         |
| ---------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `notifier` | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`any`\> | The `ObservableInput` whose first emitted value will cause the output Observable of `takeUntil` to stop emitting values from the source Observable. |

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that emits the values from the
source Observable until `notifier` emits its first value.

## Example

Tick every second until the first click happens

```ts
import { interval, fromEvent, takeUntil } from 'rxjs';

const source = interval(1000);
const clicks = fromEvent(document, 'click');
const result = source.pipe(takeUntil(clicks));
result.subscribe((x) => console.log(x));
```

## See

- [take](take.md)
- [takeLast](takeLast.md)
- [takeWhile](takeWhile.md)
- [skip](skip.md)
