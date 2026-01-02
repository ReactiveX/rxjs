[API](../../index.md) / [rxjs](../index.md) / rx

# Function: rx()

> Converts the first argument to an observable, then passes that observable to the function in the second argument.
> The result of _that_ function is then passed to the function in the third argument, and so on. This continues until
> all functions have been called, and the result of the last function is returned.

## Description

This means it can be used for anything involving unary functions, just so long as the first unary function accepts an observable as its argument,
and as long as the first argument to `rx()` is a valid [ObservableInput](../type-aliases/ObservableInput.md).

This is the same as an ordinary functional [pipe](pipe.md), except it has an implicit `from` as the second argument.

The following are equivalent:

```ts
// Where `source` is any valid `ObservableInput`.
// A (observable, promise, array, async iterable, etc.)
rx(
  source,
  map((x) => x + 1),
  filter((x) => x % 2 === 0)
);
pipe(
  map((x) => x + 1),
  filter((x) => x % 2 === 0)
)(from(source));
pipe(
  from,
  map((x) => x + 1),
  filter((x) => x % 2 === 0)
)(source);
```

Furthermore, `rx` can be used to create an observable and pipe it in any number of ways. For example:

```ts
const subscription = rx(
  of(1, 2, 3),
  source => source.subscribe(x => console.log(x)),
);

// or even something like this:
const promise = rx(
  of(1, 2, 3),
  async (source) => {
    const result = [];
    await source.forEach(x => result.push(x));
    return result;
  },
});
```

@param source Any valid observable source.
@param fns Any number of unary functions, starting with a unary function that accepts an observable as its only argument.
@returns The result of the last function, or an observable if no functions are provided for the second argument and beyond.

## Call Signature

```ts
function rx<>(source: ObservableInput<A>): Observable<A>;
```

Defined in: [rxjs/src/internal/util/rx.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L5)

### Parameters

| Parameter | Type                                                           |
| --------- | -------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\> |

### Returns

[`Observable`](../classes/Observable.md)\<`A`\>

## Call Signature

```ts
function rx<>(source: ObservableInput<A>, fn2: UnaryFunction<Observable<A>, B>): B;
```

Defined in: [rxjs/src/internal/util/rx.ts:6](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L6)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |

### Returns

`B`

## Call Signature

```ts
function rx<>(source: ObservableInput<A>, fn2: UnaryFunction<Observable<A>, B>, fn3: UnaryFunction<B, C>): C;
```

Defined in: [rxjs/src/internal/util/rx.ts:7](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L7)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>                                             |

### Returns

`C`

## Call Signature

```ts
function rx<>(source: ObservableInput<A>, fn2: UnaryFunction<Observable<A>, B>, fn3: UnaryFunction<B, C>, fn4: UnaryFunction<C, D>): D;
```

Defined in: [rxjs/src/internal/util/rx.ts:8](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L8)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>                                             |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\>                                             |

### Returns

`D`

## Call Signature

```ts
function rx<>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>
): E;
```

Defined in: [rxjs/src/internal/util/rx.ts:14](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L14)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>                                             |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\>                                             |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\>                                             |

### Returns

`E`

## Call Signature

```ts
function rx<>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>
): F;
```

Defined in: [rxjs/src/internal/util/rx.ts:21](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L21)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>                                             |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\>                                             |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\>                                             |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\>                                             |

### Returns

`F`

## Call Signature

```ts
function rx<>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>
): G;
```

Defined in: [rxjs/src/internal/util/rx.ts:29](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L29)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>                                             |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\>                                             |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\>                                             |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\>                                             |
| `fn7`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\>                                             |

### Returns

`G`

## Call Signature

```ts
function rx<>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>
): H;
```

Defined in: [rxjs/src/internal/util/rx.ts:38](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L38)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>                                             |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\>                                             |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\>                                             |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\>                                             |
| `fn7`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\>                                             |
| `fn8`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\>                                             |

### Returns

`H`

## Call Signature

```ts
function rx<>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>
): I;
```

Defined in: [rxjs/src/internal/util/rx.ts:48](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L48)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>                                             |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\>                                             |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\>                                             |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\>                                             |
| `fn7`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\>                                             |
| `fn8`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\>                                             |
| `fn9`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`H`, `I`\>                                             |

### Returns

`I`

## Call Signature

```ts
function rx<>(
  source: ObservableInput<A>,
  fn2: UnaryFunction<Observable<A>, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>,
  ...fns: UnaryFunction<unknown, unknown>[]
): unknown;
```

Defined in: [rxjs/src/internal/util/rx.ts:59](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/util/rx.ts#L59)

### Parameters

| Parameter | Type                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `source`  | [`ObservableInput`](../type-aliases/ObservableInput.md)\<`A`\>                                            |
| `fn2`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`A`\>, `B`\> |
| `fn3`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`B`, `C`\>                                             |
| `fn4`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`C`, `D`\>                                             |
| `fn5`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`D`, `E`\>                                             |
| `fn6`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`E`, `F`\>                                             |
| `fn7`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`F`, `G`\>                                             |
| `fn8`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`G`, `H`\>                                             |
| `fn9`     | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`H`, `I`\>                                             |
| ...`fns`  | [`UnaryFunction`](../interfaces/UnaryFunction.md)\<`unknown`, `unknown`\>[]                               |

### Returns

`unknown`
