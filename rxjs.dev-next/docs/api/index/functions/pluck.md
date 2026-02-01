[API](../../index.md) / [index](../index.md) / pluck

# ~~Function: pluck()~~

> Maps each source value to its specified nested property.

## Description

<span class="informal">Like [map](map.md), but meant only for picking one of
the nested properties of every emitted value.</span>

![](pluck.png)

Given a list of strings or numbers describing a path to a property, retrieves
the value of a specified nested property from all values in the source
Observable. If a property can't be resolved, it will return `undefined` for
that value.

## Example

Map every click to the tagName of the clicked target element

```ts
import { fromEvent, pluck } from 'rxjs';

const clicks = fromEvent(document, 'click');
const tagNames = clicks.pipe(pluck('target', 'tagName'));

tagNames.subscribe(x => console.log(x));
```

**deprecated**: Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## See

[map](map.md)


value.

## Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## Parameters

### `properties`

The nested properties to pluck from each source

## Returns

`A`

function that returns an Observable of property values from the source values.


## Call Signature

```ts
function pluck<>(k1: K1): OperatorFunction<T, T[K1]>;
```

Defined in: [internal/operators/pluck.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/pluck.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `k1` | `K1` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`\[`K1`\]\>

### Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## Call Signature

```ts
function pluck<>(k1: K1, k2: K2): OperatorFunction<T, T[K1][K2]>;
```

Defined in: [internal/operators/pluck.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/pluck.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `k1` | `K1` |
| `k2` | `K2` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`\[`K1`\]\[`K2`\]\>

### Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## Call Signature

```ts
function pluck<>(
   k1: K1, 
   k2: K2, 
k3: K3): OperatorFunction<T, T[K1][K2][K3]>;
```

Defined in: [internal/operators/pluck.ts:10](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/pluck.ts#L10)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `k1` | `K1` |
| `k2` | `K2` |
| `k3` | `K3` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`\[`K1`\]\[`K2`\]\[`K3`\]\>

### Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## Call Signature

```ts
function pluck<>(
   k1: K1, 
   k2: K2, 
   k3: K3, 
k4: K4): OperatorFunction<T, T[K1][K2][K3][K4]>;
```

Defined in: [internal/operators/pluck.ts:16](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/pluck.ts#L16)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `k1` | `K1` |
| `k2` | `K2` |
| `k3` | `K3` |
| `k4` | `K4` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`\[`K1`\]\[`K2`\]\[`K3`\]\[`K4`\]\>

### Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## Call Signature

```ts
function pluck<>(
   k1: K1, 
   k2: K2, 
   k3: K3, 
   k4: K4, 
k5: K5): OperatorFunction<T, T[K1][K2][K3][K4][K5]>;
```

Defined in: [internal/operators/pluck.ts:23](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/pluck.ts#L23)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `k1` | `K1` |
| `k2` | `K2` |
| `k3` | `K3` |
| `k4` | `K4` |
| `k5` | `K5` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`\[`K1`\]\[`K2`\]\[`K3`\]\[`K4`\]\[`K5`\]\>

### Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## Call Signature

```ts
function pluck<>(
   k1: K1, 
   k2: K2, 
   k3: K3, 
   k4: K4, 
   k5: K5, 
k6: K6): OperatorFunction<T, T[K1][K2][K3][K4][K5][K6]>;
```

Defined in: [internal/operators/pluck.ts:32](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/pluck.ts#L32)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `k1` | `K1` |
| `k2` | `K2` |
| `k3` | `K3` |
| `k4` | `K4` |
| `k5` | `K5` |
| `k6` | `K6` |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T`\[`K1`\]\[`K2`\]\[`K3`\]\[`K4`\]\[`K5`\]\[`K6`\]\>

### Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## Call Signature

```ts
function pluck<>(
   k1: K1, 
   k2: K2, 
   k3: K3, 
   k4: K4, 
   k5: K5, 
   k6: K6, ...
rest: string[]): OperatorFunction<T, unknown>;
```

Defined in: [internal/operators/pluck.ts:42](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/pluck.ts#L42)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `k1` | `K1` |
| `k2` | `K2` |
| `k3` | `K3` |
| `k4` | `K4` |
| `k5` | `K5` |
| `k6` | `K6` |
| ...`rest` | `string`[] |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `unknown`\>

### Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.

## Call Signature

```ts
function pluck<>(...properties: string[]): OperatorFunction<T, unknown>;
```

Defined in: [internal/operators/pluck.ts:52](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/pluck.ts#L52)

### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`properties` | `string`[] |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `unknown`\>

### Deprecated

Use [map](map.md) and optional chaining: `pluck('foo', 'bar')` is `map(x => x?.foo?.bar)`. Will be removed in v8.
