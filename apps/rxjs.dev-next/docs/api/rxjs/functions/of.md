[API](../../index.md) / [rxjs](../index.md) / of

# Function: of()

> Converts the arguments to an observable sequence.

## Description

<span class="informal">Each argument becomes a `next` notification.</span>

![](/images/marble-diagrams/of.png)

Unlike [from](from.md), it does not do any flattening and emits each argument in whole
as a separate `next` notification.

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

## Parameters

### `values`

A comma separated list of arguments you want to be emitted.

## Returns

`An`

Observable that synchronously emits the arguments described above and then immediately completes.

## Call Signature

```ts
function of(value: null): Observable<null>;
```

Defined in: [rxjs/src/internal/observable/of.ts:10](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/of.ts#L10)

### Parameters

| Parameter | Type   |
| --------- | ------ |
| `value`   | `null` |

### Returns

[`Observable`](../classes/Observable.md)\<`null`\>

## Call Signature

```ts
function of(value: undefined): Observable<undefined>;
```

Defined in: [rxjs/src/internal/observable/of.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/of.ts#L11)

### Parameters

| Parameter | Type        |
| --------- | ----------- |
| `value`   | `undefined` |

### Returns

[`Observable`](../classes/Observable.md)\<`undefined`\>

## Call Signature

```ts
function of(): Observable<never>;
```

Defined in: [rxjs/src/internal/observable/of.ts:13](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/of.ts#L13)

### Returns

[`Observable`](../classes/Observable.md)\<`never`\>

## Call Signature

```ts
function of<>(value: T): Observable<T>;
```

Defined in: [rxjs/src/internal/observable/of.ts:14](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/of.ts#L14)

### Parameters

| Parameter | Type |
| --------- | ---- |
| `value`   | `T`  |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

## Call Signature

```ts
function of<>(...values: A): Observable<ValueFromArray<A>>;
```

Defined in: [rxjs/src/internal/observable/of.ts:15](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/observable/of.ts#L15)

### Parameters

| Parameter   | Type |
| ----------- | ---- |
| ...`values` | `A`  |

### Returns

[`Observable`](../classes/Observable.md)\<[`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>
