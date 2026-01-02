[API](../../index.md) / [rxjs](../index.md) / filter

# ~~Function: filter()~~

> Filter items emitted by the source Observable by only emitting those that
> satisfy a specified predicate.

## Description

<span class="informal">Like
[Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
it only emits a value from the source if it passes a criterion function.</span>

![](/images/marble-diagrams/filter.png)

Similar to the well-known `Array.prototype.filter` method, this operator
takes values from the source Observable, passes them through a `predicate`
function and only emits those values that yielded `true`.

## Example

Emit only click events whose target was a DIV element

```ts
import { fromEvent, filter } from 'rxjs';

const div = document.createElement('div');
div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
document.body.appendChild(div);

const clicks = fromEvent(document, 'click');
const clicksOnDivs = clicks.pipe(filter((ev) => (<HTMLElement>ev.target).tagName === 'DIV'));
clicksOnDivs.subscribe((x) => console.log(x));
```

## See

- [distinct](distinct.md)
- [distinctUntilChanged](distinctUntilChanged.md)
- [distinctUntilKeyChanged](distinctUntilKeyChanged.md)
- [ignoreElements](ignoreElements.md)
- [partition](partition.md)
- [skip](skip.md)

evaluates each value emitted by the source Observable. If it returns `true`,
the value is emitted, if `false` the value is not passed to the output
Observable. The `index` parameter is the number `i` for the i-th source
emission that has happened since the subscription, starting from the number
`0`.

in the `predicate` function.

## Parameters

### `predicate`

A function that

### `thisArg`

An optional argument to determine the value of `this`

## Returns

`A`

function that returns an Observable that emits items from the source Observable that satisfy the specified .

## Call Signature

```ts
function filter<>(predicate: (this: A, value: T, index: number) => value is S, thisArg: A): OperatorFunction<T, S>;
```

Defined in: [rxjs/src/internal/operators/filter.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/filter.ts#L5)

### Parameters

| Parameter   | Type                                                           |
| ----------- | -------------------------------------------------------------- |
| `predicate` | (`this`: `A`, `value`: `T`, `index`: `number`) => `value is S` |
| `thisArg`   | `A`                                                            |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function filter<>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
```

Defined in: [rxjs/src/internal/operators/filter.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/filter.ts#L6)

### Parameters

| Parameter   | Type                                              |
| ----------- | ------------------------------------------------- |
| `predicate` | (`value`: `T`, `index`: `number`) => `value is S` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `S`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function filter<>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
```

Defined in: [rxjs/src/internal/operators/filter.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/filter.ts#L7)

### Parameters

| Parameter   | Type                 |
| ----------- | -------------------- |
| `predicate` | `BooleanConstructor` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`TruthyTypesOf`](../type-aliases/TruthyTypesOf.md)\<`T`\>\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function filter<>(predicate: (this: A, value: T, index: number) => boolean, thisArg: A): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/filter.ts:9](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/filter.ts#L9)

### Parameters

| Parameter   | Type                                                        |
| ----------- | ----------------------------------------------------------- |
| `predicate` | (`this`: `A`, `value`: `T`, `index`: `number`) => `boolean` |
| `thisArg`   | `A`                                                         |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.

## Call Signature

```ts
function filter<>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;
```

Defined in: [rxjs/src/internal/operators/filter.ts:10](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/filter.ts#L10)

### Parameters

| Parameter   | Type                                           |
| ----------- | ---------------------------------------------- |
| `predicate` | (`value`: `T`, `index`: `number`) => `boolean` |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

### Deprecated

Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8.
