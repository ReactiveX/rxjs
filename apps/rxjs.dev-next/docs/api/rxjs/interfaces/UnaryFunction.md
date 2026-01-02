[API](../../index.md) / [rxjs](../index.md) / UnaryFunction

# Interface: UnaryFunction()

> A function type interface that describes a function that accepts one parameter `T`
> and returns another parameter `R`.

## Description

Usually used to describe [OperatorFunction](OperatorFunction.md) - it always takes a single
parameter (the source Observable) and returns another Observable.

Defined in: [rxjs/src/internal/types.ts:25](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L25)

A function type interface that describes a function that accepts one parameter `T`
and returns another parameter `R`.

Usually used to describe [OperatorFunction](OperatorFunction.md) - it always takes a single
parameter (the source Observable) and returns another Observable.

## Extended by

- [`OperatorFunction`](OperatorFunction.md)

```ts
UnaryFunction(source: T): R;
```

Defined in: [rxjs/src/internal/types.ts:26](https://github.com/ReactiveX/rxjs/blob/master/packages/rxjs/src/internal/types.ts#L26)

A function type interface that describes a function that accepts one parameter `T`
and returns another parameter `R`.

Usually used to describe [OperatorFunction](OperatorFunction.md) - it always takes a single
parameter (the source Observable) and returns another Observable.

## Parameters

| Parameter | Type |
| --------- | ---- |
| `source`  | `T`  |

## Returns

`R`
