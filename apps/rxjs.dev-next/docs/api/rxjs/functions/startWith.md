[API](../../index.md) / [rxjs](../index.md) / startWith

# Function: startWith()

> Returns an observable that, at the moment of subscription, will synchronously emit all
> values provided to this operator, then subscribe to the source and mirror all of its emissions
> to subscribers.

## Description

This is a useful way to know when subscription has occurred on an existing observable.

<span class="informal">First emits its arguments in order, and then any
emissions from the source.</span>

![](/images/marble-diagrams/startWith.png)

```ts
function startWith<>(...values: A): OperatorFunction<T, T | ValueFromArray<A>>;
```

Defined in: [rxjs/src/internal/operators/startWith.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/startWith.ts#L6)

Returns an observable that, at the moment of subscription, will synchronously emit all
values provided to this operator, then subscribe to the source and mirror all of its emissions
to subscribers.

This is a useful way to know when subscription has occurred on an existing observable.

<span class="informal">First emits its arguments in order, and then any
emissions from the source.</span>

![](/images/marble-diagrams/startWith.png)

## Parameters

| Parameter   | Type |
| ----------- | ---- |
| ...`values` | `A`  |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| [`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>

## Example

Emit a value when a timer starts.

```ts
import { timer, map, startWith } from 'rxjs';

timer(1000)
  .pipe(
    map(() => 'timer emit'),
    startWith('timer start')
  )
  .subscribe((x) => console.log(x));

// results:
// 'timer start'
// 'timer emit'
```

## Param

Items you want the modified Observable to emit first.

## See

- [endWith](endWith.md)
- [finalize](finalize.md)
- [concat](concat.md)
