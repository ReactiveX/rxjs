[API](../../index.md) / [rxjs](../index.md) / ReplaySubject

# Class: ReplaySubject

> A variant of [Subject](Subject.md) that "replays" old values to new subscribers by emitting them when they first subscribe.

## Description

`ReplaySubject` has an internal buffer that will store a specified number of values that it has observed. Like `Subject`,
`ReplaySubject` "observes" values by having them passed to its `next` method. When it observes a value, it will store that
value for a time determined by the configuration of the `ReplaySubject`, as passed to its constructor.

When a new subscriber subscribes to the `ReplaySubject` instance, it will synchronously emit all values in its buffer in
a First-In-First-Out (FIFO) manner. The `ReplaySubject` will also complete, if it has observed completion; and it will
error if it has observed an error.

There are two main configuration items to be concerned with:

1. `bufferSize` - This will determine how many items are stored in the buffer, defaults to infinite.
2. `windowTime` - The amount of time to hold a value in the buffer before removing it from the buffer.

Both configurations may exist simultaneously. So if you would like to buffer a maximum of 3 values, as long as the values
are less than 2 seconds old, you could do so with a `new ReplaySubject(3, 2000)`.

### Differences with BehaviorSubject

`BehaviorSubject` is similar to `new ReplaySubject(1)`, with a couple of exceptions:

1. `BehaviorSubject` comes "primed" with a single value upon construction.
2. `ReplaySubject` will replay values, even after observing an error, where `BehaviorSubject` will not.

