[API](../../index.md) / [webSocket](../index.md) / WebSocketSubject

# Class: WebSocketSubject

Defined in: [internal/observable/dom/WebSocketSubject.ts:157](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/dom/WebSocketSubject.ts#L157)

## Extends

- `AnonymousSubject`\<`T`\>

## Indexable

```ts
[key: string]: any
```

## Constructors

### Constructor

```ts
new WebSocketSubject<>(urlConfigOrSource: 
  | string
  | Observable<T>
| WebSocketSubjectConfig<T>, destination?: Observer<T>): WebSocketSubject<T>;
```

Defined in: [internal/observable/dom/WebSocketSubject.ts:167](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/dom/WebSocketSubject.ts#L167)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `urlConfigOrSource` | \| `string` \| [`Observable`](../../index/classes/Observable.md)\<`T`\> \| [`WebSocketSubjectConfig`](../interfaces/WebSocketSubjectConfig.md)\<`T`\> |
| `destination?` | [`Observer`](../../index/interfaces/Observer.md)\<`T`\> |

#### Returns

`WebSocketSubject`\<`T`\>

#### Overrides

```ts
AnonymousSubject<T>.constructor
```

## Properties

| Property | Type | Default value | Description | Inherited from |
| ------ | ------ | ------ | ------ | ------ |
| <a id="closed"></a> `closed` | `boolean` | `false` | - | `AnonymousSubject.closed` |
| <a id="destination"></a> ~~`destination?`~~ | [`Observer`](../../index/interfaces/Observer.md)\<`T`\> | `undefined` | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | `AnonymousSubject.destination` |
| <a id="haserror"></a> ~~`hasError`~~ | `boolean` | `false` | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | `AnonymousSubject.hasError` |
| <a id="isstopped"></a> ~~`isStopped`~~ | `boolean` | `false` | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | `AnonymousSubject.isStopped` |
| <a id="observers"></a> ~~`observers`~~ | [`Observer`](../../index/interfaces/Observer.md)\<`T`\>[] | `[]` | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | `AnonymousSubject.observers` |
| <a id="operator"></a> ~~`operator`~~ | \| [`Operator`](../../index/interfaces/Operator.md)\<`any`, `T`\> \| `undefined` | `undefined` | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | `AnonymousSubject.operator` |
| <a id="source"></a> ~~`source`~~ | [`Observable`](../../index/classes/Observable.md)\<`any`\> \| `undefined` | `undefined` | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | `AnonymousSubject.source` |
| <a id="thrownerror"></a> ~~`thrownError`~~ | `any` | `null` | **Deprecated** Internal implementation detail, do not use directly. Will be made internal in v8. | `AnonymousSubject.thrownError` |
| <a id="create"></a> ~~`create`~~ | (...`args`: `any`[]) => `any` | `undefined` | Creates a "subject" by basically gluing an observer to an observable. **Deprecated** Recommended you do not use. Will be removed at some point in the future. Plans for replacement still under discussion. | `AnonymousSubject.create` |

## Accessors

### observed

#### Get Signature

```ts
get observed(): boolean;
```

Defined in: [internal/Subject.ts:105](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subject.ts#L105)

##### Returns

`boolean`

#### Inherited from

```ts
AnonymousSubject.observed
```

## Methods

### asObservable()

```ts
asObservable(): Observable<T>;
```

Defined in: [internal/Subject.ts:152](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subject.ts#L152)

Creates a new Observable with this Subject as the source. You can do this
to create custom Observer-side logic of the Subject and conceal it from
code that uses the Observable.

#### Returns

[`Observable`](../../index/classes/Observable.md)\<`T`\>

Observable that this Subject casts to.

#### Inherited from

```ts
AnonymousSubject.asObservable
```

### complete()

```ts
complete(): void;
```

Defined in: [internal/Subject.ts:177](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subject.ts#L177)

#### Returns

`void`

#### Inherited from

```ts
AnonymousSubject.complete
```

### error()

```ts
error(err: any): void;
```

Defined in: [internal/Subject.ts:173](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subject.ts#L173)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `err` | `any` |

#### Returns

`void`

#### Inherited from

```ts
AnonymousSubject.error
```

### forEach()

#### Call Signature

```ts
forEach(next: (value: T) => void): Promise<void>;
```

Defined in: [internal/Observable.ts:288](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L288)

Used as a NON-CANCELLABLE means of subscribing to an observable, for use with
APIs that expect promises, like `async/await`. You cannot unsubscribe from this.

**WARNING**: Only use this with observables you *know* will complete. If the source
observable does not complete, you will end up with a promise that is hung up, and
potentially all of the state of an async function hanging out in memory. To avoid
this situation, look into adding something like timeout, take,
takeWhile, or takeUntil amongst others.

#### Example

```ts
import { interval, take } from 'rxjs';

const source$ = interval(1000).pipe(take(4));

async function getTotal() {
  let total = 0;

  await source$.forEach(value => {
    total += value;
    console.log('observable -> ' + value);
  });

  return total;
}

getTotal().then(
  total => console.log('Total: ' + total)
);

// Expected:
// 'observable -> 0'
// 'observable -> 1'
// 'observable -> 2'
// 'observable -> 3'
// 'Total: 6'
```

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next` | (`value`: `T`) => `void` | A handler for each value emitted by the observable. |

##### Returns

`Promise`\<`void`\>

A promise that either resolves on observable completion or
rejects with the handled error.

##### Inherited from

```ts
AnonymousSubject.forEach
```

#### Call Signature

```ts
forEach(next: (value: T) => void, promiseCtor: PromiseConstructorLike): Promise<void>;
```

Defined in: [internal/Observable.ts:301](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L301)

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `next` | (`value`: `T`) => `void` | a handler for each value emitted by the observable |
| `promiseCtor` | `PromiseConstructorLike` | a constructor function used to instantiate the Promise |

##### Returns

`Promise`\<`void`\>

a promise that either resolves on observable completion or
 rejects with the handled error

##### Deprecated

Passing a Promise constructor will no longer be available
in upcoming versions of RxJS. This is because it adds weight to the library, for very
little benefit. If you need this functionality, it is recommended that you either
polyfill Promise, or you create an adapter to convert the returned native promise
to whatever promise implementation you wanted. Will be removed in v8.

##### Inherited from

```ts
AnonymousSubject.forEach
```

### ~~lift()~~

```ts
lift<>(operator: Operator<T, R>): WebSocketSubject<R>;
```

Defined in: [internal/observable/dom/WebSocketSubject.ts:195](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/dom/WebSocketSubject.ts#L195)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `operator` | [`Operator`](../../index/interfaces/Operator.md)\<`T`, `R`\> |

#### Returns

`WebSocketSubject`\<`R`\>

#### Deprecated

Internal implementation detail, do not use directly. Will be made internal in v8.

#### Overrides

```ts
AnonymousSubject.lift
```

### multiplex()

```ts
multiplex(
   subMsg: () => any, 
   unsubMsg: () => any, 
messageFilter: (value: T) => boolean): Observable<T>;
```

Defined in: [internal/observable/dom/WebSocketSubject.ts:228](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/dom/WebSocketSubject.ts#L228)

Creates an [Observable](../../index/classes/Observable.md), that when subscribed to, sends a message,
defined by the `subMsg` function, to the server over the socket to begin a
subscription to data over that socket. Once data arrives, the
`messageFilter` argument will be used to select the appropriate data for
the resulting Observable. When finalization occurs, either due to
unsubscription, completion, or error, a message defined by the `unsubMsg`
argument will be sent to the server over the WebSocketSubject.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `subMsg` | () => `any` | A function to generate the subscription message to be sent to the server. This will still be processed by the serializer in the WebSocketSubject's config. (Which defaults to JSON serialization) |
| `unsubMsg` | () => `any` | A function to generate the unsubscription message to be sent to the server at finalization. This will still be processed by the serializer in the WebSocketSubject's config. |
| `messageFilter` | (`value`: `T`) => `boolean` | A predicate for selecting the appropriate messages from the server for the output stream. |

#### Returns

[`Observable`](../../index/classes/Observable.md)\<`T`\>

### next()

```ts
next(value: T): void;
```

Defined in: [internal/Subject.ts:169](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Subject.ts#L169)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `value` | `T` |

#### Returns

`void`

#### Inherited from

```ts
AnonymousSubject.next
```

### pipe()

Used to stitch together functional operators into a chain.

## Example

```ts
import { interval, filter, map, scan } from 'rxjs';

interval(1000)
  .pipe(
    filter(x => x % 2 === 0),
    map(x => x + x),
    scan((acc, x) => acc + x)
  )
  .subscribe(x => console.log(x));
```

#### Call Signature

```ts
pipe(): Observable<T>;
```

Defined in: [internal/Observable.ts:337](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L337)

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`T`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(op1: OperatorFunction<T, A>): Observable<A>;
```

Defined in: [internal/Observable.ts:338](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L338)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`A`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
```

Defined in: [internal/Observable.ts:339](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L339)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`B`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(
   op1: OperatorFunction<T, A>, 
   op2: OperatorFunction<A, B>, 
op3: OperatorFunction<B, C>): Observable<C>;
```

Defined in: [internal/Observable.ts:340](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L340)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |
| `op3` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`B`, `C`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`C`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(
   op1: OperatorFunction<T, A>, 
   op2: OperatorFunction<A, B>, 
   op3: OperatorFunction<B, C>, 
op4: OperatorFunction<C, D>): Observable<D>;
```

Defined in: [internal/Observable.ts:341](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L341)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |
| `op3` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`B`, `C`\> |
| `op4` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`C`, `D`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`D`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(
   op1: OperatorFunction<T, A>, 
   op2: OperatorFunction<A, B>, 
   op3: OperatorFunction<B, C>, 
   op4: OperatorFunction<C, D>, 
op5: OperatorFunction<D, E>): Observable<E>;
```

Defined in: [internal/Observable.ts:347](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L347)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |
| `op3` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`B`, `C`\> |
| `op4` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`C`, `D`\> |
| `op5` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`D`, `E`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`E`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(
   op1: OperatorFunction<T, A>, 
   op2: OperatorFunction<A, B>, 
   op3: OperatorFunction<B, C>, 
   op4: OperatorFunction<C, D>, 
   op5: OperatorFunction<D, E>, 
op6: OperatorFunction<E, F>): Observable<F>;
```

Defined in: [internal/Observable.ts:354](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L354)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |
| `op3` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`B`, `C`\> |
| `op4` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`C`, `D`\> |
| `op5` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`D`, `E`\> |
| `op6` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`E`, `F`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`F`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(
   op1: OperatorFunction<T, A>, 
   op2: OperatorFunction<A, B>, 
   op3: OperatorFunction<B, C>, 
   op4: OperatorFunction<C, D>, 
   op5: OperatorFunction<D, E>, 
   op6: OperatorFunction<E, F>, 
op7: OperatorFunction<F, G>): Observable<G>;
```

Defined in: [internal/Observable.ts:362](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L362)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |
| `op3` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`B`, `C`\> |
| `op4` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`C`, `D`\> |
| `op5` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`D`, `E`\> |
| `op6` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`E`, `F`\> |
| `op7` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`F`, `G`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`G`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(
   op1: OperatorFunction<T, A>, 
   op2: OperatorFunction<A, B>, 
   op3: OperatorFunction<B, C>, 
   op4: OperatorFunction<C, D>, 
   op5: OperatorFunction<D, E>, 
   op6: OperatorFunction<E, F>, 
   op7: OperatorFunction<F, G>, 
op8: OperatorFunction<G, H>): Observable<H>;
```

Defined in: [internal/Observable.ts:371](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L371)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |
| `op3` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`B`, `C`\> |
| `op4` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`C`, `D`\> |
| `op5` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`D`, `E`\> |
| `op6` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`E`, `F`\> |
| `op7` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`F`, `G`\> |
| `op8` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`G`, `H`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`H`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(
   op1: OperatorFunction<T, A>, 
   op2: OperatorFunction<A, B>, 
   op3: OperatorFunction<B, C>, 
   op4: OperatorFunction<C, D>, 
   op5: OperatorFunction<D, E>, 
   op6: OperatorFunction<E, F>, 
   op7: OperatorFunction<F, G>, 
   op8: OperatorFunction<G, H>, 
op9: OperatorFunction<H, I>): Observable<I>;
```

Defined in: [internal/Observable.ts:381](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L381)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |
| `op3` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`B`, `C`\> |
| `op4` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`C`, `D`\> |
| `op5` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`D`, `E`\> |
| `op6` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`E`, `F`\> |
| `op7` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`F`, `G`\> |
| `op8` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`G`, `H`\> |
| `op9` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`H`, `I`\> |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`I`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

#### Call Signature

```ts
pipe<>(
   op1: OperatorFunction<T, A>, 
   op2: OperatorFunction<A, B>, 
   op3: OperatorFunction<B, C>, 
   op4: OperatorFunction<C, D>, 
   op5: OperatorFunction<D, E>, 
   op6: OperatorFunction<E, F>, 
   op7: OperatorFunction<F, G>, 
   op8: OperatorFunction<G, H>, 
   op9: OperatorFunction<H, I>, ...
operations: OperatorFunction<any, any>[]): Observable<unknown>;
```

Defined in: [internal/Observable.ts:392](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L392)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `op1` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`T`, `A`\> |
| `op2` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`A`, `B`\> |
| `op3` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`B`, `C`\> |
| `op4` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`C`, `D`\> |
| `op5` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`D`, `E`\> |
| `op6` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`E`, `F`\> |
| `op7` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`F`, `G`\> |
| `op8` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`G`, `H`\> |
| `op9` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`H`, `I`\> |
| ...`operations` | [`OperatorFunction`](../../index/interfaces/OperatorFunction.md)\<`any`, `any`\>[] |

##### Returns

[`Observable`](../../index/classes/Observable.md)\<`unknown`\>

##### Inherited from

```ts
AnonymousSubject.pipe
```

### subscribe()

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

The first way is creating an object that implements [Observer](../../index/interfaces/Observer.md) interface. It should have methods
defined by that interface, but note that it should be just a regular JavaScript object, which you can create
yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
that your object does not have to implement all methods. If you find yourself creating a method that doesn't
do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
use the onUnhandledError configuration option or use a runtime handler (like `window.onerror` or
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
It is an Observable itself that decides when these functions will be called. For example of
by default emits all its values synchronously. Always check documentation for how given Observable
will behave when subscribed and if its default behavior can be modified with a `scheduler`.

#### Examples

Subscribe with an guide/observer Observer

```ts
import { of } from 'rxjs';

const sumObserver = {
  sum: 0,
  next(value) {
    console.log('Adding: ' + value);
    this.sum = this.sum + value;
  },
  error() {
    // We actually could just remove this method,
    // since we do not really care about errors right now.
  },
  complete() {
    console.log('Sum equals: ' + this.sum);
  }
};

of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
  .subscribe(sumObserver);

// Logs:
// 'Adding: 1'
// 'Adding: 2'
// 'Adding: 3'
// 'Sum equals: 6'
```

Subscribe with functions (deprecations/subscribe-arguments deprecated)

```ts
import { of } from 'rxjs'

let sum = 0;

of(1, 2, 3).subscribe(
  value => {
    console.log('Adding: ' + value);
    sum = sum + value;
  },
  undefined,
  () => console.log('Sum equals: ' + sum)
);

// Logs:
// 'Adding: 1'
// 'Adding: 2'
// 'Adding: 3'
// 'Sum equals: 6'
```

Cancel a subscription

```ts
import { interval } from 'rxjs';

const subscription = interval(1000).subscribe({
  next(num) {
    console.log(num)
  },
  complete() {
    // Will not be called, even when cancelling subscription.
    console.log('completed!');
  }
});

setTimeout(() => {
  subscription.unsubscribe();
  console.log('unsubscribed!');
}, 2500);

// Logs:
// 0 after 1s
// 1 after 2s
// 'unsubscribed!' after 2.5s
```

#### Param

Either an [Observer](../../index/interfaces/Observer.md) with some or all callback methods,
or the `next` handler that is called for each value emitted from the subscribed Observable.

#### Param

A handler for a terminal event resulting from an error. If no error handler is provided,
the error will be thrown asynchronously as unhandled.

#### Param

A handler for a terminal event resulting from successful completion.

#### Call Signature

```ts
subscribe(observerOrNext?: 
  | Partial<Observer<T>>
  | (value: T) => void): Subscription;
```

Defined in: [internal/Observable.ts:67](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L67)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `observerOrNext?` | \| `Partial`\<[`Observer`](../../index/interfaces/Observer.md)\<`T`\>\> \| (`value`: `T`) => `void` |

##### Returns

[`Subscription`](../../index/classes/Subscription.md)

##### Inherited from

```ts
AnonymousSubject.subscribe
```

#### Call Signature

```ts
subscribe(
   next?: (value: T) => void | null, 
   error?: (error: any) => void | null, 
   complete?: () => void | null): Subscription;
```

Defined in: [internal/Observable.ts:69](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L69)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `next?` | (`value`: `T`) => `void` \| `null` |
| `error?` | (`error`: `any`) => `void` \| `null` |
| `complete?` | () => `void` \| `null` |

##### Returns

[`Subscription`](../../index/classes/Subscription.md)

##### Deprecated

Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in v8. Details: https://rxjs.dev/deprecations/subscribe-arguments

##### Inherited from

```ts
AnonymousSubject.subscribe
```

### ~~toPromise()~~

Subscribe to this Observable and get a Promise resolving on
`complete` with the last emission (if any).

**WARNING**: Only use this with observables you *know* will complete. If the source
observable does not complete, you will end up with a promise that is hung up, and
potentially all of the state of an async function hanging out in memory. To avoid
this situation, look into adding something like timeout, take,
takeWhile, or takeUntil amongst others.

#### Param

a constructor function used to instantiate
the Promise

#### Deprecated

Replaced with firstValueFrom and lastValueFrom. Will be removed in v8. Details: https://rxjs.dev/deprecations/to-promise

#### Call Signature

```ts
toPromise(): Promise<T | undefined>;
```

Defined in: [internal/Observable.ts:432](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L432)

##### Returns

`Promise`\<`T` \| `undefined`\>

##### Deprecated

Replaced with firstValueFrom and lastValueFrom. Will be removed in v8. Details: https://rxjs.dev/deprecations/to-promise

##### Inherited from

```ts
AnonymousSubject.toPromise
```

#### Call Signature

```ts
toPromise(PromiseCtor: PromiseConstructor): Promise<T | undefined>;
```

Defined in: [internal/Observable.ts:434](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L434)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `PromiseCtor` | `PromiseConstructor` |

##### Returns

`Promise`\<`T` \| `undefined`\>

##### Deprecated

Replaced with firstValueFrom and lastValueFrom. Will be removed in v8. Details: https://rxjs.dev/deprecations/to-promise

##### Inherited from

```ts
AnonymousSubject.toPromise
```

#### Call Signature

```ts
toPromise(PromiseCtor: PromiseConstructorLike): Promise<T | undefined>;
```

Defined in: [internal/Observable.ts:436](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/Observable.ts#L436)

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `PromiseCtor` | `PromiseConstructorLike` |

##### Returns

`Promise`\<`T` \| `undefined`\>

##### Deprecated

Replaced with firstValueFrom and lastValueFrom. Will be removed in v8. Details: https://rxjs.dev/deprecations/to-promise

##### Inherited from

```ts
AnonymousSubject.toPromise
```

### unsubscribe()

```ts
unsubscribe(): void;
```

Defined in: [internal/observable/dom/WebSocketSubject.ts:389](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/observable/dom/WebSocketSubject.ts#L389)

#### Returns

`void`

#### Overrides

```ts
AnonymousSubject.unsubscribe
```
