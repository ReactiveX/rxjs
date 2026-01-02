[API](../../index.md) / [rxjs](../index.md) / pipe

# Function: pipe()

> pipe() can be called on one or more functions, each of which can take one argument ("UnaryFunction")
> and uses it to return a value.

## Description

It returns a function that takes one argument, passes it to the first UnaryFunction, and then
passes the result to the next one, passes that result to the next one, and so on.

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

pipe() can be called on one or more functions, each of which can take one argument ("UnaryFunction")
and uses it to return a value.
It returns a function that takes one argument, passes it to the first UnaryFunction, and then
passes the result to the next one, passes that result to the next one, and so on.

## Parameters

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

## Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `unknown`\>
