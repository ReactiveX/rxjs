[API](../../index.md) / [rxjs](../index.md) / of

# Function: of()

> Converts the arguments to an observable sequence.

## Description

<span class="informal">Each argument becomes a `next` notification.</span>

![](/images/marble-diagrams/of.png)

Unlike [from](from.md), it does not do any flattening and emits each argument in whole
as a separate `next` notification.

```ts
function of<>(...values: A): Observable<ValueFromArray<A>>;
```

Defined in: [rxjs/src/internal/observable/of.ts:15](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/of.ts#L15)

Converts the arguments to an observable sequence.

<span class="informal">Each argument becomes a `next` notification.</span>

![](/images/marble-diagrams/of.png)

Unlike [from](from.md), it does not do any flattening and emits each argument in whole
as a separate `next` notification.

## Parameters

| Parameter   | Type |
| ----------- | ---- |
| ...`values` | `A`  |

## Returns

[`Observable`](../classes/Observable.md)\<[`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>

## Example

Emit the values `10, 20, 30`

```ts
import { of } from 'rxjs';

of(10, 20, 30).subscribe({
  next: (value) => console.log('next:', value),
  error: (err) => console.log('error:', err),
  complete: () => console.log('the end'),
});

// Outputs
// next: 10
// next: 20
// next: 30
// the end
```

Emit the array `[1, 2, 3]`

```ts
import { of } from 'rxjs';

of([1, 2, 3]).subscribe({
  next: (value) => console.log('next:', value),
  error: (err) => console.log('error:', err),
  complete: () => console.log('the end'),
});

// Outputs
// next: [1, 2, 3]
// the end
```

## See

- [from](from.md)
- [range](range.md)

## Param

A comma separated list of arguments you want to be emitted.
