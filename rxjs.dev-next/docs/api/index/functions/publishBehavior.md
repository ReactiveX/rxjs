[API](../../index.md) / [index](../index.md) / publishBehavior

# ~~Function: publishBehavior()~~

```ts
function publishBehavior<>(initialValue: T): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
```

Defined in: [internal/operators/publishBehavior.ts:20](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/publishBehavior.ts#L20)

Creates a [ConnectableObservable](../classes/ConnectableObservable.md) that utilizes a [BehaviorSubject](../classes/BehaviorSubject.md).

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `initialValue` | `T` | The initial value passed to the [BehaviorSubject](../classes/BehaviorSubject.md). |

## Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`T`\>, [`ConnectableObservable`](../classes/ConnectableObservable.md)\<`T`\>\>

A function that returns a [ConnectableObservable](../classes/ConnectableObservable.md)

## Deprecated

Will be removed in v8. To create a connectable observable that uses a
[BehaviorSubject](../classes/BehaviorSubject.md) under the hood, use [connectable](connectable.md).
`source.pipe(publishBehavior(initValue))` is equivalent to
`connectable(source, { connector: () => new BehaviorSubject(initValue), resetOnDisconnect: false })`.
If you're using [refCount](refCount.md) after `publishBehavior`, use the [share](share.md) operator instead.
`source.pipe(publishBehavior(initValue), refCount())` is equivalent to
`source.pipe(share({ connector: () => new BehaviorSubject(initValue), resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false  }))`.
Details: https://rxjs.dev/deprecations/multicasting
