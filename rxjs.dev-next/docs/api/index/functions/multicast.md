[API](../../index.md) / [index](../index.md) / multicast

# ~~Function: multicast()~~

## Deprecated

Will be removed in v8. Use the [connectable](connectable.md) observable, the [connect](connect.md) operator or the
[share](share.md) operator instead. See the overloads below for equivalent replacement examples of this operator's
behaviors.
Details: https://rxjs.dev/deprecations/multicasting

## Call Signature

```ts
function multicast<>(subject: Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
```

Defined in: [internal/operators/multicast.ts:21](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/multicast.ts#L21)

An operator that creates a [ConnectableObservable](../classes/ConnectableObservable.md), that when connected,
with the `connect` method, will use the provided subject to multicast the values
from the source to all consumers.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `subject` | [`Subject`](../classes/Subject.md)\<`T`\> | The subject to multicast through. |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`T`\>, [`ConnectableObservable`](../classes/ConnectableObservable.md)\<`T`\>\>

A function that returns a [ConnectableObservable](../classes/ConnectableObservable.md)

### Deprecated

Will be removed in v8. To create a connectable observable, use [connectable](connectable.md).
If you're using [refCount](refCount.md) after `multicast`, use the [share](share.md) operator instead.
`multicast(subject), refCount()` is equivalent to
`share({ connector: () => subject, resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })`.
Details: https://rxjs.dev/deprecations/multicasting

## Call Signature

```ts
function multicast<>(subject: Subject<T>, selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/multicast.ts:36](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/multicast.ts#L36)

Because this is deprecated in favor of the [connect](connect.md) operator, and was otherwise poorly documented,
rather than duplicate the effort of documenting the same behavior, please see documentation for the
[connect](connect.md) operator.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `subject` | [`Subject`](../classes/Subject.md)\<`T`\> | The subject used to multicast. |
| `selector` | (`shared`: [`Observable`](../classes/Observable.md)\<`T`\>) => `O` | A setup function to setup the multicast |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an observable that mirrors the observable returned by the selector.

### Deprecated

Will be removed in v8. Use the [connect](connect.md) operator instead.
`multicast(subject, selector)` is equivalent to
`connect(selector, { connector: () => subject })`.
Details: https://rxjs.dev/deprecations/multicasting

## Call Signature

```ts
function multicast<>(subjectFactory: () => Subject<T>): UnaryFunction<Observable<T>, ConnectableObservable<T>>;
```

Defined in: [internal/operators/multicast.ts:56](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/multicast.ts#L56)

An operator that creates a [ConnectableObservable](../classes/ConnectableObservable.md), that when connected,
with the `connect` method, will use the provided subject to multicast the values
from the source to all consumers.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `subjectFactory` | () => [`Subject`](../classes/Subject.md)\<`T`\> | A factory that will be called to create the subject. Passing a function here will cause the underlying subject to be "reset" on error, completion, or refCounted unsubscription of the source. |

### Returns

[`UnaryFunction`](../interfaces/UnaryFunction.md)\<[`Observable`](../classes/Observable.md)\<`T`\>, [`ConnectableObservable`](../classes/ConnectableObservable.md)\<`T`\>\>

A function that returns a [ConnectableObservable](../classes/ConnectableObservable.md)

### Deprecated

Will be removed in v8. To create a connectable observable, use [connectable](connectable.md).
If you're using [refCount](refCount.md) after `multicast`, use the [share](share.md) operator instead.
`multicast(() => new BehaviorSubject('test')), refCount()` is equivalent to
`share({ connector: () => new BehaviorSubject('test') })`.
Details: https://rxjs.dev/deprecations/multicasting

## Call Signature

```ts
function multicast<>(subjectFactory: () => Subject<T>, selector: (shared: Observable<T>) => O): OperatorFunction<T, ObservedValueOf<O>>;
```

Defined in: [internal/operators/multicast.ts:71](https://github.com/JessicaSachs/rxjs/blob/master/src/internal/operators/multicast.ts#L71)

Because this is deprecated in favor of the [connect](connect.md) operator, and was otherwise poorly documented,
rather than duplicate the effort of documenting the same behavior, please see documentation for the
[connect](connect.md) operator.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `subjectFactory` | () => [`Subject`](../classes/Subject.md)\<`T`\> | A factory that creates the subject used to multicast. |
| `selector` | (`shared`: [`Observable`](../classes/Observable.md)\<`T`\>) => `O` | A function to setup the multicast and select the output. |

### Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an observable that mirrors the observable returned by the selector.

### Deprecated

Will be removed in v8. Use the [connect](connect.md) operator instead.
`multicast(subjectFactory, selector)` is equivalent to
`connect(selector, { connector: subjectFactory })`.
Details: https://rxjs.dev/deprecations/multicasting
