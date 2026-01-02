[API](../../index.md) / [rxjs](../index.md) / GroupedObservable

# Interface: GroupedObservable

## Description

An observable of values that is the emitted by the result of a [groupBy](../functions/groupBy.md) operator,
contains a `key` property for the grouping.

Defined in: [rxjs/src/internal/operators/groupBy.ts:252](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/groupBy.ts#L252)

An observable of values that is the emitted by the result of a [groupBy](../functions/groupBy.md) operator,
contains a `key` property for the grouping.

## Extends

- [`Observable`](../classes/Observable.md)\<`T`\>

## Properties

| Property               | Type | Description                                  |
| ---------------------- | ---- | -------------------------------------------- |
| <a id="key"></a> `key` | `K`  | The key value for the grouped notifications. |

## Methods

### \[asyncIterator\]()

```ts
asyncIterator: AsyncGenerator<T, void, void>;
```

Defined in: [observable/src/observable.ts:922](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L922)

Observable is async iterable, so it can be used in `for await` loop. This method
of subscription is cancellable by breaking the for await loop. Although it's not
recommended to use Observable's AsyncIterable contract outside of `for await`, if
you're consuming the Observable as an AsyncIterable, and you're _not_ using `for await`,
you can use the `throw` or `return` methods on the `AsyncGenerator` we return to
cancel the subscription. Note that the subscription to the observable does not start
until the first value is requested from the AsyncIterable.

Functionally, this is equivalent to using a [concatMap](../functions/concatMap.md) with an `async` function.
That means that while the body of the `for await` loop is executing, any values that arrive
from the observable source will be queued up, so they can be processed by the `for await`
loop in order. So, like [concatMap](../functions/concatMap.md) it's important to understand the speed your
source emits at, and the speed of the body of your `for await` loop.

#### Returns

`AsyncGenerator`\<`T`, `void`, `void`\>

#### Example

```ts
import { interval } from 'rxjs';

async function main() {
  // Subscribe to the observable using for await.
  for await (const value of interval(1000)) {
    console.log(value);

    if (value > 5) {
      // Unsubscribe from the interval if we get a value greater than 5
      break;
    }
  }
}

main();
```

#### Inherited from

[`Observable`](../classes/Observable.md).[`[asyncIterator]`](../classes/Observable.md#asynciterator)

### forEach()

```ts
forEach(next: (value: T) => void): Promise<void>;
```

Defined in: [observable/src/observable.ts:757](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L757)

Used as a NON-CANCELLABLE means of subscribing to an observable, for use with
APIs that expect promises, like `async/await`. You cannot unsubscribe from this.

**WARNING**: Only use this with observables you _know_ will complete. If the source
observable does not complete, you will end up with a promise that is hung up, and
potentially all of the state of an async function hanging out in memory. To avoid
this situation, look into adding something like [timeout](../functions/timeout.md), [take](../functions/take.md),
[takeWhile](../functions/takeWhile.md), or [takeUntil](../functions/takeUntil.md) amongst others.

#### Parameters

| Parameter | Type                     | Description                                         |
| --------- | ------------------------ | --------------------------------------------------- |
| `next`    | (`value`: `T`) => `void` | A handler for each value emitted by the observable. |

#### Returns

`Promise`\<`void`\>

A promise that either resolves on observable completion or
rejects with the handled error.

#### Example

```ts
import { interval, take } from 'rxjs';

const source$ = interval(1000).pipe(take(4));

async function getTotal() {
  let total = 0;

  await source$.forEach((value) => {
    total += value;
    console.log('observable -> ' + value);
  });

  return total;
}

getTotal().then((total) => console.log('Total: ' + total));

// Expected:
// 'observable -> 0'
// 'observable -> 1'
// 'observable -> 2'
// 'observable -> 3'
// 'Total: 6'
```

#### Inherited from

[`Observable`](../classes/Observable.md).[`forEach`](../classes/Observable.md#foreach)

### pipe()

Used to stitch together functional operators into a chain.

#### Example

```ts
import { interval, filter, map, scan } from 'rxjs';

interval(1000)
  .pipe(
    filter((x) => x % 2 === 0),
    map((x) => x + x),
    scan((acc, x) => acc + x)
  )
  .subscribe((x) => console.log(x));
```

#### Call Signature

```ts
pipe(): Observable<T>;
```

Defined in: [observable/src/observable.ts:788](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L788)

##### Returns

[`Observable`](../classes/Observable.md)\<`T`\>

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(op1: UnaryFunction<Observable<T>, A>): A;
```

Defined in: [observable/src/observable.ts:789](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L789)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |

##### Returns

`A`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(op1: UnaryFunction<Observable<T>, A>, op2: UnaryFunction<A, B>): B;
```

Defined in: [observable/src/observable.ts:790](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L790)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                             |

##### Returns

`B`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>): C;
```

Defined in: [observable/src/observable.ts:791](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L791)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                             |

##### Returns

`C`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>,
   op4: UnaryFunction<C, D>): D;
```

Defined in: [observable/src/observable.ts:792](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L792)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                             |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                             |

##### Returns

`D`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>,
   op4: UnaryFunction<C, D>,
   op5: UnaryFunction<D, E>): E;
```

Defined in: [observable/src/observable.ts:793](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L793)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                             |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                             |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                             |

##### Returns

`E`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>,
   op4: UnaryFunction<C, D>,
   op5: UnaryFunction<D, E>,
   op6: UnaryFunction<E, F>): F;
```

Defined in: [observable/src/observable.ts:800](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L800)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                             |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                             |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                             |
| `op6`     | `UnaryFunction`\<`E`, `F`\>                                             |

##### Returns

`F`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>,
   op4: UnaryFunction<C, D>,
   op5: UnaryFunction<D, E>,
   op6: UnaryFunction<E, F>,
   op7: UnaryFunction<F, G>): G;