Defined in: [rxjs/src/internal/ReplaySubject.ts:36](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ReplaySubject.ts#L36)

## See

- [Subject](Subject.md)
- [BehaviorSubject](BehaviorSubject.md)
- [shareReplay](../functions/shareReplay.md)

## Extends

- [`Subject`](Subject.md)\<`T`\>

## Constructors

### Constructor

```ts
new ReplaySubject<>(
   _bufferSize: number,
   _windowTime: number,
_timestampProvider: TimestampProvider): ReplaySubject<T>;
```

Defined in: [rxjs/src/internal/ReplaySubject.ts:46](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ReplaySubject.ts#L46)

#### Parameters

| Parameter            | Type                                                      | Default value           | Description                                                                                                                                    |
| -------------------- | --------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `_bufferSize`        | `number`                                                  | `Infinity`              | The size of the buffer to replay on subscription                                                                                               |
| `_windowTime`        | `number`                                                  | `Infinity`              | The amount of time the buffered items will stay buffered                                                                                       |
| `_timestampProvider` | [`TimestampProvider`](../interfaces/TimestampProvider.md) | `dateTimestampProvider` | An object with a `now()` method that provides the current timestamp. This is used to calculate the amount of time something has been buffered. |

#### Returns

`ReplaySubject`\<`T`\>

#### Overrides

[`Subject`](Subject.md).[`constructor`](Subject.md#constructor)

## Properties

| Property                                   | Type      | Default value | Description                                                                                      | Inherited from                                                  |
| ------------------------------------------ | --------- | ------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| <a id="haserror"></a> ~~`hasError`~~       | `boolean` | `false`       | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | [`Subject`](Subject.md).[`hasError`](Subject.md#haserror)       |
| <a id="thrownerror"></a> ~~`thrownError`~~ | `any`     | `null`        | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | [`Subject`](Subject.md).[`thrownError`](Subject.md#thrownerror) |

## Accessors

### closed

#### Get Signature

```ts
get closed(): boolean;
```

Defined in: [rxjs/src/internal/Subject.ts:19](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Subject.ts#L19)

Will return true if this subject has been closed and is no longer accepting new values.

##### Returns

`boolean`

#### Inherited from

[`Subject`](Subject.md).[`closed`](Subject.md#closed)

### observed

#### Get Signature

```ts
get observed(): boolean;
```

Defined in: [rxjs/src/internal/Subject.ts:94](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Subject.ts#L94)

##### Returns

`boolean`

#### Inherited from

[`Subject`](Subject.md).[`observed`](Subject.md#observed)

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

[`Subject`](Subject.md).[`[asyncIterator]`](Subject.md#asynciterator)

### asObservable()

```ts
asObservable(): Observable<T>;
```

Defined in: [rxjs/src/internal/Subject.ts:137](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Subject.ts#L137)

Creates a new Observable with this Subject as the source. You can do this
to create custom Observer-side logic of the Subject and conceal it from
code that uses the Observable.

#### Returns

[`Observable`](Observable.md)\<`T`\>

Observable that this Subject casts to.

#### Inherited from

[`Subject`](Subject.md).[`asObservable`](Subject.md#asobservable)

### complete()

```ts
complete(): void;
```

Defined in: [rxjs/src/internal/Subject.ts:77](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Subject.ts#L77)

#### Returns

`void`

#### Inherited from

[`Subject`](Subject.md).[`complete`](Subject.md#complete)

### error()

```ts
error(err: any): void;
```

Defined in: [rxjs/src/internal/Subject.ts:64](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Subject.ts#L64)

#### Parameters

| Parameter | Type  |
| --------- | ----- |
| `err`     | `any` |

#### Returns

`void`

#### Inherited from

[`Subject`](Subject.md).[`error`](Subject.md#error)

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

[`Subject`](Subject.md).[`forEach`](Subject.md#foreach)

### next()

```ts
next(value: T): void;
```

Defined in: [rxjs/src/internal/ReplaySubject.ts:57](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/ReplaySubject.ts#L57)

#### Parameters

| Parameter | Type |
| --------- | ---- |
| `value`   | `T`  |

#### Returns

`void`

#### Overrides

[`Subject`](Subject.md).[`next`](Subject.md#next)

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

[`Observable`](Observable.md)\<`T`\>

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

#### Call Signature

```ts
pipe<>(op1: UnaryFunction<Observable<T>, A>): A;
```

Defined in: [observable/src/observable.ts:789](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L789)

##### Parameters

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |

##### Returns

`A`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

#### Call Signature

```ts
pipe<>(op1: UnaryFunction<Observable<T>, A>, op2: UnaryFunction<A, B>): B;
```

Defined in: [observable/src/observable.ts:790](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L790)

##### Parameters

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                  |

##### Returns

`B`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

#### Call Signature

```ts
pipe<>(
   op1: UnaryFunction<Observable<T>, A>,
   op2: UnaryFunction<A, B>,
   op3: UnaryFunction<B, C>): C;
```

Defined in: [observable/src/observable.ts:791](https://github.com/ReactiveX/rxjs/blob/master/packages/observable/src/observable.ts#L791)

##### Parameters

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                  |

##### Returns

`C`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                  |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                  |

##### Returns

`D`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                  |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                  |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                  |

##### Returns

`E`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                  |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                  |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                  |
| `op6`     | `UnaryFunction`\<`E`, `F`\>                                  |

##### Returns

`F`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                  |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                  |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                  |
| `op6`     | `UnaryFunction`\<`E`, `F`\>                                  |
| `op7`     | `UnaryFunction`\<`F`, `G`\>                                  |

##### Returns

`G`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                  |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                  |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                  |
| `op6`     | `UnaryFunction`\<`E`, `F`\>                                  |
| `op7`     | `UnaryFunction`\<`F`, `G`\>                                  |
| `op8`     | `UnaryFunction`\<`G`, `H`\>                                  |

##### Returns

`H`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

| Parameter | Type                                                         |
| --------- | ------------------------------------------------------------ |
| `op1`     | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`     | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`     | `UnaryFunction`\<`B`, `C`\>                                  |
| `op4`     | `UnaryFunction`\<`C`, `D`\>                                  |
| `op5`     | `UnaryFunction`\<`D`, `E`\>                                  |
| `op6`     | `UnaryFunction`\<`E`, `F`\>                                  |
| `op7`     | `UnaryFunction`\<`F`, `G`\>                                  |
| `op8`     | `UnaryFunction`\<`G`, `H`\>                                  |
| `op9`     | `UnaryFunction`\<`H`, `I`\>                                  |

##### Returns

`I`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

| Parameter       | Type                                                         |
| --------------- | ------------------------------------------------------------ |
| `op1`           | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`           | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`           | `UnaryFunction`\<`B`, `C`\>                                  |
| `op4`           | `UnaryFunction`\<`C`, `D`\>                                  |
| `op5`           | `UnaryFunction`\<`D`, `E`\>                                  |
| `op6`           | `UnaryFunction`\<`E`, `F`\>                                  |
| `op7`           | `UnaryFunction`\<`F`, `G`\>                                  |
| `op8`           | `UnaryFunction`\<`G`, `H`\>                                  |
| `op9`           | `UnaryFunction`\<`H`, `I`\>                                  |
| ...`operations` | `OperatorFunction`\<`any`, `any`\>[]                         |

##### Returns

[`Observable`](Observable.md)\<`unknown`\>

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

| Parameter       | Type                                                         |
| --------------- | ------------------------------------------------------------ |
| `op1`           | `UnaryFunction`\<[`Observable`](Observable.md)\<`T`\>, `A`\> |
| `op2`           | `UnaryFunction`\<`A`, `B`\>                                  |
| `op3`           | `UnaryFunction`\<`B`, `C`\>                                  |
| `op4`           | `UnaryFunction`\<`C`, `D`\>                                  |
| `op5`           | `UnaryFunction`\<`D`, `E`\>                                  |
| `op6`           | `UnaryFunction`\<`E`, `F`\>                                  |
| `op7`           | `UnaryFunction`\<`F`, `G`\>                                  |
| `op8`           | `UnaryFunction`\<`G`, `H`\>                                  |
| `op9`           | `UnaryFunction`\<`H`, `I`\>                                  |
| ...`operations` | `UnaryFunction`\<`any`, `any`\>[]                            |

##### Returns

`unknown`

##### Inherited from

[`Subject`](Subject.md).[`pipe`](Subject.md#pipe)

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

The first way is creating an object that implements [Observer](../interfaces/Observer.md) interface. It should have methods
defined by that interface, but note that it should be just a regular JavaScript object, which you can create
yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
that your object does not have to implement all methods. If you find yourself creating a method that doesn't
do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
use the [onUnhandledError](../interfaces/GlobalConfig.md#onunhandlederror) configuration option or use a runtime handler (like `window.onerror` or
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

| Parameter         | Type                                                                 | Description                                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `observerOrNext?` | `Partial`\<`Observer`\<`T`\>\> \| (`value`: `T`) => `void` \| `null` | Either an [Observer](../interfaces/Observer.md) with some or all callback methods, or the `next` handler that is called for each value emitted from the subscribed Observable. |

#### Returns

[`Subscription`](Subscription.md)

A subscription reference to the registered handlers.

#### Inherited from

[`Subject`](Subject.md).[`subscribe`](Subject.md#subscribe)

### unsubscribe()

```ts
unsubscribe(): void;
```

Defined in: [rxjs/src/internal/Subject.ts:89](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/Subject.ts#L89)

#### Returns

`void`

#### Inherited from

[`Subject`](Subject.md).[`unsubscribe`](Subject.md#unsubscribe)
