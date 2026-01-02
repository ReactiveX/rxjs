[API](../../index.md) / [rxjs](../index.md) / pipe

# Function: pipe()

## Description

pipe() can be called on one or more functions, each of which can take one argument ("UnaryFunction")
and uses it to return a value.
It returns a function that takes one argument, passes it to the first UnaryFunction, and then
passes the result to the next one, passes that result to the next one, and so on.

pipe() can be called on one or more functions, each of which can take one argument ("UnaryFunction")
and uses it to return a value.
It returns a function that takes one argument, passes it to the first UnaryFunction, and then
passes the result to the next one, passes that result to the next one, and so on.

## Call Signature

```ts
function pipe(): <T>(x: T) => T;
```

Defined in: [rxjs/src/internal/util/pipe.ts:3](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L3)

### Returns

```ts
<T>(x: T): T;
```

#### Type Parameters

| Type Parameter |
| -------------- |
| `T`            |

#### Parameters

| Parameter | Type |
| --------- | ---- |
| `x`       | `T`  |

#### Returns

`T`

## Call Signature

```ts
function pipe<>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:4](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L4)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\>

## Call Signature

```ts
function pipe<>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L5)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `B`\>

## Call Signature

```ts
function pipe<>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>): UnaryFunction<T, C>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L6)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `C`\>

## Call Signature

```ts
function pipe<>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>
): UnaryFunction<T, D>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L7)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `D`\>

## Call Signature

```ts
function pipe<>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>
): UnaryFunction<T, E>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:13](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L13)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `E`\>

## Call Signature

```ts
function pipe<>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>
): UnaryFunction<T, F>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:20](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L20)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `F`\>

## Call Signature

```ts
function pipe<>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>
): UnaryFunction<T, G>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:28](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L28)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |
| `fn7`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `G`\>

## Call Signature

```ts
function pipe<>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>
): UnaryFunction<T, H>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:37](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L37)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |
| `fn7`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\> |
| `fn8`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `H`\>

## Call Signature

```ts
function pipe<>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>
): UnaryFunction<T, I>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:47](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L47)

### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |
| `fn7`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\> |
| `fn8`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\> |
| `fn9`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`H`, `I`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `I`\>

## Call Signature

```ts
function pipe<>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>,
  ...fns: UnaryFunction<any, any>[]
): UnaryFunction<T, unknown>;
```

Defined in: [rxjs/src/internal/util/pipe.ts:58](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/pipe.ts#L58)

### Parameters

| Parameter | Type                                                                |
| --------- | ------------------------------------------------------------------- |
| `fn1`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\>       |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\>       |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>       |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\>       |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\>       |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\>       |
| `fn7`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\>       |
| `fn8`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\>       |
| `fn9`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`H`, `I`\>       |
| ...`fns`  | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`any`, `any`\>[] |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `unknown`\>