```

Defined in: [observable/src/observable.ts:808](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L808)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                             |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                             |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                             |
| `op6`     | `UnaryFunction`\<`E`, `F`\>                                             |
| `op7`     | `UnaryFunction`\<`F`, `G`\>                                             |

##### Returns

`G`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>,
   op4: UnaryFunction<C, D>,
   op5: UnaryFunction<D, E>,
   op6: UnaryFunction<E, F>,
   op7: UnaryFunction<F, G>,
   op8: UnaryFunction<G, H>): H;
```

Defined in: [observable/src/observable.ts:817](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L817)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                             |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                             |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                             |
| `op6`     | `UnaryFunction`\<`E`, `F`\>                                             |
| `op7`     | `UnaryFunction`\<`F`, `G`\>                                             |
| `op8`     | `UnaryFunction`\<`G`, `H`\>                                             |

##### Returns

`H`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>,
   op4: UnaryFunction<C, D>,
   op5: UnaryFunction<D, E>,
   op6: UnaryFunction<E, F>,
   op7: UnaryFunction<F, G>,
   op8: UnaryFunction<G, H>,
   op9: UnaryFunction<H, I>): I;
```

Defined in: [observable/src/observable.ts:827](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L827)

##### Parameters

| Parameter | Type                                                                    |
| --------- | ----------------------------------------------------------------------- |
| `op1`     | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                             |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                             |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                             |
| `op6`     | `UnaryFunction`\<`E`, `F`\>                                             |
| `op7`     | `UnaryFunction`\<`F`, `G`\>                                             |
| `op8`     | `UnaryFunction`\<`G`, `H`\>                                             |
| `op9`     | `UnaryFunction`\<`H`, `I`\>                                             |

##### Returns

`I`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>,
   op4: UnaryFunction<C, D>,
   op5: UnaryFunction<D, E>,
   op6: UnaryFunction<E, F>,
   op7: UnaryFunction<F, G>,
   op8: UnaryFunction<G, H>,
   op9: UnaryFunction<H, I>, ...
operations: OperatorFunction<any, any>[]): Observable<unknown>;
```

Defined in: [observable/src/observable.ts:838](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L838)

##### Parameters

| Parameter       | Type                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| `op1`           | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`           | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`           | `UnaryFunction`\<`B`, `C`\>                                             |
| `op4`           | `UnaryFunction`\<`C`, `D`\>                                             |
| `op5`           | `UnaryFunction`\<`D`, `E`\>                                             |
| `op6`           | `UnaryFunction`\<`E`, `F`\>                                             |
| `op7`           | `UnaryFunction`\<`F`, `G`\>                                             |
| `op8`           | `UnaryFunction`\<`G`, `H`\>                                             |
| `op9`           | `UnaryFunction`\<`H`, `I`\>                                             |
| ...`operations` | `OperatorFunction`\<`any`, `any`\>[]                                    |

