[API](../../index.md) / [index](../index.md) / refCount

# ~~Function: refCount()~~

```ts
function refCount<>(): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/refCount.ts:65](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/refCount.ts#L65)

Make a [ConnectableObservable](../classes/ConnectableObservable.md) behave like a ordinary observable and automates the way
you can connect to it.

Internally it counts the subscriptions to the observable and subscribes (only once) to the source if
the number of subscriptions is larger than 0. If the number of subscriptions is smaller than 1, it
unsubscribes from the source. This way you can make sure that everything before the *published*
refCount has only a single subscription independently of the number of subscribers to the target
observable.

Note that using the [share](share.md) operator is exactly the same as using the `multicast(() => new Subject())` operator
(making the observable hot) and the *refCount* operator in a sequence.

![](refCount.png)

## Example

In the following example there are two intervals turned into connectable observables
by using the *publish* operator. The first one uses the *refCount* operator, the
second one does not use it. You will notice that a connectable observable does nothing
until you call its connect function.

```ts
import { interval, tap, publish, refCount } from 'rxjs';

// Turn the interval observable into a ConnectableObservable (hot)
const refCountInterval = interval(400).pipe(
  tap(num => console.log(`refCount ${ num }`)),
  publish(),
  refCount()
);

const publishedInterval = interval(400).pipe(
  tap(num => console.log(`publish ${ num }`)),
  publish()
);

refCountInterval.subscribe();
refCountInterval.subscribe();
// 'refCount 0' -----> 'refCount 1' -----> etc
// All subscriptions will receive the same value and the tap (and
// every other operator) before the `publish` operator will be executed
// only once per event independently of the number of subscriptions.

publishedInterval.subscribe();
// Nothing happens until you call .connect() on the observable.
```

## Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

A function that returns an Observable that automates the connection
to ConnectableObservable.

## See

 - [ConnectableObservable](../classes/ConnectableObservable.md)
 - [share](share.md)
 - [publish](publish.md)

## Deprecated

Replaced with the [share](share.md) operator. How `share` is used
will depend on the connectable observable you created just prior to the
`refCount` operator.
Details: https://rxjs.dev/deprecations/multicasting
