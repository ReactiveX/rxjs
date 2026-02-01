[API](../../index.md) / [index](../index.md) / publishReplay

# ~~Function: publishReplay()~~

## Deprecated

Will be removed in v8. Use the [connectable](connectable.md) observable, the [connect](connect.md) operator or the
[share](share.md) operator instead. See the overloads below for equivalent replacement examples of this operator's
behaviors.
Details: https://rxjs.dev/deprecations/multicasting

## Call Signature

```ts
function publishReplay<>(
   bufferSize?: number, 
   windowTime?: number, 
timestampProvider?: TimestampProvider): MonoTypeOperatorFunction<T>;
```

Defined in: [internal/operators/publishReplay.ts:23](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/publishReplay.ts#L23)

Creates a [ConnectableObservable](../classes/ConnectableObservable.md) that uses a [ReplaySubject](../classes/ReplaySubject.md)
internally.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bufferSize?` | `number` | The buffer size for the underlying [ReplaySubject](../classes/ReplaySubject.md). |
| `windowTime?` | `number` | The window time for the underlying [ReplaySubject](../classes/ReplaySubject.md). |
| `timestampProvider?` | [`TimestampProvider`](../interfaces/TimestampProvider.md) | The timestamp provider for the underlying [ReplaySubject](../classes/ReplaySubject.md). |

### Returns

[`MonoTypeOperatorFunction`](../interfaces/MonoTypeOperatorFunction.md)\<`T`\>

### Deprecated

Will be removed in v8. To create a connectable observable that uses a
[ReplaySubject](../classes/ReplaySubject.md) under the hood, use [connectable](connectable.md).
`source.pipe(publishReplay(size, time, scheduler))` is equivalent to
`connectable(source, { connector: () => new ReplaySubject(size, time, scheduler), resetOnDisconnect: false })`.
If you're using [refCount](refCount.md) after `publishReplay`, use the [share](share.md) operator instead.
`publishReplay(size, time, scheduler), refCount()` is equivalent to
`share({ connector: () => new ReplaySubject(size, time, scheduler), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })`.
Details: https://rxjs.dev/deprecations/multicasting

## Call Signature

```ts
function publishReplay<>(
   bufferSize: number | undefined, 
   windowTime: number | undefined, 
   selector: (shared: Observable<T>) => O, 
timestampProvider?: TimestampProvider): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/publishReplay.ts:46](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/publishReplay.ts#L46)

Creates an observable, that when subscribed to, will create a [ReplaySubject](../classes/ReplaySubject.md),
and pass an observable from it (using [asObservable](api/index/class/Subject#asobservable)) to
the `selector` function, which then returns an observable that is subscribed to before
"connecting" the source to the internal `ReplaySubject`.

Since this is deprecated, for additional details see the documentation for [connect](connect.md).

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bufferSize` | `number` \| `undefined` | The buffer size for the underlying [ReplaySubject](../classes/ReplaySubject.md). |
| `windowTime` | `number` \| `undefined` | The window time for the underlying [ReplaySubject](../classes/ReplaySubject.md). |
| `selector` | (`shared`: [`Observable`](../classes/Observable.md)\<`T`\>) => `O` | A function used to setup the multicast. |
| `timestampProvider?` | [`TimestampProvider`](../interfaces/TimestampProvider.md) | The timestamp provider for the underlying [ReplaySubject](../classes/ReplaySubject.md). |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

Will be removed in v8. Use the [connect](connect.md) operator instead.
`source.pipe(publishReplay(size, window, selector, scheduler))` is equivalent to
`source.pipe(connect(selector, { connector: () => new ReplaySubject(size, window, scheduler) }))`.
Details: https://rxjs.dev/deprecations/multicasting

## Call Signature

```ts
function publishReplay<>(
   bufferSize: number | undefined, 
   windowTime: number | undefined, 
   selector: undefined, 
timestampProvider: TimestampProvider): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/publishReplay.ts:70](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/publishReplay.ts#L70)

Creates a [ConnectableObservable](../classes/ConnectableObservable.md) that uses a [ReplaySubject](../classes/ReplaySubject.md)
internally.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bufferSize` | `number` \| `undefined` | The buffer size for the underlying [ReplaySubject](../classes/ReplaySubject.md). |
| `windowTime` | `number` \| `undefined` | The window time for the underlying [ReplaySubject](../classes/ReplaySubject.md). |
| `selector` | `undefined` | Passing `undefined` here determines that this operator will return a [ConnectableObservable](../classes/ConnectableObservable.md). |
| `timestampProvider` | [`TimestampProvider`](../interfaces/TimestampProvider.md) | The timestamp provider for the underlying [ReplaySubject](../classes/ReplaySubject.md). |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

### Deprecated

Will be removed in v8. To create a connectable observable that uses a
[ReplaySubject](../classes/ReplaySubject.md) under the hood, use [connectable](connectable.md).
`source.pipe(publishReplay(size, time, scheduler))` is equivalent to
`connectable(source, { connector: () => new ReplaySubject(size, time, scheduler), resetOnDisconnect: false })`.
If you're using [refCount](refCount.md) after `publishReplay`, use the [share](share.md) operator instead.
`publishReplay(size, time, scheduler), refCount()` is equivalent to
`share({ connector: () => new ReplaySubject(size, time, scheduler), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })`.
Details: https://rxjs.dev/deprecations/multicasting