##### Returns

[`Observable`](../classes/Observable.md)\<`unknown`\>

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>,
   op4: UnaryFunction<C, D>,
   op5: UnaryFunction<D, E>,
   op6: UnaryFunction<E, F>,
   op7: UnaryFunction<F, G>,
   op8: UnaryFunction<G, H>,
   op9: UnaryFunction<H, I>, ...
   operations: UnaryFunction<any, any>[]): unknown;
```

Defined in: [observable/src/observable.ts:850](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L850)

##### Parameters

| Parameter       | Type                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| `op1`           | `UnaryFunction`\<[`Observable`](../classes/Observable.md)\<`T`\>, `A`\> |
| `op2`           | `UnaryFunction`\<`A`, `B`\>                                             |
| `op3`           | `UnaryFunction`\<`B`, `C`\>                                             |
| `op4`           | `UnaryFunction`\<`C`, `D`\>                                             |
| `op5`           | `UnaryFunction`\<`D`, `E`\>                                             |
| `op6`           | `UnaryFunction`\<`E`, `F`\>                                             |
| `op7`           | `UnaryFunction`\<`F`, `G`\>                                             |
| `op8`           | `UnaryFunction`\<`G`, `H`\>                                             |
| `op9`           | `UnaryFunction`\<`H`, `I`\>                                             |
| ...`operations` | `UnaryFunction`\<`any`, `any`\>[]                                       |

##### Returns

`unknown`

##### Inherited from

[`Observable`](../classes/Observable.md).[`pipe`](../classes/Observable.md#pipe)

### subscribe()

```ts
subscribe(observerOrNext?: Partial<Observer<T>> | (value: T) => void | null): Subscription;
```

Defined in: [observable/src/observable.ts:695](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L695)

Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.

<span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>

`subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
might be for example a function that you passed to Observable's constructor, but most of the time it is
a library implementation, which defines what will be emitted by an Observable, and when it be will emitted. This means
that calling `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
the thought.

Apart from starting the execution of an Observable, this method allows you to listen for values
that an Observable emits, as well as for when it completes or errors. You can achieve this in two
of the following ways.

The first way is creating an object that implements [Observer](Observer.md) interface. It should have methods
defined by that interface, but note that it should be just a regular JavaScript object, which you can create
yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
that your object does not have to implement all methods. If you find yourself creating a method that doesn't
do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
use the [onUnhandledError](GlobalConfig.md#onunhandlederror) configuration option or use a runtime handler (like `window.onerror` or
`process.on('error)`) to be notified of unhandled errors. Because of this, it's recommended that you provide
an `error` method to avoid missing thrown errors.

The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
This means you can provide three functions as arguments to `subscribe`, where the first function is equivalent
of a `next` method, the second of an `error` method and the third of a `complete` method. Just as in case of an Observer,
if you do not need to listen for something, you can omit a function by passing `undefined` or `null`,
since `subscribe` recognizes these functions by where they were placed in function call. When it comes
to the `error` function, as with an Observer, if not provided, errors emitted by an Observable will be thrown asynchronously.

You can, however, subscribe with no parameters at all. This may be the case where you're not interested in terminal events
and you also handled emissions internally by using operators (e.g. using `tap`).

Whichever style of calling `subscribe` you use, in both cases it returns a Subscription object.
This object allows you to call `unsubscribe` on it, which in turn will stop the work that an Observable does and will clean
up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.

Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
It is an Observable itself that decides when these functions will be called. For example [of](../functions/of.md)
by default emits all its values synchronously. Always check documentation for how given Observable
will behave when subscribed and if its default behavior can be modified with a `scheduler`.

#### Parameters

| Parameter         | Type                                                                 | Description                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observerOrNext?` | `Partial`\<`Observer`\<`T`\>\> \| (`value`: `T`) => `void` \| `null` | Either an [Observer](Observer.md) with some or all callback methods, or the `next` handler that is called for each value emitted from the subscribed Observable. |

#### Returns

[`Subscription`](../classes/Subscription.md)

A subscription reference to the registered handlers.

#### Inherited from

[`Observable`](../classes/Observable.md).[`subscribe`](../classes/Observable.md#subscribe)
