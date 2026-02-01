[API](../../index.md) / [index](../index.md) / pipe

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

Defined in: [internal/util/pipe.ts:4](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L4)

### Returns

```ts
<T>(x: T): T;
```

This function takes one parameter and just returns it. Simply put,
this is like `<T>(x: T): T => x`.

## Examples

This is useful in some cases when using things like `mergeMap`

```ts
import { interval, take, map, range, mergeMap, identity } from 'rxjs';

const source$ = interval(1000).pipe(take(5));

const result$ = source$.pipe(
  map(i => range(i)),
  mergeMap(identity) // same as mergeMap(x => x)
);

result$.subscribe({
  next: console.log
});
```

Or when you want to selectively apply an operator

```ts
import { interval, take, identity } from 'rxjs';

const shouldLimit = () => Math.random() < 0.5;

const source$ = interval(1000);

const result$ = source$.pipe(shouldLimit() ? take(5) : identity);

result$.subscribe({
  next: console.log
});
```

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `x` | `T` | Any value that is returned by this function |

#### Returns

`T`

The value passed as the first parameter to this function

## Call Signature

```ts
function pipe<>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
```

Defined in: [internal/util/pipe.ts:5](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L5)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\>

## Call Signature

```ts
function pipe<>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>;
```

Defined in: [internal/util/pipe.ts:6](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L6)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `B`\>

## Call Signature

```ts
function pipe<>(
   fn1: UnaryFunction<T, A>, 
   fn2: UnaryFunction<A, B>, 
fn3: UnaryFunction<B, C>): UnaryFunction<T, C>;
```

Defined in: [internal/util/pipe.ts:7](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L7)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `C`\>

## Call Signature

```ts
function pipe<>(
   fn1: UnaryFunction<T, A>, 
   fn2: UnaryFunction<A, B>, 
   fn3: UnaryFunction<B, C>, 
fn4: UnaryFunction<C, D>): UnaryFunction<T, D>;
```

Defined in: [internal/util/pipe.ts:8](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L8)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `D`\>

## Call Signature

```ts
function pipe<>(
   fn1: UnaryFunction<T, A>, 
   fn2: UnaryFunction<A, B>, 
   fn3: UnaryFunction<B, C>, 
   fn4: UnaryFunction<C, D>, 
fn5: UnaryFunction<D, E>): UnaryFunction<T, E>;
```

Defined in: [internal/util/pipe.ts:14](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L14)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |

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
fn6: UnaryFunction<E, F>): UnaryFunction<T, F>;
```

Defined in: [internal/util/pipe.ts:21](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L21)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |

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
fn7: UnaryFunction<F, G>): UnaryFunction<T, G>;
```

Defined in: [internal/util/pipe.ts:29](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L29)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |
| `fn7` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\> |

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
fn8: UnaryFunction<G, H>): UnaryFunction<T, H>;
```

Defined in: [internal/util/pipe.ts:38](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L38)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |
| `fn7` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\> |
| `fn8` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\> |

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
fn9: UnaryFunction<H, I>): UnaryFunction<T, I>;
```

Defined in: [internal/util/pipe.ts:48](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L48)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |
| `fn7` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\> |
| `fn8` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\> |
| `fn9` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`H`, `I`\> |

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
   fn9: UnaryFunction<H, I>, ...
fns: UnaryFunction<any, any>[]): UnaryFunction<T, unknown>;
```

Defined in: [internal/util/pipe.ts:59](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/util/pipe.ts#L59)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn1` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `A`\> |
| `fn2` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`A`, `B`\> |
| `fn3` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\> |
| `fn4` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\> |
| `fn5` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\> |
| `fn6` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\> |
| `fn7` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\> |
| `fn8` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\> |
| `fn9` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`H`, `I`\> |
| ...`fns` | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`any`, `any`\>[] |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<`T`, `unknown`\>
