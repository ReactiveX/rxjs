[API](../../index.md) / [index](../index.md) / publish

# ~~Function: publish()~~

> Returns a ConnectableObservable, which is a variety of Observable that waits until its connect method is called
> before it begins emitting items to those Observers that have subscribed to it.

## Description

<span class="informal">Makes a cold Observable hot</span>

![](publish.png)

## Examples

Make `source$` hot by applying `publish` operator, then merge each inner observable into a single one
and subscribe

```ts
import { zip, interval, of, map, publish, merge, tap } from 'rxjs';

const source$ = zip(interval(2000), of(1, 2, 3, 4, 5, 6, 7, 8, 9))
  .pipe(map(([, number]) => number));

source$
  .pipe(
    publish(multicasted$ =>
      merge(
        multicasted$.pipe(tap(x => console.log('Stream 1:', x))),
        multicasted$.pipe(tap(x => console.log('Stream 2:', x))),
        multicasted$.pipe(tap(x => console.log('Stream 3:', x)))
      )
    )
  )
  .subscribe();

// Results every two seconds
// Stream 1: 1
// Stream 2: 1
// Stream 3: 1
// ...
// Stream 1: 9
// Stream 2: 9
// Stream 3: 9
```

**deprecated**: Will be removed in v8. Use the [connectable](connectable.md) observable, the [connect](connect.md) operator or the
[share](share.md) operator instead. See the overloads below for equivalent replacement examples of this operator's
behaviors.
Details: https://rxjs.dev/deprecations/multicasting

## See

 - [publishLast](publishLast.md)
 - [publishReplay](publishReplay.md)
 - [publishBehavior](publishBehavior.md)


as needed, without causing multiple subscriptions to the source sequence.
Subscribers to the given source will receive all notifications of the source from the time of the subscription on.

## Deprecated

Will be removed in v8. Use the [connectable](connectable.md) observable, the [connect](connect.md) operator or the
[share](share.md) operator instead. See the overloads below for equivalent replacement examples of this operator's
behaviors.
Details: https://rxjs.dev/deprecations/multicasting

## Parameters

### `selector`

Optional selector function which can use the multicasted source sequence as many times


## Returns

`A`

function that returns a ConnectableObservable that upon connection causes the source Observable to emit items to its Observers.


## Call Signature

```ts
function publish<>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
```

Defined in: [internal/operators/publish.ts:20](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/publish.ts#L20)

Returns a connectable observable that, when connected, will multicast
all values through a single underlying [Subject](../classes/Subject.md) instance.

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`T`\>, [`ConnectableObservable`](../classes/ConnectableObservable.md)\<`T`\>\>

### Deprecated

Will be removed in v8. To create a connectable observable, use [connectable](connectable.md).
`source.pipe(publish())` is equivalent to
`connectable(source, { connector: () => new Subject(), resetOnDisconnect: false })`.
If you're using [refCount](refCount.md) after `publish`, use [share](share.md) operator instead.
`source.pipe(publish(), refCount())` is equivalent to
`source.pipe(share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false }))`.
Details: https://rxjs.dev/deprecations/multicasting

## Call Signature

```ts
function publish<>(selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/publish.ts:34](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/publish.ts#L34)

Returns an observable, that when subscribed to, creates an underlying [Subject](../classes/Subject.md),
provides an observable view of it to a `selector` function, takes the observable result of
that selector function and subscribes to it, sending its values to the consumer, _then_ connects
the subject to the original source.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `selector` | (`shared`: [`Observable`](../classes/Observable.md)\<`T`\>) => `O` | A function used to setup multicasting prior to automatic connection. |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

Will be removed in v8. Use the [connect](connect.md) operator instead.
`publish(selector)` is equivalent to `connect(selector)`.
Details: https://rxjs.dev/deprecations/multicasting
