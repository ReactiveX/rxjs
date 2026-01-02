[API](../../index.md) / [rxjs](../index.md) / endWith

# Function: endWith()

```ts
function endWith<>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;
```

Defined in: [rxjs/src/internal/operators/endWith.ts:52](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/endWith.ts#L52)

Returns an observable that will emit all values from the source, then synchronously emit
the provided value(s) immediately after the source completes.

This is useful for knowing when an observable ends. Particularly when paired with an
operator like [takeUntil](takeUntil.md)

![](/images/marble-diagrams/endWith.png)

## Parameters

| Parameter   | Type | Description                                          |
| ----------- | ---- | ---------------------------------------------------- |
| ...`values` | `A`  | Items you want the modified Observable to emit last. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| [`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>

A function that returns an Observable that emits all values from the
source, then synchronously emits the provided value(s) immediately after the
source completes.

## Example

Emit values to know when an interval starts and stops. The interval will
stop when a user clicks anywhere on the document.

```ts
import { interval, map, fromEvent, startWith, takeUntil, endWith } from 'rxjs';

const ticker$ = interval(5000).pipe(map(() => 'tick'));

const documentClicks$ = fromEvent(document, 'click');

ticker$
  .pipe(startWith('interval started'), takeUntil(documentClicks$), endWith('interval ended by click'))
  .subscribe((x) => console.log(x));

// Result (assuming a user clicks after 15 seconds)
// 'interval started'
// 'tick'
// 'tick'
// 'tick'
// 'interval ended by click'
```

## See

- [startWith](startWith.md)
- [concat](concat.md)
- [takeUntil](takeUntil.md)
