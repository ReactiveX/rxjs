[API](../../index.md) / [rxjs](../index.md) / catchError

# Function: catchError()

> Catches errors on the observable to be handled by returning a new observable or throwing an error.

## Description

<span class="informal">
It only listens to the error channel and ignores notifications.
Handles errors from the source observable, and maps them to a new observable.
The error may also be rethrown, or a new error can be thrown to emit an error from the result.
</span>

![](/images/marble-diagrams/catch.png)

This operator handles errors, but forwards along all other events to the resulting observable.
If the source observable terminates with an error, it will map that error to a new observable,
subscribe to it, and forward all of its events to the resulting observable.

```ts
function catchError<>(selector: (err: any, caught: Observable<T>) => O): OperatorFunction<T, T | ObservedValueOf<O>>;
```

Defined in: [rxjs/src/internal/operators/catchError.ts:5](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/operators/catchError.ts#L5)

## Parameters

| Parameter  | Type                                                                             | Description                                                                                                                                                                                                                                                                       |
| ---------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector` | (`err`: `any`, `caught`: [`Observable`](../classes/Observable.md)\<`T`\>) => `O` | A function that takes as arguments `err`, which is the error, and `caught`, which is the source observable, in case you'd like to "retry" that observable by returning it again. Whatever observable is returned by the `selector` will be used to continue the observable chain. |

## Returns

[`OperatorFunction`](../interfaces/OperatorFunction.md)\<`T`, `T` \| [`ObservedValueOf`](../type-aliases/ObservedValueOf.md)\<`O`\>\>

A function that returns an Observable that originates from either
the source or the Observable returned by the `selector` function.
