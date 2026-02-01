[API](../../index.md) / [index](../index.md) / publishLast

# ~~Function: publishLast()~~

```ts
function publishLast<>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
```

Defined in: [internal/operators/publishLast.ts:70](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/publishLast.ts#L70)

Returns a connectable observable sequence that shares a single subscription to the
underlying sequence containing only the last notification.

![](publishLast.png)

Similar to [publish](publish.md), but it waits until the source observable completes and stores
the last emitted value.
Similarly to [publishReplay](publishReplay.md) and [publishBehavior](publishBehavior.md), this keeps storing the last
value even if it has no more subscribers. If subsequent subscriptions happen, they will
immediately get that last stored value and complete.

## Example

```ts
import { ConnectableObservable, interval, publishLast, tap, take } from 'rxjs';

const connectable = <ConnectableObservable<number>>interval(1000)
  .pipe(
    tap(x => console.log('side effect', x)),
    take(3),
    publishLast()
  );

connectable.subscribe({
  next: x => console.log('Sub. A', x),
  error: err => console.log('Sub. A Error', err),
  complete: () => console.log('Sub. A Complete')
});

connectable.subscribe({
  next: x => console.log('Sub. B', x),
  error: err => console.log('Sub. B Error', err),
  complete: () => console.log('Sub. B Complete')
});

connectable.connect();

// Results:
// 'side effect 0'   - after one second
// 'side effect 1'   - after two seconds
// 'side effect 2'   - after three seconds
// 'Sub. A 2'        - immediately after 'side effect 2'
// 'Sub. B 2'
// 'Sub. A Complete'
// 'Sub. B Complete'
```

## Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`T`\>, [`ConnectableObservable`](../classes/ConnectableObservable.md)\<`T`\>\>

A function that returns an Observable that emits elements of a
sequence produced by multicasting the source sequence.

## See

 - [ConnectableObservable](../classes/ConnectableObservable.md)
 - [publish](publish.md)
 - [publishReplay](publishReplay.md)
 - [publishBehavior](publishBehavior.md)

## Deprecated

Will be removed in v8. To create a connectable observable with an
[AsyncSubject](../classes/AsyncSubject.md) under the hood, use [connectable](connectable.md).
`source.pipe(publishLast())` is equivalent to
`connectable(source, { connector: () => new AsyncSubject(), resetOnDisconnect: false })`.
If you're using [refCount](refCount.md) after `publishLast`, use the [share](share.md) operator instead.
`source.pipe(publishLast(), refCount())` is equivalent to
`source.pipe(share({ connector: () => new AsyncSubject(), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`.
Details: https://rxjs.dev/deprecations/multicasting
