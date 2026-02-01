[API](../../index.md) / [index](../index.md) / of

# Function: of()

> Converts the arguments to an observable sequence.

## Description

<span class="informal">Each argument becomes a `next` notification.</span>

![](of.png)

Unlike [from](from.md), it does not do any flattening and emits each argument in whole
as a separate `next` notification.

## Examples

Emit the values `10, 20, 30`

```ts
import { of } from 'rxjs';

of(10, 20, 30)
  .subscribe({
    next: value => console.log('next:', value),
    error: err => console.log('error:', err),
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

of([1, 2, 3])
  .subscribe({
    next: value => console.log('next:', value),
    error: err => console.log('error:', err),
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

### `args`

A comma separated list of arguments you want to be emitted.


## Returns

`An`

Observable that synchronously emits the arguments described above and then immediately completes.


## Call Signature

```ts
function of(value: null): Observable<null>;
```

Defined in: [internal/observable/of.ts:11](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/of.ts#L11)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `null` |

### Returns

[`Observable`](../classes/Observable.md)\<`null`\>

## Call Signature

```ts
function of(value: undefined): Observable<undefined>;
```

Defined in: [internal/observable/of.ts:12](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/of.ts#L12)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `undefined` |

### Returns

[`Observable`](../classes/Observable.md)\<`undefined`\>

## Call Signature

```ts
function of(scheduler: SchedulerLike): Observable<never>;
```

Defined in: [internal/observable/of.ts:15](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/of.ts#L15)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `scheduler` | [`SchedulerLike`](../interfaces/SchedulerLike.md) |

### Returns

[`Observable`](../classes/Observable.md)\<`never`\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `scheduled`. Details: https://rxjs.dev/deprecations/scheduler-argument

## Call Signature

```ts
function of<>(...valuesAndScheduler: [...A[], SchedulerLike]): Observable<ValueFromArray<A>>;
```

Defined in: [internal/observable/of.ts:17](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/of.ts#L17)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`valuesAndScheduler` | \[`...A[]`, [`SchedulerLike`](../interfaces/SchedulerLike.md)\] |

### Returns

[`Observable`](../classes/Observable.md)\<[`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>

### Deprecated

The `scheduler` parameter will be removed in v8. Use `scheduled`. Details: https://rxjs.dev/deprecations/scheduler-argument

## Call Signature

```ts
function of(): Observable<never>;
```

Defined in: [internal/observable/of.ts:19](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/of.ts#L19)

### Returns

[`Observable`](../classes/Observable.md)\<`never`\>

## Call Signature

```ts
function of<>(): Observable<T>;
```

Defined in: [internal/observable/of.ts:21](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/of.ts#L21)

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

### Deprecated

Do not specify explicit type parameters. Signatures with type parameters that cannot be inferred will be removed in v8.

## Call Signature

```ts
function of<>(value: T): Observable<T>;
```

Defined in: [internal/observable/of.ts:22](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/of.ts#L22)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |

### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

## Call Signature

```ts
function of<>(...values: A): Observable<ValueFromArray<A>>;
```

Defined in: [internal/observable/of.ts:23](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/of.ts#L23)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`values` | `A` |

### Returns

[`Observable`](../classes/Observable.md)\<[`ValueFromArray`](../type-aliases/ValueFromArray.md)\<`A`\>\>
