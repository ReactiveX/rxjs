[API](../../index.md) / [rxjs](../index.md) / defaultIfEmpty

# Function: defaultIfEmpty()

```ts
function defaultIfEmpty<>(defaultValue: R): OperatorFunction<T, T | R>;
```

Defined in: [rxjs/src/internal/operators/defaultIfEmpty.ts:39](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/defaultIfEmpty.ts#L39)

Emits a given value if the source Observable completes without emitting any
`next` value, otherwise mirrors the source Observable.

<span class="informal">If the source Observable turns out to be empty, then
this operator will emit a default value.</span>

![](/images/marble-diagrams/defaultIfEmpty.png)

`defaultIfEmpty` emits the values emitted by the source Observable or a
specified default value if the source Observable is empty (completes without
having emitted any `next` value).

## Parameters

| Parameter      | Type | Description                                               |
| -------------- | ---- | --------------------------------------------------------- |
| `defaultValue` | `R`  | The default value used if the source Observable is empty. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| `R`\>

A function that returns an Observable that emits either the
specified `defaultValue` if the source Observable emits no items, or the
values emitted by the source Observable.

## Example

If no clicks happen in 5 seconds, then emit 'no clicks'

```ts
import { fromEvent, takeUntil, interval, defaultIfEmpty } from 'rxjs';

const clicks = fromEvent(document, 'click');
const clicksBeforeFive = clicks.pipe(takeUntil(interval(5000)));
const result = clicksBeforeFive.pipe(defaultIfEmpty('no clicks'));
result.subscribe((x) => console.log(x));
```

## See

- [EMPTY](../variables/EMPTY.md)
- [last](last.md)
