[API](../../index.md) / [rxjs](../index.md) / mapTo

# ~~Function: mapTo()~~

> Emits the given constant value on the output Observable every time the source
> Observable emits a value.

## Description

<span class="informal">Like [map](map.md), but it maps every source value to
the same output value every time.</span>

![](/images/marble-diagrams/mapTo.png)

Takes a constant `value` as argument, and emits that whenever the source
Observable emits a value. In other words, ignores the actual source value,
and simply uses the emission moment to know when to emit the given `value`.

**deprecated**: To be removed in v9. Use [map](map.md) instead: `map(() => value)`.

Emits the given constant value on the output Observable every time the source
Observable emits a value.

<span class="informal">Like [map](map.md), but it maps every source value to
the same output value every time.</span>

![](/images/marble-diagrams/mapTo.png)

Takes a constant `value` as argument, and emits that whenever the source
Observable emits a value. In other words, ignores the actual source value,
and simply uses the emission moment to know when to emit the given `value`.

## Example

Map every click to the string `'Hi'`

```ts
import { fromEvent, mapTo } from 'rxjs';

const clicks = fromEvent(document, 'click');
const greetings = clicks.pipe(mapTo('Hi'));

greetings.subscribe((x) => console.log(x));
```

## See

[map](map.md)

## Param

The value to map each source value to.

## Deprecated

To be removed in v9. Use [map](map.md) instead: `map(() => value)`.

## Call Signature

```ts
function mapTo<>(value: R): OperatorFunction<unknown, R>;
```

Defined in: [rxjs/src/internal/operators/mapTo.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/mapTo.ts#L5)

### Parameters

| Parameter | Type |
| --------- | ---- |
| `value`   | `R`  |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`unknown`, `R`\>

### Deprecated

To be removed in v9. Use [map](map.md) instead: `map(() => value)`.

## Call Signature

```ts
function mapTo<>(value: R): OperatorFunction<T, R>;
```

Defined in: [rxjs/src/internal/operators/mapTo.ts:11](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/mapTo.ts#L11)

### Parameters

| Parameter | Type |
| --------- | ---- |
| `value`   | `R`  |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `R`\>

### Deprecated

Do not specify explicit type parameters. Signatures with type parameters
that cannot be inferred will be removed in v8. `mapTo` itself will be removed in v9,
use [map](map.md) instead: `map(() => value)`.
